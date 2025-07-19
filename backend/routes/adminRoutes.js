import db from '../db.js';
import express from 'express';
import { obtenerUsuarios, eliminarUsuario, obtenerReportes, eliminarReporte, responderReporte  } from '../controllers/adminController.js';
const router = express.Router();

router.get('/usuarios', obtenerUsuarios);
router.delete('/usuarios/:id', eliminarUsuario);
router.get('/reportes', obtenerReportes);
router.post('/responder-reporte/:id', responderReporte);
router.delete('/reportes/:id', eliminarReporte);
export default router;