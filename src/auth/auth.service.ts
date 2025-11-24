// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { DatabaseService } from '../database/database.service';
// import * as argon2 from 'argon2';

// @Injectable()
// export class AuthService {
//   constructor(private readonly db: DatabaseService) {}

//   async login(email: string, password: string) {
//     const user = await this.db.queryOne<{
//       id: string;
//       email: string;
//       passwordHash: string;
//       name: string | null;
//       roleId: number;
//       isActive: boolean;
//     }>('SELECT * FROM user WHERE email = ?', [email]);

//     if (!user) throw new UnauthorizedException('Credenciais inválidas');
//     if (!user.isActive) throw new UnauthorizedException('Usuário inativo');

//     const ok = await argon2.verify(user.passwordHash, password);
//     if (!ok) throw new UnauthorizedException('Credenciais inválidas');

//     // Buscar informações da role
//     const role = await this.db.queryOne<{ name: string }>(
//       'SELECT name FROM role WHERE id = ?',
//       [user.roleId]
//     );

//     // Retorna os dados do usuário para armazenar na sessão
//     return {
//       id: user.id,
//       email: user.email,
      
//       name: user.name,
//       roleId: user.roleId,
//       roleName: role?.name || 'unknown',
//     };
//   }
// }


// VERSÃO DE TESTE SIMPLIFICADA PARA DEBUG

import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor() {}

  async login(email: string, password: string) {
    console.log(`[DEBUG] Tentativa de login para: ${email}. Retornando usuário mock.`);
    
    // Simula um login bem-sucedido sem consultar o banco de dados.
    // Isso ajuda a isolar se o problema é na conexão com o DB.
    return {
      id: 'debug-user-id',
      email: email,
      name: 'Usuário de Teste',
      roleId: 1,
      roleName: 'admin',
    };
  }
}