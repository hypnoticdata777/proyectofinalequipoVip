# USF Portal — Log de Progreso del Proyecto

**Equipo VIP** | Trazabilidad y Configuración de Software | 2026-0  
**Última actualización:** 06 de Junio de 2026

---

## ESTADO ACTUAL: Backend 100% completo y conectado a MongoDB Atlas

---

## LO QUE ESTÁ HECHO

### Infraestructura
- [x] Repositorio GitHub configurado con ramas y .gitignore
- [x] Estructura de carpetas del proyecto (frontend/ backend/ docs/)
- [x] MongoDB Atlas — Cluster0 creado (AWS us-east-1, free tier M0)
- [x] Conexión verificada y activa: `ac-q1c3u6b-shard-00-02.6azjumv.mongodb.net`
- [x] IP Access List configurada (0.0.0.0/0 para desarrollo)
- [x] Variables de entorno configuradas en `.env` (local, no en repo)

### Backend — Node.js + Express
- [x] `package.json` con dependencias: express, mongoose, bcryptjs, jsonwebtoken, socket.io, dotenv, cors
- [x] `server.js` — Entry point con Express + Socket.io + rutas montadas
- [x] `src/config/db.js` — Conexión Mongoose a Atlas
- [x] API health check: GET /api/health → `{ status: "ok" }`

### Modelos Mongoose (6/6)
- [x] `User.js` — nombre, apellido, email, password (hash), rol, matricula, activo
- [x] `Materia.js` — clave, nombre, creditos, cupo, horario, seriacion, profesor_id, periodo
- [x] `Inscripcion.js` — alumno_id, periodo, materias[], estado
- [x] `Calificacion.js` — parcial1/2/3, final, cerrada, fechaCierre
- [x] `Pago.js` — concepto, monto, tipo, estado, metodo, referencia
- [x] `Notificacion.js` — titulo, mensaje, tipo, leida

### Middleware (2/2)
- [x] `verifyToken.js` — Extrae y valida JWT del header Authorization: Bearer
- [x] `checkRole.js` — Verifica que req.user.rol esté en los roles permitidos

### Rutas (7/7)
- [x] `auth.routes.js` — POST /register, POST /login, GET /me
- [x] `materias.routes.js` — GET /, POST /, PUT /:id, DELETE /:id
- [x] `inscripciones.routes.js` — POST /, GET /:id, DELETE /:id
- [x] `calificaciones.routes.js` — GET /:materiaId, PUT /:id
- [x] `historial.routes.js` — GET /:alumnoId
- [x] `pagos.routes.js` — GET /:alumnoId, POST /, PUT /:id/pagar
- [x] `notificaciones.routes.js` — GET /, PUT /:id/leer

### Controladores (7/7)
- [x] `auth.controller.js` — register (bcrypt hash), login (bcrypt compare + JWT), me
- [x] `materias.controller.js` — listar, crear, actualizar, desactivar
- [x] `inscripciones.controller.js` — inscribir (via service), obtener, cancelar
- [x] `calificaciones.controller.js` — verPorMateria, registrar (con check de acta cerrada + notif Socket.io)
- [x] `historial.controller.js` — kardex (agrupado por periodo, con promedios calculados)
- [x] `pagos.controller.js` — listarPorAlumno, crearPago, marcarPagado
- [x] `notificaciones.controller.js` — listar, marcarLeida

### Servicio de Inscripción (4 validaciones)
- [x] `inscripcion.service.js`
  - [x] Validación 1: Sin adeudos financieros pendientes
  - [x] Validación 2: Cupo disponible en la materia
  - [x] Validación 3: Seriación completa (prerequisitos aprobados con ≥60)
  - [x] Validación 4: Sin choques de horario

### Notificaciones en Tiempo Real
- [x] Socket.io configurado en server.js con rooms por usuario (`user_${id}`)
- [x] Evento `nueva_notificacion` emitido al registrar calificaciones

### Documentación entregada
- [x] README.md actualizado (auth email/password, sin Google OAuth, guía Atlas)
- [x] Actividad 4 — Matriz de Trazabilidad (HTML → PDF) — **ENTREGADA 06/06/2026**
- [x] Actividad 5 — Reporte de Seguimiento (HTML → PDF) — **ENTREGADA 06/06/2026**

---

## LO QUE FALTA

