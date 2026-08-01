import React from "react";

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  totalUsersCount,
  totalDriversCount,
  totalRidesCount,
  paymentsCount,
  openComplaintsCount,
}) {
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard Home",
      icon: "bi-house-door-fill",
      badge: null,
      badgeClass: "",
    },
    {
      id: "users",
      label: "User Management",
      icon: "bi-people-fill",
      badge: totalUsersCount,
      badgeClass: "bg-secondary text-white",
    },
    {
      id: "drivers",
      label: "Driver Management",
      icon: "bi-person-badge-fill",
      badge: totalDriversCount,
      badgeClass: "bg-info text-dark",
    },
    {
      id: "rides",
      label: "Ride Management",
      icon: "bi-signpost-split-fill",
      badge: totalRidesCount,
      badgeClass: "bg-success text-white",
    },
    {
      id: "payments",
      label: "Payment Management",
      icon: "bi-credit-card-fill",
      badge: paymentsCount,
      badgeClass: "bg-primary text-white",
    },
    {
      id: "complaints",
      label: "Complaint Management",
      icon: "bi-chat-square-quote-fill",
      badge: openComplaintsCount > 0 ? `${openComplaintsCount} Open` : null,
      badgeClass: "bg-danger text-white",
    },
    {
      id: "reports",
      label: "System Reports",
      icon: "bi-bar-chart-line-fill",
      badge: "PDF",
      badgeClass: "bg-warning text-dark",
    },
  ];

  return (
    <div
      className="card border-0 shadow-sm rounded-4 overflow-hidden"
      style={{
        backgroundColor: "#0f172a",
        color: "#f8fafc",
        boxShadow: "4px 0 15px rgba(0, 0, 0, 0.15)",
      }}
    >
      <div
        className="card-header border-0 py-3 px-4 d-flex align-items-center gap-2"
        style={{
          backgroundColor: "#0f172a",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          fontSize: "1.25rem",
          fontWeight: 700,
          color: "#ffffff",
        }}
      >
        <span>🚕 Smart<span style={{ color: "#ff6b00" }}>Ride</span> Admin</span>
      </div>

      <div className="card-body p-3 d-flex flex-column gap-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`btn d-flex align-items-center justify-content-between py-2.5 px-3 rounded-3 border-0 text-start w-100 transition-all ${
                isActive ? "active" : ""
              }`}
              style={{
                background: isActive
                  ? "linear-gradient(135deg, rgba(255, 107, 0, 0.2) 0%, rgba(255, 107, 0, 0.08) 100%)"
                  : "transparent",
                color: isActive ? "#ff6b00" : "#94a3b8",
                fontWeight: isActive ? 600 : 500,
                borderLeft: isActive ? "4px solid #ff6b00" : "4px solid transparent",
                borderRadius: "10px",
                transition: "all 0.25s ease-in-out",
                cursor: "pointer",
              }}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="d-flex align-items-center gap-2.5">
                <i className={`bi ${item.icon} fs-5`} style={{ color: isActive ? "#ff6b00" : "#94a3b8" }}></i>
                <span className="small">{item.label}</span>
              </span>
              {item.badge !== null && item.badge !== undefined && (
                <span className={`badge rounded-pill ${item.badgeClass}`}>{item.badge}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
