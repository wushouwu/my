-- MySQL dump 10.13  Distrib 5.6.17, for Win64 (x86_64)
--
-- Host: localhost    Database: memory
-- ------------------------------------------------------
-- Server version	5.6.17

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `me`
--

DROP TABLE IF EXISTS `me`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `me` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `attribute` varchar(255) NOT NULL COMMENT '属性',
  `word` varchar(535) NOT NULL,
  `value` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `datetime` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `attribute` (`attribute`),
  KEY `word` (`word`(333)),
  KEY `value` (`value`),
  KEY `datetime` (`datetime`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `me`
--

LOCK TABLES `me` WRITE;
/*!40000 ALTER TABLE `me` DISABLE KEYS */;
INSERT INTO `me` VALUES (1,'宝安站-始兴','汽车票,回家','180','终点站南雄','2018-03-30 09:30:00'),(2,'宝安站-始兴','汽车票,回家','170','终点站南雄','2017-04-29 15:30:00'),(3,'爆竹','醮地,扫墓','19','19坟','2018-03-31 12:53:23'),(4,'始兴站-宝安','汽车票','140','5小时','2018-04-01 09:03:00');
/*!40000 ALTER TABLE `me` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `words`
--

DROP TABLE IF EXISTS `words`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `words` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `pid` varchar(255) NOT NULL COMMENT 'pid',
  `word` varchar(255) DEFAULT NULL COMMENT '词',
  `priority` int(2) NOT NULL DEFAULT '3' COMMENT '权重',
  `circle` varchar(6) NOT NULL COMMENT '所属圈',
  `pword` varchar(255) NOT NULL COMMENT '所属词',
  PRIMARY KEY (`id`),
  KEY `word` (`word`),
  KEY `circle` (`circle`),
  KEY `priority` (`priority`),
  KEY `pid` (`pid`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `words`
--

LOCK TABLES `words` WRITE;
/*!40000 ALTER TABLE `words` DISABLE KEYS */;
INSERT INTO `words` VALUES (1,'4','祖宗上九代',3,'关注',''),(2,'祖宗十八代','子',3,'关注',''),(3,'1','父',3,'关注',''),(4,'0','祖宗十八代',3,'关注','');
/*!40000 ALTER TABLE `words` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-04-01 22:57:21
