import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler())
    if (isPublic) return true

    const req = context.switchToHttp().getRequest()

    // Verifica se existe uma sessão e se o usuário está logado
    if (!req.session || !req.session.user) {
      throw new UnauthorizedException('Você precisa estar logado')
    }

    // Adiciona os dados do usuário ao request
    req.user = {
      sub: req.session.user.id,
      roleId: req.session.user.roleId
    }

    return true
  }
}