-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 18, 2026 at 05:25 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `inventory_sale_analytics`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `log_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `action` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`log_id`, `user_id`, `action`, `description`, `created_at`) VALUES
(1, 3, 'SET_BATCH_INITIAL_QUANTITY', 'Recorded original quantity for nestea lemon 20g (batch 5) as 20. Previous value: unknown. Reason: ssdfdsgg', '2026-11-09 16:30:06'),
(2, 1, 'LOGIN', 'System Administrator (admin) logged in successfully.', '2026-11-09 18:59:35'),
(3, 3, 'LOGIN', 'Store Manager (manager) logged in successfully.', '2026-11-09 19:01:09'),
(4, 3, 'LOGOUT', 'Store Manager (manager) logged out.', '2026-11-10 03:43:25'),
(5, 1, 'LOGIN', 'System Administrator (admin) logged in successfully.', '2026-11-10 04:00:49'),
(6, 1, 'LOGOUT', 'System Administrator (admin) logged out.', '2026-11-10 04:01:06'),
(7, 3, 'LOGIN', 'Store Manager (manager) logged in successfully.', '2026-11-10 04:01:11'),
(8, 3, 'LOGIN', 'Store Manager (manager) logged in successfully.', '2026-11-10 05:21:30'),
(9, 3, 'LOGIN', 'Store Manager (manager) logged in successfully.', '2026-11-10 05:26:08'),
(10, 4, 'DEMO_SALE_CREATED', 'DEMO DATA: Synthetic sale 72 for Nutella on 2026-10-12 to demonstrate stockout history.', '2026-11-10 05:34:29'),
(11, 4, 'DEMO_SALE_CREATED', 'DEMO DATA: Synthetic sale 73 for Nutella on 2026-10-23 to demonstrate stockout history.', '2026-11-10 05:34:29'),
(12, 4, 'DEMO_SALE_CREATED', 'DEMO DATA: Synthetic sale 74 for Nutella on 2026-10-31 to demonstrate stockout history.', '2026-11-10 05:34:29'),
(13, 4, 'DEMO_SALE_CREATED', 'DEMO DATA: Synthetic sale 75 for Nutella on 2026-11-10 to demonstrate stockout history.', '2026-11-10 05:34:29'),
(14, 4, 'DEMO_SALE_CREATED', 'DEMO DATA: Synthetic sale 76 for Coca-Cola on 2026-10-12 to demonstrate stockout history.', '2026-11-10 05:34:29'),
(15, 4, 'DEMO_SALE_CREATED', 'DEMO DATA: Synthetic sale 77 for Coca-Cola on 2026-10-23 to demonstrate stockout history.', '2026-11-10 05:34:29'),
(16, 4, 'DEMO_SALE_CREATED', 'DEMO DATA: Synthetic sale 78 for Coca-Cola on 2026-10-31 to demonstrate stockout history.', '2026-11-10 05:34:29'),
(17, 4, 'DEMO_SALE_CREATED', 'DEMO DATA: Synthetic sale 79 for Coca-Cola on 2026-11-10 to demonstrate stockout history.', '2026-11-10 05:34:29'),
(18, 4, 'DEMO_SALE_CREATED', 'DEMO DATA: Synthetic sale 80 for QUAKER OATS INSTANT 800G on 2026-10-12 to demonstrate stockout history.', '2026-11-10 05:34:29'),
(19, 4, 'DEMO_SALE_CREATED', 'DEMO DATA: Synthetic sale 81 for QUAKER OATS INSTANT 800G on 2026-10-18 to demonstrate stockout history.', '2026-11-10 05:34:29'),
(20, 4, 'DEMO_SALE_CREATED', 'DEMO DATA: Synthetic sale 82 for QUAKER OATS INSTANT 800G on 2026-10-23 to demonstrate stockout history.', '2026-11-10 05:34:29'),
(21, 4, 'DEMO_SALE_CREATED', 'DEMO DATA: Synthetic sale 83 for QUAKER OATS INSTANT 800G on 2026-10-29 to demonstrate stockout history.', '2026-11-10 05:34:29'),
(22, 4, 'DEMO_SALE_CREATED', 'DEMO DATA: Synthetic sale 84 for QUAKER OATS INSTANT 800G on 2026-11-03 to demonstrate stockout history.', '2026-11-10 05:34:29'),
(23, 4, 'DEMO_SALE_CREATED', 'DEMO DATA: Synthetic sale 85 for QUAKER OATS INSTANT 800G on 2026-11-10 to demonstrate stockout history.', '2026-11-10 05:34:29'),
(24, 4, 'DEMO_SALE_CREATED', 'DEMO DATA: Synthetic sale 86 for 555 sardines on 2026-10-12 to demonstrate stockout history.', '2026-11-10 05:34:29'),
(25, 4, 'DEMO_SALE_CREATED', 'DEMO DATA: Synthetic sale 87 for 555 sardines on 2026-10-26 to demonstrate stockout history.', '2026-11-10 05:34:29'),
(26, 4, 'DEMO_SALE_CREATED', 'DEMO DATA: Synthetic sale 88 for 555 sardines on 2026-11-10 to demonstrate stockout history.', '2026-11-10 05:34:29'),
(27, 4, 'DEMO_SALE_CREATED', 'DEMO DATA: Synthetic sale 89 for Suncoast Vitamins Boost Grape on 2026-10-12 to demonstrate stockout history.', '2026-11-10 05:34:29'),
(28, 4, 'DEMO_SALE_CREATED', 'DEMO DATA: Synthetic sale 90 for Suncoast Vitamins Boost Grape on 2026-10-19 to demonstrate stockout history.', '2026-11-10 05:34:29'),
(29, 4, 'DEMO_SALE_CREATED', 'DEMO DATA: Synthetic sale 91 for Suncoast Vitamins Boost Grape on 2026-10-26 to demonstrate stockout history.', '2026-11-10 05:34:29'),
(30, 4, 'DEMO_SALE_CREATED', 'DEMO DATA: Synthetic sale 92 for Suncoast Vitamins Boost Grape on 2026-11-01 to demonstrate stockout history.', '2026-11-10 05:34:29'),
(31, 4, 'DEMO_SALE_CREATED', 'DEMO DATA: Synthetic sale 93 for Suncoast Vitamins Boost Grape on 2026-11-08 to demonstrate stockout history.', '2026-11-10 05:34:29'),
(32, 4, 'DEMO_SALE_CREATED', 'DEMO DATA: Synthetic sale 94 for nestea lemon 20g on 2026-10-25 to demonstrate stockout history.', '2026-11-10 05:34:29'),
(33, 4, 'DEMO_SALE_CREATED', 'DEMO DATA: Synthetic sale 95 for Coca-Cola Original Taste on 2026-10-12 to demonstrate stockout history.', '2026-11-10 05:34:29'),
(34, 4, 'DEMO_SALE_CREATED', 'DEMO DATA: Synthetic sale 96 for Coca-Cola Original Taste on 2026-10-22 to demonstrate stockout history.', '2026-11-10 05:34:29'),
(35, 4, 'DEMO_SALE_CREATED', 'DEMO DATA: Synthetic sale 97 for Coca-Cola Original Taste on 2026-10-30 to demonstrate stockout history.', '2026-11-10 05:34:29'),
(36, 4, 'DEMO_SALE_CREATED', 'DEMO DATA: Synthetic sale 98 for Coca-Cola Original Taste on 2026-11-08 to demonstrate stockout history.', '2026-11-10 05:34:29'),
(37, 4, 'DEMO_SALE_CREATED', 'DEMO DATA: Synthetic revenue-forecast sale 99 for 555 sardines on 2026-09-08.', '2026-11-10 05:41:27'),
(38, 4, 'DEMO_SALE_CREATED', 'DEMO DATA: Synthetic revenue-forecast sale 100 for 555 sardines on 2026-09-09.', '2026-11-10 05:41:27'),
(39, 4, 'DEMO_SALE_CREATED', 'DEMO DATA: Synthetic revenue-forecast sale 101 for 555 sardines on 2026-09-10.', '2026-11-10 05:41:27'),
(40, 4, 'DEMO_SALE_CREATED', 'DEMO DATA: Synthetic revenue-forecast sale 102 for 555 sardines on 2026-09-12.', '2026-11-10 05:41:27'),
(41, 4, 'DEMO_SALE_CREATED', 'DEMO DATA: Synthetic revenue-forecast sale 103 for 555 sardines on 2026-09-16.', '2026-11-10 05:41:27'),
(42, 4, 'DEMO_SALE_CREATED', 'DEMO DATA: Synthetic revenue-forecast sale 104 for 555 sardines on 2026-09-23.', '2026-11-10 05:41:27'),
(43, 3, 'LOGOUT', 'Store Manager (manager) logged out.', '2026-11-10 06:08:54'),
(44, 1, 'LOGIN', 'System Administrator (admin) logged in successfully.', '2026-11-10 06:09:12'),
(45, 1, 'LOGOUT', 'System Administrator (admin) logged out.', '2026-11-10 06:09:39'),
(46, 3, 'LOGIN', 'Store Manager (manager) logged in successfully.', '2026-11-10 06:09:52'),
(47, 3, 'LOGOUT', 'Store Manager (manager) logged out.', '2026-11-10 06:12:47'),
(48, 1, 'LOGIN', 'System Administrator (admin) logged in successfully.', '2026-11-10 06:12:52'),
(49, 1, 'LOGOUT', 'System Administrator (admin) logged out.', '2026-11-10 06:13:48'),
(50, 3, 'LOGIN', 'Store Manager (manager) logged in successfully.', '2026-11-10 06:13:57'),
(51, 3, 'LOGOUT', 'Store Manager (manager) logged out.', '2026-11-10 06:45:31'),
(52, 1, 'LOGIN', 'System Administrator (admin) logged in successfully.', '2026-11-10 06:45:36'),
(53, 1, 'LOGOUT', 'System Administrator (admin) logged out.', '2026-11-10 07:04:00'),
(54, 3, 'LOGIN', 'Store Manager (manager) logged in successfully.', '2026-11-10 07:04:07'),
(55, 3, 'LOGOUT', 'Store Manager (manager) logged out.', '2026-11-10 07:04:45'),
(56, 1, 'LOGIN', 'System Administrator (admin) logged in successfully.', '2026-11-10 07:04:50'),
(57, 1, 'LOGOUT', 'System Administrator (admin) logged out.', '2026-11-10 07:05:51'),
(58, 1, 'LOGIN', 'System Administrator (admin) logged in successfully.', '2026-11-10 07:06:26'),
(59, 1, 'LOGOUT', 'System Administrator (admin) logged out.', '2026-11-10 07:07:05'),
(60, 4, 'LOGIN', 'Store Cashier (cashier) logged in successfully.', '2026-11-10 07:08:01'),
(61, 4, 'LOGOUT', 'Store Cashier (cashier) logged out.', '2026-11-10 07:08:03'),
(62, 3, 'LOGIN', 'Store Manager (manager) logged in successfully.', '2026-11-10 07:08:15'),
(63, 3, 'LOGIN', 'Store Manager (manager) logged in successfully.', '2026-11-11 12:08:28'),
(64, 3, 'LOGOUT', 'Store Manager (manager) logged out.', '2026-11-11 12:24:01'),
(65, 3, 'LOGIN', 'Store Manager (manager) logged in successfully.', '2026-11-11 14:59:33'),
(66, 3, 'LOGIN', 'Store Manager (manager) logged in successfully.', '2026-11-12 02:50:33'),
(67, 3, 'LOGOUT', 'Store Manager (manager) logged out.', '2026-11-12 02:54:22'),
(68, 3, 'LOGIN', 'Store Manager (manager) logged in successfully.', '2026-11-12 02:57:59'),
(69, 3, 'LOGIN', 'Store Manager (manager) logged in successfully.', '2026-11-12 03:08:36'),
(70, 3, 'LOGIN', 'Store Manager (manager) logged in successfully.', '2026-11-12 03:29:07'),
(71, 3, 'LOGOUT', 'Store Manager (manager) logged out.', '2026-11-12 04:06:55'),
(72, 4, 'LOGIN', 'Store Cashier (cashier) logged in successfully.', '2026-11-12 04:07:00'),
(73, 4, 'LOGOUT', 'Store Cashier (cashier) logged out.', '2026-11-12 04:07:22'),
(74, 1, 'LOGIN', 'System Administrator (admin) logged in successfully.', '2026-11-12 04:07:26'),
(75, 1, 'LOGOUT', 'System Administrator (admin) logged out.', '2026-11-12 04:08:11'),
(76, 3, 'LOGIN', 'Store Manager (manager) logged in successfully.', '2026-11-12 04:09:55'),
(77, 3, 'LOGOUT', 'Store Manager (manager) logged out.', '2026-11-12 04:11:51'),
(78, 1, 'LOGIN', 'System Administrator (admin) logged in successfully.', '2026-11-12 12:48:50'),
(79, 3, 'LOGIN', 'Store Manager (manager) logged in successfully.', '2026-11-12 13:50:10'),
(80, 1, 'LOGOUT', 'System Administrator (admin) logged out.', '2026-11-12 14:53:51'),
(81, 4, 'LOGIN', 'Store Cashier (cashier) logged in successfully.', '2026-11-12 14:53:58'),
(82, 4, 'SALE_COMPLETED', 'Sale #170 completed by Store Cashier (cashier); total ₱19.50; payment: cash; items: nestea lemon 20g x 1', '2026-11-12 14:57:11'),
(83, 4, 'LOGOUT', 'Store Cashier (cashier) logged out.', '2026-11-12 14:57:12'),
(84, 1, 'LOGIN', 'System Administrator (admin) logged in successfully.', '2026-11-12 14:57:27'),
(85, 1, 'USER_CREATED', 'Created user account #5: Store Cashier 2 (@cashier 2, role: cashier, status: active).', '2026-11-12 15:47:34'),
(86, 1, 'USER_UPDATED', 'Updated account #5 (cashier2): username \'cashier 2\' → \'cashier2\'.', '2026-11-12 15:47:43'),
(87, 1, 'LOGOUT', 'System Administrator (admin) logged out.', '2026-11-12 15:47:48'),
(88, 5, 'LOGIN', 'Store Cashier 2 (cashier) logged in successfully.', '2026-11-12 15:47:58'),
(89, 5, 'LOGOUT', 'Store Cashier 2 (cashier) logged out.', '2026-11-12 15:48:03'),
(90, 1, 'LOGIN', 'System Administrator (admin) logged in successfully.', '2026-11-12 15:48:10'),
(91, 1, 'USER_DEACTIVATED', 'Deactivated account #5: Store Cashier 2 (@cashier2, role: cashier).', '2026-11-12 16:12:08'),
(92, 1, 'USER_UPDATED', 'Updated account #5 (cashier2): full name \'Store Cashier 2\' → \'Cashier 2\'.', '2026-11-12 16:16:55'),
(93, 1, 'USER_UPDATED', 'Updated account #5 (cashier2): full name \'Cashier 2\' → \'SCashier 2\'.', '2026-11-12 16:20:03'),
(94, 1, 'USER_REACTIVATED', 'Reactivated account #5: SCashier 2 (@cashier2, role: cashier).', '2026-11-12 16:24:54'),
(95, 1, 'USER_DEACTIVATED', 'Deactivated account #5: SCashier 2 (@cashier2, role: cashier).', '2026-11-12 16:24:58'),
(96, 1, 'LOGOUT', 'System Administrator (admin) logged out.', '2026-11-12 16:30:38'),
(97, 3, 'LOGIN', 'Store Manager (manager) logged in successfully.', '2026-11-12 16:30:53'),
(98, 3, 'UPDATE_NEAR_EXPIRY_THRESHOLD', 'Changed the near-expiry alert threshold from 30 to 20 days.', '2026-11-12 16:49:07'),
(99, 3, 'UPDATE_NEAR_EXPIRY_THRESHOLD', 'Changed the near-expiry alert threshold from 20 to 10 days.', '2026-11-12 16:49:10'),
(100, 3, 'UPDATE_NEAR_EXPIRY_THRESHOLD', 'Changed the near-expiry alert threshold from 10 to 50 days.', '2026-11-12 16:49:13'),
(101, 3, 'UPDATE_NEAR_EXPIRY_THRESHOLD', 'Changed the near-expiry alert threshold from 50 to 30 days.', '2026-11-12 16:49:23'),
(102, 3, 'STOCK_RECEIVED', 'Received 50 units of hansel crackers (y) 32g in batch B-000019; unit cost ₱550.00; expiry 2027-03-17; received 2026-11-13; supplier reference not provided.', '2026-11-12 16:51:55'),
(103, 3, 'STOCK_RECEIVED', 'Received 50 units of Eggnog Cookies in batch B-000020; unit cost ₱550.00; expiry 2027-05-11; received 2026-11-13; supplier reference not provided.', '2026-11-12 16:52:52'),
(104, 3, 'STOCK_RECEIVED', 'Received 25 units of Suncoast Vitamins Boost Grape in batch B-000021; unit cost ₱2,500.00; expiry 2026-12-31; received 2026-11-13; supplier reference not provided.', '2026-11-12 18:13:43'),
(105, 3, 'LOGOUT', 'Store Manager (manager) logged out.', '2026-11-12 19:52:52'),
(106, 3, 'LOGIN', 'Store Manager (manager) logged in successfully.', '2026-11-12 19:53:01'),
(107, 3, 'UPDATE_NEAR_EXPIRY_THRESHOLD', 'Changed the near-expiry alert threshold from 30 to 10 days.', '2026-11-13 01:06:37'),
(108, 3, 'UPDATE_NEAR_EXPIRY_THRESHOLD', 'Changed the near-expiry alert threshold from 10 to 15 days.', '2026-11-13 01:06:40'),
(109, 3, 'UPDATE_NEAR_EXPIRY_THRESHOLD', 'Changed the near-expiry alert threshold from 15 to 50 days.', '2026-11-13 01:06:44'),
(110, 3, 'SALE_COMPLETED', 'Sale #171 completed by Store Manager (manager); total ₱39.50; payment: card; items: nestea lemon 20g x 1; Coca-Cola Original Taste x 1', '2026-11-13 01:07:36'),
(111, 3, 'LOGOUT', 'Store Manager (manager) logged out.', '2026-11-13 01:37:09'),
(112, 1, 'LOGIN', 'System Administrator (admin) logged in successfully.', '2026-11-13 01:37:14'),
(113, 1, 'LOGOUT', 'System Administrator (admin) logged out.', '2026-11-13 01:45:36'),
(114, 1, 'LOGIN', 'System Administrator (admin) logged in successfully.', '2026-11-13 01:45:40'),
(115, 1, 'LOGOUT', 'System Administrator (admin) logged out.', '2026-11-13 01:48:36'),
(116, 3, 'LOGIN', 'Store Manager (manager) logged in successfully.', '2026-11-13 01:48:41'),
(117, 3, 'SALE_COMPLETED', 'Sale #172 completed by Store Manager (manager); total ₱10.00; payment: cash; items: hansel crackers (y) 32g x 1', '2026-11-13 02:37:50'),
(118, 4, 'LOGIN', 'Store Cashier (cashier) logged in successfully.', '2026-11-13 03:45:14'),
(119, 4, 'LOGOUT', 'Store Cashier (cashier) logged out.', '2026-11-13 03:45:28'),
(120, 1, 'LOGIN', 'System Administrator (admin) logged in successfully.', '2026-11-13 03:45:35'),
(121, 1, 'USER_REACTIVATED', 'Reactivated account #5: SCashier 2 (@cashier2, role: cashier).', '2026-11-13 03:45:45'),
(122, 1, 'LOGOUT', 'System Administrator (admin) logged out.', '2026-11-13 03:45:50'),
(123, 5, 'LOGIN', 'SCashier 2 (cashier) logged in successfully.', '2026-11-13 03:46:44'),
(124, 5, 'SALE_COMPLETED', 'Sale #173 completed by SCashier 2 (cashier); total ₱49.50; payment: gcash; items: hansel crackers (y) 32g x 2; Eggnog Cookies x 1; nestea lemon 20g x 1', '2026-11-13 03:47:21'),
(125, 5, 'SALE_COMPLETED', 'Sale #174 completed by SCashier 2 (cashier); total ₱289.50; payment: card; items: Coca-Cola Original Taste x 1; nestea lemon 20g x 1; QUAKER OATS INSTANT 800G x 1', '2026-11-13 03:48:01'),
(126, 5, 'LOGOUT', 'SCashier 2 (cashier) logged out.', '2026-11-13 03:53:55'),
(127, 1, 'LOGIN', 'System Administrator (admin) logged in successfully.', '2026-11-13 03:54:04'),
(128, 1, 'USER_CREATED', 'Created user account #6: Leovy Mson (@leovymason, role: admin, status: active).', '2026-11-13 03:56:06'),
(129, 1, 'USER_DEACTIVATED', 'Deactivated account #6: Leovy Mson (@leovymason, role: admin).', '2026-11-13 03:56:28'),
(130, 3, 'LOGIN', 'Store Manager (manager) logged in successfully.', '2026-11-13 05:54:47'),
(131, 3, 'UPDATE_NEAR_EXPIRY_THRESHOLD', 'Changed the near-expiry alert threshold from 50 to 30 days.', '2026-11-13 06:04:16'),
(132, 3, 'LOGOUT', 'Store Manager (manager) logged out.', '2026-11-13 06:57:32'),
(133, 1, 'LOGIN', 'System Administrator (admin) logged in successfully.', '2026-11-13 06:57:39'),
(134, 1, 'LOGOUT', 'System Administrator (admin) logged out.', '2026-11-13 07:10:41'),
(135, 3, 'LOGIN', 'Store Manager (manager) logged in successfully.', '2026-11-13 07:10:47'),
(136, 3, 'UPDATE_NEAR_EXPIRY_THRESHOLD', 'Changed the near-expiry alert threshold from 30 to 10 days.', '2026-11-13 07:31:41'),
(137, 3, 'UPDATE_NEAR_EXPIRY_THRESHOLD', 'Changed the near-expiry alert threshold from 10 to 30 days.', '2026-11-13 07:33:38'),
(138, 3, 'STOCK_RECEIVED', 'Received 10 units of hansel crackers (y) 32g in batch B-000022; unit cost ₱120.00; expiry 2026-12-14; received 2026-11-13; supplier reference not provided.', '2026-11-13 07:34:51'),
(139, 3, 'INVENTORY_ADJUSTED', 'Adjusted hansel crackers (y) 32g batch B-000022: inventory count 10 → 100; batch count 10 → 100; reason: physical count correction.', '2026-11-13 07:36:44'),
(140, 3, 'STOCK_RECEIVED', 'Received 100 units of Eggnog Cookies in batch B-000023; unit cost ₱1,000.00; expiry 2026-12-13; received 2026-11-13; supplier reference not provided.', '2026-11-13 07:37:36'),
(141, 3, 'STOCK_RECEIVED', 'Received 100 units of Coca-Cola Original Taste in batch B-000024; unit cost ₱1,000.00; expiry 2026-11-12; received 2026-11-13; supplier reference not provided.', '2026-11-13 07:39:12'),
(142, 3, 'STOCK_RECEIVED', 'Received 50 units of nestea lemon 20g in batch B-000025; unit cost ₱500.00; expiry 2026-12-12; received 2026-11-13; supplier reference not provided.', '2026-11-13 07:40:06'),
(143, 3, 'UPDATE_NEAR_EXPIRY_THRESHOLD', 'Changed the near-expiry alert threshold from 30 to 50 days.', '2026-11-15 03:11:57'),
(144, 3, 'UPDATE_NEAR_EXPIRY_THRESHOLD', 'Changed the near-expiry alert threshold from 50 to 20 days.', '2026-11-15 03:12:06'),
(145, 3, 'UPDATE_NEAR_EXPIRY_THRESHOLD', 'Changed the near-expiry alert threshold from 20 to 30 days.', '2026-11-15 03:12:16'),
(146, 3, 'INVENTORY_LOSS_RECORDED', 'Recorded 100 units lost for Coca-Cola Original Taste from batch B-000024; reason: expired; remaining quantity: 0.', '2026-11-15 14:52:27'),
(147, 3, 'PRODUCT_UPDATED', 'Updated product #7 (Coca-Cola Original Taste): selling_price: \'20.00\' → \'22.0\'.', '2026-11-15 16:03:24'),
(148, 3, 'PRODUCT_UPDATED', 'Updated product #6 (nestea lemon 20g): selling_price: \'19.50\' → \'20.0\'.', '2026-11-15 16:03:33'),
(149, 3, 'PRODUCT_UPDATED', 'Updated product #4 (555 sardines): selling_price: \'25.00\' → \'26.0\'.', '2026-11-15 16:03:49'),
(150, 3, 'SALE_COMPLETED', 'Sale #175 completed by Store Manager (manager); total ₱42.00; payment: card; items: hansel crackers (y) 32g x 1; Eggnog Cookies x 1; Coca-Cola Original Taste x 1', '2026-11-15 16:31:02'),
(151, 3, 'SALE_COMPLETED', 'Sale #176 completed by Store Manager (manager); total ₱1,492.00; payment: cash; items: nestea lemon 20g x 1; Coca-Cola Original Taste x 1; Nutella x 5; Suncoast Vitamins Boost Grape x 4', '2026-11-15 16:31:25'),
(152, 3, 'SALE_COMPLETED', 'Sale #177 completed by Store Manager (manager); total ₱230.00; payment: cash; items: 555 sardines x 5; Suncoast Vitamins Boost Grape x 2', '2026-11-15 16:31:37'),
(153, 3, 'LOGIN', 'Store Manager (manager) logged in successfully.', '2026-11-15 16:47:11'),
(154, 3, 'SALE_COMPLETED', 'Sale #178 completed by Store Manager (manager); total ₱104.00; payment: cash; items: 555 sardines x 4', '2026-11-15 16:48:57'),
(155, 3, 'SALE_COMPLETED', 'Sale #179 completed by Store Manager (manager); total ₱500.00; payment: gcash; items: QUAKER OATS INSTANT 800G x 2', '2026-11-15 16:49:17'),
(156, 3, 'LOGIN', 'Store Manager (manager) logged in successfully.', '2026-11-15 16:54:19'),
(157, 3, 'LOGIN', 'Store Manager (manager) logged in successfully.', '2026-11-15 17:10:21'),
(158, 3, 'SALE_COMPLETED', 'Sale #180 completed by Store Manager (manager); total ₱50.00; payment: gcash; items: Suncoast Vitamins Boost Grape x 1', '2026-11-15 17:28:38'),
(159, 3, 'SALE_COMPLETED', 'Sale #181 completed by Store Manager (manager); total ₱26.00; payment: cash; items: 555 sardines x 1', '2026-11-15 17:28:41'),
(160, 3, 'UPDATE_NEAR_EXPIRY_THRESHOLD', 'Changed the near-expiry alert threshold from 30 to 10 days.', '2026-11-15 17:29:20'),
(161, 3, 'UPDATE_NEAR_EXPIRY_THRESHOLD', 'Changed the near-expiry alert threshold from 10 to 30 days.', '2026-11-15 17:29:38'),
(162, 3, 'UPDATE_PRODUCT_EXPIRY_THRESHOLD', 'Changed the near-expiry threshold for nestea lemon 20g from the default (30 days) to 50 days.', '2026-11-15 17:34:28'),
(163, 3, 'UPDATE_PRODUCT_EXPIRY_THRESHOLD', 'Changed the near-expiry threshold for nestea lemon 20g from 50 days to 30 days.', '2026-11-15 17:34:44'),
(164, 3, 'UPDATE_PRODUCT_EXPIRY_THRESHOLD', 'Changed the near-expiry threshold for Suncoast Vitamins Boost Grape from the default (30 days) to 20 days.', '2026-11-15 17:35:04'),
(165, 3, 'UPDATE_PRODUCT_EXPIRY_THRESHOLD', 'Changed the near-expiry threshold for Suncoast Vitamins Boost Grape from 20 days to 10 days.', '2026-11-15 17:35:17'),
(166, 3, 'UPDATE_PRODUCT_EXPIRY_THRESHOLD', 'Changed the near-expiry threshold for Suncoast Vitamins Boost Grape from 10 days to 30 days.', '2026-11-15 17:36:50'),
(167, 3, 'UPDATE_PRODUCT_EXPIRY_THRESHOLD', 'Changed the near-expiry threshold for Suncoast Vitamins Boost Grape from 30 days to 100 days.', '2026-11-15 17:37:22'),
(168, 3, 'UPDATE_PRODUCT_EXPIRY_THRESHOLD', 'Changed the near-expiry threshold for Suncoast Vitamins Boost Grape from 100 days to 30 days.', '2026-11-15 17:37:28'),
(169, 3, 'UPDATE_NEAR_EXPIRY_THRESHOLD', 'Changed the near-expiry alert threshold from 30 to 20 days.', '2026-11-15 17:38:31'),
(170, 3, 'UPDATE_NEAR_EXPIRY_THRESHOLD', 'Changed the near-expiry alert threshold from 20 to 50 days.', '2026-11-15 17:38:42'),
(171, 3, 'UPDATE_NEAR_EXPIRY_THRESHOLD', 'Changed the near-expiry alert threshold from 50 to 30 days.', '2026-11-15 17:38:45'),
(172, 3, 'LOGIN', 'Store Manager (manager) logged in successfully.', '2026-11-15 17:45:02'),
(173, 3, 'PRODUCT_CREATED', 'Added product #10: C2 Apple Green (barcode: 4800016052774, price: ₱52.00).', '2026-11-16 02:51:59'),
(174, 3, 'STOCK_RECEIVED', 'Received 50 units of C2 Apple Green in batch B-000026; unit cost ₱2,400.00; expiry 2027-06-16; received 2026-11-16; supplier reference not provided.', '2026-11-16 02:52:57'),
(175, 3, 'SALE_COMPLETED', 'Sale #192 completed by Store Manager (manager); total ₱104.00; payment: cash; items: C2 Apple Green x 2', '2026-11-16 02:53:09'),
(176, 1, 'LOGIN', 'System Administrator (admin) logged in successfully.', '2026-11-16 03:13:08'),
(177, 1, 'LOGOUT', 'System Administrator (admin) logged out.', '2026-11-16 03:13:30'),
(178, 3, 'LOGIN', 'Store Manager (manager) logged in successfully.', '2026-11-16 03:13:35'),
(179, 3, 'PRODUCT_CREATED', 'Added product #11: Rebisco Crackers Whole Wheat (barcode: 4800092113345, price: ₱8.00).', '2026-11-16 03:14:21'),
(180, 3, 'STOCK_RECEIVED', 'Received 100 units of Rebisco Crackers Whole Wheat in batch B-000027; unit cost ₱900.00; expiry 2027-11-20; received 2026-11-16; supplier reference not provided.', '2026-11-16 03:15:31'),
(181, 3, 'SALE_COMPLETED', 'Sale #193 completed by Store Manager (manager); total ₱60.00; payment: gcash; items: Rebisco Crackers Whole Wheat x 1; C2 Apple Green x 1', '2026-11-16 03:15:54'),
(182, 3, 'LOGOUT', 'Store Manager (manager) logged out.', '2026-11-16 03:16:13'),
(183, 4, 'LOGIN', 'Store Cashier (cashier) logged in successfully.', '2026-11-16 03:16:19'),
(184, 4, 'SALE_COMPLETED', 'Sale #194 completed by Store Cashier (cashier); total ₱32.00; payment: cash; items: Coca-Cola Original Taste x 1; Eggnog Cookies x 1', '2026-11-16 03:16:28'),
(185, 4, 'SALE_COMPLETED', 'Sale #195 completed by Store Cashier (cashier); total ₱75.00; payment: cash; items: Coca-Cola x 1', '2026-11-16 03:16:37'),
(186, 4, 'LOGOUT', 'Store Cashier (cashier) logged out.', '2026-11-16 03:16:49'),
(187, 3, 'LOGIN', 'Store Manager (manager) logged in successfully.', '2026-11-16 03:16:54'),
(188, 3, 'LOGIN', 'Store Manager (manager) logged in successfully.', '2026-11-16 03:40:15'),
(189, 3, 'STOCK_RECEIVED', 'Received 100 units of nestea lemon 20g in batch B-000028; unit cost ₱2,000.00; expiry 2027-12-28; received 2026-11-16; supplier reference not provided.', '2026-11-16 03:41:30'),
(190, 3, 'SALE_COMPLETED', 'Sale #196 completed by Store Manager (manager); total ₱128.00; payment: gcash; items: Rebisco Crackers Whole Wheat x 1; nestea lemon 20g x 1; nestea lemon 20g x 5', '2026-11-16 03:42:03'),
(191, 3, 'UPDATE_SUPPLIER_LEAD_TIME', 'Updated supplier lead time for 555 sardines (product ID 4) from 7 to 8 days.', '2026-11-16 03:42:23'),
(192, 3, 'UPDATE_SUPPLIER_LEAD_TIME', 'Updated supplier lead time for 555 sardines (product ID 4) from 8 to 7 days.', '2026-11-16 03:42:25'),
(193, 4, 'LOGIN', 'Store Cashier (cashier) logged in through mobile.', '2026-11-16 05:59:58'),
(194, 1, 'LOGIN', 'System Administrator (admin) logged in successfully.', '2026-11-16 06:10:37'),
(195, 1, 'LOGIN', 'System Administrator (admin) logged in successfully.', '2026-11-16 06:23:17'),
(196, 1, 'USER_DEACTIVATED', 'Deactivated account #5: SCashier 2 (@cashier2, role: cashier).', '2026-11-16 06:23:53'),
(197, 3, 'LOGIN', 'Store Manager (manager) logged in successfully.', '2026-11-16 06:24:02'),
(198, 4, 'LOGIN', 'Store Cashier (cashier) logged in successfully.', '2026-11-16 06:45:31'),
(199, 4, 'SALE_COMPLETED', 'Sale #197 completed by Store Cashier (cashier); total ₱48.00; payment: cash; items: Rebisco Crackers Whole Wheat x 6', '2026-11-16 06:45:41'),
(200, 4, 'LOGIN', 'Store Cashier (cashier) logged in through mobile.', '2026-11-16 14:01:15'),
(201, 4, 'LOGIN', 'Store Cashier (cashier) logged in through mobile.', '2026-11-16 16:05:23'),
(202, 4, 'LOGIN', 'Store Cashier (cashier) logged in through mobile.', '2026-11-16 16:14:27'),
(203, 4, 'LOGIN', 'Store Cashier (cashier) logged in through mobile.', '2026-11-16 16:16:17'),
(204, 3, 'LOGIN', 'Store Manager (manager) logged in successfully.', '2026-11-16 17:34:57'),
(205, 4, 'LOGIN', 'Store Cashier (cashier) logged in through mobile.', '2026-11-16 17:35:27'),
(206, 4, 'LOGIN', 'Store Cashier (cashier) logged in successfully.', '2026-11-16 17:54:48'),
(207, 4, 'LOGIN', 'Store Cashier (cashier) logged in successfully.', '2026-11-16 17:55:58'),
(208, 1, 'LOGIN', 'System Administrator (admin) logged in successfully.', '2026-11-17 03:33:28'),
(209, 1, 'LOGIN', 'System Administrator (admin) logged in successfully.', '2026-11-17 03:53:11'),
(210, 4, 'LOGIN', 'Store Cashier (cashier) logged in through mobile.', '2026-11-17 03:59:21'),
(211, 4, 'LOGIN', 'Store Cashier (cashier) logged in successfully.', '2026-11-17 04:00:30'),
(212, 4, 'SALE_COMPLETED', 'Sale #198 completed by Store Cashier (cashier); total ₱16.00; payment: cash; items: Rebisco Crackers Whole Wheat x 2', '2026-11-17 09:39:20'),
(213, 4, 'LOGIN', 'Store Cashier (cashier) logged in through mobile.', '2026-11-17 09:41:22'),
(214, 4, 'SALE_COMPLETED', 'Sale #199 completed by Store Cashier (cashier); total ₱8.00; payment: cash; items: Rebisco Crackers Whole Wheat x 1', '2026-11-17 09:44:05'),
(215, 3, 'LOGIN', 'Store Manager (manager) logged in through mobile.', '2026-11-17 09:47:14'),
(216, 4, 'LOGIN', 'Store Cashier (cashier) logged in through mobile.', '2026-11-17 09:51:19'),
(217, 3, 'LOGIN', 'Store Manager (manager) logged in through mobile.', '2026-11-17 09:58:16'),
(218, 3, 'PRODUCT_CREATED', 'Added product #12: Sugo Greaseless Salted Peanuts (barcode: 4809010524034, price: ₱42.00).', '2026-11-17 09:59:09'),
(219, 4, 'LOGIN', 'Store Cashier (cashier) logged in successfully.', '2026-11-17 10:28:30'),
(220, 3, 'LOGIN', 'Store Manager (manager) logged in through mobile.', '2026-11-17 10:29:30'),
(221, 4, 'LOGIN', 'Store Cashier (cashier) logged in through mobile.', '2026-11-17 10:29:51'),
(222, 4, 'LOGIN', 'Store Cashier (cashier) logged in through mobile.', '2026-11-17 10:40:33'),
(223, 4, 'SALE_COMPLETED', 'Sale #200 completed by Store Cashier (cashier); total ₱56.00; payment: gcash; items: nestea lemon 20g x 2; Rebisco Crackers Whole Wheat x 2', '2026-11-17 10:41:16'),
(224, 4, 'LOGIN', 'Store Cashier (cashier) logged in successfully.', '2026-11-17 10:44:19'),
(225, 4, 'LOGIN', 'Store Cashier (cashier) logged in through mobile.', '2026-11-17 10:44:34'),
(226, 4, 'SALE_COMPLETED', 'Sale #238 completed by Store Cashier (cashier); total ₱20.00; payment: cash; items: nestea lemon 20g x 1', '2026-11-17 10:45:30'),
(227, 4, 'LOGIN', 'Store Cashier (cashier) logged in through mobile.', '2026-11-17 11:42:01'),
(228, 1, 'LOGIN', 'System Administrator (admin) logged in successfully.', '2026-11-17 11:44:01'),
(229, 3, 'LOGIN', 'Store Manager (manager) logged in successfully.', '2026-11-17 11:44:16'),
(230, 1, 'LOGIN', 'System Administrator (admin) logged in successfully.', '2026-11-17 11:44:25'),
(231, 3, 'LOGIN', 'Store Manager (manager) logged in successfully.', '2026-11-17 11:44:56'),
(232, 3, 'STOCK_RECEIVED', 'Received 100 units of Rebisco Crackers Whole Wheat in batch B-000029; unit cost â‚±920.00; expiry 2028-01-17; received 2026-11-17; supplier reference not provided.', '2026-11-17 11:47:34'),
(233, 3, 'LOGIN', 'Store Manager (manager) logged in successfully.', '2026-11-17 12:09:44'),
(234, 3, 'STOCK_RECEIVED', 'Received 20 units of Sugo Greaseless Salted Peanuts in batch B-000030; unit cost â‚±800.00; expiry 2027-01-17; received 2026-11-17; supplier reference not provided.', '2026-11-17 12:22:33'),
(235, 1, 'LOGIN', 'System Administrator (admin) logged in successfully.', '2026-11-17 13:11:28'),
(236, 3, 'LOGIN', 'Store Manager (manager) logged in successfully.', '2026-11-17 13:12:10'),
(237, 1, 'LOGIN', 'System Administrator (admin) logged in successfully.', '2026-11-17 13:49:30'),
(238, 3, 'STOCK_RECEIVED', 'Received 30 units of Coca-Cola Original Taste in batch B-000031; unit cost â‚±600.00; expiry 2027-06-17; received 2026-11-17; supplier reference not provided.', '2026-11-17 14:31:02'),
(239, 3, 'STOCK_RECEIVED', 'Received 20 units of Coca-Cola in batch B-000032; unit cost â‚±100.00; expiry 2026-11-18; received 2026-11-17; supplier reference not provided.', '2026-11-17 14:35:28'),
(240, 3, 'LOGIN', 'Store Manager (manager) logged in successfully.', '2026-11-17 14:35:46'),
(241, 3, 'SALE_COMPLETED', 'Sale #239 completed by Store Manager (manager); total ₱750.00; payment: cash; items: Coca-Cola x 10', '2026-11-17 14:36:59'),
(242, 3, 'SALE_COMPLETED', 'Sale #240 completed by Store Manager (manager); total ₱1,500.00; payment: cash; items: Coca-Cola x 10; Coca-Cola x 10', '2026-11-17 14:37:52'),
(243, 3, 'LOGIN', 'Store Manager (manager) logged in successfully.', '2026-11-17 14:57:50'),
(244, 3, 'STOCK_RECEIVED', 'Received 15 units of Suncoast Vitamins Boost Grape in batch B-000033; unit cost â‚±680.00; expiry 2027-10-27; received 2026-11-17; supplier reference not provided.', '2026-11-17 15:19:29'),
(245, 1, 'LOGIN', 'System Administrator (admin) logged in successfully.', '2026-11-17 15:32:08'),
(246, 1, 'LOGIN', 'System Administrator (admin) logged in successfully.', '2026-11-17 15:32:22'),
(247, 1, 'LOGOUT', 'System Administrator (admin) logged out successfully.', '2026-11-17 15:41:18'),
(248, 1, 'LOGIN', 'System Administrator (admin) logged in successfully.', '2026-11-17 15:41:24'),
(249, 1, 'LOGOUT', 'System Administrator (admin) logged out successfully.', '2026-11-17 15:42:29'),
(250, 1, 'LOGOUT', 'System Administrator (admin) logged out successfully.', '2026-11-17 15:43:42'),
(251, 4, 'LOGIN', 'Store Cashier (cashier) logged in successfully.', '2026-11-17 15:48:41'),
(252, 4, 'LOGIN', 'Store Cashier (cashier) logged in successfully.', '2026-11-17 15:49:09'),
(253, 4, 'SALE_COMPLETED', 'Sale #241 completed by Store Cashier (cashier); total ₱42.00; payment: cash; items: nestea lemon 20g x 1; Coca-Cola Original Taste x 1', '2026-11-17 15:51:17'),
(254, 4, 'SALE_COMPLETED', 'Sale #242 completed by Store Cashier (cashier); total ₱58.00; payment: cash; items: Rebisco Crackers Whole Wheat x 2; Sugo Greaseless Salted Peanuts x 1', '2026-11-17 15:53:56'),
(255, 4, 'SALE_COMPLETED', 'Sale #243 completed by Store Cashier (cashier); total ₱50.00; payment: cash; items: Suncoast Vitamins Boost Grape x 1', '2026-11-17 15:54:15'),
(256, 4, 'SALE_COMPLETED', 'Sale #244 completed by Store Cashier (cashier); total ₱26.00; payment: gcash; items: 555 sardines x 1', '2026-11-17 15:58:33'),
(257, 4, 'LOGOUT', 'Store Cashier (cashier) logged out successfully.', '2026-11-17 16:37:44'),
(258, 4, 'LOGIN', 'Store Cashier (cashier) logged in through mobile.', '2026-11-17 16:45:00'),
(259, 4, 'LOGIN', 'Store Cashier (cashier) logged in through mobile.', '2026-11-17 16:46:28'),
(260, 3, 'LOGIN', 'Store Manager (manager) logged in through mobile.', '2026-11-17 17:04:10'),
(261, 4, 'SALE_COMPLETED', 'Sale #245 completed by Store Cashier (cashier); total ₱22.00; payment: card; items: Coca-Cola Original Taste x 1', '2026-11-17 17:06:09'),
(262, 3, 'LOGIN', 'Store Manager (manager) logged in through mobile.', '2026-11-17 17:18:44'),
(263, 3, 'LOGIN', 'Store Manager (manager) logged in through mobile.', '2026-11-17 17:24:31'),
(264, 3, 'SALE_COMPLETED', 'Sale #246 completed by Store Manager (manager); total ₱104.00; payment: gcash; items: C2 Apple Green x 2', '2026-11-17 17:24:49'),
(265, 3, 'LOGIN', 'Store Manager (manager) logged in through mobile.', '2026-11-17 17:25:26'),
(266, 3, 'LOGIN', 'Store Manager (manager) logged in through mobile.', '2026-11-17 17:34:03'),
(267, 4, 'LOGIN', 'Store Cashier (cashier) logged in through mobile.', '2026-11-17 17:36:53'),
(268, 4, 'SALE_COMPLETED', 'Sale #247 completed by Store Cashier (cashier); total ₱48.00; payment: card; items: Rebisco Crackers Whole Wheat x 1; nestea lemon 20g x 1; nestea lemon 20g x 1', '2026-11-17 17:37:53'),
(269, 4, 'SALE_COMPLETED', 'Sale #248 completed by Store Cashier (cashier); total ₱84.00; payment: gcash; items: Sugo Greaseless Salted Peanuts x 2', '2026-11-17 17:38:49'),
(270, 4, 'LOGIN', 'Store Cashier (cashier) logged in successfully.', '2026-11-17 17:39:34'),
(271, 1, 'LOGIN', 'System Administrator (admin) logged in successfully.', '2026-11-18 01:19:21'),
(272, 3, 'LOGIN', 'Store Manager (manager) logged in through mobile.', '2026-11-18 01:25:13'),
(273, 3, 'LOGOUT', 'Store Manager (manager) logged out successfully.', '2026-11-18 01:25:49'),
(274, 4, 'LOGIN', 'Store Cashier (cashier) logged in through mobile.', '2026-11-18 07:35:21'),
(275, 4, 'LOGIN', 'Store Cashier (cashier) logged in through mobile.', '2026-11-18 07:37:57'),
(276, 3, 'LOGIN', 'Store Manager (manager) logged in successfully.', '2026-11-18 07:39:28'),
(277, 3, 'LOGIN', 'Store Manager (manager) logged in through mobile.', '2026-11-18 07:41:49'),
(278, 4, 'LOGIN', 'Store Cashier (cashier) logged in through mobile.', '2026-11-18 07:49:08'),
(279, 4, 'SALE_COMPLETED', 'Sale #249 completed by Store Cashier (cashier); total ₱42.00; payment: cash; items: Sugo Greaseless Salted Peanuts x 1', '2026-11-18 07:49:22'),
(280, 3, 'LOGOUT', 'Store Manager (manager) logged out successfully.', '2026-11-18 07:56:15'),
(281, 1, 'LOGIN', 'System Administrator (admin) logged in successfully.', '2026-11-18 07:56:25'),
(282, 1, 'USER_CREATED', 'Created user account #7: Store Cashier 3 (@cashier3, role: cashier, status: active).', '2026-11-18 07:59:06'),
(283, 1, 'USER_DEACTIVATED', 'Deactivated account #7: Store Cashier 3 (@cashier3, role: cashier).', '2026-11-18 07:59:13'),
(284, 1, 'USER_REACTIVATED', 'Reactivated account #7: Store Cashier 3 (@cashier3, role: cashier).', '2026-11-18 07:59:18'),
(285, 1, 'LOGOUT', 'System Administrator (admin) logged out successfully.', '2026-11-18 08:01:06'),
(286, 4, 'LOGIN', 'Store Cashier (cashier) logged in successfully.', '2026-11-18 08:01:18'),
(287, 4, 'LOGOUT', 'Store Cashier (cashier) logged out successfully.', '2026-11-18 08:04:50'),
(288, 1, 'LOGIN', 'System Administrator (admin) logged in successfully.', '2026-11-18 08:04:56'),
(289, 1, 'LOGOUT', 'System Administrator (admin) logged out successfully.', '2026-11-18 08:05:51'),
(290, 4, 'LOGIN', 'Store Cashier (cashier) logged in successfully.', '2026-11-18 08:05:57'),
(291, 4, 'SALE_COMPLETED', 'Sale #250 completed by Store Cashier (cashier); total ₱84.00; payment: cash; items: Sugo Greaseless Salted Peanuts x 2', '2026-11-18 08:07:24'),
(292, 4, 'LOGOUT', 'Store Cashier (cashier) logged out successfully.', '2026-11-18 08:08:11'),
(293, 4, 'LOGOUT', 'Store Cashier (cashier) logged out successfully.', '2026-11-18 08:08:16'),
(294, 3, 'LOGIN', 'Store Manager (manager) logged in through mobile.', '2026-11-18 08:08:34'),
(295, 3, 'LOGIN', 'Store Manager (manager) logged in successfully.', '2026-11-18 08:09:18'),
(296, 3, 'PRODUCT_CREATED', 'Added product #13: Mentos spearmint (barcode: 073390000127, price: ₱35.00).', '2026-11-18 08:10:17'),
(297, 3, 'LOGOUT', 'Store Manager (manager) logged out successfully.', '2026-11-18 08:10:35'),
(298, 3, 'LOGOUT', 'Store Manager (manager) logged out successfully.', '2026-11-18 08:10:37'),
(299, 4, 'LOGIN', 'Store Cashier (cashier) logged in successfully.', '2026-11-18 08:10:47'),
(300, 4, 'LOGIN', 'Store Cashier (cashier) logged in through mobile.', '2026-11-18 08:11:01'),
(301, 4, 'LOGOUT', 'Store Cashier (cashier) logged out successfully.', '2026-11-18 08:11:59'),
(302, 3, 'LOGIN', 'Store Manager (manager) logged in successfully.', '2026-11-18 08:12:08'),
(303, 3, 'STOCK_RECEIVED', 'Received 20 units of Mentos spearmint in batch B-000034; unit cost â‚±500.00; expiry 2027-07-18; received 2026-11-19; supplier reference not provided.', '2026-11-18 08:12:39'),
(304, 3, 'LOGOUT', 'Store Manager (manager) logged out successfully.', '2026-11-18 08:12:43'),
(305, 4, 'LOGIN', 'Store Cashier (cashier) logged in successfully.', '2026-11-18 08:12:49'),
(306, 4, 'SALE_COMPLETED', 'Sale #254 completed by Store Cashier (cashier); total ₱35.00; payment: cash; items: Mentos spearmint x 1', '2026-11-18 08:13:20'),
(307, 4, 'LOGOUT', 'Store Cashier (cashier) logged out successfully.', '2026-11-18 08:14:28'),
(308, 4, 'LOGOUT', 'Store Cashier (cashier) logged out successfully.', '2026-11-18 08:14:33'),
(309, 3, 'LOGIN', 'Store Manager (manager) logged in successfully.', '2026-11-18 08:14:33'),
(310, 3, 'UPDATE_PRODUCT_EXPIRY_THRESHOLD', 'Changed the near-expiry threshold for nestea lemon 20g from 30 days to 20 days.', '2026-11-18 08:15:57'),
(311, 3, 'UPDATE_PRODUCT_EXPIRY_THRESHOLD', 'Changed the near-expiry threshold for Mentos spearmint from the default (30 days) to 50 days.', '2026-11-18 08:16:34');

-- --------------------------------------------------------

--
-- Table structure for table `batches`
--

CREATE TABLE `batches` (
  `batch_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `batch_number` varchar(50) DEFAULT NULL,
  `supplier_invoice_number` varchar(100) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `initial_quantity` int(10) UNSIGNED DEFAULT NULL,
  `acquisition_cost` decimal(10,2) NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `received_date` date NOT NULL,
  `status` enum('available','expired','disposed') DEFAULT 'available'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `batches`
