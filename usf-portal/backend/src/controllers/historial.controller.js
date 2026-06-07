const Calificacion = require('../models/Calificacion');

const kardex = async (req, res) => {
  try {
    const calificaciones = await Calificacion.find({ alumno_id: req.params.alumnoId })
      .populate('materia_id', 'clave nombre creditos')
      .sort({ periodo: 1 });

    // Agrupar por periodo y calcular promedios
    const periodos = {};
    for (const c of calificaciones) {
      if (!periodos[c.periodo]) periodos[c.periodo] = [];
      const promedio = [c.parcial1, c.parcial2, c.parcial3, c.final]
        .filter(n => n !== null && n !== undefined)
        .reduce((sum, n, _, arr) => sum + n / arr.length, 0);
      periodos[c.periodo].push({
        materia: c.materia_id,
        parcial1: c.parcial1,
        parcial2: c.parcial2,
        parcial3: c.parcial3,
        final: c.final,
        promedio: Math.round(promedio * 100) / 100
      });
    }

    const historial = Object.entries(periodos).map(([periodo, materias]) => {
      const promedioPeriodo = materias.reduce((sum, m) => sum + m.promedio, 0) / materias.length;
      return { periodo, materias, promedioPeriodo: Math.round(promedioPeriodo * 100) / 100 };
    });

    res.json({ alumno_id: req.params.alumnoId, historial });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { kardex };
