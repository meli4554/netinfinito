import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from '../src/app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'
import serverless from 'serverless-http'
import { AllExceptionsFilter } from '../src/filters/http-exception.filter'

let cachedServer: any = null

async function bootstrap() {
  try {
    if (cachedServer) {
      return cachedServer
    }

    console.log('Initializing NestJS application...')

    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['log', 'error', 'warn', 'debug'],
      bodyParser: true
    })

    console.log('NestJS application created')

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
    console.log('NestJS application initialized')

    const expressApp = app.getHttpAdapter().getInstance()
    const handler = serverless(expressApp)

    cachedServer = handler
    console.log('Serverless handler cached')
    return handler
  } catch (error) {
    console.error('Error in bootstrap:', error)
    throw error
  }
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
  try {
    const handler = await bootstrap()
    return handler(req, res)
  } catch (error) {
    console.error('Error in serverless handler:', error)
    res.status(500).json({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    })
  }
}

export default module.exports
