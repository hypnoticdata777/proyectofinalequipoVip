# USF Portal — Sistema Escolar Integral

> Portal web para la gestión académica, inscripciones, calificaciones, pagos y notificaciones de la Universidad.

---

## Equipo VIP

| Integrante | Rol | Módulo |
|---|---|---|
| Carlos Sanchez | Líder Técnico | Módulo 1 — Backend (Auth, JWT, roles) |
| Luis Roberto Suarez | Frontend Lead | Módulo 1 — Frontend (Angular: login, dashboards, guards) |
| Ricardo Galindo | Backend Developer | Módulo 2 — Backend (inscripción, calificaciones, historial) |
| Eduardo Robles | Frontend Developer | Módulo 2 — Frontend (formularios de inscripción, actas, kardex) |
| Mariana Jimenez | Full-stack Developer | Módulo 3 — Completo (Stripe, PDF, Socket.io) |

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Angular 17+ (standalone components, lazy loading) |
| Backend | Node.js + Express.js |
| Base de datos | MongoDB (Mongoose como ODM) |
| Autenticación | Email + Password + JWT (bcrypt) |
| Tiempo real | Socket.io (notificaciones push — RF-22) |
| Pagos | Stripe (RF-30) |
| PDF | PDFKit (referencias bancarias — RF-31) |
| Testing | Jest (backend) + Karma/Jasmine (frontend) + Cypress (E2E) |
| CI/CD | GitHub Actions |
| Carga | Artillery.io (stress test — RF-54) |

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTE (Angular 17+)                 │
│  ┌──────────┐ ┌──────────┐ ┌────────────┐ ┌──────────┐ │
│  │   Auth   │ │Inscripción│ │Calificación│ │  Pagos   │ │
│  │ Módulo 1 │ │ Módulo 2  │ │  Módulo 2  │ │ Módulo 3 │ │
│  └────┬─────┘ └─────┬────┘ └─────┬──────┘ └────┬─────┘ │
│       └─────────────┴────────────┴──────────────┘       │
│                      API REST (HTTP + JWT)               │
└─────────────────────────────┬───────────────────────────┘
                              │
              ┌───────────────▼───────────────┐
              │      BACKEND (Express.js)      │
              │                               │
              │  ┌─────────┐  ┌────────────┐  │
              │  │  Rutas  │  │ Middleware  │  │
              │  │ /api/*  │  │ JWT + Roles │  │
              │  └────┬────┘  └────────────┘  │
              │       │                       │
              │  ┌────▼────┐  ┌────────────┐  │
              │  │Controler│  │  Servicios │  │
              │  └────┬────┘  └────────────┘  │
              │       │                       │
              │  ┌────▼────┐  ┌────────────┐  │
              │  │ Modelos │  │ Socket.io  │  │
              │  │Mongoose │  │(tiempo real│  │
              │  └────┬────┘  └────────────┘  │
              └───────┼───────────────────────┘
                      │
        ┌─────────────▼────────────┐
        │   MongoDB (Atlas/Local)  │
        │  users · materias        │
        │  inscripciones · pagos   │
        │  calificaciones          │
        │  notificaciones          │
        └──────────────────────────┘
                      │
        ┌─────────────▼────────────┐
        │    Servicios Externos    │
        │  Google OAuth 2.0        │
        │  Stripe API              │
        │  PDFKit (referencias)    │
        └──────────────────────────┘
```

---

## Estructura de Carpetas

```
usf-portal/
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── core/
│       │   │   ├── guards/           # AuthGuard, RoleGuard (RF-05)
│       │   │   ├── interceptors/     # JWT interceptor
│       │   │   └── services/         # AuthService, UserService
│       │   ├── shared/
│       │   │   └── components/       # Navbar, Loader, Modal, etc.
│       │   └── modules/
│       │       ├── auth/             # MÓDULO 1 — Login OAuth (RF-01)
│       │       ├── dashboard/        # MÓDULO 1 — Dashboard por rol
│       │       │   ├── alumno/
│       │       │   ├── profesor/
│       │       │   └── admin/
│       │       ├── inscripcion/      # MÓDULO 2 — Inscripción (RF-14, RF-15)
│       │       ├── calificaciones/   # MÓDULO 2 — Calificaciones (RF-20)
│       │       ├── historial/        # MÓDULO 2 — Kardex (RF-38)
│       │       ├── pagos/            # MÓDULO 3 — Stripe + PDF (RF-30, RF-31)
│       │       └── notificaciones/   # MÓDULO 3 — Socket.io (RF-22)
│       ├── environments/
│       └── assets/
│
├── backend/
│   └── src/
│       ├── config/                   # DB, Passport, Stripe config
│       ├── controllers/              # Lógica HTTP por recurso
│       ├── middleware/               # verifyToken.js, checkRole.js
│       ├── models/                   # Schemas de Mongoose
│       ├── routes/                   # Rutas Express /api/*
│       └── services/                 # Lógica de negocio
│
├── docs/
│   ├── 01_analisis/                  # MTR, User Stories, Glosario
│   ├── 02_diseno/                    # Arquitectura, Schemas, API Swagger
│   ├── 03_implementacion/            # Guías por módulo
│   ├── 04_pruebas/                   # Casos de prueba, reportes
│   └── 05_despliegue/                # CI/CD, Vercel, Railway, Atlas
│
├── .gitignore
└── README.md                         # Este archivo
```

---

## Módulos del Sistema

### Módulo 1 — Autenticación y Control de Acceso
**RFs cubiertos:** RF-01, RF-05  
**CPs cubiertos:** CP-01, CP-02, CP-03

Gestiona el flujo completo de registro/login con email y contraseña, generación de JWT y control de acceso por rol (alumno / profesor / admin). Las contraseñas se almacenan con hash bcrypt. **No se usa Google OAuth** para simplificar el entorno de desarrollo y evitar dependencias de credenciales externas.

**Flujo de autenticación:**
```
1. Usuario envía POST /api/auth/register con { nombre, email, password, rol }
2. Backend hashea la contraseña con bcrypt (salt 10)
3. Guarda el usuario en MongoDB
4. Devuelve JWT firmado con { id, rol, nombre }
   — o —
1. Usuario envía POST /api/auth/login con { email, password }
2. Backend verifica el hash bcrypt
3. Si es válido, firma y devuelve JWT
4. Angular guarda el token en localStorage
5. Cada request incluye el JWT en el header: Authorization: Bearer <token>
6. verifyToken.js valida el JWT → req.user disponible
7. checkRole.js verifica que el rol tenga permiso para esa ruta
```

**Endpoints:**
```
POST  /api/auth/register   → Registrar nuevo usuario
POST  /api/auth/login      → Iniciar sesión (devuelve JWT)
GET   /api/auth/me         → Perfil del usuario autenticado (requiere JWT)
POST  /api/auth/logout     → Cerrar sesión (client-side: eliminar token)
```

---

### Módulo 2 — Núcleo Académico
**RFs cubiertos:** RF-14, RF-15, RF-20, RF-38  
**CPs cubiertos:** CP-04, CP-05, CP-06, CP-07, CP-11

#### Sub-feature A: Inscripción de Materias (RF-14, RF-15)
Antes de confirmar cualquier inscripción, el backend ejecuta 4 validaciones en secuencia:
1. Verificar que no tenga adeudos financieros pendientes (CP-05)
2. Verificar cupo disponible en la materia (RF-15)
3. Verificar seriación completa (prerequisitos aprobados) (RF-15)
4. Verificar que no haya choques de horario (CP-06)

**Endpoints:**
```
GET   /api/materias              → Listado de materias disponibles
POST  /api/inscripciones         → Inscribir materias (con 4 validaciones)
GET   /api/inscripciones/:id     → Consultar inscripción
DELETE /api/inscripciones/:id    → Cancelar inscripción
```

#### Sub-feature B: Calificaciones (RF-20)
Las actas quedan bloqueadas una vez que el administrador cierra el periodo.

**Endpoints:**
```
GET   /api/calificaciones/:materiaId  → Ver calificaciones de un grupo
PUT   /api/calificaciones/:id         → Registrar notas (solo profesor, acta abierta)
```

#### Sub-feature C: Historial Académico / Kardex (RF-38)
```
GET   /api/historial/:alumnoId        → Kardex completo con promedios por periodo
```

---

### Módulo 3 — Finanzas, Notificaciones y Performance
**RFs cubiertos:** RF-22, RF-30, RF-31, RF-54  
**CPs cubiertos:** CP-08, CP-09, CP-10, CP-12

#### Sub-feature A: Pagos con Stripe (RF-30)
```
POST  /api/pagos/stripe          → Crear PaymentIntent en MXN
POST  /api/pagos/webhook         → Webhook de confirmación de Stripe
```

#### Sub-feature B: Referencias Bancarias PDF (RF-31)
Genera referencias SPEI/OXXO descargables usando PDFKit.
```
POST  /api/pagos/referencia      → Generar referencia + PDF (CP-10)
```

#### Sub-feature C: Notificaciones en Tiempo Real (RF-22)
Socket.io emite eventos al alumno cuando sus calificaciones son publicadas. Latencia objetivo: **< 2 segundos** (CP-08).

#### Sub-feature D: Prueba de Carga (RF-54)
Artillery simula 5000 usuarios concurrentes contra el endpoint de inscripciones (CP-12).

---

## Schemas de Base de Datos (MongoDB)

```javascript
// USERS
{ _id, googleId, nombre, apellido, email,
  rol: "alumno" | "profesor" | "admin",
  foto, matricula, activo, fechaCreacion }

// MATERIAS
{ _id, clave, nombre, creditos,
  cupoMaximo, cupoDisponible,
  horario: [{ dia, horaInicio, horaFin, salon }],
  seriacion: [materia_id],
  profesor_id, periodo, activa }

// INSCRIPCIONES
{ _id, alumno_id, periodo,
  materias: [materia_id],
  estado: "pendiente" | "confirmada" | "cancelada",
  fechaInscripcion }

// CALIFICACIONES
{ _id, alumno_id, materia_id, profesor_id,
  periodo, parcial1, parcial2, parcial3, final,
  cerrada: Boolean, fechaCierre }

// PAGOS
{ _id, alumno_id, concepto, monto,
  tipo: "colegiaturas" | "tramite",
  estado: "pendiente" | "pagado" | "fallido",
  metodo: "stripe" | "spei" | "oxxo",
  referencia, stripePaymentId, fecha }

// NOTIFICACIONES
{ _id, destinatario_id, titulo, mensaje,
  tipo: "calificacion" | "horario" | "pago",
  leida: Boolean, fecha }
```

---

## Variables de Entorno

Copia `.env.example` a `.env` y completa los valores:

```env
# Base de datos
MONGODB_URI=mongodb://localhost:27017/usf_portal

# Autenticación
JWT_SECRET=tu_secreto_muy_seguro_aqui
BCRYPT_SALT_ROUNDS=10

# Pagos
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Servidor
PORT=3000
NODE_ENV=development
```

---

## Convención de Commits

```
feat(módulo): descripción     → nueva funcionalidad
fix(módulo): descripción      → corrección de bug
docs: descripción             → solo documentación
test(módulo): descripción     → agregar pruebas
chore: descripción            → configuración, dependencias
```

**Ejemplo:**
```
feat(inscripcion): agrega validación de choques de horario (RF-15, CP-06)
```

---

## Branches del Proyecto

```
main        → código en producción (solo via PR desde develop)
develop     → integración de features
│
├── feature/modulo1-auth
├── feature/modulo1-dashboard
├── feature/modulo2-inscripcion
├── feature/modulo2-calificaciones
├── feature/modulo2-historial
├── feature/modulo3-pagos
└── feature/modulo3-notificaciones
```

---

## Cómo Configurar el Ambiente Local

```bash
# 1. Clonar el repo
git clone https://github.com/hypnoticdata777/proyectofinalequipoVip.git
cd proyectofinalequipoVip/usf-portal

# 2. Backend
cd backend
npm install
cp .env.example .env
# Editar .env y colocar la MONGODB_URI de tu cluster de Atlas
# Formato: mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/usf_portal
npm run dev            # Inicia en localhost:3000

# 3. Verificar conexión
# Deberías ver en consola: "MongoDB conectado" y "Servidor en puerto 3000"

# 4. Frontend (en otra terminal)
cd ../frontend
npm install
ng serve               # Inicia en localhost:4200
```

### Obtener la MONGODB_URI de Atlas

1. En Atlas → tu cluster → botón **Connect**
2. Seleccionar **Drivers**
3. Driver: **Node.js**, versión **5.5 or later**
4. Copiar la connection string y reemplazar `<password>` con tu contraseña de usuario de base de datos
5. Pegar en el `.env` como `MONGODB_URI=mongodb+srv://...`

---

## Requisitos

- Node.js 20 LTS
- Angular CLI (`npm install -g @angular/cli`)
- MongoDB Community o MongoDB Atlas
- Cuenta en MongoDB Atlas (free tier — crear cluster M0)
- Cuenta de Stripe (modo sandbox para desarrollo, opcional en fase inicial)

---

## Despliegue

| Capa | Plataforma |
|---|---|
| Frontend | Vercel o Firebase Hosting |
| Backend | Railway o Render |
| Base de datos | MongoDB Atlas (free tier 512 MB) |
| CI/CD | GitHub Actions |

---

## Tablero de Proyecto

El avance del proyecto se gestiona en el **GitHub Projects** de este repositorio.  
Columnas: `Backlog → En Progreso → En Revisión → Completado`

Cada Issue corresponde a un requerimiento funcional (RF) o caso de prueba (CP) de la MTR.
