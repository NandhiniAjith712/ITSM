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
-- Table structure for table `users_backup`
--

DROP TABLE IF EXISTS `users_backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_backup` (
  `id` int NOT NULL DEFAULT '0',
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('user','support_executive','support_manager','ceo','admin','business_team') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'user',
  `department` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `manager_id` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `last_login` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_notifications` tinyint(1) DEFAULT '1' COMMENT 'Whether user wants to receive email notifications'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_backup`
--

LOCK TABLES `users_backup` WRITE;
/*!40000 ALTER TABLE `users_backup` DISABLE KEYS */;
INSERT INTO `users_backup` VALUES (1,'srihari@gmail.com',NULL,'2025-07-11 15:23:03',NULL,'user',NULL,NULL,1,NULL,'2025-07-15 11:35:22',NULL,1),(2,'hari@gmail.com',NULL,'2025-07-11 15:48:22',NULL,'user',NULL,NULL,1,NULL,'2025-07-15 11:35:22',NULL,1),(3,'sri@gmail.com',NULL,'2025-07-11 15:54:31',NULL,'user',NULL,NULL,1,'2025-08-08 15:55:46','2025-08-08 15:55:46',NULL,1),(4,'hariharan@gmail.com',NULL,'2025-07-11 15:55:22',NULL,'user',NULL,NULL,1,NULL,'2025-07-15 11:35:22',NULL,1),(5,'hey@gmail.com',NULL,'2025-07-11 16:08:53',NULL,'user',NULL,NULL,1,NULL,'2025-07-15 11:35:22',NULL,1),(6,'srihari.d099@gmail.com',NULL,'2025-07-11 16:38:11',NULL,'user',NULL,NULL,1,NULL,'2025-07-15 11:35:22',NULL,1),(7,'sd@gmail.com',NULL,'2025-07-15 09:53:38',NULL,'user',NULL,NULL,1,NULL,'2025-07-15 11:35:22',NULL,1),(8,'Srihari.d@gmail.com',NULL,'2025-07-15 10:36:44',NULL,'user',NULL,NULL,1,NULL,'2025-07-15 11:35:22',NULL,1),(9,'Leo@gmail.com','sri','2025-07-15 11:01:54',NULL,'user',NULL,NULL,1,'2025-08-18 16:09:26','2025-08-18 16:09:26',NULL,1),(10,'admin@company.com','System Administrator','2025-07-15 11:35:53','$2a$10$.Jiti0HUCXE5rYez54J8iupbPrpO2cJ1w5VM6WjEVhe7eshjS6INu','admin','IT',NULL,1,NULL,'2025-07-15 11:35:53',NULL,1),(11,'ceo@company.com','CEO Executive','2025-07-15 11:35:53','$2a$10$djWgTOGuFQC834hZv49VuePEMMPdSDT55QE4KSuYuYMW2kGBX4GyC','ceo','Executive',NULL,1,'2025-08-19 11:29:03','2025-08-19 11:29:03',NULL,1),(15,'customer1@example.com','John Customer','2025-07-15 11:35:53','$2a$10$PtXhf43WvDMFEOwwogVqR.xehLyDO3XccAtMNh/i.sZF4SCrG.hBa','user',NULL,NULL,1,'2025-08-19 11:29:03','2025-08-19 11:29:03',NULL,1),(16,'customer2@example.com','Jane Customer','2025-07-15 11:35:53','$2a$10$BxMpyfl/OSbVLYwg9bQtme1YXyTFoRju87GKZE6LBG8eB6SH/X3r2','user',NULL,NULL,1,NULL,'2025-07-15 11:35:53',NULL,1),(17,'fgfg@gmail.com',NULL,'2025-07-15 16:43:15',NULL,'user',NULL,NULL,1,NULL,'2025-07-15 16:43:15',NULL,1),(18,'business@company.com','Business Team','2025-07-28 14:54:08','business123','business_team',NULL,NULL,1,NULL,'2025-07-28 14:54:08',NULL,1),(19,'ner@gmail.com',NULL,'2025-07-28 15:09:13',NULL,'user',NULL,NULL,1,NULL,'2025-07-28 15:09:13',NULL,1),(20,'de@gmail.com','Srihariharan D','2025-07-29 10:16:29',NULL,'user',NULL,NULL,1,NULL,'2025-07-29 10:40:25',NULL,1),(21,'aaa@gmail.com','sss','2025-07-30 14:14:50',NULL,'user',NULL,NULL,1,NULL,'2025-07-30 14:18:02',NULL,1),(22,'hryy@gmail.com','sss','2025-07-31 16:58:40',NULL,'user',NULL,NULL,1,NULL,'2025-07-31 16:59:08',NULL,1),(23,'lee@gmail.com','sri','2025-08-01 11:12:31',NULL,'user',NULL,NULL,1,NULL,'2025-08-01 11:12:58',NULL,1),(24,'john@example.com','john','2025-08-01 15:18:14',NULL,'user',NULL,NULL,1,NULL,'2025-08-01 15:18:14',NULL,1),(25,'mike@example.com','mike','2025-08-01 15:18:14',NULL,'user',NULL,NULL,1,NULL,'2025-08-01 15:18:14',NULL,1),(26,'sarah@example.com','sarah','2025-08-01 15:18:14',NULL,'user',NULL,NULL,1,NULL,'2025-08-01 15:18:14',NULL,1),(27,'david@example.com','david','2025-08-01 15:18:14',NULL,'user',NULL,NULL,1,NULL,'2025-08-01 15:18:14',NULL,1),(28,'lisa@example.com','lisa','2025-08-01 15:18:14',NULL,'user',NULL,NULL,1,NULL,'2025-08-01 15:18:14',NULL,1),(29,'robert@example.com','robert','2025-08-01 15:18:14',NULL,'user',NULL,NULL,1,NULL,'2025-08-01 15:18:14',NULL,1),(30,'emily@example.com','emily','2025-08-01 15:18:14',NULL,'user',NULL,NULL,1,NULL,'2025-08-01 15:18:14',NULL,1),(31,'srihariharan.d@vardaanglobal.com','srihariharan.d','2025-08-01 15:18:14',NULL,'user',NULL,NULL,1,'2025-08-18 16:09:52','2025-08-18 16:09:52',NULL,1),(32,'Weeee@gmail.com','Weeee','2025-08-01 15:18:14',NULL,'user',NULL,NULL,1,NULL,'2025-08-01 15:18:14',NULL,1),(33,'Syamjsj@gmail.com','Syamjsj','2025-08-01 15:18:14',NULL,'user',NULL,NULL,1,NULL,'2025-08-01 15:18:14',NULL,1),(34,'Geheh@gmail.com','Geheh','2025-08-01 15:18:14',NULL,'user',NULL,NULL,1,NULL,'2025-08-01 15:18:14',NULL,1),(35,'Djrjjd@gmail.com','Djrjjd','2025-08-01 15:18:14',NULL,'user',NULL,NULL,1,NULL,'2025-08-01 15:18:14',NULL,1),(36,'Hvucu@gmail.com','Hvucu','2025-08-01 15:18:14',NULL,'user',NULL,NULL,1,NULL,'2025-08-01 15:18:14',NULL,1),(37,'Sriha@gmail.com','Sriha','2025-08-01 15:18:15',NULL,'user',NULL,NULL,1,NULL,'2025-08-01 15:18:15',NULL,1),(38,'Hi@gmail.com','Hi','2025-08-01 15:18:15',NULL,'user',NULL,NULL,1,NULL,'2025-08-01 15:18:15',NULL,1),(39,'Ey@gmail.com','Ey','2025-08-01 15:18:15',NULL,'user',NULL,NULL,1,NULL,'2025-08-01 15:18:15',NULL,1),(40,'Gut@gmail.com','Gut','2025-08-01 15:18:15',NULL,'user',NULL,NULL,1,NULL,'2025-08-01 15:18:15',NULL,1),(41,'Lolr@gmail.com','Lolr','2025-08-01 15:18:15',NULL,'user',NULL,NULL,1,NULL,'2025-08-01 15:18:15',NULL,1),(42,'Hh@gmail.com','Hh','2025-08-01 15:18:15',NULL,'user',NULL,NULL,1,NULL,'2025-08-01 15:18:15',NULL,1),(43,'Loki@gmail.com','Loki','2025-08-01 15:18:15',NULL,'user',NULL,NULL,1,NULL,'2025-08-01 15:18:15',NULL,1),(44,'john.doe@test.com','john.doe','2025-08-01 15:18:15',NULL,'user',NULL,NULL,1,NULL,'2025-08-01 15:18:15',NULL,1),(45,'test@example.com','test','2025-08-01 15:18:15',NULL,'user',NULL,NULL,1,'2025-08-25 16:11:00','2025-08-25 16:11:00','9876543210',1),(46,'WW@gmail.com','goog','2025-08-07 09:42:06',NULL,'user',NULL,NULL,1,NULL,'2025-08-07 09:42:32',NULL,1),(47,'user@example.com','Test User','2025-08-08 12:33:44','$2a$12$CaQy3ed60gz9lZZJ3c6eC.66MMi9tjLRWEhxSjiFK3qSoAu9P696q','user','IT',NULL,1,'2025-08-08 12:33:44','2025-08-08 12:33:44',NULL,1),(48,'newuser@example.com','New Test User','2025-08-08 12:33:44','$2a$12$e4HtQrflwKRiBOI.V68cneAVbeFWKL74ON.O5q4lWWK6HvOfFnXn.','user','Marketing',NULL,1,NULL,'2025-08-08 12:33:44',NULL,1),(49,'khairu@gmail.com','khairu','2025-08-08 12:48:46',NULL,'user',NULL,NULL,1,'2025-08-08 15:56:05','2025-08-08 15:56:05',NULL,1),(50,'s@gmail.com','s','2025-08-08 12:54:11',NULL,'user',NULL,NULL,1,'2025-08-08 12:54:12','2025-08-08 12:54:12',NULL,1),(51,'admin@example.com','admin','2025-08-08 13:02:11',NULL,'user',NULL,NULL,1,'2025-08-08 13:11:42','2025-08-08 13:11:42',NULL,1),(52,'vardaancursor4@gmail.com','vardaancursor4','2025-08-15 10:39:11',NULL,'user',NULL,NULL,1,'2025-08-18 19:30:12','2025-08-18 19:30:12',NULL,1),(53,'asd@gmail.com','asd','2025-08-18 13:12:48',NULL,'user',NULL,NULL,1,'2025-08-18 16:10:26','2025-08-18 16:10:26',NULL,1),(54,'nnn@gmail.com','nnn','2025-08-18 13:42:42',NULL,'user',NULL,NULL,1,'2025-08-18 13:42:42','2025-08-18 13:42:42',NULL,1),(58,'ha@gmail.com','ha','2025-08-19 13:00:52',NULL,'user',NULL,NULL,1,'2025-08-19 13:00:52','2025-08-19 13:00:52','1234567890',1),(59,'aa@gmail.com','aa','2025-08-19 13:12:11',NULL,'user',NULL,NULL,1,'2025-08-19 13:13:04','2025-08-19 13:13:04','1234567890',1),(60,'ss@gmail.com','ss','2025-08-19 13:14:42',NULL,'user',NULL,NULL,1,'2025-08-26 10:05:22','2025-08-26 10:05:22','1234567890',1),(61,'aa45@gmail.com','aa45','2025-08-19 16:35:41',NULL,'user',NULL,NULL,1,'2025-08-25 15:37:40','2025-08-25 15:37:40','1234567890',1),(65,'ceo860','ceo','2025-08-20 11:03:14','$2a$12$V2NkS39cbpkEah9beQDl3eYTIN1oRiqbL1u23dJUXAzFhUipEujTu','ceo',NULL,NULL,1,'2025-08-20 11:04:56','2025-08-20 11:04:56',NULL,1),(66,'srihariharan220@gmail.com','srihariharan220','2025-08-21 11:53:48',NULL,'user',NULL,NULL,1,'2025-08-26 11:48:37','2025-08-26 11:48:37','8825734812',1),(68,'hsghdf@gmail.com','hsghdf','2025-08-25 10:04:27',NULL,'user',NULL,NULL,1,'2025-08-25 10:04:29','2025-08-25 10:04:29','234567890',1),(72,'tem177','temp','2025-08-26 11:51:03','$2a$12$69vyPMVx3yhtBOb31P4uTes40YTknBHcLNfBx7NgQyTRDLF4anxIC','support_executive',NULL,NULL,1,'2025-08-28 09:42:42','2025-08-28 09:42:42',NULL,1),(73,'drr383','drr','2025-08-28 09:38:45','$2a$12$XvQBOwPmk./qWi2QjyceVeS1PejzcbWgOEtGwMeSLbCvfjPQU.YUS','support_executive',NULL,NULL,1,NULL,'2025-08-28 09:38:45',NULL,1),(74,'vvx628','vv','2025-08-28 09:42:00','$2a$12$myEffvKfBHKtg/DFXwhwjetYy7aQeoCbLoGyKxfa5iHCdxEsbbZzu','support_executive',NULL,NULL,1,NULL,'2025-08-28 09:42:00',NULL,1);
/*!40000 ALTER TABLE `users_backup` ENABLE KEYS */;
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
