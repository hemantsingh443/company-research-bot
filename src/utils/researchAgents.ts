import { geminiGenerate } from './geminiAPI';
import { searchWeb } from './googleSearch';

// Define the structure of research results
export interface ResearchResult {
  companyName: string;
  overview: {
    summary: string;
    history: string;
    leadership: string;
    tags: string[];
  };
  financial: {
    performance: string;
    metrics: string;
  };
  market: {
    position: string;
    trends: string;
  };
  competitors: {
    main: string;
    analysis: string;
  };
  investment: {
    analysis: string;
    risks: string;
    opportunities: string;
  };
  aiInitiatives: {
    summary: string;
    technologies: string[];
    impact: string;
    strategy: string;
  };
}

export interface WebSource {
  url: string;
  title: string;
  snippet: string;
  agentId: string;
  timestamp: number;
}

interface FinancialMetrics {
  quarterlyData: {
    quarter: string;
    revenue: number;
    growth: number;
    eps: number;
  }[];
  annualData: {
    year: number;
    revenue: number;
    growth: number;
    marketCap: number;
  }[];
}

const handleSearchError = (error: any) => {
  if (error.message?.includes('quota limit')) {
    return {
      error: 'API_LIMIT',
      message: 'Search quota exceeded. Using cached/alternative data sources.'
    };
  }
  return {
    error: 'SEARCH_ERROR',
    message: error.message
  };
};

// Company Overview Agent
const companyOverviewAgent = async (companyName: string, onSourceFound?: (source: WebSource) => void): Promise<any> => {
  try {
    const searchResults = await Promise.allSettled([
      searchWeb(`${companyName} company overview latest news developments`),
      searchWeb(`${companyName} history founding story milestones`),
      searchWeb(`${companyName} CEO executive team leadership changes`),
      searchWeb(`${companyName} business model revenue streams`),
      searchWeb(`${companyName} products services market segments`)
    ]);

    const validResults = searchResults
      .filter((result): result is PromiseFulfilledResult<string> => 
        result.status === 'fulfilled' && !!result.value)
      .map(result => result.value)
      .join('\n\n');

    if (!validResults) {
      // Fallback to basic company info if no search results
      return {
        name: companyName,
        description: `Analysis temporarily unavailable for ${companyName}. Please try again later.`,
        tags: ['pending-analysis'],
        webSources: []
      };
    }

    // Combine all results
    const combinedResults = validResults;
    
    // Emit web sources if callback is provided
    if (onSourceFound) {
      const sources = validResults.split('\n\n').map((result, index) => {
        const lines = result.split('\n');
        if (lines.length < 3) return null;
        
        const title = lines[0].replace(/^Title: /, '');
        const url = lines[1].replace(/^URL: /, '');
        const snippet = lines[2].replace(/^Summary: /, '');
        
        return {
          url,
          title,
          snippet,
          agentId: 'company',
          timestamp: Date.now() + index * 100
        };
      }).filter(Boolean) as WebSource[];
      
      sources.forEach(onSourceFound);
    }
  
  const prompt = `
      You are a professional business analyst. Analyze the following information about ${companyName} and provide a comprehensive analysis.
      Focus on recent developments, key metrics, and strategic initiatives.

      Available information:
      ${combinedResults}

      Provide your analysis in the following format:
      1. Company Summary (3-4 paragraphs)
       - Current business model and operations
       - Key products/services and revenue streams
       - Market position and competitive advantages
       - Recent significant developments or announcements

      2. Company History (2-3 paragraphs)
       - Founding story and early years
       - Major milestones and acquisitions
       - Strategic pivots and growth phases
       - Recent strategic changes or restructuring

      3. Leadership Analysis (2 paragraphs)
       - Current executive team background
       - Management style and vision
       - Recent leadership changes and their impact
       - Key strategic decisions and their outcomes

      4. Company Tags (8-10 keywords)
       - Industry categories
       - Business model types
       - Market segments
       - Technology stacks
       - Geographic presence

      Format your response using markdown for better readability:
      - Use **bold** for company names, products, and key metrics
      - Use *italic* for emphasis and trends
      - Use bullet points for lists and key points
      - Use ### for section headers
      - Use > for important quotes or statements
      - Use proper paragraph spacing

      Base your analysis ONLY on the provided information. If specific information is not available, clearly state what is known and what is uncertain.
      Focus on factual, verifiable information rather than speculation.
  `;
  
  const response = await geminiGenerate(prompt);
    const sections = parseGeminiResponse(response, 3);
  
    // Extract tags more robustly
  let tags: string[] = [];
    const tagsSection = response.split('Company Tags')[1] || '';
    const tagMatches = tagsSection.match(/[•\-\*]?\s*([^•\-\*\n]+)/g);
    
    if (tagMatches) {
      tags = tagMatches
        .map(tag => tag.replace(/^[•\-\*]\s*/, '').trim())
        .filter(tag => tag.length > 0 && tag.length < 50)
        .slice(0, 10);
    }
    
    // If no valid tags found, generate some
  if (tags.length === 0) {
      const tagsPrompt = `Based on the following information about ${companyName}, provide exactly 8-10 relevant tags as a comma-separated list. Include industry categories, business models, market segments, and technology focus areas. Just list the tags without any other text.\n\n${combinedResults}`;
    const tagsResponse = await geminiGenerate(tagsPrompt);
      tags = tagsResponse
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0 && tag.length < 50)
        .slice(0, 10);
  }
  
  return {
      summary: sections[0] || `Information about ${companyName}`,
      history: sections[1] || `History of ${companyName}`,
      leadership: sections[2] || `Leadership team of ${companyName}`,
    tags: tags.length ? tags : [`${companyName}`, 'company', 'business', 'organization', 'corporation'],
  };
  } catch (error) {
    console.error('Error in companyOverviewAgent:', error);
    return {
      name: companyName,
      description: `Unable to analyze ${companyName} at this time. Please try again later.`,
      tags: ['error'],
      webSources: []
    };
  }
};

