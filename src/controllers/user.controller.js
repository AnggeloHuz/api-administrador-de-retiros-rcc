import bcrypt from 'bcryptjs';
import { UserModel } from '../models/user.model.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const VALID_ROLES = [
  'root',
  'coordinador_general',
  'tesorero_finanzas',
  'logistica_inscripcion',
  'lector',
];

export const userController = {
  /**
   * Listar usuarios con paginación y filtros
   * GET /api/v1/users
   */
  getAll: asyncHandler(async (req, res) => {
    const { page, limit, search, rol } = req.query;

    const result = await UserModel.findAll({
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 20,
      search: search || '',
      rol: rol || null,
    });

    return ApiResponse.success(res, result.data, 'Listado de usuarios obtenido', 200, {
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    });
  }),

  /**
   * Obtener detalle de un usuario por ID
   * GET /api/v1/users/:id
   */
  getById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await UserModel.findById(id);

    if (!user) {
      throw new AppError('Usuario no encontrado.', 404);
    }

    return ApiResponse.success(res, user, 'Detalle de usuario obtenido');
  }),

  /**
   * Registrar nuevo usuario con rol asignado
   * POST /api/v1/users
   */
  create: asyncHandler(async (req, res) => {
    const { nombre_completo, usuario, email, password, rol = 'lector' } = req.body;

    if (!nombre_completo || !usuario || !email || !password) {
      throw new AppError('Todos los campos son obligatorios: nombre_completo, usuario, email, password.', 400);
    }

    if (!VALID_ROLES.includes(rol)) {
      throw new AppError(
        `Rol inválido. Los roles permitidos son: ${VALID_ROLES.join(', ')}`,
        400
      );
    }

    // Verificar si ya existe usuario o email
    const existingUser = await UserModel.findByUsernameOrEmail(usuario.trim());
    if (existingUser) {
      throw new AppError('El nombre de usuario ya se encuentra registrado.', 409);
    }

    const existingEmail = await UserModel.findByUsernameOrEmail(email.trim());
    if (existingEmail) {
      throw new AppError('El correo electrónico ya se encuentra registrado.', 409);
    }

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    const newUserId = await UserModel.create({
      nombre_completo: nombre_completo.trim(),
      usuario: usuario.trim(),
      password_hash: passwordHash,
      email: email.trim().toLowerCase(),
      rol,
      activo: 1,
    });

    const createdUser = await UserModel.findById(newUserId);
    return ApiResponse.created(res, createdUser, 'Usuario registrado exitosamente');
  }),

  /**
   * Activar o desactivar cuenta de usuario
   * PATCH /api/v1/users/:id/status
   */
  toggleStatus: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { activo } = req.body;

    if (activo === undefined) {
      throw new AppError('Debe enviar el campo booleano "activo" en el cuerpo de la petición.', 400);
    }

    const user = await UserModel.findById(id);
    if (!user) {
      throw new AppError('Usuario no encontrado.', 404);
    }

    if (user.rol === 'root' && !activo) {
      throw new AppError('No está permitido desactivar una cuenta con rol root.', 400);
    }

    await UserModel.updateStatus(id, activo);

    return ApiResponse.success(
      res,
      { id: Number(id), activo: !!activo },
      `Usuario ${activo ? 'activado' : 'desactivado'} con éxito.`
    );
  }),

  /**
   * Actualizar datos de un usuario por ID (Administración)
   * PUT /api/v1/users/:id
   */
  update: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const existing = await UserModel.findById(id);

    if (!existing) {
      throw new AppError('Usuario no encontrado.', 404);
    }

    const {
      nombre_completo = existing.nombre_completo,
      usuario = existing.usuario,
      email = existing.email,
      rol = existing.rol,
    } = req.body;

    if (!VALID_ROLES.includes(rol)) {
      throw new AppError(`Rol inválido. Roles permitidos: ${VALID_ROLES.join(', ')}`, 400);
    }

    // Evitar revocar rol al superadministrador root
    if (existing.rol === 'root' && rol !== 'root') {
      throw new AppError('No está permitido revocar el rol root a esta cuenta.', 400);
    }

    const trimmedUsuario = usuario.trim();
    const trimmedEmail = email.trim().toLowerCase();

    const conflict = await UserModel.checkConflictOnUpdate(id, trimmedUsuario, trimmedEmail);
    if (conflict) {
      throw new AppError('El nombre de usuario o correo electrónico ya se encuentra en uso por otra cuenta.', 409);
    }

    const updated = await UserModel.update(id, {
      nombre_completo: nombre_completo.trim(),
      usuario: trimmedUsuario,
      email: trimmedEmail,
      rol,
    });

    return ApiResponse.success(res, updated, 'Usuario actualizado exitosamente');
  }),
};
