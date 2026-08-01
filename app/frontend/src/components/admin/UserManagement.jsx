import React from "react";
import Table_Layout from "../../Auth/Table_Layout";
import { authApi } from "../services/api";

export default function UserManagement({ users, setUsers, setSelectedRow, setModalMode }) {
  const columns = [
    { header: "User ID", field: "userId" },
    { header: "Username", field: "username" },
    { header: "Email", field: "email" },
    { header: "Phone", field: "phone" },
    { header: "Gender", field: "gender" },
    { header: "Status", field: "statusBadge" },
  ];

  const tableData = users.map((u) => ({
    ...u,
    statusBadge: (
      <span className={`badge ${String(u.status || "").toLowerCase() === "active" ? "bg-success" : "bg-danger"} px-2 py-1`}>
        {String(u.status || "").toLowerCase() === "active" ? "Active" : "Inactive"}
      </span>
    ),
  }));

  const handleDelete = async (row) => {
    const uId = row.userId || row.id;
    if (window.confirm(`⚠️ Are you sure you want to delete user "${row.username || row.name}" from Database?`)) {
      try {
        await authApi.deleteUser(uId);
        setUsers((prev) => prev.filter((u) => (u.userId || u.id) !== uId));
        alert(`🗑️ User "${row.username || row.name}" deleted successfully!`);
      } catch (err) {
        setUsers((prev) => prev.filter((u) => (u.userId || u.id) !== uId));
        alert(`🗑️ User record removed from view!`);
      }
    }
  };

  return (
    <div className="card shadow-sm border-0 rounded-4 p-4" style={{ backgroundColor: "#ffffff" }}>
      <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
        <div className="p-2 rounded-3" style={{ background: "rgba(255, 107, 0, 0.1)" }}>
          <i className="bi bi-people-fill fs-5" style={{ color: "#FF6B00" }}></i>
        </div>
        <h5 className="fw-bold mb-0" style={{ color: "#0F172A" }}>
          System User Management
        </h5>
      </div>
      <Table_Layout
        tableName="Registered System Users"
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
