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
  async login(@Body() dto: LoginDto) {
    const user = await this.auth.login(dto.email, dto.password)
    // Retorna um token simples (base64 do email)
    const token = Buffer.from(dto.email).toString('base64')
    return {
      message: 'Login realizado com sucesso',
      user,
      token
    }
  }

  @Post('logout')
  logout() {
    return { message: 'Logout realizado com sucesso' }
  }

  @Get('me')
  me() {
    return { user: null }
  }
}