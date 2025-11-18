import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common'
import { TechniciansService } from './technicians.service'

type TechnicianCategory = 'FIBRA' | 'RADIO' | 'INSTALACAO' | 'MANUTENCAO' | 'OUTROS'

@Controller('technicians')
export class TechniciansController {
  constructor(private readonly techniciansService: TechniciansService) {}

  @Post()
  create(
    @Body()
    body: {
      name: string
      category: TechnicianCategory
      phone?: string
      email?: string
    },
  ) {
    return this.techniciansService.create(body)
  }

  @Get()
  list() {
    return this.techniciansService.list()
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.techniciansService.findOne(id)
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      name?: string
      category?: TechnicianCategory
      phone?: string
      email?: string
      isActive?: boolean
    },
  ) {
    return this.techniciansService.update(id, body)
  }

  @Get(':id/stock')
  getStockSummary(@Param('id', ParseIntPipe) id: number) {
    return this.techniciansService.getStockSummary(id)
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.techniciansService.delete(id)
  }
}
