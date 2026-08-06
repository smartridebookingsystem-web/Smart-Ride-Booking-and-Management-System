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
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  /* ---------------- Client-Side Validation Rules ---------------- */

  const validateField = (name, value, allData = formData) => {
    let error = "";

    switch (name) {
      case "username":
        if (!value || !value.trim()) {
          error = "Username is required.";
        } else if (value.trim().length < 3) {
          error = "Username must be at least 3 characters.";
        } else if (value.trim().length > 20) {
          error = "Username cannot exceed 20 characters.";
        } else if (!/^[a-zA-Z0-9_]+$/.test(value.trim())) {
          error = "Username can only contain letters, numbers, and underscores.";
        }
        break;

      case "email":
        if (value && value.trim()) {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
            error = "Please enter a valid email address (e.g. user@example.com).";
          }
        }
        break;

      case "password":
        if (!value) {
          error = "Password is required.";
        } else if (value.length < 6) {
          error = "Password must be at least 6 characters long.";
        }
        break;

      case "phone":
        const cleanPhone = value ? value.replace(/[^0-9]/g, "") : "";
        if (!cleanPhone) {
          error = "Mobile number is required.";
        } else if (cleanPhone.length !== 10) {
          error = "Mobile number must be exactly 10 digits.";
        } else if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
          error = "Mobile number must start with 6, 7, 8, or 9.";
        }
        break;

      case "dob":
        if (!value) {
          error = "Date of Birth is required.";
        } else {
          const dobDate = new Date(value);
          const today = new Date();
          let age = today.getFullYear() - dobDate.getFullYear();
          const monthDiff = today.getMonth() - dobDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
            age--;
          }
          if (dobDate > today) {
            error = "Date of birth cannot be in the future.";
          } else if (age < 18) {
            error = "You must be at least 18 years old to register.";
          }
        }
        break;

      case "gender":
        if (!value) {
          error = "Please select your gender.";
        }
        break;

      case "address":
        if (!value || !value.trim()) {
          error = "Address is required.";
        } else if (value.trim().length < 10) {
          error = "Address must be at least 10 characters long.";
        }
        break;

      case "emergencyContact":
        const cleanEm = value ? value.replace(/[^0-9]/g, "") : "";
        const userPhone = allData.phone ? allData.phone.replace(/[^0-9]/g, "") : "";
        if (!cleanEm) {
          error = "Emergency contact number is required.";
        } else if (cleanEm.length !== 10) {
          error = "Emergency contact must be a 10-digit mobile number.";
        } else if (!/^[6-9]\d{9}$/.test(cleanEm)) {
          error = "Emergency contact must start with 6, 7, 8, or 9.";
        } else if (userPhone && cleanEm === userPhone) {
          error = "Emergency contact must be different from your mobile number.";
        }
        break;

      case "licenseNumber":
        if (allData.role === "driver") {
          if (!value || !value.trim()) {
            error = "Driving License Number is required for Drivers.";
          } else if (value.trim().length < 6) {
            error = "Please enter a valid Driving License Number (min 6 characters).";
          }
        }
        break;

      case "vehicleDetails":
        if (allData.role === "driver") {
          if (!value || !value.trim()) {
            error = "Vehicle details are required for Drivers.";
          } else if (value.trim().length < 5) {
            error = "Please enter complete vehicle details (e.g. Swift Dzire MH12AB1234).";
          }
        }
        break;

      default:
        break;
    }

    return error;
  };

  const validateForm = () => {
    const newErrors = {};
    const fieldsToValidate = ["username", "email", "password", "phone", "dob", "gender", "address", "emergencyContact"];
    if (formData.role === "driver") {
      fieldsToValidate.push("licenseNumber", "vehicleDetails");
    }

    fieldsToValidate.forEach((field) => {
      const err = validateField(field, formData[field], formData);
      if (err) newErrors[field] = err;
    });

    if (!formData.profilePhoto) {
      newErrors.profilePhoto = "Profile photo is required.";
    }

    if (formData.role === "driver" && !formData.licensePdf) {
      newErrors.licensePdf = "Driving License document is required for Drivers.";
    }

    // Mark all as touched
    const allTouched = {};
    fieldsToValidate.forEach((f) => (allTouched[f] = true));
    allTouched.profilePhoto = true;
    if (formData.role === "driver") allTouched.licensePdf = true;

    setTouched(allTouched);
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- Handle Input ---------------- */

  const handleChange = (e) => {
    const { name, value } = e.target;

    const updatedFormData = {
      ...formData,
      [name]: value,
    };

    setFormData(updatedFormData);

    if (touched[name]) {
      const fieldError = validateField(name, value, updatedFormData);
      setErrors((prev) => ({
        ...prev,
        [name]: fieldError,
      }));
    }
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
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, formData[field], formData);
    setErrors((prev) => ({ ...prev, [field]: err }));

    if (!err) {
      if (field === "email" && formData.email) {
        const avail = await authApi.checkAvailability({ email: formData.email.trim() });
        if (avail && avail.emailExists) {
          setErrors((prev) => ({ ...prev, email: `Email "${formData.email}" is already registered!` }));
        }
      } else if (field === "username" && formData.username) {
        const avail = await authApi.checkAvailability({ username: formData.username.trim() });
        if (avail && avail.usernameExists) {
          setErrors((prev) => ({ ...prev, username: `Username "${formData.username}" is already taken!` }));
        }
      } else if (field === "phone" && formData.phone) {
        const cleanP = formData.phone.replace(/[^0-9]/g, "");
        if (cleanP.length === 10) {
          const avail = await authApi.checkAvailability({ phone: cleanP });
          if (avail && avail.phoneExists) {
            setErrors((prev) => ({ ...prev, phone: `Mobile number +91${cleanP} is already registered!` }));
          }
        }
      }
    }
  };

  /* ---------------- Send OTP via Backend (With Duplicate Check) ---------------- */

  const handleSendOtp = async () => {
    setTouched((prev) => ({ ...prev, phone: true }));
    const phoneErr = validateField("phone", formData.phone, formData);
    if (phoneErr) {
      setErrors((prev) => ({ ...prev, phone: phoneErr }));
      setOtpState((prev) => ({ ...prev, error: phoneErr, message: "" }));
      return;
    }

    const cleanPhone = formData.phone ? formData.phone.replace(/[^0-9]/g, "") : "";
    if (!cleanPhone || cleanPhone.length !== 10) {
      setOtpState((prev) => ({ ...prev, error: "Please enter a valid 10-digit mobile number.", message: "" }));
      return;
    }

    setOtpState((prev) => ({ ...prev, error: "", message: "Checking if mobile number is already registered..." }));

    try {
      // 1. Check if phone is already registered BEFORE sending OTP
      const avail = await authApi.checkAvailability({ phone: cleanPhone });
      if (avail && avail.phoneExists) {
        const errMsg = `⚠️ Mobile number +91${cleanPhone} is already registered! Please login instead.`;
        setErrors((prev) => ({ ...prev, phone: errMsg }));
        setOtpState({
          code: "",
          inputCode: "",
          isSent: false,
          isVerified: false,
          message: "",
          error: errMsg,
        });
        return; // STOP! Do NOT send OTP if user is already registered!
      }

      // 2. Mobile number is available -> Send OTP
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
        setErrors((prev) => ({ ...prev, phone: `Mobile number +91${cleanPhone} is already registered!` }));
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
    setTouched((prev) => ({ ...prev, licenseNumber: true, licensePdf: true }));
    const licErr = validateField("licenseNumber", formData.licenseNumber, formData);
    if (licErr) {
      setErrors((prev) => ({ ...prev, licenseNumber: licErr }));
      setLicenseStatus({ verified: false, message: licErr });
      return;
    }

    if (!formData.licensePdf) {
      setErrors((prev) => ({ ...prev, licensePdf: "Please upload your Driving License Document (Image/PDF)." }));
      setLicenseStatus({ verified: false, message: "Please upload your Driving License Document (Image/PDF) for manual verification." });
      return;
    }

    try {
      const avail = await authApi.checkAvailability({ licenseNo: formData.licenseNumber.trim() });
      if (avail && avail.licenseExists) {
        setErrors((prev) => ({ ...prev, licenseNumber: `License Number "${formData.licenseNumber}" is already registered!` }));
        setLicenseStatus({ verified: false, message: `Driving License Number "${formData.licenseNumber}" is already registered with another driver account!` });
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

    const isValid = validateForm();
    if (!isValid) {
      alert("Please correct the validation errors in the form before submitting.");
      return;
    }

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
                      className={`form-control ${touched.profilePhoto && errors.profilePhoto ? "is-invalid" : touched.profilePhoto && !errors.profilePhoto ? "is-valid" : ""}`}
                      accept="image/png,image/jpeg"
                      onChange={handleFileChange}
                      required
                    />
                    {touched.profilePhoto && errors.profilePhoto && (
                      <div className="invalid-feedback d-block mt-1">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.profilePhoto}
                      </div>
                    )}
                  </div>

                  {/* User Details */}

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="reg_username" className="form-label fw-semibold">Username</label>

                      <input
                        id="reg_username"
                        type="text"
                        autoComplete="username"
                        className={`form-control ${touched.username && errors.username ? "is-invalid" : touched.username && !errors.username ? "is-valid" : ""}`}
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        onBlur={() => handleBlurField("username")}
                        placeholder="Enter Username"
                        required
                      />
                      {touched.username && errors.username && (
                        <div className="invalid-feedback d-block mt-1">
                          <i className="bi bi-exclamation-circle me-1"></i>
                          {errors.username}
                        </div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="reg_email" className="form-label fw-semibold">
                        Email Address (Optional)
                      </label>

                      <input
                        id="reg_email"
                        type="email"
                        autoComplete="email"
                        className={`form-control ${touched.email && errors.email ? "is-invalid" : touched.email && !errors.email && formData.email ? "is-valid" : ""}`}
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={() => handleBlurField("email")}
                        placeholder="Enter Email (Optional)"
                      />
                      {touched.email && errors.email && (
                        <div className="invalid-feedback d-block mt-1">
                          <i className="bi bi-exclamation-circle me-1"></i>
                          {errors.email}
                        </div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="reg_password" className="form-label fw-semibold">Password</label>

                      <input
                        id="reg_password"
                        type="password"
                        autoComplete="new-password"
                        className={`form-control ${touched.password && errors.password ? "is-invalid" : touched.password && !errors.password ? "is-valid" : ""}`}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={() => handleBlurField("password")}
                        placeholder="Enter Password (min 6 chars)"
                        required
                      />
                      {touched.password && errors.password && (
                        <div className="invalid-feedback d-block mt-1">
                          <i className="bi bi-exclamation-circle me-1"></i>
                          {errors.password}
                        </div>
                      )}
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
                          className={`form-control ${touched.phone && errors.phone ? "is-invalid" : touched.phone && !errors.phone ? "is-valid" : ""}`}
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          onBlur={() => handleBlurField("phone")}
                          placeholder="10-digit mobile number"
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
                      {touched.phone && errors.phone && (
                        <div className="invalid-feedback d-block mt-1">
                          <i className="bi bi-exclamation-circle me-1"></i>
                          {errors.phone}
                        </div>
                      )}
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
                        className={`form-control ${touched.dob && errors.dob ? "is-invalid" : touched.dob && !errors.dob ? "is-valid" : ""}`}
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        onBlur={() => handleBlurField("dob")}
                        required
                      />
                      {touched.dob && errors.dob && (
                        <div className="invalid-feedback d-block mt-1">
                          <i className="bi bi-exclamation-circle me-1"></i>
                          {errors.dob}
                        </div>
                      )}
                    </div>

                    {/* Gender */}

                    <div className="col-md-6">
                      <label htmlFor="reg_gender" className="form-label fw-semibold">Gender</label>

                      <select
                        id="reg_gender"
                        className={`form-select ${touched.gender && errors.gender ? "is-invalid" : touched.gender && !errors.gender ? "is-valid" : ""}`}
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        onBlur={() => handleBlurField("gender")}
                        required
                      >
                        <option value="">Select Gender</option>

                        <option value="Male">Male</option>

                        <option value="Female">Female</option>

                        <option value="Other">Other</option>
                      </select>
                      {touched.gender && errors.gender && (
                        <div className="invalid-feedback d-block mt-1">
                          <i className="bi bi-exclamation-circle me-1"></i>
                          {errors.gender}
                        </div>
                      )}
                    </div>

                    {/* Address */}

                    <div className="col-12">
                      <label htmlFor="reg_address" className="form-label fw-semibold">Address</label>

                      <textarea
                        id="reg_address"
                        className={`form-control ${touched.address && errors.address ? "is-invalid" : touched.address && !errors.address ? "is-valid" : ""}`}
                        rows="3"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        onBlur={() => handleBlurField("address")}
                        placeholder="Enter Full Address (min 10 characters)"
                        style={{
                          height: "110px",
                          resize: "none",
                        }}
                        required
                      ></textarea>
                      {touched.address && errors.address && (
                        <div className="invalid-feedback d-block mt-1">
                          <i className="bi bi-exclamation-circle me-1"></i>
                          {errors.address}
                        </div>
                      )}
                    </div>

                    {/* Emergency Contact */}

                    <div className="col-md-6">
                      <label htmlFor="reg_emergencyContact" className="form-label fw-semibold">
                        Emergency Contact
                      </label>

                      <input
                        id="reg_emergencyContact"
                        type="text"
                        className={`form-control ${touched.emergencyContact && errors.emergencyContact ? "is-invalid" : touched.emergencyContact && !errors.emergencyContact ? "is-valid" : ""}`}
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleChange}
                        onBlur={() => handleBlurField("emergencyContact")}
                        placeholder="Emergency Contact Number"
                        maxLength={10}
                        required
                      />
                      {touched.emergencyContact && errors.emergencyContact && (
                        <div className="invalid-feedback d-block mt-1">
                          <i className="bi bi-exclamation-circle me-1"></i>
                          {errors.emergencyContact}
                        </div>
                      )}
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
                            className={`form-control ${touched.licenseNumber && errors.licenseNumber ? "is-invalid" : touched.licenseNumber && !errors.licenseNumber ? "is-valid" : ""}`}
                            name="licenseNumber"
                            value={formData.licenseNumber}
                            onChange={handleChange}
                            onBlur={() => handleBlurField("licenseNumber")}
                            placeholder="Enter License Number (e.g. MH1220201234567)"
                            required={formData.role === "driver"}
                          />
                          {touched.licenseNumber && errors.licenseNumber && (
                            <div className="invalid-feedback d-block mt-1">
                              <i className="bi bi-exclamation-circle me-1"></i>
                              {errors.licenseNumber}
                            </div>
                          )}
                        </div>

                        {/* Vehicle Details */}

                        <div className="col-md-6">
                          <label className="form-label fw-semibold text-secondary">
                            Vehicle Details
                          </label>

                          <input
                            type="text"
                            className={`form-control ${touched.vehicleDetails && errors.vehicleDetails ? "is-invalid" : touched.vehicleDetails && !errors.vehicleDetails ? "is-valid" : ""}`}
                            name="vehicleDetails"
                            value={formData.vehicleDetails}
                            onChange={handleChange}
                            onBlur={() => handleBlurField("vehicleDetails")}
                            placeholder="Example: Swift Dzire MH12AB1234"
                            required={formData.role === "driver"}
                          />
                          {touched.vehicleDetails && errors.vehicleDetails && (
                            <div className="invalid-feedback d-block mt-1">
                              <i className="bi bi-exclamation-circle me-1"></i>
                              {errors.vehicleDetails}
                            </div>
                          )}
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
                            className={`form-control ${touched.licensePdf && errors.licensePdf ? "is-invalid" : touched.licensePdf && !errors.licensePdf ? "is-valid" : ""}`}
                            accept="image/*,.pdf"
                            onChange={handleLicensePdfChange}
                            required={formData.role === "driver"}
                          />
                          {touched.licensePdf && errors.licensePdf && (
                            <div className="invalid-feedback d-block mt-1">
                              <i className="bi bi-exclamation-circle me-1"></i>
                              {errors.licensePdf}
                            </div>
                          )}
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
