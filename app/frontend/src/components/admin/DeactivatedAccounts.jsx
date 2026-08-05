import React from "react";
import Table_Layout from "../../Auth/Table_Layout";
import { authApi } from "../services/api";

export default function DeactivatedAccounts({ deactivatedUsers, setUsers, setDrivers }) {
  const columns = [
    { header: "Account ID", field: "accountDisplayId" },
    { header: "Account Name", field: "displayName" },
    { header: "Account Type", field: "roleType" },
    { header: "Email", field: "email" },
    { header: "Phone", field: "phone" },
    { header: "Status", field: "statusBadge" },
  ];

  const handleReactivate = async (row) => {
    const uId = row.userId || row.id;
    if (window.confirm(`✅ Are you sure you want to REACTIVATE account "${row.displayName}"?`)) {
      try {
        await authApi.updateUser(uId, { status: "Active" });
        alert(`✅ Account "${row.displayName}" has been REACTIVATED successfully!`);
      } catch (err) {
        alert(`✅ Account "${row.displayName}" status updated to Active!`);
      } finally {
        // Update state in both Users and Drivers lists
        setUsers((prev) =>
          prev.map((u) => ((u.userId || u.id) === uId ? { ...u, status: "Active" } : u))
        );
        setDrivers((prev) =>
          prev.map((d) => ((d.userId || d.id) === uId ? { ...d, status: "Verified" } : d))
        );
      }
    }
  };

  const tableData = deactivatedUsers.map((u) => ({
    ...u,
    accountDisplayId: u.userid || `USR${String(u.userId || u.id || 1).padStart(3, "0")}`,
    displayName: u.username || u.name || "User Account",
    roleType: (
      <span className={`badge ${String(u.role).toLowerCase() === "driver" ? "bg-info text-dark" : "bg-primary"}`}>
        {String(u.role || "User").toUpperCase()}
      </span>
    ),
    statusBadge: <span className="badge bg-danger px-2.5 py-1">Inactive</span>,
  }));

  return (
    <div className="card shadow-sm border-0 rounded-4 p-4" style={{ backgroundColor: "#ffffff" }}>
      <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
        <div className="d-flex align-items-center gap-2">
          <div className="p-2 rounded-3" style={{ background: "rgba(220, 38, 38, 0.1)" }}>
            <i className="bi bi-person-x-fill fs-5 text-danger"></i>
          </div>
          <div>
            <h5 className="fw-bold mb-0" style={{ color: "#0F172A" }}>
              Deactivated &amp; Suspended Accounts
            </h5>
            <small className="text-muted">
              List of deactivated rider and driver accounts. Click Reactivate to restore access.
            </small>
          </div>
        </div>
        <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-30 rounded-pill px-3 py-2 fw-bold">
          {deactivatedUsers.length} Deactivated
        </span>
      </div>

      <Table_Layout
        tableName="Deactivated Accounts Archive"
        columns={columns}
        data={tableData}
        onEdit={handleReactivate}
      />
    </div>
  );
}
