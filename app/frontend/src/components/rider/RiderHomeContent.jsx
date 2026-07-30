import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

export default function RiderHomeContent() {
  const { user } = useSelector((state) => state.auth || {});
  const username = user?.username || "Rider";

  return (
    <div className="rider-home-content">
      {/* Welcome Banner Header */}
      <div
        className="p-4 mb-4 text-white rounded-4 shadow-sm"
        style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
          borderLeft: "6px solid #FF6B00",
        }}
      >
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <span
              className="badge rounded-pill px-3 py-2 mb-2"
              style={{
                background: "rgba(255, 107, 0, 0.2)",
                color: "#FF6B00",
                fontSize: "0.85rem",
              }}
            >
              Rider Dashboard
            </span>
            <h2 className="fw-bold mb-1">
              Welcome back, <span style={{ color: "#FF6B00" }}>{username}</span>! 👋
            </h2>
            <p className="text-light mb-0" style={{ color: "#cbd5e1" }}>
              Where would you like to go today? Book a ride in seconds with verified drivers.
            </p>
          </div>
          <div className="d-flex gap-2">
            <Link to="/rider/search-ride" className="btn btn-warning px-4 py-2 fw-semibold" style={{ background: "#FF6B00", borderColor: "#FF6B00", color: "#fff" }}>
              <i className="bi bi-geo-alt-fill me-2"></i> Book New Ride
            </Link>
            <Link to="/rider/wallet" className="btn btn-outline-light px-4 py-2 fw-semibold">
              <i className="bi bi-wallet2 me-2"></i> Check Wallet
            </Link>
          </div>
        </div>
      </div>

      {/* Hero & Quick Booking Section */}
      <section
        className="rounded-4 p-4 p-lg-5 mb-5 shadow-sm text-white"
        style={{
          background:
            "linear-gradient(rgba(15,23,42,.92), rgba(15,23,42,.92)), url('https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=1920')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="row align-items-center gy-4">
          {/* Left Content */}
          <div className="col-lg-6">
            <span
              className="badge rounded-pill px-3 py-2 mb-3"
              style={{
                background: "rgba(255,107,0,.15)",
                color: "#FF6B00",
                fontSize: ".9rem",
              }}
            >
              Safe • Fast • Affordable
            </span>

            <h1
              className="fw-bold mb-4"
              style={{
                fontSize: "3rem",
                lineHeight: "1.2",
              }}
            >
              Move Smart.
              <br />
              <span style={{ color: "#FF6B00" }}>Live Easy.</span>
            </h1>

            <p
              className="lead mb-4"
              style={{
                color: "#cbd5e1",
                maxWidth: "520px",
              }}
            >
              Book rides in seconds, travel safely with verified drivers,
              track your journey in real time and enjoy a hassle-free
              transportation experience with SmartRide.
            </p>

            <div className="d-flex flex-wrap gap-3">
              <Link to="/rider/search-ride" className="btn btn-lg px-4 fw-semibold text-white" style={{ background: "#FF6B00" }}>
                <i className="bi bi-car-front-fill me-2"></i>
                Book Ride Now
              </Link>

              <Link
                to="/rider/my-bookings"
                className="btn btn-outline-light btn-lg px-4"
              >
                View My Bookings
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="row mt-4 pt-3 border-top border-secondary">
              <div className="col-4">
                <h4 className="fw-bold mb-0" style={{ color: "#FF6B00" }}>
                  10K+
                </h4>
                <small className="text-light">Happy Riders</small>
              </div>

              <div className="col-4">
                <h4 className="fw-bold mb-0" style={{ color: "#FF6B00" }}>
                  2500+
                </h4>
                <small className="text-light">Drivers</small>
              </div>

              <div className="col-4">
                <h4 className="fw-bold mb-0" style={{ color: "#FF6B00" }}>
                  4.8★
                </h4>
                <small className="text-light">Rating</small>
              </div>
            </div>
          </div>

          {/* Right Booking Card */}
          <div className="col-lg-6">
            <div
              className="card border-0 shadow-lg"
              style={{
                borderRadius: "20px",
                overflow: "hidden",
                color: "#1e293b",
              }}
            >
              <div
                className="card-header border-0 py-3 px-4"
                style={{
                  background: "#FF6B00",
                  color: "#fff",
                }}
              >
                <h5 className="mb-0 fw-bold">
                  <i className="bi bi-search me-2"></i> Quick Ride Search
                </h5>
              </div>

              <div className="card-body p-4 bg-white">
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Pickup Location
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-geo-alt-fill text-danger"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Enter pickup location"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Destination
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-pin-map-fill text-success"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Enter destination"
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      Ride Type
                    </label>
                    <select className="form-select">
                      <option>Hatchback (Economy)</option>
                      <option>Sedan (Comfort)</option>
                      <option>SUV (Premium)</option>
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      Pickup Time
                    </label>
                    <input type="datetime-local" className="form-control" />
                  </div>
                </div>

                <Link
                  to="/rider/search-ride"
                  className="btn btn-primary w-100 mt-2 py-2 fw-semibold text-white"
                  style={{ background: "#FF6B00", borderColor: "#FF6B00" }}
                >
                  <i className="bi bi-search me-2"></i>
                  Find Available Drivers
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHY CHOOSE SMARTRIDE ================= */}
      <section className="py-4 mb-5 rounded-4 bg-light p-4 shadow-sm">
        <div className="text-center mb-4">
          <h3 className="fw-bold" style={{ color: "#FF6B00" }}>
            Why Choose SmartRide?
          </h3>
          <p className="text-muted">
            Experience a smarter way to travel with safety, comfort and affordability.
          </p>
        </div>

        <div className="row g-4">
          {[
            {
              icon: "bi bi-geo-alt-fill",
              title: "Real-Time Tracking",
              desc: "Track your ride live from pickup to destination.",
            },
            {
              icon: "bi bi-shield-check",
              title: "Safe & Secure",
              desc: "Verified drivers with secure ride experience.",
            },
            {
              icon: "bi bi-cash-stack",
              title: "Affordable Pricing",
              desc: "Transparent pricing without hidden charges.",
            },
            {
              icon: "bi bi-headset",
              title: "24×7 Support",
              desc: "Dedicated support team available anytime.",
            },
          ].map((item, index) => (
            <div className="col-lg-3 col-md-6" key={index}>
              <div className="card border-0 shadow-sm h-100 text-center p-4">
                <div
                  className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                  style={{
                    width: "65px",
                    height: "65px",
                    borderRadius: "50%",
                    background: "rgba(255,107,0,.12)",
                  }}
                >
                  <i
                    className={`${item.icon}`}
                    style={{
                      fontSize: "28px",
                      color: "#FF6B00",
                    }}
                  ></i>
                </div>

                <h5 className="fw-bold">{item.title}</h5>
                <p className="text-muted small mb-0">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= RIDE CATEGORIES ================= */}
      <section className="py-4 mb-5">
        <div className="text-center mb-4">
          <h3 className="fw-bold" style={{ color: "#FF6B00" }}>
            Ride Categories
          </h3>
          <p className="text-muted">
            Choose the perfect ride according to your travel needs.
          </p>
        </div>

        <div className="row g-4">
          {[
            {
              name: "Hatchback",
              icon: "bi bi-car-front-fill",
              desc: "Affordable rides for daily travel.",
            },
            {
              name: "Sedan",
              icon: "bi bi-car-front",
              desc: "Comfortable rides for family and business.",
            },
            {
              name: "SUV",
              icon: "bi bi-truck-front-fill",
              desc: "Spacious rides for groups and luggage.",
            },
          ].map((ride, index) => (
            <div className="col-lg-4" key={index}>
              <div className="card border-0 shadow-sm text-center h-100 p-4">
                <div
                  className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "rgba(255,107,0,.12)",
                  }}
                >
                  <i
                    className={ride.icon}
                    style={{
                      fontSize: "36px",
                      color: "#FF6B00",
                    }}
                  ></i>
                </div>

                <h4 className="fw-bold">{ride.name}</h4>
                <p className="text-muted small mb-0">{ride.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= POPULAR DESTINATIONS ================= */}
      <section className="py-4 mb-5 rounded-4 bg-light p-4 shadow-sm">
        <div className="text-center mb-4">
          <h3 className="fw-bold" style={{ color: "#FF6B00" }}>
            Popular Destinations
          </h3>
          <p className="text-muted">
            Frequently travelled locations around Pune.
          </p>
        </div>

        <div className="row g-4">
          {[
            {
              place: "Pune Railway Station",
              icon: "bi bi-train-front-fill",
            },
            {
              place: "Pune Airport",
              icon: "bi bi-airplane-fill",
            },
            {
              place: "Hinjewadi IT Park",
              icon: "bi bi-buildings-fill",
            },
            {
              place: "FC Road",
              icon: "bi bi-shop",
            },
          ].map((item, index) => (
            <div className="col-lg-3 col-md-6" key={index}>
              <div className="card border-0 shadow-sm h-100 text-center p-4">
                <i
                  className={item.icon}
                  style={{
                    fontSize: "36px",
                    color: "#FF6B00",
                  }}
                ></i>

                <h6 className="fw-bold mt-3 mb-0">{item.place}</h6>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section
        className="py-5 mb-5 rounded-4 p-4 text-white shadow-sm"
        style={{
          background: "#0F172A",
        }}
      >
        <div className="text-center mb-4">
          <h3 className="fw-bold" style={{ color: "#FF6B00" }}>
            How It Works
          </h3>
          <p className="text-light">
            Booking a ride is simple and takes less than a minute.
          </p>
        </div>

        <div className="row text-center g-4">
          {[
            {
              step: "1",
              icon: "bi bi-geo-alt-fill",
              title: "Choose Locations",
              desc: "Enter your pickup and destination.",
            },
            {
              step: "2",
              icon: "bi bi-car-front-fill",
              title: "Select Vehicle",
              desc: "Choose Hatchback, Sedan or SUV.",
            },
            {
              step: "3",
              icon: "bi bi-check-circle-fill",
              title: "Enjoy Your Ride",
              desc: "Track your driver and travel safely.",
            },
          ].map((item, index) => (
            <div className="col-lg-4" key={index}>
              <div className="p-3">
                <div
                  className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                  style={{
                    width: "75px",
                    height: "75px",
                    borderRadius: "50%",
                    background: "#FF6B00",
                    color: "#fff",
                  }}
                >
                  <i
                    className={item.icon}
                    style={{
                      fontSize: "32px",
                    }}
                  ></i>
                </div>

                <h4
                  className="fw-bold"
                  style={{
                    color: "#FF6B00",
                  }}
                >
                  Step {item.step}
                </h4>

                <h6 className="text-white fw-bold">{item.title}</h6>
                <p className="text-light small">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="py-4 mb-4">
        <div className="text-center mb-4">
          <h3 className="fw-bold" style={{ color: "#FF6B00" }}>
            What Our Customers Say
          </h3>
          <p className="text-muted">
            Thousands of happy riders trust SmartRide every day.
          </p>
        </div>

        <div className="row g-4">
          {[
            {
              name: "Rahul Sharma",
              city: "Pune",
              review:
                "SmartRide is fast, reliable and affordable. The drivers are professional and rides are always on time.",
            },
            {
              name: "Priya Patil",
              city: "Mumbai",
              review:
                "The booking process is simple and the live tracking feature makes every journey stress-free.",
            },
            {
              name: "Amit Deshmukh",
              city: "Nagpur",
              review:
                "Excellent service with clean vehicles and friendly drivers. Highly recommended for daily commuting.",
            },
          ].map((item, index) => (
            <div className="col-lg-4" key={index}>
              <div className="card border-0 shadow-sm h-100 p-4">
                <div className="mb-2">
                  <i
                    className="bi bi-stars"
                    style={{
                      color: "#FF6B00",
                      fontSize: "20px",
                    }}
                  ></i>
                </div>
                <p className="text-muted fst-italic small mb-3">"{item.review}"</p>
                <hr className="my-2" />
                <h6 className="fw-bold mb-0">{item.name}</h6>
                <small className="text-muted">{item.city}</small>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
