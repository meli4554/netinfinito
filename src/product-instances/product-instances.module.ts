import { Module } from '@nestjs/common';
import { ProductInstancesService } from './product-instances.service';
import { ProductInstancesController } from './product-instances.controller';

@Module({
  providers: [ProductInstancesService],
  controllers: [ProductInstancesController],
  exports: [ProductInstancesService],
})
export class ProductInstancesModule {}
