const Pago = require('../models/Pago');
const PDFDocument = require('pdfkit');

// RF-30: Gestión de pagos
const listarPagos = async (req, res) => {
  try {
    const filtro = req.user.rol === 'alumno' ? { alumno: req.user.id } : {};
    if (req.query.estado) filtro.estado = req.query.estado;
    const pagos = await Pago.find(filtro)
      .populate('alumno', 'nombre apellido matricula email')
      .sort({ createdAt: -1 });
    res.json(pagos);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar pagos.' });
  }
};

const crearPago = async (req, res) => {
  try {
    const { concepto, monto, metodoPago, periodo } = req.body;
    const alumnoId = req.user.rol === 'alumno' ? req.user.id : req.body.alumno;
    const pago = await Pago.create({ alumno: alumnoId, concepto, monto, metodoPago, periodo });
    res.status(201).json(pago);
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el pago.' });
  }
};

const actualizarEstadoPago = async (req, res) => {
  try {
    const pago = await Pago.findByIdAndUpdate(
      req.params.id,
      { estado: req.body.estado, fechaPago: req.body.estado === 'pagado' ? new Date() : undefined },
      { new: true, runValidators: true }
    );
    if (!pago) return res.status(404).json({ error: 'Pago no encontrado.' });
    res.json(pago);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el pago.' });
  }
};

// RF-31: Generación de referencia bancaria en PDF
const generarReferenciaPDF = async (req, res) => {
  try {
    const { concepto, monto, metodoPago, periodo } = req.body;
    const alumnoId = req.user.id;

    const pago = await Pago.create({ alumno: alumnoId, concepto, monto, metodoPago, periodo });
    const referencia = pago.referencia;
    const fechaVencimiento = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="referencia_${referencia}.pdf"`);
    doc.pipe(res);

    // Encabezado institucional
    doc.rect(0, 0, doc.page.width, 90).fill('#0A2540');
    doc.fillColor('#D4AF37').fontSize(22).text('USF', 50, 20, { align: 'left' });
    doc.fillColor('#FFFFFF').fontSize(12).text('Universidad Santa Fe — Campus Paraíso', 50, 48);
    doc.fillColor('#D4AF37').fontSize(14).text('REFERENCIA DE PAGO', 0, 32, { align: 'right', width: doc.page.width - 50 });

    doc.moveDown(4);
    doc.fillColor('#333333').fontSize(11);

    const metodoNombre = metodoPago === 'SPEI' ? 'Transferencia SPEI' : 'Pago en OXXO';

    const campos = [
      ['Referencia:', referencia],
      ['Concepto:', concepto],
      ['Monto:', `$${parseFloat(monto).toFixed(2)} MXN`],
      ['Método de pago:', metodoNombre],
      ['Periodo:', periodo || 'No especificado'],
      ['Fecha de emisión:', new Date().toLocaleDateString('es-MX')],
      ['Fecha de vencimiento:', fechaVencimiento.toLocaleDateString('es-MX')],
    ];

    campos.forEach(([label, valor]) => {
      doc.font('Helvetica-Bold').text(label, 50, doc.y, { continued: true, width: 180 });
      doc.font('Helvetica').text(` ${valor}`);
      doc.moveDown(0.3);
    });

    doc.moveDown();
    doc.rect(50, doc.y, doc.page.width - 100, 50).fill('#f5f5f5');
    doc.fillColor('#0A2540').font('Helvetica-Bold').fontSize(10)
      .text('Instrucciones:', 60, doc.y - 40);
    doc.fillColor('#333333').font('Helvetica').fontSize(9)
      .text('Presente esta referencia en OXXO o úsela para realizar su transferencia SPEI. El pago se aplica en 24 horas hábiles.', 60, doc.y - 25, { width: doc.page.width - 120 });

    doc.end();
  } catch (error) {
    res.status(500).json({ error: 'Error al generar la referencia PDF.' });
  }
};

module.exports = { listarPagos, crearPago, actualizarEstadoPago, generarReferenciaPDF };
