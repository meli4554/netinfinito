import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'

@Injectable()
export class ProductsService {
  constructor(private readonly db: DatabaseService) {}

  // Gerar SKU automático
  private async generateSKU(): Promise<string> {
    const result = await this.db.queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM Product'
    )
    const nextNumber = (result?.count || 0) + 1
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

    // Criar produto
    const result = await this.db.execute(
      `INSERT INTO Product (sku, name, unit, barCode, minStock, trackSerial, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        sku,
        dto.name,
        dto.unit || 'UN',
        dto.barCode || null,
        dto.minStock || 0,
        dto.trackSerial || false,
      ]
    )

    const productId = result.insertId

    // Se tiver quantidade inicial, criar movimento de entrada
    if (dto.initialQuantity && dto.initialQuantity > 0) {
      await this.db.execute(
        `INSERT INTO StockMovement (productId, type, quantity, referenceType, referenceId, occurredAt, note)
         VALUES (?, 'IN', ?, 'ENTRY', ?, NOW(), 'Estoque inicial')`,
        [productId, dto.initialQuantity, productId]
      )
    }

    // Se rastrear serial/MAC e tiver instances, criar registros
    if (dto.trackSerial && dto.instances && dto.instances.length > 0) {
      for (const inst of dto.instances) {
        await this.db.execute(
          `INSERT INTO ProductInstance (productId, serialNumber, macAddress, createdAt, updatedAt)
           VALUES (?, ?, ?, NOW(), NOW())`,
          [productId, inst.serialNumber || null, inst.macAddress || null]
        )
      }
    }

    // Buscar e retornar o produto criado
    return this.getById(productId)
  }

  async list() {
    const products = await this.db.query<{
      id: number
      sku: string
      name: string
      unit: string
      barCode: string | null
      minStock: number
      trackSerial: boolean
      createdAt: Date
      updatedAt: Date
    }>('SELECT * FROM Product ORDER BY id DESC')

    // Calcular estoque atual para cada produto
    const productsWithStock = await Promise.all(
      products.map(async (product) => {
        // Contar instâncias
        const instanceCount = await this.db.queryOne<{ count: number }>(
          'SELECT COUNT(*) as count FROM ProductInstance WHERE productId = ?',
          [product.id]
        )

        // Calcular estoque baseado em movimentações do almoxarifado principal
        // (excluindo movimentos de técnicos)
        const movements = await this.db.query<{
          type: string
          quantity: number
        }>('SELECT type, quantity FROM StockMovement WHERE productId = ? AND technicianId IS NULL', [
          product.id,
        ])

        let currentStock = 0
        movements.forEach((mov) => {
          if (mov.type === 'IN') {
            currentStock += Number(mov.quantity)
          } else if (mov.type === 'OUT' || mov.type === 'ADJUST') {
            currentStock -= Number(mov.quantity)
          }
        })

        return {
          ...product,
          currentStock,
          _count: {
            instances: instanceCount?.count || 0,
          },
        }
      })
    )

    return productsWithStock
  }

  async getById(id: number) {
    const product = await this.db.queryOne<{
      id: number
      sku: string
      name: string
      unit: string
      barCode: string | null
      minStock: number
      trackSerial: boolean
      createdAt: Date
      updatedAt: Date
    }>('SELECT * FROM Product WHERE id = ?', [id])

    if (!product) return null

    // Buscar instâncias se houver (ordenar: disponíveis primeiro)
    const instances = await this.db.query(
      `SELECT * FROM ProductInstance
       WHERE productId = ?
       ORDER BY
         CASE status
           WHEN 'AVAILABLE' THEN 1
           WHEN 'IN_USE' THEN 2
           WHEN 'MAINTENANCE' THEN 3
           WHEN 'DEFECTIVE' THEN 4
           ELSE 5
         END,
         createdAt DESC`,
      [id]
    )

    return {
      ...product,
      instances,
    }
  }

  async update(id: number, dto: any) {
    const fields: string[] = []
    const values: any[] = []

    if (dto.name !== undefined) {
      fields.push('name = ?')
      values.push(dto.name)
    }
    if (dto.unit !== undefined) {
      fields.push('unit = ?')
      values.push(dto.unit)
    }
    if (dto.barCode !== undefined) {
      fields.push('barCode = ?')
      values.push(dto.barCode)
    }
    if (dto.minStock !== undefined) {
      fields.push('minStock = ?')
      values.push(dto.minStock)
    }
    if (dto.trackSerial !== undefined) {
      fields.push('trackSerial = ?')
      values.push(dto.trackSerial)
    }

    if (fields.length === 0) {
      return this.getById(id)
    }

    fields.push('updatedAt = NOW()')
    values.push(id)

    await this.db.execute(
      `UPDATE Product SET ${fields.join(', ')} WHERE id = ?`,
      values
    )

    return this.getById(id)
  }

  async delete(id: number) {
    // Excluir TODAS as dependências do produto
    await this.db.execute('DELETE FROM ProductUsage WHERE productId = ?', [id])
    await this.db.execute('DELETE FROM TransferItem WHERE productId = ?', [id])
    await this.db.execute('DELETE FROM StockMovement WHERE productId = ?', [id])
    await this.db.execute('DELETE FROM ProductInstance WHERE productId = ?', [id])
    await this.db.execute('DELETE FROM Product WHERE id = ?', [id])

    return { success: true }
  }
}
