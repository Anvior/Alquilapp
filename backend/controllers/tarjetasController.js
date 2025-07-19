import db from '../db.js';

export const añadirTarjeta = async (req, res) => {
  const { usuario_id, marca, numero } = req.body;

  try {
    await db.query(
      'INSERT INTO tarjetas (usuario_id, numero,marca) VALUES (?, ?, ?)',
      [usuario_id,  numero, marca,]
    );
    res.json({ mensaje: 'Tarjeta añadida con éxito' });
  } catch (err) {
    console.error('❌ Error al añadir tarjeta:', err);
    res.status(500).json({ error: 'Error en base de datos' });
  }
};