// Financial Analysis Agent
const financialAnalysisAgent = async (companyName: string, onSourceFound?: (source: WebSource) => void): Promise<any> => {
  try {
  const searchResults = await searchWeb(`${companyName} financial performance revenue profit earnings latest quarterly results`);
  
    // Emit web sources if callback is provided
    if (onSourceFound && searchResults !== 'No search results found. Please try a different search query.') {
      const sources = searchResults.split('\n\n').map((result, index) => {
        const lines = result.split('\n');
        if (lines.length < 3) return null;
        
        const title = lines[0].replace(/^Title: /, '');
        const url = lines[1].replace(/^URL: /, '');
        const snippet = lines[2].replace(/^Summary: /, '');
        
        return {
          url,
          title,
          snippet,
          agentId: 'financial',
          timestamp: Date.now() + index * 100
        };
      }).filter(Boolean) as WebSource[];
      
      sources.forEach(onSourceFound);
    }
    
    const prompt = `
      You are a financial analyst. Analyze the following financial information about ${companyName} and provide a structured response.

      Available information:
    ${searchResults}
    
      Provide your analysis in the following format:
      1. Financial Performance Analysis (2-3 paragraphs)
       - Revenue trends and growth rates
       - Profitability metrics
       - Key financial highlights
       - Recent performance changes

      2. Key Financial Metrics (1-2 paragraphs)
       - P/E ratio and valuation metrics
       - EBITDA and operational metrics
       - Debt-to-equity and leverage metrics
       - Cash flow indicators

      Format your response using markdown:
      - Use **bold** for financial terms and metrics
      - Use *italic* for emphasis
      - Use proper paragraph spacing
      - Use bullet points for lists
      - Use ### for section headers

      Base your analysis only on the provided information. If specific metrics are not available, clearly state this.
  `;
  
  const response = await geminiGenerate(prompt);
    const sections = parseGeminiResponse(response, 2);
  
  return {
    performance: sections[0] || `Financial performance analysis of ${companyName}`,
      metrics: sections[1] || `Key financial metrics for ${companyName}`,
    };
  } catch (error) {
    console.error('Error in financialAnalysisAgent:', error);
    return {
      performance: `Unable to generate financial performance data for ${companyName}`,
      metrics: `Unable to generate financial metrics for ${companyName}`,
    };
  }
};

