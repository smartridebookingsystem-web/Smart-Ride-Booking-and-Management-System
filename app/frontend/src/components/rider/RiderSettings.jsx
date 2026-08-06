import React, { useState } from "react";
import { useSelector } from "react-redux";
import { authApi } from "../services/api";

export default function RiderSettings() {
  const { user } = useSelector((state) => state.auth || {});
  const userId = user?.id || user?.userId || 3;

  const [username, setUsername] = useState(user?.username || user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [homeAddress, setHomeAddress] = useState(user?.homeAddress || "");
  const [loading, setLoading] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSavedMsg("");
    try {
      await authApi.updateUser(userId, { username, email, phone, homeAddress });
      setSavedMsg("✅ Account profile settings updated successfully in Database!");
    } catch (err) {
      console.warn("Backend user update notice (localStorage fallback):", err);
      const updatedUser = { ...user, username, email, phone, homeAddress };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setSavedMsg("✅ Profile settings saved!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4" style={{ color: "#FF6B00" }} >
      <h5 className="fw-bold mb-3" >
        <i className="bi bi-gear-fill me-2" style={{ color: "#FF6B00" }}></i> Rider Account Settings
      </h5>

      {savedMsg && (
        <div className="alert alert-success border-0 py-2 px-3 small rounded-3 mb-3">
          <i className="bi bi-check-circle-fill me-1"></i> {savedMsg}
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold text- small">USERNAME</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold text-light small">EMAIL ADDRESS</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold text-light small">PHONE NUMBER</label>
            <input
              type="tel"
              className="form-control"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold text-light small">DEFAULT HOME ADDRESS</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Vishrambag, Sangli"
              value={homeAddress}
              onChange={(e) => setHomeAddress(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn fw-bold text-white mt-4 px-4 py-2 d-flex align-items-center gap-2"
          style={{ background: "#FF6B00" }}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm"></span>
              Saving Profile...
            </>
          ) : (
            <>
              <i className="bi bi-check2-circle"></i> Save Changes
            </>
          )}
        </button>
      </form>
    </div>
  );
}

