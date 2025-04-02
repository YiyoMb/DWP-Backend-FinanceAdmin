const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['income', 'expense'],
        required: true
    },
    icon: {
        type: String,
        default: 'default-icon' // Puedes usar nombres de iconos si implementas una librería de iconos
    },
    color: {
        type: String,
        default: '#808080' // Color por defecto
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // Null para categorías predeterminadas del sistema
        default: null
    }
}, { timestamps: true });

// Índices para mejorar el rendimiento
categorySchema.index({ user: 1, type: 1 });
categorySchema.index({ isDefault: 1 });

const Category = mongoose.model('Category', categorySchema);

// Crear categorías predeterminadas para el sistema
const createDefaultCategories = async () => {
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

    for (const category of defaultCategories) {
        // Verificar si la categoría ya existe
        const existingCategory = await Category.findOne({
            name: category.name,
            type: category.type,
            isDefault: true
        });

        if (!existingCategory) {
            await Category.create(category);
        }
    }

    console.log('Categorías predeterminadas creadas o verificadas');
};

module.exports = { Category, createDefaultCategories };