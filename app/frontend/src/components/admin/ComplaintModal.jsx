import React from "react";

export default function ComplaintModal({
  selectedComplaint,
  setSelectedComplaint,
  resolutionStatus,
  setResolutionStatus,
  resolutionNotes,
  setResolutionNotes,
  handleUpdateComplaintTicket,
}) {
  if (!selectedComplaint) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(15,23,42,0.6)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow-lg border-0 rounded-4 overflow-hidden">
          <form onSubmit={handleUpdateComplaintTicket}>
            <div
              className="modal-header text-white"
              style={{
                background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
                borderLeft: "5px solid #FF6B00",
              }}
            >
              <h5 className="modal-title fw-bold">
                <i className="bi bi-shield-exclamation me-2" style={{ color: "#FF6B00" }}></i>Update Complaint #{selectedComplaint.complaintId}
              </h5>
              <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedComplaint(null)}></button>
            </div>
            <div className="modal-body p-4 bg-white">
              <div className="mb-3">
                <label className="fw-bold small text-muted">SUBJECT</label>
                <p className="fw-bold text-dark mb-0">{selectedComplaint.subject}</p>
              </div>
              <div className="mb-3">
                <label className="fw-bold small text-muted">DESCRIPTION</label>
                <p className="text-secondary small mb-0">{selectedComplaint.description}</p>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Update Ticket Status</label>
                <select
                  className="form-select"
                  value={resolutionStatus}
                  onChange={(e) => setResolutionStatus(e.target.value)}
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Resolution Notes / Action Taken</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Enter resolution details..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                ></textarea>
              </div>
            </div>
            <div className="modal-footer bg-light">
              <button type="button" className="btn btn-secondary rounded-3" onClick={() => setSelectedComplaint(null)}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn text-white fw-semibold rounded-3"
                style={{ background: "#FF6B00", borderColor: "#FF6B00" }}
              >
                Save Resolution Status
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
