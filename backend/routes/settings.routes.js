const express = require('express');
const Settings = require('../models/Settings.model');
const auth = require('../middleware/auth.middleware');

const router = express.Router();

// Get user settings
router.get('/', auth, async (req, res) => {
  try {
    let settings = await Settings.findOne({ userId: req.user._id });
    
    if (!settings) {
      // Create default settings if none exist
      settings = new Settings({
        userId: req.user._id,
        currency: 'INR',
        language: 'en',
        theme: 'light',
        notifications: {
          email: true,
          push: true,
          budgetAlerts: true,
          goalReminders: true,
          billReminders: true
        },
        budgetPreferences: {
          startDayOfMonth: 1,
          monthlyBudget: 0,
          savingsTarget: 0,
          categories: []
        },
        displayPreferences: {
          defaultView: 'monthly',
          showDecimals: true,
          compactNumbers: false
        },
        exportPreferences: {
          format: 'csv',
          includeCategories: true,
          includeTags: true,
          dateFormat: 'YYYY-MM-DD'
        }
      });
      await settings.save();
    }

    res.json({ settings });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings' });
  }
});

// Update settings
router.patch('/', auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = [
      'currency',
      'language',
      'theme',
      'notifications',
      'budgetPreferences',
      'displayPreferences',
      'exportPreferences'
    ];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates' });
    }

    let settings = await Settings.findOne({ userId: req.user._id });

    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }

    updates.forEach(update => {
      if (typeof req.body[update] === 'object') {
        settings[update] = { ...settings[update], ...req.body[update] };
      } else {
        settings[update] = req.body[update];
      }
    });

    await settings.save();
    res.json({ settings });
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings' });
  }
});

// Reset settings to default
router.post('/reset', auth, async (req, res) => {
  try {
    await Settings.findOneAndDelete({ userId: req.user._id });
    
    const defaultSettings = new Settings({
      userId: req.user._id,
      currency: 'INR',
      language: 'en',
      theme: 'light',
      notifications: {
        email: true,
        push: true,
        budgetAlerts: true,
        goalReminders: true,
        billReminders: true
      },
      budgetPreferences: {
        startDayOfMonth: 1,
        monthlyBudget: 0,
        savingsTarget: 0,
        categories: []
      },
      displayPreferences: {
        defaultView: 'monthly',
        showDecimals: true,
        compactNumbers: false
      },
      exportPreferences: {
        format: 'csv',
        includeCategories: true,
        includeTags: true,
        dateFormat: 'YYYY-MM-DD'
      }
    });

    await defaultSettings.save();
    res.json({ settings: defaultSettings });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting settings' });
  }
});

// Update notification settings
router.patch('/notifications', auth, async (req, res) => {
  try {
    const settings = await Settings.findOne({ userId: req.user._id });

    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }

    settings.notifications = {
      ...settings.notifications,
      ...req.body
    };

    await settings.save();
    res.json({ notifications: settings.notifications });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification settings' });
  }
});

// Update budget preferences
router.patch('/budget-preferences', auth, async (req, res) => {
  try {
    const settings = await Settings.findOne({ userId: req.user._id });

    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }

    settings.budgetPreferences = {
      ...settings.budgetPreferences,
      ...req.body
    };

    await settings.save();
    res.json({ budgetPreferences: settings.budgetPreferences });
  } catch (error) {
    res.status(500).json({ message: 'Error updating budget preferences' });
  }
});

// Update display preferences
router.patch('/display-preferences', auth, async (req, res) => {
  try {
    const settings = await Settings.findOne({ userId: req.user._id });

    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }

    settings.displayPreferences = {
      ...settings.displayPreferences,
      ...req.body
    };

    await settings.save();
    res.json({ displayPreferences: settings.displayPreferences });
  } catch (error) {
    res.status(500).json({ message: 'Error updating display preferences' });
  }
});

// Update export preferences
router.patch('/export-preferences', auth, async (req, res) => {
  try {
    const settings = await Settings.findOne({ userId: req.user._id });

    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }

    settings.exportPreferences = {
      ...settings.exportPreferences,
      ...req.body
    };

    await settings.save();
    res.json({ exportPreferences: settings.exportPreferences });
  } catch (error) {
    res.status(500).json({ message: 'Error updating export preferences' });
  }
});

module.exports = router; 