import express from 'express';
import multer from 'multer';
import {
  registrarUsuario,
  iniciarSesion,
  obtenerUsuarios,
  editarPerfil,
  obtenerUsuarioPorId,
  recuperarContrasena,
  restablecerContrasena
} from '../controllers/usuariosControllers.js';
const upload = multer();
const router = express.Router();

// Registro e inicio de sesión
router.post('/registro', registrarUsuario);
router.post('/login', iniciarSesion);
router.post('/recuperar-contrasena', recuperarContrasena);
router.post('/restablecer', restablecerContrasena);

// Obtener usuarios disponibles (excluyendo al logueado)
router.get('/disponibles/:id', obtenerUsuarios);
router.get('/:id', obtenerUsuarioPorId);
router.put('/editar/:id', upload.single('foto'), editarPerfil);


export default router;
