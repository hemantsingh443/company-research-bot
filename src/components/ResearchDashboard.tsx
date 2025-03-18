
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { 
  Building2, 
  Briefcase, 
  TrendingUp, 
  PieChart, 
  BarChart4, 
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import LoadingAnimation from './LoadingAnimation';
import CompanySearch from './CompanySearch';
import AgentCard, { AgentStatus } from './AgentCard';
import ResearchResults from './ResearchResults';
import { ResearchResult, runResearch } from '@/utils/researchAgents';

interface AgentInfo {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  status: AgentStatus;
  progress: number;
}

const ResearchDashboard: React.FC = () => {
  const { toast } = useToast();
  const [isResearching, setIsResearching] = useState(false);
  const [companyName, setCompanyName] = useState<string>('');
  const [researchResults, setResearchResults] = useState<ResearchResult | null>(null);
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

  const updateAgentStatus = (agentId: string, status: AgentStatus, progress: number = 0) => {
    setAgents(prevAgents =>
      prevAgents.map(agent =>
        agent.id === agentId ? { ...agent, status, progress } : agent
      )
    );
  };

  const startResearch = async (company: string) => {
    setCompanyName(company);
    setIsResearching(true);
    setResearchResults(null);
    
    // Reset all agents
    setAgents(prevAgents =>
      prevAgents.map(agent => ({ ...agent, status: 'idle', progress: 0 }))
    );
    
    // Start a progressive research process
    try {
      // Company overview agent
      updateAgentStatus('company', 'working');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate progress updates
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 5;
        if (progress <= 95) {
          updateAgentStatus('company', 'working', progress);
        } else {
          clearInterval(progressInterval);
        }
      }, 300);
      
      // Start financial agent after a delay
      setTimeout(() => {
        updateAgentStatus('financial', 'working');
      }, 2000);
      
      // Start market agent after a delay
      setTimeout(() => {
        updateAgentStatus('market', 'working');
      }, 3500);
      
      // Start competitors agent after a delay
      setTimeout(() => {
        updateAgentStatus('competitors', 'working');
      }, 5000);
      
      // Start investment agent after a delay
      setTimeout(() => {
        updateAgentStatus('investment', 'working');
      }, 6500);
      
      // Complete the agents in sequence
      setTimeout(() => updateAgentStatus('company', 'complete', 100), 8000);
      setTimeout(() => updateAgentStatus('financial', 'complete', 100), 10000);
      setTimeout(() => updateAgentStatus('market', 'complete', 100), 12000);
      setTimeout(() => updateAgentStatus('competitors', 'complete', 100), 14000);
      
      // Run the actual research
      const result = await runResearch(company);
      
      setTimeout(() => {
        updateAgentStatus('investment', 'complete', 100);
        setResearchResults(result);
        setIsResearching(false);
        
        toast({
          title: "Research Complete",
          description: `Analysis for ${company} is ready to view.`,
          duration: 5000,
        });
      }, 16000);
      
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
        description: "Unable to complete the research. Please try again.",
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
      </div>
    </div>
  );
};

export default ResearchDashboard;
