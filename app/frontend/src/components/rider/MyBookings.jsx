import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { rideApi } from "../services/api";

export default function MyBookings() {
  const { user } = useSelector((state) => state.auth || {});
  const userId = user?.userId || user?.id || 3; // Default to rider Dhananjay (user_id 3) if not logged in

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBookings();
  }, [userId]);

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const data = await rideApi.getRidesByUserId(userId);
      setBookings(data || []);
    } catch (error) {
      console.error("Error fetching ride bookings from database:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to render status badges
  const renderStatusBadge = (status) => {
    if (status === 1 || status === "Completed") {
      return <span className="badge bg-success px-3 py-2">Completed</span>;
    }
    if (status === 2 || status === "In Progress") {
      return <span className="badge bg-warning text-dark px-3 py-2">In Progress</span>;
    }
    if (status === 0 || status === "Cancelled") {
      return <span className="badge bg-danger px-3 py-2">Cancelled</span>;
    }
    return <span className="badge bg-secondary px-3 py-2">{status}</span>;
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h5 className="fw-bold mb-0 text-dark">
          <i className="bi bi-ticket-perforated-fill me-2" style={{ color: "#FF6B00" }}></i>
          My Ride Bookings
        </h5>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-dark btn-sm rounded-pill px-3">
            <i className="bi bi-download me-1"></i> Export PDF History
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Loading database bookings...</span>
          </div>
          <p className="text-muted mt-2">Loading ride history from database...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-calendar-x fs-1 text-secondary mb-2 d-block"></i>
          <h6>No ride bookings found in database for your account.</h6>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Booking ID</th>
                <th>Date & Time</th>
                <th>Source (Pickup)</th>
                <th>Destination (Drop)</th>
                <th>Driver / Vehicle</th>
                <th>Fare</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.rideId || b.id}>
                  <td className="fw-bold text-primary">RIDE-{b.rideId || b.id}</td>
                  <td className="small text-muted">{b.date || "2026-07-02 22:37"}</td>
                  <td>
                    <div className="small fw-semibold text-dark">
                      <i className="bi bi-geo-alt-fill text-primary me-1"></i>
                      {b.source || b.pickup}
                    </div>
                  </td>
                  <td>
                    <div className="small fw-semibold text-dark">
                      <i className="bi bi-pin-map-fill text-danger me-1"></i>
                      {b.destination}
                    </div>
                  </td>
                  <td className="small text-dark">
                    {b.driverName || (b.driverId ? `Driver #${b.driverId}` : "Assigned Driver")}
                  </td>
                  <td className="fw-bold text-dark">
                    {typeof b.fare === "number" ? `₹${b.fare}` : b.fare || "₹250"}
                  </td>
                  <td>{renderStatusBadge(b.status)}</td>
                  <td>
                    <button className="btn btn-sm btn-light border rounded-pill px-3">Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

