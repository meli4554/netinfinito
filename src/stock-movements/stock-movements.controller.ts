import { Body, Controller, Post } from '@nestjs/common'
import { StockMovementsService } from './stock-movements.service'

class CreateStockMovementDto {
  productId: number
  type: 'IN' | 'OUT' | 'ADJUST' | 'TRANSFER'
  quantity: number
  locationId?: number
  technicianId?: number
  referenceType: 'ENTRY' | 'TRANSFER' | 'USAGE' | 'ADJUSTMENT'
  referenceId: number
  invoiceNumber?: string
  invoiceDate?: string
  invoiceFile?: string
  receivedAt?: string
  supplier?: string
  note?: string
}

@Controller('stock-movements')
export class StockMovementsController {
  constructor(private readonly stockMovements: StockMovementsService) {}

  @Post()
  create(@Body() dto: CreateStockMovementDto) {
    return this.stockMovements.create(dto)
  }
}
