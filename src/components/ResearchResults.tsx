
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  ChevronDown, 
  ChevronUp, 
  TrendingUp, 
  Building, 
  Users, 
  PieChart,
  BarChart4, 
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ResearchResult } from '@/utils/researchAgents';

interface ResearchResultsProps {
  results: ResearchResult | null;
  className?: string;
}

const ResearchResults: React.FC<ResearchResultsProps> = ({ 
  results, 
  className 
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  if (!results) return null;

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderSectionContent = (content: string) => {
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }} />
      </div>
    );
  };

  const downloadResults = () => {
    const jsonString = JSON.stringify(results, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${results.companyName.replace(/\s+/g, '_')}_research_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn("w-full animate-fade-in", className)}>
      <Card className="mb-6 glass-card overflow-hidden animate-slide-up">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">{results.companyName}</CardTitle>
              <CardDescription className="mt-1">
                {results.overview.summary.split(' ').slice(0, 20).join(' ')}...
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1 text-xs"
              onClick={downloadResults}
            >
              <Download size={14} />
              Export
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {(results.overview.tags || []).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="w-full animate-slide-up animation-delay-150">
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="investing">Investment</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-0 space-y-4">
          <Card className="animate-slide-up animation-delay-150">
            <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection('summary')}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Company Summary</CardTitle>
                </div>
                {expandedSections['summary'] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </CardHeader>
            {expandedSections['summary'] && (
              <CardContent>
                {renderSectionContent(results.overview.summary)}
              </CardContent>
            )}
          </Card>

          <Card className="animate-slide-up animation-delay-300">
            <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection('history')}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Company History</CardTitle>
                </div>
                {expandedSections['history'] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </CardHeader>
            {expandedSections['history'] && (
              <CardContent>
                {renderSectionContent(results.overview.history)}
              </CardContent>
            )}
          </Card>

          <Card className="animate-slide-up animation-delay-450">
            <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection('leadership')}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Leadership & Management</CardTitle>
                </div>
                {expandedSections['leadership'] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </CardHeader>
            {expandedSections['leadership'] && (
              <CardContent>
                {renderSectionContent(results.overview.leadership)}
              </CardContent>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="mt-0 space-y-4">
          <Card className="animate-slide-up animation-delay-150">
            <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection('performance')}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <BarChart4 className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Financial Performance</CardTitle>
                </div>
                {expandedSections['performance'] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </CardHeader>
            {expandedSections['performance'] && (
              <CardContent>
                {renderSectionContent(results.financial.performance)}
              </CardContent>
            )}
          </Card>

          <Card className="animate-slide-up animation-delay-300">
            <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection('metrics')}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Key Financial Metrics</CardTitle>
                </div>
                {expandedSections['metrics'] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </CardHeader>
            {expandedSections['metrics'] && (
              <CardContent>
                {renderSectionContent(results.financial.metrics)}
              </CardContent>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="market" className="mt-0 space-y-4">
          <Card className="animate-slide-up animation-delay-150">
            <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection('position')}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Market Position</CardTitle>
                </div>
                {expandedSections['position'] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </CardHeader>
            {expandedSections['position'] && (
              <CardContent>
                {renderSectionContent(results.market.position)}
              </CardContent>
            )}
          </Card>

          <Card className="animate-slide-up animation-delay-300">
            <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection('trends')}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Market Trends</CardTitle>
                </div>
                {expandedSections['trends'] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </CardHeader>
            {expandedSections['trends'] && (
              <CardContent>
                {renderSectionContent(results.market.trends)}
              </CardContent>
            )}
          </Card>
        </TabsContent>
  
        <TabsContent value="competitors" className="mt-0 space-y-4">
          <Card className="animate-slide-up animation-delay-150">
            <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection('competitors')}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Key Competitors</CardTitle>
                </div>
                {expandedSections['competitors'] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </CardHeader>
            {expandedSections['competitors'] && (
              <CardContent>
                {renderSectionContent(results.competitors.main)}
              </CardContent>
            )}
          </Card>

          <Card className="animate-slide-up animation-delay-300">
            <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection('comparison')}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <BarChart4 className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Competitive Analysis</CardTitle>
                </div>
                {expandedSections['comparison'] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </CardHeader>
            {expandedSections['comparison'] && (
              <CardContent>
                {renderSectionContent(results.competitors.analysis)}
              </CardContent>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="investing" className="mt-0 space-y-4">
          <Card className="animate-slide-up animation-delay-150">
            <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection('investment')}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Investment Potential</CardTitle>
                </div>
                {expandedSections['investment'] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </CardHeader>
            {expandedSections['investment'] && (
              <CardContent>
                {renderSectionContent(results.investment.analysis)}
              </CardContent>
            )}
          </Card>

          <Card className="animate-slide-up animation-delay-300">
            <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection('risks')}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Risks & Opportunities</CardTitle>
                </div>
                {expandedSections['risks'] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </CardHeader>
            {expandedSections['risks'] && (
              <CardContent>
                {renderSectionContent(results.investment.risks + '\n\n' + results.investment.opportunities)}
              </CardContent>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResearchResults;
