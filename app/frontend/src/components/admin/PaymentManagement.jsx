import React from "react";
import Table_Layout from "../../Auth/Table_Layout";

export default function PaymentManagement({ payments, setPayments, setSelectedRow, setModalMode }) {
  const columns = [
    { header: "Transaction ID", field: "paymentId" },
    { header: "Ride ID", field: "rideId" },
    { header: "Customer Name", field: "riderName" },
    { header: "Total Fare (₹)", field: "totalFare" },
    { header: "Payment Mode", field: "paymentMode" },
    { header: "Payment Status", field: "statusBadge" },
  ];

  const tableData = payments.map((p) => ({
    ...p,
    statusBadge: (
      <span className={`badge ${p.status === "Paid" ? "bg-success" : "bg-warning text-dark"}`}>
        {p.status}
      </span>
    ),
  }));

  const handleDelete = (row) => {
    const pId = row.paymentId || row.id;
    if (window.confirm(`⚠️ Are you sure you want to delete Transaction "${pId}"?`)) {
      setPayments((prev) => prev.filter((p) => (p.paymentId || p.id) !== pId));
      alert(`🗑️ Payment record "${pId}" deleted!`);
    }
  };

  return (
    <div className="card shadow-sm border-0 rounded-4 p-4" style={{ backgroundColor: "#ffffff" }}>
      <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
        <div className="p-2 rounded-3" style={{ background: "rgba(255, 107, 0, 0.1)" }}>
          <i className="bi bi-credit-card-fill fs-5" style={{ color: "#FF6B00" }}></i>
        </div>
        <h5 className="fw-bold mb-0" style={{ color: "#0F172A" }}>
          Payment & Financial Transactions
        </h5>
      </div>
      <Table_Layout
        tableName="Payments Log"
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
