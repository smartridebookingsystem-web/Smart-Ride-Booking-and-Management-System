import axios from "axios";

// Famous Maharashtra Locations with predefined coordinates (Pune, Mumbai, Sangli, Kolhapur, Nashik, Nagpur)
export const MAHARASHTRA_POPULAR_LOCATIONS = [
  // Pune Region
  { name: "Pune Railway Station, Agarkar Nagar, Pune", lat: 18.5289, lng: 73.8744 },
  { name: "Pune Airport (PNQ), Lohegaon, Pune", lat: 18.5793, lng: 73.9089 },
  { name: "Hinjewadi Phase 1 (IT Park), Pune", lat: 18.5912, lng: 73.7389 },
  { name: "Kothrud Stand / Paud Road, Pune", lat: 18.5074, lng: 73.8077 },
  { name: "Viman Nagar (Phoenix Marketcity), Pune", lat: 18.5679, lng: 73.9143 },
  { name: "FC Road, Shivajinagar, Pune", lat: 18.5236, lng: 73.8415 },
  { name: "Hadapsar Magarpatta City, Pune", lat: 18.5158, lng: 73.9272 },
  { name: "Swargate Bus Stand, Pune", lat: 18.5018, lng: 73.8636 },

  // Mumbai & Thane Region
  { name: "Chhatrapati Shivaji Maharaj Terminus (CSMT), Mumbai", lat: 18.9398, lng: 72.8355 },
  { name: "Mumbai International Airport (BOM), Andheri, Mumbai", lat: 19.0896, lng: 72.8656 },
  { name: "Bandra Kurla Complex (BKC), Mumbai", lat: 19.0657, lng: 72.8680 },
  { name: "Thane Railway Station, Thane West", lat: 19.1860, lng: 72.9759 },
  { name: "Navi Mumbai Vashi Station, Navi Mumbai", lat: 19.0644, lng: 72.9980 },

  // Sangli & Kolhapur Region
  { name: "Sangli Railway Station, Vishrambag, Sangli", lat: 16.8524, lng: 74.5815 },
  { name: "Sangli Central Bus Stand, Sangli", lat: 16.8570, lng: 74.5642 },
  { name: "VPIMSR College, Wanlesswadi, Sangli", lat: 16.8421, lng: 74.6012 },
  { name: "Kolhapur Mahalaxmi Temple, Kolhapur", lat: 16.6956, lng: 74.2223 },
  { name: "Kolhapur Central Bus Stand (CBS), Kolhapur", lat: 16.7050, lng: 74.2433 },

  // Nashik & Chhatrapati Sambhajinagar (Aurangabad)
  { name: "Nashik Road Railway Station, Nashik", lat: 19.9535, lng: 73.8340 },
  { name: "Panchavati, Nashik", lat: 20.0063, lng: 73.7963 },
  { name: "Chhatrapati Sambhajinagar Central, Aurangabad", lat: 19.8762, lng: 75.3433 },

  // Nagpur & Solapur
  { name: "Nagpur Junction Railway Station, Nagpur", lat: 21.1524, lng: 79.0888 },
  { name: "Solapur Central Railway Station, Solapur", lat: 17.6599, lng: 75.9064 },
];

// Alias export for backward compatibility
export const PUNE_POPULAR_LOCATIONS = MAHARASHTRA_POPULAR_LOCATIONS;

// Search Maharashtra locations via OpenStreetMap Nominatim with fallback to popular list
export const searchMaharashtraLocations = async (query) => {
  if (!query || query.trim().length < 2) return [];

  const lower = query.toLowerCase().trim();

  // 1. Search popular locations list first
  const popularMatches = MAHARASHTRA_POPULAR_LOCATIONS.filter((loc) =>
    loc.name.toLowerCase().includes(lower)
  );

  // 2. Fetch live Nominatim suggestions bounded to Maharashtra region, India
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ", Maharashtra, India")}&limit=5`
    );

    if (response.data && Array.isArray(response.data)) {
      const apiMatches = response.data.map((item) => ({
        name: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      }));

      // Combine and filter unique by location name prefix
      const combined = [...popularMatches, ...apiMatches];
      const unique = [];
      const seen = new Set();

      for (const item of combined) {
        const shortName = item.name.split(",")[0].trim().toLowerCase();
        if (!seen.has(shortName)) {
          seen.add(shortName);
          unique.push(item);
        }
      }

      return unique.slice(0, 6);
    }
  } catch (error) {
    console.error("Maharashtra location search error:", error);
  }

  return popularMatches.slice(0, 6);
};

// Backward compatibility alias
export const searchPuneLocations = searchMaharashtraLocations;

// Helper function to get place name from Latitude & Longitude using OpenStreetMap (Nominatim)
export const getPlaceName = async (lat, lng) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );

    if (response.data && response.data.display_name) {
      return response.data.display_name;
    }
    
    return `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  } catch (error) {
    console.error("Geocoding Error:", error);
    return `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  }
};

