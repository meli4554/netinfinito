-- =====================================================
-- SCRIPT: Atualizar unidades existentes com dados da NF
-- =====================================================
--
-- ATENÇÃO: Este script é um EXEMPLO de como vincular NF
-- às unidades existentes. Você precisa ajustar os valores
-- para corresponder às suas NFs reais.
--
-- =====================================================

USE netinfi;

-- EXEMPLO 1: Atualizar todas as unidades de um produto específico
-- com os dados de uma NF específica
--
-- Substitua:
-- - 1 pelo ID do produto
-- - '12345' pelo número da NF
-- - '2025-11-16' pela data da NF
-- - '2025-11-17' pela data de recebimento

UPDATE ProductInstance
SET
  invoiceNumber = '12345',
  invoiceDate = '2025-11-16 10:00:00',
  receivedAt = '2025-11-17 14:30:00',
  note = 'Entrada da NF 12345 - 12 roteadores Greatek AX 1500'
WHERE productId = 1
  AND invoiceNumber IS NULL;  -- Apenas as que não têm NF

-- =====================================================

-- EXEMPLO 2: Atualizar unidades específicas por ID
-- (se você souber os IDs exatos das unidades)

UPDATE ProductInstance
SET
  invoiceNumber = '67890',
  invoiceDate = '2025-11-10 08:00:00',
  receivedAt = '2025-11-11 09:00:00',
  note = 'Segunda entrada - NF 67890'
WHERE id IN (1, 2, 3, 4, 5);  -- IDs das unidades

-- =====================================================

-- EXEMPLO 3: Buscar informações das suas unidades atuais
-- para saber quais precisam ser atualizadas

SELECT
  pi.id,
  pi.productId,
  p.name AS productName,
  pi.serialNumber,
  pi.macAddress,
  pi.invoiceNumber,
  pi.invoiceDate,
  pi.status,
  pi.createdAt
FROM ProductInstance pi
JOIN Product p ON p.id = pi.productId
WHERE pi.invoiceNumber IS NULL  -- Unidades sem NF
ORDER BY pi.productId, pi.id;

-- =====================================================

-- EXEMPLO 4: Contar quantas unidades estão sem NF por produto

SELECT
  p.name AS productName,
  COUNT(*) AS unidades_sem_nf
FROM ProductInstance pi
JOIN Product p ON p.id = pi.productId
WHERE pi.invoiceNumber IS NULL
GROUP BY p.id, p.name
ORDER BY COUNT(*) DESC;

-- =====================================================
-- INSTRUÇÕES DE USO:
-- =====================================================
--
-- 1. Execute o EXEMPLO 3 para ver suas unidades sem NF
-- 2. Execute o EXEMPLO 4 para ver quantas unidades existem
-- 3. Escolha entre EXEMPLO 1 ou EXEMPLO 2 e ajuste os valores
-- 4. Execute o UPDATE escolhido
-- 5. Recarregue a página no navegador
-- 6. Agora as unidades mostrarão a NF!
--
-- =====================================================
