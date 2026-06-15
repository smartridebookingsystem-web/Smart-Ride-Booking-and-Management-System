import { NavLink, Outlet } from "react-router-dom";
export default function Userdashboard() {
  return (
    <>
      <h2>User Dashboard</h2>
      <div className="d-flex">
        <ul className="nav nav-pills flex-column p-3 border-end">
          <li className="nav-item">
            <NavLink to="/users">Users</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/reports">Reports</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/logout">Logout</NavLink>
          </li>
        </ul>

        <div className="p-3 flex-grow-1">
          <Outlet />
        </div>
      </div>
    </>
  );
}
