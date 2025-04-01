const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
    getUserGoals,
    createGoal,
    getGoal,
    updateGoal,
    deleteGoal,
    updateGoalProgress
} = require('../controllers/goalController');

// Proteger todas las rutas con el middleware de autenticación
router.use(protect);

// Rutas para goals
router.route('/')
    .get(getUserGoals)
    .post(createGoal);

router.route('/:id')
    .get(getGoal)
    .put(updateGoal)
    .delete(deleteGoal);

// Ruta específica para actualizar el progreso de una meta
router.put('/:id/progress', updateGoalProgress);

module.exports = router;