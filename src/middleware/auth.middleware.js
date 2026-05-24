const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer <token>"

  if (!token) return res.status(401).json({ error: 'Acceso denegado. Token requerido' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Ahora req.user tiene { id, email }
    next();
  } catch {
    res.status(403).json({ error: 'Token inválido o expirado' });
  }
};