import app from './app.js';
import { env, validateEnv } from './config/env.js';

// Validar variables críticas antes del arranque
validateEnv();

const server = app.listen(env.PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Servidor ejecutándose en modo: [${env.NODE_ENV.toUpperCase()}]`);
  console.log(`🌐 Base URL: http://localhost:${env.PORT}`);
  console.log(`📡 API Prefix: http://localhost:${env.PORT}${env.API_PREFIX}`);
  console.log(`❤️  Health Check: http://localhost:${env.PORT}/health`);
  console.log('='.repeat(50));
});

/* ==========================================================================
   CIERRE ELEGANTE (GRACEFUL SHUTDOWN) Y MANEJO DE SEÑALES DEL PROCESO
   ========================================================================== */

const shutdownGracefully = (signal) => {
  console.log(`\n[${signal}] Recibido. Cerrando conexiones HTTP de forma segura...`);

  server.close(() => {
    console.log('🔒 Servidor HTTP cerrado. Proceso finalizado con éxito.');
    process.exit(0);
  });

  // Forzar cierre si tarda más de 10 segundos
  setTimeout(() => {
    console.error('⚠️  Cierre forzado: Las conexiones no terminaron a tiempo.');
    process.exit(1);
  }, 10000);
};

// Captura de señales del sistema operativo (Docker, Kubernetes, Ctrl+C)
process.on('SIGTERM', () => shutdownGracefully('SIGTERM'));
process.on('SIGINT', () => shutdownGracefully('SIGINT'));

// Captura de excepciones no capturadas (Bugs críticos síncronos)
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION] El proceso terminará inmediatamente:', err);
  process.exit(1);
});

// Captura de promesas rechazadas no manejadas (Bugs asíncronos)
process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION] Promesa rechazada no controlada:', reason);
  shutdownGracefully('UNHANDLED_REJECTION');
});
