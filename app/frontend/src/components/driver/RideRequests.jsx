
// src/components/driver/RideRequests.jsx

import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { rideApi } from "../services/api";
import { getDriverIdFromUser, saveActiveRideMeta } from "../../utils/rideFlow";

export default function RideRequests() {
  const { user } = useSelector((state) => state.auth || {});
  const navigate = useNavigate();

  const driverId = getDriverIdFromUser(user);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingRideId, setAcceptingRideId] = useState(null);
  const [error, setError] = useState("");

  /*
   * ============================================================
   * FETCH RIDE REQUESTS
   * ============================================================
   *
   * Backend:
   * GET /api/rides
   *
   * New rides are created with:
   * status = 0
   *
   * Therefore we display:
   * status === 0
   *
   * We do NOT use status === 2 here because your backend uses
   * status 2 for "In Progress".
   */
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      console.log(
        "%c[Driver] 🔄 Fetching ride requests...",
        "color: #3b82f6; font-weight: bold;"
      );

      const response = await rideApi.getAllRides();

      console.log(
        "%c[Driver] 📥 All rides received:",
        "color: #10b981; font-weight: bold;",
        response
      );

      /*
       * Backend returns:
       *
       * [
       *   {
       *     rideId,
       *     userId,
       *     vehicleId,
       *     source,
       *     destination,
       *     status,
       *     driverId
       *   }
       * ]
       */

      const allRides = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];

      /*
       * Only status 0 = Requested rides.
       */
      const pendingRequests = allRides.filter(
        (ride) => Number(ride.status) === 0
      );

      console.log(
        "%c[Driver] 🚕 Pending ride requests:",
        "color: #f59e0b; font-weight: bold;",
        pendingRequests
      );

      setRequests(pendingRequests);
    } catch (err) {
      console.error(
        "[Driver] ❌ Failed to fetch ride requests:",
        err
      );

      setError(
        err?.message ||
        "Unable to load ride requests."
      );

      setRequests([]);
    } finally {
      /*
       * IMPORTANT:
       *
       * This fixes:
       *
       * ReferenceError:
       * setLoading is not defined
       */
      setLoading(false);
    }
  }, []);

  /*
   * Load requests when component opens.
   */
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  /*
   * ============================================================
   * AUTO REFRESH
   * ============================================================
   *
   * Check for new rider requests every 5 seconds.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRequests();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchRequests]);

  /*
   * ============================================================
   * ACCEPT RIDE
   * ============================================================
   */
  const handleAcceptRide = async (ride) => {
    if (!ride?.rideId) {
      alert("Invalid ride ID.");
      return;
    }

    if (!driverId) {
      alert(
        "Driver information is not available. Please login again."
      );
      return;
    }

    const confirmed = window.confirm(
      `Accept ride from "${ride.source}" to "${ride.destination}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setAcceptingRideId(ride.rideId);

      // Generate 4-digit trip OTP when driver accepts request
      const generatedOtp = String(Math.floor(1000 + Math.random() * 9000));
      sessionStorage.setItem(`otp_${ride.rideId}`, generatedOtp);
      localStorage.setItem(`otp_${ride.rideId}`, generatedOtp);

      console.log(
        "%c[Driver] ✅ Accepting ride & OTP generated:",
        "color: #22c55e; font-weight: bold;",
        {
          rideId: ride.rideId,
          driverId,
          otp: generatedOtp,
        }
      );

      const updatedRide =
        await rideApi.acceptRide(
          ride.rideId,
          driverId
        );

      console.log(
        "%c[Driver] 🎉 Ride accepted:",
        "color: #22c55e; font-weight: bold;",
        updatedRide
      );

      saveActiveRideMeta(ride.rideId, {
        rideId: ride.rideId,
        status: 3,
        source: ride.source,
        destination: ride.destination,
        driverId,
      });

      /*
       * Remove the accepted ride from the
       * pending request list immediately.
       */
      setRequests((previous) =>
        previous.filter(
          (item) =>
            item.rideId !== ride.rideId
        )
      );

      alert(
        `Ride #${ride.rideId} accepted successfully.`
      );
      navigate("/driver/navigation", { state: { rideId: ride.rideId } });
    } catch (err) {
      console.error(
        "[Driver] ❌ Failed to accept ride:",
        err
      );

      alert(
        err?.message ||
        "Failed to accept ride."
      );
    } finally {
      setAcceptingRideId(null);
    }
  };

  /*
   * ============================================================
   * STATUS LABEL
   * ============================================================
   */
  const getStatusLabel = (status) => {
    switch (Number(status)) {
      case 0:
        return "Requested";

      case 1:
        return "Completed";

      case 2:
        return "In Progress";

      case 3:
        return "Accepted";

      default:
        return "Unknown";
    }
  };

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */
  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
          <div
            className="spinner-border text-warning mb-3"
            role="status"
          />

          <h5 className="fw-bold">
            Loading Ride Requests...
          </h5>

          <p className="text-muted mb-0">
            Checking for available rider requests.
          </p>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */
  return (
    <div className="container-fluid py-3">

      {/* ======================================================
          HEADER
          ====================================================== */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">

        <div>
          <h4 className="fw-bold mb-1">
            <i className="bi bi-bell-fill text-warning me-2" />
            Ride Requests
          </h4>

          <p className="text-muted small mb-0">
            New rider booking requests will appear here.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">

          <span className="badge bg-warning text-dark px-3 py-2">
            <i className="bi bi-hourglass-split me-1" />
            {requests.length} Pending
          </span>

          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={fetchRequests}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-1" />
            Refresh
          </button>

        </div>
      </div>

      {/* ======================================================
          ERROR
          ====================================================== */}
      {error && (
        <div
          className="alert alert-danger d-flex justify-content-between align-items-center"
          role="alert"
        >
          <div>
            <i className="bi bi-exclamation-triangle-fill me-2" />
            {error}
          </div>

          <button
            className="btn btn-sm btn-danger"
            onClick={fetchRequests}
          >
            Retry
          </button>
        </div>
      )}

      {/* ======================================================
          DRIVER INFORMATION
          ====================================================== */}
      {driverId && (
        <div className="alert alert-light border shadow-sm rounded-3 mb-4">
          <i className="bi bi-person-badge-fill text-primary me-2" />

          <strong>Driver ID:</strong>{" "}
          {driverId}

          <span className="text-muted ms-2">
            New requests are automatically checked every 5 seconds.
          </span>
        </div>
      )}

      {/* ======================================================
          NO REQUESTS
          ====================================================== */}
      {!error && requests.length === 0 && (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center">

          <div className="mb-3">
            <i
              className="bi bi-inbox text-muted"
              style={{
                fontSize: "4rem",
              }}
            />
          </div>

          <h5 className="fw-bold">
            No Ride Requests
          </h5>

          <p className="text-muted mb-3">
            There are currently no pending ride requests.
          </p>

          <button
            className="btn btn-outline-primary"
            onClick={fetchRequests}
          >
            <i className="bi bi-arrow-clockwise me-2" />
            Check Again
          </button>

        </div>
      )}

      {/* ======================================================
          REQUEST LIST
          ====================================================== */}
      {requests.length > 0 && (
        <div className="row g-4">

          {requests.map((ride) => {

            const isAccepting =
              acceptingRideId ===
              ride.rideId;

            const fareVal = rideApi.calculateRideFare(ride);

            return (
              <div
                className="col-12 col-lg-6 col-xl-4"
                key={ride.rideId}
              >

                <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">

                  {/* CARD HEADER */}
                  <div
                    className="p-3 d-flex justify-content-between align-items-center"
                    style={{
                      background:
                        "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
                    }}
                  >

                    <div>
                      <small className="text-light opacity-75">
                        RIDE REQUEST
                      </small>

                      <h5 className="text-white fw-bold mb-0">
                        #{ride.rideId}
                      </h5>
                    </div>

                    <div className="text-end">
                      <span className="badge bg-warning text-dark me-2">
                        {getStatusLabel(
                          ride.status
                        )}
                      </span>
                      <span className="badge bg-success text-white fw-bold">
                        ₹{rideApi.calculateRideFare(ride)}
                      </span>
                    </div>

                  </div>

                  {/* CARD BODY */}
                  <div className="card-body p-4 text-dark bg-light">

                    {/* PICKUP */}
                    <div className="d-flex gap-3 mb-4">

                      <div
                        className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                          width: "40px",
                          height: "40px",
                        }}
                      >
                        <i className="bi bi-circle-fill text-primary" />
                      </div>

                      <div>
                        <small className="text-muted d-block">
                          PICKUP
                        </small>

                        <strong>
                          {ride.source ||
                            "Not available"}
                        </strong>
                      </div>

                    </div>

                    {/* ROUTE LINE */}
                    <div
                      className="border-start border-2 border-secondary ms-3 mb-3"
                      style={{
                        height: "20px",
                      }}
                    />

                    {/* DESTINATION */}
                    <div className="d-flex gap-3 mb-4">

                      <div
                        className="rounded-circle bg-danger bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                          width: "40px",
                          height: "40px",
                        }}
                      >
                        <i className="bi bi-geo-alt-fill text-danger" />
                      </div>

                      <div>
                        <small className="text-muted d-block">
                          DESTINATION
                        </small>

                        <strong>
                          {ride.destination ||
                            "Not available"}
                        </strong>
                      </div>

                    </div>

                    {/* DETAILS */}
                    <div className="row g-2 mb-4">

                      <div className="col-6">
                        <div className="bg-white rounded-3 p-3 border shadow-sm">
                          <small className="text-muted d-block extra-small text-uppercase fw-semibold">
                            Estimated Fare
                          </small>

                          <strong className="text-success fs-5 fw-bold">
                            ₹ {fareVal}
                          </strong>
                        </div>
                      </div>

                      <div className="col-6">
                        <div className="bg-white rounded-3 p-3 border shadow-sm">
                          <small className="text-muted d-block extra-small text-uppercase fw-semibold">
                            Rider ID
                          </small>

                          <strong className="text-dark fs-6 fw-bold">
                            #{ride.userId}
                          </strong>
                        </div>
                      </div>

                    </div>

                    {/* ACCEPT BUTTON */}
                    <button
                      type="button"
                      className="btn btn-success w-100 py-3 fw-bold"
                      onClick={() =>
                        handleAcceptRide(
                          ride
                        )
                      }
                      disabled={
                        isAccepting
                      }
                    >

                      {isAccepting ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          />

                          Accepting Ride...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle-fill me-2" />

                          Accept Ride
                        </>
                      )}

                    </button>

                  </div>
                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}

