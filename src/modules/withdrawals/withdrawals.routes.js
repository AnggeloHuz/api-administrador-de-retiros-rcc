import { Router } from 'express';
import { withdrawalsController } from './withdrawals.controller.js';

const router = Router();

/**
 * @route   GET /api/v1/withdrawals
 * @desc    Obtener todos los retiros
 */
router.get('/', withdrawalsController.getAll);

/**
 * @route   GET /api/v1/withdrawals/:id
 * @desc    Obtener retiro por identificador
 */
router.get('/:id', withdrawalsController.getById);

/**
 * @route   POST /api/v1/withdrawals
 * @desc    Registrar nueva solicitud de retiro
 */
router.post('/', withdrawalsController.create);

export const withdrawalsRoutes = router;
