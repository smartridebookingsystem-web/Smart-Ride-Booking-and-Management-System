import { NavLink, Outlet } from "react-router-dom";
import Table_Layout from "../../Auth/Table_Layout";
import RowDetailsModal from "../../Auth/RowDetailsModel";
import { useState } from "react";
export default function Admindashboard() {
  const [selectedRow, setSelectedRow] = useState(null);
  const [modalMode, setModalMode] = useState("view");
  const drivers = [
    {
      id: 1,
      userid: "DRV001",
      name: "Rahul",
      phone: "9876543210",
    },
    {
      id: 2,
      userid: "DRV002",
      name: "Amit",
      phone: "9876543211",
    },
  ];

  const columns = [
    { header: "User ID", field: "userid" },
    { header: "Name", field: "name" },
    { header: "Phone", field: "phone" },
  ];
  return (
    <>
      <h2>Admin Panel</h2>
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
          <Table_Layout
            columns={columns}
            data={drivers}
            onView={(row) => {
              setSelectedRow(row);
              setModalMode("view");
            }}
            onEdit={(row) => {
              setSelectedRow(row);
              setModalMode("edit");
            }}
            onDelete={(row) => {
              // your delete logic
              console.log("Delete row:", row);
            }}
          />
          <RowDetailsModal
            row={selectedRow}
            mode={modalMode}
            title={modalMode === "edit" ? "Edit Driver" : "Driver Details"}
            onSave={(updatedRow) => {
              // update your data here
              console.log("Updated row:", updatedRow);
              // Example: setDrivers(prev => prev.map(d => d.id === updatedRow.id ? updatedRow : d));
            }}
            onClose={() => setSelectedRow(null)}
          />
          <Outlet />
        </div>
      </div>
    </>
  );
}
