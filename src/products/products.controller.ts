import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common'
import { ProductsService } from './products.service'

class CreateProductDto {
  sku?: string // SKU agora é opcional (será gerado automaticamente)
  name: string
  unit?: string
  barCode?: string
  minStock?: number
  trackSerial?: boolean
  initialQuantity?: number
  instances?: Array<{ serialNumber?: string; macAddress?: string }>
}

class UpdateProductDto {
  name?: string
  unit?: string
  barCode?: string
  minStock?: number
  trackSerial?: boolean
}

@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.products.create(dto)
  }

  @Get()
  list() {
    return this.products.list()
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.products.getById(+id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.products.update(+id, dto)
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      await this.products.delete(+id)
      return { message: 'Produto excluído com sucesso' }
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Erro ao excluir produto',
        HttpStatus.BAD_REQUEST
      )
    }
  }
}