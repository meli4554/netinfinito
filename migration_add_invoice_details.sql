-- =====================================================
-- MIGRAÇÃO: Adicionar campos de NF nas ProductInstances
-- Data: 2025-11-16
-- Descrição: Adiciona campos invoiceFile, receivedAt e note
--            para armazenar informações completas da NF em cada unidade
-- =====================================================

USE netinfi;

-- Adicionar coluna invoiceFile (caminho do PDF da NF)
ALTER TABLE `ProductInstance`
ADD COLUMN `invoiceFile` VARCHAR(191) NULL AFTER `invoiceDate`;

-- Adicionar coluna receivedAt (data de recebimento)
ALTER TABLE `ProductInstance`
ADD COLUMN `receivedAt` DATETIME(3) NULL AFTER `invoiceFile`;

-- Adicionar coluna note (observações da entrada)
ALTER TABLE `ProductInstance`
ADD COLUMN `note` TEXT NULL AFTER `receivedAt`;

-- Verificar se as colunas foram adicionadas corretamente
SELECT
  COLUMN_NAME,
  DATA_TYPE,
  IS_NULLABLE,
  COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'netinfi'
  AND TABLE_NAME = 'ProductInstance'
  AND COLUMN_NAME IN ('invoiceFile', 'receivedAt', 'note')
ORDER BY ORDINAL_POSITION;

-- =====================================================
-- OBSERVAÇÕES
-- =====================================================
--
-- Após executar esta migração:
-- 1. Os novos campos estarão disponíveis nas ProductInstances
-- 2. Novas entradas de estoque copiarão automaticamente:
--    - invoiceFile (caminho do PDF)
--    - receivedAt (data de recebimento)
--    - note (observações)
-- 3. A interface exibirá o número da NF em cada unidade
-- 4. O botão "Ver Detalhes" mostrará todas as informações
--
-- =====================================================
