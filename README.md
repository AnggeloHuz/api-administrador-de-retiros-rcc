# 🏛️ API-ADMIN-RETIROS

API REST profesional y modular para la administración de retiros, desarrollada con **Node.js**, **Express** y JavaScript moderno (ES Modules), aplicando patrones de diseño desacoplados y buenas prácticas de arquitectura backend.

---

## 📋 Características Principales

- **Arquitectura en Capas (Layered Architecture):** Separación estricta entre configuración, servidor HTTP, aplicación Express, enrutadores, controladores y servicios.
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
- **Graceful Shutdown:** Cierre seguro de conexiones HTTP ante señales `SIGTERM` y `SIGINT` (ideal para contenedores Docker y Kubernetes).

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
    ├── app.js                    # Configuración de Express (Middlewares, Rutas, Errores)
    ├── server.js                 # Entrada del servidor HTTP (Listener y Graceful Shutdown)
    ├── config/
    │   └── env.js                # Validación y centralización de variables de entorno
    ├── middlewares/
    │   ├── error.middleware.js   # Manejador global de errores
    │   ├── notFound.middleware.js# Manejador de rutas 404
    │   ├── rateLimiter.middleware.js # Limitador de peticiones por IP
    │   └── requestLogger.middleware.js # Logger HTTP (Morgan)
    ├── modules/                  # Módulos organizados por dominio
    │   ├── health/               # Verificación de salud y métricas del sistema
    │   │   ├── health.controller.js
    │   │   └── health.routes.js
    │   └── withdrawals/          # Ejemplo de módulo de retiros (Capa Negocio)
    │       ├── withdrawals.controller.js
    │       ├── withdrawals.routes.js
    │       └── withdrawals.service.js
    ├── routes/
    │   └── index.js              # Enrutador principal de la API (/api/v1)
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

### 1. Sistema & Salud
| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/` | Información básica del servicio y estado |
| `GET` | `/health` | Health check rápido para balanceadores de carga |
| `GET` | `/api/v1/health` | Health check detallado con métricas de memoria |

### 2. Módulo de Retiros (`/api/v1/withdrawals`)
| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/v1/withdrawals` | Obtiene el listado de retiros registrados |
| `GET` | `/api/v1/withdrawals/:id` | Obtiene el detalle de un retiro específico |
| `POST` | `/api/v1/withdrawals` | Registra una nueva solicitud de retiro |

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
