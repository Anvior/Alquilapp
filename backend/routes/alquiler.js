import express from 'express';
import { alquilarProducto } from '../controllers/alquilerController.js';

const router = express.Router();

console.log('✅ Router de alquiler cargado');

router.post('/alquilar', (req, res, next) => {
  console.log('📩 Se recibió un POST a /alquiler/alquilar');
  return alquilarProducto(req, res, next);
});

export default router;
