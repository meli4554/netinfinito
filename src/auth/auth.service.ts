import { Injectable, UnauthorizedException } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'
import * as argon2 from 'argon2'

@Injectable()
export class AuthService {
  constructor(private readonly db: DatabaseService) {}

  async login(email: string, password: string) {
    const user = await this.db.queryOne<{
      id: string
      email: string
      passwordHash: string
      name: string | null
      roleId: number
      isActive: boolean
    }>('SELECT * FROM User WHERE email = ?', [email])

    if (!user) throw new UnauthorizedException('Credenciais inválidas')
    if (!user.isActive) throw new UnauthorizedException('Usuário inativo')

    const ok = await argon2.verify(user.passwordHash, password)
    if (!ok) throw new UnauthorizedException('Credenciais inválidas')

    // Buscar informações da role
    const role = await this.db.queryOne<{ name: string }>(
      'SELECT name FROM Role WHERE id = ?',
      [user.roleId]
    )

    // Retorna os dados do usuário para armazenar na sessão
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roleId: user.roleId,
      roleName: role?.name || 'unknown'
    }
  }
}