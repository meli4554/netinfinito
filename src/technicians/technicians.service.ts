import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { TechnicianCategory } from '@prisma/client'

@Injectable()
export class TechniciansService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string
    category: TechnicianCategory
    phone?: string
    email?: string
  }) {
    const technician = await this.prisma.technician.create({
      data,
    })

    // Criar almoxarifado do técnico automaticamente
    await this.prisma.warehouse.create({
      data: {
        name: `Almoxarifado - ${data.name}`,
        code: `TECH-${technician.id}`,
        type: 'TECHNICIAN',
        technicianId: technician.id,
      },
    })

    return technician
  }

  async list() {
    return this.prisma.technician.findMany({
      include: {
        warehouse: true,
      },
      orderBy: {
        name: 'asc',
      },
    })
  }

  async findOne(id: number) {
    return this.prisma.technician.findUnique({
      where: { id },
      include: {
        warehouse: {
          include: {
            locations: true,
          },
        },
      },
    })
  }

  async update(
    id: number,
    data: {
      name?: string
      category?: TechnicianCategory
      phone?: string
      email?: string
      isActive?: boolean
    },
  ) {
    return this.prisma.technician.update({
      where: { id },
      data,
    })
  }

  async getStockSummary(technicianId: number) {
    const technician = await this.prisma.technician.findUnique({
      where: { id: technicianId },
      include: {
        warehouse: true,
      },
    })

    if (!technician || !technician.warehouse) {
      throw new Error('Técnico ou almoxarifado não encontrado')
    }

    const movements = await this.prisma.stockMovement.findMany({
      where: {
        technicianId,
      },
      include: {
        product: true,
      },
    })

    const stockMap = new Map<
      number,
      {
        productId: number
        sku: string
        name: string
        unit: string
        quantity: number
      }
    >()

    movements.forEach((movement) => {
      const existing = stockMap.get(movement.productId) || {
        productId: movement.productId,
        sku: movement.product.sku,
        name: movement.product.name,
        unit: movement.product.unit,
        quantity: 0,
      }

      if (movement.type === 'IN' || movement.type === 'TRANSFER') {
        existing.quantity += Number(movement.quantity)
      } else if (movement.type === 'OUT') {
        existing.quantity -= Number(movement.quantity)
      }

      stockMap.set(movement.productId, existing)
    })

    return Array.from(stockMap.values()).filter((item) => item.quantity > 0)
  }

  async delete(id: number) {
    // Verificar se o técnico existe
    const technician = await this.prisma.technician.findUnique({
      where: { id },
      include: {
        warehouse: true,
      },
    })

    if (!technician) {
      throw new Error('Técnico não encontrado')
    }

    // Deletar o almoxarifado do técnico (se existir)
    if (technician.warehouse) {
      await this.prisma.warehouse.delete({
        where: { id: technician.warehouse.id },
      })
    }

    // Deletar o técnico
    await this.prisma.technician.delete({
      where: { id },
    })

    return { message: 'Técnico excluído com sucesso' }
  }
}
