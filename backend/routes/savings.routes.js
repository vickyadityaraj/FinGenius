const express = require('express');
const Saving = require('../models/Savings.model');
const auth = require('../middleware/auth.middleware');

const router = express.Router();

// Get all savings entries
router.get('/', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { userId: req.user._id };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const savings = await Saving.find(query)
      .sort({ date: -1 });

    // Calculate total savings
    const totalSavings = savings.reduce((acc, curr) => acc + curr.amount, 0);

    // Calculate savings by category
    const savingsByCategory = await Saving.aggregate([
      { $match: { userId: req.user._id } },
      { $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      }
    ]);

    res.json({
      savings,
      totalSavings,
      savingsByCategory
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching savings' });
  }
});

// Add new saving entry
router.post('/', auth, async (req, res) => {
  try {
    const {
      amount,
      category,
      description,
      date,
      source,
      isRecurring,
      recurringFrequency,
      tags
    } = req.body;

    const saving = new Saving({
      userId: req.user._id,
      amount,
      category,
      description,
      date: date || new Date(),
      source,
      isRecurring,
      recurringFrequency,
      tags: tags || []
    });

    await saving.save();
    res.status(201).json({ saving });
  } catch (error) {
    res.status(500).json({ message: 'Error creating saving entry' });
  }
});

// Update saving entry
router.patch('/:id', auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = [
      'amount',
      'category',
      'description',
      'date',
      'source',
      'isRecurring',
      'recurringFrequency',
      'tags'
    ];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates' });
    }

    const saving = await Saving.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!saving) {
      return res.status(404).json({ message: 'Saving entry not found' });
    }

    updates.forEach(update => {
      saving[update] = req.body[update];
    });

    await saving.save();
    res.json({ saving });
  } catch (error) {
    res.status(500).json({ message: 'Error updating saving entry' });
  }
});

// Delete saving entry
router.delete('/:id', auth, async (req, res) => {
  try {
    const saving = await Saving.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!saving) {
      return res.status(404).json({ message: 'Saving entry not found' });
    }

    res.json({ saving });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting saving entry' });
  }
});

// Get savings statistics
router.get('/stats', auth, async (req, res) => {
  try {
    // Get total savings
    const totalSavings = await Saving.aggregate([
      { $match: { userId: req.user._id } },
      { $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Get monthly savings
    const monthlySavings = await Saving.aggregate([
      { $match: { userId: req.user._id } },
      { $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: {
          '_id.year': -1,
          '_id.month': -1
        }
      }
    ]);

    // Get savings by category
    const savingsByCategory = await Saving.aggregate([
      { $match: { userId: req.user._id } },
      { $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Get recurring savings
    const recurringSavings = await Saving.find({
      userId: req.user._id,
      isRecurring: true
    }).sort({ amount: -1 });

    res.json({
      totalSavings: totalSavings[0]?.total || 0,
      monthlySavings,
      savingsByCategory,
      recurringSavings
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching savings statistics' });
  }
});

module.exports = router; 