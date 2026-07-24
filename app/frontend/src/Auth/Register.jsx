import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../components/services/api";
import "../App.css";

const Register = () => {
  const navigate = useNavigate();
  const authState = useSelector((state) => state.auth);

  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      const r = authState.user.role || authState.user.roleName;
      const userRole = (r === 1 || r === "1" || r === "admin" || r === "ADMIN") ? 1
                     : (r === 2 || r === "2" || r === "driver" || r === "DRIVER") ? 2 : 3;

      if (userRole === 1) navigate("/admin", { replace: true });
      else if (userRole === 2) navigate("/driver", { replace: true });
      else navigate("/rider", { replace: true });
    }
  }, [authState, navigate]);

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
    licensePdf: null,
  });

  const [otpState, setOtpState] = useState({
    code: "",
    inputCode: "",
    isSent: false,
    isVerified: false,
    message: "",
    error: "",
  });

  const [licenseStatus, setLicenseStatus] = useState({
    verified: false,
    message: "",
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

  /* ---------------- Handle Files ---------------- */

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file && file.size > 5 * 1024 * 1024) {
      alert("Maximum profile photo size is 5 MB.");
      e.target.value = "";
      return;
    }

    setFormData({
      ...formData,
      profilePhoto: file,
    });
  };

  const handleLicensePdfChange = (e) => {
    const file = e.target.files[0];

    if (file && file.size > 10 * 1024 * 1024) {
      alert("Maximum license PDF size is 10 MB.");
      e.target.value = "";
      return;
    }

    setFormData({
      ...formData,
      licensePdf: file,
    });
  };

  /* ---------------- Send OTP via Fast2SMS (Backend) ---------------- */

  /* ---------------- Field Availability Blur Check ---------------- */

  const handleBlurField = async (field) => {
    if (field === "email" && formData.email) {
      const avail = await authApi.checkAvailability({ email: formData.email.trim() });
      if (avail && avail.emailExists) {
        alert(`⚠️ Email "${formData.email}" is already registered! Please enter a different email address or login.`);
        setFormData((prev) => ({ ...prev, email: "" }));
      }
    } else if (field === "username" && formData.username) {
      const avail = await authApi.checkAvailability({ username: formData.username.trim() });
      if (avail && avail.usernameExists) {
        alert(`⚠️ Username "${formData.username}" is already taken! Please choose a different username.`);
        setFormData((prev) => ({ ...prev, username: "" }));
      }
    }
  };

  /* ---------------- Send OTP via Backend (With Duplicate Check) ---------------- */

  const handleSendOtp = async () => {
    const cleanPhone = formData.phone ? formData.phone.replace(/[^0-9]/g, "") : "";
    if (!cleanPhone || cleanPhone.length !== 10) {
      setOtpState((prev) => ({ ...prev, error: "Please enter a valid 10-digit mobile number.", message: "" }));
      return;
    }

    setOtpState((prev) => ({ ...prev, error: "", message: "Checking mobile number availability..." }));

    try {
      // 1. Check if phone is already registered BEFORE sending OTP
      const avail = await authApi.checkAvailability({ phone: cleanPhone });
      if (avail && avail.phoneExists) {
        alert(`⚠️ Mobile number +91${cleanPhone} is already registered! Please enter a different number or login.`);
        setFormData((prev) => ({ ...prev, phone: "" }));
        setOtpState({ code: "", inputCode: "", isSent: false, isVerified: false, message: "", error: "" });
        return;
      }

      setOtpState((prev) => ({ ...prev, message: "Sending OTP..." }));
      const result = await authApi.sendOtp(cleanPhone);
      console.log("[OTP Service] Result:", result);

      setOtpState({
        code: "",
        inputCode: "",
        isSent: true,
        isVerified: false,
        message: `📲 OTP sent to +91${cleanPhone}! Check your phone for the 6-digit SMS.`,
        error: "",
      });
    } catch (err) {
      console.error("[OTP Service] Send OTP error:", err);
      if (err.message && err.message.toLowerCase().includes("already registered")) {
        alert(`⚠️ Mobile number +91${cleanPhone} is already registered! Please enter a different number or login.`);
        setFormData((prev) => ({ ...prev, phone: "" }));
      }
      setOtpState({
        code: "",
        inputCode: "",
        isSent: false,
        isVerified: false,
        message: "",
        error: err.message || "Failed to send OTP. Please try again.",
      });
    }
  };

  /* ---------------- Verify OTP via Backend ---------------- */

  const handleVerifyOtp = async () => {
    const codeToVerify = otpState.inputCode;

    if (!codeToVerify || codeToVerify.length !== 6) {
      setOtpState((prev) => ({ ...prev, error: "Please enter the complete 6-digit code from your SMS.", message: "" }));
      return;
    }

    try {
      const result = await authApi.verifyOtp(formData.phone, codeToVerify);
      console.log("[OTP Service] Verify OTP result:", result);

      setOtpState((prev) => ({
        ...prev,
        isVerified: true,
        message: "✅ Mobile Number Verified Successfully!",
        error: "",
      }));
    } catch (err) {
      console.error("[OTP Service] Verify OTP error:", err);
      setOtpState((prev) => ({
        ...prev,
        error: err.message || "Incorrect OTP. Please check the SMS on your phone and try again.",
        message: "",
      }));
    }
  };

  /* ---------------- Verify License (With Duplicate Check) ---------------- */

  const handleVerifyLicense = async () => {
    if (!formData.licenseNumber) {
      setLicenseStatus({ verified: false, message: "Please enter your Driving License Number first." });
      return;
    }

    if (!formData.licensePdf) {
      setLicenseStatus({ verified: false, message: "Please upload your Driving License Document (Image/PDF) for manual verification." });
      return;
    }

    try {
      const avail = await authApi.checkAvailability({ licenseNo: formData.licenseNumber.trim() });
      if (avail && avail.licenseExists) {
        alert(`⚠️ Driving License Number "${formData.licenseNumber}" is already registered with another driver account!`);
        setFormData((prev) => ({ ...prev, licenseNumber: "", licensePdf: null }));
        setLicenseStatus({ verified: false, message: "" });
        return;
      }

      setLicenseStatus({
        verified: true,
        message: "📄 License Document attached successfully! Manual verification will be completed by the Admin upon registration.",
      });
    } catch (e) {
      setLicenseStatus({
        verified: true,
        message: "📄 License Document attached successfully! Manual verification will be completed by the Admin upon registration.",
      });
    }
  };

  /* ---------------- Submit Registration ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otpState.isVerified) {
      alert("Please verify your mobile number via OTP first.");
      return;
    }

    if (!formData.profilePhoto) {
      alert("Please upload your Profile Photo.");
      return;
    }

    if (formData.role === "driver" && !formData.licenseNumber) {
      alert("Please provide your Driver License Number.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload Profile Photo to Firebase Cloud Storage
      const profilePhotoUrl = await authApi.uploadFile(formData.profilePhoto, "profile_photos");

      // 2. Upload Driver License PDF to Firebase Cloud Storage (if Driver)
      let licensePdfUrl = null;
      if (formData.role === "driver" && formData.licensePdf) {
        licensePdfUrl = await authApi.uploadFile(formData.licensePdf, "license_pdfs");
      }

      // 3. Register user with Spring Boot backend
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
        profile_image: profilePhotoUrl,
        license_no: formData.role === "driver" ? formData.licenseNumber : null,
        licensePdfUrl: licensePdfUrl,
      };

      const response = await authApi.register(finalData);

      if (response.userId || response.message) {
        alert(response.message || "Registration Successful! Please Login.");
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Registration Failed.");
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
                  {/* Invisible Firebase Recaptcha Container */}
                  <div id="recaptcha-container"></div>
                  {/* Role */}

                  <div className="mb-4">
                    <label htmlFor="role" className="form-label fw-semibold">
                      Register As
                    </label>

                    <select
                      id="role"
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
                    <label htmlFor="profilePhoto" className="form-label fw-semibold">
                      Profile Photo
                    </label>

                    <input
                      id="profilePhoto"
                      name="profilePhoto"
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
                      <label htmlFor="reg_username" className="form-label fw-semibold">Username</label>

                      <input
                        id="reg_username"
                        type="text"
                        autoComplete="username"
                        className="form-control"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        onBlur={() => handleBlurField("username")}
                        placeholder="Enter Username"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="reg_email" className="form-label fw-semibold">
                        Email Address (Optional)
                      </label>

                      <input
                        id="reg_email"
                        type="email"
                        autoComplete="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={() => handleBlurField("email")}
                        placeholder="Enter Email (Optional)"
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="reg_password" className="form-label fw-semibold">Password</label>

                      <input
                        id="reg_password"
                        type="password"
                        autoComplete="new-password"
                        className="form-control"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter Password"
                        required
                      />
                    </div>

                    {/* Mobile Number */}

                    <div className="col-md-6">
                      <label htmlFor="reg_phone" className="form-label fw-semibold">
                        Mobile Number
                      </label>

                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="bi bi-phone-fill"></i>
                        </span>

                        <input
                          id="reg_phone"
                          type="text"
                          autoComplete="tel"
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
                            {otpState.isSent ? "Resend OTP" : "Send OTP"}
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

                    {/* OTP Code Entry Card (Renders when OTP is sent & not yet verified) */}
                    {otpState.isSent && !otpState.isVerified && (
                      <div className="col-12">
                        <div
                          className="p-3"
                          style={{
                            background: "#EFF6FF",
                            border: "1px solid #BFDBFE",
                            borderRadius: "12px",
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <label htmlFor="reg_otpCode" className="form-label fw-semibold mb-0 text-primary">
                              <i className="bi bi-shield-lock-fill me-1"></i>
                              Enter 6-Digit SMS Verification Code
                            </label>
                          </div>

                          <div className="input-group">
                            <input
                              id="reg_otpCode"
                              name="otpCode"
                              type="text"
                              maxLength={6}
                              className="form-control"
                              placeholder="Enter 6-digit SMS code"
                              value={otpState.inputCode || ""}
                              onChange={(e) => setOtpState({ ...otpState, inputCode: e.target.value, error: "" })}
                            />

                            <button
                              type="button"
                              className="btn btn-success"
                              onClick={handleVerifyOtp}
                            >
                              <i className="bi bi-check-circle-fill me-1"></i>
                              Verify OTP
                            </button>
                          </div>

                          {otpState.message && (
                            <div className="alert alert-info mt-2 mb-0 py-2 fs-7" role="alert">
                              <i className="bi bi-info-circle-fill me-1"></i>
                              {otpState.message}
                            </div>
                          )}

                          {otpState.error && (
                            <div className="alert alert-danger mt-2 mb-0 py-2 fs-7" role="alert">
                              <i className="bi bi-exclamation-triangle-fill me-1"></i>
                              {otpState.error}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Date of Birth */}

                    <div className="col-md-6">
                      <label htmlFor="reg_dob" className="form-label fw-semibold">
                        Date of Birth
                      </label>

                      <input
                        id="reg_dob"
                        type="date"
                        autoComplete="bday"
                        className="form-control"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* Gender */}

                    <div className="col-md-6">
                      <label htmlFor="reg_gender" className="form-label fw-semibold">Gender</label>

                      <select
                        id="reg_gender"
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
                      <label htmlFor="reg_address" className="form-label fw-semibold">Address</label>

                      <textarea
                        id="reg_address"
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
                      <label htmlFor="reg_emergencyContact" className="form-label fw-semibold">
                        Emergency Contact
                      </label>

                      <input
                        id="reg_emergencyContact"
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
                          <label htmlFor="reg_licenseNumber" className="form-label fw-semibold text-secondary">
                            Driving License Number
                          </label>

                          <input
                            id="reg_licenseNumber"
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
                          <label htmlFor="reg_licensePdf" className="form-label fw-semibold text-secondary">
                            Upload Driving License (PDF / Image)
                          </label>

                          <input
                            id="reg_licensePdf"
                            name="licensePdf"
                            type="file"
                            className="form-control"
                            accept="image/*,.pdf"
                            onChange={handleLicensePdfChange}
                            required={formData.role === "driver"}
                          />
                        </div>

                        {/* Verify Button */}

                        <div className="col-md-4 d-grid">
                          <label className="form-label">&nbsp;</label>

                          <button
                            type="button"
                            className={`btn ${licenseStatus.verified ? "btn-success" : "btn-primary"}`}
                            onClick={handleVerifyLicense}
                          >
                            <i className={`bi ${licenseStatus.verified ? "bi-check-circle-fill" : "bi-file-earmark-check-fill"} me-2`}></i>
                            {licenseStatus.verified ? "Document Attached" : "Submit Document"}
                          </button>
                        </div>
                      </div>

                      {/* Verification Status */}

                      {licenseStatus.message ? (
                        <div
                          className={`alert ${licenseStatus.verified ? "alert-success" : "alert-danger"} mt-4 mb-0`}
                          role="alert"
                        >
                          <i className={`bi ${licenseStatus.verified ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"} me-2`}></i>
                          {licenseStatus.message}
                        </div>
                      ) : (
                        <div
                          className="alert alert-warning mt-4 mb-0"
                          role="alert"
                        >
                          <i className="bi bi-info-circle-fill me-2"></i>
                          License verification is required before becoming an
                          active SmartRide Driver.
                        </div>
                      )}
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
