import React from "react";
import { Link } from "react-router-dom";
import Table_Layout from "../../Auth/Table_Layout";

export default function DriverRecentTrips({ recentRides }) {
  const columns = [
    { header: "Trip ID", field: "tripId" },
    { header: "Pickup & Destination Route", field: "route" },
    { header: "Fare Amount", field: "fareAmount" },
    { header: "Payment Mode", field: "paymentBadge" },
    { header: "Status", field: "statusBadge" },
  ];

  const tableData = recentRides.map((ride, idx) => ({
    ...ride,
    tripId: <span className="fw-bold text-warning">#{ride.id || idx + 1}</span>,
    route: (
      <div>
        <small className="d-block text-dark fw-semibold">{ride.pickup}</small>
        <small className="text-secondary">{ride.drop}</small>
      </div>
    ),
    fareAmount: <span className="fw-bold text-dark fs-6">{ride.fare}</span>,
    paymentBadge: (
      <span
        className={`badge px-3 py-1 rounded-pill fw-bold ${
          ride.payment === "UPI"
            ? "bg-warning text-dark"
            : ride.payment === "Cash"
            ? "bg-success text-white"
            : "bg-info text-dark"
        }`}
      >
        <i
          className={`bi me-1 ${
            ride.payment === "UPI"
              ? "bi-qr-code-scan"
              : ride.payment === "Cash"
              ? "bi-cash-stack"
              : "bi-credit-card-fill"
          }`}
        ></i>
        {ride.payment}
      </span>
    ),
    statusBadge: <span className="badge bg-success px-2.5 py-1 rounded-pill">{ride.status}</span>,
  }));

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3 pb-2 border-bottom">
        <h5 className="fw-bold mb-0 text-dark">
          <i className="bi bi-clock-history me-2 text-warning"></i>Recent Completed Trips
        </h5>
        <Link to="/driver/earnings" className="btn btn-outline-warning text-dark border-warning btn-sm rounded-pill px-3">
          View Wallet <i className="bi bi-arrow-right ms-1"></i>
        </Link>
      </div>

      <Table_Layout
        tableName="Recent Completed Trips Log"
        columns={columns}
        data={tableData}
      />
    </div>
  );
}
