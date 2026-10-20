/**
 * Clase personalizada para errores operacionales de la API.
 * Permite tipificar y controlar el código HTTP y el mensaje que se devuelve al cliente.
 */
export class AppError extends Error {
  /**
   * @param {string} message - Mensaje descriptivo del error
   * @param {number} statusCode - Código de estado HTTP (ej: 400, 404, 500)
   * @param {Array|object|null} errors - Detalles o lista de errores de validación (opcional)
   */
  constructor(message, statusCode = 500, errors = null) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Errores predecibles vs bugs de programación
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}
