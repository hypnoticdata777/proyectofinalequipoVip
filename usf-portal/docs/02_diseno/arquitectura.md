# Documento de Arquitectura del Sistema
## USF Portal — Universidad Santa Fe

---

## 1. Visión General

El USF Portal es un sistema de gestión escolar de dos capas: un backend API REST en Node.js/Express y un frontend SPA en Angular 17. Se comunican mediante HTTP con autenticación JWT.

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENTE (Navegador Web)                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Angular 17 SPA (Frontend)                      │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │ │
│  │  │  Auth    │  │ Inscr.   │  │  Califs. │  │ Historial│  │ │
│  │  │  Module  │  │  Module  │  │  Module  │  │  Module  │  │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │     Core: AuthService, ApiService, Guards, JWT      │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS + JWT Bearer Token
┌──────────────────────────▼──────────────────────────────────────┐
│                    SERVIDOR (Node.js + Express)                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  Middleware Layer                         │    │
│  │   verifyToken.js │ checkRole.js │ cors │ express.json   │    │
│  └──────────────────────────┬──────────────────────────────┘    │
│                             │                                    │
│  ┌──────────┐ ┌──────────┐ │ ┌──────────┐ ┌──────────────┐    │
│  │  /auth   │ │/materias │ │ │/inscripc.│ │/calificacion.│    │
│  │  Routes  │ │  Routes  │ │ │  Routes  │ │    Routes    │    │
│  └────┬─────┘ └────┬─────┘ │ └────┬─────┘ └──────┬───────┘    │
│       │            │       │      │               │             │
│  ┌────▼─────────────▼───────▼──────▼───────────────▼────────┐  │
│  │                    Controllers Layer                        │  │
│  └────────────────────────────┬───────────────────────────────┘  │
│                               │                                   │
│  ┌────────────────────────────▼───────────────────────────────┐  │
│  │               Services Layer (Business Logic)               │  │
│  │                   inscripcion.service.js                    │  │
│  └────────────────────────────┬───────────────────────────────┘  │
│                               │                                   │
│  ┌────────────────────────────▼───────────────────────────────┐  │
│  │                    Models Layer (Mongoose)                   │  │
│  │   User │ Materia │ Inscripcion │ Calificacion │ Adeudo      │  │
│  └────────────────────────────┬───────────────────────────────┘  │
└──────────────────────────────┬─────────────────────────────────┘
                               │ mongoose ODM
┌──────────────────────────────▼─────────────────────────────────┐
│                    MongoDB (Base de Datos)                       │
│   users │ materias │ inscripciones │ calificaciones │ adeudos   │
└─────────────────────────────────────────────────────────────────┘

Servicios Externos:
┌─────────────────┐     ┌─────────────────┐
│  Google OAuth   │◄────│   Passport.js   │
│  2.0 API        │     │  Strategy       │
└─────────────────┘     └─────────────────┘
```

---

## 2. Descripción de Capas

### 2.1 Frontend (Angular 17)

- **Standalone Components**: Sin NgModules, cada componente es autónomo con sus propias dependencias
- **Lazy Loading**: Cada módulo se carga bajo demanda para optimizar el tiempo de carga inicial
- **Core Module**: Servicios singleton (AuthService, ApiService), Guards funcionales, HTTP Interceptor JWT
- **Feature Modules**: auth, dashboard, inscripcion, calificaciones, historial

### 2.2 Backend (Node.js + Express)

- **Routes Layer**: Define endpoints REST y aplica middleware de autenticación/autorización
- **Controllers Layer**: Maneja requests HTTP, valida input, llama a services y modelos
- **Services Layer**: Lógica de negocio compleja (validación de inscripción con 4 reglas)
- **Models Layer**: Schemas de Mongoose con validaciones, virtuals y pre-save hooks

### 2.3 Base de Datos (MongoDB)

- **ODM**: Mongoose para modelado y validación
- **Índices únicos**: googleId, email, matricula
- **Timestamps**: Todos los schemas tienen `timestamps: true` (createdAt, updatedAt)

---

## 3. Decisiones Técnicas

| Decisión | Alternativas Consideradas | Justificación |
|----------|--------------------------|---------------|
| Google OAuth 2.0 | Username/Password, Facebook Login | Usuarios ya tienen cuenta institucional Google; elimina gestión de contraseñas |
| JWT stateless | Sessions con cookies | Mejor escalabilidad; no requiere almacenamiento de sesión en servidor |
| MongoDB | PostgreSQL, MySQL | Flexibilidad de schemas; buena integración con Node.js via Mongoose |
| Angular 17 standalone | React, Vue, Angular <17 | Equipo familiarizado con Angular; standalone components reducen boilerplate |
| PDFKit | jsPDF, Puppeteer | Generación server-side; no requiere browser; menor overhead |

---

## 4. Flujo de Autenticación Google OAuth 2.0

```
Usuario           Frontend (Angular)        Backend (Express)         Google
  │                     │                        │                      │
  │  Clic "Login"       │                        │                      │
  │────────────────────►│                        │                      │
  │                     │  GET /api/auth/google  │                      │
  │                     │───────────────────────►│                      │
  │                     │                        │  Redirect a Google   │
  │                     │◄───────────────────────│─────────────────────►│
  │  Redirect a Google  │                        │                      │
  │◄────────────────────│                        │                      │
  │                     │                        │                      │
  │  Usuario autentica en Google                 │                      │
  │─────────────────────────────────────────────────────────────────────►
  │                     │                        │  Código OAuth        │
  │◄─────────────────────────────────────────────────────────────────────
  │  Callback con código│                        │                      │
  │────────────────────────────────────────────►│                      │
  │                     │                        │  Exchange código     │
  │                     │                        │──────────────────────►
  │                     │                        │  Access Token + perfil│
  │                     │                        │◄─────────────────────│
  │                     │                        │  Buscar/crear User en MongoDB
  │                     │                        │  Generar JWT         │
  │                     │  Redirect con ?token=  │                      │
  │◄────────────────────────────────────────────│                      │
  │                     │                        │                      │
  │  /auth/callback     │                        │                      │
  │────────────────────►│                        │                      │
  │                     │  Guardar token en localStorage               │
  │                     │  Decodificar JWT → obtener rol               │
  │                     │  Navegar a /dashboard/{rol}                  │
  │◄────────────────────│                        │                      │
```

---

## 5. Seguridad

- **JWT**: Firmado con `JWT_SECRET` (mínimo 64 caracteres), expiración configurable
- **CORS**: Solo permite origin configurado en `FRONTEND_URL`
- **RBAC**: Middleware `checkRole()` en cada ruta protegida
- **Variables de entorno**: Ningún valor sensible hardcodeado
- **Mongoose**: Validaciones a nivel de schema previenen datos malformados
