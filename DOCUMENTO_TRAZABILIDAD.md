# PROYECTO FINAL: DOCUMENTACIÓN DE LA TRAZABILIDAD Y CONFIGURACIÓN DEL SOFTWARE

---

## 1. PORTADA

**Universidad:** Universidad Salud y Futuro (USF)
**Carrera:** Ingeniería en Sistemas Computacionales
**Asignatura:** Trazabilidad y Configuración de Software
**Título del Proyecto:** USF Portal — Sistema Escolar Integral
**Docente:** [Nombre del docente]
**Fecha de entrega:** Junio 2026

### Integrantes del Equipo VIP

| Nombre | Matrícula | Rol en el Proyecto |
|---|---|---|
| Carlos Sanchez | [Matrícula] | Líder Técnico — Backend Auth + JWT + Roles |
| Luis Roberto Suarez | [Matrícula] | Frontend Lead — Angular: login, dashboards, guards |
| Ricardo Galindo | [Matrícula] | Backend Developer — Inscripciones, calificaciones, historial |
| Eduardo Robles | [Matrícula] | Frontend Developer — Formularios de inscripción, actas, kardex |
| Mariana Jimenez | [Matrícula] | Full-stack Developer — Pagos, notificaciones SSE, SSE Manager |

---

## 2. INTRODUCCIÓN

### Problemática que resuelve el sistema

Las instituciones educativas enfrentan dificultades operativas al gestionar procesos académicos de forma manual o con sistemas desconectados: los alumnos no pueden inscribirse en línea, los profesores capturan calificaciones en formatos físicos, y las notificaciones de eventos importantes llegan con retraso o no llegan. La ausencia de un sistema centralizado genera duplicidad de datos, errores en registros y falta de trazabilidad en los procesos académicos.

### Objetivo general del proyecto

Desarrollar un portal web integral para la gestión académica de la institución USF que centralice los procesos de inscripción, calificaciones, pagos y notificaciones, garantizando seguridad, control de acceso por rol y comunicación en tiempo real entre los actores del sistema.

### Alcance del sistema

El sistema cubre los siguientes procesos:
- Autenticación y control de acceso por tres roles: alumno, profesor y administrador.
- Gestión de materias y asignación de profesores por parte del administrador.
- Inscripción de materias por parte del alumno, con validación automática de cupo, seriación, adeudos y choques de horario.
- Captura de calificaciones parciales y cierre de actas por parte de profesores y administradores.
- Consulta de historial académico (kardex) por parte del alumno.
- Gestión de pagos y adeudos.
- Notificaciones en tiempo real mediante Server-Sent Events (SSE).

### Importancia de la trazabilidad y configuración dentro del desarrollo del software

La trazabilidad permite relacionar cada requerimiento del sistema con su caso de uso, módulo de código y caso de prueba correspondiente, lo que facilita detectar si un requerimiento no fue implementado o si un cambio en el código afecta a otros elementos. En este proyecto, cada RF (Requerimiento Funcional) está vinculado a un endpoint de la API, un controlador backend y un componente Angular en el frontend.

La gestión de configuración garantiza que el equipo trabaje sobre una base de código controlada mediante Git y GitHub, con ramas diferenciadas para funcionalidades y un historial de commits que documenta la evolución del sistema. Sin este control, la integración de los cinco desarrolladores habría generado conflictos irrecuperables en el código.

---

## 3. DESCRIPCIÓN GENERAL DEL PROYECTO

- **Nombre del sistema:** USF Portal — Sistema Escolar Integral
- **Tipo de sistema:** Aplicación web full-stack
- **Usuarios involucrados:** Alumnos, profesores y administradores de la institución USF
- **Funcionalidades principales:**
  - Autenticación con JWT y control de acceso por rol
  - Inscripción de materias con cuatro validaciones automáticas
  - Captura y cierre de actas de calificaciones
  - Historial académico (kardex)
  - Gestión de pagos y adeudos
  - Notificaciones en tiempo real (SSE)
  - Pruebas de carga con Artillery.io
