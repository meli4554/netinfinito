import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductInstancesService {
  constructor(private prisma: PrismaService) {}

  async createBulk(
    productId: number,
    instances: Array<{ serialNumber?: string; macAddress?: string }>,
  ) {
    // Buscar a StockMovement mais recente do produto com NF
    const latestMovement = await this.prisma.stockMovement.findFirst({
      where: {
        productId,
        type: 'IN',
        invoiceNumber: { not: null },
      },
      orderBy: { occurredAt: 'desc' },
    });

    // Criar instâncias com dados da NF (se houver)
    const created = await this.prisma.productInstance.createMany({
      data: instances.map((inst) => ({
        productId,
        serialNumber: inst.serialNumber || null,
        macAddress: inst.macAddress || null,
        invoiceNumber: latestMovement?.invoiceNumber || null,
        invoiceDate: latestMovement?.invoiceDate || null,
        invoiceFile: latestMovement?.invoiceFile || null,
        receivedAt: latestMovement?.receivedAt || null,
        supplier: latestMovement?.supplier || null,
        entryDate: latestMovement?.occurredAt || null,
        note: latestMovement?.note || null,
      })),
    });

    return created;
  }

  async findByProduct(productId: number) {
    const instances = await this.prisma.productInstance.findMany({
      where: { productId },
      select: {
        id: true,
        serialNumber: true,
        macAddress: true,
        status: true,
        invoiceNumber: true,
        invoiceDate: true,
        invoiceFile: true,
        receivedAt: true,
        supplier: true,
        entryDate: true,
        note: true,
        inutilizedReason: true,
        inutilizedAt: true,
        awaitingReplacement: true,
        replacementRequested: true,
        createdAt: true,
        updatedAt: true,
        product: {
          select: { id: true, sku: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return instances;
  }

  async findBySerial(serialNumber: string) {
    return this.prisma.productInstance.findFirst({
      where: { serialNumber },
      include: {
        product: true,
      },
    });
  }

  async findByMac(macAddress: string) {
    return this.prisma.productInstance.findFirst({
      where: { macAddress },
      include: {
        product: true,
      },
    });
  }

  async update(
    id: number,
    data: {
      serialNumber?: string
      macAddress?: string
      status?: string
      invoiceNumber?: string
      invoiceDate?: string
      inutilizedReason?: string
      inutilizedAt?: string
      awaitingReplacement?: boolean
      replacementRequested?: boolean
    },
  ) {
    return this.prisma.productInstance.update({
      where: { id },
      data: {
        ...data,
        invoiceDate: data.invoiceDate ? new Date(data.invoiceDate) : undefined,
        inutilizedAt: data.inutilizedAt
          ? new Date(data.inutilizedAt)
          : undefined,
      },
    })
  }

  async delete(id: number) {
    return this.prisma.productInstance.delete({
      where: { id },
    });
  }

  async getAvailableCount(productId: number) {
    return this.prisma.productInstance.count({
      where: {
        productId,
        status: 'AVAILABLE',
      },
    });
  }
}
