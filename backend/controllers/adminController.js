import db from '../db.js';
import nodemailer from 'nodemailer';

// Obtener todos los usuarios
export const obtenerUsuarios = async (req, res) => {
  const [usuarios] = await db.query('SELECT id, nombre, email FROM usuarios');
  res.json(usuarios);
};

// Eliminar un usuario
export const eliminarUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    // 🔥 Eliminar favoritos de productos que pertenecen al usuario
    await db.query(`
      DELETE f FROM favoritos f
      JOIN productos p ON f.producto_id = p.id
      WHERE p.usuario_id = ?
    `, [id]);

    // 🔥 Eliminar favoritos del usuario
    await db.query('DELETE FROM favoritos WHERE usuario_id = ?', [id]);

    // 🔥 Eliminar alquileres donde el usuario es dueño o alquilador
    await db.query('DELETE FROM alquileres WHERE usuario_dueno_id = ? OR usuario_alquilador_id = ?', [id, id]);

    // 🔥 Eliminar productos del usuario
    await db.query('DELETE FROM productos WHERE usuario_id = ?', [id]);

    // 🔥 Eliminar movimientos asociados
    await db.query('DELETE FROM movimientos WHERE usuario_id = ?', [id]);

    // 🔥 Eliminar mensajes donde el usuario sea emisor o receptor
    await db.query('DELETE FROM mensajes WHERE emisor_id = ? OR receptor_id = ?', [id, id]);

    // 🔥 Eliminar tarjetas asociadas
    await db.query('DELETE FROM tarjetas WHERE usuario_id = ?', [id]);

    // 🔥 Eliminar reportes en los que participa
    await db.query('DELETE FROM reportes WHERE usuario_reporter_id = ? OR usuario_reportado_id = ?', [id, id]);

    // 🔥 Eliminar reseñas escritas por el usuario o dirigidas a él
    await db.query('DELETE FROM resenas WHERE usuario_id = ? OR dueno_id = ?', [id, id]);


    // 🔥 Eliminar el usuario
    await db.query('DELETE FROM usuarios WHERE id = ?', [id]);

    res.json({ mensaje: '✅ Usuario y datos asociados eliminados correctamente' });
  } catch (err) {
    console.error('❌ Error al eliminar usuario:', err);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};


  

// Obtener todos los reportes
export const obtenerReportes = async (req, res) => {
  const [reportes] = await db.query('SELECT * FROM reportes ORDER BY fecha DESC');
  res.json(reportes);
};

// Eliminar un reporte
export const eliminarReporte = async (req, res) => {
  const { id } = req.params;
  await db.query('DELETE FROM reportes WHERE id = ?', [id]);
  res.json({ mensaje: 'Reporte eliminado' });
};

export const responderReporte = async (req, res) => {
  const { id } = req.params;
  const { respuesta } = req.body;

  try {
    // Obtener el reporte
    const [[reporte]] = await db.query('SELECT usuario_reporter_id FROM reportes WHERE id = ?', [id]);

    if (!reporte) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    // Obtener el usuario que hizo el reporte
    const [[usuario]] = await db.query('SELECT email, nombre FROM usuarios WHERE id = ?', [reporte.usuario_reporter_id]);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario que reportó no encontrado' });
    }

    // Configurar el transporte para enviar el correo
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "anartz2001@gmail.com",
        pass: "efnb uwvt cqab kduw"
      }
    });

    // Enviar el correo
    const info = await transporter.sendMail({
      from: '"AlquilApp" <anartz2001@gmail.com>',
      to: usuario.email,
      subject: '📢 Respuesta a tu reporte en AlquilApp',
      html: `
        <h2>Hola, ${usuario.nombre}</h2>
        <p>Gracias por enviarnos tu reporte.</p>
        <p>Respuesta del administrador:</p>
        <blockquote>${respuesta}</blockquote>
        <br>
        <small>Este es un mensaje automático. No respondas a este correo.</small>
      `
    });

    console.log(`📬 Respuesta enviada a ${usuario.email} (${info.messageId})`);
    res.json({ mensaje: 'Respuesta enviada correctamente' });
    
  } catch (error) {
    console.error('❌ Error al responder reporte:', error);
    res.status(500).json({ error: 'Error al responder reporte' });
  }
};
