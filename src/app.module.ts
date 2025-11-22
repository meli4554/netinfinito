import { Module } from '@nestjs/common'
import { DatabaseModule } from './database/database.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { ProductsModule } from './products/products.module'
import { ProductInstancesModule } from './product-instances/product-instances.module'
import { InventoryModule } from './inventory/inventory.module'
import { TechniciansModule } from './technicians/technicians.module'
import { WarehousesModule } from './warehouses/warehouses.module'
import { TransfersModule } from './transfers/transfers.module'
import { ProductUsageModule } from './product-usage/product-usage.module'
import { ReportsModule } from './reports/reports.module'
import { StockMovementsModule } from './stock-movements/stock-movements.module'
import { AccountingModule } from './accounting/accounting.module'

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    ProductInstancesModule,
    InventoryModule,
    TechniciansModule,
    WarehousesModule,
    TransfersModule,
    ProductUsageModule,
    ReportsModule,
    StockMovementsModule,
    AccountingModule,
  ],
})
export class AppModule {}