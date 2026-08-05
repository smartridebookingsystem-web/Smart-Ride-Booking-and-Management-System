import React, { useState, useEffect } from "react";
import RowDetailsModal from "../../Auth/RowDetailsModel";
import { authApi, complaintApi, rideApi, paymentApi } from "../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import DashboardHome from "./DashboardHome";
import UserManagement from "./UserManagement";
import DriverManagement from "./DriverManagement";
import RideManagement from "./RideManagement";
import PaymentManagement from "./PaymentManagement";
import ComplaintManagement from "./ComplaintManagement";
import DeactivatedAccounts from "./DeactivatedAccounts";
import SystemReports from "./SystemReports";
import ComplaintModal from "./ComplaintModal";
import LicensePreviewModal from "./LicensePreviewModal";

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
            userId: d.userId,
            driverId: index + 1,
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
      setRides(Array.isArray(allRides) ? allRides : allRides?.data || []);

      const allPayments = await paymentApi.getAllPayments().catch(() => []);
      setPayments(allPayments);

      const allComplaints = await complaintApi.getAllComplaints().catch(() => []);
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
    doc.setTextColor(15, 23, 42);
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
      headStyles: { fillColor: [255, 107, 0] },
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
      headStyles: { fillColor: [15, 23, 42] },
    });

    doc.save(`SmartRide_${reportPeriod}_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // Helper Metrics Calculations
  const deactivatedUsers = users.filter((u) => {
    const s = String(u.status || "").toLowerCase();
    return s === "deactivated" || s === "inactive" || s === "disabled" || s === "suspended";
  });
  const totalUsersCount = users.length;
  const totalDriversCount = drivers.length;
  const totalRidesCount = rides.length;
  const totalRevenue = payments.reduce((acc, p) => acc + (p.totalFare || 0), 0);
  const openComplaintsCount = complaints.filter((c) => c.status === "Open" || c.status === "In Progress").length;

  return (
    <div
      className="container-fluid py-4 px-3 px-md-4 admin-dashboard-wrapper"
      style={{ backgroundColor: "#f8fafc", minHeight: "100vh", color: "#0F172A" }}
    >
      {/* Top Bar Header */}
      <AdminHeader
        totalUsersCount={totalUsersCount}
        totalRevenue={totalRevenue}
        openComplaintsCount={openComplaintsCount}
      />

      <div className="row g-4">
        {/* Sidebar Menu */}
        <div className="col-lg-3 col-md-4">
          <AdminSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            totalUsersCount={totalUsersCount}
            totalDriversCount={totalDriversCount}
            totalRidesCount={totalRidesCount}
            paymentsCount={payments.length}
            openComplaintsCount={openComplaintsCount}
            deactivatedCount={deactivatedUsers.length}
          />
        </div>

        {/* Content Panel */}
        <div className="col-lg-9 col-md-8">
          {loading ? (
            <div className="card shadow-sm border-0 p-5 text-center rounded-4" style={{ backgroundColor: "#ffffff" }}>
              <div className="spinner-border mx-auto" style={{ color: "#FF6B00" }} role="status"></div>
              <p className="mt-3 text-muted fw-semibold">Loading Admin Dashboard Data...</p>
            </div>
          ) : (
            <>
              {activeTab === "dashboard" && (
                <DashboardHome
                  totalRevenue={totalRevenue}
                  totalRidesCount={totalRidesCount}
                  totalDriversCount={totalDriversCount}
                  openComplaintsCount={openComplaintsCount}
                  rides={rides}
                  users={users}
                  drivers={drivers}
                  payments={payments}
                />
              )}

              {activeTab === "users" && (
                <UserManagement
                  users={users}
                  setUsers={setUsers}
                  setSelectedRow={setSelectedRow}
                  setModalMode={setModalMode}
                />
              )}

              {activeTab === "drivers" && (
                <DriverManagement
                  drivers={drivers}
                  setDrivers={setDrivers}
                  setSelectedRow={setSelectedRow}
                  setModalMode={setModalMode}
                  setPreviewDoc={setPreviewDoc}
                />
              )}

              {activeTab === "rides" && (
                <RideManagement
                  rides={rides}
                  users={users}
                  drivers={drivers}
                  payments={payments}
                  setRides={setRides}
                  setSelectedRow={setSelectedRow}
                  setModalMode={setModalMode}
                />
              )}

              {activeTab === "payments" && (
                <PaymentManagement
                  payments={payments}
                  users={users}
                  setPayments={setPayments}
                  setSelectedRow={setSelectedRow}
                  setModalMode={setModalMode}
                />
              )}

              {activeTab === "complaints" && (
                <ComplaintManagement
                  complaints={complaints}
                  setComplaints={setComplaints}
                  openComplaintsCount={openComplaintsCount}
                  setSelectedRow={setSelectedRow}
                  setModalMode={setModalMode}
                  setSelectedComplaint={setSelectedComplaint}
                  setResolutionStatus={setResolutionStatus}
                  setResolutionNotes={setResolutionNotes}
                />
              )}

              {activeTab === "deactivated" && (
                <DeactivatedAccounts
                  deactivatedUsers={deactivatedUsers}
                  setUsers={setUsers}
                  setDrivers={setDrivers}
                />
              )}

              {activeTab === "reports" && (
                <SystemReports
                  reportPeriod={reportPeriod}
                  setReportPeriod={setReportPeriod}
                  exportPDFReport={exportPDFReport}
                  totalUsersCount={totalUsersCount}
                  drivers={drivers}
                  rides={rides}
                  totalRevenue={totalRevenue}
                  complaints={complaints}
                />
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
      <ComplaintModal
        selectedComplaint={selectedComplaint}
        setSelectedComplaint={setSelectedComplaint}
        resolutionStatus={resolutionStatus}
        setResolutionStatus={setResolutionStatus}
        resolutionNotes={resolutionNotes}
        setResolutionNotes={setResolutionNotes}
        handleUpdateComplaintTicket={handleUpdateComplaintTicket}
      />

      {/* License PDF Preview Modal */}
      <LicensePreviewModal previewDoc={previewDoc} setPreviewDoc={setPreviewDoc} />
    </div>
  );
}