- **Tecnologías utilizadas:**
  - Frontend: Angular 17+ (standalone components, lazy loading)
  - Backend: Node.js + Express.js
  - Base de datos: MongoDB Atlas (Mongoose como ODM)
  - Autenticación: Email + contraseña + JWT (bcrypt)
  - Tiempo real: Server-Sent Events (SSE) — nativo del navegador
  - Pruebas de carga: Artillery.io
- **Arquitectura utilizada:** Arquitectura cliente-servidor REST con separación frontend/backend. El backend expone una API REST con rutas protegidas por JWT; el frontend Angular consume los endpoints y gestiona la sesión del usuario mediante localStorage.

---

## 4. GESTIÓN DE REQUERIMIENTOS

### Requerimientos Funcionales

| ID | Requerimiento |
|---|---|
| RF-01 | El sistema deberá permitir que cualquier usuario inicie sesión con email y contraseña. |
| RF-02 | El sistema deberá permitir el registro de nuevos usuarios asignando uno de tres roles: alumno, profesor o admin. |
| RF-03 | El sistema deberá permitir la recuperación de contraseña mediante el correo electrónico registrado. |
| RF-04 | El sistema deberá mostrar un dashboard diferente según el rol del usuario autenticado. |
| RF-05 | El sistema deberá controlar el acceso a los endpoints según el rol del usuario (alumno, profesor, admin). |
| RF-06 | El administrador deberá poder crear, actualizar y desactivar materias. |
| RF-07 | El administrador deberá poder asignar un profesor a cada materia. |
| RF-08 | El administrador deberá poder ver y cancelar todas las inscripciones activas. |
| RF-14 | El alumno deberá poder seleccionar y confirmar la inscripción de materias disponibles en su periodo. |
| RF-15 | El sistema deberá validar la inscripción verificando: ausencia de adeudos (CP-05), cupo disponible (CP-04), seriación completa (CP-03) y sin choque de horario (CP-06). |
| RF-20 | El profesor deberá poder capturar calificaciones de tres parciales y la calificación final para cada alumno de su grupo. |
| RF-21 | El administrador deberá poder cerrar un acta de calificaciones de forma irreversible. |
| RF-22 | El sistema deberá enviar notificaciones en tiempo real al alumno cuando el profesor registre o actualice una calificación. |
| RF-30 | El administrador deberá poder registrar pagos y confirmar su liquidación. |
| RF-31 | El sistema deberá generar un kardex en formato PDF para el alumno. |
| RF-38 | El alumno deberá poder consultar su historial académico completo (kardex) con resumen estadístico. |
| RF-54 | El sistema deberá soportar pruebas de carga configuradas con Artillery.io. |

### Requerimientos No Funcionales

| ID | Requerimiento |
|---|---|
| RNF-01 | El sistema deberá responder a las peticiones HTTP en menos de 3 segundos bajo carga normal. |
| RNF-02 | El sistema deberá autenticar a los usuarios mediante JSON Web Tokens (JWT) con expiración de 24 horas. |
| RNF-03 | Las contraseñas de los usuarios deberán almacenarse cifradas usando bcrypt con 10 rondas de sal. |
| RNF-04 | El sistema deberá implementar CORS para controlar el acceso desde el dominio del frontend. |
| RNF-05 | Los datos sensibles (URI de MongoDB, JWT_SECRET) deberán almacenarse en variables de entorno y no en el código fuente. |
| RNF-06 | El frontend deberá proteger las rutas privadas mediante guards de Angular (AuthGuard y RoleGuard). |
| RNF-07 | La base de datos no deberá eliminar registros físicamente; deberá implementar baja lógica con el campo `activo`. |
| RNF-08 | El sistema de notificaciones deberá funcionar sin librerías de terceros, usando SSE nativo del navegador. |

---

## 5. MATRIZ DE TRAZABILIDAD

