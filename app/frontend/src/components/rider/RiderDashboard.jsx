import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";

export default function RiderDashboard() {
  const { user } = useSelector((state) => state.auth || {});
  const username = user?.username.toUpperCase() || "Rider Member";
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
        {/* {username.charAt(0).toUpperCase()} */}

        {/* Dynamic Route Content */}
        <main className="p-4 flex-grow-1">
          <Outlet />
        </main>
      </div>
    </div >
  );
}
