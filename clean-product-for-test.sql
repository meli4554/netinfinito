-- =====================================================
-- Script para limpar movimentações de um produto
-- Permite testar a exclusão de produtos
-- =====================================================

USE `netinfi`;

-- =====================================================
-- ATENÇÃO: Este script remove TODAS as movimentações
-- de um produto específico. Use apenas para testes!
-- =====================================================

-- Exemplo: Limpar produto ID 15 (Abraçadeira de Nylon)
-- Este produto tem menos dependências nos dados de exemplo

-- 1. Remover registros de uso do produto
DELETE FROM ProductUsage WHERE productId = 15;

-- 2. Remover itens de transferência
DELETE FROM TransferItem WHERE productId = 15;

-- 3. Remover movimentações de estoque
DELETE FROM StockMovement WHERE productId = 15;

-- 4. Remover instâncias do produto (serial/MAC)
DELETE FROM ProductInstance WHERE productId = 15;

-- Agora o produto ID 15 pode ser excluído!
-- Você pode testar a exclusão através da interface web

-- =====================================================
-- Para limpar outro produto, substitua o número 15
-- pelo ID do produto que deseja limpar
-- =====================================================

SELECT 'Produto ID 15 limpo e pronto para exclusão!' AS Status;
