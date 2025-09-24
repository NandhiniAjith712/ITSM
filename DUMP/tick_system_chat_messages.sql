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
-- Table structure for table `chat_messages`
--

DROP TABLE IF EXISTS `chat_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ticket_id` int NOT NULL,
  `sender_type` enum('agent','customer','system') NOT NULL,
  `sender_id` int DEFAULT NULL,
  `sender_name` varchar(100) NOT NULL,
  `message` text NOT NULL,
  `message_type` enum('text','system','status_update','typing_indicator') DEFAULT 'text',
  `is_read` tinyint(1) DEFAULT '0',
  `read_at` datetime DEFAULT NULL,
  `is_edited` tinyint(1) DEFAULT '0',
  `edited_at` datetime DEFAULT NULL,
  `parent_message_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sender_id` (`sender_id`),
  KEY `parent_message_id` (`parent_message_id`),
  KEY `idx_ticket_id` (`ticket_id`),
  KEY `idx_sender_type` (`sender_type`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `chat_messages_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chat_messages_ibfk_3` FOREIGN KEY (`parent_message_id`) REFERENCES `chat_messages` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=113 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_messages`
--

LOCK TABLES `chat_messages` WRITE;
/*!40000 ALTER TABLE `chat_messages` DISABLE KEYS */;
INSERT INTO `chat_messages` VALUES (105,43,'agent',NULL,'Agent Smith','hi','text',0,NULL,0,NULL,NULL,'2025-09-02 13:15:17','2025-09-02 13:15:17'),(106,52,'agent',22,'Test Agent','This is a test message to verify email notifications are working correctly.','text',0,NULL,0,NULL,NULL,'2025-09-02 13:35:20','2025-09-02 13:35:20'),(107,52,'customer',NULL,'radha.sharma','heye','text',0,NULL,0,NULL,NULL,'2025-09-02 13:41:26','2025-09-02 13:41:26'),(108,52,'agent',NULL,'Agent Smith','jdbfhsbfs','text',0,NULL,0,NULL,NULL,'2025-09-02 13:41:39','2025-09-02 13:41:39'),(109,46,'agent',NULL,'Agent Smith','SADADSA','text',0,NULL,0,NULL,NULL,'2025-09-11 12:01:52','2025-09-11 12:01:52'),(110,54,'agent',NULL,'Agent Smith','dgbfywgbfywbfybwe','text',0,NULL,0,NULL,NULL,'2025-09-11 15:54:55','2025-09-11 15:54:55'),(111,54,'customer',NULL,'radha.sharma','jnfindfijngjdfngjidnjngidjfng','text',0,NULL,0,NULL,NULL,'2025-09-11 15:55:04','2025-09-11 15:55:04'),(112,55,'agent',NULL,'Agent Smith','hujuuuh','text',0,NULL,0,NULL,NULL,'2025-09-11 16:03:53','2025-09-11 16:03:53');
/*!40000 ALTER TABLE `chat_messages` ENABLE KEYS */;
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
