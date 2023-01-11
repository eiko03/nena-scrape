/*
 Navicat MySQL Data Transfer

 Source Server         : OK[BACKUP-WEST]
 Source Server Type    : MySQL
 Source Server Version : 50712
 Source Host           : ok-acc-w-aurora-rds.cluster-crq2vhd7xl7j.us-west-1.rds.amazonaws.com:3306
 Source Schema         : ok-acc-w-prod-nga911

 Target Server Type    : MySQL
 Target Server Version : 50712
 File Encoding         : 65001

*/

SET NAMES utf8mb4;

-- ----------------------------
-- Table structure for nena_companies
-- ----------------------------
DROP TABLE IF EXISTS `nena_companies`;
CREATE TABLE `nena_companies`  (
--                                      `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
                                     `CoID` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci UNIQUE NOT NULL,
                                     `Company` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
                                     `Type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
                                     `Status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
                                     `States Served` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
                                     `24X7 Phone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
                                     `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                     `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                     PRIMARY KEY (`CoID`) USING BTREE,
                                     INDEX (CoID)
) ENGINE = InnoDB AUTO_INCREMENT = 143 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of nena_companies
-- ----------------------------

