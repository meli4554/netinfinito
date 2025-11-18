import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'

@Injectable()
export class StockMovementsService {
  constructor(private readonly db: DatabaseService) {}

  async create(dto: {
    productId: number
    type: 'IN' | 'OUT' | 'ADJUST' | 'TRANSFER'
    quantity: number
    locationId?: number
    technicianId?: number
    referenceType: 'ENTRY' | 'TRANSFER' | 'USAGE' | 'ADJUSTMENT'
    referenceId: number
    invoiceNumber?: string
    invoiceDate?: string
    invoiceFile?: string
    receivedAt?: string
    supplier?: string
    note?: string
  }) {
    try {
      // Criar movimento de estoque
      const result = await this.db.execute(
        `INSERT INTO StockMovement (
          productId, type, quantity, locationId, technicianId, referenceType, referenceId,
          invoiceNumber, invoiceDate, invoiceFile, receivedAt, supplier, note, occurredAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          dto.productId,
          dto.type,
          dto.quantity,
          dto.locationId || null,
          dto.technicianId || null,
          dto.referenceType,
          dto.referenceId,
          dto.invoiceNumber || null,
          dto.invoiceDate ? new Date(dto.invoiceDate) : null,
          dto.invoiceFile || null,
          dto.receivedAt ? new Date(dto.receivedAt) : null,
          dto.supplier || null,
          dto.note || null,
          new Date()
        ]
      )

      const movementId = result.insertId

      console.log('Movimento de estoque criado:', movementId)

      // Se for entrada (IN) e tiver NF, atualizar as instâncias do produto
      if (dto.type === 'IN' && dto.invoiceNumber && dto.invoiceDate) {
        // Buscar instâncias sem NF do produto (mais recentes primeiro)
        const instancesToUpdate = await this.db.query<any>(
          `SELECT * FROM ProductInstance
           WHERE productId = ? AND invoiceNumber IS NULL
           ORDER BY createdAt DESC
           LIMIT ?`,
          [dto.productId, Math.floor(Number(dto.quantity))]
        )

        console.log(`Atualizando ${instancesToUpdate.length} instâncias com NF ${dto.invoiceNumber}`)

        // Buscar o movimento criado para pegar occurredAt
        const movement = await this.db.queryOne<any>(
          'SELECT * FROM StockMovement WHERE id = ?',
          [movementId]
        )

        // Atualizar cada instância com a NF e todos os dados da entrada
        for (const instance of instancesToUpdate) {
          await this.db.execute(
            `UPDATE ProductInstance SET
              invoiceNumber = ?,
              invoiceDate = ?,
              invoiceFile = ?,
              receivedAt = ?,
              supplier = ?,
              entryDate = ?,
              note = ?
             WHERE id = ?`,
            [
              dto.invoiceNumber,
              dto.invoiceDate ? new Date(dto.invoiceDate) : null,
              dto.invoiceFile || null,
              dto.receivedAt ? new Date(dto.receivedAt) : null,
              dto.supplier || null,
              movement?.occurredAt || null,
              dto.note || null,
              instance.id
            ]
          )
        }
      }

      // Retornar o movimento criado
      return this.db.queryOne('SELECT * FROM StockMovement WHERE id = ?', [movementId])
    } catch (error) {
      console.error('Erro ao criar movimento de estoque:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      throw new Error(`Erro ao criar movimento de estoque: ${errorMessage}`)
    }
  }
}
