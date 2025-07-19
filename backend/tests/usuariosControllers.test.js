/* eslint-env vitest */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as usuarios from '../controllers/usuariosControllers.js'

vi.mock('../db.js', () => ({
  default: {
    query: vi.fn()
  }
}))

vi.mock('bcryptjs', async () => {
  return {
    default: {
      hash: vi.fn(() => 'hashed123'),
      compare: vi.fn()
    }
  }
})

vi.mock('nodemailer', () => ({
  createTransport: vi.fn(() => ({
    sendMail: vi.fn()
  }))
}))

const db = (await import('../db.js')).default
const bcrypt = (await import('bcryptjs')).default

describe('usuariosControllers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const res = () => ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
    send: vi.fn()
  })

  it('registra un usuario correctamente', async () => {
    db.query
      .mockResolvedValueOnce([[]]) // no existe usuario
      .mockResolvedValueOnce([])   // inserción

    const req = {
      body: {
        nombre: 'Ana',
        email: 'ana@mail.com',
        contrasena: 'pass123',
        foto: ''
      }
    }

    const r = res()
    await usuarios.registrarUsuario(req, r)
    expect(r.json).toHaveBeenCalledWith({ mensaje: 'Usuario registrado correctamente' })
  })

  it('previene duplicados por email', async () => {
    db.query.mockResolvedValueOnce([[{ nombre: 'Otra', email: 'ana@mail.com' }]])

    const req = {
      body: {
        nombre: 'Ana',
        email: 'ana@mail.com'
      }
    }

    const r = res()
    await usuarios.registrarUsuario(req, r)

    expect(r.status).toHaveBeenCalledWith(400)
    expect(r.json).toHaveBeenCalledWith({ error: 'Ya existe un usuario con ese email' })
  })

  it('inicia sesión correctamente', async () => {
    db.query.mockResolvedValueOnce([
      [{ email: 'ana@mail.com', contrasena: 'hashed123' }]
    ])
    bcrypt.compare.mockResolvedValueOnce(true)

    const req = {
      body: {
        email: 'ana@mail.com',
        contrasena: 'pass123'
      }
    }

    const r = res()
    await usuarios.iniciarSesion(req, r)
    expect(r.send).toHaveBeenCalledWith({
      mensaje: 'Inicio de sesión exitoso',
      usuario: { email: 'ana@mail.com', contrasena: 'hashed123' }
    })
  })

  it('rechaza login con contraseña incorrecta', async () => {
    db.query.mockResolvedValueOnce([
      [{ email: 'ana@mail.com', contrasena: 'hashed123' }]
    ])
    bcrypt.compare.mockResolvedValueOnce(false)

    const req = {
      body: {
        email: 'ana@mail.com',
        contrasena: 'incorrecta'
      }
    }

    const r = res()
    await usuarios.iniciarSesion(req, r)
    expect(r.status).toHaveBeenCalledWith(401)
    expect(r.send).toHaveBeenCalledWith({ error: 'Contraseña incorrecta' })
  })

  it('restablece la contraseña', async () => {
    const req = {
      body: {
        email: 'ana@mail.com',
        nueva: 'nuevo123'
      }
    }

    const r = res()
    db.query.mockResolvedValueOnce([])

    await usuarios.restablecerContrasena(req, r)

    expect(db.query).toHaveBeenCalledWith(
      'UPDATE usuarios SET contrasena = ? WHERE email = ?',
      ['hashed123', 'ana@mail.com']
    )
   expect(r.json).toHaveBeenCalledWith({ mensaje: 'Contraseña actualizada correctamente' })

  })
})
