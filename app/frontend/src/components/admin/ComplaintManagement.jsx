import React from "react";
import Table_Layout from "../../Auth/Table_Layout";
import { complaintApi } from "../services/api";

export default function ComplaintManagement({
  complaints,
  setComplaints,
  openComplaintsCount,
  setSelectedRow,
  setModalMode,
  setSelectedComplaint,
  setResolutionStatus,
  setResolutionNotes,
}) {
  const columns = [
    { header: "Ticket ID", field: "complaintId" },
    { header: "Subject", field: "subject" },
    { header: "Category", field: "category" },
    { header: "Description", field: "description" },
    { header: "Current Status", field: "statusBadge" },
    { header: "Action", field: "actionBtn" },
  ];

  const tableData = complaints.map((c) => ({
    ...c,
    statusBadge: (
      <span className={`badge ${c.status === "Resolved" ? "bg-success" : c.status === "In Progress" ? "bg-warning text-dark" : "bg-danger"}`}>
        {c.status}
      </span>
    ),
    actionBtn: (
      <button
        className="btn btn-sm px-3 fw-semibold text-white"
        style={{ background: "#FF6B00", borderColor: "#FF6B00" }}
        onClick={() => {
          setSelectedComplaint(c);
          setResolutionStatus(c.status || "In Progress");
          setResolutionNotes(c.resolutionNotes || "");
        }}
      >
        <i className="bi bi-pencil-square me-1"></i> Resolve Ticket
      </button>
    ),
  }));

  const handleDelete = async (row) => {
    const cId = row.complaintId || row.id;
    if (window.confirm(`⚠️ Are you sure you want to delete Complaint Ticket #${cId}?`)) {
      try {
        await complaintApi.deleteComplaint(cId);
        setComplaints((prev) => prev.filter((c) => (c.complaintId || c.id) !== cId));
        alert(`🗑️ Complaint #${cId} deleted successfully!`);
      } catch (err) {
        setComplaints((prev) => prev.filter((c) => (c.complaintId || c.id) !== cId));
        alert(`🗑️ Complaint #${cId} removed from view!`);
      }
    }
  };

  return (
    <div className="card shadow-sm border-0 rounded-4 p-4" style={{ backgroundColor: "#ffffff" }}>
      <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
        <div className="d-flex align-items-center gap-2">
          <div className="p-2 rounded-3" style={{ background: "rgba(239, 68, 68, 0.1)" }}>
            <i className="bi bi-chat-square-quote-fill fs-5 text-danger"></i>
          </div>
          <h5 className="fw-bold mb-0" style={{ color: "#0F172A" }}>
            Complaint & Support Ticket Management
          </h5>
        </div>
        <span
          className="badge rounded-pill px-3 py-2 fw-semibold"
          style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }}
        >
          Open Issues: {openComplaintsCount}
        </span>
      </div>

      <Table_Layout
        tableName="Customer Complaints Log"
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
