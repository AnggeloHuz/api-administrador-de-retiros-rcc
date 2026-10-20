import app from './app.js';
import { env, validateEnv } from './config/env.js';
import { pool, checkDatabaseConnection } from './db/pool.js';
import { initRootUser } from './db/initRootUser.js';

let server;

/**
 * Función de arranque y bootstrap del servidor.
 * Valida entorno, verifica base de datos, inicializa usuario root y levanta Express.
 */
const startServer = async () => {
  try {
    // 1. Validar variables de entorno requeridas
    validateEnv();

    // 2. Verificar conectividad a MySQL / MariaDB
    await checkDatabaseConnection();

    // 3. Garantizar existencia de superadministrador con máximos privilegios (root)
    await initRootUser();

    // 4. Iniciar escucha HTTP
    server = app.listen(env.PORT, () => {
      console.log('='.repeat(55));
      console.log(`🚀 Servidor ejecutándose en modo: [${env.NODE_ENV.toUpperCase()}]`);
      console.log(`🌐 Base URL:   http://localhost:${env.PORT}`);
      console.log(`📡 API Prefix: http://localhost:${env.PORT}${env.API_PREFIX}`);
      console.log(`🔐 Auth Login: http://localhost:${env.PORT}${env.API_PREFIX}/auth/login`);
      console.log(`📑 Swagger UI: http://localhost:${env.PORT}${env.API_PREFIX}/docs`);
      console.log(`❤️  Health:     http://localhost:${env.PORT}/health`);
      console.log('='.repeat(55));
    });
  } catch (error) {
    console.error('💥 Error crítico durante el arranque del servidor:', error);
    process.exit(1);
  }
};

startServer();

/* ==========================================================================
   CIERRE ELEGANTE (GRACEFUL SHUTDOWN) Y MANEJO DE SEÑALES DEL PROCESO
   ========================================================================== */

const shutdownGracefully = async (signal) => {
  console.log(`\n[${signal}] Recibido. Cerrando conexiones HTTP y base de datos...`);

  if (server) {
    server.close(async () => {
      console.log('🔒 Servidor HTTP cerrado.');
      try {
        await pool.end();
        console.log('🗄️  Pool de conexiones MySQL cerrado.');
      } catch (err) {
        console.error('Error al cerrar el pool de MySQL:', err.message);
      }
      console.log('👋 Proceso finalizado con éxito.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }

  // Cierre forzado en caso de estancamiento
  setTimeout(() => {
    console.error('⚠️  Cierre forzado: Las conexiones tardaron más de 10 segundos.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdownGracefully('SIGTERM'));
process.on('SIGINT', () => shutdownGracefully('SIGINT'));

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION] El proceso terminará inmediatamente:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION] Promesa rechazada no controlada:', reason);
  shutdownGracefully('UNHANDLED_REJECTION');
});
