import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const products = await this.prisma.product.findMany({ select: { id: true, sku: true, name: true } })
    const totals = await this.prisma.stockMovement.groupBy({ by: ['productId'], _sum: { quantity: true } })
    const map = new Map(totals.map(t => [t.productId, t._sum.quantity]))
    return products.map(p => ({ productId: p.id, sku: p.sku, name: p.name, quantity: map.get(p.id) ?? 0 }))
  }

  movements(productId: number) {
    return this.prisma.stockMovement.findMany({ where: { productId }, orderBy: { occurredAt: 'desc' } })
  }
}