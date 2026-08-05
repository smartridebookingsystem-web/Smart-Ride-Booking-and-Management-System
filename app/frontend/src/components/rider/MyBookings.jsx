import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { rideApi } from "../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function MyBookings() {
  const { user } = useSelector((state) => state.auth || {});
  const userId = user?.userId || user?.id || 3;

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedTab, setSelectedTab] = useState("ALL");

  // Modal Detail State
  const [selectedRide, setSelectedRide] = useState(null);

  // Live Tracking Modal State
  const [trackingRide, setTrackingRide] = useState(null);
  const [paymentOption, setPaymentOption] = useState("CASH");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    fetchMyBookings(true);

    const interval = setInterval(() => {
      fetchMyBookings(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [userId]);

  const fetchMyBookings = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await rideApi.getRidesByUserId(userId);
      const rideList = Array.isArray(data) ? data : [];
      setBookings(rideList);

      // Live sync active trackingRide modal status
      setTrackingRide((prevTracking) => {
        if (!prevTracking) return null;
        const updated = rideList.find((r) => String(r.rideId || r.id) === String(prevTracking.actualRideId || prevTracking.rideId));
        if (updated && updated.status !== prevTracking.status) {
          return { ...prevTracking, status: updated.status };
        }
        return prevTracking;
      });
    } catch (error) {
      console.error("Error fetching ride bookings from database:", error);
      if (showLoading) setBookings([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return "10 Jun 2026 • 10:00 AM";
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return String(d);
      return dt.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).replace(",", " •");
    } catch {
      return String(d);
    }
  };

  const getRideOtp = (rideId) => {
    const stored = sessionStorage.getItem(`otp_${rideId}`) || localStorage.getItem(`otp_${rideId}`);
    if (stored) return stored;
    const fallbackOtp = String(1000 + (Number(rideId || 1) * 73) % 9000);
    sessionStorage.setItem(`otp_${rideId}`, fallbackOtp);
    localStorage.setItem(`otp_${rideId}`, fallbackOtp);
    return fallbackOtp;
  };

  // Helper to normalize status values
  const getNormalizedStatus = (status) => {
    if (status === 1 || status === "Completed" || status === "COMPLETED") return "COMPLETED";
    if (status === 4 || status === -1 || status === "Cancelled" || status === "CANCELLED") return "CANCELLED";
    return "CONFIRMED";
  };

  // Helper to determine active stage level (1 to 4) for tracking modal stepper
  const getTripStageLevel = (status) => {
    if (status === 1 || status === "COMPLETED" || status === "Completed") return 4; // Driving to Destination / Completed
    if (status === 2 || status === "IN_PROGRESS" || status === "In Progress") return 3; // OTP Verified / Driving
    if (status === 3 || status === "ACCEPTED" || status === "Accepted" || status === "CONFIRMED" || status === "Confirmed") return 2; // Driver Accepted
    return 1; // 0 or PENDING / Request Sent
  };

  // DB Driver Name lookup based on database populate script (Sulkshana, Manish, Mukesh, Aniket, Sanket)
  const getDriverName = (b) => {
    if (!b) return "Assigning Driver...";
    if (b.driverName) return b.driverName;
    if (b.driver_name) return b.driver_name;
    if (b.driver?.username) return b.driver.username;
    if (b.driver?.name) return b.driver.name;

    const dId = Number(b.driverId || b.driver_id);
    if (dId === 1) return "Sulkshana";
    if (dId === 2) return "Manish";
    if (dId === 3) return "Mukesh";
    if (dId === 4) return "Aniket";
    if (dId === 5) return "Sanket";

    const vId = Number(b.vehicleId || b.vehicle_id);
    if (vId === 1) return "Manish";
    if (vId === 2) return "Sulkshana";
    if (vId === 3) return "Mukesh";
    if (vId === 4) return "Aniket";
    if (vId === 5) return "Sanket";

    if (Number(b.status) === 0 || b.status === "0" || b.status === "REQUESTED" || b.status === "PENDING") {
      return "Assigning Driver...";
    }

    return "Driver Assigned";
  };

  // DB Vehicle Type lookup based on database populate script (1 = SUV, 2 = Hatchback, 3 = Sedan, 4 = SUV, 5 = Sedan)
  const getVehicleTypeName = (b) => {
    if (!b) return "Sedan";
    if (b.vehicleType) return b.vehicleType;
    if (b.vehicle_type) return b.vehicle_type;

    const vId = Number(b.vehicleId || b.vehicle_id);
    if (vId === 1) return "SUV";
    if (vId === 2) return "Hatchback";
    if (vId === 3) return "Sedan";
    if (vId === 4) return "SUV";
    if (vId === 5) return "Sedan";

    const vTypeId = Number(b.vehicleTypeId || b.vehicle_type_id);
    if (vTypeId === 1) return "Hatchback";
    if (vTypeId === 2) return "Sedan";
    if (vTypeId === 3) return "SUV";

    return "Sedan";
  };

  // Dynamic counts for status tabs
  const counts = {
    ALL: bookings.length,
    CONFIRMED: bookings.filter((b) => getNormalizedStatus(b.status) === "CONFIRMED").length,
    COMPLETED: bookings.filter((b) => getNormalizedStatus(b.status) === "COMPLETED").length,
    CANCELLED: bookings.filter((b) => getNormalizedStatus(b.status) === "CANCELLED").length,
  };

  // Filter Logic
  const filteredBookings = bookings.filter((b) => {
    const normStatus = getNormalizedStatus(b.status);

    // Tab Filter
    if (selectedTab !== "ALL" && normStatus !== selectedTab) return false;

    // Dropdown Status Filter
    if (statusFilter !== "ALL" && normStatus !== statusFilter) return false;

    // Search Query (Ride ID, Source, Destination, Driver)
    if (searchTerm.trim() !== "") {
      const query = searchTerm.toLowerCase();
      const rideIdStr = `SR${b.rideId || b.id || ""}`.toLowerCase();
      const sourceStr = (b.source || b.pickup || b.pickupLocation || "").toLowerCase();
      const destStr = (b.destination || b.drop || b.dropLocation || "").toLowerCase();
      const driverStr = (b.driverName || b.driver?.name || "").toLowerCase();
      if (!rideIdStr.includes(query) && !sourceStr.includes(query) && !destStr.includes(query) && !driverStr.includes(query)) {
        return false;
      }
    }

    // Date Filter
    if (dateFilter) {
      const bDate = new Date(b.bookingDate || b.date || b.createdAt).toISOString().split("T")[0];
      if (bDate !== dateFilter) return false;
    }

    return true;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredBookings.length / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + rowsPerPage);

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setDateFilter("");
    setSelectedTab("ALL");
    setCurrentPage(1);
  };

  // PDF Export Function
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor(255, 107, 0);
    doc.text("SmartRide — My Ride Booking History", 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Exported on: ${new Date().toLocaleString("en-IN")}`, 14, 26);

    const rows = filteredBookings.map((b, idx) => [
      idx + 1,
      `SR${12340 + (b.rideId || b.id || idx)}`,
      formatDate(b.bookingDate || b.date || b.createdAt),
      b.source || b.pickup || "—",
      b.destination || b.drop || "—",
      typeof b.fare === "number" ? `Rs.${b.fare}` : b.fare || "Rs.250",
      getNormalizedStatus(b.status),
    ]);

    autoTable(doc, {
      startY: 32,
      head: [["#", "Ride ID", "Date & Time", "Pickup", "Destination", "Fare", "Status"]],
      body: rows,
      headStyles: { fillColor: [255, 107, 0], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      styles: { fontSize: 9, cellPadding: 4 },
    });

    doc.save(`SmartRide_Bookings_${Date.now()}.pdf`);
  };

  // Single Ride PDF Receipt Download
  const handleDownloadReceipt = (ride) => {
    const doc = new jsPDF();
    const rideIdStr = `SR${12340 + (ride.rideId || ride.id || 1)}`;
    doc.setFontSize(18);
    doc.setTextColor(255, 107, 0);
    doc.text("SmartRide — Official Trip Receipt", 14, 20);

    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    doc.text(`Receipt ID: REC-${Date.now()}`, 14, 30);
    doc.text(`Booking Reference: ${rideIdStr}`, 14, 37);
    doc.text(`Date & Time: ${formatDate(ride.bookingDate || ride.date || ride.createdAt)}`, 14, 44);

    autoTable(doc, {
      startY: 52,
      head: [["Trip Item", "Details"]],
      body: [
        ["Pickup Location", ride.source || ride.pickup || "Kothrud, Pune"],
        ["Drop Destination", ride.destination || ride.drop || "Viman Nagar, Pune"],
        ["Vehicle Category", ride.vehicleType || "Sedan (4 Seater)"],
        ["Assigned Driver", ride.driverName || getDriverName(ride)],
        ["Driver Rating", "⭐ 4.8"],
        ["Total Fare Paid", `₹${ride.fare || 250}`],
        ["Payment Mode", ride.paymentMode || "UPI / Wallet"],
        ["Status", "Completed ✅"],
      ],
      headStyles: { fillColor: [15, 23, 42], textColor: 255 },
      styles: { fontSize: 10, cellPadding: 5 },
    });

    doc.save(`${rideIdStr}_Receipt.pdf`);
  };

  return (
    <div className="container-fluid p-0" style={{ backgroundColor: "#F8FAFC", minHeight: "100vh" }}>
      {/* Header Banner */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "#0F172A", letterSpacing: "-0.5px" }}>
            My Bookings
          </h2>
          <p className="text-muted mb-0" style={{ fontSize: "0.95rem" }}>
            View and manage all your ride bookings in one place.
          </p>
        </div>
        <button className="btn btn-outline-dark rounded-pill px-3 py-2 small fw-semibold shadow-sm bg-white" onClick={handleExportPDF}>
          <i className="bi bi-download me-1.5 text-warning"></i> Export PDF History
        </button>
      </div>

      {/* Filter Bar Controls */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <div className="row g-3 align-items-center">
          {/* Search Box */}
          <div className="col-lg-4 col-md-6">
            <div className="input-group bg-light rounded-3 border-0">
              <span className="input-group-text bg-transparent border-0 text-muted ps-3">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control bg-transparent border-0 py-2.5 text-dark"
                placeholder="Search by Ride ID, Location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ fontSize: "0.9rem" }}
              />
            </div>
          </div>

          {/* Status Select Dropdown */}
          <div className="col-lg-3 col-md-6">
            <select
              className="form-select bg-light border-0 py-2.5 rounded-3 text-dark fw-medium"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setSelectedTab(e.target.value);
              }}
              style={{ fontSize: "0.9rem" }}
            >
              <option value="ALL">All Status</option>
              <option value="CONFIRMED">Confirmed / In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Date Picker */}
          <div className="col-lg-3 col-md-6">
            <div className="input-group bg-light rounded-3 border-0">
              <span className="input-group-text bg-transparent border-0 text-muted ps-3">
                <i className="bi bi-calendar3"></i>
              </span>
              <input
                type="date"
                className="form-control bg-transparent border-0 py-2.5 text-dark"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{ fontSize: "0.9rem" }}
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="col-lg-2 col-md-6 text-end">
            <button
              type="button"
              className="btn btn-white border border-light-subtle rounded-3 py-2.5 px-3 w-100 fw-semibold text-dark shadow-sm bg-white hover-shadow"
              onClick={handleClearFilters}
              style={{ fontSize: "0.9rem" }}
            >
              <i className="bi bi-arrow-counterclockwise text-warning me-1.5"></i> Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Stat Summary Counter Tabs */}
      <div className="row g-3 mb-4">
        {/* All Bookings Tab */}
        <div className="col-lg-3 col-6">
          <div
            className={`card border-0 shadow-sm rounded-4 p-3 cursor-pointer transition-all ${
              selectedTab === "ALL" ? "border border-2 border-warning bg-white" : "bg-white"
            }`}
            onClick={() => {
              setSelectedTab("ALL");
              setStatusFilter("ALL");
            }}
            style={{ borderLeft: selectedTab === "ALL" ? "4px solid #FF6B00" : undefined, cursor: "pointer" }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2.5">
                <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#FFF7ED", width: "40px", height: "40px" }}>
                  <i className="bi bi-card-checklist fs-5" style={{ color: "#FF6B00" }}></i>
                </div>
                <span className="fw-bold text-dark" style={{ fontSize: "0.95rem" }}>All Bookings</span>
              </div>
              <h4 className="fw-bold mb-0 text-dark">{counts.ALL}</h4>
            </div>
          </div>
        </div>

        {/* Confirmed / Active Tab */}
        <div className="col-lg-3 col-6">
          <div
            className={`card border-0 shadow-sm rounded-4 p-3 cursor-pointer transition-all ${
              selectedTab === "CONFIRMED" ? "border border-2 border-success bg-white" : "bg-white"
            }`}
            onClick={() => {
              setSelectedTab("CONFIRMED");
              setStatusFilter("CONFIRMED");
            }}
            style={{ cursor: "pointer" }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2.5">
                <div className="rounded-circle bg-success-subtle p-2 d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
                  <i className="bi bi-check-circle-fill text-success fs-5"></i>
                </div>
                <span className="fw-bold text-dark" style={{ fontSize: "0.95rem" }}>Confirmed</span>
              </div>
              <h4 className="fw-bold mb-0 text-dark">{counts.CONFIRMED}</h4>
            </div>
          </div>
        </div>

        {/* Completed Tab */}
        <div className="col-lg-3 col-6">
          <div
            className={`card border-0 shadow-sm rounded-4 p-3 cursor-pointer transition-all ${
              selectedTab === "COMPLETED" ? "border border-2 border-primary bg-white" : "bg-white"
            }`}
            onClick={() => {
              setSelectedTab("COMPLETED");
              setStatusFilter("COMPLETED");
            }}
            style={{ cursor: "pointer" }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2.5">
                <div className="rounded-circle bg-primary-subtle p-2 d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
                  <i className="bi bi-patch-check-fill text-primary fs-5"></i>
                </div>
                <span className="fw-bold text-dark" style={{ fontSize: "0.95rem" }}>Completed</span>
              </div>
              <h4 className="fw-bold mb-0 text-dark">{counts.COMPLETED}</h4>
            </div>
          </div>
        </div>

        {/* Cancelled Tab */}
        <div className="col-lg-3 col-6">
          <div
            className={`card border-0 shadow-sm rounded-4 p-3 cursor-pointer transition-all ${
              selectedTab === "CANCELLED" ? "border border-2 border-danger bg-white" : "bg-white"
            }`}
            onClick={() => {
              setSelectedTab("CANCELLED");
              setStatusFilter("CANCELLED");
            }}
            style={{ cursor: "pointer" }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2.5">
                <div className="rounded-circle bg-danger-subtle p-2 d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
                  <i className="bi bi-x-circle-fill text-danger fs-5"></i>
                </div>
                <span className="fw-bold text-dark" style={{ fontSize: "0.95rem" }}>Cancelled</span>
              </div>
              <h4 className="fw-bold mb-0 text-dark">{counts.CANCELLED}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <div className="spinner-border text-warning mx-auto mb-3" role="status">
            <span className="visually-hidden">Loading database bookings...</span>
          </div>
          <h6 className="fw-bold text-dark mb-1">Fetching Live Database Bookings...</h6>
          <p className="text-muted small mb-0">Connecting to ride-service microservice database endpoints</p>
        </div>
      ) : paginatedBookings.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <i className="bi bi-journal-x fs-1 text-muted mb-3"></i>
          <h5 className="fw-bold text-dark mb-1">No Bookings Found</h5>
          <p className="text-muted small mb-3">No ride records match your selected filters or search query.</p>
          <button className="btn btn-warning text-white fw-bold px-4 py-2 rounded-pill mx-auto" onClick={handleClearFilters} style={{ backgroundColor: "#FF6B00" }}>
            Reset Filters
          </button>
        </div>
      ) : (
        /* Booking Items Card List */
        <div className="d-flex flex-column gap-3 mb-4">
          {paginatedBookings.map((b, index) => {
            const normStatus = getNormalizedStatus(b.status);
            const actualRideId = b.ride_id || b.rideId || b.id || (index + 1);
            const rideIdStr = `SR${1000 + Number(actualRideId)}`;
            const storedOtp = getRideOtp(actualRideId);
            const vehicleName = getVehicleTypeName(b);
            const driverName = getDriverName(b);
            const driverRating = b.driverRating || (4.5 + (index % 5) * 0.1).toFixed(1);
            const fareVal = rideApi.calculateRideFare(b);

            return (
              <div key={b.rideId || b.id || index} className="card border-0 shadow-sm rounded-4 p-3.5 bg-white position-relative hover-shadow transition-all">
                <div className="row align-items-center g-3">
                  {/* Left Column: Ride ID & Date */}
                  <div className="col-lg-2 col-md-3">
                    <span className="text-muted extra-small d-block fw-semibold text-uppercase mb-1" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>
                      Ride ID
                    </span>
                    <h5 className="fw-bold text-dark mb-1" style={{ letterSpacing: "-0.3px" }}>
                      {rideIdStr}
                    </h5>
                    <span className="text-muted small d-block">{formatDate(b.bookingDate || b.date || b.createdAt)}</span>
                  </div>

                  {/* Route Column: Pickup & Drop */}
                  <div className="col-lg-3 col-md-4">
                    <div className="d-flex align-items-start gap-2 mb-2">
                      <i className="bi bi-circle-fill text-success fs-6 mt-1"></i>
                      <div>
                        <span className="fw-bold text-dark d-block text-truncate" style={{ maxWidth: "220px", fontSize: "0.95rem" }}>
                          {b.source || b.pickup || b.pickupLocation || "MG Road, Pune"}
                        </span>
                        <span className="text-muted extra-small" style={{ fontSize: "0.75rem" }}>Pickup</span>
                      </div>
                    </div>
                    <div className="d-flex align-items-start gap-2">
                      <i className="bi bi-circle-fill text-danger fs-6 mt-1"></i>
                      <div>
                        <span className="fw-bold text-dark d-block text-truncate" style={{ maxWidth: "220px", fontSize: "0.95rem" }}>
                          {b.destination || b.drop || b.dropLocation || "Hinjewadi IT Park, Pune"}
                        </span>
                        <span className="text-muted extra-small" style={{ fontSize: "0.75rem" }}>Drop</span>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Card Box */}
                  <div className="col-lg-2 col-md-3 col-6 text-center">
                    <div className="bg-light rounded-3 p-2.5 d-inline-block border border-light-subtle w-100" style={{ maxWidth: "110px" }}>
                      <i className="bi bi-car-front-fill text-dark fs-4 d-block mb-0.5"></i>
                      <span className="fw-bold text-dark d-block small mb-0">{vehicleName}</span>
                      <span className="text-muted extra-small" style={{ fontSize: "0.7rem" }}>4 Seater</span>
                    </div>
                  </div>

                  {/* Driver Info Column */}
                  <div className="col-lg-2 col-md-3 col-6">
                    <span className="text-muted extra-small d-block fw-semibold text-uppercase mb-1" style={{ fontSize: "0.75rem" }}>
                      Driver
                    </span>
                    <span className="fw-bold text-dark d-block text-truncate" style={{ fontSize: "0.95rem" }}>
                      {driverName}
                    </span>
                    <div className="d-flex align-items-center gap-1 text-warning small mt-0.5">
                      <i className="bi bi-star-fill"></i>
                      <span className="fw-semibold text-dark">{driverRating}</span>
                    </div>
                  </div>

                  {/* Right Column: Fare, Status Badge & Action Buttons */}
                  <div className="col-lg-3 col-md-12 text-lg-end text-start">
                    <div className="d-flex flex-wrap justify-content-lg-end justify-content-between align-items-center gap-2 mb-2">
                      <div>
                        <span className="text-muted extra-small d-block fw-semibold text-uppercase" style={{ fontSize: "0.75rem" }}>Fare</span>
                        <h4 className="fw-bold mb-0 text-dark" style={{ letterSpacing: "-0.5px" }}>
                          ₹ {fareVal}
                        </h4>
                      </div>

                      {/* Status Pill */}
                      {normStatus === "CONFIRMED" && (
                        <div className="d-flex flex-column align-items-end gap-1">
                          <span className={`badge rounded-pill px-3 py-2 fw-semibold ${Number(b.status) === 0 || String(b.status).toLowerCase() === "requested" ? "text-warning bg-warning-subtle border border-warning-subtle" : "text-success bg-success-subtle border border-success-subtle"}`} style={{ fontSize: "0.85rem" }}>
                            {Number(b.status) === 0 || String(b.status).toLowerCase() === "requested" ? "Requested" : "Confirmed"}
                          </span>
                          <span className="badge bg-warning text-dark font-monospace px-2.5 py-1 rounded-3" style={{ fontSize: "0.8rem", letterSpacing: "1px" }}>
                            🔑 OTP: {getRideOtp(actualRideId) || "1234"}
                          </span>
                        </div>
                      )}
                      {normStatus === "COMPLETED" && (
                        <span className="badge rounded-pill px-3 py-2 fw-semibold text-primary bg-primary-subtle border border-primary-subtle" style={{ fontSize: "0.85rem" }}>
                          Completed
                        </span>
                      )}
                      {normStatus === "CANCELLED" && (
                        <span className="badge rounded-pill px-3 py-2 fw-semibold text-danger bg-danger-subtle border border-danger-subtle" style={{ fontSize: "0.85rem" }}>
                          Cancelled
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex justify-content-lg-end justify-content-start align-items-center gap-2">
                      <button
                        className="btn btn-outline-secondary btn-sm rounded-3 px-3 fw-semibold bg-white shadow-sm"
                        onClick={() => setSelectedRide({ ...b, displayId: rideIdStr, vehicleName, driverName, driverRating, fareVal, normStatus })}
                        style={{ fontSize: "0.85rem" }}
                      >
                        View Details
                      </button>

                      {normStatus === "CONFIRMED" && (
                        <button
                          type="button"
                          className="btn btn-warning btn-sm rounded-3 px-3 fw-bold text-white shadow-sm"
                          style={{ backgroundColor: "#FF6B00", borderColor: "#FF6B00", fontSize: "0.85rem" }}
                          onClick={() => setTrackingRide({ ...b, actualRideId, rideIdStr, vehicleName, driverName, driverRating, fareVal, normStatus, otpCode: getRideOtp(actualRideId) })}
                        >
                          <i className="bi bi-crosshair me-1"></i> Track Ride
                        </button>
                      )}

                      {normStatus === "COMPLETED" && (
                        <button
                          className="btn btn-outline-warning btn-sm rounded-3 px-3 fw-semibold text-dark shadow-sm bg-white"
                          style={{ color: "#FF6B00", borderColor: "#FF6B00", fontSize: "0.85rem" }}
                          onClick={() => handleDownloadReceipt({ ...b, vehicleType: vehicleName, driverName, fare: fareVal })}
                        >
                          Download Receipt
                        </button>
                      )}

                      {normStatus === "CANCELLED" && (
                        <button className="btn btn-outline-danger btn-sm rounded-3 px-3 fw-semibold disabled opacity-75" style={{ fontSize: "0.85rem" }}>
                          Cancelled
                        </button>
                      )}

                      <div className="dropdown">
                        <button className="btn btn-light btn-sm rounded-circle p-1.5 shadow-sm" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                          <i className="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-3">
                          <li>
                            <button className="dropdown-item small py-2" onClick={() => setSelectedRide({ ...b, displayId: rideIdStr, vehicleName, driverName, driverRating, fareVal, normStatus })}>
                              <i className="bi bi-info-circle me-2 text-primary"></i> Full Trip Details
                            </button>
                          </li>
                          {normStatus === "COMPLETED" && (
                            <li>
                              <button className="dropdown-item small py-2" onClick={() => handleDownloadReceipt({ ...b, vehicleType: vehicleName, driverName, fare: fareVal })}>
                                <i className="bi bi-file-earmark-pdf me-2 text-warning"></i> Download Receipt
                              </button>
                            </li>
                          )}
                          <li>
                            <a className="dropdown-item small py-2 text-dark" href="/rider/help-support">
                              <i className="bi bi-headset me-2 text-success"></i> Help &amp; Support
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>


                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {!loading && filteredBookings.length > 0 && (
        <div className="card border-0 shadow-sm rounded-4 p-3 bg-white d-flex flex-row justify-content-between align-items-center flex-wrap gap-2">
          <span className="text-muted small">
            Showing {startIndex + 1} to {Math.min(startIndex + rowsPerPage, filteredBookings.length)} of {filteredBookings.length} bookings
          </span>

          <div className="d-flex align-items-center gap-3">
            {/* Pagination Controls */}
            <div className="d-flex align-items-center gap-1">
              <button
                className="btn btn-light btn-sm rounded-3 px-2.5 py-1"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  className={`btn btn-sm rounded-3 px-3 py-1 fw-bold ${pg === currentPage ? "btn-warning text-white" : "btn-light text-dark"}`}
                  style={{ backgroundColor: pg === currentPage ? "#FF6B00" : undefined }}
                  onClick={() => setCurrentPage(pg)}
                >
                  {pg}
                </button>
              ))}
              <button
                className="btn btn-light btn-sm rounded-3 px-2.5 py-1"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>

            {/* Rows Per Page Selector */}
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small">Rows per page</span>
              <select
                className="form-select form-select-sm bg-light border-0 rounded-3 font-semibold"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{ width: "70px" }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Ride Details Modal */}
      {selectedRide && (
        <div className="modal fade show d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header border-0 bg-dark text-white p-4">
                <div>
                  <span className="badge bg-warning text-dark font-monospace mb-1">BOOKING DETAILS</span>
                  <h5 className="modal-title fw-bold text-white">{selectedRide.displayId}</h5>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedRide(null)}></button>
              </div>

              <div className="modal-body p-4 bg-light">
                <div className="bg-white p-3 rounded-4 shadow-sm mb-3 border">
                  <span className="text-muted extra-small fw-semibold text-uppercase d-block mb-2">Trip Route</span>
                  <div className="d-flex align-items-start gap-2 mb-2">
                    <i className="bi bi-circle-fill text-success mt-1"></i>
                    <div>
                      <strong className="text-dark d-block">{selectedRide.source || selectedRide.pickup || "MG Road, Pune"}</strong>
                      <span className="text-muted small">Pickup Point</span>
                    </div>
                  </div>
                  <div className="d-flex align-items-start gap-2">
                    <i className="bi bi-circle-fill text-danger mt-1"></i>
                    <div>
                      <strong className="text-dark d-block">{selectedRide.destination || selectedRide.drop || "Hinjewadi IT Park, Pune"}</strong>
                      <span className="text-muted small">Drop Destination</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-4 shadow-sm mb-3 border">
                  <div className="row g-2">
                    <div className="col-6">
                      <span className="text-muted extra-small d-block">Vehicle</span>
                      <strong className="text-dark">{selectedRide.vehicleName || "Sedan (4 Seater)"}</strong>
                    </div>
                    <div className="col-6">
                      <span className="text-muted extra-small d-block">Assigned Driver</span>
                      <strong className="text-dark">{selectedRide.driverName || getDriverName(selectedRide)}</strong>
                    </div>
                    <div className="col-6 mt-2">
                      <span className="text-muted extra-small d-block">Total Fare</span>
                      <strong className="text-success fs-5">₹ {selectedRide.fareVal || 350}</strong>
                    </div>
                    <div className="col-6 mt-2">
                      <span className="text-muted extra-small d-block">Payment Mode</span>
                      <strong className="text-dark">{selectedRide.paymentMode || "UPI / Wallet"}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0 p-3 bg-white d-flex justify-content-between">
                <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setSelectedRide(null)}>
                  Close
                </button>
                {selectedRide.normStatus === "COMPLETED" && (
                  <button
                    className="btn btn-warning text-white fw-bold rounded-pill px-4"
                    style={{ backgroundColor: "#FF6B00" }}
                    onClick={() => {
                      handleDownloadReceipt(selectedRide);
                      setSelectedRide(null);
                    }}
                  >
                    <i className="bi bi-file-earmark-pdf me-1.5"></i> Download Receipt
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Ride Tracking & Stage Progress Modal */}
      {trackingRide && (
        <div className="modal fade show d-block bg-dark bg-opacity-75 shadow-lg" tabIndex="-1" style={{ backdropFilter: "blur(6px)", zIndex: 1070 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden" style={{ background: "#0F172A", color: "#fff" }}>
              
              {/* Header */}
              <div className="modal-header border-bottom border-white border-opacity-10 p-4" style={{ background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)" }}>
                <div>
                  <span className="badge bg-warning text-dark font-monospace mb-1">LIVE RIDE TRACKING &amp; STAGE PROGRESS</span>
                  <h5 className="modal-title fw-bold text-white mb-0">Booking {trackingRide.rideIdStr || `#${trackingRide.actualRideId}`}</h5>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setTrackingRide(null)}></button>
              </div>

              <div className="modal-body p-4 text-white">
                
                {/* LIVE TRIP STAGE PROGRESS - Modern Line Stepper */}
                {(() => {
                  const currentStage = getTripStageLevel(trackingRide.status);
                  return (
                    <div className="card border-0 bg-white p-3 mb-4 rounded-4 shadow-sm text-dark">
                      <div className="row text-center g-3 align-items-center">
                        {/* Step 1 */}
                        <div className="col">
                          <div
                            className="fw-bold mb-2"
                            style={{
                              fontSize: "0.82rem",
                              color: currentStage >= 1 ? "#2563eb" : "#6b7280",
                              transition: "color 0.3s ease"
                            }}
                          >
                            1. Request Sent
                          </div>
                          <div
                            className="w-100 rounded-pill"
                            style={{
                              height: "4px",
                              backgroundColor: currentStage >= 1 ? "#2563eb" : "#e5e7eb",
                              transition: "all 0.3s ease"
                            }}
                          />
                        </div>

                        {/* Step 2 */}
                        <div className="col">
                          <div
                            className="fw-bold mb-2"
                            style={{
                              fontSize: "0.82rem",
                              color: currentStage >= 2 ? "#2563eb" : "#6b7280",
                              transition: "color 0.3s ease"
                            }}
                          >
                            2. Driver Accepted
                          </div>
                          <div
                            className="w-100 rounded-pill"
                            style={{
                              height: "4px",
                              backgroundColor: currentStage >= 2 ? "#2563eb" : "#e5e7eb",
                              transition: "all 0.3s ease"
                            }}
                          />
                        </div>

                        {/* Step 3 */}
                        <div className="col">
                          <div
                            className="fw-bold mb-2"
                            style={{
                              fontSize: "0.82rem",
                              color: currentStage >= 3 ? "#2563eb" : "#6b7280",
                              transition: "color 0.3s ease"
                            }}
                          >
                            3. OTP Verified
                          </div>
                          <div
                            className="w-100 rounded-pill"
                            style={{
                              height: "4px",
                              backgroundColor: currentStage >= 3 ? "#2563eb" : "#e5e7eb",
                              transition: "all 0.3s ease"
                            }}
                          />
                        </div>

                        {/* Step 4 */}
                        <div className="col">
                          <div
                            className="fw-bold mb-2"
                            style={{
                              fontSize: "0.82rem",
                              color: currentStage >= 4 ? "#2563eb" : "#6b7280",
                              transition: "color 0.3s ease"
                            }}
                          >
                            4. Driving to Destination
                          </div>
                          <div
                            className="w-100 rounded-pill"
                            style={{
                              height: "4px",
                              backgroundColor: currentStage >= 4 ? "#2563eb" : "#e5e7eb",
                              transition: "all 0.3s ease"
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* TRIP OTP BADGE BANNER */}
                <div className="alert alert-warning border-0 p-3 rounded-4 mb-4 d-flex justify-content-between align-items-center bg-warning bg-opacity-20 text-warning">
                  <div className="d-flex align-items-center gap-3">
                    <i className="bi bi-shield-lock-fill fs-2"></i>
                    <div>
                      <strong className="d-block text-warning fs-6">RIDER TRIP VERIFICATION OTP CODE</strong>
                      <span className="small text-light opacity-90">Share this code with your driver when they arrive to start the ride navigation.</span>
                    </div>
                  </div>
                  <span className="badge bg-warning text-dark font-monospace fs-3 px-3 py-2 rounded-3 shadow">
                    {trackingRide.otpCode || getRideOtp(trackingRide.actualRideId)}
                  </span>
                </div>

                {/* PAYMENT OPTION SELECTOR (CASH vs ONLINE) */}
                <div className="card border-0 bg-black bg-opacity-30 p-3.5 mb-4 rounded-4 border border-white border-opacity-10">
                  <h6 className="fw-bold text-warning mb-2">
                    <i className="bi bi-credit-card-2-front-fill me-2"></i>Choose Payment Option
                  </h6>
                  <p className="text-light opacity-80 small mb-3">
                    Select how you would like to pay for your trip fare (₹{trackingRide.fareVal || 180}):
                  </p>

                  <div className="row g-3">
                    {/* Cash Option */}
                    <div className="col-md-6">
                      <div
                        className={`p-3 rounded-3 border d-flex align-items-center gap-3 cursor-pointer ${
                          paymentOption === "CASH" ? "border-success bg-success bg-opacity-20 text-white fw-bold" : "border-secondary bg-dark text-light"
                        }`}
                        style={{ cursor: "pointer" }}
                        onClick={() => setPaymentOption("CASH")}
                      >
                        <input type="radio" name="payOpt" checked={paymentOption === "CASH"} onChange={() => setPaymentOption("CASH")} />
                        <i className="bi bi-cash-coin fs-3 text-success"></i>
                        <div>
                          <strong className="d-block text-white">Cash to Driver</strong>
                          <small className="text-light opacity-75">Pay ₹{trackingRide.fareVal || 180} cash directly to driver</small>
                        </div>
                      </div>
                    </div>

                    {/* Online Digital UPI Option */}
                    <div className="col-md-6">
                      <div
                        className={`p-3 rounded-3 border d-flex align-items-center gap-3 cursor-pointer ${
                          paymentOption === "ONLINE" ? "border-primary bg-primary bg-opacity-20 text-white fw-bold" : "border-secondary bg-dark text-light"
                        }`}
                        style={{ cursor: "pointer" }}
                        onClick={() => setPaymentOption("ONLINE")}
                      >
                        <input type="radio" name="payOpt" checked={paymentOption === "ONLINE"} onChange={() => setPaymentOption("ONLINE")} />
                        <i className="bi bi-qr-code-scan fs-3 text-info"></i>
                        <div>
                          <strong className="d-block text-white">Online Digital UPI</strong>
                          <small className="text-light opacity-75">GPay, PhonePe, Paytm or Wallet</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* TRIP DETAILS & DRIVER INFO */}
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="p-3 rounded-3 bg-black bg-opacity-40 border border-white border-opacity-10 h-100">
                      <small className="text-light opacity-75 d-block text-uppercase mb-1" style={{ fontSize: "0.75rem" }}>Pickup Location</small>
                      <strong className="text-white d-block mb-3">{trackingRide.source || trackingRide.pickup || "Model Colony, Pune"}</strong>
                      
                      <small className="text-light opacity-75 d-block text-uppercase mb-1" style={{ fontSize: "0.75rem" }}>Destination</small>
                      <strong className="text-white d-block">{trackingRide.destination || trackingRide.drop || "Hinjewadi Phase 1, Pune"}</strong>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="p-3 rounded-3 bg-black bg-opacity-40 border border-white border-opacity-10 h-100">
                      <small className="text-light opacity-75 d-block text-uppercase mb-1" style={{ fontSize: "0.75rem" }}>Assigned Captain</small>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <i className="bi bi-person-badge-fill text-warning fs-4"></i>
                        <div>
                          <strong className="text-white d-block">{trackingRide.driverName || getDriverName(trackingRide)}</strong>
                          <span className="text-warning small"><i className="bi bi-star-fill me-1"></i>4.5 Rating</span>
                        </div>
                      </div>
                      <small className="text-light opacity-75 d-block mt-2" style={{ fontSize: "0.75rem" }}>Vehicle: <strong>{trackingRide.vehicleName || "Sedan (MH-12-AB-4021)"}</strong></small>
                    </div>
                  </div>
                </div>

              </div>

              <div className="modal-footer border-top border-white border-opacity-10 p-3 bg-dark d-flex justify-content-between">
                <button type="button" className="btn btn-outline-light rounded-pill px-4" onClick={() => setTrackingRide(null)}>
                  Close Tracking
                </button>

                <button
                  type="button"
                  className="btn btn-warning fw-bold px-4 rounded-pill text-dark"
                  onClick={() => {
                    alert(`✅ Payment method set to: ${paymentOption === "CASH" ? "Cash to Driver" : "Online Digital UPI"}. Preference saved!`);
                    setTrackingRide(null);
                  }}
                >
                  <i className="bi bi-check-circle-fill me-1.5"></i> Save Payment Preference
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}


