import { query } from '../db/pool.js';

/**
 * Modelo de Usuario (UserModel).
 * Encapsula el acceso a datos y las consultas preparadas a la tabla `usuarios` mediante mysql2.
 */
export const UserModel = {
  /**
   * Busca un usuario por su nombre de usuario o correo electrónico.
   * @param {string} identifier - Nombre de usuario o email
   */
  async findByUsernameOrEmail(identifier) {
    const [rows] = await query(
      `SELECT id, nombre_completo, usuario, password_hash, email, rol, activo, ultimo_acceso, created_at, updated_at
       FROM usuarios
       WHERE usuario = ? OR email = ?
       LIMIT 1`,
      [identifier, identifier]
    );
    return rows[0] || null;
  },

  /**
   * Busca un usuario por ID sin exponer el hash de la contraseña.
   * @param {number|string} id - ID del usuario
   */
  async findById(id) {
    const [rows] = await query(
      `SELECT id, nombre_completo, usuario, email, rol, activo, ultimo_acceso, created_at, updated_at
       FROM usuarios
       WHERE id = ?
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Busca un usuario por ID incluyendo el password_hash (para verificación o cambio de contraseña).
   * @param {number|string} id - ID del usuario
   */
  async findByIdWithPassword(id) {
    const [rows] = await query(
      `SELECT id, nombre_completo, usuario, password_hash, email, rol, activo
       FROM usuarios
       WHERE id = ?
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Actualiza la fecha y hora del último acceso.
   * @param {number|string} id - ID del usuario
   */
  async updateLastAccess(id) {
    await query(
      'UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?',
      [id]
    );
  },

  /**
   * Actualiza el hash de la contraseña de un usuario.
   * @param {number|string} id - ID del usuario
   * @param {string} newPasswordHash - Nuevo hash bcrypt
   */
  async updatePassword(id, newPasswordHash) {
    await query(
      'UPDATE usuarios SET password_hash = ? WHERE id = ?',
      [newPasswordHash, id]
    );
  },

  /**
   * Lista usuarios con paginación y filtros opcionales.
   * @param {object} options
   */
  async findAll({ page = 1, limit = 20, search = '', rol = null } = {}) {
    const offset = (page - 1) * limit;
    const params = [];
    const whereConditions = [];

    if (search) {
      whereConditions.push('(nombre_completo LIKE ? OR usuario LIKE ? OR email LIKE ?)');
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    if (rol) {
      whereConditions.push('rol = ?');
      params.push(rol);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Total de registros
    const [countResult] = await query(
      `SELECT COUNT(*) as total FROM usuarios ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // Registros paginados
    const [rows] = await query(
      `SELECT id, nombre_completo, usuario, email, rol, activo, ultimo_acceso, created_at
       FROM usuarios
       ${whereClause}
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    return {
      data: rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Inserta un nuevo usuario en la base de datos.
   * @param {object} userData
   */
  async create({ nombre_completo, usuario, password_hash, email, rol = 'lector', activo = 1 }) {
    const [result] = await query(
      `INSERT INTO usuarios (nombre_completo, usuario, password_hash, email, rol, activo)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre_completo, usuario, password_hash, email, rol, activo]
    );
    return result.insertId;
  },

  /**
   * Modifica el estado activo/inactivo de un usuario.
   * @param {number|string} id - ID del usuario
   * @param {boolean|number} activo - 1 para activo, 0 para inactivo
   */
  async updateStatus(id, activo) {
    await query(
      'UPDATE usuarios SET activo = ? WHERE id = ?',
      [activo ? 1 : 0, id]
    );
  },

  /**
   * Verifica si existe otro usuario con el mismo username o email (excluyendo un ID).
   * @param {number|string} id - ID del usuario actual
   * @param {string} usuario - Nombre de usuario a comprobar
   * @param {string} email - Correo a comprobar
   */
  async checkConflictOnUpdate(id, usuario, email) {
    const [rows] = await query(
      'SELECT id, usuario, email FROM usuarios WHERE (usuario = ? OR email = ?) AND id != ? LIMIT 1',
      [usuario, email, id]
    );
    return rows[0] || null;
  },

  /**
   * Actualiza los datos del perfil propio de un usuario (nombre_completo, usuario, email).
   * @param {number|string} id - ID del usuario
   * @param {object} profileData
   */
  async updateProfile(id, { nombre_completo, usuario, email }) {
    await query(
      'UPDATE usuarios SET nombre_completo = ?, usuario = ?, email = ? WHERE id = ?',
      [nombre_completo, usuario, email, id]
    );
    return this.findById(id);
  },

  /**
   * Actualiza los datos de un usuario por parte de un administrador (incluyendo rol).
   * @param {number|string} id - ID del usuario
   * @param {object} userData
   */
  async update(id, { nombre_completo, usuario, email, rol }) {
    await query(
      'UPDATE usuarios SET nombre_completo = ?, usuario = ?, email = ?, rol = ? WHERE id = ?',
      [nombre_completo, usuario, email, rol, id]
    );
    return this.findById(id);
  },
};
