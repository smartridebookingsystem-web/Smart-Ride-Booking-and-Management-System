import React, { useState } from "react";

export default function RiderWallet() {
  const [balance, setBalance] = useState(1250);
  const [amountToAdd, setAmountToAdd] = useState("");

  const handleAddMoney = (e) => {
    e.preventDefault();
    const val = parseFloat(amountToAdd);
    if (!val || val <= 0) return;
    setBalance((prev) => prev + val);
    setAmountToAdd("");
    alert(`Successfully added ₹${val} to your SmartRide Wallet!`);
  };

  return (
    <div className="row g-4">
      <div className="col-lg-5">
        <div
          className="card border-0 shadow-sm rounded-4 p-4 text-white"
          style={{
            background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
            borderLeft: "6px solid #FF6B00",
          }}
        >
          <small className="text-light text-uppercase tracking-wider fw-semibold">SmartRide Wallet Balance</small>
          <h1 className="fw-bold my-2" style={{ fontSize: "2.8rem", color: "#FF6B00" }}>
            ₹{balance.toFixed(2)}
          </h1>
          <p className="small text-light mb-4">Use wallet balance for instant, 1-click ride bookings and automatic fare deduction.</p>

          <form onSubmit={handleAddMoney} className="bg-white p-3 rounded-3 text-dark">
            <label className="form-label fw-semibold small text-muted">ADD MONEY TO WALLET</label>
            <div className="input-group mb-3">
              <span className="input-group-text bg-light border-end-0 fw-bold">₹</span>
              <input
                type="number"
                className="form-control border-start-0"
                placeholder="Enter amount (e.g. 500)"
                value={amountToAdd}
                onChange={(e) => setAmountToAdd(e.target.value)}
                min="1"
                required
              />
            </div>
            <button
              type="submit"
              className="btn w-100 fw-bold text-white shadow-sm"
              style={{ background: "#FF6B00" }}
            >
              <i className="bi bi-plus-circle me-2"></i> Add Money Now
            </button>
          </form>
        </div>
      </div>

      <div className="col-lg-7">
        <div className="card border-0 shadow-sm rounded-4 p-4">
          <h5 className="fw-bold mb-3 text-dark">Recent Wallet Transactions</h5>
          <ul className="list-group list-group-flush">
            <li className="list-group-item d-flex justify-content-between align-items-center py-3">
              <div>
                <div className="fw-semibold">Added to Wallet</div>
                <small className="text-muted">2026-07-28 • UPI Ref #987123</small>
              </div>
              <span className="fw-bold text-success">+₹500.00</span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center py-3">
              <div>
                <div className="fw-semibold">Ride Fare Paid (RIDE-1049)</div>
                <small className="text-muted">2026-07-28 • Wallet Deduction</small>
              </div>
              <span className="fw-bold text-danger">-₹340.00</span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center py-3">
              <div>
                <div className="fw-semibold">Added to Wallet</div>
                <small className="text-muted">2026-07-20 • Card payment</small>
              </div>
              <span className="fw-bold text-success">+₹1000.00</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
