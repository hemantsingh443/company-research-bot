
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AgentStatus = 'idle' | 'working' | 'complete' | 'error';

interface AgentCardProps {
  name: string;
  description: string;
  icon: LucideIcon;
  status: AgentStatus;
  progress?: number;
  className?: string;
}

const AgentCard: React.FC<AgentCardProps> = ({
  name,
  description,
  icon: Icon,
  status,
  progress = 0,
  className,
}) => {
  const statusColors = {
    idle: 'text-muted-foreground',
    working: 'text-primary',
    complete: 'text-green-500',
    error: 'text-destructive',
  };

  const statusMessages = {
    idle: 'Ready',
    working: 'Researching...',
    complete: 'Complete',
    error: 'Error',
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 group h-full",
      status === 'working' && "border-primary/50",
      status === 'complete' && "border-green-500/50",
      status === 'error' && "border-destructive/50",
      className
    )}>
      <CardHeader className="p-4 pb-0">
        <div className="flex items-center justify-between">
          <div className="rounded-full p-2 bg-secondary/80 group-hover:bg-secondary transition-colors">
            <Icon className="h-5 w-5" />
          </div>
          <span className={cn(
            "text-xs font-medium rounded-full px-2 py-1",
            status === 'idle' && "bg-muted text-muted-foreground",
            status === 'working' && "bg-primary/10 text-primary animate-pulse-subtle",
            status === 'complete' && "bg-green-500/10 text-green-500",
            status === 'error' && "bg-destructive/10 text-destructive",
          )}>
            {statusMessages[status]}
          </span>
        </div>
        <CardTitle className="text-base mt-3 font-medium">{name}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="text-sm text-muted-foreground">{description}</p>
        
        {status === 'working' && (
          <div className="w-full h-1 bg-muted rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-primary animate-pulse-subtle transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AgentCard;
