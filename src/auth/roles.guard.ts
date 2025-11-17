import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler())
    if (!roles || roles.length === 0) return true
    const req = context.switchToHttp().getRequest()
    const user = req.user
    if (!user) return false
    const role = await this.prisma.role.findUnique({ where: { id: user.roleId } })
    if (!role) return false
    return roles.includes(role.name)
  }
}