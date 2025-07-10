const express = require('express');
const Alert = require('../models/Alert.model');
const auth = require('../middleware/auth.middleware');

const router = express.Router();

// Get all alerts
router.get('/', auth, async (req, res) => {
  try {
    const alerts = await Alert.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    // Group alerts by type
    const groupedAlerts = alerts.reduce((acc, alert) => {
      if (!acc[alert.type]) {
        acc[alert.type] = [];
      }
      acc[alert.type].push(alert);
      return acc;
    }, {});

    res.json({
      alerts,
      groupedAlerts
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching alerts' });
  }
});

// Create new alert
router.post('/', auth, async (req, res) => {
  try {
    const {
      type,
      title,
      message,
      threshold,
      category,
      frequency,
      isActive,
      notificationMethod
    } = req.body;

    const alert = new Alert({
      userId: req.user._id,
      type,
      title,
      message,
      threshold,
      category,
      frequency,
      isActive: isActive !== undefined ? isActive : true,
      notificationMethod: notificationMethod || ['app']
    });

    await alert.save();
    res.status(201).json({ alert });
  } catch (error) {
    res.status(500).json({ message: 'Error creating alert' });
  }
});

// Update alert
router.patch('/:id', auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = [
      'title',
      'message',
      'threshold',
      'category',
      'frequency',
      'isActive',
      'notificationMethod'
    ];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates' });
    }

    const alert = await Alert.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    updates.forEach(update => {
      alert[update] = req.body[update];
    });

    await alert.save();
    res.json({ alert });
  } catch (error) {
    res.status(500).json({ message: 'Error updating alert' });
  }
});

// Delete alert
router.delete('/:id', auth, async (req, res) => {
  try {
    const alert = await Alert.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    res.json({ alert });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting alert' });
  }
});

// Toggle alert status
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    const alert = await Alert.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    alert.isActive = !alert.isActive;
    await alert.save();

    res.json({ alert });
  } catch (error) {
    res.status(500).json({ message: 'Error toggling alert status' });
  }
});

// Get alerts by type
router.get('/type/:type', auth, async (req, res) => {
  try {
    const alerts = await Alert.find({
      userId: req.user._id,
      type: req.params.type
    }).sort({ createdAt: -1 });

    res.json({ alerts });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching alerts by type' });
  }
});

// Get active alerts
router.get('/active', auth, async (req, res) => {
  try {
    const alerts = await Alert.find({
      userId: req.user._id,
      isActive: true
    }).sort({ createdAt: -1 });

    res.json({ alerts });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching active alerts' });
  }
});

// Update notification methods
router.patch('/:id/notifications', auth, async (req, res) => {
  try {
    const { notificationMethod } = req.body;

    const alert = await Alert.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    alert.notificationMethod = notificationMethod;
    await alert.save();

    res.json({ alert });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification methods' });
  }
});

module.exports = router; 