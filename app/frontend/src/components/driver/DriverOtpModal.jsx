import React from "react";

export default function DriverOtpModal({
  showOtpModal,
  setShowOtpModal,
  inputOtp,
  setInputOtp,
  otpSentNotice,
  otpError,
  isSendingOtp,
  isVerifyingOtp,
  handleSendTwilioOtp,
  handleVerifyOtpAndStartTrip,
}) {
  if (!showOtpModal) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-75 fade show"
        style={{ zIndex: 1060, backdropFilter: "blur(5px)" }}
        onClick={() => setShowOtpModal(false)}
      ></div>

      {/* Modal */}
      <div
        className="position-fixed top-50 start-50 translate-middle text-white p-4 shadow-lg rounded-4"
        style={{
          width: "460px",
          maxWidth: "92vw",
          zIndex: 1070,
          background: "linear-gradient(180deg, #1E293B 0%, #0F172A 100%)",
          border: "1px solid rgba(245, 158, 11, 0.4)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8)",
        }}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center border-bottom border-white border-opacity-10 pb-3 mb-3">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-shield-lock-fill text-warning fs-4"></i>
            <h5 className="fw-bold mb-0 text-white">Rider OTP Verification</h5>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-light rounded-circle p-1 d-flex justify-content-center align-items-center"
            style={{ width: "30px", height: "30px" }}
            onClick={() => setShowOtpModal(false)}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <p className="text-light opacity-80 small mb-3">
          Ask the rider for their 6-digit verification OTP before starting trip navigation.
        </p>

        {otpSentNotice && (
          <div className="alert alert-success border-0 py-2 px-3 small rounded-3 mb-3">
            <i className="bi bi-check-circle-fill me-1"></i> {otpSentNotice}
          </div>
        )}
        {otpError && (
          <div className="alert alert-danger border-0 py-2 px-3 small rounded-3 mb-3">
            <i className="bi bi-exclamation-triangle-fill me-1"></i> {otpError}
          </div>
        )}

        <form onSubmit={handleVerifyOtpAndStartTrip}>
          <div className="mb-3">
            <label className="form-label text-warning small fw-bold mb-1">ENTER RIDER OTP CODE</label>
            <div className="input-group">
              <span className="input-group-text bg-black bg-opacity-40 text-warning border-secondary">
                <i className="bi bi-key-fill"></i>
              </span>
              <input
                type="text"
                className="form-control form-control-lg bg-black bg-opacity-30 border-secondary text-white text-center fw-bold"
                placeholder="e.g. 123456"
                value={inputOtp}
                onChange={(e) => setInputOtp(e.target.value)}
                maxLength={6}
                required
                style={{ fontSize: "1.3rem", letterSpacing: "4px" }}
              />
            </div>
          </div>

          <div className="d-flex flex-column gap-2">
            <button type="submit" className="btn btn-warning btn-lg fw-bold py-2 shadow-sm text-dark" disabled={isVerifyingOtp}>
              {isVerifyingOtp ? (
                <><span className="spinner-border spinner-border-sm me-2"></span>Verifying OTP...</>
              ) : (
                <><i className="bi bi-check2-circle me-2"></i>Verify OTP &amp; Start Trip</>
              )}
            </button>
            <button type="button" className="btn btn-outline-light btn-sm py-2 opacity-80" onClick={handleSendTwilioOtp} disabled={isSendingOtp}>
              {isSendingOtp ? (
                <><span className="spinner-border spinner-border-sm me-1"></span>Sending SMS...</>
              ) : (
                <><i className="bi bi-chat-text-fill me-1"></i>Send OTP to Rider Phone via Twilio</>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
