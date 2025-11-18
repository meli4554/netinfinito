import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'

@Injectable()
export class InventoryService {
  constructor(private readonly db: DatabaseService) {}

  async summary() {
    // Buscar todos os produtos
    const products = await this.db.query<any>(
      'SELECT id, sku, name FROM Product'
    )

    // Buscar totais de quantidade por produto
    const totals = await this.db.query<any>(`
      SELECT
        productId,
        SUM(quantity) as totalQuantity
      FROM StockMovement
      GROUP BY productId
    `)

    // Criar mapa de totais
    const map = new Map(totals.map(t => [t.productId, Number(t.totalQuantity) || 0]))

    // Retornar produtos com quantidade
    return products.map(p => ({
      productId: p.id,
      sku: p.sku,
      name: p.name,
      quantity: map.get(p.id) ?? 0
    }))
  }

  movements(productId: number) {
    return this.db.query(
      'SELECT * FROM StockMovement WHERE productId = ? ORDER BY occurredAt DESC',
      [productId]
    )
  }
}
