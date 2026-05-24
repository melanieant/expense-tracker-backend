const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const { getResumen } = require('../controllers/dashboard.controller');

// 🔒 Protegida: solo usuarios logueados
router.get('/resumen', auth, getResumen);

module.exports = router;