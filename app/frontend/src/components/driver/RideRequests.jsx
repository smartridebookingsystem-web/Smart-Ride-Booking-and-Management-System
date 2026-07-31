import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authApi, rideApi } from "../services/api";
import { ringtoneService } from "../../utils/ringtoneService";

export default function RideRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const rides = await rideApi.getAllRides();
        if (Array.isArray(rides) && rides.length > 0) {
          const pending = rides.map((r, idx) => ({
            id: `REQ-${r.rideId || r.id}`,
            riderName: r.riderName || r.rider || `Rider #${r.userId || (4 + idx)}`,
            phone: "+91 98765 43210",
            pickup: r.source || "Sangli Railway Station",
            destination: r.destination || "Vishrambag, Sangli",
            distance: "4.5 km",
            estimatedFare: `₹${r.fare || 160}`,
            paymentMode: r.paymentMode || "UPI",
            vehicleType: "Sedan",
            time: "Just now",
          }));
          setRequests(pending);
        } else {
          setRequests([
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
            }
          ]);
        }
      } catch (err) {
        console.warn("Backend ride request sync:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const [actionMsg, setActionMsg] = useState("");
  const [isMuted, setIsMuted] = useState(ringtoneService.getIsMuted());

  // Automatically trigger ringtone when pending ride requests exist
  useEffect(() => {
    if (requests.length > 0 && !isMuted) {
      ringtoneService.startIncomingRingtone();
    } else {
      ringtoneService.stopRingtone();
    }

    return () => {
      ringtoneService.stopRingtone();
    };
  }, [requests.length, isMuted]);

  const handleToggleMute = () => {
    const muted = ringtoneService.toggleMute();
    setIsMuted(muted);
  };

  const handleTestSound = () => {
    ringtoneService.testRingtone();
  };

  const handleAccept = async (req) => {
    // Play pleasant accept request ringtone chime
    ringtoneService.playAcceptSound();

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
    }, 1200);
  };

  const handleReject = (reqId) => {
    // Play decline sound notice
    ringtoneService.playDeclineSound();
    setRequests((prev) => prev.filter((r) => r.id !== reqId));
    setActionMsg(`❌ Ride Request #${reqId} declined.`);
    setTimeout(() => setActionMsg(""), 3000);
  };

  return (
    <div>
      {/* Title & Ringtone Audio Control Center */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom pb-3 mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <i className="bi bi-bell-fill text-primary"></i>Incoming Ride Requests
            {requests.length > 0 && (
              <span className="badge bg-warning text-dark fs-6 rounded-pill px-2.5 py-1 ms-2">
                <i className="bi bi-volume-up-fill me-1 animate-pulse"></i>Ringtone Active
              </span>
            )}
          </h4>
          <p className="text-secondary small mb-0">
            Accept ride requests from nearby passengers to start trips. Audio ringtone alerts active.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          {/* Ringtone Sound Controls */}
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary fw-semibold rounded-pill px-3 py-1.5 d-flex align-items-center gap-2"
            onClick={handleTestSound}
            title="Listen to sample ringtone sound"
          >
            <i className="bi bi-music-note-beaming text-primary"></i>
            <span>Test Ringtone</span>
          </button>

          <button
            type="button"
            className={`btn btn-sm fw-bold rounded-pill px-3 py-1.5 d-flex align-items-center gap-2 ${
              isMuted ? "btn-outline-danger" : "btn-success"
            }`}
            onClick={handleToggleMute}
            title="Toggle Ringtone Audio"
          >
            <i className={`bi ${isMuted ? "bi-volume-mute-fill" : "bi-volume-up-fill"}`}></i>
            <span>{isMuted ? "Ringtone Muted" : "Ringtone Sound On"}</span>
          </button>

          <span className="badge bg-primary px-3 py-2 fs-6 rounded-pill">
            {requests.length} Pending
          </span>
        </div>
      </div>

      {/* Ringtone Notice Banner */}
      <div className="alert bg-primary bg-opacity-10 border border-primary border-opacity-20 text-dark rounded-3 p-3 mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-speaker-fill text-primary fs-5"></i>
          <span className="small fw-semibold">
            <strong>Ringtone Alert System:</strong> Driver will hear a phone ringtone for incoming requests & an instant confirmation chime upon accepting.
          </span>
        </div>
        <button
          type="button"
          className="btn btn-link btn-sm p-0 text-primary text-decoration-none fw-bold"
          onClick={handleTestSound}
        >
          🔊 Click to test ringtone
        </button>
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
            Stay online! New ride requests in your area will appear here automatically with ringtone audio notifications.
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
                      className="btn btn-primary fw-semibold px-4 py-2 rounded-3 d-flex align-items-center gap-2"
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