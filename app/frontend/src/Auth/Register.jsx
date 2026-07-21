import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../components/services/api";
import "../App.css";

const Register = () => {
  const [formData, setFormData] = useState({
    role: "rider",
    username: "",
    password: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    address: "",
    emergencyContact: "",
    licenseNumber: "",
    vehicleDetails: "",
    profilePhoto: null,
  });

  const [otpState, setOtpState] = useState({
    code: "",
    isSent: false,
    isVerified: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ---------------- Handle Input ---------------- */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  /* ---------------- Handle File ---------------- */

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file && file.size > 5 * 1024 * 1024) {
      alert("Maximum file size is 5 MB.");
      e.target.value = "";
      return;
    }

    setFormData({
      ...formData,
      profilePhoto: file,
    });
  };

  /* ---------------- Send OTP ---------------- */

  const handleSendOtp = async () => {
    if (formData.phone.length !== 10) {
      alert("Enter a valid 10-digit mobile number.");
      return;
    }

    await authApi.sendOtp(formData.phone);

    setOtpState({
      ...otpState,
      isSent: true,
    });

    alert("OTP sent successfully.");
  };

  /* ---------------- Verify OTP ---------------- */

  const handleVerifyOtp = async () => {
    const response = await authApi.verifyOtp(formData.phone, otpState.code);

    if (response.success) {
      setOtpState({
        ...otpState,
        isVerified: true,
      });

      alert("Phone Number Verified Successfully.");
    } else {
      alert("Invalid OTP.");
    }
  };

  /* ---------------- Submit ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otpState.isVerified) {
      alert("Please verify your mobile number.");
      return;
    }

    if (!formData.profilePhoto) {
      alert("Upload Profile Photo.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { uploadUrl, fileUrl } = await authApi.getSignedUrl(
        formData.profilePhoto.name,
      );

      console.log(uploadUrl);

      const finalData = {
        role: formData.role,
        username: formData.username,
        password: formData.password,
        email: formData.email,
        phone: formData.phone,
        dob: formData.dob,
        gender: formData.gender,
        address: formData.address,
        emergency_contact: formData.emergencyContact,
        profile_image: fileUrl,
        license_no: formData.role === "driver" ? formData.licenseNumber : null,
      };

      const response = await authApi.register(finalData);

      if (response.success) {
        alert("Registration Successful.");
      }
    } catch (err) {
      console.error(err);
      alert("Registration Failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="container-fluid d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#F8FAFC 0%,#FFF5ED 100%)",
        padding: "50px 15px",
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-9 col-xl-8">
            <div
              className="card border-0 shadow-lg"
              style={{
                borderRadius: "20px",
                overflow: "hidden",
              }}
            >
              {/* Header */}

              <div
                className="text-center py-4"
                style={{
                  background: "var(--primary)",
                  color: "#fff",
                }}
              >
                <i
                  className="bi bi-car-front-fill"
                  style={{
                    fontSize: "3.2rem",
                  }}
                ></i>

                <h2
                  className="fw-bold mt-3 mb-2"
                  style={{
                    color: "#fff",
                  }}
                >
                  SmartRide
                </h2>

                <p
                  style={{
                    color: "rgba(255,255,255,.9)",
                  }}
                >
                  Create your SmartRide Account
                </p>
              </div>

              {/* Card Body */}

              <div className="card-body p-4 p-lg-5">
                <form onSubmit={handleSubmit}>
                  {/* Role */}

                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      Register As
                    </label>

                    <select
                      className="form-select"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="rider">Rider</option>

                      <option value="driver">Driver</option>
                    </select>
                  </div>

                  {/* Profile Photo */}

                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      Profile Photo
                    </label>

                    <input
                      type="file"
                      className="form-control"
                      accept="image/png,image/jpeg"
                      onChange={handleFileChange}
                      required
                    />
                  </div>

                  {/* User Details */}

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Username</label>

                      <input
                        type="text"
                        className="form-control"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Enter Username"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Email Address
                      </label>

                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter Email"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Password</label>

                      <input
                        type="password"
                        className="form-control"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter Password"
                        required
                      />

                      {/* </div> */}
                    </div>

                    {/* Mobile Number */}

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Mobile Number
                      </label>

                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="bi bi-phone-fill"></i>
                        </span>

                        <input
                          type="text"
                          className="form-control"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Enter Mobile Number"
                          maxLength={10}
                          required
                        />

                        {!otpState.isVerified ? (
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleSendOtp}
                          >
                            Send OTP
                          </button>
                        ) : (
                          <span
                            className="input-group-text"
                            style={{
                              background: "#22C55E",
                              color: "#fff",
                              fontWeight: "600",
                            }}
                          >
                            <i className="bi bi-check-circle-fill me-1"></i>
                            Verified
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Date of Birth */}

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Date of Birth
                      </label>

                      <input
                        type="date"
                        className="form-control"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* Gender */}

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Gender</label>

                      <select
                        className="form-select"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Gender</option>

                        <option value="Male">Male</option>

                        <option value="Female">Female</option>

                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Address */}

                    <div className="col-12">
                      <label className="form-label fw-semibold">Address</label>

                      <textarea
                        className="form-control"
                        rows="3"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter Full Address"
                        style={{
                          height: "110px",
                          resize: "none",
                        }}
                        required
                      ></textarea>
                    </div>

                    {/* Emergency Contact */}

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Emergency Contact
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleChange}
                        placeholder="Emergency Contact Number"
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>

                  {/* OTP Verification Section */}

                  {otpState.isSent && !otpState.isVerified && (
                    <div
                      className="mt-4 p-4"
                      style={{
                        background: "#FFF7ED",
                        border: "1px solid #FED7AA",
                        borderRadius: "15px",
                      }}
                    >
                      <h5
                        className="fw-bold mb-3"
                        style={{
                          color: "var(--primary)",
                        }}
                      >
                        Verify Mobile Number
                      </h5>

                      <div className="row align-items-end">
                        <div className="col-md-8">
                          <label className="form-label">Enter OTP</label>

                          <input
                            type="text"
                            className="form-control"
                            value={otpState.code}
                            onChange={(e) =>
                              setOtpState({
                                ...otpState,
                                code: e.target.value,
                              })
                            }
                            placeholder="Enter 6-digit OTP"
                          />
                        </div>

                        <div className="col-md-4 d-grid">
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleVerifyOtp}
                          >
                            Verify OTP
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Driver Details */}

                  {formData.role === "driver" && (
                    <div
                      className="mt-4 p-4"
                      style={{
                        background: "#FFF7ED",
                        border: "1px solid #FED7AA",
                        borderRadius: "15px",
                      }}
                    >
                      <h5
                        className="fw-bold mb-4"
                        style={{
                          color: "var(--primary)",
                        }}
                      >
                        Driver Verification
                      </h5>

                      <div className="row g-3">
                        {/* License Number */}

                        <div className="col-md-6">
                          <label className="form-label fw-semibold text-secondary">
                            Driving License Number
                          </label>

                          <input
                            type="text"
                            className="form-control"
                            name="licenseNumber"
                            value={formData.licenseNumber}
                            onChange={handleChange}
                            placeholder="Enter License Number"
                            required={formData.role === "driver"}
                          />
                        </div>

                        {/* Vehicle Details */}

                        <div className="col-md-6">
                          <label className="form-label fw-semibold text-secondary">
                            Vehicle Details
                          </label>

                          <input
                            type="text"
                            className="form-control"
                            name="vehicleDetails"
                            value={formData.vehicleDetails}
                            onChange={handleChange}
                            placeholder="Example: Swift Dzire MH12AB1234"
                            required={formData.role === "driver"}
                          />
                        </div>

                        {/* Upload License */}

                        <div className="col-md-8">
                          <label className="form-label fw-semibold text-secondary">
                            Upload Driving License
                          </label>

                          <input
                            type="file"
                            className="form-control"
                            accept="image/*,.pdf"
                            required={formData.role === "driver"}
                          />
                        </div>

                        {/* Verify Button */}

                        <div className="col-md-4 d-grid">
                          <label className="form-label">&nbsp;</label>

                          <button type="button" className="btn btn-primary">
                            <i className="bi bi-shield-check me-2"></i>
                            Verify License
                          </button>
                        </div>
                      </div>

                      {/* Verification Status */}

                      <div
                        className="alert alert-warning mt-4 mb-0"
                        role="alert"
                      >
                        <i className="bi bi-info-circle-fill me-2"></i>
                        License verification is required before becoming an
                        active SmartRide Driver.
                      </div>
                    </div>
                  )}

                  {/* Terms */}

                  <div className="form-check mt-4">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="terms"
                      required
                    />

                    <label className="form-check-label" htmlFor="terms">
                      I agree to the
                      <Link
                        to="/terms"
                        className="ms-1 me-1"
                        style={{
                          color: "var(--primary)",
                          fontWeight: "600",
                        }}
                      >
                        Terms & Conditions
                      </Link>
                      and
                      <Link
                        to="/privacy"
                        className="ms-1"
                        style={{
                          color: "var(--primary)",
                          fontWeight: "600",
                        }}
                      >
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                  {/* Register Button */}

                  <div className="d-grid mt-4">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting}
                      style={{
                        height: "55px",
                        fontSize: "17px",
                        fontWeight: "600",
                        borderRadius: "12px",
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          ></span>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-person-plus-fill me-2"></i>
                          Register Now
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Divider */}

                <div className="d-flex align-items-center my-4">
                  <hr className="flex-grow-1" />

                  <span
                    className="mx-3"
                    style={{
                      color: "#6B7280",
                      fontWeight: "600",
                    }}
                  >
                    OR
                  </span>

                  <hr className="flex-grow-1" />
                </div>

                {/* Login Link */}

                <div className="text-center">
                  <span
                    style={{
                      color: "var(--text)",
                    }}
                  >
                    Already have an account?
                  </span>

                  <Link
                    to="/login"
                    style={{
                      color: "var(--primary)",
                      marginLeft: "8px",
                      textDecoration: "none",
                      fontWeight: "700",
                    }}
                  >
                    Login
                  </Link>
                </div>

                {/* Help Text */}

                <div
                  className="text-center mt-4"
                  style={{
                    color: "#6B7280",
                    fontSize: "14px",
                  }}
                >
                  By registering, you agree to SmartRide's policies and
                  verification process. Rider accounts are activated after
                  mobile verification. Driver accounts require license
                  verification before accepting rides.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
