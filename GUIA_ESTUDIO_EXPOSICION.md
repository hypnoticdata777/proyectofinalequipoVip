# GUIA DE ESTUDIO — EXPOSICION FINAL
## USF Portal — Sistema Escolar Integral
### Trazabilidad y Configuración de Software

---

# PARTE 1: LO QUE CADA QUIEN TIENE QUE SABER

## CARLOS SANCHEZ — Líder Técnico / Backend Auth + JWT + Roles

**Archivos de tu responsabilidad:**
- `backend/src/controllers/auth.controller.js`
- `backend/src/middleware/verifyToken.js`
- `backend/src/middleware/checkRole.js`
- `backend/src/models/User.js`
- `backend/src/routes/auth.routes.js`

**Lo que tienes que saber explicar:**

1. **¿Cómo funciona el login?**
   - El usuario manda email + contraseña al endpoint `POST /api/auth/login`
   - El controlador busca al usuario en MongoDB con `User.findOne({ email })`
   - Compara la contraseña usando `bcrypt.compare(password, user.password)`
   - Si es válido, genera un JWT con `jwt.sign({ id, rol, nombre }, JWT_SECRET, { expiresIn: '24h' })`
   - Retorna el token al cliente

2. **¿Qué es un JWT y qué contiene el tuyo?**
   - JSON Web Token — tiene 3 partes: header.payload.signature
   - Tu payload contiene: `{ id, rol, nombre }` + fecha de expiración (24h)
   - Se firma con `JWT_SECRET` del `.env`

3. **¿Cómo funciona `verifyToken.js`?**
   - Extrae el token del header `Authorization: Bearer <token>`
   - Lo verifica con `jwt.verify(token, process.env.JWT_SECRET)`
   - Si es válido agrega `req.user = decoded` (con id, rol, nombre) para los siguientes middlewares
   - Si es inválido o expirado retorna HTTP 401

4. **¿Cómo funciona `checkRole.js`?**
   - Recibe roles permitidos: `checkRole('admin')` o `checkRole('admin', 'profesor')`
   - Verifica que `req.user.rol` esté dentro de los roles permitidos
   - Si no está, retorna HTTP 403 — "Acceso denegado: rol insuficiente"

5. **¿Por qué las contraseñas se hashean con bcrypt?**
   - Para que si la base de datos es comprometida, las contraseñas no sean legibles
   - bcrypt usa 10 rondas de sal → el mismo password genera hashes diferentes cada vez
   - `bcrypt.compare()` compara el texto plano con el hash sin necesidad de desencriptar

6. **¿Por qué usas baja lógica (`activo: true/false`) en lugar de eliminar usuarios?**
   - Para conservar el historial académico (calificaciones, inscripciones)
   - Eliminar físicamente rompería las referencias en otras colecciones

**Preguntas trampa que puede hacer el profesor:**
- "¿Qué pasa si el JWT_SECRET cambia?" → Todos los tokens existentes se invalidan porque la firma ya no coincide.
- "¿Por qué el token expira en 24 horas?" → Por seguridad: si un token es robado, solo es válido un día.
- "¿Puedes invalidar un JWT antes de que expire?" → No directamente (no hay estado), se necesitaría una blacklist en BD.

---

## LUIS ROBERTO SUAREZ — Frontend Lead / Angular: login, dashboards, guards

**Archivos de tu responsabilidad:**
- `frontend/src/app/core/guards/auth.guard.ts`
- `frontend/src/app/core/guards/role.guard.ts`
- `frontend/src/app/core/interceptors/jwt.interceptor.ts`
- `frontend/src/app/core/services/auth.service.ts`
- `frontend/src/app/modules/auth/login/`
- `frontend/src/app/modules/dashboard/` (alumno, profesor, admin)

**Lo que tienes que saber explicar:**

1. **¿Qué hace `AuthGuard`?**
   - Verifica si hay un token válido en localStorage antes de permitir acceso a una ruta privada
   - Si no hay token, redirige a `/auth/login`
   - Protege rutas como `/dashboard/alumno`, `/inscripcion`, `/historial`

2. **¿Qué hace `RoleGuard`?**
   - Verifica además del token, que el rol del usuario sea el permitido para esa ruta
   - Por ejemplo: `/calificaciones` solo puede entrar un profesor o admin

