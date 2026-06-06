# Documentación de Schemas MongoDB
## USF Portal — Universidad Santa Fe

---

## 1. Colección: `users`

Almacena todos los usuarios del sistema (alumnos, profesores, administradores).

| Campo | Tipo | Requerido | Único | Descripción |
|-------|------|-----------|-------|-------------|
| googleId | String | Sí | Sí | ID único de Google OAuth 2.0 |
| nombre | String | Sí | No | Nombre(s) del usuario |
| apellido | String | Sí | No | Apellido(s) del usuario |
| email | String | Sí | Sí | Correo electrónico de Google |
| rol | String (enum) | No | No | Rol: 'alumno', 'profesor', 'admin'. Default: 'alumno' |
| matricula | String | No | Sí (sparse) | Número de matrícula institucional |
| foto | String | No | No | URL de la foto de perfil de Google |
| activo | Boolean | No | No | Estado de la cuenta. Default: true |
| fechaCreacion | Date | No | No | Fecha de registro en el sistema |
| createdAt | Date | Auto | No | Timestamp automático de Mongoose |
| updatedAt | Date | Auto | No | Timestamp automático de Mongoose |

---

## 2. Colección: `materias`

Catálogo de materias disponibles por periodo académico.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| clave | String | Sí | Clave única de la materia (ej. "MAT-101") |
| nombre | String | Sí | Nombre completo de la materia |
| creditos | Number | Sí | Número de créditos que vale la materia |
| cupoMaximo | Number | Sí | Capacidad máxima del grupo |
| cupoDisponible | Number | Sí | Lugares actualmente disponibles |
| horario | Array | No | Lista de sesiones de clase |
| horario[].dia | String (enum) | No | Día de la semana |
| horario[].horaInicio | String | No | Hora de inicio (formato "HH:MM") |
| horario[].horaFin | String | No | Hora de fin (formato "HH:MM") |
| horario[].salon | String | No | Aula o sala asignada |
| seriacion | ObjectId[] | No | Referencias a materias prerequisito |
| profesor | ObjectId | No | Referencia al usuario profesor asignado |
| periodo | String | Sí | Identificador del periodo (ej. "2026-1") |
| activa | Boolean | No | Si la materia está visible en el catálogo. Default: true |

---

## 3. Colección: `inscripciones`

Registro de inscripciones de alumnos por periodo.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| alumno | ObjectId | Sí | Referencia al usuario alumno |
| periodo | String | Sí | Periodo académico (ej. "2026-1") |
| materias | ObjectId[] | No | Lista de materias inscritas |
| estado | String (enum) | No | Estado: 'pendiente', 'confirmada', 'cancelada'. Default: 'pendiente' |
| fechaInscripcion | Date | No | Fecha y hora de la inscripción |

**Validaciones de negocio** (implementadas en `inscripcion.service.js`):
1. Alumno no debe tener adeudos pendientes
2. Todas las materias deben tener cupo disponible
3. El alumno debe haber aprobado los prerequisitos de cada materia
4. Las materias no deben tener cruces de horario entre sí

---

## 4. Colección: `calificaciones`

Registro de calificaciones por alumno, materia y periodo.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| alumno | ObjectId | Sí | Referencia al usuario alumno |
| materia | ObjectId | Sí | Referencia a la materia |
| profesor | ObjectId | Sí | Referencia al profesor que captura |
| periodo | String | Sí | Periodo académico |
| parcial1 | Number (0-100) | No | Calificación del primer parcial. Default: null |
| parcial2 | Number (0-100) | No | Calificación del segundo parcial. Default: null |
| parcial3 | Number (0-100) | No | Calificación del tercer parcial. Default: null |
| calificacionFinal | Number (0-100) | No | Promedio calculado automáticamente |
| cerrada | Boolean | No | Si el acta está cerrada y no puede editarse |
| fechaCierre | Date | No | Fecha en que se cerró el acta |

**Comportamientos automáticos**:
- Virtual `promedio`: Calcula el promedio de los parciales no nulos
- Pre-save hook: Cuando `cerrada` cambia a `true`, registra `fechaCierre = Date.now()`

**Regla de negocio**: Si `cerrada === true`, ningún profesor puede modificar las calificaciones (el controller responde 403).

---

## 5. Colección: `adeudos`

Registro de adeudos administrativos de alumnos.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| alumno | ObjectId | Sí | Referencia al usuario alumno |
| concepto | String | Sí | Descripción del adeudo (ej. "Credencial", "Laboratorio") |
| monto | Number | Sí | Monto del adeudo en pesos |
| estado | String (enum) | No | Estado: 'pendiente', 'pagado'. Default: 'pendiente' |
| periodo | String | Sí | Periodo al que corresponde el adeudo |
| fechaRegistro | Date | No | Fecha en que se registró el adeudo |
| fechaPago | Date | No | Fecha en que el admin marcó como pagado. Default: null |
| registradoPor | ObjectId | No | Referencia al admin que registró el adeudo |

**Regla de negocio**: Solo admin puede crear adeudos y marcarlos como pagados. No existe integración con pasarela de pago (fuera de scope).

---

## 6. Relaciones entre Colecciones

```
User (alumno) ──────────────────────────────── Inscripcion
     │                                              │
     │                                              ▼
     │                                           Materia ─── User (profesor)
     │                                              ▲
     │                                              │
     └──── Calificacion ─────────────────────── Materia
     │         └────────────────────────────── User (profesor)
     │
     └──── Adeudo ─────────────────────────── User (admin, registradoPor)
```
