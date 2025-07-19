const bcrypt = require('bcrypt');

async function generarHash() {
  const nuevaContraseña = '123'; // <-- cámbiala
  const hash = await bcrypt.hash(nuevaContraseña, 10); // 10 es el saltRounds
  console.log('Hash generado:', hash);
}

generarHash();
