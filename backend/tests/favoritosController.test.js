/* eslint-env vitest */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as favoritosController from '../controllers/favoritosController.js'

vi.mock('../db.js', () => ({
  default: {
    query: vi.fn()
  }
}))

import db from '../db.js'

describe('favoritosController', () => {
  let req, res

  beforeEach(() => {
    req = { body: {}, params: {} }
    res = {
      json: vi.fn(),
      status: vi.fn(() => res)
    }
    vi.clearAllMocks()
  })

  it('añadirFavorito - añade producto a favoritos', async () => {
    req.body = { usuarioId: 1, productoId: 2 }

    await favoritosController.añadirFavorito(req, res)

    expect(db.query).toHaveBeenCalledWith(
      'INSERT IGNORE INTO favoritos (usuario_id, producto_id) VALUES (?, ?)',
      [1, 2]
    )
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'Producto añadido a favoritos' })
  })

  it('eliminarFavorito - elimina favorito', async () => {
    req.body = { usuarioId: 1, productoId: 2 }

    await favoritosController.eliminarFavorito(req, res)

    expect(db.query).toHaveBeenCalledWith(
      'DELETE FROM favoritos WHERE usuario_id = ? AND producto_id = ?',
      [1, 2]
    )
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'Favorito eliminado' })
  })

  it('obtenerFavoritos - devuelve favoritos disponibles', async () => {
    req.params = { usuarioId: 1 }
    const mockResult = [{ id: 1, nombre: 'Producto 1' }]
    db.query.mockResolvedValueOnce([mockResult])

    await favoritosController.obtenerFavoritos(req, res)

    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('SELECT p.*'), [1])
    expect(res.json).toHaveBeenCalledWith(mockResult)
  })

  it('contarFavoritosProducto - cuenta usuarios que añadieron producto', async () => {
    req.params = { productoId: 5 }
    db.query.mockResolvedValueOnce([[{ count: 3 }]])

    await favoritosController.contarFavoritosProducto(req, res)

    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('SELECT COUNT(*)'), [5])
    expect(res.json).toHaveBeenCalledWith({ count: 3 })
  })
})
