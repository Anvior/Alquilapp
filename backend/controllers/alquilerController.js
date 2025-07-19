import db from '../db.js';
import nodemailer from 'nodemailer';

export const alquilarProducto = async (req, res) => {
  const { usuario_id, producto_id, fecha_inicio, fecha_fin } = req.body;

  console.log('📩 Body recibido:', { usuario_id, producto_id });

  try {
    const [[producto]] = await db.query(
      'SELECT * FROM productos WHERE id = ?', [producto_id]
    );

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    if (producto.disponible !== 1) {
      return res.status(400).json({ error: 'Producto no disponible' });
    }

    const precio = Number(producto.precio);
    const dias = (new Date(fecha_fin) - new Date(fecha_inicio)) / (1000 * 60 * 60 * 24);
    const total = precio * dias;

    const [[{ saldo }]] = await db.query(
      'SELECT saldo FROM usuarios WHERE id = ?', [usuario_id]
    );

    if (Number(saldo) < total) {
      return res.status(400).json({ error: 'Saldo insuficiente' });
    }

    // ❌ RESTAR del alquilador
    await db.query('UPDATE usuarios SET saldo = saldo - ? WHERE id = ?', [total, usuario_id]);
    await db.query(`
      INSERT INTO movimientos (usuario_id, tipo, cantidad, concepto)
      VALUES (?, 'alquiler_pago', ?, ?)
    `, [usuario_id, total, `Pago por alquiler del producto "${producto.nombre}" (${dias} días)`]);

    // ✅ SUMAR al dueño
    if (producto.usuario_id && producto.usuario_id !== usuario_id) {
      await db.query('UPDATE usuarios SET saldo = saldo + ? WHERE id = ?', [total, producto.usuario_id]);
      await db.query(`
        INSERT INTO movimientos (usuario_id, tipo, cantidad, concepto)
        VALUES (?, 'alquiler_ingreso', ?, ?)
      `, [producto.usuario_id, total, `Ingreso por alquiler de su producto "${producto.nombre}" (${dias} días)`]);

      const [[duenio]] = await db.query('SELECT email, nombre FROM usuarios WHERE id = ?', [producto.usuario_id]);

      // 📨 Notificación por correo
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: "anartz2001@gmail.com",
          pass: "efnb uwvt cqab kduw"
        }
      });

      await transporter.sendMail({
        from: '"AlquilApp" <anartz2001@gmail.com>',
        to: duenio.email,
        subject: `📢 Han alquilado tu producto "${producto.nombre}"`,
        html: `
          <h2>¡Buenas noticias, ${duenio.nombre}!</h2>
          <p>Tu producto <strong>${producto.nombre}</strong> ha sido alquilado en AlquilApp.</p>
          <p>Se ha ingresado <strong>${total.toFixed(2)}€</strong> en tu monedero por ${dias} día(s) de alquiler.</p>
          <br>
          <small>Este es un mensaje automático. No respondas a este correo.</small>
        `
      });
    }

    // 🛑 Marcar como alquilado
    await db.query('UPDATE productos SET disponible = 0 WHERE id = ?', [producto_id]);

    // 📦 Guardar el alquiler
    await db.query(`
      INSERT INTO alquileres (producto_id, usuario_alquilador_id, usuario_dueno_id, fecha, fecha_inicio, fecha_fin)
      VALUES (?, ?, ?, NOW(), ?, ?)
    `, [producto_id, usuario_id, producto.usuario_id, fecha_inicio, fecha_fin]);

    res.json({ mensaje: '✅ Producto alquilado con éxito' });

  } catch (err) {
    console.error('❌ Error al alquilar producto:', err);
    res.status(500).json({ error: 'Error al procesar alquiler' });
  }
};
