
import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingAnimationProps {
  className?: string;
  message?: string;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ 
  className,
  message = "Processing" 
}) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 animate-fade-in", 
      className
    )}>
      <div className="relative h-16 w-16 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-4 border-r-primary border-t-transparent border-b-transparent border-l-transparent animate-spin animation-delay-300"></div>
        <div className="absolute inset-4 rounded-full border-4 border-b-primary border-t-transparent border-r-transparent border-l-transparent animate-spin animation-delay-600"></div>
      </div>
      <div className="flex flex-col items-center">
        <p className="text-base text-foreground/90 font-medium">{message}</p>
        <div className="flex space-x-1 mt-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse-subtle"></div>
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse-subtle animation-delay-300"></div>
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse-subtle animation-delay-600"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
