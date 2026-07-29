import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const RowDetailsModal = ({
  row,
  mode = "view",
  title = "Record Details",
  activeTab = "",
  onSave,
  onClose,
}) => {
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (row) {
      const cleanData = {};
      Object.entries(row).forEach(([k, v]) => {
        if (
          k !== "docButton" &&
          k !== "statusDisplay" &&
          k !== "statusBadge" &&
          k !== "actionBtn" &&
          typeof v !== "function" &&
          (!v || typeof v !== "object" || !v.props)
        ) {
          cleanData[k] = v;
        }
      });
      setFormData(cleanData);
      setShow(true);
    }
  }, [row]);

  const handleClose = () => {
    setShow(false);
    if (onClose) onClose();
  };

  const handlePrint = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.text(title, 14, 15);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Exported on: ${new Date().toLocaleString()}`, 14, 22);

    const tableData = Object.entries(formData)
      .filter(([k, v]) => k !== "licensePdfUrl" || String(v).length < 100)
      .map(([key, value]) => [
        key.toUpperCase(),
        value !== null && value !== undefined ? String(value) : "N/A",
      ]);

    autoTable(doc, {
      head: [["Field", "Value"]],
      body: tableData,
      startY: 28,
      styles: { fontSize: 11, cellPadding: 4 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save(`${title.toLowerCase().replace(/[^a-z0-9]/g, "_")}.pdf`);
  };

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (onSave) onSave(formData);
    handleClose();
  };

  if (!row || !show) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content shadow-lg border-0">
          <div className={`modal-header ${mode === "edit" ? "bg-warning text-dark" : "bg-primary text-white"}`}>
            <h5 className="modal-title fw-bold">
              <i className={`bi ${mode === "edit" ? "bi-pencil-square" : "bi-eye-fill"} me-2`}></i>
              {mode === "edit" ? `Edit Record — ${formData.name || formData.username || ""}` : title}
            </h5>
            <button
              type="button"
              className={`btn-close ${mode === "edit" ? "" : "btn-close-white"}`}
              onClick={handleClose}
            ></button>
          </div>
          <div className="modal-body p-4" style={{ maxHeight: "70vh", overflowY: "auto" }}>
            {mode === "edit" ? (
              <div className="row g-3">
                {Object.entries(formData).map(([key, value]) => {
                  if (key === "id" || key === "userid" || key === "userId") {
                    return (
                      <div className="col-md-6" key={key}>
                        <label className="form-label fw-bold text-white">{key.toUpperCase()}</label>
                        <input type="text" className="form-control bg-light" value={value || ""} disabled />
                      </div>
                    );
                  }
                  if (key === "status") {
                    const isComplaint = activeTab === "complaints" || formData.complaintId;
                    const isUser = activeTab === "users" || (!formData.licenseNo && !formData.rideId && !formData.paymentId && (formData.userId || formData.username));
                    const isRide = activeTab === "rides" || formData.rideId;
                    const isPayment = activeTab === "payments" || formData.paymentId;

                    if (isComplaint) {
                      return (
                        <div className="col-md-6" key={key}>
                          <label className="form-label fw-bold text-dark">COMPLAINT TICKET STATUS</label>
                          <select
                            className="form-select border-primary"
                            value={value || "Open"}
                            onChange={(e) => handleChange(key, e.target.value)}
                          >
                            <option value="Open">Open 🔴 (New Ticket)</option>
                            <option value="In Progress">In Progress 🟡 (Under Investigation)</option>
                            <option value="Resolved">Resolved 🟢 (Issue Solved)</option>
                            <option value="Closed">Closed ⚪ (Archived)</option>
                          </select>
                        </div>
                      );
                    }

                    if (isUser) {
                      return (
                        <div className="col-md-6" key={key}>
                          <label className="form-label fw-bold text-dark">USER ACCOUNT STATUS</label>
                          <select
                            className="form-select border-primary"
                            value={String(value || "").toLowerCase() === "active" ? "Active" : "Inactive"}
                            onChange={(e) => handleChange(key, e.target.value)}
                          >
                            <option value="Active">Active 🟢 (Account Enabled)</option>
                            <option value="Inactive">Inactive 🔴 (Account Disabled)</option>
                          </select>
                        </div>
                      );
                    }

                    if (isRide) {
                      return (
                        <div className="col-md-6" key={key}>
                          <label className="form-label fw-bold text-dark">RIDE STATUS</label>
                          <select
                            className="form-select border-primary"
                            value={value || "In Progress"}
                            onChange={(e) => handleChange(key, e.target.value)}
                          >
                            <option value="In Progress">In Progress 🔵</option>
                            <option value="Completed">Completed 🟢</option>
                            <option value="Cancelled">Cancelled 🔴</option>
                          </select>
                        </div>
                      );
                    }

                    if (isPayment) {
                      return (
                        <div className="col-md-6" key={key}>
                          <label className="form-label fw-bold text-dark">PAYMENT STATUS</label>
                          <select
                            className="form-select border-primary"
                            value={value || "Paid"}
                            onChange={(e) => handleChange(key, e.target.value)}
                          >
                            <option value="Paid">Paid 🟢</option>
                            <option value="Pending">Pending 🟡</option>
                          </select>
                        </div>
                      );
                    }

                    return (
                      <div className="col-md-6" key={key}>
                        <label className="form-label fw-bold text-dark">VERIFICATION STATUS</label>
                        <select
                          className="form-select border-primary"
                          value={value || "Pending Verification"}
                          onChange={(e) => handleChange(key, e.target.value)}
                        >
                          <option value="Verified">Verified ✅ (Approved)</option>
                          <option value="Pending Verification">Pending Verification 🟡 (Under Review)</option>
                          <option value="Rejected">Rejected 🔴 (Invalid)</option>
                        </select>
                      </div>
                    );
                  }
                  return (
                    <div className="col-md-6" key={key}>
                      <label className="form-label fw-bold text-white">{key.toUpperCase()}</label>
                      <input
                        type="text"
                        className="form-control"
                        value={value || ""}
                        onChange={(e) => handleChange(key, e.target.value)}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle border">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "30%" }}>Field</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(formData).map(([key, value]) => {
                      if (key === "licensePdfUrl" && value && String(value).length > 50) {
                        const isPdf = String(value).includes("application/pdf") || String(value).endsWith(".pdf");
                        return (
                          <tr key={key}>
                            <td className="fw-bold text-secondary">Document Attachment</td>
                            <td>
                              <a
                                href={value}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-outline-primary btn-sm fw-bold"
                              >
                                <i className="bi bi-file-earmark-pdf-fill me-1"></i> Open Attached {isPdf ? "PDF" : "Photo"}
                              </a>
                            </td>
                          </tr>
                        );
                      }
                      return (
                        <tr key={key}>
                          <td className="fw-bold text-secondary">{key.toUpperCase()}</td>
                          <td>
                            {key === "status" ? (
                              <span
                                className={`badge ${
                                  String(value).toLowerCase() === "active" || String(value).toLowerCase() === "verified"
                                    ? "bg-success"
                                    : String(value).toLowerCase() === "rejected" || String(value).toLowerCase() === "inactive" || String(value).toLowerCase() === "deactive"
                                    ? "bg-danger"
                                    : "bg-warning text-dark"
                                } px-2 py-1 fs-6`}
                              >
                                {activeTab === "users" || (!formData.licenseNo && (formData.userId || formData.username))
                                  ? (String(value).toLowerCase() === "active" ? "Active" : "Inactive")
                                  : value}
                              </span>
                            ) : (
                              String(value || "N/A")
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="modal-footer bg-light">
            <button className="btn btn-secondary" onClick={handleClose}>
              Close
            </button>
            {mode === "edit" ? (
              <button className="btn btn-success fw-bold px-4" onClick={handleSave}>
                <i className="bi bi-check-circle-fill me-1"></i> Save Changes
              </button>
            ) : (
              <button className="btn btn-primary fw-bold" onClick={handlePrint}>
                <i className="bi bi-file-earmark-pdf-fill me-1"></i> Print / Save Row PDF
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RowDetailsModal;
