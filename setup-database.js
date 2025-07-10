/**
 * Smart Budget Genius - Database Setup Helper
 * This script helps to set up and connect the dashboard to the database
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Header
console.log(`
${colors.bright}${colors.cyan}=================================${colors.reset}
${colors.bright}${colors.cyan} SMART BUDGET GENIUS SETUP TOOL ${colors.reset}
${colors.bright}${colors.cyan}=================================${colors.reset}
`);

console.log(`${colors.yellow}This utility will help you connect your dashboard to the database.${colors.reset}\n`);

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
let envExists = fs.existsSync(envPath);

function runCommand(command) {
  try {
    console.log(`${colors.blue}Running: ${command}${colors.reset}`);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`${colors.red}Failed to execute command: ${command}${colors.reset}`);
    console.error(error.message);
    return false;
  }
}

async function askQuestion(question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer);
    });
  });
}

async function setup() {
  try {
    // Check for environment file
    if (!envExists) {
      console.log(`${colors.yellow}No .env file found. Creating one...${colors.reset}`);
      
      // Ask for MongoDB connection string
      let mongoUri = await askQuestion(`${colors.cyan}Enter your MongoDB connection URI [default: mongodb://localhost:27017/smartbudget]: ${colors.reset}`);
      if (!mongoUri) {
        mongoUri = 'mongodb://localhost:27017/smartbudget';
      }
      
      // Ask for JWT Secret
      let jwtSecret = await askQuestion(`${colors.cyan}Enter your JWT Secret [default: smart-budget-genius-secure-key]: ${colors.reset}`);
      if (!jwtSecret) {
        jwtSecret = 'smart-budget-genius-secure-key';
      }
      
      // Ask for port
      let port = await askQuestion(`${colors.cyan}Enter the port for the backend server [default: 5000]: ${colors.reset}`);
      if (!port) {
        port = '5000';
      }
      
      // Create .env file
      const envContent = `MONGODB_URI=${mongoUri}
JWT_SECRET=${jwtSecret}
PORT=${port}
VITE_API_URL=http://localhost:${port}/api`;
      
      fs.writeFileSync(envPath, envContent);
      console.log(`${colors.green}Created .env file successfully.${colors.reset}`);
      envExists = true;
    } else {
      console.log(`${colors.green}.env file found.${colors.reset}`);
    }
    
    // Install dependencies if needed
    console.log(`\n${colors.yellow}Checking if dependencies are installed...${colors.reset}`);
    
    if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
      console.log(`${colors.yellow}Installing dependencies...${colors.reset}`);
      runCommand('npm install');
    } else {
      console.log(`${colors.green}Dependencies already installed.${colors.reset}`);
    }
    
    // Test database connection
    console.log(`\n${colors.yellow}Testing database connection...${colors.reset}`);
    runCommand('node backend/db-test.js');
    
    // Ask about database initialization
    const initDb = await askQuestion(`\n${colors.cyan}Do you want to initialize the database with required collections and indexes? (y/n) [default: y]: ${colors.reset}`);
    
    if (initDb.toLowerCase() !== 'n') {
      console.log(`\n${colors.yellow}Initializing database...${colors.reset}`);
      runCommand('node backend/init-db.js');
    }
    
    // Success message
    console.log(`\n${colors.green}${colors.bright}✅ Database setup complete!${colors.reset}`);
    console.log(`\n${colors.yellow}To start the application:${colors.reset}`);
    console.log(`${colors.cyan}1. Start the backend server:${colors.reset} npm run server`);
    console.log(`${colors.cyan}2. Start the frontend:${colors.reset} npm run dev`);
    console.log(`\n${colors.yellow}Your dashboard should now be connected to the database.${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}Error during setup:${colors.reset}`, error);
  } finally {
    rl.close();
  }
}

// Run the setup
setup();

 