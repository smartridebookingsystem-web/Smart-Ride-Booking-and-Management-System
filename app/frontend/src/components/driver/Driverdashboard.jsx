import { NavLink, Outlet } from "react-router-dom";

export default function Driverdashboard() {
  return (
    <>
      
      <div className="d-flex">
        {/* Sidebar */}
        <ul className="nav nav-pills flex-column p-3 border-end">
          <li className="nav-item">
            <NavLink to="/driver/toggle-status">Toggle Status</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/driver/ride-requests">Ride Requests</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/driver/navigation">Navigation</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/driver/complete-ride">Complete Ride</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/driver/earnings">Earnings</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/driver/vehicle-info">Vehicle Info</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/driver/availability">Availability</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/logout">Logout</NavLink>
          </li>
        </ul>

        {/* Main Content */}
        <div className="p-3 flex-grow-1">
          <Outlet />
        </div>
      </div>
    </>
  );
}
