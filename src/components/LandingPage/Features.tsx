
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartBar, ArrowDownToLine, BellRing, Wallet, TrendingUp, BadgeDollarSign } from 'lucide-react';

const features = [
  {
    title: 'Real-Time Expense Tracking',
    description: 'Automatically categorize and track expenses in real-time with AI-powered classification.',
    icon: <Wallet className="h-12 w-12 text-primary" />
  },
  {
    title: 'Smart Savings Planner',
    description: 'AI automatically allocates savings based on your salary and spending habits.',
    icon: <BadgeDollarSign className="h-12 w-12 text-primary" />
  },
  {
    title: 'Real-Time Graph Generator',
    description: 'Insightful dashboards and graphs that update automatically as transactions occur.',
    icon: <ChartBar className="h-12 w-12 text-primary" />
  },
  {
    title: 'AI-Driven Spending Suggestions',
    description: 'Get smart suggestions to reduce unnecessary spending and improve financial health.',
    icon: <ArrowDownToLine className="h-12 w-12 text-primary" />
  },
  {
    title: 'Goal-Based Savings',
    description: 'Set your financial goals once and let our system suggest optimal monthly savings.',
    icon: <TrendingUp className="h-12 w-12 text-primary" />
  },
  {
    title: 'Bill & EMI Payment Alerts',
    description: 'Never miss a payment with intelligent reminders and due date tracking.',
    icon: <BellRing className="h-12 w-12 text-primary" />
  }
];

const FeatureCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}> = ({ title, description, icon, index }) => {
  return (
    <Card className="glass-card h-full transition-all duration-300 hover:shadow-xl hover:translate-y-[-8px]">
      <CardHeader>
        <div className="mb-4">{icon}</div>
        <CardTitle className="text-xl font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  );
};

const Features: React.FC = () => {
  return (
    <section id="features" className="section-container">
      <div className="text-center space-y-4 mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Features Designed to <span className="text-primary">Simplify</span> Your Finances
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          FinGenius leverages AI to help you manage your finances more effectively with minimal effort.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            title={feature.title}
            description={feature.description}
            icon={feature.icon}
            index={index}
          />
        ))}
      </div>
    </section>
  );
};

export default Features;
