import { AppError } from '../utils/AppError.js';

/**
 * Middleware para capturar solicitudes a endpoints no definidos (404 Not Found).
 */
export const notFoundHandler = (req, res, next) => {
  next(new AppError(`No se encontró la ruta ${req.method} ${req.originalUrl} en este servidor.`, 404));
};
