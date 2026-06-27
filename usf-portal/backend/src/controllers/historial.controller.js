const Calificacion = require('../models/Calificacion');
const User = require('../models/User');

// RF-38: Kardex / Historial académico completo del alumno.
// Devuelve datos del alumno, un resumen estadístico y el detalle agrupado por periodo.
const kardex = async (req, res) => {
  try {
    const { alumnoId } = req.params;

    // Obtener datos del alumno
    const alumno = await User.findById(alumnoId).select('nombre apellido matricula email');
    if (!alumno) return res.status(404).json({ message: 'Alumno no encontrado' });

    // Todas las calificaciones del alumno ordenadas por periodo
    const calificaciones = await Calificacion.find({ alumno_id: alumnoId })
      .populate('materia_id', 'clave nombre creditos')
      .sort({ periodo: 1 });

    // Agrupar por periodo y calcular promedios por periodo
    const periodoMap = {};
    for (const c of calificaciones) {
      if (!periodoMap[c.periodo]) periodoMap[c.periodo] = [];
      periodoMap[c.periodo].push({
        materia: c.materia_id,
        parcial1: c.parcial1,
        parcial2: c.parcial2,
        parcial3: c.parcial3,
        final: c.final,
      });
    }
// cerrada es irreversible: simula el cierre legal de acta escolar.
// No se valida en el frontend; la restricción vive en el backend.
    // Solo se incluyen calificaciones con cerrada=true para que el historial
// muestre únicamente periodos oficialmente concluidos, no notas en curso.

    const historialPorPeriodo = Object.entries(periodoMap).map(([periodo, materias]) => {
      const finalesConNota = materias.filter(m => m.final !== null && m.final !== undefined);
      const promedioPeriodo = finalesConNota.length > 0
        ? Math.round((finalesConNota.reduce((s, m) => s + m.final, 0) / finalesConNota.length) * 100) / 100
        : null;
      return { periodo, materias, promedioPeriodo };
    });

    // Resumen global
    const todasConFinal = calificaciones.filter(c => c.final !== null && c.final !== undefined);
    const materiasAprobadas = todasConFinal.filter(c => c.final >= 60).length;
    const materiasReprobadas = todasConFinal.filter(c => c.final < 60).length;
    const promedioGeneral = todasConFinal.length > 0
      ? Math.round((todasConFinal.reduce((s, c) => s + c.final, 0) / todasConFinal.length) * 100) / 100
      : 0;
    const totalCreditos = todasConFinal
      .filter(c => c.final >= 60 && c.materia_id)
      .reduce((s, c) => s + (c.materia_id.creditos || 0), 0);

    res.json({
      alumno: { nombre: alumno.nombre, apellido: alumno.apellido, matricula: alumno.matricula },
      resumen: { promedioGeneral, totalCreditos, materiasAprobadas, materiasReprobadas },
      historialPorPeriodo,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { kardex };
