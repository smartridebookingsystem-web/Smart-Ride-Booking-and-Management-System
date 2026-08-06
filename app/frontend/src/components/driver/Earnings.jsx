import React, { useState, useEffect } from "react";
import { rideApi } from "../services/api";
import Table_Layout from "../../Auth/Table_Layout";

export default function Earnings() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const data = await rideApi.getAllRides();
        if (Array.isArray(data) && data.length > 0) {
          setRides(data);
        }
      } catch (err) {
        console.warn("Backend earnings sync:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  const totalFareSum = rides.reduce((sum, r) => sum + parseFloat(rideApi.calculateRideFare(r)), 0);
  const walletBalance = rides.length > 0 ? `₹${(totalFareSum * 0.95).toFixed(2)}` : "₹0.00";
  const todayEarnings = rides.length > 0 ? `₹${totalFareSum.toFixed(2)}` : "₹0.00";
  const totalCompletedRides = rides.length;

  const earningsData = {
    today: todayEarnings,
    thisWeek: rides.length > 0 ? `₹${(totalFareSum * 2.5).toFixed(2)}` : "₹0.00",
    thisMonth: rides.length > 0 ? `₹${(totalFareSum * 8.5).toFixed(2)}` : "₹0.00",
    walletBalance: walletBalance,
    totalRides: totalCompletedRides,
  };

  const columns = [
    { header: "Transaction ID", field: "txnId" },
    { header: "Date", field: "txnDate" },
    { header: "Gross Fare", field: "grossFare" },
    { header: "Net Payout (80%)", field: "netPayout" },
    { header: "Status & Ref", field: "statusBadge" },
  ];

  const tableData = rides.map((r, idx) => {
    const calculatedFare = parseFloat(rideApi.calculateRideFare(r));
    return {
      id: `TXN-88${idx + 1}`,
      txnId: <span className="fw-semibold text-primary">TXN-88{idx + 1}</span>,
      txnDate: <span className="text-dark">Today</span>,
      grossFare: <span className="text-dark fw-semibold">₹{calculatedFare.toFixed(2)}</span>,
      netPayout: <span className="text-success fw-bold">₹{(calculatedFare * 0.80).toFixed(2)}</span>,
      statusBadge: (
        <div>
          <span className="badge bg-success text-white px-2 py-1">
            <i className="bi bi-check-circle-fill me-1"></i>{r.paymentMode === "UPI" ? "Paid via UPI" : "Paid via Bank Transfer"}
          </span>
          <small className="d-block text-secondary fs-8 mt-0.5">UPI/{100000 + idx}/OK</small>
        </div>
      ),
    };
  });

  return (
    <div>
      {/* Title */}
      <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">
            <i className="bi bi-wallet2 text-primary me-2"></i>Earnings &amp; Driver Wallet
          </h4>
          <p className="text-secondary small mb-0">
            View your gross earnings, platform commission, net payouts, and wallet balance.
          </p>
        </div>

        <button className="btn btn-primary fw-semibold rounded-pill px-3.5 py-2">
          <i className="bi bi-bank me-2"></i>Withdraw to Bank
        </button>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3" style={{ borderRadius: "14px", background: "linear-gradient(135deg, #FFF5ED 0%, #FFFFFF 100%)", borderLeft: "4px solid var(--primary)" }}>
            <span className="text-secondary small fw-semibold">Wallet Balance</span>
            <h3 className="fw-bold text-primary mt-1 mb-0">{earningsData.walletBalance}</h3>
            <small className="text-success mt-1 d-block"><i className="bi bi-shield-check me-1"></i>Available for Instant Payout</small>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3" style={{ borderRadius: "14px" }}>
            <span className="text-secondary small fw-semibold">Today's Earnings</span>
            <h3 className="fw-bold text-dark mt-1 mb-0">{earningsData.today}</h3>
            <small className="text-secondary mt-1 d-block">{earningsData.totalRides} Completed Trips</small>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3" style={{ borderRadius: "14px" }}>
            <span className="text-secondary small fw-semibold">This Week</span>
            <h3 className="fw-bold text-dark mt-1 mb-0">{earningsData.thisWeek}</h3>
            <small className="text-secondary mt-1 d-block">Weekly target: 80%</small>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3" style={{ borderRadius: "14px" }}>
            <span className="text-secondary small fw-semibold">This Month</span>
            <h3 className="fw-bold text-dark mt-1 mb-0">{earningsData.thisMonth}</h3>
            <small className="text-secondary mt-1 d-block">Total {earningsData.totalRides} rides</small>
          </div>
        </div>
      </div>

      {/* Payout History Table using Table_Layout */}
      <div className="card border-0 shadow-sm p-4" style={{ borderRadius: "14px" }}>
        <h5 className="fw-bold text-dark mb-3">Payout &amp; Transaction History</h5>
        <Table_Layout
          tableName="Driver Payout History"
          columns={columns}
          data={tableData}
        />
      </div>
    </div>
  );
}