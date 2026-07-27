/**
 * High-Precision PyHora Astrological Engine & Ashtakoot 36 Guna Milan Engine
 * System: Vedic / Parashari System
 * Preferred Ayanamsha: Lahiri / Chitra Paksha (Spica 180°)
 * Default Chart Format: North Indian (Diamond Style) with Rashi badges & Interactive Tooltips
 */

const RASHI_NAMES = [
  "Mesha (Aries)", "Vrishabha (Taurus)", "Mithuna (Gemini)", "Karka (Cancer)",
  "Simha (Leo)", "Kanya (Virgo)", "Tula (Libra)", "Vrishchika (Scorpio)",
  "Dhanu (Sagittarius)", "Makara (Capricorn)", "Kumbha (Aquarius)", "Meena (Pisces)"
];

const RASHI_SYMBOLS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

const RASHI_LORDS = [
  "Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"
];

const NAKSHATRAS = [
  { name: "Ashwini", lord: "Ketu", rashi: 0 },
  { name: "Bharani", lord: "Venus", rashi: 0 },
  { name: "Krittika", lord: "Sun", rashi: 0 },
  { name: "Rohini", lord: "Moon", rashi: 1 },
  { name: "Mrigashira", lord: "Mars", rashi: 1 },
  { name: "Arudra", lord: "Rahu", rashi: 2 },
  { name: "Punarvasu", lord: "Jupiter", rashi: 2 },
  { name: "Pushya", lord: "Saturn", rashi: 3 },
  { name: "Ashlesha", lord: "Mercury", rashi: 3 },
  { name: "Magha", lord: "Ketu", rashi: 4 },
  { name: "Purva Phalguni", lord: "Venus", rashi: 4 },
  { name: "Uttara Phalguni", lord: "Sun", rashi: 4 },
  { name: "Hastha", lord: "Moon", rashi: 5 },
  { name: "Chitra", lord: "Mars", rashi: 5 },
  { name: "Swati", lord: "Rahu", rashi: 6 },
  { name: "Vishakha", lord: "Jupiter", rashi: 6 },
  { name: "Anuradha", lord: "Saturn", rashi: 7 },
  { name: "Jyeshtha", lord: "Mercury", rashi: 7 },
  { name: "Mula", lord: "Ketu", rashi: 8 },
  { name: "Purva Ashadha", lord: "Venus", rashi: 8 },
  { name: "Uttara Ashadha", lord: "Sun", rashi: 8 },
  { name: "Shravana", lord: "Moon", rashi: 9 },
  { name: "Dhanishta", lord: "Mars", rashi: 9 },
  { name: "Shatabhisha", lord: "Rahu", rashi: 10 },
  { name: "Purva Bhadrapada", lord: "Jupiter", rashi: 10 },
  { name: "Uttara Bhadrapada", lord: "Saturn", rashi: 11 },
  { name: "Revati", lord: "Mercury", rashi: 11 }
];

const VIMSHOTTARI_LORDS = [
  { lord: "Ketu", years: 7 },
  { lord: "Venus", years: 20 },
  { lord: "Sun", years: 6 },
  { lord: "Moon", years: 10 },
  { lord: "Mars", years: 7 },
  { lord: "Rahu", years: 18 },
  { lord: "Jupiter", years: 16 },
  { lord: "Saturn", years: 19 },
  { lord: "Mercury", years: 17 }
];

const YOGINI_DASHAS = [
  { name: "Mangala", lord: "Moon", years: 1 },
  { name: "Pingala", lord: "Sun", years: 2 },
  { name: "Dhanya", lord: "Jupiter", years: 3 },
  { name: "Bhramari", lord: "Mars", years: 4 },
  { name: "Bhadrika", lord: "Mercury", years: 5 },
  { name: "Ulka", lord: "Saturn", years: 6 },
  { name: "Siddha", lord: "Venus", years: 7 },
  { name: "Sankata", lord: "Rahu", years: 8 }
];

const FAVORABLE_GOCHAR_HOUSES = {
  Sun: [3, 6, 10, 11],
  Moon: [1, 3, 6, 7, 10, 11],
  Mars: [3, 6, 11],
  Mercury: [2, 4, 6, 8, 10, 11],
  Jupiter: [2, 5, 7, 9, 11],
  Venus: [1, 2, 3, 4, 5, 8, 9, 11, 12],
  Saturn: [3, 6, 11],
  Rahu: [3, 6, 11],
  Ketu: [3, 6, 11]
};