3. **¿Qué hace `jwt.interceptor.ts`?**
   - Intercepta TODAS las peticiones HTTP salientes de Angular
   - Agrega automáticamente el header `Authorization: Bearer <token>` si hay sesión activa
   - Maneja el error 401: si el backend rechaza el token, cierra la sesión y redirige al login

4. **¿Por qué hay dashboards diferentes para cada rol?**
   - `dashboard/alumno` → muestra materias inscritas, calificaciones, notificaciones
   - `dashboard/profesor` → muestra grupos asignados, acceso a calificaciones
   - `dashboard/admin` → gestión de materias, inscripciones, pagos, profesores

5. **¿Qué son los standalone components de Angular 17?**
   - Componentes que no necesitan pertenecer a un NgModule
   - Se declaran con `standalone: true` y sus imports van directo en el componente
   - Permiten lazy loading más granular

**Preguntas trampa:**
- "¿Qué pasa si alguien borra el token de localStorage y recarga?" → AuthGuard lo detecta en la siguiente navegación y redirige al login.
- "¿Por qué el interceptor es necesario si podrías poner el token en cada llamada manualmente?" → Para no repetir código en cada servicio; el interceptor lo hace centralizado y automático.

---

## RICARDO GALINDO — Backend Developer / Inscripciones, calificaciones, historial

**Archivos de tu responsabilidad:**
- `backend/src/services/inscripcion.service.js`
- `backend/src/controllers/inscripcion.controller.js`
- `backend/src/controllers/calificacion.controller.js`
- `backend/src/controllers/historial.controller.js`
- `backend/src/models/Inscripcion.js`
- `backend/src/models/Calificacion.js`

**Lo que tienes que saber explicar:**

1. **Las 4 validaciones de inscripción (RF-15) — ESTO ES LO MÁS IMPORTANTE:**
   - **CP-05:** No puede inscribirse si tiene pagos pendientes → `Pago.findOne({ alumno_id, estado: 'pendiente' })`
   - **CP-04:** La materia debe tener `cupoDisponible > 0`
   - **CP-03:** El alumno debe tener aprobados todos los prerequisitos (`seriacion[]`) con calificación `final >= 60`
   - **CP-06:** El horario de la nueva materia no puede solaparse con materias ya inscritas

2. **¿Por qué la lógica de validación está en `inscripcion.service.js` y no en el controlador?**
   - Separación de responsabilidades: el controlador solo recibe la solicitud y llama al servicio
   - El servicio contiene las reglas de negocio (igual que el Service del proyecto Java del otro profe)
   - Así las validaciones se pueden reutilizar desde otros lugares sin duplicar código

3. **¿Cómo se detecta el choque de horario?**
   - Dos horarios se solapan si: `inicio1 < fin2 AND inicio2 < fin1`
   - Se itera sobre todas las materias ya inscritas y se compara día y horas

4. **¿Qué hace el historial/kardex?**
   - Consulta todas las `Calificacion` del alumno y hace populate con los datos de `Materia`
   - Calcula el promedio general y el total de créditos cursados
   - Retorna un resumen estadístico (RF-38)

5. **¿Qué pasa cuando se confirma una inscripción?**
   - Se decrementa `cupoDisponible` de cada materia con `$inc: { cupoDisponible: -1 }`
   - Se crea el documento `Inscripcion` en MongoDB

**Preguntas trampa:**
- "¿Qué pasa si dos alumnos intentan inscribirse al mismo tiempo en la última plaza?" → Race condition: MongoDB no garantiza atomicidad aquí. La solución robusta sería una transacción.
- "¿Por qué `validarInscripcion` y `ejecutarInscripcion` son dos funciones distintas?" → Para poder probar las validaciones sin crear datos en la BD.

---

## EDUARDO ROBLES — Frontend Developer / Formularios de inscripción, actas, kardex

**Archivos de tu responsabilidad:**
- `frontend/src/app/modules/inscripcion/` — Formulario de inscripción de materias
- `frontend/src/app/modules/calificaciones/calificaciones-alumno/` — Vista de actas del alumno
- `frontend/src/app/modules/historial/` — Kardex académico

**Lo que tienes que saber explicar:**

### Módulo 1 — Inscripción (`/inscripcion`)

