// src/components/services/api.js
import { uploadToFirebaseStorage } from "../../config/firebase.js";

const API_BASE_URL = "http://localhost:8080";

export const authApi = {
  // Login via Spring Boot API Gateway (Auth Service)
  login: async (emailOrUsername, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ emailOrUsername, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Login failed. Please check credentials.");
    }

    return await response.json();
  },

  // Register via Spring Boot API Gateway (Auth Service)
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        dob: userData.dob,
        gender: userData.gender,
        role: userData.role,
        profileImage: userData.profile_image || userData.profilePhotoUrl || "default.jpg",
        licenseNo: userData.license_no || userData.licenseNumber || null,
        licensePdfUrl: userData.licensePdfUrl || null,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Registration failed. Please check input.");
    }

    return await response.json();
  },

  // Fetch current user profile with JWT token
  getProfile: async (token) => {
    const jwtToken = token || localStorage.getItem("jwtToken");
    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user profile");
    }

    return await response.json();
  },

  // Firebase Storage File Uploader for Profile Photo & Driver License PDF
  uploadFile: async (file, folderName = "profiles") => {
    return await uploadToFirebaseStorage(file, folderName);
  },

  // Didit / Driver License Format & Document Verification Helper
  validateDriverLicense: async (licenseNo, licensePdfUrl) => {
    console.log(`[Didit License Verifier] Validating license number: ${licenseNo} via Backend`);

    const response = await fetch(`${API_BASE_URL}/api/auth/verify-license`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        licenseNo: licenseNo,
        licensePdfUrl: licensePdfUrl,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { valid: false, message: errorData.message || "License verification failed." };
    }

    return await response.json();
  },

  // OTP Verification via Fast2SMS (backend: /api/auth/send-otp)
  sendOtp: async (phone) => {
    const cleanPhone = phone.replace(/^\+91/, "").replace(/[^0-9]/g, "");
    console.log(`[Fast2SMS] Sending real OTP SMS to +91${cleanPhone} via backend...`);

    const response = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: cleanPhone }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "Failed to send OTP. Please try again.");
    }
    return data; // { success: true, message: "OTP sent successfully to +91..." }
  },

  // OTP Verification via backend: /api/auth/verify-otp
  verifyOtp: async (phone, otp) => {
    const cleanPhone = phone.replace(/^\+91/, "").replace(/[^0-9]/g, "");
    console.log(`[Fast2SMS] Verifying OTP ${otp} for +91${cleanPhone} via backend...`);

    const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: cleanPhone, otp }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "OTP verification failed.");
    }
    return data; // { success: true, message: "Mobile number verified successfully!" }
  },

  // Pre-verification availability check
  checkAvailability: async (params) => {
    try {
      const query = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE_URL}/api/auth/check-availability?${query}`);
      if (!response.ok) return { phoneExists: false, emailExists: false, usernameExists: false, licenseExists: false };
      return await response.json();
    } catch (e) {
      return { phoneExists: false, emailExists: false, usernameExists: false, licenseExists: false };
    }
  },

  // Fetch all users/drivers for Admin Dashboard
  getAllUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/api/users/all`);
    if (!response.ok) throw new Error("Failed to fetch users");
    return await response.json();
  },

  // Update user/driver status in DB
  updateUserStatus: async (userId, status) => {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Failed to update status in database.");
    return data;
  },

  // Update any user/driver fields in DB
  updateUser: async (userId, updatedFields) => {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedFields),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Failed to update record in database.");
    return data;
  },

  // Delete user/driver record from DB
  deleteUser: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: "DELETE",
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Failed to delete user record from database.");
    return data;
  },

  getSignedUrl: async (fileName) => {
    return {
      uploadUrl: "https://storage.googleapis.com/mock-url",
      fileUrl: `default.jpg`,
    };
  },
};
