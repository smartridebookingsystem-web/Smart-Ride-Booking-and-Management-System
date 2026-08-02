import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { rideApi } from "../services/api";
import Table_Layout from "../../Auth/Table_Layout";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function MyBookings() {
  const { user } = useSelector((state) => state.auth || {});
  const userId = user?.userId || user?.id || 3;

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBookings();
  }, [userId]);

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const data = await rideApi.getRidesByUserId(userId);
      setBookings(data || []);
    } catch (error) {
      console.error("Error fetching ride bookings from database:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return d;
    }
  };

  const getRideOtp = (rideId) => {
    return sessionStorage.getItem(`otp_${rideId}`) || null;
  };

  const renderStatusBadge = (status, rideId) => {
    const storedOtp = getRideOtp(rideId);
    if (status === 1 || status === "Completed") {
      return <span className="badge bg-success px-3 py-1.5">Completed</span>;
    }
    if (status === 2 || status === 3 || status === "In Progress") {
      return (
        <div className="d-flex flex-column align-items-start gap-1">
          <span className="badge bg-warning text-dark px-3 py-1">In Progress</span>
          {storedOtp && (
            <span className="badge bg-dark text-warning border border-warning px-2 py-1 small font-monospace">
              🔐 OTP: {storedOtp}
            </span>
          )}
        </div>
      );
    }
    if (status === 0 || status === "Cancelled") {
      return <span className="badge bg-danger px-3 py-1.5">Cancelled</span>;
    }
    return <span className="badge bg-secondary px-3 py-1.5">{status}</span>;
  };

  const columns = [
    { header: "Booking ID", field: "displayId" },
    { header: "Date & Time", field: "formattedDate" },
    { header: "Source (Pickup)", field: "pickupLocation" },
    { header: "Destination (Drop)", field: "dropLocation" },
    { header: "Fare", field: "fareDisplay" },
    { header: "Status & OTP", field: "statusBadge" },
  ];

  const tableData = bookings.map((b) => ({
    ...b,
    displayId: <span className="fw-bold text-primary">RIDE-{b.rideId || b.id}</span>,
    formattedDate: <span className="small text-muted">{formatDate(b.date || b.createdAt || b.bookingDate)}</span>,
    pickupLocation: (
      <div className="small fw-semibold text-dark">
        <i className="bi bi-geo-alt-fill text-primary me-1"></i>
        {b.source || b.pickup}
      </div>
    ),
    dropLocation: (
      <div className="small fw-semibold text-dark">
        <i className="bi bi-pin-map-fill text-danger me-1"></i>
        {b.destination}
      </div>
    ),
    fareDisplay: (
      <span className="fw-bold text-dark">
        {typeof b.fare === "number" ? `₹${b.fare}` : b.fare || "₹250"}
      </span>
    ),
    statusBadge: renderStatusBadge(b.status, b.rideId || b.id),
  }));

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor(255, 107, 0);
    doc.text("SmartRide — My Ride Booking History", 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Exported on: ${new Date().toLocaleString("en-IN")}`, 14, 26);

    const rows = bookings.map((b, idx) => [
      idx + 1,
      `RIDE-${b.rideId || b.id}`,
      formatDate(b.date || b.createdAt || b.bookingDate),
      b.source || b.pickup || "—",
      b.destination || "—",
      typeof b.fare === "number" ? `Rs.${b.fare}` : b.fare || "—",
      b.status === 1 ? "Completed" : b.status === 2 || b.status === 3 ? "In Progress" : b.status === 0 ? "Cancelled" : String(b.status),
    ]);

    autoTable(doc, {
      startY: 32,
      head: [["#", "Booking ID", "Date & Time", "Pickup", "Destination", "Fare", "Status"]],
      body: rows,
      headStyles: { fillColor: [255, 107, 0], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      styles: { fontSize: 9, cellPadding: 4 },
    });

    doc.save(`SmartRide_Bookings_${Date.now()}.pdf`);
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h5 className="fw-bold mb-0 text-dark">
          <i className="bi bi-ticket-perforated-fill me-2" style={{ color: "#FF6B00" }}></i>
          My Ride Bookings
        </h5>
        <button className="btn btn-outline-dark btn-sm rounded-pill px-3" onClick={handleExportPDF}>
          <i className="bi bi-download me-1"></i> Export PDF History
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Loading database bookings...</span>
          </div>
          <p className="text-muted mt-2">Loading ride history from database...</p>
        </div>
      ) : (
        <Table_Layout
          tableName="My Ride Booking History"
          columns={columns}
          data={tableData}
        />
      )}
    </div>
  );
}

