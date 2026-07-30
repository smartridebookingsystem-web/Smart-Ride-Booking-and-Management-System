import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaSearch,
  FaTicketAlt,
  FaWallet,
  FaCreditCard,
  FaBell,
  FaQuestionCircle,
  FaCog,
  FaSignOutAlt
} from "react-icons/fa";
import "./Sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menu = [
    { name: "Dashboard", icon: <FaHome />, path: "/rider" },
    { name: "Search Ride", icon: <FaSearch />, path: "/rider/search-ride" },
    { name: "My Bookings", icon: <FaTicketAlt />, path: "/rider/my-bookings" },
    { name: "Wallet", icon: <FaWallet />, path: "/rider/wallet" },
    { name: "Payment Methods", icon: <FaCreditCard />, path: "/rider/payment-methods" },
    { name: "Notifications", icon: <FaBell />, path: "/rider/notifications" },
    { name: "Help & Support", icon: <FaQuestionCircle />, path: "/rider/help-support" },
    { name: "Settings", icon: <FaCog />, path: "/rider/settings" },
  ];

  const handleLogout = () => {
    navigate("/logout");
  };

  return (
    <div className="sidebar">
      <div className="logo">
        🚕 <span>SmartRide</span>
      </div>

      <div className="menu">
        {menu.map((item, index) => {
          const isActive =
            item.path === "/rider"
              ? location.pathname === "/rider" || location.pathname === "/rider/"
              : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={index}
              to={item.path}
              className={`menu-item ${isActive ? "active" : ""}`}
              end={item.path === "/rider"}
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="logout" onClick={handleLogout}>
        <FaSignOutAlt />
        <span>Logout</span>
      </div>
    </div>
  );
}
