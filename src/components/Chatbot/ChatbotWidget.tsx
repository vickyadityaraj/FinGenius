import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, X, Send, ChevronDown, ChevronUp, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

type Suggestion = {
  id: string;
  text: string;
};

export const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage = {
      id: 'welcome',
      text: "Hi there! 👋 I'm your SmartBudget Assistant. How can I help you today?",
      sender: 'bot' as const,
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
    
    setSuggestions([
      { id: '1', text: 'Tell me about Dashboard' },
      { id: '2', text: 'How do I track expenses?' },
      { id: '3', text: 'What are financial reports?' },
      { id: '4', text: 'How to set savings goals?' }
    ]);
  }, []);

  // Scroll to bottom of messages when new message is added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    
    // Generate bot response after a short delay
    setTimeout(() => {
      const botResponse = getBotResponse(message);
      setMessages(prev => [...prev, botResponse]);
      
      // Update suggestions based on context
      setSuggestions(getContextualSuggestions(botResponse.text));
    }, 600);
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: suggestion,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Generate bot response
    setTimeout(() => {
      const botResponse = getBotResponse(suggestion);
      setMessages(prev => [...prev, botResponse]);
      
      // Update suggestions
      setSuggestions(getContextualSuggestions(botResponse.text));
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const getBotResponse = (query: string): Message => {
    const lowerQuery = query.toLowerCase();
    let response = "I'm not sure how to help with that. Could you try asking something about the dashboard, expenses, reports, savings, goals, alerts, or settings?";
    
    // Dashboard related
    if (lowerQuery.includes('dashboard') || lowerQuery.includes('home')) {
      response = "The Dashboard provides an overview of your financial health. It displays your income, expenses, savings rate, and recent transactions all in one place. You can access it by clicking on the Dashboard icon in the sidebar.";
      
      // Navigate to dashboard if requested
      if (lowerQuery.includes('go to') || lowerQuery.includes('take me')) {
        navigate('/dashboard');
        response += " I've opened the Dashboard for you!";
      }
    }
    
    // Expenses related
    else if (lowerQuery.includes('expense') || lowerQuery.includes('spending')) {
      response = "The Expenses page helps you track all your spending. You can add new expenses, categorize them, and view spending trends over time. The budgeting feature helps you set limits for different categories.";
      
      if (lowerQuery.includes('go to') || lowerQuery.includes('take me')) {
        navigate('/dashboard/expenses');
        response += " I've opened the Expenses page for you!";
      }
    }
    
    // Reports related
    else if (lowerQuery.includes('report') || lowerQuery.includes('analytics')) {
      response = "The Reports page provides detailed financial analytics. You can view spending patterns, income trends, and savings growth over custom time periods. The insights section offers personalized financial advice based on your data.";
      
      if (lowerQuery.includes('go to') || lowerQuery.includes('take me')) {
        navigate('/dashboard/reports');
        response += " I've opened the Reports page for you!";
      }
    }
    
    // Savings related
    else if (lowerQuery.includes('saving')) {
      response = "The Savings page helps you track your savings progress. You can record deposits, set savings targets, and monitor your growth over time. The system automatically calculates your savings rate as a percentage of income.";
      
      if (lowerQuery.includes('go to') || lowerQuery.includes('take me')) {
        navigate('/dashboard/savings');
        response += " I've opened the Savings page for you!";
      }
    }
    
    // Goals related
    else if (lowerQuery.includes('goal')) {
      response = "The Goals page helps you set and track financial objectives. You can create short-term and long-term goals, monitor progress, and receive achievement notifications. Examples include saving for a vacation, buying a home, or building an emergency fund.";
      
      if (lowerQuery.includes('go to') || lowerQuery.includes('take me')) {
        navigate('/dashboard/goals');
        response += " I've opened the Goals page for you!";
      }
    }
    
    // Alerts related
    else if (lowerQuery.includes('alert') || lowerQuery.includes('notification')) {
      response = "The Alerts page manages your financial notifications. You can set up alerts for unusual spending, bill reminders, or when you exceed budget limits. Customize notification frequency and delivery methods from here.";
      
      if (lowerQuery.includes('go to') || lowerQuery.includes('take me')) {
        navigate('/dashboard/alerts');
        response += " I've opened the Alerts page for you!";
      }
    }
    
    // Settings related
    else if (lowerQuery.includes('setting') || lowerQuery.includes('profile') || lowerQuery.includes('account')) {
      response = "The Settings page lets you customize your account preferences. You can update your personal information, connect bank accounts, change the theme, and manage notification settings.";
      
      if (lowerQuery.includes('go to') || lowerQuery.includes('take me')) {
        navigate('/dashboard/settings');
        response += " I've opened the Settings page for you!";
      }
    }
    
    // Budget rule related
    else if (lowerQuery.includes('budget rule') || lowerQuery.includes('50/30/20')) {
      response = "The 50/30/20 budget rule is a simple guideline for managing your money: 50% for needs (housing, food, utilities), 30% for wants (entertainment, dining out), and 20% for savings and debt repayment. Our Reports page helps you track how well you're following this rule.";
    }
    
    // Help related
    else if (lowerQuery.includes('help') || lowerQuery.includes('guide') || lowerQuery.includes('how to')) {
      response = "I can help you navigate the SmartBudget app and explain its features. Try asking about specific pages like Dashboard, Expenses, Reports, Savings, Goals, Alerts, or Settings. You can also ask me to take you to any of these pages.";
    }

    return {
      id: Date.now().toString(),
      text: response,
      sender: 'bot',
      timestamp: new Date()
    };
  };

  const getContextualSuggestions = (lastResponse: string): Suggestion[] => {
    if (lastResponse.includes('Dashboard')) {
      return [
        { id: '1', text: 'Go to Dashboard' },
        { id: '2', text: 'Tell me about Expenses' },
        { id: '3', text: 'What are Reports?' }
      ];
    } else if (lastResponse.includes('Expenses')) {
      return [
        { id: '1', text: 'Go to Expenses' },
        { id: '2', text: 'How to add an expense?' },
        { id: '3', text: 'What is the 50/30/20 rule?' }
      ];
    } else if (lastResponse.includes('Reports')) {
      return [
        { id: '1', text: 'Go to Reports' },
        { id: '2', text: 'Explain financial insights' },
        { id: '3', text: 'How to read the charts?' }
      ];
    } else if (lastResponse.includes('Savings')) {
      return [
        { id: '1', text: 'Go to Savings' },
        { id: '2', text: 'How to set savings targets?' },
        { id: '3', text: 'What is a good savings rate?' }
      ];
    } else if (lastResponse.includes('Goals')) {
      return [
        { id: '1', text: 'Go to Goals' },
        { id: '2', text: 'How to create a new goal?' },
        { id: '3', text: 'Tell me about savings goals' }
      ];
    } else if (lastResponse.includes('Alerts')) {
      return [
        { id: '1', text: 'Go to Alerts' },
        { id: '2', text: 'How to set up bill reminders?' },
        { id: '3', text: 'What alerts are available?' }
      ];
    } else if (lastResponse.includes('Settings')) {
      return [
        { id: '1', text: 'Go to Settings' },
        { id: '2', text: 'How to change the theme?' },
        { id: '3', text: 'Tell me about bank connections' }
      ];
    } else {
      return [
        { id: '1', text: 'Tell me about Dashboard' },
        { id: '2', text: 'How do I track expenses?' },
        { id: '3', text: 'What are financial reports?' },
        { id: '4', text: 'Help me get started' }
      ];
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative mb-2"
          >
            <Card className="w-80 sm:w-96 shadow-lg border-primary/10 overflow-hidden">
              <div className="bg-primary text-primary-foreground p-3 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Bot size={20} />
                  <h3 className="font-medium">SmartBudget Assistant</h3>
                </div>
                <div className="flex items-center space-x-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20"
                    onClick={() => setIsMinimized(!isMinimized)}
                  >
                    {isMinimized ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20"
                    onClick={() => setIsOpen(false)}
                  >
                    <X size={16} />
                  </Button>
                </div>
              </div>
              
              <AnimatePresence>
                {!isMinimized && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CardContent className="p-0">
                      <ScrollArea className="h-80 p-4" ref={scrollAreaRef}>
                        <div className="space-y-4">
                          {messages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex ${
                                msg.sender === 'user' ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              <div
                                className={`max-w-[80%] rounded-lg p-3 ${
                                  msg.sender === 'user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                              >
                                {msg.sender === 'bot' && (
                                  <div className="flex items-start space-x-2 mb-1">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src="/bot-avatar.png" />
                                      <AvatarFallback className="bg-primary/20 text-primary text-xs">
                                        BOT
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium text-xs">Assistant</span>
                                  </div>
                                )}
                                <p className="text-sm">{msg.text}</p>
                                <p className="text-xs opacity-70 mt-1 text-right">
                                  {msg.timestamp.toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      
                      {/* Suggestions */}
                      <div className="p-3 border-t">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {suggestions.map((suggestion) => (
                            <Button
                              key={suggestion.id}
                              variant="outline"
                              size="sm"
                              className="text-xs py-1 h-auto"
                              onClick={() => handleSuggestionClick(suggestion.text)}
                            >
                              {suggestion.text}
                            </Button>
                          ))}
                        </div>
                        
                        {/* Input area */}
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Type your message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1"
                          />
                          <Button 
                            size="icon" 
                            onClick={handleSend}
                            disabled={!message.trim()}
                          >
                            <Send size={16} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat button */}
      <Button 
        size="icon" 
        className="h-12 w-12 rounded-full shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
      </Button>
    </div>
  );
}; 