import React from "react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <>
      {/* Hero Section */}

      <section
        style={{
          background:
            "linear-gradient(rgba(15,23,42,.92), rgba(15,23,42,.92)), url('https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?q=80&w=1800')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "120px 0",
          color: "#fff",
        }}
      >
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1
                className="fw-bold mb-4"
                style={{
                  color: "#fff",
                }}
              >
                About
                <span style={{ color: "#FF6B00" }}> SmartRide</span>
              </h1>

              <p
                className="lead mb-4"
                style={{
                  color: "#CBD5E1",
                }}
              >
                SmartRide is committed to providing safe, reliable and
                affordable transportation for every journey. Whether you're
                travelling across the city or planning an important trip, we
                ensure a smooth ride experience backed by trusted drivers and
                modern technology.
              </p>

              <div className="d-flex gap-3 flex-wrap">
                <Link to="/book-ride" className="btn btn-primary btn-lg">
                  Book a Ride
                </Link>

                <Link to="/driver" className="btn btn-outline-light btn-lg">
                  Become a Driver
                </Link>
              </div>
            </div>

            <div className="col-lg-6 mt-5 mt-lg-0">
              <img
                src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=900"
                alt="SmartRide"
                className="img-fluid rounded-4 shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Who We Are */}

      <section className="py-5">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <img
                src="https://images.unsplash.com/photo-1556122071-e404eaedb77f?q=80&w=900"
                className="img-fluid rounded-4 shadow"
                alt="Who We Are"
              />
            </div>

            <div className="col-lg-6">
              <h2 className="fw-bold mb-4 text-orange">Who We Are</h2>

              <p className="mb-3">
                SmartRide is a modern ride-booking platform created to make
                everyday travel simple, comfortable and secure. We connect
                passengers with verified drivers through an easy-to-use booking
                system that prioritizes safety, convenience and transparency.
              </p>

              <p className="mb-3">
                From daily office commutes to airport transfers and family
                trips, SmartRide provides reliable transportation solutions
                designed to save time and reduce travel stress.
              </p>

              <p>
                Every ride is supported by trained drivers, live ride tracking
                and dedicated customer support to ensure a smooth travel
                experience from pickup to destination.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}

      <section
        className="py-5"
        style={{
          background: "#F8FAFC",
        }}
      >
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-orange">Our Mission & Vision</h2>

            <p className="text-muted">
              Driving the future of smarter and safer transportation.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-lg-6">
              <div className="card border-0 shadow h-100 p-4">
                <div
                  style={{
                    fontSize: "55px",
                    color: "#FF6B00",
                  }}
                >
                  🚖
                </div>

                <h3 className="mt-3 fw-bold">Our Mission</h3>

                <p>
                  To provide safe, affordable and reliable transportation
                  services while delivering exceptional customer experiences
                  through innovation, trust and operational excellence.
                </p>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card border-0 shadow h-100 p-4">
                <div
                  style={{
                    fontSize: "55px",
                    color: "#FF6B00",
                  }}
                >
                  🌍
                </div>

                <h3 className="mt-3 fw-bold">Our Vision</h3>

                <p>
                  To become the most trusted mobility platform by empowering
                  passengers with dependable transportation and helping driver
                  partners build sustainable earning opportunities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Why Choose SmartRide */}

      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">Why Choose SmartRide?</h2>

            <p>
              Experience a smarter, safer and more comfortable way to travel.
            </p>
          </div>

          <div className="row g-4">
            {[
              {
                icon: "bi bi-shield-check",
                title: "Verified Drivers",
                desc: "Every driver is carefully verified to ensure a safe and secure journey.",
              },
              {
                icon: "bi bi-geo-alt-fill",
                title: "Live Ride Tracking",
                desc: "Track your ride in real time from pickup to destination.",
              },
              {
                icon: "bi bi-cash-stack",
                title: "Affordable Pricing",
                desc: "Transparent pricing with no hidden charges.",
              },
              {
                icon: "bi bi-headset",
                title: "24×7 Support",
                desc: "Dedicated customer support available whenever you need assistance.",
              },
              {
                icon: "bi bi-alarm",
                title: "Quick Booking",
                desc: "Book your ride in just a few clicks anytime, anywhere.",
              },
              {
                icon: "bi bi-heart-pulse-fill",
                title: "Emergency SOS",
                desc: "Emergency assistance to keep every journey safe.",
              },
            ].map((item, index) => (
              <div className="col-lg-4 col-md-6" key={index}>
                <div className="card border-0 shadow h-100 text-center p-4">
                  <div
                    className="mx-auto mb-3 d-flex justify-content-center align-items-center rounded-circle"
                    style={{
                      width: "80px",
                      height: "80px",
                      background: "#FFF4E8",
                    }}
                  >
                    <i
                      className={item.icon}
                      style={{
                        color: "#FF6B00",
                        fontSize: "35px",
                      }}
                    ></i>
                  </div>

                  <h4 className="fw-bold">{item.title}</h4>

                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Services */}

      <section
        className="py-5"
        style={{
          background: "#F8FAFC",
        }}
      >
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-orange">Our Services</h2>

            <p className="text-muted">
              Choose the perfect ride that fits your travel needs.
            </p>
          </div>

          <div className="row g-4">
            {/* Hatchback */}

            <div className="col-lg-4">
              <div className="card border-0 shadow h-100 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=900"
                  alt="Hatchback"
                  className="card-img-top"
                  style={{
                    height: "240px",
                    objectFit: "cover",
                  }}
                />

                <div className="card-body p-4">
                  <h3 className="fw-bold">Hatchback</h3>

                  <p>
                    Ideal for daily commuting and short city rides. Affordable,
                    fuel-efficient and perfect for solo travellers or couples.
                  </p>

                  <ul className="list-unstyled text-secondary">
                    <li>✔ Up to 4 Passengers</li>

                    <li>✔ Budget Friendly</li>

                    <li>✔ City Travel</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Sedan */}

            <div className="col-lg-4">
              <div className="card border-0 shadow h-100 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=900"
                  alt="Sedan"
                  className="card-img-top"
                  style={{
                    height: "240px",
                    objectFit: "cover",
                  }}
                />

                <div className="card-body p-4">
                  <h3 className="fw-bold">Sedan</h3>

                  <p>
                    Premium comfort for families, professionals and business
                    travel with spacious seating and a smooth ride experience.
                  </p>

                  <ul className="list-unstyled text-secondary">
                    <li>✔ Up to 4 Passengers</li>

                    <li>✔ Comfortable Journey</li>

                    <li>✔ Business Travel</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* SUV */}

            <div className="col-lg-4">
              <div className="card border-0 shadow h-100 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=900"
                  alt="SUV"
                  className="card-img-top"
                  style={{
                    height: "240px",
                    objectFit: "cover",
                  }}
                />

                <div className="card-body p-4">
                  <h3 className="fw-bold">SUV</h3>

                  <p>
                    Best choice for group travel, airport transfers and
                    long-distance journeys with extra luggage space.
                  </p>

                  <ul className="list-unstyled text-secondary">
                    <li>✔ Up to 7 Passengers</li>

                    <li>✔ Extra Luggage</li>

                    <li>✔ Long Distance Trips</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* How SmartRide Works */}

      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">How SmartRide Works</h2>

            <p>Book your ride in four simple steps.</p>
          </div>

          <div className="row text-center g-4">
            {[
              {
                number: "1",
                icon: "bi-person-plus-fill",
                title: "Register",
                desc: "Create your SmartRide account in just a few minutes.",
              },
              {
                number: "2",
                icon: "bi-search",
                title: "Book Ride",
                desc: "Choose your pickup, destination and preferred vehicle.",
              },
              {
                number: "3",
                icon: "bi-car-front-fill",
                title: "Driver Accepts",
                desc: "A nearby verified driver accepts your booking.",
              },
              {
                number: "4",
                icon: "bi-flag-fill",
                title: "Enjoy Your Journey",
                desc: "Track your ride live and reach your destination safely.",
              },
            ].map((step, index) => (
              <div className="col-lg-3 col-md-6" key={index}>
                <div className="card border-0 shadow h-100 p-4 position-relative">
                  <div
                    className="position-absolute top-0 start-50 translate-middle rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: "45px",
                      height: "45px",
                      background: "#FF6B00",
                      color: "#fff",
                      fontWeight: "700",
                      fontSize: "18px",
                    }}
                  >
                    {step.number}
                  </div>

                  <div className="mt-4">
                    <i
                      className={`bi ${step.icon}`}
                      style={{
                        fontSize: "45px",
                        color: "#FF6B00",
                      }}
                    ></i>

                    <h4 className="fw-bold mt-3">{step.title}</h4>

                    <p>{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}

      <section
        className="py-5"
        style={{
          background: "#0F172A",
        }}
      >
        <div className="container">
          <div className="text-center mb-5">
            <h2
              className="fw-bold"
              style={{
                color: "#fff",
              }}
            >
              Our Achievements
            </h2>

            <p
              style={{
                color: "#CBD5E1",
              }}
            >
              Trusted by thousands of happy customers.
            </p>
          </div>

          <div className="row text-center g-4">
            {[
              {
                value: "10,000+",
                title: "Completed Rides",
              },
              {
                value: "2,500+",
                title: "Verified Drivers",
              },
              {
                value: "50+",
                title: "Cities Covered",
              },
              {
                value: "4.8 ★",
                title: "Customer Rating",
              },
            ].map((item, index) => (
              <div className="col-lg-3 col-md-6" key={index}>
                <div
                  className="p-4 rounded-4 h-100"
                  style={{
                    background: "#1E293B",
                  }}
                >
                  <h2
                    className="fw-bold"
                    style={{
                      color: "#FF6B00",
                      fontSize: "45px",
                    }}
                  >
                    {item.value}
                  </h2>

                  <p
                    style={{
                      color: "#CBD5E1",
                    }}
                  >
                    {item.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Our Team */}

      <section
        className="py-5"
        style={{
          background: "#F8FAFC",
        }}
      >
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-orange">Meet Our Team</h2>

            <p className="text-muted">
              Dedicated professionals working to make every ride exceptional.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-lg-4">
              <div className="card border-0 shadow text-center h-100 p-4">
                <div
                  className="mx-auto rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "110px",
                    height: "110px",
                    background: "#FFF4E8",
                  }}
                >
                  <i
                    className="bi bi-briefcase-fill"
                    style={{
                      fontSize: "55px",
                      color: "#FF6B00",
                    }}
                  ></i>
                </div>

                <h3 className="fw-bold mt-4">Operations Team</h3>

                <p>
                  Our operations team ensures smooth ride management, driver
                  coordination and service quality every day.
                </p>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card border-0 shadow text-center h-100 p-4">
                <div
                  className="mx-auto rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "110px",
                    height: "110px",
                    background: "#FFF4E8",
                  }}
                >
                  <i
                    className="bi bi-headset"
                    style={{
                      fontSize: "55px",
                      color: "#FF6B00",
                    }}
                  ></i>
                </div>

                <h3 className="fw-bold mt-4">Customer Support</h3>

                <p>
                  Available 24×7 to assist passengers and driver partners with
                  bookings, payments and ride-related issues.
                </p>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card border-0 shadow text-center h-100 p-4">
                <div
                  className="mx-auto rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "110px",
                    height: "110px",
                    background: "#FFF4E8",
                  }}
                >
                  <i
                    className="bi bi-car-front-fill"
                    style={{
                      fontSize: "55px",
                      color: "#FF6B00",
                    }}
                  ></i>
                </div>

                <h3 className="fw-bold mt-4">Driver Partners</h3>

                <p>
                  Professional and verified drivers committed to providing safe,
                  comfortable and reliable transportation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Customer Safety */}

      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">Your Safety Is Our Priority</h2>

            <p>
              Every SmartRide journey is designed with safety, trust and comfort
              at its core.
            </p>
          </div>

          <div className="row g-4">
            {[
              {
                icon: "bi-shield-check",
                title: "Verified Drivers",
                desc: "Every driver undergoes identity, document and license verification before joining SmartRide.",
              },
              {
                icon: "bi-geo-alt-fill",
                title: "Live GPS Tracking",
                desc: "Track your ride in real-time and share your trip with family and friends.",
              },
              {
                icon: "bi-telephone-fill",
                title: "Emergency Support",
                desc: "Quick access to emergency assistance whenever you need help during your ride.",
              },
              {
                icon: "bi-star-fill",
                title: "Ratings & Reviews",
                desc: "Passengers rate every trip to help us maintain excellent service quality.",
              },
            ].map((item, index) => (
              <div className="col-lg-3 col-md-6" key={index}>
                <div className="card border-0 shadow h-100 text-center p-4">
                  <div
                    className="mx-auto rounded-circle d-flex justify-content-center align-items-center mb-3"
                    style={{
                      width: "80px",
                      height: "80px",
                      background: "#FFF4E8",
                    }}
                  >
                    <i
                      className={`bi ${item.icon}`}
                      style={{
                        fontSize: "35px",
                        color: "#FF6B00",
                      }}
                    ></i>
                  </div>

                  <h4 className="fw-bold">{item.title}</h4>

                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}

      <section
        className="py-5"
        style={{
          background: "linear-gradient(135deg,#FF6B00,#FF8C42)",
        }}
      >
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8 text-center text-lg-start">
              <h2
                className="fw-bold"
                style={{
                  color: "#fff",
                }}
              >
                Join the SmartRide Family Today
              </h2>

              <p
                className="lead mb-0"
                style={{
                  color: "#FFF4E8",
                }}
              >
                Whether you're looking for a safe ride across the city or want
                to earn by becoming a driver partner, SmartRide is here to make
                every journey better.
              </p>
            </div>

            <div className="col-lg-4 text-center text-lg-end mt-4 mt-lg-0">
              <Link to="/book-ride" className="btn btn-light btn-lg me-3 mb-2">
                <i className="bi bi-car-front-fill me-2"></i>
                Book Ride
              </Link>

              <Link to="/driver" className="btn btn-outline-light btn-lg mb-2">
                <i className="bi bi-person-badge-fill me-2"></i>
                Become a Driver
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
