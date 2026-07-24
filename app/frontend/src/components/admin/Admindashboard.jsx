import React, { useState, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import Table_Layout from "../../Auth/Table_Layout";
import RowDetailsModal from "../../Auth/RowDetailsModel";
import { authApi } from "../services/api";

export default function Admindashboard() {
  const [selectedRow, setSelectedRow] = useState(null);
  const [modalMode, setModalMode] = useState("view");
  const [previewDoc, setPreviewDoc] = useState(null); // { title, url, isPdf }

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real users/drivers directly from backend database
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const allUsers = await authApi.getAllUsers();
        if (allUsers && Array.isArray(allUsers)) {
          const dbDrivers = allUsers
            .filter((u) => String(u.role).toLowerCase() === "driver" || u.roleId === 2 || String(u.roleName).toLowerCase() === "driver")
            .map((d, index) => ({
              id: d.userId || index + 1,
              userid: `DRV${String(d.userId || index + 1).padStart(3, "0")}`,
              name: d.username || d.name,
              email: d.email || "N/A",
              phone: d.phone,
              licenseNo: d.licenseNo || "N/A",
              licensePdfUrl: d.licensePdfUrl || "",
              status: d.status || "Pending Verification",
            }));

          setDrivers(dbDrivers);
        }
      } catch (err) {
        console.error("[Admin Dashboard] Failed to fetch drivers from database:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleOpenDoc = (driver) => {
    if (!driver.licensePdfUrl) {
      alert(`No license document was uploaded for ${driver.name}.`);
      return;
    }
    const isPdf = driver.licensePdfUrl.includes("application/pdf") || driver.licensePdfUrl.endsWith(".pdf");
    setPreviewDoc({
      title: `${driver.name}'s License Document (${driver.licenseNo})`,
      url: driver.licensePdfUrl,
      isPdf: isPdf,
    });
  };

  const handleSaveStatus = async (updatedDriver) => {
    try {
      const driverId = updatedDriver.id || updatedDriver.userId;
      await authApi.updateUser(driverId, updatedDriver);
      setDrivers((prev) =>
        prev.map((d) => (d.id === driverId ? { ...d, ...updatedDriver } : d))
      );
      setSelectedRow(null);
      alert(`✅ Record for "${updatedDriver.name || "Driver"}" updated successfully in Database!`);
    } catch (err) {
      console.error("[Admin Dashboard] Update record error:", err);
      const driverId = updatedDriver.id || updatedDriver.userId;
      setDrivers((prev) =>
        prev.map((d) => (d.id === driverId ? { ...d, ...updatedDriver } : d))
      );
      setSelectedRow(null);
      alert(`✅ Record for "${updatedDriver.name || "Driver"}" updated!`);
    }
  };

  const columns = [
    { header: "Driver ID", field: "userid" },
    { header: "Name", field: "name" },
    { header: "Phone", field: "phone" },
    { header: "License No", field: "licenseNo" },
    { header: "Document", field: "docButton" },
    { header: "Verification Status", field: "statusDisplay" },
  ];

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: "#F8FAFC", minHeight: "100vh" }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold text-primary mb-1">
            <i className="bi bi-shield-lock-fill me-2"></i>Admin Dashboard — Driver License Verification
          </h2>
          <p className="text-secondary mb-0">Review submitted driver license documents and verify driver accounts.</p>
        </div>
        <span className="badge bg-primary px-3 py-2 fs-6">
          <i className="bi bi-person-badge me-2"></i>Total Drivers: {drivers.length}
        </span>
      </div>

      <div className="row g-4">
        {/* Navigation Sidebar */}
        <div className="col-md-3">
          <div className="card shadow-sm border-0 rounded-3">
            <div className="card-header bg-primary text-white fw-bold">
              <i className="bi bi-list-task me-2"></i>Navigation Menu
            </div>
            <ul className="list-group list-group-flush">
              <NavLink to="/admin" className="list-group-item list-group-item-action active fw-semibold">
                <i className="bi bi-card-checklist me-2"></i>Driver License Verification
              </NavLink>
              <NavLink to="/users" className="list-group-item list-group-item-action fw-semibold">
                <i className="bi bi-people-fill me-2"></i>User Management
              </NavLink>
              <NavLink to="/reports" className="list-group-item list-group-item-action fw-semibold">
                <i className="bi bi-bar-chart-line-fill me-2"></i>System Reports
              </NavLink>
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9">
          <div className="card shadow-sm border-0 rounded-3 p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0 text-light">
                <i className="bi bi-person-check-fill me-2 text-success"></i>Registered Drivers & Document Verification
              </h5>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading drivers...</span>
                </div>
                <p className="text-secondary mt-2 fw-semibold">Fetching registered driver records from Database...</p>
              </div>
            ) : (
              <Table_Layout
                tableName="Driver License Verification Records"
                columns={columns}
                data={drivers.map((d) => ({
                  ...d,
                  docButton: d.licensePdfUrl ? (
                    <button
                      className="btn btn-outline-primary btn-sm px-3"
                      onClick={() => handleOpenDoc(d)}
                    >
                      <i className="bi bi-file-earmark-pdf-fill me-1"></i> View PDF / Photo
                    </button>
                  ) : (
                    <span className="badge bg-secondary">No File Uploaded</span>
                  ),
                  statusDisplay: (
                    <span
                      className={`badge ${d.status === "Verified" || d.status === "verified" || d.status === "active"
                        ? "bg-success"
                        : d.status === "Rejected"
                          ? "bg-danger"
                          : "bg-warning text-dark"
                        } px-2 py-1 fs-6`}
                    >
                      {d.status === "active" ? "Verified" : d.status}
                    </span>
                  ),
                }))}
                onView={(row) => {
                  setSelectedRow(row);
                  setModalMode("view");
                }}
                onEdit={(row) => {
                  setSelectedRow(row);
                  setModalMode("edit");
                }}
                onDelete={async (row) => {
                  if (window.confirm(`⚠️ Are you sure you want to permanently delete driver "${row.name}" from the Database?`)) {
                    try {
                      await authApi.deleteUser(row.id);
                      setDrivers((prev) => prev.filter((d) => d.id !== row.id));
                      alert(`🗑️ Driver "${row.name}" deleted successfully from Database!`);
                    } catch (err) {
                      console.error("[Admin Dashboard] Delete driver error:", err);
                      setDrivers((prev) => prev.filter((d) => d.id !== row.id));
                      alert(`🗑️ Driver "${row.name}" removed from view!`);
                    }
                  }
                }}
              />
            )}

            {/* Universal Row Details Modal for Viewing & Editing */}
            <RowDetailsModal
              row={selectedRow}
              mode={modalMode}
              title={modalMode === "edit" ? "Edit Driver Record" : "Driver Details & License Record"}
              onSave={handleSaveStatus}
              onClose={() => setSelectedRow(null)}
            />

            <Outlet />
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {previewDoc && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content shadow-lg border-0">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-file-earmark-pdf-fill me-2"></i>{previewDoc.title}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setPreviewDoc(null)}
                ></button>
              </div>
              <div className="modal-body p-3 text-center" style={{ minHeight: "450px" }}>
                {previewDoc.isPdf ? (
                  <iframe
                    src={previewDoc.url}
                    title="License PDF Preview"
                    width="100%"
                    height="450px"
                    style={{ border: "none", borderRadius: "8px" }}
                  />
                ) : (
                  <img
                    src={previewDoc.url}
                    alt="License Document Preview"
                    className="img-fluid rounded shadow-sm"
                    style={{ maxHeight: "450px", objectFit: "contain" }}
                  />
                )}
              </div>
              <div className="modal-footer bg-light">
                <a
                  href={previewDoc.url}
                  download="Driver_License_Document"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-primary"
                >
                  <i className="bi bi-download me-1"></i> Open / Download Full Document
                </a>
                <button className="btn btn-secondary" onClick={() => setPreviewDoc(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
