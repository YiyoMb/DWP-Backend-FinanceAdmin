const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
    getTransactions,
    addTransaction,
    deleteTransaction,
    getFinancialSummary
} = require('../controllers/transactionController');

// Todas las rutas están protegidas y requieren autenticación
router.use(protect);

// Rutas para las transacciones
router.route('/')
    .get(getTransactions)
    .post(addTransaction);

router.route('/:id')
    .delete(deleteTransaction);

// Ruta para obtener el resumen financiero
router.get('/summary', getFinancialSummary);

module.exports = router;