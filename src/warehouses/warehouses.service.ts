import { Injectable, BadRequestException } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'

type WarehouseType = 'MAIN' | 'TECHNICIAN' | 'EXTERNAL'

@Injectable()
export class WarehousesService {
  constructor(private db: DatabaseService) {}

  async list() {
    const sql = `
      SELECT
        w.*,
        t.id as technician_id,
        t.name as technician_name,
        t.category as technician_category,
        t.phone as technician_phone,
        t.email as technician_email,
        t.isActive as technician_isActive,
        (SELECT COUNT(*) FROM Location l WHERE l.warehouseId = w.id) as locations_count
      FROM Warehouse w
      LEFT JOIN Technician t ON t.id = w.technicianId
      ORDER BY w.createdAt DESC
    `

    const rows = await this.db.query<any>(sql)

    // Buscar locations para cada warehouse
    const warehousesWithLocations = await Promise.all(
      rows.map(async (row) => {
        const locations = await this.db.query(
          'SELECT * FROM Location WHERE warehouseId = ?',
          [row.id]
        )

        return {
          id: row.id,
          name: row.name,
          code: row.code,
          type: row.type,
          technicianId: row.technicianId,
          createdAt: row.createdAt,
          technician: row.technician_id ? {
            id: row.technician_id,
            name: row.technician_name,
            category: row.technician_category,
            phone: row.technician_phone,
            email: row.technician_email,
            isActive: row.technician_isActive
          } : null,
          locations: locations,
          _count: {
            locations: row.locations_count
          }
        }
      })
    )

    return warehousesWithLocations
  }

  async findOne(id: number) {
    const sql = `
      SELECT
        w.*,
        t.id as technician_id,
        t.name as technician_name,
        t.category as technician_category,
        t.phone as technician_phone,
        t.email as technician_email,
        t.isActive as technician_isActive
      FROM Warehouse w
      LEFT JOIN Technician t ON t.id = w.technicianId
      WHERE w.id = ?
    `

    const warehouse = await this.db.queryOne<any>(sql, [id])

    if (!warehouse) return null

    // Buscar locations
    const locations = await this.db.query(
      'SELECT * FROM Location WHERE warehouseId = ?',
      [id]
    )

    return {
      id: warehouse.id,
      name: warehouse.name,
      code: warehouse.code,
      type: warehouse.type,
      technicianId: warehouse.technicianId,
      createdAt: warehouse.createdAt,
      technician: warehouse.technician_id ? {
        id: warehouse.technician_id,
        name: warehouse.technician_name,
        category: warehouse.technician_category,
        phone: warehouse.technician_phone,
        email: warehouse.technician_email,
        isActive: warehouse.technician_isActive
      } : null,
      locations: locations
    }
  }