| Requerimiento | Caso de Uso | Módulo / Archivo | Caso de Prueba |
|---|---|---|---|
| RF-01 | CU-01 Iniciar sesión | `auth.controller.js` → `login` / `auth/login` (Angular) | CP-01 |
| RF-02 | CU-02 Registrar usuario | `auth.controller.js` → `register` / `auth/login` (Angular) | CP-02 |
| RF-03 | CU-03 Recuperar contraseña | `auth.controller.js` → `resetPassword` / `auth/login` (Angular) | CP-03 |
| RF-04 | CU-04 Ver dashboard por rol | `dashboard/alumno`, `dashboard/profesor`, `dashboard/admin` (Angular) | CP-04 |
| RF-05 | CU-05 Control de acceso | `verifyToken.js`, `checkRole.js` | CP-05 |
| RF-06 | CU-06 Gestionar materias | `materias.controller.js` / `materias-admin` (Angular) | CP-06 |
| RF-14 | CU-07 Inscribir materias | `inscripcion.controller.js` / `inscripcion` (Angular) | CP-07 |
| RF-15 | CU-08 Validar inscripción | `inscripcion.service.js` (4 reglas) | CP-08, CP-09, CP-10, CP-11 |
| RF-20 | CU-09 Capturar calificaciones | `calificacion.controller.js` / `calificaciones` (Angular) | CP-12 |
| RF-21 | CU-10 Cerrar acta | `calificacion.controller.js` → `cerrar` / `calificaciones` (Angular) | CP-13 |
| RF-22 | CU-11 Notificar calificación | `sse-manager.js`, `notificaciones.controller.js` / `notificaciones` (Angular) | CP-14 |
| RF-30 | CU-12 Gestionar pagos | `pagos.controller.js`, `adeudo.controller.js` / `pagos` (Angular) | CP-15 |
| RF-38 | CU-13 Consultar kardex | `historial.controller.js` / `historial` (Angular) | CP-16 |
| RNF-02 | — | `verifyToken.js` (JWT), `auth.service.ts` (frontend) | CP-17 |
| RNF-03 | — | `auth.controller.js` → `bcrypt.hash()` | CP-18 |
| RNF-06 | — | `auth.guard.ts`, `role.guard.ts` (Angular) | CP-19 |

---

## 6. REFERENCIAS CRUZADAS

| Documento / ID | Relacionado con |
|---|---|
| RF-01 | CU-01, auth.controller.js (login), auth/login Angular, CP-01 |
| RF-02 | CU-02, auth.controller.js (register), auth/login Angular, CP-02 |
| RF-14 | CU-07, inscripcion.controller.js, inscripcion Angular, CP-07 |
| RF-15 | CU-08, inscripcion.service.js (CP-03/CP-04/CP-05/CP-06), CP-08 a CP-11 |
| RF-20 | CU-09, calificacion.controller.js, calificaciones Angular, CP-12 |
| RF-21 | CU-10, calificacion.controller.js (cerrar), CP-13 |
| RF-22 | CU-11, sse-manager.js, notificaciones.controller.js, notificaciones Angular, CP-14 |
| RF-38 | CU-13, historial.controller.js, historial Angular, CP-16 |
| RNF-02 | verifyToken.js, auth.service.ts, jwt.interceptor.ts, CP-17 |
| RNF-06 | auth.guard.ts, role.guard.ts, app.routes.ts, CP-19 |
| EC-01 | RF-01 a RF-38, RNF-01 a RNF-08 |
| EC-02 | RF-14, RF-15, RF-20, RF-30, RF-38 (MongoDB Atlas) |
| EC-03 | Todos los RF (Manual Técnico: USF_Portal_Manual_Tecnico.docx) |

---

## 7. ESQUEMA DE INDEXACIÓN

| Prefijo | Significado | Ejemplo |
|---|---|---|
| RF | Requerimiento Funcional | RF-14: Inscripción de materias |
| RNF | Requerimiento No Funcional | RNF-02: Autenticación JWT |
| CU | Caso de Uso | CU-07: Inscribir materias |
| CP | Caso de Prueba | CP-08: Inscripción sin cupo |
| EC | Elemento de Configuración | EC-01: Código fuente |
| SC | Solicitud de Cambio | SC-01: Recuperación de contraseña |
| DOC | Documento | DOC-01: README.md |
| MOD | Módulo | MOD-01: Auth backend |

---

## 8. USO DE LENGUAJES DE CONSULTA (QUERY)