### Frontend Angular (Semana 1-2)
- [ ] `ng new frontend` — Inicializar proyecto Angular 17+
- [ ] Configurar app.routes.ts con lazy loading por módulo
- [ ] Módulo auth — Login form (email + password)
- [ ] JWT interceptor — Agrega Authorization: Bearer a cada request
- [ ] AuthGuard + RoleGuard — Protege rutas por rol
- [ ] Dashboard alumno — Vista de materias inscritas, calificaciones, pagos
- [ ] Dashboard profesor — Vista de grupos, registro de calificaciones
- [ ] Dashboard admin — Gestión de materias, usuarios, pagos
- [ ] Formulario de inscripción — Selección de materias con validaciones
- [ ] Vista de calificaciones — Actas por materia
- [ ] Kardex — Historial académico por periodo
- [ ] Vista de pagos — Estado de adeudos y referencia bancaria
- [ ] Notificaciones — Componente que escucha Socket.io

### Backend — Completar módulo de pagos (Semana 2)
- [ ] Instalar pdfkit — `npm install pdfkit`
- [ ] Implementar generación de PDF en POST /api/pagos/referencia
- [ ] (Opcional) Integrar Stripe PaymentIntent para pagos reales

### QA / Pruebas de Carga (Semana 2-3)
- [ ] Crear `artillery.yml` — Escenario: 5,000 usuarios en POST /api/inscripciones
- [ ] Ejecutar prueba y documentar resultados (CP-12)
- [ ] Medir latencia Socket.io y documentar (objetivo: <2s, CP-08)

### Despliegue (Semana 3)
- [ ] Deploy backend en Railway o Render
- [ ] Deploy frontend en Vercel
- [ ] Configurar variables de entorno en producción
- [ ] GitHub Actions — CI/CD pipeline básico

---

## ENDPOINTS DISPONIBLES AHORA MISMO

```
GET  http://localhost:3000/api/health               → Health check (sin auth)

POST http://localhost:3000/api/auth/register        → Registrar usuario
POST http://localhost:3000/api/auth/login           → Login → retorna JWT
GET  http://localhost:3000/api/auth/me              → Perfil (requiere JWT)

GET  http://localhost:3000/api/materias             → Listar materias (requiere JWT)
POST http://localhost:3000/api/materias             → Crear materia (solo admin)
PUT  http://localhost:3000/api/materias/:id         → Actualizar materia (solo admin)

POST http://localhost:3000/api/inscripciones        → Inscribir (solo alumno)
GET  http://localhost:3000/api/inscripciones/:id    → Ver inscripción
DELETE http://localhost:3000/api/inscripciones/:id  → Cancelar (solo alumno)

GET  http://localhost:3000/api/calificaciones/:matId → Ver calificaciones
PUT  http://localhost:3000/api/calificaciones/:id    → Registrar notas (solo profesor)

GET  http://localhost:3000/api/historial/:alumnoId  → Kardex completo

GET  http://localhost:3000/api/pagos/:alumnoId      → Ver pagos del alumno
POST http://localhost:3000/api/pagos                → Crear pago
PUT  http://localhost:3000/api/pagos/:id/pagar      → Marcar pagado (solo admin)

GET  http://localhost:3000/api/notificaciones       → Mis notificaciones (requiere JWT)
PUT  http://localhost:3000/api/notificaciones/:id/leer → Marcar leída
```

---

## CÓMO CORRER EL PROYECTO

```bash
# Backend
cd usf-portal/backend
npm install
npm run dev
# → Servidor en puerto 3000
# → MongoDB conectado: cluster0.6azjumv.mongodb.net

# Frontend (pendiente de inicializar)
cd usf-portal/frontend
ng new . --standalone --routing --style=css
ng serve
# → App en localhost:4200
```

---

## STACK TECNOLÓGICO

| Capa | Tecnología | Estado |
|---|---|---|
| Frontend | Angular 17+ | Pendiente |
| Backend | Node.js + Express.js | Completo |
| Base de datos | MongoDB Atlas (Mongoose) | Completo |
| Autenticación | Email + Password + JWT + bcrypt | Completo |
| Tiempo real | Socket.io | Completo |
| Pagos | Modelo básico (Stripe pendiente) | En proceso |
| PDF | PDFKit (pendiente instalar) | Pendiente |
| Testing carga | Artillery.io | Pendiente |
| CI/CD | GitHub Actions | Pendiente |
| Deploy backend | Railway / Render | Pendiente |
| Deploy frontend | Vercel | Pendiente |

---

*Generado el 06/06/2026 — Equipo VIP*
