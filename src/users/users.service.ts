import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import * as argon2 from 'argon2'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: { email: string; password: string; name?: string; roleId: number }) {
    const passwordHash = await argon2.hash(dto.password)
    return this.prisma.user.create({ data: { email: dto.email, passwordHash, name: dto.name, roleId: dto.roleId } })
  }

  list() {
    return this.prisma.user.findMany()
  }

  update(id: string, dto: { name?: string; roleId?: number; isActive?: boolean }) {
    return this.prisma.user.update({ where: { id }, data: dto })
  }
}