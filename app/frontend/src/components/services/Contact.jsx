import React, { useState } from "react";
import SmartRideAIChat from "./SmartRideAIChat";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    alert(
      "Thank you for contacting SmartRide.\n\nThis feature is currently under development.",
    );

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <>
      {/* Hero Section */}

      <section
        style={{
          background:
            "linear-gradient(rgba(15,23,42,.93), rgba(15,23,42,.93)),url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1600')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "120px 0",
          color: "#fff",
        }}
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <h1
                className="fw-bold"
                style={{
                  color: "#fff",
                }}
              >
                Contact
                <span style={{ color: "#FF6B00" }}> SmartRide</span>
              </h1>

              <p
                className="lead mt-3"
                style={{
                  color: "#CBD5E1",
                }}
              >
                Need help with your ride?
                <br />
                Our team is available to assist you anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}

      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">Get In Touch</h2>

            <p>Reach us using any of the following methods.</p>
          </div>

          <div className="row g-4">
            {/* Phone */}

            <div className="col-lg-3 col-md-6">
              <div className="card text-center h-100 p-4">
                <div
                  style={{
                    fontSize: "50px",
                    color: "#FF6B00",
                  }}
                >
                  <i className="bi bi-telephone-fill"></i>
                </div>

                <h4 className="mt-3">Phone</h4>

                <p className="mb-1">+91 98765 43210</p>

                <small className="text-light">24 × 7 Support</small>
              </div>
            </div>

            {/* Email */}

            <div className="col-lg-3 col-md-6">
              <div className="card text-center h-100 p-4">
                <div
                  style={{
                    fontSize: "50px",
                    color: "#FF6B00",
                  }}
                >
                  <i className="bi bi-envelope-fill"></i>
                </div>

                <h4 className="mt-3">Email</h4>

                <p className="mb-1">support@smartride.com</p>

                <small className="text-light">Quick Email Support</small>
              </div>
            </div>

            {/* Location */}

            <div className="col-lg-3 col-md-6">
              <div className="card text-center h-100 p-4">
                <div
                  style={{
                    fontSize: "50px",
                    color: "#FF6B00",
                  }}
                >
                  <i className="bi bi-geo-alt-fill"></i>
                </div>

                <h4 className="mt-3">Office</h4>

                <p className="mb-1">Pune, Maharashtra</p>

                <small className="text-light">SmartRide Headquarters</small>
              </div>
            </div>

            {/* Working Hours */}

            <div className="col-lg-3 col-md-6">
              <div className="card text-center h-100 p-4">
                <div
                  style={{
                    fontSize: "50px",
                    color: "#FF6B00",
                  }}
                >
                  <i className="bi bi-clock-fill"></i>
                </div>

                <h4 className="mt-3">Working Hours</h4>

                <p className="mb-1">Mon - Sun</p>

                <small className="text-light">24 Hours Available</small>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Contact Form */}

      <section className="py-5 bg-light">
        <div className="container">
          <div className="row g-5">
            {/* Contact Form */}

            <div className="col-lg-7">
              <div className="card border-0 shadow-lg p-4 h-100">
                <h3 className="fw-bold mb-4">Send us a Message</h3>

                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">
                        Full Name
                      </label>

                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">
                        Email Address
                      </label>

                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Subject</label>

                    <input
                      type="text"
                      name="subject"
                      className="form-control"
                      placeholder="Enter subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Message</label>

                    <textarea
                      rows="6"
                      name="message"
                      className="form-control"
                      placeholder="Write your message..."
                      value={formData.message}
                      onChange={handleChange}
                      style={{
                        height: "170px",
                        resize: "none",
                      }}
                      required
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-primary px-5">
                    <i className="bi bi-send-fill me-2"></i>
                    Send Message
                  </button>
                </form>
              </div>
            </div>

            {/* Office Information */}

            <div className="col-lg-5">
              <div className="card border-0 shadow-lg p-4 h-100">
                <h3 className="fw-bold mb-4">Office Information</h3>

                <div className="mb-4">
                  <h5 style={{ color: "#FF6B00" }}>
                    <i className="bi bi-building me-2"></i>
                    SmartRide Headquarters
                  </h5>

                  <p>
                    SmartRide Technologies Pvt. Ltd.
                    <br />
                    Pune, Maharashtra
                    <br />
                    India
                  </p>
                </div>

                <div className="mb-4">
                  <h5 style={{ color: "#FF6B00" }}>
                    <i className="bi bi-headset me-2"></i>
                    Customer Support
                  </h5>

                  <p className="mb-2">📞 +91 98765 43210</p>

                  <p className="mb-2">✉ support@smartride.com</p>

                  <p>24 × 7 Customer Assistance</p>
                </div>

                <div className="mb-4">
                  <h5 style={{ color: "#FF6B00" }}>
                    <i className="bi bi-clock-history me-2"></i>
                    Business Hours
                  </h5>

                  <p className="mb-1">Monday - Friday</p>

                  <strong style={{ color: "#e0d2d2" }}>
                    09:00 AM – 08:00 PM
                  </strong>

                  <hr />

                  <p className="mb-1">Saturday & Sunday</p>

                  <strong style={{ color: "#e0d2d2" }}>
                    Emergency Support Only
                  </strong>
                </div>

                <div>
                  <h5
                    className="mb-3"
                    style={{
                      color: "#FF6B00",
                    }}
                  >
                    Follow Us
                  </h5>

                  <div className="d-flex gap-3">
                    <button className="btn btn-outline-primary">
                      <i className="bi bi-facebook"></i>
                    </button>

                    <button className="btn btn-outline-primary">
                      <i className="bi bi-instagram"></i>
                    </button>

                    <button className="btn btn-outline-primary">
                      <i className="bi bi-twitter-x"></i>
                    </button>

                    <button className="btn btn-outline-primary">
                      <i className="bi bi-linkedin"></i>
                    </button>

                    <button className="btn btn-outline-primary">
                      <i className="bi bi-youtube"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* FAQ Section */}

      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">Frequently Asked Questions</h2>

            <p>Find answers to the most commonly asked questions.</p>
          </div>

          <div className="accordion" id="faqAccordion">
            <div className="accordion-item">
              <h2 className="accordion-header">
                <button
                  className="accordion-button"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#faq1"
                >
                  How do I book a ride?
                </button>
              </h2>

              <div
                id="faq1"
                className="accordion-collapse collapse show"
                data-bs-parent="#faqAccordion"
              >
                <div className="accordion-body">
                  Login to SmartRide, enter your pickup and destination, select
                  a vehicle type and confirm your booking.
                </div>
              </div>
            </div>

            <div className="accordion-item">
              <h2 className="accordion-header">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#faq2"
                >
                  How can I become a SmartRide Driver?
                </button>
              </h2>

              <div
                id="faq2"
                className="accordion-collapse collapse"
                data-bs-parent="#faqAccordion"
              >
                <div className="accordion-body">
                  Register as a Driver, upload your driving license, complete
                  verification, and start accepting rides.
                </div>
              </div>
            </div>

            <div className="accordion-item">
              <h2 className="accordion-header">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#faq3"
                >
                  How can I cancel my booking?
                </button>
              </h2>

              <div
                id="faq3"
                className="accordion-collapse collapse"
                data-bs-parent="#faqAccordion"
              >
                <div className="accordion-body">
                  Open My Rides, select the active booking and click Cancel Ride
                  before the driver arrives.
                </div>
              </div>
            </div>

            <div className="accordion-item">
              <h2 className="accordion-header">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#faq4"
                >
                  How is ride fare calculated?
                </button>
              </h2>

              <div
                id="faq4"
                className="accordion-collapse collapse"
                data-bs-parent="#faqAccordion"
              >
                <div className="accordion-body">
                  Fare depends on distance, ride type, estimated travel time and
                  demand at the time of booking.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SmartRide AI Assistant — powered by Google Gemini via Spring AI */}

      <section
        className="py-5"
        style={{
          background: "#0F172A",
        }}
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <SmartRideAIChat />
            </div>
          </div>
        </div>
      </section>
      {/* Google Map */}

      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-dark">Find Us</h2>

            <p className="text-muted">Visit our SmartRide office in Pune.</p>
          </div>

          <div
            className="shadow-lg"
            style={{
              borderRadius: "20px",
              overflow: "hidden",
            }}
          >
            <div className="ratio ratio-21x9">
              <iframe
                title="SmartRide Location"
                src="https://www.google.com/maps?q=Pune,Maharashtra&output=embed"
                style={{
                  border: 0,
                }}
                loading="lazy"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action */}

      <section
        className="py-5"
        style={{
          background: "linear-gradient(135deg,#FF6B00,#FF8C42)",
          color: "#fff",
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
                Ready to Ride with SmartRide?
              </h2>

              <p
                className="lead mb-0"
                style={{
                  color: "#FFF3E8",
                }}
              >
                Fast. Safe. Affordable.
                <br />
                Book your ride today and travel with confidence.
              </p>
            </div>

            <div className="col-lg-4 text-center text-lg-end mt-4 mt-lg-0">
              <button
                className="btn btn-light btn-lg px-4 me-3"
                onClick={() => (window.location.href = "/book-ride")}
              >
                <i className="bi bi-car-front-fill me-2"></i>
                Book Ride
              </button>

              <button
                className="btn btn-outline-light btn-lg px-4"
                onClick={() => (window.location.href = "/register")}
              >
                <i className="bi bi-person-plus-fill me-2"></i>
                Register
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
