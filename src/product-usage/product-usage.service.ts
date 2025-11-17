import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ProductUsageService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    technicianId: number
    productId: number
    quantity: number
    note?: string
    serviceOrder?: string
    clientName?: string
  }) {
    const usage = await this.prisma.productUsage.create({
      data,
      include: {
        product: true,
        technician: true,
      },
    })

    // Criar movimento de estoque (saída do almoxarifado do técnico)
    await this.prisma.stockMovement.create({
      data: {
        productId: data.productId,
        type: 'OUT',
        quantity: data.quantity,
        technicianId: data.technicianId,
        referenceType: 'USAGE',
        referenceId: usage.id,
        occurredAt: new Date(),
        note: data.note || `Uso registrado - ${data.clientName || 'Cliente'}`,
      },
    })

    return usage
  }

  async list() {
    return this.prisma.productUsage.findMany({
      include: {
        product: true,
        technician: true,
      },
      orderBy: {
        usedAt: 'desc',
      },
    })
  }

  async getByTechnician(technicianId: number) {
    return this.prisma.productUsage.findMany({
      where: {
        technicianId,
      },
      include: {
        product: true,
      },
      orderBy: {
        usedAt: 'desc',
      },
    })
  }

  async getByProduct(productId: number) {
    return this.prisma.productUsage.findMany({
      where: {
        productId,
      },
      include: {
        technician: true,
      },
      orderBy: {
        usedAt: 'desc',
      },
    })
  }

  async getByPeriod(startDate: Date, endDate: Date) {
    return this.prisma.productUsage.findMany({
      where: {
        usedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        product: true,
        technician: true,
      },
      orderBy: {
        usedAt: 'desc',
      },
    })
  }
}
