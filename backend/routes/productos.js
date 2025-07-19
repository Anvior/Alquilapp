import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  obtenerEnAlquiler,
  crearProducto,
  reactivarProducto,
  obtenerProductoPorId,
  obtenerPorCategoria,
  masAlquilados,
  destacados,
  marcarComoAlquilado,
  obtenerProductosEnAlquiler,
  obtenerAlquileresHistoricos,
  obtenerMisAlquileres
} from '../controllers/productosControllers.js';
import pool from '../db.js'; // Asegúrate de importar pool si usas conexión directa aquí

const router = express.Router();

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// ✅ Ruta POST para crear productos
router.post('/', upload.single('imagen'), crearProducto);

// ✅ Ruta pública → MOVER ARRIBA para que no entre en conflicto con /:id
router.get('/productos/publicos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM productos WHERE disponible = 1');
    res.json(rows); // Devuelve array vacío si no hay productos
  } catch (error) {
    console.error('❌ Error al obtener productos públicos:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Otras rutas
router.get('/en-alquiler', obtenerEnAlquiler);
router.get('/categoria/:nombre', obtenerPorCategoria);
router.get('/masAlquilados', masAlquilados);
router.get('/destacados', destacados);
router.get('/en-alquiler/:usuarioId', obtenerProductosEnAlquiler);
router.get('/alquilados/:usuarioId', obtenerAlquileresHistoricos);
router.get('/mis-alquileres/:usuarioId', obtenerMisAlquileres);
router.put('/alquilar/:id', marcarComoAlquilado);
router.patch('/reactivar/:id', reactivarProducto);

// ⚠️ Esta ruta debe ir la última para no interferir con otras más específicas
router.get('/:id', obtenerProductoPorId);

export default router;
