import { NavLink, Outlet } from "react-router-dom";
import React from "react";
import { Link } from "react-router-dom";
import rb2 from '../assets/rb2.png';

export default function Home() {
    return (
        <>
        <div className="container mt-4">

    <div className="home">
      {/* Hero Section */}
      <section className="text-center py-5 bg-light">
        <div className="container my-5">
  <div className="row align-items-center">
    {/* Left Column: Hero Image */}
    <div className="col-lg-6 text-center mb-4 mb-lg-0">
      <img
        src={rb2}
        alt="Ride Booking Hero"
         className="img-fluid w-100 opacity-70 shadow rounded "
        style={{ maxHeight: "450px", objectFit: "contain" }}
      />
    </div>

    {/* Right Column: Text Content */}
    <div className="col-lg-6 ps-lg-5">
      <h1 className="display-4 fw-bold">Ride With Confidence & Comfort</h1>
      <p className="lead mt-3">
        Book your ride in seconds. Experience premium transportation services
        with verified drivers and real-time tracking.
      </p>
      <div className="d-flex justify-content-center gap-2 mt-4">
        <Link to="/register" className="btn btn-primary btn-lg px-4">
          Book Now
        </Link>
        <Link to="/about" className="btn btn-outline-secondary btn-lg px-4">
          About Us
        </Link>
      </div>
    </div>
  </div>
</div>
        <div className="row mt-5">
          <div className="col-md-4">
            <h4>10K+</h4>
            <p>Happy Riders</p>
          </div>
          <div className="col-md-4">
            <h4>500+</h4>
            <p>Verified Drivers</p>
          </div>
          <div className="col-md-4">
            <h4>50+</h4>
            <p>Cities</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-5">
        <h2 className="text-center mb-4">How It Works</h2>
        <div className="row text-center">
          <div className="col-md-3">
            <h5>1. Set Your Location</h5>
            <p>Enter pickup and drop-off with smart detection.</p>
          </div>
          <div className="col-md-3">
            <h5>2. Choose Your Ride</h5>
            <p>Select from various vehicle types.</p>
          </div>
          <div className="col-md-3">
            <h5>3. Pay Securely</h5>
            <p>Cash, card, and mobile payments available.</p>
          </div>
          <div className="col-md-3">
            <h5>4. Rate Your Experience</h5>
            <p>Share feedback to improve our services.</p>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-5 bg-light">
        <h2 className="text-center mb-4">Why Choose Us</h2>
        <div className="row text-center">
          <div className="col-md-3">
            <h5>Safe & Secure</h5>
            <p>Verified drivers, background checks, real-time tracking.</p>
          </div>
          <div className="col-md-3">
            <h5>Quick Pickup</h5>
            <p>Average pickup time under 5 minutes.</p>
          </div>
          <div className="col-md-3">
            <h5>Best Prices</h5>
            <p>No hidden charges, upfront fare estimates.</p>
          </div>
          <div className="col-md-3">
            <h5>24/7 Support</h5>
            <p>Round-the-clock customer assistance.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-5">
        <h2 className="text-center mb-4">What Our Customers Say</h2>
        <div className="row text-center">
          <div className="col-md-4">
            <blockquote className="blockquote">
              “The best ride booking app I’ve used! Drivers are professional and
              vehicles are clean.”
              <footer className="blockquote-footer pt-4 align-content-end">Dhananjay korde</footer>
            </blockquote>
          </div>
          <div className="col-md-4">
            <blockquote className="blockquote">
              “Perfect for my business trips. Reliable service and great
              support.”
              <footer className="blockquote-footer pt-4 align-content-end">Raj Sharma</footer>
            </blockquote>
          </div>
          <div className="col-md-4">
            <blockquote className="blockquote">
              “Affordable prices and quick service. Love the real-time tracking
              feature!”
              <footer className="blockquote-footer pt-4 align-content-end">manish zade</footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Special Offers */}
      <section className="py-5 bg-warning bg-opacity-25">
        <h2 className="text-center mb-4">Special Offers & Promotions</h2>
        <div className="row text-center">
          <div className="col-md-4">
            <h5>First Ride Free</h5>
            <p>Use code: <strong>WELCOME100</strong></p>
          </div>
          <div className="col-md-4">
            <h5>Weekend Special</h5>
            <p>50% off rides. Code: <strong>WEEKEND50</strong></p>
          </div>
          <div className="col-md-4">
            <h5>Flash Sale</h5>
            <p>30% off premium rides. Code: <strong>FLASH30</strong></p>
          </div>
        </div>
      </section>

      {/* App Download */}
      <section className="py-5 text-center">
        <h2 className="mb-3">Ready to Start Your Journey?</h2>
        <p>Download our app now and get 50% off your first ride!</p>
        <img
          src="#"
          alt="App Preview"
          className="img-fluid rounded shadow my-4"
        />
        <div>
          <a href="#" className="btn btn-primary me-2">
            App Store
          </a>
          <a href="#" className="btn btn-outline-secondary">
            Google Play
          </a>
        </div>
      </section>
    </div>
        </div>
     

        </>
    );
}