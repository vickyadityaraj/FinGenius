
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const CallToAction: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
      
      {/* Background shapes */}
      <div className="absolute right-0 top-0 w-1/3 h-1/3 bg-primary opacity-5 rounded-full translate-x-1/2 translate-y-[-30%]"></div>
      <div className="absolute left-0 bottom-0 w-1/4 h-1/4 bg-primary opacity-5 rounded-full translate-x-[-30%] translate-y-[30%]"></div>
      
      <div className="section-container relative z-10">
        <div className="max-w-3xl mx-auto text-center glass-panel rounded-2xl p-8 sm:p-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Transform Your Financial Life?
          </h2>
          <p className="text-lg mb-8 text-muted-foreground">
            Join thousands of users who are taking control of their finances with FinGenius.
            Start your journey to financial freedom today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="text-lg px-8 shadow-lg button-hover"
              onClick={() => navigate('/signup')}
            >
              Create Free Account
            </Button>
            <Button 
              size="lg"
              variant="outline" 
              className="text-lg px-8 hover-scale"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
