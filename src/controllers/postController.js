const Post = require('../models/Post');

// Obtener todos los posts
exports.getAllPosts = async (req, res) => {
    try {
        // Implementamos paginación
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Filtramos por categoría si se proporciona
        const filter = req.query.category ? { category: req.query.category } : {};

        const posts = await Post.find(filter)
            .populate('user', 'fullName email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalPosts = await Post.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: posts,
            pagination: {
                totalPosts,
                currentPage: page,
                totalPages: Math.ceil(totalPosts / limit),
                hasNextPage: page < Math.ceil(totalPosts / limit),
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener los posts',
            error: error.message
        });
    }
};

// Crear un nuevo post
exports.createPost = async (req, res) => {
    try {
        const { title, content, category } = req.body;

        // Verificar que los campos necesarios estén presentes
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Por favor proporciona un título y contenido para tu post'
            });
        }

        const newPost = new Post({
            title,
            content,
            category: category || 'General',
            user: req.user.id
        });

        await newPost.save();

        // Populate the user field for the response
        await newPost.populate('user', 'fullName email');

        res.status(201).json({
            success: true,
            message: 'Post creado exitosamente',
            data: newPost
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear el post',
            error: error.message
        });
    }
};

// Obtener un post específico
exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('user', 'fullName email')
            .populate('comments.user', 'fullName email');

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: post
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el post',
            error: error.message
        });
    }
};

// Actualizar un post
exports.updatePost = async (req, res) => {
    try {
        const { title, content, category } = req.body;

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post no encontrado'
            });
        }

        // Verificar que el usuario sea el dueño del post
        if (post.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para actualizar este post'
            });
        }

        const updatedPost = await Post.findByIdAndUpdate(
            req.params.id,
            { title, content, category, updatedAt: Date.now() },
            { new: true, runValidators: true }
        ).populate('user', 'fullName email');

        res.status(200).json({
            success: true,
            message: 'Post actualizado exitosamente',
            data: updatedPost
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el post',
            error: error.message
        });
    }
};

// Eliminar un post
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post no encontrado'
            });
        }

        // Verificar que el usuario sea el dueño del post
        if (post.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para eliminar este post'
            });
        }

        await Post.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Post eliminado exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el post',
            error: error.message
        });
    }
};

// Añadir un comentario a un post
exports.addComment = async (req, res) => {
    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({
                success: false,
                message: 'Por favor proporciona el contenido del comentario'
            });
        }

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post no encontrado'
            });
        }

        const newComment = {
            user: req.user.id,
            content
        };

        post.comments.unshift(newComment);
        await post.save();

        // Poblar la información del usuario para devolver comentario completo
        await post.populate('comments.user', 'fullName email');

        res.status(201).json({
            success: true,
            message: 'Comentario añadido exitosamente',
            data: post.comments[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al añadir el comentario',
            error: error.message
        });
    }
};

// Dar like a un post
exports.likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post no encontrado'
            });
        }

        // Verificar si el usuario ya dio like
        const alreadyLiked = post.likes.includes(req.user.id);

        if (alreadyLiked) {
            // Remover like
            post.likes = post.likes.filter(like => like.toString() !== req.user.id);
        } else {
            // Añadir like
            post.likes.push(req.user.id);
        }

        await post.save();

        res.status(200).json({
            success: true,
            message: 'Like actualizado exitosamente',
            likesCount: post.likes.length,
            hasLiked: !alreadyLiked
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el like',
            error: error.message
        });
    }
};