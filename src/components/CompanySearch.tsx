
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompanySearchProps {
  onSearch: (companyName: string) => void;
  isLoading: boolean;
  className?: string;
}

const CompanySearch: React.FC<CompanySearchProps> = ({ 
  onSearch, 
  isLoading,
  className 
}) => {
  const [companyName, setCompanyName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (companyName.trim() && !isLoading) {
      onSearch(companyName.trim());
    }
  };

  return (
    <div className={cn(
      "w-full max-w-2xl transition-all duration-300 ease-in-out animate-fade-in", 
      className
    )}>
      <div className="glass-card rounded-2xl p-1 transition-all shadow-xl">
        <form onSubmit={handleSubmit} className="relative flex items-stretch w-full">
          <div className="relative flex-grow">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              <Search size={20} />
            </div>
            <Input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter company name (e.g., Apple, Tesla, Amazon)"
              className="pl-12 pr-4 py-6 w-full rounded-l-xl border-0 bg-transparent text-lg focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70"
              disabled={isLoading}
            />
          </div>
          <Button 
            type="submit" 
            className="rounded-r-xl px-6 py-6 h-auto bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-300 hover:shadow-lg disabled:opacity-70 disabled:pointer-events-none"
            disabled={isLoading || !companyName.trim()}
          >
            <Sparkles size={18} className="mr-2" />
            Research
          </Button>
        </form>
      </div>
      <p className="text-xs text-center mt-2 text-muted-foreground animate-fade-in">
        Powered by advanced AI agents for comprehensive company insights
      </p>
    </div>
  );
};

export default CompanySearch;
