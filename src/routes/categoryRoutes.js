const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    createDefaultCategories
} = require('../controllers/categoryController');

// Todas las rutas están protegidas
router.use(protect);

// Rutas para las categorías
router.route('/')
    .get(getCategories)
    .post(createCategory);

router.route('/:id')
    .put(updateCategory)
    .delete(deleteCategory);

router.route('/create-default-categories')
    .post(createDefaultCategories);

module.exports = router;