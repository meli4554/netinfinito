import { Controller, Get } from '@nestjs/common'

@Controller()
export class AppController {
  @Get()
  getInfo() {
    return {
      name: 'NetInFi API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        auth: {
          login: 'POST /auth/login',
          logout: 'POST /auth/logout',
          me: 'GET /auth/me'
        },
        users: {
          create: 'POST /users',
          list: 'GET /users',
          update: 'PATCH /users/:id'
        },
        products: {
          create: 'POST /products',
          list: 'GET /products',
          update: 'PATCH /products/:id'
        },
        suppliers: {
          create: 'POST /suppliers',
          list: 'GET /suppliers',
          update: 'PATCH /suppliers/:id'
        },
        customers: {
          create: 'POST /customers',
          list: 'GET /customers',
          update: 'PATCH /customers/:id'
        },
        purchaseOrders: {
          create: 'POST /purchase-orders',
          list: 'GET /purchase-orders',
          updateStatus: 'PATCH /purchase-orders/:id/status'
        },
        invoices: {
          create: 'POST /invoices',
          list: 'GET /invoices',
          validate: 'PATCH /invoices/:id/validate'
        },
        inventory: {
          summary: 'GET /inventory/summary',
          movements: 'GET /inventory/products/:id/movements'
        },
        shipments: {
          create: 'POST /shipments',
          list: 'GET /shipments',
          updateStatus: 'PATCH /shipments/:id/status',
          addItems: 'POST /shipments/:id/items'
        },
        attachments: {
          upload: 'POST /attachments/upload'
        }
      }
    }
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString()
    }
  }
}