  async getStock(id: number) {
    // Buscar warehouse
    const warehouseSql = `
      SELECT
        w.*,
        t.id as technician_id,
        t.name as technician_name,
        t.category as technician_category,
        t.phone as technician_phone,
        t.email as technician_email,
        t.isActive as technician_isActive
      FROM Warehouse w
      LEFT JOIN Technician t ON t.id = w.technicianId
      WHERE w.id = ?
    `

    const warehouseRow = await this.db.queryOne<any>(warehouseSql, [id])

    if (!warehouseRow) {
      throw new BadRequestException('Almoxarifado não encontrado')
    }

    const warehouse = {
      id: warehouseRow.id,
      name: warehouseRow.name,
      code: warehouseRow.code,
      type: warehouseRow.type,
      technicianId: warehouseRow.technicianId,
      createdAt: warehouseRow.createdAt,
      technician: warehouseRow.technician_id ? {
        id: warehouseRow.technician_id,
        name: warehouseRow.technician_name,
        category: warehouseRow.technician_category,
        phone: warehouseRow.technician_phone,
        email: warehouseRow.technician_email,
        isActive: warehouseRow.technician_isActive
      } : null
    }

    // Para almoxarifado PRINCIPAL: buscar estoque baseado em movimentos (sem filtro de localização)
    if (warehouse.type === 'MAIN') {
      // Buscar todos os produtos que têm movimentos
      const movements = await this.db.query<any>(`
        SELECT
          p.id,
          p.sku,
          p.name,
          p.unit,
          p.minStock,
          p.trackSerial,
          sm.type,
          sm.quantity
        FROM StockMovement sm
        INNER JOIN Product p ON p.id = sm.productId
        ORDER BY p.name ASC
      `)

      // Consolidar estoque por produto
      const stockMap = new Map<number, any>()

      movements.forEach((mov: any) => {
        if (!stockMap.has(mov.id)) {
          stockMap.set(mov.id, {
            id: mov.id,
            sku: mov.sku,
            name: mov.name,
            unit: mov.unit,
            minStock: mov.minStock,
            trackSerial: mov.trackSerial,
            currentStock: 0
          })
        }

        const product = stockMap.get(mov.id)
        if (mov.type === 'IN' || mov.type === 'ADJUST') {
          product.currentStock += Number(mov.quantity)
        } else if (mov.type === 'OUT' || mov.type === 'TRANSFER') {
          product.currentStock -= Number(mov.quantity)
        }
      })

      const products = Array.from(stockMap.values()).filter(p => p.currentStock > 0)

      return {
        warehouse,
        products,
        transfers: []
      }
    }

    // Para almoxarifado de TÉCNICO: buscar transferências ativas
    let transfers = []
    if (warehouse.type === 'TECHNICIAN' && warehouse.technicianId) {
      const transferRows = await this.db.query<any>(`
        SELECT * FROM Transfer
        WHERE technicianId = ?
          AND status IN ('IN_HANDS', 'PARTIALLY_USED', 'PARTIALLY_RETURNED')
      `, [warehouse.technicianId])

      transfers = await Promise.all(
        transferRows.map(async (transfer) => {
          const items = await this.db.query<any>(`
            SELECT
              ti.*,
              p.id as product_id,
              p.sku as product_sku,
              p.name as product_name,
              p.unit as product_unit
            FROM TransferItem ti
            INNER JOIN Product p ON p.id = ti.productId
            WHERE ti.transferId = ?
              AND ti.status IN ('IN_HANDS', 'PENDING')
          `, [transfer.id])

          return {
            ...transfer,
            items: items.map(item => ({
              id: item.id,
              transferId: item.transferId,
              productId: item.productId,
              productInstanceId: item.productInstanceId,
              serialNumber: item.serialNumber,
              macAddress: item.macAddress,
              invoiceNumber: item.invoiceNumber,
              quantity: item.quantity,
              status: item.status,
              usedAt: item.usedAt,
              returnedAt: item.returnedAt,
              ixcClientCode: item.ixcClientCode,
              usageNote: item.usageNote,
              product: {
                id: item.product_id,
                sku: item.product_sku,
                name: item.product_name,
                unit: item.product_unit
              }
            }))
          }
        })
      )

      // Consolidar produtos das transferências
      const productsMap = new Map<number, any>()

      transfers.forEach(transfer => {
        transfer.items.forEach((item: any) => {
          if (!productsMap.has(item.productId)) {
            productsMap.set(item.productId, {
              id: item.productId,
              sku: item.product.sku,
              name: item.product.name,
              unit: item.product.unit,
              currentStock: 0
            })
          }
          const product = productsMap.get(item.productId)
          product.currentStock += Number(item.quantity)
        })
      })

      const products = Array.from(productsMap.values())

      return {
        warehouse,
        products,
        transfers
      }
    }

    return {
      warehouse,
      products: [],
      transfers: []
    }
  }

