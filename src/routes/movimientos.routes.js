const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const {
  getMovimientos,
  createMovimiento,
  updateMovimiento,
  deleteMovimiento
} = require('../controllers/movimientos.controller');

// Todas las rutas están protegidas por el middleware 'auth'
router.get('/', auth, getMovimientos);
router.post('/', auth, createMovimiento);
router.put('/:id', auth, updateMovimiento);
router.delete('/:id', auth, deleteMovimiento);

module.exports = router;