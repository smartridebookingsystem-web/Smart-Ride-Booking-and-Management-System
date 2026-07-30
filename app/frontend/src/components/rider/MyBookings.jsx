import React from "react";

export default function MyBookings() {
  const sampleBookings = [
    {
      id: "RIDE-1049",
      date: "2026-07-28 14:30",
      pickup: "Pune Railway Station",
      destination: "Hinjewadi Phase 1",
      fare: "₹340",
      status: "Completed",
      driver: "Ramesh Shinde (MH12-AB-4321)",
    },
    {
      id: "RIDE-1022",
      date: "2026-07-25 09:15",
      pickup: "Kothrud Depot",
      destination: "Pune Airport (PNQ)",
      fare: "₹480",
      status: "Completed",
      driver: "Suresh Kumar (MH12-CD-9876)",
    },
    {
      id: "RIDE-1005",
      date: "2026-07-20 18:45",
      pickup: "FC Road, Shivajinagar",
      destination: "Viman Nagar",
      fare: "₹220",
      status: "Cancelled",
      driver: "N/A",
    },
  ];

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold mb-0 text-dark">
          <i className="bi bi-ticket-perforated-fill me-2" style={{ color: "#FF6B00" }}></i> Ride Booking History
        </h5>
        <button className="btn btn-outline-dark btn-sm rounded-pill">
          <i className="bi bi-download me-1"></i> Export PDF History
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Booking ID</th>
              <th>Date & Time</th>
              <th>Route (Pickup $\rightarrow$ Drop)</th>
              <th>Driver</th>
              <th>Fare</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sampleBookings.map((b) => (
              <tr key={b.id}>
                <td className="fw-bold text-primary">{b.id}</td>
                <td className="small text-muted">{b.date}</td>
                <td>
                  <div className="small fw-semibold">{b.pickup}</div>
                  <div className="small text-muted">$\rightarrow$ {b.destination}</div>
                </td>
                <td className="small text-dark">{b.driver}</td>
                <td className="fw-bold">{b.fare}</td>
                <td>
                  <span
                    className={`badge ${
                      b.status === "Completed"
                        ? "bg-success"
                        : b.status === "Cancelled"
                        ? "bg-danger"
                        : "bg-warning"
                    }`}
                  >
                    {b.status}
                  </span>
                </td>
                <td>
                  <button className="btn btn-sm btn-light border">Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