// Market Research Agent
const marketResearchAgent = async (companyName: string, onSourceFound?: (source: WebSource) => void): Promise<any> => {
  try {
  const searchResults = await searchWeb(`${companyName} market share industry trends market position target customers`);
  
    // Emit web sources if callback is provided
    if (onSourceFound && searchResults !== 'No search results found. Please try a different search query.') {
      const sources = searchResults.split('\n\n').map((result, index) => {
        const lines = result.split('\n');
        if (lines.length < 3) return null;
        
        const title = lines[0].replace(/^Title: /, '');
        const url = lines[1].replace(/^URL: /, '');
        const snippet = lines[2].replace(/^Summary: /, '');
        
        return {
          url,
          title,
          snippet,
          agentId: 'market',
          timestamp: Date.now() + index * 100
        };
      }).filter(Boolean) as WebSource[];
      
      sources.forEach(onSourceFound);
    }
    
    const prompt = `
      You are a market research analyst. Analyze the following market information about ${companyName} and provide a structured response.

      Available information:
    ${searchResults}
    
      Provide your analysis in the following format:
      1. Market Position Analysis (2 paragraphs)
       - Current market share
       - Target customer segments
       - Geographic presence
       - Brand positioning

      2. Market Trends and Impact (2 paragraphs)
       - Industry developments
       - Emerging trends
       - Market challenges
       - Growth opportunities

      Format your response using markdown:
      - Use **bold** for market terms and metrics
      - Use *italic* for emphasis
      - Use proper paragraph spacing
      - Use bullet points for lists
      - Use ### for section headers

      Base your analysis only on the provided information. Focus on factual, verifiable data.
  `;
  
  const response = await geminiGenerate(prompt);
  
  const sections = response.split('\n\n');
  
  return {
    position: sections[0] || `Market position of ${companyName}`,
    trends: sections.length > 1 ? sections.slice(1).join('\n\n') : `Market trends affecting ${companyName}`,
  };
  } catch (error) {
    console.error('Error in marketResearchAgent:', error);
    return {
      position: `Unable to generate market position data for ${companyName}`,
      trends: `Unable to generate market trends for ${companyName}`,
    };
  }
};

// Competitive Intelligence Agent
const competitiveIntelligenceAgent = async (companyName: string, onSourceFound?: (source: WebSource) => void): Promise<any> => {
  try {
  const searchResults = await searchWeb(`${companyName} competitors comparison competitive advantage industry rivals`);
  
    // Emit web sources if callback is provided
    if (onSourceFound && searchResults !== 'No search results found. Please try a different search query.') {
      const sources = searchResults.split('\n\n').map((result, index) => {
        const lines = result.split('\n');
        if (lines.length < 3) return null;
        
        const title = lines[0].replace(/^Title: /, '');
        const url = lines[1].replace(/^URL: /, '');
        const snippet = lines[2].replace(/^Summary: /, '');
        
        return {
          url,
          title,
          snippet,
          agentId: 'competitors',
          timestamp: Date.now() + index * 100
        };
      }).filter(Boolean) as WebSource[];
      
      sources.forEach(onSourceFound);
    }
    
    const prompt = `
      You are a competitive intelligence analyst. Analyze the following competitive information about ${companyName} and provide a structured response.

      Available information:
    ${searchResults}
    
      Provide your analysis in the following format:
      1. Main Competitors Overview (1-2 paragraphs)
       - List major competitors
       - Market share comparison
       - Key differentiators
       - Industry positioning

      2. Competitive Analysis (2 paragraphs)
       - Strengths and weaknesses
       - Competitive advantages
       - Market opportunities
       - Strategic positioning

      Format your response using markdown:
      - Use **bold** for competitor names and key terms
      - Use *italic* for emphasis
      - Use proper paragraph spacing
      - Use bullet points for lists
      - Use ### for section headers

      Base your analysis only on the provided information. Focus on factual comparisons and verifiable data.
  `;
  
  const response = await geminiGenerate(prompt);
  
  const sections = response.split('\n\n');
  
  return {
    main: sections[0] || `Main competitors of ${companyName}`,
    analysis: sections.length > 1 ? sections.slice(1).join('\n\n') : `Competitive analysis for ${companyName}`,
  };
  } catch (error) {
    console.error('Error in competitiveIntelligenceAgent:', error);
    return {
      main: `Unable to generate competitor information for ${companyName}`,
      analysis: `Unable to generate competitive analysis for ${companyName}`,
    };
  }
};

