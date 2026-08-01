import axios from "axios";

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
