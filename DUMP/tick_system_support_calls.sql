-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: tick_system
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `support_calls`
--

DROP TABLE IF EXISTS `support_calls`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `support_calls` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Product/system that generated the support call (GRC, INMOD, etc.)',
  `context` json DEFAULT NULL COMMENT 'Additional context information about the support call',
  `current_page` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Page/context where support was requested',
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When the support call was made',
  `source` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'external_integration' COMMENT 'Source of the support call',
  `status` enum('pending','in_progress','resolved','closed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending' COMMENT 'Status of the support call',
  `assigned_to` int DEFAULT NULL COMMENT 'Agent assigned to handle the support call',
  `resolution_notes` text COLLATE utf8mb4_unicode_ci COMMENT 'Notes about how the support call was resolved',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_product` (`product`),
  KEY `idx_timestamp` (`timestamp`),
  KEY `idx_status` (`status`),
  KEY `idx_source` (`source`),
  CONSTRAINT `support_calls_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `support_calls`
--

LOCK TABLES `support_calls` WRITE;
/*!40000 ALTER TABLE `support_calls` DISABLE KEYS */;
INSERT INTO `support_calls` VALUES (1,1,'GRC','{\"name\": \"Admin User\", \"email\": \"admin@example.com\", \"currentPage\": \"Dashboard\"}','Dashboard','2025-08-29 11:01:32','external_integration','resolved',NULL,NULL,'2025-08-29 11:01:32','2025-08-29 11:01:32'),(2,1,'INMOD','{\"name\": \"Admin User\", \"email\": \"admin@example.com\", \"currentPage\": \"Support\"}','Support','2025-08-29 11:01:32','external_integration','pending',NULL,NULL,'2025-08-29 11:01:32','2025-08-29 11:01:32'),(3,5,'GRC','{\"name\": \"Test User\", \"email\": \"test@example.com\", \"product\": \"GRC\", \"currentPage\": \"Dashboard\"}','Dashboard','2025-08-29 11:02:05','external_integration','pending',NULL,NULL,'2025-08-29 11:02:05','2025-08-29 11:02:05'),(4,5,'GRC','{\"name\": \"Test User\", \"email\": \"test@example.com\", \"product\": \"GRC\", \"timestamp\": \"2025-08-29T11:02:22.779Z\", \"currentPage\": \"Dashboard\"}','Dashboard','2025-08-29 11:02:22','external_integration','pending',NULL,NULL,'2025-08-29 11:02:22','2025-08-29 11:02:22'),(5,5,'GRC','{\"name\": \"Test User\", \"email\": \"test@example.com\", \"product\": \"GRC\", \"timestamp\": \"2025-08-29T11:03:16.263Z\", \"currentPage\": \"Dashboard\"}','Dashboard','2025-08-29 11:03:16','external_integration','pending',NULL,NULL,'2025-08-29 11:03:16','2025-08-29 11:03:16');
/*!40000 ALTER TABLE `support_calls` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-11 16:10:17
