import React from "react";

export default function PaymentMethods() {
  return (
    <div className="card border-0 shadow-sm rounded-4 p-4">
      <h5 className="fw-bold mb-4 text-dark">
        <i className="bi bi-credit-card-fill me-2" style={{ color: "#FF6B00" }}></i> Saved Payment Methods
      </h5>

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="p-3 border rounded-3 d-flex justify-content-between align-items-center bg-light">
            <div className="d-flex align-items-center gap-3">
              <i className="bi bi-wallet2 fs-2 text-warning"></i>
              <div>
                <h6 className="fw-bold mb-0">SmartRide Wallet</h6>
                <small className="text-muted">Primary Default Method</small>
              </div>
            </div>
            <span className="badge bg-success">Default</span>
          </div>
        </div>

        <div className="col-md-6">
          <div className="p-3 border rounded-3 d-flex justify-content-between align-items-center bg-light">
            <div className="d-flex align-items-center gap-3">
              <i className="bi bi-qr-code-scan fs-2 text-primary"></i>
              <div>
                <h6 className="fw-bold mb-0">UPI (Google Pay / PhonePe)</h6>
                <small className="text-muted">rider@upi</small>
              </div>
            </div>
            <button className="btn btn-sm btn-outline-secondary">Manage</button>
          </div>
        </div>

        <div className="col-md-6">
          <div className="p-3 border rounded-3 d-flex justify-content-between align-items-center bg-light">
            <div className="d-flex align-items-center gap-3">
              <i className="bi bi-credit-card-2-front fs-2 text-secondary"></i>
              <div>
                <h6 className="fw-bold mb-0">Credit / Debit Card</h6>
                <small className="text-muted">•••• •••• •••• 4321</small>
              </div>
            </div>
            <button className="btn btn-sm btn-outline-secondary">Manage</button>
          </div>
        </div>

        <div className="col-md-6">
          <div className="p-3 border rounded-3 d-flex justify-content-between align-items-center bg-light">
            <div className="d-flex align-items-center gap-3">
              <i className="bi bi-cash-stack fs-2 text-success"></i>
              <div>
                <h6 className="fw-bold mb-0">Cash Payment</h6>
                <small className="text-muted">Pay driver at end of ride</small>
              </div>
            </div>
            <button className="btn btn-sm btn-outline-secondary">Active</button>
          </div>
        </div>
      </div>

      <button className="btn text-white fw-bold px-4 py-2" style={{ background: "#FF6B00" }}>
        <i className="bi bi-plus-lg me-2"></i> Add New Payment Method
      </button>
    </div>
  );
}
