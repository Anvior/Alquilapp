/* eslint-env vitest */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as mensajesController from '../controllers/mensajesController.js'

vi.mock('../db.js', () => ({
  default: {
    query: vi.fn()
  }
}))

import db from '../db.js'

describe('mensajesController', () => {
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

  it('obtenerConversacion - devuelve mensajes ordenados', async () => {
    req.params = { emisorId: '1', receptorId: '2' }
    const mockMessages = [{ id: 1, contenido: 'Hola' }]
    db.query.mockResolvedValueOnce([mockMessages])

    await mensajesController.obtenerConversacion(req, res)

    expect(db.query).toHaveBeenCalled()
    expect(res.json).toHaveBeenCalledWith(mockMessages)
  })

  it('enviarMensaje - inserta correctamente el mensaje', async () => {
    req.body = { emisor_id: 1, receptor_id: 2, contenido: 'Hola' }
    db.query.mockResolvedValueOnce()

    await mensajesController.enviarMensaje(req, res)

    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO mensajes'), [1, 2, 'Hola'])
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'Mensaje enviado con éxito' })
  })

  it('obtenerNoLeidos - devuelve cantidad de mensajes no leídos', async () => {
    req.params = { usuarioId: 3 }
    db.query.mockResolvedValueOnce([[{ cantidad: 4 }]])

    await mensajesController.obtenerNoLeidos(req, res)

    expect(res.json).toHaveBeenCalledWith({ total: 4 })
  })

  it('marcarComoLeidos - actualiza estado de lectura', async () => {
    req.params = { emisorId: 1, receptorId: 2 }
    db.query.mockResolvedValueOnce()

    await mensajesController.marcarComoLeidos(req, res)

    expect(db.query).toHaveBeenCalled()
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'Mensajes marcados como leídos' })
  })

  it('obtenerNoLeidosPorUsuario - agrupa no leídos por emisor', async () => {
    req.params = { usuarioId: 3 }
    const mock = [{ emisorId: 1, cantidad: 2 }]
    db.query.mockResolvedValueOnce([mock])

    await mensajesController.obtenerNoLeidosPorUsuario(req, res)

    expect(res.json).toHaveBeenCalledWith(mock)
  })

  it('emisoresConNoLeidos - devuelve lista de emisores', async () => {
    req.params = { usuarioId: 3 }
    db.query.mockResolvedValueOnce([[{ emisor_id: 1 }, { emisor_id: 2 }]])

    await mensajesController.emisoresConNoLeidos(req, res)

    expect(res.json).toHaveBeenCalledWith([1, 2])
  })
})