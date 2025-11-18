import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'

type TransferStatus = 'PENDING' | 'TRANSFERRED' | 'IN_HANDS' | 'PARTIALLY_USED' | 'PARTIALLY_RETURNED' | 'USED' | 'RETURNED' | 'RECEIVED'

@Injectable()
export class TransfersService {
  constructor(private db: DatabaseService) {}

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
    // Buscar último transfer para gerar número
    const lastTransfer = await this.db.queryOne<any>(
      'SELECT id FROM Transfer ORDER BY id DESC LIMIT 1'
    )

    const nextNumber = lastTransfer
      ? `TRF-${String(lastTransfer.id + 1).padStart(6, '0')}`
      : 'TRF-000001'

    // Criar transfer
    const result = await this.db.execute(
      `INSERT INTO Transfer (number, fromWarehouseId, toWarehouseId, technicianId, createdBy, note)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nextNumber, data.fromWarehouseId, data.toWarehouseId, data.technicianId, data.createdBy || null, data.note || null]
    )

    const transferId = result.insertId

    // Criar items
    for (const item of data.items) {
      await this.db.execute(
        `INSERT INTO TransferItem (transferId, productId, productInstanceId, serialNumber, macAddress, invoiceNumber, quantity)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          transferId,
          item.productId,
          item.productInstanceId || null,
          item.serialNumber || null,
          item.macAddress || null,
          item.invoiceNumber || null,
          item.quantity
        ]
      )
    }

    return this.findOne(transferId)
  }

  async list() {
    const transfers = await this.db.query<any>(`
      SELECT
        t.*,
        fw.id as fromWarehouse_id,
        fw.name as fromWarehouse_name,
        fw.code as fromWarehouse_code,
        fw.type as fromWarehouse_type,
        tw.id as toWarehouse_id,
        tw.name as toWarehouse_name,
        tw.code as toWarehouse_code,
        tw.type as toWarehouse_type,
        tech.id as technician_id,
        tech.name as technician_name,
        tech.category as technician_category,
        tech.phone as technician_phone,
        tech.email as technician_email
      FROM Transfer t
      LEFT JOIN Warehouse fw ON fw.id = t.fromWarehouseId
      LEFT JOIN Warehouse tw ON tw.id = t.toWarehouseId
      LEFT JOIN Technician tech ON tech.id = t.technicianId
      ORDER BY t.createdAt DESC
    `)

    // Buscar items para cada transfer
    const transfersWithItems = await Promise.all(
      transfers.map(async (transfer) => {
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
        `, [transfer.id])

        return {
          id: transfer.id,
          number: transfer.number,
          status: transfer.status,
          fromWarehouseId: transfer.fromWarehouseId,
          toWarehouseId: transfer.toWarehouseId,
          technicianId: transfer.technicianId,
          createdBy: transfer.createdBy,
          note: transfer.note,
          transferredAt: transfer.transferredAt,
          receivedAt: transfer.receivedAt,
          signatureType: transfer.signatureType,
          signatureFile: transfer.signatureFile,
          createdAt: transfer.createdAt,
          updatedAt: transfer.updatedAt,
          fromWarehouse: transfer.fromWarehouse_id ? {
            id: transfer.fromWarehouse_id,
            name: transfer.fromWarehouse_name,
            code: transfer.fromWarehouse_code,
            type: transfer.fromWarehouse_type
          } : null,
          toWarehouse: transfer.toWarehouse_id ? {
            id: transfer.toWarehouse_id,
            name: transfer.toWarehouse_name,
            code: transfer.toWarehouse_code,
            type: transfer.toWarehouse_type
          } : null,
          technician: transfer.technician_id ? {
            id: transfer.technician_id,
            name: transfer.technician_name,
            category: transfer.technician_category,
            phone: transfer.technician_phone,
            email: transfer.technician_email
          } : null,
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

    return transfersWithItems
  }

  async findOne(id: number) {
    const transfer = await this.db.queryOne<any>(`
      SELECT
        t.*,
        fw.id as fromWarehouse_id,
        fw.name as fromWarehouse_name,
        fw.code as fromWarehouse_code,
        fw.type as fromWarehouse_type,
        tw.id as toWarehouse_id,
        tw.name as toWarehouse_name,
        tw.code as toWarehouse_code,
        tw.type as toWarehouse_type,
        tech.id as technician_id,
        tech.name as technician_name,
        tech.category as technician_category,
        tech.phone as technician_phone,
        tech.email as technician_email
      FROM Transfer t
      LEFT JOIN Warehouse fw ON fw.id = t.fromWarehouseId
      LEFT JOIN Warehouse tw ON tw.id = t.toWarehouseId
      LEFT JOIN Technician tech ON tech.id = t.technicianId
      WHERE t.id = ?
    `, [id])

    if (!transfer) return null

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
    `, [id])

    return {
      id: transfer.id,
      number: transfer.number,
      status: transfer.status,
      fromWarehouseId: transfer.fromWarehouseId,
      toWarehouseId: transfer.toWarehouseId,
      technicianId: transfer.technicianId,
      createdBy: transfer.createdBy,
      note: transfer.note,
      transferredAt: transfer.transferredAt,
      receivedAt: transfer.receivedAt,
      signatureType: transfer.signatureType,
      signatureFile: transfer.signatureFile,
      createdAt: transfer.createdAt,
      updatedAt: transfer.updatedAt,
      fromWarehouse: transfer.fromWarehouse_id ? {
        id: transfer.fromWarehouse_id,
        name: transfer.fromWarehouse_name,
        code: transfer.fromWarehouse_code,
        type: transfer.fromWarehouse_type
      } : null,
      toWarehouse: transfer.toWarehouse_id ? {
        id: transfer.toWarehouse_id,
        name: transfer.toWarehouse_name,
        code: transfer.toWarehouse_code,
        type: transfer.toWarehouse_type
      } : null,
      technician: transfer.technician_id ? {
        id: transfer.technician_id,
        name: transfer.technician_name,
        category: transfer.technician_category,
        phone: transfer.technician_phone,
        email: transfer.technician_email
      } : null,
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
  }

  async setStatus(id: number, status: TransferStatus) {
    const now = new Date()
    const updates: string[] = ['status = ?']
    const values: any[] = [status]

    if (status === 'TRANSFERRED') {
      updates.push('transferredAt = ?')
      values.push(now)
    }
    if (status === 'RECEIVED') {
      updates.push('receivedAt = ?')
      values.push(now)
    }

    values.push(id)

    await this.db.execute(
      `UPDATE Transfer SET ${updates.join(', ')} WHERE id = ?`,
      values
    )

    // Buscar items da transferência
    const items = await this.db.query<any>(
      'SELECT * FROM TransferItem WHERE transferId = ?',
      [id]
    )

    // Se o status for TRANSFERRED, criar movimentos de estoque
    if (status === 'TRANSFERRED') {
      const transfer = await this.db.queryOne<any>(
        'SELECT * FROM Transfer WHERE id = ?',
        [id]
      )

      for (const item of items) {
        // Saída do almoxarifado de origem
        await this.db.execute(
          `INSERT INTO StockMovement (productId, type, quantity, referenceType, referenceId, occurredAt, note)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            item.productId,
            'OUT',
            item.quantity,
            'TRANSFER',
            id,
            now,
            `Transferência ${transfer.number} para técnico`
          ]
        )

        // Entrada no almoxarifado do técnico
        await this.db.execute(
          `INSERT INTO StockMovement (productId, type, quantity, technicianId, referenceType, referenceId, occurredAt, note)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            item.productId,
            'TRANSFER',
            item.quantity,
            transfer.technicianId,
            'TRANSFER',
            id,
            now,
            `Transferência ${transfer.number} recebida`
          ]
        )
      }
    }

    return this.findOne(id)
  }

  async getByTechnician(technicianId: number) {
    const transfers = await this.db.query<any>(`
      SELECT
        t.*,
        fw.id as fromWarehouse_id,
        fw.name as fromWarehouse_name,
        fw.code as fromWarehouse_code,
        fw.type as fromWarehouse_type,
        tw.id as toWarehouse_id,
        tw.name as toWarehouse_name,
        tw.code as toWarehouse_code,
        tw.type as toWarehouse_type
      FROM Transfer t
      LEFT JOIN Warehouse fw ON fw.id = t.fromWarehouseId
      LEFT JOIN Warehouse tw ON tw.id = t.toWarehouseId
      WHERE t.technicianId = ?
      ORDER BY t.createdAt DESC
    `, [technicianId])

    // Buscar items para cada transfer
    const transfersWithItems = await Promise.all(
      transfers.map(async (transfer) => {
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
        `, [transfer.id])

        return {
          id: transfer.id,
          number: transfer.number,
          status: transfer.status,
          fromWarehouseId: transfer.fromWarehouseId,
          toWarehouseId: transfer.toWarehouseId,
          technicianId: transfer.technicianId,
          createdBy: transfer.createdBy,
          note: transfer.note,
          transferredAt: transfer.transferredAt,
          receivedAt: transfer.receivedAt,
          createdAt: transfer.createdAt,
          updatedAt: transfer.updatedAt,
          fromWarehouse: transfer.fromWarehouse_id ? {
            id: transfer.fromWarehouse_id,
            name: transfer.fromWarehouse_name,
            code: transfer.fromWarehouse_code,
            type: transfer.fromWarehouse_type
          } : null,
          toWarehouse: transfer.toWarehouse_id ? {
            id: transfer.toWarehouse_id,
            name: transfer.toWarehouse_name,
            code: transfer.toWarehouse_code,
            type: transfer.toWarehouse_type
          } : null,
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

    return transfersWithItems
  }

  async listActive() {
    const transfers = await this.db.query<any>(`
      SELECT
        t.*,
        fw.id as fromWarehouse_id,
        fw.name as fromWarehouse_name,
        fw.code as fromWarehouse_code,
        tw.id as toWarehouse_id,
        tw.name as toWarehouse_name,
        tw.code as toWarehouse_code,
        tech.id as technician_id,
        tech.name as technician_name,
        tech.category as technician_category
      FROM Transfer t
      LEFT JOIN Warehouse fw ON fw.id = t.fromWarehouseId
      LEFT JOIN Warehouse tw ON tw.id = t.toWarehouseId
      LEFT JOIN Technician tech ON tech.id = t.technicianId
      WHERE t.status IN ('PENDING', 'IN_HANDS', 'PARTIALLY_USED', 'PARTIALLY_RETURNED')
      ORDER BY t.createdAt DESC
    `)

    // Buscar items para cada transfer
    const transfersWithItems = await Promise.all(
      transfers.map(async (transfer) => {
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
        `, [transfer.id])

        return {
          id: transfer.id,
          number: transfer.number,
          status: transfer.status,
          fromWarehouseId: transfer.fromWarehouseId,
          toWarehouseId: transfer.toWarehouseId,
          technicianId: transfer.technicianId,
          createdBy: transfer.createdBy,
          note: transfer.note,
          transferredAt: transfer.transferredAt,
          receivedAt: transfer.receivedAt,
          createdAt: transfer.createdAt,
          updatedAt: transfer.updatedAt,
          fromWarehouse: transfer.fromWarehouse_id ? {
            id: transfer.fromWarehouse_id,
            name: transfer.fromWarehouse_name,
            code: transfer.fromWarehouse_code
          } : null,
          toWarehouse: transfer.toWarehouse_id ? {
            id: transfer.toWarehouse_id,
            name: transfer.toWarehouse_name,
            code: transfer.toWarehouse_code
          } : null,
          technician: transfer.technician_id ? {
            id: transfer.technician_id,
            name: transfer.technician_name,
            category: transfer.technician_category
          } : null,
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

    return transfersWithItems
  }

  async searchProductBySerial(query: string) {
    const instances = await this.db.query<any>(`
      SELECT
        pi.*,
        p.id as product_id,
        p.sku as product_sku,
        p.name as product_name,
        p.unit as product_unit
      FROM ProductInstance pi
      INNER JOIN Product p ON p.id = pi.productId
      WHERE (pi.serialNumber LIKE ? OR pi.macAddress LIKE ? OR p.name LIKE ? OR p.sku LIKE ?)
        AND pi.status = 'AVAILABLE'
      LIMIT 10
    `, [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`])

    return instances.map(inst => ({
      id: inst.id,
      productId: inst.productId,
      serialNumber: inst.serialNumber,
      macAddress: inst.macAddress,
      status: inst.status,
      invoiceNumber: inst.invoiceNumber,
      invoiceDate: inst.invoiceDate,
      invoiceFile: inst.invoiceFile,
      receivedAt: inst.receivedAt,
      supplier: inst.supplier,
      entryDate: inst.entryDate,
      note: inst.note,
      product: {
        id: inst.product_id,
        sku: inst.product_sku,
        name: inst.product_name,
        unit: inst.product_unit
      }
    }))
  }

  async markAsTransferred(id: number) {
    await this.db.execute(
      'UPDATE Transfer SET status = ?, transferredAt = ? WHERE id = ?',
      ['IN_HANDS', new Date(), id]
    )

    await this.db.execute(
      'UPDATE TransferItem SET status = ? WHERE transferId = ?',
      ['IN_HANDS', id]
    )

    return this.findOne(id)
  }

  async markItemAsUsed(
    itemId: number,
    data: { ixcClientCode?: string; usageNote?: string },
  ) {
    await this.db.execute(
      'UPDATE TransferItem SET status = ?, usedAt = ?, ixcClientCode = ?, usageNote = ? WHERE id = ?',
      ['USED', new Date(), data.ixcClientCode || null, data.usageNote || null, itemId]
    )

    const item = await this.db.queryOne<any>(
      'SELECT * FROM TransferItem WHERE id = ?',
      [itemId]
    )

    // Atualizar status da transferência
    await this.updateTransferStatus(item.transferId)

    return item
  }

  async markItemAsReturned(itemId: number) {
    await this.db.execute(
      'UPDATE TransferItem SET status = ?, returnedAt = ? WHERE id = ?',
      ['RETURNED', new Date(), itemId]
    )

    const item = await this.db.queryOne<any>(
      'SELECT * FROM TransferItem WHERE id = ?',
      [itemId]
    )

    // Atualizar status da transferência
    await this.updateTransferStatus(item.transferId)

    return item
  }

  private async updateTransferStatus(transferId: number) {
    const items = await this.db.query<any>(
      'SELECT * FROM TransferItem WHERE transferId = ?',
      [transferId]
    )

    if (items.length === 0) return

    const allUsed = items.every((item: any) => item.status === 'USED')
    const allReturned = items.every((item: any) => item.status === 'RETURNED')
    const someUsed = items.some((item: any) => item.status === 'USED')
    const someReturned = items.some((item: any) => item.status === 'RETURNED')

    const transfer = await this.db.queryOne<any>(
      'SELECT status FROM Transfer WHERE id = ?',
      [transferId]
    )

    if (!transfer) return

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
      await this.db.execute(
        'UPDATE Transfer SET status = ? WHERE id = ?',
        [newStatus, transferId]
      )
    }
  }

  async uploadSignature(
    id: number,
    type: 'digital' | 'upload',
    file?: Express.Multer.File,
  ) {
    await this.db.execute(
      'UPDATE Transfer SET signatureType = ?, signatureFile = ? WHERE id = ?',
      [type, file ? `signatures/${file.filename}` : null, id]
    )

    return this.findOne(id)
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
