import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Layout() {
  const { user } = useSelector((state) => state.auth);
  const displayName = user?.username || user?.name || user?.phone || user?.email || "User";

  const [isNavOpen, setIsNavOpen] = useState(false);
  const toggleNavbar = () => setIsNavOpen((prev) => !prev);
  const closeNavbar = () => setIsNavOpen(false);

  return (
    <>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm px-3">
        <div className="container-fluid">
          <span className="navbar-brand fw-bold text-success flex-grow-1">
            Smart Ride Booking And Management System
          </span>

          {/* Toggle Button */}
          <button
            className="navbar-toggler ms-auto"
            type="button"
            onClick={toggleNavbar}
            aria-controls="navbarContent"
            aria-expanded={isNavOpen}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Collapsible Content */}
          <div
            className={`collapse navbar-collapse justify-content-end ${isNavOpen ? "show" : ""}`}
            id="navbarContent"
          >
            {user ? (
              <div className="d-flex align-items-lg-center flex-column flex-lg-row mt-3 mt-lg-0">
                <span className="fw-semibold text-success me-lg-3 mb-2 mb-lg-0">
                  Welcome, {displayName}
                </span>

                <NavLink className="btn btn-outline-danger btn-sm" to="/logout" onClick={closeNavbar}>
                  Logout
                </NavLink>
              </div>
            ) : (
              <ul className="navbar-nav align-items-lg-center ms-auto">
                <li className="nav-item">
                  <NavLink className="nav-link" to="/login" onClick={closeNavbar}>
                    Login
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink className="nav-link" to="/register" onClick={closeNavbar}>
                    Register
                  </NavLink>
                </li>

                <li className="nav-item mt-2 mt-lg-0 ms-lg-2">
                  <NavLink
                    to="/support"
                    className="btn btn-outline-success btn-sm"
                    onClick={closeNavbar}
                  >
                    Contact Support
                  </NavLink>
                </li>
              </ul>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div
        className="container-fluid"
        style={{
          minHeight: "90vh",
          backgroundColor: "#f8f9fa",
        }}
      >
        <Outlet />
      </div>

      {/* Footer */}
      <footer className="card border-0 bg-light text-center text-muted py-3 shadow-sm">
        <div className="container">
          <small>
            © 2026 Smart Ride Booking And Management System ·{" "}
            <a href="/privacy" className="text-decoration-none text-success">
              Privacy Policy
            </a>{" "}
            ·{" "}
            <a href="/contact" className="text-decoration-none text-success">
              Contact: 1234567891
            </a>
          </small>
        </div>
      </footer>
    </>
  );
}
