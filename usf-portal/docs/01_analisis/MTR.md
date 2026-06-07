# Matriz de Trazabilidad de Requerimientos (MTR)
## USF Portal — Universidad Santa Fe, Campus Paraíso
### Materia: Trazabilidad y Configuración de Software
### Equipo VIP — 7° y 8° Semestre

---

## 1. Requerimientos Funcionales (RF)

| ID | Requerimiento | Módulo | Prioridad |
|----|---------------|--------|-----------|
| RF-01 | El sistema debe permitir autenticación mediante Google OAuth 2.0 | Autenticación | Alta |
| RF-02 | El sistema debe asignar roles (alumno, profesor, admin) automáticamente | Autenticación | Alta |
| RF-03 | El sistema debe generar y validar tokens JWT con expiración configurable | Autenticación | Alta |
| RF-04 | Los alumnos deben poder consultar el catálogo de materias disponibles por periodo | Inscripción | Alta |
| RF-05 | El sistema debe validar adeudos pendientes antes de permitir inscripción | Inscripción | Alta |
| RF-06 | El sistema debe verificar cupo disponible en cada materia antes de inscribir | Inscripción | Alta |
| RF-07 | El sistema debe validar prerrequisitos (seriación) antes de inscribir | Inscripción | Alta |
| RF-08 | El sistema debe detectar y rechazar cruces de horario entre materias seleccionadas | Inscripción | Alta |
| RF-09 | Los alumnos deben poder ver su inscripción activa con materias y horarios | Inscripción | Media |
| RF-10 | Los administradores deben poder cancelar inscripciones y liberar cupo | Inscripción | Media |
| RF-11 | Los profesores deben poder capturar calificaciones parciales por alumno | Calificaciones | Alta |
| RF-12 | El sistema debe calcular la calificación final automáticamente como promedio de parciales | Calificaciones | Alta |
| RF-13 | Los profesores no deben poder editar actas cerradas | Calificaciones | Alta |
| RF-14 | Los administradores deben poder cerrar actas de calificaciones | Calificaciones | Alta |
| RF-15 | Los alumnos deben poder consultar su historial académico completo agrupado por periodo | Historial | Alta |
| RF-16 | El sistema debe calcular promedio general y créditos acumulados del alumno | Historial | Media |
| RF-17 | El sistema debe generar un PDF descargable del kardex con colores institucionales | Historial | Media |
| RF-18 | Los administradores deben poder registrar adeudos para alumnos | Adeudos | Alta |
| RF-19 | Los administradores deben poder marcar adeudos como pagados manualmente | Adeudos | Alta |
| RF-20 | Los alumnos deben poder consultar sus adeudos pendientes | Adeudos | Media |
| RF-21 | El sistema debe proteger todas las rutas con autenticación JWT | Seguridad | Alta |
| RF-22 | ~~El sistema debe enviar notificaciones push~~ | ~~Notificaciones~~ | ~~Excluido~~ |
| RF-23 | El sistema debe implementar control de acceso por roles (RBAC) | Seguridad | Alta |
| RF-24 | Los administradores deben poder gestionar el catálogo de materias | Materias | Media |
| RF-25 | Los profesores deben ver solo las materias asignadas a ellos | Materias | Media |

> **Nota:** RF-22 (Notificaciones push en tiempo real con Socket.io) fue excluido del alcance por instrucción del catedrático.
> RF-30 y RF-31 (Integración con pasarelas de pago Stripe/OXXO) también fueron excluidos del alcance.

---

## 2. Casos de Uso (CU)

| ID | Caso de Uso | Actores | RF Relacionados |
|----|-------------|---------|-----------------|
| CU-01 | Autenticación con Google | Alumno, Profesor, Admin | RF-01, RF-02, RF-03 |
| CU-02 | Inscripción a materias | Alumno | RF-04, RF-05, RF-06, RF-07, RF-08 |
| CU-03 | Consulta de inscripción activa | Alumno | RF-09 |
| CU-04 | Cancelación de inscripción | Admin | RF-10 |
| CU-05 | Captura de calificaciones | Profesor | RF-11, RF-12, RF-13 |
| CU-06 | Cierre de actas | Admin | RF-14 |
| CU-07 | Consulta de historial académico | Alumno, Admin | RF-15, RF-16 |
| CU-08 | Descarga de kardex PDF | Alumno | RF-17 |
| CU-09 | Registro de adeudo | Admin | RF-18 |
| CU-10 | Marca de pago de adeudo | Admin | RF-19 |
| CU-11 | Consulta de adeudos propios | Alumno | RF-20 |
| CU-12 | Gestión de materias | Admin | RF-24, RF-25 |

---

## 3. Diseño de Interfaces (DIS)

| ID | Pantalla | Rol | Descripción |
|----|----------|-----|-------------|
| DIS-01 | Login | Todos | Pantalla de login con botón Google OAuth, colores #0A2540 y #D4AF37 |
| DIS-02 | Callback | Todos | Loader mientras se procesa el token JWT |
| DIS-03 | Dashboard Alumno | Alumno | Perfil, accesos rápidos, tabla de materias inscritas |
| DIS-04 | Dashboard Profesor | Profesor | Perfil, lista de grupos con botón de captura |
| DIS-05 | Dashboard Admin | Admin | Métricas del sistema, accesos rápidos a gestión |
| DIS-06 | Inscripción | Alumno | Catálogo de materias, selección lateral, validaciones con iconos |
| DIS-07 | Calificaciones | Profesor/Admin | Tabla editable por grupo, badge "Acta Cerrada", botón cerrar |
| DIS-08 | Historial/Kardex | Alumno | Tabla agrupada por periodo, cards de resumen, botón PDF |

---

## 4. Casos de Prueba (CP)

| ID | Caso de Prueba | RF Validado | Resultado Esperado |
|----|----------------|-------------|-------------------|
| CP-01 | Login con cuenta Google válida de UTSF | RF-01, RF-02 | Token JWT generado, redirección a dashboard según rol |
| CP-02 | Intento de acceso sin token | RF-21 | Respuesta 401 con mensaje en español |
| CP-03 | Inscripción con adeudo pendiente | RF-05 | Error ADEUDO_PENDIENTE con código de error |
| CP-04 | Inscripción sin cupo disponible | RF-06 | Error SIN_CUPO con nombre de la materia |
| CP-05 | Inscripción sin prerequisito aprobado | RF-07 | Error SERIACION_INCOMPLETA con materias involucradas |
| CP-06 | Inscripción con cruce de horario | RF-08 | Error CRUCE_HORARIO con materias y día del choque |
| CP-07 | Inscripción exitosa (todas validaciones pasan) | RF-04 a RF-08 | Inscripción creada, cupo decrementado en cada materia |
| CP-08 | ~~Notificación push~~ | ~~RF-22~~ | ~~Excluido~~ |
| CP-09 | ~~Pago en línea~~ | ~~RF-30~~ | ~~Excluido~~ |
| CP-10 | ~~Referencia bancaria~~ | ~~RF-31~~ | ~~Excluido~~ |
| CP-11 | Edición de calificación en acta cerrada | RF-13 | Respuesta 403 con "El acta está cerrada" |
| CP-12 | Generación de PDF del kardex | RF-17 | PDF descargado con colores institucionales y datos del alumno |
| CP-13 | Control de acceso por rol incorrecto | RF-23 | Respuesta 403 con mensaje en español |
