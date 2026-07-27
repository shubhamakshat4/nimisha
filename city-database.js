/**
 * Comprehensive World & Indian City Database for PyHora Place of Birth Autocomplete
 * Contains exact Latitude, Longitude, and Timezone Offsets.
 */

const CITY_DATABASE = [
  // Major Indian Cities & Towns
  { city: "New Delhi", state: "Delhi", country: "India", lat: 28.6139, lon: 77.2090, tz: 5.5 },
  { city: "Delhi", state: "Delhi", country: "India", lat: 28.6692, lon: 77.1147, tz: 5.5 },
  { city: "Mumbai", state: "Maharashtra", country: "India", lat: 19.0760, lon: 72.8777, tz: 5.5 },
  { city: "Bengaluru", state: "Karnataka", country: "India", lat: 12.9716, lon: 77.5946, tz: 5.5 },
  { city: "Kolkata", state: "West Bengal", country: "India", lat: 22.5726, lon: 88.3639, tz: 5.5 },
  { city: "Chennai", state: "Tamil Nadu", country: "India", lat: 13.0827, lon: 80.2707, tz: 5.5 },
  { city: "Hyderabad", state: "Telangana", country: "India", lat: 17.3850, lon: 78.4867, tz: 5.5 },
  { city: "Ahmedabad", state: "Gujarat", country: "India", lat: 23.0225, lon: 72.5714, tz: 5.5 },
  { city: "Pune", state: "Maharashtra", country: "India", lat: 18.5204, lon: 73.8567, tz: 5.5 },
  { city: "Jaipur", state: "Rajasthan", country: "India", lat: 26.9124, lon: 75.7873, tz: 5.5 },
  { city: "Lucknow", state: "Uttar Pradesh", country: "India", lat: 26.8467, lon: 80.9462, tz: 5.5 },
  { city: "Varanasi", state: "Uttar Pradesh", country: "India", lat: 25.3176, lon: 82.9739, tz: 5.5 },
  { city: "Indore", state: "Madhya Pradesh", country: "India", lat: 22.7196, lon: 75.8577, tz: 5.5 },
  { city: "Bhopal", state: "Madhya Pradesh", country: "India", lat: 23.2599, lon: 77.4126, tz: 5.5 },
  { city: "Ujjain", state: "Madhya Pradesh", country: "India", lat: 23.1765, lon: 75.7885, tz: 5.5 },
  { city: "Chandigarh", state: "Punjab/Haryana", country: "India", lat: 30.7333, lon: 76.7794, tz: 5.5 },
  { city: "Amritsar", state: "Punjab", country: "India", lat: 31.6340, lon: 74.8723, tz: 5.5 },
  { city: "Ludhiana", state: "Punjab", country: "India", lat: 30.9010, lon: 75.8573, tz: 5.5 },
  { city: "Agra", state: "Uttar Pradesh", country: "India", lat: 27.1767, lon: 78.0081, tz: 5.5 },
  { city: "Kanpur", state: "Uttar Pradesh", country: "India", lat: 26.4499, lon: 80.3319, tz: 5.5 },
  { city: "Prayagraj (Allahabad)", state: "Uttar Pradesh", country: "India", lat: 25.4358, lon: 81.8463, tz: 5.5 },
  { city: "Patna", state: "Bihar", country: "India", lat: 25.5941, lon: 85.1376, tz: 5.5 },
  { city: "Gaya", state: "Bihar", country: "India", lat: 24.7914, lon: 85.0002, tz: 5.5 },
  { city: "Ranchi", state: "Jharkhand", country: "India", lat: 23.3441, lon: 85.3096, tz: 5.5 },
  { city: "Jamshedpur", state: "Jharkhand", country: "India", lat: 22.8046, lon: 86.2029, tz: 5.5 },
  { city: "Guwahati", state: "Assam", country: "India", lat: 26.1445, lon: 91.7362, tz: 5.5 },
  { city: "Bhubaneswar", state: "Odisha", country: "India", lat: 20.2961, lon: 85.8245, tz: 5.5 },
  { city: "Cuttack", state: "Odisha", country: "India", lat: 20.4625, lon: 85.8828, tz: 5.5 },
  { city: "Raipur", state: "Chhattisgarh", country: "India", lat: 21.2514, lon: 81.6296, tz: 5.5 },
  { city: "Nagpur", state: "Maharashtra", country: "India", lat: 21.1458, lon: 79.0882, tz: 5.5 },
  { city: "Nashik", state: "Maharashtra", country: "India", lat: 20.0059, lon: 73.7898, tz: 5.5 },
  { city: "Thane", state: "Maharashtra", country: "India", lat: 19.2183, lon: 72.9781, tz: 5.5 },
  { city: "Surat", state: "Gujarat", country: "India", lat: 21.1702, lon: 72.8311, tz: 5.5 },
  { city: "Vadodara", state: "Gujarat", country: "India", lat: 22.3072, lon: 73.1812, tz: 5.5 },
  { city: "Rajkot", state: "Gujarat", country: "India", lat: 22.3039, lon: 70.8022, tz: 5.5 },
  { city: "Udaipur", state: "Rajasthan", country: "India", lat: 24.5854, lon: 73.7125, tz: 5.5 },
  { city: "Jodhpur", state: "Rajasthan", country: "India", lat: 26.2389, lon: 73.0243, tz: 5.5 },
  { city: "Kota", state: "Rajasthan", country: "India", lat: 25.2138, lon: 75.8648, tz: 5.5 },
  { city: "Dehradun", state: "Uttarakhand", country: "India", lat: 30.3165, lon: 78.0322, tz: 5.5 },
  { city: "Haridwar", state: "Uttarakhand", country: "India", lat: 29.9457, lon: 78.1642, tz: 5.5 },
  { city: "Rishikesh", state: "Uttarakhand", country: "India", lat: 30.0869, lon: 78.2676, tz: 5.5 },
  { city: "Shimla", state: "Himachal Pradesh", country: "India", lat: 31.1048, lon: 77.1734, tz: 5.5 },
  { city: "Dharamshala", state: "Himachal Pradesh", country: "India", lat: 32.2190, lon: 76.3234, tz: 5.5 },
  { city: "Srinagar", state: "Jammu & Kashmir", country: "India", lat: 34.0837, lon: 74.7973, tz: 5.5 },
  { city: "Jammu", state: "Jammu & Kashmir", country: "India", lat: 32.7266, lon: 74.8570, tz: 5.5 },
  { city: "Goa (Panaji)", state: "Goa", country: "India", lat: 15.4909, lon: 73.8278, tz: 5.5 },
  { city: "Coimbatore", state: "Tamil Nadu", country: "India", lat: 11.0168, lon: 76.9558, tz: 5.5 },
  { city: "Madurai", state: "Tamil Nadu", country: "India", lat: 9.9252, lon: 78.1198, tz: 5.5 },
  { city: "Kochi", state: "Kerala", country: "India", lat: 9.9312, lon: 76.2673, tz: 5.5 },
  { city: "Thiruvananthapuram", state: "Kerala", country: "India", lat: 8.5241, lon: 76.9366, tz: 5.5 },
  { city: "Visakhapatnam", state: "Andhra Pradesh", country: "India", lat: 17.6868, lon: 83.2185, tz: 5.5 },
  { city: "Vijayawada", state: "Andhra Pradesh", country: "India", lat: 16.5062, lon: 80.6480, tz: 5.5 },
  { city: "Tirupati", state: "Andhra Pradesh", country: "India", lat: 13.6288, lon: 79.4192, tz: 5.5 },
  { city: "Mangaluru", state: "Karnataka", country: "India", lat: 12.9141, lon: 74.8560, tz: 5.5 },
  { city: "Mysuru", state: "Karnataka", country: "India", lat: 12.2958, lon: 76.6394, tz: 5.5 },

  // International Cities
  { city: "London", state: "England", country: "United Kingdom", lat: 51.5074, lon: -0.1278, tz: 0.0 },
  { city: "New York", state: "NY", country: "USA", lat: 40.7128, lon: -74.0060, tz: -5.0 },
  { city: "San Francisco", state: "CA", country: "USA", lat: 37.7749, lon: -122.4194, tz: -8.0 },
  { city: "Los Angeles", state: "CA", country: "USA", lat: 34.0522, lon: -118.2437, tz: -8.0 },
  { city: "Chicago", state: "IL", country: "USA", lat: 41.8781, lon: -87.6298, tz: -6.0 },
  { city: "Toronto", state: "Ontario", country: "Canada", lat: 43.6532, lon: -79.3832, tz: -5.0 },
  { city: "Vancouver", state: "BC", country: "Canada", lat: 49.2827, lon: -123.1207, tz: -8.0 },
  { city: "Dubai", state: "Dubai", country: "UAE", lat: 25.2048, lon: 55.2708, tz: 4.0 },
  { city: "Abu Dhabi", state: "Abu Dhabi", country: "UAE", lat: 24.4539, lon: 54.3773, tz: 4.0 },
  { city: "Singapore", state: "Singapore", country: "Singapore", lat: 1.3521, lon: 103.8198, tz: 8.0 },
  { city: "Sydney", state: "NSW", country: "Australia", lat: -33.8688, lon: 151.2093, tz: 10.0 },
  { city: "Melbourne", state: "Victoria", country: "Australia", lat: -37.8136, lon: 144.9631, tz: 10.0 },
  { city: "Kathmandu", state: "Bagmati", country: "Nepal", lat: 27.7172, lon: 85.3240, tz: 5.75 },
  { city: "Colombo", state: "Western", country: "Sri Lanka", lat: 6.9271, lon: 79.8612, tz: 5.5 },
  { city: "Tokyo", state: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503, tz: 9.0 },
  { city: "Berlin", state: "Berlin", country: "Germany", lat: 52.5200, lon: 13.4050, tz: 1.0 },
  { city: "Paris", state: "Île-de-France", country: "France", lat: 48.8566, lon: 2.3522, tz: 1.0 }
];

/**
 * Filter Cities based on query string
 */
function searchCities(query) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase().trim();

  return CITY_DATABASE.filter(c => 
    c.city.toLowerCase().includes(q) || 
    c.state.toLowerCase().includes(q) ||
    c.country.toLowerCase().includes(q)
  ).slice(0, 8);
}
