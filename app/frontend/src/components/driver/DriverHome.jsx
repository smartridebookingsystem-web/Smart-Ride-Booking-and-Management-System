import React, { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { authApi } from "../services/api";

export default function DriverHome() {
  const { isOnline, setIsOnline } = useOutletContext() || { isOnline: true, setIsOnline: () => {} };

  // Ride State: "IDLE_REQUEST" (Show Request Card), "ACCEPTED" (Active Navigation), "COMPLETED"
  const [tripState, setTripState] = useState("IDLE_REQUEST");
  const [navStage, setNavStage] = useState("EN_ROUTE_PICKUP");
  const [notice, setNotice] = useState("");

  const pendingRequest = {
    id: "REQ-201",
    riderName: "Rahul Sharma",
    phone: "+91 98765 43210",
    pickup: "Sangli Railway Station",
    destination: "Vishrambag Main Road, Sangli",
    distance: "4.5 km",
    estimatedFare: "₹160",
    paymentMode: "UPI",
    vehicleType: "Sedan",
    time: "Just now",
  };

  const handleAcceptRide = async () => {
    try {
      await authApi.acceptRide(pendingRequest.id, 1);
    } catch (e) {
      console.warn("Backend sync:", e);
    }
    setTripState("ACCEPTED");
    setNotice("✅ Ride Request Accepted! GPS Navigation Started.");
    setTimeout(() => setNotice(""), 3500);
  };

  const handleDeclineRide = () => {
    setTripState("COMPLETED");
    setNotice("❌ Ride request declined.");
    setTimeout(() => setNotice(""), 3000);
  };

  const handleNextNavStage = () => {
    if (navStage === "EN_ROUTE_PICKUP") {
      setNavStage("ARRIVED");
    } else if (navStage === "ARRIVED") {
      setNavStage("TRIP_STARTED");
    } else if (navStage === "TRIP_STARTED") {
      setTripState("COMPLETED");
      setNotice("🎉 Trip Completed & Fare Recorded!");
    }
  };

  const recentRides = [
    { id: "RIDE-1092", rider: "Keshav Verma", pickup: "Sangli Bus Stand", drop: "VPIMSR College", fare: "₹250", status: "Completed", payment: "UPI", time: "10:30 AM" },
    { id: "RIDE-1091", rider: "Dhananjay Patil", pickup: "Shivaji University", drop: "Railway Station", fare: "₹180", status: "Completed", payment: "Cash", time: "09:15 AM" },
    { id: "RIDE-1090", rider: "Aniket Shinde", pickup: "Market Yard", drop: "Ganapati Temple", fare: "₹320", status: "Completed", payment: "Credit Card", time: "Yesterday" },
  ];

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("Heavy Traffic / Route Blocked");
  const [customReason, setCustomReason] = useState("");

  const cancelReasons = [
    "Heavy Traffic / Route Blocked",
    "Vehicle Mechanical Issue / Flat Tire",
    "Rider Unreachable / Wrong Pickup Location",
    "Excessive Wait Time at Pickup Point (>10 Mins)",
    "Safety Concern / Personal Emergency",
    "Other Reason",
  ];

  const handleConfirmCancel = () => {
    const finalReason = selectedReason === "Other Reason" ? customReason : selectedReason;
    if (!finalReason) return;
    setShowCancelModal(false);
    setTripState("COMPLETED");
    setNavStage("EN_ROUTE_PICKUP");
    setNotice(`❌ Ride #${pendingRequest.id} Cancelled: ${finalReason}`);
    setSelectedReason("Heavy Traffic / Route Blocked");
    setCustomReason("");
    setTimeout(() => setNotice(""), 4500);
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* Offline Status Warning Banner */}
      {!isOnline && (
        <div
          className="alert border-0 shadow-lg d-flex justify-content-between align-items-center gap-2 mb-0 rounded-4 p-3.5 text-white"
          style={{ background: "linear-gradient(135deg, #7C2D12 0%, #991B1B 100%)", border: "1px solid rgba(239, 68, 68, 0.4)" }}
        >
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-circle bg-danger bg-opacity-30 p-2.5 d-flex justify-content-center align-items-center">
              <i className="bi bi-wifi-off fs-4 text-warning"></i>
            </div>
            <div>
              <strong className="d-block text-white fs-6">YOU ARE CURRENTLY OFFLINE (OFF DUTY)</strong>
              <span className="text-light opacity-80 small">Switch back online to resume receiving live ride requests from nearby riders.</span>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-success fw-bold px-4 py-2.5 rounded-pill shadow-lg"
            onClick={() => setIsOnline(true)}
            style={{ background: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)", border: "none" }}
          >
            <i className="bi bi-power me-1.5"></i>Go Online Now
          </button>
        </div>
      )}

      {/* Dynamic Action Notification */}
      {notice && (
        <div
          className="alert border-0 shadow-lg d-flex align-items-center gap-2 mb-0 rounded-4 p-3 text-white"
          style={{
            background: notice.includes("Cancelled") ? "linear-gradient(135deg, #991B1B 0%, #7F1D1D 100%)" : "linear-gradient(135deg, #065F46 0%, #047857 100%)",
            border: notice.includes("Cancelled") ? "1px solid rgba(239, 68, 68, 0.4)" : "1px solid rgba(52, 211, 153, 0.3)"
          }}
        >
          <i className={`bi ${notice.includes("Cancelled") ? "bi-exclamation-triangle-fill text-warning" : "bi-check-circle-fill text-warning"} fs-4 me-1`}></i>
          <span className="fw-bold fs-6">{notice}</span>
        </div>
      )}

      {/* ================= HERO SHOWCASE BANNER ================= */}
      <div
        className="card border-0 shadow-lg rounded-4 overflow-hidden position-relative mb-1 text-white"
        style={{
          background: "linear-gradient(90deg, #0F172A 0%, rgba(15,23,42,0.85) 60%, rgba(15,23,42,0.4) 100%), url('/driver_hero_banner.png') center/cover no-repeat",
          minHeight: "190px",
          border: "1px solid rgba(255, 107, 0, 0.3)",
        }}
      >
        <div className="card-body p-4 d-flex flex-column justify-content-center" style={{ maxWidth: "680px" }}>
          <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
            <span className="badge bg-warning text-dark font-bold px-3 py-1.5 rounded-pill shadow-sm">
              <i className="bi bi-star-fill me-1"></i>TOP RATED DRIVER CAPTAIN
            </span>
            <span className="badge bg-success bg-opacity-80 text-white px-2.5 py-1.5 rounded-pill">
              <i className="bi bi-shield-check me-1"></i>Active Duty Ready
            </span>
          </div>
          <h2 className="fw-bold text-white mb-2" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}>
            Welcome Back, Driver Captain! 🚗
          </h2>
          <p className="text-light opacity-90 mb-3" style={{ textShadow: "0 1px 5px rgba(0,0,0,0.8)", fontSize: "0.95rem" }}>
            High demand zone detected in <strong>Sangli Central & Railway Station</strong>. Accept live ride requests to maximize your daily earnings!
          </p>
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <span className="badge bg-black bg-opacity-60 text-warning border border-warning border-opacity-30 px-3 py-2 rounded-3">
              <i className="bi bi-lightning-charge-fill me-1 text-warning"></i>Peak Fare Bonus: +15%
            </span>
            <span className="badge bg-black bg-opacity-60 text-info border border-info border-opacity-30 px-3 py-2 rounded-3">
              <i className="bi bi-geo-alt-fill me-1 text-danger"></i>Zone: Sangli Central
            </span>
          </div>
        </div>
      </div>

      {/* ================= 1. INCOMING RIDE REQUEST WORKFLOW ================= */}
      {tripState === "IDLE_REQUEST" && (
        <div
          className="card border-0 shadow-lg rounded-4 p-4 text-white position-relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
            borderLeft: "6px solid #FF6B00",
            border: "1px solid rgba(255, 107, 0, 0.3)",
            boxShadow: "0 10px 30px rgba(255, 107, 0, 0.15)",
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="badge px-3 py-2 rounded-pill fw-bold fs-6 d-flex align-items-center gap-2" style={{ background: "rgba(255, 107, 0, 0.2)", color: "#FF6B00", border: "1px solid rgba(255, 107, 0, 0.4)" }}>
              <span className="spinner-grow spinner-grow-sm text-warning" role="status"></span>
              NEW INCOMING RIDE REQUEST
            </span>
            <div className="text-end">
              <span className="text-light opacity-75 small d-block">Estimated Fare</span>
              <strong className="text-warning fs-3">{pendingRequest.estimatedFare}</strong>
              <span className="badge bg-secondary bg-opacity-40 text-light ms-2 small">{pendingRequest.paymentMode}</span>
            </div>
          </div>

          <div className="row align-items-center gy-3 mb-4">
            <div className="col-md-7">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="rounded-circle bg-warning bg-opacity-20 text-warning p-2.5 fs-4 font-bold d-flex justify-content-center align-items-center" style={{ width: "48px", height: "48px" }}>
                  <i className="bi bi-person-fill"></i>
                </div>
                <div>
                  <h4 className="fw-bold text-white mb-0">{pendingRequest.riderName}</h4>
                  <small className="text-warning"><i className="bi bi-star-fill me-1"></i>4.8 Rating • Sedan</small>
                </div>
              </div>

              {/* Pickup / Drop Route Timeline */}
              <div className="p-3 rounded-3 bg-black bg-opacity-30 border border-white border-opacity-10 d-flex flex-column gap-2.5">
                <div className="d-flex align-items-start gap-2.5">
                  <i className="bi bi-record-circle-fill text-success fs-5 mt-0.5"></i>
                  <div>
                    <small className="text-success fw-bold d-block text-uppercase" style={{ fontSize: "0.68rem" }}>Pickup Location</small>
                    <span className="fw-semibold text-white">{pendingRequest.pickup}</span>
                  </div>
                </div>
                <div className="border-start border-secondary border-opacity-40 ms-2.5 ps-3 py-0"></div>
                <div className="d-flex align-items-start gap-2.5">
                  <i className="bi bi-geo-alt-fill text-danger fs-5 mt-0.5"></i>
                  <div>
                    <small className="text-danger fw-bold d-block text-uppercase" style={{ fontSize: "0.68rem" }}>Destination</small>
                    <span className="fw-semibold text-white">{pendingRequest.destination}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-5 text-md-end d-flex flex-column gap-2 justify-content-center align-items-md-end">
              <span className="badge bg-white bg-opacity-10 text-white border border-white border-opacity-20 px-3.5 py-2 fs-6 rounded-3">
                <i className="bi bi-signpost-2 text-warning me-1.5"></i>Distance: {pendingRequest.distance}
              </span>
              <span className="badge bg-white bg-opacity-10 text-white border border-white border-opacity-20 px-3.5 py-2 fs-6 rounded-3">
                <i className="bi bi-telephone text-info me-1.5"></i>{pendingRequest.phone}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex gap-3 pt-3 border-top border-white border-opacity-10">
            <button
              type="button"
              className="btn btn-success btn-lg flex-grow-1 fw-bold py-3 rounded-3 shadow-lg d-flex justify-content-center align-items-center gap-2"
              onClick={handleAcceptRide}
              style={{
                background: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
                border: "none",
                fontSize: "1.1rem",
                boxShadow: "0 8px 24px rgba(34, 197, 94, 0.4)",
              }}
            >
              <i className="bi bi-check-circle-fill fs-5"></i>ACCEPT RIDE ({pendingRequest.estimatedFare})
            </button>

            <button
              type="button"
              className="btn btn-outline-secondary px-4 py-3 rounded-3 fw-bold text-light"
              onClick={handleDeclineRide}
              style={{ border: "1px solid rgba(255,255,255,0.2)" }}
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {/* ================= 2. ACTIVE RIDE NAVIGATION VIEW ================= */}
      {tripState === "ACCEPTED" && (
        <div
          className="card border-0 shadow-lg rounded-4 p-4 text-white position-relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
            border: "1px solid rgba(59, 130, 246, 0.4)",
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="badge bg-primary text-white px-3.5 py-2 rounded-pill fw-bold fs-6 d-flex align-items-center gap-2">
              <span className="spinner-grow spinner-grow-sm text-warning" role="status"></span>
              GPS NAVIGATION ACTIVE
            </span>
            <span className="text-warning fw-bold fs-4">{pendingRequest.estimatedFare}</span>
          </div>

          {/* Interactive GPS Route Representation Map Box */}
          <div
            className="rounded-4 p-4 mb-4 text-center position-relative overflow-hidden"
            style={{
              background: "linear-gradient(180deg, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.95) 100%), url('/driver_map_route.png') center/cover no-repeat",
              border: "1px solid rgba(59, 130, 246, 0.4)",
              minHeight: "210px",
            }}
          >
            <div className="d-flex align-items-center justify-content-between text-start mb-3">
              <div>
                <span className="text-warning fw-bold text-uppercase small d-block">Turn-By-Turn GPS Route</span>
                <h5 className="fw-bold text-white mb-0">
                  <i className="bi bi-arrow-90deg-right text-success me-2"></i>Turn Right in 200m on Vishrambag Main Road
                </h5>
              </div>
              <span className="badge bg-success px-3 py-1.5 rounded-pill fs-7">5 Mins Away</span>
            </div>

            {/* Route Path Stepper */}
            <div className="d-flex align-items-center justify-content-between position-relative px-3 py-2 bg-black bg-opacity-40 rounded-3">
              <div className={`text-center ${navStage === "EN_ROUTE_PICKUP" ? "text-warning fw-bold" : "text-success"}`}>
                <i className="bi bi-geo-alt-fill fs-5"></i>
                <div className="small">1. En-Route Pickup</div>
              </div>
              <div className="border-top border-secondary border-opacity-50 flex-grow-1 mx-2"></div>
              <div className={`text-center ${navStage === "ARRIVED" ? "text-warning fw-bold" : navStage === "TRIP_STARTED" ? "text-success" : "text-light opacity-50"}`}>
                <i className="bi bi-pin-map-fill fs-5"></i>
                <div className="small">2. Arrived Pickup</div>
              </div>
              <div className="border-top border-secondary border-opacity-50 flex-grow-1 mx-2"></div>
              <div className={`text-center ${navStage === "TRIP_STARTED" ? "text-warning fw-bold" : "text-light opacity-50"}`}>
                <i className="bi bi-flag-fill fs-5"></i>
                <div className="small">3. Destination Arrival</div>
              </div>
            </div>
          </div>

          <div className="d-flex flex-column flex-sm-row gap-3">
            <a href={`tel:${pendingRequest.phone}`} className="btn btn-outline-info px-4 py-3 rounded-3 fw-bold">
              <i className="bi bi-telephone-fill me-1"></i>Call Rider
            </a>

            <button
              type="button"
              className="btn btn-success btn-lg flex-grow-1 fw-bold py-3 rounded-3 shadow-lg"
              onClick={handleNextNavStage}
              style={{ background: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)", border: "none" }}
            >
              {navStage === "EN_ROUTE_PICKUP" && <><i className="bi bi-geo-fill me-2"></i>Mark Arrived at Pickup Point</>}
              {navStage === "ARRIVED" && <><i className="bi bi-play-circle-fill me-2"></i>Start Trip Navigation</>}
              {navStage === "TRIP_STARTED" && <><i className="bi bi-check-circle-fill me-2"></i>Complete & Save Trip Fare</>}
            </button>

            {/* Cancel Ride Button */}
            <button
              type="button"
              className="btn btn-outline-danger px-4 py-3 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-1.5"
              onClick={() => setShowCancelModal(true)}
              style={{ border: "1px solid rgba(239, 68, 68, 0.4)" }}
            >
              <i className="bi bi-x-circle-fill fs-5"></i>Cancel Ride
            </button>
          </div>
        </div>
      )}

      {/* ================= RIDE CANCELLATION REASON MODAL ================= */}
      {showCancelModal && (
        <>
          <div
            className="position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-75 fade show"
            style={{ zIndex: 1060, backdropFilter: "blur(5px)" }}
            onClick={() => setShowCancelModal(false)}
          ></div>

          <div
            className="position-fixed top-50 start-50 translate-middle text-white p-4 shadow-lg rounded-4"
            style={{
              width: "480px",
              maxWidth: "92vw",
              zIndex: 1070,
              background: "linear-gradient(180deg, #1E293B 0%, #0F172A 100%)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.7)",
            }}
          >
            <div className="d-flex justify-content-between align-items-center border-bottom border-white border-opacity-10 pb-3 mb-3">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-exclamation-triangle-fill text-danger fs-4"></i>
                <h5 className="fw-bold mb-0 text-white">Cancel Ride #{pendingRequest.id}</h5>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-light rounded-circle p-1 d-flex justify-content-center align-items-center"
                style={{ width: "30px", height: "30px" }}
                onClick={() => setShowCancelModal(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <p className="text-light opacity-80 small mb-3">
              Please select a valid cancellation reason. The rider will be notified immediately.
            </p>

            <div className="d-flex flex-column gap-2 mb-3">
              {cancelReasons.map((reason) => (
                <label
                  key={reason}
                  className={`p-3 rounded-3 border d-flex align-items-center gap-3 cursor-pointer transition-all ${
                    selectedReason === reason
                      ? "bg-danger bg-opacity-20 border-danger text-white fw-bold"
                      : "bg-black bg-opacity-30 border-white border-opacity-10 text-light opacity-90"
                  }`}
                  style={{ cursor: "pointer" }}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="form-check-input mt-0"
                  />
                  <span className="small">{reason}</span>
                </label>
              ))}
            </div>

            {selectedReason === "Other Reason" && (
              <div className="mb-3">
                <textarea
                  className="form-control bg-dark text-white border-secondary"
                  rows="2"
                  placeholder="Enter specific cancellation reason..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  required
                ></textarea>
              </div>
            )}

            <div className="d-flex gap-2 pt-2 border-top border-white border-opacity-10">
              <button
                type="button"
                className="btn btn-secondary flex-grow-1 fw-bold py-2.5 rounded-3"
                onClick={() => setShowCancelModal(false)}
              >
                Go Back
              </button>

              <button
                type="button"
                className="btn btn-danger flex-grow-1 fw-bold py-2.5 rounded-3 d-flex align-items-center justify-content-center gap-2"
                onClick={handleConfirmCancel}
              >
                <i className="bi bi-x-circle-fill"></i>Confirm Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {/* ================= 3. VIBRANT KPI STAT METRIC CARDS ================= */}
      <div className="row g-3">
        <div className="col-6 col-md-3">
          <div
            className="card border-0 shadow-lg rounded-4 p-3 text-white"
            style={{
              background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
              border: "1px solid rgba(255, 107, 0, 0.3)",
            }}
          >
            <small className="text-light opacity-75 d-block font-semibold mb-1" style={{ fontSize: "0.75rem" }}>Today's Revenue</small>
            <h3 className="fw-bold text-warning mb-0">₹1,250</h3>
            <small className="text-success fw-semibold mt-1 d-block" style={{ fontSize: "0.7rem" }}><i className="bi bi-graph-up-arrow me-1"></i>+18% vs Yesterday</small>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div
            className="card border-0 shadow-lg rounded-4 p-3 text-white"
            style={{
              background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
            }}
          >
            <small className="text-light opacity-75 d-block font-semibold mb-1" style={{ fontSize: "0.75rem" }}>Trips Completed</small>
            <h3 className="fw-bold text-success mb-0">8 Rides</h3>
            <small className="text-light opacity-75 fw-semibold mt-1 d-block" style={{ fontSize: "0.7rem" }}><i className="bi bi-check2-circle me-1"></i>100% Acceptance</small>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div
            className="card border-0 shadow-lg rounded-4 p-3 text-white"
            style={{
              background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
            }}
          >
            <small className="text-light opacity-75 d-block font-semibold mb-1" style={{ fontSize: "0.75rem" }}>Active Shift</small>
            <h3 className="fw-bold text-info mb-0">6.5 Hrs</h3>
            <small className="text-light opacity-75 fw-semibold mt-1 d-block" style={{ fontSize: "0.7rem" }}><i className="bi bi-clock-history me-1"></i>On Duty Today</small>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div
            className="card border-0 shadow-lg rounded-4 p-3 text-white"
            style={{
              background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
              border: "1px solid rgba(234, 179, 8, 0.3)",
            }}
          >
            <small className="text-light opacity-75 d-block font-semibold mb-1" style={{ fontSize: "0.75rem" }}>Driver Rating</small>
            <h3 className="fw-bold text-warning mb-0">4.95 ★</h3>
            <small className="text-light opacity-75 fw-semibold mt-1 d-block" style={{ fontSize: "0.7rem" }}><i className="bi bi-star-fill text-warning me-1"></i>124 Reviews</small>
          </div>
        </div>
      </div>

      {/* ================= DRIVER REWARDS & PERFORMANCE SHOWCASE ================= */}
      <div className="row g-3">
        <div className="col-md-7">
          <div
            className="card border-0 shadow-lg rounded-4 p-4 text-white h-100 position-relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)",
              border: "1px solid rgba(234, 179, 8, 0.3)",
              boxShadow: "0 10px 30px rgba(234, 179, 8, 0.1)",
            }}
          >
            <div className="row align-items-center">
              <div className="col-sm-7">
                <span className="badge bg-warning text-dark fw-bold px-3 py-1.5 rounded-pill mb-2 shadow-sm">
                  <i className="bi bi-trophy-fill me-1"></i>WEEKLY CAPTAIN REWARDS
                </span>
                <h4 className="fw-bold text-white mb-2">Gold Tier Driver Status</h4>
                <p className="text-light opacity-80 small mb-3">
                  Complete 5 more trips this week to unlock ₹500 fuel cash bonus & 0% commission on weekend rides!
                </p>
                <div className="progress mb-2 bg-dark border border-secondary border-opacity-30" style={{ height: "10px", borderRadius: "10px" }}>
                  <div className="progress-bar bg-warning progress-bar-striped progress-bar-animated" role="progressbar" style={{ width: "75%" }}></div>
                </div>
                <small className="text-warning fw-bold d-block">15 / 20 Trips Completed (75%)</small>
              </div>
              <div className="col-sm-5 text-center mt-3 mt-sm-0">
                <img
                  src="/driver_rewards.png"
                  alt="Driver Rewards Tier"
                  className="img-fluid rounded-4 shadow-lg border border-warning border-opacity-30"
                  style={{ maxHeight: "135px", objectFit: "cover" }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-5">
          <div
            className="card border-0 shadow-lg rounded-4 p-4 text-white h-100 position-relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
              border: "1px solid rgba(59, 130, 246, 0.35)",
            }}
          >
            <div className="d-flex align-items-center gap-3">
              <img
                src="/driver_avatar.png"
                alt="Driver Avatar"
                className="rounded-circle shadow-lg border border-2 border-warning"
                style={{ width: "64px", height: "64px", objectFit: "cover" }}
              />
              <div>
                <h5 className="fw-bold text-white mb-0">Dhananjay Patil</h5>
                <small className="text-warning"><i className="bi bi-star-fill me-1"></i>4.95 Rating (124 Reviews)</small>
                <span className="badge bg-success bg-opacity-20 text-success border border-success border-opacity-30 d-block mt-1 small">
                  Verified Captain
                </span>
              </div>
            </div>
            <hr className="border-secondary border-opacity-30 my-3" />
            <div className="d-flex justify-content-between text-center">
              <div>
                <small className="text-light opacity-75 d-block" style={{ fontSize: "0.7rem" }}>Total Rides</small>
                <strong className="text-white fs-6">342</strong>
              </div>
              <div className="border-end border-secondary border-opacity-30"></div>
              <div>
                <small className="text-light opacity-75 d-block" style={{ fontSize: "0.7rem" }}>Accept Rate</small>
                <strong className="text-success fs-6">98%</strong>
              </div>
              <div className="border-end border-secondary border-opacity-30"></div>
              <div>
                <small className="text-light opacity-75 d-block" style={{ fontSize: "0.7rem" }}>Cancel Rate</small>
                <strong className="text-info fs-6">0.8%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 4. RECENT COMPLETED RIDES TABLE ================= */}
      <div
        className="card border-0 shadow-lg rounded-4 p-4 text-white"
        style={{
          background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom border-white border-opacity-10">
          <h5 className="fw-bold mb-0 text-white">
            <i className="bi bi-clock-history me-2 text-warning"></i>Recent Completed Trips
          </h5>
          <Link to="/driver/earnings" className="btn btn-outline-warning btn-sm rounded-pill px-3">
            View Earnings Wallet <i className="bi bi-arrow-right me-1"></i>
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle mb-0" style={{ background: "transparent" }}>
            <thead>
              <tr className="text-light opacity-75 border-bottom border-white border-opacity-10">
                <th>Passenger</th>
                <th>Pickup & Destination Route</th>
                <th>Fare Amount</th>
                <th>Payment Mode</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentRides.map((ride) => (
                <tr key={ride.id} className="border-bottom border-white border-opacity-10">
                  <td className="fw-bold text-white">{ride.rider}</td>
                  <td>
                    <small className="d-block text-white fw-semibold">{ride.pickup}</small>
                    <small className="text-light opacity-75">{ride.drop}</small>
                  </td>
                  <td className="fw-bold text-warning fs-6">{ride.fare}</td>
                  <td><span className="badge bg-info bg-opacity-20 text-info px-2.5 py-1 rounded-pill">{ride.payment}</span></td>
                  <td>
                    <span className="badge bg-success px-2.5 py-1 rounded-pill">
                      {ride.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}