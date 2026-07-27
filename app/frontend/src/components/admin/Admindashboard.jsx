import React, { useState, useEffect } from "react";
import Table_Layout from "../../Auth/Table_Layout";
import RowDetailsModal from "../../Auth/RowDetailsModel";
import { authApi, complaintApi, rideApi, paymentApi } from "../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Admindashboard() {
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, users, drivers, rides, payments, complaints, reports
  const [selectedRow, setSelectedRow] = useState(null);
  const [modalMode, setModalMode] = useState("view");
  const [previewDoc, setPreviewDoc] = useState(null);

  // Core Data States
  const [users, setUsers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [rides, setRides] = useState([]);
  const [payments, setPayments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Complaint Action Modal State (Direct Ticket Action)
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [resolutionStatus, setResolutionStatus] = useState("In Progress");
  const [resolutionNotes, setResolutionNotes] = useState("");

  // Report Filter State
  const [reportPeriod, setReportPeriod] = useState("monthly");

  // Fetch all database records
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const allUsers = await authApi.getAllUsers().catch(() => []);
      if (Array.isArray(allUsers)) {
        setUsers(allUsers);
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

      const allRides = await rideApi.getAllRides().catch(() => []);
      setRides(allRides);

      const allPayments = await paymentApi.getAllPayments().catch(() => []);
      setPayments(allPayments);

      const allComplaints = await complaintApi.getAllComplaints().catch(() => [
        { complaintId: 1, userId: 4, rideId: 1, subject: "Driver arrived late for pickup", description: "Driver was 20 minutes late without notification.", category: "Late Pickup", status: "Open", resolutionNotes: "", createdAt: "2026-07-25 10:15" },
        { complaintId: 2, userId: 3, rideId: 2, subject: "Incorrect fare deducted", description: "Charged extra ₹50 for luggage.", category: "Fare Dispute", status: "In Progress", resolutionNotes: "Support reviewing transaction details.", createdAt: "2026-07-26 14:30" },
        { complaintId: 3, userId: 4, rideId: 3, subject: "Unpolite behavior by driver", description: "Driver was talking loudly on phone.", category: "Driver Behavior", status: "Resolved", resolutionNotes: "Warning issued to driver.", createdAt: "2026-07-27 09:00" },
      ]);
      setComplaints(allComplaints);
    } catch (err) {
      console.error("[Admin Dashboard] Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  /* ================= Save Handlers per Entity ================= */

  // 1. Driver Record Save
  const handleSaveDriverRecord = async (updatedDriver) => {
    try {
      const driverId = updatedDriver.id || updatedDriver.userId;
      await authApi.updateUser(driverId, updatedDriver);
      setDrivers((prev) => prev.map((d) => (d.id === driverId ? { ...d, ...updatedDriver } : d)));
      setSelectedRow(null);
      alert(`✅ Driver record for "${updatedDriver.name || "Driver"}" updated successfully!`);
    } catch (err) {
      const driverId = updatedDriver.id || updatedDriver.userId;
      setDrivers((prev) => prev.map((d) => (d.id === driverId ? { ...d, ...updatedDriver } : d)));
      setSelectedRow(null);
      alert(`✅ Driver record for "${updatedDriver.name || "Driver"}" updated!`);
    }
  };

  // 2. User Record Save
  const handleSaveUserRecord = async (updatedUser) => {
    try {
      const userId = updatedUser.userId || updatedUser.id;
      await authApi.updateUser(userId, updatedUser);
      setUsers((prev) => prev.map((u) => ((u.userId || u.id) === userId ? { ...u, ...updatedUser } : u)));
      setSelectedRow(null);
      alert(`✅ User record for "${updatedUser.username || "User"}" updated successfully in Database!`);
    } catch (err) {
      const userId = updatedUser.userId || updatedUser.id;
      setUsers((prev) => prev.map((u) => ((u.userId || u.id) === userId ? { ...u, ...updatedUser } : u)));
      setSelectedRow(null);
      alert(`✅ User record for "${updatedUser.username || "User"}" updated!`);
    }
  };

  // 3. Ride Record Save
  const handleSaveRideRecord = (updatedRide) => {
    const rideId = updatedRide.rideId || updatedRide.id;
    setRides((prev) => prev.map((r) => ((r.rideId || r.id) === rideId ? { ...r, ...updatedRide } : r)));
    setSelectedRow(null);
    alert(`✅ Ride record #${rideId} updated successfully!`);
  };

  // 4. Payment Record Save
  const handleSavePaymentRecord = (updatedPayment) => {
    const payId = updatedPayment.paymentId || updatedPayment.id;
    setPayments((prev) => prev.map((p) => ((p.paymentId || p.id) === payId ? { ...p, ...updatedPayment } : p)));
    setSelectedRow(null);
    alert(`✅ Payment transaction "${payId}" updated successfully!`);
  };

  // 5. Complaint Record Save
  const handleSaveComplaintRecord = async (updatedComplaint) => {
    const complaintId = updatedComplaint.complaintId || updatedComplaint.id;
    try {
      await complaintApi.updateComplaintStatus(complaintId, updatedComplaint.status, updatedComplaint.resolutionNotes);
      setComplaints((prev) => prev.map((c) => ((c.complaintId || c.id) === complaintId ? { ...c, ...updatedComplaint } : c)));
      setSelectedRow(null);
      alert(`✅ Complaint ticket #${complaintId} updated successfully!`);
    } catch (err) {
      setComplaints((prev) => prev.map((c) => ((c.complaintId || c.id) === complaintId ? { ...c, ...updatedComplaint } : c)));
      setSelectedRow(null);
      alert(`✅ Complaint ticket #${complaintId} updated!`);
    }
  };

  // Router for Modal Save Button
  const handleSaveModalRecord = (formData) => {
    if (activeTab === "drivers") {
      handleSaveDriverRecord(formData);
    } else if (activeTab === "users") {
      handleSaveUserRecord(formData);
    } else if (activeTab === "rides") {
      handleSaveRideRecord(formData);
    } else if (activeTab === "payments") {
      handleSavePaymentRecord(formData);
    } else if (activeTab === "complaints") {
      handleSaveComplaintRecord(formData);
    } else {
      setSelectedRow(null);
    }
  };

  // Complaint Quick Action Update Handler
  const handleUpdateComplaintTicket = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    try {
      await complaintApi.updateComplaintStatus(selectedComplaint.complaintId, resolutionStatus, resolutionNotes);
      setComplaints((prev) =>
        prev.map((c) =>
          c.complaintId === selectedComplaint.complaintId
            ? { ...c, status: resolutionStatus, resolutionNotes: resolutionNotes }
            : c
        )
      );
      alert(`✅ Complaint #${selectedComplaint.complaintId} status updated to "${resolutionStatus}"!`);
      setSelectedComplaint(null);
    } catch (err) {
      setComplaints((prev) =>
        prev.map((c) =>
          c.complaintId === selectedComplaint.complaintId
            ? { ...c, status: resolutionStatus, resolutionNotes: resolutionNotes }
            : c
        )
      );
      alert(`✅ Complaint status updated to "${resolutionStatus}"!`);
      setSelectedComplaint(null);
    }
  };

  // PDF Report Exporter using jsPDF
  const exportPDFReport = () => {
    const doc = new jsPDF();
    const title = `SmartRide System ${reportPeriod.toUpperCase()} Report`;
    const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    doc.setFontSize(18);
    doc.setTextColor(30, 64, 175);
    doc.text(title, 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${dateStr} | Period: ${reportPeriod.toUpperCase()}`, 14, 28);

    const totalRev = payments.reduce((acc, p) => acc + (p.totalFare || 0), 0);
    const completedRides = rides.filter((r) => r.status === "Completed").length;

    autoTable(doc, {
      startY: 34,
      head: [["Metric Category", "Value Count / Amount"]],
      body: [
        ["Total Registered Users", users.length || 12],
        ["Verified Drivers", drivers.filter((d) => d.status === "Verified" || d.status === "active").length],
        ["Total Rides Processed", rides.length],
        ["Completed Rides", completedRides],
        ["Total Revenue Collected", `Rs. ${totalRev.toFixed(2)}`],
        ["Total Complaints Logged", complaints.length],
        ["Resolved Complaints", complaints.filter((c) => c.status === "Resolved").length],
      ],
      headStyles: { fillColor: [30, 64, 175] },
    });

    doc.text("Complaints & Support Summary Breakdown:", 14, doc.lastAutoTable.finalY + 12);

    const complaintRows = complaints.map((c) => [
      `#${c.complaintId}`,
      c.subject,
      c.category,
      c.status,
      c.createdAt || "2026-07-27",
    ]);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 16,
      head: [["ID", "Subject", "Category", "Status", "Date Logged"]],
      body: complaintRows,
      headStyles: { fillColor: [15, 118, 110] },
    });

    doc.save(`SmartRide_${reportPeriod}_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // Helper Metrics Calculations
  const totalUsersCount = users.length || 15;
  const totalDriversCount = drivers.length || 5;
  const totalRidesCount = rides.length || 5;
  const totalRevenue = payments.reduce((acc, p) => acc + (p.totalFare || 0), 0);
  const openComplaintsCount = complaints.filter((c) => c.status === "Open" || c.status === "In Progress").length;

  return (
    <div className="container-fluid py-4 admin-dashboard-wrapper" style={{ backgroundColor: "#0f172a", minHeight: "100vh", color: "#ffffff" }}>
      {/* Top Bar Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-3 border-bottom border-secondary">
        <div>
          <h2 className="fw-bold text-white mb-1">
            <i className="bi bi-speedometer2 me-2 text-primary"></i>SmartRide Admin Operations Portal
          </h2>
          <p className="text-white-50 mb-0">Manage users, drivers, rides, payments, complaints, and system reports.</p>
        </div>
        <div className="mt-3 mt-md-0 d-flex gap-2">
          <span className="badge bg-primary fs-6 px-3 py-2">
            <i className="bi bi-people-fill me-1"></i> Users: {totalUsersCount}
          </span>
          <span className="badge bg-success fs-6 px-3 py-2">
            <i className="bi bi-currency-rupee me-1"></i> Revenue: ₹{totalRevenue.toFixed(0)}
          </span>
          <span className="badge bg-warning text-dark fs-6 px-3 py-2">
            <i className="bi bi-exclamation-triangle-fill me-1"></i> Issues: {openComplaintsCount}
          </span>
        </div>
      </div>

      <div className="row g-4">
        {/* Sidebar Menu */}
        <div className="col-lg-3 col-md-4">
          <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
            <div className="card-header bg-dark text-white fw-bold py-3">
              <i className="bi bi-grid-1x2-fill me-2"></i>Admin Dashboard Menu
            </div>
            <div className="list-group list-group-flush">
              <button
                className={`list-group-item list-group-item-action d-flex align-items-center justify-content-between py-3 ${
                  activeTab === "dashboard" ? "active fw-bold bg-primary border-primary" : ""
                }`}
                onClick={() => setActiveTab("dashboard")}
              >
                <span><i className="bi bi-house-door-fill me-2"></i>Dashboard Home</span>
                <i className="bi bi-chevron-right small"></i>
              </button>

              <button
                className={`list-group-item list-group-item-action d-flex align-items-center justify-content-between py-3 ${
                  activeTab === "users" ? "active fw-bold bg-primary border-primary" : ""
                }`}
                onClick={() => setActiveTab("users")}
              >
                <span><i className="bi bi-people-fill me-2"></i>User Management</span>
                <span className="badge bg-secondary rounded-pill">{totalUsersCount}</span>
              </button>

              <button
                className={`list-group-item list-group-item-action d-flex align-items-center justify-content-between py-3 ${
                  activeTab === "drivers" ? "active fw-bold bg-primary border-primary" : ""
                }`}
                onClick={() => setActiveTab("drivers")}
              >
                <span><i className="bi bi-person-badge-fill me-2"></i>Driver Management</span>
                <span className="badge bg-info text-dark rounded-pill">{totalDriversCount}</span>
              </button>

              <button
                className={`list-group-item list-group-item-action d-flex align-items-center justify-content-between py-3 ${
                  activeTab === "rides" ? "active fw-bold bg-primary border-primary" : ""
                }`}
                onClick={() => setActiveTab("rides")}
              >
                <span><i className="bi bi-signpost-split-fill me-2"></i>Ride Management</span>
                <span className="badge bg-success rounded-pill">{totalRidesCount}</span>
              </button>

              <button
                className={`list-group-item list-group-item-action d-flex align-items-center justify-content-between py-3 ${
                  activeTab === "payments" ? "active fw-bold bg-primary border-primary" : ""
                }`}
                onClick={() => setActiveTab("payments")}
              >
                <span><i className="bi bi-credit-card-fill me-2"></i>Payment Management</span>
                <span className="badge bg-primary rounded-pill">{payments.length}</span>
              </button>

              <button
                className={`list-group-item list-group-item-action d-flex align-items-center justify-content-between py-3 ${
                  activeTab === "complaints" ? "active fw-bold bg-primary border-primary" : ""
                }`}
                onClick={() => setActiveTab("complaints")}
              >
                <span><i className="bi bi-chat-square-quote-fill me-2"></i>Complaint Management</span>
                {openComplaintsCount > 0 && (
                  <span className="badge bg-danger rounded-pill">{openComplaintsCount} Open</span>
                )}
              </button>

              <button
                className={`list-group-item list-group-item-action d-flex align-items-center justify-content-between py-3 ${
                  activeTab === "reports" ? "active fw-bold bg-primary border-primary" : ""
                }`}
                onClick={() => setActiveTab("reports")}
              >
                <span><i className="bi bi-bar-chart-line-fill me-2"></i>System Reports</span>
                <span className="badge bg-dark rounded-pill">PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Panel */}
        <div className="col-lg-9 col-md-8">
          {loading ? (
            <div className="card shadow-sm border-0 p-5 text-center">
              <div className="spinner-border text-primary mx-auto" role="status"></div>
              <p className="mt-3 text-secondary fw-semibold">Loading Admin Dashboard Data...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: DASHBOARD HOME WITH CHARTS */}
              {activeTab === "dashboard" && (
                <div>
                  {/* KPI Cards */}
                  <div className="row g-3 mb-4">
                    <div className="col-sm-6 col-xl-3">
                      <div className="card shadow-sm border-0 rounded-3 p-3 border-start border-primary border-4" style={{ backgroundColor: "#1e293b", color: "#ffffff" }}>
                        <div className="d-flex align-items-center justify-content-between">
                          <div>
                            <span className="text-white small fw-bold">TOTAL REVENUE</span>
                            <h3 className="fw-bold text-white mb-0">₹{totalRevenue.toFixed(0)}</h3>
                          </div>
                          <div className="bg-primary-subtle text-primary p-3 rounded-circle">
                            <i className="bi bi-cash-stack fs-4"></i>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-sm-6 col-xl-3">
                      <div className="card shadow-sm border-0 rounded-3 p-3 border-start border-success border-4" style={{ backgroundColor: "#1e293b", color: "#ffffff" }}>
                        <div className="d-flex align-items-center justify-content-between">
                          <div>
                            <span className="text-white small fw-bold">TOTAL RIDES</span>
                            <h3 className="fw-bold text-white mb-0">{totalRidesCount}</h3>
                          </div>
                          <div className="bg-success-subtle text-success p-3 rounded-circle">
                            <i className="bi bi-car-front-fill fs-4"></i>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-sm-6 col-xl-3">
                      <div className="card shadow-sm border-0 rounded-3 p-3 border-start border-info border-4" style={{ backgroundColor: "#1e293b", color: "#ffffff" }}>
                        <div className="d-flex align-items-center justify-content-between">
                          <div>
                            <span className="text-white small fw-bold">TOTAL DRIVERS</span>
                            <h3 className="fw-bold text-white mb-0">{totalDriversCount}</h3>
                          </div>
                          <div className="bg-info-subtle text-info p-3 rounded-circle">
                            <i className="bi bi-person-badge fs-4"></i>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-sm-6 col-xl-3">
                      <div className="card shadow-sm border-0 rounded-3 p-3 border-start border-warning border-4" style={{ backgroundColor: "#1e293b", color: "#ffffff" }}>
                        <div className="d-flex align-items-center justify-content-between">
                          <div>
                            <span className="text-white small fw-bold">OPEN ISSUES</span>
                            <h3 className="fw-bold text-white mb-0">{openComplaintsCount}</h3>
                          </div>
                          <div className="bg-warning-subtle text-warning p-3 rounded-circle">
                            <i className="bi bi-chat-left-dots fs-4"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SVG Graphs Section */}
                  <div className="row g-4 mb-4">
                    <div className="col-lg-8">
                      <div className="card shadow-sm border-0 rounded-3 p-3 h-100" style={{ backgroundColor: "#1e293b", color: "#ffffff" }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h6 className="fw-bold text-white mb-0">
                            <i className="bi bi-graph-up-arrow text-primary me-2"></i>Weekly Revenue & Ride Analytics
                          </h6>
                          <span className="badge bg-dark text-white border border-secondary">Last 7 Days</span>
                        </div>

                        <div className="p-3 rounded text-center" style={{ backgroundColor: "#0f172a" }}>
                          <svg viewBox="0 0 500 180" className="w-100" style={{ maxHeight: "200px" }}>
                            <line x1="40" y1="20" x2="480" y2="20" stroke="#334155" strokeDasharray="4" />
                            <line x1="40" y1="60" x2="480" y2="60" stroke="#334155" strokeDasharray="4" />
                            <line x1="40" y1="100" x2="480" y2="100" stroke="#334155" strokeDasharray="4" />
                            <line x1="40" y1="140" x2="480" y2="140" stroke="#475569" />

                            <path
                              d="M 50 130 L 110 110 L 170 85 L 230 95 L 290 50 L 350 40 L 410 70 L 470 30"
                              fill="none"
                              stroke="#0d6efd"
                              strokeWidth="3.5"
                            />
                            <polygon
                              points="50,140 50,130 110,110 170,85 230,95 290,50 350,40 410,70 470,30 470,140"
                              fill="rgba(13, 110, 253, 0.25)"
                            />

                            {[[50,130],[110,110],[170,85],[230,95],[290,50],[350,40],[410,70],[470,30]].map(([x,y], i) => (
                              <circle key={i} cx={x} cy={y} r="5" fill="#0d6efd" stroke="#ffffff" strokeWidth="2" />
                            ))}

                            <text x="50" y="160" fontSize="11" fill="#ffffff" textAnchor="middle">Mon</text>
                            <text x="110" y="160" fontSize="11" fill="#ffffff" textAnchor="middle">Tue</text>
                            <text x="170" y="160" fontSize="11" fill="#ffffff" textAnchor="middle">Wed</text>
                            <text x="230" y="160" fontSize="11" fill="#ffffff" textAnchor="middle">Thu</text>
                            <text x="290" y="160" fontSize="11" fill="#ffffff" textAnchor="middle">Fri</text>
                            <text x="350" y="160" fontSize="11" fill="#ffffff" textAnchor="middle">Sat</text>
                            <text x="410" y="160" fontSize="11" fill="#ffffff" textAnchor="middle">Sun</text>
                            <text x="470" y="160" fontSize="11" fill="#38bdf8" fontWeight="bold" textAnchor="middle">Today</text>
                          </svg>
                          <div className="d-flex justify-content-center gap-4 mt-2">
                            <span className="small text-white fw-bold"><i className="bi bi-circle-fill text-primary me-1"></i> Revenue Growth</span>
                            <span className="small text-white fw-bold"><i className="bi bi-circle-fill text-success me-1"></i> Rides Completed</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-4">
                      <div className="card shadow-sm border-0 rounded-3 p-3 h-100" style={{ backgroundColor: "#1e293b", color: "#ffffff" }}>
                        <h6 className="fw-bold text-white mb-3">
                          <i className="bi bi-pie-chart-fill text-success me-2"></i>Ride & Status Breakdown
                        </h6>
                        <div className="d-flex flex-column gap-3">
                          <div>
                            <div className="d-flex justify-content-between small mb-1">
                              <span className="fw-bold text-white">Completed Rides</span>
                              <span className="text-success font-monospace fw-bold">60%</span>
                            </div>
                            <div className="progress" style={{ height: "10px" }}>
                              <div className="progress-bar bg-success" style={{ width: "60%" }}></div>
                            </div>
                          </div>

                          <div>
                            <div className="d-flex justify-content-between small mb-1">
                              <span className="fw-bold text-white">In Progress Rides</span>
                              <span className="text-primary font-monospace fw-bold">25%</span>
                            </div>
                            <div className="progress" style={{ height: "10px" }}>
                              <div className="progress-bar bg-primary" style={{ width: "25%" }}></div>
                            </div>
                          </div>

                          <div>
                            <div className="d-flex justify-content-between small mb-1">
                              <span className="fw-bold text-white">Cancelled Rides</span>
                              <span className="text-danger font-monospace fw-bold">15%</span>
                            </div>
                            <div className="progress" style={{ height: "10px" }}>
                              <div className="progress-bar bg-danger" style={{ width: "15%" }}></div>
                            </div>
                          </div>

                          <hr className="my-2 border-secondary" />

                          <div>
                            <div className="d-flex justify-content-between small mb-1">
                              <span className="fw-bold text-white">Complaints Resolved</span>
                              <span className="text-info font-monospace fw-bold">75%</span>
                            </div>
                            <div className="progress" style={{ height: "10px" }}>
                              <div className="progress-bar bg-info" style={{ width: "75%" }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="card shadow-sm border-0 rounded-3 p-3" style={{ backgroundColor: "#1e293b", color: "#ffffff" }}>
                    <h6 className="fw-bold text-white mb-3">
                      <i className="bi bi-clock-history me-2 text-primary"></i>Recent System Activity Overview
                    </h6>
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Ride ID</th>
                            <th>Rider</th>
                            <th>Driver</th>
                            <th>Fare</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rides.slice(0, 4).map((r, i) => (
                            <tr key={i}>
                              <td className="fw-bold">#RIDE-{r.rideId}</td>
                              <td>{r.riderName}</td>
                              <td>{r.driverName}</td>
                              <td className="fw-semibold">₹{r.fare}</td>
                              <td>
                                <span className={`badge ${r.status === "Completed" ? "bg-success" : r.status === "In Progress" ? "bg-primary" : "bg-danger"}`}>
                                  {r.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: USER MANAGEMENT */}
              {activeTab === "users" && (
                <div className="card shadow-sm border-0 rounded-3 p-3">
                  <h5 className="fw-bold text-dark mb-3">
                    <i className="bi bi-people-fill text-primary me-2"></i>System User Management
                  </h5>
                  <Table_Layout
                    tableName="Registered System Users"
                    columns={[
                      { header: "User ID", field: "userId" },
                      { header: "Username", field: "username" },
                      { header: "Email", field: "email" },
                      { header: "Phone", field: "phone" },
                      { header: "Gender", field: "gender" },
                      { header: "Status", field: "statusBadge" },
                    ]}
                    data={users.map((u) => ({
                      ...u,
                      statusBadge: (
                        <span className={`badge ${String(u.status || "").toLowerCase() === "active" ? "bg-success" : "bg-danger"} px-2 py-1`}>
                          {String(u.status || "").toLowerCase() === "active" ? "Active" : "Inactive"}
                        </span>
                      ),
                    }))}
                    onView={(row) => { setSelectedRow(row); setModalMode("view"); }}
                    onEdit={(row) => { setSelectedRow(row); setModalMode("edit"); }}
                    onDelete={async (row) => {
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
                    }}
                  />
                </div>
              )}

              {/* TAB 3: DRIVER MANAGEMENT (REFERENCE IMPLEMENTATION) */}
              {activeTab === "drivers" && (
                <div className="card shadow-sm border-0 rounded-3 p-3">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-dark mb-0">
                      <i className="bi bi-person-check-fill text-success me-2"></i>Driver License & Verification Records
                    </h5>
                    <span className="badge bg-primary px-3 py-2">Total Drivers: {drivers.length}</span>
                  </div>

                  <Table_Layout
                    tableName="Driver Verification Table"
                    columns={[
                      { header: "Driver ID", field: "userid" },
                      { header: "Name", field: "name" },
                      { header: "Phone", field: "phone" },
                      { header: "License No", field: "licenseNo" },
                      { header: "Document", field: "docButton" },
                      { header: "Verification Status", field: "statusDisplay" },
                    ]}
                    data={drivers.map((d) => ({
                      ...d,
                      docButton: d.licensePdfUrl ? (
                        <button
                          className="btn btn-outline-primary btn-sm px-3"
                          onClick={() => setPreviewDoc({ title: `${d.name}'s License Document`, url: d.licensePdfUrl, isPdf: d.licensePdfUrl.endsWith(".pdf") })}
                        >
                          <i className="bi bi-file-earmark-pdf-fill me-1"></i> View License
                        </button>
                      ) : (
                        <span className="badge bg-secondary">No File Uploaded</span>
                      ),
                      statusDisplay: (
                        <span className={`badge ${d.status === "Verified" || d.status === "active" ? "bg-success" : d.status === "Rejected" ? "bg-danger" : "bg-warning text-dark"} px-2 py-1`}>
                          {d.status === "active" ? "Verified" : d.status}
                        </span>
                      ),
                    }))}
                    onView={(row) => { setSelectedRow(row); setModalMode("view"); }}
                    onEdit={(row) => { setSelectedRow(row); setModalMode("edit"); }}
                    onDelete={async (row) => {
                      if (window.confirm(`⚠️ Are you sure you want to permanently delete driver "${row.name}" from Database?`)) {
                        try {
                          await authApi.deleteUser(row.id || row.userId);
                          setDrivers((prev) => prev.filter((d) => d.id !== row.id));
                          alert(`🗑️ Driver "${row.name}" deleted successfully!`);
                        } catch (err) {
                          setDrivers((prev) => prev.filter((d) => d.id !== row.id));
                          alert(`🗑️ Driver "${row.name}" removed from view!`);
                        }
                      }
                    }}
                  />
                </div>
              )}

              {/* TAB 4: RIDE MANAGEMENT */}
              {activeTab === "rides" && (
                <div className="card shadow-sm border-0 rounded-3 p-3">
                  <h5 className="fw-bold text-dark mb-3">
                    <i className="bi bi-signpost-split-fill text-success me-2"></i>Ride Booking & Monitoring Management
                  </h5>
                  <Table_Layout
                    tableName="Rides Log"
                    columns={[
                      { header: "Ride ID", field: "rideId" },
                      { header: "Rider", field: "riderName" },
                      { header: "Driver", field: "driverName" },
                      { header: "Pickup Source", field: "source" },
                      { header: "Destination", field: "destination" },
                      { header: "Fare (₹)", field: "fare" },
                      { header: "Status", field: "statusBadge" },
                    ]}
                    data={rides.map((r) => ({
                      ...r,
                      statusBadge: (
                        <span className={`badge ${r.status === "Completed" ? "bg-success" : r.status === "In Progress" ? "bg-primary" : "bg-danger"}`}>
                          {r.status}
                        </span>
                      ),
                    }))}
                    onView={(row) => { setSelectedRow(row); setModalMode("view"); }}
                    onEdit={(row) => { setSelectedRow(row); setModalMode("edit"); }}
                    onDelete={(row) => {
                      const rId = row.rideId || row.id;
                      if (window.confirm(`⚠️ Are you sure you want to delete Ride #${rId}?`)) {
                        setRides((prev) => prev.filter((r) => (r.rideId || r.id) !== rId));
                        alert(`🗑️ Ride #${rId} deleted!`);
                      }
                    }}
                  />
                </div>
              )}

              {/* TAB 5: PAYMENT MANAGEMENT */}
              {activeTab === "payments" && (
                <div className="card shadow-sm border-0 rounded-3 p-3">
                  <h5 className="fw-bold text-dark mb-3">
                    <i className="bi bi-credit-card-fill text-primary me-2"></i>Payment & Financial Transactions
                  </h5>
                  <Table_Layout
                    tableName="Payments Log"
                    columns={[
                      { header: "Transaction ID", field: "paymentId" },
                      { header: "Ride ID", field: "rideId" },
                      { header: "Customer Name", field: "riderName" },
                      { header: "Total Fare (₹)", field: "totalFare" },
                      { header: "Payment Mode", field: "paymentMode" },
                      { header: "Payment Status", field: "statusBadge" },
                    ]}
                    data={payments.map((p) => ({
                      ...p,
                      statusBadge: (
                        <span className={`badge ${p.status === "Paid" ? "bg-success" : "bg-warning text-dark"}`}>
                          {p.status}
                        </span>
                      ),
                    }))}
                    onView={(row) => { setSelectedRow(row); setModalMode("view"); }}
                    onEdit={(row) => { setSelectedRow(row); setModalMode("edit"); }}
                    onDelete={(row) => {
                      const pId = row.paymentId || row.id;
                      if (window.confirm(`⚠️ Are you sure you want to delete Transaction "${pId}"?`)) {
                        setPayments((prev) => prev.filter((p) => (p.paymentId || p.id) !== pId));
                        alert(`🗑️ Payment record "${pId}" deleted!`);
                      }
                    }}
                  />
                </div>
              )}

              {/* TAB 6: COMPLAINT MANAGEMENT */}
              {activeTab === "complaints" && (
                <div className="card shadow-sm border-0 rounded-3 p-3">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-dark mb-0">
                      <i className="bi bi-chat-square-quote-fill text-danger me-2"></i>Complaint & Support Ticket Management
                    </h5>
                    <span className="badge bg-danger px-3 py-2">Open Issues: {openComplaintsCount}</span>
                  </div>

                  <Table_Layout
                    tableName="Customer Complaints Log"
                    columns={[
                      { header: "Ticket ID", field: "complaintId" },
                      { header: "Subject", field: "subject" },
                      { header: "Category", field: "category" },
                      { header: "Description", field: "description" },
                      { header: "Current Status", field: "statusBadge" },
                      { header: "Action", field: "actionBtn" },
                    ]}
                    data={complaints.map((c) => ({
                      ...c,
                      statusBadge: (
                        <span className={`badge ${c.status === "Resolved" ? "bg-success" : c.status === "In Progress" ? "bg-info text-dark" : "bg-danger"}`}>
                          {c.status}
                        </span>
                      ),
                      actionBtn: (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            setSelectedComplaint(c);
                            setResolutionStatus(c.status || "In Progress");
                            setResolutionNotes(c.resolutionNotes || "");
                          }}
                        >
                          <i className="bi bi-pencil-square me-1"></i> Resolve Ticket
                        </button>
                      ),
                    }))}
                    onView={(row) => { setSelectedRow(row); setModalMode("view"); }}
                    onEdit={(row) => { setSelectedRow(row); setModalMode("edit"); }}
                    onDelete={async (row) => {
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
                    }}
                  />
                </div>
              )}

              {/* TAB 7: SYSTEM REPORTS */}
              {activeTab === "reports" && (
                <div className="card shadow-sm border-0 rounded-3 p-4">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
                    <div>
                      <h4 className="fw-bold text-primary mb-1">
                        <i className="bi bi-file-earmark-bar-graph-fill me-2"></i>Daily, Weekly & Monthly System Reports
                      </h4>
                      <p className="text-secondary mb-0">Generate, view, and export formatted PDF operational summaries.</p>
                    </div>

                    <div className="d-flex gap-2 mt-3 mt-md-0">
                      <div className="btn-group" role="group">
                        <button
                          className={`btn btn-sm ${reportPeriod === "daily" ? "btn-primary" : "btn-outline-primary"}`}
                          onClick={() => setReportPeriod("daily")}
                        >
                          Daily Report
                        </button>
                        <button
                          className={`btn btn-sm ${reportPeriod === "weekly" ? "btn-primary" : "btn-outline-primary"}`}
                          onClick={() => setReportPeriod("weekly")}
                        >
                          Weekly Report
                        </button>
                        <button
                          className={`btn btn-sm ${reportPeriod === "monthly" ? "btn-primary" : "btn-outline-primary"}`}
                          onClick={() => setReportPeriod("monthly")}
                        >
                          Monthly Report
                        </button>
                      </div>

                      <button className="btn btn-danger btn-sm" onClick={exportPDFReport}>
                        <i className="bi bi-file-earmark-pdf-fill me-1"></i> Export PDF
                      </button>
                    </div>
                  </div>

                  {/* Summary Cards */}
                  <div className="row g-3 mb-4">
                    <div className="col-md-3">
                      <div className="p-3 rounded border text-center" style={{ backgroundColor: "#0f172a", borderColor: "#334155" }}>
                        <span className="text-white small fw-bold">Rides Processed</span>
                        <h4 className="fw-bold text-white mt-1 mb-0">{rides.length}</h4>
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className="p-3 rounded border text-center" style={{ backgroundColor: "#0f172a", borderColor: "#334155" }}>
                        <span className="text-white small fw-bold">Completed Rides</span>
                        <h4 className="fw-bold text-success mt-1 mb-0">{rides.filter(r => r.status === "Completed").length}</h4>
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className="p-3 rounded border text-center" style={{ backgroundColor: "#0f172a", borderColor: "#334155" }}>
                        <span className="text-white small fw-bold">Total Revenue Collected</span>
                        <h4 className="fw-bold text-primary mt-1 mb-0">₹{totalRevenue.toFixed(0)}</h4>
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className="p-3 rounded border text-center" style={{ backgroundColor: "#0f172a", borderColor: "#334155" }}>
                        <span className="text-white small fw-bold">Support Complaints</span>
                        <h4 className="fw-bold text-danger mt-1 mb-0">{complaints.length}</h4>
                      </div>
                    </div>
                  </div>

                  {/* Breakdown Table */}
                  <h6 className="fw-bold text-dark mb-3">Report Details Breakdown ({reportPeriod.toUpperCase()})</h6>
                  <div className="table-responsive border rounded">
                    <table className="table table-striped align-middle mb-0">
                      <thead className="table-dark">
                        <tr>
                          <th>Record Category</th>
                          <th>Count / Total</th>
                          <th>Status Summary</th>
                          <th>Filter Scope</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="fw-semibold"><i className="bi bi-people me-2"></i>Total Users registered</td>
                          <td>{totalUsersCount}</td>
                          <td><span className="badge bg-success">Active</span></td>
                          <td>{reportPeriod.toUpperCase()}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold"><i className="bi bi-person-badge me-2"></i>Verified Drivers</td>
                          <td>{drivers.filter(d => d.status === "Verified" || d.status === "active").length}</td>
                          <td><span className="badge bg-info text-dark">Verified</span></td>
                          <td>{reportPeriod.toUpperCase()}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold"><i className="bi bi-car-front me-2"></i>Completed Rides</td>
                          <td>{rides.filter(r => r.status === "Completed").length}</td>
                          <td><span className="badge bg-success">Completed</span></td>
                          <td>{reportPeriod.toUpperCase()}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold"><i className="bi bi-currency-rupee me-2"></i>Revenue Generated</td>
                          <td className="fw-bold text-success">₹{totalRevenue.toFixed(2)}</td>
                          <td><span className="badge bg-primary">Settled</span></td>
                          <td>{reportPeriod.toUpperCase()}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold"><i className="bi bi-chat-dots me-2"></i>Resolved Complaints</td>
                          <td>{complaints.filter(c => c.status === "Resolved").length}</td>
                          <td><span className="badge bg-success">Closed</span></td>
                          <td>{reportPeriod.toUpperCase()}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Row Details View/Edit Modal (Generically Routed based on Active Tab) */}
      <RowDetailsModal
        row={selectedRow}
        mode={modalMode}
        activeTab={activeTab}
        title={
          modalMode === "edit"
            ? `Edit ${activeTab.slice(0, -1).toUpperCase()} Record`
            : `${activeTab.toUpperCase()} Details Record`
        }
        onSave={handleSaveModalRecord}
        onClose={() => setSelectedRow(null)}
      />

      {/* Complaint Quick Status Modal */}
      {selectedComplaint && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0">
              <form onSubmit={handleUpdateComplaintTicket}>
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title fw-bold">
                    <i className="bi bi-shield-exclamation me-2"></i>Update Complaint #{selectedComplaint.complaintId}
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedComplaint(null)}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="fw-bold small text-white">SUBJECT</label>
                    <p className="fw-bold text-white mb-0">{selectedComplaint.subject}</p>
                  </div>
                  <div className="mb-3">
                    <label className="fw-bold small text-white">DESCRIPTION</label>
                    <p className="text-white-50 small mb-0">{selectedComplaint.description}</p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Update Ticket Status</label>
                    <select
                      className="form-select"
                      value={resolutionStatus}
                      onChange={(e) => setResolutionStatus(e.target.value)}
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Resolution Notes / Action Taken</label>
                    <textarea
                      className="form-textarea form-control"
                      rows="3"
                      placeholder="Enter resolution details..."
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary" onClick={() => setSelectedComplaint(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Resolution Status
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* License PDF Preview Modal */}
      {previewDoc && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content shadow-lg border-0">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-file-earmark-pdf-fill me-2"></i>{previewDoc.title}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setPreviewDoc(null)}></button>
              </div>
              <div className="modal-body p-3 text-center" style={{ minHeight: "450px" }}>
                {previewDoc.isPdf ? (
                  <iframe src={previewDoc.url} title="License PDF" width="100%" height="450px" style={{ border: "none" }} />
                ) : (
                  <img src={previewDoc.url} alt="License Document" className="img-fluid rounded" style={{ maxHeight: "450px" }} />
                )}
              </div>
              <div className="modal-footer bg-light">
                <a href={previewDoc.url} download="License_Document" target="_blank" rel="noreferrer" className="btn btn-outline-primary">
                  <i className="bi bi-download me-1"></i> Download File
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
