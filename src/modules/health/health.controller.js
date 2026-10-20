import { ApiResponse } from '../../utils/apiResponse.js';
import { env } from '../../config/env.js';

/**
 * Controlador para la verificación del estado y salud de la API.
 */
export const healthController = {
  check(req, res) {
    const memory = process.memoryUsage();

    const healthData = {
      status: 'healthy',
      service: 'API-ADMIN-RETIROS',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      system: {
        nodeVersion: process.version,
        memoryUsageMB: {
          rss: Math.round(memory.rss / 1024 / 1024),
          heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
          heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
        },
      },
    };

    return ApiResponse.success(res, healthData, 'Servicio operativo correctamente');
  },
};
