import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { ProductUsageController } from './product-usage.controller'
import { ProductUsageService } from './product-usage.service'

@Module({
  imports: [PrismaModule],
  controllers: [ProductUsageController],
  providers: [ProductUsageService],
  exports: [ProductUsageService],
})
export class ProductUsageModule {}
