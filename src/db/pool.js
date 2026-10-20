import mysql from 'mysql2/promise';
import { env } from '../config/env.js';

/**
 * Pool de conexiones a MySQL / MariaDB optimizado para alta concurrencia.
 */
export const pool = mysql.createPool({
  host: env.DB.HOST,
  port: env.DB.PORT,
  user: env.DB.USER,
  password: env.DB.PASSWORD,
  database: env.DB.NAME,
  waitForConnections: true,
  connectionLimit: env.DB.CONNECTION_LIMIT,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  dateStrings: true, // Mantiene fechas en formato ISO/string evitando desfaces horarios de JavaScript
});

/**
 * Helper para ejecutar consultas SQL con parámetros preparados (Prepared Statements)
 * garantizando protección contra inyecciones SQL.
 * 
 * @param {string} sql - Sentencia SQL
 * @param {Array} params - Parámetros a enlazar
 * @returns {Promise<[Array, Object]>}
 */
export const query = async (sql, params = []) => {
  return pool.execute(sql, params);
};

/**
 * Verifica el estado de la conexión a la base de datos al arrancar el servidor.
 */
export const checkDatabaseConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`🗄️  Conexión a MySQL exitosa -> BD: [${env.DB.NAME}] en ${env.DB.HOST}:${env.DB.PORT}`);
    connection.release();
    return true;
  } catch (error) {
    console.error(`❌ Error crítico al conectar a MySQL (${env.DB.HOST}:${env.DB.PORT}):`, error.message);
    throw error;
  }
};
