# 📋 Guia de Instalação - NetInFi

## 🎯 Passo a Passo Completo

### 1️⃣ Certifique-se que o XAMPP está rodando

- Abra o XAMPP Control Panel
- Inicie o **Apache** e o **MySQL**
- Verifique se ambos estão com status verde

### 2️⃣ Importar o Banco de Dados pelo phpMyAdmin

#### Opção A: Importação via Interface (RECOMENDADO)

1. Acesse o phpMyAdmin: http://localhost/phpmyadmin
2. Clique em **"SQL"** no menu superior
3. Copie TODO o conteúdo do arquivo `database.sql`
4. Cole na área de texto do phpMyAdmin
5. Clique em **"Executar"** (botão no canto inferior direito)
6. Aguarde a mensagem de sucesso

#### Opção B: Importação via Arquivo

1. Acesse o phpMyAdmin: http://localhost/phpmyadmin
2. Clique em **"Importar"** no menu superior
3. Clique em **"Escolher arquivo"**
4. Selecione o arquivo `database.sql` deste projeto
5. Clique em **"Importar"** no final da página
6. Aguarde a importação completar

### 3️⃣ Verificar se o Banco foi Criado

Após a importação, você deve ver:

1. **No painel esquerdo**, o banco de dados `netinfi`
2. Ao clicar em `netinfi`, você verá **17 tabelas**:
   - Attachment
   - Customer
   - Invoice
   - InvoiceItem
   - Location
   - Permission
   - Product
   - PurchaseOrder
   - PurchaseOrderItem
   - Role
   - RolePermission
   - Shipment
   - StockMovement
   - Supplier
   - User
   - Warehouse
   - _prisma_migrations

### 4️⃣ Verificar Dados Iniciais

Execute estas consultas SQL no phpMyAdmin para verificar:

```sql
-- Ver roles criados
SELECT * FROM Role;

-- Ver permissões
SELECT * FROM Permission;

-- Ver usuário administrador
SELECT id, email, name, roleId, isActive FROM User;

-- Ver fornecedores de exemplo
SELECT * FROM Supplier;

-- Ver produtos de exemplo
SELECT * FROM Product;
```

## 🔐 Credenciais Padrão

Após importar o banco, você terá um usuário administrador:

```
Email: admin@netinfi.com
Senha: Admin123!
```

⚠️ **IMPORTANTE**: Altere esta senha em produção!

## 🚀 Iniciar o Servidor

Após importar o banco de dados, inicie o servidor:

```bash
npm run dev
```

O servidor iniciará em: `http://localhost:3000`

## 🧪 Testar a API

### Fazer Login

```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "admin@netinfi.com",
  "password": "Admin123!"
}
```

**Resposta esperada:**
```json
{
  "message": "Login realizado com sucesso",
  "user": {
    "id": "cldefault001",
    "email": "admin@netinfi.com",
    "name": "Administrador do Sistema",
    "roleId": 1,
    "roleName": "Administrador"
  }
}
```

### Verificar Usuário Logado

```bash
GET http://localhost:3000/auth/me
```

### Fazer Logout

```bash
POST http://localhost:3000/auth/logout
```

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

| Categoria | Tabelas |
|-----------|---------|
| **Autenticação** | User, Role, Permission, RolePermission |
| **Cadastros** | Supplier, Customer |
| **Produtos** | Product, Warehouse, Location |
| **Compras** | PurchaseOrder, PurchaseOrderItem, Invoice, InvoiceItem |
| **Estoque** | StockMovement |
| **Vendas** | Shipment |
| **Arquivos** | Attachment |

### Roles (Perfis) Padrão

1. **Administrador** - Acesso total ao sistema
2. **Gerente** - Gerenciamento de operações e relatórios
3. **Operador** - Operações do dia-a-dia
4. **Visualizador** - Apenas visualização

### Dados de Exemplo Incluídos

- ✅ 3 Fornecedores
- ✅ 3 Clientes
- ✅ 3 Armazéns
- ✅ 6 Localizações
- ✅ 8 Produtos
- ✅ 4 Roles com permissões configuradas
- ✅ 14 Permissões
- ✅ 1 Usuário Administrador

## 🔧 Troubleshooting

### Erro: "Access denied for user"

**Solução:** Verifique o arquivo `.env`:
```env
DATABASE_URL="mysql://root:@localhost:3306/netinfi"
```

Se seu MySQL tem senha, adicione:
```env
DATABASE_URL="mysql://root:SUA_SENHA@localhost:3306/netinfi"
```

### Erro: "Unknown database 'netinfi'"

**Solução:** Execute o script SQL novamente. A primeira linha cria o banco:
```sql
CREATE DATABASE IF NOT EXISTS `netinfi`;
```

### Erro: "Table already exists"

**Solução:** O script usa `CREATE TABLE IF NOT EXISTS`, então é seguro executar múltiplas vezes. Se quiser começar do zero:

```sql
DROP DATABASE netinfi;
```

Depois execute o `database.sql` novamente.

### Servidor não inicia

1. Verifique se instalou as dependências:
```bash
npm install
```

2. Verifique se gerou o Prisma Client:
```bash
npm run prisma:generate
```

3. Verifique se o MySQL está rodando no XAMPP

## 📝 Próximos Passos

1. ✅ Banco de dados criado
2. ✅ Usuário admin criado
3. ✅ Dados de exemplo inseridos
4. 🔄 Teste a API com Postman ou Insomnia
5. 🔄 Comece a desenvolver suas funcionalidades
6. 🔄 Quando pronto, migre para MySQL do Aiven

## 🌐 Migração para Aiven (Futuro)

Quando for migrar para o Aiven:

1. Copie a connection string do Aiven
2. Atualize o `.env`:
```env
DATABASE_URL="mysql://usuario:senha@host-aiven.com:port/defaultdb?ssl-mode=REQUIRED"
```

3. Execute a migration:
```bash
npx prisma migrate deploy
```

4. Se quiser copiar os dados, exporte do phpMyAdmin e importe no Aiven

---

**💡 Dica:** Use um cliente de API como Postman ou Insomnia para testar os endpoints mais facilmente!

**🆘 Precisa de ajuda?** Verifique os logs do servidor para mensagens de erro detalhadas.
