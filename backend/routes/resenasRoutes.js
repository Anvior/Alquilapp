// routes/resenasRoutes.js
import express from 'express';
import { crearResena, obtenerResenasRecibidas } from '../controllers/resenasController.js';

const router = express.Router();

router.post('/crear', crearResena);
router.get('/recibidas/:duenioId',obtenerResenasRecibidas)

export default router;
