import { Controller, Get, Query } from '@nestjs/common'
import { AccountingService } from './accounting.service'

@Controller('accounting')
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Get('usage-by-technician')
  getUsageByTechnician(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.accountingService.getUsageByTechnician(startDate, endDate)
  }

  @Get('usage-summary')
  getUsageSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.accountingService.getUsageSummary(startDate, endDate)
  }
}
