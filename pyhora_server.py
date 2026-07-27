# Acharya Nimisha Bhardwaj - Integrated PyHora Server & Global Geocoding Web Application
import http.server
import socketserver
import urllib.parse
import urllib.request
import json
import os
from pyhora_engine import calculate_kundli, calculate_guna_milan_full

PORT = int(os.environ.get('PORT', 8080))

# Load offline city database once into memory
CITIES_DB = []
try:
    with open('cities.json', 'r', encoding='utf-8') as f:
        CITIES_DB = json.load(f)
except Exception as e:
    print("Error loading cities.json:", e)

def get_timezone_offset(country_str, lon):
    c_lower = country_str.lower()
    if 'nepal' in c_lower or 'नेपाल' in c_lower:
        return 5.75
    elif 'india' in c_lower or 'भारत' in c_lower or 'sri lanka' in c_lower:
        return 5.5
    elif 'bangladesh' in c_lower or 'বাংলাদেশ' in c_lower:
        return 6.0
    elif 'pakistan' in c_lower or 'پاکستان' in c_lower:
        return 5.0
    elif 'united arab emirates' in c_lower or 'uae' in c_lower or 'dubai' in c_lower:
        return 4.0
    elif 'united kingdom' in c_lower or 'uk' in c_lower or 'england' in c_lower or 'london' in c_lower:
        return 0.0
    elif 'singapore' in c_lower:
        return 8.0
    elif 'japan' in c_lower:
        return 9.0

    tz_approx = round(lon / 15.0 * 2.0) / 2.0
    return tz_approx

class PyHoraRequestHandler(http.server.SimpleHTTPRequestHandler):

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/api/search-city':
            query_params = urllib.parse.parse_qs(parsed.query)
            q = query_params.get('q', [''])[0].strip()
            
            results = []
            if len(q) >= 2:
                q_lower = q.lower()
                local_matches = [
                    c for c in CITIES_DB 
                    if q_lower in c['city'].lower() or q_lower in c['state'].lower() or q_lower in c['country'].lower()
                ][:6]
                
                for c in local_matches:
                    results.append({
                        "city": c['city'],
                        "display_name": f"{c['city']}, {c.get('state', '') + ', ' if c.get('state') else ''}{c['country']}",
                        "lat": c['lat'],
                        "lon": c['lon'],
                        "tz": c['tz']
                    })

                try:
                    nominatim_url = f"https://nominatim.openstreetmap.org/search?q={urllib.parse.quote(q)}&format=json&limit=6"
                    req = urllib.request.Request(nominatim_url, headers={'User-Agent': 'PyHoraVedicApp/2.0'})
                    with urllib.request.urlopen(req, timeout=4) as resp:
                        geo_data = json.loads(resp.read().decode('utf-8'))
                        for item in geo_data:
                            display_name = item.get('display_name', '')
                            lat = float(item.get('lat', 0))
                            lon = float(item.get('lon', 0))
                            name = item.get('name', q)
                            tz = get_timezone_offset(display_name, lon)
                            
                            if not any(abs(r['lat'] - lat) < 0.05 and abs(r['lon'] - lon) < 0.05 for r in results):
                                results.append({
                                    "city": name,
                                    "display_name": display_name,
                                    "lat": lat,
                                    "lon": lon,
                                    "tz": tz
                                })
                except Exception as e:
                    print("Nominatim geocoding fallback error:", e)
                    
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(results).encode('utf-8'))
            return
        
        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/api/calculate-kundli':
            content_len = int(self.headers.get('Content-Length', 0))
            post_body = self.rfile.read(content_len).decode('utf-8')
            try:
                data = json.loads(post_body)
                dob = data.get('dob', '1995-08-25')
                tob = data.get('tob', '10:30')
                lat = float(data.get('lat', 28.6139))
                lon = float(data.get('lon', 77.2090))
                tz = float(data.get('tz', 5.5))
                ayanamsha = data.get('ayanamsha', 'lahiri')

                result = calculate_kundli(dob, tob, lat, lon, tz, ayanamsha)
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(result).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
            return
        elif parsed.path == '/api/calculate-guna-milan':
            content_len = int(self.headers.get('Content-Length', 0))
            post_body = self.rfile.read(content_len).decode('utf-8')
            try:
                data = json.loads(post_body)
                b_rashi = int(data.get('boyRashi', 3))
                b_nak = data.get('boyNakshatra', 'Pushya')
                g_rashi = int(data.get('girlRashi', 8))
                g_nak = data.get('girlNakshatra', 'Mula')

                result = calculate_guna_milan_full(b_rashi, b_nak, g_rashi, g_nak)
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(result).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
            return

        self.send_response(404)
        self.end_headers()

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    with socketserver.TCPServer(("", PORT), PyHoraRequestHandler) as httpd:
        print(f"PyHora Server running at http://localhost:{PORT}")
        httpd.serve_forever()
