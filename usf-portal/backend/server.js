require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const connectDB = require('./src/config/database');
require('./src/config/passport');

const authRoutes = require('./src/routes/auth.routes');
const materiaRoutes = require('./src/routes/materia.routes');
const inscripcionRoutes = require('./src/routes/inscripcion.routes');
const calificacionRoutes = require('./src/routes/calificacion.routes');
const historialRoutes = require('./src/routes/historial.routes');
const adeudoRoutes = require('./src/routes/adeudo.routes');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/materias', materiaRoutes);
app.use('/api/inscripciones', inscripcionRoutes);
app.use('/api/calificaciones', calificacionRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api/adeudos', adeudoRoutes);

// Error handler global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Error interno del servidor.' });
});

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Servidor USF Portal corriendo en puerto ${PORT}`));
});

module.exports = app;
