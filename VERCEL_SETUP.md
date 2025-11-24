# Como Configurar Variáveis de Ambiente na Vercel

## Método 1: Importar arquivo .env (Recomendado)

1. Acesse o painel da Vercel
2. Vá em **Settings** > **Environment Variables**
3. Clique em **Import .env**
4. Cole o conteúdo do arquivo `.env.vercel`
5. Clique em **Import**

## Método 2: Adicionar manualmente

No painel da Vercel, vá em **Settings** > **Environment Variables** e adicione:

| Key | Value |
|-----|-------|
| `DB_HOST` | `public-gestao-rboyjunior-0a4c.l.aivencloud.com` |
| `DB_PORT` | `18478` |
| `DB_USER` | `avnadmin` |
| `DB_PASSWORD` | `<SUA_SENHA_AIVEN>` |
| `DB_NAME` | `defaultdb` |
| `DB_SSL` | `true` |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | `true` |

## Importante

- **DB_HOST**: Use o host **PUBLIC** (`public-gestao-...`) e não o Dynamic
- **DB_SSL**: Sempre `true` para Aiven
- **JWT_SECRET**: Altere para uma chave segura em produção
- **CORS_ORIGIN**: Configure com o domínio da sua aplicação em produção

## Após configurar

1. Redeploy da aplicação (Deployments > ⋯ > Redeploy)
2. Aguarde 2-3 minutos
3. Teste o login no domínio da Vercel

## Verificar logs de erro

Se ainda houver problemas:
1. Vá em **Deployments**
2. Clique no deploy mais recente
3. Vá em **Functions**
4. Clique em `api/index` para ver os logs
