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
    return {
      message: 'Login realizado com sucesso',
      user
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