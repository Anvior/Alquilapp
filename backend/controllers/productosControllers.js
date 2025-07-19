import db from '../db.js'; // conexión directa
import multer from 'multer';
import path from 'path';

// Obtener productos en alquiler
export const obtenerEnAlquiler = async (req, res) => {
  try {
    const [productos] = await db.query('SELECT * FROM productos WHERE disponible = 1');
    res.json(productos);
  } catch (err) {
    console.error('❌ Error al obtener productos en alquiler:', err);
    res.status(500).json({ error: 'Error en base de datos' });
  }
};


// Crear un nuevo producto
export const crearProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio, categoria, usuario_id, min_dias } = req.body;
    const imagen = req.file?.filename || null;


    if (!imagen) return res.status(400).json({ error: 'Imagen no recibida' });

    console.log('🟢 Recibido:', { nombre, descripcion, precio, imagen, categoria });

    const sql = `
      INSERT INTO productos (nombre, descripcion,imagen, categoria,precio, usuario_id, min_dias)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await db.query(sql, [nombre, descripcion, imagen, categoria, precio, usuario_id, min_dias]);

    res.json({ mensaje: 'Producto creado con éxito' });
  } catch (err) {
    console.error('❌ Error al insertar producto:', err);
    res.status(500).send({ error: 'Error en base de datos' });
  }
};



export const reactivarProducto = async (req, res) => {
  const productoId = req.params.id;
  console.log('➡️ ID a reactivar:', productoId);

  try {
    await db.query(`
      UPDATE productos 
      SET disponible = 1 
      WHERE id = ?
    `, [productoId]);
    console.log(productoId)
    console.log('✔ Producto actualizado')

    await db.query(`
      UPDATE alquileres 
      SET fecha_inicio = NULL, fecha_fin = NULL 
      WHERE producto_id = ?
    `, [productoId]);

    res.json({ mensaje: 'Producto reactivado con éxito' });
  } catch (err) {
    console.error('❌ Error al reactivar producto:', err);
    res.status(500).json({ error: 'Error al reactivar producto' });
  }
};


// Obtener productos por categoría
export const obtenerPorCategoria = async (req, res) => {
  const categoria = req.params.nombre;
  const sql = 'SELECT * FROM productos WHERE LOWER(categoria) = LOWER(?)';

  try {
    const [result] = await db.query(sql, [categoria]);
    res.json(result);
  } catch (err) {
    console.error('❌ Error al obtener por categoría:', err);
    res.status(500).send({ error: 'Error al obtener productos por categoría' });
  }
};

// Obtener los más alquilados (simulado)
export const masAlquilados = async (req, res) => {
  try {
    const [result] = await db.query('SELECT * FROM productos ORDER BY id DESC LIMIT 3');
    res.json(result);
  } catch (err) {
    console.error('❌ Error al obtener más alquilados:', err);
    res.status(500).send(err);
  }
};

// Obtener productos destacados
export const destacados = async (req, res) => {
  try {
    const [result] = await db.query('SELECT * FROM productos LIMIT 3');
    res.json(result);
  } catch (err) {
    console.error('❌ Error al obtener destacados:', err);
    res.status(500).send(err);
  }
};
export const obtenerProductoPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('SELECT * FROM productos WHERE id = ?', [id]);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(result[0]);
  } catch (err) {
    console.error('❌ Error al obtener producto por ID:', err);
    res.status(500).json({ error: 'Error en base de datos' });
  }
};

// Marcar producto como no disponible
export const marcarComoAlquilado = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query('UPDATE productos SET disponible = 0 WHERE id = ?', [id]);
    res.json({ mensaje: 'Producto marcado como alquilado' });
  } catch (err) {
    console.error('❌ Error al actualizar disponibilidad:', err);
    res.status(500).json({ error: 'Error en base de datos' });
  }
};

export const obtenerProductosEnAlquiler = async (req, res) => {
  const { usuarioId } = req.params;
  console.log('🔍 Recibido ID del usuario:', usuarioId);

  try {
    const [productos] = await db.query(
      'SELECT * FROM productos WHERE usuario_id = ? AND disponible = 1',
      [usuarioId]
    );

    console.log('✅ Productos encontrados:', productos);

    res.json(productos);
  } catch (err) {
    console.error('❌ Error obteniendo productos en alquiler:', err);
    res.status(500).json({ error: 'Error en base de datos' });
  }
};



export const obtenerAlquileresHistoricos = async (req, res) => {
  const { usuarioId } = req.params;

  try {
    const [result] = await db.query(`
      SELECT 
        a.id AS alquiler_id,      -- si quieres conservarlo
        p.id AS producto_id,      -- 👈 necesario para reactivar correctamente
        a.usuario_alquilador_id, 
        p.nombre, p.precio, p.imagen
      FROM alquileres a
      JOIN productos p ON a.producto_id = p.id
      WHERE a.usuario_dueno_id = ? AND p.disponible = 0
      ORDER BY a.fecha DESC
    `, [usuarioId]);
    

    res.json(result);
  } catch (err) {
    console.error('❌ Error al obtener historial de alquileres:', err);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
};

export const obtenerMisAlquileres = async (req, res) => {
  const { usuarioId } = req.params;

  try {
    const [result] = await db.query(`
      SELECT 
        a.id,
        a.producto_id,    -- 🔥 producto_id necesario para las reseñas
        a.fecha,
        p.nombre,
        p.imagen,
        p.precio,
        u.nombre AS duenio,
        u.id AS duenioId  -- 🔥 ID del dueño
      FROM alquileres a
      JOIN productos p ON a.producto_id = p.id
      JOIN usuarios u ON a.usuario_dueno_id = u.id
      WHERE a.usuario_alquilador_id = ?
      ORDER BY a.fecha DESC
    `, [usuarioId]);

    res.json(result);
  } catch (err) {
    console.error('❌ Error al obtener mis alquileres:', err);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
};


