import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from '../src/app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'
import serverless from 'serverless-http'
import session = require('express-session')

let cachedApp: any = null

async function createApp() {
  if (cachedApp) {
    return cachedApp
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['log', 'error', 'warn', 'debug']
  })

  // Configurar arquivos estáticos (limitado na Vercel, usar CDN para produção)
  app.useStaticAssets(join(__dirname, '..', 'public'))

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
    origin: process.env.CORS_ORIGIN || true,
    credentials: true
  })

  await app.init()

  const expressApp = app.getHttpAdapter().getInstance()
  cachedApp = expressApp

  return expressApp
}

// Handler para Vercel
export default async (req: any, res: any) => {
  const app = await createApp()
  const handler = serverless(app)
  return handler(req, res)
}
