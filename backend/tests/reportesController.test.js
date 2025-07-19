/* eslint-env vitest */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as reportesController from '../controllers/reportesController.js';

vi.mock('../db.js', () => ({
  default: {
    query: vi.fn()
  }
}));

import db from '../db.js';

describe('reportesController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        producto_id: 1,
        usuario_reportado_id: 2,
        usuario_reporte_id: 3,
        texto: 'Contenido inapropiado'
      }
    };
    res = {
      json: vi.fn(),
      status: vi.fn(() => res)
    };
    vi.clearAllMocks();
  });

  it('crearReporte - guarda correctamente un reporte', async () => {
    db.query.mockResolvedValueOnce();

    await reportesController.crearReporte(req, res);

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO reportes'),
      [1, 2, 3, 'Contenido inapropiado']
    );
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'Reporte guardado correctamente' });
  });

  it('crearReporte - maneja error de base de datos', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    db.query.mockRejectedValueOnce(new Error('DB error'));

    await reportesController.crearReporte(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error en base de datos' });

    errorSpy.mockRestore();
  });
});
