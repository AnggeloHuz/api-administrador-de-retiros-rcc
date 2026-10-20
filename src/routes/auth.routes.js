import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Autenticación
 *   description: Endpoints para inicio de sesión, perfil y seguridad de credenciales
 */

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión y obtener token JWT
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Nombre de usuario o correo electrónico
 *                 example: rootadmin
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Contraseña de la cuenta
 *                 example: Admin123*
 *     responses:
 *       200:
 *         description: Autenticación exitosa y generación de token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 statusCode: { type: integer, example: 200 }
 *                 message: { type: string, example: "Autenticación exitosa" }
 *                 data:
 *                   type: object
 *                   properties:
 *                     token: { type: string, example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
 *                     expiresIn: { type: string, example: "24h" }
 *                     user: { $ref: '#/components/schemas/User' }
 *       400:
 *         description: Datos requeridos faltantes
 *       401:
 *         description: Credenciales de acceso incorrectas
 *       403:
 *         description: Cuenta suspendida o inactiva
 */
router.post('/login', authController.login);

/**
 * @openapi
 * /auth/profile:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 statusCode: { type: integer, example: 200 }
 *                 message: { type: string, example: "Perfil de usuario obtenido" }
 *                 data: { $ref: '#/components/schemas/User' }
 *       401:
 *         description: No autenticado o token expirado/inválido
 */
router.get('/profile', authenticate, authController.getProfile);

/**
 * @openapi
 * /auth/profile:
 *   put:
 *     summary: Actualizar datos del perfil del usuario autenticado
 *     description: Permite al usuario en sesión modificar su nombre completo, nombre de usuario y correo electrónico.
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_completo:
 *                 type: string
 *                 example: Administrador Principal RCC
 *               usuario:
 *                 type: string
 *                 example: rootadmin
 *               email:
 *                 type: string
 *                 format: email
 *                 example: nuevo_email@retirosrcc.com
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 statusCode: { type: integer, example: 200 }
 *                 message: { type: string, example: "Perfil actualizado correctamente" }
 *                 data: { $ref: '#/components/schemas/User' }
 *       400:
 *         description: Campos inválidos o vacíos
 *       409:
 *         description: El nombre de usuario o correo ya se encuentra en uso por otra cuenta
 *       401:
 *         description: No autenticado
 */
router.put('/profile', authenticate, authController.updateProfile);

/**
 * @openapi
 * /auth/change-password:
 *   post:
 *     summary: Cambiar contraseña de la cuenta actual
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: Admin123*
 *               newPassword:
 *                 type: string
 *                 example: NuevaClaveSegura2026*
 *     responses:
 *       200:
 *         description: Contraseña modificada exitosamente
 *       400:
 *         description: Contraseña actual errónea o nueva contraseña muy corta
 *       401:
 *         description: No autenticado
 */
router.post('/change-password', authenticate, authController.changePassword);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesión del usuario actual
 *     description: Endpoint para finalizar la sesión del usuario. El cliente debe eliminar el token JWT de su almacenamiento local tras recibir la confirmación.
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 statusCode: { type: integer, example: 200 }
 *                 message: { type: string, example: "Sesión cerrada exitosamente. Por favor elimine el token del cliente." }
 *                 data: { type: "null", example: null }
 *       401:
 *         description: No autenticado o token inválido
 */
router.post('/logout', authenticate, authController.logout);

export const authRoutes = router;
