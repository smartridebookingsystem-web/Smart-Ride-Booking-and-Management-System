import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import MapComponent from "./MapComponent";

export default function RiderHomeContent() {
  const { user } = useSelector((state) => state.auth || {});
  const username = user?.username?.toUpperCase() || "Rider";
  const navigate = useNavigate();

  // Location State for Interactive Leaflet Map
  const [pickup, setPickup] = useState(null);
  const [drop, setDrop] = useState(null);
  const [pickupName, setPickupName] = useState("");
  const [dropName, setDropName] = useState("");
  const [selecting, setSelecting] = useState("pickup");

  // Quick-search form state (now connected)
  const [vehicleType, setVehicleType] = useState("Hatchback");
  const [pickupTime, setPickupTime] = useState("");

  // Navigate to SearchRide pre-filled with current values
  const handleFindDrivers = () => {
    navigate("/rider/search-ride", {
      state: { pickupName, dropName, vehicleType },
    });
  };

  return (
    <div className="rider-home-content">


      {/* Hero & Quick Booking Section */}
      <section
        className="rounded-4 p-4 p-lg-5 mb-5 shadow-sm text-white"
        style={{
          background:
            "linear-gradient(rgba(15,23,42,.92), rgba(15,23,42,.92)), url('https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=1920')",
          backgroundSize: "cover"
        }}
      >
        <div className="row align-items-center gy-4">
          {/* Left Content */}
          <div className="col-lg-6">
            <span
              className="badge rounded-pill px-3 py-2 mb-3"
              style={{
                background: "rgba(255,107,0,.15)",
                color: "#FF6B00",
                fontSize: ".9rem",
              }}
            >
              Safe • Fast • Affordable
            </span>

            <h1
              className="fw-bold mb-4"
              style={{
                fontSize: "3rem",
                lineHeight: "1.2",
              }}
            >
              Move Smart.
              <br />
              <span style={{ color: "#FF6B00" }}>Live Easy.</span>
            </h1>

            <p
              className="lead mb-4"
              style={{
                color: "#cbd5e1",
                maxWidth: "520px",
              }}
            >
              Book rides in seconds, travel safely with verified drivers,
              track your journey in real time and enjoy a hassle-free
              transportation experience with SmartRide.
            </p>

            <div className="d-flex flex-wrap gap-3">
              <Link to="/rider/search-ride" className="btn btn-lg px-4 fw-semibold text-white" style={{ background: "#FF6B00" }}>
                <i className="bi bi-car-front-fill me-2"></i>
                Book Ride Now
              </Link>

              <Link
                to="/rider/my-bookings"
                className="btn btn-outline-light btn-lg px-4"
              >
                View My Bookings
              </Link>
            </div>

            {/* Live Platform Highlights */}
            <div className="row mt-4 pt-3 border-top border-secondary opacity-90">
              <div className="col-4">
                <h5 className="fw-bold mb-0 text-white">
                  <i className="bi bi-shield-check text-warning me-1.5"></i>Verified
                </h5>
                <small className="text-light opacity-75">Maharashtra Drivers</small>
              </div>

              <div className="col-4">
                <h5 className="fw-bold mb-0 text-white">
                  <i className="bi bi-key-fill text-warning me-1.5"></i>SMS OTP
                </h5>
                <small className="text-light opacity-75">Twilio Security</small>
              </div>

              <div className="col-4">
                <h5 className="fw-bold mb-0 text-white">
                  <i className="bi bi-currency-rupee text-warning me-1.5"></i>Live Fare
                </h5>
                <small className="text-light opacity-75">Haversine KM</small>
              </div>
            </div>
          </div>

          {/* Right Booking Card with Map */}
          <div className="col-lg-6">
            <div
              className="card border-0 shadow-lg"
              style={{
                borderRadius: "20px",
                overflow: "hidden",
                color: "#1e293b",
              }}
            >
              <div
                className="card-header border-0 py-3 px-4 d-flex justify-content-between align-items-center"
                style={{
                  background: "#FF6B00",
                  color: "#fff",
                }}
              >
                <h5 className="mb-0 fw-bold">
                  <i className="bi bi-search me-2"></i> Quick Ride Search
                </h5>
                {selecting && (
                  <span className={`badge ${selecting === "pickup" ? "bg-primary" : "bg-danger"} px-3 py-1`}>
                    Selecting: {selecting === "pickup" ? "Pickup 📍" : "Drop 🎯"}
                  </span>
                )}
              </div>

              <div className="card-body p-4 bg-white">
                {/* Pickup Location Input */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label fw-semibold mb-0">
                      Pickup Location
                    </label>
                    {selecting === "pickup" && (
                      <small className="text-primary fw-bold">Click Map to Pick 📍</small>
                    )}
                  </div>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-geo-alt-fill text-primary"></i>
                    </span>
                    <input
                      type="text"
                      className={`form-control border-start-0 ${selecting === "pickup" ? "border-primary shadow-sm" : ""
                        }`}
                      placeholder="Click here then select on map below..."
                      value={pickupName}
                      onFocus={() => setSelecting("pickup")}
                      onClick={() => setSelecting("pickup")}
                      onChange={(e) => setPickupName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Destination Input */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label fw-semibold mb-0">
                      Destination
                    </label>
                    {selecting === "drop" && (
                      <small className="text-danger fw-bold">Click Map to Pick 🎯</small>
                    )}
                  </div>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-pin-map-fill text-danger"></i>
                    </span>
                    <input
                      type="text"
                      className={`form-control border-start-0 ${selecting === "drop" ? "border-danger shadow-sm" : ""
                        }`}
                      placeholder="Click here then select on map below..."
                      value={dropName}
                      onFocus={() => setSelecting("drop")}
                      onClick={() => setSelecting("drop")}
                      onChange={(e) => setDropName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Embedded Interactive MapComponent */}
                <div className="mb-3 rounded-3 overflow-hidden border shadow-sm">
                  <MapComponent
                    pickup={pickup}
                    drop={drop}
                    setPickup={setPickup}
                    setDrop={setDrop}
                    pickupName={pickupName}
                    dropName={dropName}
                    setPickupName={setPickupName}
                    setDropName={setDropName}
                    selecting={selecting}
                    onClose={() => setSelecting(null)}
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      Ride Type
                    </label>
                    <select
                      className="form-select"
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                    >
                      <option value="Hatchback">Hatchback (Economy)</option>
                      <option value="Sedan">Sedan (Comfort)</option>
                      <option value="SUV">SUV (Premium)</option>
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      Pickup Time
                    </label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleFindDrivers}
                  className="btn btn-primary w-100 mt-2 py-2 fw-semibold text-white shadow-sm"
                  style={{ background: "#FF6B00", borderColor: "#FF6B00" }}
                >
                  <i className="bi bi-search me-2"></i>
                  Find Available Drivers
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS (CLEAN STEP GUIDE) ================= */}
      <section
        className="py-4 mb-4 rounded-4 p-4 text-white shadow-sm"
        style={{
          background: "#0F172A",
        }}
      >
        <div className="text-center mb-3">
          <h4 className="fw-bold" style={{ color: "#FF6B00" }}>
            How SmartRide Works
          </h4>
          <p className="text-light small mb-0">
            Booking a ride in Pune takes less than a minute.
          </p>
        </div>

        <div className="row text-center g-3">
          {[
            {
              step: "1",
              icon: "bi bi-geo-alt-fill",
              title: "Choose Locations",
              desc: "Enter pickup and drop location or pick on Pune map.",
            },
            {
              step: "2",
              icon: "bi bi-car-front-fill",
              title: "Select Vehicle",
              desc: "Pick Hatchback, Sedan, or SUV at exact KM rate.",
            },
            {
              step: "3",
              icon: "bi bi-key-fill",
              title: "OTP Verification",
              desc: "Share 6-digit OTP code with driver upon arrival.",
            },
          ].map((item, index) => (
            <div className="col-lg-4" key={index}>
              <div className="p-2">
                <div
                  className="mx-auto mb-2 d-flex align-items-center justify-content-center"
                  style={{
                    width: "55px",
                    height: "55px",
                    borderRadius: "50%",
                    background: "#FF6B00",
                    color: "#fff",
                  }}
                >
                  <i className={item.icon} style={{ fontSize: "24px" }}></i>
                </div>
                <h6 className="text-white fw-bold mb-1">Step {item.step}: {item.title}</h6>
                <p className="text-light small opacity-80 mb-0">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
