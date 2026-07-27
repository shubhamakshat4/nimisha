# Vercel Zero-Config Serverless Python Function for /api/calculate_kundli
import json
import sys
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from pyhora_engine import calculate_kundli

def app(environ, start_response):
    headers = [
        ('Content-Type', 'application/json'),
        ('Access-Control-Allow-Origin', '*'),
        ('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'),
        ('Access-Control-Allow-Headers', 'Content-Type')
    ]
    method = environ.get('REQUEST_METHOD', 'GET')
    if method == 'OPTIONS':
        start_response('200 OK', headers)
        return [b'']

    if method == 'POST':
        try:
            content_length = int(environ.get('CONTENT_LENGTH', 0))
            body_bytes = environ['wsgi.input'].read(content_length) if content_length > 0 else b'{}'
            data = json.loads(body_bytes.decode('utf-8')) if body_bytes else {}

            dob = data.get('dob', '1995-08-25')
            tob = data.get('tob', '10:30')
            lat = float(data.get('lat', 28.6139))
            lon = float(data.get('lon', 77.2090))
            tz = float(data.get('tz', 5.5))
            ayanamsha = data.get('ayanamsha', 'lahiri')

            result = calculate_kundli(dob, tob, lat, lon, tz, ayanamsha)
            start_response('200 OK', headers)
            return [json.dumps(result).encode('utf-8')]
        except Exception as e:
            start_response('500 Internal Server Error', headers)
            return [json.dumps({"error": str(e)}).encode('utf-8')]

    start_response('200 OK', headers)
    return [json.dumps({"status": "PyHora Ephem Engine Live"}).encode('utf-8')]

handler = app
