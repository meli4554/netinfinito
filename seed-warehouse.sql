-- ============================================
-- SCRIPT DE DADOS INICIAIS - SISTEMA DE ALMOXARIFADO
-- NetInFi - Gestão de Estoque para Técnicos
-- ============================================

-- Limpar dados antigos (se necessário)
SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM ProductUsage;
DELETE FROM TransferItem;
DELETE FROM Transfer;
DELETE FROM StockMovement;
DELETE FROM Location;
DELETE FROM Warehouse;
DELETE FROM Technician;
DELETE FROM Product;

-- Resetar auto increment
ALTER TABLE ProductUsage AUTO_INCREMENT = 1;
ALTER TABLE TransferItem AUTO_INCREMENT = 1;
ALTER TABLE Transfer AUTO_INCREMENT = 1;
ALTER TABLE StockMovement AUTO_INCREMENT = 1;
ALTER TABLE Location AUTO_INCREMENT = 1;
ALTER TABLE Warehouse AUTO_INCREMENT = 1;
ALTER TABLE Technician AUTO_INCREMENT = 1;
ALTER TABLE Product AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- PRODUTOS
-- ============================================

INSERT INTO Product (sku, name, unit, barCode, minStock, createdAt, updatedAt) VALUES
('ROUTER-TP-AC1200', 'Roteador TP-Link AC1200', 'UN', '7898100172082', 10, NOW(), NOW()),
('ROUTER-MK-RB750', 'MikroTik RouterBoard RB750', 'UN', '4752224001184', 5, NOW(), NOW()),
('ONT-HUAWEI-HG8010', 'ONT Huawei HG8010H', 'UN', '6902524500001', 15, NOW(), NOW()),
('CABO-FIBRA-SM-1KM', 'Cabo de Fibra Óptica SM 1km', 'MT', '7891234567890', 1000, NOW(), NOW()),
('CONECTOR-SC-APC', 'Conector SC/APC', 'UN', '7899876543210', 50, NOW(), NOW()),
('CONECTOR-LC-UPC', 'Conector LC/UPC', 'UN', '7899876543227', 50, NOW(), NOW()),
('PATCH-CORD-SC-2M', 'Patch Cord SC/APC 2m', 'UN', '7891122334455', 30, NOW(), NOW()),
('SPLITTER-1X8', 'Splitter Óptico 1x8', 'UN', '7891234000001', 20, NOW(), NOW()),
('CAIXA-TERM-OPTICA-8F', 'Caixa de Terminação Óptica 8F', 'UN', '7899988776655', 10, NOW(), NOW()),
('CABO-UTP-CAT6-305M', 'Cabo UTP Cat6 305m', 'ROLO', '7891234888889', 20, NOW(), NOW()),
('CONECTOR-RJ45-CAT6', 'Conector RJ45 Cat6', 'UN', '7899999888877', 100, NOW(), NOW()),
('ANTENA-5GHZ-30DBI', 'Antena Setorial 5GHz 30dBi', 'UN', '7891122999988', 8, NOW(), NOW()),
('RADIO-UBNT-LITEBEAM', 'Ubiquiti LiteBeam AC Gen2', 'UN', '0817882024891', 12, NOW(), NOW()),
('POE-24V-1A', 'Fonte PoE 24V 1A', 'UN', '7899123456789', 25, NOW(), NOW()),
('ABRAÇADEIRA-NYLON-200MM', 'Abraçadeira de Nylon 200mm', 'PCT', '7891234567123', 50, NOW(), NOW());

-- ============================================
-- TÉCNICOS
-- ============================================

INSERT INTO Technician (name, category, phone, email, isActive, createdAt, updatedAt) VALUES
('Jonas Silva', 'FIBRA', '(11) 98765-4321', 'jonas.silva@netinfi.com', 1, NOW(), NOW()),
('Joanderson Santos', 'RADIO', '(11) 98765-4322', 'joanderson.santos@netinfi.com', 1, NOW(), NOW()),
('Carlos Eduardo', 'FIBRA', '(11) 98765-4323', 'carlos.eduardo@netinfi.com', 1, NOW(), NOW()),
('Rafael Oliveira', 'INSTALACAO', '(11) 98765-4324', 'rafael.oliveira@netinfi.com', 1, NOW(), NOW()),
('Fernando Costa', 'MANUTENCAO', '(11) 98765-4325', 'fernando.costa@netinfi.com', 1, NOW(), NOW()),
('André Souza', 'RADIO', '(11) 98765-4326', 'andre.souza@netinfi.com', 1, NOW(), NOW());

