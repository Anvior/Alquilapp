import express from 'express';
import { crearReporte } from '../controllers/reportesController.js';

const router = express.Router();

router.post('/crear', crearReporte);

export default router;
