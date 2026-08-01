import React from "react";

export default function SystemReports({
  reportPeriod,
  setReportPeriod,
  exportPDFReport,
  totalUsersCount,
  drivers,
  rides,
  totalRevenue,
  complaints,
}) {
  return (
    <div className="card shadow-sm border-0 rounded-4 p-4" style={{ backgroundColor: "#ffffff" }}>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-2 border-bottom">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <div className="p-2 rounded-3" style={{ background: "rgba(255, 107, 0, 0.1)" }}>
              <i className="bi bi-file-earmark-bar-graph-fill fs-5" style={{ color: "#FF6B00" }}></i>
            </div>
            <h4 className="fw-bold mb-0" style={{ color: "#0F172A" }}>
              Daily, Weekly & Monthly System Reports
            </h4>
          </div>
          <p className="text-muted mb-0 small">Generate, view, and export formatted PDF operational summaries.</p>
        </div>

        <div className="d-flex gap-2 mt-3 mt-md-0">
          <div className="btn-group" role="group">
            <button
              className={`btn btn-sm ${reportPeriod === "daily" ? "btn-warning text-white" : "btn-outline-warning"}`}
              style={{
                backgroundColor: reportPeriod === "daily" ? "#FF6B00" : "transparent",
                borderColor: "#FF6B00",
                color: reportPeriod === "daily" ? "#fff" : "#FF6B00",
              }}
              onClick={() => setReportPeriod("daily")}
            >
              Daily Report
            </button>
            <button
              className={`btn btn-sm ${reportPeriod === "weekly" ? "btn-warning text-white" : "btn-outline-warning"}`}
              style={{
                backgroundColor: reportPeriod === "weekly" ? "#FF6B00" : "transparent",
                borderColor: "#FF6B00",
                color: reportPeriod === "weekly" ? "#fff" : "#FF6B00",
              }}
              onClick={() => setReportPeriod("weekly")}
            >
              Weekly Report
            </button>
            <button
              className={`btn btn-sm ${reportPeriod === "monthly" ? "btn-warning text-white" : "btn-outline-warning"}`}
              style={{
                backgroundColor: reportPeriod === "monthly" ? "#FF6B00" : "transparent",
                borderColor: "#FF6B00",
                color: reportPeriod === "monthly" ? "#fff" : "#FF6B00",
              }}
              onClick={() => setReportPeriod("monthly")}
            >
              Monthly Report
            </button>
          </div>

          <button className="btn btn-danger btn-sm px-3 fw-semibold" onClick={exportPDFReport}>
            <i className="bi bi-file-earmark-pdf-fill me-1"></i> Export PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="p-3 rounded-4 border text-center" style={{ backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }}>
            <span className="text-muted small fw-bold text-uppercase">Rides Processed</span>
            <h4 className="fw-bold mt-1 mb-0" style={{ color: "#0F172A" }}>{rides.length}</h4>
          </div>
        </div>

        <div className="col-md-3">
          <div className="p-3 rounded-4 border text-center" style={{ backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }}>
            <span className="text-muted small fw-bold text-uppercase">Completed Rides</span>
            <h4 className="fw-bold text-success mt-1 mb-0">{rides.filter((r) => r.status === "Completed").length}</h4>
          </div>
        </div>

        <div className="col-md-3">
          <div className="p-3 rounded-4 border text-center" style={{ backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }}>
            <span className="text-muted small fw-bold text-uppercase">Total Revenue</span>
            <h4 className="fw-bold mt-1 mb-0" style={{ color: "#FF6B00" }}>₹{totalRevenue.toFixed(0)}</h4>
          </div>
        </div>

        <div className="col-md-3">
          <div className="p-3 rounded-4 border text-center" style={{ backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }}>
            <span className="text-muted small fw-bold text-uppercase">Support Complaints</span>
            <h4 className="fw-bold text-danger mt-1 mb-0">{complaints.length}</h4>
          </div>
        </div>
      </div>

      {/* Breakdown Table */}
      <h6 className="fw-bold mb-3" style={{ color: "#0F172A" }}>Report Details Breakdown ({reportPeriod.toUpperCase()})</h6>
      <div className="table-responsive border rounded-3">
        <table className="table table-striped align-middle mb-0">
          <thead className="table-dark" style={{ backgroundColor: "#0F172A" }}>
            <tr>
              <th>Record Category</th>
              <th>Count / Total</th>
              <th>Status Summary</th>
              <th>Filter Scope</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="fw-semibold"><i className="bi bi-people me-2" style={{ color: "#FF6B00" }}></i>Total Users registered</td>
              <td>{totalUsersCount}</td>
              <td><span className="badge bg-success">Active</span></td>
              <td>{reportPeriod.toUpperCase()}</td>
            </tr>
            <tr>
              <td className="fw-semibold"><i className="bi bi-person-badge me-2" style={{ color: "#FF6B00" }}></i>Verified Drivers</td>
              <td>{drivers.filter((d) => d.status === "Verified" || d.status === "active").length}</td>
              <td><span className="badge bg-info text-dark">Verified</span></td>
              <td>{reportPeriod.toUpperCase()}</td>
            </tr>
            <tr>
              <td className="fw-semibold"><i className="bi bi-car-front me-2" style={{ color: "#FF6B00" }}></i>Completed Rides</td>
              <td>{rides.filter((r) => r.status === "Completed").length}</td>
              <td><span className="badge bg-success">Completed</span></td>
              <td>{reportPeriod.toUpperCase()}</td>
            </tr>
            <tr>
              <td className="fw-semibold"><i className="bi bi-currency-rupee me-2" style={{ color: "#FF6B00" }}></i>Revenue Generated</td>
              <td className="fw-bold text-success">₹{totalRevenue.toFixed(2)}</td>
              <td><span className="badge bg-warning text-dark">Settled</span></td>
              <td>{reportPeriod.toUpperCase()}</td>
            </tr>
            <tr>
              <td className="fw-semibold"><i className="bi bi-chat-dots me-2" style={{ color: "#FF6B00" }}></i>Resolved Complaints</td>
              <td>{complaints.filter((c) => c.status === "Resolved").length}</td>
              <td><span className="badge bg-success">Closed</span></td>
              <td>{reportPeriod.toUpperCase()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
