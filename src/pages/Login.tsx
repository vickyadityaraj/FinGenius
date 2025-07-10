
import React from 'react';
import AuthForm from '@/components/ui/AuthForm';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 relative">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary opacity-5 rounded-full translate-x-[-50%] translate-y-[-50%]"></div>
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-400 opacity-5 rounded-full translate-x-[30%]"></div>
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-primary opacity-5 rounded-full translate-y-[40%]"></div>
      </div>
      
      <Link to="/" className="absolute top-8 left-8 flex items-center text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Link>
      
      <div className="text-center mb-8 relative z-10">
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 rounded-full bg-primary"></div>
          <span className="text-3xl font-bold ml-3">FinGenius</span>
        </div>
      </div>
      
      <AuthForm mode="login" />
    </div>
  );
};

export default Login;
