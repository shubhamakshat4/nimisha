# Vercel Zero-Config Serverless Python Function for /api/matchmaking
import json
import sys
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from pyhora_engine import calculate_guna_milan_full

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

            boy_n = data.get('boyNakshatra', 'Ashwini')
            girl_n = data.get('girlNakshatra', 'Bharani')

            result = calculate_guna_milan_full(boy_n, girl_n)
            start_response('200 OK', headers)
            return [json.dumps(result).encode('utf-8')]
        except Exception as e:
            start_response('500 Internal Server Error', headers)
            return [json.dumps({"error": str(e)}).encode('utf-8')]

    start_response('200 OK', headers)
    return [json.dumps({"status": "Matchmaking Engine Live"}).encode('utf-8')]

handler = app
