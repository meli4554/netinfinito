-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 18/11/2025 às 02:29
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `netinfi`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `location`
--

CREATE TABLE `location` (
  `id` int(11) NOT NULL,
  `warehouseId` int(11) NOT NULL,
  `code` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `location`
--

INSERT INTO `location` (`id`, `warehouseId`, `code`, `description`) VALUES
(1, 1, 'MAIN-A01', 'Corredor A - Prateleira 01 - Roteadores'),
(2, 1, 'MAIN-A02', 'Corredor A - Prateleira 02 - ONTs'),
(3, 1, 'MAIN-B01', 'Corredor B - Prateleira 01 - Cabos de Fibra'),
(4, 1, 'MAIN-B02', 'Corredor B - Prateleira 02 - Conectores'),
(5, 1, 'MAIN-C01', 'Corredor C - Prateleira 01 - Antenas e Rádios'),
(6, 1, 'MAIN-C02', 'Corredor C - Prateleira 02 - Acessórios');

-- --------------------------------------------------------

--
-- Estrutura para tabela `permission`
--

CREATE TABLE `permission` (
  `id` int(11) NOT NULL,
  `code` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `permission`
--

INSERT INTO `permission` (`id`, `code`, `description`) VALUES
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
(17, 'reports.view', 'Visualizar relatórios');

-- --------------------------------------------------------

--
-- Estrutura para tabela `product`
--

CREATE TABLE `product` (
  `id` int(11) NOT NULL,
  `sku` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `unit` varchar(191) NOT NULL DEFAULT 'UN',
  `barCode` varchar(191) DEFAULT NULL,
  `minStock` int(11) NOT NULL DEFAULT 0,
  `trackSerial` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `product`
--

INSERT INTO `product` (`id`, `sku`, `name`, `unit`, `barCode`, `minStock`, `trackSerial`, `createdAt`, `updatedAt`) VALUES
(30, 'PROD-000001', 'ROTEADOR GREATEK AX 1500', 'UN', NULL, 4, 0, '2025-11-17 21:27:20.000', '2025-11-17 21:27:20.000');

-- --------------------------------------------------------

--
-- Estrutura para tabela `productinstance`
--

CREATE TABLE `productinstance` (
  `id` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `serialNumber` varchar(191) DEFAULT NULL,
  `macAddress` varchar(191) DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'AVAILABLE',
  `locationId` int(11) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `awaitingReplacement` tinyint(1) NOT NULL DEFAULT 0,
  `inutilizedAt` datetime(3) DEFAULT NULL,
  `inutilizedReason` text DEFAULT NULL,
  `invoiceDate` datetime(3) DEFAULT NULL,
  `invoiceNumber` varchar(191) DEFAULT NULL,
  `replacementRequested` tinyint(1) NOT NULL DEFAULT 0,
  `invoiceFile` varchar(191) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `receivedAt` datetime(3) DEFAULT NULL,
  `entryDate` datetime(3) DEFAULT NULL,
  `supplier` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `productinstance`
--

INSERT INTO `productinstance` (`id`, `productId`, `serialNumber`, `macAddress`, `status`, `locationId`, `createdAt`, `updatedAt`, `awaitingReplacement`, `inutilizedAt`, `inutilizedReason`, `invoiceDate`, `invoiceNumber`, `replacementRequested`, `invoiceFile`, `note`, `receivedAt`, `entryDate`, `supplier`) VALUES
(117, 30, NULL, NULL, 'AVAILABLE', NULL, '2025-11-17 21:27:34.299', '0000-00-00 00:00:00.000', 0, NULL, NULL, '2025-11-26 21:00:00.000', '34325345', 0, NULL, 'AA', '2025-11-03 21:00:00.000', '2025-11-17 21:27:34.267', 'XEEa'),
(118, 30, NULL, NULL, 'AVAILABLE', NULL, '2025-11-17 21:27:34.372', '0000-00-00 00:00:00.000', 0, NULL, NULL, '2025-11-26 21:00:00.000', '34325345', 0, NULL, 'AA', '2025-11-03 21:00:00.000', '2025-11-17 21:27:34.267', 'XEEa'),
(119, 30, NULL, NULL, 'AVAILABLE', NULL, '2025-11-17 21:27:34.383', '0000-00-00 00:00:00.000', 0, NULL, NULL, '2025-11-26 21:00:00.000', '34325345', 0, NULL, 'AA', '2025-11-03 21:00:00.000', '2025-11-17 21:27:34.267', 'XEEa'),
(120, 30, NULL, NULL, 'AVAILABLE', NULL, '2025-11-17 21:27:34.390', '0000-00-00 00:00:00.000', 0, NULL, NULL, '2025-11-26 21:00:00.000', '34325345', 0, NULL, 'AA', '2025-11-03 21:00:00.000', '2025-11-17 21:27:34.267', 'XEEa'),
(121, 30, NULL, NULL, 'AVAILABLE', NULL, '2025-11-17 21:27:34.396', '0000-00-00 00:00:00.000', 0, NULL, NULL, '2025-11-26 21:00:00.000', '34325345', 0, NULL, 'AA', '2025-11-03 21:00:00.000', '2025-11-17 21:27:34.267', 'XEEa'),
(122, 30, 'XC3455555', 'AB23', 'AVAILABLE', NULL, '2025-11-17 21:27:34.401', '0000-00-00 00:00:00.000', 0, NULL, NULL, '2025-11-26 21:00:00.000', '34325345', 0, NULL, 'AA', '2025-11-03 21:00:00.000', '2025-11-17 21:27:34.267', 'XEEa');

-- --------------------------------------------------------

--
-- Estrutura para tabela `productusage`
--

CREATE TABLE `productusage` (
  `id` int(11) NOT NULL,
  `technicianId` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `quantity` decimal(20,4) NOT NULL,
  `usedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `note` text DEFAULT NULL,
  `serviceOrder` varchar(191) DEFAULT NULL,
  `clientName` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `role`
--

CREATE TABLE `role` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `role`
--

INSERT INTO `role` (`id`, `name`) VALUES
(1, 'Administrador'),
(2, 'Gerente'),
(3, 'Operador'),
(4, 'Visualizador');

-- --------------------------------------------------------

--
-- Estrutura para tabela `rolepermission`
--

CREATE TABLE `rolepermission` (
  `roleId` int(11) NOT NULL,
  `permissionId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `rolepermission`
--

INSERT INTO `rolepermission` (`roleId`, `permissionId`) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(1, 5),
(1, 6),
(1, 7),
(1, 8),
(1, 9),
(1, 10),
(1, 11),
(1, 12),
(1, 13),
(1, 14),
(1, 15),
(1, 16),
(1, 17),
(2, 2),
(2, 3),
(2, 5),
(2, 6),
(2, 7),
(2, 9),
(2, 10),
(2, 11),
(2, 13),
(2, 14),
(2, 15),
(2, 16),
(2, 17),
(3, 6),
(3, 10),
(3, 13),
(3, 14),
(3, 15),
(4, 2),
(4, 6),
(4, 10),
(4, 15),
(4, 17);

-- --------------------------------------------------------

--
-- Estrutura para tabela `stockmovement`
--

CREATE TABLE `stockmovement` (
  `id` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `type` enum('IN','OUT','ADJUST','TRANSFER') NOT NULL DEFAULT 'IN',
  `quantity` decimal(20,4) NOT NULL,
  `locationId` int(11) DEFAULT NULL,
  `technicianId` int(11) DEFAULT NULL,
  `referenceType` enum('ENTRY','TRANSFER','USAGE','ADJUSTMENT') NOT NULL,
  `referenceId` int(11) NOT NULL,
  `occurredAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `note` text DEFAULT NULL,
  `invoiceDate` datetime(3) DEFAULT NULL,
  `invoiceNumber` varchar(191) DEFAULT NULL,
  `receivedAt` datetime(3) DEFAULT NULL,
  `invoiceFile` varchar(191) DEFAULT NULL,
  `supplier` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `stockmovement`
--

INSERT INTO `stockmovement` (`id`, `productId`, `type`, `quantity`, `locationId`, `technicianId`, `referenceType`, `referenceId`, `occurredAt`, `note`, `invoiceDate`, `invoiceNumber`, `receivedAt`, `invoiceFile`, `supplier`) VALUES
(64, 30, 'IN', 6.0000, NULL, NULL, 'ENTRY', 30, '2025-11-17 21:27:34.267', 'AA', '2025-11-26 21:00:00.000', '34325345', '2025-11-03 21:00:00.000', NULL, 'XEEa');

-- --------------------------------------------------------

--
-- Estrutura para tabela `technician`
--

CREATE TABLE `technician` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `category` enum('FIBRA','RADIO','INSTALACAO','MANUTENCAO','OUTROS') NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `email` varchar(191) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `technician`
--

INSERT INTO `technician` (`id`, `name`, `category`, `phone`, `email`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, 'Jonas Silva', 'FIBRA', '(11) 98765-4321', 'jonas.silva@netinfi.com', 1, '2025-11-15 21:13:14.000', '2025-11-16 21:27:16.230'),
(2, 'Joanderson Santos', 'RADIO', '(11) 98765-4322', 'joanderson.santos@netinfi.com', 1, '2025-11-15 21:13:14.000', '2025-11-15 21:13:14.000');

-- --------------------------------------------------------

--
-- Estrutura para tabela `transfer`
--

CREATE TABLE `transfer` (
  `id` int(11) NOT NULL,
  `number` varchar(191) NOT NULL,
  `fromWarehouseId` int(11) NOT NULL,
  `toWarehouseId` int(11) NOT NULL,
  `technicianId` int(11) NOT NULL,
  `status` enum('PENDING','IN_HANDS','PARTIALLY_USED','USED','PARTIALLY_RETURNED','RETURNED','CANCELED') NOT NULL DEFAULT 'PENDING',
  `transferredAt` datetime(3) DEFAULT NULL,
  `receivedAt` datetime(3) DEFAULT NULL,
  `createdBy` varchar(191) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `reportFile` varchar(191) DEFAULT NULL,
  `signatureFile` varchar(191) DEFAULT NULL,
  `signatureType` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `transfer`
--

INSERT INTO `transfer` (`id`, `number`, `fromWarehouseId`, `toWarehouseId`, `technicianId`, `status`, `transferredAt`, `receivedAt`, `createdBy`, `note`, `createdAt`, `updatedAt`, `reportFile`, `signatureFile`, `signatureType`) VALUES
(3, 'TRF-000001', 1, 2, 1, 'IN_HANDS', '2025-11-17 22:04:14.832', NULL, NULL, 'Ficar em cima.', '2025-11-17 21:56:18.374', '0000-00-00 00:00:00.000', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `transferitem`
--

CREATE TABLE `transferitem` (
  `id` int(11) NOT NULL,
  `transferId` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `quantity` decimal(20,4) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `invoiceNumber` varchar(191) DEFAULT NULL,
  `ixcClientCode` varchar(191) DEFAULT NULL,
  `macAddress` varchar(191) DEFAULT NULL,
  `productInstanceId` int(11) DEFAULT NULL,
  `returnedAt` datetime(3) DEFAULT NULL,
  `serialNumber` varchar(191) DEFAULT NULL,
  `status` enum('PENDING','IN_HANDS','USED','RETURNED') NOT NULL DEFAULT 'PENDING',
  `updatedAt` datetime(3) NOT NULL,
  `usageNote` text DEFAULT NULL,
  `usedAt` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `transferitem`
--

INSERT INTO `transferitem` (`id`, `transferId`, `productId`, `quantity`, `createdAt`, `invoiceNumber`, `ixcClientCode`, `macAddress`, `productInstanceId`, `returnedAt`, `serialNumber`, `status`, `updatedAt`, `usageNote`, `usedAt`) VALUES
(10, 3, 30, 1.0000, '2025-11-17 21:56:18.393', NULL, NULL, 'AB23', 122, NULL, 'XC3455555', 'IN_HANDS', '0000-00-00 00:00:00.000', NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `user`
--

CREATE TABLE `user` (
  `id` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `passwordHash` varchar(191) NOT NULL,
  `name` varchar(191) DEFAULT NULL,
  `roleId` int(11) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `user`
--

INSERT INTO `user` (`id`, `email`, `passwordHash`, `name`, `roleId`, `isActive`, `createdAt`, `updatedAt`) VALUES
('cldefault001', 'admin@netinfi.com', '$argon2id$v=19$m=65536,t=3,p=4$brNd2LXXrw53Hn2ZhDTZoQ$irVI21iw3BHyhFMgz5qeeZTHyH9rDNXxN++aRFUVJjo', 'Administrador do Sistema', 1, 1, '2025-11-15 21:13:14.000', '2025-11-15 21:13:14.000');

-- --------------------------------------------------------

--
-- Estrutura para tabela `warehouse`
--

CREATE TABLE `warehouse` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `code` varchar(191) NOT NULL,
  `type` enum('MAIN','TECHNICIAN') NOT NULL DEFAULT 'MAIN',
  `technicianId` int(11) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `warehouse`
--

INSERT INTO `warehouse` (`id`, `name`, `code`, `type`, `technicianId`, `createdAt`) VALUES
(1, 'Almoxarifado Principal', 'MAIN-001', 'MAIN', NULL, '2025-11-15 21:13:15.000'),
(2, 'Almoxarifado - Jonas Silva', 'TECH-1', 'TECHNICIAN', 1, '2025-11-15 21:13:15.000'),
(3, 'Almoxarifado - Joanderson Santos', 'TECH-2', 'TECHNICIAN', 2, '2025-11-15 21:13:15.000');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `location`
--
ALTER TABLE `location`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Location_code_key` (`code`),
  ADD KEY `Location_warehouseId_fkey` (`warehouseId`);

--
-- Índices de tabela `permission`
--
ALTER TABLE `permission`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Permission_code_key` (`code`);

--
-- Índices de tabela `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Product_sku_key` (`sku`);

--
-- Índices de tabela `productinstance`
--
ALTER TABLE `productinstance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ProductInstance_productId_idx` (`productId`),
  ADD KEY `ProductInstance_serialNumber_idx` (`serialNumber`),
  ADD KEY `ProductInstance_macAddress_idx` (`macAddress`),
  ADD KEY `ProductInstance_status_idx` (`status`),
  ADD KEY `ProductInstance_awaitingReplacement_idx` (`awaitingReplacement`);

--
-- Índices de tabela `productusage`
--
ALTER TABLE `productusage`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ProductUsage_technicianId_fkey` (`technicianId`),
  ADD KEY `ProductUsage_productId_fkey` (`productId`);

--
-- Índices de tabela `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Role_name_key` (`name`);

--
-- Índices de tabela `rolepermission`
--
ALTER TABLE `rolepermission`
  ADD PRIMARY KEY (`roleId`,`permissionId`),
  ADD KEY `RolePermission_permissionId_fkey` (`permissionId`);

--
-- Índices de tabela `stockmovement`
--
ALTER TABLE `stockmovement`
  ADD PRIMARY KEY (`id`),
  ADD KEY `StockMovement_productId_fkey` (`productId`),
  ADD KEY `StockMovement_locationId_fkey` (`locationId`),
  ADD KEY `StockMovement_technicianId_fkey` (`technicianId`);

--
-- Índices de tabela `technician`
--
ALTER TABLE `technician`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `transfer`
--
ALTER TABLE `transfer`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Transfer_number_key` (`number`),
  ADD KEY `Transfer_fromWarehouseId_fkey` (`fromWarehouseId`),
  ADD KEY `Transfer_toWarehouseId_fkey` (`toWarehouseId`),
  ADD KEY `Transfer_technicianId_fkey` (`technicianId`);

--
-- Índices de tabela `transferitem`
--
ALTER TABLE `transferitem`
  ADD PRIMARY KEY (`id`),
  ADD KEY `TransferItem_transferId_fkey` (`transferId`),
  ADD KEY `TransferItem_productId_fkey` (`productId`);

--
-- Índices de tabela `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_email_key` (`email`),
  ADD KEY `User_roleId_fkey` (`roleId`);

--
-- Índices de tabela `warehouse`
--
ALTER TABLE `warehouse`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Warehouse_code_key` (`code`),
  ADD UNIQUE KEY `Warehouse_technicianId_key` (`technicianId`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `location`
--
ALTER TABLE `location`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `permission`
--
ALTER TABLE `permission`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de tabela `product`
--
ALTER TABLE `product`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT de tabela `productinstance`
--
ALTER TABLE `productinstance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=123;

--
-- AUTO_INCREMENT de tabela `productusage`
--
ALTER TABLE `productusage`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de tabela `role`
--
ALTER TABLE `role`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `stockmovement`
--
ALTER TABLE `stockmovement`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=65;

--
-- AUTO_INCREMENT de tabela `technician`
--
ALTER TABLE `technician`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `transfer`
--
ALTER TABLE `transfer`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `transferitem`
--
ALTER TABLE `transferitem`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de tabela `warehouse`
--
ALTER TABLE `warehouse`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `location`
--
ALTER TABLE `location`
  ADD CONSTRAINT `Location_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `warehouse` (`id`) ON UPDATE CASCADE;

--
-- Restrições para tabelas `productinstance`
--
ALTER TABLE `productinstance`
  ADD CONSTRAINT `ProductInstance_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON UPDATE CASCADE;

--
-- Restrições para tabelas `productusage`
--
ALTER TABLE `productusage`
  ADD CONSTRAINT `ProductUsage_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `ProductUsage_technicianId_fkey` FOREIGN KEY (`technicianId`) REFERENCES `technician` (`id`) ON UPDATE CASCADE;

--
-- Restrições para tabelas `rolepermission`
--
ALTER TABLE `rolepermission`
  ADD CONSTRAINT `RolePermission_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `permission` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `RolePermission_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `role` (`id`) ON UPDATE CASCADE;

--
-- Restrições para tabelas `stockmovement`
--
ALTER TABLE `stockmovement`
  ADD CONSTRAINT `StockMovement_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `StockMovement_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `StockMovement_technicianId_fkey` FOREIGN KEY (`technicianId`) REFERENCES `technician` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Restrições para tabelas `transfer`
--
ALTER TABLE `transfer`
  ADD CONSTRAINT `Transfer_fromWarehouseId_fkey` FOREIGN KEY (`fromWarehouseId`) REFERENCES `warehouse` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Transfer_technicianId_fkey` FOREIGN KEY (`technicianId`) REFERENCES `technician` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Transfer_toWarehouseId_fkey` FOREIGN KEY (`toWarehouseId`) REFERENCES `warehouse` (`id`) ON UPDATE CASCADE;

--
-- Restrições para tabelas `transferitem`
--
ALTER TABLE `transferitem`
  ADD CONSTRAINT `TransferItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `TransferItem_transferId_fkey` FOREIGN KEY (`transferId`) REFERENCES `transfer` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `User_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `role` (`id`) ON UPDATE CASCADE;

--
-- Restrições para tabelas `warehouse`
--
ALTER TABLE `warehouse`
  ADD CONSTRAINT `Warehouse_technicianId_fkey` FOREIGN KEY (`technicianId`) REFERENCES `technician` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
