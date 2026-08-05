
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import MapComponent from "./MapComponent";
import { rideApi } from "../services/api";
import {
  searchMaharashtraLocations,
  MAHARASHTRA_POPULAR_LOCATIONS,
} from "../../utils/geocode";

export default function SearchRide() {
  const { user } = useSelector((state) => state.auth || {});
  const userId = user?.userId || user?.id;

  const location = useLocation();
  const navState = location.state || {};

  const [pickup, setPickup] = useState(null);
  const [drop, setDrop] = useState(null);

  const [pickupName, setPickupName] = useState(
    navState.pickupName || ""
  );

  const [dropName, setDropName] = useState(
    navState.dropName || ""
  );

  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropSuggestions, setDropSuggestions] = useState([]);

  const [selecting, setSelecting] = useState(null);

  const [vehicleType, setVehicleType] = useState(
    navState.vehicleType || "Hatchback"
  );

  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [rideResult, setRideResult] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState(null);

  /*
   * IMPORTANT:
   * These IDs MUST match the vehicle table.
   *
   * 1 = Hatchback
   * 2 = Sedan
   * 3 = SUV
   */
  const vehicleConfig = {
    Hatchback: {
      vehicleId: 1,
      base: 50,
      perKm: 12,
      estTime: "3-5 mins away",
      icon: "bi-car-front-fill",
    },

    Sedan: {
      vehicleId: 2,
      base: 80,
      perKm: 16,
      estTime: "4-7 mins away",
      icon: "bi-car-front",
    },

    SUV: {
      vehicleId: 3,
      base: 120,
      perKm: 22,
      estTime: "6-10 mins away",
      icon: "bi-truck-front-fill",
    },
  };

  /*
   * ----------------------------------------
   * PICKUP AUTOCOMPLETE
   * ----------------------------------------
   */
  const handlePickupChange = async (value) => {
    setPickupName(value);

    // User manually changed the location,
    // therefore clear the previously selected coordinates.
    setPickup(null);

    if (value.trim().length >= 2) {
      try {
        console.log(
          `[Location Autocomplete] Searching pickup: "${value}"`
        );

        const results = await searchMaharashtraLocations(value);

        setPickupSuggestions(results || []);
      } catch (error) {
        console.error(
          "[Location Autocomplete] Pickup search failed:",
          error
        );

        setPickupSuggestions([]);
      }
    } else {
      setPickupSuggestions([]);
    }
  };

  /*
   * ----------------------------------------
   * DROP AUTOCOMPLETE
   * ----------------------------------------
   */
  const handleDropChange = async (value) => {
    setDropName(value);

    // User manually changed the location,
    // therefore clear the previously selected coordinates.
    setDrop(null);

    if (value.trim().length >= 2) {
      try {
        console.log(
          `[Location Autocomplete] Searching drop: "${value}"`
        );

        const results = await searchMaharashtraLocations(value);

        setDropSuggestions(results || []);
      } catch (error) {
        console.error(
          "[Location Autocomplete] Drop search failed:",
          error
        );

        setDropSuggestions([]);
      }
    } else {
      setDropSuggestions([]);
    }
  };

  /*
   * ----------------------------------------
   * SELECT PICKUP
   * ----------------------------------------
   */
  const selectPickupLocation = (loc) => {
    console.log(
      `[Location Selected]Pickup: ${loc.name} `
    );

    setPickupName(loc.name);
    setPickup([loc.lat, loc.lng]);
    setPickupSuggestions([]);
  };

  /*
   * ----------------------------------------
   * SELECT DROP
   * ----------------------------------------
   */
  const selectDropLocation = (loc) => {
    console.log(
      `[Location Selected]Drop: ${loc.name} `
    );

    setDropName(loc.name);
    setDrop([loc.lat, loc.lng]);
    setDropSuggestions([]);
  };

  /*
   * ----------------------------------------
   * CALCULATE DISTANCE
   * ----------------------------------------
   */
  const calculateDistance = () => {
    if (pickup && drop && Array.isArray(pickup) && Array.isArray(drop) && pickup.length === 2 && drop.length === 2) {
      const rad = Math.PI / 180;
      const dLat = (drop[0] - pickup[0]) * rad;
      const dLon = (drop[1] - pickup[1]) * rad;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(pickup[0] * rad) *
        Math.cos(drop[0] * rad) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      let distance = Number((6371 * c).toFixed(1));
      if (distance >= 0.5) return distance;
    }

    // Deterministic fallback based on pickup & drop names
    const src = String(pickupName || "").toLowerCase().trim();
    const dst = String(dropName || "").toLowerCase().trim();
    const combined = src + dst;
    if (!combined) return 4.5;

    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      hash = (hash << 5) - hash + combined.charCodeAt(i);
      hash |= 0;
    }
    const posHash = Math.abs(hash);
    const distance = Number((2.2 + (posHash % 143) / 10).toFixed(1));
    return distance;
  };

  /*
   * ----------------------------------------
   * SEARCH RIDE
   * ----------------------------------------
   */
  const handleSearch = (event) => {
    event.preventDefault();

    setBookingError(null);
    setBookingSuccess(null);

    if (!userId) {
      setBookingError(
        "User information is missing. Please login again."
      );
      return;
    }

    if (!pickupName.trim() || !dropName.trim()) {
      alert(
        "Please enter or select both Pickup and Destination locations."
      );
      return;
    }

    setIsSearching(true);

    setTimeout(() => {
      const distanceKm = calculateDistance();

      const vehicle = vehicleConfig[vehicleType];

      const estimatedFare = Math.round(
        vehicle.base +
        distanceKm * vehicle.perKm
      );

      setRideResult({
        pickup: pickupName,
        destination: dropName,
        vehicleType,
        vehicleId: vehicle.vehicleId,
        distanceKm,
        fare: estimatedFare,
        eta: vehicle.estTime,
      });

      setIsSearching(false);
    }, 600);
  };

  /*
   * ----------------------------------------
   * CONFIRM RIDE
   * ----------------------------------------
   *
   * IMPORTANT BACKEND CONTRACT:
   *
   * CreateRideRequest requires:
   *
   * {
   *   userId,
   *   vehicleId,
   *   source,
   *   destination
   * }
   *
   * Do NOT send:
   * fare
   * vehicleType
   * paymentMode
   * status
   */
  const handleConfirmRide = async () => {
    if (!rideResult) {
      return;
    }

    if (!userId) {
      setBookingError(
        "User information is missing. Please login again."
      );
      return;
    }

    setIsSubmitting(true);
    setBookingError(null);
    setBookingSuccess(null);

    const rideData = {
      userId: Number(userId),

      vehicleId: Number(
        rideResult.vehicleId
      ),

      source: rideResult.pickup.trim(),

      destination:
        rideResult.destination.trim(),
    };

    console.log(
      "%c[Rider App] 🚕 Creating Ride Request",
      "color: #ff6b00; font-weight: bold;"
    );

    console.log(
      "[Rider App] Request Payload:",
      rideData
    );

    /*
     * Validate payload before sending.
     */
    if (
      !rideData.userId ||
      !rideData.vehicleId ||
      !rideData.source ||
      !rideData.destination
    ) {
      console.error(
        "[Rider App] Invalid ride payload:",
        rideData
      );

      setBookingError(
        "Ride information is incomplete. Please select pickup, destination and vehicle."
      );

      setIsSubmitting(false);
      return;
    }

    try {
      /*
       * POST /api/rides
       */
      const createdRide =
        await rideApi.createRide(rideData);

      console.log(
        "%c[Rider App] ✅ Ride successfully created",
        "color: #16a34a; font-weight: bold;"
      );

      console.log(
        "[Rider App] Backend Response:",
        createdRide
      );

      /*
       * Backend returns:
       *
       * {
       *   rideId,
       *   userId,
       *   vehicleId,
       *   source,
       *   destination,
       *   status,
       *   driverId
       * }
       */

      const rideId =
        createdRide?.rideId ??
        createdRide?.id;

      // Generate a consistent 4-digit Trip OTP for this booking based on rideId
      const generatedOtp = String(1000 + (Number(rideId || 1) * 73) % 9000);
      if (rideId) {
        sessionStorage.setItem(`otp_${rideId}`, generatedOtp);
        localStorage.setItem(`otp_${rideId}`, generatedOtp);
        if (rideResult?.fare) {
          const fareNum = Number(rideResult.fare);
          sessionStorage.setItem(`fare_${rideId}`, fareNum);
          localStorage.setItem(`fare_${rideId}`, fareNum);
          sessionStorage.setItem(`fare_SR${1000 + Number(rideId)}`, fareNum);
          localStorage.setItem(`fare_SR${1000 + Number(rideId)}`, fareNum);
          sessionStorage.setItem(`fare_RIDE-${rideId}`, fareNum);
          localStorage.setItem(`fare_RIDE-${rideId}`, fareNum);
        }
      }

      setBookingSuccess({
        message: `Ride request #${rideId ?? "created"} successfully saved to the database.`,
        rideId,
        source: createdRide?.source,
        destination: createdRide?.destination,
        vehicleId: createdRide?.vehicleId,
        status: createdRide?.status,
        otpCode: generatedOtp,
      });

      setRideResult(null);

    } catch (error) {
      console.error(
        "%c[Rider App] ❌ Ride creation failed",
        "color: #dc2626; font-weight: bold;",
        error
      );

      /*
       * IMPORTANT:
       * The old code showed SUCCESS even when
       * POST /api/rides returned 400.
       *
       * That was incorrect.
       */

      setBookingError(
        error?.message ||
        "Failed to create ride request. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /*
   * ----------------------------------------
   * RESET
   * ----------------------------------------
   */
  const handleReset = () => {
    setPickup(null);
    setDrop(null);

    setPickupName("");
    setDropName("");

    setPickupSuggestions([]);
    setDropSuggestions([]);

    setSelecting(null);

    setRideResult(null);
    setBookingSuccess(null);
    setBookingError(null);

    window.history.replaceState(
      {},
      document.title
    );
  };

  /*
   * ----------------------------------------
   * VEHICLE CHANGE
   * ----------------------------------------
   */
  const handleVehicleChange = (type) => {
    setVehicleType(type);

    if (
      rideResult &&
      rideResult.distanceKm
    ) {
      const vehicle =
        vehicleConfig[type];

      const newFare = Math.round(
        vehicle.base +
        rideResult.distanceKm *
        vehicle.perKm
      );

      setRideResult((previous) => ({
        ...previous,

        vehicleType: type,

        vehicleId:
          vehicle.vehicleId,

        fare: newFare,

        eta: vehicle.estTime,
      }));
    }
  };

  return (
    <div className="container-fluid p-0">

      {/* ---------------------------------- */}
      {/* HEADER */}
      {/* ---------------------------------- */}

      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">

        <div>
          <h4 className="fw-bold text-dark mb-1">
            <i className="bi bi-geo-alt-fill text-warning me-2"></i>

            Maharashtra Ride Search & Booking
          </h4>

          <p className="text-muted small mb-0">
            Type a location with autocomplete
            or select points directly on the map.
          </p>
        </div>

        {selecting && (
          <span className="badge bg-warning text-dark px-3 py-2">
            <i className="bi bi-crosshair me-1"></i>

            Click map to select{" "}
            {selecting.toUpperCase()}
          </span>
        )}

      </div>


      {/* ---------------------------------- */}
      {/* SUCCESS */}
      {/* ---------------------------------- */}

      {bookingSuccess && (
        <div
          className="alert alert-success shadow-sm rounded-4 mb-4"
          role="alert"
        >
          <div className="d-flex justify-content-between align-items-start">

            <div>
              <h6 className="fw-bold mb-2">
                <i className="bi bi-check-circle-fill me-2"></i>

                Ride Request Created
              </h6>

              <p className="mb-1">
                {bookingSuccess.message}
              </p>

              {bookingSuccess.rideId && (
                <small className="d-block mb-1">
                  Ride ID:{" "}
                  <strong>
                    #{bookingSuccess.rideId}
                  </strong>
                </small>
              )}

              {bookingSuccess.otpCode && (
                <div className="mt-2 p-2 px-3 bg-white rounded-3 border border-success-subtle d-inline-flex align-items-center gap-2.5 shadow-sm">
                  <i className="bi bi-shield-lock-fill text-warning fs-5"></i>
                  <div>
                    <span className="text-muted d-block" style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                      RIDER TRIP OTP (SHARE WITH DRIVER TO START TRIP)
                    </span>
                    <strong className="fs-5 text-dark font-monospace" style={{ letterSpacing: "3px" }}>
                      {bookingSuccess.otpCode}
                    </strong>
                  </div>
                </div>
              )}


            </div>

            <button
              className="btn-close"
              onClick={() =>
                setBookingSuccess(null)
              }
            ></button>

          </div>
        </div>
      )}


      {/* ---------------------------------- */}
      {/* ERROR */}
      {/* ---------------------------------- */}

      {bookingError && (
        <div
          className="alert alert-danger shadow-sm rounded-4 mb-4"
          role="alert"
        >
          <div className="d-flex justify-content-between align-items-start">

            <div>
              <h6 className="fw-bold mb-2">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>

                Ride Request Failed
              </h6>

              <p className="mb-0">
                {bookingError}
              </p>
            </div>

            <button
              className="btn-close"
              onClick={() =>
                setBookingError(null)
              }
            ></button>

          </div>
        </div>
      )}


      {/* ---------------------------------- */}
      {/* POPULAR LOCATIONS */}
      {/* ---------------------------------- */}

      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-light">

        <div className="d-flex align-items-center gap-2 overflow-auto py-1">

          <small className="fw-bold text-dark text-nowrap me-2">
            <i className="bi bi-pin-map text-danger me-1"></i>

            Popular Maharashtra Hubs:
          </small>

          {MAHARASHTRA_POPULAR_LOCATIONS
            .slice(0, 8)
            .map((hub, index) => (

              <button
                key={index}
                type="button"
                className="btn btn-sm btn-white border rounded-pill shadow-sm text-nowrap py-1 px-3 bg-white"
                onClick={() => {

                  if (!pickupName) {
                    selectPickupLocation(hub);
                  } else {
                    selectDropLocation(hub);
                  }

                }}
              >

                <i className="bi bi-geo-alt text-primary me-1"></i>

                {hub.name.split(",")[0]}

              </button>

            ))}

        </div>
      </div>


      <div className="row g-4">

        {/* ---------------------------------- */}
        {/* LEFT */}
        {/* ---------------------------------- */}

        <div className="col-lg-5">

          <div className="card border-0 shadow-sm rounded-4 p-4 h-100">

            <h5
              className="fw-bold mb-4"
              style={{ color: "#0F172A" }}
            >
              <i className="bi bi-sliders text-warning me-2"></i>

              Trip Details
            </h5>


            <form onSubmit={handleSearch}>

              {/* PICKUP */}

              <div className="mb-3 position-relative">

                <div className="d-flex justify-content-between align-items-center mb-1">

                  <label className="form-label fw-semibold text-muted small mb-0">
                    PICKUP LOCATION
                  </label>

                  <button
                    type="button"
                    className={`btn btn - sm ${selecting === "pickup"
                        ? "btn-warning text-white fw-bold"
                        : "btn-outline-warning text-dark"
                      } py - 0 px - 2`}
                    onClick={() =>
                      setSelecting(
                        selecting === "pickup"
                          ? null
                          : "pickup"
                      )
                    }
                  >
                    <i className="bi bi-geo-fill me-1"></i>

                    {selecting === "pickup"
                      ? "Selecting..."
                      : "Pick on Map"}
                  </button>

                </div>


                <div className="input-group">

                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-circle-fill text-primary"></i>
                  </span>

                  <input
                    type="text"
                    className="form-control border-start-0 py-2"
                    placeholder="Search pickup location..."
                    value={pickupName}
                    onChange={(e) =>
                      handlePickupChange(
                        e.target.value
                      )
                    }
                    required
                  />

                </div>


                {pickupSuggestions.length > 0 && (

                  <div
                    className="list-group position-absolute w-100 shadow-lg rounded-3 mt-1 bg-white"
                    style={{
                      top: "100%",
                      zIndex: 1050,
                    }}
                  >

                    {pickupSuggestions.map(
                      (item, index) => (

                        <button
                          key={index}
                          type="button"
                          className="list-group-item list-group-item-action py-2 text-start small border-0 border-bottom"
                          onClick={() =>
                            selectPickupLocation(
                              item
                            )
                          }
                        >

                          <i className="bi bi-geo-alt-fill text-primary me-2"></i>

                          <strong>
                            {item.name.split(",")[0]}
                          </strong>

                          <span className="text-muted d-block small">
                            {item.name}
                          </span>

                        </button>

                      )
                    )}

                  </div>
                )}

              </div>


              {/* DROP */}

              <div className="mb-3 position-relative">

                <div className="d-flex justify-content-between align-items-center mb-1">

                  <label className="form-label fw-semibold text-muted small mb-0">
                    DROP DESTINATION
                  </label>

                  <button
                    type="button"
                    className={`btn btn - sm ${selecting === "drop"
                        ? "btn-danger text-white fw-bold"
                        : "btn-outline-danger"
                      } py - 0 px - 2`}
                    onClick={() =>
                      setSelecting(
                        selecting === "drop"
                          ? null
                          : "drop"
                      )
                    }
                  >
                    <i className="bi bi-geo-alt-fill me-1"></i>

                    {selecting === "drop"
                      ? "Selecting..."
                      : "Pick on Map"}
                  </button>

                </div>


                <div className="input-group">

                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-geo-alt-fill text-danger"></i>
                  </span>

                  <input
                    type="text"
                    className="form-control border-start-0 py-2"
                    placeholder="Search destination..."
                    value={dropName}
                    onChange={(e) =>
                      handleDropChange(
                        e.target.value
                      )
                    }
                    required
                  />

                </div>


                {dropSuggestions.length > 0 && (

                  <div
                    className="list-group position-absolute w-100 shadow-lg rounded-3 mt-1 bg-white"
                    style={{
                      top: "100%",
                      zIndex: 1050,
                    }}
                  >

                    {dropSuggestions.map(
                      (item, index) => (

                        <button
                          key={index}
                          type="button"
                          className="list-group-item list-group-item-action py-2 text-start small border-0 border-bottom"
                          onClick={() =>
                            selectDropLocation(
                              item
                            )
                          }
                        >

                          <i className="bi bi-pin-map-fill text-danger me-2"></i>

                          <strong>
                            {item.name.split(",")[0]}
                          </strong>

                          <span className="text-muted d-block small">
                            {item.name}
                          </span>

                        </button>

                      )
                    )}

                  </div>
                )}

              </div>


              {/* VEHICLES */}

              <div className="mb-4">

                <label className="form-label fw-semibold text-muted small">
                  SELECT VEHICLE CATEGORY
                </label>

                <div className="d-flex gap-2">

                  {Object.keys(vehicleConfig).map(
                    (type) => {

                      const vehicle =
                        vehicleConfig[type];

                      const selected =
                        vehicleType === type;

                      return (

                        <button
                          key={type}
                          type="button"
                          className="btn flex-grow-1 py-3 px-2 rounded-3 fw-bold shadow-sm"
                          style={{
                            background:
                              selected
                                ? "#FF6B00"
                                : "#FFFFFF",

                            color:
                              selected
                                ? "#FFFFFF"
                                : "#1E293B",

                            border:
                              selected
                                ? "2px solid #FF6B00"
                                : "1px solid #CBD5E1",
                          }}
                          onClick={() =>
                            handleVehicleChange(
                              type
                            )
                          }
                        >

                          <i
                            className={`bi ${vehicle.icon} me - 2`}
                          ></i>

                          {type}

                        </button>

                      );
                    }
                  )}

                </div>

              </div>


              {/* SEARCH BUTTON */}

              <div className="d-flex gap-2 mb-3">

                <button
                  type="submit"
                  className="btn flex-grow-1 py-3 fw-bold text-white shadow-sm"
                  style={{
                    background: "#FF6B00",
                  }}
                  disabled={isSearching}
                >

                  {isSearching ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>

                      Calculating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-search me-2"></i>

                      Calculate Fare & Search
                    </>
                  )}

                </button>


                <button
                  type="button"
                  className="btn btn-outline-secondary px-3"
                  onClick={handleReset}
                >
                  <i className="bi bi-arrow-counterclockwise"></i>
                </button>

              </div>

            </form>


            {/* ---------------------------------- */}
            {/* RIDE RESULT */}
            {/* ---------------------------------- */}

            {rideResult && (

              <div className="mt-4 p-3 bg-light rounded-4 border border-warning">

                <div className="d-flex justify-content-between align-items-center mb-2">

                  <h6 className="fw-bold mb-0 text-dark">

                    <i className="bi bi-ticket-perforated-fill text-warning me-1"></i>

                    Ride Fare Estimate

                  </h6>

                  <span className="badge bg-success">
                    Request Available
                  </span>

                </div>


                <div className="d-flex justify-content-between align-items-center my-3">

                  <div>

                    <span className="text-muted small d-block">
                      Vehicle:{" "}
                      <strong>
                        {rideResult.vehicleType}
                      </strong>
                    </span>

                    <span className="text-muted small d-block">
                      Vehicle ID:{" "}
                      <strong>
                        {rideResult.vehicleId}
                      </strong>
                    </span>

                    <span className="text-muted small d-block">
                      Distance:{" "}
                      <strong>
                        {rideResult.distanceKm} km
                      </strong>
                    </span>

                    <span className="text-success small fw-semibold">
                      ETA:{" "}
                      {rideResult.eta}
                    </span>

                  </div>


                  <h3
                    className="fw-bold mb-0"
                    style={{
                      color: "#FF6B00",
                    }}
                  >
                    ₹{rideResult.fare}
                  </h3>

                </div>


                <button
                  type="button"
                  className="btn w-100 fw-bold text-white shadow-sm py-2"
                  style={{
                    background: "#22c55e",
                  }}
                  onClick={
                    handleConfirmRide
                  }
                  disabled={isSubmitting}
                >

                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>

                      Saving Booking...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle-fill me-2"></i>

                      Confirm & Request Ride
                    </>
                  )}

                </button>

              </div>

            )}

          </div>

        </div>


        {/* ---------------------------------- */}
        {/* MAP */}
        {/* ---------------------------------- */}

        <div className="col-lg-7">

          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">

            <div className="d-flex justify-content-between align-items-center mb-3 px-1">

              <h6 className="fw-bold mb-0 text-dark">

                <i className="bi bi-map-fill text-primary me-2"></i>

                Live Interactive Route Map

              </h6>

              <small className="text-muted">
                <i className="bi bi-info-circle me-1"></i>

                Click map to place markers
              </small>

            </div>


            <MapComponent
              pickup={pickup}
              drop={drop}
              setPickup={setPickup}
              setDrop={setDrop}
              pickupName={pickupName}
              dropName={dropName}
              setPickupName={setPickupName}
              setDropName={setDropName}
              selecting={selecting}
              onClose={() =>
                setSelecting(null)
              }
            />

          </div>

        </div>

      </div>

    </div>
  );
}