// ROI Analysis Agent
const investmentAnalysisAgent = async (companyName: string, onSourceFound?: (source: WebSource) => void): Promise<any> => {
  try {
  const searchResults = await searchWeb(`${companyName} investment potential stock performance risks opportunities growth forecast`);
  
    // Emit web sources if callback is provided
    if (onSourceFound && searchResults !== 'No search results found. Please try a different search query.') {
      const sources = searchResults.split('\n\n').map((result, index) => {
        const lines = result.split('\n');
        if (lines.length < 3) return null;
        
        const title = lines[0].replace(/^Title: /, '');
        const url = lines[1].replace(/^URL: /, '');
        const snippet = lines[2].replace(/^Summary: /, '');
        
        return {
          url,
          title,
          snippet,
          agentId: 'investment',
          timestamp: Date.now() + index * 100
        };
      }).filter(Boolean) as WebSource[];
      
      sources.forEach(onSourceFound);
    }
    
    const prompt = `
      You are an investment analyst. Analyze the following investment information about ${companyName} and provide a structured response.

      Available information:
    ${searchResults}
    
      Provide your analysis in the following format:
      1. Investment Analysis (2-3 paragraphs)
       - Current valuation
       - Growth potential
       - Market position
       - Financial health

      2. Risk Assessment (1 paragraph)
       - Market risks
       - Operational risks
       - Regulatory risks
       - Competitive risks

      3. Growth Opportunities (1 paragraph)
       - Market expansion
       - Product development
       - Strategic initiatives
       - Industry trends

      Format your response using markdown:
      - Use **bold** for financial terms and metrics
      - Use *italic* for emphasis
      - Use proper paragraph spacing
      - Use bullet points for lists
      - Use ### for section headers

      Base your analysis only on the provided information. Include both positive and negative aspects for a balanced assessment.
  `;
  
  const response = await geminiGenerate(prompt);
  
  const sections = response.split('\n\n');
  
  let analysis = '';
  let risks = '';
  let opportunities = '';
  
  if (sections.length >= 1) analysis = sections[0];
  
  // Look for risk section
  const riskIndex = response.toLowerCase().indexOf('risk');
  if (riskIndex !== -1) {
    const afterRisk = response.substring(riskIndex);
    const paragraphs = afterRisk.split('\n\n');
    if (paragraphs.length >= 1) risks = paragraphs[0];
  }
  
  // Look for opportunity section
  const opportunityIndex = response.toLowerCase().indexOf('opportunit');
  if (opportunityIndex !== -1) {
    const afterOpportunity = response.substring(opportunityIndex);
    const paragraphs = afterOpportunity.split('\n\n');
    if (paragraphs.length >= 1) opportunities = paragraphs[0];
  }
  
  // If we couldn't find clear sections, make a best guess
  if (!risks && sections.length >= 2) risks = sections[1];
  if (!opportunities && sections.length >= 3) opportunities = sections[2];
  
  return {
    analysis: analysis || `Investment analysis for ${companyName}`,
    risks: risks || `Investment risks for ${companyName}`,
    opportunities: opportunities || `Investment opportunities for ${companyName}`,
  };
  } catch (error) {
    console.error('Error in investmentAnalysisAgent:', error);
    return {
      analysis: `Unable to generate investment analysis for ${companyName}`,
      risks: `Unable to generate risk assessment for ${companyName}`,
      opportunities: `Unable to generate opportunity analysis for ${companyName}`,
    };
  }
};

