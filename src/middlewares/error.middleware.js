import { env } from '../config/env.js';

/**
 * Middleware centralizado de manejo global de errores.
 * Captura tanto excepciones síncronas como asíncronas no controladas.
 */
export const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';
  let errors = err.errors || null;

  // Manejo de JSON malformado en el body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'El cuerpo de la solicitud (JSON) está mal estructurado sintácticamente.';
  }

  // Respuesta detallada para entorno de Desarrollo
  if (env.isDevelopment) {
    return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      errors,
      stack: err.stack,
      errorDetails: err,
    });
  }

  // Respuesta sanitizada para Producción (evita fuga de información sensible)
  if (!err.isOperational) {
    // Error de programación o de biblioteca no previsto
    console.error('[CRITICAL UNHANDLED ERROR]:', err);
    message = 'Ha ocurrido un error inesperado. Por favor contacte al soporte.';
    errors = null;
  }

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(errors && { errors }),
  });
};