  async create(data: {
    name: string
    code: string
    type: WarehouseType
    technicianId?: number
  }) {
    // Verificar se o código já existe
    const existing = await this.db.queryOne(
      'SELECT * FROM Warehouse WHERE code = ?',
      [data.code]
    )

    if (existing) {
      throw new BadRequestException('Já existe um almoxarifado com este código')
    }

    // Se for almoxarifado de técnico, verificar se o técnico existe
    if (data.type === 'TECHNICIAN' && data.technicianId) {
      const technician = await this.db.queryOne<any>(`
        SELECT
          t.*,
          w.id as warehouse_id
        FROM Technician t
        LEFT JOIN Warehouse w ON w.technicianId = t.id
        WHERE t.id = ?
      `, [data.technicianId])

      if (!technician) {
        throw new BadRequestException('Técnico não encontrado')
      }

      if (technician.warehouse_id) {
        throw new BadRequestException(
          'Este técnico já possui um almoxarifado associado',
        )
      }
    }

    const result = await this.db.execute(
      'INSERT INTO Warehouse (name, code, type, technicianId) VALUES (?, ?, ?, ?)',
      [data.name, data.code, data.type, data.technicianId || null]
    )

    return this.findOne(result.insertId)
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
    const warehouse = await this.db.queryOne(
      'SELECT * FROM Warehouse WHERE id = ?',
      [id]
    )

    if (!warehouse) {
      throw new BadRequestException('Almoxarifado não encontrado')
    }

    // Se estiver mudando o código, verificar se já existe
    if (data.code && data.code !== (warehouse as any).code) {
      const existing = await this.db.queryOne(
        'SELECT * FROM Warehouse WHERE code = ?',
        [data.code]
      )

      if (existing) {
        throw new BadRequestException(
          'Já existe um almoxarifado com este código',
        )
      }
    }

    // Se estiver associando a um técnico, verificar
    if (data.technicianId !== undefined && data.technicianId !== null) {
      const technician = await this.db.queryOne<any>(`
        SELECT
          t.*,
          w.id as warehouse_id
        FROM Technician t
        LEFT JOIN Warehouse w ON w.technicianId = t.id
        WHERE t.id = ?
      `, [data.technicianId])

      if (!technician) {
        throw new BadRequestException('Técnico não encontrado')
      }

      if (
        technician.warehouse_id &&
        technician.warehouse_id !== id
      ) {
        throw new BadRequestException(
          'Este técnico já possui um almoxarifado associado',
        )
      }
    }

    const updates: string[] = []
    const values: any[] = []

    if (data.name !== undefined) {
      updates.push('name = ?')
      values.push(data.name)
    }
    if (data.code !== undefined) {
      updates.push('code = ?')
      values.push(data.code)
    }
    if (data.type !== undefined) {
      updates.push('type = ?')
      values.push(data.type)
    }
    if (data.technicianId !== undefined) {
      updates.push('technicianId = ?')
      values.push(data.technicianId)
    }

    if (updates.length > 0) {
      values.push(id)
      await this.db.execute(
        `UPDATE Warehouse SET ${updates.join(', ')} WHERE id = ?`,
        values
      )
    }

    return this.findOne(id)
  }

  async delete(id: number) {
    // Verificar se o almoxarifado existe e buscar seu tipo
    const warehouse = await this.db.queryOne<any>(
      'SELECT * FROM Warehouse WHERE id = ?',
      [id]
    )

    if (!warehouse) {
      throw new BadRequestException('Almoxarifado não encontrado')
    }

    // Não permitir exclusão do almoxarifado principal
    if (warehouse.type === 'MAIN') {
      throw new BadRequestException(
        'Não é possível excluir o almoxarifado principal'
      )
    }

    // Verificar se existem transferências relacionadas
    const transfersFrom = await this.db.query(
      'SELECT COUNT(*) as count FROM Transfer WHERE fromWarehouseId = ?',
      [id]
    )

    const transfersTo = await this.db.query(
      'SELECT COUNT(*) as count FROM Transfer WHERE toWarehouseId = ?',
      [id]
    )

    if ((transfersFrom[0] as any).count > 0 || (transfersTo[0] as any).count > 0) {
      throw new BadRequestException(
        'Não é possível excluir este almoxarifado pois existem transferências associadas',
      )
    }

    // Excluir locations primeiro
    await this.db.execute('DELETE FROM Location WHERE warehouseId = ?', [id])

    return this.db.execute('DELETE FROM Warehouse WHERE id = ?', [id])
  }
}
