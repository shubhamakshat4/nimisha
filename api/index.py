# Vercel Python Serverless Function for PyHora Engine & Ephem Astronomy
from http.server import BaseHTTPRequestHandler
import urllib.parse
import json
import sys
import os

# Add root project directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from pyhora_engine import calculate_kundli, calculate_guna_milan_full

class handler(BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode('utf-8'))
            parsed_path = urllib.parse.urlparse(self.path).path

            if '/calculate-kundli' in parsed_path:
                dob = data.get('dob', '1995-08-25')
                tob = data.get('tob', '10:30')
                lat = float(data.get('lat', 28.6139))
                lon = float(data.get('lon', 77.2090))
                tz = float(data.get('tz', 5.5))
                ayanamsha = data.get('ayanamsha', 'lahiri')

                result = calculate_kundli(dob, tob, lat, lon, tz, ayanamsha)

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(result).encode('utf-8'))
                return

            elif '/matchmaking' in parsed_path:
                boy_n = data.get('boyNakshatra', 'Ashwini')
                girl_n = data.get('girlNakshatra', 'Bharani')

                result = calculate_guna_milan_full(boy_n, girl_n)

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(result).encode('utf-8'))
                return

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))

    def do_GET(self):
        parsed_path = urllib.parse.urlparse(self.path).path
        if '/search-city' in parsed_path:
            query_params = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            q = query_params.get('q', [''])[0].strip()
            
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

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(results).encode('utf-8'))
            return

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({"status": "PyHora Ephem Python Engine Live on Vercel"}).encode('utf-8'))
