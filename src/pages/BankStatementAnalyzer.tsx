import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Cell
} from 'recharts';
import {
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  CreditCard,
  Building,
  ShoppingBag
} from 'lucide-react';
import { format } from 'date-fns';

// Format number to Indian currency
const formatToINR = (number: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(number);
};

interface Transaction {
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  category: string;
}

interface AnalysisResult {
  totalCredits: number;
  totalDebits: number;
  balance: number;
  categories: { name: string; value: number; fill: string }[];
  merchantAnalysis: { name: string; frequency: number; total: number }[];
  recurringPayments: Transaction[];
  largeTransactions: Transaction[];
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B786F'];

const BankStatementAnalyzer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedBank, setSelectedBank] = useState('');
  const [error, setError] = useState<string | null>(null);

  const supportedBanks = [
    { id: 'hdfc', name: 'HDFC Bank' },
    { id: 'sbi', name: 'State Bank of India' },
    { id: 'icici', name: 'ICICI Bank' },
    { id: 'axis', name: 'Axis Bank' },
    { id: 'kotak', name: 'Kotak Mahindra Bank' }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf' || 
          selectedFile.type === 'text/csv' ||
          selectedFile.type === 'application/vnd.ms-excel' ||
          selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please upload a valid bank statement file (PDF, CSV, or Excel)');
      }
    }
  };

  const simulateAnalysis = () => {
    setUploading(true);
    setUploadProgress(0);

    // Simulate file upload progress
    const uploadInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    // After upload completion, simulate analysis
    setTimeout(() => {
      setUploading(false);
      setAnalyzing(true);

      // Simulate analysis completion after 2 seconds
      setTimeout(() => {
        setAnalyzing(false);
        // Generate mock analysis result
        setAnalysisResult({
          totalCredits: 125000,
          totalDebits: 85000,
          balance: 40000,
          categories: [
            { name: 'Shopping', value: 25000, fill: COLORS[0] },
            { name: 'Food & Dining', value: 15000, fill: COLORS[1] },
            { name: 'Bills & Utilities', value: 12000, fill: COLORS[2] },
            { name: 'Transportation', value: 8000, fill: COLORS[3] },
            { name: 'Entertainment', value: 7000, fill: COLORS[4] },
            { name: 'Healthcare', value: 5000, fill: COLORS[5] },
            { name: 'Others', value: 13000, fill: COLORS[6] }
          ],
          merchantAnalysis: [
            { name: 'Amazon', frequency: 5, total: 12500 },
            { name: 'Swiggy', frequency: 8, total: 4800 },
            { name: 'Uber', frequency: 12, total: 3600 },
            { name: 'Netflix', frequency: 1, total: 799 }
          ],
          recurringPayments: [
            {
              date: '2024-03-01',
              description: 'Netflix Subscription',
              amount: 799,
              type: 'debit',
              category: 'Entertainment'
            },
            {
              date: '2024-03-05',
              description: 'Gym Membership',
              amount: 1999,
              type: 'debit',
              category: 'Health & Fitness'
            }
          ],
          largeTransactions: [
            {
              date: '2024-03-15',
              description: 'Salary Credit',
              amount: 75000,
              type: 'credit',
              category: 'Income'
            },
            {
              date: '2024-03-10',
              description: 'House Rent',
              amount: 25000,
              type: 'debit',
              category: 'Housing'
            }
          ]
        });
      }, 2000);
    }, 3000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Bank Statement Analyzer</h1>
          <p className="text-muted-foreground">Upload your bank statement for detailed analysis</p>
        </div>
      </div>

      {/* Upload Section */}
      <Card className="glass-card animate-fade-in">
        <CardHeader>
          <CardTitle>Upload Statement</CardTitle>
          <CardDescription>
            Support for PDF, CSV, and Excel formats from major Indian banks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Select value={selectedBank} onValueChange={setSelectedBank}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your bank" />
                </SelectTrigger>
                <SelectContent>
                  {supportedBanks.map(bank => (
                    <SelectItem key={bank.id} value={bank.id}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="file"
                id="statement"
                className="hidden"
                accept=".pdf,.csv,.xls,.xlsx"
                onChange={handleFileUpload}
              />
              <Button
                className="w-full"
                onClick={() => document.getElementById('statement')?.click()}
                disabled={!selectedBank}
              >
                <Upload className="w-4 h-4 mr-2" />
                Select File
              </Button>
              {file && (
                <Button
                  className="w-full"
                  onClick={simulateAnalysis}
                  disabled={uploading || analyzing}
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Analyze
                </Button>
              )}
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {file && (
            <Alert>
              <FileSpreadsheet className="h-4 w-4" />
              <AlertTitle>Selected File</AlertTitle>
              <AlertDescription>{file.name}</AlertDescription>
            </Alert>
          )}

          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {analyzing && (
            <Alert>
              <TrendingUp className="h-4 w-4 animate-pulse" />
              <AlertTitle>Analyzing Statement</AlertTitle>
              <AlertDescription>Please wait while we process your statement...</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {analysisResult && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-card animate-fade-in">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <TrendingUp className="w-8 h-8 text-green-500" />
                  <div className="text-right">
                    <p className="text-2xl font-bold">{formatToINR(analysisResult.totalCredits)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card animate-fade-in">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <TrendingDown className="w-8 h-8 text-red-500" />
                  <div className="text-right">
                    <p className="text-2xl font-bold">{formatToINR(analysisResult.totalDebits)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card animate-fade-in">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <PiggyBank className="w-8 h-8 text-primary" />
                  <div className="text-right">
                    <p className="text-2xl font-bold">{formatToINR(analysisResult.balance)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Expense Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-card animate-fade-in">
              <CardHeader>
                <CardTitle>Expense Categories</CardTitle>
                <CardDescription>Breakdown of your spending</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analysisResult.categories}
                      cx="50%"
                      cy="50%"
                      outerRadius={150}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${formatToINR(value)}`}
                    >
                      {analysisResult.categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatToINR(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Merchant Analysis */}
            <Card className="glass-card animate-fade-in">
              <CardHeader>
                <CardTitle>Top Merchants</CardTitle>
                <CardDescription>Frequently used services</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Merchant</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead className="text-right">Total Spent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analysisResult.merchantAnalysis.map((merchant) => (
                      <TableRow key={merchant.name}>
                        <TableCell>{merchant.name}</TableCell>
                        <TableCell>{merchant.frequency} times</TableCell>
                        <TableCell className="text-right">{formatToINR(merchant.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Recurring Payments and Large Transactions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-card animate-fade-in">
              <CardHeader>
                <CardTitle>Recurring Payments</CardTitle>
                <CardDescription>Monthly subscriptions and regular payments</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analysisResult.recurringPayments.map((payment) => (
                      <TableRow key={payment.description}>
                        <TableCell>{payment.description}</TableCell>
                        <TableCell>{format(new Date(payment.date), 'dd MMM yyyy')}</TableCell>
                        <TableCell className="text-right">{formatToINR(payment.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="glass-card animate-fade-in">
              <CardHeader>
                <CardTitle>Large Transactions</CardTitle>
                <CardDescription>Significant financial activities</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analysisResult.largeTransactions.map((transaction) => (
                      <TableRow key={transaction.description}>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>{format(new Date(transaction.date), 'dd MMM yyyy')}</TableCell>
                        <TableCell className={`text-right ${
                          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}
                          {formatToINR(transaction.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default BankStatementAnalyzer; 