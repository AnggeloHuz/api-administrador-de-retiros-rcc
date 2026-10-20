/**
 * Utilidades para estandarizar las respuestas JSON de la API.
 */
export const ApiResponse = {
  /**
   * Respuesta exitosa estandarizada.
   * @param {import('express').Response} res
   * @param {*} data - Datos a devolver
   * @param {string} message - Mensaje informativo
   * @param {number} statusCode - Código de estado HTTP (default 200)
   * @param {object|null} meta - Metadatos adicionales (paginación, filtros, etc.)
   */
  success(res, data = null, message = 'Operación exitosa', statusCode = 200, meta = null) {
    const responsePayload = {
      success: true,
      statusCode,
      message,
      data,
    };

    if (meta) {
      responsePayload.meta = meta;
    }

    return res.status(statusCode).json(responsePayload);
  },

  /**
   * Respuesta de creación exitosa estandarizada (HTTP 201).
   */
  created(res, data = null, message = 'Recurso creado exitosamente') {
    return this.success(res, data, message, 201);
  },

  /**
   * Respuesta de error estandarizada.
   * @param {import('express').Response} res
   * @param {string} message - Mensaje del error
   * @param {number} statusCode - Código HTTP de error
   * @param {Array|object|null} errors - Detalles o array de validaciones
   */
  error(res, message = 'Ha ocurrido un error en el servidor', statusCode = 500, errors = null) {
    const responsePayload = {
      success: false,
      statusCode,
      message,
    };

    if (errors) {
      responsePayload.errors = errors;
    }

    return res.status(statusCode).json(responsePayload);
  },
};
