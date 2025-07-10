const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  targetAmount: {
    type: Number,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  }
});

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  targetAmount: {
    type: Number,
    required: true
  },
  currentAmount: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  milestones: [milestoneSchema],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  notes: String,
  reminderFrequency: {
    type: String,
    enum: ['never', 'daily', 'weekly', 'monthly'],
    default: 'never'
  }
}, {
  timestamps: true
});

// Virtual for progress percentage
goalSchema.virtual('progress').get(function() {
  return (this.currentAmount / this.targetAmount) * 100;
});

// Virtual for formatted target amount
goalSchema.virtual('formattedTargetAmount').get(function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(this.targetAmount);
});

// Virtual for formatted current amount
goalSchema.virtual('formattedCurrentAmount').get(function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(this.currentAmount);
});

// Virtual for remaining amount
goalSchema.virtual('remainingAmount').get(function() {
  return this.targetAmount - this.currentAmount;
});

// Virtual for formatted remaining amount
goalSchema.virtual('formattedRemainingAmount').get(function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(this.remainingAmount);
});

// Method to update goal progress
goalSchema.methods.updateProgress = async function(amount) {
  this.currentAmount = Math.min(this.currentAmount + amount, this.targetAmount);
  
  // Update milestone status
  this.milestones.forEach(milestone => {
    milestone.completed = this.currentAmount >= milestone.targetAmount;
  });
  
  // Update goal status if completed
  if (this.currentAmount >= this.targetAmount) {
    this.status = 'completed';
  }
  
  await this.save();
};

module.exports = mongoose.model('Goal', goalSchema); 