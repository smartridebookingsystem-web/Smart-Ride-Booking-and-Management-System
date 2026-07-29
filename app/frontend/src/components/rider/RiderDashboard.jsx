import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import SearchRide from "../components/SearchRide";
import UpcomingRide from "../components/UpcomingRide";
import QuickActions from "../components/QuickActions";
import RecentRides from "../components/RecentRides";

import {
    FaCar,
    FaCheckCircle,
    FaClock,
    FaStar
} from "react-icons/fa";

export default function Dashboard() {
  return (
    <>
      {/* Navbar */}

      <div className="page-content">

        {/* Heading */}
        <div>
          <h2 className="fw-bold">
            Good Morning, Sulkshana! 👋
          </h2>

          <p className="page-subtitle">
            Let's make your journey safe & comfortable.
          </p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          ...
        </div>

        {/* Search + Upcoming */}
        <div className="content-grid">

          <div className="search-card">
            ...
          </div>

          <div className="upcoming-card">
            ...
          </div>

        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          ...
        </div>

        {/* Recent Rides */}
        <div className="recent-rides">
          ...
        </div>

      </div>
    </>
  );
}