**¿Qué hace este componente?**
- Muestra al alumno las materias disponibles del periodo actual (consumiendo `GET /api/materias?periodo=2026-1`)
- El alumno selecciona las materias que quiere inscribir
- Al confirmar, se llama a `POST /api/inscripciones` con los IDs de las materias seleccionadas
- Si alguna validación falla (adeudo, cupo, seriación, horario), el backend retorna HTTP 400 con un mensaje claro que el frontend muestra al usuario

**¿Cómo sabe el componente qué materias mostrar?**
- Llama a `api.service.ts` que hace `GET /api/materias` con el JWT en el header (lo pone el interceptor automáticamente)
- Filtra las materias por el periodo activo
- Muestra el cupo disponible de cada una para que el alumno sepa si hay lugar

**¿Qué pasa si la inscripción falla?**
- El backend retorna HTTP 400 con un mensaje específico (ej: "Tienes pagos pendientes")
- El frontend captura el error en el `catch` del Observable de Angular
- Muestra el mensaje en la interfaz sin recargar la página

**¿Cómo se maneja el estado de "ya inscrito"?**
- Al cargar el componente, se hace `GET /api/inscripciones/mi-inscripcion` para ver si el alumno ya tiene inscripción activa en el periodo
- Si ya tiene, se muestra la inscripción confirmada y se oculta el formulario de selección

### Módulo 2 — Calificaciones del alumno (`/calificaciones/alumno`)

**¿Qué hace este componente?**
- Muestra al alumno sus calificaciones de todas las materias inscritas
- Consume `GET /api/calificaciones/mis-calificaciones` (solo accesible con rol alumno)
- Muestra parcial1, parcial2, parcial3 y la calificación final por materia
- Si el acta está cerrada (`cerrada: true`), muestra una etiqueta visual de "Acta cerrada"

**¿Cómo sabe en tiempo real que el profesor actualizó sus calificaciones?**
- El servicio `notificaciones.service.ts` abre una conexión `EventSource` al endpoint `GET /api/notificaciones/stream?token=...`
- Cuando el profesor guarda una calificación, el backend emite un evento SSE a través de `sse-manager.js`
- El componente de notificaciones recibe el evento y muestra una alerta sin que el alumno recargue la página

**¿Por qué el token va en la query string del SSE en lugar del header?**
- El navegador no permite agregar headers personalizados a `EventSource` — es una limitación del API nativo
- Por eso el token se pasa como query param: `?token=<jwt>`
- Esta es una excepción válida al patrón general (donde el interceptor agrega el header)

### Módulo 3 — Historial / Kardex (`/historial`)

**¿Qué hace este componente?**
- Muestra el historial académico completo del alumno
- Consume `GET /api/historial/:alumnoId` (accesible con cualquier rol JWT)
- Muestra: todas las materias cursadas, calificación final, créditos, periodo
- Incluye un resumen estadístico: promedio general, total de créditos aprobados
- En el futuro mostrará un botón para descargar el kardex en PDF (RF-31, pendiente backend)

**¿Cómo obtiene el alumnoId?**
- Se toma de `auth.service.ts` que tiene el usuario decodificado del JWT
- `this.authService.getUser().id` → se pasa a la llamada de la API

### Preguntas que el profesor TE puede hacer a TI, Eduardo

**Preguntas técnicas:**
1. "¿Cómo maneja Angular el token JWT entre solicitudes?" → El `jwt.interceptor.ts` lo agrega automáticamente a todas las solicitudes HTTP.
2. "¿Qué endpoint llama tu componente de inscripción cuando el alumno confirma?" → `POST /api/inscripciones` con el array de IDs de materias seleccionadas.
3. "¿Qué pasa si el cupo llega a cero entre que el alumno ve la materia y la inscribe?" → El backend valida en el momento de la inscripción; retorna HTTP 400 y el frontend muestra el error.
4. "¿Por qué el componente de historial puede verlo cualquier rol (alumno, profesor, admin)?" → Porque el endpoint tiene el guard `verifyToken` pero no `checkRole`, por lo que cualquier usuario autenticado puede acceder.
5. "¿Cómo sabes cuándo mostrar 'Acta cerrada' en las calificaciones?" → El objeto `Calificacion` tiene el campo booleano `cerrada`; si es `true`, el componente muestra la etiqueta visual.
6. "¿Qué es un Observable de Angular y por qué lo usas?" → Es un flujo de datos asíncrono de RxJS que permite suscribirse a la respuesta de la API. Se usa porque las llamadas HTTP son asíncronas y pueden emitir valores, errores o completarse.
7. "¿Qué hace el guard `AuthGuard` en la ruta de inscripción?" → Verifica que haya un token válido en localStorage antes de mostrar el componente. Si no hay sesión, redirige al login.
8. "¿Cómo muestras las materias disponibles y cómo filtras las del periodo actual?" → Consumo `GET /api/materias` y el backend acepta un query param `?periodo=` para filtrar.

