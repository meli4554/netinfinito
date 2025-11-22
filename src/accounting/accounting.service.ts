import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'

@Injectable()
export class AccountingService {
  constructor(private db: DatabaseService) {}

  async getUsageByTechnician(startDate?: string, endDate?: string) {
    // Buscar todos os itens usados com informações do técnico e produto
    const whereConditions = ['ti.status = ?']
    const params: any[] = ['USED']

    if (startDate) {
      whereConditions.push('DATE(ti.usedAt) >= ?')
      params.push(startDate)
    }

    if (endDate) {
      whereConditions.push('DATE(ti.usedAt) <= ?')
      params.push(endDate)
    }

    const usedItems = await this.db.query<any>(`
      SELECT
        tech.id as technician_id,
        tech.name as technician_name,
        tech.category as technician_category,
        p.id as product_id,
        p.sku as product_sku,
        p.name as product_name,
        p.unit as product_unit,
        ti.id as item_id,
        ti.quantity,
        ti.serialNumber,
        ti.macAddress,
        ti.ixcClientCode,
        ti.usageNote,
        ti.usedAt,
        tr.number as transfer_number,
        tr.id as transfer_id
      FROM TransferItem ti
      INNER JOIN Transfer tr ON tr.id = ti.transferId
      INNER JOIN Technician tech ON tech.id = tr.technicianId
      INNER JOIN Product p ON p.id = ti.productId
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY tech.name ASC, ti.usedAt DESC
    `, params)

    // Agrupar por técnico
    const groupedByTechnician = usedItems.reduce((acc, item) => {
      const techId = item.technician_id

      if (!acc[techId]) {
        acc[techId] = {
          technician: {
            id: item.technician_id,
            name: item.technician_name,
            category: item.technician_category
          },
          items: [],
          totalItems: 0
        }
      }

      acc[techId].items.push({
        id: item.item_id,
        product: {
          id: item.product_id,
          sku: item.product_sku,
          name: item.product_name,
          unit: item.product_unit
        },
        quantity: item.quantity,
        serialNumber: item.serialNumber,
        macAddress: item.macAddress,
        ixcClientCode: item.ixcClientCode,
        usageNote: item.usageNote,
        usedAt: item.usedAt,
        transfer: {
          id: item.transfer_id,
          number: item.transfer_number
        }
      })

      acc[techId].totalItems += 1

      return acc
    }, {} as Record<number, any>)

    return Object.values(groupedByTechnician)
  }

  async getUsageSummary(startDate?: string, endDate?: string) {
    const whereConditions = ['ti.status = ?']
    const params: any[] = ['USED']

    if (startDate) {
      whereConditions.push('DATE(ti.usedAt) >= ?')
      params.push(startDate)
    }

    if (endDate) {
      whereConditions.push('DATE(ti.usedAt) <= ?')
      params.push(endDate)
    }

    // Resumo por produto
    const productSummary = await this.db.query<any>(`
      SELECT
        p.id as product_id,
        p.sku as product_sku,
        p.name as product_name,
        p.unit as product_unit,
        COUNT(ti.id) as total_used,
        SUM(ti.quantity) as total_quantity
      FROM TransferItem ti
      INNER JOIN Product p ON p.id = ti.productId
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY p.id, p.sku, p.name, p.unit
      ORDER BY total_used DESC
    `, params)

    // Total geral
    const totalSummary = await this.db.queryOne<any>(`
      SELECT
        COUNT(ti.id) as total_items,
        COUNT(DISTINCT tr.technicianId) as total_technicians
      FROM TransferItem ti
      INNER JOIN Transfer tr ON tr.id = ti.transferId
      WHERE ${whereConditions.join(' AND ')}
    `, params)

    return {
      products: productSummary.map(p => ({
        product: {
          id: p.product_id,
          sku: p.product_sku,
          name: p.product_name,
          unit: p.product_unit
        },
        totalUsed: p.total_used,
        totalQuantity: parseFloat(p.total_quantity)
      })),
      summary: {
        totalItems: totalSummary?.total_items || 0,
        totalTechnicians: totalSummary?.total_technicians || 0
      }
    }
  }
}
