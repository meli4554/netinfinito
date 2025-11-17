# Changelog - Sistema de Visualização de NF nas Unidades

**Data:** 16/11/2025
**Versão:** 1.1.0

## 📋 Resumo das Alterações

Implementado sistema completo de rastreamento e visualização de informações da Nota Fiscal (NF) em cada unidade de produto. Agora é possível identificar facilmente de qual NF cada produto veio, visualizar todos os detalhes da entrada e agrupar produtos por nota fiscal.

---

## ✨ Novas Funcionalidades

### 1. **Badge com Número da NF na Listagem**
- Cada unidade agora exibe um badge visual com o número da NF de entrada
- Badge aparece ao lado do nome do produto na lista de unidades
- Facilita identificação rápida de qual NF originou cada produto

### 2. **Botão "Ver Detalhes"**
- Novo botão azul em cada unidade para visualizar informações completas
- Abre modal detalhado com todas as informações da unidade e da NF

### 3. **Modal de Detalhes Completo**
Exibe informações organizadas em seções:

#### Identificação
- Serial Number
- MAC Address

#### Nota Fiscal de Entrada
- Número da NF
- Data da NF
- Data de Recebimento
- Link para download do PDF da NF (se disponível)
- Observações da entrada

#### Inutilização (se aplicável)
- Data/hora da inutilização
- Motivo da inutilização

#### Informações de Sistema
- Data de criação
- Data de última atualização

---

## 🔧 Alterações Técnicas

### Banco de Dados

#### Novos Campos em `ProductInstance`
```sql
- invoiceFile (VARCHAR 191)    -- Caminho do PDF da NF
- receivedAt (DATETIME)        -- Data de recebimento
- note (TEXT)                  -- Observações da entrada
```

### Backend (NestJS)

#### `stock-movements.service.ts`
- Modificado para copiar automaticamente os dados completos da NF para cada ProductInstance
- Agora vincula: invoiceNumber, invoiceDate, invoiceFile, receivedAt e note

### Frontend (JavaScript)

#### Novas Funções
- `viewUnitDetails(unitId)` - Abre modal com detalhes completos
- `hideUnitDetailsModal()` - Fecha modal de detalhes

#### Componentes Modificados
- `renderUnits()` - Agora exibe badge da NF e botão "Ver Detalhes"
- Layout reorganizado para melhor visualização dos botões

---

## 📁 Arquivos Modificados

### Schema e Banco de Dados
- ✅ `prisma/schema.prisma` - Adicionados campos invoiceFile, receivedAt, note
- ✅ `database.sql` - Atualizada definição da tabela ProductInstance

### Backend
- ✅ `src/stock-movements/stock-movements.service.ts` - Copia dados completos da NF

### Frontend
- ✅ `public/pages/products.html` - Modal de detalhes e renderização atualizada

### Migração
- ✅ `migration_add_invoice_details.sql` - Script SQL para atualizar banco existente

---

## 🚀 Como Usar

### Para Cadastrar Produtos com NF

1. Cadastre o produto normalmente
2. Clique em "Editar" no produto
3. Na seção "Adicionar Estoque":
   - Preencha o número da NF (obrigatório)
   - Informe a data da NF (obrigatório)
   - Opcionalmente: anexe o PDF, data de recebimento e observações
4. Salve

### Para Visualizar Detalhes da NF

1. Acesse "Ver Unidades" do produto
2. Cada unidade mostrará um badge com "NF XXXXX"
3. Clique no botão azul "Ver Detalhes"
4. Visualize todas as informações da entrada

### Para Identificar Produtos por NF

- Na lista de unidades, procure pelo badge azul com o número da NF
- Produtos da mesma NF terão o mesmo número no badge
- Use o botão "Ver Detalhes" para confirmar data e outras informações

---

## 🎯 Benefícios

1. **Rastreabilidade Completa**
   - Saiba exatamente de qual NF cada produto veio
   - Acesso rápido ao PDF da nota fiscal
   - Histórico completo de recebimento

2. **Organização Melhorada**
   - Não mistura produtos de diferentes NFs
   - Facilita gestão de garantias
   - Simplifica processos de troca

3. **Informações Centralizadas**
   - Todos os dados da NF em um só lugar
   - Não precisa buscar em múltiplos locais
   - Interface intuitiva e visual

4. **Auditoria e Controle**
   - Histórico completo de movimentações
   - Observações documentadas
   - Datas precisas de entrada e recebimento

---

## 📊 Exemplo Visual

### Antes
```
[☑] ROTEADOR GREATEK AX 1500 #1
Serial: não cadastrado | MAC: não cadastrado
[Inutilizar] [Deletar]
```

### Depois
```
[☑] ROTEADOR GREATEK AX 1500 #1 [📄 NF 12345]
Serial: ABC123 | MAC: AA:BB:CC:DD:EE:FF
[Ver Detalhes] [Inutilizar] [Deletar]
```

---

## ⚠️ Notas Importantes

1. **Compatibilidade**
   - Unidades antigas sem NF não exibirão o badge
   - Novas entradas automaticamente terão todos os dados vinculados

2. **Requisitos**
   - Número da NF e Data da NF são obrigatórios para entrada de estoque
   - PDF, data de recebimento e observações são opcionais

3. **Performance**
   - Todas as informações são carregadas de uma vez
   - Não há queries adicionais ao abrir detalhes

---

## 🔄 Próximos Passos Sugeridos

- [ ] Adicionar filtro por NF na listagem de unidades
- [ ] Relatório de produtos agrupados por NF
- [ ] Exportação de dados em Excel/PDF
- [ ] Notificações de vencimento de garantia por NF

---

**Desenvolvido por:** Claude Code
**Solicitado por:** Usuário NetInfi
**Status:** ✅ Implementado e Testado
