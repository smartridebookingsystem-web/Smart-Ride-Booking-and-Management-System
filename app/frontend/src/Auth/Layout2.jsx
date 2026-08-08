import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Layout() {
  const { user } = useSelector((state) => state.auth);
  const displayName = user?.username || user?.name || user?.phone || user?.email || "User";
  const initial = displayName.charAt(0).toUpperCase();
  const roleName = user?.roleName || (user?.role === 1 ? "Admin" : user?.role === 2 ? "Driver" : "Rider");

  const [isNavOpen, setIsNavOpen] = useState(false);
  const toggleNavbar = () => setIsNavOpen((prev) => !prev);
  const closeNavbar = () => setIsNavOpen(false);

  return (
    <>
      {/* ================= Navbar ================= */}

      <nav
        className="navbar navbar-expand-lg fixed-top navbar-custom shadow-sm"
        style={{ minHeight: "80px" }}
      >
        <div className="container-fluid">
          {/* Logo */}

          <NavLink
            className="navbar-brand fw-bold"
            to="/"
            onClick={closeNavbar}
            style={{
              color: "var(--primary)",
              fontSize: "1.8rem",
              letterSpacing: "1px",
            }}
          >
            <i className="bi bi-car-front-fill text-orange me-2"></i>
            <span>SmartRide</span>
          </NavLink>

          {/* Mobile Toggle */}

          <button
            className="navbar-toggler btn-outline-primary"
            type="button"
            onClick={toggleNavbar}
            aria-controls="navbarContent"
            aria-expanded={isNavOpen}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Navbar Menu */}

          <div
            className={`collapse navbar-collapse justify-content-end ${isNavOpen ? "show" : ""}`}
            id="navbarContent"
          >
            {user ? (
              <div className="d-flex align-items-center gap-3 mt-3 mt-lg-0">
                {/* Welcome */}

                <span
                  className="fw-semibold"
                  style={{
                    color: "var(--primary)",
                  }}
                >
                  Welcome, {displayName}
                </span>

                {/* Profile */}

                <div className="profile">
                  <div className="profile-avatar">
                    {initial}
                  </div>

                  <div className="profile-info">
                    <h6>{displayName}</h6>
                    <span>{roleName}</span>
                  </div>
                </div>

                {/* Logout */}

                <NavLink
                  to="/logout"
                  className="btn btn-primary"
                  onClick={closeNavbar}
                >
                  Logout
                </NavLink>
              </div>
            ) : (
              <ul className="navbar-nav align-items-lg-center">
                <li className="nav-item">
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                    onClick={closeNavbar}
                  >
                    Home
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink
                    to="/about"
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                    onClick={closeNavbar}
                  >
                    About
                  </NavLink>
                </li>

                {/* <li className="nav-item">
                  <NavLink
                    to="/services"
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                    onClick={closeNavbar}
                  >
                    Services
                  </NavLink>
                </li> */}

                <li className="nav-item">
                  <NavLink
                    to="/driver"
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                    onClick={closeNavbar}
                  >
                    Become Driver
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink
                    to="/contact"
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                    onClick={closeNavbar}
                  >
                    Contact
                  </NavLink>
                </li>

                {/* Login */}

                <li className="nav-item ms-lg-3 mt-3 mt-lg-0">
                  <NavLink
                    to="/login"
                    className="btn btn-outline-primary"
                    onClick={closeNavbar}
                  >
                    Login
                  </NavLink>
                </li>

                {/* Register */}

                <li className="nav-item ms-lg-2 mt-3 mt-lg-0">
                  <NavLink
                    to="/register"
                    className="btn btn-outline-primary"
                    onClick={closeNavbar}
                  >
                    Register
                  </NavLink>
                </li>

                {/* Book Ride */}

              </ul>
            )}
          </div>
        </div>
      </nav>
      {/* ================= Main Content ================= */}

      <main
        style={{
          minHeight: "100vh",
          background: "var(--bg)",
          paddingTop: "90px",
        }}
      >
        <Outlet />
      </main>

      {/* ================= Footer ================= */}
      <footer className="bg-light footer-custom">
        <div className="container-fluid p-0">
          <div className="row">
            {/* Company */}
            <div className="col-lg-4 col-md-6">
              <h4 className="fw-bold mb-3" style={{ color: "var(--primary)" }}>
                <div className="d-flex align-items-center">
                  <i className="bi bi-car-front-fill text-orange me-2"></i>
                  <span>SmartRide</span>
                </div>
              </h4>
              <p className="text-dark mb-0">
                Reliable rides anytime, anywhere. SmartRide connects riders and
                drivers with a safe, fast and affordable booking experience.
              </p>
            </div>

            {/* Quick Links */}
            <div className="col-lg-4 col-md-6">
              <h5 className="text-dark mb-3">Quick Links</h5>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <NavLink to="/about">About Us</NavLink>
                </li>
                {/* <li className="mb-2">
                  <NavLink to="/services">Services</NavLink>
                </li> */}
                {/* <li className="mb-2">
                  <NavLink to="/driver">Become Driver</NavLink>
                </li> */}
                <li className="mb-2">
                  <NavLink to="/privacy">Privacy Policy</NavLink>
                </li>
                <li>
                  <NavLink to="/contact">Contact Us</NavLink>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="col-lg-4">
              <h5 className="text-dark mb-3">Contact Information</h5>
              <p className="text-dark mb-2">📞 +91 12345 67890</p>
              <p className="text-dark mb-2">✉ support@smartride.com</p>
              <p className="text-dark mb-2">📍 Pune, Maharashtra</p>
              <p className="text-dark">🕒 24 × 7 Customer Support</p>
            </div>
          </div>

          <hr
            style={{
              borderColor: "rgba(255,255,255,.08)",
              margin: "30px 0 20px",
            }}
          />

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
            <p className="mb-2 mb-md-0 text-dark">
              © {new Date().getFullYear()} Smart Ride Booking & Management
              System. All Rights Reserved.
            </p>
            <div className="d-flex gap-3">
              <a href="#" className="text-orange fs-4">
                <i className="bi bi-facebook text-orange"></i>
              </a>
              <a href="#" className="text-hover-dark fs-4">
                <i className="bi bi-instagram text-orange"></i>
              </a>
              <a href="#" className="text-orange fs-4">
                <i className="bi bi-twitter-x text-orange"></i>
              </a>
              <a href="#" className="text-orange fs-4">
                <i className="bi bi-linkedin text-orange"></i>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
