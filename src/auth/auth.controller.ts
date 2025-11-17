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
    const user = await this.auth.login(dto.email, dto.password)

    // Armazena os dados do usuário na sessão
    req.session.user = user

    return {
      message: 'Login realizado com sucesso',
      user
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