import bcrypt from 'bcryptjs';
import { query } from './pool.js';
import { env } from '../config/env.js';

/**
 * Garantiza la existencia de al menos un usuario con rol 'root' (máximos privilegios)
 * en el arranque del servidor. Si no existe ninguno, lo crea automáticamente.
 */
export const initRootUser = async () => {
  try {
    // 1. Verificar si ya existe algún usuario con rol 'root'
    const [existingRoots] = await query(
      'SELECT id, usuario, email FROM usuarios WHERE rol = ? LIMIT 1',
      ['root']
    );

    if (existingRoots.length > 0) {
      console.log(`👑 [SECURITY] Usuario root verificado en el sistema: @${existingRoots[0].usuario}`);
      return;
    }

    // 2. Si no existe, verificar que no colisione el nombre de usuario o email por defecto
    const [existingConflict] = await query(
      'SELECT id, usuario, email FROM usuarios WHERE usuario = ? OR email = ? LIMIT 1',
      [env.ROOT_ADMIN.USER, env.ROOT_ADMIN.EMAIL]
    );

    if (existingConflict.length > 0) {
      // Si existe con ese usuario pero con otro rol, lo actualizamos a root
      await query(
        'UPDATE usuarios SET rol = ?, activo = 1 WHERE id = ?',
        ['root', existingConflict[0].id]
      );
      console.log(`👑 [SECURITY] Usuario @${existingConflict[0].usuario} promovido a rol 'root'.`);
      return;
    }

    // 3. Hashear contraseña y crear usuario inicial con máximos privilegios
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(env.ROOT_ADMIN.PASSWORD, saltRounds);

    const [insertResult] = await query(
      `INSERT INTO usuarios 
        (nombre_completo, usuario, password_hash, email, rol, activo) 
       VALUES (?, ?, ?, ?, 'root', 1)`,
      [
        env.ROOT_ADMIN.NAME,
        env.ROOT_ADMIN.USER,
        passwordHash,
        env.ROOT_ADMIN.EMAIL,
      ]
    );

    console.log('='.repeat(65));
    console.log('👑 [SECURITY SEED] SUPERADMINISTRADOR INICIAL CREADO AUTOMÁTICAMENTE');
    console.log(`   ID:        ${insertResult.insertId}`);
    console.log(`   Nombre:    ${env.ROOT_ADMIN.NAME}`);
    console.log(`   Usuario:   ${env.ROOT_ADMIN.USER}`);
    console.log(`   Email:     ${env.ROOT_ADMIN.EMAIL}`);
    console.log(`   Rol:       root (Máximos privilegios)`);
    console.log('='.repeat(65));
  } catch (error) {
    console.error('❌ Error al inicializar el usuario root por defecto:', error.message);
    throw error;
  }
};
