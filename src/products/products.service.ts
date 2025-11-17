import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { Decimal } from '@prisma/client/runtime/library'

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  // Gerar SKU automático
  private async generateSKU(): Promise<string> {
    const count = await this.prisma.product.count()
    const nextNumber = count + 1
    return `PROD-${nextNumber.toString().padStart(6, '0')}`
  }

  async create(dto: {
    sku?: string
    name: string
    unit?: string
    barCode?: string
    minStock?: number
    trackSerial?: boolean
    initialQuantity?: number
    instances?: Array<{ serialNumber?: string; macAddress?: string }>
  }) {
    // Gerar SKU automaticamente se não fornecido
    const sku = dto.sku || (await this.generateSKU())

    const product = await this.prisma.product.create({
      data: {
        sku,
        name: dto.name,
        unit: dto.unit || 'UN',
        barCode: dto.barCode,
        minStock: dto.minStock || 0,
        trackSerial: dto.trackSerial || false,
      },
    })

    // Se tiver quantidade inicial, criar movimento de entrada no almoxarifado principal
    if (dto.initialQuantity && dto.initialQuantity > 0) {
      await this.prisma.stockMovement.create({
        data: {
          productId: product.id,
          type: 'IN',
          quantity: new Decimal(dto.initialQuantity),
          referenceType: 'ENTRY',
          referenceId: product.id,
          occurredAt: new Date(),
          note: 'Estoque inicial',
        },
      })
    }

    // Se rastrear serial/MAC e tiver instances, criar registros
    if (dto.trackSerial && dto.instances && dto.instances.length > 0) {
      await this.prisma.productInstance.createMany({
        data: dto.instances.map((inst) => ({
          productId: product.id,
          serialNumber: inst.serialNumber || null,
          macAddress: inst.macAddress || null,
        })),
      })
    }

    return product
  }

  async list() {
    const products = await this.prisma.product.findMany({
      include: {
        _count: {
          select: { instances: true },
        },
      },
      orderBy: { id: 'desc' }, // Mais recentes primeiro
    })

    // Calcular estoque atual para cada produto
    const productsWithStock = await Promise.all(
      products.map(async (product) => {
        // Somar entradas (IN, TRANSFER) e subtrair saídas (OUT)
        const movements = await this.prisma.stockMovement.findMany({
          where: { productId: product.id },
          select: { type: true, quantity: true },
        })

        let currentStock = 0
        movements.forEach((mov) => {
          if (mov.type === 'IN' || mov.type === 'TRANSFER') {
            currentStock += Number(mov.quantity)
          } else if (mov.type === 'OUT') {
            currentStock -= Number(mov.quantity)
          }
        })

        return {
          ...product,
          currentStock,
        }
      })
    )

    return productsWithStock
  }

  async getById(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        instances: true,
      },
    })
  }

  update(id: number, dto: any) {
    return this.prisma.product.update({ where: { id }, data: dto })
  }

  async delete(id: number) {
    // Excluir TODAS as dependências do produto
    // (útil para dados de teste/fictícios)

    // 1. Excluir registros de uso do produto
    await this.prisma.productUsage.deleteMany({
      where: { productId: id },
    })

    // 2. Excluir itens de transferência
    await this.prisma.transferItem.deleteMany({
      where: { productId: id },
    })

    // 3. Excluir movimentações de estoque
    await this.prisma.stockMovement.deleteMany({
      where: { productId: id },
    })

    // 4. Excluir instâncias do produto (serial/MAC)
    await this.prisma.productInstance.deleteMany({
      where: { productId: id },
    })

    // 5. Excluir o produto
    return this.prisma.product.delete({
      where: { id },
    })
  }
}