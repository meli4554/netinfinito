import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'

// Define o enum localmente
type TechnicianCategory = 'FIBRA' | 'RADIO' | 'INSTALACAO' | 'MANUTENCAO' | 'OUTROS'

interface Technician {
  id: number
  name: string
  category: TechnicianCategory
  phone: string | null
  email: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface Warehouse {
  id: number
  name: string
  code: string
  type: string
  technicianId: number | null
  createdAt: Date
  updatedAt: Date
}

interface Location {
  id: number
  name: string
  code: string
  warehouseId: number
  createdAt: Date
  updatedAt: Date
}

interface StockMovement {
  id: number
  productId: number
  type: string
  quantity: number
  technicianId: number | null
  locationId: number | null
  referenceType: string | null
  referenceId: number | null
  occurredAt: Date
  invoiceNumber: string | null
  invoiceDate: Date | null
  invoiceFile: string | null
  receivedAt: Date | null
  supplier: string | null
  note: string | null
}

interface Product {
  id: number
  sku: string
  name: string
  unit: string
}

@Injectable()
export class TechniciansService {
  constructor(private db: DatabaseService) {}

  async create(data: {
    name: string
    category: TechnicianCategory
    phone?: string
    email?: string
  }) {
    // Criar técnico
    const result = await this.db.execute(
      'INSERT INTO Technician (name, category, phone, email) VALUES (?, ?, ?, ?)',
      [data.name, data.category, data.phone || null, data.email || null]
    )

    const technicianId = result.insertId

    // Criar almoxarifado do técnico automaticamente
    await this.db.execute(
      'INSERT INTO Warehouse (name, code, type, technicianId) VALUES (?, ?, ?, ?)',
      [`Almoxarifado - ${data.name}`, `TECH-${technicianId}`, 'TECHNICIAN', technicianId]
    )

    // Buscar técnico criado
    const technician = await this.db.queryOne<Technician>(
      'SELECT * FROM Technician WHERE id = ?',
      [technicianId]
    )

    return technician
  }

  async list() {
    const sql = `
      SELECT
        t.*,
        w.id as warehouse_id,
        w.name as warehouse_name,
        w.code as warehouse_code,
        w.type as warehouse_type,
        w.createdAt as warehouse_createdAt
      FROM Technician t
      LEFT JOIN Warehouse w ON w.technicianId = t.id
      WHERE t.isActive = 1
      ORDER BY t.name ASC
    `

    const rows = await this.db.query<any>(sql)

    // Remover duplicados (quando técnico tem warehouse)
    const unique = new Map()
    rows.forEach(row => {
      if (!unique.has(row.id)) {
        unique.set(row.id, {
          id: row.id,
          name: row.name,
          category: row.category,
          phone: row.phone,
          email: row.email,
          isActive: Boolean(row.isActive),
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          warehouse: row.warehouse_id ? {
            id: row.warehouse_id,
            name: row.warehouse_name,
            code: row.warehouse_code,
            type: row.warehouse_type,
            technicianId: row.id,
            createdAt: row.warehouse_createdAt
          } : null
        })
      }
    })

    return Array.from(unique.values())
  }

  async findOne(id: number) {
    const sql = `
      SELECT
        t.*,
        w.id as warehouse_id,
        w.name as warehouse_name,
        w.code as warehouse_code,
        w.type as warehouse_type,
        w.createdAt as warehouse_createdAt,
        w.updatedAt as warehouse_updatedAt
      FROM Technician t
      LEFT JOIN Warehouse w ON w.technicianId = t.id
      WHERE t.id = ?
    `

    const technician = await this.db.queryOne<any>(sql, [id])

    if (!technician) return null

    // Buscar locations do warehouse
    const locations = technician.warehouse_id
      ? await this.db.query<Location>(
          'SELECT * FROM Location WHERE warehouseId = ?',
          [technician.warehouse_id]
        )
      : []

    return {
      id: technician.id,
      name: technician.name,
      category: technician.category,
      phone: technician.phone,
      email: technician.email,
      isActive: technician.isActive,
      createdAt: technician.createdAt,
      updatedAt: technician.updatedAt,
      warehouse: technician.warehouse_id ? {
        id: technician.warehouse_id,
        name: technician.warehouse_name,
        code: technician.warehouse_code,
        type: technician.warehouse_type,
        technicianId: technician.id,
        createdAt: technician.warehouse_createdAt,
        updatedAt: technician.warehouse_updatedAt,
        locations: locations
      } : null
    }
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
    const updates: string[] = []
    const values: any[] = []

    if (data.name !== undefined) {
      updates.push('name = ?')
      values.push(data.name)
    }
    if (data.category !== undefined) {
      updates.push('category = ?')
      values.push(data.category)
    }
    if (data.phone !== undefined) {
      updates.push('phone = ?')
      values.push(data.phone)
    }
    if (data.email !== undefined) {
      updates.push('email = ?')
      values.push(data.email)
    }
    if (data.isActive !== undefined) {
      updates.push('isActive = ?')
      values.push(data.isActive ? 1 : 0)
    }

    if (updates.length === 0) {
      return this.db.queryOne<Technician>('SELECT * FROM Technician WHERE id = ?', [id])
    }

    values.push(id)

    await this.db.execute(
      `UPDATE Technician SET ${updates.join(', ')} WHERE id = ?`,
      values
    )

    return this.db.queryOne<Technician>('SELECT * FROM Technician WHERE id = ?', [id])
  }

  async getStockSummary(technicianId: number) {
    const technician = await this.db.queryOne<Technician>(
      'SELECT * FROM Technician WHERE id = ?',
      [technicianId]
    )

    if (!technician) {
      throw new Error('Técnico ou almoxarifado não encontrado')
    }

    const warehouse = await this.db.queryOne<Warehouse>(
      'SELECT * FROM Warehouse WHERE technicianId = ?',
      [technicianId]
    )

    if (!warehouse) {
      throw new Error('Técnico ou almoxarifado não encontrado')
    }

    // Buscar movimentos
    const movements = await this.db.query<any>(`
      SELECT
        sm.*,
        p.sku,
        p.name,
        p.unit
      FROM StockMovement sm
      INNER JOIN Product p ON p.id = sm.productId
      WHERE sm.technicianId = ?
    `, [technicianId])

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
        sku: movement.sku,
        name: movement.name,
        unit: movement.unit,
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
    const technician = await this.db.queryOne<Technician>(
      'SELECT * FROM Technician WHERE id = ?',
      [id]
    )

    if (!technician) {
      throw new Error('Técnico não encontrado')
    }

    // Buscar warehouse do técnico
    const warehouse = await this.db.queryOne<Warehouse>(
      'SELECT * FROM Warehouse WHERE technicianId = ?',
      [id]
    )

    // Deletar o almoxarifado do técnico (se existir)
    if (warehouse) {
      await this.db.execute('DELETE FROM Warehouse WHERE id = ?', [warehouse.id])
    }

    // Deletar o técnico
    await this.db.execute('DELETE FROM Technician WHERE id = ?', [id])

    return { message: 'Técnico excluído com sucesso' }
  }
}
