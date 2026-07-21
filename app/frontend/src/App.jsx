import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import "bootstrap-icons/font/bootstrap-icons.css";
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
import Layout2 from "./Auth/Layout2";
import RowDetailsModal from "./Auth/RowDetailsModel";
import ForgotPassword from "./Auth/ForgotPassword";
import Contact from "./components/services/Contact";
import About from "./components/services/About";
function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="container-fluid">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout2 />}>
              {/* Public Routes */}
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="contact" element={<Contact />} />
              <Route path="about" element={<About />} />
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
                path="rider"
                element={
                  <ProtectedRoute role={3}>
                    <Userdashboard />
                  </ProtectedRoute>
                }
              />

              {/* Driver Routes */}
              <Route
                path="driver"
                element={
                  <ProtectedRoute role={2}>
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
