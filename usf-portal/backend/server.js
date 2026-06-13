require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./src/config/database');
const timingMiddleware = require('./src/middleware/timing');

const authRoutes = require('./src/routes/auth.routes');
const materiaRoutes = require('./src/routes/materia.routes');
const inscripcionRoutes = require('./src/routes/inscripcion.routes');
const calificacionRoutes = require('./src/routes/calificacion.routes');
const historialRoutes = require('./src/routes/historial.routes');
const adeudoRoutes = require('./src/routes/adeudo.routes');
const pagosRoutes = require('./src/routes/pagos.routes');
const notificacionesRoutes = require('./src/routes/notificaciones.routes');

const app = express();
const server = http.createServer(app);

// RF-22: Socket.io para notificaciones en tiempo real
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:4200', credentials: true },
});

app.set('io', io);

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    socket.join(userId);
  });
  socket.on('disconnect', () => {});
});

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:4200', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// RNF-04: Middleware de timing para medir latencia de respuestas
app.use(timingMiddleware);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'USF Portal API corriendo' });
});

app.use('/api/auth', authRoutes);
app.use('/api/materias', materiaRoutes);
app.use('/api/inscripciones', inscripcionRoutes);
app.use('/api/calificaciones', calificacionRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api/adeudos', adeudoRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/notificaciones', notificacionesRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Error interno del servidor.' });
});

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  server.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
});

module.exports = { app, io };
