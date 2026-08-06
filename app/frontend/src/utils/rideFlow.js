/**
 * Maps logged-in user_id to driver_id (from p03_populate_db.sql).
 */
const USER_TO_DRIVER = {
  2: 1, // sulkshana
  5: 2, // manish
  7: 3, // mukesh
  9: 4, // aniket
  11: 5, // sanket
};

export function getDriverIdFromUser(user) {
  const userId = Number(user?.userId || user?.id);
  return USER_TO_DRIVER[userId] || 1;
}

/**
 * vehicle_type_id -> vehicle_id in DB (first available vehicle of that type).
 */
export const VEHICLE_TYPE_TO_ID = {
  Hatchback: 2,
  Sedan: 3,
  SUV: 1,
};

export function saveActiveRideMeta(rideId, meta) {
  const payload = { rideId: Number(rideId), ...meta, updatedAt: Date.now() };
  localStorage.setItem(`ride_meta_${rideId}`, JSON.stringify(payload));
  localStorage.setItem("active_ride", JSON.stringify(payload));
}

export function getActiveRideMeta(rideId) {
  try {
    const raw = localStorage.getItem(`ride_meta_${rideId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getStoredActiveRide() {
  try {
    const raw = localStorage.getItem("active_ride");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function markRideAwaitingPayment(rideId) {
  localStorage.setItem(`awaiting_payment_${rideId}`, "true");
}

export function isRideAwaitingPayment(rideId) {
  return localStorage.getItem(`awaiting_payment_${rideId}`) === "true";
}

export function clearRideFlowData(rideId) {
  localStorage.removeItem(`awaiting_payment_${rideId}`);
  localStorage.removeItem(`ride_meta_${rideId}`);
  localStorage.removeItem(`otp_${rideId}`);
  sessionStorage.removeItem(`otp_${rideId}`);
  const active = getStoredActiveRide();
  if (active?.rideId === Number(rideId)) {
    localStorage.removeItem("active_ride");
  }
}

export const RIDE_STATUS = {
  REQUESTED: 0,
  COMPLETED: 1,
  IN_PROGRESS: 2,
  ACCEPTED: 3,
};

export function rideStatusLabel(status) {
  switch (Number(status)) {
    case RIDE_STATUS.REQUESTED:
      return "Requested";
    case RIDE_STATUS.COMPLETED:
      return "Completed";
    case RIDE_STATUS.IN_PROGRESS:
      return "In Progress";
    case RIDE_STATUS.ACCEPTED:
      return "Accepted";
    default:
      return String(status);
  }
}
