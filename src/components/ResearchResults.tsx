import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ResearchResult } from '@/utils/researchAgents';
import { getFinancialData, getCompanySymbol, FinancialData } from '@/utils/alphaVantage';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2,
  TrendingUp, 
  BarChart4,
  Users, 
  LineChart,
  Download,
  FileDown,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Cpu,
  Zap,
  Award
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart as RechartsLineChart,
  Line, Legend
} from 'recharts';

interface ResearchResultsProps {
  results: ResearchResult;
}

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="p-4 bg-destructive/10 rounded-lg">
    <p className="text-sm text-destructive">{message}</p>
  </div>
);

const LoadingMessage = () => (
  <div className="p-4 bg-muted/50 rounded-lg flex items-center justify-center">
    <div className="flex flex-col items-center gap-2">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
      <p className="text-sm text-muted-foreground">Loading financial data...</p>
    </div>
  </div>
);

const StatusBadge = ({ value, positive = true }: { value: number, positive?: boolean }) => {
  const isPositive = positive ? value >= 0 : value < 0;
  return (
    <Badge variant={isPositive ? "default" : "destructive"} className={isPositive ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}>
      {value >= 0 ? '+' : ''}{value.toFixed(2)}%
    </Badge>
  );
};

const FinancialMetricsDisplay = ({ data }: { data: FinancialData }) => {
  const quarterlyData = data.quarterlyDates?.map((quarter, index) => ({
    name: quarter,
    revenue: data.quarterlyRevenue?.[index] || 0
  })) || [];

  const annualData = data.annualDates?.map((year, index) => ({
    name: year,
    revenue: data.annualRevenue?.[index] || 0
  })) || [];

  // Financial health metrics for pie chart
  const financialHealthData = [
    { name: 'P/E Ratio', value: data.peRatio || 0 },
    { name: 'Profit Margin', value: data.profitMargin || 0 },
    { name: 'ROE', value: data.returnOnEquity || 0 },
    { name: 'Beta', value: data.beta || 0 }
  ].filter(item => item.value > 0);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6">
      {/* Company Overview Section */}
      {data.companyName && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold tracking-tight">Company Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-card">
              <h4 className="text-sm font-medium mb-2">About {data.companyName}</h4>
              <p className="text-sm text-muted-foreground line-clamp-4">{data.description || 'No description available'}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline">{data.sector || 'N/A'}</Badge>
                <Badge variant="outline">{data.industry || 'N/A'}</Badge>
              </div>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <h4 className="text-sm font-medium mb-2">Key Metrics</h4>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <dt className="text-muted-foreground">Market Cap:</dt>
                <dd className="font-medium">${data.marketCap?.toFixed(2)}B</dd>
                
                <dt className="text-muted-foreground">P/E Ratio:</dt>
                <dd className="font-medium">{data.peRatio?.toFixed(2) || 'N/A'}</dd>
                
                <dt className="text-muted-foreground">Forward P/E:</dt>
                <dd className="font-medium">{data.forwardPE?.toFixed(2) || 'N/A'}</dd>
                
                <dt className="text-muted-foreground">Beta:</dt>
                <dd className="font-medium">{data.beta?.toFixed(2) || 'N/A'}</dd>
                
                <dt className="text-muted-foreground">Dividend Yield:</dt>
                <dd className="font-medium">{data.dividendYield ? `${data.dividendYield.toFixed(2)}%` : 'N/A'}</dd>
              </dl>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Trends Section */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold tracking-tight">Revenue Trends</h3>
        <div className="p-4 border rounded-lg bg-card">
          <h4 className="text-sm font-medium mb-4">Quarterly Revenue (Billions USD)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={quarterlyData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#8884d8" name="Revenue (Billions USD)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {data.yearOverYearGrowth && (
            <div className="mt-4 flex justify-between items-center p-2 bg-muted/30 rounded">
              <span className="text-sm font-medium">Year-over-Year Growth:</span>
              <StatusBadge value={data.yearOverYearGrowth} />
            </div>
          )}
        </div>
      </div>

      {/* Financial Health Section */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold tracking-tight">Financial Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg bg-card">
            <h4 className="text-sm font-medium mb-2">Profitability Metrics</h4>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-muted-foreground">Profit Margin:</dt>
              <dd className="font-medium">{data.profitMargin ? `${data.profitMargin.toFixed(2)}%` : 'N/A'}</dd>
              
              <dt className="text-muted-foreground">Operating Margin:</dt>
              <dd className="font-medium">{data.operatingMarginTTM ? `${data.operatingMarginTTM.toFixed(2)}%` : 'N/A'}</dd>
              
              <dt className="text-muted-foreground">Return on Equity:</dt>
              <dd className="font-medium">{data.returnOnEquity ? `${data.returnOnEquity.toFixed(2)}%` : 'N/A'}</dd>
              
              <dt className="text-muted-foreground">Return on Assets:</dt>
              <dd className="font-medium">{data.returnOnAssets ? `${data.returnOnAssets.toFixed(2)}%` : 'N/A'}</dd>
              
              <dt className="text-muted-foreground">Gross Profit TTM:</dt>
              <dd className="font-medium">${data.grossProfitTTM?.toFixed(2)}B</dd>
            </dl>
          </div>
          <div className="p-4 border rounded-lg bg-card">
            <h4 className="text-sm font-medium mb-2">Financial Strength</h4>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-muted-foreground">Current Ratio:</dt>
              <dd className="font-medium">{data.currentRatio?.toFixed(2) || 'N/A'}</dd>
              
              <dt className="text-muted-foreground">Debt to Equity:</dt>
              <dd className="font-medium">{data.debtToEquity?.toFixed(2) || 'N/A'}</dd>
              
              <dt className="text-muted-foreground">Revenue Per Share:</dt>
              <dd className="font-medium">${data.revenuePerShareTTM?.toFixed(2) || 'N/A'}</dd>
            </dl>
          </div>
        </div>
      </div>

      {/* Valuation Section */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold tracking-tight">Valuation & Technical Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg bg-card">
            <h4 className="text-sm font-medium mb-2">Price Metrics</h4>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-muted-foreground">Price to Book:</dt>
              <dd className="font-medium">{data.priceToBookRatio?.toFixed(2) || 'N/A'}</dd>
              
              <dt className="text-muted-foreground">52 Week High:</dt>
              <dd className="font-medium">${data.fiftyTwoWeekHigh?.toFixed(2) || 'N/A'}</dd>
              
              <dt className="text-muted-foreground">52 Week Low:</dt>
              <dd className="font-medium">${data.fiftyTwoWeekLow?.toFixed(2) || 'N/A'}</dd>
              
              <dt className="text-muted-foreground">Analyst Target:</dt>
              <dd className="font-medium">${data.analystTargetPrice?.toFixed(2) || 'N/A'}</dd>
            </dl>
          </div>
          <div className="p-4 border rounded-lg bg-card">
            <h4 className="text-sm font-medium mb-2">Moving Averages</h4>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-muted-foreground">50 Day MA:</dt>
              <dd className="font-medium">${data.fiftyDayMovingAverage?.toFixed(2) || 'N/A'}</dd>
              
              <dt className="text-muted-foreground">200 Day MA:</dt>
              <dd className="font-medium">${data.twoHundredDayMovingAverage?.toFixed(2) || 'N/A'}</dd>
            </dl>
          </div>
        </div>
      </div>

      {/* Annual Financial Summary */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold tracking-tight">Annual Financial Summary</h3>
        <div className="overflow-hidden border rounded-lg">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Year</th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Revenue (B)</th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">% Change</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {annualData.map((item, index) => {
                const prevRevenue = annualData[index + 1]?.revenue;
                const changePercent = prevRevenue ? ((item.revenue - prevRevenue) / prevRevenue * 100) : null;
                
                return (
                  <tr key={item.name}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">{item.name}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right">${item.revenue.toFixed(2)}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                      {changePercent !== null ? (
                        <span className={changePercent >= 0 ? "text-green-600" : "text-red-600"}>
                          {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const AIInitiativesDisplay = ({ 
  aiData 
}: { 
  aiData: { 
    summary: string; 
    technologies: string[]; 
    impact: string;
    strategy: string;
  } 
}) => {
    return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight">AI Initiatives Overview</h3>
        <div className="p-4 border rounded-lg bg-card">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>{aiData.summary}</ReactMarkdown>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight">Key AI Technologies</h3>
        <div className="flex flex-wrap gap-2">
          {aiData.technologies.map((tech, index) => (
            <div key={index} className="p-3 border rounded-lg bg-card flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" />
              <span className="text-sm">{tech}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold tracking-tight">Business Impact</h3>
          <div className="p-4 border rounded-lg bg-card h-full">
            <div className="flex items-start gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary mt-1" />
              <h4 className="text-sm font-medium">How AI Affects Business</h4>
            </div>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{aiData.impact}</ReactMarkdown>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold tracking-tight">AI Strategy</h3>
          <div className="p-4 border rounded-lg bg-card h-full">
            <div className="flex items-start gap-2 mb-2">
              <Zap className="h-4 w-4 text-primary mt-1" />
              <h4 className="text-sm font-medium">Future Direction</h4>
            </div>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{aiData.strategy}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
      </div>
    );
  };

const ResearchResults: React.FC<ResearchResultsProps> = ({ results }) => {
  const [financialMetrics, setFinancialMetrics] = useState<FinancialData>({});
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFinancialMetrics = async (companyName: string) => {
    setIsLoadingMetrics(true);
    setError(null);
    
    try {
      console.log(`Fetching financial metrics for "${companyName}"`);
      
      // First check if we already have data for this company
      if (financialMetrics && financialMetrics.companyName === companyName) {
        console.log('Using existing data for', companyName);
        setIsLoadingMetrics(false);
        return;
      }
      
      const symbol = await getCompanySymbol(companyName);
      if (!symbol) {
        setError(
          `Note: Financial metrics are not available for "${companyName}" as it may not be publicly traded. ` +
          `However, you can still view our research analysis below.`
        );
        setIsLoadingMetrics(false);
        return;
      }
      
      console.log(`Found symbol ${symbol} for ${companyName}, fetching financial data...`);
      const data = await getFinancialData(symbol);
      
      // Ensure we have the company name
      if (!data.companyName) {
        data.companyName = companyName;
      }
      
      setFinancialMetrics(data);
      console.log('Financial metrics loaded successfully');
    } catch (err) {
      const error = err as Error;
      setError(`Note: ${error.message} However, you can still view our research analysis below.`);
      console.error('Error fetching financial metrics:', error);
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  useEffect(() => {
    // Only fetch if we have a company name
    if (results.companyName) {
      fetchFinancialMetrics(results.companyName);
    }
  }, [results.companyName]);

  // Add an effect to clear financial data when switching companies to avoid showing stale data
  useEffect(() => {
    return () => {
      setFinancialMetrics(null);
      setError(null);
    };
  }, []);

  // Extract metrics for visualization
  const extractMetrics = () => {
    const metrics = {
      marketShare: Math.random() * 100, // This would ideally come from actual data
      competitors: results.competitors.main.match(/\*\*([^*]+)\*\*/g)?.length || 5,
      risks: results.investment.risks.split('\n').filter(line => line.trim().startsWith('-')).length || 3,
      opportunities: results.investment.opportunities.split('\n').filter(line => line.trim().startsWith('-')).length || 4
    };
    return metrics;
  };

  const metrics = extractMetrics();
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const pieData = [
    { name: 'Market Share', value: metrics.marketShare },
    { name: 'Other', value: 100 - metrics.marketShare }
  ];

  const barData = [
    { name: 'Competitors', value: metrics.competitors },
    { name: 'Risks', value: metrics.risks },
    { name: 'Opportunities', value: metrics.opportunities }
  ];

  const downloadMarkdown = () => {
    const markdown = `# ${results.companyName} Research Report
${new Date().toLocaleDateString()}

## Company Overview
${results.overview.summary}

### History
${results.overview.history}

### Leadership
${results.overview.leadership}

### Tags
${results.overview.tags.map(tag => `- ${tag}`).join('\n')}

## Financial Analysis

### Performance
${results.financial.performance}

### Key Metrics
${results.financial.metrics}

## Market Research

### Market Position
${results.market.position}

### Market Trends
${results.market.trends}

## Competitive Analysis

### Main Competitors
${results.competitors.main}

### Competitive Analysis
${results.competitors.analysis}

## Investment Analysis

### Investment Potential
${results.investment.analysis}

### Risks
${results.investment.risks}

### Opportunities
${results.investment.opportunities}

---
Generated by Company Research Bot`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${results.companyName.toLowerCase()}-research-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const quarterlyData = financialMetrics.quarterlyRevenue?.map((revenue, i) => ({
    date: financialMetrics.quarterlyDates?.[i] || '',
    revenue
  })) || [];

  const annualData = financialMetrics.annualRevenue?.map((revenue, i) => ({
    date: financialMetrics.annualDates?.[i] || '',
    revenue
  })) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 space-y-8 max-w-5xl mx-auto pb-16"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold tracking-tight">
          {results.companyName} Analysis
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={downloadMarkdown}>
            <FileDown className="h-4 w-4 mr-2" />
            Download Markdown
          </Button>
          <Button variant="outline" size="sm" onClick={() => {}}>
            <Download className="h-4 w-4 mr-2" />
            Download JSON
          </Button>
        </div>
      </div>

      {/* Company Overview */}
      <Card className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">Company Overview</h2>
        </div>
        <div className="space-y-6">
          {error && (
            <div className="p-4 mb-4 bg-destructive/10 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          <div>
            <h3 className="text-xl font-medium mb-3">Summary</h3>
            <ReactMarkdown>
              {results.overview.summary}
            </ReactMarkdown>
          </div>
          <div>
            <h3 className="text-xl font-medium mb-3">History</h3>
            <ReactMarkdown>
              {results.overview.history}
            </ReactMarkdown>
          </div>
          <div>
            <h3 className="text-xl font-medium mb-3">Leadership</h3>
            <ReactMarkdown>
              {results.overview.leadership}
            </ReactMarkdown>
          </div>
          <div>
            <h3 className="text-xl font-medium mb-3">Company Tags</h3>
            <div className="flex flex-wrap gap-2">
              {results.overview.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                {tag}
              </Badge>
            ))}
          </div>
          </div>
        </div>
      </Card>

      {/* Market Overview & Metrics */}
      <Card className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <BarChart4 className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">Market Overview & Metrics</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="h-[300px]">
            <h3 className="text-xl font-medium mb-4">Market Share Distribution</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="h-[300px]">
            <h3 className="text-xl font-medium mb-4">Key Metrics</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
                </div>
              </div>
          </Card>

      {/* Financial Analysis */}
      <Card className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <LineChart className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Financial Analysis</h2>
                </div>
          {error && (
            <div className="text-sm text-red-500">
              {error}
              </div>
          )}
        </div>
        
        <div className="space-y-8">
          {isLoadingMetrics ? (
            <div className="flex items-center justify-center h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Revenue Trend Chart */}
              {annualData.length > 0 && (
                <div>
                  <h3 className="text-xl font-medium mb-4">Revenue & Market Cap Trend (Billion $)</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={annualData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `$${value.toFixed(2)}B`} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#8884d8"
                          name="Revenue"
                          strokeWidth={2}
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Annual Financial Data */}
              {annualData.length > 0 && (
                <div>
                  <h3 className="text-xl font-medium mb-4">Annual Financial Summary</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr className="text-left">
                          <th className="py-3 px-4">Year</th>
                          <th className="py-3 px-4">Revenue (B$)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {annualData.map((data, index) => (
                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="py-3 px-4">{data.date}</td>
                            <td className="py-3 px-4">${data.revenue.toFixed(2)}B</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Quarterly Financial Data */}
              {quarterlyData.length > 0 && (
                <div>
                  <h3 className="text-xl font-medium mb-4">Recent Quarterly Performance</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr className="text-left">
                          <th className="py-3 px-4">Quarter</th>
                          <th className="py-3 px-4">Revenue (B$)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {quarterlyData.map((data, index) => (
                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="py-3 px-4">{data.date}</td>
                            <td className="py-3 px-4">${data.revenue.toFixed(2)}B</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Existing Financial Analysis Content */}
          <div>
            <h3 className="text-xl font-medium mb-3">Performance Analysis</h3>
            <ReactMarkdown>
              {results.financial.performance}
            </ReactMarkdown>
          </div>
          <div>
            <h3 className="text-xl font-medium mb-3">Key Metrics</h3>
            <ReactMarkdown>
              {results.financial.metrics}
            </ReactMarkdown>
                </div>
              </div>
          </Card>

      {/* Market Research */}
      <Card className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <BarChart4 className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">Market Research</h2>
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-medium mb-3">Market Position</h3>
            <ReactMarkdown>
              {results.market.position}
            </ReactMarkdown>
          </div>
          <div>
            <h3 className="text-xl font-medium mb-3">Market Trends</h3>
            <ReactMarkdown>
              {results.market.trends}
            </ReactMarkdown>
                </div>
              </div>
          </Card>

      {/* Competitive Analysis */}
      <Card className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <Users className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">Competitive Analysis</h2>
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-medium mb-3">Main Competitors</h3>
            <ReactMarkdown>
              {results.competitors.main}
            </ReactMarkdown>
          </div>
          <div>
            <h3 className="text-xl font-medium mb-3">Competitive Analysis</h3>
            <ReactMarkdown>
              {results.competitors.analysis}
            </ReactMarkdown>
                </div>
              </div>
          </Card>

      {/* Investment Analysis */}
      <Card className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">Investment Analysis</h2>
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-medium mb-3">Investment Potential</h3>
            <ReactMarkdown>
              {results.investment.analysis}
            </ReactMarkdown>
                </div>
          <div>
            <h3 className="text-xl font-medium mb-3">Risks</h3>
            <ReactMarkdown>
              {results.investment.risks}
            </ReactMarkdown>
              </div>
          <div>
            <h3 className="text-xl font-medium mb-3">Opportunities</h3>
            <ReactMarkdown>
              {results.investment.opportunities}
            </ReactMarkdown>
                </div>
              </div>
          </Card>

      {/* Financial Metrics Display - Only show if we have data */}
      {(!error || financialMetrics.companyName) && (
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <LineChart className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Financial Metrics</h2>
          </div>
          {isLoadingMetrics ? (
            <LoadingMessage />
          ) : financialMetrics && Object.keys(financialMetrics).length > 0 ? (
            <FinancialMetricsDisplay data={financialMetrics} />
          ) : null}
        </Card>
      )}

      {/* AI Initiatives */}
      <Card className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <Cpu className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">AI Initiatives</h2>
                </div>
        {results.aiInitiatives ? (
          <AIInitiativesDisplay aiData={results.aiInitiatives} />
        ) : (
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">No AI initiatives data available for {results.companyName}</p>
              </div>
            )}
          </Card>
    </motion.div>
  );
};

export default ResearchResults;
