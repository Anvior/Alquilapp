import bcrypt from 'bcryptjs';

const textoPlano = '123';

async function generarHash() {
  try {
    const hash = await bcrypt.hash(textoPlano, 10); // 10 es el número de salt rounds
    console.log('🔐 Hash generado:', hash);
  } catch (error) {
    console.error('❌ Error al generar hash:', error);
  }
}

generarHash();
