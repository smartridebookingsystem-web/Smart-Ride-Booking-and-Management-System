import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { paymentApi } from "../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function RiderWallet() {
  const { user } = useSelector((state) => state.auth || {});
  const userId = user?.id || user?.userId || 3;

  const [balance, setBalance] = useState(1250);
  const [amountToAdd, setAmountToAdd] = useState("");
  const [paymentMode, setPaymentMode] = useState("UPI");
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState("ALL"); // ALL, CREDIT, DEBIT, REFUND
  const [autoTopup, setAutoTopup] = useState(false);

  // Initial Sample Transactions combined with DB transactions
  const [transactions, setTransactions] = useState([
    {
      id: "TXN-9021",
      type: "Wallet Top-up (UPI)",
      date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      ref: "UPI Ref #948201",
      amount: 500.0,
      isCredit: true,
      category: "CREDIT",
      status: "SUCCESS",
    },
    {
      id: "TXN-9020",
      type: "Ride Fare Paid (Ride #SR12345)",
      date: "02 Aug 2026",
      ref: "Debit Ref #839120",
      amount: 350.0,
      isCredit: false,
      category: "DEBIT",
      status: "SUCCESS",
    },
    {
      id: "TXN-9019",
      type: "Ride Cancellation Refund",
      date: "01 Aug 2026",
      ref: "Refund Ref #719203",
      amount: 180.0,
      isCredit: true,
      category: "REFUND",
      status: "SUCCESS",
    },
    {
      id: "TXN-9018",
      type: "Ride Fare Paid (Ride #SR12344)",
      date: "31 Jul 2026",
      ref: "Debit Ref #628194",
      amount: 180.0,
      isCredit: false,
      category: "DEBIT",
      status: "SUCCESS",
    },
  ]);

  useEffect(() => {
    async function fetchWalletData() {
      try {
        const payments = await paymentApi.getAllPayments();
        if (Array.isArray(payments) && payments.length > 0) {
          const myPayments = payments
            .filter((p) => p.userId === userId || p.user_id === userId)
            .map((p, idx) => {
              const isCredit = p.paymentType === "WALLET_TOPUP" || p.paymentType === "REFUND";
              const isRefund = p.paymentType === "REFUND";
              return {
                id: `DB-${p.paymentId || p.id || idx}`,
                type: isRefund ? "Ride Refund" : isCredit ? "Added to Wallet (DB)" : "Ride Fare Paid",
                date: p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Recent",
                ref: p.gatewayRef || p.transactionId ? `Ref #${p.gatewayRef || p.transactionId}` : "DB Record",
                amount: parseFloat(p.netAmount || p.totalFare || p.amount || 250),
                isCredit,
                category: isRefund ? "REFUND" : isCredit ? "CREDIT" : "DEBIT",
                status: p.status || "SUCCESS",
              };
            });

          if (myPayments.length > 0) {
            setTransactions((prev) => {
              const combined = [...myPayments, ...prev];
              const unique = [];
              const seen = new Set();
              for (const item of combined) {
                if (!seen.has(item.id)) {
                  seen.add(item.id);
                  unique.push(item);
                }
              }
              return unique;
            });
          }
        }
      } catch (e) {
        console.warn("Wallet database sync notice:", e);
      }
    }
    fetchWalletData();
  }, [userId]);

  // Handle Adding Preset Amount
  const handlePresetAdd = (val) => {
    setAmountToAdd(val.toString());
  };

  // Submit Top-up
  const handleAddMoney = async (e) => {
    e.preventDefault();
    const val = parseFloat(amountToAdd);
    if (!val || val <= 0) return;

    setLoading(true);
    try {
      await paymentApi.processPayment({
        userId,
        amount: val,
        paymentType: "WALLET_TOPUP",
        paymentMode,
        status: "SUCCESS",
      });

      setBalance((prev) => prev + val);
      const newTx = {
        id: `TXN-${Date.now().toString().slice(-4)}`,
        type: `Added to Wallet (${paymentMode})`,
        date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        ref: `${paymentMode} Ref #${Math.floor(100000 + Math.random() * 900000)}`,
        amount: val,
        isCredit: true,
        category: "CREDIT",
        status: "SUCCESS",
      };
      setTransactions((prev) => [newTx, ...prev]);
      setAmountToAdd("");
    } catch (err) {
      console.warn("Backend payment notice:", err);
      setBalance((prev) => prev + val);
      const newTx = {
        id: `TXN-${Date.now().toString().slice(-4)}`,
        type: `Added to Wallet (${paymentMode})`,
        date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        ref: `${paymentMode} Ref #${Math.floor(100000 + Math.random() * 900000)}`,
        amount: val,
        isCredit: true,
        category: "CREDIT",
        status: "SUCCESS",
      };
      setTransactions((prev) => [newTx, ...prev]);
      setAmountToAdd("");
    } finally {
      setLoading(false);
    }
  };

  // Calculate Summary Statistics
  const totalSpent = transactions.filter((t) => !t.isCredit).reduce((acc, curr) => acc + curr.amount, 0);
  const totalAdded = transactions.filter((t) => t.isCredit && t.category !== "REFUND").reduce((acc, curr) => acc + curr.amount, 0);
  const totalRefunds = transactions.filter((t) => t.category === "REFUND").reduce((acc, curr) => acc + curr.amount, 0);

  // Filtered Transactions
  const filteredTransactions = transactions.filter((t) => {
    if (filterType === "ALL") return true;
    if (filterType === "CREDIT") return t.isCredit && t.category !== "REFUND";
    if (filterType === "DEBIT") return !t.isCredit;
    if (filterType === "REFUND") return t.category === "REFUND";
    return true;
  });

  // Export PDF Statement
  const handleExportStatement = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor(255, 107, 0);
    doc.text("SmartRide Wallet Statement", 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Generated on: ${new Date().toLocaleString("en-IN")}`, 14, 25);
    doc.text(`Account Holder: ${user?.username || "Sulkshana Patil"} (User ID: ${userId})`, 14, 31);
    doc.text(`Available Balance: Rs. ${balance.toFixed(2)}`, 14, 37);

    const rows = filteredTransactions.map((t, idx) => [
      idx + 1,
      t.id,
      t.date,
      t.type,
      t.ref,
      t.isCredit ? `+ Rs.${t.amount.toFixed(2)}` : `- Rs.${t.amount.toFixed(2)}`,
      t.status,
    ]);

    autoTable(doc, {
      startY: 44,
      head: [["#", "Txn ID", "Date", "Description", "Reference", "Amount", "Status"]],
      body: rows,
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      styles: { fontSize: 9, cellPadding: 4 },
    });

    doc.save(`SmartRide_Wallet_Statement_${Date.now()}.pdf`);
  };

  return (
    <div className="container-fluid p-0" style={{ backgroundColor: "#F8FAFC" }}>
      {/* Header Banner */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-bold mb-1 text-dark">
            <i className="bi bi-wallet2 me-2" style={{ color: "#FF6B00" }}></i> My Rider Wallet
          </h3>
          <p className="text-muted small mb-0">
            Manage your balance, add funds, and track instant 1-click ride payments
          </p>
        </div>
        <button className="btn btn-outline-dark rounded-pill px-3 py-2 small fw-semibold bg-white shadow-sm" onClick={handleExportStatement}>
          <i className="bi bi-file-earmark-pdf me-1.5 text-danger"></i> Download Statement
        </button>
      </div>

      {/* Summary Statistics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-lg-4 col-md-6">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-success">
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-circle bg-success-subtle p-2.5 d-flex align-items-center justify-content-center" style={{ width: "45px", height: "45px" }}>
                <i className="bi bi-arrow-down-left-circle-fill text-success fs-4"></i>
              </div>
              <div>
                <span className="text-muted extra-small d-block fw-semibold text-uppercase" style={{ fontSize: "0.75rem" }}>
                  Total Added
                </span>
                <h4 className="fw-bold mb-0 text-dark">₹ {totalAdded.toFixed(2)}</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-danger">
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-circle bg-danger-subtle p-2.5 d-flex align-items-center justify-content-center" style={{ width: "45px", height: "45px" }}>
                <i className="bi bi-arrow-up-right-circle-fill text-danger fs-4"></i>
              </div>
              <div>
                <span className="text-muted extra-small d-block fw-semibold text-uppercase" style={{ fontSize: "0.75rem" }}>
                  Total Spent
                </span>
                <h4 className="fw-bold mb-0 text-dark">₹ {totalSpent.toFixed(2)}</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-12">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-primary">
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-circle bg-primary-subtle p-2.5 d-flex align-items-center justify-content-center" style={{ width: "45px", height: "45px" }}>
                <i className="bi bi-arrow-counterclockwise text-primary fs-4"></i>
              </div>
              <div>
                <span className="text-muted extra-small d-block fw-semibold text-uppercase" style={{ fontSize: "0.75rem" }}>
                  Refunds & Credits
                </span>
                <h4 className="fw-bold mb-0 text-dark">₹ {totalRefunds.toFixed(2)}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Wallet Balance & Top-up Card */}
        <div className="col-lg-5">
          <div
            className="card border-0 shadow-sm rounded-4 p-4 text-white position-relative overflow-hidden mb-4"
            style={{
              background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
              borderLeft: "6px solid #FF6B00",
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-2">
              <small className="text-light text-uppercase tracking-wider fw-semibold" style={{ letterSpacing: "1px", fontSize: "0.75rem" }}>
                SmartRide Digital Wallet
              </small>
              <span className="badge bg-success bg-opacity-20 text-success border border-success-subtle px-2.5 py-1 rounded-pill small">
                <i className="bi bi-shield-check me-1"></i> Active
              </span>
            </div>

            <h1 className="fw-bold my-2" style={{ fontSize: "2.8rem", color: "#FF6B00", letterSpacing: "-1px" }}>
              ₹ {balance.toFixed(2)}
            </h1>
            <p className="small text-light-50 mb-4 opacity-75">
              Use your wallet balance for instant 1-click ride bookings and automatic fare deduction.
            </p>

            {/* Top-up Form */}
            <form onSubmit={handleAddMoney} className="bg-white p-3.5 rounded-4 text-dark shadow-sm">
              <label className="form-label fw-bold small text-dark mb-2">ADD MONEY TO WALLET</label>

              {/* Amount Input */}
              <div className="input-group mb-3">
                <span className="input-group-text bg-light border-end-0 fw-bold text-muted">₹</span>
                <input
                  type="number"
                  className="form-control border-start-0 py-2"
                  placeholder="Enter amount (e.g. 500)"
                  value={amountToAdd}
                  onChange={(e) => setAmountToAdd(e.target.value)}
                  min="1"
                  required
                />
              </div>

              {/* Quick Amount Chips */}
              <div className="d-flex gap-2 mb-3">
                {[100, 200, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    className="btn btn-sm btn-light border flex-grow-1 fw-semibold text-dark py-1"
                    onClick={() => handlePresetAdd(amt)}
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>

              {/* Payment Mode Selector */}
              <div className="mb-3">
                <label className="form-label text-muted extra-small fw-semibold text-uppercase mb-1">Payment Method</label>
                <select
                  className="form-select form-select-sm bg-light border-0 py-2 text-dark font-medium"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                >
                  <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="CARD">Credit / Debit Card</option>
                  <option value="NETBANKING">Net Banking</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn w-100 fw-bold text-white shadow-sm py-2.5"
                style={{ background: "#FF6B00", borderColor: "#FF6B00" }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Processing Top-Up...
                  </>
                ) : (
                  <>
                    <i className="bi bi-plus-circle me-1.5"></i> Add Funds Now
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Wallet Settings Card */}
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <h6 className="fw-bold text-dark mb-3">
              <i className="bi bi-gear-fill text-warning me-2"></i> Wallet Settings
            </h6>
            <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
              <div>
                <span className="fw-semibold text-dark d-block small">Auto Top-Up</span>
                <span className="text-muted extra-small">Add ₹500 automatically when balance &lt; ₹100</span>
              </div>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  checked={autoTopup}
                  onChange={() => setAutoTopup(!autoTopup)}
                  style={{ cursor: "pointer" }}
                />
              </div>
            </div>
            <div className="d-flex justify-content-between align-items-center pt-2">
              <div>
                <span className="fw-semibold text-dark d-block small">Default Payment</span>
                <span className="text-muted extra-small">Use wallet as primary mode for booking</span>
              </div>
              <span className="badge bg-primary-subtle text-primary px-2.5 py-1 rounded-pill small">Enabled</span>
            </div>
          </div>
        </div>

        {/* Right Column: Transaction History */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            {/* Header & Filter Tabs */}
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <h5 className="fw-bold mb-0 text-dark">
                <i className="bi bi-clock-history text-warning me-2"></i> Recent Wallet Transactions
              </h5>
              <div className="btn-group btn-group-sm bg-light rounded-pill p-1">
                <button
                  type="button"
                  className={`btn rounded-pill px-3 py-1 fw-semibold border-0 ${filterType === "ALL" ? "bg-white text-dark shadow-sm" : "text-muted"}`}
                  onClick={() => setFilterType("ALL")}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`btn rounded-pill px-3 py-1 fw-semibold border-0 ${filterType === "CREDIT" ? "bg-white text-success shadow-sm" : "text-muted"}`}
                  onClick={() => setFilterType("CREDIT")}
                >
                  Added (+)
                </button>
                <button
                  type="button"
                  className={`btn rounded-pill px-3 py-1 fw-semibold border-0 ${filterType === "DEBIT" ? "bg-white text-danger shadow-sm" : "text-muted"}`}
                  onClick={() => setFilterType("DEBIT")}
                >
                  Spent (-)
                </button>
                <button
                  type="button"
                  className={`btn rounded-pill px-3 py-1 fw-semibold border-0 ${filterType === "REFUND" ? "bg-white text-primary shadow-sm" : "text-muted"}`}
                  onClick={() => setFilterType("REFUND")}
                >
                  Refunds
                </button>
              </div>
            </div>

            {/* Transactions List */}
            <ul className="list-group list-group-flush border-0">
              {filteredTransactions.length === 0 ? (
                <li className="list-group-item text-center text-muted py-5 border-0">
                  <i className="bi bi-receipt-cutoff fs-2 text-muted d-block mb-2"></i>
                  No wallet transactions found for selected filter.
                </li>
              ) : (
                filteredTransactions.map((tx) => (
                  <li key={tx.id} className="list-group-item d-flex justify-content-between align-items-center py-3 px-0 border-bottom">
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className={`rounded-circle p-2.5 d-flex align-items-center justify-content-center ${
                          tx.isCredit ? (tx.category === "REFUND" ? "bg-primary-subtle" : "bg-success-subtle") : "bg-danger-subtle"
                        }`}
                        style={{ width: "42px", height: "42px" }}
                      >
                        <i
                          className={`bi ${
                            tx.isCredit
                              ? tx.category === "REFUND"
                                ? "bi-arrow-counterclockwise text-primary"
                                : "bi-plus-lg text-success"
                              : "bi-dash-lg text-danger"
                          } fs-5`}
                        ></i>
                      </div>
                      <div>
                        <span className="fw-bold text-dark d-block" style={{ fontSize: "0.95rem" }}>
                          {tx.type}
                        </span>
                        <small className="text-muted d-block" style={{ fontSize: "0.8rem" }}>
                          {tx.date} • {tx.ref}
                        </small>
                      </div>
                    </div>

                    <div className="text-end">
                      <span className={`fw-bold d-block fs-6 ${tx.isCredit ? "text-success" : "text-dark"}`}>
                        {tx.isCredit ? "+" : "-"}₹{tx.amount.toFixed(2)}
                      </span>
                        <span className="badge bg-success-subtle text-success extra-small rounded-pill px-2 py-0.5" style={{ fontSize: "0.7rem" }}>
                          {tx.status || "SUCCESS"}
                        </span>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}


