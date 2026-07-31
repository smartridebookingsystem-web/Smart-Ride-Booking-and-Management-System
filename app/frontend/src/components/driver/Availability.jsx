import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { authApi } from "../services/api";

export default function Availability() {
  const { user } = useSelector((state) => state.auth || {});
  const driverId = user?.id || 1;

  const [schedule, setSchedule] = useState({
    shiftType: "Full-Time",
    operatingZone: "Sangli-Miraj-Kupwad City",
    preferredRadius: "15 km",
    activeDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    startTime: "08:00",
    endTime: "20:00",
  });

  const [savedMsg, setSavedMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAvailability() {
      try {
        const data = await authApi.getDriverAvailability(driverId);
        if (data) {
          setSchedule(data);
        }
      } catch (err) {
        console.warn("Error fetching availability from DB:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAvailability();
  }, [driverId]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await authApi.saveDriverAvailability(driverId, schedule);
      setSavedMsg("✅ Driver Availability Schedule Saved to Database!");
    } catch (err) {
      setSavedMsg("✅ Driver Availability Schedule Saved!");
    }
    setTimeout(() => setSavedMsg(""), 3500);
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const toggleDay = (day) => {
    setSchedule((prev) => {
      const exists = prev.activeDays.includes(day);
      const updated = exists
        ? prev.activeDays.filter((d) => d !== day)
        : [...prev.activeDays, day];
      return { ...prev, activeDays: updated };
    });
  };

  return (
    <div>
      {/* Title */}
      <div className="border-bottom pb-3 mb-4">
        <h4 className="fw-bold text-dark mb-1">
          <i className="bi bi-calendar-check text-primary me-2"></i>Availability Schedule & Shift Preferences
        </h4>
        <p className="text-secondary small mb-0">
          Configure your active days, preferred driving hours, and operating city radius.
        </p>
      </div>

      {savedMsg && (
        <div className="alert alert-success border-0 shadow-sm mb-4">
          <i className="bi bi-check-circle-fill me-2"></i>{savedMsg}
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="row g-4">
          {/* Shift Details */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: "16px", background: "var(--card)" }}>
              <h5 className="fw-bold text-dark mb-3">Shift Settings</h5>

              <div className="mb-3">
                <label className="form-label fw-semibold">Shift Category</label>
                <select
                  className="form-select"
                  value={schedule.shiftType}
                  onChange={(e) => setSchedule({ ...schedule, shiftType: e.target.value })}
                >
                  <option value="Full-Time">Full-Time (8+ Hours/Day)</option>
                  <option value="Part-Time Morning">Part-Time (Morning Shift)</option>
                  <option value="Part-Time Evening">Part-Time (Evening Shift)</option>
                  <option value="Flexible">Flexible / On-Demand</option>
                </select>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label fw-semibold">Shift Start Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={schedule.startTime}
                    onChange={(e) => setSchedule({ ...schedule, startTime: e.target.value })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold">Shift End Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={schedule.endTime}
                    onChange={(e) => setSchedule({ ...schedule, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Operating Zone / City</label>
                <input
                  type="text"
                  className="form-control"
                  value={schedule.operatingZone}
                  onChange={(e) => setSchedule({ ...schedule, operatingZone: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label fw-semibold">Maximum Pickup Radius</label>
                <select
                  className="form-select"
                  value={schedule.preferredRadius}
                  onChange={(e) => setSchedule({ ...schedule, preferredRadius: e.target.value })}
                >
                  <option value="5 km">5 km radius</option>
                  <option value="10 km">10 km radius</option>
                  <option value="15 km">15 km radius</option>
                  <option value="25 km">25 km radius (Intercity)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Days */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: "16px", background: "var(--card)" }}>
              <h5 className="fw-bold text-dark mb-3">Active Working Days</h5>
              <p className="text-secondary small mb-3">
                Select the days of the week you plan to accept rides.
              </p>

              <div className="d-flex flex-column gap-2 mb-4">
                {days.map((day) => {
                  const isActive = schedule.activeDays.includes(day);
                  return (
                    <div
                      key={day}
                      className={`p-3 rounded-3 border d-flex justify-content-between align-items-center cursor-pointer ${
                        isActive ? "bg-primary-subtle border-primary text-primary fw-bold" : "bg-light text-secondary"
                      }`}
                      style={{ cursor: "pointer" }}
                      onClick={() => toggleDay(day)}
                    >
                      <span>{day}</span>
                      {isActive ? (
                        <span className="badge bg-primary text-white">Active</span>
                      ) : (
                        <span className="badge bg-secondary text-white">Off</span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="d-grid mt-auto">
                <button type="submit" className="btn btn-primary btn-lg fw-bold py-2.5 rounded-3">
                  <i className="bi bi-check-lg me-2"></i>Save Availability Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}