import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { env } from './env.js';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '🏛️ API Administración de Retiros y Finanzas (RCCRNV)',
      version: '1.0.0',
      description: `
API RESTful para la administración integral de retiros espirituales, logística de hospedaje,
gestión de participantes y servidores, y control financiero multimoneda (USD, VES, EUR).

### Autenticación
Esta API utiliza **Bearer Tokens (JWT)**. Para probar endpoints protegidos:
1. Haz una petición a \`POST /auth/login\` con tus credenciales.
2. Copia el token retornado.
3. Haz clic en el botón superior **Authorize 🔓** y pega el token.
      `,
      contact: {
        name: 'Soporte Técnico RCCRNV',
        email: 'soporte@retirosrcc.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}${env.API_PREFIX}`,
        description: 'Servidor Local de Desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Introduce el token JWT en el formato: Bearer <token>',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            statusCode: { type: 'integer', example: 200 },
            message: { type: 'string', example: 'Operación realizada con éxito' },
            data: { type: 'object' },
            meta: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            statusCode: { type: 'integer', example: 400 },
            message: { type: 'string', example: 'Descripción detallada del error' },
            errors: { type: 'array', items: { type: 'string' }, nullable: true },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nombre_completo: { type: 'string', example: 'Super Administrador RCC' },
            usuario: { type: 'string', example: 'rootadmin' },
            email: { type: 'string', format: 'email', example: 'admin@retirosrcc.com' },
            rol: {
              type: 'string',
              enum: ['root', 'coordinador_general', 'tesorero_finanzas', 'logistica_inscripcion', 'lector'],
              example: 'root',
            },
            activo: { type: 'integer', example: 1 },
            ultimo_acceso: { type: 'string', format: 'date-time', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);

/**
 * Configura los endpoints de Swagger UI y la especificación JSON en la aplicación Express.
 * @param {import('express').Application} app
 */
export const setupSwagger = (app) => {
  const swaggerCustomOptions = {
    customSiteTitle: 'Documentación API Retiros RCC',
    customCss: '.swagger-ui .topbar { display: block } .topbar-wrapper img { content: url("https://swagger.io/swagger/media/assets/images/swagger_logo.svg"); width: 120px; }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
    },
  };

  // Endpoint para obtener la especificación OpenAPI en formato JSON puro
  app.get(`${env.API_PREFIX}/docs.json`, (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Interfaz gráfica interactiva de Swagger UI
  app.use(
    `${env.API_PREFIX}/docs`,
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, swaggerCustomOptions)
  );

  // Redirección amigable desde /docs hacia la ruta versionada
  app.get('/docs', (req, res) => {
    res.redirect(`${env.API_PREFIX}/docs`);
  });

  console.log(`📑 Documentación Swagger disponible en: http://localhost:${env.PORT}${env.API_PREFIX}/docs`);
};
