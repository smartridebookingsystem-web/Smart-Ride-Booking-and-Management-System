// src/services/api.js

export const authApi = {
  // Calls your C# Service
  sendOtp: async (phone) => {
    console.log(`[C# Service] Sending OTP to ${phone}`);
    // return fetch('http://localhost:5000/api/verify/send-otp', { ... })
    return { success: true };
  },

  // Calls your C# Service
  verifyOtp: async (phone, otp) => {
    console.log(`[C# Service] Verifying OTP ${otp} for ${phone}`);
    // return fetch('http://localhost:5000/api/verify/check-otp', { ... })
    return { success: otp === "1234" }; // Mocking success for "1234"
  },

  // Calls your Java Service
  register: async (userData) => {
    console.log(`[Java Service] Registering user in database`, userData);
    // return fetch('http://localhost:8080/api/auth/register', { ... })
    return { success: true, userId: 101 };
  },

  // Calls your Java Service to get the GCS Upload Link
  getSignedUrl: async (fileName) => {
    console.log(`[Java Service] Requesting GCS Signed URL for ${fileName}`);
    return {
      uploadUrl: "https://storage.googleapis.com/mock-url",
      fileUrl: `https://storage.googleapis.com/my-bucket/${fileName}`,
    };
  },
};
