import express from 'express';
import { añadirFavorito, eliminarFavorito, obtenerFavoritos, contarFavoritosProducto } from '../controllers/favoritosController.js';

const router = express.Router();

router.post('/add', añadirFavorito);
router.post('/remove', eliminarFavorito);
router.get('/:usuarioId', obtenerFavoritos);
router.get('/count/:productoId', contarFavoritosProducto); // 🆕 esta es la ruta nueva

export default router;
