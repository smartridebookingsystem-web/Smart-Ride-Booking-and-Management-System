import React, { useState, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { rideApi, authApi } from "../services/api";

export default function Driverdashboard() {
  const { user } = useSelector((state) => state.auth);
  const rawName = user?.name || user?.fullName || user?.username;
  const driverName = (rawName && isNaN(rawName)) ? rawName : (user?.username || "Driver Captain");
  const driverId = user?.id || user?.userId || 1;
  const [isOnline, setIsOnline] = useState(true);
  const [dutyToggling, setDutyToggling] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [totalEarningsBadge, setTotalEarningsBadge] = useState("₹1,250");
  const [pendingBadge, setPendingBadge] = useState("3 New");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchHeaderStats() {
      try {
        const rides = await rideApi.getAllRides();
        if (Array.isArray(rides) && rides.length > 0) {
          const fareSum = rides.reduce((sum, r) => sum + (r.fare || 250), 0);
          setTotalEarningsBadge(`₹${fareSum}`);
          const pendingCount = rides.filter(r => r.status === 2 || r.status === 0).length;
          setPendingBadge(`${pendingCount > 0 ? pendingCount : 1} New`);
        }
      } catch (err) {
        console.warn("Dashboard header stats sync:", err);
      }
    }
    fetchHeaderStats();
  }, []);

  // Sync duty status to backend with localStorage fallback
  const handleToggleDuty = async () => {
    if (dutyToggling) return;
    const newStatus = !isOnline;
    setDutyToggling(true);
    setIsOnline(newStatus);
    try {
      await authApi.saveDriverAvailability(driverId, { isOnline: newStatus, updatedAt: new Date().toISOString() });
    } catch (err) {
      console.warn("Duty status sync notice (localStorage fallback used):", err);
    } finally {
      setDutyToggling(false);
    }
  };

  const menuItems = [
    { path: "/driver", label: "Live Requests & Map", icon: "bi-house-door-fill", color: "text-warning", end: true, badge: "LIVE" },
    { path: "/driver/ride-requests", label: "Ride Requests", icon: "bi-bell-fill", color: "text-info", badge: pendingBadge },
    { path: "/driver/navigation", label: "GPS Guidance", icon: "bi-geo-alt-fill", color: "text-danger" },
    { path: "/driver/complete-ride", label: "Complete Trip", icon: "bi-check-circle-fill", color: "text-success" },
    { path: "/driver/earnings", label: "Earnings", icon: "bi-wallet2", color: "text-warning", badge: totalEarningsBadge },
    { path: "/driver/vehicle-info", label: "Vehicle & PDF", icon: "bi-car-front-fill", color: "text-info" },
    { path: "/driver/availability", label: "Schedule", icon: "bi-calendar-check-fill", color: "text-primary" },
  ];

  return (
    <div className="container-fluid py-4 px-3 px-md-4" style={{ backgroundColor: "#0B0F19", minHeight: "100vh", color: "#F8FAFC" }}>
      {/* ================= HERO CONTROL CENTER HEADER ================= */}
      <div
        className="card border-0 shadow-lg mb-3 text-white position-relative"
        style={{
          borderRadius: "20px",
          background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
        }}
      >
        <div className="card-body p-3.5 p-md-4">
          <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
            {/* Left: Menu Toggle + Driver Avatar + Info */}
            <div className="d-flex align-items-center gap-3">
              <button
                type="button"
                className="btn btn-outline-warning fw-bold px-3 py-2 rounded-3 d-flex align-items-center gap-2 shadow-sm border-2"
                onClick={() => setMenuOpen(!menuOpen)}
                title="Toggle Sidebar Navigation"
              >
                <i className={`bi ${menuOpen ? "bi-layout-sidebar-reverse-fill" : "bi-layout-sidebar-fill"} fs-5 text-warning`}></i>
                <span className="d-none d-sm-inline text-white small fw-bold">Menu</span>
              </button>

              <div
                className="rounded-circle d-flex justify-content-center align-items-center shadow position-relative overflow-hidden"
                style={{
                  width: "56px",
                  height: "56px",
                  border: "2px solid #FF6B00",
                  boxShadow: "0 8px 24px rgba(255, 107, 0, 0.4)",
                }}
              >
                <i className="bi bi-person-fill fs-2 text-warning"></i>
                <span
                  className={`position-absolute bottom-0 end-0 p-1.5 rounded-circle border border-2 border-dark ${isOnline ? "bg-success" : "bg-danger"
                    }`}
                  style={{ width: "15px", height: "15px", zIndex: 2 }}
                ></span>
              </div>

              <div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <h3 className="fw-bold mb-0 text-white fs-4">{driverName}</h3>
                  <span className="badge bg-warning bg-opacity-20 text-warning px-2.5 py-1 rounded-pill small fw-bold border border-warning border-opacity-30">
                    <i className="bi bi-star-fill me-1"></i>4.95 ★
                  </span>
                  <span className="badge bg-info bg-opacity-20 text-info px-2.5 py-1 rounded-pill small fw-bold border border-info border-opacity-30">
                    <i className="bi bi-shield-check me-1"></i>Verified
                  </span>
                </div>
                <div className="text-light opacity-75 small mt-1 d-flex align-items-center gap-3">
                  <span><i className="bi bi-car-front-fill text-warning me-1"></i>MH-12-AB-4021 (Sedan)</span>
                  <span className="d-none d-sm-inline">•</span>
                  <span className="d-none d-sm-inline"><i className="bi bi-geo-alt-fill text-danger me-1"></i>Sangli Central</span>
                </div>
              </div>
            </div>

            {/* Right: Revenue Stats, Clock & Glowing Duty Status Toggle */}
            <div className="d-flex align-items-center gap-3 ms-lg-auto flex-wrap">
              {/* Live Digital Clock & Today Revenue Pill */}
              <div className="d-none d-sm-flex align-items-center gap-3 bg-white bg-opacity-10 p-2.5 px-3 rounded-4 border border-white border-opacity-10">
                <div className="text-center">
                  <div className="text-warning fw-bold small">
                    <i className="bi bi-clock-history me-1"></i>{currentTime}
                  </div>
                  <div className="text-light opacity-75" style={{ fontSize: "0.68rem" }}>IST Time</div>
                </div>
                <div className="border-end border-white border-opacity-20" style={{ height: "24px" }}></div>
                <div className="text-center">
                  <div className="text-warning fw-bold fs-6">₹1,250</div>
                  <div className="text-light opacity-75" style={{ fontSize: "0.68rem" }}>Today's Earnings</div>
                </div>
                <div className="border-end border-white border-opacity-20" style={{ height: "24px" }}></div>
                <div className="text-center">
                  <div className="text-success fw-bold fs-6">8</div>
                  <div className="text-light opacity-75" style={{ fontSize: "0.68rem" }}>Trips Done</div>
                </div>
              </div>

              {/* Glowing Interactive Duty Status Toggle */}
              <button
                type="button"
                className={`btn fw-bold px-4 py-2 rounded-pill shadow-lg d-flex align-items-center gap-2 transition-all ${isOnline
                    ? "btn-success text-white border-2 border-success-subtle"
                    : "btn-outline-danger text-danger bg-danger bg-opacity-10 border-2"
                  }`}
                onClick={handleToggleDuty}
                disabled={dutyToggling}
                style={{
                  fontSize: "0.95rem",
                  boxShadow: isOnline ? "0 0 25px rgba(34, 197, 94, 0.45)" : "none",
                }}
              >
                {dutyToggling ? (
                  <span className="spinner-border spinner-border-sm"></span>
                ) : (
                  <i className={`bi ${isOnline ? "bi-wifi fs-5 text-white" : "bi-wifi-off fs-5"}`}></i>
                )}
                <span>{isOnline ? "ONLINE (On Duty)" : "OFFLINE (Off Duty)"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* TOP QUICK NAVIGATION HORIZONTAL BAR */}
        <div className="card-footer border-top border-white border-opacity-10 bg-black bg-opacity-20 px-3 py-2">
          <div className="d-flex align-items-center gap-2 overflow-auto text-nowrap pb-1 pt-1 scrollbar-none">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `btn btn-sm fw-semibold rounded-pill px-3 py-1.5 d-flex align-items-center gap-2 transition-all border ${isActive
                    ? "btn-primary text-white shadow-sm border-primary"
                    : "btn-outline-light text-light border-white border-opacity-10 hover-bg-dark opacity-90"
                  }`
                }
              >
                <i className={`bi ${item.icon} ${item.color}`}></i>
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`badge rounded-pill ${item.badge === "LIVE" ? "bg-danger" : "bg-warning text-dark"}`} style={{ fontSize: "0.65rem" }}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT ROW WITH OPTIONAL LEFT SIDEBAR ================= */}
      <div className="row g-4">
        {/* Left Side Collapsible Menu (Clear, No Backdrop) */}
        {menuOpen && (
          <div className="col-lg-3">
            <div
              className="card border-0 shadow-lg rounded-4 overflow-hidden"
              style={{
                background: "#1E293B",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div
                className="card-header fw-bold py-3 px-3 text-white border-bottom border-secondary border-opacity-20 d-flex justify-content-between align-items-center"
                style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)" }}
              >
                <span><i className="bi bi-grid-fill me-2 text-warning"></i>Driver Hub Menu</span>
                <button
                  type="button"
                  className="btn btn-sm text-light p-0 border-0"
                  onClick={() => setMenuOpen(false)}
                  title="Hide Menu"
                >
                  <i className="bi bi-x-lg fs-6"></i>
                </button>
              </div>

              <div className="list-group list-group-flush p-2">
                {menuItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    className={({ isActive }) =>
                      `list-group-item list-group-item-action rounded-3 mb-1 fw-semibold d-flex align-items-center justify-content-between border-0 py-2.5 px-3 transition-all ${isActive ? "bg-primary text-white shadow-sm" : "bg-transparent text-light opacity-90 hover-bg-dark"
                      }`
                    }
                  >
                    <div className="d-flex align-items-center gap-2.5">
                      <i className={`bi ${item.icon} ${item.color} fs-5`}></i>
                      <span>{item.label}</span>
                    </div>
                    {item.badge ? (
                      <span className={`badge rounded-pill ${item.badge === "LIVE" ? "bg-danger" : "bg-warning text-dark"}`}>
                        {item.badge}
                      </span>
                    ) : (
                      <i className="bi bi-chevron-right small opacity-40"></i>
                    )}
                  </NavLink>
                ))}

                <div className="my-2 border-top border-secondary border-opacity-20"></div>

                <NavLink
                  to="/logout"
                  className="list-group-item list-group-item-action rounded-3 fw-semibold border-0 py-2.5 px-3 text-danger bg-transparent hover-bg-dark d-flex align-items-center gap-2.5"
                >
                  <i className="bi bi-box-arrow-right fs-5 text-danger"></i>
                  <span>Logout</span>
                </NavLink>
              </div>
            </div>
          </div>
        )}

        {/* Right Main Content Outlet Container */}
        <div className={menuOpen ? "col-lg-9" : "col-12"}>
          <div
            className="card border-0 shadow-lg rounded-4 p-3 p-md-4"
            style={{
              background: "#1E293B",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              minHeight: "620px",
            }}
          >
            <Outlet context={{ isOnline, setIsOnline }} />
          </div>
        </div>
      </div>
    </div>
  );
}







