// 🔹 Cargar variables de entorno PRIMERO
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { initDB } = require('./db'); // ← Importar función de inicialización de BD

// 🔹 Inicializar Express
const app = express();

// 🔹 Middleware global
app.use(cors()); // Permitir peticiones desde cualquier origen (ajustar en producción)
app.use(express.json()); // Parsear bodies JSON
app.use(express.urlencoded({ extended: true })); // Parsear formularios

// 🔹 Rutas públicas
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    time: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// 🔹 Rutas de la API (se montan después)
// Se requieren aquí para evitar circular dependencies
const authRoutes = require('./routes/auth.routes');
const movimientosRoutes = require('./routes/movimientos.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

app.use('/api/auth', authRoutes);
app.use('/api/movimientos', movimientosRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 🔹 Manejo de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada', path: req.path });
});

// 🔹 Manejo global de errores (500)
app.use((err, req, res, next) => {
  console.error('❌ Error no manejado:', err.stack);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Error interno del servidor' 
      : err.message 
  });
});

// 🔹 INICIALIZAR BASE DE DATOS Y LEVANTAR SERVIDOR
// Esto asegura que las tablas existen ANTES de aceptar peticiones
initDB()
  .then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
      console.log(`🧪 Health check: http://localhost:${PORT}/health`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((err) => {
    console.error('❌ FATAL: No se pudo conectar a la base de datos');
    console.error('💡 Verifica que DATABASE_URL esté configurada en Render');
    console.error('🔍 Error detallado:', err.message);
    // Salir con código de error para que Render detecte el fallo
    process.exit(1);
  });

// 🔹 Manejo de cierre elegante (opcional pero recomendado)
process.on('SIGINT', async () => {
  console.log('\n🛑 Recibido SIGINT, cerrando conexiones...');
  // Si usas pool, aquí podrías hacer: await pool.end();
  process.exit(0);
});