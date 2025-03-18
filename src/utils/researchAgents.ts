
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

// Company Overview Agent
const companyOverviewAgent = async (companyName: string): Promise<any> => {
  // Get latest information from Google Search
  const searchResults = await searchWeb(`${companyName} company overview history leadership latest news`);
  
  const prompt = `
    Act as a company research analyst. I need comprehensive information about ${companyName}.
    
    Here is the latest information from web searches:
    ${searchResults}
    
    Using the above information and your knowledge, provide:
    1. A detailed summary of ${companyName} (at least 3 paragraphs)
    2. Company history, covering founding, major milestones, and evolution (at least 2 paragraphs)
    3. Current leadership team and management structure (at least 1 paragraph)
    4. Five relevant tags/keywords that describe this company (e.g., technology, consumer goods, healthcare)
    
    Format your answer in simple text. Be factual, comprehensive, and detailed.
  `;
  
  const response = await geminiGenerate(prompt);
  
  // Parse the response
  let summary = '';
  let history = '';
  let leadership = '';
  let tags: string[] = [];
  
  const sections = response.split('\n\n');
  
  if (sections.length >= 1) summary = sections[0];
  if (sections.length >= 2) history = sections[1];
  if (sections.length >= 3) leadership = sections[2];
  
  // Extract tags - look for a line with commas or lists
  const tagsMatch = response.match(/tags|keywords:?\s*(.*?)(?:\n|$)/i);
  if (tagsMatch && tagsMatch[1]) {
    tags = tagsMatch[1].split(/,|\n/).map(tag => tag.trim()).filter(Boolean);
  }
  
  if (tags.length === 0) {
    // If no tags were found, generate some
    const tagsPrompt = `Given the company ${companyName}, provide exactly 5 relevant industry or category tags as a comma-separated list. Just list the tags without any other text.`;
    const tagsResponse = await geminiGenerate(tagsPrompt);
    tags = tagsResponse.split(',').map(tag => tag.trim()).filter(Boolean).slice(0, 5);
  }
  
  return {
    summary: summary || `Information about ${companyName}`,
    history: history || `History of ${companyName}`,
    leadership: leadership || `Leadership team of ${companyName}`,
    tags: tags.length ? tags : [`${companyName}`, 'company', 'business', 'organization', 'corporation'],
  };
};

// Financial Analysis Agent
const financialAnalysisAgent = async (companyName: string): Promise<any> => {
  const searchResults = await searchWeb(`${companyName} financial performance revenue profit earnings latest quarterly results`);
  
  const prompt = `
    Act as a financial analyst focusing on ${companyName}.
    
    Here is the latest financial information from web searches:
    ${searchResults}
    
    Using the above information and your knowledge, provide:
    1. A detailed analysis of ${companyName}'s financial performance over the past few years, including revenue trends, profitability, and growth rates. (2-3 paragraphs)
    2. A breakdown of key financial metrics (P/E ratio, EBITDA, debt-to-equity, etc.) and what they indicate about the company's financial health. (1-2 paragraphs)
    
    Format your answer in simple text. Be factual, analytical, and detailed. If the company is private and specific financial data isn't publicly available, note this and provide estimates or available information.
  `;
  
  const response = await geminiGenerate(prompt);
  
  const sections = response.split('\n\n');
  
  return {
    performance: sections[0] || `Financial performance analysis of ${companyName}`,
    metrics: sections.length > 1 ? sections.slice(1).join('\n\n') : `Key financial metrics for ${companyName}`,
  };
};

// Market Research Agent
const marketResearchAgent = async (companyName: string): Promise<any> => {
  const searchResults = await searchWeb(`${companyName} market share industry trends market position target customers`);
  
  const prompt = `
    Act as a market research analyst focusing on ${companyName}.
    
    Here is the latest market information from web searches:
    ${searchResults}
    
    Using the above information and your knowledge, provide:
    1. An analysis of ${companyName}'s current market position, including market share, target demographics, and geographical presence. (2 paragraphs)
    2. An overview of relevant market trends, industry developments, and how they might impact ${companyName}'s business in the near future. (2 paragraphs)
    
    Format your answer in simple text. Be factual, analytical, and detailed.
  `;
  
  const response = await geminiGenerate(prompt);
  
  const sections = response.split('\n\n');
  
  return {
    position: sections[0] || `Market position of ${companyName}`,
    trends: sections.length > 1 ? sections.slice(1).join('\n\n') : `Market trends affecting ${companyName}`,
  };
};

// Competitive Intelligence Agent
const competitiveIntelligenceAgent = async (companyName: string): Promise<any> => {
  const searchResults = await searchWeb(`${companyName} competitors comparison competitive advantage industry rivals`);
  
  const prompt = `
    Act as a competitive intelligence analyst focusing on ${companyName}.
    
    Here is the latest competitive information from web searches:
    ${searchResults}
    
    Using the above information and your knowledge, provide:
    1. A list of ${companyName}'s main competitors with a brief description of each. (1-2 paragraphs)
    2. A comparative analysis between ${companyName} and its competitors, highlighting strengths, weaknesses, and competitive advantages. (2 paragraphs)
    
    Format your answer in simple text. Be factual, analytical, and detailed.
  `;
  
  const response = await geminiGenerate(prompt);
  
  const sections = response.split('\n\n');
  
  return {
    main: sections[0] || `Main competitors of ${companyName}`,
    analysis: sections.length > 1 ? sections.slice(1).join('\n\n') : `Competitive analysis for ${companyName}`,
  };
};

// ROI Analysis Agent
const investmentAnalysisAgent = async (companyName: string): Promise<any> => {
  const searchResults = await searchWeb(`${companyName} investment potential stock performance risks opportunities growth forecast`);
  
  const prompt = `
    Act as an investment analyst focusing on ${companyName} from a potential investor's perspective.
    
    Here is the latest investment information from web searches:
    ${searchResults}
    
    Using the above information and your knowledge, provide:
    1. A detailed analysis of ${companyName} as an investment opportunity, including current valuation considerations and potential future performance. (2-3 paragraphs)
    2. A clear assessment of investment risks associated with ${companyName}. (1 paragraph)
    3. A discussion of potential investment opportunities or growth catalysts for ${companyName}. (1 paragraph)
    
    Format your answer in simple text. Be factual, balanced, and include both positive and negative aspects to give a fair assessment.
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
};

// Main research orchestration function
export const runResearch = async (companyName: string): Promise<ResearchResult> => {
  try {
    // For a real app, these would run in parallel
    const overview = await companyOverviewAgent(companyName);
    const financial = await financialAnalysisAgent(companyName);
    const market = await marketResearchAgent(companyName);
    const competitors = await competitiveIntelligenceAgent(companyName);
    const investment = await investmentAnalysisAgent(companyName);
    
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
    throw error;
  }
};
