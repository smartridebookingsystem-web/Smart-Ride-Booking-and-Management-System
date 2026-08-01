import React from "react";

export default function AdminHeader({ totalUsersCount, totalRevenue, openComplaintsCount }) {
  return (
    <div
      className="p-4 mb-4 text-white rounded-4 shadow-sm"
      style={{
        background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
        borderLeft: "6px solid #FF6B00",
      }}
    >
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <span
            className="badge rounded-pill px-3 py-2 mb-2"
            style={{
              background: "rgba(255, 107, 0, 0.2)",
              color: "#FF6B00",
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            SmartRide Admin Portal
          </span>
          <h2 className="fw-bold mb-1 text-white">
            Admin <span style={{ color: "#FF6B00" }}>Operations Dashboard</span> 👋
          </h2>
          <p className="text-light mb-0 small" style={{ color: "#cbd5e1" }}>
            Manage users, drivers, rides, payments, complaints, and system reports.
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <span
            className="badge rounded-pill px-3 py-2 d-flex align-items-center gap-2 fw-semibold"
            style={{ background: "rgba(255, 107, 0, 0.15)", color: "#FF6B00", border: "1px solid rgba(255, 107, 0, 0.3)" }}
          >
            <i className="bi bi-people-fill"></i> Users: {totalUsersCount}
          </span>
          <span
            className="badge rounded-pill px-3 py-2 d-flex align-items-center gap-2 fw-semibold"
            style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.3)" }}
          >
            <i className="bi bi-currency-rupee"></i> Revenue: ₹{totalRevenue.toFixed(0)}
          </span>
          <span
            className="badge rounded-pill px-3 py-2 d-flex align-items-center gap-2 fw-semibold"
            style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.3)" }}
          >
            <i className="bi bi-exclamation-triangle-fill"></i> Issues: {openComplaintsCount}
          </span>
        </div>
      </div>
    </div>
  );
}
