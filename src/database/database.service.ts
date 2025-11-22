import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import * as mysql from 'mysql2/promise'

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: mysql.Pool

  async onModuleInit() {
    // Configuração SSL para Aiven e outros serviços cloud
    const sslConfig = process.env.DB_SSL === 'true'
      ? { rejectUnauthorized: false }
      : undefined

    // Criar pool de conexões
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'netinfi',
      ssl: sslConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    })

    console.log('✓ Conectado ao MySQL:', process.env.DB_HOST)
  }

  async onModuleDestroy() {
    await this.pool.end()
  }

  // Executar query e retornar resultados
  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    const [rows] = await this.pool.execute(sql, params)
    return rows as T[]
  }

  // Executar query e retornar apenas primeira linha
  async queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
    const [rows] = await this.pool.execute(sql, params)
    const result = rows as T[]
    return result.length > 0 ? result[0] : null
  }

  // Executar insert/update/delete e retornar info
  async execute(sql: string, params?: any[]): Promise<mysql.ResultSetHeader> {
    const [result] = await this.pool.execute(sql, params)
    return result as mysql.ResultSetHeader
  }

  // Iniciar transação
  async transaction<T>(callback: (connection: mysql.PoolConnection) => Promise<T>): Promise<T> {
    const connection = await this.pool.getConnection()
    await connection.beginTransaction()

    try {
      const result = await callback(connection)
      await connection.commit()
      return result
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }

  // Obter conexão direta (para casos especiais)
  getPool(): mysql.Pool {
    return this.pool
  }
}
