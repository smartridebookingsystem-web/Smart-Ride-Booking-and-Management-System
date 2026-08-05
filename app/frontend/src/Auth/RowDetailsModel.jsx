import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const formatFieldName = (key) => {
  if (!key) return "";

  const customNames = {
    paymentId: "PAYMENT ID",
    transactionId: "TRANSACTION ID",
    rideId: "RIDE ID",
    userId: "USER ID",
    driverId: "DRIVER ID",
    vehicleId: "VEHICLE ID",
    totalFare: "TOTAL FARE (₹)",
    discountAmount: "DISCOUNT AMOUNT (₹)",
    netAmount: "NET AMOUNT (₹)",
    paymentMode: "PAYMENT MODE",
    paymentStatus: "PAYMENT STATUS",
    gatewayRef: "GATEWAY REF",
    licenseNo: "LICENSE NUMBER",
    profileImage: "PROFILE IMAGE",
    createdAt: "CREATED AT",
    updatedAt: "UPDATED AT",
    txnRef: "TRANSACTION REF",
    riderName: "RIDER NAME",
    driverName: "DRIVER NAME",
    customerName: "CUSTOMER NAME",
    formattedFare: "TOTAL FARE (₹)",
    rideIdDisplay: "RIDE ID",
    licensePdfUrl: "LICENSE DOCUMENT",
    emergencyContact: "EMERGENCY CONTACT",
    vehicleNo: "VEHICLE NUMBER",
    vehicleType: "VEHICLE TYPE",
    insuranceExpiry: "INSURANCE EXPIRY",
    fitnessExpiry: "FITNESS EXPIRY"
  };

  if (customNames[key]) return customNames[key];

  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .toUpperCase();
};

