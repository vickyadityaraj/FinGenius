const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User.model');
const Expense = require('../models/Expense.model');
const Savings = require('../models/Savings.model');
const Goal = require('../models/Goal.model');

dotenv.config();

const sampleData = {
  user: {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    settings: {
      currency: 'INR',
      language: 'en',
      theme: 'light',
      notifications: {
        email: true,
        push: true
      }
    }
  },
  expenses: [
    {
      title: 'Groceries',
      amount: 2500,
      category: 'Food',
      date: new Date(),
      description: 'Weekly groceries'
    },
    {
      title: 'Electricity Bill',
      amount: 1800,
      category: 'Utilities',
      date: new Date(),
      description: 'Monthly electricity bill'
    }
  ],
  savings: [
    {
      title: 'Emergency Fund',
      amount: 50000,
      type: 'deposit',
      category: 'Emergency',
      date: new Date(),
      description: 'Emergency savings'
    },
    {
      title: 'Investment',
      amount: 25000,
      type: 'deposit',
      category: 'Investment',
      date: new Date(),
      description: 'Stock market investment'
    }
  ],
  goals: [
    {
      title: 'Buy a Car',
      targetAmount: 800000,
      currentAmount: 200000,
      deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      category: 'Vehicle',
      priority: 'high'
    },
    {
      title: 'Vacation Fund',
      targetAmount: 100000,
      currentAmount: 25000,
      deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      category: 'Travel',
      priority: 'medium'
    }
  ]
};

async function initializeDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Expense.deleteMany({}),
      Savings.deleteMany({}),
      Goal.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Create user
    const user = await User.create(sampleData.user);
    console.log('Created user:', user.email);

    // Create expenses
    const expenses = await Expense.create(
      sampleData.expenses.map(expense => ({
        ...expense,
        userId: user._id
      }))
    );
    console.log('Created expenses:', expenses.length);

    // Create savings
    const savings = await Savings.create(
      sampleData.savings.map(saving => ({
        ...saving,
        userId: user._id
      }))
    );
    console.log('Created savings:', savings.length);

    // Create goals
    const goals = await Goal.create(
      sampleData.goals.map(goal => ({
        ...goal,
        userId: user._id
      }))
    );
    console.log('Created goals:', goals.length);

    console.log('Database initialization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase(); 