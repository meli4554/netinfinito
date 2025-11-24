import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as mysql from 'mysql2/promise';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: mysql.Pool;

  async onModuleInit() {
    console.log('🔧 Iniciando configuração do banco de dados...');

    // Suporta tanto MYSQL_* (padrão Aiven) quanto DB_* (custom)
    const host = process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost';
    const port = parseInt(process.env.MYSQL_PORT || process.env.DB_PORT || '3306');
    const user = process.env.MYSQL_USER || process.env.DB_USER || 'root';
    const password = process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '';
    const database = process.env.MYSQL_DATABASE || process.env.DB_NAME || 'defaultdb';
    const sslMode = process.env.MYSQL_SSL_MODE;

    console.log('📊 Configuração de conexão:');
    console.log('  - Host:', host);
    console.log('  - Port:', port);
    console.log('  - User:', user);
    console.log('  - Database:', database);
    console.log('  - SSL Mode:', sslMode);

    // Configuração SSL para Aiven e outros serviços cloud (igual ao forumAletheia)
    const sslConfig =
      sslMode === 'REQUIRED'
        ? {
            rejectUnauthorized: false, // Aceita certificados auto-assinados da Aiven
          }
        : undefined;

    console.log('🔐 SSL Config:', sslConfig ? 'Habilitado (rejectUnauthorized: false)' : 'Desabilitado');

    // Criar pool de conexões OTIMIZADO para Vercel Serverless
    // Baseado em: https://vercel.com/guides/connection-pooling-with-serverless-functions
    this.pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      ssl: sslConfig,
      waitForConnections: true,
      connectionLimit: 3, // Muito reduzido para serverless (recomendado: 1-3)
      maxIdle: 3, // Máximo de conexões idle
      idleTimeout: 5000, // Fecha conexões idle após 5s (recomendado para serverless)
      queueLimit: 0, // Sem limite de fila
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      connectTimeout: 10000, // 10 segundos
      timezone: '+00:00', // UTC
    });

    console.log('✓ Pool de conexões criado para ambiente serverless');
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
