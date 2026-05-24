const db = require('../db');

exports.getResumen = (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const userId = req.user.id;

    // 🔹 NOTA: Usa comillas SIMPLES ' para valores de texto en SQL
    const ingresos = db
      .prepare('SELECT COALESCE(SUM(monto), 0) as total FROM movimientos WHERE usuario_id = ? AND tipo = \'ingreso\'')
      .get(userId)?.total || 0;

    const gastos = db
      .prepare('SELECT COALESCE(SUM(monto), 0) as total FROM movimientos WHERE usuario_id = ? AND tipo = \'gasto\'')
      .get(userId)?.total || 0;

    // 🔹 Gastos por categoría (con comillas simples)
    const porCategoria = db
      .prepare(`
        SELECT categoria, SUM(monto) as total 
        FROM movimientos 
        WHERE usuario_id = ? AND tipo = 'gasto' 
        GROUP BY categoria 
        ORDER BY total DESC
      `)
      .all(userId);

    // 🔹 Últimos movimientos
    const recientes = db
      .prepare(`
        SELECT id, tipo, categoria, monto, fecha, nota 
        FROM movimientos 
        WHERE usuario_id = ? 
        ORDER BY fecha DESC, id DESC 
        LIMIT 5
      `)
      .all(userId);

    res.json({
      ok: true,
      datos: {
        balance: ingresos - gastos,
        ingresos,
        gastos,
        porCategoria: porCategoria.length ? porCategoria : [],
        recientes
      }
    });

  } catch (err) {
    console.error('❌ Error en dashboard:', err.message);
    res.status(500).json({ error: 'Error: ' + err.message });
  }
};