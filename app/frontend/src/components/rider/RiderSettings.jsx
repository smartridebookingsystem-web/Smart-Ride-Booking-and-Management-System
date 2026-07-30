import React from "react";
import { useSelector } from "react-redux";

export default function RiderSettings() {
  const { user } = useSelector((state) => state.auth || {});

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4">
      <h5 className="fw-bold mb-4 text-dark">
        <i className="bi bi-gear-fill me-2" style={{ color: "#FF6B00" }}></i> Rider Account Settings
      </h5>

      <form onSubmit={(e) => { e.preventDefault(); alert("Profile settings saved!"); }}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold text-muted small">USERNAME</label>
            <input type="text" className="form-control" defaultValue={user?.username || "Rider User"} />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold text-muted small">EMAIL ADDRESS</label>
            <input type="email" className="form-control" defaultValue={user?.email || "rider@smartride.com"} />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold text-muted small">PHONE NUMBER</label>
            <input type="tel" className="form-control" defaultValue={user?.phone || "+91 9876543210"} />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold text-muted small">DEFAULT HOME ADDRESS</label>
            <input type="text" className="form-control" placeholder="Enter home address" />
          </div>
        </div>

        <button type="submit" className="btn fw-bold text-white mt-4 px-4 py-2" style={{ background: "#FF6B00" }}>
          Save Changes
        </button>
      </form>
    </div>
  );
}
