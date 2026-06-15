import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import "./App.css";
import Login from "./Auth/Login";
import Home from "./Auth/Home";
import Register from "./Auth/Register";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Userdashboard from "./components/user/Userdashboard";
import Admindashboard from "./components/admin/Admindashboard";
import ProtectedRoute from "./components/ProtectedRoutes";
import Driverdashboard from "./components/driver/Driverdashboard";
import Logout from "./Auth/Logout";
import Layout from "./Auth/Layout";
import DriverHome from "./components/driver/DriverHome";
import ToggleStatus from "./components/driver/ToggleStatus";
import RideRequests from "./components/driver/RideRequests";
import Navigation from "./components/driver/Navigation";
import CompleteRide from "./components/driver/CompleteRide";
import Earnings from "./components/driver/Earnings";
import VehicleInfo from "./components/driver/VehicleInfo";
import Availability from "./components/driver/Availability";
import Table_Layout from "./Auth/Table_Layout";

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

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="container-fluid">
        <Table_Layout
          columns={columns}
          data={drivers}
          onView={(row) => console.log("View", row)}
          onEdit={(row) => console.log("Edit", row)}
          onDelete={(row) => console.log("Delete", row)}
        />
        use layout routes
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* Public Routes */}
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="logout" element={<Logout />} />

              {/* Admin Routes */}
              <Route
                path="admin"
                element={
                  <ProtectedRoute role={1}>
                    <Admindashboard />
                  </ProtectedRoute>
                }
              />

              {/* User Routes */}
              <Route
                path="user"
                element={
                  <ProtectedRoute role={2}>
                    <Userdashboard />
                  </ProtectedRoute>
                }
              />

              {/* Driver Routes */}
              <Route
                path="driver"
                element={
                  <ProtectedRoute role={3}>
                    <Driverdashboard />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DriverHome />} />
                <Route path="toggle-status" element={<ToggleStatus />} />
                <Route path="ride-requests" element={<RideRequests />} />
                <Route path="navigation" element={<Navigation />} />
                <Route path="complete-ride" element={<CompleteRide />} />
                <Route path="earnings" element={<Earnings />} />
                <Route path="vehicle-info" element={<VehicleInfo />} />
                <Route path="availability" element={<Availability />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;