-- ============================================
-- ALMOXARIFADOS
-- ============================================

-- Almoxarifado Principal
INSERT INTO Warehouse (name, code, type, technicianId, createdAt) VALUES
('Almoxarifado Principal', 'MAIN-001', 'MAIN', NULL, NOW());

-- Almoxarifados dos Técnicos (criados automaticamente pelo código, mas incluindo aqui para referência)
INSERT INTO Warehouse (name, code, type, technicianId, createdAt) VALUES
('Almoxarifado - Jonas Silva', 'TECH-1', 'TECHNICIAN', 1, NOW()),
('Almoxarifado - Joanderson Santos', 'TECH-2', 'TECHNICIAN', 2, NOW()),
('Almoxarifado - Carlos Eduardo', 'TECH-3', 'TECHNICIAN', 3, NOW()),
('Almoxarifado - Rafael Oliveira', 'TECH-4', 'TECHNICIAN', 4, NOW()),
('Almoxarifado - Fernando Costa', 'TECH-5', 'TECHNICIAN', 5, NOW()),
('Almoxarifado - André Souza', 'TECH-6', 'TECHNICIAN', 6, NOW());

-- ============================================
-- LOCALIZAÇÕES (Almoxarifado Principal)
-- ============================================

INSERT INTO Location (warehouseId, code, description) VALUES
(1, 'MAIN-A01', 'Corredor A - Prateleira 01 - Roteadores'),
(1, 'MAIN-A02', 'Corredor A - Prateleira 02 - ONTs'),
(1, 'MAIN-B01', 'Corredor B - Prateleira 01 - Cabos de Fibra'),
(1, 'MAIN-B02', 'Corredor B - Prateleira 02 - Conectores'),
(1, 'MAIN-C01', 'Corredor C - Prateleira 01 - Antenas e Rádios'),
(1, 'MAIN-C02', 'Corredor C - Prateleira 02 - Acessórios');

-- ============================================
-- ESTOQUE INICIAL (Almoxarifado Principal)
-- ============================================

-- Entrada de produtos no almoxarifado principal
INSERT INTO StockMovement (productId, type, quantity, locationId, technicianId, referenceType, referenceId, occurredAt, note) VALUES
-- Roteadores e ONTs
(1, 'IN', 50, 1, NULL, 'ENTRY', 1, NOW(), 'Estoque inicial - Roteador TP-Link AC1200'),
(2, 'IN', 30, 1, NULL, 'ENTRY', 2, NOW(), 'Estoque inicial - MikroTik RB750'),
(3, 'IN', 80, 2, NULL, 'ENTRY', 3, NOW(), 'Estoque inicial - ONT Huawei HG8010'),
-- Cabos e conectores de fibra
(4, 'IN', 5000, 3, NULL, 'ENTRY', 4, NOW(), 'Estoque inicial - Cabo Fibra SM'),
(5, 'IN', 200, 4, NULL, 'ENTRY', 5, NOW(), 'Estoque inicial - Conector SC/APC'),
(6, 'IN', 200, 4, NULL, 'ENTRY', 6, NOW(), 'Estoque inicial - Conector LC/UPC'),
(7, 'IN', 150, 4, NULL, 'ENTRY', 7, NOW(), 'Estoque inicial - Patch Cord SC'),
(8, 'IN', 100, 4, NULL, 'ENTRY', 8, NOW(), 'Estoque inicial - Splitter 1x8'),
(9, 'IN', 60, 4, NULL, 'ENTRY', 9, NOW(), 'Estoque inicial - Caixa Terminação'),
-- Rede e rádios
(10, 'IN', 40, 5, NULL, 'ENTRY', 10, NOW(), 'Estoque inicial - Cabo UTP Cat6'),
(11, 'IN', 500, 6, NULL, 'ENTRY', 11, NOW(), 'Estoque inicial - Conector RJ45'),
(12, 'IN', 25, 5, NULL, 'ENTRY', 12, NOW(), 'Estoque inicial - Antena 5GHz'),
(13, 'IN', 40, 5, NULL, 'ENTRY', 13, NOW(), 'Estoque inicial - Ubiquiti LiteBeam'),
(14, 'IN', 100, 6, NULL, 'ENTRY', 14, NOW(), 'Estoque inicial - Fonte PoE'),
(15, 'IN', 200, 6, NULL, 'ENTRY', 15, NOW(), 'Estoque inicial - Abraçadeiras');

