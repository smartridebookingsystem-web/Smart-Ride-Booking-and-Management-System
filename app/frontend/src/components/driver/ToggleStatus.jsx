import React from "react";
import { useOutletContext } from "react-router-dom";

export default function ToggleStatus() {
  const { isOnline, setIsOnline } = useOutletContext() || { isOnline: true, setIsOnline: () => {} };

  return (
    <div className="text-white">
      {/* Page Title */}
      <div className="border-bottom border-white border-opacity-10 pb-3 mb-4">
        <h4 className="fw-bold text-white mb-1">
          <i className="bi bi-toggle-on text-warning me-2"></i>Driver Duty Status Settings
        </h4>
        <p className="text-light opacity-75 small mb-0">
          Switch your online/offline status to start or stop receiving new ride requests on your map.
        </p>
      </div>

      {/* Main Status Toggle Card */}
      <div
        className="card border-0 shadow-lg p-4 text-center mb-4 text-white"
        style={{
          borderRadius: "20px",
          background: isOnline
            ? "linear-gradient(135deg, #065F46 0%, #047857 100%)"
            : "linear-gradient(135deg, #7C2D12 0%, #991B1B 100%)",
          border: isOnline ? "1px solid rgba(52, 211, 153, 0.4)" : "1px solid rgba(239, 68, 68, 0.4)",
        }}
      >
        <div className="py-4">
          <div
            className={`rounded-circle d-inline-flex justify-content-center align-items-center mb-3 shadow-lg ${
              isOnline ? "bg-success text-white" : "bg-danger text-white"
            }`}
            style={{ width: "90px", height: "90px", fontSize: "3rem" }}
          >
            <i className={`bi ${isOnline ? "bi-wifi" : "bi-wifi-off"}`}></i>
          </div>

          <h2 className="fw-bold mb-2 text-white">
            You are currently <span className={isOnline ? "text-warning" : "text-warning"}>{isOnline ? "ONLINE (ON DUTY)" : "OFFLINE (OFF DUTY)"}</span>
          </h2>

          <p className="text-light opacity-90 mx-auto mb-4" style={{ maxWidth: "500px", fontSize: "1rem" }}>
            {isOnline
              ? "Your vehicle is active on the map. Nearby riders will be able to dispatch ride requests to your driver portal."
              : "You will not receive any ride requests while offline. Click below to switch back online when ready to accept rides."}
          </p>

          <button
            type="button"
            className={`btn ${isOnline ? "btn-danger" : "btn-success"} btn-lg px-5 py-3.5 fw-bold rounded-pill shadow-lg`}
            onClick={() => setIsOnline(!isOnline)}
            style={{ fontSize: "1.15rem", border: "none" }}
          >
            <i className={`bi ${isOnline ? "bi-power" : "bi-play-circle-fill"} me-2`}></i>
            {isOnline ? "Switch to Offline Mode" : "Go Online Now"}
          </button>
        </div>
      </div>

      {/* Driver Status Details */}
      <div className="row g-3">
        <div className="col-md-6">
          <div className="card border-0 shadow-lg p-3.5 h-100 text-white" style={{ borderRadius: "16px", background: "#0F172A", border: "1px solid rgba(255,255,255,0.1)" }}>
            <h6 className="fw-bold text-white mb-2">
              <i className="bi bi-clock-history text-warning me-2"></i>Shift Time Active
            </h6>
            <p className="text-light opacity-75 small mb-2">
              Total active online time recorded for today.
            </p>
            <h3 className="fw-bold text-warning mb-0">6 Hours 45 Mins</h3>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border-0 shadow-lg p-3.5 h-100 text-white" style={{ borderRadius: "16px", background: "#0F172A", border: "1px solid rgba(255,255,255,0.1)" }}>
            <h6 className="fw-bold text-white mb-2">
              <i className="bi bi-check2-square text-success me-2"></i>Auto Acceptance
            </h6>
            <p className="text-light opacity-75 small mb-2">
              Automatically accept nearby incoming ride requests.
            </p>
            <div className="form-check form-switch mt-2">
              <input className="form-check-input" type="checkbox" role="switch" id="autoAcceptSwitch" defaultChecked />
              <label className="form-check-label fw-semibold text-white" htmlFor="autoAcceptSwitch">
                Auto-accept rides within 3 km
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}