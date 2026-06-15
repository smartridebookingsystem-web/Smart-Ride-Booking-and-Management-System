import React, { useState } from "react";

const Register = () => {
  const [formData, setFormData] = useState({
    role: "rider",
    username: "",
    password: "",
    email: "",
    contact: "",
    address: "",
    emergencyContact: "",
    licenseNumber: "",
    vehicleDetails: "",
    otp: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });

    // Simple validation
    if (!value) {
      setErrors({ ...errors, [name]: "This field is required" });
    } else {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }

    // Auto-send OTP when contact reaches 10 digits
    if (name === "contact" && value.length === 10 && !otpSent) {
      setOtpSent(true);
      alert("OTP sent to " + value);
    }
  };

  const verifyOtp = () => {
    if (formData.otp === "1234") {
      setOtpVerified(true);
      alert("Mobile number verified!");
    } else {
      alert("Invalid OTP. Try again.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!otpVerified) {
      alert("Please verify your mobile number before submitting.");
      return;
    }
    console.log("Form submitted:", formData);
    alert("Form submitted! Check console for details.");
  };

  return (
    <div className="container my-4">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-header  text-success text-center  rounded-top">
              <h4 className="mb-0 fw-bold">User Registration</h4>
            </div>

            <div className="card-body px-4 py-4">
              <form onSubmit={handleSubmit} noValidate>
                {/* Role */}
                <div className="mb-3">
                  <select
                    className="form-select"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="rider">Rider</option>
                    <option value="driver">Driver</option>
                  </select>
                </div>

                {/* Common Fields */}
                {["username", "password", "email", "contact"].map((field) => (
                  <div className="form-floating mb-3" key={field}>
                    <input
                      type={
                        field === "password"
                          ? "password"
                          : field === "email"
                            ? "email"
                            : "text"
                      }
                      className={`form-control ${
                        errors[field]
                          ? "is-invalid"
                          : formData[field]
                            ? "is-valid"
                            : ""
                      }`}
                      id={field}
                      name={field}
                      value={formData[field]}
                      onChange={handleChange}
                      placeholder={field}
                      required={["username", "password", "contact"].includes(
                        field,
                      )}
                    />
                    <label htmlFor={field} className="text-capitalize">
                      {field}
                    </label>
                    {errors[field] && (
                      <div className="invalid-feedback">{errors[field]}</div>
                    )}
                  </div>
                ))}

                {/* OTP Section */}
                {otpSent && (
                  <div className="input-group mb-3">
                    <input
                      type="text"
                      className={`form-control ${
                        otpVerified
                          ? "is-valid"
                          : formData.otp
                            ? "is-invalid"
                            : ""
                      }`}
                      name="otp"
                      value={formData.otp}
                      onChange={handleChange}
                      placeholder="Enter OTP"
                    />
                    <button
                      type="button"
                      className={`btn ${
                        otpVerified ? "btn-success" : "btn-outline-primary"
                      }`}
                      onClick={verifyOtp}
                      disabled={otpVerified}
                    >
                      {otpVerified ? "Verified" : "Verify"}
                    </button>
                  </div>
                )}

                {/* Rider-only fields */}
                {formData.role === "rider" && (
                  <>
                    <div className="form-floating mb-3">
                      <input
                        type="text"
                        className="form-control"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Address"
                      />
                      <label htmlFor="address">Address</label>
                    </div>
                    <div className="form-floating mb-3">
                      <input
                        type="tel"
                        className="form-control"
                        id="emergencyContact"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleChange}
                        placeholder="Emergency Contact"
                      />
                      <label htmlFor="emergencyContact">
                        Emergency Contact
                      </label>
                    </div>
                  </>
                )}

                {/* Driver-only fields */}
                {formData.role === "driver" && (
                  <>
                    <div className="form-floating mb-3">
                      <input
                        type="text"
                        className="form-control"
                        id="licenseNumber"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        placeholder="License Number"
                      />
                      <label htmlFor="licenseNumber">License Number</label>
                    </div>
                    <div className="form-floating mb-3">
                      <input
                        type="text"
                        className="form-control"
                        id="vehicleDetails"
                        name="vehicleDetails"
                        value={formData.vehicleDetails}
                        onChange={handleChange}
                        placeholder="Vehicle Details"
                      />
                      <label htmlFor="vehicleDetails">Vehicle Details</label>
                    </div>
                  </>
                )}

                {/* Submit Button */}
                <div className="d-grid mt-4">
                  <button
                    type="submit"
                    className="btn btn-warning btn-lg fw-bold text-white"
                  >
                    Register
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
