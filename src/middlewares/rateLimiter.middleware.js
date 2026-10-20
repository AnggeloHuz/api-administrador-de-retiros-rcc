import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

/**
 * Middleware para mitigar ataques de denegación de servicio (DoS) y fuerza bruta.
 */
export const rateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT.WINDOW_MS,
  max: env.RATE_LIMIT.MAX,
  standardHeaders: true, // Devuelve información de límite en encabezados `RateLimit-*`
  legacyHeaders: false, // Deshabilita encabezados `X-RateLimit-*`
  message: {
    success: false,
    statusCode: 429,
    message: 'Demasiadas solicitudes desde esta IP, por favor inténtalo de nuevo más tarde.',
  },
});