// AI Initiatives Analysis Agent
const aiInitiativesAgent = async (companyName: string, onSourceFound?: (source: WebSource) => void): Promise<any> => {
  try {
    const searchResults = await Promise.allSettled([
      searchWeb(`${companyName} artificial intelligence AI machine learning initiatives`),
      searchWeb(`${companyName} AI technology development research`),
      searchWeb(`${companyName} generative AI investments strategy`),
      searchWeb(`${companyName} AI patents innovation`)
    ]);

    const validResults = searchResults
      .filter((result): result is PromiseFulfilledResult<string> => 
        result.status === 'fulfilled' && !!result.value)
      .map(result => result.value)
      .join('\n\n');

    if (!validResults) {
      // Fallback if no search results
      return {
        summary: `No specific AI initiatives found for ${companyName}.`,
        technologies: [],
        impact: `Information about ${companyName}'s AI impact is unavailable.`,
        strategy: `Information about ${companyName}'s AI strategy is unavailable.`
      };
    }

    // Emit web sources if callback is provided
    if (onSourceFound) {
      const sources = validResults.split('\n\n').map((result, index) => {
        const lines = result.split('\n');
        if (lines.length < 3) return null;
        
        const title = lines[0].replace(/^Title: /, '');
        const url = lines[1].replace(/^URL: /, '');
        const snippet = lines[2].replace(/^Summary: /, '');
        
        return {
          url,
          title,
          snippet,
          agentId: 'ai-initiatives',
          timestamp: Date.now() + index * 100
        };
      }).filter(Boolean) as WebSource[];
      
      sources.forEach(onSourceFound);
    }
  
    const prompt = `
      You are an AI technology analyst specializing in enterprise AI adoption. Analyze the following information about ${companyName}'s AI initiatives and provide a comprehensive analysis.
      
      Available information:
      ${validResults}
      
      Provide your analysis in the following format:
      
      1. AI Initiatives Summary (2-3 paragraphs)
       - Current AI technologies and implementations
       - Key AI projects and their objectives
       - Recent AI-related announcements or developments
      
      2. AI Technologies and Capabilities (list of at least 5 technologies)
       - What specific AI technologies is the company using?
       - Which AI frameworks, models, or approaches are they investing in?
       - What AI-related patents or proprietary technology do they have?
      
      3. Business Impact of AI (1-2 paragraphs)
       - How is AI affecting their business model?
       - What competitive advantages does AI provide them?
       - Are there measurable benefits from their AI initiatives?
      
      4. AI Strategy and Future Direction (1-2 paragraphs)
       - What is their long-term AI strategy?
       - How are they positioning themselves in the AI landscape?
       - What future AI-related developments are they planning?
      
      Base your analysis ONLY on the provided information. If specific information is not available, state what is known and what is uncertain.
      Format your response using markdown for better readability.
    `;
    
    const response = await geminiGenerate(prompt);
    
    // Extract technologies more robustly
    let technologies: string[] = [];
    const techSection = response.split('AI Technologies and Capabilities')[1]?.split('Business Impact')[0] || '';
    const techMatches = techSection.match(/[•\-\*]?\s*([^•\-\*\n]+)/g);
    
    if (techMatches) {
      technologies = techMatches
        .map(tech => tech.replace(/^[•\-\*]\s*/, '').trim())
        .filter(tech => tech.length > 0 && tech.length < 100)
        .slice(0, 8);
    }
    
    // Extract main sections
    const sections = parseGeminiResponse(response, 4);
    
    return {
      summary: sections[0] || `No specific AI initiatives found for ${companyName}.`,
      technologies: technologies.length ? technologies : [`No specific AI technologies identified for ${companyName}`],
      impact: sections[2] || `Information about ${companyName}'s AI impact is unavailable.`,
      strategy: sections[3] || `Information about ${companyName}'s AI strategy is unavailable.`
    };
  } catch (error) {
    console.error('Error in aiInitiativesAgent:', error);
    return {
      summary: `Unable to analyze ${companyName}'s AI initiatives at this time.`,
      technologies: ['Information unavailable'],
      impact: `Unable to analyze ${companyName}'s AI impact at this time.`,
      strategy: `Unable to analyze ${companyName}'s AI strategy at this time.`
    };
  }
};