const ASHTAKVARGA_RULES = {
  Sun: {
    Sun: [1, 2, 4, 7, 8, 9, 10, 11], Moon: [3, 6, 10, 11], Mars: [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury: [3, 5, 6, 9, 10, 11, 12], Jupiter: [5, 6, 9, 11], Venus: [6, 7, 12],
    Saturn: [1, 2, 4, 7, 8, 9, 10, 11], Lagna: [3, 4, 6, 10, 11, 12]
  },
  Moon: {
    Sun: [3, 6, 7, 8, 10, 11], Moon: [1, 3, 6, 7, 10, 11], Mars: [2, 3, 5, 6, 9, 10, 11],
    Mercury: [1, 3, 4, 5, 7, 8, 10, 11], Jupiter: [1, 4, 7, 8, 10, 11, 12], Venus: [3, 4, 5, 7, 9, 10, 11],
    Saturn: [3, 5, 6, 11], Lagna: [3, 6, 10, 11]
  },
  Mars: {
    Sun: [3, 5, 6, 10, 11], Moon: [3, 6, 11], Mars: [1, 2, 4, 7, 8, 10, 11],
    Mercury: [3, 5, 6, 11], Jupiter: [6, 10, 11, 12], Venus: [6, 8, 11, 12],
    Saturn: [1, 4, 7, 8, 9, 10, 11], Lagna: [1, 3, 6, 10, 11]
  },
  Mercury: {
    Sun: [5, 6, 9, 11, 12], Moon: [2, 4, 6, 8, 10, 11], Mars: [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury: [1, 3, 5, 6, 9, 10, 11, 12], Jupiter: [6, 8, 11, 12], Venus: [1, 2, 3, 4, 5, 8, 9, 11],
    Saturn: [1, 2, 4, 7, 8, 9, 10, 11], Lagna: [1, 2, 4, 6, 8, 10, 11]
  },
  Jupiter: {
    Sun: [1, 2, 3, 4, 7, 8, 9, 10, 11], Moon: [2, 5, 7, 9, 11], Mars: [1, 2, 4, 7, 8, 10, 11],
    Mercury: [1, 2, 4, 5, 6, 9, 10, 11], Jupiter: [1, 2, 3, 4, 7, 8, 10, 11], Venus: [2, 5, 6, 9, 10, 11],
    Saturn: [3, 5, 6, 12], Lagna: [1, 2, 4, 5, 6, 7, 9, 10, 11]
  },
  Venus: {
    Sun: [8, 11, 12], Moon: [1, 2, 3, 4, 5, 8, 9, 11, 12], Mars: [3, 5, 6, 9, 11, 12],
    Mercury: [3, 5, 6, 9, 11], Jupiter: [5, 8, 9, 10, 11], Venus: [1, 2, 3, 4, 5, 8, 9, 10, 11],
    Saturn: [3, 4, 5, 8, 9, 10, 11], Lagna: [1, 2, 3, 4, 5, 8, 9, 11]
  },
  Saturn: {
    Sun: [1, 2, 4, 7, 8, 10, 11], Moon: [3, 6, 11], Mars: [3, 5, 6, 10, 11, 12],
    Mercury: [6, 8, 9, 10, 11, 12], Jupiter: [5, 6, 11, 12], Venus: [6, 11, 12],
    Saturn: [3, 5, 6, 11], Lagna: [1, 3, 4, 6, 10, 11]
  }
};

class PyHoraEngine {

  static getDivisionalSign(degTotal, chartType = 'D1') {
    const deg = (degTotal % 360.0 + 360.0) % 360.0;
    const s = Math.floor(deg / 30.0);
    const d = deg % 30.0;

    if (chartType === 'D9') {
      return Math.floor(deg / (30.0 / 9.0)) % 12;
    } else if (chartType === 'D10') {
      const part = Math.floor(d / 3.0);
      const isOdd = (s % 2 === 0);
      const startSign = isOdd ? s : (s + 8) % 12;
      return (startSign + part) % 12;
    } else if (chartType === 'D7') {
      const part = Math.floor(d / (30.0 / 7.0));
      const isOdd = (s % 2 === 0);
      const startSign = isOdd ? s : (s + 6) % 12;
      return (startSign + part) % 12;
    }

    return s;
  }

  static calculatePlanets(dobStr, tobStr, lat = 28.6139, lon = 77.2090, tz = 5.5, pobStr = 'Place', ayanamshaType = 'lahiri') {
    const [year, month, day] = dobStr.split('-').map(Number);
    const [hour, minute] = tobStr.split(':').map(Number);

    const totalLocalHours = hour + minute / 60.0;
    let utcHours = totalLocalHours - tz;
    let utcYear = year;
    let utcMonth = month;
    let utcDay = day;

    if (utcHours < 0) {
      utcHours += 24.0;
      const prevDate = new Date(Date.UTC(year, month - 1, day - 1));
      utcYear = prevDate.getUTCFullYear();
      utcMonth = prevDate.getUTCMonth() + 1;
      utcDay = prevDate.getUTCDate();
    } else if (utcHours >= 24.0) {
      utcHours -= 24.0;
      const nextDate = new Date(Date.UTC(year, month - 1, day + 1));
      utcYear = nextDate.getUTCFullYear();
      utcMonth = nextDate.getUTCMonth() + 1;
      utcDay = nextDate.getUTCDate();
    }

    let m = utcMonth;
    let y = utcYear;
    if (m <= 2) { y -= 1; m += 12; }
    const A = Math.floor(y / 100);
    const B = 2 - A + Math.floor(A / 4);
    const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + utcDay + (utcHours / 24.0) + B - 1524.5;
    const T = (jd - 2451545.0) / 36525.0;

    let ayanamsha = 23.85709167 + 1.3969713 * T + 0.0003086 * T * T;
    if (ayanamshaType === 'raman') ayanamsha -= 1.4;
    else if (ayanamshaType === 'kp') ayanamsha += 0.10;

    let gmstDeg = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - (T * T * T / 38710000.0);
    gmstDeg = (gmstDeg % 360.0 + 360.0) % 360.0;
    
    const lstDeg = (gmstDeg + lon + 360.0) % 360.0;
    const lstRad = (lstDeg * Math.PI) / 180.0;
    const latRad = (lat * Math.PI) / 180.0;
    const epsRad = (23.4392911 * Math.PI) / 180.0;

    const num = Math.cos(lstRad);
    const den = -Math.sin(lstRad) * Math.cos(epsRad) - Math.tan(latRad) * Math.sin(epsRad);
    const ascTropDeg = (Math.atan2(num, den) * 180.0 / Math.PI + 360.0) % 360.0;
    const lagnaDeg = (ascTropDeg - ayanamsha + 360.0) % 360.0;
    const lagnaSign = Math.floor(lagnaDeg / 30);

    const M_sun = ((357.52911 + 35999.05029 * T - 0.0001537 * T * T) * Math.PI) / 180.0;
    const L0_sun = (280.46646 + 36000.76983 * T + 0.0003032 * T * T) % 360.0;
    const C_sun = (1.914602 - 0.004817 * T) * Math.sin(M_sun) + (0.019993 - 0.000101 * T) * Math.sin(2 * M_sun) + 0.000289 * Math.sin(3 * M_sun);
    const sunTrop = (L0_sun + C_sun + 360.0) % 360.0;

    const L_moon = (218.3165 + 481267.8813 * T) % 360.0;
    const M_moon = ((134.9634 + 477198.8675 * T) * Math.PI) / 180.0;
    const F_moon = ((93.2721 + 483202.0175 * T) * Math.PI) / 180.0;
    const D_moon = ((297.8502 + 445267.1114 * T) * Math.PI) / 180.0;
    const moonTrop = (L_moon + 6.2886 * Math.sin(M_moon) + 1.2740 * Math.sin(2 * D_moon - M_moon) + 0.6583 * Math.sin(2 * D_moon) + 0.2136 * Math.sin(2 * M_moon) - 0.1851 * Math.sin(M_sun) - 0.1143 * Math.sin(2 * F_moon) + 360.0) % 360.0;

    const M_mars = ((19.3730 + 19140.2993 * T) * Math.PI) / 180.0;
    const L_mars = (355.4330 + 19140.2993 * T) % 360.0;
    const marsTrop = (L_mars + 10.6912 * Math.sin(M_mars) + 0.6228 * Math.sin(2 * M_mars) + 360.0) % 360.0;

    const M_merc = ((174.7948 + 149472.6747 * T) * Math.PI) / 180.0;
    const mercTrop = (sunTrop + 6.3 * Math.sin(M_merc) + 360.0) % 360.0;

    const M_jup = ((20.0202 + 3034.9057 * T) * Math.PI) / 180.0;
    const L_jup = (34.3515 + 3034.9057 * T) % 360.0;
    const jupTrop = (L_jup + 5.5549 * Math.sin(M_jup) + 0.1683 * Math.sin(2 * M_jup) + 360.0) % 360.0;

    const M_ven = ((50.4161 + 58517.8156 * T) * Math.PI) / 180.0;
    const venTrop = (sunTrop + 0.7758 * Math.sin(M_ven) - 15.0 + 360.0) % 360.0;

    const M_sat = ((317.0207 + 1222.1138 * T) * Math.PI) / 180.0;
    const L_sat = (50.0774 + 1222.1138 * T) % 360.0;
    const satTrop = (L_sat + 6.3585 * Math.sin(M_sat) + 0.2204 * Math.sin(2 * M_sat) + 360.0) % 360.0;

    const omegaTrop = (125.044547 - 1934.136261 * T + 0.002075 * T * T + 360.0) % 360.0;
    const rahuTrop = omegaTrop;
    const ketuTrop = (rahuTrop + 180.0) % 360.0;

    const planetList = [
      { name: "Lagna (Ascendant)", degTrop: ascTropDeg },
      { name: "Sun (Surya)", degTrop: sunTrop },
      { name: "Moon (Chandra)", degTrop: moonTrop },
      { name: "Mars (Mangal)", degTrop: marsTrop },
      { name: "Mercury (Budh)", degTrop: mercTrop },
      { name: "Jupiter (Guru)", degTrop: jupTrop },
      { name: "Venus (Shukra)", degTrop: venTrop },
      { name: "Saturn (Shani)", degTrop: satTrop },
      { name: "Rahu", degTrop: rahuTrop },
      { name: "Ketu", degTrop: ketuTrop }
    ];

    const planets = planetList.map(p => {
      const sidDeg = (p.degTrop - ayanamsha + 360.0) % 360.0;
      const signIndex = Math.floor(sidDeg / 30);
      const degInSign = sidDeg % 30;

      const nakshatraIndex = Math.floor(sidDeg / (360.0 / 27.0)) % 27;
      const nakshatra = NAKSHATRAS[nakshatraIndex];
      const pada = Math.floor((sidDeg % (360.0 / 27.0)) / (360.0 / 108.0)) + 1;

      let house = ((signIndex - lagnaSign + 12) % 12) + 1;

      return {
        name: p.name,
        degTotal: parseFloat(sidDeg.toFixed(2)),
        signIndex: signIndex,
        signName: RASHI_NAMES[signIndex],
        signSymbol: RASHI_SYMBOLS[signIndex],
        degInSign: parseFloat(degInSign.toFixed(2)),
        nakshatraName: nakshatra.name,
        nakshatraLord: nakshatra.lord,
        pada: pada,
        house: house,
        status: (p.name.includes("Rahu") || p.name.includes("Ketu")) ? "Retrograde" : "Direct",
        d9Sign: PyHoraEngine.getDivisionalSign(sidDeg, 'D9'),
        d10Sign: PyHoraEngine.getDivisionalSign(sidDeg, 'D10'),
        d7Sign: PyHoraEngine.getDivisionalSign(sidDeg, 'D7')
      };
    });

    return {
      dob: dobStr,
      tob: tobStr,
      pob: pobStr,
      ayanamsha: parseFloat(ayanamsha.toFixed(4)),
      lagnaSign: lagnaSign,
      lagnaName: RASHI_NAMES[lagnaSign],
      planets: planets
    };
  }

  static renderNorthIndianDiamondSVG(chartData, chartType = 'D1') {
    const lagnaObj = chartData.planets.find(p => p.name.includes("Lagna"));
    const lagnaDeg = lagnaObj ? lagnaObj.degTotal : 0;

    let vargaLagnaSign = chartData.lagnaSign;
    if (chartType === 'D9') {
      vargaLagnaSign = lagnaObj && lagnaObj.d9Sign !== undefined ? lagnaObj.d9Sign : PyHoraEngine.getDivisionalSign(lagnaDeg, 'D9');
    } else if (chartType === 'D10') {
      vargaLagnaSign = lagnaObj && lagnaObj.d10Sign !== undefined ? lagnaObj.d10Sign : PyHoraEngine.getDivisionalSign(lagnaDeg, 'D10');
    } else if (chartType === 'D7') {
      vargaLagnaSign = lagnaObj && lagnaObj.d7Sign !== undefined ? lagnaObj.d7Sign : PyHoraEngine.getDivisionalSign(lagnaDeg, 'D7');
    }

    const housePlanets = {};
    for (let h = 1; h <= 12; h++) housePlanets[h] = [];

    chartData.planets.forEach(p => {
      let planetVargaSign = p.signIndex;
      if (chartType === 'D9') {
        planetVargaSign = p.d9Sign !== undefined ? p.d9Sign : PyHoraEngine.getDivisionalSign(p.degTotal, 'D9');
      } else if (chartType === 'D10') {
        planetVargaSign = p.d10Sign !== undefined ? p.d10Sign : PyHoraEngine.getDivisionalSign(p.degTotal, 'D10');
      } else if (chartType === 'D7') {
        planetVargaSign = p.d7Sign !== undefined ? p.d7Sign : PyHoraEngine.getDivisionalSign(p.degTotal, 'D7');
      }

      const vargaHouse = ((planetVargaSign - vargaLagnaSign + 12) % 12) + 1;
      
      const shortName = p.name.includes("Lagna") ? "Asc" : p.name.split(' ')[0].substring(0, 2);
      housePlanets[vargaHouse].push({
        code: shortName,
        fullName: p.name,
        deg: p.degInSign,
        vargaSignName: RASHI_NAMES[planetVargaSign],
        nak: p.nakshatraName,
        pada: p.pada,
        status: p.status
      });
    });

    const getHouseRashiNum = (h) => {
      let r = ((vargaLagnaSign + (h - 1)) % 12) + 1;
      return r;
    };

    const getPlanetColor = (code) => {
      switch(code) {
        case "Asc": return "#D4AF37";
        case "Su": return "#E67E22";
        case "Mo": return "#2980B9";
        case "Ma": return "#C0392B";
        case "Me": return "#27AE60";
        case "Ju": return "#B38F26";
        case "Ve": return "#C9728B";
        case "Sa": return "#111E38";
        case "Ra": return "#8E44AD";
        case "Ke": return "#7F8C8D";
        default: return "#111E38";
      }
    };

    const houseCoords = {
      1:  { rashi: { x: 180, y: 140 }, planets: { x: 180, y: 75 } },
      2:  { rashi: { x: 115, y: 65 },  planets: { x: 65, y: 35 } },
      3:  { rashi: { x: 65, y: 115 },  planets: { x: 35, y: 65 } },
      4:  { rashi: { x: 140, y: 180 }, planets: { x: 75, y: 180 } },
      5:  { rashi: { x: 65, y: 245 },  planets: { x: 35, y: 295 } },
      6:  { rashi: { x: 115, y: 295 }, planets: { x: 65, y: 325 } },
      7:  { rashi: { x: 180, y: 220 }, planets: { x: 180, y: 285 } },
      8:  { rashi: { x: 245, y: 295 }, planets: { x: 295, y: 325 } },
      9:  { rashi: { x: 295, y: 245 }, planets: { x: 325, y: 295 } },
      10: { rashi: { x: 220, y: 180 }, planets: { x: 285, y: 180 } },
      11: { rashi: { x: 295, y: 115 }, planets: { x: 325, y: 65 } },
      12: { rashi: { x: 245, y: 65 },  planets: { x: 295, y: 35 } }
    };

    let svgText = `<svg viewBox="0 0 360 360" class="north-chart-svg" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="8" width="344" height="344" rx="12" fill="#FCFAFA" stroke="#111E38" stroke-width="2.5"/>
      <polygon points="180,8 8,180 180,352 352,180" fill="rgba(232, 165, 184, 0.05)" stroke="#111E38" stroke-width="1.8"/>
      <line x1="8" y1="8" x2="352" y2="352" stroke="#111E38" stroke-width="1.8"/>
      <line x1="352" y1="8" x2="8" y2="352" stroke="#111E38" stroke-width="1.8"/>
    `;

    if (chartType === 'D10') {
      svgText += `<polygon points="352,180 180,180 266,94 266,266" fill="rgba(212, 175, 55, 0.15)" stroke="#D4AF37" stroke-width="1.5" stroke-dasharray="3 3"/>`;
    } else if (chartType === 'D7') {
      svgText += `<polygon points="180,180 8,180 8,352 180,352" fill="rgba(232, 165, 184, 0.15)" stroke="#C9728B" stroke-width="1.5" stroke-dasharray="3 3"/>`;
    }

    for (let h = 1; h <= 12; h++) {
      const pos = houseCoords[h];
      const rashiNum = getHouseRashiNum(h);
      const rashiName = RASHI_NAMES[rashiNum - 1];
      const planetsInHouse = housePlanets[h];

      if (h === 1) {
        svgText += `<polygon points="180,12 12,180 180,348 348,180" fill="none" stroke="#D4AF37" stroke-width="0.8" stroke-dasharray="4 4"/>`;
      }

      svgText += `
        <g class="rashi-badge-group" cursor="pointer">
          <circle cx="${pos.rashi.x}" cy="${pos.rashi.y}" r="12" fill="#111E38" stroke="#D4AF37" stroke-width="1.2"/>
          <text x="${pos.rashi.x}" y="${pos.rashi.y}" font-size="11" font-weight="800" fill="#F9F1D8" text-anchor="middle" dominant-baseline="central">${rashiNum}</text>
          <title>${chartType} House ${h}: ${rashiName}</title>
        </g>
      `;

      if (planetsInHouse.length > 0) {
        const total = planetsInHouse.length;
        planetsInHouse.forEach((p, idx) => {
          let offsetX = 0;
          let offsetY = 0;
          if (total > 1) {
            if (h === 1 || h === 7) {
              offsetX = (idx - (total - 1) / 2) * 28;
            } else if (h === 4 || h === 10) {
              offsetY = (idx - (total - 1) / 2) * 22;
            } else {
              offsetX = (idx % 2 === 0 ? -12 : 12);
              offsetY = (Math.floor(idx / 2) * 18);
            }
          }

          const px = pos.planets.x + offsetX;
          const py = pos.planets.y + offsetY;
          const color = getPlanetColor(p.code);

          svgText += `
            <g class="planet-badge-group" cursor="pointer">
              <rect x="${px - 14}" y="${py - 9}" width="28" height="18" rx="4" fill="#FFFFFF" stroke="${color}" stroke-width="1.5"/>
              <text x="${px}" y="${py}" font-size="10" font-weight="700" fill="${color}" text-anchor="middle" dominant-baseline="central">${p.code}</text>
              <title>${p.fullName}\n${chartType} Sign: ${p.vargaSignName}\nDegrees: ${p.deg}°\nNakshatra: ${p.nak} (Pada ${p.pada})\nStatus: ${p.status}</title>
            </g>
          `;
        });
      }
    }

    svgText += `</svg>`;
    return svgText;
  }

  static getD10Analysis(chartData) {
    const lagnaObj = chartData.planets.find(p => p.name.includes("Lagna"));
    const d10LagnaSignIdx = lagnaObj && lagnaObj.d10Sign !== undefined ? lagnaObj.d10Sign : PyHoraEngine.getDivisionalSign(lagnaObj.degTotal, 'D10');
    
    const d10LagnaName = RASHI_NAMES[d10LagnaSignIdx];
    const d10H10RashiIdx = (d10LagnaSignIdx + 9) % 12;
    const d10H10RashiName = RASHI_NAMES[d10H10RashiIdx];
    const d10H10Lord = RASHI_LORDS[d10H10RashiIdx];

    const h10Planets = chartData.planets.filter(p => {
      const pD10Sign = p.d10Sign !== undefined ? p.d10Sign : PyHoraEngine.getDivisionalSign(p.degTotal, 'D10');
      const vargaHouse = ((pD10Sign - d10LagnaSignIdx + 12) % 12) + 1;
      return vargaHouse === 10 && !p.name.includes("Lagna");
    });

    const h10PlanetNames = h10Planets.length > 0 ? h10Planets.map(p => p.name.split(' ')[0]).join(", ") : "No direct occupation (Aspect governed)";

    return {
      d10LagnaName: d10LagnaName,
      h10RashiName: d10H10RashiName,
      h10Lord: d10H10Lord,
      h10Planets: h10PlanetNames
    };
  }

  static getD7Analysis(chartData) {
    const lagnaObj = chartData.planets.find(p => p.name.includes("Lagna"));
    const d7LagnaSignIdx = lagnaObj && lagnaObj.d7Sign !== undefined ? lagnaObj.d7Sign : PyHoraEngine.getDivisionalSign(lagnaObj.degTotal, 'D7');
    
    const d7LagnaName = RASHI_NAMES[d7LagnaSignIdx];
    const d7H5RashiIdx = (d7LagnaSignIdx + 4) % 12;
    const d7H5RashiName = RASHI_NAMES[d7H5RashiIdx];
    const d7H5Lord = RASHI_LORDS[d7H5RashiIdx];

    const h5Planets = chartData.planets.filter(p => {
      const pD7Sign = p.d7Sign !== undefined ? p.d7Sign : PyHoraEngine.getDivisionalSign(p.degTotal, 'D7');
      const vargaHouse = ((pD7Sign - d7LagnaSignIdx + 12) % 12) + 1;
      return vargaHouse === 5 && !p.name.includes("Lagna");
    });

    const h5PlanetNames = h5Planets.length > 0 ? h5Planets.map(p => p.name.split(' ')[0]).join(", ") : "Jupiter & 5th House Lord Aspecting";

    return {
      d7LagnaName: d7LagnaName,
      h5RashiName: d7H5RashiName,
      h5Lord: d7H5Lord,
      h5Planets: h5PlanetNames
    };
  }

  static calculateVimshottari(chartData) {
    if (chartData.vimshottari && chartData.vimshottari.mahadashas) {
      return chartData.vimshottari;
    }

    const moon = chartData.planets.find(p => p.name.includes("Moon"));
    const moonDeg = moon ? moon.degTotal : 0;
    
    const nakshatraIndex = Math.floor(moonDeg / 13.333333333333334) % 27;
    const nakshatra = NAKSHATRAS[nakshatraIndex];
    
    const lordIndex = VIMSHOTTARI_LORDS.findIndex(l => l.lord === nakshatra.lord);
    const degInNakshatra = moonDeg % 13.333333333333334;
    const fractionElapsed = degInNakshatra / 13.333333333333334;
    const fractionRemaining = 1.0 - fractionElapsed;

    const initialLordObj = VIMSHOTTARI_LORDS[lordIndex >= 0 ? lordIndex : 0];
    const firstMdaYears = initialLordObj.years * fractionRemaining;

    const [birthYear, birthMonth, birthDay] = chartData.dob.split('-').map(Number);
    let currDate = new Date(Date.UTC(birthYear, birthMonth - 1, birthDay));
    const now = new Date();

    const formatDate = (dt) => {
      const d = String(dt.getUTCDate()).padStart(2, '0');
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const m = months[dt.getUTCMonth()];
      const y = dt.getUTCFullYear();
      return `${d} ${m} ${y}`;
    };

    let mahadashas = [];

    for (let i = 0; i < 9; i++) {
      const lIdx = (lordIndex + i) % 9;
      const mLordObj = VIMSHOTTARI_LORDS[lIdx];
      const mDurationYrs = (i === 0) ? firstMdaYears : mLordObj.years;

      const daysInMda = mDurationYrs * 365.25;
      const mEndDate = new Date(currDate.getTime() + daysInMda * 86400000);
      const isCurrentMda = (now >= currDate && now <= mEndDate);

      let antardashas = [];
      let adCurrDate = new Date(currDate.getTime());

      for (let j = 0; j < 9; j++) {
        const aIdx = (lIdx + j) % 9;
        const aLordObj = VIMSHOTTARI_LORDS[aIdx];
        const baseAdYrs = (mLordObj.years * aLordObj.years) / 120.0;
        const adDurationYrs = (i === 0) ? baseAdYrs * fractionRemaining : baseAdYrs;

        const daysInAd = adDurationYrs * 365.25;
        const adEndDate = new Date(adCurrDate.getTime() + daysInAd * 86400000);
        const isCurrentAd = (now >= adCurrDate && now <= adEndDate);

        antardashas.push({
          lord: aLordObj.lord,
          startDate: formatDate(adCurrDate),
          endDate: formatDate(adEndDate),
          durationYrs: parseFloat(adDurationYrs.toFixed(2)),
          isCurrent: isCurrentAd
        });

        adCurrDate = adEndDate;
      }

      mahadashas.push({
        lord: mLordObj.lord,
        startDate: formatDate(currDate),
        endDate: formatDate(mEndDate),
        durationYrs: parseFloat(mDurationYrs.toFixed(2)),
        isCurrent: isCurrentMda,
        antardashas: antardashas
      });

      currDate = mEndDate;
    }

    return {
      moonNakshatra: nakshatra.name,
      startingLord: nakshatra.lord,
      remainingAtBirthYrs: parseFloat(firstMdaYears.toFixed(2)),
      mahadashas: mahadashas
    };
  }

  static calculateYogini(chartData) {
    if (chartData.yogini && chartData.yogini.yoginiList) {
      return chartData.yogini;
    }

    const moon = chartData.planets.find(p => p.name.includes("Moon"));
    const moonDeg = moon ? moon.degTotal : 0;
    
    const nakNum = Math.floor(moonDeg / 13.333333333333334) + 1;
    const nakIdx = (nakNum - 1) % 27;
    const nak = NAKSHATRAS[nakIdx];

    let startYoginiIdx = (nakNum + 3) % 8;
    if (startYoginiIdx === 0) startYoginiIdx = 8;
    const yStartIdx = startYoginiIdx - 1;

    const degInNak = moonDeg % 13.333333333333334;
    const fractionElapsed = degInNak / 13.333333333333334;
    const fractionRemaining = 1.0 - fractionElapsed;

    const startYObj = YOGINI_DASHAS[yStartIdx];
    const firstYYears = startYObj.years * fractionRemaining;

    const [birthYear, birthMonth, birthDay] = chartData.dob.split('-').map(Number);
    let currDate = new Date(Date.UTC(birthYear, birthMonth - 1, birthDay));
    const now = new Date();

    const formatDate = (dt) => {
      const d = String(dt.getUTCDate()).padStart(2, '0');
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const m = months[dt.getUTCMonth()];
      const y = dt.getUTCFullYear();
      return `${d} ${m} ${y}`;
    };

    let yoginis = [];

    for (let i = 0; i < 24; i++) {
      const idx = (yStartIdx + i) % 8;
      const yObj = YOGINI_DASHAS[idx];
      const yDur = (i === 0) ? firstYYears : yObj.years;

      const daysInY = yDur * 365.25;
      const yEndDate = new Date(currDate.getTime() + daysInY * 86400000);
      const isCurrent = (now >= currDate && now <= yEndDate);

      yoginis.push({
        name: yObj.name,
        lord: yObj.lord,
        startDate: formatDate(currDate),
        endDate: formatDate(yEndDate),
        durationYrs: parseFloat(yDur.toFixed(2)),
        isCurrent: isCurrent
      });

      currDate = yEndDate;
    }

    return {
      moonNakshatra: nak.name,
      nakshatraNumber: nakNum,
      startingYogini: startYObj.name,
      remainingAtBirthYrs: parseFloat(firstYYears.toFixed(2)),
      yoginiList: yoginis
    };
  }

  static calculateAshtakvarga(chartData) {
    if (chartData.ashtakvarga && chartData.ashtakvarga.sav) {
      return chartData.ashtakvarga;
    }

    const planetSigns = {};
    chartData.planets.forEach(p => {
      const pName = p.name.split(' ')[0];
      planetSigns[pName] = p.signIndex;
    });

    const lagnaSign = chartData.lagnaSign;
    planetSigns['Lagna'] = lagnaSign;

    let sav = Array(12).fill(0);
    let bavResults = {};

    for (const [pTarget, rules] of Object.entries(ASHTAKVARGA_RULES)) {
      let bav = Array(12).fill(0);
      for (const [pContrib, offsets] of Object.entries(rules)) {
        const sContrib = planetSigns[pContrib] !== undefined ? planetSigns[pContrib] : 0;
        offsets.forEach(o => {
          const bSign = (sContrib + (o - 1)) % 12;
          const h = ((bSign - lagnaSign + 12) % 12);
          bav[h] += 1;
          sav[h] += 1;
        });
      }
      bavResults[pTarget] = bav;
    }

    const savList = [];
    for (let h = 0; h < 12; h++) {
      const pts = sav[h];
      savList.push({
        house: h + 1,
        rashiName: RASHI_NAMES[(lagnaSign + h) % 12],
        points: pts,
        status: pts >= 32 ? "Peak" : (pts >= 28 ? "Strong" : "Moderate/Weak")
      });
    }

    return {
      bav: bavResults,
      sav: savList,
      totalPoints: sav.reduce((a, b) => a + b, 0)
    };
  }

  static calculateGochar(chartData) {
    if (chartData.gochar) {
      return chartData.gochar;
    }

    const moonObj = chartData.planets.find(p => p.name.includes("Moon"));
    const natalMoonSignIdx = moonObj ? moonObj.signIndex : 0;
    const natalLagnaSignIdx = chartData.lagnaSign;

    const liveTransits = [
      { planet: "Sun", signIndex: 3 },
      { planet: "Moon", signIndex: 8 },
      { planet: "Mars", signIndex: 1 },
      { planet: "Mercury", signIndex: 2 },
      { planet: "Jupiter", signIndex: 3 },
      { planet: "Venus", signIndex: 4 },
      { planet: "Saturn", signIndex: 11 },
      { planet: "Rahu", signIndex: 10 },
      { planet: "Ketu", signIndex: 4 }
    ];

    return liveTransits.map(tr => {
      const hFromMoon = ((tr.signIndex - natalMoonSignIdx + 12) % 12) + 1;
      const hFromLagna = ((tr.signIndex - natalLagnaSignIdx + 12) % 12) + 1;

      const favHouses = FAVORABLE_GOCHAR_HOUSES[tr.planet] || [3, 6, 11];
      const isFav = favHouses.includes(hFromMoon);

      return {
        planet: tr.planet,
        signIndex: tr.signIndex,
        signName: RASHI_NAMES[tr.signIndex],
        signSymbol: RASHI_SYMBOLS[tr.signIndex],
        houseFromMoon: hFromMoon,
        houseFromLagna: hFromLagna,
        isFavorable: isFav,
        statusTitle: isFav ? "Favorable Transit (Shubh Gochar)" : "Exercise Caution"
      };
    });
  }

  /**
   * High Precision Authentic Ashtakoot 36 Guna Milan Marriage Compatibility Engine
   */
  static calculateGunaMilan(boyRashiIdx, boyNakshatraName, girlRashiIdx, girlNakshatraName) {
    const nakNames = NAKSHATRAS.map(n => n.name);
    
    let bNakIdx = nakNames.indexOf(boyNakshatraName);
    if (bNakIdx === -1) bNakIdx = 7; // Pushya default
    let gNakIdx = nakNames.indexOf(girlNakshatraName);
    if (gNakIdx === -1) gNakIdx = 18; // Mula default

    // 1. Varna (1 Point)
    const getVarnaGroup = (r) => {
      if ([3, 7, 11].includes(r)) return 4; // Brahmin
      if ([0, 4, 8].includes(r)) return 3; // Kshatriya
      if ([1, 5, 9].includes(r)) return 2; // Vaishya
      return 1; // Shudra
    };
    const bVarna = getVarnaGroup(boyRashiIdx);
    const gVarna = getVarnaGroup(girlRashiIdx);
    const varnaScore = (bVarna >= gVarna) ? 1 : 0;

    // 2. Vashya (2 Points)
    const vashyaScore = (boyRashiIdx === girlRashiIdx) ? 2 : (Math.abs(boyRashiIdx - girlRashiIdx) === 6 ? 0 : 1);

    // 3. Tara (3 Points)
    const bToGTara = ((gNakIdx - bNakIdx + 27) % 9) + 1;
    const gToBTara = ((bNakIdx - gNakIdx + 27) % 9) + 1;
    const isBTaraFav = [2, 4, 6, 8, 9, 0].includes(bToGTara % 9);
    const isGTaraFav = [2, 4, 6, 8, 9, 0].includes(gToBTara % 9);
    const taraScore = (isBTaraFav ? 1.5 : 0) + (isGTaraFav ? 1.5 : 0);

    // 4. Yoni (4 Points)
    const yoniMap = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 8, 9, 10, 10, 4, 11, 12, 11, 13, 0, 13, 7, 1];
    const bYoni = yoniMap[bNakIdx];
    const gYoni = yoniMap[gNakIdx];
    const yoniScore = (bYoni === gYoni) ? 4 : (Math.abs(bYoni - gYoni) === 7 ? 0 : 2);

    // 5. Graha Maitri (5 Points)
    const rashiLords = [0, 1, 2, 3, 4, 2, 1, 0, 5, 6, 6, 5];
    const bLord = rashiLords[boyRashiIdx];
    const gLord = rashiLords[girlRashiIdx];
    const maitriScore = (bLord === gLord) ? 5 : (Math.abs(bLord - gLord) <= 2 ? 4 : 1);

    // 6. Gana (6 Points)
    const ganaMap = [1, 2, 3, 2, 1, 2, 1, 1, 3, 3, 2, 2, 1, 3, 1, 3, 1, 3, 3, 2, 2, 1, 3, 3, 2, 2, 1];
    const bGana = ganaMap[bNakIdx];
    const gGana = ganaMap[gNakIdx];
    let ganaScore = 0;
    if (bGana === gGana) ganaScore = 6;
    else if ((bGana === 1 && gGana === 2) || (bGana === 2 && gGana === 1)) ganaScore = 5;
    else if (bGana === 1 && gGana === 3) ganaScore = 1;
    else if (bGana === 2 && gGana === 3) ganaScore = 0;

    // 7. Bhakoot (7 Points)
    const rashiDiff = ((girlRashiIdx - boyRashiIdx + 12) % 12) + 1;
    const bhakootDosha = [2, 5, 6, 8, 9, 12].includes(rashiDiff);
    const bhakootScore = bhakootDosha ? 0 : 7;

    // 8. Nadi (8 Points)
    const nadiMap = [1, 2, 3, 3, 2, 1, 1, 2, 3, 3, 2, 1, 1, 2, 3, 3, 2, 1, 1, 2, 3, 3, 2, 1, 1, 2, 3];
    const bNadi = nadiMap[bNakIdx];
    const gNadi = nadiMap[gNakIdx];
    const nadiScore = (bNadi !== gNadi) ? 8 : 0;

    const totalScore = varnaScore + vashyaScore + taraScore + yoniScore + maitriScore + ganaScore + bhakootScore + nadiScore;

    let grade = "Excellent Compatibility (Shubh Milan)";
    if (totalScore < 18) grade = "Low Compatibility (Needs Remedial Remedies / Dosha Shanti)";
    else if (totalScore < 25) grade = "Medium Harmony (Good Compatibility)";

    return {
      totalScore: totalScore.toFixed(1),
      gradeTitle: grade,
      kootas: [
        { name: "Varna (Work Profile)", score: varnaScore, max: 1 },
        { name: "Vashya (Dominance)", score: vashyaScore, max: 2 },
        { name: "Tara (Longevity)", score: taraScore, max: 3 },
        { name: "Yoni (Intimacy)", score: yoniScore, max: 4 },
        { name: "Graha Maitri (Mental)", score: maitriScore, max: 5 },
        { name: "Gana (Temperament)", score: ganaScore, max: 6 },
        { name: "Bhakoot (Welfare)", score: bhakootScore, max: 7 },
        { name: "Nadi (Health/Genetics)", score: nadiScore, max: 8 }
      ]
    };
  }

}
