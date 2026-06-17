require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./src/config/db');

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: 'http://localhost:4200', methods: ['GET', 'POST'] }
});

// Conexión a MongoDB
connectDB();

// Middleware
app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

// Hacer io accesible desde los controladores
app.set('io', io);

// Rutas
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/materias', require('./src/routes/materias.routes'));
app.use('/api/inscripciones', require('./src/routes/inscripciones.routes'));
app.use('/api/calificaciones', require('./src/routes/calificaciones.routes'));
app.use('/api/historial', require('./src/routes/historial.routes'));
app.use('/api/pagos', require('./src/routes/pagos.routes'));
app.use('/api/notificaciones', require('./src/routes/notificaciones.routes'));
app.use('/api/adeudos', require('./src/routes/adeudo.routes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'USF Portal API corriendo' });
});

// Socket.io — autenticación por sala de usuario
io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
  });

  socket.on('disconnect', () => {});
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`);
});
