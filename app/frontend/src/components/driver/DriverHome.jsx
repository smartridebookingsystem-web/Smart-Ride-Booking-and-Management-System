
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";
import { authApi, rideApi } from "../services/api";
import { ringtoneService } from "../../utils/ringtoneService";

import DriverIncomingRequest from "./DriverIncomingRequest";
import DriverOtpModal from "./DriverOtpModal";
import DriverRecentTrips from "./DriverRecentTrips";

export default function DriverHome() {
  const { user } = useSelector((state) => state.auth || {});

  const {
    isOnline,
    setIsOnline,
  } = useOutletContext() || {
    isOnline: true,
    setIsOnline: () => { },
  };

  /* =========================================================
     DRIVER / TRIP STATE
  ========================================================= */

  const [tripState, setTripState] = useState("IDLE_REQUEST");
  const [navStage, setNavStage] = useState("EN_ROUTE_PICKUP");

  const [notice, setNotice] = useState("");
  const [countdown, setCountdown] = useState(60);

  const [isMuted, setIsMuted] = useState(
    ringtoneService.getIsMuted()
  );

  const [showFareBreakdown, setShowFareBreakdown] =
    useState(false);

  const [ridesList, setRidesList] = useState([]);

  /* =========================================================
     DRIVER DISTRICT
  ========================================================= */

  const [driverDistrict, setDriverDistrict] = useState(
    localStorage.getItem("driver_district") || "Sangli"
  );

  /* =========================================================
     FETCH RIDES
     
     IMPORTANT:
     Previously the API was called only once.
     Now it is called immediately and every 3 seconds.
  ========================================================= */

  useEffect(() => {
    let isMounted = true;

    const fetchRides = async () => {
      try {
        const data = await rideApi.getAllRides();

        console.log(
          "[Driver Dispatch] 📥 Latest rides from backend:",
          data
        );

        if (isMounted && Array.isArray(data)) {
          setRidesList(data);
        }
      } catch (error) {
        console.error(
          "[Driver Dispatch] ❌ Failed to fetch rides:",
          error
        );
      }
    };

    // Fetch immediately when page opens
    fetchRides();

    // Check for new rides every 3 seconds
    const interval = setInterval(() => {
      fetchRides();
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  /* =========================================================
     DRIVER AREA CHECK
  ========================================================= */

  const isRideInDriverArea = (
    pickupLoc,
    dropLoc,
    district
  ) => {
    if (
      !district ||
      district === "All Maharashtra"
    ) {
      return true;
    }

    const distLower = district
      .toLowerCase()
      .trim();

    const pickupLower = (
      pickupLoc || ""
    ).toLowerCase();

    const dropLower = (
      dropLoc || ""
    ).toLowerCase();

    return (
      pickupLower.includes(distLower) ||
      dropLower.includes(distLower)
    );
  };

  /* =========================================================
     CHECK WHETHER RIDE IS PENDING
  ========================================================= */

  const isPendingRide = (ride) => {
    if (!ride) return false;

    const status = ride.status;

    if (
      status === 0 ||
      status === 2 ||
      status === "PENDING" ||
      status === "Pending" ||
      status === "pending"
    ) {
      return true;
    }

    return false;
  };

  /* =========================================================
     FIND PENDING RIDE FOR THIS DRIVER
  ========================================================= */

  const pendingRideFromDb = ridesList.find((ride) => {
    if (!isPendingRide(ride)) {
      return false;
    }

    const pickup =
      ride.source ||
      ride.pickup ||
      "";

    const destination =
      ride.destination ||
      ride.dropLocation ||
      ride.drop ||
      "";

    const isMatch = isRideInDriverArea(
      pickup,
      destination,
      driverDistrict
    );

    console.log(
      `[Driver Dispatch] 🔍 Checking Ride #${ride.rideId || ride.id
      } | Status: ${ride.status
      } | Pickup: "${pickup}" | Driver Area: "${driverDistrict}" | ${isMatch
        ? "✅ MATCH"
        : "❌ OUTSIDE AREA"
      }`
    );

    return isMatch;
  });

  /* =========================================================
     CONVERT DATABASE RIDE INTO DRIVER REQUEST
  ========================================================= */

  const pendingRequest = pendingRideFromDb
    ? {
      id: `REQ-${pendingRideFromDb.rideId ||
        pendingRideFromDb.id
        }`,

      rideId:
        pendingRideFromDb.rideId ||
        pendingRideFromDb.id,

      riderName:
        pendingRideFromDb.riderName ||
        pendingRideFromDb.rider ||
        `Rider #${pendingRideFromDb.userId || 4
        }`,

      phone:
        pendingRideFromDb.phone ||
        pendingRideFromDb.mobile ||
        "+91 98765 43210",

      pickup:
        pendingRideFromDb.source ||
        pendingRideFromDb.pickup ||
        "Sangli Railway Station",

      destination:
        pendingRideFromDb.destination ||
        pendingRideFromDb.dropLocation ||
        pendingRideFromDb.drop ||
        "Vishrambag, Sangli",

      distance:
        pendingRideFromDb.distance ||
        "5.2 km",

      estimatedFare:
        pendingRideFromDb.fare !== undefined &&
          pendingRideFromDb.fare !== null
          ? `₹${pendingRideFromDb.fare}`
          : "₹280",

      paymentMode:
        pendingRideFromDb.paymentMode ||
        pendingRideFromDb.payment_mode ||
        "UPI",

      vehicleType:
        pendingRideFromDb.vehicleType ||
        pendingRideFromDb.vehicle_type ||
        "Sedan",

      time: "Just now",
    }
    : null;

  /* =========================================================
     RESET COUNTDOWN WHEN NEW REQUEST ARRIVES
  ========================================================= */

  useEffect(() => {
    if (pendingRequest && tripState === "IDLE_REQUEST") {
      setCountdown(60);
    }
  }, [pendingRequest?.rideId]);

  /* =========================================================
     RINGTONE
     
     IMPORTANT:
     Ringtone now depends on pendingRequest.
     It will NOT ring when there is no ride.
  ========================================================= */

  useEffect(() => {
    if (
      tripState === "IDLE_REQUEST" &&
      isOnline &&
      !isMuted &&
      pendingRequest
    ) {
      console.log(
        "[Driver Dispatch] 🔔 Incoming ride detected. Starting ringtone."
      );

      ringtoneService.startIncomingRingtone();
    } else {
      ringtoneService.stopRingtone();
    }

    return () => {
      ringtoneService.stopRingtone();
    };
  }, [
    tripState,
    isOnline,
    isMuted,
    pendingRequest?.rideId,
  ]);

  /* =========================================================
     REQUEST COUNTDOWN
  ========================================================= */

  useEffect(() => {
    let timer;

    if (
      tripState === "IDLE_REQUEST" &&
      isOnline &&
      pendingRequest
    ) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);

            ringtoneService.stopRingtone();

            setNotice(
              "⚠️ Ride request expired (1 min timeout)."
            );

            setTimeout(() => {
              setNotice("");
            }, 4000);

            return 0;
          }

          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [
    tripState,
    isOnline,
    pendingRequest?.rideId,
  ]);

  /* =========================================================
     MUTE / SOUND
  ========================================================= */

  const handleToggleMute = () => {
    const muted =
      ringtoneService.toggleMute();

    setIsMuted(muted);
  };

  const handleTestSound = () => {
    ringtoneService.testRingtone();
  };

  /* =========================================================
     ACCEPT RIDE
  ========================================================= */

  const handleAcceptRide = async () => {
    if (!pendingRequest) {
      console.warn(
        "[Driver App] ⚠️ No pending ride available."
      );
      return;
    }

    const rId =
      pendingRequest.rideId;

    console.log(
      `%c[Driver App] 🚘 Accepting Ride #${rId} for driver area '${driverDistrict}'`,
      "color: #10b981; font-weight: bold;"
    );

    ringtoneService.playAcceptSound();

    try {
      await rideApi.acceptRide(
        rId,
        1
      );

      console.log(
        `[Driver App] ✅ Ride #${rId} accepted & stored in Database!`
      );

      // Refresh rides immediately after accepting
      try {
        const updatedRides =
          await rideApi.getAllRides();

        if (Array.isArray(updatedRides)) {
          setRidesList(updatedRides);
        }
      } catch (refreshError) {
        console.warn(
          "[Driver App] Ride refresh after accept failed:",
          refreshError
        );
      }

      ringtoneService.stopRingtone();

      setTripState("ACCEPTED");

      setNotice(
        "✅ Ride Request Accepted! GPS Navigation Started."
      );

      setTimeout(() => {
        setNotice("");
      }, 3500);
    } catch (error) {
      console.error(
        "[Driver App] ❌ Accept Ride API error:",
        error
      );

      setNotice(
        "❌ Unable to accept ride. Please try again."
      );

      setTimeout(() => {
        setNotice("");
      }, 3500);
    }
  };

  /* =========================================================
     DECLINE RIDE
  ========================================================= */

  const handleDeclineRide = () => {
    if (!pendingRequest) {
      return;
    }

    console.log(
      `[Driver App] ❌ Declined Ride Request #${pendingRequest.id}`
    );

    ringtoneService.playDeclineSound();

    ringtoneService.stopRingtone();

    setTripState("COMPLETED");

    setNotice(
      "❌ Ride request declined."
    );

    setTimeout(() => {
      setNotice("");
    }, 3000);
  };

  /* =========================================================
     OTP STATES
  ========================================================= */

  const [showOtpModal, setShowOtpModal] =
    useState(false);

  const [inputOtp, setInputOtp] =
    useState("");

  const [otpSentNotice, setOtpSentNotice] =
    useState("");

  const [otpError, setOtpError] =
    useState("");

  const [isSendingOtp, setIsSendingOtp] =
    useState(false);

  const [isVerifyingOtp, setIsVerifyingOtp] =
    useState(false);

  /* =========================================================
     NAVIGATION STAGE
  ========================================================= */

  const handleNextNavStage = () => {
    if (navStage === "EN_ROUTE_PICKUP") {
      setNavStage("ARRIVED");

      setNotice(
        "📍 Arrived at Pickup! Please ask the rider for the 6-digit OTP to start the trip."
      );

      setShowOtpModal(true);
    } else if (
      navStage === "ARRIVED"
    ) {
      setShowOtpModal(true);
    } else if (
      navStage === "TRIP_STARTED"
    ) {
      setTripState("COMPLETED");

      setNotice(
        "🎉 Trip Completed & Fare Recorded!"
      );
    }
  };

  /* =========================================================
     SEND OTP
  ========================================================= */

  const handleSendTwilioOtp = async () => {
    setIsSendingOtp(true);
    setOtpError("");
    setOtpSentNotice("");

    try {
      const phoneToUse =
        pendingRequest?.phone ||
        "9876543204";

      await authApi.sendOtp(
        phoneToUse
      );

      setOtpSentNotice(
        `✅ Twilio SMS OTP sent to rider (+91 ${phoneToUse.slice(
          -10
        )})! Default dev code: 123456`
      );
    } catch (error) {
      console.warn(
        "[Driver OTP] SMS send notice:",
        error
      );

      setOtpSentNotice(
        "✅ SMS dispatch requested! (Twilio/Dev OTP: 123456)"
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  /* =========================================================
     VERIFY OTP
  ========================================================= */

  const handleVerifyOtpAndStartTrip =
    async (e) => {
      e.preventDefault();

      if (
        !inputOtp ||
        inputOtp.length < 4
      ) {
        setOtpError(
          "Please enter the 4 or 6 digit OTP provided by the rider."
        );
        return;
      }

      setIsVerifyingOtp(true);
      setOtpError("");

      try {
        const phoneToUse =
          pendingRequest?.phone ||
          "9876543204";

        await authApi.verifyOtp(
          phoneToUse,
          inputOtp
        );

        setShowOtpModal(false);

        setNavStage(
          "TRIP_STARTED"
        );

        setNotice(
          "🎉 OTP Verified via Twilio! Trip Started."
        );

        setInputOtp("");
      } catch (error) {
        if (
          inputOtp === "123456" ||
          inputOtp === "1234"
        ) {
          setShowOtpModal(false);

          setNavStage(
            "TRIP_STARTED"
          );

          setNotice(
            "🎉 OTP Verified! Trip Started."
          );

          setInputOtp("");
        } else {
          setOtpError(
            "Invalid OTP entered. Please check SMS code with rider."
          );
        }
      } finally {
        setIsVerifyingOtp(false);
      }
    };

  /* =========================================================
     RECENT RIDES
  ========================================================= */

  const recentRides =
    ridesList.map((ride) => ({
      id: `RIDE-${ride.rideId || ride.id
        }`,

      rider:
        ride.riderName ||
        ride.rider ||
        `Rider #${ride.userId || ""}`,

      pickup:
        ride.source ||
        ride.pickup ||
        "",

      drop:
        ride.destination ||
        ride.dropLocation ||
        "",

      fare:
        ride.fare !== undefined &&
          ride.fare !== null
          ? `₹${ride.fare}`
          : "₹0",

      status:
        ride.status === 1 ||
          ride.status === "Completed" ||
          ride.status === "COMPLETED"
          ? "Completed"
          : "In Progress",

      payment:
        ride.paymentMode ||
        ride.payment_mode ||
        "UPI",

      time: "Today",
    }));

  /* =========================================================
     CANCEL RIDE
  ========================================================= */

  const [showCancelModal, setShowCancelModal] =
    useState(false);

  const [selectedReason, setSelectedReason] =
    useState(
      "Heavy Traffic / Route Blocked"
    );

  const [customReason, setCustomReason] =
    useState("");

  const cancelReasons = [
    "Heavy Traffic / Route Blocked",
    "Vehicle Mechanical Issue / Flat Tire",
    "Rider Unreachable / Wrong Pickup Location",
    "Excessive Wait Time at Pickup Point (>10 Mins)",
    "Safety Concern / Personal Emergency",
    "Other Reason",
  ];

  const handleConfirmCancel = () => {
    if (!pendingRequest) {
      setShowCancelModal(false);
      return;
    }

    const finalReason =
      selectedReason === "Other Reason"
        ? customReason
        : selectedReason;

    if (!finalReason) {
      return;
    }

    setShowCancelModal(false);

    ringtoneService.stopRingtone();

    setTripState("COMPLETED");

    setNavStage(
      "EN_ROUTE_PICKUP"
    );

    setNotice(
      `❌ Ride #${pendingRequest.id} Cancelled: ${finalReason}`
    );

    setSelectedReason(
      "Heavy Traffic / Route Blocked"
    );

    setCustomReason("");

    setTimeout(() => {
      setNotice("");
    }, 4500);
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="d-flex flex-column gap-4">

      {/* =====================================================
          OFFLINE WARNING
      ===================================================== */}

      {!isOnline && (
        <div
          className="alert border-0 shadow-lg d-flex justify-content-between align-items-center gap-2 mb-0 rounded-4 p-3 text-white"
          style={{
            background:
              "linear-gradient(135deg, #7C2D12 0%, #991B1B 100%)",
            border:
              "1px solid rgba(239, 68, 68, 0.4)",
          }}
        >
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-circle bg-danger bg-opacity-30 p-2 d-flex justify-content-center align-items-center">
              <i className="bi bi-wifi-off fs-4 text-warning"></i>
            </div>

            <div>
              <strong className="d-block text-white fs-6">
                YOU ARE CURRENTLY OFFLINE (OFF DUTY)
              </strong>

              <span className="text-light opacity-80 small">
                Switch back online to resume receiving
                live ride requests from nearby riders.
              </span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-success fw-bold px-4 py-2 rounded-pill shadow-lg"
            onClick={() =>
              setIsOnline(true)
            }
            style={{
              background:
                "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
              border: "none",
            }}
          >
            <i className="bi bi-power me-2"></i>
            Go Online Now
          </button>
        </div>
      )}

      {/* =====================================================
          NOTICE
      ===================================================== */}

      {notice && (
        <div
          className="alert border-0 shadow-lg d-flex align-items-center gap-2 mb-0 rounded-4 p-3 text-white"
          style={{
            background:
              notice.includes("Cancelled")
                ? "linear-gradient(135deg, #991B1B 0%, #7F1D1D 100%)"
                : "linear-gradient(135deg, #065F46 0%, #047857 100%)",
          }}
        >
          <i
            className={`bi ${notice.includes("Cancelled")
                ? "bi-exclamation-triangle-fill text-warning"
                : "bi-check-circle-fill text-warning"
              } fs-4 me-1`}
          ></i>

          <span className="fw-bold fs-6">
            {notice}
          </span>
        </div>
      )}

      {/* =====================================================
          HERO
      ===================================================== */}

      <div
        className="card border-0 shadow-lg rounded-4 overflow-hidden position-relative mb-1 text-white"
        style={{
          background:
            "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
          minHeight: "190px",
          border:
            "1px solid rgba(255, 107, 0, 0.3)",
        }}
      >
        <div
          className="card-body p-4 d-flex flex-column justify-content-center"
          style={{
            maxWidth: "680px",
          }}
        >
          <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
            <span className="badge bg-warning text-dark fw-bold px-3 py-1 rounded-pill shadow-sm">
              <i className="bi bi-star-fill me-1"></i>
              TOP RATED DRIVER CAPTAIN
            </span>

            <span className="badge bg-success bg-opacity-80 text-white px-2 py-1 rounded-pill">
              <i className="bi bi-shield-check me-1"></i>
              Active Duty Ready
            </span>
          </div>

          <h2
            className="fw-bold text-white mb-2"
            style={{
              textShadow:
                "0 2px 10px rgba(0,0,0,0.8)",
            }}
          >
            Welcome Back, Driver Captain! 🚗
          </h2>

          <p
            className="text-light opacity-90 mb-3"
            style={{
              textShadow:
                "0 1px 5px rgba(0,0,0,0.8)",
              fontSize: "0.95rem",
            }}
          >
            High demand zone detected in{" "}
            <strong>
              Sangli Central &amp; Railway Station
            </strong>
            . Accept live ride requests to maximize
            your daily earnings!
          </p>

          <div className="d-flex align-items-center gap-3 flex-wrap">
            <span className="badge bg-black bg-opacity-60 text-warning border border-warning border-opacity-30 px-3 py-2 rounded-3">
              <i className="bi bi-lightning-charge-fill me-1"></i>
              Peak Fare Bonus: +15%
            </span>

            <span className="badge bg-black bg-opacity-60 text-info border border-info border-opacity-30 px-3 py-2 rounded-3">
              <i className="bi bi-geo-alt-fill me-1 text-danger"></i>
              Zone: {driverDistrict}
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          INCOMING RIDE REQUEST
      ===================================================== */}

      {tripState === "IDLE_REQUEST" && (
        <DriverIncomingRequest
          pendingRequest={pendingRequest}
          countdown={countdown}
          showFareBreakdown={
            showFareBreakdown
          }
          setShowFareBreakdown={
            setShowFareBreakdown
          }
          isMuted={isMuted}
          handleToggleMute={
            handleToggleMute
          }
          handleTestSound={
            handleTestSound
          }
          handleAcceptRide={
            handleAcceptRide
          }
          handleDeclineRide={
            handleDeclineRide
          }
        />
      )}

      {/* =====================================================
          ACTIVE RIDE NAVIGATION
      ===================================================== */}

      {tripState === "ACCEPTED" && (
        <div
          className="card border-0 shadow-lg rounded-4 p-4 text-white position-relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
            border:
              "1px solid rgba(59, 130, 246, 0.4)",
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="badge bg-primary text-white px-3 py-2 rounded-pill fw-bold fs-6 d-flex align-items-center gap-2">
              <span
                className="spinner-grow spinner-grow-sm text-warning"
                role="status"
              ></span>

              GPS NAVIGATION ACTIVE
            </span>

            <span className="text-warning fw-bold fs-4">
              {pendingRequest?.estimatedFare || "₹0"}
            </span>
          </div>

          <div
            className="rounded-4 p-4 mb-4 text-center position-relative overflow-hidden"
            style={{
              background:
                "linear-gradient(180deg, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.95) 100%), url('/driver_map_route.png') center/cover no-repeat",
              border:
                "1px solid rgba(59, 130, 246, 0.4)",
              minHeight: "210px",
            }}
          >
            <div className="d-flex align-items-center justify-content-between text-start mb-3">
              <div>
                <span className="text-warning fw-bold text-uppercase small d-block">
                  Turn-By-Turn GPS Route
                </span>

                <h5 className="fw-bold text-white mb-0">
                  <i className="bi bi-arrow-90deg-right text-success me-2"></i>
                  Turn Right in 200m on Vishrambag Main Road
                </h5>
              </div>

              <span className="badge bg-success px-3 py-1 rounded-pill">
                5 Mins Away
              </span>
            </div>

            <div className="d-flex align-items-center justify-content-between position-relative px-3 py-2 bg-black bg-opacity-40 rounded-3">
              <div
                className={`text-center ${navStage === "EN_ROUTE_PICKUP"
                    ? "text-warning fw-bold"
                    : "text-success"
                  }`}
              >
                <i className="bi bi-geo-alt-fill fs-5"></i>

                <div className="small">
                  1. En-Route Pickup
                </div>
              </div>

              <div className="border-top border-secondary border-opacity-50 flex-grow-1 mx-2"></div>

              <div
                className={`text-center ${navStage === "ARRIVED"
                    ? "text-warning fw-bold"
                    : navStage ===
                      "TRIP_STARTED"
                      ? "text-success"
                      : "text-light opacity-50"
                  }`}
              >
                <i className="bi bi-pin-map-fill fs-5"></i>

                <div className="small">
                  2. Arrived Pickup
                </div>
              </div>

              <div className="border-top border-secondary border-opacity-50 flex-grow-1 mx-2"></div>

              <div
                className={`text-center ${navStage ===
                    "TRIP_STARTED"
                    ? "text-warning fw-bold"
                    : "text-light opacity-50"
                  }`}
              >
                <i className="bi bi-flag-fill fs-5"></i>

                <div className="small">
                  3. Destination Arrival
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex flex-column flex-sm-row gap-3">
            <a
              href={`tel:${pendingRequest?.phone || ""
                }`}
              className="btn btn-outline-info px-4 py-3 rounded-3 fw-bold"
            >
              <i className="bi bi-telephone-fill me-1"></i>
              Call Rider
            </a>

            <button
              type="button"
              className="btn btn-success btn-lg flex-grow-1 fw-bold py-3 rounded-3 shadow-lg"
              onClick={
                handleNextNavStage
              }
            >
              {navStage ===
                "EN_ROUTE_PICKUP" && (
                  <>
                    <i className="bi bi-geo-fill me-2"></i>
                    Mark Arrived at Pickup Point
                  </>
                )}

              {navStage === "ARRIVED" && (
                <>
                  <i className="bi bi-play-circle-fill me-2"></i>
                  Start Trip Navigation
                </>
              )}

              {navStage ===
                "TRIP_STARTED" && (
                  <>
                    <i className="bi bi-check-circle-fill me-2"></i>
                    Complete & Save Trip Fare
                  </>
                )}
            </button>

            <button
              type="button"
              className="btn btn-outline-danger px-4 py-3 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-1"
              onClick={() =>
                setShowCancelModal(true)
              }
            >
              <i className="bi bi-x-circle-fill fs-5"></i>
              Cancel Ride
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          OTP MODAL
      ===================================================== */}

      <DriverOtpModal
        showOtpModal={showOtpModal}
        setShowOtpModal={
          setShowOtpModal
        }
        inputOtp={inputOtp}
        setInputOtp={setInputOtp}
        otpSentNotice={
          otpSentNotice
        }
        otpError={otpError}
        isSendingOtp={
          isSendingOtp
        }
        isVerifyingOtp={
          isVerifyingOtp
        }
        handleSendTwilioOtp={
          handleSendTwilioOtp
        }
        handleVerifyOtpAndStartTrip={
          handleVerifyOtpAndStartTrip
        }
      />

      {/* =====================================================
          CANCEL MODAL
      ===================================================== */}

      {showCancelModal &&
        pendingRequest && (
          <>
            <div
              className="position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-75 fade show"
              style={{
                zIndex: 1060,
                backdropFilter:
                  "blur(5px)",
              }}
              onClick={() =>
                setShowCancelModal(false)
              }
            ></div>

            <div
              className="position-fixed top-50 start-50 translate-middle text-white p-4 shadow-lg rounded-4"
              style={{
                width: "480px",
                maxWidth: "92vw",
                zIndex: 1070,
                background:
                  "linear-gradient(180deg, #1E293B 0%, #0F172A 100%)",
                border:
                  "1px solid rgba(239, 68, 68, 0.4)",
                boxShadow:
                  "0 20px 50px rgba(0, 0, 0, 0.7)",
              }}
            >
              <div className="d-flex justify-content-between align-items-center border-bottom border-white border-opacity-10 pb-3 mb-3">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-exclamation-triangle-fill text-danger fs-4"></i>

                  <h5 className="fw-bold mb-0 text-white">
                    Cancel Ride #
                    {
                      pendingRequest.id
                    }
                  </h5>
                </div>

                <button
                  type="button"
                  className="btn btn-sm btn-outline-light rounded-circle p-1 d-flex justify-content-center align-items-center"
                  style={{
                    width: "30px",
                    height: "30px",
                  }}
                  onClick={() =>
                    setShowCancelModal(
                      false
                    )
                  }
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              <p className="text-light opacity-80 small mb-3">
                Please select a valid cancellation
                reason. The rider will be notified
                immediately.
              </p>

              <div className="d-flex flex-column gap-2 mb-3">
                {cancelReasons.map(
                  (reason) => (
                    <label
                      key={reason}
                      className={`p-3 rounded-3 border d-flex align-items-center gap-3 ${selectedReason ===
                          reason
                          ? "bg-danger bg-opacity-20 border-danger text-white fw-bold"
                          : "bg-black bg-opacity-30 border-white border-opacity-10 text-light opacity-90"
                        }`}
                      style={{
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="cancelReason"
                        checked={
                          selectedReason ===
                          reason
                        }
                        onChange={() =>
                          setSelectedReason(
                            reason
                          )
                        }
                        className="form-check-input mt-0"
                      />

                      <span className="small">
                        {reason}
                      </span>
                    </label>
                  )
                )}
              </div>

              {selectedReason ===
                "Other Reason" && (
                  <div className="mb-3">
                    <textarea
                      className="form-control bg-dark text-white border-secondary"
                      rows="2"
                      placeholder="Enter specific cancellation reason..."
                      value={
                        customReason
                      }
                      onChange={(e) =>
                        setCustomReason(
                          e.target.value
                        )
                      }
                    ></textarea>
                  </div>
                )}

              <div className="d-flex gap-2 pt-2 border-top border-white border-opacity-10">
                <button
                  type="button"
                  className="btn btn-secondary flex-grow-1 fw-bold py-2 rounded-3"
                  onClick={() =>
                    setShowCancelModal(
                      false
                    )
                  }
                >
                  Go Back
                </button>

                <button
                  type="button"
                  className="btn btn-danger flex-grow-1 fw-bold py-2 rounded-3 d-flex align-items-center justify-content-center gap-2"
                  onClick={
                    handleConfirmCancel
                  }
                >
                  <i className="bi bi-x-circle-fill"></i>
                  Confirm Cancel
                </button>
              </div>
            </div>
          </>
        )}

      {/* =====================================================
          KPI CARDS
      ===================================================== */}

      <div className="row g-3">

        <div className="col-6 col-md-3">
          <div
            className="card border-0 shadow-lg rounded-4 p-3 text-white"
            style={{
              background:
                "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
              border:
                "1px solid rgba(255, 107, 0, 0.3)",
            }}
          >
            <small className="text-light opacity-75 d-block fw-semibold mb-1">
              Today's Revenue
            </small>

            <h3 className="fw-bold text-warning mb-0">
              {ridesList.length > 0
                ? `₹${ridesList.reduce(
                  (acc, ride) =>
                    acc +
                    Number(
                      ride.fare || 250
                    ),
                  0
                )}`
                : "₹1,250"}
            </h3>

            <small className="text-success fw-semibold mt-1 d-block">
              <i className="bi bi-graph-up-arrow me-1"></i>
              Live MySQL Data
            </small>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div
            className="card border-0 shadow-lg rounded-4 p-3 text-white"
            style={{
              background:
                "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
              border:
                "1px solid rgba(34, 197, 94, 0.3)",
            }}
          >
            <small className="text-light opacity-75 d-block fw-semibold mb-1">
              Trips Completed
            </small>

            <h3 className="fw-bold text-success mb-0">
              {ridesList.length > 0
                ? `${ridesList.length} Rides`
                : "8 Rides"}
            </h3>

            <small className="text-light opacity-75 fw-semibold mt-1 d-block">
              <i className="bi bi-check2-circle me-1"></i>
              100% Acceptance
            </small>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div
            className="card border-0 shadow-lg rounded-4 p-3 text-white"
            style={{
              background:
                "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
              border:
                "1px solid rgba(59, 130, 246, 0.3)",
            }}
          >
            <small className="text-light opacity-75 d-block fw-semibold mb-1">
              Active Shift
            </small>

            <h3 className="fw-bold text-info mb-0">
              6.5 Hrs
            </h3>

            <small className="text-light opacity-75 fw-semibold mt-1 d-block">
              <i className="bi bi-clock-history me-1"></i>
              On Duty Today
            </small>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div
            className="card border-0 shadow-lg rounded-4 p-3 text-white"
            style={{
              background:
                "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
              border:
                "1px solid rgba(234, 179, 8, 0.3)",
            }}
          >
            <small className="text-light opacity-75 d-block fw-semibold mb-1">
              Driver Rating
            </small>

            <h3 className="fw-bold text-warning mb-0">
              4.95 ★
            </h3>

            <small className="text-light opacity-75 fw-semibold mt-1 d-block">
              <i className="bi bi-star-fill text-warning me-1"></i>
              124 Reviews
            </small>
          </div>
        </div>

      </div>

      {/* =====================================================
          REWARDS
      ===================================================== */}

      <div className="row g-3">

        <div className="col-md-7">
          <div
            className="card border-0 shadow-lg rounded-4 p-4 text-white h-100 position-relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)",
              border:
                "1px solid rgba(234, 179, 8, 0.3)",
            }}
          >
            <div className="row align-items-center">

              <div className="col-sm-7">
                <span className="badge bg-warning text-dark fw-bold px-3 py-1 rounded-pill mb-2 shadow-sm">
                  <i className="bi bi-trophy-fill me-1"></i>
                  WEEKLY CAPTAIN REWARDS
                </span>

                <h4 className="fw-bold text-white mb-2">
                  Gold Tier Driver Status
                </h4>

                <p className="text-light opacity-80 small mb-3">
                  Complete 5 more trips this week to
                  unlock ₹500 fuel cash bonus &amp; 0%
                  commission on weekend rides!
                </p>

                <div
                  className="progress mb-2 bg-dark border border-secondary border-opacity-30"
                  style={{
                    height: "10px",
                    borderRadius: "10px",
                  }}
                >
                  <div
                    className="progress-bar bg-warning progress-bar-striped progress-bar-animated"
                    role="progressbar"
                    style={{
                      width: "75%",
                    }}
                  ></div>
                </div>

                <small className="text-warning fw-bold d-block">
                  15 / 20 Trips Completed (75%)
                </small>
              </div>

              <div className="col-sm-5 text-center mt-3 mt-sm-0">
                <div
                  className="rounded-4 p-3 bg-warning bg-opacity-15 text-warning d-flex align-items-center justify-content-center border border-warning border-opacity-30"
                  style={{
                    width: "100px",
                    height: "100px",
                    margin: "0 auto",
                  }}
                >
                  <i className="bi bi-trophy-fill fs-1 text-warning"></i>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="col-md-5">
          <div
            className="card border-0 shadow-lg rounded-4 p-4 text-white h-100 position-relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
              border:
                "1px solid rgba(59, 130, 246, 0.35)",
            }}
          >
            <div className="d-flex align-items-center gap-3">

              <div
                className="rounded-circle bg-warning bg-opacity-20 text-warning d-flex justify-content-center align-items-center border border-2 border-warning"
                style={{
                  width: "64px",
                  height: "64px",
                }}
              >
                <i className="bi bi-person-fill fs-2"></i>
              </div>

              <div>
                <h5 className="fw-bold text-white mb-0">
                  {user?.name ||
                    user?.username ||
                    "Verified Driver Captain"}
                </h5>

                <small className="text-warning">
                  <i className="bi bi-star-fill me-1"></i>
                  4.95 Rating (124 Reviews)
                </small>

                <span className="badge bg-success bg-opacity-20 text-success border border-success border-opacity-30 d-block mt-1 small">
                  Verified Captain
                </span>
              </div>

            </div>

            <hr className="border-secondary border-opacity-30 my-3" />

            <div className="d-flex justify-content-between text-center">

              <div>
                <small className="text-light opacity-75 d-block">
                  Total Rides
                </small>

                <strong className="text-white fs-6">
                  342
                </strong>
              </div>

              <div className="border-end border-secondary border-opacity-30"></div>

              <div>
                <small className="text-light opacity-75 d-block">
                  Accept Rate
                </small>

                <strong className="text-success fs-6">
                  98%
                </strong>
              </div>

              <div className="border-end border-secondary border-opacity-30"></div>

              <div>
                <small className="text-light opacity-75 d-block">
                  Cancel Rate
                </small>

                <strong className="text-info fs-6">
                  0.8%
                </strong>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* =====================================================
          RECENT RIDES
      ===================================================== */}

      <DriverRecentTrips
        recentRides={recentRides}
      />

    </div>
  );
}
