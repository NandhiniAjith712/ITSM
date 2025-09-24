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
-- Table structure for table `chat_sessions`
--

DROP TABLE IF EXISTS `chat_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ticket_id` int NOT NULL,
  `session_id` varchar(100) NOT NULL,
  `agent_id` int DEFAULT NULL,
  `customer_id` int DEFAULT NULL,
  `status` enum('active','paused','closed') DEFAULT 'active',
  `started_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `ended_at` datetime DEFAULT NULL,
  `last_activity_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_id` (`session_id`),
  KEY `agent_id` (`agent_id`),
  KEY `customer_id` (`customer_id`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_ticket_id` (`ticket_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `chat_sessions_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_sessions`
--

LOCK TABLES `chat_sessions` WRITE;
/*!40000 ALTER TABLE `chat_sessions` DISABLE KEYS */;
INSERT INTO `chat_sessions` VALUES (39,47,'session_47_1756793679235',NULL,4,'active','2025-09-02 11:44:39',NULL,'2025-09-02 12:08:12'),(40,43,'session_43_1756795667709',NULL,NULL,'active','2025-09-02 12:17:47',NULL,'2025-09-02 13:15:21'),(41,51,'session_51_1756795901097',NULL,NULL,'active','2025-09-02 12:21:41',NULL,'2025-09-11 15:38:49'),(42,52,'session_52_1756800354666',NULL,NULL,'active','2025-09-02 13:35:54',NULL,'2025-09-11 15:38:49'),(43,46,'session_46_1756807268003',NULL,NULL,'active','2025-09-02 15:31:08',NULL,'2025-09-11 12:01:57'),(44,42,'session_42_1756808344906',NULL,NULL,'active','2025-09-02 15:49:04',NULL,'2025-09-02 15:49:05'),(45,54,'session_54_1757586292572',NULL,NULL,'active','2025-09-11 15:54:52',NULL,'2025-09-11 16:04:25'),(46,55,'session_55_1757586829341',NULL,NULL,'active','2025-09-11 16:03:49',NULL,'2025-09-11 16:03:54'),(47,55,'session_55_1757586829356',NULL,NULL,'active','2025-09-11 16:03:49',NULL,'2025-09-11 16:03:49');
/*!40000 ALTER TABLE `chat_sessions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-11 16:10:13
