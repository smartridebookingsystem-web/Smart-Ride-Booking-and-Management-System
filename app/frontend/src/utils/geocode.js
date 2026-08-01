import axios from "axios";

// Famous Pune Locations with predefined coordinates
export const PUNE_POPULAR_LOCATIONS = [
  { name: "Pune Railway Station, Agarkar Nagar, Pune", lat: 18.5289, lng: 73.8744 },
  { name: "Pune Airport (PNQ), Lohegaon, Pune", lat: 18.5793, lng: 73.9089 },
  { name: "Hinjewadi Phase 1 (IT Park), Pune", lat: 18.5912, lng: 73.7389 },
  { name: "Hinjewadi Phase 2 (Quadron), Pune", lat: 18.5984, lng: 73.7225 },
  { name: "Hinjewadi Phase 3 (Tech Mahindra), Pune", lat: 18.5835, lng: 73.7028 },
  { name: "Kothrud Stand / Paud Road, Pune", lat: 18.5074, lng: 73.8077 },
  { name: "Viman Nagar (Phoenix Marketcity), Pune", lat: 18.5679, lng: 73.9143 },
  { name: "FC Road, Shivajinagar, Pune", lat: 18.5236, lng: 73.8415 },
  { name: "Baner Road / High Street, Pune", lat: 18.5590, lng: 73.7868 },
  { name: "Wakad Chowk, Pune", lat: 18.5987, lng: 73.7629 },
  { name: "Aundh Main Road, Pune", lat: 18.5580, lng: 73.8075 },
  { name: "Hadapsar Magarpatta City, Pune", lat: 18.5158, lng: 73.9272 },
  { name: "Swargate Bus Stand, Pune", lat: 18.5018, lng: 73.8636 },
  { name: "Katraj Snake Park / Stand, Pune", lat: 18.4575, lng: 73.8584 },
  { name: "Koregaon Park / Lane 6, Pune", lat: 18.5362, lng: 73.8940 },
  { name: "Kalyani Nagar, Pune", lat: 18.5463, lng: 73.9033 },
  { name: "Deccan Gymkhana, Pune", lat: 18.5167, lng: 73.8417 },
  { name: "MG Road, Camp, Pune", lat: 18.5162, lng: 73.8784 },
  { name: "Karve Nagar, Pune", lat: 18.4950, lng: 73.8180 },
  { name: "Bavdhan Main Road, Pune", lat: 18.5100, lng: 73.7700 },
];

// Search Pune locations via OpenStreetMap Nominatim with fallback to popular list
export const searchPuneLocations = async (query) => {
  if (!query || query.trim().length < 2) return [];

  const lower = query.toLowerCase().trim();

  // 1. Search popular locations list first
  const popularMatches = PUNE_POPULAR_LOCATIONS.filter((loc) =>
    loc.name.toLowerCase().includes(lower)
  );

  // 2. Fetch live Nominatim suggestions bounded to Pune region
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ", Pune, Maharashtra")}&limit=5`
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
    console.error("Pune location search error:", error);
  }

  return popularMatches.slice(0, 6);
};

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

