
// src/components/services/api.js

import { uploadToFirebaseStorage } from "../../config/firebase.js";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8088";

/*
 * ============================================================
 * COMMON API LOGGING
 * ============================================================
 */

const logRequest = (method, url, payload) => {
  console.log(
    `%c[API REQUEST] 🚀 ${method} ${url}`,
    "color: #3b82f6; font-weight: bold;",
    payload ? { payload } : ""
  );
};

const logResponse = (method, url, status, data) => {
  console.log(
    `%c[API RESPONSE] ✅ ${status} ${method} ${url}`,
    "color: #10b981; font-weight: bold;",
    {
      response: data,
    }
  );
};

const logError = (method, url, status, error) => {
  console.error(
    `[API ERROR] ❌ ${status} ${method} ${url}`,
    {
      error,
    }
  );
};

/*
 * ============================================================
 * COMMON FETCH FUNCTION
 * ============================================================
 */

const apiFetch = async (
  endpoint,
  options = {}
) => {
  const method =
    options.method || "GET";

  const url =
    endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE_URL}${endpoint}`;

  let payload = null;

  if (options.body) {
    try {
      payload = JSON.parse(options.body);
    } catch {
      payload = options.body;
    }
  }

  logRequest(
    method,
    url,
    payload
  );

  try {
    const response = await fetch(
      url,
      options
    );

    const contentType =
      response.headers.get(
        "content-type"
      );

    let data;

    /*
     * Parse JSON response.
     */
    if (
      contentType &&
      contentType.includes(
        "application/json"
      )
    ) {
      data = await response
        .json()
        .catch(() => ({}));
    } else {
      /*
       * Parse non-JSON response.
       */
      const text =
        await response
          .text()
          .catch(() => "");

      data = text
        ? {
          text,
        }
        : {};
    }

    /*
     * Handle HTTP errors.
     */
    if (!response.ok) {
      logError(
        method,
        url,
        response.status,
        data
      );

      /*
       * Try to provide the actual
       * Spring Boot validation error.
       */
      let errorMessage =
        data?.message ||
        data?.error ||
        data?.detail ||
        data?.text;

      /*
       * Spring validation can sometimes
       * return validation errors in
       * different structures.
       */
      if (
        !errorMessage &&
        data?.errors
      ) {
        if (
          Array.isArray(
            data.errors
          )
        ) {
          errorMessage =
            data.errors
              .map(
                (item) =>
                  item.defaultMessage ||
                  item.message ||
                  String(item)
              )
              .join(", ");
        } else if (
          typeof data.errors ===
          "object"
        ) {
          errorMessage =
            Object.entries(
              data.errors
            )
              .map(
                ([field, message]) =>
                  `${field}: ${message}`
              )
              .join(", ");
        }
      }

      const error = new Error(
        errorMessage ||
        `HTTP ${response.status} Request Failed`
      );

      /*
       * Keep useful information
       * available to the caller.
       */
      error.status =
        response.status;

      error.data = data;

      throw error;
    }

    logResponse(
      method,
      url,
      response.status,
      data
    );

    return data;

  } catch (error) {

    /*
     * Don't duplicate FETCH_ERROR
     * for errors that already came
     * from the HTTP validation block.
     */
    if (
      error?.status
    ) {
      console.error(
        `[API ERROR] ❌ HTTP ${error.status} ${method} ${url}`,
        error.data || error.message
      );
    } else {
      logError(
        method,
        url,
        "FETCH_ERROR",
        error?.message || error
      );
    }

    throw error;
  }
};


/*
 * ============================================================
 * AUTH API
 * ============================================================
 */

export const authApi = {

  /*
   * Login
   */
  login: async (
    emailOrUsername,
    password
  ) => {

    return await apiFetch(
      "/api/auth/login",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          emailOrUsername,
          password,
        }),
      }
    );
  },


  /*
   * Register
   */
  register: async (
    userData
  ) => {

    return await apiFetch(
      "/api/auth/register",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          username:
            userData.username,

          email:
            userData.email,

          password:
            userData.password,

          phone:
            userData.phone,

          dob:
            userData.dob,

          gender:
            userData.gender,

          role:
            userData.role,

          profileImage:
            userData.profile_image ||
            userData.profilePhotoUrl ||
            "default.jpg",

          licenseNo:
            userData.license_no ||
            userData.licenseNumber ||
            null,

          licensePdfUrl:
            userData.licensePdfUrl ||
            null,
        }),
      }
    );
  },


  /*
   * Get current user profile.
   */
  getProfile: async (
    token
  ) => {

    const jwtToken =
      token ||
      localStorage.getItem(
        "jwtToken"
      );

    return await apiFetch(
      "/api/users/profile",
      {
        method: "GET",

        headers: {
          Authorization:
            `Bearer ${jwtToken}`,

          "Content-Type":
            "application/json",
        },
      }
    );
  },


  /*
   * Firebase file upload.
   */
  uploadFile: async (
    file,
    folderName = "profiles"
  ) => {

    console.log(
      `[Firebase Upload] Uploading file ${file?.name} to folder ${folderName}...`
    );

    return await uploadToFirebaseStorage(
      file,
      folderName
    );
  },


  /*
   * Driver license validation.
   */
  validateDriverLicense: async (
    licenseNo,
    licensePdfUrl
  ) => {

    console.log(
      `[License Verifier] Checking format for license: ${licenseNo}`
    );

    if (
      !licenseNo ||
      licenseNo.trim().length < 5
    ) {
      return {
        valid: false,
        message:
          "License number must be at least 5 characters long.",
      };
    }

    return {
      valid: true,
      message:
        "Driver license document submitted for manual Admin verification.",
    };
  },


  /*
   * Send OTP.
   */
  sendOtp: async (
    phone,
    isTripOtp = true
  ) => {

    const cleanPhone =
      phone
        .replace(/^\+91/, "")
        .replace(/[^0-9]/g, "");

    return await apiFetch(
      "/api/auth/send-otp",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          phone: cleanPhone,
          isTripOtp,
        }),
      }
    );
  },


  /*
   * Verify OTP.
   */
  verifyOtp: async (
    phone,
    otp
  ) => {

    const cleanPhone =
      phone
        .replace(/^\+91/, "")
        .replace(/[^0-9]/g, "");

    return await apiFetch(
      "/api/auth/verify-otp",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          phone: cleanPhone,
          otp,
        }),
      }
    );
  },


  /*
   * Check availability.
   */
  checkAvailability: async (
    params
  ) => {

    try {

      const query =
        new URLSearchParams(
          params
        ).toString();

      return await apiFetch(
        `/api/auth/check-availability?${query}`
      );

    } catch (error) {

      return {
        phoneExists: false,
        emailExists: false,
        usernameExists: false,
        licenseExists: false,
      };
    }
  },


  /*
   * Get all users.
   */
  getAllUsers: async () => {

    return await apiFetch(
      "/api/users/all"
    );
  },


  /*
   * Update user status.
   */
  updateUserStatus: async (
    userId,
    status
  ) => {

    return await apiFetch(
      `/api/users/${userId}/status`,
      {
        method: "PUT",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          status,
        }),
      }
    );
  },


  /*
   * Update user.
   */
  updateUser: async (
    userId,
    updatedFields
  ) => {

    return await apiFetch(
      `/api/users/${userId}`,
      {
        method: "PUT",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(
          updatedFields
        ),
      }
    );
  },


  /*
   * Delete user.
   */
  deleteUser: async (
    userId
  ) => {

    return await apiFetch(
      `/api/users/${userId}`,
      {
        method: "DELETE",
      }
    );
  },


  /*
   * Signed URL placeholder.
   */
  getSignedUrl: async (
    fileName
  ) => {

    return {
      uploadUrl:
        "https://storage.googleapis.com/mock-url",

      fileUrl:
        "default.jpg",
    };
  },


  /*
   * Get driver availability.
   */
  getDriverAvailability: async (
    driverId = 1
  ) => {

    try {

      return await apiFetch(
        `/api/drivers/${driverId}/availability`
      );

    } catch (error) {

      console.warn(
        "Backend availability endpoint notice:",
        error
      );

      const saved =
        localStorage.getItem(
          `driver_availability_${driverId}`
        );

      return saved
        ? JSON.parse(saved)
        : null;
    }
  },


  /*
   * Save driver availability.
   */
  saveDriverAvailability: async (
    driverId = 1,
    availability
  ) => {

    try {

      return await apiFetch(
        `/api/drivers/${driverId}/availability`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            availability
          ),
        }
      );

    } catch (error) {

      console.warn(
        "Backend availability save notice:",
        error
      );

      localStorage.setItem(
        `driver_availability_${driverId}`,
        JSON.stringify(
          availability
        )
      );

      return availability;
    }
  },
};


/*
 * ============================================================
 * COMPLAINT API
 * ============================================================
 */

export const complaintApi = {

  getAllComplaints:
    async () => {

      return await apiFetch(
        "/api/complaints"
      );
    },


  createComplaint:
    async (
      complaintData
    ) => {

      return await apiFetch(
        "/api/complaints",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            complaintData
          ),
        }
      );
    },


  updateComplaintStatus:
    async (
      complaintId,
      status,
      resolutionNotes
    ) => {

      return await apiFetch(
        `/api/complaints/${complaintId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            status,
            resolutionNotes,
          }),
        }
      );
    },


  deleteComplaint:
    async (
      complaintId
    ) => {

      return await apiFetch(
        `/api/complaints/${complaintId}`,
        {
          method: "DELETE",
        }
      );
    },
};


