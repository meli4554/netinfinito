-- =====================================================
-- NetInFi - Sistema de Gestão de Almoxarifado
-- Script SQL Completo para MySQL
-- Base: Prisma Schema + Dados Iniciais
-- =====================================================

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS `netinfi` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar o banco de dados
USE `netinfi`;

-- Desabilitar verificação de chaves estrangeiras temporariamente
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- TABELAS DE AUTENTICAÇÃO E PERMISSÕES
-- =====================================================

-- Tabela de Roles (Perfis/Funções)
DROP TABLE IF EXISTS `Role`;
CREATE TABLE `Role` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Role_name_key` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Permissões
DROP TABLE IF EXISTS `Permission`;
CREATE TABLE `Permission` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(191) NOT NULL,
  `description` VARCHAR(191) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Permission_code_key` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Relacionamento Role-Permission (Muitos para Muitos)
DROP TABLE IF EXISTS `RolePermission`;
CREATE TABLE `RolePermission` (
  `roleId` INT NOT NULL,
  `permissionId` INT NOT NULL,
  PRIMARY KEY (`roleId`, `permissionId`),
  KEY `RolePermission_permissionId_fkey` (`permissionId`),
  CONSTRAINT `RolePermission_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `RolePermission_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `Permission` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Usuários
DROP TABLE IF EXISTS `User`;
CREATE TABLE `User` (
  `id` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `passwordHash` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NULL,
  `roleId` INT NOT NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`),
  KEY `User_roleId_fkey` (`roleId`),
  CONSTRAINT `User_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELAS DE TÉCNICOS
-- =====================================================

-- Tabela de Técnicos
DROP TABLE IF EXISTS `Technician`;
CREATE TABLE `Technician` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `category` ENUM('FIBRA', 'RADIO', 'INSTALACAO', 'MANUTENCAO', 'OUTROS') NOT NULL,
  `phone` VARCHAR(191) NULL,
  `email` VARCHAR(191) NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELAS DE PRODUTOS
-- =====================================================

-- Tabela de Produtos
DROP TABLE IF EXISTS `Product`;
CREATE TABLE `Product` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `sku` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `unit` VARCHAR(191) NOT NULL DEFAULT 'UN',
  `barCode` VARCHAR(191) NULL,
  `minStock` INT NOT NULL DEFAULT 0,
  `trackSerial` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Product_sku_key` (`sku`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Instâncias de Produtos (para rastreamento de serial/MAC)
DROP TABLE IF EXISTS `ProductInstance`;
CREATE TABLE `ProductInstance` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `productId` INT NOT NULL,
  `serialNumber` VARCHAR(191) NULL,
  `macAddress` VARCHAR(191) NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'AVAILABLE',
  `locationId` INT NULL,
  `invoiceNumber` VARCHAR(191) NULL,
  `invoiceDate` DATETIME(3) NULL,
  `invoiceFile` VARCHAR(191) NULL,
  `receivedAt` DATETIME(3) NULL,
  `note` TEXT NULL,
  `inutilizedReason` TEXT NULL,
  `inutilizedAt` DATETIME(3) NULL,
  `awaitingReplacement` BOOLEAN NOT NULL DEFAULT 0,
  `replacementRequested` BOOLEAN NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ProductInstance_productId_idx` (`productId`),
  KEY `ProductInstance_serialNumber_idx` (`serialNumber`),
  KEY `ProductInstance_macAddress_idx` (`macAddress`),
  KEY `ProductInstance_status_idx` (`status`),
  KEY `ProductInstance_awaitingReplacement_idx` (`awaitingReplacement`),
  CONSTRAINT `ProductInstance_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELAS DE ARMAZÉNS E LOCALIZAÇÕES
-- =====================================================

-- Tabela de Armazéns
DROP TABLE IF EXISTS `Warehouse`;
CREATE TABLE `Warehouse` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `code` VARCHAR(191) NOT NULL,
  `type` ENUM('MAIN', 'TECHNICIAN') NOT NULL DEFAULT 'MAIN',
  `technicianId` INT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Warehouse_code_key` (`code`),
  UNIQUE KEY `Warehouse_technicianId_key` (`technicianId`),
  CONSTRAINT `Warehouse_technicianId_fkey` FOREIGN KEY (`technicianId`) REFERENCES `Technician` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Localizações no Armazém
DROP TABLE IF EXISTS `Location`;
CREATE TABLE `Location` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `warehouseId` INT NOT NULL,
  `code` VARCHAR(191) NOT NULL,
  `description` VARCHAR(191) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Location_code_key` (`code`),
  KEY `Location_warehouseId_fkey` (`warehouseId`),
  CONSTRAINT `Location_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `Warehouse` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELAS DE MOVIMENTAÇÕES DE ESTOQUE
-- =====================================================

-- Tabela de Movimentações de Estoque
DROP TABLE IF EXISTS `StockMovement`;
CREATE TABLE `StockMovement` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `productId` INT NOT NULL,
  `type` ENUM('IN', 'OUT', 'ADJUST', 'TRANSFER') NOT NULL DEFAULT 'IN',
  `quantity` DECIMAL(20,4) NOT NULL,
  `locationId` INT NULL,
  `technicianId` INT NULL,
  `referenceType` ENUM('ENTRY', 'TRANSFER', 'USAGE', 'ADJUSTMENT') NOT NULL,
  `referenceId` INT NOT NULL,
  `occurredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `note` TEXT NULL,
  PRIMARY KEY (`id`),
  KEY `StockMovement_productId_fkey` (`productId`),
  KEY `StockMovement_locationId_fkey` (`locationId`),
  KEY `StockMovement_technicianId_fkey` (`technicianId`),
  CONSTRAINT `StockMovement_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `StockMovement_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `StockMovement_technicianId_fkey` FOREIGN KEY (`technicianId`) REFERENCES `Technician` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELAS DE TRANSFERÊNCIAS
-- =====================================================

-- Tabela de Transferências
DROP TABLE IF EXISTS `Transfer`;
CREATE TABLE `Transfer` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `number` VARCHAR(191) NOT NULL,
  `fromWarehouseId` INT NOT NULL,
  `toWarehouseId` INT NOT NULL,
  `technicianId` INT NOT NULL,
  `status` ENUM('PENDING', 'TRANSFERRED', 'RECEIVED', 'CANCELED') NOT NULL DEFAULT 'PENDING',
  `transferredAt` DATETIME(3) NULL,
  `receivedAt` DATETIME(3) NULL,
  `createdBy` VARCHAR(191) NULL,
  `note` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Transfer_number_key` (`number`),
  KEY `Transfer_fromWarehouseId_fkey` (`fromWarehouseId`),
  KEY `Transfer_toWarehouseId_fkey` (`toWarehouseId`),
  KEY `Transfer_technicianId_fkey` (`technicianId`),
  CONSTRAINT `Transfer_fromWarehouseId_fkey` FOREIGN KEY (`fromWarehouseId`) REFERENCES `Warehouse` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Transfer_toWarehouseId_fkey` FOREIGN KEY (`toWarehouseId`) REFERENCES `Warehouse` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Transfer_technicianId_fkey` FOREIGN KEY (`technicianId`) REFERENCES `Technician` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Itens de Transferência
DROP TABLE IF EXISTS `TransferItem`;
CREATE TABLE `TransferItem` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `transferId` INT NOT NULL,
  `productId` INT NOT NULL,
  `quantity` DECIMAL(20,4) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `TransferItem_transferId_fkey` (`transferId`),
  KEY `TransferItem_productId_fkey` (`productId`),
  CONSTRAINT `TransferItem_transferId_fkey` FOREIGN KEY (`transferId`) REFERENCES `Transfer` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `TransferItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELAS DE USO DE PRODUTOS
-- =====================================================

-- Tabela de Uso de Produtos pelos Técnicos
DROP TABLE IF EXISTS `ProductUsage`;
CREATE TABLE `ProductUsage` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `technicianId` INT NOT NULL,
  `productId` INT NOT NULL,
  `quantity` DECIMAL(20,4) NOT NULL,
  `usedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `note` TEXT NULL,
  `serviceOrder` VARCHAR(191) NULL,
  `clientName` VARCHAR(191) NULL,
  PRIMARY KEY (`id`),
  KEY `ProductUsage_technicianId_fkey` (`technicianId`),
  KEY `ProductUsage_productId_fkey` (`productId`),
  CONSTRAINT `ProductUsage_technicianId_fkey` FOREIGN KEY (`technicianId`) REFERENCES `Technician` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `ProductUsage_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reabilitar verificação de chaves estrangeiras
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- DADOS INICIAIS - ROLES E PERMISSÕES
-- =====================================================

-- Inserir Roles padrão
INSERT INTO `Role` (`id`, `name`) VALUES
(1, 'Administrador'),
(2, 'Gerente'),
(3, 'Operador'),
(4, 'Visualizador')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Inserir Permissões básicas
INSERT INTO `Permission` (`id`, `code`, `description`) VALUES
(1, 'users.create', 'Criar usuários'),
(2, 'users.read', 'Visualizar usuários'),
(3, 'users.update', 'Atualizar usuários'),
(4, 'users.delete', 'Deletar usuários'),
(5, 'products.create', 'Criar produtos'),
(6, 'products.read', 'Visualizar produtos'),
(7, 'products.update', 'Atualizar produtos'),
(8, 'products.delete', 'Deletar produtos'),
(9, 'technicians.create', 'Criar técnicos'),
(10, 'technicians.read', 'Visualizar técnicos'),
(11, 'technicians.update', 'Atualizar técnicos'),
(12, 'technicians.delete', 'Deletar técnicos'),
(13, 'inventory.manage', 'Gerenciar estoque'),
(14, 'transfers.create', 'Criar transferências'),
(15, 'transfers.read', 'Visualizar transferências'),
(16, 'transfers.approve', 'Aprovar transferências'),
(17, 'reports.view', 'Visualizar relatórios')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- Associar todas as permissões ao Administrador
INSERT INTO `RolePermission` (`roleId`, `permissionId`) VALUES
(1, 1), (1, 2), (1, 3), (1, 4),
(1, 5), (1, 6), (1, 7), (1, 8),
(1, 9), (1, 10), (1, 11), (1, 12),
(1, 13), (1, 14), (1, 15), (1, 16), (1, 17)
ON DUPLICATE KEY UPDATE `roleId` = VALUES(`roleId`);

-- Permissões do Gerente
INSERT INTO `RolePermission` (`roleId`, `permissionId`) VALUES
(2, 2), (2, 3), (2, 5), (2, 6), (2, 7),
(2, 9), (2, 10), (2, 11), (2, 13), (2, 14),
(2, 15), (2, 16), (2, 17)
ON DUPLICATE KEY UPDATE `roleId` = VALUES(`roleId`);

-- Permissões do Operador
INSERT INTO `RolePermission` (`roleId`, `permissionId`) VALUES
(3, 6), (3, 10), (3, 13), (3, 14), (3, 15)
ON DUPLICATE KEY UPDATE `roleId` = VALUES(`roleId`);

-- Permissões do Visualizador
INSERT INTO `RolePermission` (`roleId`, `permissionId`) VALUES
(4, 2), (4, 6), (4, 10), (4, 15), (4, 17)
ON DUPLICATE KEY UPDATE `roleId` = VALUES(`roleId`);

-- =====================================================
-- USUÁRIO ADMINISTRADOR PADRÃO
-- =====================================================
-- Email: admin@netinfi.com
-- Senha: Admin123!
-- Hash gerado com argon2

INSERT INTO `User` (`id`, `email`, `passwordHash`, `name`, `roleId`, `isActive`, `createdAt`, `updatedAt`) VALUES
('cldefault001', 'admin@netinfi.com', '$argon2id$v=19$m=65536,t=3,p=4$brNd2LXXrw53Hn2ZhDTZoQ$irVI21iw3BHyhFMgz5qeeZTHyH9rDNXxN++aRFUVJjo', 'Administrador do Sistema', 1, true, NOW(), NOW())
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);

-- =====================================================
-- DADOS DE EXEMPLO - TÉCNICOS
-- =====================================================

INSERT INTO `Technician` (`id`, `name`, `category`, `phone`, `email`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, 'Jonas Silva', 'FIBRA', '(11) 98765-4321', 'jonas.silva@netinfi.com', 1, NOW(), NOW()),
(2, 'Joanderson Santos', 'RADIO', '(11) 98765-4322', 'joanderson.santos@netinfi.com', 1, NOW(), NOW()),
(3, 'Carlos Eduardo', 'FIBRA', '(11) 98765-4323', 'carlos.eduardo@netinfi.com', 1, NOW(), NOW()),
(4, 'Rafael Oliveira', 'INSTALACAO', '(11) 98765-4324', 'rafael.oliveira@netinfi.com', 1, NOW(), NOW()),
(5, 'Fernando Costa', 'MANUTENCAO', '(11) 98765-4325', 'fernando.costa@netinfi.com', 1, NOW(), NOW()),
(6, 'André Souza', 'RADIO', '(11) 98765-4326', 'andre.souza@netinfi.com', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- =====================================================
-- DADOS DE EXEMPLO - ARMAZÉNS
-- =====================================================

-- Almoxarifado Principal
INSERT INTO `Warehouse` (`id`, `name`, `code`, `type`, `technicianId`, `createdAt`) VALUES
(1, 'Almoxarifado Principal', 'MAIN-001', 'MAIN', NULL, NOW())
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Almoxarifados dos Técnicos
INSERT INTO `Warehouse` (`id`, `name`, `code`, `type`, `technicianId`, `createdAt`) VALUES
(2, 'Almoxarifado - Jonas Silva', 'TECH-1', 'TECHNICIAN', 1, NOW()),
(3, 'Almoxarifado - Joanderson Santos', 'TECH-2', 'TECHNICIAN', 2, NOW()),
(4, 'Almoxarifado - Carlos Eduardo', 'TECH-3', 'TECHNICIAN', 3, NOW()),
(5, 'Almoxarifado - Rafael Oliveira', 'TECH-4', 'TECHNICIAN', 4, NOW()),
(6, 'Almoxarifado - Fernando Costa', 'TECH-5', 'TECHNICIAN', 5, NOW()),
(7, 'Almoxarifado - André Souza', 'TECH-6', 'TECHNICIAN', 6, NOW())
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- =====================================================
-- DADOS DE EXEMPLO - LOCALIZAÇÕES
-- =====================================================

INSERT INTO `Location` (`id`, `warehouseId`, `code`, `description`) VALUES
(1, 1, 'MAIN-A01', 'Corredor A - Prateleira 01 - Roteadores'),
(2, 1, 'MAIN-A02', 'Corredor A - Prateleira 02 - ONTs'),
(3, 1, 'MAIN-B01', 'Corredor B - Prateleira 01 - Cabos de Fibra'),
(4, 1, 'MAIN-B02', 'Corredor B - Prateleira 02 - Conectores'),
(5, 1, 'MAIN-C01', 'Corredor C - Prateleira 01 - Antenas e Rádios'),
(6, 1, 'MAIN-C02', 'Corredor C - Prateleira 02 - Acessórios')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- =====================================================
-- DADOS DE EXEMPLO - PRODUTOS
-- =====================================================

INSERT INTO `Product` (`id`, `sku`, `name`, `unit`, `barCode`, `minStock`, `trackSerial`, `createdAt`, `updatedAt`) VALUES
(1, 'ROUTER-TP-AC1200', 'Roteador TP-Link AC1200', 'UN', '7898100172082', 10, false, NOW(), NOW()),
(2, 'ROUTER-MK-RB750', 'MikroTik RouterBoard RB750', 'UN', '4752224001184', 5, true, NOW(), NOW()),
(3, 'ONT-HUAWEI-HG8010', 'ONT Huawei HG8010H', 'UN', '6902524500001', 15, true, NOW(), NOW()),
(4, 'CABO-FIBRA-SM-1KM', 'Cabo de Fibra Óptica SM 1km', 'MT', '7891234567890', 1000, false, NOW(), NOW()),
(5, 'CONECTOR-SC-APC', 'Conector SC/APC', 'UN', '7899876543210', 50, false, NOW(), NOW()),
(6, 'CONECTOR-LC-UPC', 'Conector LC/UPC', 'UN', '7899876543227', 50, false, NOW(), NOW()),
(7, 'PATCH-CORD-SC-2M', 'Patch Cord SC/APC 2m', 'UN', '7891122334455', 30, false, NOW(), NOW()),
(8, 'SPLITTER-1X8', 'Splitter Óptico 1x8', 'UN', '7891234000001', 20, false, NOW(), NOW()),
(9, 'CAIXA-TERM-OPTICA-8F', 'Caixa de Terminação Óptica 8F', 'UN', '7899988776655', 10, false, NOW(), NOW()),
(10, 'CABO-UTP-CAT6-305M', 'Cabo UTP Cat6 305m', 'ROLO', '7891234888889', 20, false, NOW(), NOW()),
(11, 'CONECTOR-RJ45-CAT6', 'Conector RJ45 Cat6', 'UN', '7899999888877', 100, false, NOW(), NOW()),
(12, 'ANTENA-5GHZ-30DBI', 'Antena Setorial 5GHz 30dBi', 'UN', '7891122999988', 8, false, NOW(), NOW()),
(13, 'RADIO-UBNT-LITEBEAM', 'Ubiquiti LiteBeam AC Gen2', 'UN', '0817882024891', 12, true, NOW(), NOW()),
(14, 'POE-24V-1A', 'Fonte PoE 24V 1A', 'UN', '7899123456789', 25, false, NOW(), NOW()),
(15, 'ABRAÇADEIRA-NYLON-200MM', 'Abraçadeira de Nylon 200mm', 'PCT', '7891234567123', 50, false, NOW(), NOW())
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- =====================================================
-- DADOS DE EXEMPLO - ESTOQUE INICIAL
-- =====================================================

-- Entrada de produtos no almoxarifado principal
INSERT INTO `StockMovement` (`id`, `productId`, `type`, `quantity`, `locationId`, `technicianId`, `referenceType`, `referenceId`, `occurredAt`, `note`) VALUES
-- Roteadores e ONTs
(1, 1, 'IN', 50, 1, NULL, 'ENTRY', 1, NOW(), 'Estoque inicial - Roteador TP-Link AC1200'),
(2, 2, 'IN', 30, 1, NULL, 'ENTRY', 2, NOW(), 'Estoque inicial - MikroTik RB750'),
(3, 3, 'IN', 80, 2, NULL, 'ENTRY', 3, NOW(), 'Estoque inicial - ONT Huawei HG8010'),
-- Cabos e conectores de fibra
(4, 4, 'IN', 5000, 3, NULL, 'ENTRY', 4, NOW(), 'Estoque inicial - Cabo Fibra SM'),
(5, 5, 'IN', 200, 4, NULL, 'ENTRY', 5, NOW(), 'Estoque inicial - Conector SC/APC'),
(6, 6, 'IN', 200, 4, NULL, 'ENTRY', 6, NOW(), 'Estoque inicial - Conector LC/UPC'),
(7, 7, 'IN', 150, 4, NULL, 'ENTRY', 7, NOW(), 'Estoque inicial - Patch Cord SC'),
(8, 8, 'IN', 100, 4, NULL, 'ENTRY', 8, NOW(), 'Estoque inicial - Splitter 1x8'),
(9, 9, 'IN', 60, 4, NULL, 'ENTRY', 9, NOW(), 'Estoque inicial - Caixa Terminação'),
-- Rede e rádios
(10, 10, 'IN', 40, 5, NULL, 'ENTRY', 10, NOW(), 'Estoque inicial - Cabo UTP Cat6'),
(11, 11, 'IN', 500, 6, NULL, 'ENTRY', 11, NOW(), 'Estoque inicial - Conector RJ45'),
(12, 12, 'IN', 25, 5, NULL, 'ENTRY', 12, NOW(), 'Estoque inicial - Antena 5GHz'),
(13, 13, 'IN', 40, 5, NULL, 'ENTRY', 13, NOW(), 'Estoque inicial - Ubiquiti LiteBeam'),
(14, 14, 'IN', 100, 6, NULL, 'ENTRY', 14, NOW(), 'Estoque inicial - Fonte PoE'),
(15, 15, 'IN', 200, 6, NULL, 'ENTRY', 15, NOW(), 'Estoque inicial - Abraçadeiras')
ON DUPLICATE KEY UPDATE `quantity` = VALUES(`quantity`);

-- =====================================================
-- DADOS DE EXEMPLO - TRANSFERÊNCIAS
-- =====================================================

-- Transferência para Jonas Silva (Técnico de Fibra)
INSERT INTO `Transfer` (`id`, `number`, `fromWarehouseId`, `toWarehouseId`, `technicianId`, `status`, `transferredAt`, `receivedAt`, `createdBy`, `note`, `createdAt`, `updatedAt`) VALUES
(1, 'TRF-000001', 1, 2, 1, 'RECEIVED', DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY), 'admin@netinfi.com', 'Transferência inicial para Jonas - Instalações de fibra', DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY))
ON DUPLICATE KEY UPDATE `number` = VALUES(`number`);

INSERT INTO `TransferItem` (`id`, `transferId`, `productId`, `quantity`) VALUES
(1, 1, 3, 10),  -- 10 ONTs
(2, 1, 4, 500), -- 500m de cabo fibra
(3, 1, 5, 20),  -- 20 conectores SC/APC
(4, 1, 7, 10),  -- 10 patch cords
(5, 1, 9, 3)    -- 3 caixas de terminação
ON DUPLICATE KEY UPDATE `quantity` = VALUES(`quantity`);

-- Movimentos de estoque da transferência (saída do principal, entrada no técnico)
INSERT INTO `StockMovement` (`id`, `productId`, `type`, `quantity`, `locationId`, `technicianId`, `referenceType`, `referenceId`, `occurredAt`, `note`) VALUES
-- Saídas do almoxarifado principal
(16, 3, 'OUT', 10, 2, NULL, 'TRANSFER', 1, DATE_SUB(NOW(), INTERVAL 15 DAY), 'Transferência TRF-000001 para técnico'),
(17, 4, 'OUT', 500, 3, NULL, 'TRANSFER', 1, DATE_SUB(NOW(), INTERVAL 15 DAY), 'Transferência TRF-000001 para técnico'),
(18, 5, 'OUT', 20, 4, NULL, 'TRANSFER', 1, DATE_SUB(NOW(), INTERVAL 15 DAY), 'Transferência TRF-000001 para técnico'),
(19, 7, 'OUT', 10, 4, NULL, 'TRANSFER', 1, DATE_SUB(NOW(), INTERVAL 15 DAY), 'Transferência TRF-000001 para técnico'),
(20, 9, 'OUT', 3, 4, NULL, 'TRANSFER', 1, DATE_SUB(NOW(), INTERVAL 15 DAY), 'Transferência TRF-000001 para técnico'),
-- Entradas no almoxarifado do técnico
(21, 3, 'TRANSFER', 10, NULL, 1, 'TRANSFER', 1, DATE_SUB(NOW(), INTERVAL 15 DAY), 'Transferência TRF-000001 recebida'),
(22, 4, 'TRANSFER', 500, NULL, 1, 'TRANSFER', 1, DATE_SUB(NOW(), INTERVAL 15 DAY), 'Transferência TRF-000001 recebida'),
(23, 5, 'TRANSFER', 20, NULL, 1, 'TRANSFER', 1, DATE_SUB(NOW(), INTERVAL 15 DAY), 'Transferência TRF-000001 recebida'),
(24, 7, 'TRANSFER', 10, NULL, 1, 'TRANSFER', 1, DATE_SUB(NOW(), INTERVAL 15 DAY), 'Transferência TRF-000001 recebida'),
(25, 9, 'TRANSFER', 3, NULL, 1, 'TRANSFER', 1, DATE_SUB(NOW(), INTERVAL 15 DAY), 'Transferência TRF-000001 recebida')
ON DUPLICATE KEY UPDATE `quantity` = VALUES(`quantity`);

-- Transferência para Joanderson Santos (Técnico de Rádio)
INSERT INTO `Transfer` (`id`, `number`, `fromWarehouseId`, `toWarehouseId`, `technicianId`, `status`, `transferredAt`, `receivedAt`, `createdBy`, `note`, `createdAt`, `updatedAt`) VALUES
(2, 'TRF-000002', 1, 3, 2, 'RECEIVED', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY), 'admin@netinfi.com', 'Transferência inicial para Joanderson - Instalações de rádio', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY))
ON DUPLICATE KEY UPDATE `number` = VALUES(`number`);

INSERT INTO `TransferItem` (`id`, `transferId`, `productId`, `quantity`) VALUES
(6, 2, 12, 5),  -- 5 antenas
(7, 2, 13, 8),  -- 8 rádios Ubiquiti
(8, 2, 14, 10), -- 10 fontes PoE
(9, 2, 15, 20)  -- 20 pacotes de abraçadeiras
ON DUPLICATE KEY UPDATE `quantity` = VALUES(`quantity`);

INSERT INTO `StockMovement` (`id`, `productId`, `type`, `quantity`, `locationId`, `technicianId`, `referenceType`, `referenceId`, `occurredAt`, `note`) VALUES
-- Saídas
(26, 12, 'OUT', 5, 5, NULL, 'TRANSFER', 2, DATE_SUB(NOW(), INTERVAL 10 DAY), 'Transferência TRF-000002 para técnico'),
(27, 13, 'OUT', 8, 5, NULL, 'TRANSFER', 2, DATE_SUB(NOW(), INTERVAL 10 DAY), 'Transferência TRF-000002 para técnico'),
(28, 14, 'OUT', 10, 6, NULL, 'TRANSFER', 2, DATE_SUB(NOW(), INTERVAL 10 DAY), 'Transferência TRF-000002 para técnico'),
(29, 15, 'OUT', 20, 6, NULL, 'TRANSFER', 2, DATE_SUB(NOW(), INTERVAL 10 DAY), 'Transferência TRF-000002 para técnico'),
-- Entradas
(30, 12, 'TRANSFER', 5, NULL, 2, 'TRANSFER', 2, DATE_SUB(NOW(), INTERVAL 10 DAY), 'Transferência TRF-000002 recebida'),
(31, 13, 'TRANSFER', 8, NULL, 2, 'TRANSFER', 2, DATE_SUB(NOW(), INTERVAL 10 DAY), 'Transferência TRF-000002 recebida'),
(32, 14, 'TRANSFER', 10, NULL, 2, 'TRANSFER', 2, DATE_SUB(NOW(), INTERVAL 10 DAY), 'Transferência TRF-000002 recebida'),
(33, 15, 'TRANSFER', 20, NULL, 2, 'TRANSFER', 2, DATE_SUB(NOW(), INTERVAL 10 DAY), 'Transferência TRF-000002 recebida')
ON DUPLICATE KEY UPDATE `quantity` = VALUES(`quantity`);

-- =====================================================
-- DADOS DE EXEMPLO - USO DE PRODUTOS
-- =====================================================

-- Usos por Jonas Silva (Fibra)
INSERT INTO `ProductUsage` (`id`, `technicianId`, `productId`, `quantity`, `usedAt`, `note`, `serviceOrder`, `clientName`) VALUES
(1, 1, 3, 2, DATE_SUB(NOW(), INTERVAL 12 DAY), 'Instalação de fibra residencial', 'OS-2024-001', 'João da Silva'),
(2, 1, 4, 80, DATE_SUB(NOW(), INTERVAL 12 DAY), 'Instalação de fibra residencial', 'OS-2024-001', 'João da Silva'),
(3, 1, 5, 2, DATE_SUB(NOW(), INTERVAL 12 DAY), 'Instalação de fibra residencial', 'OS-2024-001', 'João da Silva'),
(4, 1, 7, 2, DATE_SUB(NOW(), INTERVAL 12 DAY), 'Instalação de fibra residencial', 'OS-2024-001', 'João da Silva'),
(5, 1, 3, 1, DATE_SUB(NOW(), INTERVAL 8 DAY), 'Instalação empresarial', 'OS-2024-015', 'Empresa ABC Ltda'),
(6, 1, 4, 120, DATE_SUB(NOW(), INTERVAL 8 DAY), 'Instalação empresarial', 'OS-2024-015', 'Empresa ABC Ltda'),
(7, 1, 5, 4, DATE_SUB(NOW(), INTERVAL 8 DAY), 'Instalação empresarial', 'OS-2024-015', 'Empresa ABC Ltda'),
(8, 1, 9, 1, DATE_SUB(NOW(), INTERVAL 8 DAY), 'Instalação empresarial', 'OS-2024-015', 'Empresa ABC Ltda')
ON DUPLICATE KEY UPDATE `quantity` = VALUES(`quantity`);

-- Usos por Joanderson Santos (Rádio)
INSERT INTO `ProductUsage` (`id`, `technicianId`, `productId`, `quantity`, `usedAt`, `note`, `serviceOrder`, `clientName`) VALUES
(9, 2, 13, 2, DATE_SUB(NOW(), INTERVAL 9 DAY), 'Instalação de link ponto a ponto', 'OS-2024-008', 'Fazenda Santa Rita'),
(10, 2, 14, 2, DATE_SUB(NOW(), INTERVAL 9 DAY), 'Instalação de link ponto a ponto', 'OS-2024-008', 'Fazenda Santa Rita'),
(11, 2, 15, 4, DATE_SUB(NOW(), INTERVAL 9 DAY), 'Instalação de link ponto a ponto', 'OS-2024-008', 'Fazenda Santa Rita'),
(12, 2, 12, 1, DATE_SUB(NOW(), INTERVAL 5 DAY), 'Expansão de cobertura', 'OS-2024-022', 'Condomínio Residencial'),
(13, 2, 14, 1, DATE_SUB(NOW(), INTERVAL 5 DAY), 'Expansão de cobertura', 'OS-2024-022', 'Condomínio Residencial'),
(14, 2, 15, 5, DATE_SUB(NOW(), INTERVAL 5 DAY), 'Expansão de cobertura', 'OS-2024-022', 'Condomínio Residencial')
ON DUPLICATE KEY UPDATE `quantity` = VALUES(`quantity`);

-- Movimentos de estoque dos usos (saídas)
INSERT INTO `StockMovement` (`id`, `productId`, `type`, `quantity`, `locationId`, `technicianId`, `referenceType`, `referenceId`, `occurredAt`, `note`) VALUES
-- Usos do Jonas
(34, 3, 'OUT', 2, NULL, 1, 'USAGE', 1, DATE_SUB(NOW(), INTERVAL 12 DAY), 'Uso registrado - João da Silva'),
(35, 4, 'OUT', 80, NULL, 1, 'USAGE', 2, DATE_SUB(NOW(), INTERVAL 12 DAY), 'Uso registrado - João da Silva'),
(36, 5, 'OUT', 2, NULL, 1, 'USAGE', 3, DATE_SUB(NOW(), INTERVAL 12 DAY), 'Uso registrado - João da Silva'),
(37, 7, 'OUT', 2, NULL, 1, 'USAGE', 4, DATE_SUB(NOW(), INTERVAL 12 DAY), 'Uso registrado - João da Silva'),
(38, 3, 'OUT', 1, NULL, 1, 'USAGE', 5, DATE_SUB(NOW(), INTERVAL 8 DAY), 'Uso registrado - Empresa ABC Ltda'),
(39, 4, 'OUT', 120, NULL, 1, 'USAGE', 6, DATE_SUB(NOW(), INTERVAL 8 DAY), 'Uso registrado - Empresa ABC Ltda'),
(40, 5, 'OUT', 4, NULL, 1, 'USAGE', 7, DATE_SUB(NOW(), INTERVAL 8 DAY), 'Uso registrado - Empresa ABC Ltda'),
(41, 9, 'OUT', 1, NULL, 1, 'USAGE', 8, DATE_SUB(NOW(), INTERVAL 8 DAY), 'Uso registrado - Empresa ABC Ltda'),
-- Usos do Joanderson
(42, 13, 'OUT', 2, NULL, 2, 'USAGE', 9, DATE_SUB(NOW(), INTERVAL 9 DAY), 'Uso registrado - Fazenda Santa Rita'),
(43, 14, 'OUT', 2, NULL, 2, 'USAGE', 10, DATE_SUB(NOW(), INTERVAL 9 DAY), 'Uso registrado - Fazenda Santa Rita'),
(44, 15, 'OUT', 4, NULL, 2, 'USAGE', 11, DATE_SUB(NOW(), INTERVAL 9 DAY), 'Uso registrado - Fazenda Santa Rita'),
(45, 12, 'OUT', 1, NULL, 2, 'USAGE', 12, DATE_SUB(NOW(), INTERVAL 5 DAY), 'Uso registrado - Condomínio Residencial'),
(46, 14, 'OUT', 1, NULL, 2, 'USAGE', 13, DATE_SUB(NOW(), INTERVAL 5 DAY), 'Uso registrado - Condomínio Residencial'),
(47, 15, 'OUT', 5, NULL, 2, 'USAGE', 14, DATE_SUB(NOW(), INTERVAL 5 DAY), 'Uso registrado - Condomínio Residencial')
ON DUPLICATE KEY UPDATE `quantity` = VALUES(`quantity`);

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

-- Verificar tabelas criadas
SHOW TABLES;

SELECT '========================================' AS '';
SELECT 'DATABASE NETINFI CRIADO COM SUCESSO!' AS '';
SELECT '========================================' AS '';
SELECT '' AS '';
SELECT 'CREDENCIAIS DE ACESSO:' AS '';
SELECT 'Email: admin@netinfi.com' AS '';
SELECT 'Senha: Admin123!' AS '';
SELECT '' AS '';
SELECT 'RESUMO:' AS '';
SELECT CONCAT('- ', COUNT(*), ' Usuários') AS '' FROM User;
SELECT CONCAT('- ', COUNT(*), ' Técnicos') AS '' FROM Technician;
SELECT CONCAT('- ', COUNT(*), ' Produtos') AS '' FROM Product;
SELECT CONCAT('- ', COUNT(*), ' Armazéns') AS '' FROM Warehouse;
SELECT CONCAT('- ', COUNT(*), ' Localizações') AS '' FROM Location;
SELECT CONCAT('- ', COUNT(*), ' Movimentações de Estoque') AS '' FROM StockMovement;
SELECT CONCAT('- ', COUNT(*), ' Transferências') AS '' FROM Transfer;
SELECT CONCAT('- ', COUNT(*), ' Usos de Produtos') AS '' FROM ProductUsage;
SELECT '========================================' AS '';
