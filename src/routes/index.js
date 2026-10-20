import { Router } from 'express';
import { healthRoutes } from '../modules/health/health.routes.js';
import { withdrawalsRoutes } from '../modules/withdrawals/withdrawals.routes.js';

const apiRouter = Router();

// Módulos de la API montados bajo el prefijo configurado
apiRouter.use('/health', healthRoutes);
apiRouter.use('/withdrawals', withdrawalsRoutes);

export { apiRouter };
