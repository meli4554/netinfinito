import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from '../src/app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'
import serverless from 'serverless-http'
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

// Para desenvolvimento local
async function startLocalServer() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
    bodyParser: true
  })

  app.useStaticAssets(join(__dirname, '..', 'public'))

  app.enableCors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true
  })

  app.useGlobalFilters(new AllExceptionsFilter())

  const port = process.env.PORT || 3000
  await app.listen(port)
  console.log(`Servidor rodando em http://localhost:${port}`)
}

// Se não estiver rodando como serverless, inicia servidor local
if (require.main === module) {
  startLocalServer()
}

module.exports = async (req: any, res: any) => {
  const handler = await bootstrap()
  return handler(req, res)
}

export default module.exports
