import db from '../db.js';

export const crearReporte = async (req, res) => {
  const { producto_id, usuario_reportado_id, usuario_reporte_id, texto } = req.body;

  try {
    await db.query(`
      INSERT INTO reportes (producto_id, usuario_reportado_id, usuario_reporter_id, texto)
      VALUES (?, ?, ?, ?)
    `, [producto_id, usuario_reportado_id, usuario_reporte_id, texto]);

    res.json({ mensaje: 'Reporte guardado correctamente' });
  } catch (err) {
    console.error('❌ Error al guardar reporte:', err);
    res.status(500).json({ error: 'Error en base de datos' });
  }
};