/*
 * ============================================================
 * RIDE API
 * ============================================================
 */

export const rideApi = {

  /*
   * Get ALL rides.
   *
   * GET /api/rides
   *
   * This is important for the Driver Ride Requests page.
   */
  getAllRides: async () => {

    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("jwtToken") ||
      sessionStorage.getItem("token") ||
      sessionStorage.getItem("jwtToken");

    const headers = {
      "Content-Type":
        "application/json",
    };

    if (token) {
      headers.Authorization =
        `Bearer ${token}`;
    }

    return await apiFetch(
      "/api/rides",
      {
        method: "GET",
        headers,
      }
    );
  },


  /*
   * Get ride by ID.
   *
   * GET /api/rides/{id}
   */
  getRideById: async (
    rideId
  ) => {

    return await apiFetch(
      `/api/rides/${rideId}`
    );
  },


  /*
   * Get rides for a user.
   *
   * GET /api/rides/user/{userId}
   */
  getRidesByUserId: async (userId) => {
    try {
      const res = await apiFetch(`/api/rides/user/${userId}`);
      if (Array.isArray(res)) return res;
    } catch (e) {
      console.warn("[Ride API] Gateway fetch notice for user rides, attempting fallback:", e);
    }

    try {
      const directResp = await fetch(`http://localhost:8082/api/rides/user/${userId}`);
      if (directResp.ok) {
        const data = await directResp.json();
        if (Array.isArray(data)) return data;
      }
    } catch (e) {}

    try {
      const allRides = await rideApi.getAllRides();
      if (Array.isArray(allRides)) {
        return allRides.filter((r) => String(r.userId || r.user_id) === String(userId));
      }
    } catch (e) {}

    return [];
  },


  /*
   * Get rides assigned to driver.
   *
   * GET /api/rides/driver/{driverId}
   */
  getRidesByDriverId: async (
    driverId
  ) => {

    return await apiFetch(
      `/api/rides/driver/${driverId}`
    );
  },


  /*
   * ========================================================
   * CREATE RIDE
   * ========================================================
   *
   * Backend:
   *
   * POST /api/rides
   *
   * CreateRideRequest:
   *
   * {
   *   userId,
   *   vehicleId,
   *   source,
   *   destination
   * }
   *
   * IMPORTANT:
   *
   * Do NOT send:
   * - fare
   * - vehicleType
   * - status
   * - paymentMode
   *
   * The backend creates the ride with:
   *
   * status = 0
   *
   * 0 = Requested
   */
  createRide: async (
    rideData
  ) => {

    /*
     * Validate input before sending.
     */
    if (!rideData) {
      throw new Error(
        "Ride data is required."
      );
    }

    if (
      rideData.userId ===
      undefined ||
      rideData.userId ===
      null
    ) {
      throw new Error(
        "User ID is required."
      );
    }

    if (
      rideData.vehicleId ===
      undefined ||
      rideData.vehicleId ===
      null
    ) {
      throw new Error(
        "Vehicle ID is required."
      );
    }

    if (
      !rideData.source ||
      !rideData.source.trim()
    ) {
      throw new Error(
        "Source location is required."
      );
    }

    if (
      !rideData.destination ||
      !rideData.destination.trim()
    ) {
      throw new Error(
        "Destination location is required."
      );
    }

    /*
     * IMPORTANT:
     *
     * Build a NEW object.
     *
     * This prevents accidental fields such as
     * fare/status/paymentMode from being sent.
     */
    const payload = {
      userId:
        Number(rideData.userId),

      vehicleId:
        Number(rideData.vehicleId),

      source:
        rideData.source.trim(),

      destination:
        rideData.destination.trim(),
    };

    console.log(
      "%c[Ride API] 📦 CREATE RIDE PAYLOAD:",
      "color: #f59e0b; font-weight: bold;",
      payload
    );

    /*
     * Final payload should look like:
     *
     * {
     *   userId: 3,
     *   vehicleId: 1,
     *   source: "Kothrud, Pune",
     *   destination: "Viman Nagar, Pune"
     * }
     */
    const response =
      await apiFetch(
        "/api/rides",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            payload
          ),
        }
      );

    console.log(
      "%c[Ride API] ✅ CREATE RIDE RESPONSE:",
      "color: #22c55e; font-weight: bold;",
      response
    );

    return response;
  },


  /*
   * Accept ride.
   *
   * PUT /api/rides/{id}/accept
   */
  acceptRide: async (
    rideId,
    driverId
  ) => {

    const numericId =
      String(rideId)
        .replace(/^REQ-/, "")
        .replace(/^RIDE-/, "");

    return await apiFetch(
      `/api/rides/${numericId}/accept`,
      {
        method: "PUT",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          driverId:
            Number(driverId),
        }),
      }
    );
  },


  /*
   * Start ride.
   *
   * PUT /api/rides/{id}/start
   *
   * Backend changes:
   * status = 2
   */
  startRide: async (
    rideId
  ) => {

    const numericId =
      String(rideId)
        .replace(/^REQ-/, "")
        .replace(/^RIDE-/, "");

    return await apiFetch(
      `/api/rides/${numericId}/start`,
      {
        method: "PUT",
      }
    );
  },


  /*
   * Complete ride.
   *
   * PUT /api/rides/{id}/complete
   *
   * Backend changes:
   * status = 1
   */
  completeRide: async (
    rideId
  ) => {

    const numericId =
      String(rideId)
        .replace(/^REQ-/, "")
        .replace(/^RIDE-/, "");

    return await apiFetch(
      `/api/rides/${numericId}/complete`,
      {
        method: "PUT",
      }
    );
  },


  /*
   * Alias for completeRide.
   */
  completeTrip: async (
    rideId
  ) => {

    const numericId =
      String(rideId)
        .replace(/^REQ-/, "")
        .replace(/^RIDE-/, "");

    return await apiFetch(
      `/api/rides/${numericId}/complete`,
      {
        method: "PUT",
      }
    );
  },


  /*
   * Confirm payment.
   *
   * POST /api/rides/{id}/confirm-payment
   */
  confirmPayment: async (
    rideId,
    paymentData
  ) => {

    const numericId =
      String(rideId)
        .replace(/^REQ-/, "")
        .replace(/^RIDE-/, "");

    return await apiFetch(
      `/api/rides/${numericId}/confirm-payment`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(
          paymentData
        ),
      }
    );
  },
};


/*
 * ============================================================
 * PAYMENT API
 * ============================================================
 */

export const paymentApi = {

  /*
   * Get all payments.
   */
  getAllPayments: async () => {

    const response =
      await apiFetch(
        "/api/payments"
      );

    return Array.isArray(response)
      ? response
      : response?.data || [];
  },


  /*
   * Process payment.
   */
  processPayment: async (
    paymentRequest
  ) => {

    const response =
      await apiFetch(
        "/api/payments/process",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            paymentRequest
          ),
        }
      );

    return (
      response?.data ||
      response
    );
  },
};

