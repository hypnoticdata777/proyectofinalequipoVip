const Pago = require('../models/Pago');
const Materia = require('../models/Materia');
const Calificacion = require('../models/Calificacion');
const Inscripcion = require('../models/Inscripcion');

// Validación 1: Sin adeudos pendientes
const verificarSinAdeudos = async (alumnoId) => {
  const adeudo = await Pago.findOne({ alumno_id: alumnoId, estado: 'pendiente' });
  if (adeudo) throw new Error('Tienes pagos pendientes. Liquida tus adeudos antes de inscribirte.');
};

// Validación 2: Cupo disponible
const verificarCupo = async (materiaId) => {
  const materia = await Materia.findById(materiaId);
  if (!materia) throw new Error(`Materia ${materiaId} no encontrada`);
  if (materia.cupoDisponible <= 0) throw new Error(`La materia "${materia.nombre}" no tiene cupo disponible`);
  return materia;
};

// Validación 3: Seriación completa
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

// Validación 4: Sin choque de horario
const verificarHorario = async (alumnoId, periodo, nuevaMateriaId) => {
  const inscripcionActual = await Inscripcion.findOne({ alumno_id: alumnoId, periodo, estado: { $ne: 'cancelada' } })
    .populate({ path: 'materias', select: 'horario' });

  const nuevaMateria = await Materia.findById(nuevaMateriaId).select('horario');

  if (!inscripcionActual || !inscripcionActual.materias.length) return;

  for (const matInscrita of inscripcionActual.materias) {
    for (const h1 of matInscrita.horario) {
      for (const h2 of nuevaMateria.horario) {
        if (h1.dia === h2.dia) {
          const inicio1 = h1.horaInicio, fin1 = h1.horaFin;
          const inicio2 = h2.horaInicio, fin2 = h2.horaFin;
          if (inicio1 < fin2 && inicio2 < fin1) {
            throw new Error(`Choque de horario el día ${h1.dia} entre ${inicio1}-${fin1} y ${inicio2}-${fin2}`);
          }
        }
      }
    }
  }
};

const ejecutarInscripcion = async (alumnoId, materiaIds, periodo) => {
  for (const materiaId of materiaIds) {
    await verificarSinAdeudos(alumnoId);
    const materia = await verificarCupo(materiaId);
    await verificarSeriacion(alumnoId, materia);
    await verificarHorario(alumnoId, periodo, materiaId);
  }

  // Reducir cupo y crear inscripción
  for (const materiaId of materiaIds) {
    await Materia.findByIdAndUpdate(materiaId, { $inc: { cupoDisponible: -1 } });
  }

  const inscripcion = await Inscripcion.create({
    alumno_id: alumnoId,
    periodo,
    materias: materiaIds,
    estado: 'confirmada'
  });

  return inscripcion;
};

// validarInscripcion: solo ejecuta las 4 validaciones y lanza error si alguna falla.
// El controlador se encarga de crear la inscripción después de que pasen todas.
const validarInscripcion = async (alumnoId, materiaIds, periodo) => {
  for (const materiaId of materiaIds) {
    await verificarSinAdeudos(alumnoId);
    const materia = await verificarCupo(materiaId);
    await verificarSeriacion(alumnoId, materia);
    await verificarHorario(alumnoId, periodo, materiaId);
  }
};

module.exports = { ejecutarInscripcion, validarInscripcion };
