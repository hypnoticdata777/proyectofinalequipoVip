# Casos de Prueba — USF Portal
## Materia: Trazabilidad y Configuración de Software

---

## CP-01: Autenticación con Google OAuth

**RF Validado:** RF-01, RF-02, RF-03
**Precondiciones:**
- Backend corriendo en localhost:3000
- Frontend corriendo en localhost:4200
- Google OAuth configurado con Client ID y Secret válidos

**Pasos:**
1. Navegar a http://localhost:4200
2. Verificar redirección automática a /auth/login
3. Clic en "Iniciar sesión con Google"
4. Autenticar con cuenta Google válida
5. Verificar redirección a /auth/callback con token en URL
6. Verificar redirección al dashboard según rol

**Resultado Esperado:**
- Token JWT generado y almacenado en localStorage
- Usuario creado en MongoDB con rol 'alumno' por defecto
- Redirección a /dashboard/alumno (o según rol)

**Cómo ejecutarlo con Jest/Supertest:**
```javascript
// backend/src/__tests__/auth.test.js
const request = require('supertest');
const app = require('../../server');

describe('Auth Controller', () => {
  test('GET /api/auth/me sin token devuelve 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  test('GET /api/auth/me con token inválido devuelve 401', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer token_invalido');
    expect(res.status).toBe(401);
  });
});
```

---

## CP-02: Protección de Rutas sin Token

**RF Validado:** RF-21
**Precondiciones:** Backend corriendo

**Pasos:**
1. Realizar GET a /api/materias sin header Authorization

**Resultado Esperado:** Status 401, body con campo `error` en español

**Jest/Supertest:**
```javascript
test('Acceso sin token a ruta protegida devuelve 401', async () => {
  const res = await request(app).get('/api/materias');
  expect(res.status).toBe(401);
  expect(res.body.error).toMatch(/token/i);
});
```

---

## CP-03: Inscripción con Adeudo Pendiente

**RF Validado:** RF-05
**Precondiciones:**
- Alumno autenticado con JWT válido
- Alumno tiene al menos 1 adeudo en estado 'pendiente'
- Materias disponibles en el periodo actual

**Pasos:**
1. POST /api/inscripciones con materias seleccionadas

**Resultado Esperado:**
- Status 400
- `error`: "ADEUDO_PENDIENTE: No puedes inscribirte con adeudos pendientes"
- `codigo`: "ADEUDO_PENDIENTE"

**Jest/Supertest:**
```javascript
test('Inscripción con adeudo pendiente devuelve 400', async () => {
  // Crear adeudo pendiente para el alumno
  // Intentar inscripción
  const res = await request(app)
    .post('/api/inscripciones')
    .set('Authorization', `Bearer ${tokenAlumnoConAdeudo}`)
    .send({ materias: [materiaId], periodo: '2026-1' });
  expect(res.status).toBe(400);
  expect(res.body.codigo).toBe('ADEUDO_PENDIENTE');
});
```

---

## CP-04: Inscripción sin Cupo

**RF Validado:** RF-06
**Precondiciones:**
- Alumno sin adeudos pendientes
- Materia con cupoDisponible = 0

**Resultado Esperado:** Status 400, codigo "SIN_CUPO"

---

## CP-05: Inscripción sin Prerequisito

**RF Validado:** RF-07
**Precondiciones:**
- Alumno sin adeudos pendientes
- Materia seleccionada tiene seriación requerida
- Alumno NO tiene aprobada la materia prerequisito

**Resultado Esperado:** Status 400, codigo "SERIACION_INCOMPLETA"

---

## CP-06: Inscripción con Choque de Horario

**RF Validado:** RF-08
**Precondiciones:**
- Alumno sin adeudos pendientes
- Dos materias seleccionadas con traslape de horario el mismo día

**Resultado Esperado:** Status 400, codigo "CRUCE_HORARIO" con las materias y el día del choque

**Jest/Supertest:**
```javascript
test('Materias con choque de horario rechazan inscripción', async () => {
  // materiaA: Lunes 07:00-09:00
  // materiaB: Lunes 08:00-10:00 (traslape)
  const res = await request(app)
    .post('/api/inscripciones')
    .set('Authorization', `Bearer ${tokenAlumno}`)
    .send({ materias: [materiaA._id, materiaB._id], periodo: '2026-1' });
  expect(res.status).toBe(400);
  expect(res.body.codigo).toBe('CRUCE_HORARIO');
  expect(res.body.error).toContain('Lunes');
});
```

---

## CP-07: Inscripción Exitosa

**RF Validado:** RF-04, RF-05, RF-06, RF-07, RF-08
**Precondiciones:**
- Alumno sin adeudos pendientes
- Materias con cupo disponible
- No hay prerequisitos faltantes
- No hay choques de horario

**Resultado Esperado:**
- Status 201
- Inscripción creada con estado 'confirmada'
- cupoDisponible decrementado en 1 para cada materia

---

## CP-08, CP-09, CP-10: EXCLUIDOS

**Motivo:** Notificaciones push (RF-22) y pagos en línea (RF-30, RF-31) fueron excluidos del alcance por instrucción del catedrático.

---

## CP-11: Edición de Acta Cerrada

**RF Validado:** RF-13
**Precondiciones:**
- Profesor autenticado
- Calificación con campo `cerrada: true`

**Pasos:**
1. PUT /api/calificaciones/:id con nuevas calificaciones

**Resultado Esperado:** Status 403, error "El acta está cerrada"

**Jest/Supertest:**
```javascript
test('Edición de acta cerrada devuelve 403', async () => {
  const calificacion = await Calificacion.create({ ..., cerrada: true });
  const res = await request(app)
    .put(`/api/calificaciones/${calificacion._id}`)
    .set('Authorization', `Bearer ${tokenProfesor}`)
    .send({ parcial1: 85 });
  expect(res.status).toBe(403);
  expect(res.body.error).toBe('El acta está cerrada.');
});
```

---

## CP-12: Generación de PDF del Kardex

**RF Validado:** RF-17
**Precondiciones:**
- Alumno autenticado
- Alumno tiene calificaciones en la base de datos

**Pasos:**
1. GET /api/historial/:alumnoId/pdf

**Resultado Esperado:**
- Status 200
- Content-Type: application/pdf
- Content-Disposition: attachment; filename="kardex_xxx.pdf"
- Archivo PDF descargable

**Jest/Supertest:**
```javascript
test('Generación de PDF del kardex devuelve PDF', async () => {
  const res = await request(app)
    .get(`/api/historial/${alumnoId}/pdf`)
    .set('Authorization', `Bearer ${tokenAlumno}`);
  expect(res.status).toBe(200);
  expect(res.headers['content-type']).toBe('application/pdf');
});
```

---

## CP-13: Control de Acceso por Rol

**RF Validado:** RF-23
**Precondiciones:** Usuario con rol 'alumno' autenticado

**Pasos:**
1. GET /api/inscripciones (ruta solo admin)

**Resultado Esperado:** Status 403, mensaje en español
