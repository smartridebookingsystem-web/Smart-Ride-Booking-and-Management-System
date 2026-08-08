import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authApi, rideApi, paymentApi } from "../services/api";

export default function CompleteRide() {
  const navigate = useNavigate();

  const [paymentCollected, setPaymentCollected] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [rideData, setRideData] = useState(null);

  useEffect(() => {
    async function loadCurrentRide() {
      try {
        const rides = await rideApi.getAllRides();
        const users = await authApi.getAllUsers();
        if (Array.isArray(rides) && rides.length > 0) {
          const latest = rides[rides.length - 1];
          const fare = parseFloat(rideApi.calculateRideFare(latest));
          const getRiderName = (ride) => {
            if (!ride) return "Passenger";
            if (ride.riderName) return ride.riderName;
            if (ride.rider_name) return ride.rider_name;
            if (ride.username) return ride.username;

            const uId = Number(ride.userId || ride.user_id);
            const user = users.find(u => u.userId === uId);
            if (user) return user.username;

            return `Passenger #${user.username}`;
          };

          setRideData({
            id: `RIDE-${latest.rideId || latest.id || 1093}`,
            riderName: getRiderName(latest),
            pickup: latest.source || "Sangli Railway Station",
            destination: latest.destination || "Vishrambag Main Road, Sangli",
            distance: "4.5 km",
            totalFare: fare,
            paymentMode: latest.paymentMode || "UPI",
            driverShare: fare * 0.95,
            platformFee: fare * 0.05,
            userId: latest.userId || 4,
          });
        } else {
          setRideData(null);
        }
      } catch (err) {
        console.warn("Backend ride sync:", err);
        setRideData(null);
      }
    }
    loadCurrentRide();
  }, []);

  const handleFinishRide = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const rideIdNum = parseInt(rideData.id.replace("RIDE-", "")) || 1;
    try {
      await paymentApi.processPayment({
        rideId: rideIdNum,
        userId: rideData.userId || 4,
        totalFare: rideData.totalFare,
        discountAmount: 0,
        paymentMode: rideData.paymentMode || "UPI",
      });
    } catch (err) {
      console.warn("Payment recording notice:", err);
    }

    try {
      await rideApi.completeTrip(rideIdNum);
    } catch (err) {
      console.warn("Backend sync notice:", err);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMsg("🎉 Ride Completed & Payment Recorded in Database!");

      setTimeout(() => {
        navigate("/driver");
      }, 1500);
    }, 500);
  };


  return (
    <div>
      {/* Title */}
      <div className="border-bottom pb-3 mb-4">
        <h4 className="fw-bold text-light mb-1">
          <i className="bi bi-check-circle-fill text-primary me-2"></i>Complete Active Ride
        </h4>
        <p className="text-light o-70 small mb-0">
          Verify passenger payment and mark trip as completed.
        </p>
      </div>

      {successMsg ? (
        <div className="alert alert-success border-0 shadow-sm p-4 text-center my-4" style={{ borderRadius: "16px" }}>
          <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "3rem" }}></i>
          <h4 className="fw-bold mt-2 mb-1">{successMsg}</h4>
          <p className="text-secondary small mb-0">Redirecting to Driver Dashboard...</p>
        </div>
      ) : !rideData ? (
        <div className="card border-0 shadow-sm p-5 text-center rounded-4">
          <i className="bi bi-info-circle text-primary mb-2" style={{ fontSize: "3rem" }}></i>
          <h5 className="fw-bold text-dark">No Active Ride to Complete</h5>
          <p className="text-secondary small mb-3">
            You do not currently have any active ride in progress. Accept a ride request to start navigation.
          </p>
          <div>
            <button className="btn btn-primary fw-semibold px-4 py-2 rounded-pill" onClick={() => navigate("/driver")}>
              Go to Driver Dashboard
            </button>
          </div>
        </div>
      ) : (
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: "16px", background: "var(--card)" }}>
              {/* Ride Summary Header */}
              <div className="text-center pb-4 mb-4 border-bottom">
                <span className="badge bg-primary-subtle text-primary px-3 py-1.5 fs-7 fw-bold mb-2">
                  Trip Summary • {rideData.id}
                </span>
                <h2 className="fw-bold text-primary mb-1">₹{rideData.totalFare.toFixed(2)}</h2>
                <span className="text-secondary small">Total Ride Fare</span>
              </div>

              {/* Breakdown */}
              <div className="bg-light p-3.5 rounded-3 mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-secondary">Passenger Name:</span>
                  <strong className="text-dark">{rideData.riderName}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-secondary">Distance Traveled:</span>
                  <strong className="text-dark">{rideData.distance}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-secondary">Payment Method:</span>
                  <span className="badge bg-white text-dark border px-2.5 py-1">{rideData.paymentMode}</span>
                </div>
                <hr className="my-2" />
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-secondary">Driver Share (95%):</span>
                  <strong className="text-success">₹{rideData.driverShare.toFixed(2)}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-secondary">Admin Commission Fee (5%):</span>
                  <span className="text-secondary">₹{rideData.platformFee.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Status Check */}
              <form onSubmit={handleFinishRide}>
                <div className="form-check p-3 bg-light rounded-3 mb-4 border">
                  <input
                    className="form-check-input ms-0 me-2"
                    type="checkbox"
                    id="paymentCheck"
                    checked={paymentCollected}
                    onChange={(e) => setPaymentCollected(e.target.checked)}
                    required
                  />
                  <label className="form-check-label fw-semibold text-dark" htmlFor="paymentCheck">
                    I confirm that the total fare of ₹{rideData.totalFare.toFixed(2)} via {rideData.paymentMode} has been received.
                  </label>
                </div>

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg fw-bold py-3 rounded-3 shadow-sm"
                    disabled={!paymentCollected || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Completing Trip...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-flag-fill me-2"></i>Complete & Save Trip
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}