const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

exports.register = (req, res) => {
  const { nombre, email, password } = req.body;
  if (!nombre || !email || !password) return res.status(400).json({ error: 'Faltan campos obligatorios' });

  try {
    const existe = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email);
    if (existe) return res.status(409).json({ error: 'El email ya está registrado' });

    const hash = bcrypt.hashSync(password, 10);
    const stmt = db.prepare('INSERT INTO usuarios (nombre, email, password_hash) VALUES (?, ?, ?)');
    const result = stmt.run(nombre, email, hash);

    res.status(201).json({ message: 'Usuario creado', userId: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña son obligatorios' });

  try {
    const user = db.prepare('SELECT id, nombre, email, password_hash FROM usuarios WHERE email = ?').get(email);
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Login exitoso', token, user: { id: user.id, nombre: user.nombre, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};