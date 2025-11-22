# 🚀 Guia de Migração para Aiven MySQL

## ⚠️ Ação Necessária

O projeto está configurado para usar o Aiven, mas você precisa completar 2 etapas:

### 1. Obter a senha correta do banco

Na interface do Aiven que você mostrou:
1. Clique em **"CLICK_TO_REVEAL_PASSWORD"** no campo Password
2. Copie a senha real
3. Atualize o arquivo `.env` com a senha correta:

```env
DB_PASSWORD=SENHA_REAL_AQUI
```

### 2. Liberar seu IP no Aiven (Whitelist)

Seu IP atual é: **200.24.67.14**

No painel do Aiven:
1. Vá em **"Service settings"** (configurações do serviço)
2. Procure por **"Allowed IP Addresses"** ou **"IP Whitelist"**
3. Adicione o IP: `200.24.67.14/32`
4. OU adicione `0.0.0.0/0` para permitir qualquer IP (menos seguro, mas funciona para testes)

---

## 📋 Arquivos Criados

✅ `.env` - Configuração do banco (NÃO commitar!)
✅ `.env.example` - Template de exemplo
✅ `test-aiven-connection.js` - Script de teste
✅ `src/database/database.service.ts` - Atualizado com suporte SSL

---

## 🧪 Testar Conexão

Após liberar o IP e atualizar a senha, rode:

```bash
node test-aiven-connection.js
```

---

## 📦 Importar Schema do Banco

### Opção 1: Via Aiven Console (Recomendado)

1. No painel do Aiven, vá em **"Tools"** → **"Import"**
2. Faça upload do arquivo `netinfi.sql`
3. Aguarde a importação

### Opção 2: Via MySQL Client

```bash
mysql -h gestao-rboyjunior-0a4c.l.aivencloud.com \\
      -P 18478 \\
      -u avnadmin \\
      -p \\
      --ssl-mode=REQUIRED \\
      defaultdb < netinfi.sql
```

### Opção 3: Via MySQL Workbench

1. Crie uma nova conexão com os dados:
   - Hostname: `gestao-rboyjunior-0a4c.l.aivencloud.com`
   - Port: `18478`
   - Username: `avnadmin`
   - Password: (a senha revelada)
   - Default Schema: `defaultdb`
   - SSL: Required
2. Importe o arquivo `netinfi.sql`

---

## 🚀 Iniciar o Servidor

Depois que tudo estiver configurado:

```bash
npm run dev
```

---

## 📝 Checklist de Migração

- [ ] Revelar senha no Aiven e atualizar `.env`
- [ ] Adicionar IP na whitelist do Aiven
- [ ] Testar conexão: `node test-aiven-connection.js`
- [ ] Importar schema do banco
- [ ] Testar servidor: `npm run dev`
- [ ] Fazer login em: http://localhost:3000/pages/dashboard.html

---

## ⚡ Credenciais Padrão do Sistema

```
Email: admin@netinfi.com
Senha: Admin123!
```

---

## 🔒 Segurança

**IMPORTANTE:**
- Nunca comite o arquivo `.env` no Git
- O `.gitignore` já está configurado para ignorar `.env`
- Use `.env.example` como template
- Em produção, use variáveis de ambiente do servidor

---

## 🆘 Problemas Comuns

### Erro: "Access denied"
→ Senha incorreta ou IP não está na whitelist

### Erro: "Connection timeout"
→ Firewall bloqueando porta 18478 ou IP não liberado

### Erro: "SSL certificate"
→ Já configurado para aceitar certificados auto-assinados

---

## 📞 Próximos Passos

1. Complete o checklist acima
2. Teste a aplicação
3. Faça commit das alterações (exceto `.env`)
4. Deploy em produção
