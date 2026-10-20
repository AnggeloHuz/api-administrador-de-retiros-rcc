import { Router } from 'express';
import { healthController } from './health.controller.js';

const router = Router();

/**
 * @route   GET /health
 * @desc    Comprueba el estado del servicio y uptime
 * @access  Público
 */
router.get('/', healthController.check);

export const healthRoutes = router;
