const db = require('../db');

// 🔹 LISTAR movimientos del usuario logueado
exports.getMovimientos = (req, res) => {
  try {
    const movimientos = db
      .prepare('SELECT * FROM movimientos WHERE usuario_id = ? ORDER BY fecha DESC')
      .all(req.user.id);
    res.json({ ok: true, datos: movimientos });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener movimientos' });
  }
};

// 🔹 CREAR nuevo movimiento
exports.createMovimiento = (req, res) => {
  const { tipo, categoria, monto, fecha, nota } = req.body;
  if (!tipo || !categoria || !monto || !fecha) {
    return res.status(400).json({ error: 'Faltan campos obligatorios: tipo, categoria, monto, fecha' });
  }
  if (!['ingreso', 'gasto'].includes(tipo)) {
    return res.status(400).json({ error: 'Tipo debe ser "ingreso" o "gasto"' });
  }
  if (monto <= 0) {
    return res.status(400).json({ error: 'El monto debe ser mayor a 0' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO movimientos (usuario_id, tipo, categoria, monto, fecha, nota)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(req.user.id, tipo, categoria, monto, fecha, nota || null);
    res.status(201).json({ ok: true, mensaje: 'Movimiento creado', id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear movimiento' });
  }
};

// 🔹 ACTUALIZAR movimiento (solo si es del usuario)
exports.updateMovimiento = (req, res) => {
  const { id } = req.params;
  const { tipo, categoria, monto, fecha, nota } = req.body;

  try {
    // Verificar que el movimiento existe y es del usuario
    const existe = db.prepare('SELECT id FROM movimientos WHERE id = ? AND usuario_id = ?').get(id, req.user.id);
    if (!existe) return res.status(404).json({ error: 'Movimiento no encontrado' });

    const stmt = db.prepare(`
      UPDATE movimientos 
      SET tipo = COALESCE(?, tipo), 
          categoria = COALESCE(?, categoria), 
          monto = COALESCE(?, monto), 
          fecha = COALESCE(?, fecha), 
          nota = COALESCE(?, nota)
      WHERE id = ?
    `);
    stmt.run(tipo, categoria, monto, fecha, nota, id);
    res.json({ ok: true, mensaje: 'Movimiento actualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar movimiento' });
  }
};

// 🔹 ELIMINAR movimiento (solo si es del usuario)
exports.deleteMovimiento = (req, res) => {
  const { id } = req.params;
  try {
    const existe = db.prepare('SELECT id FROM movimientos WHERE id = ? AND usuario_id = ?').get(id, req.user.id);
    if (!existe) return res.status(404).json({ error: 'Movimiento no encontrado' });

    db.prepare('DELETE FROM movimientos WHERE id = ?').run(id);
    res.json({ ok: true, mensaje: 'Movimiento eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar movimiento' });
  }
};