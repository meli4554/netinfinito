# Sistema de Gestão de Almoxarifado - NetInFi

## Visão Geral

Sistema de controle de estoque focado em gerenciamento de almoxarifado principal e almoxarifados individuais de técnicos. Permite transferência de produtos, acompanhamento de uso mensal e geração de relatórios estatísticos.

## Características Principais

- **Cadastro de Produtos** - SKU, código de barras, unidade de medida
- **Gestão de Técnicos** - Cadastro com categorias (Fibra, Rádio, Instalação, Manutenção)
- **Almoxarifado Principal** - Estoque centralizado com localizações
- **Almoxarifados dos Técnicos** - Criados automaticamente ao cadastrar técnico
- **Transferências** - Envio de produtos do principal para técnicos
- **Registro de Uso** - Acompanhamento de consumo por técnico
- **Relatórios Mensais** - Uso por técnico, por produto, percentuais e estatísticas

## Instalação e Configuração

### 1. Banco de Dados já Aplicado

O schema do Prisma já foi aplicado ao banco de dados. Para popular com dados iniciais:

```bash
# No MySQL/phpMyAdmin, execute o arquivo:
C:\xampp\htdocs\netinfi\seed-warehouse.sql
```

### 2. Iniciar o Servidor

```bash
cd C:\xampp\htdocs\netinfi
npm run dev
```

Servidor rodará em: `http://localhost:3000`

## API Endpoints

### 🔐 Autenticação

```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@netinfi.com",
  "password": "Admin123!"
}
```

### 👥 Técnicos

#### Criar Técnico
```http
POST /technicians
Content-Type: application/json

{
  "name": "Jonas Silva",
  "category": "FIBRA",
  "phone": "(11) 98765-4321",
  "email": "jonas@netinfi.com"
}
```

**Categorias disponíveis:**
- `FIBRA` - Técnico de Fibra Óptica
- `RADIO` - Técnico de Rádio
- `INSTALACAO` - Técnico de Instalação
- `MANUTENCAO` - Técnico de Manutenção
- `OUTROS` - Outros

#### Listar Técnicos
```http
GET /technicians
```

#### Obter Técnico
```http
GET /technicians/:id
```

#### Atualizar Técnico
```http
PATCH /technicians/:id
Content-Type: application/json

{
  "name": "Jonas Silva Jr.",
  "category": "FIBRA",
  "isActive": true
}
```

#### Obter Estoque do Técnico
```http
GET /technicians/:id/stock
```

Retorna o resumo de estoque atual do almoxarifado do técnico.

### 📦 Produtos

#### Criar Produto
```http
POST /products
Content-Type: application/json

{
  "sku": "ROUTER-TP-001",
  "name": "Roteador TP-Link",
  "unit": "UN",
  "barCode": "7898100172082",
  "minStock": 10
}
```

#### Listar Produtos
```http
GET /products
```

#### Atualizar Produto
```http
PATCH /products/:id
Content-Type: application/json

{
  "name": "Roteador TP-Link AC1200",
  "minStock": 15
}
```

### 🔄 Transferências

#### Criar Transferência
```http
POST /transfers
Content-Type: application/json

{
  "fromWarehouseId": 1,
  "toWarehouseId": 2,
  "technicianId": 1,
  "createdBy": "admin@netinfi.com",
  "note": "Transferência para instalações",
  "items": [
    {
      "productId": 1,
      "quantity": 5
    },
    {
      "productId": 2,
      "quantity": 10
    }
  ]
}
```

**Status da transferência:**
- `PENDING` - Aguardando processamento
- `TRANSFERRED` - Transferida (cria movimentos de estoque)
- `RECEIVED` - Recebida pelo técnico
- `CANCELED` - Cancelada

#### Listar Transferências
```http
GET /transfers
```

#### Obter Transferência
```http
GET /transfers/:id
```

#### Atualizar Status
```http
PATCH /transfers/:id/status
Content-Type: application/json

{
  "status": "TRANSFERRED"
}
```

Quando o status é alterado para `TRANSFERRED`, o sistema automaticamente:
1. Cria movimento de saída no almoxarifado principal
2. Cria movimento de entrada no almoxarifado do técnico

#### Listar Transferências de um Técnico
```http
GET /transfers/technician/:technicianId
```

### 📊 Uso de Produtos

#### Registrar Uso
```http
POST /product-usage
Content-Type: application/json

{
  "technicianId": 1,
  "productId": 3,
  "quantity": 2,
  "note": "Instalação residencial",
  "serviceOrder": "OS-2024-001",
  "clientName": "João da Silva"
}
```

Ao registrar uso, o sistema automaticamente:
1. Cria registro de uso
2. Cria movimento de saída no almoxarifado do técnico

#### Listar Todos os Usos
```http
GET /product-usage
```

#### Listar Usos por Técnico
```http
GET /product-usage/technician/:technicianId
```

#### Listar Usos por Produto
```http
GET /product-usage/product/:productId
```

#### Listar Usos por Período
```http
GET /product-usage/period?start=2024-01-01&end=2024-01-31
```

### 📈 Relatórios

#### Uso Mensal por Técnico
```http
GET /reports/monthly-usage-by-technician?year=2024&month=11
```

Retorna resumo de uso agrupado por técnico com lista de produtos consumidos.

