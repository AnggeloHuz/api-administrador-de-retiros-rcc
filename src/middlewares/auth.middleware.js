import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { UserModel } from '../models/user.model.js';

/**
 * Middleware para autenticar solicitudes mediante JSON Web Tokens (Bearer Token).
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No se proporcionó un token de autenticación válido.', 401);
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT.SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new AppError('La sesión ha expirado. Por favor inicia sesión nuevamente.', 401);
      }
      throw new AppError('Token de autenticación inválido o corrupto.', 401);
    }

    // Verificar que el usuario aún exista y permanezca activo en la base de datos
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      throw new AppError('El usuario asociado a este token ya no existe en el sistema.', 401);
    }

    if (!user.activo) {
      throw new AppError('Tu cuenta de usuario ha sido suspendida o desactivada.', 403);
    }

    // Inyectar datos del usuario autenticado en el objeto de petición (req.user)
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware de autorización basado en roles (RBAC).
 * 
 * @param  {...string} allowedRoles - Lista de roles autorizados
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Usuario no autenticado en el sistema.', 401));
    }

    // El rol 'root' tiene acceso irrestricto a todas las rutas protegidas
    if (req.user.rol === 'root') {
      return next();
    }

    if (!allowedRoles.includes(req.user.rol)) {
      return next(
        new AppError(
          `Acceso denegado: Se requiere uno de los siguientes roles: [${allowedRoles.join(', ')}]. Tu rol actual es [${req.user.rol}].`,
          403
        )
      );
    }

    next();
  };
};
