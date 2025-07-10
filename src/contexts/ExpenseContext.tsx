import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { format } from 'date-fns';
import { expensesApi } from '@/services/api';
import eventBus, { EVENTS } from '@/services/eventBus';

// Define expense types
export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface DailyExpense {
  date: string;
  amount: number;
}

export interface CategoryExpense {
  name: string;
  value: number;
}

interface ExpenseContextType {
  expenses: Expense[];
  dailyExpenses: DailyExpense[];
  categoryExpenses: CategoryExpense[];
  isLoading: boolean;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (id: string, expenseData: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  refreshExpenses: () => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};

interface ExpenseProviderProps {
  children: ReactNode;
}

export const ExpenseProvider: React.FC<ExpenseProviderProps> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [dailyExpenses, setDailyExpenses] = useState<DailyExpense[]>([]);
  const [categoryExpenses, setCategoryExpenses] = useState<CategoryExpense[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Calculate daily expenses from the raw expense data
  const calculateDailyExpenses = (expenseData: Expense[]) => {
    // Group expenses by date
    const expensesByDate = expenseData.reduce((acc, expense) => {
      const date = expense.date.substring(0, 10); // Get YYYY-MM-DD
      const formattedDate = format(new Date(date), 'dd MMM');
      
      if (!acc[formattedDate]) {
        acc[formattedDate] = 0;
      }
      acc[formattedDate] += expense.amount;
      return acc;
    }, {} as Record<string, number>);
    
    // Convert to array format for chart
    const dailyData = Object.keys(expensesByDate).map(date => ({
      date,
      amount: expensesByDate[date]
    })).sort((a, b) => {
      // Sort by date to ensure chronological order
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
    
    setDailyExpenses(dailyData);
  };

  // Calculate category expenses from the raw expense data
  const calculateCategoryExpenses = (expenseData: Expense[]) => {
    // Group expenses by category
    const expensesByCategory = expenseData.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = 0;
      }
      acc[expense.category] += expense.amount;
      return acc;
    }, {} as Record<string, number>);
    
    // Convert to array format for chart
    const categoryData = Object.keys(expensesByCategory).map(category => ({
      name: category,
      value: expensesByCategory[category]
    }));
    
    setCategoryExpenses(categoryData);
  };

  // Fetch expenses from API
  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const response = await expensesApi.getExpenses();
      const expenseData = response.data.expenses;
      setExpenses(expenseData);
      
      // Calculate derived data
      calculateDailyExpenses(expenseData);
      calculateCategoryExpenses(expenseData);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new expense
  const addExpense = async (expenseData: Omit<Expense, 'id'>) => {
    try {
      await expensesApi.addExpense(expenseData);
      // The event bus will trigger a refresh, no need to manually fetch
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  // Update an existing expense
  const updateExpense = async (id: string, expenseData: Partial<Expense>) => {
    try {
      await expensesApi.updateExpense(id, expenseData);
      // The event bus will trigger a refresh
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  // Delete an expense
  const deleteExpense = async (id: string) => {
    try {
      await expensesApi.deleteExpense(id);
      // The event bus will trigger a refresh
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  // Function to manually refresh expenses
  const refreshExpenses = async () => {
    await fetchExpenses();
  };

  // Set up event listeners for expense changes
  useEffect(() => {
    const handleExpenseChange = () => {
      fetchExpenses();
    };
    
    // Register event listeners
    eventBus.on(EVENTS.EXPENSE_ADDED, handleExpenseChange);
    eventBus.on(EVENTS.EXPENSE_UPDATED, handleExpenseChange);
    eventBus.on(EVENTS.EXPENSE_DELETED, handleExpenseChange);
    
    // Initial fetch
    fetchExpenses();
    
    // Clean up event listeners
    return () => {
      eventBus.off(EVENTS.EXPENSE_ADDED, handleExpenseChange);
      eventBus.off(EVENTS.EXPENSE_UPDATED, handleExpenseChange);
      eventBus.off(EVENTS.EXPENSE_DELETED, handleExpenseChange);
    };
  }, []);

  return (
    <ExpenseContext.Provider 
      value={{
        expenses,
        dailyExpenses,
        categoryExpenses,
        isLoading,
        addExpense,
        updateExpense,
        deleteExpense,
        refreshExpenses
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export default ExpenseContext; 