import { withdrawalsService } from './withdrawals.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

/**
 * Capa de Controladores: Maneja la petición HTTP, delega al servicio y responde.
 */
export const withdrawalsController = {
  // Obtener lista de retiros
  getAll: asyncHandler(async (req, res) => {
    const data = await withdrawalsService.getAll();
    return ApiResponse.success(res, data, 'Listado de retiros obtenido con éxito');
  }),

  // Obtener un retiro por ID
  getById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = await withdrawalsService.getById(id);
    return ApiResponse.success(res, data, 'Detalle de retiro obtenido con éxito');
  }),

  // Crear una nueva solicitud de retiro
  create: asyncHandler(async (req, res) => {
    const { userId, amount, currency } = req.body;
    const newRecord = await withdrawalsService.create({ userId, amount, currency });
    return ApiResponse.created(res, newRecord, 'Solicitud de retiro registrada correctamente');
  }),
};
