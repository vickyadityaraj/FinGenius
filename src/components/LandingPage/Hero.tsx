
import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Initialize the animation on mount
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100');
            entry.target.classList.remove('opacity-0', 'translate-y-4');
          }
        });
      },
      { threshold: 0.1 }
    );
    
    const elements = heroRef.current?.querySelectorAll('.animate-on-scroll');
    elements?.forEach((el) => observer.observe(el));
    
    return () => {
      elements?.forEach((el) => observer.unobserve(el));
    };
  }, []);
  
  return (
    <section 
      ref={heroRef}
      className="relative overflow-hidden min-h-[90vh] flex items-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950"
    >
      {/* Background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary opacity-5 rounded-full translate-x-[-50%] translate-y-[-50%] animate-pulse-subtle"></div>
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-400 opacity-5 rounded-full translate-x-[30%] animate-float"></div>
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-primary opacity-5 rounded-full translate-y-[40%] animate-pulse-subtle animate-duration-1500"></div>
      </div>
      
      {/* Content */}
      <div className="container relative z-10 px-4 py-12 mx-auto text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="block">Smart Finance Management</span>
            <span className="block mt-2 text-primary">Reimagined</span>
          </h1>
          
          <p className="animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 delay-100 max-w-2xl mx-auto mt-6 text-xl text-gray-600 dark:text-gray-300">
            FinGenius uses AI to simplify your finances, automatically track expenses, and help you save more without effort.
          </p>
          
          <div className="animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 delay-200 mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="text-lg px-8 py-6 shadow-lg hover:shadow-xl button-hover bg-primary hover:bg-primary/90"
              onClick={() => navigate('/signup')}
            >
              Get Started
            </Button>
            <Button 
              size="lg"
              variant="outline" 
              className="text-lg px-8 py-6 hover-scale"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          </div>
          
          <div className="animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 delay-300 pt-10">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Join thousands of users who've already simplified their finances
            </p>
            <div className="flex justify-center mt-4 space-x-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
          <path 
            fill="currentColor" 
            fillOpacity="0.04"
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,208C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
