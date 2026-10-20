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
  DB: {
    HOST: process.env.DB_HOST || 'localhost',
    PORT: parseInt(process.env.DB_PORT, 10) || 3306,
    USER: process.env.DB_USER || 'root',
    PASSWORD: process.env.DB_PASSWORD || '',
    NAME: process.env.DB_NAME || 'administrador_retiros_rcc',
    CONNECTION_LIMIT: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
  },
  JWT: {
    SECRET: process.env.JWT_SECRET || 'dev_secret_jwt_key_should_be_changed',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  },
  ROOT_ADMIN: {
    NAME: process.env.ROOT_ADMIN_NAME || 'Super Administrador RCC',
    USER: process.env.ROOT_ADMIN_USER || 'rootadmin',
    EMAIL: process.env.ROOT_ADMIN_EMAIL || 'admin@retirosrcc.com',
    PASSWORD: process.env.ROOT_ADMIN_PASSWORD || 'Admin123*',
  },
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',
};

/**
 * Validación inicial de variables críticas requeridas (Fail-Fast).
 */
export const validateEnv = () => {
  const required = ['PORT', 'NODE_ENV', 'DB_NAME'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.warn(`[WARN] Variables de entorno no explicitadas (${missing.join(', ')}). Usando valores por defecto.`);
  }

  if (env.isProduction && env.JWT.SECRET === 'dev_secret_jwt_key_should_be_changed') {
    throw new Error('CRITICAL: JWT_SECRET debe ser configurada con una clave segura en entorno de producción.');
  }
};
