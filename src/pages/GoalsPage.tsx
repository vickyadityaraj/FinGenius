import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trophy, Target, Trash2, CheckCircle2, IndianRupee } from 'lucide-react';
import { format, addMonths } from 'date-fns';
import { formatToINR } from '@/lib/utils';

interface Milestone {
  id: string;
  description: string;
  targetAmount: number;
  completed: boolean;
}

interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  deadline: string;
  milestones: Milestone[];
}

const GOAL_CATEGORIES = [
  'Emergency Fund',
  'Retirement',
  'Home Purchase',
  'Debt Payoff',
  'Vacation',
  'Education',
  'Investment',
  'Other'
];

const GoalsPage = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [category, setCategory] = useState(GOAL_CATEGORIES[0]);
  const [monthsToDeadline, setMonthsToDeadline] = useState('12');
  const [newMilestone, setNewMilestone] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [milestoneAmount, setMilestoneAmount] = useState('');

  const handleAddGoal = () => {
    if (!title || !targetAmount || !category) return;

    const newGoal: Goal = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      targetAmount: parseFloat(targetAmount),
      currentAmount: 0,
      category,
      deadline: format(addMonths(new Date(), parseInt(monthsToDeadline)), 'yyyy-MM-dd'),
      milestones: []
    };

    setGoals([...goals, newGoal]);
    setTitle('');
    setTargetAmount('');
    setMonthsToDeadline('12');
  };

  const handleAddMilestone = (goalId: string) => {
    if (!newMilestone || !milestoneAmount) return;

    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          milestones: [
            ...goal.milestones,
            {
              id: Math.random().toString(36).substr(2, 9),
              description: newMilestone,
              targetAmount: parseFloat(milestoneAmount),
              completed: false
            }
          ]
        };
      }
      return goal;
    });

    setGoals(updatedGoals);
    setNewMilestone('');
    setMilestoneAmount('');
  };

  const handleUpdateProgress = (goalId: string, amount: number) => {
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        const newAmount = Math.min(goal.currentAmount + amount, goal.targetAmount);
        return {
          ...goal,
          currentAmount: newAmount,
          milestones: goal.milestones.map(milestone => ({
            ...milestone,
            completed: milestone.targetAmount <= newAmount
          }))
        };
      }
      return goal;
    }));
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(goals.filter(goal => goal.id !== goalId));
    if (selectedGoal?.id === goalId) {
      setSelectedGoal(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold mb-6">Financial Goals</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add Goal Card */}
        <Card className="glass-card animate-fade-in">
          <CardHeader>
            <CardTitle>Create New Goal</CardTitle>
            <CardDescription>Set your financial targets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Goal Title</Label>
              <Input
                id="title"
                placeholder="Enter goal title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetAmount">Target Amount</Label>
              <Input
                id="targetAmount"
                type="number"
                placeholder="Enter target amount"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {GOAL_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Months to Deadline</Label>
              <Input
                id="deadline"
                type="number"
                placeholder="Number of months"
                value={monthsToDeadline}
                onChange={(e) => setMonthsToDeadline(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleAddGoal}>
              <Plus className="w-4 h-4 mr-2" />
              Create Goal
            </Button>
          </CardContent>
        </Card>

        {/* Goal Details Card */}
        {selectedGoal && (
          <Card className="glass-card animate-fade-in">
            <CardHeader>
              <CardTitle>Goal Details</CardTitle>
              <CardDescription>{selectedGoal.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {formatToINR(selectedGoal.currentAmount)} / {formatToINR(selectedGoal.targetAmount)}
                  </span>
                </div>
                <Progress
                  value={(selectedGoal.currentAmount / selectedGoal.targetAmount) * 100}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Add Progress</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Amount"
                    className="flex-1"
                    onChange={(e) => setMilestoneAmount(e.target.value)}
                  />
                  <Button onClick={() => handleUpdateProgress(selectedGoal.id, parseFloat(milestoneAmount))}>
                    Add
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Add Milestone</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Milestone description"
                    value={newMilestone}
                    onChange={(e) => setNewMilestone(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Target amount"
                    value={milestoneAmount}
                    onChange={(e) => setMilestoneAmount(e.target.value)}
                    className="w-32"
                  />
                  <Button onClick={() => handleAddMilestone(selectedGoal.id)}>
                    Add
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Milestones</Label>
                <div className="space-y-2">
                  {selectedGoal.milestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className={`p-2 rounded-lg border flex items-center justify-between ${
                        milestone.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          className={`w-4 h-4 ${
                            milestone.completed ? 'text-green-500' : 'text-gray-400'
                          }`}
                        />
                        <span>{milestone.description}</span>
                      </div>
                      <span>{formatToINR(milestone.targetAmount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Goals List Card */}
      <Card className="glass-card animate-fade-in">
        <CardHeader>
          <CardTitle>Your Goals</CardTitle>
          <CardDescription>Track your financial goals progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {goals.length === 0 ? (
              <p className="text-muted-foreground text-center">No goals set yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map((goal) => (
                  <Card
                    key={goal.id}
                    className={`glass-card animate-fade-in cursor-pointer transition-all hover:shadow-lg ${
                      selectedGoal?.id === goal.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedGoal(goal)}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{goal.title}</CardTitle>
                          <CardDescription>{goal.category}</CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteGoal(goal.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Target:</span>
                            <span className="font-medium">{formatToINR(goal.targetAmount)}</span>
                          </div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Current:</span>
                            <span className="font-medium">{formatToINR(goal.currentAmount)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Deadline:</span>
                            <span className="font-medium">{format(new Date(goal.deadline), 'MMM dd, yyyy')}</span>
                          </div>
                        </div>
                        <Progress
                          value={(goal.currentAmount / goal.targetAmount) * 100}
                          className="h-2"
                        />
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">
                            {((goal.currentAmount / goal.targetAmount) * 100).toFixed(1)}% Complete
                          </span>
                          <span className="text-muted-foreground">
                            {formatToINR(goal.targetAmount - goal.currentAmount)} remaining
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoalsPage;
