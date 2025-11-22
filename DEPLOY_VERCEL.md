# Guia de Deploy na Vercel - NetInfinito

## Pré-requisitos

- Conta na Vercel (https://vercel.com)
- Banco de dados Aiven MySQL configurado
- Git instalado e projeto versionado

## Passo 1: Preparar o Repositório

Certifique-se de que todas as alterações estejam commitadas:

```bash
git add .
git commit -m "Preparar deploy para Vercel"
git push origin master
```

## Passo 2: Importar Projeto na Vercel

### Opção A: Via Interface Web

1. Acesse https://vercel.com/new
2. Conecte sua conta GitHub/GitLab/Bitbucket
3. Selecione o repositório `netinfinito`
4. Clique em "Import"

### Opção B: Via CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Fazer login
vercel login

# Fazer deploy
vercel
```

## Passo 3: Configurar Variáveis de Ambiente

Na dashboard da Vercel, vá em **Settings → Environment Variables** e adicione:

### Variáveis Obrigatórias:

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `DB_HOST` | `gestao-rboyjunior-0a4c.l.aivencloud.com` | Host do banco Aiven |
| `DB_PORT` | `18478` | Porta do banco Aiven |
| `DB_USER` | `avnadmin` | Usuário do banco |
| `DB_PASSWORD` | `SUA_SENHA_AIVEN_AQUI` | Senha do banco |
| `DB_NAME` | `defaultdb` | Nome do database |
| `DB_SSL` | `true` | SSL obrigatório para Aiven |
| `JWT_SECRET` | `seu_secret_jwt_seguro_aqui` | Chave secreta para JWT |
| `SESSION_SECRET` | `seu_session_secret_aqui` | Chave secreta para sessões |
| `NODE_ENV` | `production` | Ambiente de execução |
| `PORT` | `3000` | Porta (opcional na Vercel) |

### Variáveis Opcionais:

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `CORS_ORIGIN` | `https://seudominio.com` | Origem permitida para CORS |

## Passo 4: Deploy

Após configurar as variáveis:

1. A Vercel fará o deploy automaticamente
2. Aguarde a conclusão (geralmente 1-2 minutos)
3. Acesse a URL fornecida (ex: `https://netinfinito.vercel.app`)

## Passo 5: Testar a Aplicação

### Teste básico de saúde:

```bash
curl https://sua-url.vercel.app/auth/login
```

### Login via Postman/Insomnia:

```
POST https://sua-url.vercel.app/auth/login
Content-Type: application/json

{
  "email": "admin@netinfi.com",
  "password": "Admin123!"
}
```

## Configurações Importantes

### Arquivos de Configuração

- **vercel.json**: Configuração principal da Vercel
- **api/serverless.ts**: Handler serverless para Vercel
- **.vercelignore**: Arquivos ignorados no deploy

### Limites da Vercel (Free Tier)

- Timeout: 10 segundos por request
- Memória: 1024 MB
- Deployments: Ilimitados
- Bandwidth: 100 GB/mês
- Serverless Functions: 100 GB-horas/mês

### Uploads de Arquivos

⚠️ **IMPORTANTE**: A Vercel usa sistema de arquivos efêmero. Uploads não persistem entre deployments.

**Soluções recomendadas:**
- AWS S3
- Cloudinary
- Vercel Blob Storage

### Domínio Customizado

1. Acesse **Settings → Domains**
2. Adicione seu domínio
3. Configure DNS conforme instruções
4. Aguarde propagação

## Troubleshooting

### Erro de Timeout

Se requests estão demorando muito:
- Otimize queries do banco
- Adicione índices nas tabelas
- Considere cache (Redis)

### Erro de Conexão com Banco

Verifique:
- Variáveis de ambiente estão corretas
- `DB_SSL=true` está configurado
- Firewall do Aiven permite conexões

### Logs

Ver logs em tempo real:

```bash
vercel logs sua-url.vercel.app
```

Ou acesse **Deployments → Logs** na dashboard.

## Redeploy

### Automático

Qualquer push para `master` dispara novo deploy automaticamente.

### Manual

```bash
vercel --prod
```

Ou clique em **Redeploy** na dashboard.

## Rollback

1. Acesse **Deployments**
2. Encontre o deployment anterior
3. Clique em **⋯** → **Promote to Production**

## Monitoramento

### Analytics

Ative analytics gratuitos:
1. **Settings → Analytics**
2. Clique em **Enable**

### Alertas

Configure notificações para:
- Erros de deploy
- Falhas de build
- Uptime

## Segurança

### Recomendações:

1. ✅ Use HTTPS (automático na Vercel)
2. ✅ Configure CORS adequadamente
3. ✅ Use secrets fortes (JWT_SECRET, SESSION_SECRET)
4. ✅ Mantenha dependências atualizadas
5. ✅ Limite rate das APIs
6. ✅ Valide inputs do usuário

### Variáveis Secretas

⚠️ **NUNCA** commite `.env` no Git!

Sempre use variáveis de ambiente da Vercel para dados sensíveis.

## Performance

### Otimizações:

1. **Cold Start**: Cache de conexão implementado em `api/serverless.ts`
2. **Database Pool**: Configurado em `database.service.ts`
3. **CDN**: Arquivos estáticos servidos pela CDN da Vercel
4. **Compression**: Habilitado automaticamente

## Suporte

- Documentação Vercel: https://vercel.com/docs
- Documentação Aiven: https://aiven.io/docs
- Issues do projeto: [link do repositório]

---

**Última atualização:** 22/11/2025
**Versão:** 0.1.0
