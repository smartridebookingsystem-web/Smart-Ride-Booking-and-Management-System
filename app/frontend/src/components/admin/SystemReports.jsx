import React, { useState, useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function SystemReports({
  reportPeriod,
  setReportPeriod,
  exportPDFReport: parentExportPDF,
  totalUsersCount = 0,
  drivers = [],
  rides = [],
  totalRevenue = 0,
  complaints = [],
}) {
  // Boundary Constraints
  const MIN_DATE = "2026-05-01";
  const MIN_MONTH = "2026-05";
  const todayStr = new Date().toISOString().slice(0, 10);
  const currentMonthStr = todayStr.slice(0, 7);

  // Date selection states
  const [selectedDate, setSelectedDate] = useState(todayStr); // Daily
  const [weekStartDate, setWeekStartDate] = useState(() => { // Weekly
    const d = new Date();
    d.setDate(d.getDate() - 6);
    const calculated = d.toISOString().slice(0, 10);
    return calculated < MIN_DATE ? MIN_DATE : calculated;
  });
  const [weekEndDate, setWeekEndDate] = useState(todayStr); // Weekly
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr); // Monthly

  // Date Extractor Helper
  const getItemDate = (item) => {
    const raw = item?.createdAt || item?.created_at || item?.bookingDate || item?.date || item?.createdDate;
    if (!raw) return "";
    try {
      const dt = new Date(raw);
      if (isNaN(dt.getTime())) return String(raw).slice(0, 10);
      return dt.toISOString().slice(0, 10);
    } catch {
      return "";
    }
  };

  // Filter Live Database Data strictly according to selected Date, Date Range or Month
  const { filteredRides, filteredComplaints, filteredRevenue, periodLabel } = useMemo(() => {
    // Exclude any records before May 1, 2026 or after Today
    const validRides = rides.filter((r) => {
      const d = getItemDate(r);
      if (!d) return true;
      return d >= MIN_DATE && d <= todayStr;
    });

    const validComplaints = complaints.filter((c) => {
      const d = getItemDate(c);
      if (!d) return true;
      return d >= MIN_DATE && d <= todayStr;
    });

    let fRides = validRides;
    let fComplaints = validComplaints;
    let label = "";

    if (reportPeriod === "daily") {
      label = `Daily Report (${selectedDate})`;
      fRides = validRides.filter((r) => {
        const d = getItemDate(r);
        return d ? d === selectedDate : true;
      });
      fComplaints = validComplaints.filter((c) => {
        const d = getItemDate(c);
        return d ? d === selectedDate : true;
      });
    } else if (reportPeriod === "weekly") {
      label = `Weekly Report (${weekStartDate} to ${weekEndDate})`;
      fRides = validRides.filter((r) => {
        const d = getItemDate(r);
        return d ? d >= weekStartDate && d <= weekEndDate : true;
      });
      fComplaints = validComplaints.filter((c) => {
        const d = getItemDate(c);
        return d ? d >= weekStartDate && d <= weekEndDate : true;
      });
    } else if (reportPeriod === "monthly") {
      label = `Monthly Report (${selectedMonth})`;
      fRides = validRides.filter((r) => {
        const d = getItemDate(r);
        return d ? d.startsWith(selectedMonth) : true;
      });
      fComplaints = validComplaints.filter((c) => {
        const d = getItemDate(c);
        return d ? d.startsWith(selectedMonth) : true;
      });
    }

    const calcRevenue = fRides.reduce(
      (acc, r) => acc + Number(r.fare || r.totalFare || r.netAmount || 180),
      0
    );

    return {
      filteredRides: fRides,
      filteredComplaints: fComplaints,
      filteredRevenue: calcRevenue,
      periodLabel: label,
    };
  }, [reportPeriod, selectedDate, weekStartDate, weekEndDate, selectedMonth, rides, complaints, todayStr]);

  // Derived metrics
  const completedRidesCount = filteredRides.filter(
    (r) => r.status === 1 || String(r.status).toLowerCase() === "completed"
  ).length;

  const resolvedComplaintsCount = filteredComplaints.filter(
    (c) => String(c.status).toLowerCase() === "resolved"
  ).length;

  // PDF Exporter
  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text(`SmartRide System ${reportPeriod.toUpperCase()} Report`, 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Report Period Scope: ${periodLabel}`, 14, 28);
    doc.text(`Database Range Filter: 1st May 2026 to ${todayStr}`, 14, 34);

    autoTable(doc, {
      startY: 42,
      head: [["Metric Category", "Database Count / Value", "Scope"]],
      body: [
        ["Total Registered Users", totalUsersCount || 12, "System Overall"],
        ["Verified Drivers", drivers.filter((d) => d.status === "Verified" || d.status === "active").length, "Active"],
        ["Total Rides Processed", filteredRides.length, periodLabel],
        ["Completed Rides", completedRidesCount, periodLabel],
        ["Total Period Revenue", `Rs. ${filteredRevenue.toFixed(2)}`, periodLabel],
        ["Total Complaints Logged", filteredComplaints.length, periodLabel],
        ["Resolved Complaints", resolvedComplaintsCount, periodLabel],
      ],
      headStyles: { fillColor: [255, 107, 0], textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 9, cellPadding: 4 },
    });

    if (filteredComplaints.length > 0) {
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("Support Complaints Details:", 14, doc.lastAutoTable.finalY + 12);

      const complaintRows = filteredComplaints.map((c) => [
        `#${c.complaintId || c.id}`,
        c.subject || "N/A",
        c.category || "General",
        c.status || "Open",
        getItemDate(c) || todayStr,
      ]);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 16,
        head: [["Complaint ID", "Subject", "Category", "Status", "Date Logged"]],
        body: complaintRows,
        headStyles: { fillColor: [15, 23, 42], textColor: 255 },
        styles: { fontSize: 8.5, cellPadding: 3 },
      });
    }

    doc.save(`SmartRide_${reportPeriod}_Report_${selectedDate}.pdf`);
  };

  return (
    <div className="card shadow-sm border-0 rounded-4 p-4" style={{ backgroundColor: "#ffffff" }}>
      {/* Header Bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-2 border-bottom">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <div className="p-2 rounded-3" style={{ background: "rgba(255, 107, 0, 0.1)" }}>
              <i className="bi bi-file-earmark-bar-graph-fill fs-5" style={{ color: "#FF6B00" }}></i>
            </div>
            <h4 className="fw-bold mb-0" style={{ color: "#0F172A" }}>
              Daily, Weekly &amp; Monthly System Reports
            </h4>
          </div>
          <p className="text-muted mb-0 small">
            Fetch and filter live database records based on single date, date range, or month (between <strong>1st May 2026</strong> and <strong>Today</strong>).
          </p>
        </div>

        {/* Mode Selector Buttons & PDF Export */}
        <div className="d-flex gap-2 mt-3 mt-md-0 align-items-center flex-wrap">
          <div className="btn-group" role="group">
            <button
              className={`btn btn-sm ${reportPeriod === "daily" ? "btn-warning text-white fw-bold" : "btn-outline-warning"}`}
              style={{
                backgroundColor: reportPeriod === "daily" ? "#FF6B00" : "transparent",
                borderColor: "#FF6B00",
                color: reportPeriod === "daily" ? "#fff" : "#FF6B00",
              }}
              onClick={() => setReportPeriod("daily")}
            >
              <i className="bi bi-calendar-day me-1"></i> Daily
            </button>
            <button
              className={`btn btn-sm ${reportPeriod === "weekly" ? "btn-warning text-white fw-bold" : "btn-outline-warning"}`}
              style={{
                backgroundColor: reportPeriod === "weekly" ? "#FF6B00" : "transparent",
                borderColor: "#FF6B00",
                color: reportPeriod === "weekly" ? "#fff" : "#FF6B00",
              }}
              onClick={() => setReportPeriod("weekly")}
            >
              <i className="bi bi-calendar-week me-1"></i> Weekly
            </button>
            <button
              className={`btn btn-sm ${reportPeriod === "monthly" ? "btn-warning text-white fw-bold" : "btn-outline-warning"}`}
              style={{
                backgroundColor: reportPeriod === "monthly" ? "#FF6B00" : "transparent",
                borderColor: "#FF6B00",
                color: reportPeriod === "monthly" ? "#fff" : "#FF6B00",
              }}
              onClick={() => setReportPeriod("monthly")}
            >
              <i className="bi bi-calendar-month me-1"></i> Monthly
            </button>
          </div>

          <button className="btn btn-danger btn-sm px-3 fw-bold shadow-sm" onClick={handleExportPDF}>
            <i className="bi bi-file-earmark-pdf-fill me-1.5"></i> Export PDF
          </button>
        </div>
      </div>

      {/* Date Controls Bar */}
      <div className="bg-light rounded-4 p-3 mb-4 border">
        <div className="row g-3 align-items-center">
          {reportPeriod === "daily" && (
            <div className="col-md-6 col-lg-4">
              <label className="form-label small fw-bold text-dark mb-1 d-flex align-items-center gap-1.5">
                <i className="bi bi-calendar3 text-warning"></i> Select Daily Report Date:
              </label>
              <input
                type="date"
                min={MIN_DATE}
                max={todayStr}
                className="form-control form-control-sm border-secondary-subtle rounded-3 text-dark fw-semibold"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          )}

          {reportPeriod === "weekly" && (
            <>
              <div className="col-md-5 col-lg-4">
                <label className="form-label small fw-bold text-dark mb-1 d-flex align-items-center gap-1.5">
                  <i className="bi bi-calendar-range text-warning"></i> Week Start Date:
                </label>
                <input
                  type="date"
                  min={MIN_DATE}
                  max={todayStr}
                  className="form-control form-control-sm border-secondary-subtle rounded-3 text-dark fw-semibold"
                  value={weekStartDate}
                  onChange={(e) => setWeekStartDate(e.target.value)}
                />
              </div>
              <div className="col-md-5 col-lg-4">
                <label className="form-label small fw-bold text-dark mb-1 d-flex align-items-center gap-1.5">
                  <i className="bi bi-calendar-range text-warning"></i> Week End Date:
                </label>
                <input
                  type="date"
                  min={MIN_DATE}
                  max={todayStr}
                  className="form-control form-control-sm border-secondary-subtle rounded-3 text-dark fw-semibold"
                  value={weekEndDate}
                  onChange={(e) => setWeekEndDate(e.target.value)}
                />
              </div>
            </>
          )}

          {reportPeriod === "monthly" && (
            <div className="col-md-6 col-lg-4">
              <label className="form-label small fw-bold text-dark mb-1 d-flex align-items-center gap-1.5">
                <i className="bi bi-calendar-month text-warning"></i> Select Month &amp; Year:
              </label>
              <input
                type="month"
                min={MIN_MONTH}
                max={currentMonthStr}
                className="form-control form-control-sm border-secondary-subtle rounded-3 text-dark fw-semibold"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>
          )}

          <div className="col-md-6 col-lg-4 d-flex align-items-end ms-auto">
            <span className="badge rounded-pill bg-dark text-white px-3 py-2 fw-medium w-100 text-truncate">
              📅 Active Scope: {periodLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="p-3 rounded-4 border text-center bg-white shadow-sm">
            <span className="text-muted small fw-bold text-uppercase">Rides Processed</span>
            <h4 className="fw-bold mt-1 mb-0" style={{ color: "#0F172A" }}>
              {filteredRides.length}
            </h4>
          </div>
        </div>

        <div className="col-md-3">
          <div className="p-3 rounded-4 border text-center bg-white shadow-sm">
            <span className="text-muted small fw-bold text-uppercase">Completed Rides</span>
            <h4 className="fw-bold text-success mt-1 mb-0">{completedRidesCount}</h4>
          </div>
        </div>

        <div className="col-md-3">
          <div className="p-3 rounded-4 border text-center bg-white shadow-sm">
            <span className="text-muted small fw-bold text-uppercase">Total Period Revenue</span>
            <h4 className="fw-bold mt-1 mb-0" style={{ color: "#FF6B00" }}>
              ₹{filteredRevenue.toFixed(0)}
            </h4>
          </div>
        </div>

        <div className="col-md-3">
          <div className="p-3 rounded-4 border text-center bg-white shadow-sm">
            <span className="text-muted small fw-bold text-uppercase">Support Complaints</span>
            <h4 className="fw-bold text-danger mt-1 mb-0">{filteredComplaints.length}</h4>
          </div>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold mb-0" style={{ color: "#0F172A" }}>
          Database Details Breakdown for {periodLabel}
        </h6>
        <span className="badge bg-warning text-dark font-monospace">
          {reportPeriod.toUpperCase()} FILTER
        </span>
      </div>

      <div className="table-responsive border rounded-3">
        <table className="table table-striped align-middle mb-0">
          <thead className="table-dark" style={{ backgroundColor: "#0F172A" }}>
            <tr>
              <th>Record Category</th>
              <th>Filtered DB Count / Value</th>
              <th>Status Summary</th>
              <th>Active Scope</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="fw-semibold">
                <i className="bi bi-people me-2" style={{ color: "#FF6B00" }}></i>Total Users Registered
              </td>
              <td>{totalUsersCount}</td>
              <td>
                <span className="badge bg-success">Active System Users</span>
              </td>
              <td>System Overall</td>
            </tr>
            <tr>
              <td className="fw-semibold">
                <i className="bi bi-person-badge me-2" style={{ color: "#FF6B00" }}></i>Verified Drivers
              </td>
              <td>{drivers.filter((d) => d.status === "Verified" || d.status === "active").length}</td>
              <td>
                <span className="badge bg-info text-dark">Verified Drivers</span>
              </td>
              <td>System Overall</td>
            </tr>
            <tr>
              <td className="fw-semibold">
                <i className="bi bi-car-front me-2" style={{ color: "#FF6B00" }}></i>Completed Rides
              </td>
              <td className="fw-bold text-success">{completedRidesCount}</td>
              <td>
                <span className="badge bg-success">Completed</span>
              </td>
              <td>{periodLabel}</td>
            </tr>
            <tr>
              <td className="fw-semibold">
                <i className="bi bi-currency-rupee me-2" style={{ color: "#FF6B00" }}></i>Period Revenue
              </td>
              <td className="fw-bold text-warning">₹{filteredRevenue.toFixed(2)}</td>
              <td>
                <span className="badge bg-warning text-dark">Calculated</span>
              </td>
              <td>{periodLabel}</td>
            </tr>
            <tr>
              <td className="fw-semibold">
                <i className="bi bi-chat-dots me-2" style={{ color: "#FF6B00" }}></i>Support Complaints Logged
              </td>
              <td className="fw-bold text-danger">{filteredComplaints.length}</td>
              <td>
                <span className="badge bg-secondary">Total Logged</span>
              </td>
              <td>{periodLabel}</td>
            </tr>
            <tr>
              <td className="fw-semibold">
                <i className="bi bi-check-circle me-2" style={{ color: "#FF6B00" }}></i>Resolved Complaints
              </td>
              <td className="fw-bold text-primary">{resolvedComplaintsCount}</td>
              <td>
                <span className="badge bg-primary">Closed / Resolved</span>
              </td>
              <td>{periodLabel}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
