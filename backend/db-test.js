const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('Database connection test script');
console.log('---------------------------------');
console.log('MONGODB_URI:', process.env.MONGODB_URI);

// MongoDB connection options
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, mongoOptions);
    
    console.log('✅ Connected to MongoDB successfully');
    console.log('Database name:', mongoose.connection.name);
    console.log('Connection state:', mongoose.connection.readyState);
    
    // Test ping
    console.log('Testing database ping...');
    await mongoose.connection.db.admin().ping();
    console.log('✅ Database ping successful');
    
    // Get collection information
    console.log('Getting collection information...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in database:');
    if (collections.length === 0) {
      console.log('- No collections found (empty database)');
    } else {
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
    }
    
    console.log('\nDatabase connection test completed successfully');
    
  } catch (error) {
    console.error('❌ Database connection error:');
    console.error(error);
    
    // Provide more helpful error information
    if (error.name === 'MongoServerSelectionError') {
      console.error('\nThis error typically means:');
      console.error('1. The MongoDB server is not running');
      console.error('2. The connection string is incorrect');
      console.error('3. Network issues are preventing the connection');
      console.error('\nTry the following:');
      console.error('- Check if your MongoDB server is running');
      console.error('- Verify your MONGODB_URI in the .env file');
      console.error('- Check network connectivity and firewall settings');
    }
  } finally {
    // Close the connection
    if (mongoose.connection.readyState) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the test
testConnection(); 