const Transaction = require('../models/Transaction');

// Obtener todas las transacciones del usuario
exports.getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id })
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: transactions.length,
            data: transactions
        });
    } catch (error) {
        console.error('Error al obtener transacciones:', error);
        res.status(500).json({
            success: false,
            error: 'Error del servidor al recuperar transacciones'
        });
    }
};

// Agregar una nueva transacción
exports.addTransaction = async (req, res) => {
    try {
        const { type, category, amount, description } = req.body;

        // Validaciones básicas
        if (!type || !category || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Por favor proporcione tipo, categoría y monto'
            });
        }

        // Crear transacción
        const transaction = await Transaction.create({
            user: req.user.id,
            type,
            category,
            amount,
            description: description || '',
            date: new Date()
        });

        res.status(201).json({
            success: true,
            data: transaction
        });
    } catch (error) {
        console.error('Error al crear transacción:', error);
        res.status(500).json({
            success: false,
            error: 'Error del servidor al crear transacción'
        });
    }
};

// Eliminar una transacción
exports.deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        // Verificar si la transacción existe
        if (!transaction) {
            return res.status(404).json({
                success: false,
                error: 'Transacción no encontrada'
            });
        }

        // Verificar si la transacción pertenece al usuario
        if (transaction.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'No autorizado'
            });
        }

        await transaction.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error('Error al eliminar transacción:', error);
        res.status(500).json({
            success: false,
            error: 'Error del servidor al eliminar transacción'
        });
    }
};

// Obtener resumen financiero
exports.getFinancialSummary = async (req, res) => {
    try {
        // Verificar que el usuario está autenticado
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }

        // Convertir el ID de usuario a ObjectId
        const mongoose = require('mongoose');
        let userId;

        try {
            userId = new mongoose.Types.ObjectId(req.user.id);
        } catch (err) {
            console.error('Error al convertir ID de usuario:', err);
            return res.status(400).json({
                success: false,
                error: 'ID de usuario inválido'
            });
        }

        // Añadir logs para depuración
        console.log('Buscando transacciones para usuario:', userId);

        // Obtener total de ingresos
        const incomeResult = await Transaction.aggregate([
            { $match: { user: userId, type: 'income' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        console.log('Resultado de ingresos:', incomeResult);

        // Obtener total de gastos
        const expenseResult = await Transaction.aggregate([
            { $match: { user: userId, type: 'expense' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        console.log('Resultado de gastos:', expenseResult);

        // Obtener gastos por categoría
        const expensesByCategory = await Transaction.aggregate([
            { $match: { user: userId, type: 'expense' } },
            { $group: { _id: '$category', total: { $sum: '$amount' } } },
            { $sort: { total: -1 } }
        ]);

        console.log('Gastos por categoría:', expensesByCategory);

        // Obtener ingresos por categoría
        const incomesByCategory = await Transaction.aggregate([
            { $match: { user: userId, type: 'income' } },
            { $group: { _id: '$category', total: { $sum: '$amount' } } },
            { $sort: { total: -1 } }
        ]);

        console.log('Ingresos por categoría:', incomesByCategory);

        // Calcular balance
        const incomeTotal = incomeResult.length > 0 ? incomeResult[0].total : 0;
        const expenseTotal = expenseResult.length > 0 ? expenseResult[0].total : 0;
        const balance = incomeTotal - expenseTotal;

        const responseData = {
            incomeTotal,
            expenseTotal,
            balance,
            expensesByCategory,
            incomesByCategory
        };

        console.log('Datos de respuesta:', responseData);

        res.status(200).json({
            success: true,
            data: responseData
        });
    } catch (error) {
        console.error('Error al obtener resumen financiero:', error);
        res.status(500).json({
            success: false,
            error: 'Error del servidor al obtener resumen financiero'
        });
    }
};