--

INSERT INTO `batches` (`batch_id`, `product_id`, `batch_number`, `supplier_invoice_number`, `quantity`, `initial_quantity`, `acquisition_cost`, `expiry_date`, `received_date`, `status`) VALUES
(1, 1, 'NUT-001', NULL, 0, NULL, 180.00, '2027-06-30', '2026-09-03', 'available'),
(2, 2, 'COKE-001', NULL, 9, NULL, 50.00, '2027-08-30', '2026-09-03', 'available'),
(3, 1, 'NUT-002', NULL, 0, NULL, 180.00, '2027-05-30', '2026-09-04', 'available'),
(4, 1, 'NUT-003', NULL, 0, NULL, 180.00, '2027-08-30', '2026-09-04', 'available'),
(5, 1, '2026', NULL, 47, NULL, 250.00, '2028-10-16', '2026-10-15', 'available'),
(6, 1, '2026', NULL, 30, NULL, 200.00, '2028-10-16', '2026-10-15', 'available'),
(7, 1, '10-2026', NULL, 2, NULL, 3800.00, '2028-01-04', '2026-10-12', 'available'),
(8, 4, '10-2026', NULL, 14, NULL, 1500.00, '2028-01-04', '2026-10-12', 'available'),
(9, 5, '2026', NULL, 0, NULL, 1199.99, '2026-10-25', '2026-10-18', 'expired'),
(10, 6, '5', NULL, 0, 20, 250.00, '2026-10-20', '2026-10-19', 'expired'),
(11, 7, '2', NULL, 0, NULL, 250.00, '2026-10-21', '2026-10-20', 'expired'),
(12, 7, 'COCACOLA BATCH-5', NULL, 2, NULL, 250.00, '2029-02-13', '2026-11-09', 'available'),
(13, 6, 'NESTEA BATCH 6', NULL, 0, NULL, 240.00, '2026-11-20', '2026-11-11', 'available'),
(14, 7, '5', NULL, 20, NULL, 450.00, '2029-10-26', '2026-11-09', 'available'),
(15, 5, '2026', NULL, 3, NULL, 1200.00, '2026-12-12', '2026-11-05', 'available'),
(16, 3, '2026', NULL, 8, NULL, 1500.00, '2033-10-09', '2026-11-09', 'available'),
(17, 7, 'B-000017', 'INV-2026-1110', 50, 50, 500.00, '2030-02-07', '2026-11-10', 'available'),
(18, 6, 'B-000018', NULL, 0, 10, 200.00, '2026-11-20', '2026-11-10', 'available'),
(19, 9, 'B-000019', NULL, 47, 50, 550.00, '2027-03-17', '2026-11-13', 'available'),
(20, 8, 'B-000020', NULL, 49, 50, 550.00, '2027-05-11', '2026-11-13', 'available'),
(21, 5, 'B-000021', NULL, 25, 25, 2500.00, '2026-12-31', '2026-11-13', 'available'),
(22, 9, 'B-000022', NULL, 99, 10, 120.00, '2026-12-14', '2026-11-13', 'available'),
(23, 8, 'B-000023', NULL, 98, 100, 1000.00, '2026-12-13', '2026-11-13', 'available'),
(24, 7, 'B-000024', NULL, 0, 100, 1000.00, '2026-11-12', '2026-11-13', 'expired'),
(25, 6, 'B-000025', NULL, 49, 50, 500.00, '2026-12-12', '2026-11-13', 'available'),
(26, 10, 'B-000026', NULL, 45, 50, 2400.00, '2027-06-16', '2026-11-16', 'available'),
(27, 11, 'B-000027', NULL, 84, 100, 900.00, '2027-11-20', '2026-11-16', 'available'),
(28, 6, 'B-000028', NULL, 100, 100, 2000.00, '2027-12-28', '2026-11-16', 'available'),
(29, 11, 'B-000029', NULL, 100, 100, 920.00, '2028-01-17', '2026-11-17', 'available'),
(30, 12, 'B-000030', NULL, 14, 20, 800.00, '2027-01-17', '2026-11-17', 'available'),
(31, 7, 'B-000031', NULL, 28, 30, 600.00, '2027-06-17', '2026-11-17', 'available'),
(32, 2, 'B-000032', NULL, 0, 20, 100.00, '2026-11-18', '2026-11-17', 'available'),
(33, 5, 'B-000033', NULL, 15, 15, 680.00, '2027-10-27', '2026-11-17', 'available'),
(34, 13, 'B-000034', NULL, 19, 20, 500.00, '2027-07-18', '2026-11-19', 'available');

