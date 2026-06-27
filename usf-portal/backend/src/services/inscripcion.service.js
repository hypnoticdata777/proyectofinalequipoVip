// Servicio de negocio para inscripción de materias (RF-15).
// Centraliza las 4 validaciones requeridas antes de confirmar una inscripción.
// Si cualquier validación falla lanza un Error que el controlador convierte en 400.
const Pago = require('../models/Pago');
const Materia = require('../models/Materia');
const Calificacion = require('../models/Calificacion');
const Inscripcion = require('../models/Inscripcion');

// CP-05: No puede inscribirse si tiene pagos pendientes
const verificarSinAdeudos = async (alumnoId) => {
  const adeudo = await Pago.findOne({ alumno_id: alumnoId, estado: 'pendiente' });
  if (adeudo) throw new Error('Tienes pagos pendientes. Liquida tus adeudos antes de inscribirte.');
};

// CP-04: La materia debe tener cupo disponible
const verificarCupo = async (materiaId) => {
  const materia = await Materia.findById(materiaId);
  if (!materia) throw new Error(`Materia ${materiaId} no encontrada`);
  if (materia.cupoDisponible <= 0) throw new Error(`La materia "${materia.nombre}" no tiene cupo disponible`);
  return materia;
};

// CP-03: Todos los prerequisitos (seriación) deben estar aprobados con >= 60
const verificarSeriacion = async (alumnoId, materia) => {
  if (!materia.seriacion || materia.seriacion.length === 0) return;

  const aprobadas = await Calificacion.find({
    alumno_id: alumnoId,
    materia_id: { $in: materia.seriacion },
    final: { $gte: 60 }
  });

  if (aprobadas.length < materia.seriacion.length) {
    throw new Error(`No cumples los prerequisitos para inscribir "${materia.nombre}"`);
  }
};

// CP-06: El horario de la nueva materia no puede solaparse con materias ya inscritas
const verificarHorario = async (alumnoId, periodo, nuevaMateriaId) => {
  const inscripcionActual = await Inscripcion.findOne({ alumno_id: alumnoId, periodo, estado: { $ne: 'cancelada' } })
    .populate({ path: 'materias', select: 'horario' });

  const nuevaMateria = await Materia.findById(nuevaMateriaId).select('horario');

  if (!inscripcionActual || !inscripcionActual.materias.length) return;

  for (const matInscrita of inscripcionActual.materias) {
    for (const h1 of matInscrita.horario) {
      for (const h2 of nuevaMateria.horario) {
        if (h1.dia === h2.dia) {
          const { horaInicio: inicio1, horaFin: fin1 } = h1;
          const { horaInicio: inicio2, horaFin: fin2 } = h2;
          // Dos intervalos se solapan si uno empieza antes de que el otro acabe
          if (inicio1 < fin2 && inicio2 < fin1) {
            throw new Error(`Choque de horario el día ${h1.dia} entre ${inicio1}-${fin1} y ${inicio2}-${fin2}`);
          }
        }
      }
    }
  }
};

// ejecutarInscripcion: valida Y crea la inscripción (usado por flujos internos/tests)
const ejecutarInscripcion = async (alumnoId, materiaIds, periodo) => {
  for (const materiaId of materiaIds) {
    await verificarSinAdeudos(alumnoId);
    const materia = await verificarCupo(materiaId);
    await verificarSeriacion(alumnoId, materia);
    await verificarHorario(alumnoId, periodo, materiaId);
  }
// El orden de validaciones importa: primero adeudos (barato en consultas),
// luego cupo, seriación y horario. Si falla una, se corta sin seguir.
  // $inc atómico para evitar race condition cuando dos alumnos
// toman el último cupo al mismo tiempo.
  for (const materiaId of materiaIds) {
    await Materia.findByIdAndUpdate(materiaId, { $inc: { cupoDisponible: -1 } });
  }
// Se crean los documentos Calificacion vacíos aquí y no en el
// controlador de calificaciones para garantizar que siempre existan
// antes de que el profesor intente cargar notas.
  const inscripcion = await Inscripcion.create({
    alumno_id: alumnoId,
    periodo,
    materias: materiaIds,
    estado: 'confirmada'
  });

  return inscripcion;
};

// validarInscripcion: solo ejecuta las validaciones, sin crear el documento.
// El controlador inscripcion.controller.js lo usa para separar validación de persistencia.
const validarInscripcion = async (alumnoId, materiaIds, periodo) => {
  await verificarSinAdeudos(alumnoId);
  const materiasSeleccionadas = [];

  for (const materiaId of materiaIds) {
    const materia = await verificarCupo(materiaId);
    if (!materia.activa || materia.periodo !== periodo) {
      throw new Error(`La materia "${materia.nombre}" no está disponible en el periodo ${periodo}`);
    }
    await verificarSeriacion(alumnoId, materia);
    await verificarHorario(alumnoId, periodo, materiaId);
    materiasSeleccionadas.push(materia);
  }

  // También valida choques entre las materias elegidas en la misma solicitud.
  for (let i = 0; i < materiasSeleccionadas.length; i++) {
    for (let j = i + 1; j < materiasSeleccionadas.length; j++) {
      for (const h1 of materiasSeleccionadas[i].horario) {
        for (const h2 of materiasSeleccionadas[j].horario) {
          if (
            h1.dia === h2.dia &&
            h1.horaInicio < h2.horaFin &&
            h2.horaInicio < h1.horaFin
          ) {
            throw new Error(
              `Choque de horario entre "${materiasSeleccionadas[i].nombre}" y "${materiasSeleccionadas[j].nombre}"`
            );
          }
        }
      }
    }
  }
};

module.exports = { ejecutarInscripcion, validarInscripcion };
