# NetInfinito - Sistema de Almoxarifado

Sistema completo de gerenciamento de almoxarifado com controle de estoque, transferências, técnicos e relatórios.

## Tecnologias

- **Backend**: NestJS + TypeScript
- **Banco de Dados**: MySQL 8.0 (Aiven Cloud)
- **Deploy**: Vercel (Serverless)
- **Frontend**: HTML/CSS/JavaScript

## Desenvolvimento Local

### Pré-requisitos

- Node.js 18+
- Banco de dados MySQL configurado

### Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais

# Executar em modo desenvolvimento
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

### Credenciais Padrão

- **Email**: admin@netinfi.com
- **Senha**: Admin123!

## Deploy na Vercel

### Guia Completo

Consulte o guia detalhado: [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)

### Deploy Rápido

1. **Fork/Clone o repositório**

2. **Importe na Vercel**
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

3. **Configure as variáveis de ambiente na Vercel**:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `DB_SSL=true`
   - `JWT_SECRET`
   - `SESSION_SECRET`
   - `NODE_ENV=production`

4. **Deploy automático** em cada push para `master`

## Estrutura do Projeto

```
netinfinito/
├── api/
│   ├── index.ts          # Servidor local
│   └── serverless.ts     # Handler Vercel
├── src/
│   ├── auth/             # Autenticação
│   ├── users/            # Usuários
│   ├── products/         # Produtos
│   ├── warehouses/       # Almoxarifados
│   ├── technicians/      # Técnicos
│   ├── transfers/        # Transferências
│   └── database/         # Serviço de BD
├── public/               # Frontend estático
├── uploads/              # Arquivos enviados
└── vercel.json          # Config Vercel
```

## Funcionalidades

### Gestão de Estoque
- ✅ Cadastro de produtos
- ✅ Controle de instâncias (seriais/MACs)
- ✅ Movimentações de estoque
- ✅ Múltiplos almoxarifados
- ✅ Localizações personalizadas

### Transferências
- ✅ Transferência para técnicos
- ✅ Controle de status
- ✅ Uso e devolução
- ✅ Relatórios de transferência
- ✅ Assinatura digital

### Relatórios
- ✅ Uso por técnico
- ✅ Uso por produto
- ✅ Resumo de estoque
- ✅ Percentual de utilização
- ✅ Relatórios mensais

### Contabilidade
- ✅ Integração com notas fiscais
- ✅ Extração automática (OCR)
- ✅ Relatórios contábeis

## API Endpoints

### Autenticação
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `GET /auth/me` - Usuário atual

### Produtos
- `GET /products` - Listar produtos
- `POST /products` - Criar produto
- `PATCH /products/:id` - Atualizar produto
- `DELETE /products/:id` - Remover produto

### Transferências
- `GET /transfers` - Listar transferências
- `POST /transfers` - Criar transferência
- `PATCH /transfers/:id/transfer` - Efetivar transferência
- `PATCH /transfers/:id/items/:itemId/use` - Marcar item como usado

[Ver documentação completa da API](./SISTEMA-ALMOXARIFADO.md)

## Scripts

```bash
npm run dev          # Desenvolvimento local
npm run build        # Build para produção
npm start            # Executar build
npm run vercel-build # Build para Vercel
```

## Banco de Dados

### Schema

O schema completo está em `netinfi.sql`

### Importar para Aiven

Ver instruções em: [GUIA_AIVEN.md](./GUIA_AIVEN.md)

## Segurança

- ✅ Autenticação baseada em sessão
- ✅ Senhas com Argon2
- ✅ Validação de inputs
- ✅ SSL obrigatório (produção)
- ✅ CORS configurável
- ✅ Rate limiting recomendado

## Limitações Vercel

- ⏱️ Timeout: 10s por request (Free tier)
- 💾 Storage efêmero (uploads não persistem)
- 📦 Tamanho máximo: 50MB por deployment

### Recomendações para Produção

- Use CDN para uploads (S3, Cloudinary)
- Implemente cache (Redis/Upstash)
- Configure rate limiting
- Monitore performance

## Suporte

- 📧 Email: suporte@netinfinito.com
- 📖 Documentação: [SISTEMA-ALMOXARIFADO.md](./SISTEMA-ALMOXARIFADO.md)
- 🚀 Deploy: [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)

## Licença

Privado - NetInfinito © 2025

---

**Versão**: 0.1.0
**Última atualização**: 22/11/2025
