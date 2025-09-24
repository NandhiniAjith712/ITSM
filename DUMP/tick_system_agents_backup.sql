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
-- Table structure for table `agents_backup`
--

DROP TABLE IF EXISTS `agents_backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agents_backup` (
  `id` int NOT NULL DEFAULT '0',
  `name` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `role` enum('support_executive','support_manager','ceo','admin') DEFAULT 'support_executive',
  `department` varchar(100) DEFAULT NULL,
  `manager_id` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `last_login` datetime DEFAULT NULL,
  `login_id` varchar(50) DEFAULT NULL COMMENT 'Generated login ID for global login portal',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agents_backup`
--

LOCK TABLES `agents_backup` WRITE;
/*!40000 ALTER TABLE `agents_backup` DISABLE KEYS */;
INSERT INTO `agents_backup` VALUES (13,'sri','$2a$12$xGLBfE0FkwV5m65tiM68UeGVUYg5abRTbNKL2TnHxjAISFLxlN4aK','sri1@gmail.com','support_executive',NULL,NULL,1,'2025-08-20 11:00:35',NULL,NULL,'2025-08-20 11:00:35'),(14,'susheel','$2a$12$XFII0YT5Hz.JX8R711bBReqZYVJ8JE4FNqjIAjpZqKYlgioobB5ba','sus@gmail.com','support_manager',NULL,NULL,1,'2025-08-20 11:02:39',NULL,NULL,'2025-08-20 11:02:39'),(15,'ceo','$2a$12$V2NkS39cbpkEah9beQDl3eYTIN1oRiqbL1u23dJUXAzFhUipEujTu','ceo@gmail.com','ceo',NULL,NULL,1,'2025-08-20 11:03:14',NULL,NULL,'2025-08-20 11:03:14'),(17,'new','$2a$12$tcIiwIfqyrxodG8KUrsyBury5D96d3W6VdMY6QkcylCFCCRAZ1o2O','new@gmail.com','support_executive',NULL,NULL,1,'2025-08-25 10:22:53',NULL,NULL,'2025-08-25 10:22:53'),(18,'err','$2a$12$kKu6nY6tmp4CRRoec.dVbed8HSIsiARFkuUaJa1/i84DINeJ9EIX6','err@gmail.com','support_manager',NULL,NULL,1,'2025-08-25 11:15:00',NULL,NULL,'2025-08-25 11:15:00'),(19,'hh','$2a$12$LDKgorIg80UEFItc.JGAPug5hDGpBzU9go5T3mN0lC2qLGOewAAcm','hh@gmail.com','support_manager',NULL,NULL,1,'2025-08-25 17:10:00',NULL,NULL,'2025-08-25 17:10:00'),(20,'temp','$2a$12$69vyPMVx3yhtBOb31P4uTes40YTknBHcLNfBx7NgQyTRDLF4anxIC','temp@gmail.com','support_executive',NULL,NULL,1,'2025-08-26 11:51:03',NULL,NULL,'2025-08-26 11:51:03'),(21,'drr','$2a$12$XvQBOwPmk./qWi2QjyceVeS1PejzcbWgOEtGwMeSLbCvfjPQU.YUS','drr@gmail.com','support_executive',NULL,NULL,1,'2025-08-28 09:38:45',NULL,NULL,'2025-08-28 09:38:45'),(22,'vv','$2a$12$myEffvKfBHKtg/DFXwhwjetYy7aQeoCbLoGyKxfa5iHCdxEsbbZzu','vv@gmail.com','support_executive',NULL,NULL,1,'2025-08-28 09:42:00',NULL,NULL,'2025-08-28 09:42:00');
/*!40000 ALTER TABLE `agents_backup` ENABLE KEYS */;
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
