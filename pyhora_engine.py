# High Precision PyHora Astronomical Engine & Parashari Varga Charts & Vimshottari / Yogini / Ashtakvarga / Live Gochar / 36 Guna Milan Engines
import ephem
import math
import datetime
import json

# 27 Nakshatras with Lords & Degrees
NAKSHATRAS = [
    {"name": "Ashwini", "lord": "Ketu", "rashi": 0},
    {"name": "Bharani", "lord": "Venus", "rashi": 0},
    {"name": "Krittika", "lord": "Sun", "rashi": 0},
    {"name": "Rohini", "lord": "Moon", "rashi": 1},
    {"name": "Mrigashira", "lord": "Mars", "rashi": 1},
    {"name": "Arudra", "lord": "Rahu", "rashi": 2},
    {"name": "Punarvasu", "lord": "Jupiter", "rashi": 2},
    {"name": "Pushya", "lord": "Saturn", "rashi": 3},
    {"name": "Ashlesha", "lord": "Mercury", "rashi": 3},
    {"name": "Magha", "lord": "Ketu", "rashi": 4},
    {"name": "Purva Phalguni", "lord": "Venus", "rashi": 4},
    {"name": "Uttara Phalguni", "lord": "Sun", "rashi": 4},
    {"name": "Hastha", "lord": "Moon", "rashi": 5},
    {"name": "Chitra", "lord": "Mars", "rashi": 5},
    {"name": "Swati", "lord": "Rahu", "rashi": 6},
    {"name": "Vishakha", "lord": "Jupiter", "rashi": 6},
    {"name": "Anuradha", "lord": "Saturn", "rashi": 7},
    {"name": "Jyeshtha", "lord": "Mercury", "rashi": 7},
    {"name": "Mula", "lord": "Ketu", "rashi": 8},
    {"name": "Purva Ashadha", "lord": "Venus", "rashi": 8},
    {"name": "Uttara Ashadha", "lord": "Sun", "rashi": 8},
    {"name": "Shravana", "lord": "Moon", "rashi": 9},
    {"name": "Dhanishta", "lord": "Mars", "rashi": 9},
    {"name": "Shatabhisha", "lord": "Rahu", "rashi": 10},
    {"name": "Purva Bhadrapada", "lord": "Jupiter", "rashi": 10},
    {"name": "Uttara Bhadrapada", "lord": "Saturn", "rashi": 11},
    {"name": "Revati", "lord": "Mercury", "rashi": 11}
]

RASHI_NAMES = [
    "Mesha (Aries)", "Vrishabha (Taurus)", "Mithuna (Gemini)", "Karka (Cancer)",
    "Simha (Leo)", "Kanya (Virgo)", "Tula (Libra)", "Vrishchika (Scorpio)",
    "Dhanu (Sagittarius)", "Makara (Capricorn)", "Kumbha (Aquarius)", "Meena (Pisces)"
]

RASHI_SYMBOLS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"]

VIMSHOTTARI_LORDS = [
    {"lord": "Ketu", "years": 7},
    {"lord": "Venus", "years": 20},
    {"lord": "Sun", "years": 6},
    {"lord": "Moon", "years": 10},
    {"lord": "Mars", "years": 7},
    {"lord": "Rahu", "years": 18},
    {"lord": "Jupiter", "years": 16},
    {"lord": "Saturn", "years": 19},
    {"lord": "Mercury", "years": 17}
]

YOGINI_DASHAS = [
    {"name": "Mangala", "lord": "Moon", "years": 1},
    {"name": "Pingala", "lord": "Sun", "years": 2},
    {"name": "Dhanya", "lord": "Jupiter", "years": 3},
    {"name": "Bhramari", "lord": "Mars", "years": 4},
    {"name": "Bhadrika", "lord": "Mercury", "years": 5},
    {"name": "Ulka", "lord": "Saturn", "years": 6},
    {"name": "Siddha", "lord": "Venus", "years": 7},
    {"name": "Sankata", "lord": "Rahu", "years": 8}
]

