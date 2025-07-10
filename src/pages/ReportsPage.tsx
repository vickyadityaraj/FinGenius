import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { AlertDialogAction, AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar
} from 'recharts';
import {
  CalendarIcon,
  Download,
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  PiggyBank,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Share2,
  AlertTriangle,
  Edit,
  Save,
  Trash2
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';

// Format number to Indian currency format
const formatToINR = (number: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(number);
};

// Initial data generation for financial metrics
const generateInitialMonthlyData = (months: number) => {
  return Array.from({ length: months }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      month: format(date, 'MMM yyyy'),
      income: 65000 + (i * 2000),
      expenses: 35000 + (i * 1000),
      savings: 20000 + (i * 500),
      investments: 10000 + (i * 300),
      needs: 17500 + (i * 500), // 50% of expenses
      wants: 10500 + (i * 300), // 30% of expenses
      others: 7000 + (i * 200)  // 20% of expenses
    };
  }).reverse();
};

// Initial category-wise expense data
const INITIAL_EXPENSE_CATEGORIES = [
  { name: 'Housing', value: 25000, fill: '#FF6B6B', type: 'needs' },
  { name: 'Food', value: 12000, fill: '#4ECDC4', type: 'needs' },
  { name: 'Transport', value: 8000, fill: '#45B7D1', type: 'needs' },
  { name: 'Utilities', value: 5000, fill: '#96CEB4', type: 'needs' },
  { name: 'Entertainment', value: 7000, fill: '#FFEEAD', type: 'wants' },
  { name: 'Healthcare', value: 4000, fill: '#D4A5A5', type: 'needs' },
  { name: 'Shopping', value: 9000, fill: '#9B786F', type: 'wants' }
];

const ReportsPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState('6M');
  
  // Editable data states
  const [monthlyData, setMonthlyData] = useState(generateInitialMonthlyData(12));
  const [expenseCategories, setExpenseCategories] = useState(INITIAL_EXPENSE_CATEGORIES);
  const [filteredData, setFilteredData] = useState(() => 
    monthlyData.slice(-Number(selectedPeriod.replace('M', '')))
  );
  
  // Edit states
  const [editMode, setEditMode] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState(0);
  const [editCategoryType, setEditCategoryType] = useState<'needs' | 'wants' | 'others'>('needs');
  const [showBudgetAlert, setShowBudgetAlert] = useState(false);
  const [budgetAlertMessage, setBudgetAlertMessage] = useState('');
  const [editingIncome, setEditingIncome] = useState(false);
  const [editIncome, setEditIncome] = useState(0);
  const [editingExpenses, setEditingExpenses] = useState(false);
  const [editExpenses, setEditExpenses] = useState(0);
  // For savings metric editing
  const [showEditSavingsMetricDialog, setShowEditSavingsMetricDialog] = useState<'average' | 'highest' | 'total' | 'rate' | null>(null);

  // Quick input states
  const [quickMonthlyIncome, setQuickMonthlyIncome] = useState(() => {
    return monthlyData.length > 0 ? monthlyData[monthlyData.length - 1].income : 65000;
  });
  const [quickMonthlyExpenses, setQuickMonthlyExpenses] = useState(() => {
    return monthlyData.length > 0 ? monthlyData[monthlyData.length - 1].expenses : 35000;
  });
  const [showQuickUpdateSuccess, setShowQuickUpdateSuccess] = useState(false);

  // New monthly input states
  const [showMonthlyInputForm, setShowMonthlyInputForm] = useState(false);
  const [newMonthIncome, setNewMonthIncome] = useState(65000);
  const [newMonthExpenses, setNewMonthExpenses] = useState(35000);
  const [newMonthNeeds, setNewMonthNeeds] = useState(17500);
  const [newMonthWants, setNewMonthWants] = useState(10500);
  const [newMonthOthers, setNewMonthOthers] = useState(7000);
  const [newMonthDate, setNewMonthDate] = useState<Date>(new Date());
  
  // New category input states
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryAmount, setNewCategoryAmount] = useState(0);
  const [newCategoryType, setNewCategoryType] = useState<'needs' | 'wants' | 'others'>('needs');
  const [newCategoryColor, setNewCategoryColor] = useState('#FF6B6B');
  
  // Savings states
  const [savingsGoal, setSavingsGoal] = useState(0);
  const [showSavingsGoalDialog, setShowSavingsGoalDialog] = useState(false);
  const [editingSavingsMetric, setEditingSavingsMetric] = useState<'average' | 'highest' | 'total' | 'rate' | null>(null);
  const [editingSavingsValue, setEditingSavingsValue] = useState(0);
  
  // Insights states
  const [customInsights, setCustomInsights] = useState<{ icon: string; text: string }[]>([]);
  const [showCustomInsightDialog, setShowCustomInsightDialog] = useState(false);
  const [newInsightText, setNewInsightText] = useState('');
  const [newInsightIcon, setNewInsightIcon] = useState<'trend-up' | 'trend-down' | 'alert' | 'target' | 'wallet'>('trend-up');

  // Update filtered data when period or data changes
  useEffect(() => {
    setFilteredData(monthlyData.slice(-Number(selectedPeriod.replace('M', ''))));
  }, [selectedPeriod, monthlyData]);

  // Get latest month data - using a function to ensure we always get the most current data
  const getLatestMonthData = () => {
    return monthlyData[monthlyData.length - 1];
  };

  // Get previous month data - using a function to ensure we always get the most current data
  const getPreviousMonthData = () => {
    return monthlyData[monthlyData.length - 2];
  };

  // Calculate financial health score (0-100)
  const calculateFinancialScore = () => {
    const latestMonth = getLatestMonthData();
    const savingsRate = (latestMonth.savings / latestMonth.income) * 100;
    const expenseRate = (latestMonth.expenses / latestMonth.income) * 100;
    const investmentRate = (latestMonth.investments / latestMonth.income) * 100;
    
    return Math.min(
      Math.round((savingsRate * 0.4) + (100 - expenseRate) * 0.4 + (investmentRate * 0.2)),
      100
    );
  };

  // Calculate month-over-month changes
  const calculateMoMChange = (current: number, previous: number) => {
    return ((current - previous) / previous) * 100;
  };

  // Use a function to calculate changes whenever they're needed
  const calculateChanges = () => {
    const latestMonth = getLatestMonthData();
    const previousMonth = getPreviousMonthData();
    
    return {
      income: calculateMoMChange(latestMonth.income, previousMonth.income),
      expenses: calculateMoMChange(latestMonth.expenses, previousMonth.expenses),
      savings: calculateMoMChange(latestMonth.savings, previousMonth.savings)
    };
  };

  // Handle expense category value update with type
  const handleUpdateCategory = (categoryName: string) => {
    const updatedCategories = expenseCategories.map(cat => 
      cat.name === categoryName ? { ...cat, value: editValue, type: editCategoryType } : cat
    );
    
    setExpenseCategories(updatedCategories);
    
    // Update monthly data based on new category values
    const totalExpenses = updatedCategories.reduce((total, cat) => total + cat.value, 0);
    const needsTotal = updatedCategories
      .filter(cat => cat.type === 'needs')
      .reduce((total, cat) => total + cat.value, 0);
    const wantsTotal = updatedCategories
      .filter(cat => cat.type === 'wants')
      .reduce((total, cat) => total + cat.value, 0);
    const othersTotal = updatedCategories
      .filter(cat => cat.type === 'others')
      .reduce((total, cat) => total + cat.value, 0);
    
    const needsPercentage = (needsTotal / totalExpenses) * 100;
    const wantsPercentage = (wantsTotal / totalExpenses) * 100;
    const othersPercentage = (othersTotal / totalExpenses) * 100;
    
    // Check budget rule (50/30/20)
    if (needsPercentage < 45 || needsPercentage > 55) {
      setBudgetAlertMessage(`Your needs spending (${needsPercentage.toFixed(1)}%) is outside the recommended range of 45-55%.`);
      setShowBudgetAlert(true);
    } else if (wantsPercentage < 25 || wantsPercentage > 35) {
      setBudgetAlertMessage(`Your wants spending (${wantsPercentage.toFixed(1)}%) is outside the recommended range of 25-35%.`);
      setShowBudgetAlert(true);
    } else if (othersPercentage < 15 || othersPercentage > 25) {
      setBudgetAlertMessage(`Your other expenses (${othersPercentage.toFixed(1)}%) are outside the recommended range of 15-25%.`);
      setShowBudgetAlert(true);
    }
    
    const updatedMonthlyData = monthlyData.map((month, index) => {
      if (index === monthlyData.length - 1) {
        return {
          ...month,
          expenses: totalExpenses,
          savings: month.income - totalExpenses,
          needs: needsTotal,
          wants: wantsTotal,
          others: othersTotal
        };
      }
      return month;
    });
    
    setMonthlyData(updatedMonthlyData);
    setEditingCategory(null);
    
    toast({
      title: "Category updated",
      description: `${categoryName} expenses updated to ${formatToINR(editValue)}`,
    });
  };

  // Handle income update
  const handleUpdateIncome = () => {
    const latestMonthIndex = monthlyData.length - 1;
    const previousExpenses = monthlyData[latestMonthIndex].expenses;
    
    const updatedMonthlyData = [...monthlyData];
    updatedMonthlyData[latestMonthIndex] = {
      ...updatedMonthlyData[latestMonthIndex],
      income: editIncome,
      savings: editIncome - previousExpenses
    };
    
    setMonthlyData(updatedMonthlyData);
    setEditingIncome(false);
    
    // Check if savings are negative
    if (editIncome < previousExpenses) {
      setBudgetAlertMessage("Warning: Your expenses exceed your income, resulting in negative savings.");
      setShowBudgetAlert(true);
    }
    
    toast({
      title: "Income updated",
      description: `Monthly income updated to ${formatToINR(editIncome)}`,
    });
  };

  // Handle expenses update
  const handleUpdateExpenses = () => {
    const latestMonthIndex = monthlyData.length - 1;
    const previousIncome = monthlyData[latestMonthIndex].income;
    
    // Calculate proportional changes to needs, wants, and others
    const previousExpenses = monthlyData[latestMonthIndex].expenses;
    const needsRatio = monthlyData[latestMonthIndex].needs / previousExpenses;
    const wantsRatio = monthlyData[latestMonthIndex].wants / previousExpenses;
    const othersRatio = monthlyData[latestMonthIndex].others / previousExpenses;
    
    const newNeeds = editExpenses * needsRatio;
    const newWants = editExpenses * wantsRatio;
    const newOthers = editExpenses * othersRatio;
    
    const updatedMonthlyData = [...monthlyData];
    updatedMonthlyData[latestMonthIndex] = {
      ...updatedMonthlyData[latestMonthIndex],
      expenses: editExpenses,
      savings: previousIncome - editExpenses,
      needs: newNeeds,
      wants: newWants,
      others: newOthers
    };
    
    setMonthlyData(updatedMonthlyData);
    setEditingExpenses(false);
    
    // Update expense categories proportionally
    const scaleFactor = editExpenses / previousExpenses;
    const updatedCategories = expenseCategories.map(cat => ({
      ...cat,
      value: Math.round(cat.value * scaleFactor)
    }));
    setExpenseCategories(updatedCategories);
    
    // Check if savings are negative
    if (previousIncome < editExpenses) {
      setBudgetAlertMessage("Warning: Your expenses exceed your income, resulting in negative savings.");
      setShowBudgetAlert(true);
    }
    
    // Check budget rule (50/30/20)
    const needsPercentage = (newNeeds / editExpenses) * 100;
    const wantsPercentage = (newWants / editExpenses) * 100;
    const othersPercentage = (newOthers / editExpenses) * 100;
    
    if (needsPercentage < 45 || needsPercentage > 55) {
      setBudgetAlertMessage(`Your needs spending (${needsPercentage.toFixed(1)}%) is outside the recommended range of 45-55%.`);
      setShowBudgetAlert(true);
    } else if (wantsPercentage < 25 || wantsPercentage > 35) {
      setBudgetAlertMessage(`Your wants spending (${wantsPercentage.toFixed(1)}%) is outside the recommended range of 25-35%.`);
      setShowBudgetAlert(true);
    } else if (othersPercentage < 15 || othersPercentage > 25) {
      setBudgetAlertMessage(`Your other expenses (${othersPercentage.toFixed(1)}%) are outside the recommended range of 15-25%.`);
      setShowBudgetAlert(true);
    }
    
    toast({
      title: "Expenses updated",
      description: `Monthly expenses updated to ${formatToINR(editExpenses)}`,
    });
  };

  // Handle adding a new monthly data point
  const handleAddNewMonthData = () => {
    // Calculate savings based on income and expenses
    const savings = newMonthIncome - newMonthExpenses;
    // Use a typical ratio for investments (adjust as needed)
    const investments = Math.round(savings * 0.5);
    
    // Create new month data
    const newData = {
      month: format(newMonthDate, 'MMM yyyy'),
      income: newMonthIncome,
      expenses: newMonthExpenses,
      savings: savings,
      investments: investments,
      needs: newMonthNeeds,
      wants: newMonthWants,
      others: newMonthOthers
    };
    
    // Check if month already exists
    const monthExists = monthlyData.some(data => data.month === newData.month);
    
    if (monthExists) {
      // Update existing month
      const updatedData = monthlyData.map(data => 
        data.month === newData.month ? newData : data
      );
      setMonthlyData(updatedData);
      toast({
        title: "Month updated",
        description: `Data for ${newData.month} has been updated.`,
      });
    } else {
      // Add new month in chronological order
      let inserted = false;
      const updatedData = [...monthlyData];
      
      for (let i = 0; i < updatedData.length; i++) {
        const currentMonth = new Date(updatedData[i].month);
        if (newMonthDate > currentMonth) {
          updatedData.splice(i, 0, newData);
          inserted = true;
          break;
        }
      }
      
      if (!inserted) {
        // If not inserted, add to the end
        updatedData.push(newData);
      }
      
      setMonthlyData(updatedData);
      toast({
        title: "Month added",
        description: `Data for ${newData.month} has been added.`,
      });
    }
    
    // Check budget rule
    const needsPercentage = (newMonthNeeds / newMonthExpenses) * 100;
    const wantsPercentage = (newMonthWants / newMonthExpenses) * 100;
    const othersPercentage = (newMonthOthers / newMonthExpenses) * 100;
    
    if (needsPercentage < 45 || needsPercentage > 55) {
      setBudgetAlertMessage(`Your needs spending (${needsPercentage.toFixed(1)}%) is outside the recommended range of 45-55%.`);
      setShowBudgetAlert(true);
    } else if (wantsPercentage < 25 || wantsPercentage > 35) {
      setBudgetAlertMessage(`Your wants spending (${wantsPercentage.toFixed(1)}%) is outside the recommended range of 25-35%.`);
      setShowBudgetAlert(true);
    } else if (othersPercentage < 15 || othersPercentage > 25) {
      setBudgetAlertMessage(`Your other expenses (${othersPercentage.toFixed(1)}%) are outside the recommended range of 15-25%.`);
      setShowBudgetAlert(true);
    }
    
    // Close the form
    setShowMonthlyInputForm(false);
  };

  // Handle adding a new expense category
  const handleAddCategory = () => {
    // Validate inputs
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive"
      });
      return;
    }
    
    if (newCategoryAmount <= 0) {
      toast({
        title: "Error", 
        description: "Amount must be greater than zero",
        variant: "destructive"
      });
      return;
    }
    
    // Check if category name already exists
    if (expenseCategories.some(cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      toast({
        title: "Error",
        description: "A category with this name already exists",
        variant: "destructive"
      });
      return;
    }
    
    // Create new category
    const newCategory = {
      name: newCategoryName.trim(),
      value: newCategoryAmount,
      fill: newCategoryColor,
      type: newCategoryType
    };
    
    // Add to categories
    const updatedCategories = [...expenseCategories, newCategory];
    setExpenseCategories(updatedCategories);
    
    // Update monthly data
    const totalExpenses = updatedCategories.reduce((total, cat) => total + cat.value, 0);
    const needsTotal = updatedCategories
      .filter(cat => cat.type === 'needs')
      .reduce((total, cat) => total + cat.value, 0);
    const wantsTotal = updatedCategories
      .filter(cat => cat.type === 'wants')
      .reduce((total, cat) => total + cat.value, 0);
    const othersTotal = updatedCategories
      .filter(cat => cat.type === 'others')
      .reduce((total, cat) => total + cat.value, 0);
    
    const updatedMonthlyData = monthlyData.map((month, index) => {
      if (index === monthlyData.length - 1) {
        return {
          ...month,
          expenses: totalExpenses,
          savings: month.income - totalExpenses,
          needs: needsTotal,
          wants: wantsTotal,
          others: othersTotal
        };
      }
      return month;
    });
    
    setMonthlyData(updatedMonthlyData);
    
    // Reset form and close dialog
    setNewCategoryName('');
    setNewCategoryAmount(0);
    setNewCategoryType('needs');
    setShowAddCategoryDialog(false);
    
    toast({
      title: "Category added",
      description: `${newCategoryName} added with amount ${formatToINR(newCategoryAmount)}`,
    });
  };

  // Handle setting a savings goal
  const handleSetSavingsGoal = () => {
    // Update the monthlyData to include the goal for visualization
    const updatedData = monthlyData.map(month => ({
      ...month,
      savingsGoal: savingsGoal
    }));
    
    setMonthlyData(updatedData);
    setShowSavingsGoalDialog(false);
    
    toast({
      title: "Savings goal set",
      description: `Your monthly savings goal is now ${formatToINR(savingsGoal)}`,
    });
  };

  // Handle updating savings metrics
  const handleUpdateSavingsMetric = () => {
    if (!showEditSavingsMetricDialog) return;
    
    let updatedMonthlyData = [...monthlyData];
    const latestMonthIndex = monthlyData.length - 1;
    
    switch (showEditSavingsMetricDialog) {
      case 'average':
        // Calculate how much to adjust each month to achieve the desired average
        const totalMonths = filteredData.length;
        const currentTotal = filteredData.reduce((acc, curr) => acc + curr.savings, 0);
        const targetTotal = editingSavingsValue * totalMonths;
        const difference = targetTotal - currentTotal;
        const adjustmentPerMonth = difference / totalMonths;
        
        // Apply adjustment to each month in the filtered period
        updatedMonthlyData = updatedMonthlyData.map((month, i) => {
          const monthIndex = monthlyData.length - filteredData.length + i;
          if (i >= monthlyData.length - filteredData.length) {
            return {
              ...month,
              savings: month.savings + adjustmentPerMonth,
              // Adjust expenses to maintain income
              expenses: month.income - (month.savings + adjustmentPerMonth)
            };
          }
          return month;
        });
        break;
        
      case 'highest':
        // Find current highest month and adjust it
        const highestSavingsMonth = filteredData.reduce(
          (maxMonth, currentMonth) => currentMonth.savings > maxMonth.savings ? currentMonth : maxMonth,
          filteredData[0]
        );
        
        // Update that specific month
        updatedMonthlyData = updatedMonthlyData.map(month => {
          if (month.month === highestSavingsMonth.month) {
            return {
              ...month,
              savings: editingSavingsValue,
              // Adjust expenses to maintain income
              expenses: month.income - editingSavingsValue
            };
          }
          return month;
        });
        break;
        
      case 'total':
        // Proportionally adjust all months to reach the target total
        const currentSavingsTotal = filteredData.reduce((acc, curr) => acc + curr.savings, 0);
        const scaleFactor = editingSavingsValue / currentSavingsTotal;
        
        updatedMonthlyData = updatedMonthlyData.map((month, i) => {
          if (i >= monthlyData.length - filteredData.length) {
            const newSavings = month.savings * scaleFactor;
            return {
              ...month,
              savings: newSavings,
              // Adjust expenses to maintain income
              expenses: month.income - newSavings
            };
          }
          return month;
        });
        break;
        
      case 'rate':
        // Adjust the latest month to achieve the target rate
        const targetRate = editingSavingsValue / 100;
        const newSavings = monthlyData[latestMonthIndex].income * targetRate;
        
        updatedMonthlyData[latestMonthIndex] = {
          ...updatedMonthlyData[latestMonthIndex],
          savings: newSavings,
          expenses: updatedMonthlyData[latestMonthIndex].income - newSavings
        };
        break;
    }
    
    setMonthlyData(updatedMonthlyData);
    setShowEditSavingsMetricDialog(null);
    
    toast({
      title: "Savings data updated",
      description: `Your savings metrics have been updated.`,
    });
  };

  // Handle adding a custom insight
  const handleAddCustomInsight = () => {
    if (!newInsightText.trim()) {
      toast({
        title: "Error",
        description: "Insight text is required",
        variant: "destructive"
      });
      return;
    }
    
    setCustomInsights([...customInsights, { 
      icon: newInsightIcon, 
      text: newInsightText.trim() 
    }]);
    
    setNewInsightText('');
    setNewInsightIcon('trend-up');
    setShowCustomInsightDialog(false);
    
    toast({
      title: "Insight added",
      description: "Your custom insight has been added",
    });
  };

  // Handle deleting a custom insight
  const handleDeleteInsight = (index: number) => {
    const updatedInsights = [...customInsights];
    updatedInsights.splice(index, 1);
    setCustomInsights(updatedInsights);
    
    toast({
      title: "Insight deleted",
      description: "Your custom insight has been removed",
    });
  };

  // Handle quick update of monthly financials
  const handleQuickUpdate = () => {
    // Calculate savings based on income and expenses
    const savings = quickMonthlyIncome - quickMonthlyExpenses;
    // Use a typical ratio for investments
    const investments = Math.round(savings * 0.5);
    // Default 50/30/20 rule for expense breakdown
    const needs = Math.round(quickMonthlyExpenses * 0.5);
    const wants = Math.round(quickMonthlyExpenses * 0.3);
    const others = Math.round(quickMonthlyExpenses * 0.2);
    
    // Create updated data for the current month
    const currentMonth = format(new Date(), 'MMM yyyy');
    
    // Check if current month exists
    const monthExists = monthlyData.some(data => data.month === currentMonth);
    
    if (monthExists) {
      // Update existing month
      const updatedData = monthlyData.map(data => 
        data.month === currentMonth ? {
          ...data,
          income: quickMonthlyIncome,
          expenses: quickMonthlyExpenses,
          savings: savings,
          investments: investments,
          needs: needs,
          wants: wants,
          others: others
        } : data
      );
      setMonthlyData(updatedData);
      
      // Update expense categories to match new expense allocation
      const totalExpenseCategories = expenseCategories.reduce((total, cat) => total + cat.value, 0);
      const scaleFactor = quickMonthlyExpenses / totalExpenseCategories;
      
      const updatedCategories = expenseCategories.map(cat => ({
        ...cat,
        value: Math.round(cat.value * scaleFactor)
      }));
      
      setExpenseCategories(updatedCategories);
    } else {
      // Add new month
      const newData = {
        month: currentMonth,
        income: quickMonthlyIncome,
        expenses: quickMonthlyExpenses,
        savings: savings,
        investments: investments,
        needs: needs,
        wants: wants,
        others: others
      };
      
      setMonthlyData([...monthlyData, newData]);
    }
    
    // Show success message
    setShowQuickUpdateSuccess(true);
    setTimeout(() => setShowQuickUpdateSuccess(false), 3000);
    
    // Check budget rule
    const needsPercentage = (needs / quickMonthlyExpenses) * 100;
    const wantsPercentage = (wants / quickMonthlyExpenses) * 100;
    const othersPercentage = (others / quickMonthlyExpenses) * 100;
    
    if (needsPercentage < 45 || needsPercentage > 55) {
      setBudgetAlertMessage(`Your needs spending (${needsPercentage.toFixed(1)}%) is outside the recommended range of 45-55%.`);
      setShowBudgetAlert(true);
    } else if (wantsPercentage < 25 || wantsPercentage > 35) {
      setBudgetAlertMessage(`Your wants spending (${wantsPercentage.toFixed(1)}%) is outside the recommended range of 25-35%.`);
      setShowBudgetAlert(true);
    } else if (othersPercentage < 15 || othersPercentage > 25) {
      setBudgetAlertMessage(`Your other expenses (${othersPercentage.toFixed(1)}%) are outside the recommended range of 15-25%.`);
      setShowBudgetAlert(true);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Financial Reports</h1>
          <p className="text-muted-foreground">Comprehensive analysis of your finances</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3M">3 Months</SelectItem>
              <SelectItem value="6M">6 Months</SelectItem>
              <SelectItem value="12M">12 Months</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, 'MMMM yyyy') : 'Pick a month'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button 
            variant="outline" 
            onClick={() => setShowMonthlyInputForm(true)}
            className="flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Add Month
          </Button>

          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button 
            variant={editMode ? "default" : "outline"}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? <Save className="mr-2 h-4 w-4" /> : <Edit className="mr-2 h-4 w-4" />}
            {editMode ? "Save" : "Edit"}
          </Button>
        </div>
      </div>

      {/* Quick Update Section */}
      <Card className="glass-card animate-fade-in">
        <CardHeader>
          <CardTitle>Quick Update Current Month</CardTitle>
          <CardDescription>Update your financial data for the current month to see real-time changes in your reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="quick-income" className="text-right">Monthly Income (₹)</Label>
                <div className="col-span-2 flex gap-2">
                  <Input
                    id="quick-income"
                    type="number"
                    value={quickMonthlyIncome}
                    onChange={(e) => setQuickMonthlyIncome(Number(e.target.value))}
                    className="flex-grow"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="quick-expenses" className="text-right">Monthly Expenses (₹)</Label>
                <div className="col-span-2 flex gap-2">
                  <Input
                    id="quick-expenses"
                    type="number"
                    value={quickMonthlyExpenses}
                    onChange={(e) => setQuickMonthlyExpenses(Number(e.target.value))}
                    className="flex-grow"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleQuickUpdate} className="mt-2">
                  Update Reports
                </Button>
              </div>
              {showQuickUpdateSuccess && (
                <div className="text-sm text-green-500 mt-2 text-right">
                  Reports updated successfully! All charts and metrics now reflect your latest data.
                </div>
              )}
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2">Financial Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Savings:</span>
                  <span className="font-medium">{formatToINR(quickMonthlyIncome - quickMonthlyExpenses)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Savings Rate:</span>
                  <span className="font-medium">{((quickMonthlyIncome - quickMonthlyExpenses) / quickMonthlyIncome * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expense Ratio:</span>
                  <span className="font-medium">{(quickMonthlyExpenses / quickMonthlyIncome * 100).toFixed(1)}%</span>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium mb-1">Recommended Budget Split:</h4>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="font-medium">₹{Math.round(quickMonthlyExpenses * 0.5).toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Needs (50%)</div>
                    </div>
                    <div>
                      <div className="font-medium">₹{Math.round(quickMonthlyExpenses * 0.3).toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Wants (30%)</div>
                    </div>
                    <div>
                      <div className="font-medium">₹{Math.round(quickMonthlyExpenses * 0.2).toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Others (20%)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Data Input Dialog */}
      <Dialog open={showMonthlyInputForm} onOpenChange={setShowMonthlyInputForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add/Edit Monthly Financial Data</DialogTitle>
            <DialogDescription>
              Enter your financial data for a specific month to update your reports and graphs.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="month-date" className="text-right">Month</Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newMonthDate ? format(newMonthDate, 'MMMM yyyy') : 'Pick a month'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newMonthDate}
                      onSelect={(date) => date && setNewMonthDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="month-income" className="text-right">Income (₹)</Label>
              <Input
                id="month-income"
                type="number"
                value={newMonthIncome}
                onChange={(e) => setNewMonthIncome(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="month-expenses" className="text-right">Expenses (₹)</Label>
              <Input
                id="month-expenses"
                type="number"
                value={newMonthExpenses}
                onChange={(e) => {
                  const newValue = Number(e.target.value);
                  setNewMonthExpenses(newValue);
                  // Automatically adjust needs/wants/others based on 50/30/20 rule
                  setNewMonthNeeds(Math.round(newValue * 0.5));
                  setNewMonthWants(Math.round(newValue * 0.3));
                  setNewMonthOthers(Math.round(newValue * 0.2));
                }}
                className="col-span-3"
              />
            </div>
            <div className="space-y-2">
              <div className="font-medium">Expense Breakdown</div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="month-needs" className="text-right">Needs (₹)</Label>
                <Input
                  id="month-needs"
                  type="number"
                  value={newMonthNeeds}
                  onChange={(e) => setNewMonthNeeds(Number(e.target.value))}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="month-wants" className="text-right">Wants (₹)</Label>
                <Input
                  id="month-wants"
                  type="number"
                  value={newMonthWants}
                  onChange={(e) => setNewMonthWants(Number(e.target.value))}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="month-others" className="text-right">Others (₹)</Label>
                <Input
                  id="month-others"
                  type="number"
                  value={newMonthOthers}
                  onChange={(e) => setNewMonthOthers(Number(e.target.value))}
                  className="col-span-3"
                />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Note: The sum of Needs, Wants, and Others should equal your total Expenses.
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMonthlyInputForm(false)}>Cancel</Button>
            <Button onClick={handleAddNewMonthData}>Save Data</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Budget rule violation alert */}
      <AlertDialog open={showBudgetAlert} onOpenChange={setShowBudgetAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Budget Rule Violation</AlertDialogTitle>
            <AlertDialogDescription>
              {budgetAlertMessage}
              <div className="mt-2">
                For optimal financial health, we recommend following the 50/30/20 rule:
                <ul className="list-disc pl-5 mt-2">
                  <li>50% for needs (housing, food, utilities)</li>
                  <li>30% for wants (entertainment, shopping)</li>
                  <li>20% for savings and debt repayment</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Financial Health Score */}
      <Card className="glass-card animate-fade-in">
        <CardHeader>
          <CardTitle>Financial Health Score</CardTitle>
          <CardDescription>Overall financial wellness indicator</CardDescription>
        </CardHeader>
        <CardContent className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="100%"
              data={[{ name: 'Score', value: calculateFinancialScore(), fill: calculateFinancialScore() > 70 ? '#22c55e' : calculateFinancialScore() > 40 ? '#eab308' : '#ef4444' }]}
              startAngle={180}
              endAngle={0}
            >
              <RadialBar
                background
                dataKey="value"
                cornerRadius={30}
              />
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-2xl font-bold"
                fill="currentColor"
              >
                {calculateFinancialScore()}
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Income Trends */}
        <Card className="glass-card animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            {editMode && (
              <Button size="sm" variant="ghost" onClick={() => {
                setEditIncome(getLatestMonthData().income);
                setEditingIncome(true);
              }}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <div className="text-right">
                <p className="text-2xl font-bold">{formatToINR(getLatestMonthData().income)}</p>
                <p className={`text-sm flex items-center justify-end gap-1 ${
                  calculateChanges().income >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {calculateChanges().income >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {Math.abs(calculateChanges().income).toFixed(1)}% vs last month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Income edit dialog */}
        <Dialog open={editingIncome} onOpenChange={setEditingIncome}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Monthly Income</DialogTitle>
              <DialogDescription>
                Update your monthly income for the current month.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="income" className="text-right">
                  Income (₹)
                </Label>
                <Input
                  id="income"
                  type="number"
                  value={editIncome}
                  onChange={(e) => setEditIncome(Number(e.target.value))}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingIncome(false)}>Cancel</Button>
              <Button onClick={handleUpdateIncome}>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Expense Trends */}
        <Card className="glass-card animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            {editMode && (
              <Button size="sm" variant="ghost" onClick={() => {
                setEditExpenses(getLatestMonthData().expenses);
                setEditingExpenses(true);
              }}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Wallet className="w-8 h-8 text-red-500" />
              <div className="text-right">
                <p className="text-2xl font-bold">{formatToINR(getLatestMonthData().expenses)}</p>
                <p className={`text-sm flex items-center justify-end gap-1 ${
                  calculateChanges().expenses <= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {calculateChanges().expenses <= 0 ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  {Math.abs(calculateChanges().expenses).toFixed(1)}% vs last month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expenses edit dialog */}
        <Dialog open={editingExpenses} onOpenChange={setEditingExpenses}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Monthly Expenses</DialogTitle>
              <DialogDescription>
                Update your monthly expenses for the current month. This will proportionally adjust all expense categories.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="expenses" className="text-right">
                  Expenses (₹)
                </Label>
                <Input
                  id="expenses"
                  type="number"
                  value={editExpenses}
                  onChange={(e) => setEditExpenses(Number(e.target.value))}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingExpenses(false)}>Cancel</Button>
              <Button onClick={handleUpdateExpenses}>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Savings Rate */}
        <Card className="glass-card animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <PiggyBank className="w-8 h-8 text-primary" />
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {((getLatestMonthData().savings / getLatestMonthData().income) * 100).toFixed(1)}%
                </p>
                <p className={`text-sm flex items-center justify-end gap-1 ${
                  calculateChanges().savings >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {calculateChanges().savings >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {Math.abs(calculateChanges().savings).toFixed(1)}% vs last month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 lg:max-w-[600px]">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="savings">Savings</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          {/* Cash Flow Trend */}
          <Card className="glass-card animate-fade-in">
            <CardHeader>
              <CardTitle>Cash Flow Trends</CardTitle>
              <CardDescription>Income, expenses, and savings over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatToINR(value)} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stackId="1"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.3}
                    name="Income"
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stackId="2"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.3}
                    name="Expenses"
                  />
                  <Area
                    type="monotone"
                    dataKey="savings"
                    stackId="3"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    name="Savings"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          {/* Budget Allocation */}
          <Card className="glass-card animate-fade-in">
            <CardHeader>
              <CardTitle>Budget Allocation</CardTitle>
              <CardDescription>50/30/20 budget rule analysis</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Needs (50%)', value: getLatestMonthData().needs, fill: '#4ECDC4' },
                      { name: 'Wants (30%)', value: getLatestMonthData().wants, fill: '#FF6B6B' },
                      { name: 'Others (20%)', value: getLatestMonthData().others, fill: '#FFEEAD' }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    dataKey="value"
                    label={({ name, value, percent }) => 
                      `${name}: ${formatToINR(value)} (${(percent * 100).toFixed(1)}%)`
                    }
                  />
                  <Tooltip formatter={(value: number) => formatToINR(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Expense Categories */}
            <Card className="glass-card animate-fade-in">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Expense Distribution</CardTitle>
                  <CardDescription>Category-wise breakdown</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAddCategoryDialog(true)}
                >
                  Add Category
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseCategories}
                        cx="50%"
                        cy="50%"
                        outerRadius={150}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${formatToINR(value)}`}
                      >
                        {expenseCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatToINR(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Category editing */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Expense Categories</h3>
                    {editMode && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setShowAddCategoryDialog(true)}
                      >
                        Add New
                      </Button>
                    )}
                  </div>
                  {expenseCategories.map((category) => (
                    <div key={category.name} className="flex items-center justify-between gap-2 p-2 rounded hover:bg-muted">
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: category.fill }}
                        />
                        <span>{category.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>{formatToINR(category.value)}</span>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => {
                            setEditingCategory(category.name);
                            setEditValue(category.value);
                            setEditCategoryType(category.type);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Category editing dialog */}
            <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit {editingCategory} Expenses</DialogTitle>
                  <DialogDescription>
                    Update the amount and type for this expense category.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">
                      Amount (₹)
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(Number(e.target.value))}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Type
                    </Label>
                    <Select 
                      value={editCategoryType} 
                      onValueChange={(value: 'needs' | 'wants' | 'others') => setEditCategoryType(value)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="needs">Needs</SelectItem>
                        <SelectItem value="wants">Wants</SelectItem>
                        <SelectItem value="others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditingCategory(null)}>Cancel</Button>
                  <Button onClick={() => editingCategory && handleUpdateCategory(editingCategory)}>Save changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Add new category dialog */}
            <Dialog open={showAddCategoryDialog} onOpenChange={setShowAddCategoryDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Expense Category</DialogTitle>
                  <DialogDescription>
                    Create a new expense category to track your spending.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="new-category-name" className="text-right">
                      Category Name
                    </Label>
                    <Input
                      id="new-category-name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="new-category-amount" className="text-right">
                      Amount (₹)
                    </Label>
                    <Input
                      id="new-category-amount"
                      type="number"
                      value={newCategoryAmount}
                      onChange={(e) => setNewCategoryAmount(Number(e.target.value))}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="new-category-type" className="text-right">
                      Type
                    </Label>
                    <Select 
                      value={newCategoryType} 
                      onValueChange={(value: 'needs' | 'wants' | 'others') => setNewCategoryType(value)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="needs">Needs</SelectItem>
                        <SelectItem value="wants">Wants</SelectItem>
                        <SelectItem value="others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="new-category-color" className="text-right">
                      Color
                    </Label>
                    <div className="col-span-3 flex gap-2">
                      {['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B786F', '#3b82f6', '#ef4444', '#22c55e'].map(color => (
                        <button
                          key={color}
                          type="button"
                          className={`h-6 w-6 rounded-full border-2 ${newCategoryColor === color ? 'border-black dark:border-white' : 'border-transparent'}`}
                          style={{ backgroundColor: color }}
                          onClick={() => setNewCategoryColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddCategoryDialog(false)}>Cancel</Button>
                  <Button onClick={handleAddCategory}>Add Category</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Monthly Expense Trend */}
            <Card className="glass-card animate-fade-in">
              <CardHeader>
                <CardTitle>Monthly Expenses</CardTitle>
                <CardDescription>Expense trend analysis</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatToINR(value)} />
                    <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="savings" className="space-y-6">
          <Card className="glass-card animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Savings Growth</CardTitle>
                <CardDescription>Cumulative savings over time</CardDescription>
              </div>
              {editMode && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setShowSavingsGoalDialog(true)}
                >
                  Set Savings Goal
                </Button>
              )}
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatToINR(value)} />
                  <Area
                    type="monotone"
                    dataKey="savings"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    name="Savings"
                  />
                  {savingsGoal > 0 && (
                    <Area
                      type="monotone"
                      dataKey="savingsGoal"
                      stroke="#22c55e"
                      strokeDasharray="5 5"
                      fill="none"
                      name="Goal"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Savings Goal Dialog */}
          <Dialog open={showSavingsGoalDialog} onOpenChange={setShowSavingsGoalDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Set Savings Goal</DialogTitle>
                <DialogDescription>
                  Define your monthly savings target to track your progress.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="savings-goal" className="text-right">
                    Monthly Goal (₹)
                  </Label>
                  <Input
                    id="savings-goal"
                    type="number"
                    value={savingsGoal}
                    onChange={(e) => setSavingsGoal(Number(e.target.value))}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowSavingsGoalDialog(false)}>Cancel</Button>
                <Button onClick={handleSetSavingsGoal}>Save Goal</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Savings Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass-card animate-fade-in">
              <CardHeader className="flex justify-between items-start">
                <CardTitle className="text-sm">Average Monthly Savings</CardTitle>
                {editMode && (
                  <Button size="sm" variant="ghost" onClick={() => {
                    setEditingSavingsValue(
                      filteredData.reduce((acc, curr) => acc + curr.savings, 0) / filteredData.length
                    );
                    setShowEditSavingsMetricDialog('average');
                  }}>
                    <Edit className="h-3 w-3" />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatToINR(
                    filteredData.reduce((acc, curr) => acc + curr.savings, 0) / filteredData.length
                  )}
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card animate-fade-in">
              <CardHeader className="flex justify-between items-start">
                <CardTitle className="text-sm">Highest Savings Month</CardTitle>
                {editMode && (
                  <Button size="sm" variant="ghost" onClick={() => {
                    setEditingSavingsValue(Math.max(...filteredData.map(d => d.savings)));
                    setShowEditSavingsMetricDialog('highest');
                  }}>
                    <Edit className="h-3 w-3" />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatToINR(Math.max(...filteredData.map(d => d.savings)))}
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card animate-fade-in">
              <CardHeader className="flex justify-between items-start">
                <CardTitle className="text-sm">Total Savings</CardTitle>
                {editMode && (
                  <Button size="sm" variant="ghost" onClick={() => {
                    setEditingSavingsValue(filteredData.reduce((acc, curr) => acc + curr.savings, 0));
                    setShowEditSavingsMetricDialog('total');
                  }}>
                    <Edit className="h-3 w-3" />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatToINR(filteredData.reduce((acc, curr) => acc + curr.savings, 0))}
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card animate-fade-in">
              <CardHeader className="flex justify-between items-start">
                <CardTitle className="text-sm">Average Savings Rate</CardTitle>
                {editMode && (
                  <Button size="sm" variant="ghost" onClick={() => {
                    setEditingSavingsValue(
                      (filteredData.reduce((acc, curr) => acc + curr.savings, 0) /
                        filteredData.reduce((acc, curr) => acc + curr.income, 0)) * 100
                    );
                    setShowEditSavingsMetricDialog('rate');
                  }}>
                    <Edit className="h-3 w-3" />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {(
                    (filteredData.reduce((acc, curr) => acc + curr.savings, 0) /
                      filteredData.reduce((acc, curr) => acc + curr.income, 0)) *
                    100
                  ).toFixed(1)}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Edit Savings Metric Dialog */}
          <Dialog open={!!showEditSavingsMetricDialog} onOpenChange={(open) => !open && setShowEditSavingsMetricDialog(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Edit {
                    showEditSavingsMetricDialog === 'average' ? 'Average Monthly Savings' :
                    showEditSavingsMetricDialog === 'highest' ? 'Highest Savings Month' :
                    showEditSavingsMetricDialog === 'total' ? 'Total Savings' : 'Average Savings Rate'
                  }
                </DialogTitle>
                <DialogDescription>
                  This will update your savings data for the selected period.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="savings-metric-value" className="text-right">
                    Value {showEditSavingsMetricDialog === 'rate' ? '(%)' : '(₹)'}
                  </Label>
                  <Input
                    id="savings-metric-value"
                    type="number"
                    value={editingSavingsValue}
                    onChange={(e) => setEditingSavingsValue(Number(e.target.value))}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowEditSavingsMetricDialog(null)}>Cancel</Button>
                <Button onClick={handleUpdateSavingsMetric}>Update</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Financial Insights */}
            <Card className="glass-card animate-fade-in">
              <CardHeader className="flex justify-between items-start">
                <div>
                  <CardTitle>Key Insights</CardTitle>
                  <CardDescription>Financial analysis and recommendations</CardDescription>
                </div>
                {editMode && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setShowCustomInsightDialog(true)}
                  >
                    Add Custom Insight
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {calculateChanges().income > 0 && (
                    <div className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500 mt-1" />
                      <p>Your income has increased by {calculateChanges().income.toFixed(1)}% compared to last month.</p>
                    </div>
                  )}
                  {calculateChanges().expenses > 0 && (
                    <div className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-red-500 mt-1" />
                      <p>Your expenses have increased by {calculateChanges().expenses.toFixed(1)}%. Consider reviewing your spending habits.</p>
                    </div>
                  )}
                  {(getLatestMonthData().savings / getLatestMonthData().income) < 0.2 && (
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 mt-1" />
                      <p>Your savings rate is below the recommended 20%. Try to increase your savings.</p>
                    </div>
                  )}
                  {calculateFinancialScore() > 70 && (
                    <div className="flex items-start gap-2">
                      <Target className="w-4 h-4 text-green-500 mt-1" />
                      <p>Great job! Your financial health score is excellent. Keep maintaining your good financial habits.</p>
                    </div>
                  )}
                  
                  {/* 50/30/20 rule analysis */}
                  {getLatestMonthData().needs / getLatestMonthData().expenses > 0.55 && (
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 mt-1" />
                      <p>Your needs spending is {((getLatestMonthData().needs / getLatestMonthData().expenses) * 100).toFixed(1)}% of your expenses, above the recommended 50%.</p>
                    </div>
                  )}
                  {getLatestMonthData().wants / getLatestMonthData().expenses > 0.35 && (
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 mt-1" />
                      <p>Your wants spending is {((getLatestMonthData().wants / getLatestMonthData().expenses) * 100).toFixed(1)}% of your expenses, above the recommended 30%.</p>
                    </div>
                  )}

                  {/* Custom insights */}
                  {customInsights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-2 group">
                      {insight.icon === 'trend-up' && <TrendingUp className="w-4 h-4 text-green-500 mt-1" />}
                      {insight.icon === 'trend-down' && <TrendingDown className="w-4 h-4 text-red-500 mt-1" />}
                      {insight.icon === 'alert' && <AlertTriangle className="w-4 h-4 text-yellow-500 mt-1" />}
                      {insight.icon === 'target' && <Target className="w-4 h-4 text-primary mt-1" />}
                      {insight.icon === 'wallet' && <Wallet className="w-4 h-4 text-primary mt-1" />}
                      <p className="flex-1">{insight.text}</p>
                      {editMode && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="opacity-0 group-hover:opacity-100"
                          onClick={() => handleDeleteInsight(index)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Custom Insight Dialog */}
            <Dialog open={showCustomInsightDialog} onOpenChange={setShowCustomInsightDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Custom Insight</DialogTitle>
                  <DialogDescription>
                    Create a personalized financial insight or note.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="insight-text" className="text-right">
                      Insight Text
                    </Label>
                    <Textarea
                      id="insight-text"
                      value={newInsightText}
                      onChange={(e) => setNewInsightText(e.target.value)}
                      className="col-span-3"
                      placeholder="Enter your custom insight or financial note"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="insight-icon" className="text-right">
                      Icon
                    </Label>
                    <Select 
                      value={newInsightIcon} 
                      onValueChange={setNewInsightIcon as any}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select icon" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trend-up">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span>Trend Up</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="trend-down">
                          <div className="flex items-center gap-2">
                            <TrendingDown className="h-4 w-4 text-red-500" />
                            <span>Trend Down</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="alert">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            <span>Alert</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="target">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-primary" />
                            <span>Target</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="wallet">
                          <div className="flex items-center gap-2">
                            <Wallet className="h-4 w-4 text-primary" />
                            <span>Wallet</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCustomInsightDialog(false)}>Cancel</Button>
                  <Button onClick={handleAddCustomInsight}>Add Insight</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Recommendations */}
            <Card className="glass-card animate-fade-in">
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>Personalized financial advice</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenseCategories
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 1)
                    .map(category => (
                      <div key={category.name} className="flex items-start gap-2">
                        <Wallet className="w-4 h-4 text-primary mt-1" />
                        <p>Your highest expense category is {category.name}. Look for ways to reduce spending in this area.</p>
                      </div>
                    ))}
                  {getLatestMonthData().investments < getLatestMonthData().income * 0.1 && (
                    <div className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-500 mt-1" />
                      <p>Consider increasing your investments to at least 10% of your income for better long-term growth.</p>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <PiggyBank className="w-4 h-4 text-primary mt-1" />
                    <p>Set up an emergency fund worth 6 months of expenses for financial security.</p>
                  </div>
                  
                  {/* 50/30/20 recommendation */}
                  <div className="flex items-start gap-2">
                    <Target className="w-4 h-4 text-green-500 mt-1" />
                    <div>
                      <p className="font-medium">Follow the 50/30/20 budget rule:</p>
                      <ul className="list-disc pl-5 mt-1">
                        <li>50% for needs (housing, food, utilities)</li>
                        <li>30% for wants (entertainment, shopping)</li>
                        <li>20% for savings and debt repayment</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
