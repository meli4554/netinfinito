import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async monthlyUsageByTechnician(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const usages = await this.prisma.productUsage.findMany({
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
    })

    const technicianMap = new Map()

    usages.forEach((usage) => {
      const techId = usage.technicianId
      if (!technicianMap.has(techId)) {
        technicianMap.set(techId, {
          technicianId: techId,
          technicianName: usage.technician.name,
          category: usage.technician.category,
          products: new Map(),
          totalUsages: 0,
        })
      }

      const techData = technicianMap.get(techId)
      techData.totalUsages++

      if (!techData.products.has(usage.productId)) {
        techData.products.set(usage.productId, {
          productId: usage.productId,
          sku: usage.product.sku,
          name: usage.product.name,
          unit: usage.product.unit,
          quantity: 0,
        })
      }

      const productData = techData.products.get(usage.productId)
      productData.quantity += Number(usage.quantity)
    })

    return Array.from(technicianMap.values()).map((tech) => ({
      ...tech,
      products: Array.from(tech.products.values()),
    }))
  }

  async monthlyUsageByProduct(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const usages = await this.prisma.productUsage.findMany({
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
    })

    const productMap = new Map()

    usages.forEach((usage) => {
      const prodId = usage.productId
      if (!productMap.has(prodId)) {
        productMap.set(prodId, {
          productId: prodId,
          sku: usage.product.sku,
          name: usage.product.name,
          unit: usage.product.unit,
          totalQuantity: 0,
          technicians: new Map(),
        })
      }

      const prodData = productMap.get(prodId)
      prodData.totalQuantity += Number(usage.quantity)

      if (!prodData.technicians.has(usage.technicianId)) {
        prodData.technicians.set(usage.technicianId, {
          technicianId: usage.technicianId,
          technicianName: usage.technician.name,
          quantity: 0,
        })
      }

      const techData = prodData.technicians.get(usage.technicianId)
      techData.quantity += Number(usage.quantity)
    })

    return Array.from(productMap.values()).map((prod) => ({
      ...prod,
      technicians: Array.from(prod.technicians.values()),
    }))
  }

  async usagePercentageByTechnician(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const usages = await this.prisma.productUsage.findMany({
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
    })

    const productTotals = new Map()
    const technicianUsage = new Map()

    // Calcular totais por produto
    usages.forEach((usage) => {
      const qty = Number(usage.quantity)
      productTotals.set(
        usage.productId,
        (productTotals.get(usage.productId) || 0) + qty,
      )

      const key = `${usage.technicianId}-${usage.productId}`
      if (!technicianUsage.has(key)) {
        technicianUsage.set(key, {
          technicianId: usage.technicianId,
          technicianName: usage.technician.name,
          category: usage.technician.category,
          productId: usage.productId,
          sku: usage.product.sku,
          productName: usage.product.name,
          quantity: 0,
          percentage: 0,
        })
      }

      technicianUsage.get(key).quantity += qty
    })

    // Calcular percentuais
    const results = Array.from(technicianUsage.values()).map((item) => {
      const total = productTotals.get(item.productId) || 1
      return {
        ...item,
        percentage: ((item.quantity / total) * 100).toFixed(2),
      }
    })

    // Agrupar por técnico
    const byTechnician = new Map()
    results.forEach((item) => {
      if (!byTechnician.has(item.technicianId)) {
        byTechnician.set(item.technicianId, {
          technicianId: item.technicianId,
          technicianName: item.technicianName,
          category: item.category,
          products: [],
        })
      }

      byTechnician.get(item.technicianId).products.push({
        productId: item.productId,
        sku: item.sku,
        productName: item.productName,
        quantity: item.quantity,
        percentage: item.percentage,
      })
    })

    return Array.from(byTechnician.values())
  }

  async stockSummary() {
    const movements = await this.prisma.stockMovement.findMany({
      include: {
        product: true,
        technician: true,
      },
    })

    // Estoque do almoxarifado principal
    const mainStock = new Map()

    // Estoque dos técnicos
    const techStock = new Map()

    movements.forEach((movement) => {
      const qty = Number(movement.quantity)
      const prodId = movement.productId

      // Se não tem técnico, é do almoxarifado principal
      if (!movement.technicianId) {
        if (!mainStock.has(prodId)) {
          mainStock.set(prodId, {
            productId: prodId,
            sku: movement.product.sku,
            name: movement.product.name,
            unit: movement.product.unit,
            quantity: 0,
          })
        }

        const stock = mainStock.get(prodId)
        if (movement.type === 'IN') {
          stock.quantity += qty
        } else if (movement.type === 'OUT') {
          stock.quantity -= qty
        }
      } else {
        // Estoque do técnico
        const key = `${movement.technicianId}-${prodId}`
        if (!techStock.has(key)) {
          techStock.set(key, {
            technicianId: movement.technicianId,
            technicianName: movement.technician?.name || 'N/A',
            productId: prodId,
            sku: movement.product.sku,
            name: movement.product.name,
            unit: movement.product.unit,
            quantity: 0,
          })
        }

        const stock = techStock.get(key)
        if (movement.type === 'IN' || movement.type === 'TRANSFER') {
          stock.quantity += qty
        } else if (movement.type === 'OUT') {
          stock.quantity -= qty
        }
      }
    })

    return {
      mainWarehouse: Array.from(mainStock.values()).filter(
        (item) => item.quantity > 0,
      ),
      technicians: Array.from(techStock.values()).filter(
        (item) => item.quantity > 0,
      ),
    }
  }
}
