// backend/db.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

  dotenv.config(); // para .env normal




const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

console.log('✅ Conectado a MySQL');

export default db; // 👈 ESTA LÍNEA es la clave
