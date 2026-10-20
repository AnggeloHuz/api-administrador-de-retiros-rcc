# 🏛️ API-ADMIN-RETIROS

API REST profesional y modular para la administración de retiros, desarrollada con **Node.js**, **Express** y JavaScript moderno (ES Modules), aplicando patrones de diseño desacoplados y buenas prácticas de arquitectura backend.

---

## 📋 Características Principales

- **Acceso a Datos de Alto Rendimiento:** Consultas preparadas (Prepared Statements) con `mysql2/promise` para control total y prevención de inyecciones SQL.
- **Auto-Aprovisionamiento de Superadministrador (Seed Inicial):** El servidor verifica y crea automáticamente un usuario con rol `root` (máximos privilegios) en su primer arranque.
- **Autenticación y Autorización Robusta:**
  - Tokens JWT (JSON Web Tokens) con expiración configurable.
  - Hashing seguro de contraseñas con `bcryptjs`.
  - Middleware de control de acceso basado en roles (RBAC: `root`, `coordinador_general`, `tesorero_finanzas`, `logistica_inscripcion`, `lector`).
- **Arquitectura en Capas (Layered Architecture):** Separación estricta entre configuración, base de datos, middlewares, repositorios, servicios y controladores.
- **Separación `app.js` y `server.js`:** Facilita la creación de tests de integración con Supertest o Jest sin bloquear puertos de red.
- **Seguridad Lista para Producción:**
  - Cabeceras HTTP seguras mediante [`helmet`](https://helmetjs.github.io/).
  - Políticas de [`cors`](https://github.com/expressjs/cors) configurables por origen.
  - Limitación de tasa de solicitudes con [`express-rate-limit`](https://github.com/express-rate-limit/express-rate-limit) contra ataques de fuerza bruta y DDoS.
  - Limitación en el tamaño del payload en peticiones JSON para prevenir saturación de memoria.
- **Manejo Centralizado de Errores:**
  - Clase `AppError` para errores operacionales con códigos de estado HTTP.
  - Middleware global que sanitiza los mensajes en producción y expone stacktraces solo en desarrollo.
  - `asyncHandler` para eliminar el boilerplate repetitivo de `try/catch` en controladores.
- **Respuestas JSON Estandarizadas:** Clase utilitaria `ApiResponse` que garantiza un formato consistente de respuesta.
- **Observabilidad:**
  - Logging estructurado con `morgan`.
  - Endpoint de **Health Check** (`/health` y `/api/v1/health`) con métricas de uptime y uso de memoria.
- **Graceful Shutdown:** Cierre seguro de conexiones HTTP y pools de MySQL ante señales `SIGTERM` y `SIGINT`.

---

## 📁 Estructura del Proyecto

```text
API-ADMIN-RETIROS/
├── .env.example                  # Plantilla de variables de entorno
├── .env                          # Variables de entorno locales
├── .gitignore                    # Exclusiones de Git
├── package.json                  # Dependencias y scripts
├── README.md                     # Documentación general
└── src/
    ├── app.js                    # Configuración Express (Middlewares, Rutas, Errores)
    ├── server.js                 # Listener HTTP, verificación BD, seed root y Graceful Shutdown
    ├── config/
    │   ├── env.js                # Validación y centralización de variables de entorno
    │   └── swagger.js            # Configuración OpenAPI 3.0 y Swagger UI
    ├── db/
    │   ├── pool.js               # Pool de conexiones MySQL2 con mysql2/promise
    │   ├── initRootUser.js       # Auto-creación de superadministrador inicial con rol 'root'
    │   └── administrador-retiros-rcc.sql # Esquema SQL relacional
    ├── models/                   # Capa de Acceso a Datos y Consultas SQL (Modelos)
    │   └── user.model.js         # Operaciones sobre tabla `usuarios`
    ├── controllers/              # Controladores de negocio y manejo de peticiones HTTP
    │   ├── auth.controller.js    # Lógica de login, perfil y cambio de clave
    │   ├── user.controller.js    # Gestión de usuarios, roles y estados
    │   └── health.controller.js  # Métricas y estado del servidor
    ├── routes/                   # Definición de rutas y mapeo de endpoints
    │   ├── index.js              # Enrutador central (/api/v1)
    │   ├── auth.routes.js        # Rutas de autenticación
    │   ├── user.routes.js        # Rutas de usuarios y roles
    │   └── health.routes.js      # Rutas de comprobación de salud
    ├── middlewares/
    │   ├── auth.middleware.js    # Autenticación JWT y guardias RBAC por roles
    │   ├── error.middleware.js   # Manejador global de errores
    │   ├── notFound.middleware.js# Manejador de rutas 404
    │   ├── rateLimiter.middleware.js # Limitador de peticiones por IP
    │   └── requestLogger.middleware.js # Logger HTTP (Morgan)
    └── utils/
        ├── AppError.js           # Clase base para errores controlados
        ├── apiResponse.js        # Formateador uniforme de respuestas HTTP
        └── asyncHandler.js       # Wrapper para controladores asíncronos
```

---

## ⚙️ Requisitos Previos

- **Node.js** >= 18.0.0 (Recomendado Node.js 20 LTS o superior).
- **npm**, **pnpm** o **yarn**.

---

## 🚀 Instalación y Puesta en Marcha

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar el entorno:**
   Copia el archivo `.env.example` a `.env` (ya creado):
   ```bash
   cp .env.example .env
   ```

3. **Iniciar en modo desarrollo:**
   Utiliza el nuevo modo de recarga automática nativa de Node.js:
   ```bash
   npm run dev
   ```
   *(Alternativa con nodemon: `npm run dev:nodemon`)*

4. **Iniciar en modo producción:**
   ```bash
   npm start
   ```

---

## 📡 Endpoints Disponibles

### 1. Documentación Interactiva (Swagger OpenAPI 3.0)
| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/docs` | Redirección amigable a la documentación interactiva |
| `GET` | `/api/v1/docs` | Interfaz gráfica interactiva de Swagger UI |
| `GET` | `/api/v1/docs.json` | Especificación OpenAPI 3.0 en formato JSON |

### 2. Sistema & Salud
| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/` | Información básica del servicio y estado |
| `GET` | `/health` | Health check rápido para balanceadores de carga |
| `GET` | `/api/v1/health` | Health check detallado con métricas de memoria |

### 3. Autenticación (`/api/v1/auth`)
| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Iniciar sesión y obtener token JWT |
| `GET` | `/api/v1/auth/profile` | Obtener perfil del usuario autenticado (Bearer Token) |
| `PUT` | `/api/v1/auth/profile` | Actualizar datos del perfil propio (nombre, usuario, email) |
| `POST` | `/api/v1/auth/change-password` | Modificar contraseña propia (Bearer Token) |
| `POST` | `/api/v1/auth/logout` | Cerrar sesión y descartar credenciales activas (Bearer Token) |

### 4. Gestión de Usuarios y Roles (`/api/v1/users`)
| Método | Endpoint | Permisos | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/users` | `root`, `coordinador_general` | Listar usuarios paginados |
| `GET` | `/api/v1/users/:id` | `root`, `coordinador_general` | Detalle de un usuario |
| `POST` | `/api/v1/users` | Exclusivo `root` | Registrar usuario con rol asignado |
| `PUT` | `/api/v1/users/:id` | Exclusivo `root` | Modificar datos y rol de un usuario existente |
| `PATCH` | `/api/v1/users/:id/status` | Exclusivo `root` | Activar o desactivar cuenta |

#### Ejemplo de Solicitud `POST /api/v1/withdrawals`:
```json
{
  "userId": "usr-889",
  "amount": 250.75,
  "currency": "USD"
}
```

#### Formato de Respuesta Exitosa Estandarizada:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Solicitud de retiro registrada correctamente",
  "data": {
    "id": "ret-4321",
    "userId": "usr-889",
    "amount": 250.75,
    "currency": "USD",
    "status": "PENDING",
    "createdAt": "2026-10-20T12:00:00.000Z"
  }
}
```

#### Formato de Respuesta de Error Estandarizada:
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Retiro con ID 'ret-999' no fue encontrado."
}
```

---

## 🧱 Guía para Agregar un Nuevo Módulo

Para agregar una nueva funcionalidad (por ejemplo, `users` o `transactions`):

1. Crea la carpeta en `src/modules/<nuevo_modulo>/`.
2. Implementa:
   - `<modulo>.service.js`: Lógica de negocio y consultas a base de datos.
   - `<modulo>.controller.js`: Recibe peticiones HTTP, valida y delega al servicio usando `asyncHandler`.
   - `<modulo>.routes.js`: Define los verbos y endpoints del módulo con `Router()`.
3. Monta las nuevas rutas en [src/routes/index.js](file:///home/huz/Documentos/Desarrollo/API-ADMIN-RETIROS/src/routes/index.js):
   ```javascript
   import { nuevoModuloRoutes } from '../modules/<nuevo_modulo>/<modulo>.routes.js';
   apiRouter.use('/nuevo-modulo', nuevoModuloRoutes);
   ```
