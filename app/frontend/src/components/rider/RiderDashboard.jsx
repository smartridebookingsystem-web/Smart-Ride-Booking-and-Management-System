import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";

export default function RiderDashboard() {
  const { user } = useSelector((state) => state.auth || {});
  const username = user?.username || "Rider";
  const location = useLocation();

  // Map path to page title
  const getPageTitle = (pathname) => {
    if (pathname.includes("search-ride")) return "Search & Book Ride";
    if (pathname.includes("my-bookings")) return "My Ride Bookings";
    if (pathname.includes("wallet")) return "My Rider Wallet";
    if (pathname.includes("payment-methods")) return "Payment Methods";
    if (pathname.includes("notifications")) return "Notifications";
    if (pathname.includes("help-support")) return "Help & Support";
    if (pathname.includes("settings")) return "Account Settings";
    return "Rider Dashboard";
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Body */}
      <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
        {/* Top Navbar Header */}
        <header
          className="bg-white border-bottom px-4 py-3 d-flex justify-content-between align-items-center sticky-top shadow-sm"
          style={{ zIndex: 90 }}
        >
          <div className="d-flex align-items-center gap-3">
            <h4 className="fw-bold mb-0" style={{ color: "#0F172A" }}>
              {getPageTitle(location.pathname)}
            </h4>
          </div>

          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-light rounded-circle position-relative p-2" title="Notifications">
              <i className="bi bi-bell text-secondary fs-5"></i>
              <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                <span className="visually-hidden">New alerts</span>
              </span>
            </button>

            <div className="vr"></div>

            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white shadow-sm"
                style={{
                  width: "40px",
                  height: "40px",
                  background: "linear-gradient(135deg, #FF6B00 0%, #FF8800 100%)",
                }}
              >
                {username.charAt(0).toUpperCase()}
              </div>
              <div className="d-none d-md-block">
                <div className="fw-semibold text-dark leading-tight" style={{ fontSize: "0.9rem" }}>
                  {username}
                </div>
                <div className="text-muted small" style={{ fontSize: "0.75rem" }}>
                  Rider Member
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="p-4 flex-grow-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
