const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: [true, 'El monto es requerido']
    },
    duration: {
        type: Number,
        required: [true, 'El plazo es requerido']
    },
    description: {
        type: String,
        default: ''
    },
    targetDate: {
        type: Date,
        default: function() {
            const today = new Date();
            return new Date(today.setMonth(today.getMonth() + this.duration));
        }
    },
    currentAmount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Método virtual para calcular el porcentaje de progreso
goalSchema.virtual('progress').get(function() {
    return (this.currentAmount / this.amount) * 100;
});

// Método virtual para calcular el monto mensual requerido
goalSchema.virtual('monthlyAmount').get(function() {
    return this.amount / this.duration;
});

const Goal = mongoose.model('Goal', goalSchema);

module.exports = Goal;