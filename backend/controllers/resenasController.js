// controllers/resenasController.js
import db from '../db.js';

export const crearResena = async (req, res) => {
  const { usuario_id, producto_id, reseña, duenio_id } = req.body;

  try {
    await db.query(`
      INSERT INTO resenas (usuario_id, producto_id, dueno_id, texto, fecha)
      VALUES (?, ?, ?, ?, NOW())
    `, [usuario_id,producto_id, duenio_id, reseña]); // 🔥 ahora bien ordenado producto → autor → dueño → texto

    res.json({ mensaje: 'Reseña guardada correctamente' });
  } catch (err) {
    console.error('❌ Error al guardar reseña:', err,);
    res.status(500).json({ error: 'Error en base de datos al guardar reseña' });
  }
};

// controllers/resenasController.js
export const obtenerResenasRecibidas = async (req, res) => {
  const { duenioId } = req.params;

  try {
    const [result] = await db.query(`
      SELECT 
        r.texto,
        r.fecha,
        p.nombre AS productoNombre,
        u.nombre AS usuarioNombre
      FROM resenas r
      JOIN productos p ON r.producto_id = p.id
      JOIN usuarios u ON r.usuario_id = u.id
      WHERE dueno_id = ?
      ORDER BY r.fecha DESC
    `, [duenioId]);

    res.json(result);
  } catch (err) {
    console.error('❌ Error al obtener reseñas recibidas:', err);
    res.status(500).json({ error: 'Error en base de datos' });
  }
};
