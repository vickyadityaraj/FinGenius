const express = require('express');
const userRoutes = require('./user.routes');
const expenseRoutes = require('./expenses.routes');
const incomeRoutes = require('./income.routes');
const savingsRoutes = require('./savings.routes');
const goalsRoutes = require('./goals.routes');
const alertsRoutes = require('./alerts.routes');
const settingsRoutes = require('./settings.routes');
const reportsRoutes = require('./reports.routes');

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// Mount all routes
router.use('/users', userRoutes);
router.use('/expenses', expenseRoutes);
router.use('/income', incomeRoutes);
router.use('/savings', savingsRoutes);
router.use('/goals', goalsRoutes);
router.use('/alerts', alertsRoutes);
router.use('/settings', settingsRoutes);
router.use('/reports', reportsRoutes);

module.exports = router; 