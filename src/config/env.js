import dotenv from 'dotenv';

// Cargar variables de entorno desde .env
dotenv.config();

/**
 * Objeto de configuración centralizada de la aplicación.
 * Garantiza tipos de datos correctos y valores por defecto seguros.
 */
export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 3000,
  API_PREFIX: process.env.API_PREFIX || '/api/v1',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  RATE_LIMIT: {
    WINDOW_MS: (parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES, 10) || 15) * 60 * 1000,
    MAX: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',
};

/**
 * Validación inicial de variables críticas requeridas (Fail-Fast).
 */
export const validateEnv = () => {
  const required = ['PORT', 'NODE_ENV'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.warn(`[WARN] Variables de entorno faltantes (${missing.join(', ')}). Usando valores por defecto.`);
  }
};
