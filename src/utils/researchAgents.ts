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
}

export interface WebSource {
  url: string;
  title: string;
  snippet: string;
  agentId: string;
  timestamp: number;
}

// Company Overview Agent
const companyOverviewAgent = async (companyName: string, onSourceFound?: (source: WebSource) => void): Promise<any> => {
  try {
    const searchResults = await searchWeb(`${companyName} company overview history leadership latest news`);
    
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
          agentId: 'company',
          timestamp: Date.now() + index * 100
        };
      }).filter(Boolean) as WebSource[];
      
      sources.forEach(onSourceFound);
    }
    
    const prompt = `
      You are a professional business analyst. Analyze the following information about ${companyName} and provide a structured response.

      Available information:
      ${searchResults}

      Provide your analysis in the following format:
      1. Company Summary (3 paragraphs)
       - Focus on current business model and operations
       - Include key products/services
       - Highlight recent significant developments

      2. Company History (2 paragraphs)
       - Founding and early years
       - Major milestones and growth phases
       - Recent strategic changes

      3. Leadership Structure (1 paragraph)
       - Current executive team
       - Key decision makers
       - Recent leadership changes

      4. Company Tags (5 keywords)
       - Industry categories
       - Business model types
       - Market segments

      Format your response using markdown:
      - Use **bold** for company names and key terms
      - Use *italic* for emphasis
      - Use proper paragraph spacing
      - Use bullet points for lists
      - Use ### for section headers

      Base your analysis only on the provided information. Do not make assumptions or include information not present in the sources.
    `;
    
    const response = await geminiGenerate(prompt);
    const sections = parseGeminiResponse(response, 3);
    
    // Extract tags more robustly
    let tags: string[] = [];
    const tagsMatch = response.match(/tags|keywords:?\s*(.*?)(?:\n|$)/i);
    if (tagsMatch && tagsMatch[1]) {
      tags = tagsMatch[1]
        .split(/[,|\n]/)
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0 && tag.length < 50); // Filter out invalid tags
    }
    
    // If no valid tags found, generate some
    if (tags.length === 0) {
      const tagsPrompt = `Given the company ${companyName}, provide exactly 5 relevant industry or category tags as a comma-separated list. Just list the tags without any other text.`;
      const tagsResponse = await geminiGenerate(tagsPrompt);
      tags = tagsResponse
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0 && tag.length < 50)
        .slice(0, 5);
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
      summary: `Unable to generate overview for ${companyName}`,
      history: `Unable to generate history for ${companyName}`,
      leadership: `Unable to generate leadership information for ${companyName}`,
      tags: [`${companyName}`, 'company', 'business']
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

// Main research orchestration function
export const runResearch = async (
  companyName: string,
  onSourceFound?: (source: WebSource) => void
): Promise<ResearchResult> => {
  try {
    // Run all agents in parallel for better performance
    const [overview, financial, market, competitors, investment] = await Promise.all([
      companyOverviewAgent(companyName, onSourceFound),
      financialAnalysisAgent(companyName, onSourceFound),
      marketResearchAgent(companyName, onSourceFound),
      competitiveIntelligenceAgent(companyName, onSourceFound),
      investmentAnalysisAgent(companyName, onSourceFound)
    ]);
    
    return {
      companyName,
      overview,
      financial,
      market,
      competitors,
      investment,
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
