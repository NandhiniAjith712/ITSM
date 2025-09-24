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
-- Table structure for table `sla_configurations`
--

DROP TABLE IF EXISTS `sla_configurations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sla_configurations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `module_id` int NOT NULL,
  `issue_name` varchar(150) NOT NULL,
  `issue_description` text,
  `priority_level` enum('P0','P1','P2','P3') DEFAULT 'P2',
  `response_time_minutes` int NOT NULL COMMENT 'First response time in minutes',
  `resolution_time_minutes` int NOT NULL COMMENT 'Complete resolution time in minutes',
  `business_hours_only` tinyint(1) DEFAULT '1' COMMENT 'Whether SLA applies only during business hours',
  `escalation_time_minutes` int DEFAULT NULL COMMENT 'Time before escalation in minutes',
  `escalation_level` enum('manager','technical_manager','ceo') DEFAULT 'manager',
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_sla_config` (`product_id`,`module_id`,`issue_name`,`priority_level`),
  KEY `module_id` (`module_id`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`),
  KEY `idx_sla_configs_product_module` (`product_id`,`module_id`),
  CONSTRAINT `sla_configurations_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `sla_configurations_ibfk_2` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sla_configurations`
--

LOCK TABLES `sla_configurations` WRITE;
/*!40000 ALTER TABLE `sla_configurations` DISABLE KEYS */;
INSERT INTO `sla_configurations` VALUES (1,32,57,'Technical Support','General technical support and troubleshooting','P2',60,480,1,240,'manager',1,1,NULL,'2025-08-20 14:56:54','2025-08-20 14:56:54'),(2,32,57,'Bug Report','Software bug or defect report','P1',30,240,1,120,'technical_manager',1,1,NULL,'2025-08-20 14:56:54','2025-08-20 14:56:54'),(3,32,57,'Feature Request','New feature or enhancement request','P3',120,1440,1,NULL,'manager',1,1,NULL,'2025-08-20 14:56:54','2025-08-20 14:56:54'),(4,33,59,'Product Inquiry','General product inquiries and questions','P2',480,960,1,NULL,'manager',1,1,NULL,'2025-08-20 14:58:49','2025-08-25 12:04:03'),(5,33,59,'Technical Support',NULL,'P2',480,960,1,NULL,'manager',1,1,NULL,'2025-08-20 15:19:49','2025-08-20 16:15:41'),(7,33,59,'Billing Issue',NULL,'P2',480,960,1,240,'manager',1,1,NULL,'2025-08-20 15:23:33','2025-08-20 16:15:41'),(8,33,62,'as',NULL,'P2',5,960,1,NULL,'manager',1,1,NULL,'2025-08-20 15:55:36','2025-08-20 15:55:57'),(9,39,60,'Product Inquiry','General product inquiries and questions','P2',480,960,1,NULL,'manager',1,1,NULL,'2025-08-22 12:29:36','2025-08-25 12:05:31');
/*!40000 ALTER TABLE `sla_configurations` ENABLE KEYS */;
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
