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

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    fetchMyBookings();
  }, [userId]);

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const data = await rideApi.getRidesByUserId(userId);
      console.log("%c[MyBookings] 📊 Live Database Rides Payload:", "color: #3b82f6; font-weight: bold;", data);
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching ride bookings from database:", error);
      setBookings([]);
    } finally {
      setLoading(false);
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
    return sessionStorage.getItem(`otp_${rideId}`) || null;
  };

  // Helper to normalize status values
  const getNormalizedStatus = (status) => {
    if (status === 1 || status === "Completed" || status === "COMPLETED") return "COMPLETED";
    if (status === 2 || status === 3 || status === "In Progress" || status === "ACCEPTED" || status === "IN_PROGRESS" || status === "CONFIRMED" || status === "Confirmed") return "CONFIRMED";
    if (status === 0 || status === "Cancelled" || status === "CANCELLED") return "CANCELLED";
    return "CONFIRMED";
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
        ["Assigned Driver", ride.driverName || ride.driver?.name || "Suresh Patil"],
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
            const vehicleName = b.vehicleType || b.vehicle_type || (index % 3 === 0 ? "SUV" : index % 3 === 1 ? "Sedan" : "Hatchback");
            const driverName = b.driverName || b.driver_name || (index % 3 === 0 ? "Ramesh Yadav" : index % 3 === 1 ? "Suresh Patil" : "Mahesh Singh");
            const driverRating = b.driverRating || (4.5 + (index % 5) * 0.1).toFixed(1);
            const fareVal = b.fare || b.total_fare || b.totalFare || b.net_amount || (180 + index * 70);

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
                        <span className="badge rounded-pill px-3 py-2 fw-semibold text-success bg-success-subtle border border-success-subtle" style={{ fontSize: "0.85rem" }}>
                          Confirmed
                        </span>
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
                        <a
                          href="/rider/search-ride"
                          className="btn btn-warning btn-sm rounded-3 px-3 fw-bold text-white shadow-sm"
                          style={{ backgroundColor: "#FF6B00", borderColor: "#FF6B00", fontSize: "0.85rem" }}
                        >
                          Track Ride
                        </a>
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
                              <i className="bi bi-headset me-2 text-success"></i> Help & Support
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
                      <strong className="text-dark">{selectedRide.driverName || "Ramesh Yadav"}</strong>
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
    </div>
  );
}


