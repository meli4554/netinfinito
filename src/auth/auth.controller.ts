import { Body, Controller, Post, Req, Get } from '@nestjs/common'
import { AuthService } from './auth.service'
import { Public } from './public.decorator'
import { Request } from 'express'

class LoginDto {
  email: string
  password: string
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @Public()
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    console.log('🔐 Tentativa de login:', dto.email)
    const user = await this.auth.login(dto.email, dto.password)
    console.log('✅ Login bem-sucedido:', user.email)

    // Em ambiente serverless, sessões podem não funcionar corretamente
    // Retorna token simples para o frontend gerenciar
    try {
      if (req.session) {
        req.session.user = user
        console.log('📝 Sessão criada')
      }
    } catch (error) {
      console.warn('⚠️ Erro ao criar sessão:', error.message)
    }

    return {
      message: 'Login realizado com sucesso',
      user,
      // Token básico (em produção, usar JWT)
      token: Buffer.from(JSON.stringify({ userId: user.id, email: user.email })).toString('base64')
    }
  }

  @Post('logout')
  logout(@Req() req: Request) {
    req.session.destroy((err) => {
      if (err) {
        return { message: 'Erro ao fazer logout' }
      }
    })
    return { message: 'Logout realizado com sucesso' }
  }

  @Get('me')
  me(@Req() req: Request) {
    if (!req.session.user) {
      return { user: null }
    }
    return { user: req.session.user }
  }
}