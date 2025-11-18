import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { DatabaseService } from '../database/database.service'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly db: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler())
    if (!roles || roles.length === 0) return true
    const req = context.switchToHttp().getRequest()
    const user = req.user
    if (!user) return false
    const role = await this.db.queryOne<{ name: string }>('SELECT name FROM Role WHERE id = ?', [user.roleId])
    if (!role) return false
    return roles.includes(role.name)
  }
}