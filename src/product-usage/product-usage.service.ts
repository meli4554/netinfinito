import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'

@Injectable()
export class ProductUsageService {
  constructor(private db: DatabaseService) {}

  async create(data: {
    technicianId: number
    productId: number
    quantity: number
    note?: string
    serviceOrder?: string
    clientName?: string
  }) {
    // Criar usage
    const result = await this.db.execute(
      `INSERT INTO ProductUsage (technicianId, productId, quantity, note, serviceOrder, clientName)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.technicianId,
        data.productId,
        data.quantity,
        data.note || null,
        data.serviceOrder || null,
        data.clientName || null
      ]
    )

    const usageId = result.insertId

    // Criar movimento de estoque (saída do almoxarifado do técnico)
    await this.db.execute(
      `INSERT INTO StockMovement (productId, type, quantity, technicianId, referenceType, referenceId, occurredAt, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.productId,
        'OUT',
        data.quantity,
        data.technicianId,
        'USAGE',
        usageId,
        new Date(),
        data.note || `Uso registrado - ${data.clientName || 'Cliente'}`
      ]
    )

    // Buscar usage criado com relacionamentos
    const usage = await this.db.queryOne<any>(`
      SELECT
        pu.*,
        p.id as product_id,
        p.sku as product_sku,
        p.name as product_name,
        p.unit as product_unit,
        t.id as technician_id,
        t.name as technician_name,
        t.category as technician_category
      FROM ProductUsage pu
      INNER JOIN Product p ON p.id = pu.productId
      INNER JOIN Technician t ON t.id = pu.technicianId
      WHERE pu.id = ?
    `, [usageId])

    return {
      id: usage.id,
      technicianId: usage.technicianId,
      productId: usage.productId,
      quantity: usage.quantity,
      usedAt: usage.usedAt,
      note: usage.note,
      serviceOrder: usage.serviceOrder,
      clientName: usage.clientName,
      product: {
        id: usage.product_id,
        sku: usage.product_sku,
        name: usage.product_name,
        unit: usage.product_unit
      },
      technician: {
        id: usage.technician_id,
        name: usage.technician_name,
        category: usage.technician_category
      }
    }
  }

  async list() {
    const usages = await this.db.query<any>(`
      SELECT
        pu.*,
        p.id as product_id,
        p.sku as product_sku,
        p.name as product_name,
        p.unit as product_unit,
        t.id as technician_id,
        t.name as technician_name,
        t.category as technician_category
      FROM ProductUsage pu
      INNER JOIN Product p ON p.id = pu.productId
      INNER JOIN Technician t ON t.id = pu.technicianId
      ORDER BY pu.usedAt DESC
    `)

    return usages.map(usage => ({
      id: usage.id,
      technicianId: usage.technicianId,
      productId: usage.productId,
      quantity: usage.quantity,
      usedAt: usage.usedAt,
      note: usage.note,
      serviceOrder: usage.serviceOrder,
      clientName: usage.clientName,
      product: {
        id: usage.product_id,
        sku: usage.product_sku,
        name: usage.product_name,
        unit: usage.product_unit
      },
      technician: {
        id: usage.technician_id,
        name: usage.technician_name,
        category: usage.technician_category
      }
    }))
  }

  async getByTechnician(technicianId: number) {
    const usages = await this.db.query<any>(`
      SELECT
        pu.*,
        p.id as product_id,
        p.sku as product_sku,
        p.name as product_name,
        p.unit as product_unit
      FROM ProductUsage pu
      INNER JOIN Product p ON p.id = pu.productId
      WHERE pu.technicianId = ?
      ORDER BY pu.usedAt DESC
    `, [technicianId])

    return usages.map(usage => ({
      id: usage.id,
      technicianId: usage.technicianId,
      productId: usage.productId,
      quantity: usage.quantity,
      usedAt: usage.usedAt,
      note: usage.note,
      serviceOrder: usage.serviceOrder,
      clientName: usage.clientName,
      product: {
        id: usage.product_id,
        sku: usage.product_sku,
        name: usage.product_name,
        unit: usage.product_unit
      }
    }))
  }

  async getByProduct(productId: number) {
    const usages = await this.db.query<any>(`
      SELECT
        pu.*,
        t.id as technician_id,
        t.name as technician_name,
        t.category as technician_category
      FROM ProductUsage pu
      INNER JOIN Technician t ON t.id = pu.technicianId
      WHERE pu.productId = ?
      ORDER BY pu.usedAt DESC
    `, [productId])

    return usages.map(usage => ({
      id: usage.id,
      technicianId: usage.technicianId,
      productId: usage.productId,
      quantity: usage.quantity,
      usedAt: usage.usedAt,
      note: usage.note,
      serviceOrder: usage.serviceOrder,
      clientName: usage.clientName,
      technician: {
        id: usage.technician_id,
        name: usage.technician_name,
        category: usage.technician_category
      }
    }))
  }

  async getByPeriod(startDate: Date, endDate: Date) {
    const usages = await this.db.query<any>(`
      SELECT
        pu.*,
        p.id as product_id,
        p.sku as product_sku,
        p.name as product_name,
        p.unit as product_unit,
        t.id as technician_id,
        t.name as technician_name,
        t.category as technician_category
      FROM ProductUsage pu
      INNER JOIN Product p ON p.id = pu.productId
      INNER JOIN Technician t ON t.id = pu.technicianId
      WHERE pu.usedAt >= ? AND pu.usedAt <= ?
      ORDER BY pu.usedAt DESC
    `, [startDate, endDate])

    return usages.map(usage => ({
      id: usage.id,
      technicianId: usage.technicianId,
      productId: usage.productId,
      quantity: usage.quantity,
      usedAt: usage.usedAt,
      note: usage.note,
      serviceOrder: usage.serviceOrder,
      clientName: usage.clientName,
      product: {
        id: usage.product_id,
        sku: usage.product_sku,
        name: usage.product_name,
        unit: usage.product_unit
      },
      technician: {
        id: usage.technician_id,
        name: usage.technician_name,
        category: usage.technician_category
      }
    }))
  }
}