El proyecto utiliza MongoDB Atlas como base de datos. Las consultas se realizan mediante **Mongoose** (ODM para Node.js). A continuación se presentan ejemplos de consultas reales utilizadas en el sistema:

### Consulta 1 — Buscar usuario por email (login)
```javascript
const user = await User.findOne({ email });
```
- **Objetivo:** Verificar si existe un usuario registrado con el email ingresado.
- **Resultado esperado:** Objeto User o `null` si no existe.
- **Utilidad:** Primer paso del proceso de autenticación (RF-01).

### Consulta 2 — Verificar pagos pendientes (CP-05)
```javascript
const adeudo = await Pago.findOne({ alumno_id: alumnoId, estado: 'pendiente' });
```
- **Objetivo:** Detectar si el alumno tiene adeudos antes de permitir la inscripción.
- **Resultado esperado:** Objeto Pago (bloquea inscripción) o `null` (permite continuar).
- **Utilidad:** Validación CP-05 del servicio de inscripción (RF-15).

### Consulta 3 — Verificar seriación aprobada (CP-03)
```javascript
const aprobadas = await Calificacion.find({
  alumno_id: alumnoId,
  materia_id: { $in: materia.seriacion },
  final: { $gte: 60 }
});
```
- **Objetivo:** Confirmar que el alumno aprobó todos los prerequisitos con calificación ≥ 60.
- **Resultado esperado:** Array de calificaciones aprobadas.
- **Utilidad:** Validación de seriación antes de inscribir (RF-15, CP-03).

### Consulta 4 — Listar profesores activos (admin)
```javascript
const profesores = await User.find({ rol: 'profesor', activo: true })
  .select('nombre apellido email');
```
- **Objetivo:** Obtener el catálogo de profesores disponibles para asignar a materias.
- **Resultado esperado:** Array de objetos con nombre, apellido y email.
- **Utilidad:** Panel de administración de materias (RF-07).

### Consulta 5 — Historial académico del alumno (kardex)
```javascript
const calificaciones = await Calificacion.find({ alumno_id: alumnoId })
  .populate('materia_id', 'nombre clave creditos');
```
- **Objetivo:** Recuperar todas las calificaciones del alumno enriquecidas con datos de la materia.
- **Resultado esperado:** Lista completa de materias cursadas con calificaciones.
- **Utilidad:** Generación del kardex académico (RF-38).

### Consulta 6 — Decrementar cupo al inscribir (CP-04)
```javascript
await Materia.findByIdAndUpdate(materiaId, { $inc: { cupoDisponible: -1 } });
```
- **Objetivo:** Reducir en 1 el cupo disponible de la materia al confirmar la inscripción.
- **Resultado esperado:** Materia actualizada con cupoDisponible decrementado.
- **Utilidad:** Garantizar que el cupo no se exceda (RF-14).

---

## 9. USO DE EXPRESIONES REGULARES

El sistema aplica las siguientes expresiones regulares para validación de datos:

### Regex 1 — Correo electrónico
```
^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$
```
- **Validación:** Formato válido de email con arroba y dominio.
- **Campo donde se aplica:** Campo `email` en el formulario de registro e inicio de sesión (Angular) y en el modelo `User.js` (Mongoose con `lowercase: true`).
- **Resultado esperado:** Acepta `usuario@usf.edu.mx`, rechaza `usuariosin.arroba`.

### Regex 2 — Contraseña segura
```
^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$
```
- **Validación:** Mínimo 8 caracteres, al menos una letra y un número.
- **Campo donde se aplica:** Campo `password` en el formulario de registro (Angular) y en la recuperación de contraseña.
- **Resultado esperado:** Acepta `MiClave1`, rechaza `solo123` (sin letras) o `sololetras` (sin número).

### Regex 3 — Matrícula de alumno
```
^[A-Z0-9]{6,10}$
```
- **Validación:** Matrícula alfanumérica en mayúsculas de 6 a 10 caracteres.
- **Campo donde se aplica:** Campo `matricula` en el modelo `User.js` durante el registro de alumnos.
- **Resultado esperado:** Acepta `USF2024A`, rechaza `abc` (demasiado corto) o `usf2024a` (minúsculas).

