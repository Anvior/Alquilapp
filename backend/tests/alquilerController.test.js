/* eslint-env vitest */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { alquilarProducto } from '../controllers/alquilerController.js'

vi.mock('../db.js', () => ({
  default: {
    query: vi.fn()
  }
}))
vi.mock('nodemailer', async () => {
    const actual = await vi.importActual('nodemailer')
    return {
      ...actual,
      default: {
        createTransport: () => ({
          sendMail: vi.fn().mockResolvedValue({ messageId: 'mock123' })
        })
      }
    }
  })
  

import db from '../db.js'

describe('alquilarProducto', () => {
  const req = {
    body: {
      usuario_id: 1,
      producto_id: 101,
      fecha_inicio: '2025-05-02',
      fecha_fin: '2025-05-05'
    }
  }

  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

it('debería alquilar el producto con éxito', async () => {
  db.query
    .mockResolvedValueOnce([[{ id: 101, precio: 50, disponible: 1, usuario_id: 2, nombre: 'Taladro Bosch' }]])
    .mockResolvedValueOnce([[{ saldo: 200 }]]) // suficiente saldo
    .mockResolvedValueOnce() // UPDATE saldo usuario
    .mockResolvedValueOnce() // INSERT movimiento pago
    .mockResolvedValueOnce() // UPDATE saldo dueño
    .mockResolvedValueOnce() // INSERT movimiento ingreso
    .mockResolvedValueOnce([[{ email: 'duenio@test.com', nombre: 'Juan' }]]) // SELECT dueño
    .mockResolvedValueOnce() // UPDATE producto disponible
    .mockResolvedValueOnce() // INSERT alquiler

  await alquilarProducto(req, res)

  expect(res.json).toHaveBeenCalledWith({ mensaje: '✅ Producto alquilado con éxito' })
})

})
