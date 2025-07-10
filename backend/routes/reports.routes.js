const express = require('express');
const Expense = require('../models/Expense.model');
const Income = require('../models/Income.model');
const Saving = require('../models/Saving.model');
const Goal = require('../models/Goal.model');
const auth = require('../middleware/auth.middleware');

const router = express.Router();

// Get financial overview
router.get('/overview', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateQuery = {};
    
    if (startDate && endDate) {
      dateQuery.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get total income
    const income = await Income.aggregate([
      { $match: { userId: req.user._id, ...dateQuery } },
      { $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Get total expenses
    const expenses = await Expense.aggregate([
      { $match: { userId: req.user._id, ...dateQuery } },
      { $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Get total savings
    const savings = await Saving.aggregate([
      { $match: { userId: req.user._id, ...dateQuery } },
      { $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Calculate financial health score (0-100)
    const totalIncome = income[0]?.total || 0;
    const totalExpenses = expenses[0]?.total || 0;
    const totalSavings = savings[0]?.total || 0;

    const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;
    const expenseRate = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
    
    let healthScore = 0;
    if (totalIncome > 0) {
      healthScore = Math.min(100, Math.max(0,
        50 + // Base score
        (savingsRate * 0.5) - // Bonus for savings
        (Math.max(0, expenseRate - 70) * 0.5) // Penalty for high expenses
      ));
    }

    res.json({
      overview: {
        totalIncome,
        totalExpenses,
        totalSavings,
        netIncome: totalIncome - totalExpenses,
        savingsRate,
        expenseRate,
        healthScore
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating overview report' });
  }
});

// Get expense analysis
router.get('/expenses', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateQuery = {};
    
    if (startDate && endDate) {
      dateQuery.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get expenses by category
    const expensesByCategory = await Expense.aggregate([
      { $match: { userId: req.user._id, ...dateQuery } },
      { $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Get monthly expenses
    const monthlyExpenses = await Expense.aggregate([
      { $match: { userId: req.user._id, ...dateQuery } },
      { $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      }
    ]);

    // Get top expenses
    const topExpenses = await Expense.find({
      userId: req.user._id,
      ...dateQuery
    })
    .sort({ amount: -1 })
    .limit(5);

    res.json({
      expenseAnalysis: {
        byCategory: expensesByCategory,
        monthly: monthlyExpenses,
        topExpenses
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating expense analysis' });
  }
});

// Get savings analysis
router.get('/savings', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateQuery = {};
    
    if (startDate && endDate) {
      dateQuery.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get savings by category
    const savingsByCategory = await Saving.aggregate([
      { $match: { userId: req.user._id, ...dateQuery } },
      { $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Get monthly savings
    const monthlySavings = await Saving.aggregate([
      { $match: { userId: req.user._id, ...dateQuery } },
      { $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      }
    ]);

    // Get goals progress
    const goals = await Goal.find({
      userId: req.user._id,
      status: { $ne: 'completed' }
    }).sort({ deadline: 1 });

    res.json({
      savingsAnalysis: {
        byCategory: savingsByCategory,
        monthly: monthlySavings,
        goalsProgress: goals
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating savings analysis' });
  }
});

// Get budget analysis
router.get('/budget', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Get monthly budget vs actual expenses
    const expenses = await Expense.aggregate([
      { $match: {
          userId: req.user._id,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      { $group: {
          _id: '$category',
          actual: { $sum: '$amount' }
        }
      }
    ]);

    // Get budget targets from settings (assuming they're stored there)
    const budgetTargets = {}; // This should be fetched from user settings

    // Compare budget vs actual
    const comparison = expenses.map(expense => ({
      category: expense._id,
      actual: expense.actual,
      target: budgetTargets[expense._id] || 0,
      variance: (budgetTargets[expense._id] || 0) - expense.actual
    }));

    res.json({
      budgetAnalysis: {
        month,
        year,
        comparison,
        totalActual: expenses.reduce((sum, exp) => sum + exp.actual, 0),
        totalTarget: Object.values(budgetTargets).reduce((sum, target) => sum + target, 0)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating budget analysis' });
  }
});

// Get trends analysis
router.get('/trends', auth, async (req, res) => {
  try {
    // Get 12-month trends
    const endDate = new Date();
    const startDate = new Date(endDate.getFullYear() - 1, endDate.getMonth(), 1);

    // Get monthly income trend
    const incomeTrend = await Income.aggregate([
      { $match: {
          userId: req.user._id,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      { $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      }
    ]);

    // Get monthly expense trend
    const expenseTrend = await Expense.aggregate([
      { $match: {
          userId: req.user._id,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      { $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      }
    ]);

    // Get monthly savings trend
    const savingsTrend = await Saving.aggregate([
      { $match: {
          userId: req.user._id,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      { $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      }
    ]);

    res.json({
      trends: {
        income: incomeTrend,
        expenses: expenseTrend,
        savings: savingsTrend,
        period: {
          start: startDate,
          end: endDate
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating trends analysis' });
  }
});

// Export report data
router.post('/export', auth, async (req, res) => {
  try {
    const { startDate, endDate, type, format } = req.body;
    const dateQuery = {};
    
    if (startDate && endDate) {
      dateQuery.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    let data;
    switch (type) {
      case 'expenses':
        data = await Expense.find({
          userId: req.user._id,
          ...dateQuery
        }).sort({ date: -1 });
        break;
      case 'income':
        data = await Income.find({
          userId: req.user._id,
          ...dateQuery
        }).sort({ date: -1 });
        break;
      case 'savings':
        data = await Saving.find({
          userId: req.user._id,
          ...dateQuery
        }).sort({ date: -1 });
        break;
      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }

    // Format data based on requested format (CSV, JSON, etc.)
    // This should be implemented based on your needs

    res.json({
      exportData: {
        type,
        format,
        data
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error exporting report data' });
  }
});

module.exports = router; 