import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ProductInstancesService {
  constructor(private db: DatabaseService) {}

  async createBulk(
    productId: number,
    instances: Array<{ serialNumber?: string; macAddress?: string }>,
  ) {
    // Buscar a StockMovement mais recente do produto com NF
    const latestMovement = await this.db.queryOne<any>(`
      SELECT *
      FROM StockMovement
      WHERE productId = ?
        AND type = 'IN'
        AND invoiceNumber IS NOT NULL
      ORDER BY occurredAt DESC
      LIMIT 1
    `, [productId]);

    // Criar instâncias com dados da NF (se houver)
    for (const inst of instances) {
      await this.db.execute(
        `INSERT INTO ProductInstance (
          productId, serialNumber, macAddress, invoiceNumber, invoiceDate,
          invoiceFile, receivedAt, supplier, entryDate, note
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          productId,
          inst.serialNumber || null,
          inst.macAddress || null,
          latestMovement?.invoiceNumber || null,
          latestMovement?.invoiceDate || null,
          latestMovement?.invoiceFile || null,
          latestMovement?.receivedAt || null,
          latestMovement?.supplier || null,
          latestMovement?.occurredAt || null,
          latestMovement?.note || null,
        ]
      );
    }

    return { count: instances.length };
  }

  async findByProduct(productId: number) {
    const instances = await this.db.query<any>(`
      SELECT
        pi.*,
        p.id as product_id,
        p.sku as product_sku,
        p.name as product_name
      FROM ProductInstance pi
      INNER JOIN Product p ON p.id = pi.productId
      WHERE pi.productId = ?
      ORDER BY pi.createdAt DESC
    `, [productId]);

    return instances.map(inst => ({
      id: inst.id,
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
      inutilizedReason: inst.inutilizedReason,
      inutilizedAt: inst.inutilizedAt,
      awaitingReplacement: inst.awaitingReplacement,
      replacementRequested: inst.replacementRequested,
      createdAt: inst.createdAt,
      updatedAt: inst.updatedAt,
      product: {
        id: inst.product_id,
        sku: inst.product_sku,
        name: inst.product_name
      }
    }));
  }

  async findBySerial(serialNumber: string) {
    const instance = await this.db.queryOne<any>(`
      SELECT
        pi.*,
        p.id as product_id,
        p.sku as product_sku,
        p.name as product_name,
        p.unit as product_unit
      FROM ProductInstance pi
      INNER JOIN Product p ON p.id = pi.productId
      WHERE pi.serialNumber = ?
    `, [serialNumber]);

    if (!instance) return null;

    return {
      id: instance.id,
      productId: instance.productId,
      serialNumber: instance.serialNumber,
      macAddress: instance.macAddress,
      status: instance.status,
      invoiceNumber: instance.invoiceNumber,
      invoiceDate: instance.invoiceDate,
      invoiceFile: instance.invoiceFile,
      receivedAt: instance.receivedAt,
      supplier: instance.supplier,
      entryDate: instance.entryDate,
      note: instance.note,
      inutilizedReason: instance.inutilizedReason,
      inutilizedAt: instance.inutilizedAt,
      awaitingReplacement: instance.awaitingReplacement,
      replacementRequested: instance.replacementRequested,
      createdAt: instance.createdAt,
      updatedAt: instance.updatedAt,
      product: {
        id: instance.product_id,
        sku: instance.product_sku,
        name: instance.product_name,
        unit: instance.product_unit
      }
    };
  }

  async findByMac(macAddress: string) {
    const instance = await this.db.queryOne<any>(`
      SELECT
        pi.*,
        p.id as product_id,
        p.sku as product_sku,
        p.name as product_name,
        p.unit as product_unit
      FROM ProductInstance pi
      INNER JOIN Product p ON p.id = pi.productId
      WHERE pi.macAddress = ?
    `, [macAddress]);

    if (!instance) return null;

    return {
      id: instance.id,
      productId: instance.productId,
      serialNumber: instance.serialNumber,
      macAddress: instance.macAddress,
      status: instance.status,
      invoiceNumber: instance.invoiceNumber,
      invoiceDate: instance.invoiceDate,
      invoiceFile: instance.invoiceFile,
      receivedAt: instance.receivedAt,
      supplier: instance.supplier,
      entryDate: instance.entryDate,
      note: instance.note,
      inutilizedReason: instance.inutilizedReason,
      inutilizedAt: instance.inutilizedAt,
      awaitingReplacement: instance.awaitingReplacement,
      replacementRequested: instance.replacementRequested,
      createdAt: instance.createdAt,
      updatedAt: instance.updatedAt,
      product: {
        id: instance.product_id,
        sku: instance.product_sku,
        name: instance.product_name,
        unit: instance.product_unit
      }
    };
  }

  async update(
    id: number,
    data: {
      serialNumber?: string
      macAddress?: string
      status?: string
      invoiceNumber?: string
      invoiceDate?: string
      inutilizedReason?: string
      inutilizedAt?: string
      awaitingReplacement?: boolean
      replacementRequested?: boolean
    },
  ) {
    const updates: string[] = []
    const values: any[] = []

    if (data.serialNumber !== undefined) {
      updates.push('serialNumber = ?')
      values.push(data.serialNumber)
    }
    if (data.macAddress !== undefined) {
      updates.push('macAddress = ?')
      values.push(data.macAddress)
    }
    if (data.status !== undefined) {
      updates.push('status = ?')
      values.push(data.status)
    }
    if (data.invoiceNumber !== undefined) {
      updates.push('invoiceNumber = ?')
      values.push(data.invoiceNumber)
    }
    if (data.invoiceDate !== undefined) {
      updates.push('invoiceDate = ?')
      values.push(data.invoiceDate ? new Date(data.invoiceDate) : null)
    }
    if (data.inutilizedReason !== undefined) {
      updates.push('inutilizedReason = ?')
      values.push(data.inutilizedReason)
    }
    if (data.inutilizedAt !== undefined) {
      updates.push('inutilizedAt = ?')
      values.push(data.inutilizedAt ? new Date(data.inutilizedAt) : null)
    }
    if (data.awaitingReplacement !== undefined) {
      updates.push('awaitingReplacement = ?')
      values.push(data.awaitingReplacement ? 1 : 0)
    }
    if (data.replacementRequested !== undefined) {
      updates.push('replacementRequested = ?')
      values.push(data.replacementRequested ? 1 : 0)
    }

    if (updates.length === 0) {
      return this.db.queryOne('SELECT * FROM ProductInstance WHERE id = ?', [id])
    }

    values.push(id)

    await this.db.execute(
      `UPDATE ProductInstance SET ${updates.join(', ')} WHERE id = ?`,
      values
    )

    return this.db.queryOne('SELECT * FROM ProductInstance WHERE id = ?', [id])
  }

  async delete(id: number) {
    return this.db.execute('DELETE FROM ProductInstance WHERE id = ?', [id]);
  }

  async getAvailableCount(productId: number) {
    const result = await this.db.queryOne<any>(
      `SELECT COUNT(*) as count FROM ProductInstance WHERE productId = ? AND status = 'AVAILABLE'`,
      [productId]
    );
    return result?.count || 0;
  }
}
