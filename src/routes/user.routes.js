import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// Todas las rutas de usuarios requieren autenticación previa
router.use(authenticate);

/**
 * @openapi
 * tags:
 *   name: Usuarios
 *   description: Gestión de cuentas de usuario, roles de acceso y estados
 */

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Listar usuarios con paginación y filtros
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *         description: Cantidad de registros por página
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Término de búsqueda (por nombre, usuario o email)
 *       - in: query
 *         name: rol
 *         schema:
 *           type: string
 *           enum: [root, coordinador_general, tesorero_finanzas, logistica_inscripcion, lector]
 *         description: Filtrar por rol asignado
 *     responses:
 *       200:
 *         description: Lista paginada de usuarios
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Permisos insuficientes (Requiere root o coordinador_general)
 */
router.get('/', authorizeRoles('root', 'coordinador_general'), userController.getAll);

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Obtener detalle de un usuario por su ID
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID numérico del usuario
 *     responses:
 *       200:
 *         description: Detalle del usuario
 *       404:
 *         description: Usuario no encontrado
 *       403:
 *         description: Permisos insuficientes
 */
router.get('/:id', authorizeRoles('root', 'coordinador_general'), userController.getById);

/**
 * @openapi
 * /users:
 *   post:
 *     summary: Registrar un nuevo usuario con rol asignado
 *     description: Permite dar de alta usuarios en el sistema. Exclusivo para el rol `root`.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_completo
 *               - usuario
 *               - email
 *               - password
 *               - rol
 *             properties:
 *               nombre_completo:
 *                 type: string
 *                 example: María González
 *               usuario:
 *                 type: string
 *                 example: maria_tesorera
 *               email:
 *                 type: string
 *                 format: email
 *                 example: maria@retirosrcc.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Secreto2026*
 *               rol:
 *                 type: string
 *                 enum: [root, coordinador_general, tesorero_finanzas, logistica_inscripcion, lector]
 *                 example: tesorero_finanzas
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Datos inválidos o incompletos
 *       409:
 *         description: El nombre de usuario o correo ya se encuentra en uso
 *       403:
 *         description: Permiso denegado (Solo root)
 */
router.post('/', authorizeRoles('root'), userController.create);

/**
 * @openapi
 * /users/{id}/status:
 *   patch:
 *     summary: Activar o desactivar cuenta de usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - activo
 *             properties:
 *               activo:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Estado del usuario actualizado
 *       400:
 *         description: No se puede desactivar un usuario con rol root
 *       404:
 *         description: Usuario no encontrado
 *       403:
 *         description: Permiso denegado (Solo root)
 */
router.patch('/:id/status', authorizeRoles('root'), userController.toggleStatus);

/**
 * @openapi
 * /users/{id}:
 *   put:
 *     summary: Actualizar datos de un usuario por ID
 *     description: Permite al administrador modificar los datos y el rol de un usuario existente.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID numérico del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_completo:
 *                 type: string
 *                 example: Carlos Actualizado
 *               usuario:
 *                 type: string
 *                 example: carlos_actualizado
 *               email:
 *                 type: string
 *                 format: email
 *                 example: carlos_nuevo@retirosrcc.com
 *               rol:
 *                 type: string
 *                 enum: [root, coordinador_general, tesorero_finanzas, logistica_inscripcion, lector]
 *                 example: tesorero_finanzas
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *       400:
 *         description: Datos inválidos o intento de revocar rol al root
 *       404:
 *         description: Usuario no encontrado
 *       409:
 *         description: El nombre de usuario o correo ya está en uso
 *       403:
 *         description: Permiso denegado (Solo root)
 */
router.put('/:id', authorizeRoles('root'), userController.update);

export const userRoutes = router;