ASHTAKVARGA_RULES = {
    "Sun": {
        "Sun": [1, 2, 4, 7, 8, 9, 10, 11], "Moon": [3, 6, 10, 11], "Mars": [1, 2, 4, 7, 8, 9, 10, 11],
        "Mercury": [3, 5, 6, 9, 10, 11, 12], "Jupiter": [5, 6, 9, 11], "Venus": [6, 7, 12],
        "Saturn": [1, 2, 4, 7, 8, 9, 10, 11], "Lagna": [3, 4, 6, 10, 11, 12]
    },
    "Moon": {
        "Sun": [3, 6, 7, 8, 10, 11], "Moon": [1, 3, 6, 7, 10, 11], "Mars": [2, 3, 5, 6, 9, 10, 11],
        "Mercury": [1, 3, 4, 5, 7, 8, 10, 11], "Jupiter": [1, 4, 7, 8, 10, 11, 12], "Venus": [3, 4, 5, 7, 9, 10, 11],
        "Saturn": [3, 5, 6, 11], "Lagna": [3, 6, 10, 11]
    },
    "Mars": {
        "Sun": [3, 5, 6, 10, 11], "Moon": [3, 6, 11], "Mars": [1, 2, 4, 7, 8, 10, 11],
        "Mercury": [3, 5, 6, 11], "Jupiter": [6, 10, 11, 12], "Venus": [6, 8, 11, 12],
        "Saturn": [1, 4, 7, 8, 9, 10, 11], "Lagna": [1, 3, 6, 10, 11]
    },
    "Mercury": {
        "Sun": [5, 6, 9, 11, 12], "Moon": [2, 4, 6, 8, 10, 11], "Mars": [1, 2, 4, 7, 8, 9, 10, 11],
        "Mercury": [1, 3, 5, 6, 9, 10, 11, 12], "Jupiter": [6, 8, 11, 12], "Venus": [1, 2, 3, 4, 5, 8, 9, 11],
        "Saturn": [1, 2, 4, 7, 8, 9, 10, 11], "Lagna": [1, 2, 4, 6, 8, 10, 11]
    },
    "Jupiter": {
        "Sun": [1, 2, 3, 4, 7, 8, 9, 10, 11], "Moon": [2, 5, 7, 9, 11], "Mars": [1, 2, 4, 7, 8, 10, 11],
        "Mercury": [1, 2, 4, 5, 6, 9, 10, 11], "Jupiter": [1, 2, 3, 4, 7, 8, 10, 11], "Venus": [2, 5, 6, 9, 10, 11],
        "Saturn": [3, 5, 6, 12], "Lagna": [1, 2, 4, 5, 6, 7, 9, 10, 11]
    },
    "Venus": {
        "Sun": [8, 11, 12], "Moon": [1, 2, 3, 4, 5, 8, 9, 11, 12], "Mars": [3, 5, 6, 9, 11, 12],
        "Mercury": [3, 5, 6, 9, 11], "Jupiter": [5, 8, 9, 10, 11], "Venus": [1, 2, 3, 4, 5, 8, 9, 10, 11],
        "Saturn": [3, 4, 5, 8, 9, 10, 11], "Lagna": [1, 2, 3, 4, 5, 8, 9, 11]
    },
    "Saturn": {
        "Sun": [1, 2, 4, 7, 8, 10, 11], "Moon": [3, 6, 11], "Mars": [3, 5, 6, 10, 11, 12],
        "Mercury": [6, 8, 9, 10, 11, 12], "Jupiter": [5, 6, 11, 12], "Venus": [6, 11, 12],
        "Saturn": [3, 5, 6, 11], "Lagna": [1, 3, 4, 6, 10, 11]
    }
}

FAVORABLE_GOCHAR_HOUSES = {
    "Sun": [3, 6, 10, 11],
    "Moon": [1, 3, 6, 7, 10, 11],
    "Mars": [3, 6, 11],
    "Mercury": [2, 4, 6, 8, 10, 11],
    "Jupiter": [2, 5, 7, 9, 11],
    "Venus": [1, 2, 3, 4, 5, 8, 9, 11, 12],
    "Saturn": [3, 6, 11],
    "Rahu": [3, 6, 11],
    "Ketu": [3, 6, 11]
}

def calculate_lahiri_ayanamsha_spica(obs):
    spica = ephem.star('Spica')
    spica.compute(obs)
    spica_ecl = ephem.Ecliptic(spica)
    spica_lon = math.degrees(spica_ecl.lon)
    ayanamsha = (spica_lon - 180.0 + 360.0) % 360.0
    return ayanamsha

