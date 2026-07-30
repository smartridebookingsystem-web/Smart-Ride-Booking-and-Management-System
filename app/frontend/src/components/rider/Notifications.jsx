import React from "react";

export default function Notifications() {
  const alerts = [
    {
      id: 1,
      title: "Ride Completed",
      desc: "Your ride RIDE-1049 from Pune Railway Station to Hinjewadi was completed successfully.",
      time: "2 hours ago",
      icon: "bi-check-circle-fill text-success",
    },
    {
      id: 2,
      title: "Wallet Top-up Successful",
      desc: "₹500.00 added to your SmartRide wallet balance.",
      time: "Yesterday",
      icon: "bi-wallet2 text-warning",
    },
    {
      id: 3,
      title: "Special Weekend Discount",
      desc: "Get 15% off on all Sedan & SUV rides this weekend! Use code SMART15.",
      time: "3 days ago",
      icon: "bi-tag-fill text-primary",
    },
  ];

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4">
      <h5 className="fw-bold mb-4 text-dark">
        <i className="bi bi-bell-fill me-2" style={{ color: "#FF6B00" }}></i> Rider Notifications
      </h5>

      <div className="list-group list-group-flush">
        {alerts.map((a) => (
          <div key={a.id} className="list-group-item d-flex gap-3 align-items-start py-3">
            <i className={`bi ${a.icon} fs-3`}></i>
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between">
                <h6 className="fw-bold mb-1">{a.title}</h6>
                <small className="text-muted">{a.time}</small>
              </div>
              <p className="text-muted small mb-0">{a.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
