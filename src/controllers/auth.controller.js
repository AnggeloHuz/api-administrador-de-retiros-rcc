import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { env } from '../config/env.js';

export const authController = {
  /**
   * Inicio de sesión para obtener token JWT
   * POST /api/v1/auth/login
   */
  login: asyncHandler(async (req, res) => {
    const { identifier, usuario, email, password } = req.body;
    const loginIdentifier = (identifier || usuario || email || '').trim();

    if (!loginIdentifier || !password) {
      throw new AppError('Debe proporcionar un identificador (usuario o email) y contraseña.', 400);
    }

    // 1. Buscar usuario en base de datos
    const user = await UserModel.findByUsernameOrEmail(loginIdentifier);
    if (!user) {
      throw new AppError('Credenciales de acceso inválidas.', 401);
    }

    // 2. Comprobar si la cuenta está activa
    if (!user.activo) {
      throw new AppError('Esta cuenta de usuario ha sido desactivada. Contacte a la coordinación.', 403);
    }

    // 3. Validar contraseña cifrada
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Credenciales de acceso inválidas.', 401);
    }

    // 4. Actualizar fecha de último acceso
    await UserModel.updateLastAccess(user.id);

    // 5. Generar token JWT
    const token = jwt.sign(
      {
        id: user.id,
        usuario: user.usuario,
        email: user.email,
        rol: user.rol,
        nombre_completo: user.nombre_completo,
      },
      env.JWT.SECRET,
      { expiresIn: env.JWT.EXPIRES_IN }
    );

    return ApiResponse.success(
      res,
      {
        token,
        expiresIn: env.JWT.EXPIRES_IN,
        user: {
          id: user.id,
          nombre_completo: user.nombre_completo,
          usuario: user.usuario,
          email: user.email,
          rol: user.rol,
          ultimo_acceso: user.ultimo_acceso,
        },
      },
      'Autenticación exitosa'
    );
  }),

  /**
   * Obtiene la información del usuario autenticado actual
   * GET /api/v1/auth/profile
   */
  getProfile: asyncHandler(async (req, res) => {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      throw new AppError('Usuario no encontrado en el sistema.', 404);
    }
    return ApiResponse.success(res, user, 'Perfil de usuario obtenido');
  }),

  /**
   * Actualiza los datos del perfil del usuario autenticado actual
   * PUT /api/v1/auth/profile
   */
  updateProfile: asyncHandler(async (req, res) => {
    const currentUser = await UserModel.findById(req.user.id);
    if (!currentUser) {
      throw new AppError('Usuario no encontrado en el sistema.', 404);
    }

    const {
      nombre_completo = currentUser.nombre_completo,
      usuario = currentUser.usuario,
      email = currentUser.email,
    } = req.body;

    const trimmedNombre = (nombre_completo || '').trim();
    const trimmedUsuario = (usuario || '').trim();
    const trimmedEmail = (email || '').trim().toLowerCase();

    if (!trimmedNombre || !trimmedUsuario || !trimmedEmail) {
      throw new AppError('Los campos "nombre_completo", "usuario" y "email" no pueden estar vacíos.', 400);
    }

    // Comprobar conflicto de unicidad con otros usuarios
    const conflict = await UserModel.checkConflictOnUpdate(req.user.id, trimmedUsuario, trimmedEmail);
    if (conflict) {
      if (conflict.usuario === trimmedUsuario) {
        throw new AppError('El nombre de usuario ya está en uso por otra cuenta.', 409);
      }
      if (conflict.email === trimmedEmail) {
        throw new AppError('El correo electrónico ya está en uso por otra cuenta.', 409);
      }
    }

    const updatedUser = await UserModel.updateProfile(req.user.id, {
      nombre_completo: trimmedNombre,
      usuario: trimmedUsuario,
      email: trimmedEmail,
    });

    return ApiResponse.success(res, updatedUser, 'Perfil actualizado correctamente');
  }),

  /**
   * Actualiza la contraseña del usuario autenticado
   * POST /api/v1/auth/change-password
   */
  changePassword: asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new AppError('Debe proporcionar su contraseña actual y la nueva contraseña.', 400);
    }

    if (newPassword.length < 6) {
      throw new AppError('La nueva contraseña debe tener al menos 6 caracteres.', 400);
    }

    const user = await UserModel.findByIdWithPassword(req.user.id);
    if (!user) {
      throw new AppError('Usuario no encontrado.', 404);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      throw new AppError('La contraseña actual ingresada es incorrecta.', 400);
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await UserModel.updatePassword(req.user.id, newHash);

    return ApiResponse.success(res, null, 'Contraseña actualizada exitosamente');
  }),

  /**
   * Cierre de sesión del usuario autenticado
   * POST /api/v1/auth/logout
   */
  logout: asyncHandler(async (req, res) => {
    // En arquitecturas JWT sin estado (stateless), el cliente debe descartar/eliminar
    // el token de su almacenamiento local (localStorage, sessionStorage o memoria).
    return ApiResponse.success(
      res,
      null,
      'Sesión cerrada exitosamente. Por favor elimine el token del cliente.'
    );
  }),
};