### Regex 4 — Formato de periodo académico
```
^\d{4}-[1-3]$
```
- **Validación:** Año de 4 dígitos seguido de guion y un número del 1 al 3 (cuatrimestres).
- **Campo donde se aplica:** Campo `periodo` en el modelo `Materia.js` y en las inscripciones.
- **Resultado esperado:** Acepta `2026-1`, rechaza `26-1` (año incompleto) o `2026-4` (cuatrimestre inválido).

### Regex 5 — Formato de hora (HH:MM)
```
^([01][0-9]|2[0-3]):[0-5][0-9]$
```
- **Validación:** Hora en formato 24 horas válido.
- **Campo donde se aplica:** Campos `horaInicio` y `horaFin` en el sub-esquema de horarios de `Materia.js`.
- **Resultado esperado:** Acepta `08:30`, `17:00`, rechaza `25:00` o `8:5` (formato inválido).

### Regex 6 — JWT Bearer token
```
^Bearer\s[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$
```
- **Validación:** Formato correcto del header `Authorization`.
- **Campo donde se aplica:** Middleware `verifyToken.js` al extraer el token del header HTTP.
- **Resultado esperado:** Acepta un JWT con tres segmentos separados por puntos, rechaza headers malformados.

### Regex 7 — Número de teléfono (México)
```
^[0-9]{10}$
```
- **Validación:** Número telefónico de exactamente 10 dígitos numéricos.
- **Campo donde se aplica:** Validación de datos de contacto de usuarios en el formulario de perfil.
- **Resultado esperado:** Acepta `5512345678`, rechaza `55-1234-5678` (con guiones) o `12345` (dígitos insuficientes).

---

## 10. GESTIÓN DE CONFIGURACIÓN DEL SOFTWARE

### Identificación de Elementos de Configuración

| ID | Elemento | Descripción |
|---|---|---|
| EC-01 | Código fuente | Todo el código en `/usf-portal/backend` y `/usf-portal/frontend` |
| EC-02 | Base de datos | MongoDB Atlas — colecciones: users, materias, inscripciones, calificaciones, pagos, adeudos, notificaciones |
| EC-03 | Documentación técnica | `README.md`, `PROGRESO.md`, `USF_Portal_Manual_Tecnico.docx` |
| EC-04 | Casos de prueba | Archivo `artillery.yml` (pruebas de carga RF-54) |
| EC-05 | Variables de entorno | `backend/.env` (no versionado) y `backend/.env.example` (versionado) |
| EC-06 | Dependencias | `package.json` / `package-lock.json` del backend y frontend |
| EC-07 | Configuración de build | `angular.json` con perfiles `development` y `production` |

### Control de Versiones

**Herramienta utilizada:** Git + GitHub
**Repositorio:** `https://github.com/hypnoticdata777/proyectofinalequipoVip`
**Estrategia de ramas:**
- `main` — rama principal con código estable
- `claude/zealous-albattani-1jot9r` — rama de desarrollo activo

### Historial de Versiones

| Versión (commit) | Descripción |
|---|---|
| v1.0 | Creación inicial del proyecto y estructura base de carpetas |
| v1.1 | Implementación de autenticación JWT, registro y login |
| v1.2 | Implementación del flujo de materias y calificaciones (`feat: completar flujo de materias y calificaciones`) |
| v1.3 | Corrección de errores CORS para permitir el frontend de producción (`Fix CORS`) |
| v1.4 | Implementación del flujo de recuperación de contraseña (`feat: agregar flujo de recuperacion de contrasena`) |
| v1.5 | Corrección de estructura HTML rota en componente de login (`fix: corregir estructura HTML rota en login.component`) |
| v1.6 | Documentación: guía completa de instalación local (`docs: agregar guia completa de instalacion local`) |
| v1.7 | Documentación: agregar endpoint reset-password a tabla de API (`docs: agregar endpoint reset-password`) |

### Solicitudes de Cambio

