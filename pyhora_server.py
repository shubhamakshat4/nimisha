# Acharya Nimisha Bhardwaj - Integrated PyHora Server & Global Geocoding Web Application
import http.server
import socketserver
import urllib.parse
import urllib.request
import json
import os
import datetime
import threading
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
        elif parsed.path == '/api/booked-slots':
            query_params = urllib.parse.parse_qs(parsed.query)
            date_str = query_params.get('date', [''])[0].strip()
            
            all_slots = [
                "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM",
                "02:00 PM", "02:30 PM", "03:00 PM", "04:00 PM", "04:30 PM",
                "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM"
            ]

            def get_3_parked(d_str):
                if not d_str:
                    return ["10:30 AM", "02:30 PM", "06:30 PM"]
                seed = sum(ord(c) for c in d_str)
                indices = []
                for i in range(20):
                    idx = (seed * (i + 3) + i * 7) % len(all_slots)
                    if idx not in indices:
                        indices.append(idx)
                    if len(indices) == 3:
                        break
                return [all_slots[i] for i in indices]

            user_booked = []
            parked = get_3_parked(date_str)
            
            if os.path.exists('booked_slots.json'):
                try:
                    with open('booked_slots.json', 'r', encoding='utf-8') as f:
                        slots_data = json.load(f)
                        
                        if date_str and date_str in slots_data.get('bookings', {}):
                            entry = slots_data['bookings'][date_str]
                            if isinstance(entry, dict):
                                user_booked = entry.get('user_booked', [])
                                parked = entry.get('parked', [])
                            elif isinstance(entry, list):
                                user_booked = entry
                                parked = []
                        else:
                            parked = get_3_parked(date_str)
                except Exception as e:
                    print("Error reading booked_slots.json:", e)

            # Combined unavailable list for backward compatibility
            all_unavailable = list(set(user_booked + parked))

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                "date": date_str,
                "user_booked": user_booked,
                "parked": parked,
                "booked_slots": all_unavailable
            }).encode('utf-8'))
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
        elif parsed.path == '/api/book-slot':
            content_len = int(self.headers.get('Content-Length', 0))
            post_body = self.rfile.read(content_len).decode('utf-8')
            try:
                data = json.loads(post_body)
                date_str = data.get('date', '')
                slot_str = data.get('slot', '')
                
                all_slots = [
                    "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM",
                    "02:00 PM", "02:30 PM", "03:00 PM", "04:00 PM", "04:30 PM",
                    "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM"
                ]

                def get_3_parked(d_str):
                    if not d_str:
                        return ["10:30 AM", "02:30 PM", "06:30 PM"]
                    seed = sum(ord(c) for c in d_str)
                    indices = []
                    for i in range(20):
                        idx = (seed * (i + 3) + i * 7) % len(all_slots)
                        if idx not in indices:
                            indices.append(idx)
                        if len(indices) == 3:
                            break
                    return [all_slots[i] for i in indices]

                slots_data = {"default_parked": ["10:30 AM", "02:30 PM", "06:30 PM"], "bookings": {}}
                if os.path.exists('booked_slots.json'):
                    try:
                        with open('booked_slots.json', 'r', encoding='utf-8') as f:
                            slots_data = json.load(f)
                    except Exception:
                        pass
                
                if 'bookings' not in slots_data:
                    slots_data['bookings'] = {}
                
                if date_str not in slots_data['bookings']:
                    parked = get_3_parked(date_str)
                    slots_data['bookings'][date_str] = {"user_booked": [], "parked": parked}
                
                entry = slots_data['bookings'][date_str]
                if isinstance(entry, list):
                    slots_data['bookings'][date_str] = {"user_booked": list(entry), "parked": []}
                    entry = slots_data['bookings'][date_str]
                
                # Genuine User Booking & Auto-Unpark mechanism:
                if slot_str:
                    if slot_str in entry.get('parked', []):
                        # If user books a slot that was parked, move it to user_booked (remains grayed out as genuinely booked)
                        entry['parked'].remove(slot_str)
                        if slot_str not in entry.get('user_booked', []):
                            entry['user_booked'].append(slot_str)
                    else:
                        # If user books an open slot, add to user_booked AND release 1 casually grayed-out parked slot!
                        if slot_str not in entry.get('user_booked', []):
                            entry['user_booked'].append(slot_str)
                        if entry.get('parked') and len(entry['parked']) > 0:
                            entry['parked'].pop(0) # 1 casually grayed out slot opens up!
                
                with open('booked_slots.json', 'w', encoding='utf-8') as f:
                    json.dump(slots_data, f, indent=2)

                # 1) Log Request to CSV Spreadsheet (Google Sheets Compatible format)
                try:
                    import csv
                    csv_path = 'booking_requests.csv'
                    file_exists = os.path.exists(csv_path)
                    with open(csv_path, 'a', encoding='utf-8', newline='') as csv_file:
                        writer = csv.writer(csv_file)
                        if not file_exists:
                            writer.writerow(["Timestamp", "Date", "Slot", "Service", "Client Name", "Phone", "DOB", "TOB", "POB", "Query"])
                        now_ts = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                        writer.writerow([
                            now_ts,
                            date_str,
                            slot_str,
                            data.get('service', data.get('option', 'Time-Based Consultation')),
                            data.get('name', 'N/A'),
                            data.get('phone', 'N/A'),
                            data.get('dob', 'N/A'),
                            data.get('tob', 'N/A'),
                            data.get('pob', 'N/A'),
                            data.get('query', data.get('topic', 'N/A'))
                        ])
                except Exception as csv_err:
                    print("Error logging to CSV spreadsheet:", csv_err)

                # 2) Email Notification Log (Destination: n.astro3008@gmail.com)
                print(f"[EMAIL NOTIFICATION TRIGGERED to n.astro3008@gmail.com] Slot Request: {slot_str} on {date_str} for {data.get('name')}")

                # 3) Async Push to Google Spreadsheet Webhook
                google_webhook_url = os.environ.get(
                    'GOOGLE_SHEET_WEBHOOK_URL',
                    'https://script.google.com/macros/s/AKfycbxQxcY_AW76uojeb2bUzO1-IMx9cAl4tGOT4faAkEHiNSFJq_-LyAF_MzCipUuf-zv9/exec'
                )
                if google_webhook_url:
                    def push_to_google_sheet():
                        try:
                            req_data = json.dumps({
                                "date": date_str,
                                "slot": slot_str,
                                "service": data.get('service', data.get('option', 'Time-Based Consultation')),
                                "name": data.get('name', 'N/A'),
                                "phone": data.get('phone', 'N/A'),
                                "dob": data.get('dob', 'N/A'),
                                "tob": data.get('tob', 'N/A'),
                                "pob": data.get('pob', 'N/A'),
                                "query": data.get('query', data.get('topic', 'N/A'))
                            }).encode('utf-8')
                            
                            req = urllib.request.Request(
                                google_webhook_url,
                                data=req_data,
                                headers={'Content-Type': 'application/json'}
                            )
                            with urllib.request.urlopen(req, timeout=10) as resp:
                                print(f"[GOOGLE SHEET WEBHOOK] Successfully pushed payload to Google Spreadsheet!")
                        except Exception as g_err:
                            print("[GOOGLE SHEET WEBHOOK] Notice:", g_err)

                    threading.Thread(target=push_to_google_sheet, daemon=True).start()

                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "message": "Slot booked successfully!", "date": date_str, "slot": slot_str}).encode('utf-8'))
            except Exception as e:
                print("Error processing /api/book-slot:", e)
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
