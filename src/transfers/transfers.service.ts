import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { TransferStatus } from '@prisma/client'

@Injectable()
export class TransfersService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
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
  }) {
    const lastTransfer = await this.prisma.transfer.findFirst({
      orderBy: { id: 'desc' },
    })

    const nextNumber = lastTransfer
      ? `TRF-${String(lastTransfer.id + 1).padStart(6, '0')}`
      : 'TRF-000001'

    return this.prisma.transfer.create({
      data: {
        number: nextNumber,
        fromWarehouseId: data.fromWarehouseId,
        toWarehouseId: data.toWarehouseId,
        technicianId: data.technicianId,
        createdBy: data.createdBy,
        note: data.note,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            productInstanceId: item.productInstanceId,
            serialNumber: item.serialNumber,
            macAddress: item.macAddress,
            invoiceNumber: item.invoiceNumber,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        fromWarehouse: true,
        toWarehouse: true,
        technician: true,
      },
    })
  }

  async list() {
    return this.prisma.transfer.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
        fromWarehouse: true,
        toWarehouse: true,
        technician: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  async findOne(id: number) {
    return this.prisma.transfer.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        fromWarehouse: true,
        toWarehouse: true,
        technician: true,
      },
    })
  }

  async setStatus(id: number, status: TransferStatus) {
    const transfer = await this.prisma.transfer.update({
      where: { id },
      data: {
        status,
        transferredAt: status === 'TRANSFERRED' ? new Date() : undefined,
        receivedAt: status === 'RECEIVED' ? new Date() : undefined,
      },
      include: {
        items: true,
      },
    })

    // Se o status for TRANSFERRED, criar movimentos de estoque
    if (status === 'TRANSFERRED') {
      for (const item of transfer.items) {
        // Saída do almoxarifado de origem
        await this.prisma.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'OUT',
            quantity: item.quantity,
            referenceType: 'TRANSFER',
            referenceId: transfer.id,
            occurredAt: new Date(),
            note: `Transferência ${transfer.number} para técnico`,
          },
        })

        // Entrada no almoxarifado do técnico
        await this.prisma.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'TRANSFER',
            quantity: item.quantity,
            technicianId: transfer.technicianId,
            referenceType: 'TRANSFER',
            referenceId: transfer.id,
            occurredAt: new Date(),
            note: `Transferência ${transfer.number} recebida`,
          },
        })
      }
    }

    return transfer
  }

  async getByTechnician(technicianId: number) {
    return this.prisma.transfer.findMany({
      where: {
        technicianId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        fromWarehouse: true,
        toWarehouse: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  async listActive() {
    return this.prisma.transfer.findMany({
      where: {
        status: {
          in: ['PENDING', 'IN_HANDS', 'PARTIALLY_USED', 'PARTIALLY_RETURNED'],
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        technician: true,
        fromWarehouse: true,
        toWarehouse: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  async searchProductBySerial(query: string) {
    return this.prisma.productInstance.findMany({
      where: {
        OR: [
          { serialNumber: { contains: query } },
          { macAddress: { contains: query } },
        ],
        status: 'AVAILABLE',
      },
      include: {
        product: true,
      },
      take: 10,
    })
  }

  async markAsTransferred(id: number) {
    return this.prisma.transfer.update({
      where: { id },
      data: {
        status: 'IN_HANDS',
        transferredAt: new Date(),
        items: {
          updateMany: {
            where: { transferId: id },
            data: { status: 'IN_HANDS' },
          },
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        technician: true,
      },
    })
  }

  async markItemAsUsed(
    itemId: number,
    data: { ixcClientCode?: string; usageNote?: string },
  ) {
    const item = await this.prisma.transferItem.update({
      where: { id: itemId },
      data: {
        status: 'USED',
        usedAt: new Date(),
        ixcClientCode: data.ixcClientCode,
        usageNote: data.usageNote,
      },
      include: {
        transfer: {
          include: {
            items: true,
          },
        },
      },
    })

    // Atualizar status da transferência
    await this.updateTransferStatus(item.transfer.id)

    return item
  }

  async markItemAsReturned(itemId: number) {
    const item = await this.prisma.transferItem.update({
      where: { id: itemId },
      data: {
        status: 'RETURNED',
        returnedAt: new Date(),
      },
      include: {
        transfer: {
          include: {
            items: true,
          },
        },
      },
    })

    // Atualizar status da transferência
    await this.updateTransferStatus(item.transfer.id)

    return item
  }

  private async updateTransferStatus(transferId: number) {
    const transfer = await this.prisma.transfer.findUnique({
      where: { id: transferId },
      include: { items: true },
    })

    if (!transfer) return

    const allUsed = transfer.items.every((item) => item.status === 'USED')
    const allReturned = transfer.items.every((item) => item.status === 'RETURNED')
    const someUsed = transfer.items.some((item) => item.status === 'USED')
    const someReturned = transfer.items.some((item) => item.status === 'RETURNED')

    let newStatus = transfer.status

    if (allReturned) {
      newStatus = 'RETURNED'
    } else if (allUsed) {
      newStatus = 'USED'
    } else if (someReturned) {
      newStatus = 'PARTIALLY_RETURNED'
    } else if (someUsed) {
      newStatus = 'PARTIALLY_USED'
    }

    if (newStatus !== transfer.status) {
      await this.prisma.transfer.update({
        where: { id: transferId },
        data: { status: newStatus },
      })
    }
  }

  async uploadSignature(
    id: number,
    type: 'digital' | 'upload',
    file?: Express.Multer.File,
  ) {
    // TODO: Implementar upload do arquivo
    // Por enquanto, apenas atualizar o tipo
    return this.prisma.transfer.update({
      where: { id },
      data: {
        signatureType: type,
        signatureFile: file ? `signatures/${file.filename}` : null,
      },
    })
  }

  async generateReport(id: number) {
    const transfer = await this.findOne(id)
    // TODO: Implementar geração de PDF
    // Por enquanto, apenas retornar os dados
    return {
      transfer,
      reportUrl: `/reports/transfer-${id}.pdf`,
    }
  }
}