| ID | Cambio | Motivo | Impacto |
|---|---|---|---|
| SC-01 | Agregar recuperación de contraseña | Los usuarios olvidaban su contraseña y no había forma de recuperar el acceso | Nuevo endpoint `POST /api/auth/reset-password` y sección en el formulario de login |
| SC-02 | Corregir CORS para dominio de producción | El frontend en Vercel no podía comunicarse con el backend en Railway | Corrección del middleware de CORS para aceptar el dominio canónico de Vercel |
| SC-03 | Cambiar URL del backend en producción a ruta relativa `/api` | Las URLs absolutas hardcodeadas provocaban errores al desplegar en nuevos entornos | El frontend ahora usa la URL relativa y Vercel enruta al backend correctamente |
| SC-04 | Agregar campo `fileReplacements` en configuración de build de Angular | El build de producción no reemplazaba el archivo de entorno correctamente | Se corrigió `angular.json` para que el build siempre use `environment.prod.ts` |

---

## 11. EVIDENCIAS DEL REPOSITORIO

> **Nota:** Las capturas de pantalla deben tomarse directamente desde GitHub y adjuntarse al documento PDF final.

Las siguientes evidencias deben incluirse:

1. **Repositorio GitHub:** Pantalla principal mostrando la estructura de carpetas `usf-portal/backend` y `usf-portal/frontend`.
2. **Historial de commits:** Lista de commits en la rama `main` con mensajes descriptivos (feat, fix, docs).
3. **Ramas activas:** Vista de branches mostrando `main` y `claude/zealous-albattani-1jot9r`.
4. **Archivo .env.example:** Captura que evidencia que las variables sensibles NO están en el código fuente.
5. **Pull Requests (si aplica):** Evidencia de revisiones de código entre compañeros.

---

## 12. CASOS DE PRUEBA

| ID | Descripción | Datos de Entrada | Resultado Esperado |
|---|---|---|---|
| CP-01 | Inicio de sesión válido | Email y contraseña correctos | JWT retornado, redirección al dashboard según rol |
| CP-02 | Inicio de sesión con credenciales incorrectas | Email correcto, contraseña errónea | HTTP 401 — "Credenciales inválidas" |
| CP-03 | Registro de usuario nuevo | Nombre, apellido, email único, contraseña, rol | Usuario creado, JWT retornado (HTTP 201) |
| CP-04 | Registro con email duplicado | Email ya existente en la BD | HTTP 400 — "El email ya está registrado" |
| CP-05 | Inscripción sin adeudos y con cupo | Alumno sin pagos pendientes, materia disponible | Inscripción confirmada en la base de datos |
| CP-06 | Inscripción con adeudo pendiente (CP-05) | Alumno con pago en estado `pendiente` | HTTP 400 — "Tienes pagos pendientes" |
| CP-07 | Inscripción sin cupo disponible (CP-04) | Materia con `cupoDisponible = 0` | HTTP 400 — "No tiene cupo disponible" |
| CP-08 | Inscripción sin seriación completa (CP-03) | Alumno sin aprobar prerequisito con ≥ 60 | HTTP 400 — "No cumples los prerequisitos" |
| CP-09 | Inscripción con choque de horario (CP-06) | Dos materias con mismo día y horario solapado | HTTP 400 — "Choque de horario el día X" |
| CP-10 | Captura de calificación por profesor | parcial1=85, parcial2=90, parcial3=78 | Calificación guardada, notificación SSE enviada al alumno |
| CP-11 | Cierre de acta por administrador | Acta con calificaciones capturadas | Acta marcada como `cerrada = true`, irreversible |
| CP-12 | Consulta de historial/kardex | Alumno autenticado | Lista de materias cursadas con calificaciones y resumen estadístico |
| CP-13 | Acceso a ruta privada sin token | GET /api/materias sin Authorization header | HTTP 401 — "Token requerido" |
| CP-14 | Acceso a ruta de admin con rol alumno | PUT /api/materias/:id con token de alumno | HTTP 403 — "Acceso denegado: rol insuficiente" |
| CP-15 | Notificación SSE en tiempo real | Profesor guarda calificación mientras alumno tiene sesión activa | Alumno recibe evento SSE sin recargar la página |

---

## 13. CONCLUSIONES

### Carlos Sanchez — Líder Técnico

