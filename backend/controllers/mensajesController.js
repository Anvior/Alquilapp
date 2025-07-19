import db from '../db.js';

// Obtener mensajes entre dos usuarios
export const obtenerConversacion = async (req, res) => {
  const { emisorId, receptorId } = req.params;

  const sql = `
    SELECT * FROM mensajes
    WHERE (emisor_id = ? AND receptor_id = ?)
       OR (emisor_id = ? AND receptor_id = ?)
    ORDER BY fecha ASC
  `;

  try {
    const [results] = await db.query(sql, [emisorId, receptorId, receptorId, emisorId]);
    res.json(results);
  } catch (err) {
    console.error('❌ Error al obtener conversación:', err);
    res.status(500).json({ error: 'Error en base de datos' });
  }
};

// Enviar mensaje
export const enviarMensaje = async (req, res) => {
  const { emisor_id, receptor_id, contenido } = req.body;

 const sql = `
  INSERT INTO mensajes (emisor_id, receptor_id, contenido, leido)
  VALUES (?, ?, ?, 0)
`;

  try {
    await db.query(sql, [emisor_id, receptor_id, contenido]);
    res.json({ mensaje: 'Mensaje enviado con éxito' });
  } catch (err) {
    console.error('❌ Error al enviar mensaje:', err);
    res.status(500).json({ error: 'Error en base de datos' });
  }
};

export const obtenerNoLeidos = async (req, res) => {
  console.log(' Entró a obtenerNoLeidos con ID:', req.params.usuarioId);
  const { usuarioId } = req.params;

  try {
    const [rows] = await db.query(
      'SELECT COUNT(*) AS cantidad FROM mensajes WHERE receptor_id = ? AND leido = 0',
      [usuarioId]
    );

    console.log('🧪 Resultado SQL no leídos:', rows); // 👈 este sí debería salir

    res.json({ total: rows[0].cantidad }); // 👈 cambias result por rows
  } catch (err) {
    console.error('❌ Error al contar no leídos:', err);
    res.status(500).json({ error: 'Error en base de datos' });
  }
};

// ✅ Nuevo controlador para marcar mensajes como leídos
export const marcarComoLeidos = async (req, res) => {
  const { emisorId, receptorId } = req.params;

  if (!emisorId || !receptorId) {
    return res.status(400).json({ error: 'Faltan parámetros emisorId o receptorId' });
  }

  const sql = `
    UPDATE mensajes
    SET leido = 1
    WHERE emisor_id = ? AND receptor_id = ? AND leido = 0
  `;

  try {
    await db.query(sql, [emisorId, receptorId]);
    res.json({ mensaje: 'Mensajes marcados como leídos' });
  } catch (err) {
    console.error('❌ Error al marcar mensajes como leídos:', err);
    res.status(500).json({ error: 'Error en base de datos' });
  }
};
export const obtenerNoLeidosPorUsuario = async (req, res) => {
  const { usuarioId } = req.params;

  try {
    const [rows] = await db.query(`
      SELECT emisor_id AS emisorId, COUNT(*) AS cantidad
      FROM mensajes
      WHERE receptor_id = ? AND leido = 0
      GROUP BY emisor_id
      ORDER BY cantidad DESC
    `, [usuarioId]);

    res.json(rows);
  } catch (err) {
    console.error('❌ Error en obtenerNoLeidosPorUsuario:', err);
    res.status(500).json({ error: 'Error en base de datos' });
  }
};
export const emisoresConNoLeidos = async (req, res) => {
  const { usuarioId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT emisor_id FROM mensajes WHERE receptor_id = ? AND leido = 0 GROUP BY emisor_id`,
      [usuarioId]
    );
    res.json(rows.map(r => r.emisor_id));
  } catch (err) {
    console.error('❌ Error al obtener emisores con no leídos:', err);
    res.status(500).json({ error: 'Error en base de datos' });
  }
};
