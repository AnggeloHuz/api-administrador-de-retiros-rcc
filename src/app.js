import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { requestLogger } from './middlewares/requestLogger.middleware.js';
import { rateLimiter } from './middlewares/rateLimiter.middleware.js';
import { notFoundHandler } from './middlewares/notFound.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { apiRouter } from './routes/index.js';
import { healthRoutes } from './modules/health/health.routes.js';

const app = express();

/* ==========================================================================
   1. MIDDLEWARES DE SEGURIDAD Y CONFIGURACIÓN BÁSICA
   ========================================================================== */

// Configuración de cabeceras de seguridad HTTP
app.use(helmet());

// Configuración de CORS (Cross-Origin Resource Sharing)
const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir peticiones sin origen (como Postman o curl) o si coincide con los permitidos
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`El origen ${origin} no está autorizado por CORS`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

// Logging de peticiones HTTP
app.use(requestLogger);

// Parsing de cuerpos de solicitud JSON y urlencoded con límites seguros
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

/* ==========================================================================
   2. RUTAS PÚBLICAS Y DE SALUD
   ========================================================================== */

// Endpoint rápido de salud en la raíz (ideal para Load Balancers / Kubernetes / AWS ALB)
app.use('/health', healthRoutes);

// Endpoint de información básica en la raíz
app.get('/', (req, res) => {
  res.json({
    name: 'API-ADMIN-RETIROS',
    version: '1.0.0',
    status: 'online',
    documentation: `${env.API_PREFIX}/health`,
  });
});

/* ==========================================================================
   3. RUTAS PRINCIPALES DE LA API
   ========================================================================== */

// Aplicar limitador de tasa y montar enrutador principal bajo el prefijo (ej: /api/v1)
app.use(env.API_PREFIX, rateLimiter, apiRouter);

/* ==========================================================================
   4. MANEJO DE RUTAS NO ENCONTRADAS Y ERRORES GLOBALES
   ========================================================================== */

// Manejador 404 para cualquier ruta no mapeada
app.use(notFoundHandler);

// Manejador global centralizado de errores
app.use(errorHandler);

export default app;
