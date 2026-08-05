import React from "react";
import Table_Layout from "../../Auth/Table_Layout";

export default function RideManagement({ rides, users = [], drivers = [], payments = [], setRides, setSelectedRow, setModalMode }) {
  const columns = [
    { header: "Ride ID", field: "rideIdDisplay" },
    { header: "Rider Name", field: "riderName" },
    { header: "Driver Name", field: "driverName" },
    { header: "Pickup Source", field: "source" },
    { header: "Destination", field: "destination" },
    { header: "Fare (₹)", field: "formattedFare" },
    { header: "Status", field: "statusBadge" },
  ];

  const tableData = rides.map((r) => {
    // Rider Name lookup strictly by Rider User ID
    const targetRiderUserId = String(r.userId || r.user_id || "");
    const matchedRider = users.find(
      (u) => String(u.userId || u.id) === targetRiderUserId
    );
    const riderName = matchedRider
      ? matchedRider.username || matchedRider.name
      : r.riderName || (targetRiderUserId ? `Rider #${targetRiderUserId}` : "N/A");

    // Driver Name lookup strictly by Driver ID
    const targetDriverId = String(r.driverId || r.driver_id || "");
    const matchedDriver = targetDriverId && targetDriverId !== "null"
      ? drivers.find((d) => String(d.driverId) === targetDriverId)
      : null;

    const driverName = matchedDriver
      ? matchedDriver.name || matchedDriver.username
      : targetDriverId && targetDriverId !== "null"
      ? `Driver #${targetDriverId}`
      : "Unassigned ⏳";

    const rawStatus = Number(r.status ?? 0);
    const rawStatusStr = String(r.status || "").toLowerCase();

    let statusText = "Requested 🔴";
    let badgeClass = "bg-warning text-dark";

    if (rawStatus === 1 || rawStatusStr === "completed") {
      statusText = "Completed 🟢";
      badgeClass = "bg-success";
    } else if (rawStatus === 2 || rawStatusStr === "in progress" || rawStatusStr === "in_progress") {
      statusText = "In Progress 🔵";
      badgeClass = "bg-primary";
    } else if (rawStatus === 3 || rawStatusStr === "accepted") {
      statusText = "Accepted 🟡";
      badgeClass = "bg-info text-dark";
    } else if (rawStatus === 4 || rawStatusStr === "cancelled") {
      statusText = "Cancelled 🔴";
      badgeClass = "bg-danger";
    }

    const matchedPayment = payments.find(
      (p) => String(p.rideId || p.ride_id) === String(r.rideId || r.id)
    );

    const calculatedFare = matchedPayment
      ? Number(matchedPayment.totalFare || matchedPayment.netAmount || 0)
      : r.fare || r.totalFare || (120 + ((r.rideId || r.id || 1) * 35));

    return {
      ...r,
      rideIdDisplay: `#${r.rideId || r.id || "N/A"}`,
      riderName,
      driverName,
      source: r.source || "N/A",
      destination: r.destination || "N/A",
      formattedFare: `₹${calculatedFare.toFixed(2)}`,
      statusBadge: (
        <span className={`badge ${badgeClass} px-2.5 py-1.5 fw-semibold`}>
          {statusText}
        </span>
      ),
    };
  });

  const handleDelete = (row) => {
    const rId = row.rideId || row.id;
    if (window.confirm(`⚠️ Are you sure you want to delete Ride #${rId}?`)) {
      setRides((prev) => prev.filter((r) => (r.rideId || r.id) !== rId));
      alert(`🗑️ Ride #${rId} deleted!`);
    }
  };

  return (
    <div className="card shadow-sm border-0 rounded-4 p-4" style={{ backgroundColor: "#ffffff" }}>
      <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
        <div className="d-flex align-items-center gap-2">
          <div className="p-2 rounded-3" style={{ background: "rgba(255, 107, 0, 0.1)" }}>
            <i className="bi bi-signpost-split-fill fs-5" style={{ color: "#FF6B00" }}></i>
          </div>
          <div>
            <h5 className="fw-bold mb-0" style={{ color: "#0F172A" }}>
              Ride Booking &amp; Monitoring Management
            </h5>
            <small className="text-muted">Live ride requests, active trips, and completed journeys processed via Ride microservice</small>
          </div>
        </div>
        <span className="badge rounded-pill px-3 py-2 fw-semibold" style={{ background: "rgba(255, 107, 0, 0.15)", color: "#FF6B00" }}>
          Total Rides: {rides.length}
        </span>
      </div>
      <Table_Layout
        tableName="Live Ride Booking Logs"
        columns={columns}
        data={tableData}
        onView={(row) => {
          setSelectedRow(row);
          setModalMode("view");
        }}
        onEdit={(row) => {
          setSelectedRow(row);
          setModalMode("edit");
        }}
        onDelete={handleDelete}
      />
    </div>
  );
}
