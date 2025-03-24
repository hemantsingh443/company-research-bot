import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Search, Brain, Globe, ArrowRight, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SearchResult {
  title: string;
  url: string;
  domain: string;
}

interface ThinkingStep {
  type: 'thinking' | 'searching' | 'browsing' | 'complete';
  message: string;
  timestamp: number;
  searchQuery?: string;
  results?: SearchResult[];
}

interface ThinkingProcessProps {
  steps: ThinkingStep[];
  elapsedTime: number;
}

const ThinkingProcess: React.FC<ThinkingProcessProps> = ({ steps, elapsedTime }) => {
  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const [totalSearches, setTotalSearches] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  
  // Calculate total searches and update active result
  useEffect(() => {
    const searchSteps = steps.filter(step => step.type === 'searching');
    setTotalSearches(searchSteps.length);
    
    const allResults = steps
      .filter(step => step.results && step.results.length > 0)
      .flatMap(step => step.results || []);
      
    if (allResults.length > 0) {
      const interval = setInterval(() => {
        setActiveResultIndex(prev => (prev + 1) % allResults.length);
      }, 2000); // Change result every 2 seconds
      
      return () => clearInterval(interval);
    }
  }, [steps]);

  const formatTime = (ms: number) => {
    return `${Math.floor(ms / 1000)}s`;
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'thinking':
        return Brain;
      case 'searching':
        return Search;
      case 'browsing':
        return Globe;
      case 'complete':
        return Check;
      default:
        return Brain;
    }
  };

  // Get all unique results across all steps
  const getAllResults = () => {
    const allResults = steps
      .filter(step => step.results && step.results.length > 0)
      .flatMap(step => step.results || []);
    
    // Remove duplicates based on URL
    return Array.from(new Map(allResults.map(item => [item.url, item])).values());
  };

  const isComplete = steps.some(step => step.type === 'complete');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 bg-card rounded-lg border p-4">
        <h3 className="text-lg font-medium">DeepSearch</h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {totalSearches} web searches
          </span>
          <span className="text-sm text-muted-foreground">{formatTime(elapsedTime)}</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left column: Steps */}
        <div className="col-span-4 bg-card rounded-lg border p-4">
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {steps.map((step, index) => {
                const Icon = getStepIcon(step.type);
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-1">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{step.message}</p>
                      {step.searchQuery && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Search className="h-3 w-3" />
                          <span>"{step.searchQuery}"</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Right column: Live Search and Results */}
        <div className="col-span-8 space-y-4">
          {/* Live Search Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card rounded-lg border p-4"
          >
            <h4 className="text-sm font-medium mb-3">Live Search</h4>
            <div className="relative">
              <AnimatePresence mode="wait">
                {steps.map((step) => (
                  step.results && step.results[activeResultIndex] && (
                    <motion.div
                      key={activeResultIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      className="bg-background rounded-md p-4 shadow-sm border"
                    >
                      <div className="flex items-start gap-3">
                        <img 
                          src={`https://www.google.com/s2/favicons?domain=${step.results[activeResultIndex].domain}&sz=32`}
                          alt={step.results[activeResultIndex].domain}
                          className="w-5 h-5 mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <a
                            href={step.results[activeResultIndex].url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium hover:underline block truncate"
                          >
                            {step.results[activeResultIndex].title}
                          </a>
                          <span className="text-xs text-muted-foreground">
                            {step.results[activeResultIndex].domain}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-between items-center text-xs text-muted-foreground">
                        <span>Source {activeResultIndex + 1} of {step.results.length}</span>
                        <ArrowRight className="h-4 w-4 animate-pulse" />
                      </div>
                    </motion.div>
                  )
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Results Section */}
          {steps.filter(step => step.results && step.results.length > 0).length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card rounded-lg border p-4"
            >
              <h4 className="text-sm font-medium mb-3">All Sources</h4>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {steps
                  .filter(step => step.results && step.results.length > 0)
                  .flatMap(step => step.results || [])
                  .map((result, idx) => (
                    <motion.div
                      key={result.url + idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="flex items-start gap-3 p-3 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <img 
                        src={`https://www.google.com/s2/favicons?domain=${result.domain}&sz=32`}
                        alt={result.domain}
                        className="w-4 h-4 mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium hover:underline block truncate"
                        >
                          {result.title}
                        </a>
                        <span className="text-xs text-muted-foreground">
                          {result.domain}
                        </span>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Summary Section */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.5 }}
          className="mt-6 border-t pt-4"
        >
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-2 hover:bg-muted/50"
            onClick={() => setShowSummary(!showSummary)}
          >
            <span className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="font-medium">Research Sources Summary</span>
              <span className="text-sm text-muted-foreground">
                ({getAllResults().length} sources)
              </span>
            </span>
            {showSummary ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          <AnimatePresence>
            {showSummary && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4"
              >
                <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2">
                  {getAllResults().map((result, idx) => (
                    <motion.div
                      key={result.url}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="flex items-start gap-3 p-3 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <img 
                        src={`https://www.google.com/s2/favicons?domain=${result.domain}&sz=32`}
                        alt={result.domain}
                        className="w-5 h-5 mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <a
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium hover:underline truncate block flex-1"
                          >
                            {result.title}
                          </a>
                          <ExternalLink className="h-4 w-4 flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors" />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {result.domain}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ThinkingProcess; 