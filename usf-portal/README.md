# USF Portal — Sistema Escolar Integral

> Portal web full-stack para la gestión académica: inscripciones, calificaciones, pagos y notificaciones en tiempo real.

---

## Equipo VIP

| Integrante | Rol | Módulo principal |
|---|---|---|
| Carlos Sanchez | Líder Técnico | Backend Auth + JWT + Roles |
| Luis Roberto Suarez | Frontend Lead | Angular: login, dashboards, guards |
| Ricardo Galindo | Backend Developer | Inscripciones, calificaciones, historial |
| Eduardo Robles | Frontend Developer | Formularios de inscripción, actas, kardex |
| Mariana Jimenez | Full-stack Developer | Pagos, notificaciones SSE, SSE Manager |

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Angular 17+ (standalone components, lazy loading) |
| Backend | Node.js + Express.js |
| Base de datos | MongoDB Atlas (Mongoose como ODM) |
| Autenticación | Email + contraseña + JWT (bcrypt) |
| Tiempo real | **Server-Sent Events (SSE)** — nativo del navegador, sin librerías |
| Pagos | Sistema local (efectivo / transferencia / OXXO) — sin Stripe |
| Testing de carga | Artillery.io |

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTE (Angular 17+)                 │
│  ┌──────────┐ ┌──────────┐ ┌────────────┐ ┌──────────┐ │
│  │   Auth   │ │Inscripción│ │Calificación│ │  Pagos / │ │
│  │ Dashboard│ │  RF-14/15 │ │  RF-20/21  │ │ Notifs   │ │
│  └────┬─────┘ └─────┬────┘ └─────┬──────┘ └────┬─────┘ │
│       └─────────────┴────────────┴──────────────┘       │
│           API REST (HTTP + JWT)   SSE stream             │
└──────────────────────┬──────────────────────────────────┘
                       │
       ┌───────────────▼───────────────┐
       │      BACKEND (Express.js)      │
       │                               │
       │  ┌──────────┐ ┌────────────┐  │
       │  │  Routes  │ │ Middleware │  │
       │  │  /api/*  │ │ JWT+Roles  │  │
       │  └────┬─────┘ └────────────┘  │
       │       │                       │
       │  ┌────▼──────────────────┐    │
       │  │    Controllers        │    │
       │  │  + inscripcion.service│    │
       │  └────┬──────────────────┘    │
       │       │             │         │
       │  ┌────▼────┐  ┌─────▼──────┐  │
       │  │Mongoose │  │ SSE Manager│  │
       │  │ Models  │  │(tiempo real│  │
       │  └────┬────┘  └────────────┘  │
       └───────┼───────────────────────┘
               │
   ┌───────────▼────────────┐
   │   MongoDB Atlas        │
   │  users · materias      │
   │  inscripciones · pagos │
   │  calificaciones        │
   │  adeudos · notificaciones│
   └────────────────────────┘
```

---

## Estructura de Carpetas

```
usf-portal/
├── backend/
│   ├── server.js                  # Entry point: Express + SSE + rutas
│   ├── .env.example               # Variables de entorno requeridas
│   ├── .env                       # Local (NO se commitea — ver .gitignore)
│   ├── artillery.yml              # Pruebas de carga (RF-54)
│   └── src/
│       ├── config/
│       │   └── db.js              # Conexión a MongoDB Atlas
│       ├── controllers/           # Lógica de cada endpoint
│       │   ├── auth.controller.js
│       │   ├── materias.controller.js
│       │   ├── inscripcion.controller.js
│       │   ├── calificacion.controller.js    # RF-20/21/22 (con SSE)
│       │   ├── calificaciones.controller.js  # Rutas base (mis-calificaciones)
│       │   ├── historial.controller.js       # RF-38 (kardex)
│       │   ├── pagos.controller.js
│       │   ├── adeudo.controller.js
│       │   └── notificaciones.controller.js  # SSE stream endpoint
│       ├── middleware/
│       │   ├── verifyToken.js     # Valida JWT en header Authorization
│       │   └── checkRole.js       # Autorización por rol (acepta string o array)
│       ├── models/                # Schemas de Mongoose
│       │   ├── User.js
│       │   ├── Materia.js
│       │   ├── Inscripcion.js
│       │   ├── Calificacion.js
│       │   ├── Pago.js
│       │   ├── Adeudo.js
│       │   └── Notificacion.js
│       ├── routes/                # Express routers
│       │   ├── auth.routes.js
│       │   ├── materias.routes.js
│       │   ├── inscripcion.routes.js
│       │   ├── calificaciones.routes.js
│       │   ├── historial.routes.js
│       │   ├── pagos.routes.js
│       │   ├── adeudo.routes.js
│       │   └── notificaciones.routes.js
│       ├── services/
│       │   └── inscripcion.service.js  # 4 validaciones: cupo, seriación, horario, adeudos
│       └── utils/
│           └── sse-manager.js          # Gestor de conexiones SSE activas
│
└── frontend/
    └── src/
        └── app/
            ├── core/
            │   ├── guards/
            │   │   ├── auth.guard.ts    # Requiere sesión activa
            │   │   └── role.guard.ts   # Requiere rol específico
            │   ├── interceptors/
            │   │   └── jwt.interceptor.ts  # Agrega Bearer token + maneja 401
            │   └── services/
            │       ├── auth.service.ts          # Login, register, JWT decode
            │       ├── api.service.ts           # Wrapper HTTP genérico
            │       └── notificaciones.service.ts # SSE + BehaviorSubjects
            └── modules/
                ├── auth/
                │   └── login/              # Login y registro
                ├── dashboard/
                │   ├── alumno/             # Dashboard del alumno
                │   ├── profesor/           # Dashboard del profesor
                │   └── admin/              # Dashboard del admin
                ├── inscripcion/            # RF-14: inscribir materias (alumno)
                ├── inscripciones-admin/    # Vista admin de todas las inscripciones
                ├── calificaciones/
                │   ├── calificaciones.component  # RF-20/21: captura (profesor/admin)
                │   └── calificaciones-alumno/    # Vista de notas del alumno
                ├── historial/              # RF-38: kardex académico
                ├── notificaciones/         # RF-22: bandeja de notificaciones
                └── pagos/                  # RF-30: gestión de pagos
```

---

## API REST — Endpoints

### Autenticación
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | Público | Registrar usuario con rol |
| POST | `/api/auth/login` | Público | Login → devuelve JWT |
| GET | `/api/auth/me` | JWT | Perfil del usuario autenticado |

### Materias
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/materias` | JWT | Listar materias activas (acepta ?periodo=) |
| POST | `/api/materias` | Admin | Crear materia |
| PUT | `/api/materias/:id` | Admin | Actualizar materia |
| DELETE | `/api/materias/:id` | Admin | Desactivar materia (baja lógica) |

### Inscripciones
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/inscripciones` | Alumno | Inscribir materias (valida 4 reglas) |
| GET | `/api/inscripciones/mi-inscripcion` | Alumno | Mi inscripción activa |
| GET | `/api/inscripciones` | Admin | Listar todas las inscripciones |
| PUT | `/api/inscripciones/:id/cancelar` | Admin | Cancelar inscripción |
| DELETE | `/api/inscripciones/:id` | Admin | Alias de cancelar (para frontend) |

### Calificaciones
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/calificaciones/mis-calificaciones` | Alumno | Mis calificaciones |
| GET | `/api/calificaciones/mi-grupo/:materiaId` | Profesor | Alumnos del grupo |
| GET | `/api/calificaciones/alumno/:alumnoId` | JWT | Calificaciones de un alumno |
| PUT | `/api/calificaciones/:id` | Profesor/Admin | Registrar notas + notificación SSE |
| PUT | `/api/calificaciones/:id/cerrar` | Admin | Cerrar acta (irreversible) |
| GET | `/api/calificaciones/:materiaId` | JWT | Ver por materia |

### Historial
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/historial/:alumnoId` | JWT | Kardex completo con resumen estadístico |

### Pagos
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/pagos/mis-pagos` | Alumno | Mis pagos |
| GET | `/api/pagos/:alumnoId` | Admin | Pagos de un alumno |
| POST | `/api/pagos` | Admin | Registrar pago (genera referencia automática) |
| PUT | `/api/pagos/:id/pagar` | Admin | Confirmar pago |

### Adeudos
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/adeudos` | Admin | Listar adeudos (acepta ?estado=pendiente) |
| POST | `/api/adeudos` | Admin | Crear adeudo |
| PUT | `/api/adeudos/:id/pagado` | Admin | Marcar adeudo como pagado |
| GET | `/api/adeudos/mis-adeudos` | Alumno | Mis adeudos |

### Notificaciones
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/notificaciones/stream` | Token en query | **SSE stream** en tiempo real |
| GET | `/api/notificaciones` | JWT | Listar notificaciones |
| PUT | `/api/notificaciones/:id/leer` | JWT | Marcar como leída |

---

## Notificaciones en Tiempo Real (SSE)

Se usa **Server-Sent Events** nativo — sin Socket.io ni librerías en el frontend:

```
Alumno abre app → EventSource('/api/notificaciones/stream?token=...')
Profesor guarda calificación → calificacion.controller → emitirAUsuario()
                                                          → res.write(event)
                                                          → EventSource recibe el evento
```

El token se pasa como query param porque `EventSource` no soporta headers personalizados.

---

## Validaciones de Inscripción (RF-15)

El servicio `inscripcion.service.js` ejecuta 4 validaciones antes de confirmar:

1. **CP-05** — Sin adeudos o pagos pendientes
2. **CP-04** — La materia tiene cupo disponible (`cupoDisponible > 0`)
3. **CP-03** — Seriación completa (todas las prerequisitos aprobadas con ≥ 60)
4. **CP-06** — Sin choque de horario con otras materias ya inscritas

Si alguna falla, devuelve HTTP 400 con un código legible (`SIN_CUPO`, `CRUCE_HORARIO`, etc.)

---

## Variables de Entorno

Crea `backend/.env` a partir de `.env.example`:

```env
MONGODB_URI=mongodb+srv://USUARIO:PASSWORD@cluster0.xxx.mongodb.net/usf_portal
JWT_SECRET=cadena_larga_y_aleatoria_para_produccion
BCRYPT_SALT_ROUNDS=10
PORT=3000
NODE_ENV=development
```

---

## Instalación y Ejecución Local

### Backend
```bash
cd usf-portal/backend
npm install
cp .env.example .env   # Edita MONGODB_URI y JWT_SECRET
node server.js         # Escucha en http://localhost:3000
```

### Frontend
```bash
cd usf-portal/frontend
npm install
ng serve               # Escucha en http://localhost:4200
```

### Health check
```
GET http://localhost:3000/api/health
→ { "status": "ok", "message": "USF Portal API corriendo" }
```

---

## Rutas del Frontend

| Ruta | Componente | Acceso |
|---|---|---|
| `/auth/login` | LoginComponent | Público |
| `/dashboard/alumno` | AlumnoDashboardComponent | Alumno |
| `/dashboard/profesor` | ProfesorDashboardComponent | Profesor |
| `/dashboard/admin` | AdminDashboardComponent | Admin |
| `/inscripcion` | InscripcionComponent | Alumno |
| `/inscripciones-admin` | InscripcionesAdminComponent | Admin |
| `/calificaciones` | CalificacionesComponent | Profesor / Admin |
| `/calificaciones/alumno` | CalificacionesAlumnoComponent | Alumno |
| `/historial` | HistorialComponent | JWT (cualquier rol) |
| `/notificaciones` | NotificacionesComponent | JWT (cualquier rol) |
| `/pagos` | PagosComponent | Alumno / Admin |

---

## Modelos de Base de Datos

### User
```
nombre, apellido, email (unique), password (bcrypt), rol, matricula, foto, activo
```

### Materia
```
clave (unique), nombre, creditos, cupoMaximo, cupoDisponible, horario[], seriacion[], profesor_id, periodo, activa
```

### Inscripcion
```
alumno_id, periodo, materias[], estado (pendiente/confirmada/cancelada)
```

### Calificacion
```
alumno_id, materia_id, profesor_id, periodo, parcial1, parcial2, parcial3, final, cerrada, fechaCierre
```

### Pago
```
alumno_id, concepto, monto, tipo (colegiaturas/tramite), estado, metodo (efectivo/transferencia/oxxo), referencia
```

### Adeudo
```
alumno_id, concepto, monto, estado (pendiente/pagado), periodo, registradoPor, fechaPago
```

### Notificacion
```
destinatario_id, titulo, mensaje, tipo (calificacion/horario/pago), leida, fecha
```

---

## Estado del Proyecto

| Módulo | Backend | Frontend | Estado |
|---|---|---|---|
| Autenticación (RF-01/02) | ✅ | ✅ | Completo |
| Control de acceso por rol (RF-05) | ✅ | ✅ | Completo |
| Inscripción con validaciones (RF-14/15) | ✅ | ✅ | Completo |
| Calificaciones parciales (RF-20) | ✅ | ✅ | Completo |
| Cierre de actas (RF-21) | ✅ | ✅ | Completo |
| Notificaciones SSE (RF-22) | ✅ | ✅ | Completo |
| Pagos locales (RF-30) | ✅ | ✅ | Completo |
| Historial/Kardex (RF-38) | ✅ | ✅ | Completo |
| Pruebas de carga Artillery (RF-54) | ✅ | — | Configurado |
| Kardex PDF (RF-31) | ⏳ | ✅ (UI lista) | Pendiente backend |
