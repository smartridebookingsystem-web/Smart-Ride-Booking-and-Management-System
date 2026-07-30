import React, { useState } from "react";

export default function SearchRide() {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [vehicleType, setVehicleType] = useState("Hatchback");
  const [isSearching, setIsSearching] = useState(false);
  const [rideResult, setRideResult] = useState(null);

  const vehicleRates = {
    Hatchback: { base: 50, perKm: 12, estTime: "3-5 mins away" },
    Sedan: { base: 80, perKm: 16, estTime: "4-7 mins away" },
    SUV: { base: 120, perKm: 22, estTime: "6-10 mins away" },
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!pickup || !destination) {
      alert("Please enter both Pickup and Destination locations.");
      return;
    }
    setIsSearching(true);
    // Simulate fare calculation and driver search
    setTimeout(() => {
      setIsSearching(false);
      const estDistance = (Math.random() * 12 + 3).toFixed(1);
      const rate = vehicleRates[vehicleType];
      const estimatedFare = (rate.base + estDistance * rate.perKm).toFixed(0);

      setRideResult({
        pickup,
        destination,
        vehicleType,
        distanceKm: estDistance,
        fare: estimatedFare,
        eta: rate.estTime,
      });
    }, 1200);
  };

  return (
    <div className="container-fluid p-0">
      <div className="row g-4">
        {/* Search Input Form */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h5 className="fw-bold mb-4" style={{ color: "#0F172A" }}>
              <i className="bi bi-geo-alt-fill text-primary me-2"></i> Book Your Ride
            </h5>

            <form onSubmit={handleSearch}>
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted small">PICKUP LOCATION</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-circle-fill text-primary fs-6"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 py-2"
                    placeholder="Enter pickup address..."
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold text-muted small">DESTINATION</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-geo-alt-fill text-danger fs-6"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 py-2"
                    placeholder="Enter drop destination..."
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold text-muted small">VEHICLE TIER</label>
                <div className="d-flex gap-2">
                  {["Hatchback", "Sedan", "SUV"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={`btn flex-grow-1 py-2 fw-semibold border ${
                        vehicleType === type
                          ? "btn-warning text-white"
                          : "btn-light text-dark"
                      }`}
                      style={{
                        background: vehicleType === type ? "#FF6B00" : undefined,
                        borderColor: vehicleType === type ? "#FF6B00" : undefined,
                      }}
                      onClick={() => setVehicleType(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="btn w-100 py-3 fw-bold text-white shadow-sm"
                style={{ background: "#FF6B00" }}
                disabled={isSearching}
              >
                {isSearching ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Calculating Fare & Searching Drivers...
                  </>
                ) : (
                  <>
                    <i className="bi bi-search me-2"></i> Search Ride
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Search Results / Ride Confirmation Panel */}
        <div className="col-lg-7">
          {rideResult ? (
            <div className="card border-0 shadow-sm rounded-4 p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Ride Details & Fare Preview</h5>
                <span className="badge bg-success px-3 py-2">Driver Available</span>
              </div>
              <hr />

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <small className="text-muted d-block">Pickup Location</small>
                  <strong className="text-dark">{rideResult.pickup}</strong>
                </div>
                <div className="col-md-6">
                  <small className="text-muted d-block">Destination</small>
                  <strong className="text-dark">{rideResult.destination}</strong>
                </div>
                <div className="col-md-4">
                  <small className="text-muted d-block">Est. Distance</small>
                  <strong>{rideResult.distanceKm} km</strong>
                </div>
                <div className="col-md-4">
                  <small className="text-muted d-block">Vehicle Type</small>
                  <strong>{rideResult.vehicleType}</strong>
                </div>
                <div className="col-md-4">
                  <small className="text-muted d-block">Driver ETA</small>
                  <strong className="text-success">{rideResult.eta}</strong>
                </div>
              </div>

              <div className="p-3 bg-light rounded-3 d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h6 className="mb-0 text-muted">Total Fare</h6>
                  <small className="text-muted">Includes taxes & toll charges</small>
                </div>
                <h2 className="fw-bold mb-0" style={{ color: "#FF6B00" }}>
                  ₹{rideResult.fare}
                </h2>
              </div>

              <div className="d-flex gap-3">
                <button
                  className="btn btn-lg w-100 fw-bold text-white shadow-sm"
                  style={{ background: "#FF6B00" }}
                  onClick={() => alert(`Ride Request Sent! Searching for nearby ${rideResult.vehicleType} drivers...`)}
                >
                  Confirm & Request Ride
                </button>
                <button
                  className="btn btn-outline-secondary btn-lg px-4"
                  onClick={() => setRideResult(null)}
                >
                  Reset
                </button>
              </div>
            </div>
          ) : (
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white h-100 d-flex justify-content-center align-items-center">
              <div
                className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "50%",
                  background: "rgba(255,107,0,.12)",
                }}
              >
                <i className="bi bi-geo-alt-fill text-orange fs-1" style={{ color: "#FF6B00" }}></i>
              </div>
              <h5 className="fw-bold text-dark">Ready to Explore?</h5>
              <p className="text-muted max-w-sm mb-0">
                Enter your pickup address and destination on the left panel to calculate fare and search nearby drivers instantly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
