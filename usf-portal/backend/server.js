// Punto de entrada del servidor Express + SSE.
// Levanta la API REST y el canal de notificaciones en tiempo real.
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./src/config/db');

const app = express();
const httpServer = http.createServer(app);

// Auth uses JWT in localStorage (not cookies), so open CORS is safe here.
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// Conexión a MongoDB Atlas
connectDB();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Hace io accesible desde cualquier controlador via req.app.get('io')
app.set('io', io);

// Rutas de la API
app.use('/api/auth',           require('./src/routes/auth.routes'));
app.use('/api/materias',       require('./src/routes/materias.routes'));
app.use('/api/inscripciones',  require('./src/routes/inscripcion.routes'));
app.use('/api/calificaciones', require('./src/routes/calificaciones.routes'));
app.use('/api/historial',      require('./src/routes/historial.routes'));
app.use('/api/pagos',          require('./src/routes/pagos.routes'));
app.use('/api/notificaciones', require('./src/routes/notificaciones.routes'));
app.use('/api/adeudos',        require('./src/routes/adeudo.routes'));

// Health check sin autenticación — útil para CI y monitoreo
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'USF Portal API corriendo' });
});

// Socket.io — rooms por userId para mensajería interna
io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
  });
  socket.on('disconnect', () => {});
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT} - ${new Date().toISOString()}`);
});