const renderStatusBadge = (value, formData, activeTab) => {
  const s = String(value || "").toLowerCase();

  // 1. Ride Record
  if (activeTab === "rides" || formData.rideId || formData.source) {
    if (value === 1 || s === "completed") {
      return <span className="badge bg-success px-3 py-1.5 fs-6 fw-semibold">Completed 🟢</span>;
    }
    if (value === 2 || s === "in progress" || s === "in_progress" || s === "pending" || s === "requested") {
      return <span className="badge bg-warning text-dark px-3 py-1.5 fs-6 fw-semibold">In Progress 🟡</span>;
    }
    if (value === 0 || s === "cancelled" || s === "canceled") {
      return <span className="badge bg-danger px-3 py-1.5 fs-6 fw-semibold">Cancelled 🔴</span>;
    }
    return <span className="badge bg-info text-dark px-3 py-1.5 fs-6 fw-semibold">{value}</span>;
  }

  // 2. Complaint Record
  if (activeTab === "complaints" || formData.complaintId) {
    if (s === "resolved") return <span className="badge bg-success px-3 py-1.5 fs-6 fw-semibold">Resolved 🟢</span>;
    if (s === "in progress" || s === "in_progress") return <span className="badge bg-warning text-dark px-3 py-1.5 fs-6 fw-semibold">In Progress 🟡</span>;
    if (s === "open") return <span className="badge bg-danger px-3 py-1.5 fs-6 fw-semibold">Open 🔴</span>;
    return <span className="badge bg-secondary px-3 py-1.5 fs-6 fw-semibold">{value}</span>;
  }

  // 3. Payment Record
  if (activeTab === "payments" || formData.paymentId) {
    if (s === "paid" || s === "success" || s === "completed") {
      return <span className="badge bg-success px-3 py-1.5 fs-6 fw-semibold">Paid 🟢</span>;
    }
    return <span className="badge bg-warning text-dark px-3 py-1.5 fs-6 fw-semibold">Pending 🟡</span>;
  }

  // 4. User Account Record (strict)
  if (activeTab === "users" || (formData.username && !formData.licenseNo && !formData.rideId && !formData.paymentId && !formData.source)) {
    if (s === "active") {
      return <span className="badge bg-success px-3 py-1.5 fs-6 fw-semibold">Active 🟢</span>;
    }
    return <span className="badge bg-danger px-3 py-1.5 fs-6 fw-semibold">Inactive 🔴</span>;
  }

  // 5. Driver Verification Record
  if (s === "verified" || s === "active") {
    return <span className="badge bg-success px-3 py-1.5 fs-6 fw-semibold">Verified ✅</span>;
  }
  if (s === "rejected") {
    return <span className="badge bg-danger px-3 py-1.5 fs-6 fw-semibold">Rejected 🔴</span>;
  }
  return <span className="badge bg-warning text-dark px-3 py-1.5 fs-6 fw-semibold">Pending Verification 🟡</span>;
};

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
          k !== "rideIdDisplay" &&
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
        formatFieldName(key),
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
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(15,23,42,0.6)" }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content shadow-lg border-0 rounded-4 overflow-hidden">
          <div
            className="modal-header text-white"
            style={{
              background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
              borderBottom: "3px solid #FF6B00",
            }}
          >
            <h5 className="modal-title fw-bold">
              <i
                className={`bi ${mode === "edit" ? "bi-pencil-square" : "bi-eye-fill"} me-2`}
                style={{ color: "#FF6B00" }}
              ></i>
              {mode === "edit" ? `Edit Record — ${formData.name || formData.username || ""}` : title}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={handleClose}
            ></button>
          </div>
          <div className="modal-body p-4 bg-white" style={{ maxHeight: "70vh", overflowY: "auto" }}>
            {mode === "edit" ? (
              <div className="row g-3">
                {Object.entries(formData).map(([key, value]) => {
                  if (key === "id" || key === "userid" || key === "userId") {
                    return (
                      <div className="col-md-6" key={key}>
                        <label className="form-label mb-1" style={{ color: "#000000", fontWeight: "700" }}>{formatFieldName(key)}</label>
                        <input type="text" className="form-control bg-light text-dark fw-semibold" value={value || ""} disabled />
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
                          <label className="form-label mb-1" style={{ color: "#000000", fontWeight: "700" }}>COMPLAINT TICKET STATUS</label>
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
                          <label className="form-label mb-1" style={{ color: "#000000", fontWeight: "700" }}>USER ACCOUNT STATUS</label>
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
                          <label className="form-label mb-1" style={{ color: "#000000", fontWeight: "700" }}>RIDE STATUS</label>
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
                          <label className="form-label mb-1" style={{ color: "#000000", fontWeight: "700" }}>PAYMENT STATUS</label>
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
                        <label className="form-label mb-1" style={{ color: "#000000", fontWeight: "700" }}>VERIFICATION STATUS</label>
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
                      <label className="form-label mb-1" style={{ color: "#000000", fontWeight: "700" }}>{formatFieldName(key)}</label>
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
              <div className="table-responsive rounded-3 overflow-hidden border">
                <table className="table table-hover align-middle mb-0">
                  <thead style={{ backgroundColor: "#0F172A" }}>
                    <tr>
                      <th style={{ width: "35%", backgroundColor: "#0F172A", color: "#FFFFFF", padding: "12px 16px" }}>Field Name</th>
                      <th style={{ backgroundColor: "#0F172A", color: "#FFFFFF", padding: "12px 16px" }}>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(formData).map(([key, value]) => {
                      if (key === "licensePdfUrl" && value && String(value).length > 50) {
                        const isPdf = String(value).includes("application/pdf") || String(value).endsWith(".pdf");
                        return (
                          <tr key={key}>
                            <td style={{ backgroundColor: "#F8FAFC", width: "35%" }}>
                              <span className="modal-field-label" style={{ color: "#000000", fontWeight: "800" }}>Document Attachment</span>
                            </td>
                            <td>
                              <a
                                href={value}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-sm fw-bold text-white px-3"
                                style={{ background: "#FF6B00", borderColor: "#FF6B00" }}
                              >
                                <i className="bi bi-file-earmark-pdf-fill me-1"></i> Open Attached {isPdf ? "PDF" : "Photo"}
                              </a>
                            </td>
                          </tr>
                        );
                      }
                      return (
                        <tr key={key}>
                          <td style={{ backgroundColor: "#F8FAFC", width: "35%" }}>
                            <span className="modal-field-label" style={{ color: "#000000", fontWeight: "800" }}>
                              {formatFieldName(key)}
                            </span>
                          </td>
                          <td style={{ backgroundColor: "#FFFFFF" }}>
                            {key === "status" ? (
                              renderStatusBadge(value, formData, activeTab)
                            ) : (
                              <span className="modal-field-value" style={{ color: "#0F172A", fontWeight: "600" }}>
                                {String(value || "N/A")}
                              </span>
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
            <button className="btn btn-secondary px-4 fw-semibold rounded-3" onClick={handleClose}>
              Close
            </button>
            {mode === "edit" ? (
              <button className="btn text-white fw-bold px-4 rounded-3" style={{ background: "#22c55e", borderColor: "#22c55e" }} onClick={handleSave}>
                <i className="bi bi-check-circle-fill me-1"></i> Save Changes
              </button>
            ) : (
              <button className="btn text-white fw-bold px-4 rounded-3" style={{ background: "#FF6B00", borderColor: "#FF6B00" }} onClick={handlePrint}>
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
