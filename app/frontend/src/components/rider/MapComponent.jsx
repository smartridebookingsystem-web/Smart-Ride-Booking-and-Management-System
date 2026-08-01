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

// ---------------- OpenRouteService Key ----------------

const API_KEY =
  "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjgwYTQ5ZTBhNmJiNjRjZTA4YzA4ZDg3YWM1ZmQzMDkxIiwiaCI6Im11cm11cjY0In0=";

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
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation([
          position.coords.latitude,
          position.coords.longitude,
        ]);
      },
      () => {
        console.log("Location Permission Denied");
      }
    );
  }, []);

  // ---------------- Get Route ----------------

  useEffect(() => {
    if (pickup && drop) {
      getRoute();
    }
  }, [pickup, drop]);

  const getRoute = async () => {
    try {
      const response = await axios.post(
        "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
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
        }
      );

      const coords =
        response.data.features[0].geometry.coordinates;

      const path = coords.map((c) => [c[1], c[0]]);

      setRoute(path);

      const summary =
        response.data.features[0].properties.summary;

      const km = (summary.distance / 1000).toFixed(2);

      const min = (summary.duration / 60).toFixed(0);

      setDistance(km);

      setDuration(min);

      const totalFare = 50 + km * 12;

      setFare(totalFare.toFixed(0));
    } catch (err) {
      console.log(err);
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

      {distance && (
        <div className="card shadow mt-3 p-4">
          <h4 className="mb-3">Ride Summary</h4>

          <div className="row">
            <div className="col-md-4">
              <h6>Distance</h6>
              <h5>{distance} km</h5>
            </div>

            <div className="col-md-4">
              <h6>Duration</h6>
              <h5>{duration} min</h5>
            </div>

            <div className="col-md-4">
              <h6>Estimated Fare</h6>
              <h5>₹ {fare}</h5>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
