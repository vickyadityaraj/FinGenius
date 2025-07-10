const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let token = '';

async function testAPI() {
  try {
    // 1. Login
    console.log('Testing login...');
    console.log('Sending request to:', `${API_URL}/auth/login`);
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    token = loginResponse.data.token;
    console.log('Login successful, got token:', token);

    // 2. Add new expense
    console.log('\nTesting add expense...');
    const newExpense = {
      title: 'Test Expense',
      amount: 1000,
      category: 'Test',
      description: 'Test expense entry',
      date: new Date()
    };
    console.log('Sending expense data:', newExpense);
    const expenseResponse = await axios.post(
      `${API_URL}/expenses`,
      newExpense,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log('Added expense:', expenseResponse.data);

    // 3. Get all expenses
    console.log('\nTesting get expenses...');
    const expensesListResponse = await axios.get(
      `${API_URL}/expenses`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log('Total expenses:', expensesListResponse.data.expenses.length);
    console.log('Expenses:', JSON.stringify(expensesListResponse.data.expenses, null, 2));

    // 4. Add new saving
    console.log('\nTesting add saving...');
    const newSaving = {
      title: 'Test Saving',
      amount: 5000,
      type: 'deposit',
      category: 'Test',
      description: 'Test saving entry',
      date: new Date()
    };
    console.log('Sending saving data:', newSaving);
    const savingResponse = await axios.post(
      `${API_URL}/savings`,
      newSaving,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log('Added saving:', savingResponse.data);

    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Error during testing:');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received');
      console.error('Request details:', error.request);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// First install axios if not present
if (!require('axios')) {
  console.log('Installing axios...');
  require('child_process').execSync('npm install axios');
}

// Run the tests
console.log('Starting API tests...');
console.log('API URL:', API_URL);
testAPI(); 