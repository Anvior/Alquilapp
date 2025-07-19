import db from '../db.js';

// Añadir favorito
export const añadirFavorito = async (req, res) => {
  const { usuarioId, productoId } = req.body;
  try {
    await db.query(
      'INSERT IGNORE INTO favoritos (usuario_id, producto_id) VALUES (?, ?)',
      [usuarioId, productoId]
    );
    res.json({ mensaje: 'Producto añadido a favoritos' });
  } catch (err) {
    console.error('❌ Error al añadir favorito:', err);
    res.status(500).json({ error: 'Error al añadir favorito' });
  }
};

// Eliminar favorito
export const eliminarFavorito = async (req, res) => {
  const { usuarioId, productoId } = req.body;
  try {
    await db.query('DELETE FROM favoritos WHERE usuario_id = ? AND producto_id = ?', [usuarioId, productoId]);
    res.json({ mensaje: 'Favorito eliminado' });
  } catch (err) {
    console.error('❌ Error al eliminar favorito:', err);
    res.status(500).json({ error: 'Error al eliminar favorito' });
  }
};

// Obtener favoritos de un usuario con disponibilidad
export const obtenerFavoritos = async (req, res) => {
  const { usuarioId } = req.params;
  try {
    const [result] = await db.query(`
      SELECT p.*
      FROM favoritos f
      JOIN productos p ON f.producto_id = p.id
      WHERE f.usuario_id = ? AND p.disponible = 1
    `, [usuarioId]);

    res.json(result);
  } catch (err) {
    console.error('❌ Error al obtener favoritos disponibles:', err);
    res.status(500).json({ error: 'Error en base de datos' });
  }
};

// 🔥 NUEVO: Contar cuántos usuarios tienen un producto como favorito
export const contarFavoritosProducto = async (req, res) => {
  const { productoId } = req.params;
  try {
    const [result] = await db.query(`
      SELECT COUNT(*) AS count
      FROM favoritos
      WHERE producto_id = ?
    `, [productoId]);

    res.json({ count: result[0].count });
  } catch (err) {
    console.error('❌ Error al contar favoritos:', err);
    res.status(500).json({ error: 'Error al contar favoritos' });
  }
};
