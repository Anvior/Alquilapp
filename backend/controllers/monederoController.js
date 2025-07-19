import db from '../db.js';
import dotenv from 'dotenv';
import * as paypal from '@paypal/checkout-server-sdk';

dotenv.config();

const env = process.env.PAYPAL_MODE === 'live'
  ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
  : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
const client = new paypal.core.PayPalHttpClient(env);

// GET /monedero/:id
export const obtenerMonedero = async (req, res) => {
  const { id } = req.params;
  try {
    const [[{ saldo }]] = await db.query('SELECT saldo FROM usuarios WHERE id = ?', [id]);
    const [movimientos] = await db.query('SELECT * FROM movimientos WHERE usuario_id = ? ORDER BY fecha DESC, id DESC LIMIT 10; ', [id]);
    const [tarjetas] = await db.query('SELECT * FROM tarjetas WHERE usuario_id = ?', [id]);
    res.json({ saldo, movimientos, tarjetas });
  } catch (err) {
    console.error('❌ Error al obtener monedero:', err);
    res.status(500).json({ error: 'Error en base de datos' });
  }
};

// POST /monedero/recargar
export const recargarSaldo = async (req, res) => {
  const { usuarioId, cantidad } = req.body;
  try {
    await db.query('UPDATE usuarios SET saldo = saldo + ? WHERE id = ?', [cantidad, usuarioId]);
    await db.query('INSERT INTO movimientos (usuario_id, tipo, cantidad, concepto) VALUES (?, "recarga_manual", ?, "Recarga manual")', [usuarioId, cantidad]);
    res.json({ mensaje: 'Saldo recargado manualmente' });
  } catch (err) {
    console.error('❌ Error al recargar saldo manual:', err);
    res.status(500).json({ error: 'Error al recargar' });
  }
};

// POST /monedero/recargar-paypal
export const recargarPaypal = async (req, res) => {
  const { usuarioId, cantidad } = req.body;
  try {
    await db.query('UPDATE usuarios SET saldo = saldo + ? WHERE id = ?', [cantidad, usuarioId]);
    await db.query('INSERT INTO movimientos (usuario_id, tipo, cantidad, concepto) VALUES (?, "recarga_paypal", ?, "Recarga vía PayPal")', [usuarioId, cantidad]);
    res.json({ mensaje: 'Saldo recargado vía PayPal correctamente' });
  } catch (err) {
    console.error('❌ Error al recargar saldo vía PayPal:', err);
    res.status(500).json({ error: 'Error recargando saldo vía PayPal' });
  }
};
// POST /monedero/retirar
export const retirarSaldo = async (req, res) => {
  const { usuarioId, cantidad } = req.body;

  if (!usuarioId || !cantidad || cantidad <= 0) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }

  try {
    // Verificar saldo disponible
    const [[{ saldo }]] = await db.query('SELECT saldo FROM usuarios WHERE id = ?', [usuarioId]);
    if (saldo < cantidad) {
      return res.status(400).json({ error: 'Saldo insuficiente' });
    }

    // Actualizar saldo
    await db.query('UPDATE usuarios SET saldo = saldo - ? WHERE id = ?', [cantidad, usuarioId]);

    // Registrar movimiento
    await db.query(
      'INSERT INTO movimientos (usuario_id, tipo, cantidad, concepto) VALUES (?, "retiro", ?, "Retiro manual")',
      [usuarioId, cantidad]
    );

    res.json({ mensaje: 'Saldo retirado correctamente' });
  } catch (err) {
    console.error('❌ Error al retirar saldo:', err);
    res.status(500).json({ error: 'Error al retirar saldo' });
  }
};
