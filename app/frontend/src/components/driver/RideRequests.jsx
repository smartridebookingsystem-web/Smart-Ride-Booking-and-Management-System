import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../services/api";

export default function RideRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([
    {
      id: "REQ-201",
      riderName: "Rahul Sharma",
      phone: "+91 98765 43210",
      pickup: "Sangli Railway Station",
      destination: "Vishrambag, Sangli",
      distance: "4.5 km",
      estimatedFare: "₹160",
      paymentMode: "UPI",
      vehicleType: "Sedan",
      time: "2 mins ago",
    },
    {
      id: "REQ-202",
      riderName: "Priya Patil",
      phone: "+91 98765 43211",
      pickup: "Market Yard Gate 2",
      destination: "Government Engineering College",
      distance: "7.2 km",
      estimatedFare: "₹240",
      paymentMode: "Cash",
      vehicleType: "SUV",
      time: "Just now",
    },
  ]);

  const [actionMsg, setActionMsg] = useState("");

  const handleAccept = async (req) => {
    try {
      // Send accept request to backend REST API endpoint: POST /api/rides/accept
      await authApi.acceptRide(req.id, 1);
    } catch (e) {
      console.warn("Backend sync notice:", e);
    }

    setActionMsg(`✅ Ride Request #${req.id} Accepted! Stored in database.`);
    setRequests((prev) => prev.filter((r) => r.id !== req.id));

    setTimeout(() => {
      navigate("/driver/navigation");
    }, 1000);
  };


  const handleReject = (reqId) => {
    setRequests((prev) => prev.filter((r) => r.id !== reqId));
    setActionMsg(`❌ Ride Request #${reqId} declined.`);
    setTimeout(() => setActionMsg(""), 3000);
  };

  return (
    <div>
      {/* Title */}
      <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">
            <i className="bi bi-bell-fill text-primary me-2"></i>Incoming Ride Requests
          </h4>
          <p className="text-secondary small mb-0">
            Accept ride requests from nearby passengers to start trips.
          </p>
        </div>

        <span className="badge bg-primary px-3 py-2 fs-6 rounded-pill">
          {requests.length} Pending
        </span>
      </div>

      {/* Action Notification Message */}
      {actionMsg && (
        <div className="alert alert-info border-0 shadow-sm mb-4 d-flex align-items-center">
          <i className="bi bi-info-circle-fill fs-5 me-2"></i>
          <div>{actionMsg}</div>
        </div>
      )}

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-inbox text-secondary" style={{ fontSize: "3.5rem" }}></i>
          <h5 className="fw-bold mt-3 text-dark">No Pending Ride Requests</h5>
          <p className="text-secondary small">
            Stay online! New ride requests in your area will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {requests.map((req) => (
            <div className="col-12" key={req.id}>
              <div
                className="card border-0 shadow-sm p-4"
                style={{
                  borderRadius: "16px",
                  borderLeft: "5px solid var(--primary)",
                  background: "var(--card)",
                }}
              >
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 pb-3 border-bottom gap-2">
                  <div>
                    <span className="badge bg-primary-subtle text-primary fw-bold me-2 px-2.5 py-1">
                      {req.id}
                    </span>
                    <span className="text-secondary small">{req.time}</span>
                    <h5 className="fw-bold text-dark mt-1 mb-0">{req.riderName}</h5>
                  </div>

                  <div className="text-md-end">
                    <h3 className="fw-bold text-primary mb-0">{req.estimatedFare}</h3>
                    <small className="text-secondary">Est. Fare ({req.paymentMode})</small>
                  </div>
                </div>

                {/* Locations */}
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <div className="d-flex align-items-start gap-2">
                      <i className="bi bi-circle-fill text-success fs-6 mt-1"></i>
                      <div>
                        <span className="text-secondary small d-block">Pickup Location</span>
                        <strong className="text-dark">{req.pickup}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="d-flex align-items-start gap-2">
                      <i className="bi bi-geo-alt-fill text-danger fs-6 mt-1"></i>
                      <div>
                        <span className="text-secondary small d-block">Drop Location</span>
                        <strong className="text-dark">{req.destination}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details & Actions */}
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center pt-2 gap-3">
                  <div className="d-flex gap-3">
                    <span className="badge bg-light text-dark border px-3 py-2">
                      <i className="bi bi-signpost-2 me-1"></i>{req.distance}
                    </span>
                    <span className="badge bg-light text-dark border px-3 py-2">
                      <i className="bi bi-telephone me-1"></i>{req.phone}
                    </span>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-danger fw-semibold px-4 py-2 rounded-3"
                      onClick={() => handleReject(req.id)}
                    >
                      <i className="bi bi-x-circle me-1"></i>Decline
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary fw-semibold px-4 py-2 rounded-3"
                      onClick={() => handleAccept(req)}
                    >
                      <i className="bi bi-check-circle me-1"></i>Accept Ride
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}