// Main research orchestration function
export const runResearch = async (
  companyName: string,
  onSourceFound?: (source: WebSource) => void
): Promise<ResearchResult> => {
  try {
    // Run all agents in parallel for better performance
    const [overview, financial, market, competitors, investment, aiInitiatives] = await Promise.all([
      companyOverviewAgent(companyName, onSourceFound),
      financialAnalysisAgent(companyName, onSourceFound),
      marketResearchAgent(companyName, onSourceFound),
      competitiveIntelligenceAgent(companyName, onSourceFound),
      investmentAnalysisAgent(companyName, onSourceFound),
      aiInitiativesAgent(companyName, onSourceFound)
    ]);
    
    return {
      companyName,
      overview,
      financial,
      market,
      competitors,
      investment,
      aiInitiatives
    };
  } catch (error) {
    console.error("Error running research:", error);
    // Return a fallback result instead of throwing
    return {
      companyName,
      overview: {
        summary: `Unable to generate overview for ${companyName}. Please try again later.`,
        history: `Unable to generate history for ${companyName}. Please try again later.`,
        leadership: `Unable to generate leadership information for ${companyName}. Please try again later.`,
        tags: [companyName, 'company', 'business']
      },
      financial: {
        performance: `Unable to generate financial performance data for ${companyName}. Please try again later.`,
        metrics: `Unable to generate financial metrics for ${companyName}. Please try again later.`
      },
      market: {
        position: `Unable to generate market position data for ${companyName}. Please try again later.`,
        trends: `Unable to generate market trends for ${companyName}. Please try again later.`
      },
      competitors: {
        main: `Unable to generate competitor information for ${companyName}. Please try again later.`,
        analysis: `Unable to generate competitive analysis for ${companyName}. Please try again later.`
      },
      investment: {
        analysis: `Unable to generate investment analysis for ${companyName}. Please try again later.`,
        risks: `Unable to generate risk assessment for ${companyName}. Please try again later.`,
        opportunities: `Unable to generate opportunity analysis for ${companyName}. Please try again later.`
      },
      aiInitiatives: {
        summary: `Unable to analyze ${companyName}'s AI initiatives at this time. Please try again later.`,
        technologies: ['Information unavailable'],
        impact: `Unable to analyze ${companyName}'s AI impact at this time. Please try again later.`,
        strategy: `Unable to analyze ${companyName}'s AI strategy at this time. Please try again later.`
      }
    };
  }
};

// Helper function to safely parse Gemini response
const parseGeminiResponse = (response: string, sectionCount: number): string[] => {
  try {
    // Split by double newlines and clean up each section
    const sections = response.split('\n\n').map(section => 
      section.trim()
        .replace(/^\d+\.\s*/, '') // Remove numbered list markers
        .replace(/\*\*/g, '**') // Preserve markdown bold
        .replace(/\*/g, '*') // Preserve markdown italic
    ).filter(Boolean);

    // If we have enough sections, return them
    if (sections.length >= sectionCount) {
      return sections.slice(0, sectionCount);
    }

    // If we don't have enough sections, try to split by single newlines
    const altSections = response.split('\n').map(section => 
      section.trim()
        .replace(/^\d+\.\s*/, '')
        .replace(/\*\*/g, '**')
        .replace(/\*/g, '*')
    ).filter(Boolean);

    if (altSections.length >= sectionCount) {
      return altSections.slice(0, sectionCount);
    }

    // If still not enough sections, return what we have with fallback text
    return sections.map(section => section || 'Information not available');
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    return Array(sectionCount).fill('Information not available');
  }
};

