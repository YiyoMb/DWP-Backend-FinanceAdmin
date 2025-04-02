const { Category } = require('../models/Category');

// Obtener todas las categorías (predeterminadas y del usuario)
exports.getCategories = async (req, res) => {
    try {
        // Buscar categorías predeterminadas y las del usuario
        const categories = await Category.find({
            $or: [
                { isDefault: true },
                { user: req.user.id }
            ]
        }).sort({ type: 1, name: 1 });

        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({
            success: false,
            error: 'Error del servidor al recuperar categorías'
        });
    }
};

// Crear una nueva categoría personalizada
exports.createCategory = async (req, res) => {
    try {
        const { name, type, icon, color } = req.body;

        // Validaciones básicas
        if (!name || !type) {
            return res.status(400).json({
                success: false,
                error: 'Por favor proporcione nombre y tipo'
            });
        }

        // Verificar si ya existe una categoría con el mismo nombre y tipo para este usuario
        const existingCategory = await Category.findOne({
            name,
            type,
            user: req.user.id
        });

        if (existingCategory) {
            return res.status(400).json({
                success: false,
                error: 'Ya existe una categoría con ese nombre y tipo'
            });
        }

        // Crear la categoría
        const category = await Category.create({
            name,
            type,
            icon: icon || 'circle',
            color: color || '#808080',
            isDefault: false,
            user: req.user.id
        });

        res.status(201).json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error('Error al crear categoría:', error);
        res.status(500).json({
            success: false,
            error: 'Error del servidor al crear categoría'
        });
    }
};

// Actualizar una categoría personalizada
exports.updateCategory = async (req, res) => {
    try {
        const { name, icon, color } = req.body;

        // Buscar la categoría
        const category = await Category.findById(req.params.id);

        // Verificar si la categoría existe
        if (!category) {
            return res.status(404).json({
                success: false,
                error: 'Categoría no encontrada'
            });
        }

        // Verificar si es una categoría predeterminada
        if (category.isDefault) {
            return res.status(403).json({
                success: false,
                error: 'No se pueden modificar las categorías predeterminadas'
            });
        }

        // Verificar si pertenece al usuario
        if (category.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'No autorizado'
            });
        }

        // Actualizar la categoría
        category.name = name || category.name;
        category.icon = icon || category.icon;
        category.color = color || category.color;

        await category.save();

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error('Error al actualizar categoría:', error);
        res.status(500).json({
            success: false,
            error: 'Error del servidor al actualizar categoría'
        });
    }
};

// Eliminar una categoría personalizada
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        // Verificar si la categoría existe
        if (!category) {
            return res.status(404).json({
                success: false,
                error: 'Categoría no encontrada'
            });
        }

        // Verificar si es una categoría predeterminada
        if (category.isDefault) {
            return res.status(403).json({
                success: false,
                error: 'No se pueden eliminar las categorías predeterminadas'
            });
        }

        // Verificar si pertenece al usuario
        if (category.user && category.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'No autorizado'
            });
        }

        await category.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error('Error al eliminar categoría:', error);
        res.status(500).json({
            success: false,
            error: 'Error del servidor al eliminar categoría'
        });
    }
};

exports.createDefaultCategories = async (req, res) => {
    try {
        // Array de categorías predeterminadas
        const defaultCategories = [
            // Categorías de ingresos
            { name: 'Salario', type: 'income', icon: 'wallet', color: '#2E7D32', isDefault: true },
            { name: 'Inversiones', type: 'income', icon: 'trending-up', color: '#1565C0', isDefault: true },
            { name: 'Freelance', type: 'income', icon: 'code', color: '#6200EA', isDefault: true },
            { name: 'Regalo', type: 'income', icon: 'gift', color: '#C2185B', isDefault: true },
            { name: 'Otros Ingresos', type: 'income', icon: 'plus-circle', color: '#00796B', isDefault: true },

            // Categorías de gastos
            { name: 'Alimentación', type: 'expense', icon: 'shopping-cart', color: '#D32F2F', isDefault: true },
            { name: 'Vivienda', type: 'expense', icon: 'home', color: '#7B1FA2', isDefault: true },
            { name: 'Transporte', type: 'expense', icon: 'car', color: '#0288D1', isDefault: true },
            { name: 'Servicios', type: 'expense', icon: 'zap', color: '#FFA000', isDefault: true },
            { name: 'Entretenimiento', type: 'expense', icon: 'film', color: '#00796B', isDefault: true },
            { name: 'Salud', type: 'expense', icon: 'activity', color: '#D81B60', isDefault: true },
            { name: 'Educación', type: 'expense', icon: 'book', color: '#5E35B1', isDefault: true },
            { name: 'Ropa', type: 'expense', icon: 'shopping-bag', color: '#F4511E', isDefault: true },
            { name: 'Otros Gastos', type: 'expense', icon: 'more-horizontal', color: '#455A64', isDefault: true }
        ];

        // Iterar sobre cada categoría y crearla si no existe
        for (const category of defaultCategories) {
            const existingCategory = await Category.findOne({ name: category.name, type: category.type, isDefault: true });

            if (!existingCategory) {
                await Category.create({ ...category, isDefault: true });
            }
        }

        res.status(200).json({
            success: true,
            message: "Categorías predeterminadas creadas correctamente"
        });
    } catch (error) {
        console.error("Error al crear categorías predeterminadas:", error);
        res.status(500).json({
            success: false,
            error: "Error del servidor al crear categorías predeterminadas"
        });
    }
};
