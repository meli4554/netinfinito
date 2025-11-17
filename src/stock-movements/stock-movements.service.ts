import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { Decimal } from '@prisma/client/runtime/library'

@Injectable()
export class StockMovementsService {
  constructor(private readonly prisma: PrismaService) {}

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
      const movement = await this.prisma.stockMovement.create({
        data: {
          productId: dto.productId,
          type: dto.type,
          quantity: new Decimal(dto.quantity),
          locationId: dto.locationId || null,
          technicianId: dto.technicianId || null,
          referenceType: dto.referenceType,
          referenceId: dto.referenceId,
          invoiceNumber: dto.invoiceNumber || null,
          invoiceDate: dto.invoiceDate ? new Date(dto.invoiceDate) : null,
          invoiceFile: dto.invoiceFile || null,
          receivedAt: dto.receivedAt ? new Date(dto.receivedAt) : null,
          supplier: dto.supplier || null,
          note: dto.note || null,
          occurredAt: new Date(),
        },
      })

      console.log('Movimento de estoque criado:', movement)

      // Se for entrada (IN) e tiver NF, atualizar as instâncias do produto
      if (dto.type === 'IN' && dto.invoiceNumber && dto.invoiceDate) {
        // Buscar instâncias sem NF do produto (mais recentes primeiro)
        const instancesToUpdate = await this.prisma.productInstance.findMany({
          where: {
            productId: dto.productId,
            invoiceNumber: null,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: Math.floor(Number(dto.quantity)),
        })

        console.log(`Atualizando ${instancesToUpdate.length} instâncias com NF ${dto.invoiceNumber}`)

        // Atualizar cada instância com a NF e todos os dados da entrada
        for (const instance of instancesToUpdate) {
          await this.prisma.productInstance.update({
            where: { id: instance.id },
            data: {
              invoiceNumber: dto.invoiceNumber,
              invoiceDate: new Date(dto.invoiceDate),
              invoiceFile: dto.invoiceFile,
              receivedAt: dto.receivedAt ? new Date(dto.receivedAt) : null,
              supplier: dto.supplier,
              entryDate: movement.occurredAt,
              note: dto.note,
            },
          })
        }
      }

      return movement
    } catch (error) {
      console.error('Erro ao criar movimento de estoque:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      throw new Error(`Erro ao criar movimento de estoque: ${errorMessage}`)
    }
  }
}
