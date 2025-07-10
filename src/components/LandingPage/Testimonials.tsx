
import React, { useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Small Business Owner',
    content: 'FinGenius revolutionized how I track business expenses. The AI categories are spot-on, and I no longer stress about managing my finances.',
    avatar: '/assets/avatar-1.png'
  },
  {
    name: 'Michael Chen',
    role: 'Software Engineer',
    content: 'The smart saving suggestions helped me save an extra 15% every month without even noticing. Absolutely worth every penny!',
    avatar: '/assets/avatar-2.png'
  },
  {
    name: 'Emma Williams',
    role: 'Freelance Designer',
    content: 'As a freelancer with irregular income, FinGenius helps me budget effectively and never miss a bill payment. The goal tracking is fantastic!',
    avatar: '/assets/avatar-3.png'
  },
  {
    name: 'Rahul Patel',
    role: 'Marketing Manager',
    content: "I've tried many finance apps, but FinGenius is different. The AI actually understands my spending habits and gives relevant suggestions.",
    avatar: '/assets/avatar-4.png'
  }
];

const Testimonials: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = containerRef.current?.querySelectorAll('.testimonial-card');
            cards?.forEach((card, index) => {
              setTimeout(() => {
                card.classList.add('opacity-100');
                card.classList.remove('opacity-0', 'translate-y-8');
              }, index * 150);
            });
          }
        });
      },
      { threshold: 0.1 }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);
  
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="section-container" ref={containerRef}>
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            What Our Users <span className="text-primary">Say</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Thousands of users are simplifying their financial life with FinGenius.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="testimonial-card opacity-0 translate-y-8 transition-all duration-700 ease-out glass-card hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12 border-2 border-primary/25">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{testimonial.name}</h3>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <blockquote className="mt-4 text-muted-foreground italic">
                  "{testimonial.content}"
                </blockquote>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
