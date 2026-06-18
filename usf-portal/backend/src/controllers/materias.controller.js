// Controlador de materias.
// Solo el admin puede crear/modificar/desactivar; cualquier usuario autenticado puede listar.
const Materia = require('../models/Materia');
const Calificacion = require('../models/Calificacion');

// GET /api/materias — lista las materias activas; acepta ?periodo=XXXX para filtrar
const listar = async (req, res) => {
  try {
    const { periodo } = req.query;
    const filtro = { activa: true };
    if (periodo) filtro.periodo = periodo;
    const materias = await Materia.find(filtro)
      .populate('profesor_id', 'nombre apellido')
      .populate('seriacion', 'clave nombre');
    res.json(materias);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/materias — crea una materia nueva (admin)
const crear = async (req, res) => {
  try {
    const datos = { ...req.body };
    if (datos.cupoDisponible === undefined) datos.cupoDisponible = datos.cupoMaximo;
    if (!datos.profesor_id) delete datos.profesor_id;

    const materia = await Materia.create(datos);
    const materiaPopulada = await Materia.findById(materia._id)
      .populate('profesor_id', 'nombre apellido email')
      .populate('seriacion', 'clave nombre');
    res.status(201).json(materiaPopulada);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/materias/:id — actualiza cupo, horario u otros campos (admin)
const actualizar = async (req, res) => {
  try {
    const datos = { ...req.body };
    if (!datos.profesor_id) datos.profesor_id = null;

    const materia = await Materia.findByIdAndUpdate(req.params.id, datos, {
      new: true,
      runValidators: true
    })
      .populate('profesor_id', 'nombre apellido email')
      .populate('seriacion', 'clave nombre');
    if (!materia) return res.status(404).json({ message: 'Materia no encontrada' });

    if (datos.profesor_id) {
      await Calificacion.updateMany(
        { materia_id: materia._id, cerrada: false },
        { profesor_id: datos.profesor_id }
      );
    }

    res.json(materia);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/materias/:id — desactivación lógica, no borrado físico (admin)
const eliminar = async (req, res) => {
  try {
    const materia = await Materia.findByIdAndUpdate(req.params.id, { activa: false }, { new: true });
    if (!materia) return res.status(404).json({ message: 'Materia no encontrada' });
    res.json({ message: 'Materia desactivada' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { listar, crear, actualizar, eliminar };
