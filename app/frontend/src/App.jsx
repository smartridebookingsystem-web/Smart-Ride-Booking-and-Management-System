import "bootstrap-icons/font/bootstrap-icons.css";
import Login from "./Auth/Login";
import Home from "./Auth/Home";
import Register from "./Auth/Register";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Admindashboard from "./components/admin/Admindashboard";
import ProtectedRoute from "./components/ProtectedRoutes";
import Driverdashboard from "./components/driver/Driverdashboard";
import Logout from "./Auth/Logout";
import DriverHome from "./components/driver/DriverHome";
import ToggleStatus from "./components/driver/ToggleStatus";
import RideRequests from "./components/driver/RideRequests";
import Navigation from "./components/driver/Navigation";
import CompleteRide from "./components/driver/CompleteRide";
import Earnings from "./components/driver/Earnings";
import VehicleInfo from "./components/driver/VehicleInfo";
import Availability from "./components/driver/Availability";
import Layout2 from "./Auth/Layout2";
import ForgotPassword from "./Auth/ForgotPassword";
import Contact from "./components/services/Contact";
import About from "./components/services/About";

// Rider Module Components
import RiderDashboard from "./components/rider/RiderDashboard";
import RiderHomeContent from "./components/rider/RiderHomeContent";
import SearchRide from "./components/rider/SearchRide";
import MyBookings from "./components/rider/MyBookings";
import RiderWallet from "./components/rider/RiderWallet";
import PaymentMethods from "./components/rider/PaymentMethods";
import Notifications from "./components/rider/Notifications";
import HelpSupport from "./components/rider/HelpSupport";
import RiderSettings from "./components/rider/RiderSettings";

function App() {
  return (
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

            {/* Admin Routes (Role 1 = Admin) */}
            <Route
              path="admin"
              element={
                <ProtectedRoute role={1}>
                  <Admindashboard />
                </ProtectedRoute>
              }
            />

            {/* User/Rider Routes (Role 3 = Rider) */}
            <Route
              path="rider"
              element={
                <ProtectedRoute role={3}>
                  <RiderDashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<RiderHomeContent />} />
              <Route path="search-ride" element={<SearchRide />} />
              <Route path="my-bookings" element={<MyBookings />} />
              <Route path="wallet" element={<RiderWallet />} />
              <Route path="payment-methods" element={<PaymentMethods />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="help-support" element={<HelpSupport />} />
              <Route path="settings" element={<RiderSettings />} />
            </Route>

            {/* Driver Routes (Role 2 = Driver) */}
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

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

