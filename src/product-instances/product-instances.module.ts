import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductInstancesService } from './product-instances.service';
import { ProductInstancesController } from './product-instances.controller';

@Module({
  imports: [PrismaModule],
  providers: [ProductInstancesService],
  controllers: [ProductInstancesController],
  exports: [ProductInstancesService],
})
export class ProductInstancesModule {}
