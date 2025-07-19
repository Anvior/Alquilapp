import express from 'express';
import { añadirTarjeta } from '../controllers/tarjetasController.js';

const router = express.Router();

router.post('/', añadirTarjeta);

export default router;
