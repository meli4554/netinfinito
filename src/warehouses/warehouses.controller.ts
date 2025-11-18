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
import { WarehousesService } from './warehouses.service'

type WarehouseType = 'MAIN' | 'TECHNICIAN'

@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Get()
  list() {
    return this.warehousesService.list()
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.warehousesService.findOne(id)
  }

  @Get(':id/stock')
  getStock(@Param('id', ParseIntPipe) id: number) {
    return this.warehousesService.getStock(id)
  }

  @Post()
  create(
    @Body()
    body: {
      name: string
      code: string
      type: WarehouseType
      technicianId?: number
    },
  ) {
    return this.warehousesService.create(body)
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      name?: string
      code?: string
      type?: WarehouseType
      technicianId?: number
    },
  ) {
    return this.warehousesService.update(id, body)
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.warehousesService.delete(id)
  }
}
