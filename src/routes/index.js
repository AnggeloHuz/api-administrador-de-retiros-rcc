import { Router } from 'express';
import { authRoutes } from './auth.routes.js';
import { userRoutes } from './user.routes.js';
import { healthRoutes } from './health.routes.js';

const apiRouter = Router();

// Montaje de rutas por dominio bajo el prefijo configurado (/api/v1)
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/health', healthRoutes);

export { apiRouter };
