require('dotenv').config();
const db = require('./db');

// Verificación rápida al iniciar
try {
  db.prepare('SELECT 1').get();
  console.log('✅ Base de datos conectada y tablas listas');
} catch (err) {
  console.error('❌ Error al conectar con la BD:', err.message);
  process.exit(1);
}

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Ruta de salud (para probar que funciona)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 🔹 Aquí irán las rutas cuando las creemos
// app.use('/api/auth', require('./routes/auth.routes'));
// app.use('/api/movimientos', require('./routes/movimientos.routes'));

const PORT = process.env.PORT || 3000;
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);
const movimientosRoutes = require('./routes/movimientos.routes');
app.use('/api/movimientos', movimientosRoutes);
const dashboardRoutes = require('./routes/dashboard.routes');
app.use('/api/dashboard', dashboardRoutes);
app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
  console.log(`🧪 Prueba ahora: http://localhost:${PORT}/health`);
});// Entry point for the application
