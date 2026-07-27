/**
 * Acharya Nimisha Bhardwaj - Application UI Controller & PyHora Integration
 */

document.addEventListener('DOMContentLoaded', () => {
  let currentChartData = null;

  // Initialize UI components
  initCityAutocomplete();
  initRashiWheel();
  initDailyHoroscope();
  initTabSwitchers();
  initChartTypeButtons();
  initFormListeners();
  initBookingModal();

  // Initial Calculation on Load (New Delhi, India: 28.6139, 77.2090, UTC+5.5)
  runCalculations('1995-08-25', '10:30', 28.6139, 77.2090, 5.5);
});

/**
 * City Search & Place of Birth Autocomplete Dropdown
 * Supports any city or village worldwide (e.g. Janakpur Nepal, Pokhara, Jaipur, London)
 */
function initCityAutocomplete() {
  setupAutocomplete('pobInput', 'pobDropdown', 'pobLat', 'pobLon', 'pobTz', 'latLonBadge');
  setupAutocomplete('intakePobInput', 'intakePobDropdown', 'intakeLat', 'intakeLon', 'intakeTz', 'intakeLatLonBadge');
}

function setupAutocomplete(inputId, dropdownId, latId, lonId, tzId, badgeId) {
  const input = document.getElementById(inputId);
  const dropdown = document.getElementById(dropdownId);
  const latInput = document.getElementById(latId);
  const lonInput = document.getElementById(lonId);
  const tzInput = document.getElementById(tzId);
  const badge = document.getElementById(badgeId);

  if (!input || !dropdown) return;

  let debounceTimer;

  input.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    const val = e.target.value.trim();
    if (val.length < 2) {
      dropdown.classList.add('hidden');
      return;
    }

    debounceTimer = setTimeout(async () => {
      let matches = [];
      try {
        const res = await fetch(`/api/search-city?q=${encodeURIComponent(val)}`);
        if (res.ok) {
          matches = await res.json();
        } else {
          matches = searchCities(val);
        }
      } catch (err) {
        matches = searchCities(val);
      }

      // If local search returns few results, query free client-side OpenStreetMap Nominatim API
      if (!matches || matches.length < 3) {
        try {
          const apiRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&addressdetails=1&limit=6`);
          if (apiRes.ok) {
            const apiData = await apiRes.json();
            const onlineMatches = apiData.map(item => {
              const addr = item.address || {};
              const city = addr.city || addr.town || addr.village || addr.county || item.display_name.split(',')[0];
              const country = addr.country || '';
              const state = addr.state || '';
              const lon = parseFloat(item.lon);
              const approxTz = Math.round((lon / 15) * 2) / 2;

              return {
                city: city,
                state: state,
                country: country,
                display_name: item.display_name,
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon),
                tz: (country === 'India') ? 5.5 : approxTz
              };
            });

            const existing = new Set(matches.map(m => (m.city || '').toLowerCase()));
            onlineMatches.forEach(om => {
              if (om.city && !existing.has(om.city.toLowerCase())) {
                matches.push(om);
              }
            });
          }
        } catch (e) {
          // Keep local matches on error
        }
      }

      if (!matches || matches.length === 0) {
        dropdown.classList.add('hidden');
        return;
      }

      dropdown.innerHTML = matches.map(c => {
        const dispName = c.display_name || `${c.city}, ${c.state ? c.state + ', ' : ''}${c.country}`;
        const cityName = c.city || c.name || dispName.split(',')[0];
        const lat = parseFloat(c.lat).toFixed(4);
        const lon = parseFloat(c.lon).toFixed(4);
        const tz = c.tz;

        return `
          <div class="pob-item" data-city="${cityName}" data-display="${dispName}" data-lat="${c.lat}" data-lon="${c.lon}" data-tz="${tz}">
            <div>
              <span class="city-title">${cityName}</span>
              <small style="display:block; color:var(--text-muted); font-size:0.75rem; max-width:280px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${dispName}</small>
            </div>
            <div class="city-coords">${lat}° N, ${lon}° E<br><strong style="color:var(--primary-pink-dark);">UTC ${tz >= 0 ? '+' + tz : tz}</strong></div>
          </div>
        `;
      }).join('');

      dropdown.classList.remove('hidden');

      dropdown.querySelectorAll('.pob-item').forEach(item => {
        item.addEventListener('click', () => {
          const display = item.getAttribute('data-display');
          const lat = parseFloat(item.getAttribute('data-lat'));
          const lon = parseFloat(item.getAttribute('data-lon'));
          const tz = parseFloat(item.getAttribute('data-tz'));

          input.value = display;
          latInput.value = lat;
          lonInput.value = lon;
          tzInput.value = tz;

          if (badge) {
            badge.innerHTML = `<i class="fa-solid fa-compass"></i> Lat: ${lat.toFixed(4)}°, Lon: ${lon.toFixed(4)}° (UTC ${tz >= 0 ? '+' + tz : tz})`;
          }

          dropdown.classList.add('hidden');
        });
      });
    }, 250);
  });

  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
  });
}

/**
 * Execute PyHora Calculations (Backend API call with client fallback)
 */
async function runCalculations(dob, tob, lat, lon, tz) {
  const ayanamsha = document.getElementById('ayanamshaSelect').value || 'lahiri';
  const chartType = document.getElementById('chartTypeSelect').value || 'D1';

  try {
    const res = await fetch('/api/calculate-kundli', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dob, tob, lat, lon, tz, ayanamsha })
    });

    if (res.ok) {
      currentChartData = await res.json();
    } else {
      throw new Error('API fallback');
    }
  } catch (err) {
    currentChartData = PyHoraEngine.calculatePlanets(dob, tob, 'Place', ayanamsha);
  }

  // Render All Astrological Components
  renderNorthChart(chartType);
  renderPlanetsTable(currentChartData.planets);
  renderVimshottariDasha(currentChartData);
  renderYoginiDasha(currentChartData);
  renderAshtakvarga(currentChartData);
  renderGochar(currentChartData);
}

/**
 * Quick Chart Switch Buttons (D1, D9, D10, D7)
 */
function initChartTypeButtons() {
  const btns = document.querySelectorAll('.btn-chart-select');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cType = btn.getAttribute('data-chart');
      document.getElementById('chartTypeSelect').value = cType;
      renderNorthChart(cType);
    });
  });
}

/**
 * Render North Indian Diamond Chart SVG
 */
function renderNorthChart(chartType) {
  if (!currentChartData) return;
  const container = document.getElementById('northChartContainer');
  const title = document.getElementById('activeChartTitle');
  
  title.innerText = `${chartType} Chart (North Indian Diamond Style)`;
  container.innerHTML = PyHoraEngine.renderNorthIndianDiamondSVG(currentChartData, chartType);

  // Insights Banner (D10 / D7)
  const careerCard = document.getElementById('d10CareerInsights');
  if (careerCard) {
    if (chartType === 'D10') {
      const d10Analysis = PyHoraEngine.getD10Analysis(currentChartData);
      careerCard.innerHTML = `
        <div class="glass-card mt-3" style="padding:16px; border-left:4px solid var(--vedic-gold); text-align:left;">
          <h4 style="color:var(--cosmic-blue); font-size:1rem; margin-bottom:6px;"><i class="fa-solid fa-briefcase" style="color:var(--vedic-gold);"></i> D10 Dashamsha Career Analysis</h4>
          <p style="font-size:0.85rem; color:var(--text-dark); margin:0;">
            <strong>D10 Ascendant (Lagna):</strong> ${d10Analysis.d10LagnaName}<br>
            <strong>10th House (Executive Power & Career Peak):</strong> ${d10Analysis.h10RashiName} (Lord: <strong>${d10Analysis.h10Lord}</strong>)<br>
            <strong>Planets in 10th House:</strong> ${d10Analysis.h10Planets}
          </p>
        </div>
      `;
      careerCard.classList.remove('hidden');
    } else if (chartType === 'D7') {
      const d7Analysis = PyHoraEngine.getD7Analysis(currentChartData);
      careerCard.innerHTML = `
        <div class="glass-card mt-3" style="padding:16px; border-left:4px solid var(--primary-pink-dark); text-align:left;">
          <h4 style="color:var(--cosmic-blue); font-size:1rem; margin-bottom:6px;"><i class="fa-solid fa-baby-carriage" style="color:var(--primary-pink-dark);"></i> D7 Saptamsha Progeny Analysis</h4>
          <p style="font-size:0.85rem; color:var(--text-dark); margin:0;">
            <strong>D7 Ascendant (Lagna):</strong> ${d7Analysis.d7LagnaName}<br>
            <strong>5th House (Children & Progeny):</strong> ${d7Analysis.h5RashiName} (Lord: <strong>${d7Analysis.h5Lord}</strong>)<br>
            <strong>Planets in 5th House:</strong> ${d7Analysis.h5Planets}
          </p>
        </div>
      `;
      careerCard.classList.remove('hidden');
    } else {
      careerCard.classList.add('hidden');
    }
  }
}

/**
 * Render Planetary Positions Table
 */
function renderPlanetsTable(planets) {
  const tbody = document.querySelector('#planetPositionsTable tbody');
  if (!tbody) return;

  tbody.innerHTML = planets.map(p => `
    <tr>
      <td><strong>${p.name}</strong></td>
      <td>${p.signSymbol} ${p.signName}</td>
      <td>${p.degInSign}°</td>
      <td>${p.nakshatraName}</td>
      <td>${p.pada}</td>
      <td><span class="badge-${p.status.toLowerCase()}">${p.status}</span></td>
    </tr>
  `).join('');
}

/**
 * Render Vimshottari Mahadasha & Antardasha Accordion Tree
 */
function renderVimshottariDasha(chartData) {
  const dashaData = PyHoraEngine.calculateVimshottari(chartData);
  const container = document.getElementById('vimshottariList');
  if (!container) return;

  let html = `
    <div class="mb-4 text-muted" style="background:#fff; padding:14px 20px; border-radius:12px; border:1px solid var(--card-border);">
      <i class="fa-solid fa-moon" style="color:var(--primary-pink-dark);"></i> <strong>Moon Nakshatra:</strong> ${dashaData.moonNakshatra} &nbsp;|&nbsp; 
      <strong>Starting Lord at Birth:</strong> ${dashaData.startingLord} (${dashaData.remainingAtBirthYrs || dashaData.remainingAtBirth} yrs balance)
    </div>
  `;

  html += dashaData.mahadashas.map((m, mIdx) => {
    const isCurrentMda = m.isCurrent;
    const adList = m.antardashas || [];

    return `
      <div class="dasha-accordion-item ${isCurrentMda ? 'current-mda-card' : ''}" style="margin-bottom:12px; border-radius:12px; border:1px solid var(--card-border); background:#fff; overflow:hidden;">
        <div class="dasha-accordion-header" style="padding:16px 20px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; background:${isCurrentMda ? 'var(--primary-pink-light)' : '#fff'};" onclick="toggleDashaAccordion(${mIdx})">
          <div style="display:flex; align-items:center; gap:12px;">
            <i class="fa-solid ${isCurrentMda ? 'fa-star' : 'fa-circle-dot'}" style="color:${isCurrentMda ? 'var(--vedic-gold)' : 'var(--cosmic-blue)'}"></i>
            <div>
              <strong style="font-size:1.05rem; color:var(--cosmic-blue);">${m.lord} Mahadasha</strong>
              ${isCurrentMda ? ' <span class="badge-active" style="background:var(--cosmic-blue); color:var(--vedic-gold); font-size:0.75rem; padding:2px 8px; border-radius:12px; margin-left:6px;"><i class="fa-solid fa-bolt"></i> Active Mahadasha</span>' : ''}
              <div style="font-size:0.8rem; color:var(--text-muted);">${m.startDate} — ${m.endDate} (${m.durationYrs} Years)</div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:10px;">
            <small style="color:var(--primary-pink-dark); font-weight:600;">9 Antardashas</small>
            <i class="fa-solid fa-chevron-down accordion-icon" id="dashaIcon${mIdx}" style="transition:transform 0.3s ease; ${isCurrentMda ? 'transform:rotate(180deg);' : ''}"></i>
          </div>
        </div>

        <div class="dasha-accordion-body ${isCurrentMda ? '' : 'hidden'}" id="dashaBody${mIdx}" style="padding:0 20px 16px; border-top:1px solid var(--bg-cream-alt);">
          <div style="font-size:0.82rem; font-weight:700; color:var(--cosmic-blue); margin:12px 0 8px; text-transform:uppercase; letter-spacing:0.5px;">
            Antardasha (Bhukti) Cycles inside ${m.lord} Mahadasha:
          </div>
          <div class="table-responsive">
            <table class="astro-table" style="font-size:0.85rem;">
              <thead>
                <tr>
                  <th>Antardasha Lord</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${adList.map(ad => `
                  <tr style="${ad.isCurrent ? 'background:rgba(212, 175, 55, 0.18); font-weight:700;' : ''}">
                    <td><i class="fa-solid fa-circle" style="font-size:0.5rem; color:var(--primary-pink-dark); margin-right:6px;"></i> ${m.lord} — ${ad.lord}</td>
                    <td>${ad.startDate}</td>
                    <td>${ad.endDate}</td>
                    <td>${ad.durationYrs} Yrs</td>
                    <td>
                      ${ad.isCurrent ? '<span style="background:var(--vedic-gold); color:#111E38; font-size:0.75rem; padding:2px 8px; border-radius:10px; font-weight:800;"><i class="fa-solid fa-star"></i> Active Antardasha</span>' : '<span style="color:var(--text-muted); font-size:0.78rem;">Completed / Future</span>'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
}

window.toggleDashaAccordion = function(idx) {
  const body = document.getElementById(`dashaBody${idx}`);
  const icon = document.getElementById(`dashaIcon${idx}`);
  if (body) {
    body.classList.toggle('hidden');
    if (icon) {
      icon.style.transform = body.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
    }
  }
};

/**
 * Render Yogini Dasha Timeline Grid
 */
function renderYoginiDasha(chartData) {
  const yoginiData = PyHoraEngine.calculateYogini(chartData);
  const container = document.getElementById('yoginiGrid');
  if (!container) return;

  const yList = yoginiData.yoginiList || yoginiData;

  container.innerHTML = `
    <div class="mb-3 text-muted" style="grid-column: 1 / -1; background:#fff; padding:12px 18px; border-radius:10px; border:1px solid var(--card-border);">
      <i class="fa-solid fa-om" style="color:var(--primary-pink-dark);"></i> <strong>Parashari Yogini Rule:</strong> (Nakshatra #${yoginiData.nakshatraNumber || '9'} + 3) mod 8 &nbsp;|&nbsp; 
      <strong>Starting Yogini:</strong> ${yoginiData.startingYogini || 'Bhramari'} (${yoginiData.remainingAtBirthYrs || '1.10'} yrs balance at birth)
    </div>
  ` + yList.map(y => `
    <div class="yogini-card ${y.isCurrent ? 'active-yogini' : ''}" style="${y.isCurrent ? 'border-left: 5px solid var(--vedic-gold); background: var(--primary-pink-light); transform: scale(1.02);' : ''}">
      <h4 style="color:var(--cosmic-blue);">${y.name} (${y.lord})</h4>
      <p style="margin:4px 0; font-size:0.88rem;">Duration: <strong>${y.durationYrs || y.years} Years</strong></p>
      <small style="color:var(--text-muted);">${y.startDate || y.startYear} — ${y.endDate || y.endYear}</small>
      ${y.isCurrent ? '<div class="mt-2"><span class="badge-active" style="background:var(--cosmic-blue); color:var(--vedic-gold); font-size:0.75rem; padding:3px 10px; border-radius:12px;"><i class="fa-solid fa-star"></i> Active Yogini</span></div>' : ''}
    </div>
  `).join('');
}

/**
 * Render Parashari Ashtakvarga SVG Bar Graph & BAV + SAV Matrix Table
 */
function renderAshtakvarga(chartData) {
  const ashtakvargaData = PyHoraEngine.calculateAshtakvarga(chartData);
  const container = document.getElementById('savGraph');
  const tableContainer = document.getElementById('ashtakvargaTable');
  if (!container) return;

  const savList = ashtakvargaData.sav || [];
  const bavData = ashtakvargaData.bav || {};
  const totalPoints = ashtakvargaData.totalPoints || 337;

  let svgGraph = `
    <svg viewBox="0 0 540 210" style="width:100%; max-height:220px; background:#FCFAFA; border:1px solid var(--card-border); border-radius:12px; padding:12px;">
      <line x1="30" y1="30" x2="520" y2="30" stroke="#E2E8F0" stroke-width="1" stroke-dasharray="2 2"/>
      <line x1="30" y1="80" x2="520" y2="80" stroke="#E2E8F0" stroke-width="1" stroke-dasharray="2 2"/>
      <line x1="30" y1="130" x2="520" y2="130" stroke="#E2E8F0" stroke-width="1" stroke-dasharray="2 2"/>

      <line x1="30" y1="72" x2="520" y2="72" stroke="#C0392B" stroke-width="1.8" stroke-dasharray="4 3"/>
      <text x="515" y="66" font-size="9" font-weight="700" fill="#C0392B" text-anchor="end">28 Avg Benchmark</text>
  `;

  savList.forEach((pt, idx) => {
    const x = 38 + idx * 39;
    const barHeight = pt.points * 3.5;
    const y = 170 - barHeight;

    let fill = '#111E38';
    if (pt.points >= 32) fill = '#D4AF37';
    else if (pt.points >= 28) fill = '#C9728B';

    svgGraph += `
      <g cursor="pointer">
        <rect x="${x}" y="${y}" width="26" height="${barHeight}" fill="${fill}" rx="5">
          <title>House ${pt.house} (${pt.rashiName}): ${pt.points} Bindus (${pt.status})</title>
        </rect>
        <text x="${x + 13}" y="${y - 6}" font-size="10" font-weight="800" fill="${fill}" text-anchor="middle">${pt.points}</text>
        <text x="${x + 13}" y="186" font-size="10" font-weight="700" fill="#5A6275" text-anchor="middle">H${pt.house}</text>
        ${pt.points >= 32 ? `<text x="${x + 13}" y="${y - 17}" font-size="10" text-anchor="middle">⭐</text>` : ''}
      </g>
    `;
  });

  svgGraph += `</svg>`;
  container.innerHTML = svgGraph;

  const planetsOrder = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
  
  let tableHtml = `
    <div style="margin-bottom:10px; font-weight:700; color:var(--cosmic-blue); font-size:0.9rem;">
      <i class="fa-solid fa-table-cells" style="color:var(--vedic-gold);"></i> Full Bhinna (BAV) & Sarvashtakvarga (SAV) Point Matrix (Total Points: ${totalPoints})
    </div>
    <div class="table-responsive">
      <table class="astro-table" style="font-size:0.83rem;">
        <thead>
          <tr>
            <th>Planet / House</th>
            ${savList.map(s => `<th>H${s.house}<br><small style="font-size:0.68rem; font-weight:400; opacity:0.8;">${s.rashiName.split(' ')[0]}</small></th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${planetsOrder.map(p => {
            const rowBav = bavData[p] || Array(12).fill(0);
            return `
              <tr>
                <td><strong>${p}</strong></td>
                ${rowBav.map(pts => `<td>${pts}</td>`).join('')}
              </tr>
            `;
          }).join('')}
          <tr style="background:rgba(212, 175, 55, 0.18); font-weight:800; border-top:2px solid var(--vedic-gold);">
            <td><strong style="color:var(--cosmic-blue);">SAV Total</strong></td>
            ${savList.map(s => `
              <td style="color:${s.points >= 32 ? 'var(--vedic-gold)' : (s.points >= 28 ? 'var(--primary-pink-dark)' : 'var(--cosmic-blue)')};">
                ${s.points} ${s.points >= 32 ? '⭐' : ''}
              </td>
            `).join('')}
          </tr>
        </tbody>
      </table>
    </div>
  `;

  tableContainer.innerHTML = tableHtml;
}

/**
 * Render Live Planetary Transits (Gochar)
 */
function renderGochar(chartData) {
  const transits = PyHoraEngine.calculateGochar(chartData);
  const container = document.getElementById('gocharGrid');
  if (!container) return;

  const moonObj = chartData.planets.find(p => p.name.includes("Moon"));
  const natalMoonName = moonObj ? `${moonObj.signSymbol} ${moonObj.signName}` : "Natal Moon";

  let html = `
    <div class="mb-4 text-muted" style="grid-column: 1 / -1; background:#fff; padding:14px 20px; border-radius:12px; border:1px solid var(--card-border);">
      <i class="fa-solid fa-satellite" style="color:var(--primary-pink-dark);"></i> <strong>Live Real-Time Transits Today:</strong> Calculated relative to <strong>${natalMoonName}</strong> & Natal Lagna
    </div>
  `;

  html += transits.map(t => {
    let badgeStyle = "background:var(--cosmic-blue); color:#fff;";
    let icon = "fa-circle-info";

    if (t.isFavorable) {
      badgeStyle = "background:var(--vedic-gold); color:#111E38; font-weight:800;";
      icon = "fa-circle-check";
    } else if (t.statusTitle.includes("Caution")) {
      badgeStyle = "background:#FFF3CD; color:#856404; font-weight:700;";
      icon = "fa-triangle-exclamation";
    }

    return `
      <div class="gochar-card glass-card mb-3" style="padding:18px; border-radius:12px; text-align:left;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <h4 style="color:var(--cosmic-blue); margin:0; font-size:1.05rem;">
            <i class="fa-solid fa-planet-ring-system" style="color:var(--vedic-gold);"></i> ${t.planet} Transit
          </h4>
          <span style="${badgeStyle} font-size:0.75rem; padding:3px 10px; border-radius:12px;">
            <i class="fa-solid ${icon}"></i> ${t.statusTitle}
          </span>
        </div>
        <p style="font-size:0.88rem; margin:6px 0; color:var(--text-dark);">
          Transiting Sign: <strong>${t.signSymbol} ${t.signName}</strong><br>
          Position from Natal Moon: <strong>House ${t.houseFromMoon}</strong> | From Lagna: <strong>House ${t.houseFromLagna}</strong>
        </p>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
}

/**
 * Tab Navigation Switcher
 */
function initTabSwitchers() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      tab.classList.add('active');
      const target = document.getElementById(tab.getAttribute('data-tab'));
      if (target) target.classList.add('active');
    });
  });
}

/**
 * Form Event Listeners
 */
function initFormListeners() {
  const kundliForm = document.getElementById('kundliForm');
  if (kundliForm) {
    kundliForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const dob = document.getElementById('dob').value;
      const tob = document.getElementById('tob').value;
      const lat = parseFloat(document.getElementById('pobLat').value || 28.6139);
      const lon = parseFloat(document.getElementById('pobLon').value || 77.2090);
      const tz = parseFloat(document.getElementById('pobTz').value || 5.5);

      runCalculations(dob, tob, lat, lon, tz);
    });
  }

  const chartTypeSelect = document.getElementById('chartTypeSelect');
  if (chartTypeSelect) {
    chartTypeSelect.addEventListener('change', (e) => {
      const cType = e.target.value;
      document.querySelectorAll('.btn-chart-select').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-chart') === cType);
      });
      renderNorthChart(cType);
    });
  }

  const matchForm = document.getElementById('matchmakingForm');
  if (matchForm) {
    matchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const bName = document.getElementById('boyName').value;
      const bRashi = parseInt(document.getElementById('boyRashi').value);
      const bNak = document.getElementById('boyNakshatra').value;

      const gName = document.getElementById('girlName').value;
      const gRashi = parseInt(document.getElementById('girlRashi').value);
      const gNak = document.getElementById('girlNakshatra').value;

      let result = null;
      try {
        const res = await fetch('/api/calculate-guna-milan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ boyRashi: bRashi, boyNakshatra: bNak, girlRashi: gRashi, girlNakshatra: gNak })
        });
        if (res.ok) {
          result = await res.json();
        } else {
          throw new Error('API fallback');
        }
      } catch (err) {
        result = PyHoraEngine.calculateGunaMilan(bRashi, bNak, gRashi, gNak);
      }
      
      const resContainer = document.getElementById('matchResult');
      resContainer.classList.remove('hidden');
      document.getElementById('totalGunaScore').innerText = result.totalScore;
      document.getElementById('matchGradeTitle').innerText = result.gradeTitle;
      document.getElementById('matchSummaryText').innerText = `Ashtakoot Guna Milan score for ${bName} (${bNak}) and ${gName} (${gNak}) is ${result.totalScore} out of 36 points.`;

      document.getElementById('kootBreakdown').innerHTML = result.kootas.map(k => `
        <div class="koot-chip" style="background:#fff; border:1px solid var(--card-border); padding:12px 16px; border-radius:10px;">
          <span class="koot-name" style="font-weight:700; color:var(--cosmic-blue); font-size:0.95rem;">${k.name}</span>
          <span class="koot-score" style="font-weight:800; color:var(--primary-pink-dark); font-size:1.05rem; float:right;">${k.score} / ${k.max}</span>
        </div>
      `).join('');

      resContainer.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

/**
 * Dynamic Daily Cosmic Guidance Engine with Automatic Daily Renewal
 * Automatically renews every day at midnight using live system date.
 */
function getTodayFormattedDate() {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date().toLocaleDateString('en-US', options);
}

const DETAILED_HOROSCOPE_DATABASE = [
  {
    sign: "Mesha (Aries)",
    symbol: "♈",
    overview: "Today's planetary alignment grants strong mental clarity and executive decisiveness. Mars and Moon create a powerful drive for leadership and breakthroughs.",
    career: "Favorable for launching new initiatives, closing negotiations, and taking bold steps in career. Stand firm in your strategic vision.",
    love: "Passionate and open communication strengthens bonds. Single Aries may experience a magnetic connection with someone intellectual.",
    health: "High vitality and stamina. Engage in cardiovascular exercises or yoga to channel excess Mars energy constructively.",
    remedy: "Chant 'Om Kram Kreem Kroum Sah Bhaumaya Namah' 11 times and offer red flowers to Surya Deva.",
    color: "Royal Crimson & Saffron Gold",
    num: "9",
    direction: "East",
    hours: "09:15 AM – 11:30 AM",
    vibe: "High Ambition & Leadership"
  },
  {
    sign: "Vrishabha (Taurus)",
    symbol: "♉",
    overview: "Venus brings a serene, creative, and steady aura today. Focus on consolidating wealth, domestic harmony, and aesthetic projects.",
    career: "Patience and structured planning bring steady financial growth. Good day for reviewing long-term investments and contractual agreements.",
    love: "Warmth and mutual respect enhance relationship comfort. Plan a quiet, luxurious dinner or shared artistic experience.",
    health: "Focus on throat and neck wellness. Warm herbal teas and calming mindfulness meditation will rejuvenate your energy.",
    remedy: "Chant 'Om Draam Dreem Droum Sah Shukraya Namah' and offer white sweets or rice flour.",
    color: "Lotus Pink & Pearl White",
    num: "6",
    direction: "South-East",
    hours: "10:30 AM – 12:45 PM",
    vibe: "Harmonious Growth & Prosperity"
  },
  {
    sign: "Mithuna (Gemini)",
    symbol: "♊",
    overview: "Mercury stimulates intellectual agility and eloquent communication. Excellent day for networking, writing, media, and problem-solving.",
    career: "Brainstorming sessions yield breakthrough solutions. Communication with clients and partners flows effortlessly.",
    love: "Witty conversations and shared intellectual curiosity light up romance. Excellent time to share heartfelt thoughts with your partner.",
    health: "Mental energy is high; avoid overthinking. Practice alternate nostril breathing (Nadi Shodhana Pranayama).",
    remedy: "Chant 'Om Braam Breem Broum Sah Buddhaya Namah' 19 times and feed green fodder or leafy greens.",
    color: "Emerald Green & Pastel Mint",
    num: "5",
    direction: "North",
    hours: "08:30 AM – 10:45 AM",
    vibe: "Creative Spark & Intellectual Agility"
  },
  {
    sign: "Karka (Cancer)",
    symbol: "♋",
    overview: "Moon's position deepens emotional intuition and protective warmth. Pay attention to inner guidance regarding family, home, and long-term security.",
    career: "Trust your gut instincts in business decisions. Team members will look to you for empathetic leadership and emotional stability.",
    love: "Deep emotional intimacy flourishes. A heart-to-heart conversation strengthens trust with your significant other.",
    health: "Nourish your digestive system with warm, home-cooked meals. Hydrate well and rest adequately in the evening.",
    remedy: "Chant 'Om Shram Shreem Shroum Sah Chandraya Namah' and offer water or milk in a silver vessel.",
    color: "Silver White & Moonlit Cream",
    num: "2",
    direction: "North-West",
    hours: "02:00 PM – 04:15 PM",
    vibe: "Deep Intuition & Emotional Clarity"
  },
  {
    sign: "Simha (Leo)",
    symbol: "♌",
    overview: "Sun's radiant energy bestows authority, confidence, and magnetic charisma. Superiors and peers naturally acknowledge your leadership.",
    career: "High visibility in career. Take the stage, present key proposals, and lead corporate projects with unwavering poise.",
    love: "Generosity and warmth make you irresistible. Express your affection openly through thoughtful gestures and genuine compliments.",
    health: "Heart and spine vitality are strong. Enjoy outdoor sunshine and brisk walking to maintain high energy levels.",
    remedy: "Chant 'Om Hraam Hreem Hroum Sah Suryaya Namah' and offer water to the rising Sun at dawn.",
    color: "Royal Gold & Bright Amber",
    num: "1",
    direction: "East",
    hours: "07:30 AM – 09:45 AM",
    vibe: "Radiant Power & Executive Authority"
  },
  {
    sign: "Kanya (Virgo)",
    symbol: "♍",
    overview: "Mercury enhances analytical precision, organizational mastery, and attention to detail. Perfect day to streamline routines and solve complex tasks.",
    career: "Meticulous focus ensures error-free execution of critical projects. Audit financial sheets and organize operational workflows.",
    love: "Acts of service and practical support express your care better than words. Help your partner solve an ongoing challenge.",
    health: "Focus on gut health and dietary balance. Consume fiber-rich meals and avoid processed foods.",
    remedy: "Chant Vishnu Sahasranama or 'Om Namo Bhagavate Vasudevaya' 21 times.",
    color: "Pastel Blue & Forest Green",
    num: "5",
    direction: "North",
    hours: "11:00 AM – 01:15 PM",
    vibe: "Precision & Analytical Excellence"
  },
  {
    sign: "Tula (Libra)",
    symbol: "♎",
    overview: "Venus promotes grace, aesthetic balance, and diplomatic harmony. Strategic partnerships and artistic pursuits bring immense joy.",
    career: "Favorable for mediation, joint business ventures, and creative design work. Diplomacy wins over challenging stakeholders.",
    love: "Charming and romantic vibes prevail. Celebrate harmony with a romantic date or creative collaborative activity.",
    health: "Maintain kidney and lower back health. Drink plenty of fresh water and perform gentle waist twists.",
    remedy: "Chant 'Om Shree Shukraya Namah' and donate white flowers or cotton to a sacred space.",
    color: "Rose Pink & Celestial Lavender",
    num: "7",
    direction: "West",
    hours: "03:30 PM – 05:45 PM",
    vibe: "Diplomatic Harmony & Grace"
  },
  {
    sign: "Vrishchika (Scorpio)",
    symbol: "♏",
    overview: "Mars and Ketu stimulate intense focus, transformative intuition, and research depth. Uncover hidden insights and conquer complex obstacles.",
    career: "Unmatched problem-solving power. Dive deep into research, technical diagnostics, or confidential business strategy.",
    love: "Intense emotional depth and unshakeable loyalty. Share your authentic feelings with someone you trust completely.",
    health: "Channel intense energy into martial arts, swimming, or deep breathwork to maintain emotional equilibrium.",
    remedy: "Chant Hanuman Chalisa or 'Om Kram Kreem Kroum Sah Bhaumaya Namah'.",
    color: "Maroon & Deep Sapphire",
    num: "8",
    direction: "South",
    hours: "01:30 PM – 03:45 PM",
    vibe: "Transformative Power & Intuitive Depth"
  },
  {
    sign: "Dhanu (Sagittarius)",
    symbol: "♐",
    overview: "Jupiter's expansive blessings bring optimism, wisdom, and spiritual clarity. Excellent day for higher learning, teaching, and travel plans.",
    career: "Broaden your horizons. Strategic vision and philosophical alignment attract mentors, sponsors, and global opportunities.",
    love: "Shared values and adventurous conversations deepen romantic bonds. Plan a fun trip or explore a new hobby together.",
    health: "Thigh and hip flexibility benefits from stretching. Stay active outdoors and maintain optimistic mental health.",
    remedy: "Chant 'Om Graam Greem Groum Sah Gurave Namah' 19 times and apply a tilak of saffron or turmeric.",
    color: "Saffron Yellow & Bright Ochre",
    num: "3",
    direction: "North-East",
    hours: "09:00 AM – 11:15 AM",
    vibe: "Spiritual Wisdom & Expansive Joy"
  },
  {
    sign: "Makara (Capricorn)",
    symbol: "♑",
    overview: "Saturn bestows unshakeable discipline, long-term focus, and structural endurance. Steady effort yields tangible real-world achievements.",
    career: "Patience and perseverance pay off. Finalize long-term contracts, structure operational budgets, and solidify career foundations.",
    love: "Reliability and steadfast commitment reassure your loved ones. Show devotion through dependable actions.",
    health: "Take care of joints, knees, and bones. Maintain proper posture and engage in low-impact strength training.",
    remedy: "Chant 'Om Praam Preem Proum Sah Shanaishcharaya Namah' and light a mustard oil lamp under a Peepal tree.",
    color: "Cosmic Charcoal & Deep Navy",
    num: "4",
    direction: "West",
    hours: "04:00 PM – 06:15 PM",
    vibe: "Unshakeable Structure & Discipline"
  },
  {
    sign: "Kumbha (Aquarius)",
    symbol: "♒",
    overview: "Saturn and Rahu inspire original thinking, humanitarian vision, and tech-driven innovation. Network with forward-thinking communities.",
    career: "Innovative ideas receive strong support. Great day for team collaborations, digital marketing, and tech implementations.",
    love: "Intellectual friendship forms the foundation of romance today. Engage in stimulating discussions about future goals.",
    health: "Ankles and circulatory system need care. Elevate your legs while resting and practice mindful breathing.",
    remedy: "Chant 'Om Sham Shanaishcharaya Namah' and donate food to the underprivileged.",
    color: "Sky Blue & Electric Cobalt",
    num: "11",
    direction: "West",
    hours: "02:15 PM – 04:30 PM",
    vibe: "Humanitarian Innovation & Vision"
  },
  {
    sign: "Meena (Pisces)",
    symbol: "♓",
    overview: "Jupiter's compassionate influence enhances spiritual awareness, creative imagination, and meditative peace. Trust inner spiritual guidance.",
    career: "Artistic, healing, and intuitive projects flourish. Express your creative imagination in writing, music, or consulting.",
    love: "Unconditional love and empathetic understanding enrich your relationship. Connect on a soul-to-soul level.",
    health: "Foot care and restful sleep are essential. Enjoy a soothing warm bath or guided meditation before sleep.",
    remedy: "Chant 'Om Gurave Namah' and offer yellow flowers to a deity or temple.",
    color: "Seafoam Green & Soft Gold",
    num: "12",
    direction: "North-East",
    hours: "08:00 AM – 10:15 AM",
    vibe: "Spiritual Peace & Artistic Vision"
  }
];

function initDailyHoroscope() {
  const grid = document.getElementById('rashiSelectorGrid');
  const heroChips = document.getElementById('heroRashiChips');
  const heroDate = document.getElementById('heroHoroDate');

  const todayStr = getTodayFormattedDate();

  if (heroDate) {
    const shortDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    heroDate.innerText = shortDate;
  }

  const dateSpan = document.getElementById('horoDateSpan');
  if (dateSpan) {
    dateSpan.innerHTML = `Daily Cosmic Forecast for <strong>${todayStr}</strong>`;
  }

  // Populate Hero Section Rashifal Chips
  if (heroChips) {
    heroChips.innerHTML = DETAILED_HOROSCOPE_DATABASE.map((h, i) => `
      <button class="hero-rashi-btn ${i === 0 ? 'active' : ''}" data-idx="${i}" title="${h.sign}" style="display:inline-flex; align-items:center; gap:4px; background:var(--bg-cream-alt); border:1px solid var(--card-border); padding:4px 9px; border-radius:16px; cursor:pointer; font-family:var(--font-sans); transition:all 0.2s ease;">
        <span style="font-size:1rem; color:var(--vedic-gold);">${h.symbol}</span>
        <span style="font-size:0.75rem; font-weight:600; color:var(--cosmic-blue);">${h.sign.split(' ')[0]}</span>
      </button>
    `).join('');

    heroChips.querySelectorAll('.hero-rashi-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        heroChips.querySelectorAll('.hero-rashi-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const idx = parseInt(btn.getAttribute('data-idx'));
        updateHoroscopeCard(DETAILED_HOROSCOPE_DATABASE[idx]);

        // Sync main grid item highlight
        const gridItems = document.querySelectorAll('.rashi-card-item');
        if (gridItems && gridItems[idx]) {
          gridItems.forEach(c => c.classList.remove('active'));
          gridItems[idx].classList.add('active');
        }

        const horoCard = document.getElementById('horoscopeResultCard');
        if (horoCard) horoCard.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  if (grid) {
    grid.innerHTML = DETAILED_HOROSCOPE_DATABASE.map((h, i) => `
      <div class="rashi-card-item ${i === 0 ? 'active' : ''}" data-idx="${i}">
        <span class="symbol">${h.symbol}</span>
        <span class="name">${h.sign.split(' ')[0]}</span>
      </div>
    `).join('');

    document.querySelectorAll('.rashi-card-item').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.rashi-card-item').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const idx = parseInt(card.getAttribute('data-idx'));
        updateHoroscopeCard(DETAILED_HOROSCOPE_DATABASE[idx]);

        // Sync hero chips highlight
        if (heroChips) {
          const heroBtns = heroChips.querySelectorAll('.hero-rashi-btn');
          if (heroBtns && heroBtns[idx]) {
            heroBtns.forEach(b => b.classList.remove('active'));
            heroBtns[idx].classList.add('active');
          }
        }
      });
    });
  }

  // Initial load with first Rashi (Mesha)
  updateHoroscopeCard(DETAILED_HOROSCOPE_DATABASE[0]);
}

function updateHoroscopeCard(data) {
  const todayStr = getTodayFormattedDate();

  document.getElementById('horoSymbol').innerText = data.symbol;
  document.getElementById('horoRashiName').innerText = `${data.sign} Daily Vedic Forecast`;
  document.getElementById('horoDescription').innerText = data.overview;

  const pillarsContainer = document.getElementById('horoPillarsGrid');
  if (pillarsContainer) {
    pillarsContainer.innerHTML = `
      <div style="background:#fff; border:1px solid var(--card-border); padding:16px; border-radius:10px; border-left:4px solid var(--vedic-gold);">
        <h5 style="color:var(--cosmic-blue); margin:0 0 6px 0; font-size:0.92rem;"><i class="fa-solid fa-briefcase" style="color:var(--vedic-gold);"></i> Career & Wealth</h5>
        <p style="font-size:0.85rem; color:var(--text-dark); margin:0; line-height:1.5;">${data.career}</p>
      </div>

      <div style="background:#fff; border:1px solid var(--card-border); padding:16px; border-radius:10px; border-left:4px solid var(--primary-pink-dark);">
        <h5 style="color:var(--cosmic-blue); margin:0 0 6px 0; font-size:0.92rem;"><i class="fa-solid fa-heart" style="color:var(--primary-pink-dark);"></i> Love & Relationships</h5>
        <p style="font-size:0.85rem; color:var(--text-dark); margin:0; line-height:1.5;">${data.love}</p>
      </div>

      <div style="background:#fff; border:1px solid var(--card-border); padding:16px; border-radius:10px; border-left:4px solid #27AE60;">
        <h5 style="color:var(--cosmic-blue); margin:0 0 6px 0; font-size:0.92rem;"><i class="fa-solid fa-spa" style="color:#27AE60;"></i> Health & Wellness</h5>
        <p style="font-size:0.85rem; color:var(--text-dark); margin:0; line-height:1.5;">${data.health}</p>
      </div>

      <div style="background:#fff; border:1px solid var(--card-border); padding:16px; border-radius:10px; border-left:4px solid #8E44AD;">
        <h5 style="color:var(--cosmic-blue); margin:0 0 6px 0; font-size:0.92rem;"><i class="fa-solid fa-om" style="color:#8E44AD;"></i> Vedic Remedy of the Day</h5>
        <p style="font-size:0.85rem; color:var(--text-dark); margin:0; line-height:1.5;">${data.remedy}</p>
      </div>
    `;
  }

  const indicatorsContainer = document.getElementById('horoIndicators');
  if (indicatorsContainer) {
    indicatorsContainer.innerHTML = `
      <div class="ind-chip" style="background:#fff; border:1px solid var(--card-border); padding:6px 14px; border-radius:20px; font-size:0.82rem;">
        <i class="fa-solid fa-clover" style="color:var(--primary-pink-dark);"></i> Lucky Color: <strong>${data.color}</strong>
      </div>
      <div class="ind-chip" style="background:#fff; border:1px solid var(--card-border); padding:6px 14px; border-radius:20px; font-size:0.82rem;">
        <i class="fa-solid fa-hashtag" style="color:var(--vedic-gold);"></i> Lucky Number: <strong>${data.num}</strong>
      </div>
      <div class="ind-chip" style="background:#fff; border:1px solid var(--card-border); padding:6px 14px; border-radius:20px; font-size:0.82rem;">
        <i class="fa-solid fa-compass" style="color:#2980B9;"></i> Lucky Direction: <strong>${data.direction}</strong>
      </div>
      <div class="ind-chip" style="background:#fff; border:1px solid var(--card-border); padding:6px 14px; border-radius:20px; font-size:0.82rem;">
        <i class="fa-solid fa-clock" style="color:#E67E22;"></i> Power Hours: <strong>${data.hours}</strong>
      </div>
      <div class="ind-chip" style="background:#fff; border:1px solid var(--card-border); padding:6px 14px; border-radius:20px; font-size:0.82rem;">
        <i class="fa-solid fa-bolt" style="color:var(--vedic-gold);"></i> Cosmic Vibe: <strong>${data.vibe}</strong>
      </div>
    `;
  }
}

/**
 * Interactive Circular Rashi Wheel
 */
function initRashiWheel() {
  const sectors = document.querySelectorAll('.rashi-sector');
  sectors.forEach((sec, idx) => {
    sec.addEventListener('click', () => {
      const rData = DETAILED_HOROSCOPE_DATABASE[idx % 12];
      updateHoroscopeCard(rData);
      document.getElementById('horoscopeResultCard').scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/**
 * Client Intake & Booking Modal Workflow
 */
function initBookingModal() {
  const modal = document.getElementById('bookingModal');
  const closeBtn = document.getElementById('modalCloseBtn');
  const openBtns = document.querySelectorAll('.open-booking-modal, .select-package-btn');

  openBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const pkg = btn.getAttribute('data-pkg');
      if (pkg) {
        document.getElementById('intakePackage').value = pkg;
      }
      modal.classList.add('active');
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  const intakeForm = document.getElementById('intakeForm');
    const btnWa = document.getElementById('submitWhatsapp');
    if (btnWa) {
      btnWa.addEventListener('click', (e) => {
        e.preventDefault();
        sendBooking('whatsapp');
      });
    }

    const btnEmail = document.getElementById('submitEmail');
    if (btnEmail) {
      btnEmail.addEventListener('click', (e) => {
        e.preventDefault();
        sendBooking('email');
      });
    }
}

function sendBooking(type) {
  const pkg = document.getElementById('intakePackage').value;
  const name = document.getElementById('intakeName').value || 'Client';
  const prof = document.getElementById('intakeProfession').value || 'N/A';
  const dob = document.getElementById('intakeDob').value || 'N/A';
  const tob = document.getElementById('intakeTob').value || 'N/A';
  const pob = document.getElementById('intakePobInput').value || 'N/A';
  const lat = document.getElementById('intakeLat').value || '28.6139';
  const lon = document.getElementById('intakeLon').value || '77.2090';
  const mode = document.getElementById('intakeMode').value || 'Voice Call';
  const query = document.getElementById('intakeQuery').value || 'General Consultation';

  const message = `Namaste Acharya Nimisha Ji,\n\nI would like to book an astrological consultation.\n\n*Intake Details:*\n- *Package:* ${pkg}\n- *Full Name:* ${name}\n- *Profession:* ${prof}\n- *Date of Birth:* ${dob}\n- *Time of Birth:* ${tob}\n- *Place of Birth:* ${pob} (Lat: ${lat}, Lon: ${lon})\n- *Consultation Mode:* ${mode}\n- *Primary Concerns:* ${query}\n\nLooking forward to your guidance!`;

  if (type === 'whatsapp') {
    const waUrl = `https://wa.me/918602110010?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  } else {
    const mailUrl = `mailto:n.astro3008@gmail.com?subject=${encodeURIComponent(`Consultation Booking - ${name}`)}&body=${encodeURIComponent(message)}`;
    window.location.href = mailUrl;
  }
}
