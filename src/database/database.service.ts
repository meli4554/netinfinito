import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as mysql from 'mysql2/promise';

// Certificado CA para Aiven MySQL (embedded para funcionar na Vercel)
const AIVEN_CA_CERT = `-----BEGIN CERTIFICATE-----
MIIEUDCCArigAwIBAgIUFjF6CGJrku5f7FNJhZXR3Vey/8AwDQYJKoZIhvcNAQEM
BQAwQDE+MDwGA1UEAww1ZjliZjVlY2UtZGNiNS00NzE0LTlhODQtNjhkODgzNmEz
MjE1IEdFTiAxIFByb2plY3QgQ0EwHhcNMjUxMTIyMTcxMzMyWhcNMzUxMTIwMTcx
MzMyWjBAMT4wPAYDVQQDDDVmOWJmNWVjZS1kY2I1LTQ3MTQtOWE4NC02OGQ4ODM2
YTMyMTUgR0VOIDEgUHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCC
AYoCggGBAMitOiwUuBs9mJuT9vB6pnaos/uDtZDit4IL6nxLusbanyT6NI6c3Gzx
uZ94k7qTrnhWou8J/nrQaQGXeaQDqzB6ssXK3xJeeAtTHnHvWXZSCIUlS78uNrsT
rC8OKp+IZCedPVin/3nytuaqakHkjwm7iJdjsk/lKJC5hc6kAJs/uYH4GNFALv0t
694wAEHhw34j/k1aX9a2ak3leLMxX3lUg6SUVl8llPsMHX6mRkQLmhQqwj+DiGjz
v/DZ7VBVlnFDtyvG6YW627pIAAXBeb7o7h7KOPkbYH1PoaSBJtX0d7sO+XNHOlF7
bFnSqwUii4Wh8z88ZW6xp2PUQI6QvBoB5M9+YAKSC/stfT+vocO/CTVNAZA7sNEz
/ri7r4JE1z5E4mP2wMZQva84CQN4i3F6CL6u94HSz/rzUuKHG+/a/L3LylGR3bW7
T2aT2ezB/RjqgdnKDPeToj2ZPxne/QJqcKJ2SB1uT1mU17c9DMd5UATPL/+aRQFH
uMr0noyLEQIDAQABo0IwQDAdBgNVHQ4EFgQURUFzUSRKzBJ8UY0/aVV1N442PB0w
EgYDVR0TAQH/BAgwBgEB/wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQAD
ggGBAEluFbRsFqV+9RfZO0BvZT/w9/u2ucC6c5MSH+MJikvOJRL6HG+hWF70hOUS
16qDJZKrhgbebw4KxDpQK+x6a4pLjOocK/u33tljQBw9iQSMhisf80ZTE0LYtoWI
L1t3687FV9ZPOzWn5WMW0hd/aOzhrNfDU/b3FRF2GcEWru8mDfdyIu4ZvVLCp7Dm
LI42hYvf0WRzkKCckhy5LwZrMaoLIXRsMNDr6Ie+gKqRzr/VsKROvEeyR3oAMbdK
aKeFpsVJ+eLdEuYODiTemifsef/XrvPKCxAa+PXiR8Q2vQGgFYj0XBwSvfnDrnSI
QpxhAqSeLVcPohnb94yz1NdBDqaCy57M/LhdBt2zvO1GZKtqZmI5Wj+yyo0UtJvt
vEePmTt7OLF5EK3VMfBaLEibGhI8arDmP3Li8YXF0rv1GH9CylXSCVe+nnvdZE5h
rR841ZmzWvVfVSd+QqyLIN3S/UPUrTKWKtaH5/o6lBOBmUOnBw08NZL/0dg2dvlm
ZefoUw==
-----END CERTIFICATE-----`;

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: mysql.Pool;

  async onModuleInit() {
    console.log('🔧 Iniciando configuração do banco de dados...');
    console.log('📊 Variáveis de ambiente:');
    console.log('  - DB_HOST:', process.env.DB_HOST);
    console.log('  - DB_PORT:', process.env.DB_PORT);
    console.log('  - DB_USER:', process.env.DB_USER);
    console.log('  - DB_NAME:', process.env.DB_NAME);
    console.log('  - DB_SSL:', process.env.DB_SSL);

    // Configuração SSL para Aiven e outros serviços cloud
    const sslConfig =
      process.env.DB_SSL === 'true'
        ? {
            ca: AIVEN_CA_CERT,
            rejectUnauthorized: true,
          }
        : undefined;

    console.log('🔐 SSL Config:', sslConfig ? 'Habilitado' : 'Desabilitado');

    // Criar pool de conexões com configurações otimizadas para Vercel
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'defaultdb',
      ssl: sslConfig,
      waitForConnections: true,
      connectionLimit: 5, // Reduzido para serverless
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      connectTimeout: 5000, // 5 segundos (Vercel tem limite de 10s)
      acquireTimeout: 5000, // Timeout para obter conexão do pool
    });

    console.log('✓ Pool de conexões criado (lazy connection - sem teste inicial)');
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
