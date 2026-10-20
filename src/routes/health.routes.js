import { Router } from 'express';
import { healthController } from '../controllers/health.controller.js';

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Sistema
 *   description: Endpoints de estado del servidor y salud del servicio
 */

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Comprobar el estado y consumo de recursos de la API
 *     tags: [Sistema]
 *     responses:
 *       200:
 *         description: Servicio funcionando con métricas de salud
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 statusCode: { type: integer, example: 200 }
 *                 message: { type: string, example: "Servicio operativo correctamente" }
 *                 data:
 *                   type: object
 *                   properties:
 *                     status: { type: string, example: "healthy" }
 *                     service: { type: string, example: "API-ADMIN-RETIROS" }
 *                     environment: { type: string, example: "development" }
 *                     timestamp: { type: string, example: "2026-10-20T13:00:00.000Z" }
 *                     uptimeSeconds: { type: integer, example: 120 }
 *                     system:
 *                       type: object
 *                       properties:
 *                         nodeVersion: { type: string, example: "v20.19.2" }
 *                         memoryUsageMB:
 *                           type: object
 *                           properties:
 *                             rss: { type: integer, example: 65 }
 *                             heapTotal: { type: integer, example: 12 }
 *                             heapUsed: { type: integer, example: 9 }
 */
router.get('/', healthController.check);

export const healthRoutes = router;
