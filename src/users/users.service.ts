import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'
import * as argon2 from 'argon2'

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  async create(dto: { email: string; password: string; name?: string; roleId: number }) {
    const passwordHash = await argon2.hash(dto.password)

    const result = await this.db.execute(
      `INSERT INTO User (id, email, passwordHash, name, roleId, isActive, createdAt, updatedAt)
       VALUES (UUID(), ?, ?, ?, ?, 1, NOW(), NOW())`,
      [dto.email, passwordHash, dto.name || null, dto.roleId]
    )

    return this.db.queryOne(
      'SELECT * FROM User WHERE email = ?',
      [dto.email]
    )
  }

  list() {
    return this.db.query('SELECT * FROM User')
  }

  async update(id: string, dto: { name?: string; roleId?: number; isActive?: boolean }) {
    const fields: string[] = []
    const values: any[] = []

    if (dto.name !== undefined) {
      fields.push('name = ?')
      values.push(dto.name)
    }
    if (dto.roleId !== undefined) {
      fields.push('roleId = ?')
      values.push(dto.roleId)
    }
    if (dto.isActive !== undefined) {
      fields.push('isActive = ?')
      values.push(dto.isActive)
    }

    if (fields.length === 0) {
      return this.db.queryOne('SELECT * FROM User WHERE id = ?', [id])
    }

    fields.push('updatedAt = NOW()')
    values.push(id)

    await this.db.execute(
      `UPDATE User SET ${fields.join(', ')} WHERE id = ?`,
      values
    )

    return this.db.queryOne('SELECT * FROM User WHERE id = ?', [id])
  }
}
