import React from "react";
import Table_Layout from "../../Auth/Table_Layout";

export default function PaymentManagement({ payments, users = [], setPayments, setSelectedRow, setModalMode }) {
  const columns = [
    { header: "Transaction Ref", field: "txnRef" },
    { header: "Ride ID", field: "rideIdDisplay" },
    { header: "Customer Name", field: "customerName" },
    { header: "Total Fare (₹)", field: "formattedFare" },
    { header: "Payment Mode", field: "modeDisplay" },
    { header: "Payment Status", field: "statusBadge" },
  ];

  const tableData = payments.map((p) => {
    const matchedUser = users.find(
      (u) => String(u.userId || u.id) === String(p.userId || p.user_id)
    );
    const customerName = matchedUser
      ? matchedUser.username || matchedUser.name
      : p.riderName || p.customerName || `User #${p.userId || p.user_id || "N/A"}`;

    const rawStatus = String(p.paymentStatus || p.status || "SUCCESS").toUpperCase();
    const isSuccess = rawStatus === "SUCCESS" || rawStatus === "PAID" || rawStatus === "COMPLETED";
    const isPending = rawStatus === "PENDING" || rawStatus === "PROCESSING";

    return {
      ...p,
      txnRef: p.transactionId || `TXN_${String(p.paymentId || p.id || 1).padStart(3, "0")}`,
      rideIdDisplay: `#${p.rideId || p.ride_id || "N/A"}`,
      customerName,
      formattedFare: `₹${Number(p.totalFare || p.netAmount || p.fare || 0).toFixed(2)}`,
      modeDisplay: String(p.paymentMode || "CASH").toUpperCase(),
      statusBadge: (
        <span
          className={`badge ${
            isSuccess ? "bg-success" : isPending ? "bg-warning text-dark" : "bg-danger"
          } px-2.5 py-1.5 fw-semibold`}
        >
          {isSuccess ? "SUCCESS" : isPending ? "PENDING" : rawStatus}
        </span>
      ),
    };
  });

  const handleDelete = (row) => {
    const pId = row.paymentId || row.id;
    const ref = row.txnRef || pId;
    if (window.confirm(`⚠️ Are you sure you want to delete Payment Record "${ref}"?`)) {
      setPayments((prev) => prev.filter((p) => (p.paymentId || p.id) !== pId));
      alert(`🗑️ Payment record "${ref}" deleted!`);
    }
  };

  return (
    <div className="card shadow-sm border-0 rounded-4 p-4" style={{ backgroundColor: "#ffffff" }}>
      <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
        <div className="d-flex align-items-center gap-2">
          <div className="p-2 rounded-3" style={{ background: "rgba(255, 107, 0, 0.1)" }}>
            <i className="bi bi-credit-card-fill fs-5" style={{ color: "#FF6B00" }}></i>
          </div>
          <div>
            <h5 className="fw-bold mb-0" style={{ color: "#0F172A" }}>
              Payment &amp; Financial Transactions
            </h5>
            <small className="text-muted">Live transaction history processed via Payment Gateway microservice</small>
          </div>
        </div>
        <span className="badge rounded-pill px-3 py-2 fw-semibold" style={{ background: "rgba(255, 107, 0, 0.15)", color: "#FF6B00" }}>
          Total Transactions: {payments.length}
        </span>
      </div>
      <Table_Layout
        tableName="Live Payment Logs"
        columns={columns}
        data={tableData}
        onView={(row) => {
          setSelectedRow(row);
          setModalMode("view");
        }}
        onEdit={(row) => {
          setSelectedRow(row);
          setModalMode("edit");
        }}
        onDelete={handleDelete}
      />
    </div>
  );
}
