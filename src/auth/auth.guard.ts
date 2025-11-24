import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler())
    if (isPublic) return true

    const req = context.switchToHttp().getRequest()

    // Verifica se existe token no header
    const token = req.headers['x-auth-token']
    if (!token) {
      throw new UnauthorizedException('Você precisa estar logado')
    }

    // Decodifica o token (base64) para obter o email
    try {
      const email = Buffer.from(token, 'base64').toString('utf-8')

      // Adiciona informações básicas ao request
      // (em produção, você deve buscar do banco ou validar melhor)
      req.user = {
        sub: 'user-id',
        email: email,
        roleId: 1
      }

      return true
    } catch (error) {
      throw new UnauthorizedException('Token inválido')
    }
  }
}