USE `p03_srbms`;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Clear existing data safely
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM `otp_verification`;
DELETE FROM `complaint`;
DELETE FROM `review`;
DELETE FROM `rider_wallet`;
DELETE FROM `payment`;
DELETE FROM `driver_ride`;
DELETE FROM `ride`;
DELETE FROM `vehicle`;
DELETE FROM `fare`;
DELETE FROM `vehicle_type`;
DELETE FROM `driver`;
DELETE FROM `users`;
DELETE FROM `roles`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Roles
INSERT INTO `roles` (`role_id`, `role_value`) VALUES
(1, 'admin'),
(2, 'driver'),
(3, 'rider');

-- 2. Users (3 Users)
INSERT INTO `users` (`user_id`, `role_id`, `username`, `email`, `password`, `phone`, `dob`, `profile_image`, `gender`, `status`, `created_at`) VALUES
(1, 1, 'gitanjali', 'gitanjali@srbms.com', '$2a$10$h8jjhVjvw6hl/C.BPWs.keQooYyySSY1olp56bxCGhjsoTG5WhiES', '9322128189', '1990-01-01', 'default.jpg', 'female', 'active', '2026-07-01 10:00:00'),
(2, 2, 'sulkshana', 'sulkshana@driver.com', '$2a$10$ImVqKtBs8N9jHfhmSqr4mOhOG8vBorcwblBBb11Ap1ZTjn4HdXsZW', '7263850816', '1992-05-15', 'default.jpg', 'female', 'active', '2026-07-01 10:00:00'),
(3, 3, 'dhananjay', 'dhananjay@rider.com', '$2a$10$dJ/ALunM9GBplxmPiFHuO.KzbXyU85OtDMuqGjCpUBEketz9EGa2C', '9876543210', '1995-08-20', 'default.jpg', 'male', 'active', '2026-07-01 10:00:00');

-- 3. Driver
INSERT INTO `driver` (`driver_id`, `user_id`, `license_no`, `status`) VALUES
(1, 2, 'DL-SULK-2026-01', 'verified');

-- 4. Vehicle Type
INSERT INTO `vehicle_type` (`vehicle_type_id`, `type_name`) VALUES
(1, 'Hatchback'),
(2, 'Sedan'),
(3, 'SUV');

-- 5. Fare
INSERT INTO `fare` (`fare_id`, `vehicle_type_id`, `base_fare`, `per_km_fare`) VALUES
(1, 1, 25.00, 8.00),
(2, 2, 30.00, 10.00),
(3, 3, 35.00, 15.00);

-- 6. Vehicle
INSERT INTO `vehicle` (`vehicle_id`, `driver_id`, `vehicle_type_id`, `vehicle_no`, `documents`, `capacity`, `status`) VALUES
(1, 1, 1, 'MH12AB1234', 'sulkshana_hatchback.pdf', 4, 'verified'),
(2, 1, 2, 'MH14CD5678', 'sulkshana_sedan.pdf', 4, 'verified'),
(3, 1, 3, 'MH12EF9012', 'sulkshana_suv.pdf', 6, 'verified');

-- 7. Ride (Dummy Pune Rides with 1 Month Date Range: 15 July 2026 to 5 Aug 2026)
INSERT INTO `ride` (`ride_id`, `user_id`, `vehicle_id`, `source`, `destination`, `status`, `fare`) VALUES
(1, 3, 1, 'Nanded City, Pune', 'Deccan Corner, Pune', 1, 240.00),
(2, 3, 1, 'Yerwada, Pune', 'Sadashiv Peth, Pune', 1, 190.00),
(3, 3, 1, 'Kothrud, Pune', 'Viman Nagar, Pune', 1, 320.00),
(4, 3, 1, 'Hinjewadi Phase 1, Pune', 'Baner, Pune', 2, 150.00);

-- 8. Driver Ride (Timestamps spanning 15 July 2026, 26 July 2026, 4 Aug 2026, 5 Aug 2026)
INSERT INTO `driver_ride` (`driver_ride_id`, `ride_id`, `driver_id`, `created_at`) VALUES
(1, 1, 1, '2026-07-15 10:30:00'),
(2, 2, 1, '2026-07-26 15:45:00'),
(3, 3, 1, '2026-08-04 09:15:00'),
(4, 4, 1, '2026-08-05 18:30:00');

-- 9. Payment (Timestamps spanning 15 July 2026, 26 July 2026, 4 Aug 2026, 5 Aug 2026)
INSERT INTO `payment` (`payment_id`, `transaction_id`, `ride_id`, `user_id`, `total_fare`, `discount_amount`, `net_amount`, `payment_mode`, `payment_status`, `gateway_ref`, `created_at`) VALUES
(1, 'TXN_PUNE_001', 1, 3, 240.00, 0.00, 240.00, 'UPI', 'SUCCESS', 'UPI_GW_PUNE01', '2026-07-15 10:55:00'),
(2, 'TXN_PUNE_002', 2, 3, 190.00, 0.00, 190.00, 'CASH', 'SUCCESS', 'CASH_GW_PUNE02', '2026-07-26 16:15:00'),
(3, 'TXN_PUNE_003', 3, 3, 320.00, 0.00, 320.00, 'UPI', 'SUCCESS', 'UPI_GW_PUNE03', '2026-08-04 09:50:00'),
(4, 'TXN_PUNE_004', 4, 3, 150.00, 0.00, 150.00, 'UPI', 'PENDING', 'UPI_GW_PUNE04', '2026-08-05 18:32:00');

-- 10. Rider Wallet
INSERT INTO `rider_wallet` (`wallet_id`, `user_id`, `balance`) VALUES
(1, 3, 1500.00);

-- 11. Review (Timestamps for completed rides on 15 July, 26 July, 4 Aug)
INSERT INTO `review` (`review_id`, `ride_id`, `rider_id`, `driver_id`, `rating`, `comments`, `created_at`) VALUES
(1, 1, 3, 1, 5, 'Great ride from Nanded City to Deccan Corner with Sulkshana!', '2026-07-15 11:10:00'),
(2, 2, 3, 1, 5, 'Punctual pickup at Yerwada, smooth drive to Sadashiv Peth.', '2026-07-26 16:30:00'),
(3, 3, 3, 1, 4, 'Very comfortable journey across Pune.', '2026-08-04 10:05:00');

-- 12. Complaint
INSERT INTO `complaint` (`complaint_id`, `user_id`, `ride_id`, `subject`, `description`, `category`, `status`, `resolution_notes`, `created_at`) VALUES
(1, 3, 1, 'Route Inquiry', 'Checking alternative route options during peak hours.', 'Route Dispute', 'Resolved', 'Fastest route verified via live GPS mapping.', '2026-07-15 14:20:00');

-- 13. OTP Verification
INSERT INTO `otp_verification` (`id`, `ride_id`, `phone`, `otp_code`, `status`, `created_at`, `expires_at`) VALUES
(1, 4, '9876543210', '1234', 'VERIFIED', '2026-08-05 18:30:00', '2026-08-05 18:40:00');

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
