import React from "react";

export default function DriverIncomingRequest({
  pendingRequest,
  countdown,
  showFareBreakdown,
  setShowFareBreakdown,
  isMuted,
  handleToggleMute,
  handleTestSound,
  handleAcceptRide,
  handleDeclineRide,
}) {
  if (!pendingRequest) {
    return (
      <div
        className="card border-0 shadow-lg rounded-4 p-4 text-white text-center"
        style={{
          background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div className="py-4">
          <i className="bi bi-inbox text-warning mb-2" style={{ fontSize: "3rem" }}></i>
          <h5 className="fw-bold text-white mb-1">No Active Incoming Ride Requests</h5>
          <p className="text-light opacity-75 small mb-0">
            You are online and ready! New ride bookings placed by nearby riders will automatically pop up here with real-time sound alerts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="card border-0 shadow-lg rounded-4 p-4 text-white position-relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
        borderLeft: "6px solid #FF6B00",
        border: "1px solid rgba(255, 107, 0, 0.3)",
        boxShadow: "0 10px 30px rgba(255, 107, 0, 0.15)",
      }}
    >
      {/* Header Row */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-3 gap-2">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className="badge px-3 py-2 rounded-pill fw-bold fs-6 d-flex align-items-center gap-2"
            style={{ background: "rgba(255, 107, 0, 0.2)", color: "#FF6B00", border: "1px solid rgba(255, 107, 0, 0.4)" }}>
            <span className="spinner-grow spinner-grow-sm text-warning" role="status"></span>
            NEW INCOMING RIDE REQUEST
          </span>
          <button type="button"
            className={`btn btn-sm fw-bold rounded-pill px-2 py-1 d-flex align-items-center gap-1 ${isMuted ? "btn-outline-danger" : "btn-warning text-dark"}`}
            onClick={handleToggleMute} title="Toggle Ringtone Audio">
            <i className={`bi ${isMuted ? "bi-volume-mute-fill" : "bi-volume-up-fill"}`}></i>
            <span style={{ fontSize: "0.75rem" }}>{isMuted ? "Muted" : "Ringtone Playing 🔔"}</span>
          </button>
          <button type="button"
            className="btn btn-sm btn-outline-light text-light rounded-pill px-2 py-1 d-flex align-items-center gap-1"
            onClick={handleTestSound} title="Test Ringtone Chime" style={{ fontSize: "0.75rem" }}>
            <i className="bi bi-music-note-beaming text-warning"></i>
            <span>Test Sound</span>
          </button>
        </div>
        <div className="text-sm-end">
          <span className="text-light opacity-75 small d-block">Estimated Fare</span>
          <strong className="text-warning fs-3">{pendingRequest.estimatedFare}</strong>
          <span className="badge bg-secondary bg-opacity-40 text-light ms-2 small">{pendingRequest.paymentMode}</span>
        </div>
      </div>

      {/* Countdown */}
      <div className="mb-3 p-2 rounded-3 bg-black bg-opacity-30 border border-warning border-opacity-20">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <small className="text-warning fw-bold">
            <i className="bi bi-stopwatch-fill me-1"></i>Acceptance Window:{" "}
            <span className="fs-6 text-white">{countdown}s</span>
          </small>
          <small className="text-light opacity-75">Auto-expires if unaccepted</small>
        </div>
        <div className="progress" style={{ height: "6px", backgroundColor: "rgba(255,255,255,0.1)" }}>
          <div
            className={`progress-bar progress-bar-striped progress-bar-animated ${countdown <= 15 ? "bg-danger" : "bg-warning"}`}
            style={{ width: `${(countdown / 60) * 100}%`, transition: "width 1s linear" }}></div>
        </div>
      </div>

      {/* Rider + Route Details */}
      <div className="row align-items-center gy-3 mb-4">
        <div className="col-md-7">
          <div className="d-flex align-items-center gap-3 mb-3">
            <div className="rounded-circle bg-warning bg-opacity-20 text-warning fs-4 d-flex justify-content-center align-items-center"
              style={{ width: "48px", height: "48px" }}>
              <i className="bi bi-person-fill"></i>
            </div>
            <div>
              <h4 className="fw-bold text-white mb-0">{pendingRequest.riderName}</h4>
              <small className="text-warning"><i className="bi bi-star-fill me-1"></i>4.8 Rating • {pendingRequest.vehicleType}</small>
            </div>
          </div>
          <div className="p-3 rounded-3 bg-black bg-opacity-30 border border-white border-opacity-10 d-flex flex-column gap-2">
            <div className="d-flex align-items-start gap-2">
              <i className="bi bi-record-circle-fill text-success fs-5 mt-1"></i>
              <div>
                <small className="text-success fw-bold d-block text-uppercase" style={{ fontSize: "0.68rem" }}>Pickup Location</small>
                <span className="fw-semibold text-white">{pendingRequest.pickup}</span>
              </div>
            </div>
            <div className="border-start border-secondary border-opacity-40 ms-2 ps-3"></div>
            <div className="d-flex align-items-start gap-2">
              <i className="bi bi-geo-alt-fill text-danger fs-5 mt-1"></i>
              <div>
                <small className="text-danger fw-bold d-block text-uppercase" style={{ fontSize: "0.68rem" }}>Destination</small>
                <span className="fw-semibold text-white">{pendingRequest.destination}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-5 text-md-end d-flex flex-column gap-2 justify-content-center align-items-md-end">
          <span className="badge bg-white bg-opacity-10 text-white border border-white border-opacity-20 px-3 py-2 fs-6 rounded-3">
            <i className="bi bi-signpost-2 text-warning me-2"></i>Distance: {pendingRequest.distance}
          </span>
          <div className="d-flex align-items-center gap-2 flex-wrap justify-content-md-end">
            <a href={`tel:${pendingRequest.phone}`} className="btn btn-sm btn-outline-info rounded-pill px-3 py-1 fw-bold">
              <i className="bi bi-telephone-fill me-1"></i>Call Rider
            </a>
            <a href={`sms:${pendingRequest.phone}`} className="btn btn-sm btn-outline-light rounded-pill px-3 py-1 fw-bold">
              <i className="bi bi-chat-text-fill me-1"></i>SMS
            </a>
          </div>
          <button type="button" className="btn btn-link text-warning p-0 text-decoration-none small fw-bold mt-1"
            onClick={() => setShowFareBreakdown(!showFareBreakdown)}>
            <i className={`bi ${showFareBreakdown ? "bi-chevron-up" : "bi-chevron-down"} me-1`}></i>
            {showFareBreakdown ? "Hide Fare Breakdown" : "View Net Fare Breakdown"}
          </button>
        </div>
      </div>

      {/* Fare Breakdown */}
      {showFareBreakdown && (
        <div className="mb-3 p-3 rounded-3 bg-black bg-opacity-40 border border-warning border-opacity-30">
          {[
            { label: "Base Fare", value: "₹50.00", cls: "text-white" },
            { label: "Distance Fare (4.5 km @ ₹20/km)", value: "₹90.00", cls: "text-white" },
            { label: "Peak Hour Surge (+15%)", value: "+₹20.00", cls: "text-success" },
            { label: "SmartRide Platform Fee", value: "-₹15.00", cls: "text-danger" },
          ].map(({ label, value, cls }) => (
            <div key={label} className="d-flex justify-content-between align-items-center mb-1">
              <small className="text-light opacity-75">{label}</small>
              <small className={`fw-bold ${cls}`}>{value}</small>
            </div>
          ))}
          <hr className="border-secondary border-opacity-40 my-2" />
          <div className="d-flex justify-content-between align-items-center">
            <strong className="text-warning">Net Driver Earnings</strong>
            <strong className="text-warning fs-5">₹145.00</strong>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="d-flex gap-3 pt-3 border-top border-white border-opacity-10">
        <button type="button"
          className="btn btn-success btn-lg flex-grow-1 fw-bold py-3 rounded-3 shadow-lg d-flex justify-content-center align-items-center gap-2"
          onClick={handleAcceptRide}
          style={{ background: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)", border: "none", fontSize: "1.1rem", boxShadow: "0 8px 24px rgba(34, 197, 94, 0.4)" }}>
          <i className="bi bi-check-circle-fill fs-5"></i>ACCEPT RIDE
        </button>
        <button type="button"
          className="btn btn-outline-secondary px-4 py-3 rounded-3 fw-bold text-light"
          onClick={handleDeclineRide}
          style={{ border: "1px solid rgba(255,255,255,0.2)" }}>
          Decline
        </button>
      </div>
    </div>
  );
}
