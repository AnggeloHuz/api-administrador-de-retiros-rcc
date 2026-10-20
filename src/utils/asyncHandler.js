/**
 * Wrapper de orden superior para controladores asíncronos.
 * Evita tener bloques try/catch repetitivos en cada función del controlador,
 * reenviando cualquier error rechazado directamente al middleware global de errores (next).
 * 
 * @param {Function} fn - Función del controlador (req, res, next)
 * @returns {Function} Función middleware de Express
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