**Resposta:**
```json
[
  {
    "technicianId": 1,
    "technicianName": "Jonas Silva",
    "category": "FIBRA",
    "totalUsages": 8,
    "products": [
      {
        "productId": 3,
        "sku": "ONT-HUAWEI-HG8010",
        "name": "ONT Huawei HG8010H",
        "unit": "UN",
        "quantity": 3
      }
    ]
  }
]
```

#### Uso Mensal por Produto
```http
GET /reports/monthly-usage-by-product?year=2024&month=11
```

Retorna resumo de uso agrupado por produto com lista de técnicos que consumiram.

#### Percentual de Uso por Técnico
```http
GET /reports/usage-percentage?year=2024&month=11
```

Retorna percentual de uso de cada produto por técnico (quantos % cada técnico consumiu de cada produto).

**Resposta:**
```json
[
  {
    "technicianId": 1,
    "technicianName": "Jonas Silva",
    "category": "FIBRA",
    "products": [
      {
        "productId": 3,
        "sku": "ONT-HUAWEI-HG8010",
        "productName": "ONT Huawei HG8010H",
        "quantity": 3,
        "percentage": "60.00"
      }
    ]
  }
]
```

#### Resumo Geral de Estoque
```http
GET /reports/stock-summary
```

Retorna resumo completo de estoque:
- Estoque do almoxarifado principal
- Estoque de cada técnico

**Resposta:**
```json
{
  "mainWarehouse": [
    {
      "productId": 1,
      "sku": "ROUTER-TP-AC1200",
      "name": "Roteador TP-Link AC1200",
      "unit": "UN",
      "quantity": 50
    }
  ],
  "technicians": [
    {
      "technicianId": 1,
      "technicianName": "Jonas Silva",
      "productId": 3,
      "sku": "ONT-HUAWEI-HG8010",
      "name": "ONT Huawei HG8010H",
      "unit": "UN",
      "quantity": 7
    }
  ]
}
```

### 📦 Inventário

#### Resumo de Estoque
```http
GET /inventory/summary
```

Retorna resumo agregado de todos os produtos no sistema.

#### Movimentações de um Produto
```http
GET /inventory/movements/:productId
```

Retorna histórico de todas as movimentações de um produto específico.

## Fluxo de Trabalho

### 1. Cadastrar Técnicos
1. POST `/technicians` - Criar técnico
2. Sistema cria automaticamente almoxarifado do técnico

### 2. Cadastrar Produtos
1. POST `/products` - Criar produtos

### 3. Entrada de Estoque Principal
1. Atualmente feita via SQL ou migration
2. Cria movimentos tipo `IN` no almoxarifado principal

### 4. Transferir para Técnicos
1. POST `/transfers` - Criar transferência com itens
2. PATCH `/transfers/:id/status` - Marcar como `TRANSFERRED`
3. Sistema cria movimentos automáticos:
   - Saída do principal (OUT)
   - Entrada no técnico (TRANSFER)

### 5. Registrar Uso
1. POST `/product-usage` - Registrar uso com OS e cliente
2. Sistema cria movimento de saída (OUT) do estoque do técnico

### 6. Gerar Relatórios
1. GET `/reports/monthly-usage-by-technician` - Ver uso mensal
2. GET `/reports/usage-percentage` - Ver percentuais
3. GET `/reports/stock-summary` - Ver estoque atual

## Tipos de Movimento de Estoque

| Tipo | Descrição |
|------|-----------|
| `IN` | Entrada no almoxarifado principal |
| `OUT` | Saída (uso ou transferência) |
| `TRANSFER` | Entrada por transferência (técnico) |
| `ADJUST` | Ajuste de inventário |

## Tipos de Referência

| Tipo | Descrição |
|------|-----------|
| `ENTRY` | Entrada manual de estoque |
| `TRANSFER` | Movimento de transferência |
| `USAGE` | Uso de produto pelo técnico |
| `ADJUSTMENT` | Ajuste de inventário |

## Estrutura de Banco de Dados

### Tabelas Principais

- **Technician** - Cadastro de técnicos
- **Warehouse** - Almoxarifados (principal e dos técnicos)
- **Product** - Cadastro de produtos
- **Transfer** - Transferências entre almoxarifados
- **TransferItem** - Itens de cada transferência
- **ProductUsage** - Registro de uso pelos técnicos
- **StockMovement** - Histórico de todas as movimentações
- **Location** - Localizações dentro do almoxarifado principal

## Otimizações Implementadas

- Sistema leve e otimizado para PC fraco
- Queries eficientes com Prisma ORM
- Índices automáticos em chaves estrangeiras
- Agregações em memória para relatórios
- Sem dependências pesadas no frontend

## Dados de Teste

Execute o arquivo `seed-warehouse.sql` para popular com:
- 15 produtos de exemplo
- 6 técnicos (diferentes categorias)
- Almoxarifado principal + almoxarifados dos técnicos
- Estoque inicial
- 2 transferências de exemplo
- Vários registros de uso

## Próximos Passos

1. Desenvolver frontend para consumir a API
2. Implementar entrada manual de estoque no principal
3. Adicionar alertas de estoque mínimo
4. Criar dashboard com gráficos
5. Exportação de relatórios em Excel/PDF

---

**NetInFi** - Sistema de Gestão de Almoxarifado para Técnicos
Versão: 2.0 - Warehouse System