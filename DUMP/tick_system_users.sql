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
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `role` enum('user','agent','manager','support_manager','ceo','business_team') DEFAULT 'user',
  `department` varchar(100) DEFAULT NULL,
  `manager_id` int DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email_notifications` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT '1',
  `last_login` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `manager_id` (`manager_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'tes897','test_agent_2','$2a$12$mk5ZKei9D6MqvO/jIekR/.HXFei0vLgK2H1NSPdfl.pYDCjH9wveG','user',NULL,NULL,NULL,1,'2025-08-28 11:48:21','2025-08-28 11:48:21',1,NULL),(2,'sri405','sri','$2a$12$stnnHDx7aoJ/4mwDW.DgKu5Msw.LrTcOREoG0FuAf.LsS5iv88YiO','user',NULL,NULL,NULL,1,'2025-08-28 11:49:12','2025-08-28 11:49:12',1,NULL),(3,'srihariharan220@gmail.com','srihariharan220',NULL,'user',NULL,NULL,'8825734812',1,'2025-08-28 18:58:00','2025-08-29 17:15:18',1,'2025-08-29 17:15:18'),(4,'radha.sharma@company.com','radha.sharma',NULL,'user',NULL,NULL,'radha.sharma',1,'2025-08-29 16:24:13','2025-09-11 16:02:17',1,'2025-09-11 16:02:17'),(5,'test@example.com','Test User',NULL,'user',NULL,NULL,'Test User',1,'2025-08-29 16:28:49','2025-08-29 18:47:07',1,'2025-08-29 18:47:07'),(6,'test2@example.com','test2',NULL,'user',NULL,NULL,'Test User 2',1,'2025-08-29 17:23:10','2025-08-29 17:23:10',1,'2025-08-29 17:23:10'),(7,'newuser@company.com','New User',NULL,'user',NULL,NULL,NULL,1,'2025-08-29 18:36:34','2025-08-29 18:36:34',1,'2025-08-29 18:36:34'),(8,'firstuser@company.com','Updated First User',NULL,'user',NULL,NULL,NULL,1,'2025-08-29 18:37:44','2025-08-29 18:37:50',1,'2025-08-29 18:37:50'),(9,'seconduser@company.com','Second User',NULL,'user',NULL,NULL,NULL,1,'2025-08-29 18:37:48','2025-08-29 18:37:48',1,'2025-08-29 18:37:48'),(10,'testcustomer@example.com','Test Customer',NULL,'user',NULL,NULL,NULL,1,'2025-09-01 13:18:39','2025-09-01 13:18:39',1,'2025-09-01 13:18:39'),(12,'customer1@example.com','Test Customer','$2a$10$lT5GXeaV5WrMW/5bD4gRgOEaQuNPcqUhe2weZpfSvXswt7CWcn3Nm','user',NULL,NULL,'+1234567890',1,'2025-09-01 16:15:03','2025-09-01 16:15:03',1,NULL),(13,'tes188','Test Support Executive','$2a$12$r5RxXAcpWsE.2vqv5gkUdu97g.HUoFN4IKSUbIDo87kjQ8cu1QUty','user',NULL,NULL,NULL,1,'2025-09-01 17:00:26','2025-09-01 17:00:26',1,NULL),(14,'tes630','Test CEO','$2a$12$xK1S1SjWjrb/OQVQcL1E..aH8dJw8P4XwVR6TIuPNXLBuEVQl/SPi','ceo',NULL,NULL,NULL,1,'2025-09-01 17:00:28','2025-09-01 17:00:28',1,NULL),(15,'tes817','Test Support Executive 1756726329680','$2a$12$BuwJyqFbOx7JbVRyb7shPuO5ZnoqcrxDDOWS0yRyF81Zid1JEDYk.','user',NULL,NULL,NULL,1,'2025-09-01 17:02:10','2025-09-01 17:02:10',1,NULL),(16,'tes500','Test CEO 1756726329680','$2a$12$U84/3zmsCnzOpIjjS0cPTuPssBnJ27MONqPz8H.IEuiq0sfsLCNv2','ceo',NULL,NULL,NULL,1,'2025-09-01 17:02:10','2025-09-01 17:02:10',1,NULL),(17,'tes452','Test Support Executive 1756726533027','$2a$12$m/IMB2iJGGVNqKWVe6oH/e4NeaIjDGMfBUkPC.RMTO2.iDZJAxQmi','user',NULL,NULL,NULL,1,'2025-09-01 17:05:33','2025-09-01 17:05:33',1,NULL),(18,'tes872','Test CEO 1756726533027','$2a$12$wIkS4lXhGfv0DVjv30cfxuoMf1EK.u8EBO0zyJRoAjtnmPMWyaHj.','ceo',NULL,NULL,NULL,1,'2025-09-01 17:05:33','2025-09-01 17:05:33',1,NULL),(20,'tes220','Test Manager 1756727186350','$2a$12$N62uIPunmmrbXnBweXt2DONjaRiSWZBCmEiH14tmi6W00N/jlv2sS','manager',NULL,NULL,NULL,1,'2025-09-01 17:16:26','2025-09-01 17:16:26',1,NULL),(26,'vikram.patel@company.com','vikram.patel',NULL,'user',NULL,NULL,NULL,1,'2025-09-11 16:06:14','2025-09-11 16:06:14',1,'2025-09-11 16:06:14');
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

-- Dump completed on 2025-09-11 16:10:15
