import 'dotenv/config'
import * as mysql from 'mysql2/promise'

async function testConnection() {
  try {
    console.log('='.repeat(60))
    console.log('🔍 Testando conexão com MySQL...')
    console.log('='.repeat(60))

    console.log('\n📋 Configurações:')
    console.log(`   Host: ${process.env.DB_HOST}`)
    console.log(`   Port: ${process.env.DB_PORT}`)
    console.log(`   User: ${process.env.DB_USER}`)
    console.log(`   Database: ${process.env.DB_NAME}`)

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'netinfi',
    })

    console.log('\n✅ Conexão estabelecida com sucesso!')

    // Testar uma query simples
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM User')
    const userCount = (rows as any[])[0].count
    console.log(`\n📊 Usuários no banco: ${userCount}`)

    // Testar listagem de tabelas
    const [tables] = await connection.execute('SHOW TABLES')
    console.log(`\n📦 Tabelas encontradas: ${(tables as any[]).length}`)

    await connection.end()

    console.log('\n' + '='.repeat(60))
    console.log('✅ Teste concluído com sucesso!')
    console.log('='.repeat(60))
    console.log('\n💡 Seu sistema está pronto para usar!')
    console.log('   Execute: npm run dev')
    console.log('='.repeat(60))

  } catch (error: any) {
    console.error('\n❌ Erro ao conectar ao MySQL:')
    console.error(error.message)

    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Dicas:')
      console.log('   1. Verifique se o XAMPP está rodando')
      console.log('   2. Inicie o MySQL no painel do XAMPP')
      console.log('   3. Verifique se a porta 3306 está livre')
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n💡 Dica:')
      console.log('   O banco de dados "netinfi" não existe.')
      console.log('   Crie o banco usando o phpMyAdmin ou execute:')
      console.log('   mysql -u root -e "CREATE DATABASE netinfi"')
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Dica:')
      console.log('   Usuário ou senha incorretos.')
      console.log('   Verifique o arquivo .env')
    }

    process.exit(1)
  }
}

testConnection()
