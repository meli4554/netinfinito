import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductInstancesService } from './product-instances.service';

@Controller('product-instances')
export class ProductInstancesController {
  constructor(private readonly instancesService: ProductInstancesService) {}

  @Post('bulk')
  createBulk(
    @Body()
    body: {
      productId: number;
      instances: Array<{ serialNumber?: string; macAddress?: string }>;
    },
  ) {
    return this.instancesService.createBulk(body.productId, body.instances);
  }

  @Get('product/:productId')
  findByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.instancesService.findByProduct(productId);
  }

  @Get('search/serial')
  findBySerial(@Query('sn') serialNumber: string) {
    return this.instancesService.findBySerial(serialNumber);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.instancesService.findOne(id);
  }

  @Get('search/mac')
  findByMac(@Query('mac') macAddress: string) {
    return this.instancesService.findByMac(macAddress);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      serialNumber?: string
      macAddress?: string
      status?: string
      invoiceNumber?: string
      invoiceDate?: string
      inutilizedReason?: string
      inutilizedAt?: string
      awaitingReplacement?: boolean
      replacementRequested?: boolean
    },
  ) {
    return this.instancesService.update(id, body)
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.instancesService.delete(id);
  }
}
