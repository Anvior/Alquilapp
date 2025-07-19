// backend/index.js
// ✅
import express from 'express';

import path from 'path';
import cors    from 'cors';
import dotenv  from 'dotenv';
import productosRoutes from './routes/productos.js';
import usuariosRoutes  from './routes/usuarios.js';
import mensajesRoutes from './routes/mensajes.js';
import favoritosRoutes from './routes/favoritos.js';
import monederoRoutes from './routes/monederoRoutes.js';
import tarjetasRoutes from './routes/tarjetasRoutes.js';
import alquilerRoutes from './routes/alquiler.js';
import resenasRoutes from './routes/resenasRoutes.js';
import reportesRoutes from './routes/reportesRoutes.js'
import adminRoutes from './routes/adminRoutes.js';






dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use('/monedero', monederoRoutes);
app.use('/tarjetas', tarjetasRoutes);
app.use('/productos', productosRoutes);
app.use('/admin', adminRoutes);
app.use('/usuarios',  usuariosRoutes);
app.use('/mensajes', mensajesRoutes);
app.use('/favoritos', favoritosRoutes);
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/alquiler', alquilerRoutes);
app.use('/reportes', reportesRoutes);
app.use('/resenas', resenasRoutes);
app.use(express.urlencoded({ extended: true }));


const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor listening on http://0.0.0.0:${PORT}`);
});



// Ejemplo inline de POST /productos (si quieres mantenerlo aquí)
app.post('/productos', (req, res) => {
  const { nombre, descripcion, precio, imagen, categoria, usuario_id = null } = req.body;
  const sql = `
    INSERT INTO productos (nombre, descripcion, precio, imagen, categoria, usuario_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [nombre, descripcion, precio, imagen, categoria, usuario_id], (err) => {
    if (err) {
      console.error('Error al insertar producto:', err);
      return res.status(500).json({ error: 'Error al insertar producto' });
    }
    res.json({ mensaje: 'Producto añadido correctamente' });
  });
});



app.get('/', (req, res) => {
  res.send('Hola desde el backend!');
});


// Levanta el servidor
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`✅ Servidor listening on http://localhost:${PORT}`);
  });
}

export default app;

