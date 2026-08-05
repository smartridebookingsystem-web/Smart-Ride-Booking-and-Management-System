import React, { useState, useEffect } from "react";

export default function DashboardHome({
  totalRevenue,
  totalRidesCount,
  totalDriversCount,
  openComplaintsCount,
  rides = [],
  users = [],
  drivers = [],
  payments = [],
}) {
  const [driverCount, setDriverCount] = useState(totalDriversCount ?? 0);

  useEffect(() => {
    let isMounted = true;
    const fetchDriverCount = async () => {
      try {
        const apiGatewayUrl = import.meta.env.VITE_API_URL || "http://localhost:8088";
        const response = await fetch(`${apiGatewayUrl}/api/users/all`);
        if (!response.ok) {
          throw new Error(`Failed to fetch users. HTTP Status: ${response.status}`);
        }
        const users = await response.json();
        const drivers = Array.isArray(users) ? users.filter(u => u.role === "DRIVER" || u.roleId === 2) : [];
        if (isMounted) {
          setDriverCount(drivers.length || totalDriversCount || 5);
        }
      } catch (err) {
        console.error("[DashboardHome] Error fetching drivers:", err);
        if (isMounted) {
          setDriverCount(totalDriversCount || 5);
        }
      }
    };

    fetchDriverCount();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div>
      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div
            className="card shadow-sm border-0 rounded-4 p-3 text-white"
            style={{
              background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
              borderLeft: "5px solid #FF6B00",
            }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="small fw-bold text-uppercase" style={{ color: "#cbd5e1" }}>TOTAL REVENUE</span>
                <h3 className="fw-bold mb-0 text-white mt-1">₹{totalRevenue.toFixed(0)}</h3>
              </div>
              <div
                className="p-3 rounded-circle d-flex align-items-center justify-content-center"
                style={{ background: "rgba(255, 107, 0, 0.2)", color: "#FF6B00" }}
              >
                <i className="bi bi-cash-stack fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div
            className="card shadow-sm border-0 rounded-4 p-3 text-white"
            style={{
              background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
              borderLeft: "5px solid #10b981",
            }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="small fw-bold text-uppercase" style={{ color: "#cbd5e1" }}>TOTAL RIDES</span>
                <h3 className="fw-bold mb-0 text-white mt-1">{totalRidesCount}</h3>
              </div>
              <div
                className="p-3 rounded-circle d-flex align-items-center justify-content-center"
                style={{ background: "rgba(16, 185, 129, 0.2)", color: "#10b981" }}
              >
                <i className="bi bi-car-front-fill fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div
            className="card shadow-sm border-0 rounded-4 p-3 text-white"
            style={{
              background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
              borderLeft: "5px solid #3b82f6",
            }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="small fw-bold text-uppercase" style={{ color: "#cbd5e1" }}>TOTAL DRIVERS</span>
                <h3 className="fw-bold mb-0 text-white mt-1">{driverCount}</h3>
              </div>
              <div
                className="p-3 rounded-circle d-flex align-items-center justify-content-center"
                style={{ background: "rgba(59, 130, 246, 0.2)", color: "#3b82f6" }}
              >
                <i className="bi bi-person-badge fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div
            className="card shadow-sm border-0 rounded-4 p-3 text-white"
            style={{
              background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
              borderLeft: "5px solid #ef4444",
            }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="small fw-bold text-uppercase" style={{ color: "#cbd5e1" }}>OPEN ISSUES</span>
                <h3 className="fw-bold mb-0 text-white mt-1">{openComplaintsCount}</h3>
              </div>
              <div
                className="p-3 rounded-circle d-flex align-items-center justify-content-center"
                style={{ background: "rgba(239, 68, 68, 0.2)", color: "#ef4444" }}
              >
                <i className="bi bi-chat-left-dots fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SVG Graphs Section */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 rounded-4 p-3 h-100" style={{ backgroundColor: "#0F172A", color: "#ffffff" }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold text-white mb-0">
                <i className="bi bi-graph-up-arrow me-2" style={{ color: "#FF6B00" }}></i>Weekly Revenue & Ride Analytics
              </h6>
              <span className="badge bg-dark text-white border border-secondary">Last 7 Days</span>
            </div>

            <div className="p-3 rounded-3 text-center" style={{ backgroundColor: "#1E293B" }}>
              <svg viewBox="0 0 500 180" className="w-100" style={{ maxHeight: "200px" }}>
                <line x1="40" y1="20" x2="480" y2="20" stroke="#334155" strokeDasharray="4" />
                <line x1="40" y1="60" x2="480" y2="60" stroke="#334155" strokeDasharray="4" />
                <line x1="40" y1="100" x2="480" y2="100" stroke="#334155" strokeDasharray="4" />
                <line x1="40" y1="140" x2="480" y2="140" stroke="#475569" />

                <path
                  d="M 50 130 L 110 110 L 170 85 L 230 95 L 290 50 L 350 40 L 410 70 L 470 30"
                  fill="none"
                  stroke="#FF6B00"
                  strokeWidth="3.5"
                />
                <polygon
                  points="50,140 50,130 110,110 170,85 230,95 290,50 350,40 410,70 470,30 470,140"
                  fill="rgba(255, 107, 0, 0.2)"
                />

                {[[50,130],[110,110],[170,85],[230,95],[290,50],[350,40],[410,70],[470,30]].map(([x,y], i) => (
                  <circle key={i} cx={x} cy={y} r="5" fill="#FF6B00" stroke="#ffffff" strokeWidth="2" />
                ))}

                <text x="50" y="160" fontSize="11" fill="#ffffff" textAnchor="middle">Mon</text>
                <text x="110" y="160" fontSize="11" fill="#ffffff" textAnchor="middle">Tue</text>
                <text x="170" y="160" fontSize="11" fill="#ffffff" textAnchor="middle">Wed</text>
                <text x="230" y="160" fontSize="11" fill="#ffffff" textAnchor="middle">Thu</text>
                <text x="290" y="160" fontSize="11" fill="#ffffff" textAnchor="middle">Fri</text>
                <text x="350" y="160" fontSize="11" fill="#ffffff" textAnchor="middle">Sat</text>
                <text x="410" y="160" fontSize="11" fill="#ffffff" textAnchor="middle">Sun</text>
                <text x="470" y="160" fontSize="11" fill="#FF6B00" fontWeight="bold" textAnchor="middle">Today</text>
              </svg>
              <div className="d-flex justify-content-center gap-4 mt-2">
                <span className="small text-white fw-bold"><i className="bi bi-circle-fill me-1" style={{ color: "#FF6B00" }}></i> Revenue Growth</span>
                <span className="small text-white fw-bold"><i className="bi bi-circle-fill text-success me-1"></i> Rides Completed</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow-sm border-0 rounded-4 p-3 h-100" style={{ backgroundColor: "#0F172A", color: "#ffffff" }}>
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
                  <span className="font-monospace fw-bold" style={{ color: "#FF6B00" }}>25%</span>
                </div>
                <div className="progress" style={{ height: "10px" }}>
                  <div className="progress-bar" style={{ width: "25%", background: "#FF6B00" }}></div>
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
      <div className="card shadow-sm border-0 rounded-4 p-3" style={{ backgroundColor: "#ffffff", color: "#0F172A" }}>
        <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
          <div className="p-2 rounded-3" style={{ background: "rgba(255, 107, 0, 0.1)" }}>
            <i className="bi bi-clock-history fs-5" style={{ color: "#FF6B00" }}></i>
          </div>
          <h6 className="fw-bold mb-0" style={{ color: "#0F172A" }}>Recent System Activity Overview</h6>
        </div>
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
              {rides.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-4">No recent system activity recorded in database yet.</td>
                </tr>
              ) : (
                rides.slice(0, 5).map((r, i) => {
                  const targetRiderId = String(r.userId || r.user_id || "");
                  const matchedRider = users.find((u) => String(u.userId || u.id) === targetRiderId);
                  const riderName = matchedRider ? (matchedRider.username || matchedRider.name) : (r.riderName || (targetRiderId ? `Rider #${targetRiderId}` : "N/A"));

                  const targetDriverId = String(r.driverId || r.driver_id || "");
                  const matchedDriver = targetDriverId && targetDriverId !== "null"
                    ? drivers.find((d) => String(d.driverId) === targetDriverId)
                    : null;
                  const driverName = matchedDriver ? (matchedDriver.name || matchedDriver.username) : (targetDriverId && targetDriverId !== "null" ? `Driver #${targetDriverId}` : "Unassigned ⏳");

                  const matchedPayment = payments.find((p) => String(p.rideId || p.ride_id) === String(r.rideId || r.ride_id || r.id));
                  const fareAmount = matchedPayment ? (matchedPayment.totalFare || matchedPayment.netAmount) : (r.fare || r.fareAmount || 150);

                  const rawStatus = r.status;
                  const isCompleted = rawStatus === 1 || String(rawStatus).toLowerCase() === "completed";
                  const isInProgress = rawStatus === 2 || String(rawStatus).toLowerCase() === "in progress" || String(rawStatus).toLowerCase() === "in_progress" || String(rawStatus).toLowerCase() === "pending" || String(rawStatus).toLowerCase() === "requested";

                  return (
                    <tr key={i}>
                      <td className="fw-bold" style={{ color: "#FF6B00" }}>#RIDE-{r.rideId || r.id}</td>
                      <td className="fw-semibold text-dark">{riderName}</td>
                      <td className="fw-semibold text-dark">{driverName}</td>
                      <td className="fw-bold text-success">₹{Number(fareAmount || 0).toFixed(2)}</td>
                      <td>
                        <span className={`badge ${isCompleted ? "bg-success" : isInProgress ? "bg-warning text-dark" : "bg-danger"} px-2.5 py-1.5 fs-7 rounded-pill`}>
                          {isCompleted ? "Completed 🟢" : isInProgress ? "In Progress 🟡" : "Cancelled 🔴"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
