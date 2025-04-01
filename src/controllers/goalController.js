const Goal = require('../models/Goal');

// Obtener todas las metas del usuario
exports.getUserGoals = async (req, res) => {
    try {
        const goals = await Goal.find({ userId: req.user.id });

        return res.status(200).json({
            success: true,
            count: goals.length,
            data: goals
        });
    } catch (error) {
        console.error('Error al obtener las metas:', error);
        return res.status(500).json({
            success: false,
            error: 'Error del servidor'
        });
    }
};

// Crear una nueva meta
exports.createGoal = async (req, res) => {
    try {
        const { amount, duration, description } = req.body;

        // Validar datos
        if (!amount || !duration) {
            return res.status(400).json({
                success: false,
                error: 'Por favor proporciona el monto y el plazo'
            });
        }

        // Crear la meta
        const goal = await Goal.create({
            userId: req.user.id,
            amount,
            duration,
            description: description || ''
        });

        return res.status(201).json({
            success: true,
            data: goal
        });
    } catch (error) {
        console.error('Error al crear la meta:', error);
        return res.status(500).json({
            success: false,
            error: 'Error del servidor'
        });
    }
};

// Obtener una meta específica
exports.getGoal = async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);

        if (!goal) {
            return res.status(404).json({
                success: false,
                error: 'Meta no encontrada'
            });
        }

        // Verificar que la meta pertenezca al usuario
        if (goal.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'No autorizado'
            });
        }

        return res.status(200).json({
            success: true,
            data: goal
        });
    } catch (error) {
        console.error('Error al obtener la meta:', error);
        return res.status(500).json({
            success: false,
            error: 'Error del servidor'
        });
    }
};

// Actualizar una meta
exports.updateGoal = async (req, res) => {
    try {
        const { amount, duration, description, currentAmount } = req.body;

        let goal = await Goal.findById(req.params.id);

        if (!goal) {
            return res.status(404).json({
                success: false,
                error: 'Meta no encontrada'
            });
        }

        // Verificar que la meta pertenezca al usuario
        if (goal.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'No autorizado'
            });
        }

        // Actualizar los campos
        goal = await Goal.findByIdAndUpdate(req.params.id, {
            amount: amount !== undefined ? amount : goal.amount,
            duration: duration !== undefined ? duration : goal.duration,
            description: description !== undefined ? description : goal.description,
            currentAmount: currentAmount !== undefined ? currentAmount : goal.currentAmount,
            updatedAt: Date.now()
        }, { new: true });

        return res.status(200).json({
            success: true,
            data: goal
        });
    } catch (error) {
        console.error('Error al actualizar la meta:', error);
        return res.status(500).json({
            success: false,
            error: 'Error del servidor'
        });
    }
};

// Eliminar una meta
exports.deleteGoal = async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);

        if (!goal) {
            return res.status(404).json({
                success: false,
                error: 'Meta no encontrada'
            });
        }

        // Verificar que la meta pertenezca al usuario
        if (goal.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'No autorizado'
            });
        }

        await Goal.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error('Error al eliminar la meta:', error);
        return res.status(500).json({
            success: false,
            error: 'Error del servidor'
        });
    }
};

// Actualizar el progreso de una meta
exports.updateGoalProgress = async (req, res) => {
    try {
        const { currentAmount } = req.body;

        if (currentAmount === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Por favor proporciona el monto actual'
            });
        }

        let goal = await Goal.findById(req.params.id);

        if (!goal) {
            return res.status(404).json({
                success: false,
                error: 'Meta no encontrada'
            });
        }

        // Verificar que la meta pertenezca al usuario
        if (goal.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'No autorizado'
            });
        }

        // Actualizar el progreso
        goal = await Goal.findByIdAndUpdate(req.params.id, {
            currentAmount,
            updatedAt: Date.now()
        }, { new: true });

        return res.status(200).json({
            success: true,
            data: goal
        });
    } catch (error) {
        console.error('Error al actualizar el progreso:', error);
        return res.status(500).json({
            success: false,
            error: 'Error del servidor'
        });
    }
};