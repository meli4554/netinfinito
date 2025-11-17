import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common'
import { ProductUsageService } from './product-usage.service'

@Controller('product-usage')
export class ProductUsageController {
  constructor(private readonly productUsageService: ProductUsageService) {}

  @Post()
  create(
    @Body()
    body: {
      technicianId: number
      productId: number
      quantity: number
      note?: string
      serviceOrder?: string
      clientName?: string
    },
  ) {
    return this.productUsageService.create(body)
  }

  @Get()
  list() {
    return this.productUsageService.list()
  }

  @Get('technician/:technicianId')
  getByTechnician(@Param('technicianId', ParseIntPipe) technicianId: number) {
    return this.productUsageService.getByTechnician(technicianId)
  }

  @Get('product/:productId')
  getByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.productUsageService.getByProduct(productId)
  }

  @Get('period')
  getByPeriod(@Query('start') start: string, @Query('end') end: string) {
    const startDate = new Date(start)
    const endDate = new Date(end)
    return this.productUsageService.getByPeriod(startDate, endDate)
  }
}
