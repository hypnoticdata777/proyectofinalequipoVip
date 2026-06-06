const Adeudo = require('../models/Adeudo');
const Materia = require('../models/Materia');
const Calificacion = require('../models/Calificacion');

const horaToMinutos = (hora) => {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
};

const hayTraslape = (horarioA, horarioB) => {
  for (const turnoA of horarioA) {
    for (const turnoB of horarioB) {
      if (turnoA.dia !== turnoB.dia) continue;
      const inicioA = horaToMinutos(turnoA.horaInicio);
      const finA = horaToMinutos(turnoA.horaFin);
      const inicioB = horaToMinutos(turnoB.horaInicio);
      const finB = horaToMinutos(turnoB.horaFin);
      if (inicioA < finB && finA > inicioB) {
        return { choque: true, dia: turnoA.dia };
      }
    }
  }
  return { choque: false };
};

const validarInscripcion = async (alumnoId, materiasIds, periodo) => {
  // Validación 1: Adeudos pendientes
  const adeudosPendientes = await Adeudo.find({ alumno: alumnoId, estado: 'pendiente' });
  if (adeudosPendientes.length > 0) {
    throw new Error('ADEUDO_PENDIENTE: No puedes inscribirte con adeudos pendientes');
  }

  // Cargar materias
  const materias = await Materia.find({ _id: { $in: materiasIds } }).populate('seriacion');

  // Validación 2: Cupo disponible
  for (const materia of materias) {
    if (materia.cupoDisponible <= 0) {
      throw new Error(`SIN_CUPO: ${materia.nombre} no tiene lugares disponibles`);
    }
  }

  // Validación 3: Seriación
  const calificacionesAprobadas = await Calificacion.find({
    alumno: alumnoId,
    calificacionFinal: { $gte: 60 },
  }).select('materia');
  const materiasAprobadasIds = calificacionesAprobadas.map(c => c.materia.toString());

  for (const materia of materias) {
    for (const prerequisito of materia.seriacion) {
      if (!materiasAprobadasIds.includes(prerequisito._id.toString())) {
        throw new Error(`SERIACION_INCOMPLETA: Debes aprobar ${prerequisito.nombre} antes de inscribir ${materia.nombre}`);
      }
    }
  }

  // Validación 4: Choques de horario
  for (let i = 0; i < materias.length; i++) {
    for (let j = i + 1; j < materias.length; j++) {
      const resultado = hayTraslape(materias[i].horario, materias[j].horario);
      if (resultado.choque) {
        throw new Error(`CRUCE_HORARIO: ${materias[i].nombre} y ${materias[j].nombre} tienen traslape el ${resultado.dia}`);
      }
    }
  }

  return { valido: true };
};

module.exports = { validarInscripcion };
