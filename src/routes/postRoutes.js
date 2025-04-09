const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { protect } = require('../middlewares/authMiddleware');

// Rutas públicas
router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPostById);

// Rutas protegidas (requieren autenticación)
router.post('/', protect, postController.createPost);
router.put('/:id', protect, postController.updatePost);
router.delete('/:id', protect, postController.deletePost);
router.post('/:id/comments', protect, postController.addComment);
router.post('/:id/like', protect, postController.likePost);

module.exports = router;