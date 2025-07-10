# Smart Budget Genius - Database Setup Guide

This guide will help you connect your Smart Budget Genius application to a MongoDB database so you can store and manage your financial data.

## Prerequisites

1. Node.js installed on your system
2. MongoDB (either locally installed or a MongoDB Atlas account)

## Automatic Setup (Recommended)

We've created a simple setup script that will guide you through the process:

1. Open a terminal in the root directory of the project
2. Run the following command:

```
npm run setup-db
```

This script will:
- Create or verify your .env file with database settings
- Test the database connection
- Initialize the database with required collections and indexes
- Create an admin user if needed

## Manual Setup

If you prefer to set up the database manually, follow these steps:

### 1. Configure Environment Variables

Create a `.env` file in the root directory with the following content:

```
MONGODB_URI=mongodb://localhost:27017/smartbudget
JWT_SECRET=your-secret-key
PORT=5000
VITE_API_URL=http://localhost:5000/api
```

Replace these values with your specific configuration:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secret key for JWT token generation
- `PORT`: The port for your backend server
- `VITE_API_URL`: The URL for your API (usually http://localhost:PORT/api)

### 2. Install Dependencies

Install the backend dependencies:

```
cd backend
npm install
```

### 3. Test Database Connection

Test your database connection by running:

```
npm run test-db
```

### 4. Initialize Database

Initialize the database with collections and indexes:

```
npm run init-db
```

## Connecting to MongoDB Atlas (Cloud Database)

If you prefer using MongoDB Atlas (cloud database) instead of a local MongoDB installation:

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Set up database access by creating a user with password
4. Set up network access (add your IP address or allow access from anywhere for development)
5. Get your connection string from the "Connect" button on your cluster
6. Replace the MONGODB_URI in your .env file with this connection string

Example Atlas connection string:
```
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/smartbudget?retryWrites=true&w=majority
```

## Verifying the Connection

After setting up the database, start your backend server:

```
npm run server
```

Then visit `http://localhost:5000/api/health` in your browser. You should see a JSON response showing your database connection status.

## Running the Application

To run the complete application with both frontend and backend:

```
npm run start:all
```

## Troubleshooting

### Connection Issues

If you encounter connection issues:

1. Check if MongoDB is running (if using local MongoDB)
2. Verify your connection string is correct
3. Check network connectivity
4. Ensure your IP is whitelisted if using MongoDB Atlas

### Database Initialization Issues

If database initialization fails:

1. Check MongoDB permissions
2. Verify your connection string has write permissions
3. Run the `test-db` script to check your connection

## Database Structure

Smart Budget Genius uses the following collections:

- `users`: User accounts and authentication information
- `expenses`: All expense transactions
- `savings`: Savings accounts and transactions
- `goals`: Financial goals
- `financialhealth`: Financial health scores and metrics

Each collection has appropriate indexes for efficient querying.

---

For more detailed information about the API, refer to the API documentation. 