export async function extractFinancialMetrics(companyName: string, webSearchCallback?: (source: WebSource) => void): Promise<FinancialMetrics> {
  try {
    // Search for recent financial data with more specific queries
    const searchQueries = [
      `${companyName} Q4 2023 Q1 2024 quarterly revenue earnings numbers`,
      `${companyName} latest quarterly financial results actual numbers`,
      `${companyName} annual revenue 2023 2024 exact figures`,
      `${companyName} current market cap stock price`,
      `${companyName} quarterly year over year growth percentage`
    ];

    const searchResults = await Promise.all(
      searchQueries.map(query => searchWeb(query))
    );

    // Process and combine search results
    const processedResults = searchResults
      .filter(result => result !== 'No search results found. Please try a different search query.')
      .map(result => {
        const sources = result.split('\n\n').map(item => {
          const lines = item.split('\n');
          if (lines.length < 3) return null;
          return {
            title: lines[0].replace(/^Title: /, ''),
            url: lines[1].replace(/^URL: /, ''),
            snippet: lines[2].replace(/^Summary: /, '')
          };
        }).filter(Boolean);
        return sources;
      })
      .flat();

    if (webSearchCallback) {
      processedResults.forEach((source, index) => {
        if (source) {
          webSearchCallback({
            ...source,
            agentId: 'financial',
            timestamp: Date.now() + index * 100
          });
        }
      });
    }

    const combinedText = processedResults
      .map(source => source?.snippet || '')
      .join('\n\n');

    // Simplified prompt focusing only on numeric data extraction
    const prompt = `Extract ONLY the following financial metrics for ${companyName} from the text. Format as JSON:

{
  "quarterlyData": [
    {
      "quarter": "Q1 2024",
      "revenue": X, // revenue in billions USD, numbers only
      "growth": Y, // YoY growth as percentage, numbers only
      "eps": Z // earnings per share in USD, numbers only
    }
  ],
  "annualData": [
    {
      "year": YYYY,
      "revenue": X, // annual revenue in billions USD, numbers only
      "growth": Y, // YoY growth as percentage, numbers only
      "marketCap": Z // market cap in billions USD, numbers only
    }
  ]
}

Rules:
1. ONLY include quarters/years that have explicit numeric data in the text
2. Do NOT estimate or interpolate missing values
3. Include ONLY exact numbers mentioned in the text
4. Format all numbers as plain numbers (e.g., 45.2 not "$45.2B")
5. Order from most recent to oldest
6. If a specific number isn't mentioned in the text, don't include that entry

Source text:
${combinedText}`;

    const response = await geminiGenerate(prompt);
    
    try {
      const parsedData = JSON.parse(response);
      
      // Strict validation of numeric values
      const cleanData = {
        quarterlyData: (parsedData.quarterlyData || [])
          .filter(q => (
            q.quarter &&
            typeof q.revenue === 'number' &&
            typeof q.growth === 'number' &&
            typeof q.eps === 'number' &&
            !isNaN(q.revenue) &&
            !isNaN(q.growth) &&
            !isNaN(q.eps)
          ))
          .slice(0, 4),
        annualData: (parsedData.annualData || [])
          .filter(y => (
            y.year &&
            typeof y.revenue === 'number' &&
            typeof y.growth === 'number' &&
            typeof y.marketCap === 'number' &&
            !isNaN(y.revenue) &&
            !isNaN(y.growth) &&
            !isNaN(y.marketCap)
          ))
          .slice(0, 5)
      };

      if (cleanData.quarterlyData.length > 0 || cleanData.annualData.length > 0) {
        return cleanData;
      }
    } catch (error) {
      console.error('Failed to parse financial metrics:', error);
    }

    // Simplified fallback prompt
    const fallbackPrompt = `From the following text about ${companyName}, extract ONLY explicitly mentioned:
    1. Quarterly revenue numbers (in billions)
    2. Annual revenue numbers (in billions)
    3. Growth percentages
    4. Market cap (in billions)
    5. EPS numbers

    Format as simple JSON with only the numbers. Don't include any text explanations.
    Only include values that are explicitly stated in the text.

    Text: ${combinedText}`;

    const fallbackResponse = await geminiGenerate(fallbackPrompt);
    
    try {
      const fallbackData = JSON.parse(fallbackResponse);
      const validData = {
        quarterlyData: (fallbackData.quarterlyData || [])
          .filter(q => q.quarter && q.revenue && !isNaN(q.revenue))
          .slice(0, 4),
        annualData: (fallbackData.annualData || [])
          .filter(y => y.year && y.revenue && !isNaN(y.revenue))
          .slice(0, 5)
      };

      if (validData.quarterlyData.length > 0 || validData.annualData.length > 0) {
        return validData;
      }
    } catch (error) {
      console.error('Failed to parse fallback financial metrics:', error);
    }

    // Return minimal data structure with the most recent date
    return {
      quarterlyData: [
        { quarter: 'Q1 2024', revenue: 0, growth: 0, eps: 0 }
      ],
      annualData: [
        { year: 2024, revenue: 0, growth: 0, marketCap: 0 }
      ]
    };
  } catch (error) {
    console.error('Error in extractFinancialMetrics:', error);
    return {
      quarterlyData: [
        { quarter: 'Q1 2024', revenue: 0, growth: 0, eps: 0 }
      ],
      annualData: [
        { year: 2024, revenue: 0, growth: 0, marketCap: 0 }
      ]
    };
  }
}
