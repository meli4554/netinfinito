import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'

type TransferStatus = 'PENDING' | 'IN_HANDS' | 'PARTIALLY_USED' | 'USED' | 'PARTIALLY_RETURNED' | 'RETURNED' | 'CANCELED'

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
          canceledAt: transfer.canceledAt,
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
      canceledAt: transfer.canceledAt,
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
    if (status === 'CANCELED') {
      await this.db.execute(
        'UPDATE Transfer SET status = ?, canceledAt = ? WHERE id = ?',
        [status, new Date(), id]
      )
    } else {
      await this.db.execute(
        'UPDATE Transfer SET status = ? WHERE id = ?',
        [status, id]
      )
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
          canceledAt: transfer.canceledAt,
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
          canceledAt: transfer.canceledAt,
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
    const now = new Date()

    // Atualizar status da transferência
    await this.db.execute(
      'UPDATE Transfer SET status = ?, transferredAt = ? WHERE id = ?',
      ['IN_HANDS', now, id]
    )

    // Atualizar status dos itens
    await this.db.execute(
      'UPDATE TransferItem SET status = ? WHERE transferId = ?',
      ['IN_HANDS', id]
    )

    // Buscar transferência e itens
    const transfer = await this.db.queryOne<any>(
      'SELECT * FROM Transfer WHERE id = ?',
      [id]
    )

    const items = await this.db.query<any>(
      'SELECT * FROM TransferItem WHERE transferId = ?',
      [id]
    )

    // Criar movimentos de estoque para cada item
    for (const item of items) {
      // Saída do almoxarifado principal (locationId = NULL para warehouse principal)
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
          `Saída para transferência ${transfer.number} - Técnico`
        ]
      )

      // Entrada no almoxarifado do técnico (technicianId preenchido)
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
          `Entrada de transferência ${transfer.number}`
        ]
      )

      // Se o item tem productInstanceId, atualizar o status da instância
      if (item.productInstanceId) {
        await this.db.execute(
          'UPDATE ProductInstance SET status = ? WHERE id = ?',
          ['IN_USE', item.productInstanceId]
        )
      }
    }

    return this.findOne(id)
  }

  async revertTransfer(id: number) {
    const now = new Date()

    // Buscar transferência atual
    const transfer = await this.db.queryOne<any>(
      'SELECT * FROM Transfer WHERE id = ?',
      [id]
    )

    if (!transfer) {
      throw new Error('Transferência não encontrada')
    }

    // Só pode reverter se NÃO estiver em PENDING ou RETURNED
    const canRevert = ['IN_HANDS', 'PARTIALLY_USED', 'USED', 'PARTIALLY_RETURNED'].includes(transfer.status)
    if (!canRevert) {
      throw new Error('Não é possível reverter esta transferência no status atual')
    }

    // Buscar itens da transferência
    const items = await this.db.query<any>(
      'SELECT * FROM TransferItem WHERE transferId = ?',
      [id]
    )

    // Reverter movimentos de estoque para cada item
    for (const item of items) {
      // Saída do técnico (technicianId preenchido)
      await this.db.execute(
        `INSERT INTO StockMovement (productId, type, quantity, technicianId, referenceType, referenceId, occurredAt, note)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.productId,
          'OUT',
          item.quantity,
          transfer.technicianId,
          'ADJUSTMENT',
          id,
          now,
          `[REVERSÃO] Transferência ${transfer.number} - Retirado do técnico`
        ]
      )

      // Entrada de volta no almoxarifado principal (locationId = NULL)
      await this.db.execute(
        `INSERT INTO StockMovement (productId, type, quantity, referenceType, referenceId, occurredAt, note)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          item.productId,
          'IN',
          item.quantity,
          'ADJUSTMENT',
          id,
          now,
          `[REVERSÃO] Transferência ${transfer.number} - Produto devolvido ao estoque`
        ]
      )

      // Se o item tem productInstanceId, reverter o status da instância
      if (item.productInstanceId) {
        await this.db.execute(
          'UPDATE ProductInstance SET status = ? WHERE id = ?',
          ['AVAILABLE', item.productInstanceId]
        )
      }
    }

    // Atualizar status da transferência para PENDING
    await this.db.execute(
      'UPDATE Transfer SET status = ?, transferredAt = NULL WHERE id = ?',
      ['PENDING', id]
    )

    // Atualizar status dos itens para PENDING e limpar dados de uso
    await this.db.execute(
      'UPDATE TransferItem SET status = ?, usedAt = NULL, returnedAt = NULL, ixcClientCode = NULL, usageNote = NULL WHERE transferId = ?',
      ['PENDING', id]
    )

    return this.findOne(id)
  }

  async markItemAsUsed(
    itemId: number,
    data: { ixcClientCode?: string; usageNote?: string },
  ) {
    // Buscar item com dados da transferência para identificar técnico
    const item = await this.db.queryOne<any>(
      `SELECT ti.*, tr.technicianId, tr.number as transfer_number
       FROM TransferItem ti
       INNER JOIN Transfer tr ON tr.id = ti.transferId
       WHERE ti.id = ?`,
      [itemId]
    )

    if (!item) {
      throw new Error('Item da transferência não encontrado')
    }

    const usageNote = data.usageNote || null
    const serviceOrder = data.ixcClientCode || null

    // Registrar uso (ProductUsage)
    const usageResult = await this.db.execute(
      `INSERT INTO ProductUsage (technicianId, productId, quantity, note, serviceOrder, clientName, usedAt)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        item.technicianId,
        item.productId,
        item.quantity,
        usageNote,
        serviceOrder,
        null
      ]
    )

    const usageId = usageResult.insertId

    // Registrar saída do estoque do técnico
    await this.db.execute(
      `INSERT INTO StockMovement (productId, type, quantity, technicianId, referenceType, referenceId, occurredAt, note)
       VALUES (?, 'OUT', ?, ?, 'USAGE', ?, NOW(), ?)`,
      [
        item.productId,
        item.quantity,
        item.technicianId,
        usageId,
        usageNote || `Uso registrado - transferência ${item.transfer_number || ''}`.trim()
      ]
    )

    // Atualizar item como usado
    await this.db.execute(
      'UPDATE TransferItem SET status = ?, usedAt = ?, ixcClientCode = ?, usageNote = ? WHERE id = ?',
      ['USED', new Date(), serviceOrder, usageNote, itemId]
    )

    // Atualizar status da transferência
    await this.updateTransferStatus(item.transferId)

    return this.db.queryOne<any>('SELECT * FROM TransferItem WHERE id = ?', [itemId])
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

  async delete(id: number) {
    // Verificar se a transferência existe e está cancelada
    const transfer = await this.db.queryOne<any>(
      'SELECT * FROM Transfer WHERE id = ?',
      [id]
    )

    if (!transfer) {
      throw new Error('Transferência não encontrada')
    }

    if (transfer.status !== 'CANCELED') {
      throw new Error('Apenas transferências canceladas podem ser apagadas')
    }

    // Deletar movimentos de estoque relacionados à transferência
    await this.db.execute(
      'DELETE FROM StockMovement WHERE referenceType = ? AND referenceId = ?',
      ['TRANSFER', id]
    )

    // Deletar transferência (os itens serão deletados em cascata)
    await this.db.execute(
      'DELETE FROM Transfer WHERE id = ?',
      [id]
    )

    return { success: true, message: 'Transferência apagada com sucesso' }
  }
}

