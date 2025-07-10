import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
  Plus,
  Target,
  CreditCard,
  PiggyBank,
  Edit,
  AlertCircle,
  RefreshCw,
  Filter,
  ShoppingBag,
  Home,
  Utensils
} from 'lucide-react';
import { formatToINR } from '@/lib/utils';
import { format, isAfter, parseISO, isBefore, addDays } from 'date-fns';

interface Alert {
  id: string;
  type: 'budget' | 'bill' | 'goal';
  title: string;
  description: string;
  amount?: number;
  dueDate?: string;
  status: 'active' | 'completed' | 'overdue';
  createdAt: string;
  lastUpdated?: string;
  category?: 'needs' | 'wants' | 'savings' | 'other';
  threshold?: number;
}

interface BudgetRule {
  id: string;
  name: string;
  category: 'needs' | 'wants' | 'savings' | 'other';
  threshold: number; // percentage of budget
  enabled: boolean;
}

const AlertsPage = () => {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'budget',
      title: 'Shopping Budget Alert',
      description: 'You have exceeded 80% of your shopping budget',
      amount: 12000,
      status: 'active',
      createdAt: '2024-03-15',
      category: 'wants'
    },
    {
      id: '2',
      type: 'bill',
      title: 'Electricity Bill Due',
      description: 'Your electricity bill payment is due in 3 days',
      amount: 2500,
      dueDate: '2024-03-20',
      status: 'active',
      createdAt: '2024-03-10',
      category: 'needs'
    },
    {
      id: '3',
      type: 'goal',
      title: 'Savings Goal Milestone',
      description: 'You are close to reaching your Emergency Fund goal',
      amount: 50000,
      status: 'completed',
      createdAt: '2024-03-01',
      category: 'savings'
    },
    {
      id: '4',
      type: 'budget',
      title: 'Needs Budget Alert',
      description: 'You have exceeded your 50% threshold for needs spending this month',
      amount: 35000,
      status: 'active',
      createdAt: '2024-03-18',
      category: 'needs',
      threshold: 50
    },
    {
      id: '5',
      type: 'budget',
      title: 'Wants Budget Alert',
      description: 'You are approaching your 30% threshold for wants spending',
      amount: 18000,
      status: 'active',
      createdAt: '2024-03-19',
      category: 'wants',
      threshold: 30
    }
  ]);

  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showBudgetRulesDialog, setShowBudgetRulesDialog] = useState(false);

  const [settings, setSettings] = useState({
    budgetAlerts: true,
    billReminders: true,
    goalNotifications: true,
    emailNotifications: false,
    pushNotifications: true,
    lowBalanceThreshold: 5000,
    autoCheckOverdue: true,
    notificationFrequency: 'daily'
  });

  const [newAlert, setNewAlert] = useState({
    type: 'budget',
    title: '',
    description: '',
    amount: '',
    dueDate: '',
    category: 'needs',
    threshold: ''
  });

  const [budgetRules, setBudgetRules] = useState<BudgetRule[]>([
    {
      id: '1',
      name: 'Needs Budget (50%)',
      category: 'needs',
      threshold: 50,
      enabled: true
    },
    {
      id: '2',
      name: 'Wants Budget (30%)',
      category: 'wants',
      threshold: 30,
      enabled: true
    },
    {
      id: '3',
      name: 'Needs Budget Warning',
      category: 'needs',
      threshold: 45,
      enabled: true
    },
    {
      id: '4',
      name: 'Wants Budget Warning',
      category: 'wants',
      threshold: 25,
      enabled: true
    }
  ]);

  const [newBudgetRule, setNewBudgetRule] = useState<{
    name: string;
    category: 'needs' | 'wants' | 'savings' | 'other';
    threshold: string;
  }>({
    name: '',
    category: 'needs',
    threshold: '',
  });

  // Check for overdue alerts and update status
  useEffect(() => {
    if (!settings.autoCheckOverdue) return;

    const updatedAlerts = alerts.map(alert => {
      if (alert.status === 'completed') return alert;
      
      if (alert.dueDate && isBefore(parseISO(alert.dueDate), new Date()) && alert.status !== 'overdue') {
        return { ...alert, status: 'overdue' as const, lastUpdated: new Date().toISOString() };
      }
      return alert;
    });

    if (JSON.stringify(updatedAlerts) !== JSON.stringify(alerts)) {
      setAlerts(updatedAlerts);
      
      const overdueCount = updatedAlerts.filter(a => a.status === 'overdue').length;
      if (overdueCount > 0) {
        toast({
          title: "Overdue Alerts",
          description: `You have ${overdueCount} overdue ${overdueCount === 1 ? 'alert' : 'alerts'}`,
          variant: "destructive",
        });
      }
    }
  }, [alerts, settings.autoCheckOverdue]);

  // Filter alerts when activeFilter changes
  useEffect(() => {
    filterAlerts(activeFilter);
  }, [alerts, activeFilter]);

  const filterAlerts = (filter: string) => {
    setActiveFilter(filter);
    
    if (filter === 'all') {
      setFilteredAlerts(alerts);
      return;
    }
    
    const filtered = alerts.filter(alert => {
      if (filter === 'active') return alert.status === 'active';
      if (filter === 'completed') return alert.status === 'completed';
      if (filter === 'overdue') return alert.status === 'overdue';
      if (filter === 'budget') return alert.type === 'budget';
      if (filter === 'bill') return alert.type === 'bill';
      if (filter === 'goal') return alert.type === 'goal';
      if (filter === 'needs') return alert.category === 'needs';
      if (filter === 'wants') return alert.category === 'wants';
      if (filter === 'savings') return alert.category === 'savings';
      return true;
    });
    
    setFilteredAlerts(filtered);
  };

  const refreshAlerts = () => {
    setIsRefreshing(true);
    
    // Simulate checking for updates
    setTimeout(() => {
      // Check for any alerts with due dates approaching in the next 3 days
      const today = new Date();
      const threeDaysFromNow = addDays(today, 3);
      
      const updatedAlerts = alerts.map(alert => {
        if (alert.dueDate && alert.status === 'active') {
          const dueDate = parseISO(alert.dueDate);
          if (isBefore(dueDate, threeDaysFromNow) && isAfter(dueDate, today)) {
            // Update the description to indicate the due date is approaching
            return {
              ...alert,
              description: `Due soon: ${alert.description}`,
              lastUpdated: new Date().toISOString()
            };
          }
        }
        return alert;
      });
      
      // Simulate checking for budget threshold violations
      if (settings.budgetAlerts) {
        // Get enabled budget rules
        const activeRules = budgetRules.filter(rule => rule.enabled);
        
        // For demo purposes, randomly trigger some budget alerts
        const shouldTriggerAlert = Math.random() > 0.5;
        
        if (shouldTriggerAlert && activeRules.length > 0) {
          // Pick a random rule
          const randomRuleIndex = Math.floor(Math.random() * activeRules.length);
          const rule = activeRules[randomRuleIndex];
          
          // Create a new alert for the rule
          const newBudgetAlert: Alert = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'budget',
            title: `${rule.category.charAt(0).toUpperCase() + rule.category.slice(1)} Budget Alert`,
            description: `You have exceeded your ${rule.threshold}% threshold for ${rule.category} spending`,
            amount: rule.category === 'needs' ? 32000 : 24000, // Mock amounts
            status: 'active',
            createdAt: new Date().toISOString().split('T')[0],
            lastUpdated: new Date().toISOString(),
            category: rule.category,
            threshold: rule.threshold
          };
          
          // Add the new alert to the updated alerts
          updatedAlerts.unshift(newBudgetAlert);
          
          toast({
            title: "Budget Alert",
            description: `New alert: ${newBudgetAlert.title}`,
            variant: "destructive",
          });
        }
      }
      
      setAlerts(updatedAlerts);
      setIsRefreshing(false);
      
      toast({
        title: "Alerts Refreshed",
        description: "Your alerts have been updated",
      });
    }, 1000);
  };

  const handleAddAlert = () => {
    if (!newAlert.title || !newAlert.description) {
      toast({
        title: "Missing Information",
        description: "Please provide at least a title and description",
        variant: "destructive",
      });
      return;
    }

    const alert: Alert = {
      id: Math.random().toString(36).substr(2, 9),
      type: newAlert.type as 'budget' | 'bill' | 'goal',
      title: newAlert.title,
      description: newAlert.description,
      amount: newAlert.amount ? parseFloat(newAlert.amount) : undefined,
      dueDate: newAlert.dueDate || undefined,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString(),
      category: newAlert.category as 'needs' | 'wants' | 'savings' | 'other',
      threshold: newAlert.threshold ? parseFloat(newAlert.threshold) : undefined
    };

    setAlerts([alert, ...alerts]);
    setNewAlert({
      type: 'budget',
      title: '',
      description: '',
      amount: '',
      dueDate: '',
      category: 'needs',
      threshold: ''
    });

    toast({
      title: "Alert Created",
      description: "Your new alert has been created successfully",
    });
  };

  const handleAddBudgetRule = () => {
    if (!newBudgetRule.name || !newBudgetRule.threshold) {
      toast({
        title: "Missing Information",
        description: "Please provide a name and threshold percentage",
        variant: "destructive",
      });
      return;
    }

    const rule: BudgetRule = {
      id: Math.random().toString(36).substr(2, 9),
      name: newBudgetRule.name,
      category: newBudgetRule.category,
      threshold: parseFloat(newBudgetRule.threshold),
      enabled: true
    };

    setBudgetRules([...budgetRules, rule]);
    setNewBudgetRule({
      name: '',
      category: 'needs',
      threshold: '',
    });

    toast({
      title: "Budget Rule Created",
      description: "Your new budget rule has been created successfully",
    });
  };

  const handleToggleBudgetRule = (id: string) => {
    const updatedRules = budgetRules.map(rule => 
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    );
    
    setBudgetRules(updatedRules);
    
    const rule = updatedRules.find(r => r.id === id);
    toast({
      title: rule?.enabled ? "Rule Enabled" : "Rule Disabled",
      description: `"${rule?.name}" is now ${rule?.enabled ? 'enabled' : 'disabled'}`,
    });
  };

  const handleDeleteBudgetRule = (id: string) => {
    setBudgetRules(budgetRules.filter(rule => rule.id !== id));
    
    toast({
      title: "Budget Rule Deleted",
      description: "The budget rule has been deleted",
    });
  };

  const handleCreatePresetNeedsAlert = () => {
    const needsAlert: Alert = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'budget',
      title: 'Needs Budget Exceeded',
      description: 'Your spending on needs has exceeded the recommended 50% of your monthly budget',
      amount: 35000,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString(),
      category: 'needs',
      threshold: 50
    };

    setAlerts([needsAlert, ...alerts]);
    
    toast({
      title: "Needs Alert Created",
      description: "Preset needs budget alert has been created",
    });
  };

  const handleCreatePresetWantsAlert = () => {
    const wantsAlert: Alert = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'budget',
      title: 'Wants Budget Exceeded',
      description: 'Your spending on wants has exceeded the recommended 30% of your monthly budget',
      amount: 24000,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString(),
      category: 'wants',
      threshold: 30
    };

    setAlerts([wantsAlert, ...alerts]);
    
    toast({
      title: "Wants Alert Created",
      description: "Preset wants budget alert has been created",
    });
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
    
    toast({
      title: "Alert Deleted",
      description: "The alert has been deleted",
    });
  };

  const handleUpdateAlertStatus = (id: string, newStatus: 'active' | 'completed' | 'overdue') => {
    const updatedAlerts = alerts.map(alert => 
      alert.id === id 
        ? { ...alert, status: newStatus, lastUpdated: new Date().toISOString() } 
        : alert
    );
    
    setAlerts(updatedAlerts);
    
    toast({
      title: "Status Updated",
      description: `Alert marked as ${newStatus}`,
      variant: newStatus === 'overdue' ? "destructive" : "default",
    });
  };

  const handleEditAlert = () => {
    if (!editingAlert) return;
    
    const updatedAlerts = alerts.map(alert => 
      alert.id === editingAlert.id ? { ...editingAlert, lastUpdated: new Date().toISOString() } : alert
    );
    
    setAlerts(updatedAlerts);
    setIsEditDialogOpen(false);
    setEditingAlert(null);
    
    toast({
      title: "Alert Updated",
      description: "Your alert has been updated successfully",
    });
  };

  const getAlertIcon = (type: string, category?: string) => {
    if (type === 'budget') {
      if (category === 'needs') return <Home className="w-4 h-4" />;
      if (category === 'wants') return <ShoppingBag className="w-4 h-4" />;
      return <CreditCard className="w-4 h-4" />;
    }
    
    if (type === 'bill') return <Clock className="w-4 h-4" />;
    if (type === 'goal') return <Target className="w-4 h-4" />;
    return <Bell className="w-4 h-4" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return null;
    }
  };

  const getLastUpdatedText = (lastUpdated?: string) => {
    if (!lastUpdated) return null;
    
    const date = parseISO(lastUpdated);
    return (
      <span className="text-xs text-muted-foreground italic">
        Updated {format(date, 'MMM d, yyyy')}
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Alerts & Notifications</h1>
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshAlerts}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Select value={activeFilter} onValueChange={filterAlerts}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Alerts</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="budget">Budget</SelectItem>
              <SelectItem value="bill">Bills</SelectItem>
              <SelectItem value="goal">Goals</SelectItem>
              <SelectItem value="needs">Needs</SelectItem>
              <SelectItem value="wants">Wants</SelectItem>
              <SelectItem value="savings">Savings</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 50/30/20 Budget Rule Card */}
      <Card className="glass-card animate-fade-in">
        <CardHeader>
          <CardTitle>50/30/20 Budget Rule</CardTitle>
          <CardDescription>Set up alerts for your budget allocation following the 50/30/20 rule</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950 flex flex-col items-center">
              <Home className="w-8 h-8 text-blue-600 mb-2" />
              <h3 className="font-bold text-center">Needs (50%)</h3>
              <p className="text-sm text-center text-muted-foreground mb-4">Housing, utilities, groceries, transport</p>
              <Button variant="outline" onClick={handleCreatePresetNeedsAlert}>
                Add Needs Alert
              </Button>
            </div>
            <div className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-950 flex flex-col items-center">
              <ShoppingBag className="w-8 h-8 text-purple-600 mb-2" />
              <h3 className="font-bold text-center">Wants (30%)</h3>
              <p className="text-sm text-center text-muted-foreground mb-4">Entertainment, dining out, shopping</p>
              <Button variant="outline" onClick={handleCreatePresetWantsAlert}>
                Add Wants Alert
              </Button>
            </div>
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950 flex flex-col items-center">
              <PiggyBank className="w-8 h-8 text-green-600 mb-2" />
              <h3 className="font-bold text-center">Savings (20%)</h3>
              <p className="text-sm text-center text-muted-foreground mb-4">Savings, investments, debt repayment</p>
              <Button variant="outline" onClick={() => setShowBudgetRulesDialog(true)}>
                Manage Budget Rules
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alert Settings Card */}
        <Card className="glass-card animate-fade-in lg:col-span-1">
          <CardHeader>
            <CardTitle>Alert Settings</CardTitle>
            <CardDescription>Configure your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="budget-alerts">Budget Alerts</Label>
              <Switch
                id="budget-alerts"
                checked={settings.budgetAlerts}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, budgetAlerts: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="bill-reminders">Bill Reminders</Label>
              <Switch
                id="bill-reminders"
                checked={settings.billReminders}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, billReminders: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="goal-notifications">Goal Notifications</Label>
              <Switch
                id="goal-notifications"
                checked={settings.goalNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, goalNotifications: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <Switch
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, emailNotifications: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <Switch
                id="push-notifications"
                checked={settings.pushNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, pushNotifications: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-check">Auto-check Overdue</Label>
              <Switch
                id="auto-check"
                checked={settings.autoCheckOverdue}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, autoCheckOverdue: checked })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="low-balance">Low Balance Threshold</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="low-balance"
                  type="number"
                  value={settings.lowBalanceThreshold}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      lowBalanceThreshold: parseInt(e.target.value)
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notification-frequency">Notification Frequency</Label>
              <Select 
                value={settings.notificationFrequency}
                onValueChange={(value) => setSettings({...settings, notificationFrequency: value})}
              >
                <SelectTrigger id="notification-frequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtime">Real-time</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Create Alert Card */}
        <Card className="glass-card animate-fade-in lg:col-span-2">
          <CardHeader>
            <CardTitle>Create Alert</CardTitle>
            <CardDescription>Set up new alerts and reminders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="alert-type">Alert Type</Label>
                <Select
                  value={newAlert.type}
                  onValueChange={(value) =>
                    setNewAlert({ ...newAlert, type: value })
                  }
                >
                  <SelectTrigger id="alert-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="budget">Budget Alert</SelectItem>
                    <SelectItem value="bill">Bill Reminder</SelectItem>
                    <SelectItem value="goal">Goal Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="alert-title">Title</Label>
                <Input
                  id="alert-title"
                  value={newAlert.title}
                  onChange={(e) =>
                    setNewAlert({ ...newAlert, title: e.target.value })
                  }
                  placeholder="Alert title"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="alert-description">Description</Label>
              <Input
                id="alert-description"
                value={newAlert.description}
                onChange={(e) =>
                  setNewAlert({ ...newAlert, description: e.target.value })
                }
                placeholder="Alert description"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="alert-amount">Amount (optional)</Label>
                <Input
                  id="alert-amount"
                  type="number"
                  value={newAlert.amount}
                  onChange={(e) =>
                    setNewAlert({ ...newAlert, amount: e.target.value })
                  }
                  placeholder="Enter amount"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alert-date">Due Date (optional)</Label>
                <Input
                  id="alert-date"
                  type="date"
                  value={newAlert.dueDate}
                  onChange={(e) =>
                    setNewAlert({ ...newAlert, dueDate: e.target.value })
                  }
                />
              </div>
            </div>
            
            {newAlert.type === 'budget' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="alert-category">Budget Category</Label>
                  <Select
                    value={newAlert.category}
                    onValueChange={(value) =>
                      setNewAlert({ ...newAlert, category: value })
                    }
                  >
                    <SelectTrigger id="alert-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="needs">Needs (50%)</SelectItem>
                      <SelectItem value="wants">Wants (30%)</SelectItem>
                      <SelectItem value="savings">Savings (20%)</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alert-threshold">Threshold % (optional)</Label>
                  <Input
                    id="alert-threshold"
                    type="number"
                    value={newAlert.threshold}
                    onChange={(e) =>
                      setNewAlert({ ...newAlert, threshold: e.target.value })
                    }
                    placeholder="e.g. 80"
                  />
                </div>
              </div>
            )}
            
            <Button className="w-full" onClick={handleAddAlert}>
              <Plus className="w-4 h-4 mr-2" />
              Create Alert
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <Card className="glass-card animate-fade-in">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Alerts</CardTitle>
              <CardDescription>
                {activeFilter === 'all' 
                  ? 'All your alerts and notifications'
                  : `Filtered by: ${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}`}
              </CardDescription>
            </div>
            <Badge variant="outline" className="ml-2">
              {filteredAlerts.length} {filteredAlerts.length === 1 ? 'alert' : 'alerts'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="card">Card View</TabsTrigger>
            </TabsList>
            <TabsContent value="list">
              <div className="space-y-4">
                {filteredAlerts.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No alerts found</p>
                    <p className="text-xs text-muted-foreground">Try changing your filter or creating a new alert</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="py-4 flex flex-col sm:flex-row sm:items-start justify-between group"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`
                            p-2 rounded-full
                            ${alert.category === 'needs' ? 'bg-blue-100 text-blue-600' : ''}
                            ${alert.category === 'wants' ? 'bg-purple-100 text-purple-600' : ''}
                            ${alert.category === 'savings' ? 'bg-green-100 text-green-600' : ''}
                            ${!alert.category && alert.type === 'budget' ? 'bg-blue-100 text-blue-600' : ''}
                            ${!alert.category && alert.type === 'bill' ? 'bg-yellow-100 text-yellow-600' : ''}
                            ${!alert.category && alert.type === 'goal' ? 'bg-green-100 text-green-600' : ''}
                          `}>
                            {getAlertIcon(alert.type, alert.category)}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-medium">{alert.title}</h3>
                              {getStatusBadge(alert.status)}
                              {alert.category && (
                                <Badge variant="outline" className="capitalize">{alert.category}</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {alert.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                              {alert.amount && (
                                <span className="flex items-center gap-1">
                                  <PiggyBank className="w-4 h-4" />
                                  {formatToINR(alert.amount)}
                                </span>
                              )}
                              {alert.threshold && (
                                <span className="flex items-center gap-1">
                                  <Target className="w-4 h-4" />
                                  {alert.threshold}% threshold
                                </span>
                              )}
                              {alert.dueDate && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  Due: {alert.dueDate}
                                </span>
                              )}
                              {getLastUpdatedText(alert.lastUpdated)}
                            </div>
                          </div>
                        </div>
                        <div className="flex mt-2 sm:mt-0 space-x-2 self-end sm:self-start">
                          {alert.status !== 'completed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8"
                              onClick={() => handleUpdateAlertStatus(alert.id, 'completed')}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              <span className="hidden sm:inline">Complete</span>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8"
                            onClick={() => {
                              setEditingAlert(alert);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-destructive"
                            onClick={() => handleDeleteAlert(alert.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="card">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAlerts.length === 0 ? (
                  <div className="text-center py-8 col-span-full">
                    <AlertCircle className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No alerts found</p>
                  </div>
                ) : (
                  filteredAlerts.map((alert) => (
                    <Card key={alert.id} className={`
                      overflow-hidden
                      ${alert.status === 'overdue' ? 'border-red-400' : ''}
                      ${alert.status === 'completed' ? 'border-green-400' : ''}
                    `}>
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                          <div className={`
                            p-2 rounded-full
                            ${alert.category === 'needs' ? 'bg-blue-100 text-blue-600' : ''}
                            ${alert.category === 'wants' ? 'bg-purple-100 text-purple-600' : ''}
                            ${alert.category === 'savings' ? 'bg-green-100 text-green-600' : ''}
                            ${!alert.category && alert.type === 'budget' ? 'bg-blue-100 text-blue-600' : ''}
                            ${!alert.category && alert.type === 'bill' ? 'bg-yellow-100 text-yellow-600' : ''}
                            ${!alert.category && alert.type === 'goal' ? 'bg-green-100 text-green-600' : ''}
                          `}>
                            {getAlertIcon(alert.type, alert.category)}
                          </div>
                          {getStatusBadge(alert.status)}
                        </div>
                        <CardTitle className="text-base mt-2">{alert.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-sm text-muted-foreground mb-3">
                          {alert.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-muted-foreground">
                          {alert.amount && (
                            <span className="flex items-center gap-1">
                              <PiggyBank className="w-4 h-4" />
                              {formatToINR(alert.amount)}
                            </span>
                          )}
                          {alert.threshold && (
                            <span className="flex items-center gap-1">
                              <Target className="w-4 h-4" />
                              {alert.threshold}% threshold
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          {getLastUpdatedText(alert.lastUpdated)}
                          <div className="flex space-x-1">
                            {alert.status !== 'completed' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleUpdateAlertStatus(alert.id, 'completed')}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setEditingAlert(alert);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDeleteAlert(alert.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Edit Alert Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Alert</DialogTitle>
            <DialogDescription>Make changes to your alert</DialogDescription>
          </DialogHeader>
          {editingAlert && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editingAlert.title}
                  onChange={(e) => setEditingAlert({...editingAlert, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={editingAlert.description}
                  onChange={(e) => setEditingAlert({...editingAlert, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-amount">Amount</Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    value={editingAlert.amount || ''}
                    onChange={(e) => setEditingAlert({
                      ...editingAlert, 
                      amount: e.target.value ? parseFloat(e.target.value) : undefined
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-due-date">Due Date</Label>
                  <Input
                    id="edit-due-date"
                    type="date"
                    value={editingAlert.dueDate || ''}
                    onChange={(e) => setEditingAlert({
                      ...editingAlert, 
                      dueDate: e.target.value || undefined
                    })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editingAlert.status}
                  onValueChange={(value: 'active' | 'completed' | 'overdue') => 
                    setEditingAlert({...editingAlert, status: value})
                  }
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditAlert}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Budget Rules Dialog */}
      <Dialog open={showBudgetRulesDialog} onOpenChange={setShowBudgetRulesDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Budget Alert Rules</DialogTitle>
            <DialogDescription>Manage automatic budget alert rules</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h3 className="font-medium">Current Rules</h3>
              <div className="space-y-2">
                {budgetRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className={`
                          p-1 rounded-full 
                          ${rule.category === 'needs' ? 'bg-blue-100 text-blue-600' : ''}
                          ${rule.category === 'wants' ? 'bg-purple-100 text-purple-600' : ''}
                          ${rule.category === 'savings' ? 'bg-green-100 text-green-600' : ''}
                        `}>
                          {rule.category === 'needs' && <Home className="w-3 h-3" />}
                          {rule.category === 'wants' && <ShoppingBag className="w-3 h-3" />}
                          {rule.category === 'savings' && <PiggyBank className="w-3 h-3" />}
                        </div>
                        <span className="font-medium">{rule.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {rule.category.charAt(0).toUpperCase() + rule.category.slice(1)} • {rule.threshold}% threshold
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={rule.enabled}
                        onCheckedChange={() => handleToggleBudgetRule(rule.id)}
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-destructive"
                        onClick={() => handleDeleteBudgetRule(rule.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium">Add New Rule</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rule-name">Rule Name</Label>
                  <Input
                    id="rule-name"
                    value={newBudgetRule.name}
                    onChange={(e) => setNewBudgetRule({...newBudgetRule, name: e.target.value})}
                    placeholder="e.g. High Wants Alert"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rule-category">Category</Label>
                  <Select
                    value={newBudgetRule.category}
                    onValueChange={(value: 'needs' | 'wants' | 'savings' | 'other') => 
                      setNewBudgetRule({...newBudgetRule, category: value})
                    }
                  >
                    <SelectTrigger id="rule-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="needs">Needs (50%)</SelectItem>
                      <SelectItem value="wants">Wants (30%)</SelectItem>
                      <SelectItem value="savings">Savings (20%)</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rule-threshold">Threshold Percentage</Label>
                <Input
                  id="rule-threshold"
                  type="number"
                  value={newBudgetRule.threshold}
                  onChange={(e) => setNewBudgetRule({...newBudgetRule, threshold: e.target.value})}
                  placeholder="e.g. 85"
                />
                <p className="text-xs text-muted-foreground">
                  Alert will trigger when spending reaches this percentage of the budget category
                </p>
              </div>
              <Button className="w-full" onClick={handleAddBudgetRule}>
                <Plus className="w-4 h-4 mr-2" />
                Add Budget Rule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AlertsPage;
