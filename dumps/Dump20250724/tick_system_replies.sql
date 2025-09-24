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
-- Table structure for table `replies`
--

DROP TABLE IF EXISTS `replies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `replies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ticket_id` int NOT NULL,
  `agent_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `sent_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ticket_id` (`ticket_id`),
  CONSTRAINT `replies_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `replies`
--

LOCK TABLES `replies` WRITE;
/*!40000 ALTER TABLE `replies` DISABLE KEYS */;
INSERT INTO `replies` VALUES (3,13,'Agent Smith','oqkko askdasdma','2025-07-10 13:47:53'),(4,14,'Agent Smith','dfgdgd dfg','2025-07-10 13:49:14'),(5,18,'Agent Smith','dfghohgdsfghjkl','2025-07-10 15:31:24'),(6,24,'Agent Smith','dfsdfsf','2025-07-11 15:39:01'),(7,25,'Agent Smith','im soory to hearuuu','2025-07-11 15:50:44'),(8,27,'Agent Smith','asdfghj 123456789','2025-07-11 16:10:00'),(9,26,'Agent Smith','jkjahsdkjakjsda','2025-07-15 10:40:43'),(10,26,'Agent Smith','jkjahsdkjakjsda','2025-07-15 10:40:48'),(11,29,'Agent Smith','xcvbnml;\' dfghjkl','2025-07-15 10:41:01'),(12,29,'Agent Smith','sadasdasd','2025-07-15 10:42:52'),(13,29,'Agent Smith','sdasdada','2025-07-15 10:57:01'),(14,30,'Agent Smith','we sorry for this lets solve','2025-07-15 11:01:11'),(15,30,'Agent Smith','ggg','2025-07-15 12:03:36'),(16,29,'Agent Smith','asdada','2025-07-15 12:07:33'),(17,31,'Agent Smith','qwertyuiop[','2025-07-15 12:08:41'),(18,31,'Agent Smith','jnjnjnj','2025-07-15 12:09:45'),(19,31,'Agent Smith','sd','2025-07-15 12:16:49'),(20,32,'Agent Smith','qwertyuiop','2025-07-15 12:39:11'),(21,34,'Agent Smith','zxcvjkl','2025-07-15 12:44:51'),(22,35,'Agent Smith','njnjnj','2025-07-15 13:39:29'),(23,35,'Agent Smith','n n','2025-07-15 15:11:11'),(24,35,'Agent Smith','n n','2025-07-15 15:11:13'),(25,39,'Agent Smith','Hi','2025-07-15 16:45:56'),(26,40,'Agent Smith','qwertyiop[','2025-07-16 09:58:20'),(27,41,'Agent Smith','ertyuio ;lhfd zxcvbnm,','2025-07-21 15:47:35');
/*!40000 ALTER TABLE `replies` ENABLE KEYS */;
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
