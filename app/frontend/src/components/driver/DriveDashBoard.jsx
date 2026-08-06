import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { rideApi, authApi } from "../services/api";

export default function DriveDashBoard() {
  // State for rides and vehicle info
  const [rides, setRides] = useState([]);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  const { token } = useSelector((state) => state.auth) || {};

  // Fetch rides and driver profile on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const ridesData = await rideApi.getAllRides();
        if (Array.isArray(ridesData)) setRides(ridesData);
        // Load driver profile for vehicle info
        if (token) {
          const profile = await authApi.getProfile(token);
          if (profile) {
            setVehicle({
              vehicleNo: profile.licenseNo || "-",
              vehicleType: profile.vehicleType || "Sedan",
              capacity: profile.capacity || 4,
              fuelType: profile.fuelType || "Petrol",
              status: profile.status === "verified" ? "Verified" : "Pending",
            });
          }
        }
      } catch (err) {
        console.warn("Backend sync error in DriveDashBoard:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token]);

  // Helper calculations
  const totalEarnings = rides.reduce((sum, r) => sum + (parseFloat(r.fare) || 250), 0);
  const totalRides = rides.length;
  const totalDistance = rides.reduce((sum, r) => {
    const distStr = typeof r.distance === "string" ? r.distance.replace(/[^0-9.]/g, "") : r.distance;
    const km = parseFloat(distStr) || 0;
    return sum + km;
  }, 0);

  // Render
  return (
    <div className="container-fluid py-4 px-3 px-md-4" style={{ backgroundColor: "#0B0F19", minHeight: "100vh", color: "#F8FAFC" }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
        <h4 className="fw-bold text-white mb-1">Driver Dashboard</h4>
        <button className="btn btn-primary fw-semibold rounded-pill px-3.5 py-2">
          <i className="bi bi-bank me-2"></i>Withdraw to Bank
        </button>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3" style={{ borderRadius: "14px", background: "linear-gradient(135deg, #FFF5ED 0%, #FFFFFF 100%)", borderLeft: "4px solid var(--primary)" }}>
            <span className="text-secondary small fw-semibold">Wallet Balance</span>
            <h3 className="fw-bold text-primary mt-1 mb-0">₹{(totalEarnings * 0.8).toFixed(2)}</h3>
            <small className="text-success mt-1 d-block"><i className="bi bi-shield-check me-1"></i>Available for Instant Payout</small>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3" style={{ borderRadius: "14px" }}>
            <span className="text-secondary small fw-semibold">Today's Earnings</span>
            <h3 className="fw-bold text-dark mt-1 mb-0">₹{totalEarnings.toFixed(2)}</h3>
            <small className="text-secondary mt-1 d-block">{totalRides} Completed Trips</small>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3" style={{ borderRadius: "14px" }}>
            <span className="text-secondary small fw-semibold">Distance Covered</span>
            <h3 className="fw-bold text-dark mt-1 mb-0">{totalDistance.toFixed(1)} km</h3>
            <small className="text-secondary mt-1 d-block">Based on recorded rides</small>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3" style={{ borderRadius: "14px" }}>
            <span className="text-secondary small fw-semibold">Active Shift</span>
            <h3 className="fw-bold text-dark mt-1 mb-0">{totalRides > 0 ? "On Duty" : "Off Duty"}</h3>
            <small className="text-secondary mt-1 d-block">Based on current ride activity</small>
          </div>
        </div>
      </div>

      {/* Ride History Table */}
      <div className="card border-0 shadow-sm p-3" style={{ borderRadius: "14px" }}>
        <h5 className="fw-bold text-dark mb-3">Ride History</h5>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Sr. No.</th>
                <th>Pickup → Destination</th>
                <th>Fare</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rides.length > 0 ? (
                rides.map((r, idx) => (
                  <tr key={idx}>
                    <td className="fw-bold">#{idx + 1}</td>
                    <td>{r.source || "Unknown"} → {r.destination || "Unknown"}</td>
                    <td>₹{rideApi.calculateRideFare(r)}</td>
                    <td>{r.status === 1 || r.status === "Completed" ? "Completed" : "In Progress"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    <i className="bi bi-info-circle text-muted" style={{ fontSize: "2rem" }}></i>
                    <p className="mt-2">No ride data available.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}