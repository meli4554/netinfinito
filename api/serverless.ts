import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from '../src/app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'
import serverless from 'serverless-http'
import session = require('express-session')
import { AllExceptionsFilter } from '../src/filters/http-exception.filter'

let cachedServer: any = null

async function bootstrap() {
  if (cachedServer) {
    return cachedServer
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['log', 'error', 'warn', 'debug'],
    bodyParser: true
  })

  // Configurar arquivos estáticos
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
        maxAge: 1000 * 60 * 60 * 24 * 7
      }
    })
  )

  // Configuração do CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true
  })

  // Filtro global de exceções
  app.useGlobalFilters(new AllExceptionsFilter())

  await app.init()

  const expressApp = app.getHttpAdapter().getInstance()
  const handler = serverless(expressApp)

  cachedServer = handler
  return handler
}

module.exports = async (req: any, res: any) => {
  const handler = await bootstrap()
  return handler(req, res)
}

export default module.exports
