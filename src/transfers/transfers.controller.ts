import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { TransfersService } from './transfers.service'

type TransferStatus = 'PENDING' | 'IN_HANDS' | 'PARTIALLY_USED' | 'USED' | 'PARTIALLY_RETURNED' | 'RETURNED' | 'CANCELED'
type TransferItemStatus = 'PENDING' | 'IN_HANDS' | 'USED' | 'RETURNED'

@Controller('transfers')
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @Post()
  create(
    @Body()
    body: {
      fromWarehouseId: number
      toWarehouseId: number
      technicianId: number
      items: Array<{
        productId: number
        productInstanceId?: number
        serialNumber?: string
        macAddress?: string
        invoiceNumber?: string
        quantity: number
      }>
      createdBy?: string
      note?: string
    },
  ) {
    return this.transfersService.create(body)
  }

  @Get()
  list() {
    return this.transfersService.list()
  }

  @Get('active')
  listActive() {
    return this.transfersService.listActive()
  }

  @Get('search-product')
  searchProduct(@Query('q') query: string) {
    return this.transfersService.searchProductBySerial(query)
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.transfersService.findOne(id)
  }

  @Patch(':id/transfer')
  markAsTransferred(@Param('id', ParseIntPipe) id: number) {
    return this.transfersService.markAsTransferred(id)
  }

  @Patch(':id/revert')
  revertTransfer(@Param('id', ParseIntPipe) id: number) {
    return this.transfersService.revertTransfer(id)
  }

  @Patch(':id/items/:itemId/use')
  markItemAsUsed(
    @Param('id', ParseIntPipe) id: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() body: { ixcClientCode?: string; usageNote?: string },
  ) {
    return this.transfersService.markItemAsUsed(itemId, body)
  }

  @Patch(':id/items/:itemId/return')
  markItemAsReturned(
    @Param('id', ParseIntPipe) id: number,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return this.transfersService.markItemAsReturned(itemId)
  }

  @Post(':id/signature')
  @UseInterceptors(FileInterceptor('file'))
  uploadSignature(
    @Param('id', ParseIntPipe) id: number,
    @Body('type') type: 'digital' | 'upload',
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.transfersService.uploadSignature(id, type, file)
  }

  @Get(':id/report')
  generateReport(@Param('id', ParseIntPipe) id: number) {
    return this.transfersService.generateReport(id)
  }

  @Patch(':id/status')
  setStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: TransferStatus,
  ) {
    return this.transfersService.setStatus(id, status)
  }

  @Get('technician/:technicianId')
  getByTechnician(@Param('technicianId', ParseIntPipe) technicianId: number) {
    return this.transfersService.getByTechnician(technicianId)
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.transfersService.delete(id)
  }
}
