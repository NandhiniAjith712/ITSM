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
-- Temporary view structure for view `support_calls_view`
--

DROP TABLE IF EXISTS `support_calls_view`;
/*!50001 DROP VIEW IF EXISTS `support_calls_view`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `support_calls_view` AS SELECT 
 1 AS `id`,
 1 AS `product`,
 1 AS `current_page`,
 1 AS `timestamp`,
 1 AS `source`,
 1 AS `status`,
 1 AS `user_name`,
 1 AS `user_email`,
 1 AS `user_phone`,
 1 AS `context`,
 1 AS `resolution_notes`,
 1 AS `created_at`,
 1 AS `updated_at`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `assignment_history`
--

DROP TABLE IF EXISTS `assignment_history`;
/*!50001 DROP VIEW IF EXISTS `assignment_history`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `assignment_history` AS SELECT 
 1 AS `assignment_id`,
 1 AS `ticket_id`,
 1 AS `agent_id`,
 1 AS `agent_name`,
 1 AS `assigned_by`,
 1 AS `assigned_by_name`,
 1 AS `assigned_at`,
 1 AS `unassigned_at`,
 1 AS `status`,
 1 AS `assignment_type`,
 1 AS `assignment_notes`,
 1 AS `duration_minutes`,
 1 AS `issue_title`,
 1 AS `ticket_status`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `current_assignments`
--

DROP TABLE IF EXISTS `current_assignments`;
/*!50001 DROP VIEW IF EXISTS `current_assignments`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `current_assignments` AS SELECT 
 1 AS `assignment_id`,
 1 AS `ticket_id`,
 1 AS `agent_id`,
 1 AS `agent_name`,
 1 AS `agent_email`,
 1 AS `agent_role`,
 1 AS `assigned_by`,
 1 AS `assigned_by_name`,
 1 AS `assigned_at`,
 1 AS `assignment_type`,
 1 AS `priority_level`,
 1 AS `assignment_notes`,
 1 AS `is_primary`,
 1 AS `ticket_status`,
 1 AS `issue_title`,
 1 AS `ticket_created`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `agent_workload`
--

DROP TABLE IF EXISTS `agent_workload`;
/*!50001 DROP VIEW IF EXISTS `agent_workload`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `agent_workload` AS SELECT 
 1 AS `agent_id`,
 1 AS `agent_name`,
 1 AS `agent_email`,
 1 AS `agent_role`,
 1 AS `total_active_assignments`,
 1 AS `primary_assignments`,
 1 AS `urgent_tickets`,
 1 AS `high_priority_tickets`,
 1 AS `avg_workload_score`,
 1 AS `oldest_assignment`,
 1 AS `newest_assignment`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `support_calls_view`
--

/*!50001 DROP VIEW IF EXISTS `support_calls_view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `support_calls_view` AS select `sc`.`id` AS `id`,`sc`.`product` AS `product`,`sc`.`current_page` AS `current_page`,`sc`.`timestamp` AS `timestamp`,`sc`.`source` AS `source`,`sc`.`status` AS `status`,`u`.`name` AS `user_name`,`u`.`email` AS `user_email`,`u`.`phone` AS `user_phone`,`sc`.`context` AS `context`,`sc`.`resolution_notes` AS `resolution_notes`,`sc`.`created_at` AS `created_at`,`sc`.`updated_at` AS `updated_at` from (`support_calls` `sc` left join `users` `u` on((`sc`.`user_id` = `u`.`id`))) order by `sc`.`timestamp` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `assignment_history`
--

/*!50001 DROP VIEW IF EXISTS `assignment_history`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `assignment_history` AS select `ta`.`id` AS `assignment_id`,`ta`.`ticket_id` AS `ticket_id`,`ta`.`agent_id` AS `agent_id`,`u`.`name` AS `agent_name`,`ta`.`assigned_by` AS `assigned_by`,`assigned_by_user`.`name` AS `assigned_by_name`,`ta`.`assigned_at` AS `assigned_at`,`ta`.`unassigned_at` AS `unassigned_at`,(case when (`ta`.`is_active` = true) then 'active' when (`ta`.`unassigned_at` is not null) then 'completed' else 'inactive' end) AS `status`,'manual' AS `assignment_type`,`ta`.`assignment_reason` AS `assignment_notes`,(case when (`ta`.`unassigned_at` is not null) then timestampdiff(MINUTE,`ta`.`assigned_at`,`ta`.`unassigned_at`) else NULL end) AS `duration_minutes`,coalesce(`t`.`issue_title`,`t`.`description`) AS `issue_title`,coalesce(`t`.`status`,'new') AS `ticket_status` from (((`ticket_assignments` `ta` join `tickets` `t` on((`ta`.`ticket_id` = `t`.`id`))) join `users` `u` on((`ta`.`agent_id` = `u`.`id`))) left join `users` `assigned_by_user` on((`ta`.`assigned_by` = `assigned_by_user`.`id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `current_assignments`
--

/*!50001 DROP VIEW IF EXISTS `current_assignments`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `current_assignments` AS select `ta`.`id` AS `assignment_id`,`ta`.`ticket_id` AS `ticket_id`,`ta`.`agent_id` AS `agent_id`,`u`.`name` AS `agent_name`,`u`.`email` AS `agent_email`,`u`.`role` AS `agent_role`,`ta`.`assigned_by` AS `assigned_by`,`assigned_by_user`.`name` AS `assigned_by_name`,`ta`.`assigned_at` AS `assigned_at`,'manual' AS `assignment_type`,coalesce(`t`.`priority`,'medium') AS `priority_level`,`ta`.`assignment_reason` AS `assignment_notes`,coalesce(`ta`.`is_primary`,true) AS `is_primary`,coalesce(`t`.`status`,'new') AS `ticket_status`,coalesce(`t`.`issue_title`,`t`.`description`) AS `issue_title`,`t`.`created_at` AS `ticket_created` from (((`ticket_assignments` `ta` join `tickets` `t` on((`ta`.`ticket_id` = `t`.`id`))) join `users` `u` on((`ta`.`agent_id` = `u`.`id`))) left join `users` `assigned_by_user` on((`ta`.`assigned_by` = `assigned_by_user`.`id`))) where (`ta`.`is_active` = true) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `agent_workload`
--

/*!50001 DROP VIEW IF EXISTS `agent_workload`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `agent_workload` AS select `u`.`id` AS `agent_id`,`u`.`name` AS `agent_name`,`u`.`email` AS `agent_email`,`u`.`role` AS `agent_role`,count(`ta`.`id`) AS `total_active_assignments`,count((case when (coalesce(`ta`.`is_primary`,true) = true) then 1 end)) AS `primary_assignments`,count((case when (coalesce(`t`.`priority`,'medium') = 'urgent') then 1 end)) AS `urgent_tickets`,count((case when (coalesce(`t`.`priority`,'medium') = 'high') then 1 end)) AS `high_priority_tickets`,round(avg((case when (`ta`.`unassigned_at` is not null) then timestampdiff(MINUTE,`ta`.`assigned_at`,`ta`.`unassigned_at`) else NULL end)),2) AS `avg_workload_score`,min(`ta`.`assigned_at`) AS `oldest_assignment`,max(`ta`.`assigned_at`) AS `newest_assignment` from ((`users` `u` left join `ticket_assignments` `ta` on(((`u`.`id` = `ta`.`agent_id`) and (`ta`.`is_active` = true)))) left join `tickets` `t` on((`ta`.`ticket_id` = `t`.`id`))) where (`u`.`role` in ('agent','support_executive','support_manager')) group by `u`.`id`,`u`.`name`,`u`.`email`,`u`.`role` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Dumping events for database 'tick_system'
--

--
-- Dumping routines for database 'tick_system'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-11 16:10:18
