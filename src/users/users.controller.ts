import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common'
import { UsersService } from './users.service'

class CreateUserDto {
  email: string
  password: string
  name?: string
  roleId: number
}

class UpdateUserDto {
  name?: string
  roleId?: number
  isActive?: boolean
}

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.users.create(dto)
  }

  @Get()
  list() {
    return this.users.list()
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.users.update(id, dto)
  }
}