-- ============================================
-- EXEMPLO DE TRANSFERÊNCIAS
-- ============================================

-- Transferência para Jonas Silva (Técnico de Fibra)
INSERT INTO Transfer (number, fromWarehouseId, toWarehouseId, technicianId, status, transferredAt, receivedAt, createdBy, note, createdAt, updatedAt) VALUES
('TRF-000001', 1, 2, 1, 'RECEIVED', DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY), 'admin@netinfi.com', 'Transferência inicial para Jonas - Instalações de fibra', DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY));

INSERT INTO TransferItem (transferId, productId, quantity) VALUES
(1, 3, 10),  -- 10 ONTs
(1, 4, 500), -- 500m de cabo fibra
(1, 5, 20),  -- 20 conectores SC/APC
(1, 7, 10),  -- 10 patch cords
(1, 9, 3);   -- 3 caixas de terminação

-- Movimentos de estoque da transferência (saída do principal, entrada no técnico)
INSERT INTO StockMovement (productId, type, quantity, locationId, technicianId, referenceType, referenceId, occurredAt, note) VALUES
-- Saídas do almoxarifado principal
(3, 'OUT', 10, 2, NULL, 'TRANSFER', 1, DATE_SUB(NOW(), INTERVAL 15 DAY), 'Transferência TRF-000001 para técnico'),
(4, 'OUT', 500, 3, NULL, 'TRANSFER', 1, DATE_SUB(NOW(), INTERVAL 15 DAY), 'Transferência TRF-000001 para técnico'),
(5, 'OUT', 20, 4, NULL, 'TRANSFER', 1, DATE_SUB(NOW(), INTERVAL 15 DAY), 'Transferência TRF-000001 para técnico'),
(7, 'OUT', 10, 4, NULL, 'TRANSFER', 1, DATE_SUB(NOW(), INTERVAL 15 DAY), 'Transferência TRF-000001 para técnico'),
(9, 'OUT', 3, 4, NULL, 'TRANSFER', 1, DATE_SUB(NOW(), INTERVAL 15 DAY), 'Transferência TRF-000001 para técnico'),
-- Entradas no almoxarifado do técnico
(3, 'TRANSFER', 10, NULL, 1, 'TRANSFER', 1, DATE_SUB(NOW(), INTERVAL 15 DAY), 'Transferência TRF-000001 recebida'),
(4, 'TRANSFER', 500, NULL, 1, 'TRANSFER', 1, DATE_SUB(NOW(), INTERVAL 15 DAY), 'Transferência TRF-000001 recebida'),
(5, 'TRANSFER', 20, NULL, 1, 'TRANSFER', 1, DATE_SUB(NOW(), INTERVAL 15 DAY), 'Transferência TRF-000001 recebida'),
(7, 'TRANSFER', 10, NULL, 1, 'TRANSFER', 1, DATE_SUB(NOW(), INTERVAL 15 DAY), 'Transferência TRF-000001 recebida'),
(9, 'TRANSFER', 3, NULL, 1, 'TRANSFER', 1, DATE_SUB(NOW(), INTERVAL 15 DAY), 'Transferência TRF-000001 recebida');

-- Transferência para Joanderson Santos (Técnico de Rádio)
INSERT INTO Transfer (number, fromWarehouseId, toWarehouseId, technicianId, status, transferredAt, receivedAt, createdBy, note, createdAt, updatedAt) VALUES
('TRF-000002', 1, 3, 2, 'RECEIVED', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY), 'admin@netinfi.com', 'Transferência inicial para Joanderson - Instalações de rádio', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY));

