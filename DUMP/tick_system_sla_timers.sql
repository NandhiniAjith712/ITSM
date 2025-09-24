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
-- Table structure for table `sla_timers`
--

DROP TABLE IF EXISTS `sla_timers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sla_timers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ticket_id` int NOT NULL,
  `sla_configuration_id` int NOT NULL,
  `timer_type` enum('response','resolution','escalation') NOT NULL,
  `start_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `pause_time` datetime DEFAULT NULL,
  `resume_time` datetime DEFAULT NULL,
  `total_elapsed_minutes` int DEFAULT '0',
  `sla_deadline` datetime NOT NULL,
  `status` enum('active','paused','completed','breached') DEFAULT 'active',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sla_configuration_id` (`sla_configuration_id`),
  KEY `idx_sla_timers_ticket_id` (`ticket_id`),
  KEY `idx_sla_timers_status` (`status`),
  KEY `idx_sla_timers_deadline` (`sla_deadline`),
  CONSTRAINT `sla_timers_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `sla_timers_ibfk_2` FOREIGN KEY (`sla_configuration_id`) REFERENCES `sla_configurations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sla_timers`
--

LOCK TABLES `sla_timers` WRITE;
/*!40000 ALTER TABLE `sla_timers` DISABLE KEYS */;
INSERT INTO `sla_timers` VALUES (29,47,4,'response','2025-09-02 11:44:34',NULL,NULL,0,'2025-09-02 19:44:34','breached','2025-09-02 11:44:34','2025-09-03 10:02:02'),(30,47,4,'resolution','2025-09-02 11:44:34',NULL,NULL,0,'2025-09-03 03:44:34','active','2025-09-02 11:44:34','2025-09-02 11:44:34'),(31,52,4,'response','2025-09-02 12:23:18',NULL,NULL,0,'2025-09-02 20:23:18','breached','2025-09-02 12:23:18','2025-09-03 10:02:02'),(32,52,4,'resolution','2025-09-02 12:23:18',NULL,NULL,0,'2025-09-03 04:23:18','active','2025-09-02 12:23:18','2025-09-02 12:23:18'),(35,54,4,'response','2025-09-11 15:54:31',NULL,NULL,0,'2025-09-11 23:54:31','active','2025-09-11 15:54:31','2025-09-11 15:54:31'),(36,54,4,'resolution','2025-09-11 15:54:31',NULL,NULL,0,'2025-09-12 07:54:31','active','2025-09-11 15:54:31','2025-09-11 15:54:31'),(37,55,4,'response','2025-09-11 16:03:16',NULL,NULL,0,'2025-09-12 00:03:17','active','2025-09-11 16:03:16','2025-09-11 16:03:16'),(38,55,4,'resolution','2025-09-11 16:03:16',NULL,NULL,0,'2025-09-12 08:03:17','active','2025-09-11 16:03:16','2025-09-11 16:03:16');
/*!40000 ALTER TABLE `sla_timers` ENABLE KEYS */;
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
