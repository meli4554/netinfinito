import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { WarehouseType } from '@prisma/client'

@Injectable()
export class WarehousesService {
  constructor(private prisma: PrismaService) {}

  async list() {
    return this.prisma.warehouse.findMany({
      include: {
        technician: true,
        locations: true,
        _count: {
          select: {
            locations: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  async findOne(id: number) {
    return this.prisma.warehouse.findUnique({
      where: { id },
      include: {
        technician: true,
        locations: true,
      },
    })
  }

  async getStock(id: number) {
    // Buscar todos os movimentos de estoque relacionados a este almoxarifado
    // através das locations
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
      include: {
        locations: {
          include: {
            movements: {
              include: {
                product: true,
              },
              orderBy: {
                occurredAt: 'desc',
              },
            },
          },
        },
        technician: true,
      },
    })

    if (!warehouse) {
      throw new BadRequestException('Almoxarifado não encontrado')
    }

    // Se for almoxarifado de técnico, buscar também itens de transferências
    let transfers = []
    if (warehouse.type === 'TECHNICIAN' && warehouse.technicianId) {
      transfers = await this.prisma.transfer.findMany({
        where: {
          technicianId: warehouse.technicianId,
          status: {
            in: ['IN_HANDS', 'PARTIALLY_USED', 'PARTIALLY_RETURNED'],
          },
        },
        include: {
          items: {
            where: {
              status: {
                in: ['IN_HANDS', 'PENDING'],
              },
            },
            include: {
              product: true,
            },
          },
        },
      })
    }

    return {
      warehouse,
      transfers,
    }
  }

  async create(data: {
    name: string
    code: string
    type: WarehouseType
    technicianId?: number
  }) {
    // Verificar se o código já existe
    const existing = await this.prisma.warehouse.findUnique({
      where: { code: data.code },
    })

    if (existing) {
      throw new BadRequestException('Já existe um almoxarifado com este código')
    }

    // Se for almoxarifado de técnico, verificar se o técnico existe
    if (data.type === 'TECHNICIAN' && data.technicianId) {
      const technician = await this.prisma.technician.findUnique({
        where: { id: data.technicianId },
        include: { warehouse: true },
      })

      if (!technician) {
        throw new BadRequestException('Técnico não encontrado')
      }

      if (technician.warehouse) {
        throw new BadRequestException(
          'Este técnico já possui um almoxarifado associado',
        )
      }
    }

    return this.prisma.warehouse.create({
      data: {
        name: data.name,
        code: data.code,
        type: data.type,
        technicianId: data.technicianId,
      },
      include: {
        technician: true,
        locations: true,
      },
    })
  }

  async update(
    id: number,
    data: {
      name?: string
      code?: string
      type?: WarehouseType
      technicianId?: number
    },
  ) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
    })

    if (!warehouse) {
      throw new BadRequestException('Almoxarifado não encontrado')
    }

    // Se estiver mudando o código, verificar se já existe
    if (data.code && data.code !== warehouse.code) {
      const existing = await this.prisma.warehouse.findUnique({
        where: { code: data.code },
      })

      if (existing) {
        throw new BadRequestException(
          'Já existe um almoxarifado com este código',
        )
      }
    }

    // Se estiver associando a um técnico, verificar
    if (data.technicianId !== undefined && data.technicianId !== null) {
      const technician = await this.prisma.technician.findUnique({
        where: { id: data.technicianId },
        include: { warehouse: true },
      })

      if (!technician) {
        throw new BadRequestException('Técnico não encontrado')
      }

      if (
        technician.warehouse &&
        technician.warehouse.id !== id
      ) {
        throw new BadRequestException(
          'Este técnico já possui um almoxarifado associado',
        )
      }
    }

    return this.prisma.warehouse.update({
      where: { id },
      data: {
        name: data.name,
        code: data.code,
        type: data.type,
        technicianId: data.technicianId,
      },
      include: {
        technician: true,
        locations: true,
      },
    })
  }

  async delete(id: number) {
    // Verificar se existem transferências relacionadas
    const transfersFrom = await this.prisma.transfer.count({
      where: { fromWarehouseId: id },
    })

    const transfersTo = await this.prisma.transfer.count({
      where: { toWarehouseId: id },
    })

    if (transfersFrom > 0 || transfersTo > 0) {
      throw new BadRequestException(
        'Não é possível excluir este almoxarifado pois existem transferências associadas',
      )
    }

    // Excluir locations primeiro
    await this.prisma.location.deleteMany({
      where: { warehouseId: id },
    })

    return this.prisma.warehouse.delete({
      where: { id },
    })
  }
}
