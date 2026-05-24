const { pool } = require('../db');

// 🔹 LISTAR movimientos del usuario
exports.getMovimientos = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM movimientos WHERE usuario_id = $1 ORDER BY fecha DESC',
      [req.user.id]
    );
    res.json({ ok: true, datos: result.rows });
  } catch (err) {
    console.error('❌ Error al obtener movimientos:', err.message);
    res.status(500).json({ error: 'Error al obtener movimientos' });
  }
};

// 🔹 CREAR nuevo movimiento
exports.createMovimiento = async (req, res) => {
  const { tipo, categoria, monto, fecha, nota } = req.body;
  if (!tipo || !categoria || !monto || !fecha) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  if (!['ingreso', 'gasto'].includes(tipo)) {
    return res.status(400).json({ error: 'Tipo debe ser "ingreso" o "gasto"' });
  }
  if (monto <= 0) {
    return res.status(400).json({ error: 'El monto debe ser mayor a 0' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO movimientos (usuario_id, tipo, categoria, monto, fecha, nota)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [req.user.id, tipo, categoria, monto, fecha, nota || null]
    );
    res.status(201).json({ 
      ok: true, 
      mensaje: 'Movimiento creado', 
      id: result.rows[0].id 
    });
  } catch (err) {
    console.error('❌ Error al crear movimiento:', err.message);
    res.status(500).json({ error: 'Error al crear movimiento' });
  }
};

// 🔹 ACTUALIZAR movimiento
exports.updateMovimiento = async (req, res) => {
  const { id } = req.params;
  const { tipo, categoria, monto, fecha, nota } = req.body;

  try {
    // Verificar que existe y es del usuario
    const check = await pool.query(
      'SELECT id FROM movimientos WHERE id = $1 AND usuario_id = $2',
      [id, req.user.id]
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Movimiento no encontrado' });
    }

    await pool.query(
      `UPDATE movimientos 
       SET tipo = COALESCE($1, tipo), 
           categoria = COALESCE($2, categoria), 
           monto = COALESCE($3, monto), 
           fecha = COALESCE($4, fecha), 
           nota = COALESCE($5, nota)
       WHERE id = $6`,
      [tipo, categoria, monto, fecha, nota, id]
    );
    res.json({ ok: true, mensaje: 'Movimiento actualizado' });
  } catch (err) {
    console.error('❌ Error al actualizar:', err.message);
    res.status(500).json({ error: 'Error al actualizar movimiento' });
  }
};

// 🔹 ELIMINAR movimiento
exports.deleteMovimiento = async (req, res) => {
  const { id } = req.params;
  try {
    const check = await pool.query(
      'SELECT id FROM movimientos WHERE id = $1 AND usuario_id = $2',
      [id, req.user.id]
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Movimiento no encontrado' });
    }

    await pool.query('DELETE FROM movimientos WHERE id = $1', [id]);
    res.json({ ok: true, mensaje: 'Movimiento eliminado' });
  } catch (err) {
    console.error('❌ Error al eliminar:', err.message);
    res.status(500).json({ error: 'Error al eliminar movimiento' });
  }
};