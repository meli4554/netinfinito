import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import * as argon2 from 'argon2'

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true }
    })
    if (!user) throw new UnauthorizedException('Credenciais inválidas')
    if (!user.isActive) throw new UnauthorizedException('Usuário inativo')

    const ok = await argon2.verify(user.passwordHash, password)
    if (!ok) throw new UnauthorizedException('Credenciais inválidas')

    // Retorna os dados do usuário para armazenar na sessão
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roleId: user.roleId,
      roleName: user.role.name
    }
  }
}