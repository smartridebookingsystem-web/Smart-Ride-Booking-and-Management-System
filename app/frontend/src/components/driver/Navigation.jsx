import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { rideApi } from "../services/api";

export default function Navigation() {
  const navigate = useNavigate();

  const [tripStage, setTripStage] = useState("EN_ROUTE_PICKUP"); // EN_ROUTE_PICKUP, ARRIVED, TRIP_STARTED, COMPLETED

  const [activeTrip, setActiveTrip] = useState({
    id: "RIDE-1093",
    riderName: "Rahul Sharma",
    phone: "+91 98765 43210",
    pickup: "Sangli Railway Station, Gate 1",
    destination: "Vishrambag Main Road, Sangli",
    distance: "4.5 km",
    estimatedTime: "12 Mins",
    totalFare: "₹160",
    paymentMode: "UPI",
    vehicleNo: "MH14CD5678",
  });

  useEffect(() => {
    async function loadActiveTrip() {
      try {
        const rides = await rideApi.getAllRides();
        if (Array.isArray(rides) && rides.length > 0) {
          const current = rides[rides.length - 1];
          setActiveTrip({
            id: `RIDE-${current.rideId || current.id || 1093}`,
            riderName: current.riderName || current.rider || `Rider #${current.userId || 4}`,
            phone: "+91 98765 43210",
            pickup: current.source || "Sangli Railway Station, Gate 1",
            destination: current.destination || "Vishrambag Main Road, Sangli",
            distance: "4.5 km",
            estimatedTime: "12 Mins",
            totalFare: `₹${current.fare || 160}`,
            paymentMode: current.paymentMode || "UPI",
            vehicleNo: "MH14CD5678",
          });
        }
      } catch (err) {
        console.warn("Backend navigation sync:", err);
      }
    }
    loadActiveTrip();
  }, []);

  const handleNextStage = () => {
    if (tripStage === "EN_ROUTE_PICKUP") {
      setTripStage("ARRIVED");
    } else if (tripStage === "ARRIVED") {
      setTripStage("TRIP_STARTED");
    } else if (tripStage === "TRIP_STARTED") {
      navigate("/driver/complete-ride");
    }
  };

  return (
    <div>
      {/* Page Title */}
      <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">
            <i className="bi bi-geo-alt-fill text-primary me-2"></i>Active Route Navigation
          </h4>
          <p className="text-secondary small mb-0">
            Live turn-by-turn navigation and trip progress tracking.
          </p>
        </div>

        <span className="badge bg-warning text-dark px-3 py-2 fs-6 rounded-pill fw-bold">
          <i className="bi bi-record-circle-fill text-danger me-1"></i>Trip In Progress
        </span>
      </div>

      {/* Progress Tracker Bar */}
      <div className="card border-0 bg-light p-3 mb-4" style={{ borderRadius: "14px" }}>
        <div className="row text-center g-2">
          <div className="col-4">
            <div className={`fw-bold small ${tripStage === "EN_ROUTE_PICKUP" ? "text-primary" : "text-success"}`}>
              1. En Route Pickup
            </div>
            <div className={`progress mt-1`} style={{ height: "4px" }}>
              <div
                className="progress-bar bg-primary"
                style={{ width: tripStage === "EN_ROUTE_PICKUP" ? "50%" : "100%" }}
              ></div>
            </div>
          </div>

          <div className="col-4">
            <div className={`fw-bold small ${tripStage === "ARRIVED" ? "text-primary" : tripStage === "TRIP_STARTED" ? "text-success" : "text-secondary"}`}>
              2. Arrived at Location
            </div>
            <div className={`progress mt-1`} style={{ height: "4px" }}>
              <div
                className="progress-bar bg-primary"
                style={{ width: tripStage === "ARRIVED" ? "50%" : tripStage === "TRIP_STARTED" ? "100%" : "0%" }}
              ></div>
            </div>
          </div>

          <div className="col-4">
            <div className={`fw-bold small ${tripStage === "TRIP_STARTED" ? "text-primary" : "text-secondary"}`}>
              3. Driving to Destination
            </div>
            <div className={`progress mt-1`} style={{ height: "4px" }}>
              <div
                className="progress-bar bg-primary"
                style={{ width: tripStage === "TRIP_STARTED" ? "50%" : "0%" }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Card */}
      <div className="row g-4">
        {/* Left: Route Card */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: "16px", background: "var(--card)" }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="badge bg-primary text-white px-3 py-1.5 fs-7 fw-bold">
                {activeTrip.id}
              </span>
              <span className="fw-semibold text-secondary small">
                Est. Time: <strong className="text-dark">{activeTrip.estimatedTime}</strong> ({activeTrip.distance})
              </span>
            </div>

            {/* Simulated Live Route Map View */}
            <div
              className="rounded-3 p-4 text-center mb-4 d-flex flex-column justify-content-center align-items-center"
              style={{
                height: "220px",
                background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
                color: "#fff",
              }}
            >
              <i className="bi bi-compass-fill text-warning mb-2" style={{ fontSize: "3rem" }}></i>
              <h5 className="fw-bold mb-1">
                {tripStage === "TRIP_STARTED" ? "Heading to Destination" : "Heading to Pickup Location"}
              </h5>
              <p className="text-secondary small mb-0">GPS Live Tracking Active • Turn Right in 200m</p>
            </div>

            {/* Addresses */}
            <div className="p-3 bg-light rounded-3 mb-3">
              <div className="d-flex align-items-start gap-2 mb-3">
                <i className="bi bi-circle-fill text-success fs-6 mt-1"></i>
                <div>
                  <span className="text-secondary small d-block">Pickup Location</span>
                  <strong className="text-dark">{activeTrip.pickup}</strong>
                </div>
              </div>

              <hr className="my-2" />

              <div className="d-flex align-items-start gap-2">
                <i className="bi bi-geo-alt-fill text-danger fs-6 mt-1"></i>
                <div>
                  <span className="text-secondary small d-block">Destination</span>
                  <strong className="text-dark">{activeTrip.destination}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Passenger Info & Controls */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: "16px", background: "var(--card)" }}>
            <h5 className="fw-bold text-dark mb-3">Passenger Information</h5>

            <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3 mb-4">
              <div
                className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center fw-bold fs-4"
                style={{ width: "50px", height: "50px" }}
              >
                {activeTrip.riderName.charAt(0)}
              </div>
              <div>
                <h6 className="fw-bold mb-0 text-dark">{activeTrip.riderName}</h6>
                <small className="text-secondary">{activeTrip.phone}</small>
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-secondary">Estimated Fare:</span>
                <strong className="text-dark fs-5">{activeTrip.totalFare}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-secondary">Payment Method:</span>
                <span className="badge bg-light text-dark border">{activeTrip.paymentMode}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-secondary">Assigned Vehicle:</span>
                <strong className="text-dark">{activeTrip.vehicleNo}</strong>
              </div>
            </div>

            <div className="d-grid gap-2 mt-auto">
              <a
                href={`tel:${activeTrip.phone}`}
                className="btn btn-outline-primary fw-semibold py-2.5 rounded-3"
              >
                <i className="bi bi-telephone-fill me-2"></i>Call Passenger
              </a>

              <button
                type="button"
                className="btn btn-primary btn-lg fw-bold py-3 rounded-3 shadow-sm"
                onClick={handleNextStage}
              >
                {tripStage === "EN_ROUTE_PICKUP" && (
                  <>
                    <i className="bi bi-geo-fill me-2"></i>Mark Arrived at Pickup
                  </>
                )}
                {tripStage === "ARRIVED" && (
                  <>
                    <i className="bi bi-play-circle-fill me-2"></i>Start Trip
                  </>
                )}
                {tripStage === "TRIP_STARTED" && (
                  <>
                    <i className="bi bi-flag-fill me-2"></i>Proceed to Complete Ride
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}