**Preguntas de arquitectura (generales):**
9. "¿Por qué la lógica de validación de inscripción está en el backend y no en el frontend?" → El frontend puede ser manipulado; las validaciones críticas deben estar en el servidor.
10. "¿Qué es la trazabilidad y cómo aplica a tu módulo?" → Significa que puedo seguir RF-14 (inscripción) desde el requerimiento hasta el componente Angular, pasando por el controlador, el servicio y el caso de prueba CP-05/CP-07.

---

## MARIANA JIMENEZ — Full-stack Developer / Pagos, notificaciones SSE, SSE Manager

**Archivos de tu responsabilidad:**
- `backend/src/controllers/pagos.controller.js`
- `backend/src/controllers/adeudo.controller.js`
- `backend/src/controllers/notificaciones.controller.js`
- `backend/src/utils/sse-manager.js`
- `frontend/src/app/modules/pagos/`
- `frontend/src/app/modules/notificaciones/`
- `frontend/src/app/core/services/notificaciones.service.ts`

**Lo que tienes que saber explicar:**

1. **¿Qué es SSE (Server-Sent Events) y en qué se diferencia de WebSockets?**
   - SSE: conexión unidireccional del servidor al cliente (push)
   - WebSockets: bidireccional (el cliente también puede enviar mensajes)
   - SSE es nativo del navegador, usa HTTP normal, no necesita librerías
   - Para este caso es suficiente porque solo el servidor notifica al cliente

2. **¿Cómo funciona el SSE Manager?**
   - `sse-manager.js` mantiene un mapa `{ alumnoId → [lista de conexiones res activas] }`
   - Cuando un alumno abre la app, el navegador llama `EventSource('/api/notificaciones/stream?token=...')`
   - El servidor guarda esa conexión `res` en el mapa
   - Cuando el profesor guarda una calificación, `emitirAUsuario(alumnoId, datos)` escribe en todas las conexiones activas de ese alumno
   - Si el alumno cierra el navegador, el evento `close` del request limpia la conexión del mapa

3. **¿Cómo funciona la gestión de pagos?**
   - Admin crea un pago con `POST /api/pagos` (genera referencia automática)
   - Admin confirma el pago con `PUT /api/pagos/:id/pagar`
   - Si un alumno tiene un pago en estado `pendiente`, el servicio de inscripción lo bloquea (CP-05)
   - Los adeudos son similares: `POST /api/adeudos` y `PUT /api/adeudos/:id/pagado`

**Preguntas trampa:**
- "¿Qué pasa si el alumno tiene múltiples pestañas abiertas?" → El SSE Manager guarda múltiples conexiones por alumnoId; el evento se envía a todas.
- "¿Por qué no usaste Socket.io?" → El proyecto no lo requiere porque la comunicación es solo del servidor al cliente; SSE nativo es más simple y no agrega dependencias.

---

# PARTE 2: LO QUE TODOS DEBEN SABER (ARQUITECTURA GENERAL)

Estas preguntas las puede hacer el profesor a cualquier integrante:

## Arquitectura del Sistema

**"Explica la arquitectura del proyecto"**
- Es una arquitectura cliente-servidor REST
- **Frontend:** Angular 17 (componentes standalone, lazy loading, guards)
- **Backend:** Node.js + Express.js con estructura MVC (routes → controller → service → model)
- **Base de datos:** MongoDB Atlas con Mongoose
- La comunicación frontend-backend es via HTTP + JWT en el header Authorization

## Trazabilidad

**"¿Qué es la trazabilidad en software?"**
- Es la capacidad de seguir un requerimiento desde su origen hasta su implementación y prueba
- Ejemplo: RF-15 (validaciones de inscripción) → `inscripcion.service.js` → casos de prueba CP-05, CP-04, CP-03, CP-06

