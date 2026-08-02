import React from "react";
import Table_Layout from "../../Auth/Table_Layout";

export default function RideManagement({ rides, setRides, setSelectedRow, setModalMode }) {
  const columns = [
    { header: "Ride ID", field: "rideId" },
    { header: "Rider", field: "riderName" },
    { header: "Driver", field: "driverName" },
    { header: "Pickup Source", field: "source" },
    { header: "Destination", field: "destination" },
    { header: "Fare (₹)", field: "fare" },
    { header: "Status", field: "statusBadge" },
  ];

  const tableData = rides.map((r) => ({
    ...r,
    statusBadge: (
      <span className={`badge ${r.status === 1 || r.status === "Completed" ? "bg-success" : r.status === 2 || r.status === "In Progress" ? "bg-warning text-dark" : "bg-danger"}`}>
        {r.status === 1 ? "Completed" : r.status === 2 ? "Pending" : String(r.status || "Completed")}
      </span>
    ),
  }));

  const handleDelete = (row) => {
    const rId = row.rideId || row.id;
    if (window.confirm(`⚠️ Are you sure you want to delete Ride #${rId}?`)) {
      setRides((prev) => prev.filter((r) => (r.rideId || r.id) !== rId));
      alert(`🗑️ Ride #${rId} deleted!`);
    }
  };

  return (
    <div className="card shadow-sm border-0 rounded-4 p-4" style={{ backgroundColor: "#ffffff" }}>
      <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
        <div className="p-2 rounded-3" style={{ background: "rgba(255, 107, 0, 0.1)" }}>
          <i className="bi bi-signpost-split-fill fs-5" style={{ color: "#FF6B00" }}></i>
        </div>
        <h5 className="fw-bold mb-0" style={{ color: "#0F172A" }}>
          Ride Booking & Monitoring Management
        </h5>
      </div>
      <Table_Layout
        tableName="Rides Log"
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
