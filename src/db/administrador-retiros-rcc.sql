-- =============================================================================
-- SISTEMA EXCLUSIVO DE ADMINISTRACIÓN DE RETIROS Y FINANZAS (RCCRNV)
-- Archivo: administrador-retiros-rcc.sql
-- Compatible con: MySQL 5.7+, MySQL 8.0+, MariaDB 10.2+
-- Motor: InnoDB | Cotejamiento: utf8mb4_unicode_ci
-- =============================================================================

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO';
SET NAMES utf8mb4;

-- =============================================================================
-- CREACIÓN Y SELECCIÓN DE BASE DE DATOS
-- =============================================================================
CREATE DATABASE IF NOT EXISTS `administrador_retiros_rcc` 
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `administrador_retiros_rcc`;


-- -----------------------------------------------------------------------------
-- 1. MÓDULO DE SEGURIDAD Y PERSONAS
-- -----------------------------------------------------------------------------

DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre_completo` VARCHAR(150) NOT NULL,
  `usuario` VARCHAR(100) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `rol` ENUM('root', 'coordinador_general', 'tesorero_finanzas', 'logistica_inscripcion', 'lector') NOT NULL DEFAULT 'lector',
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `ultimo_acceso` DATETIME NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_usuarios_usuario` (`usuario`),
  UNIQUE KEY `uk_usuarios_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `personas`;
CREATE TABLE `personas` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `cedula` VARCHAR(15) NOT NULL,
  `nombre` VARCHAR(100) NOT NULL,
  `apellido` VARCHAR(100) NOT NULL,
  `sexo` ENUM('M', 'F') NOT NULL,
  `fecha_nacimiento` DATE NOT NULL,
  `telefono` VARCHAR(20) NULL DEFAULT NULL,
  `email` VARCHAR(150) NULL DEFAULT NULL,
  `procedencia` VARCHAR(200) NULL DEFAULT NULL,
  `alergias_condiciones` TEXT NULL DEFAULT NULL,
  `contacto_emergencia` VARCHAR(200) NULL DEFAULT NULL,
  `es_sacerdote_religioso` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_personas_cedula` (`cedula`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. MÓDULO DE CONFIGURACIÓN, ÁREAS Y LOGÍSTICA DEL RETIRO
-- -----------------------------------------------------------------------------

DROP TABLE IF EXISTS `categorias_area`;
CREATE TABLE `categorias_area` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(150) NOT NULL,
  `descripcion` VARCHAR(500) NULL DEFAULT NULL,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_categorias_area_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `tipos_retiro`;
CREATE TABLE `tipos_retiro` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `id_categoria_area` INT(11) NOT NULL,
  `nombre` VARCHAR(150) NOT NULL,
  `descripcion` VARCHAR(500) NULL DEFAULT NULL,
  `nivel_prelacion` INT(2) NOT NULL DEFAULT 0,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `fk_tipos_retiro_area_idx` (`id_categoria_area`),
  CONSTRAINT `fk_tipos_retiro_area` FOREIGN KEY (`id_categoria_area`) REFERENCES `categorias_area` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `lugares`;
CREATE TABLE `lugares` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(200) NOT NULL,
  `direccion` VARCHAR(500) NOT NULL,
  `capacidad_maxima` INT(5) NOT NULL DEFAULT 0,
  `costo_alquiler_referencial` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `persona_contacto` VARCHAR(150) NULL DEFAULT NULL,
  `telefono_contacto` VARCHAR(20) NULL DEFAULT NULL,
  `observaciones` TEXT NULL DEFAULT NULL,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `habitaciones_lugar`;
CREATE TABLE `habitaciones_lugar` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `id_lugar` INT(11) NOT NULL,
  `nombre_codigo` VARCHAR(100) NOT NULL,
  `capacidad_camas` INT(4) NOT NULL DEFAULT 1,
  `destinado_a` ENUM('hombres', 'mujeres', 'matrimonios', 'predicadores_sacerdotes', 'mixto') NOT NULL DEFAULT 'mixto',
  PRIMARY KEY (`id`),
  KEY `fk_habitaciones_lugar_idx` (`id_lugar`),
  CONSTRAINT `fk_habitaciones_lugar` FOREIGN KEY (`id_lugar`) REFERENCES `lugares` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. MÓDULO CENTRAL DEL RETIRO Y PROGRAMACIÓN
-- -----------------------------------------------------------------------------

DROP TABLE IF EXISTS `retiros`;
CREATE TABLE `retiros` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `id_tipo` INT(11) NOT NULL,
  `id_lugar` INT(11) NOT NULL,
  `coordinador_id` INT(11) NOT NULL,
  `instancia_organizadora` VARCHAR(150) NOT NULL,
  `nombre` VARCHAR(250) NOT NULL,
  `lema_cita_biblica` VARCHAR(300) NULL DEFAULT NULL,
  `descripcion` TEXT NULL DEFAULT NULL,
  `fecha_inicio` DATETIME NOT NULL,
  `fecha_fin` DATETIME NOT NULL,
  `modalidad` ENUM('internado_hospedaje', 'externo_sin_hospedaje', 'mixto') NOT NULL DEFAULT 'internado_hospedaje',
  `precio_servidor` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `precio_participante` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `moneda_base` ENUM('USD', 'VES', 'EUR') NOT NULL DEFAULT 'USD',
  `presupuesto_estimado` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `cupos_participantes` INT(5) NOT NULL DEFAULT 0,
  `cupos_servidores` INT(5) NOT NULL DEFAULT 0,
  `estado` ENUM('planificacion', 'inscripciones_abiertas', 'en_curso', 'finalizado', 'cerrado_contablemente', 'cancelado') NOT NULL DEFAULT 'planificacion',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_retiros_tipo_idx` (`id_tipo`),
  KEY `fk_retiros_lugar_idx` (`id_lugar`),
  KEY `fk_retiros_coordinador_idx` (`coordinador_id`),
  CONSTRAINT `fk_retiros_tipo` FOREIGN KEY (`id_tipo`) REFERENCES `tipos_retiro` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_retiros_lugar` FOREIGN KEY (`id_lugar`) REFERENCES `lugares` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_retiros_coordinador` FOREIGN KEY (`coordinador_id`) REFERENCES `personas` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `retiro_inscripciones`;
CREATE TABLE `retiro_inscripciones` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `id_retiro` INT(11) NOT NULL,
  `id_persona` INT(11) NOT NULL,
  `rol_en_retiro` ENUM('participante', 'servidor', 'predicador', 'coordinador', 'sacerdote', 'invitado_especial') NOT NULL,
  `ministerio_servicio` ENUM('ninguno', 'coordinacion', 'intercesion', 'musica_alabanza', 'cocina_comedor', 'logistica_mantenimiento', 'acogida_recepcion', 'liturgia', 'primeros_auxilios', 'pastoreo_grupos', 'sonido_multimedia') NOT NULL DEFAULT 'ninguno',
  `id_habitacion` INT(11) NULL DEFAULT NULL,
  `monto_a_pagar` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `estado_pago` ENUM('pendiente', 'abonado', 'pagado', 'exonerado_becado') NOT NULL DEFAULT 'pendiente',
  `entrego_escarapela_kit` TINYINT(1) NOT NULL DEFAULT 0,
  `asistio` TINYINT(1) NOT NULL DEFAULT 0,
  `observaciones` VARCHAR(300) NULL DEFAULT NULL,
  `fecha_inscripcion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_retiro_persona` (`id_retiro`, `id_persona`),
  KEY `fk_inscripcion_retiro_idx` (`id_retiro`),
  KEY `fk_inscripcion_persona_idx` (`id_persona`),
  KEY `fk_inscripcion_habitacion_idx` (`id_habitacion`),
  CONSTRAINT `fk_inscripcion_retiro` FOREIGN KEY (`id_retiro`) REFERENCES `retiros` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_inscripcion_persona` FOREIGN KEY (`id_persona`) REFERENCES `personas` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_inscripcion_habitacion` FOREIGN KEY (`id_habitacion`) REFERENCES `habitaciones_lugar` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `retiro_temas_cronograma`;
CREATE TABLE `retiro_temas_cronograma` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `id_retiro` INT(11) NOT NULL,
  `id_predicador` INT(11) NULL DEFAULT NULL,
  `titulo_actividad_tema` VARCHAR(250) NOT NULL,
  `tipo_actividad` ENUM('predicacion', 'eucaristia', 'hora_santa', 'alabanza', 'dinamica_grupos', 'comida_descanso', 'otro') NOT NULL,
  `fecha_hora_inicio` DATETIME NOT NULL,
  `fecha_hora_fin` DATETIME NOT NULL,
  `observaciones_logisticas` VARCHAR(500) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_cronograma_retiro_idx` (`id_retiro`),
  KEY `fk_cronograma_predicador_idx` (`id_predicador`),
  CONSTRAINT `fk_cronograma_retiro` FOREIGN KEY (`id_retiro`) REFERENCES `retiros` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cronograma_predicador` FOREIGN KEY (`id_predicador`) REFERENCES `personas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. MÓDULO FINANCIERO INTEGRAL DEL RETIRO
-- -----------------------------------------------------------------------------

DROP TABLE IF EXISTS `pagos_inscripcion`;
CREATE TABLE `pagos_inscripcion` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `id_inscripcion` INT(11) NOT NULL,
  `monto_pagado` DECIMAL(10, 2) NOT NULL,
  `moneda_pago` ENUM('USD', 'VES', 'EUR') NOT NULL,
  `tasa_cambio` DECIMAL(12, 4) NOT NULL DEFAULT 1.0000,
  `monto_equivalente_base` DECIMAL(10, 2) NOT NULL,
  `metodo_pago` ENUM('pago_movil', 'transferencia', 'efectivo_divisa', 'efectivo_bs', 'zelle', 'biopago', 'otro') NOT NULL,
  `referencia` VARCHAR(100) NULL DEFAULT NULL,
  `fecha_pago` DATETIME NOT NULL,
  `registrado_por` INT(11) NOT NULL,
  `observacion` VARCHAR(300) NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_pagos_inscripcion_idx` (`id_inscripcion`),
  KEY `fk_pagos_usuario_idx` (`registrado_por`),
  CONSTRAINT `fk_pagos_inscripcion` FOREIGN KEY (`id_inscripcion`) REFERENCES `retiro_inscripciones` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_pagos_usuario` FOREIGN KEY (`registrado_por`) REFERENCES `usuarios` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `retiro_colaboraciones`;
CREATE TABLE `retiro_colaboraciones` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `id_retiro` INT(11) NOT NULL,
  `donante_nombre` VARCHAR(200) NOT NULL,
  `id_persona_donante` INT(11) NULL DEFAULT NULL,
  `origen_colaboracion` ENUM('donacion_personal', 'aporte_parroquia_instancia', 'actividad_profondos_vendimia', 'ofrenda_misa', 'patrocinio_comercio', 'otro') NOT NULL,
  `tipo_aporte` ENUM('dinero', 'especie_insumos', 'servicio_gratuito') NOT NULL,
  `descripcion_detalle` VARCHAR(500) NOT NULL,
  `cantidad_insumo` DECIMAL(10, 2) NULL DEFAULT NULL,
  `unidad_medida` VARCHAR(30) NULL DEFAULT NULL,
  `monto_monetario` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `moneda` ENUM('USD', 'VES', 'EUR') NOT NULL DEFAULT 'USD',
  `tasa_cambio` DECIMAL(12, 4) NOT NULL DEFAULT 1.0000,
  `monto_equivalente_base` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `metodo_recepcion` ENUM('efectivo_divisa', 'efectivo_bs', 'pago_movil', 'transferencia', 'entrega_fisica_insumo', 'otro') NOT NULL,
  `referencia` VARCHAR(100) NULL DEFAULT NULL,
  `fecha_recepcion` DATETIME NOT NULL,
  `recibido_por` INT(11) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_colaboraciones_retiro_idx` (`id_retiro`),
  KEY `fk_colaboraciones_persona_idx` (`id_persona_donante`),
  KEY `fk_colaboraciones_usuario_idx` (`recibido_por`),
  CONSTRAINT `fk_colaboraciones_retiro` FOREIGN KEY (`id_retiro`) REFERENCES `retiros` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_colaboraciones_persona` FOREIGN KEY (`id_persona_donante`) REFERENCES `personas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_colaboraciones_usuario` FOREIGN KEY (`recibido_por`) REFERENCES `usuarios` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `categorias_gasto`;
CREATE TABLE `categorias_gasto` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(150) NOT NULL,
  `descripcion` VARCHAR(300) NULL DEFAULT NULL,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_categorias_gasto_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `retiro_gastos`;
CREATE TABLE `retiro_gastos` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `id_retiro` INT(11) NOT NULL,
  `id_categoria_gasto` INT(11) NOT NULL,
  `concepto` VARCHAR(300) NOT NULL,
  `proveedor_beneficiario` VARCHAR(200) NULL DEFAULT NULL,
  `responsable_compra_id` INT(11) NULL DEFAULT NULL,
  `monto_gasto` DECIMAL(10, 2) NOT NULL,
  `moneda_gasto` ENUM('USD', 'VES', 'EUR') NOT NULL,
  `tasa_cambio` DECIMAL(12, 4) NOT NULL DEFAULT 1.0000,
  `monto_equivalente_base` DECIMAL(10, 2) NOT NULL,
  `metodo_pago` ENUM('pago_movil', 'transferencia', 'efectivo_divisa', 'efectivo_bs', 'zelle', 'punto_venta', 'otro') NOT NULL,
  `numero_factura_referencia` VARCHAR(100) NULL DEFAULT NULL,
  `comprobante_url` VARCHAR(500) NULL DEFAULT NULL,
  `estado_gasto` ENUM('pagado', 'por_pagar_credito', 'reembolsable_a_servidor', 'anulado') NOT NULL DEFAULT 'pagado',
  `fecha_gasto` DATETIME NOT NULL,
  `registrado_por` INT(11) NOT NULL,
  `observaciones` TEXT NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_gastos_retiro_idx` (`id_retiro`),
  KEY `fk_gastos_categoria_idx` (`id_categoria_gasto`),
  KEY `fk_gastos_responsable_idx` (`responsable_compra_id`),
  KEY `fk_gastos_usuario_idx` (`registrado_por`),
  CONSTRAINT `fk_gastos_retiro` FOREIGN KEY (`id_retiro`) REFERENCES `retiros` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_gastos_categoria` FOREIGN KEY (`id_categoria_gasto`) REFERENCES `categorias_gasto` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_gastos_responsable` FOREIGN KEY (`responsable_compra_id`) REFERENCES `personas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_gastos_usuario` FOREIGN KEY (`registrado_por`) REFERENCES `usuarios` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. DATOS BÁSICOS INICIALES (SEEDS / CATÁLOGOS)
-- -----------------------------------------------------------------------------

INSERT INTO `categorias_area` (`nombre`, `descripcion`) VALUES
('Evangelización Fundamental', 'Retiros de primer anuncio y conversión (Kerygma, Seminario de Vida en el Espíritu).'),
('Escuela de Formación y Crecimiento', 'Procesos formativos continuos (Crecimiento I, II, III, Escuela de Servidores).'),
('Red Nacional de Jóvenes', 'Encuentros y campamentos para jóvenes y adolescentes.'),
('Red de Familias y Matrimonios', 'Retiros conyugales y encuentros para padres e hijos.'),
('Red de Niños', 'Retiros espirituales y catequesis vivencial infantil.'),
('Ministerio de Intercesión', 'Retiros de oración, vigilias y combate espiritual.'),
('Ministerio de Alabanza y Música', 'Formación litúrgica y musical para ministerios de canto.'),
('Sacerdotes y Religiosos', 'Retiros espirituales para clero y vida consagrada.'),
('General / Zonal', 'Asambleas, congresos o retiros abiertos de la RCCRNV.');

INSERT INTO `categorias_gasto` (`nombre`, `descripcion`) VALUES
('Alimentación y Cocina', 'Compras de víveres, carnes, verduras, condimentos, gas y desechables.'),
('Alquiler de Casa de Retiro', 'Pago del canon de hospedaje, uso de instalaciones y servicios básicos.'),
('Transporte y Combustible', 'Autobuses contratados, gasolina y traslados de insumos/personas.'),
('Estipendios y Viáticos', 'Aportes a sacerdotes, predicadores invitados y transporte especial.'),
('Sonido, Multimedia e Iluminación', 'Alquiler o reposición de cables, micrófonos, proyectores y equipos.'),
('Papelería, Escarapelas y Materiales', 'Impresión de cuadernos, folletos, escarapelas, carpetas y bolígrafos.'),
('Liturgia y Capilla', 'Vino de consagrar, hostias, velas, carbón, incienso y flores.'),
('Botiquín y Primeros Auxilios', 'Medicamentos básicos, alcohol, gasas y material sanitario de emergencia.'),
('Imprevistos y Varios', 'Gastos menores de contingencia durante la ejecución del retiro.');

-- Restauración de configuraciones
SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