**"¿Cómo aplicaron la trazabilidad en su proyecto?"**
- Cada RF tiene un ID único (RF-01, RF-14, etc.)
- Cada RF se mapeó a un endpoint de la API, un controlador/servicio backend y un componente frontend
- Cada RF tiene al menos un caso de prueba (CP-XX)
- Esto está documentado en la Matriz de Trazabilidad del documento

## Gestión de Configuración

**"¿Qué herramientas de control de versiones usaron?"**
- Git + GitHub
- Rama `main` para código estable
- Ramas de feature para desarrollo
- Commits descriptivos con prefijos: `feat:`, `fix:`, `docs:`

**"¿Cómo evitaron que las credenciales se subieran al repositorio?"**
- Variables de entorno en `backend/.env` (ignorado por `.gitignore`)
- El repositorio solo contiene `backend/.env.example` con valores de ejemplo
- El JWT_SECRET y la URI de MongoDB nunca están en el código fuente

## Preguntas Generales que Puede Hacer el Profesor

1. **"¿Qué es MongoDB y en qué se diferencia de MySQL?"** → MongoDB es una base de datos NoSQL orientada a documentos (JSON/BSON); MySQL es relacional con tablas y SQL. MongoDB es más flexible para esquemas variables.

2. **"¿Qué es un middleware en Express?"** → Es una función que se ejecuta entre que llega la solicitud y que el controlador la procesa. Ejemplo: `verifyToken` verifica el JWT antes de que el endpoint responda.

3. **"¿Por qué usaron JWT en lugar de sesiones?"** → JWT es stateless: el servidor no necesita guardar estado de sesión. Es ideal para APIs REST y para escalar horizontalmente.

4. **"¿Qué es la baja lógica?"** → Marcar un registro como `activo: false` en lugar de eliminarlo físicamente, para conservar el historial e integridad referencial.

5. **"¿Qué es CORS y por qué tuvieron problemas con ello?"** → CORS (Cross-Origin Resource Sharing) es un mecanismo de seguridad del navegador que bloquea peticiones de un dominio a otro. Tuvieron que configurar el backend para aceptar peticiones desde el dominio de Vercel (frontend) al backend en Railway.

6. **"¿Qué es bcrypt y para qué sirve?"** → Es un algoritmo de hashing diseñado para contraseñas. Aplica múltiples rondas de sal, haciendo que los ataques de fuerza bruta sean muy lentos.

7. **"¿Cuál es el flujo completo desde que un alumno se inscribe hasta que se actualiza el stock de cupo?"**
   - Alumno → Angular (`inscripcion` component) → `POST /api/inscripciones`
   - Backend → `inscripcion.controller.js` → llama a `validarInscripcion()` del service
   - Service valida: adeudos (CP-05), cupo (CP-04), seriación (CP-03), horario (CP-06)
   - Si todo está bien → `Materia.findByIdAndUpdate($inc cupoDisponible: -1)`
   - Se crea el documento `Inscripcion` en MongoDB
   - Backend retorna HTTP 201 → Angular muestra confirmación al alumno

8. **"¿Qué RF NO está completamente implementado y por qué?"** → RF-31 (Kardex PDF): el frontend tiene la UI lista pero el backend que genera el PDF aún está pendiente (según el README, marcado con ⏳).

---

# PARTE 3: RESUMEN RÁPIDO — QUIÉN HIZO QUÉ

| Integrante | Módulo | RF principales | Endpoints clave |
|---|---|---|---|
| Carlos Sanchez | Auth backend | RF-01, RF-02, RF-03, RF-05 | POST /auth/register, POST /auth/login |
| Luis Roberto Suarez | Frontend base | RF-04, RNF-06 | Guards, interceptor, dashboards |
| Ricardo Galindo | Inscripciones/Calificaciones/Historial backend | RF-14, RF-15, RF-20, RF-21, RF-38 | POST /inscripciones, PUT /calificaciones/:id, GET /historial/:id |
| Eduardo Robles | Frontend inscripción/actas/kardex | RF-14, RF-20, RF-38 | Consumidor de /inscripciones, /calificaciones, /historial |
| Mariana Jimenez | Pagos + SSE | RF-22, RF-30 | GET /notificaciones/stream (SSE), POST /pagos |