INSERT INTO TransferItem (transferId, productId, quantity) VALUES
(2, 12, 5),  -- 5 antenas
(2, 13, 8),  -- 8 rádios Ubiquiti
(2, 14, 10), -- 10 fontes PoE
(2, 15, 20); -- 20 pacotes de abraçadeiras

INSERT INTO StockMovement (productId, type, quantity, locationId, technicianId, referenceType, referenceId, occurredAt, note) VALUES
-- Saídas
(12, 'OUT', 5, 5, NULL, 'TRANSFER', 2, DATE_SUB(NOW(), INTERVAL 10 DAY), 'Transferência TRF-000002 para técnico'),
(13, 'OUT', 8, 5, NULL, 'TRANSFER', 2, DATE_SUB(NOW(), INTERVAL 10 DAY), 'Transferência TRF-000002 para técnico'),
(14, 'OUT', 10, 6, NULL, 'TRANSFER', 2, DATE_SUB(NOW(), INTERVAL 10 DAY), 'Transferência TRF-000002 para técnico'),
(15, 'OUT', 20, 6, NULL, 'TRANSFER', 2, DATE_SUB(NOW(), INTERVAL 10 DAY), 'Transferência TRF-000002 para técnico'),
-- Entradas
(12, 'TRANSFER', 5, NULL, 2, 'TRANSFER', 2, DATE_SUB(NOW(), INTERVAL 10 DAY), 'Transferência TRF-000002 recebida'),
(13, 'TRANSFER', 8, NULL, 2, 'TRANSFER', 2, DATE_SUB(NOW(), INTERVAL 10 DAY), 'Transferência TRF-000002 recebida'),
(14, 'TRANSFER', 10, NULL, 2, 'TRANSFER', 2, DATE_SUB(NOW(), INTERVAL 10 DAY), 'Transferência TRF-000002 recebida'),
(15, 'TRANSFER', 20, NULL, 2, 'TRANSFER', 2, DATE_SUB(NOW(), INTERVAL 10 DAY), 'Transferência TRF-000002 recebida');

-- ============================================
-- EXEMPLOS DE USO DE PRODUTOS
-- ============================================

-- Usos por Jonas Silva (Fibra)
INSERT INTO ProductUsage (technicianId, productId, quantity, usedAt, note, serviceOrder, clientName) VALUES
(1, 3, 2, DATE_SUB(NOW(), INTERVAL 12 DAY), 'Instalação de fibra residencial', 'OS-2024-001', 'João da Silva'),
(1, 4, 80, DATE_SUB(NOW(), INTERVAL 12 DAY), 'Instalação de fibra residencial', 'OS-2024-001', 'João da Silva'),
(1, 5, 2, DATE_SUB(NOW(), INTERVAL 12 DAY), 'Instalação de fibra residencial', 'OS-2024-001', 'João da Silva'),
(1, 7, 2, DATE_SUB(NOW(), INTERVAL 12 DAY), 'Instalação de fibra residencial', 'OS-2024-001', 'João da Silva'),
(1, 3, 1, DATE_SUB(NOW(), INTERVAL 8 DAY), 'Instalação empresarial', 'OS-2024-015', 'Empresa ABC Ltda'),
(1, 4, 120, DATE_SUB(NOW(), INTERVAL 8 DAY), 'Instalação empresarial', 'OS-2024-015', 'Empresa ABC Ltda'),
(1, 5, 4, DATE_SUB(NOW(), INTERVAL 8 DAY), 'Instalação empresarial', 'OS-2024-015', 'Empresa ABC Ltda'),
(1, 9, 1, DATE_SUB(NOW(), INTERVAL 8 DAY), 'Instalação empresarial', 'OS-2024-015', 'Empresa ABC Ltda');

