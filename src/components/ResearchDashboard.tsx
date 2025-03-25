import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { 
  Building2, 
  Briefcase, 
  TrendingUp, 
  PieChart, 
  BarChart4, 
  Loader2,
  Globe,
  type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import LoadingAnimation from './LoadingAnimation';
import CompanySearch from './CompanySearch';
import AgentCard, { AgentStatus } from './AgentCard';
import ResearchResults from './ResearchResults';
import { ResearchResult, runResearch, WebSource } from '@/utils/researchAgents';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import WebSourceCard from './WebSourceCard';
import ThinkingProcess from './ThinkingProcess';

interface AgentInfo {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  status: AgentStatus;
  progress: number;
}

interface ThinkingStep {
  type: 'thinking' | 'searching' | 'browsing' | 'complete';
  message: string;
  timestamp: number;
  searchQuery?: string;
  results?: {
    title: string;
    url: string;
    domain: string;
  }[];
}

const ResearchDashboard = (): JSX.Element => {
  const { toast } = useToast();
  const [isResearching, setIsResearching] = useState(false);
  const [companyName, setCompanyName] = useState<string>('');
  const [researchResults, setResearchResults] = useState<ResearchResult | null>(null);
  const [webSources, setWebSources] = useState<WebSource[]>([]);
  const [agents, setAgents] = useState<AgentInfo[]>([
    {
      id: 'company',
      name: 'Company Overview Agent',
      description: 'Gathers general information, history, leadership, and operations.',
      icon: Building2,
      status: 'idle',
      progress: 0,
    },
    {
      id: 'financial',
      name: 'Financial Analysis Agent',
      description: 'Analyzes financial statements, metrics, and performance.',
      icon: PieChart,
      status: 'idle',
      progress: 0,
    },
    {
      id: 'market',
      name: 'Market Research Agent',
      description: 'Examines market position, trends, and industry dynamics.',
      icon: BarChart4,
      status: 'idle',
      progress: 0,
    },
    {
      id: 'competitors',
      name: 'Competitive Intelligence Agent',
      description: 'Identifies key competitors and comparative advantages.',
      icon: Briefcase,
      status: 'idle',
      progress: 0,
    },
    {
      id: 'investment',
      name: 'ROI Analysis Agent',
      description: 'Evaluates investment potential, risks, and opportunities.',
      icon: TrendingUp,
      status: 'idle',
      progress: 0,
    },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
  const [startTime, setStartTime] = useState<number>(0);

  const updateAgentStatus = (agentId: string, status: AgentStatus, progress: number = 0) => {
    setAgents(prevAgents =>
      prevAgents.map(agent =>
        agent.id === agentId ? { ...agent, status, progress } : agent
      )
    );
  };

  const addWebSource = (source: WebSource) => {
    setWebSources(prev => [...prev, source]);
  };

  const addThinkingStep = (step: ThinkingStep) => {
    setThinkingSteps(prev => [...prev, step]);
  };

  const startResearch = async (company: string) => {
    setCompanyName(company);
    setIsResearching(true);
    setResearchResults(null);
    setWebSources([]);
    setThinkingSteps([]);
    setStartTime(Date.now());
    
    // Initial thinking step
    addThinkingStep({
      type: 'thinking',
      message: 'Starting comprehensive research...',
      timestamp: Date.now()
    });
    
    try {
      // Add search step
      addThinkingStep({
        type: 'searching',
        message: 'Gathering initial company information',
        timestamp: Date.now(),
        searchQuery: `${company} company information`,
        results: []
      });
      
      // Start visual progress indicators
      updateAgentStatus('company', 'working');
      
      // Setup progress intervals to show activity while real work happens
      let progressIntervals: NodeJS.Timeout[] = [];
      
      const agentIds = ['company', 'financial', 'market', 'competitors', 'investment'];
      const startDelays = [0, 2000, 3500, 5000, 6500];
      
      // Start progress animations for each agent
      agentIds.forEach((agentId, index) => {
        setTimeout(() => {
          updateAgentStatus(agentId, 'working');
          
          let progress = 0;
          const interval = setInterval(() => {
            progress += 5;
            if (progress <= 95) {
              updateAgentStatus(agentId, 'working', progress);
            } else {
              clearInterval(interval);
            }
          }, 300);
          
          progressIntervals.push(interval);
        }, startDelays[index]);
      });
      
      // Add browsing step when sources are found
      addThinkingStep({
        type: 'browsing',
        message: 'Analyzing reliable sources',
        timestamp: Date.now()
      });
      
      // Actual research happens here
      console.log(`Calling runResearch for ${company}`);
      const result = await runResearch(company, (source) => {
        addWebSource(source);
        // Update the latest browsing step with new results
        setThinkingSteps(prev => {
          const lastBrowsingStep = prev.findIndex(step => step.type === 'browsing');
          if (lastBrowsingStep === -1) return prev;
          
          const updatedStep = {
            ...prev[lastBrowsingStep],
            results: [
              ...(prev[lastBrowsingStep].results || []),
              {
                title: source.title,
                url: source.url,
                domain: new URL(source.url).hostname.replace('www.', '')
              }
            ]
          };
          
          return [
            ...prev.slice(0, lastBrowsingStep),
            updatedStep,
            ...prev.slice(lastBrowsingStep + 1)
          ];
        });
      });
      
      // Clear all progress intervals after real research is done
      progressIntervals.forEach(interval => clearInterval(interval));
      
      // Update UI to reflect completion
      agentIds.forEach(agentId => {
        updateAgentStatus(agentId, 'complete', 100);
      });
      
      // Add completion step
      addThinkingStep({
        type: 'complete',
        message: 'Research complete! Preparing final report...',
        timestamp: Date.now()
      });
      
      setResearchResults(result);
      setIsResearching(false);
      
      toast({
        title: "Research Complete",
        description: `Analysis for ${company} is ready to view.`,
        duration: 5000,
      });
      
    } catch (error) {
      console.error("Research error:", error);
      
      // Mark all working agents as error
      setAgents(prevAgents =>
        prevAgents.map(agent => 
          agent.status === 'working' 
            ? { ...agent, status: 'error' } 
            : agent
        )
      );
      
      setIsResearching(false);
      
      toast({
        title: "Research Failed",
        description: error instanceof Error ? error.message : "Unable to complete the research. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return (
    <div className="container max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-center">
        <div 
          className={cn(
            "transition-all duration-500 ease-in-out w-full flex flex-col items-center",
            researchResults ? "mb-12" : "mb-4" 
          )}
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Company Research Intelligence
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive AI-powered company analysis for informed business and investment decisions
            </p>
          </div>
          
          <CompanySearch 
            onSearch={startResearch} 
            isLoading={isResearching}
            className={cn(
              "transition-all duration-500",
              researchResults ? "transform -translate-y-4 scale-90 opacity-90" : ""
            )}
          />
        </div>
        
        {isResearching && (
          <div className="w-full mt-8 mb-4">
            <ThinkingProcess 
              steps={thinkingSteps} 
              elapsedTime={Date.now() - startTime}
            />
            
            <h2 className="text-xl font-medium text-foreground/90 mb-4">Research Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {agents.map((agent, index) => (
                <AgentCard
                  key={agent.id}
                  name={agent.name}
                  description={agent.description}
                  icon={agent.icon}
                  status={agent.status}
                  progress={agent.progress}
                  className={`animate-fade-in animation-delay-${index * 150}`}
                />
              ))}
            </div>

            {/* Web Sources Visualization */}
            <div className="mt-8">
              <h2 className="text-xl font-medium text-foreground/90 mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Sources Being Analyzed
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {webSources.map((source, index) => (
                  <WebSourceCard
                    key={source.url + index}
                    source={source}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        
        {isResearching && !researchResults && (
          <div className="min-h-[400px] w-full flex items-center justify-center">
            <LoadingAnimation message="Analyzing data from multiple sources" />
          </div>
        )}
        
        {researchResults && (
          <ResearchResults results={researchResults} />
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              {error}
              {error.includes('quota limit') && (
                <div className="mt-2">
                  <p>To use your own API quota:</p>
                  <ol className="list-decimal list-inside">
                    <li>Click the settings icon in the top-right corner</li>
                    <li>Enter your Google Search API key</li>
                    <li>Save the settings</li>
                  </ol>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default ResearchDashboard;
