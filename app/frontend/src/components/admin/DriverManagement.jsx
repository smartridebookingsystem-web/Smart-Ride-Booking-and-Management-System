import React from "react";
import Table_Layout from "../../Auth/Table_Layout";
import { authApi } from "../services/api";

export default function DriverManagement({ drivers, setDrivers, setSelectedRow, setModalMode, setPreviewDoc }) {
  const columns = [
    { header: "Driver ID", field: "userid" },
    { header: "Name", field: "name" },
    { header: "Phone", field: "phone" },
    { header: "License No", field: "licenseNo" },
    { header: "Document", field: "docButton" },
    { header: "Verification Status", field: "statusDisplay" },
  ];

  const activeDrivers = drivers.filter((d) => String(d.status || "").toLowerCase() !== "deactivated");

  const tableData = activeDrivers.map((d) => ({
    ...d,
    docButton: d.licensePdfUrl ? (
      <button
        className="btn btn-sm px-3 fw-semibold text-white"
        style={{ background: "#FF6B00", borderColor: "#FF6B00" }}
        onClick={() => setPreviewDoc({ title: `${d.name}'s License Document`, url: d.licensePdfUrl, isPdf: d.licensePdfUrl.endsWith(".pdf") })}
      >
        <i className="bi bi-file-earmark-pdf-fill me-1"></i> View License
      </button>
    ) : (
      <span className="badge bg-secondary">No File Uploaded</span>
    ),
    statusDisplay: (
      <span className={`badge ${d.status === "Verified" || d.status === "active" ? "bg-success" : d.status === "Deactivated" || d.status === "Rejected" ? "bg-danger" : "bg-warning text-dark"} px-2 py-1`}>
        {d.status === "active" ? "Verified" : d.status}
      </span>
    ),
  }));

  const handleDelete = async (row) => {
    const dId = row.id || row.userId;
    if (window.confirm(`⚠️ Are you sure you want to DEACTIVATE driver account "${row.name}"?`)) {
      try {
        await authApi.updateUser(dId, { status: "Deactivated" });
        setDrivers((prev) => prev.map((d) => ((d.id || d.userId) === dId ? { ...d, status: "Deactivated" } : d)));
        alert(`🚫 Driver account "${row.name}" has been DEACTIVATED! It has been moved to Deactivated Accounts.`);
      } catch (err) {
        setDrivers((prev) => prev.map((d) => ((d.id || d.userId) === dId ? { ...d, status: "Deactivated" } : d)));
        alert(`🚫 Driver account "${row.name}" has been DEACTIVATED!`);
      }
    }
  };

  return (
    <div className="card shadow-sm border-0 rounded-4 p-4" style={{ backgroundColor: "#ffffff" }}>
      <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
        <div className="d-flex align-items-center gap-2">
          <div className="p-2 rounded-3" style={{ background: "rgba(255, 107, 0, 0.1)" }}>
            <i className="bi bi-person-check-fill fs-5" style={{ color: "#FF6B00" }}></i>
          </div>
          <h5 className="fw-bold mb-0" style={{ color: "#0F172A" }}>
            Driver License & Verification Records
          </h5>
        </div>
        <span
          className="badge rounded-pill px-3 py-2 fw-semibold"
          style={{ background: "rgba(255, 107, 0, 0.15)", color: "#FF6B00" }}
        >
          Total Drivers: {drivers.length}
        </span>
      </div>

      <Table_Layout
        tableName="Driver Verification Table"
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
