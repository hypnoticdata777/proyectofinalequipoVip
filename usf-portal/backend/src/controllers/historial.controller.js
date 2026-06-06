const Calificacion = require('../models/Calificacion');
const User = require('../models/User');
const PDFDocument = require('pdfkit');

const getHistorial = async (req, res) => {
  try {
    const { alumnoId } = req.params;
    if (req.user.rol === 'alumno' && req.user.id !== alumnoId) {
      return res.status(403).json({ error: 'No tienes permisos para ver este historial.' });
    }

    const alumno = await User.findById(alumnoId).select('nombre apellido matricula email');
    if (!alumno) return res.status(404).json({ error: 'Alumno no encontrado.' });

    const calificaciones = await Calificacion.find({ alumno: alumnoId })
      .populate('materia', 'nombre clave creditos')
      .sort({ periodo: 1 });

    // Agrupar por periodo
    const porPeriodo = {};
    calificaciones.forEach(cal => {
      if (!porPeriodo[cal.periodo]) porPeriodo[cal.periodo] = [];
      porPeriodo[cal.periodo].push(cal);
    });

    const historialPorPeriodo = Object.entries(porPeriodo).map(([periodo, materias]) => {
      const calsFinal = materias.filter(m => m.calificacionFinal !== null);
      const promedioPeriodo = calsFinal.length > 0
        ? calsFinal.reduce((acc, m) => acc + m.calificacionFinal, 0) / calsFinal.length
        : 0;
      return { periodo, materias, promedioPeriodo: Math.round(promedioPeriodo * 100) / 100 };
    });

    const todasCalsFinal = calificaciones.filter(c => c.calificacionFinal !== null);
    const promedioGeneral = todasCalsFinal.length > 0
      ? todasCalsFinal.reduce((acc, c) => acc + c.calificacionFinal, 0) / todasCalsFinal.length
      : 0;

    const aprobadas = calificaciones.filter(c => c.calificacionFinal !== null && c.calificacionFinal >= 60);
    const reprobadas = calificaciones.filter(c => c.calificacionFinal !== null && c.calificacionFinal < 60);
    const totalCreditos = aprobadas.reduce((acc, c) => acc + (c.materia?.creditos || 0), 0);

    res.json({
      alumno: { nombre: alumno.nombre, apellido: alumno.apellido, matricula: alumno.matricula, email: alumno.email },
      resumen: {
        totalCreditos,
        promedioGeneral: Math.round(promedioGeneral * 100) / 100,
        materiasAprobadas: aprobadas.length,
        materiasReprobadas: reprobadas.length,
      },
      historialPorPeriodo,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el historial académico.' });
  }
};

const generarPDF = async (req, res) => {
  try {
    const { alumnoId } = req.params;
    if (req.user.rol === 'alumno' && req.user.id !== alumnoId) {
      return res.status(403).json({ error: 'No tienes permisos para descargar este kardex.' });
    }

    const alumno = await User.findById(alumnoId).select('nombre apellido matricula email');
    if (!alumno) return res.status(404).json({ error: 'Alumno no encontrado.' });

    const calificaciones = await Calificacion.find({ alumno: alumnoId })
      .populate('materia', 'nombre clave creditos')
      .sort({ periodo: 1 });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="kardex_${alumno.matricula || alumnoId}.pdf"`);
    doc.pipe(res);

    // Encabezado con colores institucionales
    doc.rect(0, 0, doc.page.width, 100).fill('#0A2540');
    doc.fillColor('#D4AF37').fontSize(24).text('USF', 50, 25, { align: 'left' });
    doc.fillColor('#FFFFFF').fontSize(14).text('Universidad Santa Fe - Campus Paraíso', 50, 55);
    doc.fillColor('#D4AF37').fontSize(18).text('KARDEX ACADÉMICO', 0, 30, { align: 'right', width: doc.page.width - 50 });

    doc.moveDown(3);
    doc.fillColor('#0A2540').fontSize(12);
    doc.text(`Alumno: ${alumno.nombre} ${alumno.apellido}`, 50);
    doc.text(`Matrícula: ${alumno.matricula || 'N/A'}`);
    doc.text(`Email: ${alumno.email}`);
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-MX')}`);
    doc.moveDown();

    // Agrupar por periodo
    const porPeriodo = {};
    calificaciones.forEach(cal => {
      if (!porPeriodo[cal.periodo]) porPeriodo[cal.periodo] = [];
      porPeriodo[cal.periodo].push(cal);
    });

    Object.entries(porPeriodo).forEach(([periodo, materias]) => {
      doc.rect(50, doc.y, doc.page.width - 100, 20).fill('#0A2540');
      doc.fillColor('#D4AF37').fontSize(11).text(`Periodo: ${periodo}`, 55, doc.y - 15);
      doc.moveDown(0.5);

      // Encabezados tabla
      doc.fillColor('#333333').fontSize(10);
      const colX = [55, 200, 280, 340, 400, 460];
      doc.text('Clave', colX[0], doc.y);
      doc.text('Materia', colX[1], doc.y - 12);
      doc.text('P1', colX[2], doc.y - 12);
      doc.text('P2', colX[3], doc.y - 12);
      doc.text('P3', colX[4], doc.y - 12);
      doc.text('Final', colX[5], doc.y - 12);
      doc.moveDown(0.3);
      doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke('#0A2540');

      materias.forEach(cal => {
        const y = doc.y + 5;
        const aprobada = cal.calificacionFinal !== null && cal.calificacionFinal >= 60;
        doc.fillColor(aprobada ? '#1a5c1a' : cal.calificacionFinal !== null ? '#8b0000' : '#333333').fontSize(9);
        doc.text(cal.materia?.clave || '', colX[0], y);
        doc.text(cal.materia?.nombre || '', colX[1], y);
        doc.text(cal.parcial1?.toString() || '-', colX[2], y);
        doc.text(cal.parcial2?.toString() || '-', colX[3], y);
        doc.text(cal.parcial3?.toString() || '-', colX[4], y);
        doc.text(cal.calificacionFinal?.toFixed(1) || '-', colX[5], y);
        doc.moveDown(0.8);
      });
      doc.moveDown(0.5);
    });

    // Resumen
    const aprobadas = calificaciones.filter(c => c.calificacionFinal !== null && c.calificacionFinal >= 60);
    const totalCreditos = aprobadas.reduce((acc, c) => acc + (c.materia?.creditos || 0), 0);

    doc.moveDown();
    doc.rect(50, doc.y, doc.page.width - 100, 60).fill('#f5f5f5');
    doc.fillColor('#0A2540').fontSize(11).text('RESUMEN ACADÉMICO', 55, doc.y - 55);
    doc.fontSize(10).fillColor('#333333');
    doc.text(`Materias Aprobadas: ${aprobadas.length}`, 55);
    doc.text(`Créditos Acumulados: ${totalCreditos}`, 55);

    doc.end();
  } catch (error) {
    res.status(500).json({ error: 'Error al generar el PDF del kardex.' });
  }
};

module.exports = { getHistorial, generarPDF };
