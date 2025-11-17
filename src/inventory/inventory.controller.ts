import { Controller, Get, Param } from '@nestjs/common'
import { InventoryService } from './inventory.service'

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventory: InventoryService) {}

  @Get('summary')
  summary() { return this.inventory.summary() }

  @Get('products/:id/movements')
  movements(@Param('id') id: string) { return this.inventory.movements(+id) }
}