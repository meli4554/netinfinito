import * as argon2 from 'argon2'

async function createAdminPassword() {
  const password = 'Admin123!'
  const hash = await argon2.hash(password)

  console.log('='.repeat(60))
  console.log('USUÁRIO ADMINISTRADOR PADRÃO')
  console.log('='.repeat(60))
  console.log('Email: admin@netinfi.com')
  console.log('Senha: Admin123!')
  console.log('='.repeat(60))
  console.log('\nHash da senha (argon2):')
  console.log(hash)
  console.log('\n='.repeat(60))
  console.log('\nSQL para inserir o usuário:')
  console.log('='.repeat(60))
  console.log(`
INSERT INTO \`User\` (\`id\`, \`email\`, \`passwordHash\`, \`name\`, \`roleId\`, \`isActive\`, \`createdAt\`, \`updatedAt\`) VALUES
('cldefault001', 'admin@netinfi.com', '${hash}', 'Administrador do Sistema', 1, true, NOW(), NOW());
  `)
  console.log('='.repeat(60))
}

createAdminPassword().catch(console.error)