-- --------------------------------------------------------

--
-- Table structure for table `inventory`
--

CREATE TABLE `inventory` (
  `inventory_id` int(11) NOT NULL,
  `batch_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `reorder_level` int(11) NOT NULL DEFAULT 10,
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inventory`
--

INSERT INTO `inventory` (`inventory_id`, `batch_id`, `quantity`, `reorder_level`, `last_updated`) VALUES
(1, 1, 0, 10, '2026-09-07 12:47:08'),
(2, 2, 9, 10, '2026-11-17 14:37:52'),
(3, 3, 0, 10, '2026-09-04 01:29:20'),
(4, 4, 0, 10, '2026-10-15 06:11:26'),
(5, 5, 47, 10, '2026-10-15 06:25:05'),
(6, 6, 30, 10, '2026-10-15 06:47:50'),
(7, 7, 2, 10, '2026-11-15 16:31:25'),
(8, 8, 14, 10, '2026-11-17 15:58:33'),
(9, 9, 0, 10, '2026-11-09 17:18:16'),
(10, 10, 0, 10, '2026-11-09 17:18:10'),
(11, 11, 0, 10, '2026-11-09 17:18:14'),
(12, 12, 2, 10, '2026-11-16 03:16:28'),
(13, 13, 0, 10, '2026-11-16 03:42:03'),
(14, 14, 20, 10, '2026-11-09 13:34:54'),
(15, 15, 3, 10, '2026-11-17 15:54:15'),
(16, 16, 8, 10, '2026-11-15 16:49:17'),
(17, 17, 50, 10, '2026-11-09 19:31:16'),
(18, 18, 0, 10, '2026-11-17 17:37:53'),
(19, 19, 47, 10, '2026-11-13 03:47:21'),
(20, 20, 49, 10, '2026-11-13 03:47:21'),
(21, 21, 25, 10, '2026-11-12 18:13:43'),
(22, 22, 99, 10, '2026-11-15 16:31:02'),
(23, 23, 98, 10, '2026-11-16 03:16:28'),
(24, 24, 0, 10, '2026-11-15 14:52:27'),
(25, 25, 49, 10, '2026-11-17 17:37:53'),
(26, 26, 45, 10, '2026-11-17 17:24:49'),
(27, 27, 84, 10, '2026-11-17 17:37:53'),
(28, 28, 100, 10, '2026-11-16 03:41:30'),
(29, 29, 100, 10, '2026-11-17 11:47:34'),
(30, 30, 14, 10, '2026-11-18 08:07:24'),
(31, 31, 28, 10, '2026-11-17 17:06:09'),
(32, 32, 0, 10, '2026-11-17 14:37:52'),
(33, 33, 15, 10, '2026-11-17 15:19:29'),
(34, 34, 19, 10, '2026-11-18 08:13:20');

-- --------------------------------------------------------

--
-- Table structure for table `inventory_losses`
--

CREATE TABLE `inventory_losses` (
  `loss_id` int(11) NOT NULL,
  `batch_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `reason` enum('expired','damaged','lost','spoiled','other') NOT NULL,
  `notes` text DEFAULT NULL,
  `recorded_by` int(11) NOT NULL,
  `loss_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inventory_losses`
--

INSERT INTO `inventory_losses` (`loss_id`, `batch_id`, `quantity`, `reason`, `notes`, `recorded_by`, `loss_date`) VALUES
(1, 10, 8, 'expired', NULL, 3, '2026-11-09 17:18:10'),
(2, 11, 8, 'expired', NULL, 3, '2026-11-09 17:18:14'),
(3, 9, 8, 'expired', NULL, 3, '2026-11-09 17:18:16'),
(4, 24, 100, 'expired', NULL, 3, '2026-11-15 14:52:27');

-- --------------------------------------------------------

--
-- Table structure for table `inventory_movements`
--

CREATE TABLE `inventory_movements` (
  `movement_id` int(11) NOT NULL,
  `batch_id` int(11) NOT NULL,
  `movement_type` enum('IN','OUT','LOSS','ADJUSTMENT') NOT NULL,
  `quantity` int(11) NOT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inventory_movements`
--

INSERT INTO `inventory_movements` (`movement_id`, `batch_id`, `movement_type`, `quantity`, `reference_id`, `notes`, `created_by`, `created_at`) VALUES
(1, 1, 'OUT', 2, 1, 'Sale transaction', 1, '2026-09-02 17:27:17'),
(2, 1, 'OUT', 1, 2, 'Sale transaction', 1, '2026-09-02 17:33:55'),
(3, 1, 'OUT', 1, 3, 'Sale transaction', 1, '2026-09-03 02:33:09'),
(4, 1, 'OUT', 1, 4, 'Sale transaction', 4, '2026-09-04 01:08:59'),
(5, 1, 'OUT', 2, 5, 'Sale transaction', 4, '2026-09-04 01:19:03'),
(6, 3, 'OUT', 5, 6, 'Sale transaction', 4, '2026-09-04 01:29:20'),
(7, 1, 'OUT', 2, 6, 'Sale transaction', 4, '2026-09-04 01:29:20'),
(8, 4, 'IN', 3, 4, 'Stock-in transaction', 1, '2026-09-04 01:40:55'),
(9, 1, 'OUT', 2, 7, 'Sale transaction', 4, '2026-09-07 12:44:47'),
(10, 1, 'OUT', 9, 8, 'Sale transaction', 4, '2026-09-07 12:47:08'),
(11, 4, 'OUT', 1, 8, 'Sale transaction', 4, '2026-09-07 12:47:08'),
(12, 4, 'OUT', 1, 11, 'Sale transaction', 1, '2026-10-05 02:30:45'),
(13, 2, 'OUT', 2, 15, 'Sale transaction', 1, '2026-10-15 06:11:13'),
(14, 4, 'OUT', 1, 16, 'Sale transaction', 1, '2026-10-15 06:11:26'),
(15, 5, 'IN', 47, 5, 'Stock-in transaction', 1, '2026-10-15 06:25:05'),
(16, 6, 'IN', 30, 6, 'Stock-in transaction', 1, '2026-10-15 06:47:50'),
(17, 7, 'IN', 20, 7, 'Stock-in transaction', 1, '2026-10-15 06:51:21'),
(18, 8, 'IN', 50, 8, 'Stock-in transaction', 1, '2026-10-15 06:52:45'),
(19, 8, 'OUT', 2, 17, 'Sale transaction', 1, '2026-10-15 06:53:51'),
(20, 9, 'IN', 8, 9, 'Stock-in transaction', 1, '2026-10-18 06:11:41'),
(21, 7, 'OUT', 1, 18, 'Sale transaction', 1, '2026-10-18 06:13:50'),
(22, 8, 'OUT', 1, 18, 'Sale transaction', 1, '2026-10-18 06:13:50'),
(23, 8, 'OUT', 2, 30, 'Sale transaction', 1, '2026-10-18 06:34:21'),
(24, 2, 'OUT', 1, 36, 'Sale transaction', 1, '2026-10-18 06:44:05'),
(25, 8, 'OUT', 2, 37, 'Sale transaction', 1, '2026-10-18 06:52:45'),
(26, 8, 'OUT', 2, 38, 'Sale transaction', 1, '2026-10-18 07:39:33'),
(27, 7, 'OUT', 1, 39, 'Sale transaction', 1, '2026-10-18 07:56:19'),
(28, 2, 'OUT', 1, 43, 'Sale transaction', 1, '2026-10-18 15:38:25'),
(29, 7, 'OUT', 1, 44, 'Sale transaction', 4, '2026-10-18 15:49:43'),
(30, 10, 'IN', 10, 10, 'Stock-in transaction', 1, '2026-10-18 16:19:16'),
(31, 10, 'OUT', 2, 45, 'Sale transaction', 1, '2026-10-18 16:20:18'),
(32, 11, 'IN', 10, 11, 'Stock-in transaction', 1, '2026-10-20 00:22:58'),
(33, 11, 'OUT', 2, 46, 'Sale transaction', 1, '2026-10-20 00:23:43'),
(34, 8, 'OUT', 2, 48, 'Sale transaction', 3, '2026-11-06 08:25:43'),
(35, 8, 'OUT', 1, 50, 'Sale transaction', 4, '2026-11-06 08:26:37'),
(36, 12, 'IN', 20, 12, 'Stock-in transaction', 3, '2026-11-06 08:30:20'),
(37, 8, 'OUT', 2, 51, 'Sale transaction', 3, '2026-11-06 08:55:16'),
(38, 13, 'IN', 20, 13, 'Stock-in transaction', 3, '2026-11-06 09:04:01'),
(39, 13, 'OUT', 5, 52, 'Sale transaction', 3, '2026-11-06 09:09:04'),
(40, 13, 'OUT', 2, 53, 'Sale transaction', 4, '2026-11-07 13:55:20'),
(41, 8, 'OUT', 2, 53, 'Sale transaction', 4, '2026-11-07 13:55:20'),
(42, 13, 'OUT', 1, 54, 'Sale transaction', 3, '2026-11-08 05:46:39'),
(43, 2, 'OUT', 1, 57, 'Sale transaction', 3, '2026-11-09 13:34:08'),
(44, 7, 'OUT', 1, 58, 'Sale transaction', 3, '2026-11-09 13:34:11'),
(45, 7, 'OUT', 3, 60, 'Sale transaction', 3, '2026-11-09 13:34:21'),
(46, 13, 'OUT', 2, 61, 'Sale transaction', 3, '2026-11-09 13:34:27'),
(47, 14, 'IN', 20, 14, 'Stock-in transaction', 3, '2026-11-09 13:34:54'),
(48, 15, 'IN', 20, 15, 'Stock-in transaction', 3, '2026-11-09 13:35:23'),
(49, 16, 'IN', 20, 16, 'Stock-in transaction', 3, '2026-11-09 13:35:59'),
(50, 15, 'OUT', 1, 62, 'Sale transaction', 3, '2026-11-09 13:36:08'),
(51, 16, 'OUT', 3, 63, 'Sale transaction', 3, '2026-11-09 13:36:12'),
(52, 15, 'OUT', 1, 64, 'Sale transaction', 3, '2026-11-09 13:36:36'),
(53, 7, 'OUT', 2, 65, 'Sale transaction', 3, '2026-11-09 13:36:38'),
(54, 2, 'OUT', 1, 66, 'Sale transaction', 3, '2026-11-09 13:36:41'),
(55, 12, 'OUT', 6, 67, 'Sale transaction', 3, '2026-11-09 13:36:45'),
(56, 13, 'OUT', 2, 68, 'Sale transaction', 3, '2026-11-09 16:16:43'),
(57, 15, 'OUT', 1, 69, 'Sale transaction', 3, '2026-11-09 16:16:48'),
(58, 15, 'OUT', 1, 70, 'Sale transaction', 3, '2026-11-09 16:18:14'),
(59, 10, 'LOSS', 8, 1, 'Inventory loss recorded. Reason: expired.', 3, '2026-11-09 17:18:10'),
(60, 11, 'LOSS', 8, 2, 'Inventory loss recorded. Reason: expired.', 3, '2026-11-09 17:18:14'),
(61, 9, 'LOSS', 8, 3, 'Inventory loss recorded. Reason: expired.', 3, '2026-11-09 17:18:16'),
(62, 12, 'OUT', 1, 71, 'Sale transaction', 3, '2026-11-09 19:03:05'),
(63, 17, 'IN', 50, 17, 'Stock-in transaction', 3, '2026-11-09 19:31:16'),
(64, 18, 'IN', 10, 18, 'Stock-in transaction', 3, '2026-11-09 19:35:57'),
(65, 7, 'OUT', 1, 72, 'DEMO DATA: synthetic stockout-history sale', 4, '2026-11-10 05:34:29'),
(66, 7, 'OUT', 1, 73, 'DEMO DATA: synthetic stockout-history sale', 4, '2026-11-10 05:34:29'),
(67, 7, 'OUT', 1, 74, 'DEMO DATA: synthetic stockout-history sale', 4, '2026-11-10 05:34:29'),
(68, 7, 'OUT', 1, 75, 'DEMO DATA: synthetic stockout-history sale', 4, '2026-11-10 05:34:29'),
(69, 2, 'OUT', 1, 76, 'DEMO DATA: synthetic stockout-history sale', 4, '2026-11-10 05:34:29'),
(70, 2, 'OUT', 1, 77, 'DEMO DATA: synthetic stockout-history sale', 4, '2026-11-10 05:34:29'),
(71, 2, 'OUT', 1, 78, 'DEMO DATA: synthetic stockout-history sale', 4, '2026-11-10 05:34:29'),
(72, 2, 'OUT', 1, 79, 'DEMO DATA: synthetic stockout-history sale', 4, '2026-11-10 05:34:29'),
(73, 16, 'OUT', 1, 80, 'DEMO DATA: synthetic stockout-history sale', 4, '2026-11-10 05:34:29'),
(74, 16, 'OUT', 1, 81, 'DEMO DATA: synthetic stockout-history sale', 4, '2026-11-10 05:34:29'),
(75, 16, 'OUT', 1, 82, 'DEMO DATA: synthetic stockout-history sale', 4, '2026-11-10 05:34:29'),
(76, 16, 'OUT', 1, 83, 'DEMO DATA: synthetic stockout-history sale', 4, '2026-11-10 05:34:29'),
(77, 16, 'OUT', 1, 84, 'DEMO DATA: synthetic stockout-history sale', 4, '2026-11-10 05:34:29'),
(78, 16, 'OUT', 1, 85, 'DEMO DATA: synthetic stockout-history sale', 4, '2026-11-10 05:34:29'),
(79, 8, 'OUT', 1, 86, 'DEMO DATA: synthetic stockout-history sale', 4, '2026-11-10 05:34:29'),
(80, 8, 'OUT', 1, 87, 'DEMO DATA: synthetic stockout-history sale', 4, '2026-11-10 05:34:29'),
(81, 8, 'OUT', 1, 88, 'DEMO DATA: synthetic stockout-history sale', 4, '2026-11-10 05:34:29'),
(82, 15, 'OUT', 1, 89, 'DEMO DATA: synthetic stockout-history sale', 4, '2026-11-10 05:34:29'),
(83, 15, 'OUT', 1, 90, 'DEMO DATA: synthetic stockout-history sale', 4, '2026-11-10 05:34:29'),
(84, 15, 'OUT', 1, 91, 'DEMO DATA: synthetic stockout-history sale', 4, '2026-11-10 05:34:29'),
(85, 15, 'OUT', 1, 92, 'DEMO DATA: synthetic stockout-history sale', 4, '2026-11-10 05:34:29'),
(86, 15, 'OUT', 1, 93, 'DEMO DATA: synthetic stockout-history sale', 4, '2026-11-10 05:34:29'),
(87, 13, 'OUT', 1, 94, 'DEMO DATA: synthetic stockout-history sale', 4, '2026-11-10 05:34:29'),
(88, 12, 'OUT', 1, 95, 'DEMO DATA: synthetic stockout-history sale', 4, '2026-11-10 05:34:29'),
(89, 12, 'OUT', 1, 96, 'DEMO DATA: synthetic stockout-history sale', 4, '2026-11-10 05:34:29'),
(90, 12, 'OUT', 1, 97, 'DEMO DATA: synthetic stockout-history sale', 4, '2026-11-10 05:34:29'),
(91, 12, 'OUT', 1, 98, 'DEMO DATA: synthetic stockout-history sale', 4, '2026-11-10 05:34:29'),
(92, 8, 'OUT', 1, 99, 'DEMO DATA: synthetic revenue-forecast history sale', 4, '2026-11-10 05:41:27'),
(93, 8, 'OUT', 1, 100, 'DEMO DATA: synthetic revenue-forecast history sale', 4, '2026-11-10 05:41:27'),
(94, 8, 'OUT', 1, 101, 'DEMO DATA: synthetic revenue-forecast history sale', 4, '2026-11-10 05:41:27'),
(95, 8, 'OUT', 1, 102, 'DEMO DATA: synthetic revenue-forecast history sale', 4, '2026-11-10 05:41:27'),
(96, 8, 'OUT', 1, 103, 'DEMO DATA: synthetic revenue-forecast history sale', 4, '2026-11-10 05:41:27'),
(97, 8, 'OUT', 1, 104, 'DEMO DATA: synthetic revenue-forecast history sale', 4, '2026-11-10 05:41:27'),
(98, 12, 'OUT', 2, 167, 'Sale transaction', 3, '2026-11-12 02:58:46'),
(99, 13, 'OUT', 1, 168, 'Sale transaction', 3, '2026-11-12 03:30:42'),
(100, 13, 'OUT', 1, 170, 'Sale transaction', 4, '2026-11-12 14:57:11'),
(101, 19, 'IN', 50, 19, 'Stock-in transaction', 3, '2026-11-12 16:51:55'),
(102, 20, 'IN', 50, 20, 'Stock-in transaction', 3, '2026-11-12 16:52:52'),
(103, 21, 'IN', 25, 21, 'Stock-in transaction', 3, '2026-11-12 18:13:43'),
(104, 13, 'OUT', 1, 171, 'Sale transaction', 3, '2026-11-13 01:07:36'),
(105, 12, 'OUT', 1, 171, 'Sale transaction', 3, '2026-11-13 01:07:36'),
(106, 19, 'OUT', 1, 172, 'Sale transaction', 3, '2026-11-13 02:37:50'),
(107, 19, 'OUT', 2, 173, 'Sale transaction', 5, '2026-11-13 03:47:21'),
(108, 20, 'OUT', 1, 173, 'Sale transaction', 5, '2026-11-13 03:47:21'),
(109, 13, 'OUT', 1, 173, 'Sale transaction', 5, '2026-11-13 03:47:21'),
(110, 12, 'OUT', 1, 174, 'Sale transaction', 5, '2026-11-13 03:48:01'),
(111, 13, 'OUT', 1, 174, 'Sale transaction', 5, '2026-11-13 03:48:01'),
(112, 16, 'OUT', 1, 174, 'Sale transaction', 5, '2026-11-13 03:48:01'),
(113, 22, 'IN', 10, 22, 'Stock-in transaction', 3, '2026-11-13 07:34:51'),
(114, 22, 'ADJUSTMENT', 90, 22, 'Physical count adjustment. Previous inventory quantity: 10; previous batch quantity: 10; counted quantity: 100; inventory quantity change: +90; batch quantity change: +90; reason: physical count correction', 3, '2026-11-13 07:36:44'),
(115, 23, 'IN', 100, 23, 'Stock-in transaction', 3, '2026-11-13 07:37:36'),
(116, 24, 'IN', 100, 24, 'Stock-in transaction', 3, '2026-11-13 07:39:12'),
(117, 25, 'IN', 50, 25, 'Stock-in transaction', 3, '2026-11-13 07:40:06'),
(118, 24, 'LOSS', 100, 4, 'Inventory loss recorded. Reason: expired.', 3, '2026-11-15 14:52:27'),
(119, 22, 'OUT', 1, 175, 'Sale transaction', 3, '2026-11-15 16:31:02'),
(120, 23, 'OUT', 1, 175, 'Sale transaction', 3, '2026-11-15 16:31:02'),
(121, 12, 'OUT', 1, 175, 'Sale transaction', 3, '2026-11-15 16:31:02'),
(122, 13, 'OUT', 1, 176, 'Sale transaction', 3, '2026-11-15 16:31:25'),
(123, 12, 'OUT', 1, 176, 'Sale transaction', 3, '2026-11-15 16:31:25'),
(124, 7, 'OUT', 5, 176, 'Sale transaction', 3, '2026-11-15 16:31:25'),
(125, 15, 'OUT', 4, 176, 'Sale transaction', 3, '2026-11-15 16:31:25'),
(126, 8, 'OUT', 5, 177, 'Sale transaction', 3, '2026-11-15 16:31:37'),
(127, 15, 'OUT', 2, 177, 'Sale transaction', 3, '2026-11-15 16:31:37'),
(128, 8, 'OUT', 4, 178, 'Sale transaction', 3, '2026-11-15 16:48:57'),
(129, 16, 'OUT', 2, 179, 'Sale transaction', 3, '2026-11-15 16:49:17'),
(130, 15, 'OUT', 1, 180, 'Sale transaction', 3, '2026-11-15 17:28:38'),
(131, 8, 'OUT', 1, 181, 'Sale transaction', 3, '2026-11-15 17:28:41'),
(132, 26, 'IN', 50, 26, 'Stock-in transaction', 3, '2026-11-16 02:52:57'),
(133, 26, 'OUT', 2, 192, 'Sale transaction', 3, '2026-11-16 02:53:09'),
(134, 27, 'IN', 100, 27, 'Stock-in transaction', 3, '2026-11-16 03:15:31'),
(135, 27, 'OUT', 1, 193, 'Sale transaction', 3, '2026-11-16 03:15:54'),
(136, 26, 'OUT', 1, 193, 'Sale transaction', 3, '2026-11-16 03:15:54'),
(137, 12, 'OUT', 1, 194, 'Sale transaction', 4, '2026-11-16 03:16:28'),
(138, 23, 'OUT', 1, 194, 'Sale transaction', 4, '2026-11-16 03:16:28'),
(139, 2, 'OUT', 1, 195, 'Sale transaction', 4, '2026-11-16 03:16:37'),
(140, 28, 'IN', 100, 28, 'Stock-in transaction', 3, '2026-11-16 03:41:30'),
(141, 27, 'OUT', 1, 196, 'Sale transaction', 3, '2026-11-16 03:42:03'),
(142, 13, 'OUT', 1, 196, 'Sale transaction', 3, '2026-11-16 03:42:03'),
(143, 18, 'OUT', 5, 196, 'Sale transaction', 3, '2026-11-16 03:42:03'),
(144, 27, 'OUT', 6, 197, 'Sale transaction', 4, '2026-11-16 06:45:41'),
(145, 27, 'OUT', 2, 198, 'Sale transaction', 4, '2026-11-17 09:39:20'),
(146, 27, 'OUT', 1, 199, 'Sale transaction', 4, '2026-11-17 09:44:05'),
(147, 18, 'OUT', 2, 200, 'Sale transaction', 4, '2026-11-17 10:41:16'),
(148, 27, 'OUT', 2, 200, 'Sale transaction', 4, '2026-11-17 10:41:16'),
(223, 18, 'OUT', 1, 238, 'Sale transaction', 4, '2026-11-17 10:45:30'),
(224, 29, 'IN', 100, 29, 'Stock-in transaction', 3, '2026-11-17 11:47:34'),
(225, 30, 'IN', 20, 30, 'Stock-in transaction', 3, '2026-11-17 12:22:33'),
(226, 31, 'IN', 30, 31, 'Stock-in transaction', 3, '2026-11-17 14:31:02'),
(227, 32, 'IN', 20, 32, 'Stock-in transaction', 3, '2026-11-17 14:35:28'),
(228, 32, 'OUT', 10, 239, 'Sale transaction', 3, '2026-11-17 14:36:59'),
(229, 32, 'OUT', 10, 240, 'Sale transaction', 3, '2026-11-17 14:37:52'),
(230, 2, 'OUT', 10, 240, 'Sale transaction', 3, '2026-11-17 14:37:52'),
(231, 33, 'IN', 15, 33, 'Stock-in transaction', 3, '2026-11-17 15:19:29'),
(232, 18, 'OUT', 1, 241, 'Sale transaction', 4, '2026-11-17 15:51:17'),
(233, 31, 'OUT', 1, 241, 'Sale transaction', 4, '2026-11-17 15:51:17'),
(234, 27, 'OUT', 2, 242, 'Sale transaction', 4, '2026-11-17 15:53:56'),
(235, 30, 'OUT', 1, 242, 'Sale transaction', 4, '2026-11-17 15:53:56'),
(236, 15, 'OUT', 1, 243, 'Sale transaction', 4, '2026-11-17 15:54:15'),
(237, 8, 'OUT', 1, 244, 'Sale transaction', 4, '2026-11-17 15:58:33'),
(238, 31, 'OUT', 1, 245, 'Sale transaction', 4, '2026-11-17 17:06:09'),
(239, 26, 'OUT', 2, 246, 'Sale transaction', 3, '2026-11-17 17:24:49'),
(240, 27, 'OUT', 1, 247, 'Sale transaction', 4, '2026-11-17 17:37:53'),
(241, 18, 'OUT', 1, 247, 'Sale transaction', 4, '2026-11-17 17:37:53'),
(242, 25, 'OUT', 1, 247, 'Sale transaction', 4, '2026-11-17 17:37:53'),
(243, 30, 'OUT', 2, 248, 'Sale transaction', 4, '2026-11-17 17:38:49'),
(244, 30, 'OUT', 1, 249, 'Sale transaction', 4, '2026-11-18 07:49:22'),
(245, 30, 'OUT', 2, 250, 'Sale transaction', 4, '2026-11-18 08:07:24'),
(246, 34, 'IN', 20, 34, 'Stock-in transaction', 3, '2026-11-18 08:12:39'),
(247, 34, 'OUT', 1, 254, 'Sale transaction', 4, '2026-11-18 08:13:20');

-- --------------------------------------------------------

--
-- Table structure for table `inventory_settings`
--

CREATE TABLE `inventory_settings` (
  `setting_id` tinyint(3) UNSIGNED NOT NULL,
  `near_expiry_days` smallint(5) UNSIGNED NOT NULL DEFAULT 30,
  `updated_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inventory_settings`
--

INSERT INTO `inventory_settings` (`setting_id`, `near_expiry_days`, `updated_by`, `updated_at`) VALUES
(1, 30, 3, '2026-11-15 17:38:45');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `product_id` int(11) NOT NULL,
  `barcode` varchar(50) DEFAULT NULL,
  `product_name` varchar(150) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `api_source` varchar(100) DEFAULT NULL,
  `unit` varchar(30) NOT NULL,
  `selling_price` decimal(10,2) NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `near_expiry_days` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`product_id`, `barcode`, `product_name`, `category`, `brand`, `image_url`, `api_source`, `unit`, `selling_price`, `status`, `created_at`, `near_expiry_days`) VALUES
(1, '3017620422003', 'Nutella', 'en:Confectionary based spreads', 'Nutella, Ferrero, Yum yum', 'https://images.openfoodfacts.org/images/products/301/762/042/2003/front_en.879.400.jpg', 'Open Food Facts', '400 g', 250.00, 'active', '2026-09-01 10:43:32', NULL),
(2, '5449000000996', 'Coca-Cola', 'Bebidas de cola, pt:bebidas cafeína', 'COCA-COLA SERVICES SA/NV, Coca-Cola', 'https://images.openfoodfacts.org/images/products/544/900/000/0996/front_en.1129.400.jpg', 'Open Food Facts', '330 ml', 75.00, 'active', '2026-09-02 15:51:23', NULL),
(3, '4800274080014', 'QUAKER OATS INSTANT 800G', 'Flocons d\'avoine, en:Instant oats', 'Quaker', 'https://images.openfoodfacts.org/images/products/480/027/408/0014/front_fr.4.400.jpg', 'Open Food Facts', '800 g', 250.00, 'active', '2026-09-14 01:06:57', NULL),
(4, '748485200019', '555 sardines', 'Sardine in scatola', '555', 'https://images.openfoodfacts.org/images/products/074/848/520/0019/front_it.15.400.jpg', 'Open Food Facts', '', 26.00, 'active', '2026-10-05 11:03:23', NULL),
(5, '4806506520846', 'Suncoast Vitamins Boost Grape', '', 'Suncoast', 'https://images.openfoodfacts.org/images/products/480/650/652/0846/front_en.8.400.jpg', 'Open Food Facts', '', 50.00, 'active', '2026-10-15 06:17:36', 30),
(6, '4800361379557', 'nestea lemon 20g', 'Iced teas', 'Nestea', 'https://images.openfoodfacts.org/images/products/480/036/137/9557/front_en.47.400.jpg', 'Open Food Facts', '20g', 20.00, 'active', '2026-10-18 06:34:00', 20),
(7, '4801981127177', 'Coca-Cola Original Taste', 'Colas', 'Coca-Cola', 'https://images.openfoodfacts.org/images/products/480/198/112/7177/front_en.6.400.jpg', 'Open Food Facts', '190ml', 22.00, 'active', '2026-10-20 00:21:46', NULL),
(8, '4807770101854', 'Eggnog Cookies', 'Snacks', 'ONISSIN', 'https://images.openfoodfacts.org/images/products/480/777/010/1854/front_en.19.400.jpg', 'Open Food Facts', '18 g', 10.00, 'active', '2026-11-10 07:04:42', NULL),
(9, '4800092113482', 'hansel crackers (y) 32g', 'Appetizers, Plain biscuit', 'Rebisco', 'https://images.openfoodfacts.org/images/products/480/009/211/3482/front_en.31.400.jpg', 'Open Food Facts', 'l', 10.00, 'active', '2026-11-10 07:10:04', NULL),
(10, '4800016052774', 'C2 Apple Green', 'Green teas, Tea-based beverages', 'C2', 'https://images.openfoodfacts.org/images/products/480/001/605/2774/front_en.28.400.jpg', 'Open Food Facts', '1l', 52.00, 'active', '2026-11-16 02:51:59', NULL),
(11, '4800092113345', 'Rebisco Crackers Whole Wheat', 'Crackers (Appetizers)', '', 'https://images.openfoodfacts.org/images/products/480/009/211/3345/front_en.14.400.jpg', 'Open Food Facts', '32g', 8.00, 'active', '2026-11-16 03:14:21', NULL),
(12, '4809010524034', 'Sugo Greaseless Salted Peanuts', 'Snacks, Peanuts, Greaseless Peanuts, Nuts & seeds', 'Jocker\'s Foods Industries', 'https://images.openfoodfacts.org/images/products/480/901/052/4034/front_en.3.400.jpg', 'Open Food Facts', '0.95 - 1.60', 42.00, 'active', '2026-11-17 09:59:09', NULL),
(13, '073390000127', 'Mentos spearmint', 'Chewing gums', 'Mentos', 'https://images.openfoodfacts.org/images/products/007/339/000/0127/front_en.22.400.jpg', 'Open Food Facts', '37.5 g', 35.00, 'active', '2026-11-18 08:10:17', 50);

-- --------------------------------------------------------

--
-- Table structure for table `product_replenishment_settings`
--

CREATE TABLE `product_replenishment_settings` (
  `product_id` int(11) NOT NULL,
  `lead_time_days` smallint(5) UNSIGNED NOT NULL DEFAULT 7,
  `updated_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_replenishment_settings`
--

INSERT INTO `product_replenishment_settings` (`product_id`, `lead_time_days`, `updated_by`, `updated_at`) VALUES
(4, 7, 3, '2026-11-16 03:42:25');

-- --------------------------------------------------------

--
-- Table structure for table `sales`
--

CREATE TABLE `sales` (
  `sale_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `total_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `payment_method` enum('cash','gcash','card') NOT NULL,
  `sale_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sales`
--

INSERT INTO `sales` (`sale_id`, `user_id`, `total_amount`, `payment_method`, `sale_date`) VALUES
(1, 1, 500.00, 'cash', '2026-09-02 17:27:17'),
(2, 1, 250.00, 'cash', '2026-09-02 17:33:55'),
(3, 1, 250.00, 'cash', '2026-09-03 02:33:09'),
(4, 4, 250.00, 'cash', '2026-09-04 01:08:59'),
(5, 4, 500.00, 'cash', '2026-09-04 01:19:03'),
(6, 4, 1750.00, 'cash', '2026-09-04 01:29:20'),
(7, 4, 500.00, 'cash', '2026-09-07 12:44:47'),
(8, 4, 2500.00, 'cash', '2026-09-07 12:47:07'),
(11, 1, 250.00, 'cash', '2026-10-05 02:30:45'),
(15, 1, 150.00, 'cash', '2026-10-15 06:11:12'),
(16, 1, 250.00, 'gcash', '2026-10-15 06:11:26'),
(17, 1, 50.00, 'card', '2026-10-15 06:53:51'),
(18, 1, 275.00, 'cash', '2026-10-18 06:13:50'),
(30, 1, 50.00, 'cash', '2026-10-18 06:34:21'),
(36, 1, 75.00, 'cash', '2026-10-18 06:44:05'),
(37, 1, 50.00, 'gcash', '2026-10-18 06:52:45'),
(38, 1, 50.00, 'cash', '2026-10-18 07:39:33'),
(39, 1, 250.00, 'cash', '2026-10-18 07:56:19'),
(43, 1, 75.00, 'cash', '2026-10-18 15:38:25'),
(44, 4, 250.00, 'cash', '2026-10-18 15:49:43'),
(45, 1, 39.00, 'cash', '2026-10-18 16:20:18'),
(46, 1, 40.00, 'cash', '2026-10-20 00:23:43'),
(48, 3, 50.00, 'cash', '2026-11-06 08:25:43'),
(50, 4, 25.00, 'cash', '2026-11-06 08:26:37'),
(51, 3, 50.00, 'cash', '2026-11-06 08:55:16'),
(52, 3, 97.50, 'gcash', '2026-11-06 09:09:04'),
(53, 4, 89.00, 'cash', '2026-11-07 13:55:20'),
(54, 3, 19.50, 'cash', '2026-11-08 05:46:39'),
(57, 3, 75.00, 'cash', '2026-11-09 13:34:08'),
(58, 3, 250.00, 'cash', '2026-11-09 13:34:11'),
(60, 3, 750.00, 'cash', '2026-11-09 13:34:21'),
(61, 3, 39.00, 'cash', '2026-11-09 13:34:27'),
(62, 3, 50.00, 'card', '2026-11-09 13:36:08'),
(63, 3, 750.00, 'cash', '2026-11-09 13:36:12'),
(64, 3, 50.00, 'cash', '2026-11-09 13:36:36'),
(65, 3, 500.00, 'cash', '2026-11-09 13:36:38'),
(66, 3, 75.00, 'cash', '2026-11-09 13:36:41'),
(67, 3, 120.00, 'cash', '2026-11-09 13:36:45'),
(68, 3, 39.00, 'cash', '2026-11-09 16:16:43'),
(69, 3, 50.00, 'cash', '2026-11-09 16:16:48'),
(70, 3, 50.00, 'cash', '2026-11-09 16:18:14'),
(71, 3, 20.00, 'cash', '2026-11-09 19:03:05'),
(72, 4, 250.00, 'cash', '2026-10-12 04:00:00'),
(73, 4, 250.00, 'cash', '2026-10-23 04:00:00'),
(74, 4, 250.00, 'cash', '2026-10-31 04:00:00'),
(75, 4, 250.00, 'cash', '2026-11-10 04:00:00'),
(76, 4, 75.00, 'cash', '2026-10-12 04:00:00'),
(77, 4, 75.00, 'cash', '2026-10-23 04:00:00'),
(78, 4, 75.00, 'cash', '2026-10-31 04:00:00'),
(79, 4, 75.00, 'cash', '2026-11-10 04:00:00'),
(80, 4, 250.00, 'cash', '2026-10-12 04:00:00'),
(81, 4, 250.00, 'cash', '2026-10-18 04:00:00'),
(82, 4, 250.00, 'cash', '2026-10-23 04:00:00'),
(83, 4, 250.00, 'cash', '2026-10-29 04:00:00'),
(84, 4, 250.00, 'cash', '2026-11-03 04:00:00'),
(85, 4, 250.00, 'cash', '2026-11-10 04:00:00'),
(86, 4, 25.00, 'cash', '2026-10-12 04:00:00'),
(87, 4, 25.00, 'cash', '2026-10-26 04:00:00'),
(88, 4, 25.00, 'cash', '2026-11-10 04:00:00'),
(89, 4, 50.00, 'cash', '2026-10-12 04:00:00'),
(90, 4, 50.00, 'cash', '2026-10-19 04:00:00'),
(91, 4, 50.00, 'cash', '2026-10-26 04:00:00'),
(92, 4, 50.00, 'cash', '2026-11-01 04:00:00'),
(93, 4, 50.00, 'cash', '2026-11-08 04:00:00'),
(94, 4, 19.50, 'cash', '2026-10-25 04:00:00'),
(95, 4, 20.00, 'cash', '2026-10-12 04:00:00'),
(96, 4, 20.00, 'cash', '2026-10-22 04:00:00'),
(97, 4, 20.00, 'cash', '2026-10-30 04:00:00'),
(98, 4, 20.00, 'cash', '2026-11-08 04:00:00'),
(99, 4, 25.00, 'cash', '2026-09-08 04:00:00'),
(100, 4, 25.00, 'cash', '2026-09-09 04:00:00'),
(101, 4, 25.00, 'cash', '2026-09-10 04:00:00'),
(102, 4, 25.00, 'cash', '2026-09-12 04:00:00'),
(103, 4, 25.00, 'cash', '2026-09-16 04:00:00'),
(104, 4, 25.00, 'cash', '2026-09-23 04:00:00'),
(105, 1, 1000.00, 'cash', '2026-11-08 04:00:00'),
(106, 1, 1250.00, 'cash', '2026-11-01 04:00:00'),
(107, 1, 1250.00, 'cash', '2026-10-26 04:00:00'),
(108, 1, 1500.00, 'cash', '2026-10-19 04:00:00'),
(109, 1, 375.00, 'cash', '2026-11-08 04:00:00'),
(110, 1, 450.00, 'cash', '2026-11-01 04:00:00'),
(111, 1, 450.00, 'cash', '2026-10-26 04:00:00'),
(112, 1, 300.00, 'cash', '2026-10-19 04:00:00'),
(113, 1, 300.00, 'cash', '2026-10-13 04:00:00'),
(114, 1, 375.00, 'cash', '2026-10-06 04:00:00'),
(115, 1, 450.00, 'cash', '2026-09-29 04:00:00'),
(116, 1, 450.00, 'cash', '2026-09-23 04:00:00'),
(117, 1, 1500.00, 'cash', '2026-11-08 04:00:00'),
(118, 1, 1000.00, 'cash', '2026-11-01 04:00:00'),
(119, 1, 1000.00, 'cash', '2026-10-26 04:00:00'),
(120, 1, 1250.00, 'cash', '2026-10-19 04:00:00'),
(121, 1, 1250.00, 'cash', '2026-10-13 04:00:00'),
(122, 1, 1500.00, 'cash', '2026-10-06 04:00:00'),
(123, 1, 1000.00, 'cash', '2026-09-29 04:00:00'),
(124, 1, 1000.00, 'cash', '2026-09-23 04:00:00'),
(125, 1, 100.00, 'cash', '2026-11-08 04:00:00'),
(126, 1, 125.00, 'cash', '2026-11-01 04:00:00'),
(127, 1, 200.00, 'cash', '2026-10-13 04:00:00'),
(128, 1, 250.00, 'cash', '2026-10-06 04:00:00'),
(129, 1, 300.00, 'cash', '2026-09-29 04:00:00'),
(130, 1, 300.00, 'cash', '2026-09-23 04:00:00'),
(131, 1, 200.00, 'cash', '2026-09-16 04:00:00'),
(132, 1, 250.00, 'cash', '2026-09-09 04:00:00'),
(133, 1, 250.00, 'cash', '2026-09-03 04:00:00'),
(134, 1, 300.00, 'cash', '2026-08-27 04:00:00'),
(135, 1, 78.00, 'cash', '2026-11-01 04:00:00'),
(136, 1, 78.00, 'cash', '2026-10-26 04:00:00'),
(137, 1, 97.50, 'cash', '2026-10-13 04:00:00'),
(138, 1, 117.00, 'cash', '2026-10-06 04:00:00'),
(139, 1, 78.00, 'cash', '2026-09-29 04:00:00'),
(140, 1, 78.00, 'cash', '2026-09-23 04:00:00'),
(141, 1, 97.50, 'cash', '2026-09-16 04:00:00'),
(142, 1, 117.00, 'cash', '2026-09-09 04:00:00'),
(143, 1, 100.00, 'cash', '2026-11-01 04:00:00'),
(144, 1, 100.00, 'cash', '2026-10-26 04:00:00'),
(145, 1, 120.00, 'cash', '2026-10-19 04:00:00'),
(146, 1, 120.00, 'cash', '2026-10-13 04:00:00'),
(147, 1, 80.00, 'cash', '2026-10-06 04:00:00'),
(148, 1, 100.00, 'cash', '2026-09-29 04:00:00'),
(149, 1, 100.00, 'cash', '2026-09-23 04:00:00'),
(150, 1, 120.00, 'cash', '2026-09-16 04:00:00'),
(167, 3, 40.00, 'cash', '2026-11-12 02:58:46'),
(168, 3, 19.50, 'cash', '2026-11-12 03:30:42'),
(170, 4, 19.50, 'cash', '2026-11-12 14:57:11'),
(171, 3, 39.50, 'card', '2026-11-13 01:07:36'),
(172, 3, 10.00, 'cash', '2026-11-13 02:37:50'),
(173, 5, 49.50, 'gcash', '2026-11-13 03:47:21'),
(174, 5, 289.50, 'card', '2026-11-13 03:48:01'),
(175, 3, 42.00, 'card', '2026-11-15 16:31:02'),
(176, 3, 1492.00, 'cash', '2026-11-15 16:31:25'),
(177, 3, 230.00, 'cash', '2026-11-15 16:31:37'),
(178, 3, 104.00, 'cash', '2026-11-15 16:48:57'),
(179, 3, 500.00, 'gcash', '2026-11-15 16:49:17'),
(180, 3, 50.00, 'gcash', '2026-11-15 17:28:38'),
(181, 3, 26.00, 'cash', '2026-11-15 17:28:41'),
(182, 1, 3900.00, 'cash', '2026-09-19 02:00:00'),
(183, 1, 3900.00, 'cash', '2026-09-23 02:00:00'),
(184, 1, 3900.00, 'cash', '2026-09-27 02:00:00'),
(185, 1, 3900.00, 'cash', '2026-10-01 02:00:00'),
(186, 1, 3900.00, 'cash', '2026-10-05 02:00:00'),
(187, 1, 3900.00, 'cash', '2026-10-09 02:00:00'),
(188, 1, 3900.00, 'cash', '2026-10-13 02:00:00'),
(189, 1, 3900.00, 'cash', '2026-10-17 02:00:00'),
(190, 1, 400.00, 'cash', '2026-10-27 02:00:00'),
(191, 1, 400.00, 'cash', '2026-11-08 02:00:00'),
(192, 3, 104.00, 'cash', '2026-11-16 02:53:09'),
(193, 3, 60.00, 'gcash', '2026-11-16 03:15:54'),
(194, 4, 32.00, 'cash', '2026-11-16 03:16:28'),
(195, 4, 75.00, 'cash', '2026-11-16 03:16:37'),
(196, 3, 128.00, 'gcash', '2026-11-16 03:42:03'),
(197, 4, 48.00, 'cash', '2026-11-16 06:45:41'),
(198, 4, 16.00, 'cash', '2026-11-17 09:39:20'),
(199, 4, 8.00, 'cash', '2026-11-17 09:44:05'),
(200, 4, 56.00, 'gcash', '2026-11-17 10:41:16'),
(238, 4, 20.00, 'cash', '2026-11-17 10:45:30'),
(239, 3, 750.00, 'cash', '2026-11-17 14:36:59'),
(240, 3, 1500.00, 'cash', '2026-11-17 14:37:52'),
(241, 4, 42.00, 'cash', '2026-11-17 15:51:17'),
(242, 4, 58.00, 'cash', '2026-11-17 15:53:56'),
(243, 4, 50.00, 'cash', '2026-11-17 15:54:15'),
(244, 4, 26.00, 'gcash', '2026-11-17 15:58:33'),
(245, 4, 22.00, 'card', '2026-11-17 17:06:09'),
(246, 3, 104.00, 'gcash', '2026-11-17 17:24:49'),
(247, 4, 48.00, 'card', '2026-11-17 17:37:53'),
(248, 4, 84.00, 'gcash', '2026-11-17 17:38:49'),
(249, 4, 42.00, 'cash', '2026-11-18 07:49:22'),
(250, 4, 84.00, 'cash', '2026-11-18 08:07:24'),
(254, 4, 35.00, 'cash', '2026-11-18 08:13:20');

-- --------------------------------------------------------

--
-- Table structure for table `sales_cart_items`
--

CREATE TABLE `sales_cart_items` (
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `selected_batch_id` int(11) DEFAULT NULL,
  `batch_override_reason` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sale_items`
--

CREATE TABLE `sale_items` (
  `sale_item_id` int(11) NOT NULL,
  `sale_id` int(11) NOT NULL,
  `batch_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sale_items`
--

INSERT INTO `sale_items` (`sale_item_id`, `sale_id`, `batch_id`, `quantity`, `unit_price`, `subtotal`) VALUES
(1, 1, 1, 2, 250.00, 500.00),
(2, 2, 1, 1, 250.00, 250.00),
(3, 3, 1, 1, 250.00, 250.00),
(4, 4, 1, 1, 250.00, 250.00),
(5, 5, 1, 2, 250.00, 500.00),
(6, 6, 3, 5, 250.00, 1250.00),
(7, 6, 1, 2, 250.00, 500.00),
(8, 7, 1, 2, 250.00, 500.00),
(9, 8, 1, 9, 250.00, 2250.00),
(10, 8, 4, 1, 250.00, 250.00),
(11, 11, 4, 1, 250.00, 250.00),
(12, 15, 2, 2, 75.00, 150.00),
(13, 16, 4, 1, 250.00, 250.00),
(14, 17, 8, 2, 25.00, 50.00),
(15, 18, 7, 1, 250.00, 250.00),
(16, 18, 8, 1, 25.00, 25.00),
(17, 30, 8, 2, 25.00, 50.00),
(18, 36, 2, 1, 75.00, 75.00),
(19, 37, 8, 2, 25.00, 50.00),
(20, 38, 8, 2, 25.00, 50.00),
(21, 39, 7, 1, 250.00, 250.00),
(22, 43, 2, 1, 75.00, 75.00),
(23, 44, 7, 1, 250.00, 250.00),
(24, 45, 10, 2, 19.50, 39.00),
(25, 46, 11, 2, 20.00, 40.00),
(26, 48, 8, 2, 25.00, 50.00),
(27, 50, 8, 1, 25.00, 25.00),
(28, 51, 8, 2, 25.00, 50.00),
(29, 52, 13, 5, 19.50, 97.50),
(30, 53, 13, 2, 19.50, 39.00),
(31, 53, 8, 2, 25.00, 50.00),
(32, 54, 13, 1, 19.50, 19.50),
(33, 57, 2, 1, 75.00, 75.00),
(34, 58, 7, 1, 250.00, 250.00),
(35, 60, 7, 3, 250.00, 750.00),
(36, 61, 13, 2, 19.50, 39.00),
(37, 62, 15, 1, 50.00, 50.00),
(38, 63, 16, 3, 250.00, 750.00),
(39, 64, 15, 1, 50.00, 50.00),
(40, 65, 7, 2, 250.00, 500.00),
(41, 66, 2, 1, 75.00, 75.00),
(42, 67, 12, 6, 20.00, 120.00),
(43, 68, 13, 2, 19.50, 39.00),
(44, 69, 15, 1, 50.00, 50.00),
(45, 70, 15, 1, 50.00, 50.00),
(46, 71, 12, 1, 20.00, 20.00),
(47, 72, 7, 1, 250.00, 250.00),
(48, 73, 7, 1, 250.00, 250.00),
(49, 74, 7, 1, 250.00, 250.00),
(50, 75, 7, 1, 250.00, 250.00),
(51, 76, 2, 1, 75.00, 75.00),
(52, 77, 2, 1, 75.00, 75.00),
(53, 78, 2, 1, 75.00, 75.00),
(54, 79, 2, 1, 75.00, 75.00),
(55, 80, 16, 1, 250.00, 250.00),
(56, 81, 16, 1, 250.00, 250.00),
(57, 82, 16, 1, 250.00, 250.00),
(58, 83, 16, 1, 250.00, 250.00),
(59, 84, 16, 1, 250.00, 250.00),
(60, 85, 16, 1, 250.00, 250.00),
(61, 86, 8, 1, 25.00, 25.00),
(62, 87, 8, 1, 25.00, 25.00),
(63, 88, 8, 1, 25.00, 25.00),
(64, 89, 15, 1, 50.00, 50.00),
(65, 90, 15, 1, 50.00, 50.00),
(66, 91, 15, 1, 50.00, 50.00),
(67, 92, 15, 1, 50.00, 50.00),
(68, 93, 15, 1, 50.00, 50.00),
(69, 94, 13, 1, 19.50, 19.50),
(70, 95, 12, 1, 20.00, 20.00),
(71, 96, 12, 1, 20.00, 20.00),
(72, 97, 12, 1, 20.00, 20.00),
(73, 98, 12, 1, 20.00, 20.00),
(74, 99, 8, 1, 25.00, 25.00),
(75, 100, 8, 1, 25.00, 25.00),
(76, 101, 8, 1, 25.00, 25.00),
(77, 102, 8, 1, 25.00, 25.00),
(78, 103, 8, 1, 25.00, 25.00),
(79, 104, 8, 1, 25.00, 25.00),
(80, 105, 1, 4, 250.00, 1000.00),
(81, 106, 1, 5, 250.00, 1250.00),
(82, 107, 1, 5, 250.00, 1250.00),
(83, 108, 1, 6, 250.00, 1500.00),
(84, 109, 2, 5, 75.00, 375.00),
(85, 110, 2, 6, 75.00, 450.00),
(86, 111, 2, 6, 75.00, 450.00),
(87, 112, 2, 4, 75.00, 300.00),
(88, 113, 2, 4, 75.00, 300.00),
(89, 114, 2, 5, 75.00, 375.00),
(90, 115, 2, 6, 75.00, 450.00),
(91, 116, 2, 6, 75.00, 450.00),
(92, 117, 16, 6, 250.00, 1500.00),
(93, 118, 16, 4, 250.00, 1000.00),
(94, 119, 16, 4, 250.00, 1000.00),
(95, 120, 16, 5, 250.00, 1250.00),
(96, 121, 16, 5, 250.00, 1250.00),
(97, 122, 16, 6, 250.00, 1500.00),
(98, 123, 16, 4, 250.00, 1000.00),
(99, 124, 16, 4, 250.00, 1000.00),
(100, 125, 8, 4, 25.00, 100.00),
(101, 126, 8, 5, 25.00, 125.00),
(102, 127, 15, 4, 50.00, 200.00),
(103, 128, 15, 5, 50.00, 250.00),
(104, 129, 15, 6, 50.00, 300.00),
(105, 130, 15, 6, 50.00, 300.00),
(106, 131, 15, 4, 50.00, 200.00),
(107, 132, 15, 5, 50.00, 250.00),
(108, 133, 15, 5, 50.00, 250.00),
(109, 134, 15, 6, 50.00, 300.00),
(110, 135, 13, 4, 19.50, 78.00),
(111, 136, 13, 4, 19.50, 78.00),
(112, 137, 13, 5, 19.50, 97.50),
(113, 138, 13, 6, 19.50, 117.00),
(114, 139, 13, 4, 19.50, 78.00),
(115, 140, 13, 4, 19.50, 78.00),
(116, 141, 13, 5, 19.50, 97.50),
(117, 142, 13, 6, 19.50, 117.00),
(118, 143, 12, 5, 20.00, 100.00),
(119, 144, 12, 5, 20.00, 100.00),
(120, 145, 12, 6, 20.00, 120.00),
(121, 146, 12, 6, 20.00, 120.00),
(122, 147, 12, 4, 20.00, 80.00),
(123, 148, 12, 5, 20.00, 100.00),
(124, 149, 12, 5, 20.00, 100.00),
(125, 150, 12, 6, 20.00, 120.00),
(126, 167, 12, 2, 20.00, 40.00),
(127, 168, 13, 1, 19.50, 19.50),
(128, 170, 13, 1, 19.50, 19.50),
(129, 171, 13, 1, 19.50, 19.50),
(130, 171, 12, 1, 20.00, 20.00),
(131, 172, 19, 1, 10.00, 10.00),
(132, 173, 19, 2, 10.00, 20.00),
(133, 173, 20, 1, 10.00, 10.00),
(134, 173, 13, 1, 19.50, 19.50),
(135, 174, 12, 1, 20.00, 20.00),
(136, 174, 13, 1, 19.50, 19.50),
(137, 174, 16, 1, 250.00, 250.00),
(138, 175, 22, 1, 10.00, 10.00),
(139, 175, 23, 1, 10.00, 10.00),
(140, 175, 12, 1, 22.00, 22.00),
(141, 176, 13, 1, 20.00, 20.00),
(142, 176, 12, 1, 22.00, 22.00),
(143, 176, 7, 5, 250.00, 1250.00),
(144, 176, 15, 4, 50.00, 200.00),
(145, 177, 8, 5, 26.00, 130.00),
(146, 177, 15, 2, 50.00, 100.00),
(147, 178, 8, 4, 26.00, 104.00),
(148, 179, 16, 2, 250.00, 500.00),
(149, 180, 15, 1, 50.00, 50.00),
(150, 181, 8, 1, 26.00, 26.00),
(151, 182, 1, 12, 250.00, 3000.00),
(152, 182, 2, 12, 75.00, 900.00),
(153, 183, 1, 12, 250.00, 3000.00),
(154, 183, 2, 12, 75.00, 900.00),
(155, 184, 1, 12, 250.00, 3000.00),
(156, 184, 2, 12, 75.00, 900.00),
(157, 185, 1, 12, 250.00, 3000.00),
(158, 185, 2, 12, 75.00, 900.00),
(159, 186, 1, 12, 250.00, 3000.00),
(160, 186, 2, 12, 75.00, 900.00),
(161, 187, 1, 12, 250.00, 3000.00),
(162, 187, 2, 12, 75.00, 900.00),
(163, 188, 1, 12, 250.00, 3000.00),
(164, 188, 2, 12, 75.00, 900.00),
(165, 189, 1, 12, 250.00, 3000.00),
(166, 189, 2, 12, 75.00, 900.00),
(167, 190, 1, 1, 250.00, 250.00),
(168, 190, 2, 2, 75.00, 150.00),
(169, 191, 1, 1, 250.00, 250.00),
(170, 191, 2, 2, 75.00, 150.00),
(171, 192, 26, 2, 52.00, 104.00),
(172, 193, 27, 1, 8.00, 8.00),
(173, 193, 26, 1, 52.00, 52.00),
(174, 194, 12, 1, 22.00, 22.00),
(175, 194, 23, 1, 10.00, 10.00),
(176, 195, 2, 1, 75.00, 75.00),
(177, 196, 27, 1, 8.00, 8.00),
(178, 196, 13, 1, 20.00, 20.00),
(179, 196, 18, 5, 20.00, 100.00),
(180, 197, 27, 6, 8.00, 48.00),
(181, 198, 27, 2, 8.00, 16.00),
(182, 199, 27, 1, 8.00, 8.00),
(183, 200, 18, 2, 20.00, 40.00),
(184, 200, 27, 2, 8.00, 16.00),
(259, 238, 18, 1, 20.00, 20.00),
(260, 239, 32, 10, 75.00, 750.00),
(261, 240, 32, 10, 75.00, 750.00),
(262, 240, 2, 10, 75.00, 750.00),
(263, 241, 18, 1, 20.00, 20.00),
(264, 241, 31, 1, 22.00, 22.00),
(265, 242, 27, 2, 8.00, 16.00),
(266, 242, 30, 1, 42.00, 42.00),
(267, 243, 15, 1, 50.00, 50.00),
(268, 244, 8, 1, 26.00, 26.00),
(269, 245, 31, 1, 22.00, 22.00),
(270, 246, 26, 2, 52.00, 104.00),
(271, 247, 27, 1, 8.00, 8.00),
(272, 247, 18, 1, 20.00, 20.00),
(273, 247, 25, 1, 20.00, 20.00),
(274, 248, 30, 2, 42.00, 84.00),
(275, 249, 30, 1, 42.00, 42.00),
(276, 250, 30, 2, 42.00, 84.00),
(277, 254, 34, 1, 35.00, 35.00);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `role` enum('admin','owner','manager','cashier') NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `password`, `full_name`, `role`, `status`, `created_at`) VALUES
(1, 'admin', 'scrypt:32768:8:1$9lPU346jkWpssSqQ$0b2c58632bccbfbcd28afac6d17a18acb6529ac20a9fe126b280c769d83725d5e2c44e45df33343fe4f989b72f88cf6e14392a9f83a7a2f6de863ae146b93b04', 'System Administrator', 'admin', 'active', '2026-09-01 09:32:53'),
(3, 'manager', 'scrypt:32768:8:1$olmadmcOcMxlqZwy$6e13861309f3a979c2719e981b17ecc010314795c9341bb03233fbd11d8f5cd577d9e15e934147a6484b42b6fb0cf642dcaaaa8b325259d2fa87b0b25d21d199', 'Store Manager', 'manager', 'active', '2026-09-01 09:32:53'),
(4, 'cashier', 'scrypt:32768:8:1$L0FjF6f4buyqrWGK$75e7b0ced5b1c80209822e22fdb0136b96a560667ab1392f1b61328704f6188bb91e9ce603480192cf91684f4fe136ab59555ed14316d342d640ec55933cdab5', 'Store Cashier', 'cashier', 'active', '2026-09-01 09:32:53'),
(5, 'cashier2', 'scrypt:32768:8:1$NvtJNMRpI6SqNaLB$80fe94bacfe90e33a6c94c5dbc6b054a87f82a9f24813b54284aaf1b5cf34579b939669736f047b925417039c19a5aea0fe605914825a3b8025a3cac74beaf1b', 'SCashier 2', 'cashier', 'inactive', '2026-11-12 15:47:34'),
(7, 'cashier3', 'scrypt:32768:8:1$eQwIttyZi6vJKYqC$0addc9ac04bd16fb0f2ebc5baba3211301cf1b1d119eabe781b5140ac006e44e099cf54e5b926722572e943317020028414d3d39cf99d23cc04b310714c6fd62', 'Store Cashier 3', 'cashier', 'active', '2026-11-18 07:59:06');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `batches`
--
ALTER TABLE `batches`
  ADD PRIMARY KEY (`batch_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `inventory`
--
ALTER TABLE `inventory`
  ADD PRIMARY KEY (`inventory_id`),
  ADD KEY `batch_id` (`batch_id`);

--
-- Indexes for table `inventory_losses`
--
ALTER TABLE `inventory_losses`
  ADD PRIMARY KEY (`loss_id`),
  ADD KEY `batch_id` (`batch_id`),
  ADD KEY `recorded_by` (`recorded_by`);

--
-- Indexes for table `inventory_movements`
--
ALTER TABLE `inventory_movements`
  ADD PRIMARY KEY (`movement_id`),
  ADD KEY `batch_id` (`batch_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `inventory_settings`
--
ALTER TABLE `inventory_settings`
  ADD PRIMARY KEY (`setting_id`),
  ADD KEY `inventory_settings_updated_by_fk` (`updated_by`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`),
  ADD UNIQUE KEY `barcode` (`barcode`);

--
-- Indexes for table `product_replenishment_settings`
--
ALTER TABLE `product_replenishment_settings`
  ADD PRIMARY KEY (`product_id`),
  ADD KEY `product_replenishment_user_fk` (`updated_by`);

--
-- Indexes for table `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`sale_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `sales_cart_items`
--
ALTER TABLE `sales_cart_items`
  ADD PRIMARY KEY (`user_id`,`product_id`),
  ADD KEY `idx_sales_cart_product` (`product_id`);

--
-- Indexes for table `sale_items`
--
ALTER TABLE `sale_items`
  ADD PRIMARY KEY (`sale_item_id`),
  ADD KEY `sale_id` (`sale_id`),
  ADD KEY `batch_id` (`batch_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=312;

--
-- AUTO_INCREMENT for table `batches`
--
ALTER TABLE `batches`
  MODIFY `batch_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `inventory`
--
ALTER TABLE `inventory`
  MODIFY `inventory_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `inventory_losses`
--
ALTER TABLE `inventory_losses`
  MODIFY `loss_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `inventory_movements`
--
ALTER TABLE `inventory_movements`
  MODIFY `movement_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=248;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `sales`
--
ALTER TABLE `sales`
  MODIFY `sale_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=255;

--
-- AUTO_INCREMENT for table `sale_items`
--
ALTER TABLE `sale_items`
  MODIFY `sale_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=278;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE;

--
-- Constraints for table `batches`
--
ALTER TABLE `batches`
  ADD CONSTRAINT `batches_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON UPDATE CASCADE;

--
-- Constraints for table `inventory`
--
ALTER TABLE `inventory`
  ADD CONSTRAINT `inventory_ibfk_1` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`batch_id`) ON UPDATE CASCADE;

--
-- Constraints for table `inventory_losses`
--
ALTER TABLE `inventory_losses`
  ADD CONSTRAINT `inventory_losses_ibfk_1` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`batch_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `inventory_losses_ibfk_2` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE;

--
-- Constraints for table `inventory_movements`
--
ALTER TABLE `inventory_movements`
  ADD CONSTRAINT `inventory_movements_ibfk_1` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`batch_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `inventory_movements_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE;

--
-- Constraints for table `inventory_settings`
--
ALTER TABLE `inventory_settings`
  ADD CONSTRAINT `inventory_settings_updated_by_fk` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE;

--
-- Constraints for table `product_replenishment_settings`
--
ALTER TABLE `product_replenishment_settings`
  ADD CONSTRAINT `product_replenishment_product_fk` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `product_replenishment_user_fk` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `sales`
--
ALTER TABLE `sales`
  ADD CONSTRAINT `sales_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE;

--
-- Constraints for table `sale_items`
--
ALTER TABLE `sale_items`
  ADD CONSTRAINT `sale_items_ibfk_1` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`sale_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `sale_items_ibfk_2` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`batch_id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
