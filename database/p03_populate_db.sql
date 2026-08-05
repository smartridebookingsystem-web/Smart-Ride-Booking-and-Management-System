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

--
-- Dumping data for table `roles`
--
LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` (`role_id`, `role_value`) VALUES
(1, 'admin'),
(2, 'driver'),
(3, 'rider')
ON DUPLICATE KEY UPDATE `role_value` = VALUES(`role_value`);
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `users` (Names: gitanjali, sulkshana, dhananjay, keshav, manish, rutuja, mukesh, aaditya, aniket, priyansh, sanket, vaibhav)
--
LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`user_id`, `role_id`, `username`, `email`, `password`, `phone`, `dob`, `profile_image`, `gender`, `status`, `created_at`) VALUES
(1, 1, 'gitanjali', 'gitanjali@srbms.com', '$2a$10$h8jjhVjvw6hl/C.BPWs.keQooYyySSY1olp56bxCGhjsoTG5WhiES', '9876543201', '1990-01-01', 'default.jpg', 'female', 'active', '2026-07-02 22:18:06'),
(2, 2, 'sulkshana', 'sulkshana@driver.com', '$2a$10$ImVqKtBs8N9jHfhmSqr4mOhOG8vBorcwblBBb11Ap1ZTjn4HdXsZW', '9876543202', '1992-05-15', 'default.jpg', 'female', 'active', '2026-07-02 22:18:06'),
(3, 3, 'dhananjay', 'dhananjay@rider.com', '$2a$10$dJ/ALunM9GBplxmPiFHuO.KzbXyU85OtDMuqGjCpUBEketz9EGa2C', '9876543203', '1995-08-20', 'default.jpg', 'male', 'active', '2026-07-02 22:18:06'),
(4, 3, 'keshav', 'keshav@rider.com', '$2a$10$dJ/ALunM9GBplxmPiFHuO.KzbXyU85OtDMuqGjCpUBEketz9EGa2C', '9876543204', '1998-12-10', 'default.jpg', 'male', 'active', '2026-07-02 22:18:06'),
(5, 2, 'manish', 'manish@driver.com', '$2a$10$ImVqKtBs8N9jHfhmSqr4mOhOG8vBorcwblBBb11Ap1ZTjn4HdXsZW', '9876543205', '1991-03-25', 'default.jpg', 'male', 'active', '2026-07-02 22:18:06'),
(6, 3, 'rutuja', 'rutuja@rider.com', '$2a$10$dJ/ALunM9GBplxmPiFHuO.KzbXyU85OtDMuqGjCpUBEketz9EGa2C', '9876543206', '1997-04-12', 'default.jpg', 'female', 'active', '2026-07-05 10:20:00'),
(7, 2, 'mukesh', 'mukesh@driver.com', '$2a$10$ImVqKtBs8N9jHfhmSqr4mOhOG8vBorcwblBBb11Ap1ZTjn4HdXsZW', '9876543207', '1989-09-18', 'default.jpg', 'male', 'active', '2026-07-06 11:30:00'),
(8, 3, 'aaditya', 'aaditya@rider.com', '$2a$10$dJ/ALunM9GBplxmPiFHuO.KzbXyU85OtDMuqGjCpUBEketz9EGa2C', '9876543208', '1996-02-14', 'default.jpg', 'male', 'active', '2026-07-07 14:15:00'),
(9, 2, 'aniket', 'aniket@driver.com', '$2a$10$ImVqKtBs8N9jHfhmSqr4mOhOG8vBorcwblBBb11Ap1ZTjn4HdXsZW', '9876543209', '1993-11-30', 'default.jpg', 'male', 'active', '2026-07-08 09:45:00'),
(10, 3, 'priyansh', 'priyansh@rider.com', '$2a$10$dJ/ALunM9GBplxmPiFHuO.KzbXyU85OtDMuqGjCpUBEketz9EGa2C', '9876543210', '1999-07-07', 'default.jpg', 'male', 'active', '2026-07-09 16:00:00'),
(11, 2, 'sanket', 'sanket@driver.com', '$2a$10$ImVqKtBs8N9jHfhmSqr4mOhOG8vBorcwblBBb11Ap1ZTjn4HdXsZW', '9876543211', '1994-06-22', 'default.jpg', 'male', 'active', '2026-07-10 12:10:00'),
(12, 3, 'vaibhav', 'vaibhav@rider.com', '$2a$10$dJ/ALunM9GBplxmPiFHuO.KzbXyU85OtDMuqGjCpUBEketz9EGa2C', '9876543212', '1995-01-25', 'default.jpg', 'male', 'active', '2026-07-11 08:30:00')
ON DUPLICATE KEY UPDATE `username` = VALUES(`username`), `email` = VALUES(`email`), `phone` = VALUES(`phone`);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `driver` (5 Drivers: sulkshana, manish, mukesh, aniket, sanket)
--
LOCK TABLES `driver` WRITE;
/*!40000 ALTER TABLE `driver` DISABLE KEYS */;
INSERT INTO `driver` (`driver_id`, `user_id`, `license_no`, `status`) VALUES
(1, 2, 'DL-SULK-2026-01', 'verified'),
(2, 5, 'DL-MANI-2026-02', 'verified'),
(3, 7, 'DL-MUKE-2026-03', 'verified'),
(4, 9, 'DL-ANIK-2026-04', 'verified'),
(5, 11, 'DL-SANK-2026-05', 'verified')
ON DUPLICATE KEY UPDATE `license_no` = VALUES(`license_no`), `status` = VALUES(`status`);
/*!40000 ALTER TABLE `driver` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `vehicle_type`
--
LOCK TABLES `vehicle_type` WRITE;
/*!40000 ALTER TABLE `vehicle_type` DISABLE KEYS */;
INSERT INTO `vehicle_type` (`vehicle_type_id`, `type_name`) VALUES
(1, 'Hatchback'),
(2, 'Sedan'),
(3, 'SUV')
ON DUPLICATE KEY UPDATE `type_name` = VALUES(`type_name`);
/*!40000 ALTER TABLE `vehicle_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `fare`
--
LOCK TABLES `fare` WRITE;
/*!40000 ALTER TABLE `fare` DISABLE KEYS */;
INSERT INTO `fare` (`fare_id`, `vehicle_type_id`, `base_fare`, `per_km_fare`) VALUES
(1, 1, 25.00, 8.00),
(2, 2, 30.00, 10.00),
(3, 3, 35.00, 15.00)
ON DUPLICATE KEY UPDATE `base_fare` = VALUES(`base_fare`), `per_km_fare` = VALUES(`per_km_fare`);
/*!40000 ALTER TABLE `fare` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `vehicle` (5 Vehicles)
--
LOCK TABLES `vehicle` WRITE;
/*!40000 ALTER TABLE `vehicle` DISABLE KEYS */;
INSERT INTO `vehicle` (`vehicle_id`, `driver_id`, `vehicle_type_id`, `vehicle_no`, `documents`, `capacity`, `status`) VALUES
(1, 2, 3, 'MH12AB1234', 'manish_suv.pdf', 7, 'verified'),
(2, 1, 1, 'MH14CD5678', 'sulkshana_hatchback.pdf', 4, 'verified'),
(3, 3, 2, 'MH12EF9012', 'mukesh_sedan.pdf', 4, 'verified'),
(4, 4, 3, 'MH14GH3456', 'aniket_suv.pdf', 7, 'verified'),
(5, 5, 2, 'MH12IJ7890', 'sanket_sedan.pdf', 4, 'verified')
ON DUPLICATE KEY UPDATE `vehicle_no` = VALUES(`vehicle_no`);
/*!40000 ALTER TABLE `vehicle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `ride` (10 Records for: keshav, dhananjay, rutuja, aaditya, priyansh, vaibhav)
--
LOCK TABLES `ride` WRITE;
/*!40000 ALTER TABLE `ride` DISABLE KEYS */;
INSERT INTO `ride` (`ride_id`, `user_id`, `vehicle_id`, `source`, `destination`, `status`) VALUES
(1, 4, 1, 'Sangli Bus Stand', 'VPIMSR College', 1),
(2, 3, 2, 'Shivaji University', 'Railway Station', 1),
(3, 6, 3, 'Vishrambag, Sangli', 'Sangli Central', 1),
(4, 8, 4, 'Kothrud, Pune', 'Viman Nagar, Pune', 1),
(5, 10, 5, 'Market Yard', 'Ganapati Temple', 1),
(6, 12, 1, 'Sangli Railway Station', 'Miraj Bus Stand', 1),
(7, 4, 2, 'Kupwad MIDC', 'Willingdon College', 1),
(8, 3, 3, 'Civil Hospital', 'Sangli Fort', 1),
(9, 6, 4, 'Pune Airport', 'Deccan Gymkhana', 2),
(10, 8, 5, 'Sangli Bus Stand', 'Vishrambag', 2)
ON DUPLICATE KEY UPDATE `source` = VALUES(`source`), `destination` = VALUES(`destination`), `status` = VALUES(`status`);
/*!40000 ALTER TABLE `ride` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `driver_ride` (10 Assignments)
--
LOCK TABLES `driver_ride` WRITE;
/*!40000 ALTER TABLE `driver_ride` DISABLE KEYS */;
INSERT INTO `driver_ride` (`driver_ride_id`, `ride_id`, `driver_id`, `created_at`) VALUES
(1, 1, 2, '2026-07-02 22:37:02'),
(2, 2, 1, '2026-07-02 22:37:02'),
(3, 3, 3, '2026-07-05 11:00:00'),
(4, 4, 4, '2026-07-07 15:30:00'),
(5, 5, 5, '2026-07-09 17:15:00'),
(6, 6, 2, '2026-07-11 09:00:00'),
(7, 7, 1, '2026-07-15 14:20:00'),
(8, 8, 3, '2026-07-18 10:45:00'),
(9, 9, 4, '2026-07-22 18:00:00'),
(10, 10, 5, '2026-07-28 12:30:00')
ON DUPLICATE KEY UPDATE `driver_id` = VALUES(`driver_id`);
/*!40000 ALTER TABLE `driver_ride` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `payment` (10 Payments)
--
LOCK TABLES `payment` WRITE;
/*!40000 ALTER TABLE `payment` DISABLE KEYS */;
INSERT INTO `payment` (`payment_id`, `transaction_id`, `ride_id`, `user_id`, `total_fare`, `discount_amount`, `net_amount`, `payment_mode`, `payment_status`, `gateway_ref`, `created_at`) VALUES
(1, 'TXN_SEED_001', 1, 4, 250.00, 0.00, 250.00, 'UPI', 'SUCCESS', 'UPI_GW_SEED01', '2026-07-02 22:37:07'),
(2, 'TXN_SEED_002', 2, 3, 180.00, 0.00, 180.00, 'CASH', 'SUCCESS', 'CASH_GW_SEED02', '2026-07-02 22:37:07'),
(3, 'TXN_SEED_003', 3, 6, 220.00, 0.00, 220.00, 'UPI', 'SUCCESS', 'UPI_GW_SEED03', '2026-07-05 11:15:00'),
(4, 'TXN_SEED_004', 4, 8, 350.00, 0.00, 350.00, 'CARD', 'SUCCESS', 'CARD_GW_SEED04', '2026-07-07 15:45:00'),
(5, 'TXN_SEED_005', 5, 10, 160.00, 0.00, 160.00, 'UPI', 'SUCCESS', 'UPI_GW_SEED05', '2026-07-09 17:30:00'),
(6, 'TXN_SEED_006', 6, 12, 290.00, 0.00, 290.00, 'CASH', 'SUCCESS', 'CASH_GW_SEED06', '2026-07-11 09:25:00'),
(7, 'TXN_SEED_007', 7, 4, 200.00, 0.00, 200.00, 'UPI', 'SUCCESS', 'UPI_GW_SEED07', '2026-07-15 14:40:00'),
(8, 'TXN_SEED_008', 8, 3, 150.00, 0.00, 150.00, 'CARD', 'SUCCESS', 'CARD_GW_SEED08', '2026-07-18 11:00:00'),
(9, 'TXN_SEED_009', 9, 6, 420.00, 0.00, 420.00, 'UPI', 'PENDING', 'UPI_GW_SEED09', '2026-07-22 18:05:00'),
(10, 'TXN_SEED_010', 10, 8, 160.00, 0.00, 160.00, 'UPI', 'PENDING', 'UPI_GW_SEED10', '2026-07-28 12:35:00')
ON DUPLICATE KEY UPDATE `total_fare` = VALUES(`total_fare`), `payment_status` = VALUES(`payment_status`);
/*!40000 ALTER TABLE `payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `rider_wallet`
--
LOCK TABLES `rider_wallet` WRITE;
/*!40000 ALTER TABLE `rider_wallet` DISABLE KEYS */;
INSERT INTO `rider_wallet` (`wallet_id`, `user_id`, `balance`) VALUES
(1, 3, 1250.00),
(2, 4, 1850.00),
(3, 6, 750.00),
(4, 8, 2200.00),
(5, 10, 500.00),
(6, 12, 900.00)
ON DUPLICATE KEY UPDATE `balance` = VALUES(`balance`);
/*!40000 ALTER TABLE `rider_wallet` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `review` (10 Review Records)
--
LOCK TABLES `review` WRITE;
/*!40000 ALTER TABLE `review` DISABLE KEYS */;
INSERT INTO `review` (`review_id`, `ride_id`, `rider_id`, `driver_id`, `rating`, `comments`, `created_at`) VALUES
(1, 1, 4, 2, 5, 'Excellent service.', '2026-07-02 22:37:15'),
(2, 2, 3, 1, 4, 'Comfortable ride.', '2026-07-02 22:37:15'),
(3, 3, 6, 3, 5, 'Very smooth driving by Mukesh.', '2026-07-05 11:30:00'),
(4, 4, 8, 4, 5, 'Aniket was polite and punctual.', '2026-07-07 16:00:00'),
(5, 5, 10, 5, 4, 'Great ride experience with Sanket.', '2026-07-09 17:45:00'),
(6, 6, 12, 2, 5, 'Manish drove very safely.', '2026-07-11 09:40:00'),
(7, 7, 4, 1, 5, 'Sulkshana is a top rated driver!', '2026-07-15 15:00:00'),
(8, 8, 3, 3, 4, 'Clean vehicle and good AC.', '2026-07-18 11:15:00'),
(9, 9, 6, 4, 5, 'Fast pickup and polite talk.', '2026-07-22 18:20:00'),
(10, 10, 8, 5, 5, 'Overall excellent ride quality.', '2026-07-28 12:50:00')
ON DUPLICATE KEY UPDATE `rating` = VALUES(`rating`), `comments` = VALUES(`comments`);
/*!40000 ALTER TABLE `review` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `complaint` (10 Complaint Records)
--
LOCK TABLES `complaint` WRITE;
/*!40000 ALTER TABLE `complaint` DISABLE KEYS */;
INSERT INTO `complaint` (`complaint_id`, `user_id`, `ride_id`, `subject`, `description`, `category`, `status`, `resolution_notes`, `created_at`) VALUES
(1, 4, 1, 'Driver arrived late for pickup', 'The driver arrived 20 minutes past the scheduled time without prior notification.', 'Late Pickup', 'Open', NULL, '2026-07-25 10:15:00'),
(2, 3, 2, 'Incorrect fare deducted', 'I was charged extra ₹50 for luggage which was supposed to be included.', 'Fare Dispute', 'In Progress', 'Support team is reviewing transaction details with payment provider.', '2026-07-26 14:30:00'),
(3, 4, 3, 'Unpolite behavior by driver', 'Driver was talking loudly on phone while driving.', 'Driver Behavior', 'Resolved', 'Driver advised regarding customer service standards and issued a warning.', '2026-07-27 09:00:00'),
(4, 6, 4, 'Air Conditioning Not Working', 'AC was not switched on during afternoon heat.', 'Vehicle Quality', 'Resolved', 'Driver verified and fixed AC compressor unit.', '2026-07-28 11:00:00'),
(5, 8, 5, 'Navigation Route Delay', 'Driver took longer route than shown on Leaflet GPS map.', 'Route Dispute', 'In Progress', 'Checking OpenRouteService log for route comparison.', '2026-07-28 13:20:00'),
(6, 10, 6, 'Overcharged Peak Toll Fee', 'Toll fee charged twice in invoice summary.', 'Billing Issue', 'Open', NULL, '2026-07-29 09:10:00'),
(7, 12, 7, 'Driver Cancelled After 10 Mins', 'Driver cancelled booking after making me wait at pickup point.', 'Cancellation Dispute', 'Resolved', 'Issued ₹50 wallet compensation credit.', '2026-07-29 15:45:00'),
(8, 4, 8, 'Cleanliness Issue', 'Vehicle seat covers were dusty.', 'Vehicle Quality', 'Resolved', 'Driver notified to clean vehicle interior daily.', '2026-07-30 08:30:00'),
(9, 3, 9, 'UPI Payment Status Pending', 'Payment deducted from bank but showing pending in app.', 'Payment Gateway', 'In Progress', 'Verifying transaction ref with bank aggregator.', '2026-07-31 16:00:00'),
--
-- Dumping data for table `otp_verification`
--
LOCK TABLES `otp_verification` WRITE;
/*!40000 ALTER TABLE `otp_verification` DISABLE KEYS */;
INSERT INTO `otp_verification` (`id`, `ride_id`, `phone`, `otp_code`, `status`, `created_at`, `expires_at`) VALUES
(1, 1, '9876543204', '4892', 'VERIFIED', '2026-07-25 10:15:00', '2026-07-25 10:20:00'),
(2, 2, '9876543203', '1234', 'VERIFIED', '2026-07-26 14:30:00', '2026-07-26 14:35:00')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`), `otp_code` = VALUES(`otp_code`);
/*!40000 ALTER TABLE `otp_verification` ENABLE KEYS */;
UNLOCK TABLES;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

