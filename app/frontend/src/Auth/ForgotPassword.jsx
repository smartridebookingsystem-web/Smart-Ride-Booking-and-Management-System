import { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../components/services/api";

export default function ForgotPassword() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const [loading, setLoading] = useState(false);

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  /* ----------------------------------
      Send OTP
  ----------------------------------- */

  const handleSendOtp = async () => {
    setError("");
    setMsg("");

    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length !== 10) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    try {
      setLoading(true);

      // Verify user exists before sending reset OTP
      const avail = await authApi.checkAvailability({ phone: cleanPhone });
      if (!avail || !avail.phoneExists) {
        setError(`No account found with mobile number +91${cleanPhone}. Please check your number.`);
        return;
      }

      await authApi.sendOtp(cleanPhone, true);

      setOtpSent(true);
      setMsg(`OTP sent successfully to +91${cleanPhone}. Check your phone or enter 123456.`);
    } catch (err) {
      setError(err.message || "Unable to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------
      Verify OTP
  ----------------------------------- */

  const handleVerifyOtp = async () => {
    setError("");

    try {
      setLoading(true);

      const response = await authApi.verifyOtp(phone, otp);

      if (response.success) {
        setOtpVerified(true);
        setMsg("Mobile Number Verified Successfully.");
      } else {
        setError(response.error || "Invalid OTP. Use 123456 or the SMS code.");
      }
    } catch (err) {
      setError(err.message || "OTP Verification Failed.");
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------
      Reset Password
  ----------------------------------- */

  const handleResetPassword = async (e) => {
    e.preventDefault();

    setError("");
    setMsg("");

    if (!otpVerified) {
      setError("Please verify your OTP first.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await authApi.resetPassword({
        phone,
        password: newPassword,
      });

      setMsg("Password Updated Successfully! You can now log in with your new password.");

      setPhone("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");

      setOtpSent(false);
      setOtpVerified(false);
    } catch (err) {
      setError(err.message || "Unable to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container-fluid d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#F8FAFC 0%,#FFF5ED 100%)",
        padding: "40px 15px",
      }}
    >
      <div
        className="card border-0 shadow-lg"
        style={{
          maxWidth: "700px",
          width: "100%",
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
            className="bi bi-shield-lock-fill"
            style={{
              fontSize: "3rem",
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
            Reset Your Password
          </p>
        </div>

        {/* Card Body */}

        <div className="card-body p-4">
          <h4
            className="fw-bold text-center mb-2"
            style={{
              color: "var(--text-h)",
            }}
          >
            Forgot Password
          </h4>

          <p
            className="text-center mb-4"
            style={{
              color: "var(--text)",
            }}
          >
            Enter your registered mobile number to receive an OTP.
          </p>

          <form onSubmit={handleResetPassword}>
            {/* Mobile Number */}

            <div className="mb-4">
              <label className="form-label fw-semibold">Mobile Number</label>

              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-phone-fill"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Mobile Number"
                  value={phone}
                  maxLength={10}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />

                {!otpVerified && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSendOtp}
                    disabled={loading}
                  >
                    Send OTP
                  </button>
                )}
              </div>
            </div>
            {/* OTP Section */}

            {otpSent && !otpVerified && (
              <div
                className="mb-4 p-3"
                style={{
                  background: "#FFF7ED",
                  border: "1px solid #FED7AA",
                  borderRadius: "12px",
                }}
              >
                <label className="form-label fw-semibold">Enter OTP</label>

                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-shield-check"></i>
                  </span>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleVerifyOtp}
                    disabled={loading}
                  >
                    Verify
                  </button>
                </div>
              </div>
            )}

            {/* Password Fields */}

            {otpVerified && (
              <>
                {/* New Password */}

                <div className="mb-3">
                  <label className="form-label fw-semibold">New Password</label>

                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-lock-fill"></i>
                    </span>

                    <input
                      type={showNewPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="Enter New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />

                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      <i
                        className={
                          showNewPassword
                            ? "bi bi-eye-slash-fill"
                            : "bi bi-eye-fill"
                        }
                      ></i>
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}

                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    Confirm Password
                  </label>

                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-lock-fill"></i>
                    </span>

                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />

                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      <i
                        className={
                          showConfirmPassword
                            ? "bi bi-eye-slash-fill"
                            : "bi bi-eye-fill"
                        }
                      ></i>
                    </button>
                  </div>
                </div>

                {/* Reset Button */}

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                    style={{
                      height: "52px",
                      fontSize: "16px",
                      fontWeight: "600",
                    }}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-arrow-repeat me-2"></i>
                        Reset Password
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </form>

          {/* Alerts */}

          {msg && (
            <div className="alert alert-success mt-4">
              <i className="bi bi-check-circle-fill me-2"></i>

              {msg}
            </div>
          )}

          {error && (
            <div className="alert alert-danger mt-4">
              <i className="bi bi-exclamation-circle-fill me-2"></i>

              {error}
            </div>
          )}

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

          {/* Back to Login */}

          <div className="text-center">
            <Link
              to="/login"
              style={{
                color: "var(--primary)",
                textDecoration: "none",
                fontWeight: "700",
              }}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
