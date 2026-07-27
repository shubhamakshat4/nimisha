# Vercel WSGI & Serverless Function Handler for PyHora Engine & Ephem Astronomy
import json
import urllib.parse
import sys
import os

# Add root project directory to Python path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from pyhora_engine import calculate_kundli, calculate_guna_milan_full

def app(environ, start_response):
    path = environ.get('PATH_INFO', '')
    method = environ.get('REQUEST_METHOD', 'GET')

    headers = [
        ('Content-Type', 'application/json'),
        ('Access-Control-Allow-Origin', '*'),
        ('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'),
        ('Access-Control-Allow-Headers', 'Content-Type')
    ]

    if method == 'OPTIONS':
        start_response('200 OK', headers)
        return [b'']

    if method == 'POST':
        try:
            content_length = int(environ.get('CONTENT_LENGTH', 0))
            body_bytes = environ['wsgi.input'].read(content_length) if content_length > 0 else b'{}'
            data = json.loads(body_bytes.decode('utf-8')) if body_bytes else {}

            if 'calculate-kundli' in path:
                dob = data.get('dob', '1995-08-25')
                tob = data.get('tob', '10:30')
                lat = float(data.get('lat', 28.6139))
                lon = float(data.get('lon', 77.2090))
                tz = float(data.get('tz', 5.5))
                ayanamsha = data.get('ayanamsha', 'lahiri')

                result = calculate_kundli(dob, tob, lat, lon, tz, ayanamsha)
                start_response('200 OK', headers)
                return [json.dumps(result).encode('utf-8')]

            elif 'matchmaking' in path:
                boy_n = data.get('boyNakshatra', 'Ashwini')
                girl_n = data.get('girlNakshatra', 'Bharani')

                result = calculate_guna_milan_full(boy_n, girl_n)
                start_response('200 OK', headers)
                return [json.dumps(result).encode('utf-8')]

        except Exception as e:
            start_response('500 Internal Server Error', headers)
            return [json.dumps({"error": str(e)}).encode('utf-8')]

    # GET requests
    if 'search-city' in path:
        query_string = environ.get('QUERY_STRING', '')
        params = urllib.parse.parse_qs(query_string)
        q = params.get('q', [''])[0].strip()

        results = []
        if len(q) >= 2:
            try:
                import urllib.request
                nominatim_url = f"https://nominatim.openstreetmap.org/search?q={urllib.parse.quote(q)}&format=json&limit=6"
                req = urllib.request.Request(nominatim_url, headers={'User-Agent': 'PyHoraVedicApp/2.0'})
                with urllib.request.urlopen(req, timeout=4) as resp:
                    geo_data = json.loads(resp.read().decode('utf-8'))
                    for item in geo_data:
                        display_name = item.get('display_name', '')
                        lat = float(item.get('lat', 0))
                        lon = float(item.get('lon', 0))
                        name = item.get('name', q)
                        tz = 5.5 if 'india' in display_name.lower() else round(lon / 15.0 * 2.0) / 2.0
                        results.append({
                            "city": name,
                            "display_name": display_name,
                            "lat": lat,
                            "lon": lon,
                            "tz": tz
                        })
            except Exception:
                pass

        start_response('200 OK', headers)
        return [json.dumps(results).encode('utf-8')]

    start_response('200 OK', headers)
    return [json.dumps({"status": "PyHora Ephem Engine Live on Vercel"}).encode('utf-8')]

# Export handler for Vercel WSGI / Serverless runtime compatibility
handler = app
