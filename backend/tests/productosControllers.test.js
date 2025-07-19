/* eslint-env vitest */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as productosControllers from '../controllers/productosControllers.js'

vi.mock('../db.js', () => ({
  default: {
    query: vi.fn()
  }
}))
import db from '../db.js'

describe('productosControllers', () => {
  let req, res

  beforeEach(() => {
    req = { body: {}, params: {} }
    res = {
      json: vi.fn(),
      status: vi.fn(() => res),
      send: vi.fn()
    }
    vi.clearAllMocks()
  })

  it('obtenerEnAlquiler - devuelve productos disponibles', async () => {
    const mockData = [{ id: 1, nombre: 'Producto A' }]
    db.query.mockResolvedValueOnce([mockData])

    await productosControllers.obtenerEnAlquiler(req, res)

    expect(res.json).toHaveBeenCalledWith(mockData)
  })

  it('crearProducto - inserta producto correctamente', async () => {
req.body = {
  nombre: 'Taladro',
  descripcion: 'Potente',
  precio: 30,
  categoria: 'Herramientas',
  usuario_id: 1,
  min_dias: 2
}
req.file = {
  filename: 'img.jpg' // ✅ así sí se reconoce como imagen subida por multer
}


    await productosControllers.crearProducto(req, res)

    expect(db.query).toHaveBeenCalled()
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'Producto creado con éxito' })
  })

  it('reactivarProducto - marca producto disponible y limpia fechas', async () => {
    req.params.id = 42

    await productosControllers.reactivarProducto(req, res)

    expect(db.query).toHaveBeenCalledWith(
      expect.stringMatching(/update\s+productos\s+set\s+disponible\s*=\s*1/i),
      [42]
    )
    expect(db.query).toHaveBeenCalledWith(
      expect.stringMatching(/update\s+alquileres\s+set\s+fecha_inicio\s*=\s*null/i),
      [42]
    )
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'Producto reactivado con éxito' })
  })

  it('obtenerPorCategoria - devuelve productos por categoría', async () => {
    req.params.nombre = 'Tecnología'
    const mockResult = [{ id: 1, categoria: 'Tecnología' }]
    db.query.mockResolvedValueOnce([mockResult])

    await productosControllers.obtenerPorCategoria(req, res)

    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('WHERE LOWER(categoria)'), ['Tecnología'])
    expect(res.json).toHaveBeenCalledWith(mockResult)
  })

  it('masAlquilados - devuelve últimos productos', async () => {
    const result = [{ id: 1 }]
    db.query.mockResolvedValueOnce([result])

    await productosControllers.masAlquilados(req, res)

    expect(db.query).toHaveBeenCalledWith('SELECT * FROM productos ORDER BY id DESC LIMIT 3')
    expect(res.json).toHaveBeenCalledWith(result)
  })

  it('destacados - devuelve productos destacados', async () => {
    const result = [{ id: 1 }]
    db.query.mockResolvedValueOnce([result])

    await productosControllers.destacados(req, res)

    expect(db.query).toHaveBeenCalledWith('SELECT * FROM productos LIMIT 3')
    expect(res.json).toHaveBeenCalledWith(result)
  })

  it('obtenerProductoPorId - producto encontrado', async () => {
    req.params.id = 1
    db.query.mockResolvedValueOnce([[{ id: 1, nombre: 'Producto' }]])

    await productosControllers.obtenerProductoPorId(req, res)

    expect(res.json).toHaveBeenCalledWith({ id: 1, nombre: 'Producto' })
  })

  it('marcarComoAlquilado - actualiza disponibilidad', async () => {
    req.params.id = 99

    await productosControllers.marcarComoAlquilado(req, res)

    expect(db.query).toHaveBeenCalledWith('UPDATE productos SET disponible = 0 WHERE id = ?', [99])
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'Producto marcado como alquilado' })
  })

  it('obtenerProductosEnAlquiler - productos de un usuario', async () => {
    req.params.usuarioId = 3
    const mock = [{ id: 1 }]
    db.query.mockResolvedValueOnce([mock])

    await productosControllers.obtenerProductosEnAlquiler(req, res)

    expect(res.json).toHaveBeenCalledWith(mock)
  })

  it('obtenerAlquileresHistoricos - devuelve productos alquilados', async () => {
    req.params.usuarioId = 2
    const mock = [{ producto_id: 1 }]
    db.query.mockResolvedValueOnce([mock])

    await productosControllers.obtenerAlquileresHistoricos(req, res)

    expect(res.json).toHaveBeenCalledWith(mock)
  })

  it('obtenerMisAlquileres - devuelve alquileres como cliente', async () => {
    req.params.usuarioId = 4
    const mock = [{ producto_id: 10 }]
    db.query.mockResolvedValueOnce([mock])

    await productosControllers.obtenerMisAlquileres(req, res)

    expect(res.json).toHaveBeenCalledWith(mock)
  })
})
