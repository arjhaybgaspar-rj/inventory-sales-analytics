-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 08, 2026 at 03:53 AM
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

-- --------------------------------------------------------

--
-- Table structure for table `batches`
--

CREATE TABLE `batches` (
  `batch_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `batch_number` varchar(50) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `acquisition_cost` decimal(10,2) NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `received_date` date NOT NULL,
  `status` enum('available','expired','disposed') DEFAULT 'available'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `batches`
--

INSERT INTO `batches` (`batch_id`, `product_id`, `batch_number`, `quantity`, `acquisition_cost`, `expiry_date`, `received_date`, `status`) VALUES
(1, 1, 'NUT-001', 0, 180.00, '2027-06-30', '2026-09-03', 'available'),
(2, 2, 'COKE-001', 30, 50.00, '2027-08-30', '2026-09-03', 'available'),
(3, 1, 'NUT-002', 0, 180.00, '2027-05-30', '2026-09-04', 'available'),
(4, 1, 'NUT-003', 2, 180.00, '2027-08-30', '2026-09-04', 'available');

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
(2, 2, 30, 10, '2026-09-02 16:50:37'),
(3, 3, 0, 10, '2026-09-04 01:29:20'),
(4, 4, 2, 10, '2026-09-07 12:47:08');

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
(11, 4, 'OUT', 1, 8, 'Sale transaction', 4, '2026-09-07 12:47:08');

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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`product_id`, `barcode`, `product_name`, `category`, `brand`, `image_url`, `api_source`, `unit`, `selling_price`, `status`, `created_at`) VALUES
(1, '3017620422003', 'Nutella', 'en:Confectionary based spreads', 'Nutella, Ferrero, Yum yum', 'https://images.openfoodfacts.org/images/products/301/762/042/2003/front_en.879.400.jpg', 'Open Food Facts', '400 g', 250.00, 'active', '2026-09-01 10:43:32'),
(2, '5449000000996', 'Coca-Cola', 'Bebidas de cola, pt:bebidas cafeína', 'COCA-COLA SERVICES SA/NV, Coca-Cola', 'https://images.openfoodfacts.org/images/products/544/900/000/0996/front_en.1129.400.jpg', 'Open Food Facts', '330 ml', 75.00, 'active', '2026-09-02 15:51:23');

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
(8, 4, 2500.00, 'cash', '2026-09-07 12:47:07');

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
(10, 8, 4, 1, 250.00, 250.00);

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
(1, 'admin', 'admin123', 'System Administrator', 'admin', 'active', '2026-09-01 09:32:53'),
(2, 'owner', 'owner123', 'Store Owner', 'owner', 'active', '2026-09-01 09:32:53'),
(3, 'manager', 'manager123', 'Store Manager', 'manager', 'active', '2026-09-01 09:32:53'),
(4, 'cashier', 'cashier123', 'Store Cashier', 'cashier', 'active', '2026-09-01 09:32:53');

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
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`),
  ADD UNIQUE KEY `barcode` (`barcode`);

--
-- Indexes for table `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`sale_id`),
  ADD KEY `user_id` (`user_id`);

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
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `batches`
--
ALTER TABLE `batches`
  MODIFY `batch_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `inventory`
--
ALTER TABLE `inventory`
  MODIFY `inventory_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `inventory_losses`
--
ALTER TABLE `inventory_losses`
  MODIFY `loss_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inventory_movements`
--
ALTER TABLE `inventory_movements`
  MODIFY `movement_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `sales`
--
ALTER TABLE `sales`
  MODIFY `sale_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `sale_items`
--
ALTER TABLE `sale_items`
  MODIFY `sale_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

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
