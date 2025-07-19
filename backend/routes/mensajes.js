import express from 'express';
import {
    obtenerConversacion,
    enviarMensaje,
    obtenerNoLeidos,
    obtenerNoLeidosPorUsuario, // <--- nuevo
    marcarComoLeidos, emisoresConNoLeidos
  } from '../controllers/mensajesController.js';
  

  
  
  
  

const router = express.Router();
router.get('/noleidos-por-usuario/:usuarioId', obtenerNoLeidosPorUsuario);
router.put('/marcar-leidos/:emisorId/:receptorId', marcarComoLeidos); // <--- Nueva ruta
router.get('/noleidos/:usuarioId', obtenerNoLeidos); // <-- ruta nueva
router.get('/no-leidos/usuarios/:usuarioId', emisoresConNoLeidos);

router.get('/:emisorId/:receptorId', obtenerConversacion);
router.post('/', enviarMensaje);


export default router;
