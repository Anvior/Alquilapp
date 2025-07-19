import db from '../db.js';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { SMTP_CONFIG, APP_URL } from '../config.js';
import dotenv from 'dotenv';
dotenv.config();


// Registrar usuario
export const registrarUsuario = async (req, res) => {
  const { nombre, email, contrasena, foto } = req.body;

  try {
    const [usuarios] = await db.query(
      'SELECT * FROM usuarios WHERE nombre = ? OR email = ?',
      [nombre, email]
    );

    if (usuarios.length > 0) {
      const conflicto = usuarios.find(u => u.nombre === nombre) ? 'nombre' : 'email';
      return res.status(400).json({ error: `Ya existe un usuario con ese ${conflicto}` });
    }

    const hash = await bcrypt.hash(contrasena, 10);
    await db.query(
      'INSERT INTO usuarios (nombre, email, contrasena, foto) VALUES (?, ?, ?, ?)',
      [nombre, email, hash, foto || 'https://i.imgur.com/4ZQZ4Z3.png']
    );

    res.json({ mensaje: 'Usuario registrado correctamente' });
  } catch (err) {
    console.error('❌ Error al registrar usuario:', err);
    res.status(500).json({ error: 'Error en base de datos' });
  }
};

// Iniciar sesión
export const iniciarSesion = async (req, res) => {
  const { email, contrasena } = req.body;
  console.log('🔍 Intento de login recibido - Email:', email, 'Contraseña:', contrasena);
  try {
    const [result] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    console.log('📄 Resultado de búsqueda en DB:', result);
    if (result.length === 0) return res.status(401).send({ error: 'Usuario no encontrado' });
    const usuario = result[0];
    console.log('c: ', contrasena, 'uc: ', usuario.contrasena);
    const isMatch = await bcrypt.compare(contrasena, usuario.contrasena);
    console.log('res: ', isMatch);
    if (!isMatch) return res.status(401).send({ error: 'Contraseña incorrecta' });

    res.send({ mensaje: 'Inicio de sesión exitoso', usuario });
  } catch (err) {
    console.error('❌ Error al iniciar sesión:', err);
    res.status(500).send({ error: 'Error de servidor' });
  }
};

// Recuperar contraseña
export const recuperarContrasena = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requerido' });

  try {
    const [usuarios] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (usuarios.length === 0) {
      return res.status(404).json({ error: 'No existe una cuenta con ese email' });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    
    const enlace = `${process.env.APP_URL}/restablecer?email=${encodeURIComponent(email)}`;
    

    await transporter.sendMail({
      from: `"AlquilApp" <${SMTP_CONFIG.from}>`,
      to: email,
      subject: "🔐 Recuperación de contraseña",
      html: `
        <h2>Recuperación de contraseña</h2>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${enlace}">${enlace}</a>
        <br><br>
        <small>Si no pediste esto, ignora el mensaje.</small>
      `,
    });

    res.json({ mensaje: '✅ Enlace de recuperación enviado a tu correo' });
  } catch (err) {
    console.error('❌ Error al enviar correo:', err);
    res.status(500).json({ error: 'Error al enviar email' });
  }
};

// Obtener perfil por ID
export const obtenerUsuarioPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(
      'SELECT nombre, email, contrasena, foto FROM usuarios WHERE id = ?',
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(result[0]);
  } catch (err) {
    console.error('❌ Error al obtener usuario por ID:', err);
    res.status(500).json({ error: 'Error en base de datos' });
  }
};

// Obtener otros usuarios
export const obtenerUsuarios = async (req, res) => {
  const usuarioLogueadoId = req.params.id;

  try {
    const [result] = await db.query(
      'SELECT id, nombre, email, foto FROM usuarios WHERE id != ?',
      [usuarioLogueadoId]
    );
    res.json(result);
  } catch (err) {
    console.error('❌ Error al obtener usuarios:', err);
    res.status(500).send({ error: 'Error al obtener usuarios' });
  }
};

// Editar perfil
// Editar perfil
export const editarPerfil = async (req, res) => {
  const { id } = req.params;
  const { nombre, email, contrasena } = req.body;
  const foto = req.file?.buffer?.toString('base64') || null;

  try {
    // Comprobar nombre duplicado
    const [nombreExiste] = await db.query(
      'SELECT id FROM usuarios WHERE nombre = ? AND id != ?',
      [nombre, id]
    );
    if (nombreExiste.length > 0) {
      return res.status(400).json({ error: 'Nombre en uso' });
    }

    // Comprobar email duplicado
    const [emailExiste] = await db.query(
      'SELECT id FROM usuarios WHERE email = ? AND id != ?',
      [email, id]
    );
    if (emailExiste.length > 0) {
      return res.status(400).json({ error: 'Email ya registrado' });
    }

    // Obtener la contraseña actual si no se proporciona una nueva
    let hash;
    if (typeof contrasena === 'string' && contrasena.trim() !== '') {
      hash = await bcrypt.hash(contrasena, 10);
    } else {
      const [usuario] = await db.query('SELECT contrasena FROM usuarios WHERE id = ?', [id]);
      if (usuario.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      hash = usuario[0].contrasena;
    }

    // Actualizar en la base de datos
    await db.query(
      'UPDATE usuarios SET nombre = ?, email = ?, contrasena = ?, foto = ? WHERE id = ?',
      [nombre, email, hash, foto, id]
    );

    res.json({ mensaje: 'Perfil actualizado' });
  } catch (err) {
    console.error('❌ Error al actualizar perfil:', err);
    res.status(500).json({ error: 'Error en base de datos' });
  }
};


export const restablecerContrasena = async (req, res) => {
  const { email, nueva } = req.body;

  if (!email || !nueva) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  try {
    // 🔐 Encriptar la nueva contraseña con bcrypt
    const hash = await bcrypt.hash(nueva, 10); // 10 salt rounds

    // 📦 Actualizar en base de datos
    await db.query('UPDATE usuarios SET contrasena = ? WHERE email = ?', [hash, email]);

    res.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (err) {
    console.error('❌ Error al restablecer contraseña:', err);
    res.status(500).json({ error: 'Error al actualizar contraseña' });
  }
};

