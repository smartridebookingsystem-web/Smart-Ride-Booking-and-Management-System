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
-- Dumping data for table `users`
--
LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`user_id`, `role_id`, `username`, `email`, `password`, `phone`, `dob`, `profile_image`, `gender`, `status`, `created_at`) VALUES
(1, 1, 'gitanjali', 'gitanjali@srbms.com', '$2a$10$h8jjhVjvw6hl/C.BPWs.keQooYyySSY1olp56bxCGhjsoTG5WhiES', '9876543201', '1990-01-01', 'default.jpg', 'female', 'active', '2026-07-02 22:18:06'),
(2, 2, 'sulkshana', 'sulkshana@driver.com', '$2a$10$ImVqKtBs8N9jHfhmSqr4mOhOG8vBorcwblBBb11Ap1ZTjn4HdXsZW', '9876543202', '1992-05-15', 'default.jpg', 'female', 'active', '2026-07-02 22:18:06'),
(3, 3, 'dhananjay', 'dhananjay@rider.com', '$2a$10$dJ/ALunM9GBplxmPiFHuO.KzbXyU85OtDMuqGjCpUBEketz9EGa2C', '9876543203', '1995-08-20', 'default.jpg', 'male', 'active', '2026-07-02 22:18:06'),
(4, 3, 'keshav', 'keshav@rider.com', '$2a$10$dJ/ALunM9GBplxmPiFHuO.KzbXyU85OtDMuqGjCpUBEketz9EGa2C', '9876543204', '1998-12-10', 'default.jpg', 'male', 'active', '2026-07-02 22:18:06'),
(5, 2, 'manish', 'manish@driver.com', '$2a$10$ImVqKtBs8N9jHfhmSqr4mOhOG8vBorcwblBBb11Ap1ZTjn4HdXsZW', '9876543205', '1991-03-25', 'default.jpg', 'male', 'active', '2026-07-02 22:18:06');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `driver`
--
LOCK TABLES `driver` WRITE;
/*!40000 ALTER TABLE `driver` DISABLE KEYS */;
INSERT INTO `driver` (`driver_id`, `user_id`, `license_no`, `status`) VALUES
(1, 2, 'DL-SULK-2026-01', 'verified'),
(2, 5, 'DL-MANI-2026-02', 'verified');
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
(3, 'SUV');
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
(3, 3, 35.00, 15.00);
/*!40000 ALTER TABLE `fare` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `vehicle`
--
LOCK TABLES `vehicle` WRITE;
/*!40000 ALTER TABLE `vehicle` DISABLE KEYS */;
INSERT INTO `vehicle` (`vehicle_id`, `driver_id`, `vehicle_type_id`, `vehicle_no`, `documents`, `capacity`, `status`) VALUES
(1, 2, 3, 'MH12AB1234', 'manish_suv.pdf', 7, 'verified'),
(2, 1, 1, 'MH14CD5678', 'sulkshana_hatchback.pdf', 4, 'verified');
/*!40000 ALTER TABLE `vehicle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `ride`
--
LOCK TABLES `ride` WRITE;
/*!40000 ALTER TABLE `ride` DISABLE KEYS */;
INSERT INTO `ride` (`ride_id`, `user_id`, `vehicle_id`, `source`, `destination`, `status`) VALUES
(1, 4, 1, 'Sangli Bus Stand', 'VPIMSR College', 1),
(2, 3, 2, 'Shivaji University', 'Railway Station', 1),
(3, 4, 1, 'Market Yard', 'Ganapati Temple', 2);
/*!40000 ALTER TABLE `ride` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `driver_ride`
--
LOCK TABLES `driver_ride` WRITE;
/*!40000 ALTER TABLE `driver_ride` DISABLE KEYS */;
INSERT INTO `driver_ride` (`driver_ride_id`, `ride_id`, `driver_id`, `created_at`) VALUES
(1, 1, 2, '2026-07-02 22:37:02'),
(2, 2, 1, '2026-07-02 22:37:02'),
(3, 3, 2, '2026-07-02 22:37:02');
/*!40000 ALTER TABLE `driver_ride` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `payment`
--
LOCK TABLES `payment` WRITE;
/*!40000 ALTER TABLE `payment` DISABLE KEYS */;
INSERT INTO `payment` (`payment_id`, `transaction_id`, `ride_id`, `user_id`, `total_fare`, `discount_amount`, `net_amount`, `payment_mode`, `payment_status`, `gateway_ref`, `created_at`) VALUES
(1, 'TXN_SEED_001', 1, 4, 250.00, 0.00, 250.00, 'UPI', 'SUCCESS', 'UPI_GW_SEED01', '2026-07-02 22:37:07'),
(2, 'TXN_SEED_002', 2, 3, 180.00, 0.00, 180.00, 'CASH', 'SUCCESS', 'CASH_GW_SEED02', '2026-07-02 22:37:07'),
(3, 'TXN_SEED_003', 3, 4, 320.00, 0.00, 320.00, 'CARD', 'SUCCESS', 'CARD_GW_SEED03', '2026-07-02 22:37:07');
/*!40000 ALTER TABLE `payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `rider_wallet`
--
LOCK TABLES `rider_wallet` WRITE;
/*!40000 ALTER TABLE `rider_wallet` DISABLE KEYS */;
INSERT INTO `rider_wallet` (`wallet_id`, `user_id`, `balance`) VALUES
(1, 3, 500.00),
(2, 4, 1000.00);
/*!40000 ALTER TABLE `rider_wallet` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `review`
--
LOCK TABLES `review` WRITE;
/*!40000 ALTER TABLE `review` DISABLE KEYS */;
INSERT INTO `review` (`review_id`, `ride_id`, `rider_id`, `driver_id`, `rating`, `comments`, `created_at`) VALUES
(1, 1, 4, 2, 5, 'Excellent service.', '2026-07-02 22:37:15'),
(2, 2, 3, 1, 4, 'Comfortable ride.', '2026-07-02 22:37:15'),
(3, 3, 4, 2, 5, 'Very professional driver.', '2026-07-02 22:37:15');
/*!40000 ALTER TABLE `review` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `complaint`
--
LOCK TABLES `complaint` WRITE;
/*!40000 ALTER TABLE `complaint` DISABLE KEYS */;
INSERT INTO `complaint` (`complaint_id`, `user_id`, `ride_id`, `subject`, `description`, `category`, `status`, `resolution_notes`, `created_at`) VALUES
(1, 4, 1, 'Driver arrived late for pickup', 'The driver arrived 20 minutes past the scheduled time without prior notification.', 'Late Pickup', 'Open', NULL, '2026-07-25 10:15:00'),
(2, 3, 2, 'Incorrect fare deducted', 'I was charged extra ₹50 for luggage which was supposed to be included.', 'Fare Dispute', 'In Progress', 'Support team is reviewing transaction details with payment provider.', '2026-07-26 14:30:00'),
(3, 4, 3, 'Unpolite behavior by driver', 'Driver was talking loudly on phone while driving.', 'Driver Behavior', 'Resolved', 'Driver advised regarding customer service standards and issued a warning.', '2026-07-27 09:00:00');
/*!40000 ALTER TABLE `complaint` ENABLE KEYS */;
UNLOCK TABLES;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