-- Usos por Joanderson Santos (Rádio)
INSERT INTO ProductUsage (technicianId, productId, quantity, usedAt, note, serviceOrder, clientName) VALUES
(2, 13, 2, DATE_SUB(NOW(), INTERVAL 9 DAY), 'Instalação de link ponto a ponto', 'OS-2024-008', 'Fazenda Santa Rita'),
(2, 14, 2, DATE_SUB(NOW(), INTERVAL 9 DAY), 'Instalação de link ponto a ponto', 'OS-2024-008', 'Fazenda Santa Rita'),
(2, 15, 4, DATE_SUB(NOW(), INTERVAL 9 DAY), 'Instalação de link ponto a ponto', 'OS-2024-008', 'Fazenda Santa Rita'),
(2, 12, 1, DATE_SUB(NOW(), INTERVAL 5 DAY), 'Expansão de cobertura', 'OS-2024-022', 'Condomínio Residencial'),
(2, 14, 1, DATE_SUB(NOW(), INTERVAL 5 DAY), 'Expansão de cobertura', 'OS-2024-022', 'Condomínio Residencial'),
(2, 15, 5, DATE_SUB(NOW(), INTERVAL 5 DAY), 'Expansão de cobertura', 'OS-2024-022', 'Condomínio Residencial');

-- Movimentos de estoque dos usos (saídas)
INSERT INTO StockMovement (productId, type, quantity, locationId, technicianId, referenceType, referenceId, occurredAt, note) VALUES
-- Usos do Jonas
(3, 'OUT', 2, NULL, 1, 'USAGE', 1, DATE_SUB(NOW(), INTERVAL 12 DAY), 'Uso registrado - João da Silva'),
(4, 'OUT', 80, NULL, 1, 'USAGE', 2, DATE_SUB(NOW(), INTERVAL 12 DAY), 'Uso registrado - João da Silva'),
(5, 'OUT', 2, NULL, 1, 'USAGE', 3, DATE_SUB(NOW(), INTERVAL 12 DAY), 'Uso registrado - João da Silva'),
(7, 'OUT', 2, NULL, 1, 'USAGE', 4, DATE_SUB(NOW(), INTERVAL 12 DAY), 'Uso registrado - João da Silva'),
(3, 'OUT', 1, NULL, 1, 'USAGE', 5, DATE_SUB(NOW(), INTERVAL 8 DAY), 'Uso registrado - Empresa ABC Ltda'),
(4, 'OUT', 120, NULL, 1, 'USAGE', 6, DATE_SUB(NOW(), INTERVAL 8 DAY), 'Uso registrado - Empresa ABC Ltda'),
(5, 'OUT', 4, NULL, 1, 'USAGE', 7, DATE_SUB(NOW(), INTERVAL 8 DAY), 'Uso registrado - Empresa ABC Ltda'),
(9, 'OUT', 1, NULL, 1, 'USAGE', 8, DATE_SUB(NOW(), INTERVAL 8 DAY), 'Uso registrado - Empresa ABC Ltda'),
-- Usos do Joanderson
(13, 'OUT', 2, NULL, 2, 'USAGE', 9, DATE_SUB(NOW(), INTERVAL 9 DAY), 'Uso registrado - Fazenda Santa Rita'),
(14, 'OUT', 2, NULL, 2, 'USAGE', 10, DATE_SUB(NOW(), INTERVAL 9 DAY), 'Uso registrado - Fazenda Santa Rita'),
(15, 'OUT', 4, NULL, 2, 'USAGE', 11, DATE_SUB(NOW(), INTERVAL 9 DAY), 'Uso registrado - Fazenda Santa Rita'),
(12, 'OUT', 1, NULL, 2, 'USAGE', 12, DATE_SUB(NOW(), INTERVAL 5 DAY), 'Uso registrado - Condomínio Residencial'),
(14, 'OUT', 1, NULL, 2, 'USAGE', 13, DATE_SUB(NOW(), INTERVAL 5 DAY), 'Uso registrado - Condomínio Residencial'),
(15, 'OUT', 5, NULL, 2, 'USAGE', 14, DATE_SUB(NOW(), INTERVAL 5 DAY), 'Uso registrado - Condomínio Residencial');

-- ============================================
-- FIM DO SCRIPT
-- ============================================

SELECT 'Dados iniciais inseridos com sucesso!' AS Status;