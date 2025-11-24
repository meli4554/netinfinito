import { Injectable, UnauthorizedException } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
  constructor(private readonly db: DatabaseService) {}

  async login(username: string, password: string) {
    // Adaptado para banco forumAletheia: tabela users, campo username e password_hash
    const user = await this.db.queryOne<{
      id: number
      username: string
      password_hash: string
      name: string | null
    }>('SELECT * FROM users WHERE username = ?', [username])

    if (!user) throw new UnauthorizedException('Credenciais inválidas')

    // Verifica senha com bcrypt (forumAletheia usa bcrypt)
    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) throw new UnauthorizedException('Credenciais inválidas')

    // Retorna os dados do usuário para armazenar na sessão
    return {
      id: user.id,
      email: user.username, // mantém campo email para compatibilidade com frontend
      name: user.name,
      roleId: 1, // valor fixo para manter compatibilidade
      roleName: 'admin' // valor fixo para manter compatibilidade
    }
  }
}