def calculate_ascendant(obs, lat, lon, ayanamsha):
    lst_rad = float(obs.sidereal_time())
    eps = math.radians(23.4392911)
    phi = math.radians(lat)
    
    num = math.cos(lst_rad)
    den = -math.sin(lst_rad) * math.cos(eps) - math.tan(phi) * math.sin(eps)
    
    asc_rad = math.atan2(num, den)
    asc_deg = math.degrees(asc_rad) % 360.0
    
    sidereal_lagna = (asc_deg - ayanamsha + 360.0) % 360.0
    return sidereal_lagna

def get_divisional_sign(deg_total, chart_type='D1'):
    deg = (deg_total % 360.0 + 360.0) % 360.0
    s = int(deg // 30)
    d = deg % 30.0

    if chart_type == 'D9':
        return int(deg // (30.0 / 9.0)) % 12
    elif chart_type == 'D10':
        part = int(d // 3.0)
        is_odd = (s % 2 == 0)
        start_sign = s if is_odd else (s + 8) % 12
        return (start_sign + part) % 12
    elif chart_type == 'D7':
        part = int(d // (30.0 / 7.0))
        is_odd = (s % 2 == 0)
        start_sign = s if is_odd else (s + 6) % 12
        return (start_sign + part) % 12

    return s

def calculate_ashtakvarga_full(planets_data):
    planet_signs = {}
    for p in planets_data:
        p_name = p['name'].split(' ')[0]
        planet_signs[p_name] = p['signIndex']

    sav = [0] * 12
    bav_results = {}

    for p_target, rules in ASHTAKVARGA_RULES.items():
        bav = [0] * 12
        for p_contrib, offsets in rules.items():
            s_contrib = planet_signs[p_contrib]
            for o in offsets:
                b_sign = (s_contrib + (o - 1)) % 12
                h = ((b_sign - planet_signs['Lagna'] + 12) % 12)
                bav[h] += 1
                sav[h] += 1
        bav_results[p_target] = bav

    sav_list = []
    for h in range(12):
        pts = sav[h]
        sav_list.append({
            "house": h + 1,
            "rashiName": RASHI_NAMES[(planet_signs['Lagna'] + h) % 12],
            "points": pts,
            "status": "Peak" if pts >= 32 else ("Strong" if pts >= 28 else "Moderate/Weak")
        })

    return {
        "bav": bav_results,
        "sav": sav_list,
        "totalPoints": sum(sav)
    }

def calculate_gochar_live(natal_moon_sign_idx, natal_lagna_sign_idx):
    now = datetime.datetime.now()
    obs = ephem.Observer()
    obs.date = now.strftime('%Y/%m/%d %H:%M:%S')
    ayanamsha = calculate_lahiri_ayanamsha_spica(obs)

    bodies = [
        ("Sun", ephem.Sun()),
        ("Moon", ephem.Moon()),
        ("Mars", ephem.Mars()),
        ("Mercury", ephem.Mercury()),
        ("Jupiter", ephem.Jupiter()),
        ("Venus", ephem.Venus()),
        ("Saturn", ephem.Saturn())
    ]

    transit_results = []

    for p_name, body in bodies:
        body.compute(obs)
        trop_deg = math.degrees(ephem.Ecliptic(body).lon) % 360.0
        sid_deg = (trop_deg - ayanamsha + 360.0) % 360.0
        sign_idx = int(sid_deg // 30)

        h_from_moon = ((sign_idx - natal_moon_sign_idx + 12) % 12) + 1
        h_from_lagna = ((sign_idx - natal_lagna_sign_idx + 12) % 12) + 1

        fav_houses = FAVORABLE_GOCHAR_HOUSES.get(p_name, [3, 6, 11])
        is_favorable = h_from_moon in fav_houses

        transit_results.append({
            "planet": p_name,
            "signIndex": sign_idx,
            "signName": RASHI_NAMES[sign_idx],
            "signSymbol": RASHI_SYMBOLS[sign_idx],
            "houseFromMoon": h_from_moon,
            "houseFromLagna": h_from_lagna,
            "isFavorable": is_favorable,
            "statusTitle": "Favorable Transit (Shubh Gochar)" if is_favorable else ("Neutral Transit" if h_from_moon in [1, 2, 4, 5, 7, 9, 10] else "Exercise Caution")
        })

    jd = ephem.julian_date(obs)
    T = (jd - 2451545.0) / 36525.0
    omega_trop = (125.044547 - 1934.136261 * T + 0.002075 * T**2) % 360.0
    rahu_sid = (omega_trop - ayanamsha + 360.0) % 360.0
    ketu_sid = (rahu_sid + 180.0) % 360.0

    for n_name, n_deg in [("Rahu", rahu_sid), ("Ketu", ketu_sid)]:
        s_idx = int(n_deg // 30)
        h_from_moon = ((s_idx - natal_moon_sign_idx + 12) % 12) + 1
        h_from_lagna = ((s_idx - natal_lagna_sign_idx + 12) % 12) + 1
        fav_houses = FAVORABLE_GOCHAR_HOUSES.get(n_name, [3, 6, 11])
        is_fav = h_from_moon in fav_houses

        transit_results.append({
            "planet": n_name,
            "signIndex": s_idx,
            "signName": RASHI_NAMES[s_idx],
            "signSymbol": RASHI_SYMBOLS[s_idx],
            "houseFromMoon": h_from_moon,
            "houseFromLagna": h_from_lagna,
            "isFavorable": is_fav,
            "statusTitle": "Favorable Transit (Shubh Gochar)" if is_fav else "Exercise Caution"
        })

    return transit_results

def calculate_guna_milan_full(boy_rashi_idx, boy_nak_name, girl_rashi_idx, girl_nak_name):
    """
    Authentic Ashtakoot 36 Guna Milan Engine
    """
    nak_names = [n['name'] for n in NAKSHATRAS]
    b_nak_idx = nak_names.index(boy_nak_name) if boy_nak_name in nak_names else 7
    g_nak_idx = nak_names.index(girl_nak_name) if girl_nak_name in nak_names else 18

    # 1. Varna (1 Pt)
    def get_varna(r):
        if r in [3, 7, 11]: return 4 # Brahmin
        if r in [0, 4, 8]: return 3  # Kshatriya
        if r in [1, 5, 9]: return 2  # Vaishya
        return 1                    # Shudra
    varna_score = 1 if get_varna(boy_rashi_idx) >= get_varna(girl_rashi_idx) else 0

    # 2. Vashya (2 Pts)
    vashya_score = 2 if boy_rashi_idx == girl_rashi_idx else (0 if abs(boy_rashi_idx - girl_rashi_idx) == 6 else 1)

    # 3. Tara (3 Pts)
    b_to_g = ((g_nak_idx - b_nak_idx + 27) % 9) + 1
    g_to_b = ((b_nak_idx - g_nak_idx + 27) % 9) + 1
    tara_score = (1.5 if b_to_g % 9 in [2,4,6,8,0] else 0) + (1.5 if g_to_b % 9 in [2,4,6,8,0] else 0)

    # 4. Yoni (4 Pts)
    yoni_map = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 8, 9, 10, 10, 4, 11, 12, 11, 13, 0, 13, 7, 1]
    b_yoni = yoni_map[b_nak_idx]
    g_yoni = yoni_map[g_nak_idx]
    yoni_score = 4 if b_yoni == g_yoni else (0 if abs(b_yoni - g_yoni) == 7 else 2)

    # 5. Graha Maitri (5 Pts)
    r_lords = [0, 1, 2, 3, 4, 2, 1, 0, 5, 6, 6, 5]
    b_l = r_lords[boy_rashi_idx]
    g_l = r_lords[girl_rashi_idx]
    maitri_score = 5 if b_l == g_l else (4 if abs(b_l - g_l) <= 2 else 1)

    # 6. Gana (6 Pts)
    gana_map = [1, 2, 3, 2, 1, 2, 1, 1, 3, 3, 2, 2, 1, 3, 1, 3, 1, 3, 3, 2, 2, 1, 3, 3, 2, 2, 1]
    b_g = gana_map[b_nak_idx]
    g_g = gana_map[g_nak_idx]
    gana_score = 6 if b_g == g_g else (5 if (b_g==1 and g_g==2) or (b_g==2 and g_g==1) else (1 if b_g==1 and g_g==3 else 0))

    # 7. Bhakoot (7 Pts)
    r_diff = ((girl_rashi_idx - boy_rashi_idx + 12) % 12) + 1
    bhakoot_score = 0 if r_diff in [2, 5, 6, 8, 9, 12] else 7

    # 8. Nadi (8 Pts)
    nadi_map = [1, 2, 3, 3, 2, 1, 1, 2, 3, 3, 2, 1, 1, 2, 3, 3, 2, 1, 1, 2, 3, 3, 2, 1, 1, 2, 3]
    nadi_score = 8 if nadi_map[b_nak_idx] != nadi_map[g_nak_idx] else 0

    total = varna_score + vashya_score + tara_score + yoni_score + maitri_score + gana_score + bhakoot_score + nadi_score

    grade = "Excellent Compatibility (Shubh Milan)"
    if total < 18: grade = "Low Compatibility (Needs Remedial Remedies / Dosha Shanti)"
    elif total < 25: grade = "Medium Harmony (Good Compatibility)"

    return {
        "totalScore": round(total, 1),
        "gradeTitle": grade,
        "kootas": [
            {"name": "Varna (Work Profile)", "score": varna_score, "max": 1},
            {"name": "Vashya (Dominance)", "score": vashya_score, "max": 2},
            {"name": "Tara (Longevity)", "score": tara_score, "max": 3},
            {"name": "Yoni (Intimacy)", "score": yoni_score, "max": 4},
            {"name": "Graha Maitri (Mental)", "score": maitri_score, "max": 5},
            {"name": "Gana (Temperament)", "score": gana_score, "max": 6},
            {"name": "Bhakoot (Welfare)", "score": bhakoot_score, "max": 7},
            {"name": "Nadi (Health/Genetics)", "score": nadi_score, "max": 8}
        ]
    }

def calculate_vimshottari_full(moon_deg, dob_str):
    year, month, day = map(int, dob_str.split('-'))
    dob = datetime.datetime(year, month, day)
    now = datetime.datetime.now()

    nak_idx = int(moon_deg // 13.333333333333334) % 27
    nak = NAKSHATRAS[nak_idx]

    lord_idx = [l['lord'] for l in VIMSHOTTARI_LORDS].index(nak['lord'])

    deg_in_nak = moon_deg % 13.333333333333334
    frac_elapsed = deg_in_nak / 13.333333333333334
    frac_remaining = 1.0 - frac_elapsed

    start_lord_obj = VIMSHOTTARI_LORDS[lord_idx]
    first_mda_years = start_lord_obj['years'] * frac_remaining

    mahadashas = []
    curr_date = dob

    for i in range(9):
        l_idx = (lord_idx + i) % 9
        m_lord_obj = VIMSHOTTARI_LORDS[l_idx]
        m_duration_yrs = first_mda_years if i == 0 else float(m_lord_obj['years'])

        days_in_mda = m_duration_yrs * 365.25
        m_end_date = curr_date + datetime.timedelta(days=days_in_mda)
        is_current_mda = (curr_date <= now <= m_end_date)

        antardashas = []
        ad_curr_date = curr_date

        for j in range(9):
            a_idx = (l_idx + j) % 9
            a_lord_obj = VIMSHOTTARI_LORDS[a_idx]

            base_ad_yrs = (m_lord_obj['years'] * a_lord_obj['years']) / 120.0
            ad_duration_yrs = base_ad_yrs * frac_remaining if i == 0 else base_ad_yrs

            days_in_ad = ad_duration_yrs * 365.25
            ad_end_date = ad_curr_date + datetime.timedelta(days=days_in_ad)
            is_current_ad = (ad_curr_date <= now <= ad_end_date)

            antardashas.append({
                "lord": a_lord_obj['lord'],
                "startDate": ad_curr_date.strftime("%d %b %Y"),
                "endDate": ad_end_date.strftime("%d %b %Y"),
                "durationYrs": round(ad_duration_yrs, 2),
                "isCurrent": is_current_ad
            })

            ad_curr_date = ad_end_date

        mahadashas.append({
            "lord": m_lord_obj['lord'],
            "startDate": curr_date.strftime("%d %b %Y"),
            "endDate": m_end_date.strftime("%d %b %Y"),
            "durationYrs": round(m_duration_yrs, 2),
            "isCurrent": is_current_mda,
            "antardashas": antardashas
        })

        curr_date = m_end_date

    return {
        "moonNakshatra": nak['name'],
        "startingLord": nak['lord'],
        "remainingAtBirthYrs": round(first_mda_years, 2),
        "mahadashas": mahadashas
    }

def calculate_yogini_full(moon_deg, dob_str):
    year, month, day = map(int, dob_str.split('-'))
    dob = datetime.datetime(year, month, day)
    now = datetime.datetime.now()

    nak_num = int(moon_deg // 13.333333333333334) + 1
    nak_idx = (nak_num - 1) % 27
    nak = NAKSHATRAS[nak_idx]

    start_yogini_idx = (nak_num + 3) % 8
    if start_yogini_idx == 0:
        start_yogini_idx = 8
    y_start_idx = start_yogini_idx - 1

    deg_in_nak = moon_deg % 13.333333333333334
    frac_elapsed = deg_in_nak / 13.333333333333334
    frac_remaining = 1.0 - frac_elapsed

    start_y_obj = YOGINI_DASHAS[y_start_idx]
    first_y_years = start_y_obj['years'] * frac_remaining

    yoginis = []
    curr_date = dob

    for i in range(24):
        idx = (y_start_idx + i) % 8
        y_obj = YOGINI_DASHAS[idx]
        y_dur = first_y_years if i == 0 else float(y_obj['years'])

        days_in_y = y_dur * 365.25
        y_end_date = curr_date + datetime.timedelta(days=days_in_y)
        is_current = (curr_date <= now <= y_end_date)

        yoginis.append({
            "name": y_obj['name'],
            "lord": y_obj['lord'],
            "startDate": curr_date.strftime("%d %b %Y"),
            "endDate": y_end_date.strftime("%d %b %Y"),
            "durationYrs": round(y_dur, 2),
            "isCurrent": is_current
        })

        curr_date = y_end_date

    return {
        "moonNakshatra": nak['name'],
        "nakshatraNumber": nak_num,
        "startingYogini": start_y_obj['name'],
        "remainingAtBirthYrs": round(first_y_years, 2),
        "yoginiList": yoginis
    }

def calculate_kundli(dob_str, tob_str, lat, lon, tz_offset=5.5, ayanamsha_type="lahiri"):
    year, month, day = map(int, dob_str.split('-'))
    hour, minute = map(int, tob_str.split(':'))
    
    local_dt = datetime.datetime(year, month, day, hour, minute)
    utc_dt = local_dt - datetime.timedelta(hours=tz_offset)
    
    obs = ephem.Observer()
    obs.date = utc_dt.strftime('%Y/%m/%d %H:%M:%S')
    obs.lat = str(lat)
    obs.long = str(lon)
    
    ayanamsha = calculate_lahiri_ayanamsha_spica(obs)
    lagna_deg = calculate_ascendant(obs, lat, lon, ayanamsha)
    lagna_sign = int(lagna_deg // 30)
    
    bodies = [
        ("Sun (Surya)", ephem.Sun()),
        ("Moon (Chandra)", ephem.Moon()),
        ("Mars (Mangal)", ephem.Mars()),
        ("Mercury (Budh)", ephem.Mercury()),
        ("Jupiter (Guru)", ephem.Jupiter()),
        ("Venus (Shukra)", ephem.Venus()),
        ("Saturn (Shani)", ephem.Saturn())
    ]
    
    planets_data = []
    
    lagna_nak = NAKSHATRAS[int(lagna_deg // 13.333333) % 27]
    lagna_pada = int((lagna_deg % 13.333333) // 3.333333) + 1
    
    planets_data.append({
        "name": "Lagna (Ascendant)",
        "degTotal": round(lagna_deg, 2),
        "signIndex": lagna_sign,
        "signName": RASHI_NAMES[lagna_sign],
        "signSymbol": RASHI_SYMBOLS[lagna_sign],
        "degInSign": round(lagna_deg % 30, 2),
        "nakshatraName": lagna_nak["name"],
        "nakshatraLord": lagna_nak["lord"],
        "pada": lagna_pada,
        "house": 1,
        "status": "Direct",
        "d9Sign": get_divisional_sign(lagna_deg, 'D9'),
        "d10Sign": get_divisional_sign(lagna_deg, 'D10'),
        "d7Sign": get_divisional_sign(lagna_deg, 'D7')
    })
    
    for name, body in bodies:
        body.compute(obs)
        ecl = ephem.Ecliptic(body)
        trop_deg = math.degrees(ecl.lon) % 360.0
        sid_deg = (trop_deg - ayanamsha + 360.0) % 360.0
        
        sign_idx = int(sid_deg // 30)
        deg_in_sign = sid_deg % 30
        
        nak_idx = int(sid_deg // 13.333333) % 27
        nak = NAKSHATRAS[nak_idx]
        pada = int((sid_deg % 13.333333) // 3.333333) + 1
        
        house = ((sign_idx - lagna_sign + 12) % 12) + 1
        
        obs_future = ephem.Observer()
        obs_future.date = (utc_dt + datetime.timedelta(hours=1)).strftime('%Y/%m/%d %H:%M:%S')
        obs_future.lat = str(lat)
        obs_future.long = str(lon)
        body.compute(obs_future)
        ecl_future = ephem.Ecliptic(body)
        trop_future = math.degrees(ecl_future.lon) % 360.0
        
        is_retrograde = (trop_future < trop_deg) if abs(trop_future - trop_deg) < 180 else (trop_future > trop_deg)
        
        planets_data.append({
            "name": name,
            "degTotal": round(sid_deg, 2),
            "signIndex": sign_idx,
            "signName": RASHI_NAMES[sign_idx],
            "signSymbol": RASHI_SYMBOLS[sign_idx],
            "degInSign": round(deg_in_sign, 2),
            "nakshatraName": nak["name"],
            "nakshatraLord": nak["lord"],
            "pada": pada,
            "house": house,
            "status": "Retrograde" if is_retrograde else "Direct",
            "d9Sign": get_divisional_sign(sid_deg, 'D9'),
            "d10Sign": get_divisional_sign(sid_deg, 'D10'),
            "d7Sign": get_divisional_sign(sid_deg, 'D7')
        })
        
    jd = ephem.julian_date(obs)
    T = (jd - 2451545.0) / 36525.0
    omega_trop = (125.044547 - 1934.136261 * T + 0.002075 * T**2) % 360.0
    rahu_sid = (omega_trop - ayanamsha + 360.0) % 360.0
    ketu_sid = (rahu_sid + 180.0) % 360.0
    
    for n_name, n_deg in [("Rahu", rahu_sid), ("Ketu", ketu_sid)]:
        s_idx = int(n_deg // 30)
        d_in_s = n_deg % 30
        n_idx = int(n_deg // 13.333333) % 27
        nak = NAKSHATRAS[n_idx]
        pada = int((n_deg % 13.333333) // 3.333333) + 1
        house = ((s_idx - lagna_sign + 12) % 12) + 1
        
        planets_data.append({
            "name": n_name,
            "degTotal": round(n_deg, 2),
            "signIndex": s_idx,
            "signName": RASHI_NAMES[s_idx],
            "signSymbol": RASHI_SYMBOLS[s_idx],
            "degInSign": round(d_in_s, 2),
            "nakshatraName": nak["name"],
            "nakshatraLord": nak["lord"],
            "pada": pada,
            "house": house,
            "status": "Retrograde",
            "d9Sign": get_divisional_sign(n_deg, 'D9'),
            "d10Sign": get_divisional_sign(n_deg, 'D10'),
            "d7Sign": get_divisional_sign(n_deg, 'D7')
        })
        
    moon_obj = next(p for p in planets_data if "Moon" in p["name"])
    vimshottari_data = calculate_vimshottari_full(moon_obj["degTotal"], dob_str)
    yogini_data = calculate_yogini_full(moon_obj["degTotal"], dob_str)
    ashtakvarga_data = calculate_ashtakvarga_full(planets_data)
    gochar_data = calculate_gochar_live(moon_obj["signIndex"], lagna_sign)

    return {
        "dob": dob_str,
        "tob": tob_str,
        "lat": lat,
        "lon": lon,
        "tz": tz_offset,
        "ayanamsha": round(ayanamsha, 4),
        "lagnaSign": lagna_sign,
        "lagnaName": RASHI_NAMES[lagna_sign],
        "planets": planets_data,
        "vimshottari": vimshottari_data,
        "yogini": yogini_data,
        "ashtakvarga": ashtakvarga_data,
        "gochar": gochar_data
    }
