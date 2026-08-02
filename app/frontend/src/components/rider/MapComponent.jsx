import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import { getPlaceName } from "../../utils/geocode";

// ---------------- Leaflet Marker Fix ----------------

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ---------------- Live Location Marker ----------------

const liveLocationIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// ---------------- Directing pickup to live location ----------------
function ChangeMapView({ center }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);

  return null;
}

// ---------------- OpenRouteService Key (from .env) ----------------

const API_KEY = import.meta.env.VITE_OPENROUTE_API_KEY;

// ---------------- Select Location ----------------

function LocationSelector({
  selecting,
  setPickup,
  setDrop,
  setPickupName,
  setDropName,
  onClose,
}) {
  useMapEvents({
    async click(e) {
      const location = [e.latlng.lat, e.latlng.lng];

      const address = await getPlaceName(
        e.latlng.lat,
        e.latlng.lng
      );

      if (selecting === "pickup") {
        setPickup(location);
        setPickupName(address);
        onClose?.();
      }

      if (selecting === "drop") {
        setDrop(location);
        setDropName(address);
        onClose?.();
      }
    },
  });

  return null;
}

export default function MapComponent({
  pickup,
  drop,
  setPickup,
  setDrop,
  pickupName,
  dropName,
  setPickupName,
  setDropName,
  selecting,
  onClose,
  onRouteCalculated,
}) {
  const [currentLocation, setCurrentLocation] = useState([
    18.5204,
    73.8567,
  ]);

  const [route, setRoute] = useState([]);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [fare, setFare] = useState("");

  // ---------------- Current Location ----------------

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (position?.coords) {
            setCurrentLocation([
              position.coords.latitude,
              position.coords.longitude,
            ]);
          }
        },
        () => {
          // Graceful silent fallback to default Pune center when permission is denied or blocked
          setCurrentLocation([18.5204, 73.8567]);
        },
        { timeout: 3000, maximumAge: 60000 }
      );
    }
  }, []);

  // ---------------- Haversine Distance Fallback ----------------
  const calculateHaversineDistance = (p1, p2) => {
    const rad = Math.PI / 180;
    const dLat = (p2[0] - p1[0]) * rad;
    const dLon = (p2[1] - p1[1]) * rad;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(p1[0] * rad) *
        Math.cos(p2[0] * rad) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightKm = 6371 * c;
    const roadKm = Number((straightKm * 1.25).toFixed(1)); // 25% road factor
    return roadKm < 1 ? 1.5 : roadKm;
  };

  // ---------------- Get Route (OSRM & OpenRouteService ORS) ----------------

  useEffect(() => {
    if (pickup && drop) {
      getRoute();
    }
  }, [pickup, drop]);

  const getRoute = async () => {
    if (!pickup || !drop) return;
    
    let km = calculateHaversineDistance(pickup, drop);
    let min = Math.round(km * 2.5);
    setRoute([[pickup[0], pickup[1]], [drop[0], drop[1]]]);

    // 1. Try OSRM (Open Source Routing Machine) - Free, No API Key Required
    try {
      console.log(`[OSRM Routing] 🚗 Fetching road geometry for Pickup (${pickup[0]}, ${pickup[1]}) → Drop (${drop[0]}, ${drop[1]})...`);
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${pickup[1]},${pickup[0]};${drop[1]},${drop[0]}?overview=full&geometries=geojson`;
      const response = await axios.get(osrmUrl, { timeout: 6000 });

      if (response.data?.routes?.[0]?.geometry?.coordinates) {
        const coords = response.data.routes[0].geometry.coordinates;
        const path = coords.map((c) => [c[1], c[0]]);
        setRoute(path);

        const routeData = response.data.routes[0];
        km = Number((routeData.distance / 1000).toFixed(1));
        min = Number((routeData.duration / 60).toFixed(0));
        console.log(`[OSRM Routing] ✅ Road Polyline loaded (${coords.length} waypoints, ${km} km, ${min} mins)`);
      }
    } catch (osrmErr) {
      console.warn("[OSRM Routing] OSRM primary failed, checking OpenRouteService (ORS):", osrmErr.message);

      // 2. Try OpenRouteService (ORS) fallback if API key is provided
      if (API_KEY) {
        try {
          const orsUrl = "https://api.openrouteservice.org/v2/directions/driving-car/geojson";
          const orsResp = await axios.post(
            orsUrl,
            {
              coordinates: [
                [pickup[1], pickup[0]],
                [drop[1], drop[0]],
              ],
            },
            {
              headers: {
                Authorization: API_KEY,
                "Content-Type": "application/json",
              },
              timeout: 6000,
            }
          );

          if (orsResp.data?.features?.[0]?.geometry?.coordinates) {
            const coords = orsResp.data.features[0].geometry.coordinates;
            const path = coords.map((c) => [c[1], c[0]]);
            setRoute(path);

            const summary = orsResp.data.features[0].properties.summary;
            km = Number((summary.distance / 1000).toFixed(1));
            min = Number((summary.duration / 60).toFixed(0));
            console.log(`[ORS Routing] ✅ OpenRouteService Polyline loaded (${km} km, ${min} mins)`);
          }
        } catch (orsErr) {
          console.warn("[ORS Routing] ORS fallback notice:", orsErr.message);
        }
      }
    }

    setDistance(km);
    setDuration(min);

    const hatchbackFare = Math.round(50 + km * 12);
    const sedanFare = Math.round(80 + km * 16);
    const suvFare = Math.round(120 + km * 22);

    setFare(sedanFare);

    if (typeof onRouteCalculated === "function") {
      onRouteCalculated({
        distanceKm: km,
        durationMin: min,
        fares: {
          Hatchback: hatchbackFare,
          Sedan: sedanFare,
          SUV: suvFare,
        },
      });
    }
  };

  return (
    <>
      <MapContainer
        center={currentLocation}
        zoom={15}
        style={{ height: "500px", width: "100%", borderRadius: "12px" }}
      >
        <ChangeMapView center={currentLocation} />

        <TileLayer
          attribution="OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LocationSelector
          selecting={selecting}
          setPickup={setPickup}
          setDrop={setDrop}
          setPickupName={setPickupName}
          setDropName={setDropName}
          onClose={onClose}
        />

        {/* Current Location */}

        <Marker
          position={currentLocation}
          icon={liveLocationIcon}
        >
          <Popup>Your Current Location</Popup>
        </Marker>

        {/* Pickup */}

        {pickup && (
          <Marker position={pickup}>
            <Popup>Pickup Location</Popup>
          </Marker>
        )}

        {/* Drop */}

        {drop && (
          <Marker position={drop}>
            <Popup>Drop Location</Popup>
          </Marker>
        )}

        {/* Route */}

        {route.length > 0 && (
          <Polyline
            positions={route}
            pathOptions={{
              color: "blue",
              weight: 5,
            }}
          />
        )}
      </MapContainer>
    </>
  );
}