Durante el desarrollo del backend de autenticación aprendí la importancia de separar la lógica de autenticación de la lógica de autorización. La implementación de JWT me enseñó que la seguridad no depende solo de cifrar contraseñas, sino de controlar el acceso a cada recurso mediante middlewares bien definidos. La trazabilidad fue clave para asegurar que cada endpoint estuviera cubierto por al menos un caso de prueba, evitando que funcionalidades quedaran sin verificar. La mayor dificultad fue la configuración correcta de CORS entre Vercel y Railway, lo que requirió varias iteraciones documentadas en el historial de commits.

### Luis Roberto Suarez — Frontend Lead

Trabajar en el frontend con Angular 17 me permitió comprender cómo los guards de ruta protegen la experiencia del usuario de la misma forma que los middlewares protegen el backend. La gestión de configuración con Git fue fundamental para integrar el trabajo de cinco desarrolladores sin perder cambios. La trazabilidad me ayudó a verificar que cada RF tuviera su componente Angular correspondiente. La dificultad principal fue el manejo del interceptor JWT y la sincronización del token entre los servicios del frontend.

### Ricardo Galindo — Backend Developer

Implementar el servicio de inscripción con cuatro validaciones encadenadas me enseñó el valor de separar la lógica de negocio en una capa de servicio independiente. Gracias a la trazabilidad pude identificar que RF-15 se vinculaba directamente con cuatro casos de prueba distintos (CP-05, CP-04, CP-03, CP-06), lo que me obligó a probar cada validación de forma aislada antes de integrarlas. La gestión de configuración evitó que se perdiera código durante las integraciones simultáneas del equipo.

### Eduardo Robles — Frontend Developer

Desarrollar los formularios de inscripción, las actas de calificaciones y el kardex en Angular me permitió comprender cómo el frontend es el punto donde el usuario interactúa con cada requerimiento funcional. Cada formulario que construí corresponde directamente a un RF y a un endpoint de la API, lo que hace que la trazabilidad sea visible de forma inmediata. La mayor dificultad fue manejar los estados reactivos del formulario de inscripción, donde la selección de materias debe actualizarse en tiempo real para reflejar el cupo disponible. La gestión de configuración con Git me permitió trabajar en mis componentes sin interferir con el backend que desarrollaban mis compañeros.

### Mariana Jimenez — Full-stack Developer

Implementar el sistema de notificaciones en tiempo real con SSE (Server-Sent Events) sin librerías externas fue la parte más retadora del proyecto. Aprendí que la trazabilidad es esencial cuando una funcionalidad cruza múltiples capas: RF-22 involucra el controlador de calificaciones en el backend, el gestor de conexiones SSE, el servicio de notificaciones en Angular y el componente de bandeja de entrada. Sin una matriz de trazabilidad clara habría sido muy difícil depurar por qué las notificaciones no llegaban. La gestión de configuración con variables de entorno fue crítica para que el SSE funcionara correctamente tanto en desarrollo local como en producción.

---

## 14. REFERENCIAS BIBLIOGRÁFICAS

Chacon, S., y Straub, B. (2014). *Pro Git* (2.a ed.). Apress. https://git-scm.com/book/es/v2

IEEE. (2017). *IEEE Standard for Configuration Management in Systems and Software Engineering* (IEEE Std 828-2012). IEEE.

Pressman, R. S., y Maxim, B. R. (2021). *Ingeniería del software: Un enfoque práctico* (8.a ed.). McGraw-Hill Education.

MongoDB, Inc. (2024). *Mongoose Documentation*. https://mongoosejs.com/docs/

OpenJS Foundation. (2024). *Node.js Documentation*. https://nodejs.org/docs/

Google LLC. (2024). *Angular Documentation*. https://angular.dev/docs

Auth0. (2024). *JSON Web Tokens Introduction*. https://jwt.io/introduction

OWASP Foundation. (2024). *OWASP Top 10*. https://owasp.org/www-project-top-ten/

Sommerville, I. (2015). *Software Engineering* (10.a ed.). Pearson.

Artillery.io. (2024). *Artillery Documentation*. https://www.artillery.io/docs
