import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Download,
  Building, 
  Users, 
  PieChart,
  BarChart4, 
  Activity,
  Loader2,
  TrendingUp,
  LineChart,
  DollarSign,
  Target,
  TrendingDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ResearchResult } from '@/utils/researchAgents';
import ReactMarkdown from 'react-markdown';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

interface ResearchResultsProps {
  results: ResearchResult | null;
  className?: string;
  isLoading?: boolean;
}

const ResearchResults: React.FC<ResearchResultsProps> = ({ 
  results, 
  className,
  isLoading = false
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!results) return null;

  const renderSectionContent = (content: string) => {
    if (!content) return null;
    
    // Clean up the content
    const cleanContent = content
      .replace(/\*\*/g, '**')
      .replace(/\*/g, '*')
      .replace(/\n/g, '\n\n')
      .replace(/###\s/g, '\n### ')
      .replace(/^\s*[-•]\s/gm, '\n* ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return (
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown
          components={{
            h3: ({ children }) => (
              <h3 className="text-xl font-semibold mt-6 mb-3">{children}</h3>
            ),
            p: ({ children }) => (
              <p className="mb-4 leading-relaxed text-base">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>
            ),
            li: ({ children }) => (
              <li className="text-base">{children}</li>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-primary">{children}</strong>
            ),
            em: ({ children }) => (
              <em className="italic text-muted-foreground">{children}</em>
            ),
          }}
        >
          {cleanContent}
        </ReactMarkdown>
      </div>
    );
  };

  // Extract financial metrics for visualization
  const extractFinancialMetrics = (text: string) => {
    const metrics: any = {
      revenue: [],
      profit: [],
      marketShare: [],
      growth: []
    };

    // Extract numbers and percentages from the text
    const numbers = text.match(/\d+(\.\d+)?%?/g) || [];
    const years = text.match(/20\d{2}/g) || [];

    // Create sample data if not enough real data
    if (numbers.length < 4) {
      return [
        { year: '2020', value: Math.random() * 100 },
        { year: '2021', value: Math.random() * 100 },
        { year: '2022', value: Math.random() * 100 },
        { year: '2023', value: Math.random() * 100 }
      ];
    }

    return numbers.slice(0, 4).map((value, index) => ({
      year: years[index] || `202${index}`,
      value: parseFloat(value.replace('%', ''))
    }));
  };

  // Extract market share data for pie chart
  const extractMarketShareData = (text: string) => {
    const competitors = text.match(/\*\*(.*?)\*\*/g) || [];
    const shares = text.match(/\d+(\.\d+)?%/g) || [];

    if (competitors.length < 2) {
      return [
        { name: results.companyName, value: 35 },
        { name: 'Competitor 1', value: 25 },
        { name: 'Competitor 2', value: 20 },
        { name: 'Others', value: 20 }
      ];
    }

    return competitors.slice(0, 4).map((comp, index) => ({
      name: comp.replace(/\*\*/g, ''),
      value: shares[index] ? parseFloat(shares[index].replace('%', '')) : Math.random() * 25
    }));
  };

  const downloadResults = () => {
    try {
      const jsonString = JSON.stringify(results, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${results.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_research_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading results:', error);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className={cn("w-full animate-fade-in space-y-8", className)}>
      {/* Header Section */}
      <Card className="glass-card overflow-hidden animate-slide-up">
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex-grow">
              <CardTitle className="text-3xl font-bold">{results.companyName}</CardTitle>
              <CardDescription className="mt-2 text-base">
                {results.overview.summary.split('.')[0]}.
              </CardDescription>
              <div className="flex flex-wrap gap-2 mt-4">
                {(results.overview.tags || []).map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={downloadResults}
              >
                <Download size={16} />
                Export Report
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Company Overview Section */}
      <Card className="animate-slide-up">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building className="h-6 w-6 text-primary" />
            <CardTitle>Company Overview & History</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Business Overview</h3>
              {renderSectionContent(results.overview.summary)}
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Company Timeline</h3>
              {renderSectionContent(results.overview.history)}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Leadership & Management</h3>
            {renderSectionContent(results.overview.leadership)}
          </div>
        </CardContent>
      </Card>

      {/* Financial Analysis Section */}
      <Card className="animate-slide-up">
        <CardHeader>
          <div className="flex items-center gap-2">
            <PieChart className="h-6 w-6 text-primary" />
            <CardTitle>Financial Performance & Metrics</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Financial Performance</h3>
              {renderSectionContent(results.financial.performance)}
            </div>
            <div className="h-[300px]">
              <h3 className="text-xl font-semibold mb-4">Revenue Trend</h3>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={extractFinancialMetrics(results.financial.performance)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Key Financial Metrics</h3>
            {renderSectionContent(results.financial.metrics)}
          </div>
        </CardContent>
      </Card>

      {/* Market Analysis Section */}
      <Card className="animate-slide-up">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart4 className="h-6 w-6 text-primary" />
            <CardTitle>Market Analysis & Position</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Market Position</h3>
              {renderSectionContent(results.market.position)}
            </div>
            <div className="h-[300px]">
              <h3 className="text-xl font-semibold mb-4">Market Share Distribution</h3>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={extractMarketShareData(results.competitors.main)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {extractMarketShareData(results.competitors.main).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Market Trends & Industry Analysis</h3>
            {renderSectionContent(results.market.trends)}
          </div>
        </CardContent>
      </Card>

      {/* Competitive Analysis Section */}
      <Card className="animate-slide-up">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            <CardTitle>Competitive Landscape</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Key Competitors</h3>
              {renderSectionContent(results.competitors.main)}
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Competitive Analysis</h3>
              {renderSectionContent(results.competitors.analysis)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investment Analysis Section */}
      <Card className="animate-slide-up">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <CardTitle>Investment Analysis</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <h3 className="text-xl font-semibold mb-4">Investment Potential</h3>
              {renderSectionContent(results.investment.analysis)}
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-red-500">
                  <TrendingDown className="h-5 w-5 inline-block mr-2" />
                  Key Risks
                </h3>
                {renderSectionContent(results.investment.risks)}
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 text-green-500">
                  <TrendingUp className="h-5 w-5 inline-block mr-2" />
                  Growth Opportunities
                </h3>
                {renderSectionContent(results.investment.opportunities)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResearchResults;
