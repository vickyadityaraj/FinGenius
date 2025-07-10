const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// MongoDB connection options
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');
    console.log('MONGODB_URI:', process.env.MONGODB_URI);
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, mongoOptions);
    console.log('✅ Connected to MongoDB');
    
    // Load all models
    const modelsPath = path.join(__dirname, 'models');
    const modelFiles = fs.readdirSync(modelsPath).filter(file => file.includes('.model.js'));
    
    console.log('Loading models:', modelFiles.join(', '));
    
    // Import all models to make sure schemas are registered
    modelFiles.forEach(file => {
      require(path.join(modelsPath, file));
      console.log(`Loaded model: ${file}`);
    });
    
    // Create indexes for each model
    console.log('\nCreating indexes...');
    for (const modelName of mongoose.modelNames()) {
      const model = mongoose.model(modelName);
      console.log(`Creating indexes for ${modelName}...`);
      await model.createIndexes();
      console.log(`✅ Indexes created for ${modelName}`);
    }
    
    // Check if User model exists and create an admin user if no users exist
    if (mongoose.modelNames().includes('User')) {
      const User = mongoose.model('User');
      const usersCount = await User.countDocuments();
      
      if (usersCount === 0) {
        console.log('\nNo users found. Creating admin user...');
        
        const bcrypt = require('bcryptjs');
        const adminUser = new User({
          name: 'Admin User',
          email: 'admin@smartbudget.com',
          password: await bcrypt.hash('SmartBudget@123', 10),
          role: 'admin'
        });
        
        await adminUser.save();
        console.log('✅ Admin user created successfully');
        console.log('Email: admin@smartbudget.com');
        console.log('Password: SmartBudget@123');
      } else {
        console.log(`Found ${usersCount} existing users. Skipping admin user creation.`);
      }
    }
    
    // Verify collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nVerified collections in database:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    console.log('\nDatabase initialization completed successfully');
    
  } catch (error) {
    console.error('❌ Database initialization error:');
    console.error(error);
  } finally {
    // Close the connection
    if (mongoose.connection.readyState) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the initialization
initializeDatabase(); 