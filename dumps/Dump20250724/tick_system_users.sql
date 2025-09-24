-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: tick_system
-- ------------------------------------------------------
-- Server version	8.0.42

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
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('user','support_executive','support_manager','ceo','admin') COLLATE utf8mb4_unicode_ci DEFAULT 'user',
  `department` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `manager_id` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `last_login` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_manager_id` (`manager_id`),
  CONSTRAINT `fk_manager_id` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'srihari@gmail.com',NULL,'2025-07-11 15:23:03',NULL,'user',NULL,NULL,1,NULL,'2025-07-15 11:35:22'),(2,'hari@gmail.com',NULL,'2025-07-11 15:48:22',NULL,'user',NULL,NULL,1,NULL,'2025-07-15 11:35:22'),(3,'sri@gmail.com',NULL,'2025-07-11 15:54:31',NULL,'user',NULL,NULL,1,NULL,'2025-07-15 11:35:22'),(4,'hariharan@gmail.com',NULL,'2025-07-11 15:55:22',NULL,'user',NULL,NULL,1,NULL,'2025-07-15 11:35:22'),(5,'hey@gmail.com',NULL,'2025-07-11 16:08:53',NULL,'user',NULL,NULL,1,NULL,'2025-07-15 11:35:22'),(6,'srihari.d099@gmail.com',NULL,'2025-07-11 16:38:11',NULL,'user',NULL,NULL,1,NULL,'2025-07-15 11:35:22'),(7,'sd@gmail.com',NULL,'2025-07-15 09:53:38',NULL,'user',NULL,NULL,1,NULL,'2025-07-15 11:35:22'),(8,'Srihari.d@gmail.com',NULL,'2025-07-15 10:36:44',NULL,'user',NULL,NULL,1,NULL,'2025-07-15 11:35:22'),(9,'Leo@gmail.com',NULL,'2025-07-15 11:01:54',NULL,'user',NULL,NULL,1,NULL,'2025-07-15 11:35:22'),(10,'admin@company.com','System Administrator','2025-07-15 11:35:53','$2a$10$.Jiti0HUCXE5rYez54J8iupbPrpO2cJ1w5VM6WjEVhe7eshjS6INu','admin','IT',NULL,1,NULL,'2025-07-15 11:35:53'),(11,'ceo@company.com','CEO Executive','2025-07-15 11:35:53','$2a$10$djWgTOGuFQC834hZv49VuePEMMPdSDT55QE4KSuYuYMW2kGBX4GyC','ceo','Executive',NULL,1,NULL,'2025-07-15 11:35:53'),(12,'manager@company.com','Support Manager','2025-07-15 11:35:53','$2a$10$WIqe/3zGpaFPHB5mVyww..49XNbgqvSmLQl3KiCBGrpHVERYBzvKa','support_manager','Support',11,1,NULL,'2025-07-15 11:36:47'),(13,'executive1@company.com','Support Executive 1','2025-07-15 11:35:53','$2a$10$36dk89/ynP8JuU0xVBriMex.HQTyXGZ8F.pJBmqVNzcMFx0A/jTla','support_executive','Support',12,1,NULL,'2025-07-15 11:36:47'),(14,'executive2@company.com','Support Executive 2','2025-07-15 11:35:53','$2a$10$UowgxG1wwlariltiuu8YDOeRrLjg7WpikXkJjAwV9GxMct3c5b9QO','support_executive','Support',12,1,NULL,'2025-07-15 11:36:47'),(15,'customer1@example.com','John Customer','2025-07-15 11:35:53','$2a$10$PtXhf43WvDMFEOwwogVqR.xehLyDO3XccAtMNh/i.sZF4SCrG.hBa','user',NULL,NULL,1,NULL,'2025-07-15 11:35:53'),(16,'customer2@example.com','Jane Customer','2025-07-15 11:35:53','$2a$10$BxMpyfl/OSbVLYwg9bQtme1YXyTFoRju87GKZE6LBG8eB6SH/X3r2','user',NULL,NULL,1,NULL,'2025-07-15 11:35:53'),(17,'fgfg@gmail.com',NULL,'2025-07-15 16:43:15',NULL,'user',NULL,NULL,1,NULL,'2025-07-15 16:43:15');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-24 16:45:34
