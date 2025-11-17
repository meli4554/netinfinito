import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common'
import { ReportsService } from './reports.service'

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('monthly-usage-by-technician')
  monthlyUsageByTechnician(
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ) {
    return this.reportsService.monthlyUsageByTechnician(year, month)
  }

  @Get('monthly-usage-by-product')
  monthlyUsageByProduct(
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ) {
    return this.reportsService.monthlyUsageByProduct(year, month)
  }

  @Get('usage-percentage')
  usagePercentageByTechnician(
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ) {
    return this.reportsService.usagePercentageByTechnician(year, month)
  }

  @Get('stock-summary')
  stockSummary() {
    return this.reportsService.stockSummary()
  }
}
