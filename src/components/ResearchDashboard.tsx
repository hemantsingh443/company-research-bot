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

interface AgentInfo {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  status: AgentStatus;
  progress: number;
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

  // Check if user is using their own API keys
  const isUsingUserKeys = {
    google: localStorage.getItem('user_google_key') !== null && localStorage.getItem('user_google_key') !== '',
    gemini: localStorage.getItem('user_gemini_key') !== null && localStorage.getItem('user_gemini_key') !== ''
  };

  // Check if environment variables are available
  const hasEnvVars = {
    google: !!import.meta.env.VITE_GOOGLE_API_KEY,
    gemini: !!import.meta.env.VITE_GEMINI_API_KEY
  };

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

  const startResearch = async (company: string) => {
    setCompanyName(company);
    setIsResearching(true);
    setResearchResults(null);
    setWebSources([]); // Reset web sources
    
    // Reset all agents
    setAgents(prevAgents =>
      prevAgents.map(agent => ({ ...agent, status: 'idle', progress: 0 }))
    );
    
    console.log(`Starting research for: ${company}`);
    
    try {
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
      
      // Actual research happens here
      console.log(`Calling runResearch for ${company}`);
      const result = await runResearch(company, addWebSource);
      console.log(`Research completed for ${company}`, result);
      
      // Clear all progress intervals after real research is done
      progressIntervals.forEach(interval => clearInterval(interval));
      
      // Update UI to reflect completion
      agentIds.forEach(agentId => {
        updateAgentStatus(agentId, 'complete', 100);
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
                  <div
                    key={index}
                    className={cn(
                      "p-4 rounded-lg border bg-card text-card-foreground shadow-sm",
                      "animate-fade-in animation-delay-100"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <Globe className="h-4 w-4 text-primary mt-1" />
                      <div>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium hover:underline truncate block"
                        >
                          {source.title}
                        </a>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {source.snippet}
                        </p>
                      </div>
                    </div>
                  </div>
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

        {/* API Key Status */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">API Key Status:</h3>
          <div className="space-y-1">
            <div className="flex items-center text-sm">
              <span className="font-medium">Google Search:</span>
              <span className={`ml-2 ${isUsingUserKeys.google ? 'text-green-600' : hasEnvVars.google ? 'text-blue-600' : 'text-yellow-600'}`}>
                {isUsingUserKeys.google 
                  ? 'Using your API key' 
                  : hasEnvVars.google 
                    ? 'Using environment variable' 
                    : 'Using default key (limited quota)'}
              </span>
            </div>
            <div className="flex items-center text-sm">
              <span className="font-medium">Gemini:</span>
              <span className={`ml-2 ${isUsingUserKeys.gemini ? 'text-green-600' : hasEnvVars.gemini ? 'text-blue-600' : 'text-yellow-600'}`}>
                {isUsingUserKeys.gemini 
                  ? 'Using your API key' 
                  : hasEnvVars.gemini 
                    ? 'Using environment variable' 
                    : 'Using default key (limited quota)'}
              </span>
            </div>
          </div>
        </div>

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
