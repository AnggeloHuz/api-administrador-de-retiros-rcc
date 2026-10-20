import morgan from 'morgan';
import { env } from '../config/env.js';

/**
 * Middleware para el registro (logging) de solicitudes HTTP.
 * Utiliza formato 'dev' para desarrollo y formato combinado estructurado en producción.
 */
export const requestLogger = morgan(env.isDevelopment ? 'dev' : 'combined');
