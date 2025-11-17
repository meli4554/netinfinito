import { NestFactory } from '@nestjs/core'
import { AppModule } from '../src/app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'
import session = require('express-session')

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  // Configurar arquivos estáticos
  app.useStaticAssets(join(__dirname, '..', 'public'))
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  })

  // Configuração do express-session
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'netinfi-secret-change-me',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 dias
      }
    })
  )

  // Configuração do CORS
  app.enableCors({
    origin: true,
    credentials: true
  })

  const port = process.env.PORT || 3000
  await app.listen(port)

  console.log('='.repeat(60))
  console.log('🚀 Servidor NetInFi iniciado com sucesso!')
  console.log('='.repeat(60))
  console.log(`📍 URL: http://localhost:${port}`)
  console.log('📚 Documentação: http://localhost:${port}/api')
  console.log('='.repeat(60))
  console.log('\n💡 Endpoints disponíveis:')
  console.log('   POST   /auth/login')
  console.log('   POST   /auth/logout')
  console.log('   GET    /auth/me')
  console.log('\n📋 Credenciais padrão:')
  console.log('   Email: admin@netinfi.com')
  console.log('   Senha: Admin123!')
  console.log('='.repeat(60))
}

bootstrap().catch((error) => {
  console.error('❌ Erro ao iniciar o servidor:', error)
  process.exit(1)
})