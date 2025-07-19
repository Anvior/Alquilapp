import express from 'express';
import { obtenerMonedero, recargarSaldo, retirarSaldo } from '../controllers/monederoController.js';
import db from '../db.js';

const router = express.Router();

// Recargar saldo con PayPal
router.post('/recargar-paypal', async (req, res) => {
  const { usuarioId, cantidad } = req.body;

  try {
    await db.query('UPDATE usuarios SET saldo = saldo + ? WHERE id = ?', [cantidad, usuarioId]);
    await db.query('INSERT INTO movimientos (usuario_id, tipo, cantidad, concepto) VALUES (?, "recarga_paypal", ?, "Recarga vía PayPal")', [usuarioId, cantidad]);

    res.json({ mensaje: 'Saldo recargado vía PayPal correctamente' });
  } catch (error) {
    console.error('❌ Error recargando saldo:', error);
    res.status(500).json({ error: 'Error recargando saldo' });
  }
});

// Retirar saldo (Simulado)
router.post('/retirar-paypal', async (req, res) => {
  const { usuarioId, cantidad } = req.body;

  try {
    // Verificar saldo suficiente
    const [[usuario]] = await db.query('SELECT saldo FROM usuarios WHERE id = ?', [usuarioId]);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (usuario.saldo < cantidad) {
      return res.status(400).json({ error: 'Saldo insuficiente' });
    }

    // Simular retiro (no usamos API real)
    await db.query('UPDATE usuarios SET saldo = saldo - ? WHERE id = ?', [cantidad, usuarioId]);
    await db.query('INSERT INTO movimientos (usuario_id, tipo, cantidad, concepto) VALUES (?, "retiro_simulado", ?, "Retiro simulado a PayPal")', [usuarioId, cantidad]);

    res.json({ mensaje: '✅ Retiro simulado correctamente (transferencia manual necesaria)' });
  } catch (error) {
    console.error('❌ Error retirando saldo:', error);
    res.status(500).json({ error: 'Error procesando retiro' });
  }
});

// Rutas básicas
router.get('/:id', obtenerMonedero);
router.post('/retirar', retirarSaldo);
router.post('/recargar', recargarSaldo);

export default router;
