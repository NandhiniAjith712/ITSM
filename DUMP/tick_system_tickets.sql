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
-- Table structure for table `tickets`
--

DROP TABLE IF EXISTS `tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tickets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `mobile` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `issue_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `issue_title` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `attachment_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `attachment_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `attachment` longblob,
  `status` enum('new','in_progress','closed','escalated') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'new',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_id` int DEFAULT NULL,
  `issue_type_other` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `whatsapp_enabled` tinyint(1) DEFAULT '0',
  `country_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `product` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `module` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `module_id` int DEFAULT NULL,
  `assigned_to` int DEFAULT NULL,
  `assigned_by` int DEFAULT NULL,
  `reopened_at` datetime DEFAULT NULL,
  `reopened_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `utm_description` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'UTM description from auto-login URL (e.g., GRC, ProjectX)',
  `reference_ticket_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Reference ticket ID from auto-login URL',
  `priority` enum('low','medium','high','urgent') COLLATE utf8mb4_unicode_ci DEFAULT 'medium',
  PRIMARY KEY (`id`),
  KEY `fk_user_id` (`user_id`),
  KEY `fk_product_id` (`product_id`),
  KEY `fk_assigned_to` (`assigned_to`),
  KEY `fk_assigned_by` (`assigned_by`),
  CONSTRAINT `fk_assigned_by` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_assigned_by_agents` FOREIGN KEY (`assigned_by`) REFERENCES `agents` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_assigned_to_agents` FOREIGN KEY (`assigned_to`) REFERENCES `agents` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_product_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickets`
--

LOCK TABLES `tickets` WRITE;
/*!40000 ALTER TABLE `tickets` DISABLE KEYS */;
INSERT INTO `tickets` VALUES (39,'John Doe','john@example.com','1234567890','I cannot log into my account. The login button is not working and I get an error message saying \"Invalid credentials\". I have been trying for the past 2 days.','Technical Support','Login Problem',NULL,NULL,NULL,'escalated','2025-09-02 11:11:21','2025-09-11 10:58:27',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,67,NULL,NULL,NULL,NULL,NULL,'medium'),(40,'Jane Smith','jane@example.com','9876543210','Payment processing error on my last transaction. The payment was deducted from my account but the service was not activated. I need this resolved urgently.','Billing Issue','Payment Processing Error',NULL,NULL,NULL,'escalated','2025-09-02 11:11:21','2025-09-11 10:58:27',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,67,NULL,NULL,NULL,NULL,NULL,'medium'),(41,'Mike Johnson','mike@example.com','5551234567','Unable to access premium features after subscription renewal. The features are still showing as locked even though my payment went through successfully.','Account Access','Premium Features Not Working',NULL,NULL,NULL,'escalated','2025-09-02 11:11:21','2025-09-11 10:58:27',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,67,NULL,NULL,NULL,NULL,NULL,'medium'),(42,'Sarah Wilson','sarah@example.com','4449876543','Need help with password reset process. The reset link is not working properly and I cannot access my account. This is urgent as I need to access important documents.','Technical Support','Password Reset Issue',NULL,NULL,NULL,'closed','2025-09-02 11:11:21','2025-09-11 10:58:27',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,67,NULL,NULL,NULL,NULL,NULL,'medium'),(43,'David Brown','david@example.com','3334567890','The mobile app is crashing every time I try to upload a photo. This happens on both Android and iOS devices. Please help me resolve this issue.','Bug Report','App Crashes on Photo Upload',NULL,NULL,NULL,'closed','2025-09-02 11:11:21','2025-09-11 10:58:27',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,67,NULL,NULL,NULL,NULL,NULL,'medium'),(44,'Lisa Garcia','lisa@example.com','2227894561','I would like to request a dark mode feature for the web interface. This would be very helpful for users who work in low-light environments.','Feature Request','Dark Mode Feature Request',NULL,NULL,NULL,'escalated','2025-09-02 11:11:21','2025-09-11 10:58:27',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,67,NULL,NULL,NULL,NULL,NULL,'medium'),(45,'Robert Chen','robert@example.com','1112345678','The search functionality is not working properly. When I search for specific terms, it returns irrelevant results or no results at all.','Technical Support','Search Function Not Working',NULL,NULL,NULL,'escalated','2025-09-02 11:11:21','2025-09-11 10:58:27',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,67,NULL,NULL,NULL,NULL,NULL,'medium'),(46,'Emily Davis','emily@example.com','9998765432','I need to cancel my subscription but cannot find the cancellation option in my account settings. Please help me with the cancellation process.','Account Access','Cannot Cancel Subscription',NULL,NULL,NULL,'closed','2025-09-02 11:11:21','2025-09-11 10:58:27',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,67,NULL,NULL,NULL,NULL,NULL,'medium'),(47,'radha.sharma','radha.sharma@company.com','+11234567890','QWERTYUIOPSDFGHJKL;SDFGHJKL;','Technical Support','SDFSDFSDFSF',NULL,NULL,NULL,'escalated','2025-09-02 11:44:34','2025-09-11 10:58:27',4,NULL,0,NULL,33,'GRC','COMPILANCE',59,67,NULL,NULL,NULL,NULL,NULL,'medium'),(49,'John Doe','john@example.com','1234567890','Critical security issue - users can bypass authentication','Security Breach','CRITICAL: Authentication Bypass Vulnerability',NULL,NULL,NULL,'escalated','2025-09-02 12:18:50','2025-09-11 10:58:27',1,NULL,0,NULL,32,'VOC','Authentication',1,67,NULL,NULL,NULL,NULL,NULL,'medium'),(50,'Jane Smith','jane@example.com','0987654321','Payment processing completely down - customers cannot make purchases','System Outage','URGENT: Payment System Down - Revenue Impact',NULL,NULL,NULL,'escalated','2025-09-02 12:18:50','2025-09-11 10:58:27',2,NULL,0,NULL,32,'VOC','Payment System',2,67,NULL,NULL,NULL,NULL,NULL,'medium'),(51,'Bob Wilson','bob@example.com','5555555555','Database corruption detected - data integrity at risk','Data Loss','EMERGENCY: Database Corruption Detected',NULL,NULL,NULL,'escalated','2025-09-02 12:18:50','2025-09-11 10:58:27',3,NULL,0,NULL,32,'VOC','Database',3,67,NULL,NULL,NULL,NULL,NULL,'medium'),(52,'radha.sharma','radha.sharma@company.com','+11234567890','ZXCVBNM,.DFGHJKLRHJKL','Technical Support','ASDFGHJKL',NULL,NULL,NULL,'escalated','2025-09-02 12:23:18','2025-09-11 10:58:27',4,NULL,0,NULL,33,'GRC','COMPILANCE',59,67,NULL,NULL,NULL,NULL,NULL,'medium'),(54,'radha.sharma','radha.sharma@company.com','','sxdfs gvsgydbauhsndahndhausdn','Product Inquiry','cv bn hhbuhb',NULL,NULL,NULL,'closed','2025-09-11 15:54:31','2025-09-11 15:59:21',4,NULL,0,NULL,33,'GRC','COMPILANCE',59,NULL,NULL,NULL,NULL,NULL,NULL,'medium'),(55,'radha.sharma','radha.sharma@company.com','','wertyu sdfghjv','Billing Issue','ertyuiocvbnm',NULL,NULL,NULL,'in_progress','2025-09-11 16:03:16','2025-09-11 16:03:43',4,NULL,0,NULL,33,'GRC','COMPILANCE',59,NULL,NULL,NULL,NULL,NULL,NULL,'medium');
/*!40000 ALTER TABLE `tickets` ENABLE KEYS */;
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
