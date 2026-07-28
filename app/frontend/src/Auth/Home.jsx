import React, { useState } from "react";
import MapComponent from "../components/rider/MapComponent";
import { Link } from "react-router-dom";

export default function Home5() {

    const [pickup, setPickup] = useState(null);
    const [drop, setDrop] = useState(null);
    const [selecting, setSelecting] = useState("");
    const [showMap, setShowMap] = useState(false);

    return (
   
    <>
   
      {/* ================= HERO SECTION ================= */}

      <section
        style={{
          background:
            "linear-gradient(rgba(15,23,42,.92), rgba(15,23,42,.92)), url('https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=1920')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
          color: "#fff",
        }}
      >
        
        <div className="container">
          <div className="row align-items-center gy-5">
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
                  fontSize: "4rem",
                  lineHeight: "1.15",
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
                <Link to="/book-ride" className="btn btn-primary btn-lg px-4">
                  <i className="bi bi-car-front-fill me-2"></i>
                  Book Ride
                </Link>

                <Link
                  to="/services"
                  className="btn btn-outline-light btn-lg px-4"
                >
                  Explore Services
                </Link>
              </div>

              {/* Stats */}

              <div className="row mt-5">
                <div className="col-4">
                  <h3 className="fw-bold" style={{ color: "#FF6B00" }}>
                    10K+
                  </h3>

                  <small className="text-light">Happy Riders</small>
                </div>

                <div className="col-4">
                  <h3 className="fw-bold" style={{ color: "#FF6B00" }}>
                    2500+
                  </h3>

                  <small className="text-light">Drivers</small>
                </div>

                <div className="col-4">
                  <h3 className="fw-bold" style={{ color: "#FF6B00" }}>
                    4.8★
                  </h3>

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
                }}
              >
                <div
                  className="card-header border-0 py-4"
                  style={{
                    background: "#FF6B00",
                    color: "#fff",
                  }}
                >
                  <h4 className="mb-0 fw-bold">Book Your Ride</h4>
                </div>

                <div className="card-body p-4">
                 
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Pickup Location
                    </label>

                   <input
                      type="text"
                      className="form-control"
                      placeholder="Click to choose Pickup"
                      value={pickup ? `${pickup[0].toFixed(5)}, ${pickup[1].toFixed(5)}` : ""}
                      readOnly
                      onClick={() => {
                        setSelecting("pickup");
                        setShowMap(true);
                      }}
                    />
                  </div>

                  <div className="mb-3">
                   
                    <label className="form-label fw-semibold">
                      Destination
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Click to choose Drop"
                      value={drop ? `${drop[0].toFixed(5)}, ${drop[1].toFixed(5)}` : ""}
                      readOnly
                      onClick={() => {
                        setSelecting("drop");
                        setShowMap(true);
                      }}
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">
                        Ride Type
                      </label>

                      <select className="form-select">
                        <option>Hatchback</option>
                        <option>Sedan</option>
                        <option>SUV</option>
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">
                        Pickup Time
                      </label>

                      <input type="datetime-local" className="form-control" />
                    </div>
                  </div>

                  <button className="btn btn-primary w-100 mt-2">
                    <i className="bi bi-search me-2"></i>
                    Search Ride
                  </button>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>
      {/* ================= WHY CHOOSE SMARTRIDE ================= */}

      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-orange">Why Choose SmartRide?</h2>

            <p className="text-light">
              Experience a smarter way to travel with safety, comfort and
              affordability.
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
                      width: "75px",
                      height: "75px",
                      borderRadius: "50%",
                      background: "rgba(255,107,0,.12)",
                    }}
                  >
                    <i
                      className={`${item.icon}`}
                      style={{
                        fontSize: "32px",
                        color: "#FF6B00",
                      }}
                    ></i>
                  </div>

                  <h5 className="fw-bold">{item.title}</h5>

                  <p className="text-light mb-0">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= RIDE CATEGORIES ================= */}

      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-orange">Ride Categories</h2>

            <p className="text-light">
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
                    className="mx-auto mb-4 d-flex align-items-center justify-content-center"
                    style={{
                      width: "90px",
                      height: "90px",
                      borderRadius: "50%",
                      background: "rgba(255,107,0,.12)",
                    }}
                  >
                    <i
                      className={ride.icon}
                      style={{
                        fontSize: "42px",
                        color: "#FF6B00",
                      }}
                    ></i>
                  </div>

                  <h4 className="fw-bold">{ride.name}</h4>

                  <p className="text-light">{ride.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= POPULAR DESTINATIONS ================= */}

      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-orange">Popular Destinations</h2>

            <p className="text-light">
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
                      fontSize: "40px",
                      color: "#FF6B00",
                    }}
                  ></i>

                  <h5 className="fw-bold mt-3">{item.place}</h5>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ================= HOW IT WORKS ================= */}

      <section
        className="py-5"
        style={{
          background: "#0F172A",
          color: "#fff",
        }}
      >
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-orange">How It Works</h2>

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
                <div className="p-4">
                  <div
                    className="mx-auto mb-4 d-flex align-items-center justify-content-center"
                    style={{
                      width: "90px",
                      height: "90px",
                      borderRadius: "50%",
                      background: "#FF6B00",
                      color: "#fff",
                    }}
                  >
                    <i
                      className={item.icon}
                      style={{
                        fontSize: "40px",
                      }}
                    ></i>
                  </div>

                  <h3
                    className="fw-bold"
                    style={{
                      color: "#FF6B00",
                    }}
                  >
                    Step {item.step}
                  </h3>

                  <h5 className="text-white">{item.title}</h5>

                  <p className="text-light">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= STATISTICS ================= */}

      <section className="py-5 bg-light">
        <div className="container">
          <div className="row text-center g-4">
            {[
              {
                number: "10,000+",
                title: "Rides Completed",
              },
              {
                number: "2,500+",
                title: "Verified Drivers",
              },
              {
                number: "50+",
                title: "Cities Covered",
              },
              {
                number: "4.8 ★",
                title: "Average Rating",
              },
            ].map((item, index) => (
              <div className="col-lg-3 col-md-6" key={index}>
                <div className="card border-0 shadow-sm p-4 h-100">
                  <h2
                    className="fw-bold"
                    style={{
                      color: "#FF6B00",
                    }}
                  >
                    {item.number}
                  </h2>

                  <p className="mb-0 text-light">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}

      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-orange">What Our Customers Say</h2>

            <p className="text-light">
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
                  <div className="mb-3">
                    <i
                      className="bi bi-stars"
                      style={{
                        color: "#FF6B00",
                        fontSize: "22px",
                      }}
                    ></i>
                  </div>

                  <p className="text-light fst-italic">"{item.review}"</p>

                  <hr />

                  <h5 className="fw-bold mb-1">{item.name}</h5>

                  <small className="text-light">{item.city}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {showMap && (
    <div
        style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
        }}
    >
        <div
            style={{
                width: "80%",
                height: "80%",
                background: "#fff",
                borderRadius: "12px",
                overflow: "hidden",
                position: "relative",
            }}
        >
            <button
                onClick={() => setShowMap(false)}
                style={{
                    position: "absolute",
                    right: 15,
                    top: 15,
                    zIndex: 1000,
                }}
                className="btn btn-danger"
            >
                ✕
            </button>
{/* ================= Map Pop-UP ================= */}
            <MapComponent
                pickup={pickup}
                drop={drop}
                setPickup={setPickup}
                setDrop={setDrop}
                selecting={selecting}
                onClose={() => setShowMap(false)}
              
            />
        </div>
    </div>
)}
    </>
  );
}
