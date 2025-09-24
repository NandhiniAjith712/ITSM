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
-- Table structure for table `external_help_requests`
--

DROP TABLE IF EXISTS `external_help_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `external_help_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `external_application_id` int NOT NULL,
  `external_user_id` int DEFAULT NULL,
  `request_data` json NOT NULL COMMENT 'Original request payload',
  `user_email` varchar(100) DEFAULT NULL,
  `user_phone` varchar(20) DEFAULT NULL,
  `user_name` varchar(100) DEFAULT NULL,
  `products` json DEFAULT NULL COMMENT 'Products mentioned in the request',
  `status` enum('pending','authenticated','ticket_created','failed') DEFAULT 'pending',
  `ticket_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `external_application_id` (`external_application_id`),
  KEY `external_user_id` (`external_user_id`),
  KEY `ticket_id` (`ticket_id`),
  CONSTRAINT `external_help_requests_ibfk_1` FOREIGN KEY (`external_application_id`) REFERENCES `external_applications` (`id`),
  CONSTRAINT `external_help_requests_ibfk_2` FOREIGN KEY (`external_user_id`) REFERENCES `external_users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `external_help_requests_ibfk_3` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `external_help_requests`
--

LOCK TABLES `external_help_requests` WRITE;
/*!40000 ALTER TABLE `external_help_requests` DISABLE KEYS */;
INSERT INTO `external_help_requests` VALUES (1,1,1,'{\"name\": \"John Doe\", \"email\": \"john.doe@example.com\", \"phone\": \"+1234567890\", \"products\": [1, 2, 3]}','john.doe@example.com','+1234567890','John Doe','[1, 2, 3]','pending',NULL,'2025-07-31 12:00:35','2025-07-31 12:00:35'),(2,1,2,'{\"name\": \"Charlie Brown\", \"email\": \"charlie@example.com\", \"phone\": \"+1555123456\", \"products\": [1, 2, 3, 4]}','charlie@example.com','+1555123456','Charlie Brown','[1, 2, 3, 4]','pending',NULL,'2025-07-31 12:00:36','2025-07-31 12:00:36'),(3,1,1,'{\"name\": \"John Doe\", \"email\": \"john.doe@example.com\", \"phone\": \"+1234567890\", \"products\": [1, 2, 3]}','john.doe@example.com','+1234567890','John Doe','[1, 2, 3]','pending',NULL,'2025-07-31 12:04:19','2025-07-31 12:04:19'),(4,1,2,'{\"name\": \"Charlie Brown\", \"email\": \"charlie@example.com\", \"phone\": \"+1555123456\", \"products\": [1, 2, 3, 4]}','charlie@example.com','+1555123456','Charlie Brown','[1, 2, 3, 4]','pending',NULL,'2025-07-31 12:04:19','2025-07-31 12:04:19'),(5,1,1,'{\"name\": \"John Doe\", \"email\": \"john.doe@example.com\", \"phone\": \"+1234567890\", \"products\": [1, 2, 3]}','john.doe@example.com','+1234567890','John Doe','[1, 2, 3]','pending',NULL,'2025-07-31 12:11:01','2025-07-31 12:11:01'),(6,1,2,'{\"name\": \"Charlie Brown\", \"email\": \"charlie@example.com\", \"phone\": \"+1555123456\", \"products\": [1, 2, 3, 4]}','charlie@example.com','+1555123456','Charlie Brown','[1, 2, 3, 4]','pending',NULL,'2025-07-31 12:11:01','2025-07-31 12:11:01'),(7,1,1,'{\"name\": \"John Doe\", \"email\": \"john.doe@example.com\", \"phone\": \"+1234567890\", \"products\": [1, 2, 3]}','john.doe@example.com','+1234567890','John Doe','[1, 2, 3]','pending',NULL,'2025-07-31 12:13:09','2025-07-31 12:13:09'),(8,1,3,'{\"name\": \"Alice Smith\", \"email\": \"alice@example.com\", \"products\": [1, 2]}','alice@example.com',NULL,'Alice Smith','[1, 2]','pending',NULL,'2025-07-31 12:13:09','2025-07-31 12:13:09'),(9,1,2,'{\"name\": \"Charlie Brown\", \"email\": \"charlie@example.com\", \"phone\": \"+1555123456\", \"products\": [1, 2, 3, 4]}','charlie@example.com','+1555123456','Charlie Brown','[1, 2, 3, 4]','pending',NULL,'2025-07-31 12:13:09','2025-07-31 12:13:09'),(10,1,1,'{\"name\": \"John Doe\", \"email\": \"john.doe@example.com\", \"phone\": \"+1234567890\", \"products\": [1, 2, 3]}','john.doe@example.com','+1234567890','John Doe','[1, 2, 3]','pending',NULL,'2025-07-31 12:14:38','2025-07-31 12:14:38'),(11,1,3,'{\"name\": \"Alice Smith\", \"email\": \"alice@example.com\", \"products\": [1, 2]}','alice@example.com',NULL,'Alice Smith','[1, 2]','pending',NULL,'2025-07-31 12:14:38','2025-07-31 12:14:38'),(12,1,2,'{\"name\": \"Charlie Brown\", \"email\": \"charlie@example.com\", \"phone\": \"+1555123456\", \"products\": [1, 2, 3, 4]}','charlie@example.com','+1555123456','Charlie Brown','[1, 2, 3, 4]','pending',NULL,'2025-07-31 12:14:38','2025-07-31 12:14:38'),(13,1,1,'{\"name\": \"John Doe\", \"email\": \"john.doe@example.com\", \"phone\": \"+1234567890\", \"products\": [1, 2, 3]}','john.doe@example.com','+1234567890','John Doe','[1, 2, 3]','pending',NULL,'2025-07-31 12:14:44','2025-07-31 12:14:44'),(14,1,3,'{\"name\": \"Alice Smith\", \"email\": \"alice@example.com\", \"products\": [1, 2]}','alice@example.com',NULL,'Alice Smith','[1, 2]','pending',NULL,'2025-07-31 12:14:44','2025-07-31 12:14:44'),(15,1,2,'{\"name\": \"Charlie Brown\", \"email\": \"charlie@example.com\", \"phone\": \"+1555123456\", \"products\": [1, 2, 3, 4]}','charlie@example.com','+1555123456','Charlie Brown','[1, 2, 3, 4]','pending',NULL,'2025-07-31 12:14:44','2025-07-31 12:14:44');
/*!40000 ALTER TABLE `external_help_requests` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-11 16:10:15
