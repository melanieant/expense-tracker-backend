const { pool } = require('../db');

exports.getResumen = async (req, res) => {
  try {
    const userId = req.user.id;

    // 🔹 Totales
    const ingresosRes = await pool.query(
      `SELECT COALESCE(SUM(monto), 0) as total 
       FROM movimientos WHERE usuario_id = $1 AND tipo = 'ingreso'`,
      [userId]
    );
    const ingresos = parseFloat(ingresosRes.rows[0].total);

    const gastosRes = await pool.query(
      `SELECT COALESCE(SUM(monto), 0) as total 
       FROM movimientos WHERE usuario_id = $1 AND tipo = 'gasto'`,
      [userId]
    );
    const gastos = parseFloat(gastosRes.rows[0].total);

    // 🔹 Por categoría
    const categoriaRes = await pool.query(
      `SELECT categoria, SUM(monto) as total 
       FROM movimientos 
       WHERE usuario_id = $1 AND tipo = 'gasto' 
       GROUP BY categoria 
       ORDER BY total DESC`,
      [userId]
    );

    // 🔹 Recientes
    const recientesRes = await pool.query(
      `SELECT id, tipo, categoria, monto, fecha, nota 
       FROM movimientos 
       WHERE usuario_id = $1 
       ORDER BY fecha DESC, id DESC 
       LIMIT 5`,
      [userId]
    );

    res.json({
      ok: true,
      datos: {
        balance: ingresos - gastos,
        ingresos,
        gastos,
        porCategoria: categoriaRes.rows,
        recientes: recientesRes.rows
      }
    });
  } catch (err) {
    console.error('❌ Error en dashboard:', err.message);
    res.status(500).json({ error: 'Error: ' + err.message });
  }
};