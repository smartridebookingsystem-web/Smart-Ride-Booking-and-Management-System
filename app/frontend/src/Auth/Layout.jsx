import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Layout() {
  const { user } = useSelector((state) => state.auth);

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
            data-bs-toggle="collapse"
            data-bs-target="#navbarContent"
            aria-controls="navbarContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Collapsible Content */}
          <div
            className="collapse navbar-collapse justify-content-end"
            id="navbarContent"
          >
            {user ? (
              <div className="d-flex align-items-lg-center flex-column flex-lg-row mt-3 mt-lg-0">
                <span className="fw-semibold text-success me-lg-3 mb-2 mb-lg-0">
                  Welcome, {user.userid}
                </span>

                <NavLink className="btn btn-outline-danger btn-sm" to="/logout">
                  Logout
                </NavLink>
              </div>
            ) : (
              <ul className="navbar-nav align-items-lg-center ms-auto">
                <li className="nav-item">
                  <NavLink className="nav-link" to="/login">
                    Login
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink className="nav-link" to="/register">
                    Register
                  </NavLink>
                </li>

                <li className="nav-item mt-2 mt-lg-0 ms-lg-2">
                  <NavLink
                    to="/support"
                    className="btn btn-outline-success btn-sm"
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
