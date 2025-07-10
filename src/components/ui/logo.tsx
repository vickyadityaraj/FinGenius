import React from 'react';
import { IndianRupee } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Logo({ className, ...props }: LogoProps) {
  return (
    <div className={cn("flex items-center justify-center", className)} {...props}>
      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
        <IndianRupee className="h-3 w-3 text-primary-foreground" />
      </div>
    </div>
  );
} 