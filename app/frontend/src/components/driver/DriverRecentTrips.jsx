import React from "react";
import { Link } from "react-router-dom";
import Table_Layout from "../../Auth/Table_Layout";
import { rideApi } from "../services/api";

export default function DriverRecentTrips({ recentRides }) {
  const columns = [
    { header: "Trip ID", field: "tripId" },
    { header: "Pickup & Destination Route", field: "route" },
    { header: "Fare Amount", field: "fareAmount" },
    { header: "Payment Mode", field: "paymentBadge" },
    { header: "Status", field: "statusBadge" },
  ];

  const ridesData = Array.isArray(recentRides) ? recentRides : [];

  const tableData = ridesData.map((ride, idx) => {
    const pickupLoc = ride.source || ride.pickup || ride.sourceLocation || "FC Road, Shivajinagar, Pune";
    const dropLoc = ride.destination || ride.drop || ride.dropLocation || "Pune Airport (PNQ)";
    const fareVal = rideApi.calculateRideFare(ride);
    const rideIdVal = ride.ride_id || ride.rideId || ride.id || idx + 1;
    const statusStr = String(ride.status).toUpperCase();
    const isCompleted = ride.status === 3 || ride.status === "3" || statusStr === "COMPLETED" || statusStr === "FINISHED";

    return {
      ...ride,
      tripId: <span className="fw-bold text-warning">#{rideIdVal}</span>,
      route: (
        <div>
          <small className="d-block text-dark fw-semibold text-truncate" style={{ maxWidth: "320px" }}>
            <i className="bi bi-geo-alt-fill text-success me-1"></i>
            {pickupLoc}
          </small>
          <small className="text-secondary text-truncate d-block" style={{ maxWidth: "320px" }}>
            <i className="bi bi-pin-map-fill text-danger me-1"></i>
            {dropLoc}
          </small>
        </div>
      ),
      fareAmount: <span className="fw-bold text-dark fs-6">₹{fareVal}</span>,
      paymentBadge: (
        <span className="badge px-3 py-1 rounded-pill fw-bold bg-success text-white">
          <i className="bi bi-wallet2 me-1"></i>
          {ride.paymentMode || ride.payment || "Online / Wallet"}
        </span>
      ),
      statusBadge: (
        <span className={`badge ${isCompleted ? "bg-success" : "bg-info"} px-2.5 py-1 rounded-pill`}>
          {isCompleted ? "COMPLETED" : "COMPLETED"}
        </span>
      ),
    };
  });

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
