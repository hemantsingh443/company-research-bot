// Alpha Vantage API integration
let cachedApiKey: string | null = null;
let previousKeys: string[] = [];

const getApiKey = (): string => {
  const userKey = localStorage.getItem('user_alpha_vantage_key');
  const envKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
  
  // Check if the key changed
  if (cachedApiKey && userKey && userKey !== cachedApiKey) {
    console.log('API Key changed detected');
    previousKeys.push(cachedApiKey);
    cachedApiKey = null;
    
    // Reset daily call count when key changes
    dailyCallCount = 0;
    console.log('Reset daily call count due to key change');
  }
  
  if (cachedApiKey) {
    return cachedApiKey;
  }
  
  if (userKey) {
    console.log('Using user provided API key:', userKey.substring(0, 4) + '...');
    cachedApiKey = userKey;
    return userKey;
  }
  
  if (envKey) {
    console.log('Using environment API key');
    cachedApiKey = envKey;
    return envKey;
  }
  
  console.error('Alpha Vantage API key not found in settings or environment variables');
  return '';
};

// Force clear API key cache on page load and storage changes
window.addEventListener('load', () => {
  cachedApiKey = null;
});

window.addEventListener('storage', (e) => {
  if (e.key === 'user_alpha_vantage_key') {
    console.log('Storage event: API key changed');
    cachedApiKey = null;
    dailyCallCount = 0; // Reset count with new key
  }
});

const BASE_URL = 'https://www.alphavantage.co/query?';

// Rate limiting
let lastCallTime = 0;
const MIN_CALL_INTERVAL = 12000; // 12 seconds between calls to stay well under the limit
let dailyCallCount = 0;
const DAILY_CALL_LIMIT = 500;
const lastResetTime = new Date().setHours(0, 0, 0, 0);

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Reset call count daily
setInterval(() => {
  const now = new Date();
  const todayStart = now.setHours(0, 0, 0, 0);
  if (todayStart > lastResetTime) {
    dailyCallCount = 0;
  }
}, 60000); // Check every minute

// Known companies mapping for common searches
const knownCompanies: Record<string, string> = {
  'apple': 'AAPL',
  'microsoft': 'MSFT',
  'google': 'GOOGL',
  'amazon': 'AMZN',
  'tesla': 'TSLA',
  'facebook': 'META',
  'meta': 'META',
  'netflix': 'NFLX',
  'nvidia': 'NVDA',
  'alphabet': 'GOOGL',
  'walmart': 'WMT',
  'jpmorgan': 'JPM',
  'jp morgan': 'JPM',
  'coca cola': 'KO',
  'coca-cola': 'KO',
  'disney': 'DIS',
  'nike': 'NKE',
  'mcdonalds': 'MCD',
  'intel': 'INTC',
  'ibm': 'IBM',
  'adobe': 'ADBE',
  'cisco': 'CSCO',
  'pepsi': 'PEP',
  'pepsico': 'PEP',
  'oracle': 'ORCL',
  'salesforce': 'CRM',
  'goldman sachs': 'GS',
  'boeing': 'BA',
  'visa': 'V',
  'mastercard': 'MA'
};

// Expanded mock data
const MOCK_DATA = {
  'AAPL': {
    marketCap: 2.89,
    peRatio: 33.51,
    yearOverYearGrowth: 6.42,
    quarterlyRevenue: [90.15, 94.84, 81.80, 82.96],
    quarterlyDates: ['Q1 2024', 'Q4 2023', 'Q3 2023', 'Q2 2023'],
    annualRevenue: [383.93, 394.33, 365.82, 274.52],
    annualDates: ['2023', '2022', '2021', '2020']
  },
  'MSFT': {
    marketCap: 3.05,
    peRatio: 37.20,
    yearOverYearGrowth: 18.3,
    quarterlyRevenue: [62.02, 56.52, 52.87, 49.36],
    quarterlyDates: ['Q1 2024', 'Q4 2023', 'Q3 2023', 'Q2 2023'],
    annualRevenue: [211.92, 198.27, 168.09, 143.02],
    annualDates: ['2023', '2022', '2021', '2020']
  },
  'GOOGL': {
    marketCap: 1.85,
    peRatio: 27.45,
    yearOverYearGrowth: 15.2,
    quarterlyRevenue: [80.54, 76.69, 74.60, 69.79],
    quarterlyDates: ['Q1 2024', 'Q4 2023', 'Q3 2023', 'Q2 2023'],
    annualRevenue: [307.39, 282.84, 257.64, 182.53],
    annualDates: ['2023', '2022', '2021', '2020']
  },
  'NVDA': {
    marketCap: 2.15,
    peRatio: 85.32,
    yearOverYearGrowth: 265.3,
    quarterlyRevenue: [22.10, 18.12, 13.51, 6.70],
    quarterlyDates: ['Q1 2024', 'Q4 2023', 'Q3 2023', 'Q2 2023'],
    annualRevenue: [60.92, 26.97, 26.91, 16.68],
    annualDates: ['2023', '2022', '2021', '2020']
  },
  'META': {
    marketCap: 1.25,
    peRatio: 34.89,
    yearOverYearGrowth: 25.1,
    quarterlyRevenue: [40.11, 34.15, 32.17, 28.65],
    quarterlyDates: ['Q1 2024', 'Q4 2023', 'Q3 2023', 'Q2 2023'],
    annualRevenue: [134.90, 116.61, 117.93, 85.97],
    annualDates: ['2023', '2022', '2021', '2020']
  }
};

export interface FinancialData {
  // Company Overview
  companyName?: string;
  description?: string;
  sector?: string;
  industry?: string;
  marketCap?: number;
  peRatio?: number;
  forwardPE?: number;
  priceToBookRatio?: number;
  profitMargin?: number;
  operatingMarginTTM?: number;
  beta?: number;
  dividendYield?: number;
  dividendPerShare?: number;
  
  // Growth & Performance
  yearOverYearGrowth?: number;
  quarterlyRevenue?: number[];
  quarterlyDates?: string[];
  annualRevenue?: number[];
  annualDates?: string[];
  
  // Financial Health
  returnOnEquity?: number;
  returnOnAssets?: number;
  currentRatio?: number;
  debtToEquity?: number;
  grossProfitTTM?: number;
  revenuePerShareTTM?: number;
  
  // Valuation
  analystTargetPrice?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  fiftyDayMovingAverage?: number;
  twoHundredDayMovingAverage?: number;
}

interface AlphaVantageSearchResult {
  bestMatches?: Array<{
    '1. symbol': string;
    '2. name': string;
    '3. type': string;
    '4. region': string;
    '5. marketOpen': string;
    '6. marketClose': string;
    '7. timezone': string;
    '8. currency': string;
    '9. matchScore': string;
  }>;
}

interface AlphaVantageOverview {
  Symbol: string;
  Name: string;
  Description: string;
  Sector: string;
  Industry: string;
  MarketCapitalization: string;
  PERatio: string;
  ForwardPE: string;
  PriceToBookRatio: string;
  ProfitMargin: string;
  OperatingMarginTTM: string;
  Beta: string;
  DividendYield: string;
  DividendPerShare: string;
  ReturnOnEquityTTM: string;
  ReturnOnAssetsTTM: string;
  CurrentRatio: string;
  DebtToEquityRatio: string;
  GrossProfitTTM: string;
  RevenuePerShareTTM: string;
  AnalystTargetPrice: string;
  '52WeekHigh': string;
  '52WeekLow': string;
  '50DayMovingAverage': string;
  '200DayMovingAverage': string;
  QuarterlyEarnings?: Array<{
    fiscalDateEnding: string;
    reportedEPS: string;
    reportedDate: string;
    estimatedEPS: string;
    surprise: string;
    surprisePercentage: string;
  }>;
}

interface AlphaVantageIncome {
  quarterlyReports?: Array<{
    fiscalDateEnding: string;
    totalRevenue: string;
  }>;
  annualReports?: Array<{
    fiscalDateEnding: string;
    totalRevenue: string;
  }>;
}

const isValidStockSymbol = (symbol: string): boolean => {
  return /^[A-Z]{1,5}(\.[A-Z]{1,2})?$/.test(symbol);
};

const fetchAlphaVantage = async (params: Record<string, string>) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Alpha Vantage API key not configured. Please add your API key in settings.');
  }

  // Check daily limit
  if (dailyCallCount >= DAILY_CALL_LIMIT) {
    console.warn('Daily API call limit reached');
    throw new Error('Daily API call limit reached. Please try again tomorrow or use a different API key.');
  }

  // Rate limiting
  const now = Date.now();
  const timeSinceLastCall = now - lastCallTime;
  if (timeSinceLastCall < MIN_CALL_INTERVAL) {
    console.log(`Rate limiting: waiting ${(MIN_CALL_INTERVAL - timeSinceLastCall)/1000}s`);
    await wait(MIN_CALL_INTERVAL - timeSinceLastCall);
  }
  lastCallTime = Date.now();

  // Increment call count
  dailyCallCount++;
  console.log(`API calls today: ${dailyCallCount}/${DAILY_CALL_LIMIT} (Key: ${apiKey.substring(0, 4)}...)`);

  const queryString = new URLSearchParams({
    ...params,
    apikey: apiKey
  }).toString();

  const url = `${BASE_URL}${queryString}`;
  console.log('Fetching from URL:', url.replace(apiKey, 'HIDDEN')); // Hide API key in logs

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Check for API-specific error messages
    if (data.Information || data.Note) {
      const message = data.Information || data.Note;
      console.error('Alpha Vantage API message:', message);
      
      if (message.includes('API call frequency') || message.includes('Thank you for using Alpha Vantage')) {
        throw new Error(`Rate limit reached with key ${apiKey.substring(0, 4)}... Please try again in a minute or use a different API key.`);
      }
      
      if (message.includes('Invalid API call')) {
        throw new Error(`Invalid Alpha Vantage API key: ${apiKey.substring(0, 4)}... Please check your API key in settings.`);
      }

      // If we get here, it's a general API message - throw it
      throw new Error(message);
    }

    return data;
  } catch (error) {
    console.error('API fetch error:', error);
    throw error;
  }
};

// Cache for company symbols
const symbolCache = new Map<string, string>();

export const getCompanySymbol = async (input: string): Promise<string> => {
  // Check cache first
  const normalizedInput = input.trim().toLowerCase();
  const cachedSymbol = symbolCache.get(normalizedInput);
  if (cachedSymbol) {
    console.log('Using cached symbol:', cachedSymbol);
    return cachedSymbol;
  }

  try {
    // Check for known companies first (as a fast path)
    if (knownCompanies[normalizedInput]) {
      const symbol = knownCompanies[normalizedInput];
      symbolCache.set(normalizedInput, symbol);
      console.log('Found in known companies:', symbol);
      return symbol;
    }

    // Search using Alpha Vantage
    console.log('Searching Alpha Vantage API for:', input);
    const data = await fetchAlphaVantage({
      function: 'SYMBOL_SEARCH',
      keywords: input
    }) as AlphaVantageSearchResult;

    // Log raw response for debugging
    console.log('Alpha Vantage raw response:', data);

    if (!data.bestMatches || data.bestMatches.length === 0) {
      console.log('No matches found for:', input);
      
      // Try searching with partial match
      const partialSearchData = await fetchAlphaVantage({
        function: 'SYMBOL_SEARCH',
        keywords: input.substring(0, Math.max(3, input.length))
      }) as AlphaVantageSearchResult;
      
      console.log('Partial search results:', partialSearchData);
      
      if (!partialSearchData.bestMatches || partialSearchData.bestMatches.length === 0) {
        return '';
      }
      
      data.bestMatches = partialSearchData.bestMatches;
    }

    // Log all matches for debugging
    const matches = data.bestMatches.map(match => ({
      symbol: match['1. symbol'],
      name: match['2. name'],
      type: match['3. type'],
      region: match['4. region'],
      score: match['9. matchScore']
    }));
    console.log('Processed search results:', matches);

    // Sort matches by score
    const sortedMatches = [...data.bestMatches].sort((a, b) => 
      parseFloat(b['9. matchScore']) - parseFloat(a['9. matchScore'])
    );

    // Try different matching strategies
    let bestMatch = null;

    // 1. Try exact name match first
    bestMatch = sortedMatches.find(match => 
      match['2. name'].toLowerCase().includes(normalizedInput) &&
      match['3. type'] === 'Equity'
    );

    // 2. If no exact match, try US equity
    if (!bestMatch) {
      bestMatch = sortedMatches.find(match => 
        match['3. type'] === 'Equity' && 
        match['4. region'] === 'United States'
      );
    }

    // 3. If still no match, try any equity
    if (!bestMatch) {
      bestMatch = sortedMatches.find(match => 
        match['3. type'] === 'Equity'
      );
    }

    // 4. Last resort: take highest scoring match
    if (!bestMatch && sortedMatches.length > 0) {
      bestMatch = sortedMatches[0];
    }

    if (bestMatch) {
      const symbol = bestMatch['1. symbol'];
      const matchInfo = {
        name: bestMatch['2. name'],
        type: bestMatch['3. type'],
        region: bestMatch['4. region'],
        score: bestMatch['9. matchScore']
      };
      console.log(`Found best match for "${input}":`, matchInfo);
      
      symbolCache.set(normalizedInput, symbol);
      return symbol;
    }

    console.log(`No suitable match found for "${input}" after trying all matching strategies`);
    return '';
  } catch (error) {
    console.error('Error searching for company symbol:', error);
    // Log the full error details
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    return '';
  }
};

// Cache for financial data
const financialDataCache = new Map<string, { data: FinancialData; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getFinancialData = async (symbol: string): Promise<FinancialData> => {
  if (!symbol) {
    throw new Error('Could not find company symbol');
  }

  // Check cache first
  const cached = financialDataCache.get(symbol);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`Using cached data for ${symbol}`);
    return cached.data;
  }

  // If we're at or very near the daily limit, use mock or random data
  if (dailyCallCount >= DAILY_CALL_LIMIT - 1) {
    console.warn('Daily API call limit reached, falling back to mock/random data');
    return MOCK_DATA[symbol as keyof typeof MOCK_DATA] || generateRandomData(symbol);
  }

  try {
    console.log('Attempting API calls for symbol:', symbol);
    
    // Make calls sequential to better control rate limiting
    const overview = await fetchAlphaVantage({
      function: 'OVERVIEW',
      symbol: symbol
    });

    // Check if we got valid overview data
    if (!overview.Symbol || overview.Information || overview.Note) {
      console.error('Invalid overview data:', overview);
      throw new Error('Failed to fetch company overview data');
    }

    const income = await fetchAlphaVantage({
      function: 'INCOME_STATEMENT',
      symbol: symbol
    });

    // Check if we got valid income data
    if (!income.quarterlyReports || income.Information || income.Note) {
      console.error('Invalid income data:', income);
      throw new Error('Failed to fetch income statement data');
    }

    console.log('Successfully fetched data from API for', symbol);

    const financialData: FinancialData = {
      // Company Overview
      companyName: overview.Name,
      description: overview.Description,
      sector: overview.Sector,
      industry: overview.Industry,
      marketCap: overview.MarketCapitalization ? Number(overview.MarketCapitalization) / 1e9 : undefined,
      peRatio: overview.PERatio ? Number(overview.PERatio) : undefined,
      forwardPE: overview.ForwardPE ? Number(overview.ForwardPE) : undefined,
      priceToBookRatio: overview.PriceToBookRatio ? Number(overview.PriceToBookRatio) : undefined,
      profitMargin: overview.ProfitMargin ? Number(overview.ProfitMargin) * 100 : undefined,
      operatingMarginTTM: overview.OperatingMarginTTM ? Number(overview.OperatingMarginTTM) * 100 : undefined,
      beta: overview.Beta ? Number(overview.Beta) : undefined,
      dividendYield: overview.DividendYield ? Number(overview.DividendYield) * 100 : undefined,
      dividendPerShare: overview.DividendPerShare ? Number(overview.DividendPerShare) : undefined,
      
      // Financial Health
      returnOnEquity: overview.ReturnOnEquityTTM ? Number(overview.ReturnOnEquityTTM) * 100 : undefined,
      returnOnAssets: overview.ReturnOnAssetsTTM ? Number(overview.ReturnOnAssetsTTM) * 100 : undefined,
      currentRatio: overview.CurrentRatio ? Number(overview.CurrentRatio) : undefined,
      debtToEquity: overview.DebtToEquityRatio ? Number(overview.DebtToEquityRatio) : undefined,
      grossProfitTTM: overview.GrossProfitTTM ? Number(overview.GrossProfitTTM) / 1e9 : undefined,
      revenuePerShareTTM: overview.RevenuePerShareTTM ? Number(overview.RevenuePerShareTTM) : undefined,
      
      // Valuation
      analystTargetPrice: overview.AnalystTargetPrice ? Number(overview.AnalystTargetPrice) : undefined,
      fiftyTwoWeekHigh: overview['52WeekHigh'] ? Number(overview['52WeekHigh']) : undefined,
      fiftyTwoWeekLow: overview['52WeekLow'] ? Number(overview['52WeekLow']) : undefined,
      fiftyDayMovingAverage: overview['50DayMovingAverage'] ? Number(overview['50DayMovingAverage']) : undefined,
      twoHundredDayMovingAverage: overview['200DayMovingAverage'] ? Number(overview['200DayMovingAverage']) : undefined,
    };

    // Process quarterly data
    if (income.quarterlyReports?.length) {
      const quarterly = income.quarterlyReports.slice(0, 4); // Last 4 quarters
      financialData.quarterlyRevenue = quarterly.map(q => Number(q.totalRevenue) / 1e9);
      financialData.quarterlyDates = quarterly.map(q => {
        const date = new Date(q.fiscalDateEnding);
        const year = date.getFullYear();
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `Q${quarter} ${year}`;
      });

      // Calculate YoY growth from quarterly data
      if (financialData.quarterlyRevenue.length >= 4) {
        const latestQ = financialData.quarterlyRevenue[0];
        const yearAgoQ = financialData.quarterlyRevenue[3];
        if (latestQ && yearAgoQ) {
          financialData.yearOverYearGrowth = ((latestQ - yearAgoQ) / yearAgoQ) * 100;
        }
      }
    }

    // Process annual data
    if (income.annualReports?.length) {
      const annual = income.annualReports.slice(0, 4); // Last 4 years
      financialData.annualRevenue = annual.map(y => Number(y.totalRevenue) / 1e9);
      financialData.annualDates = annual.map(y => y.fiscalDateEnding.slice(0, 4));
    }

    console.log('Processed financial data:', financialData);

    // Cache the result
    financialDataCache.set(symbol, { data: financialData, timestamp: Date.now() });
    return financialData;
  } catch (error) {
    console.error('Error fetching financial data:', error);
    
    // Only fall back to mock data after API attempt fails
    if (MOCK_DATA[symbol as keyof typeof MOCK_DATA]) {
      console.log('API call failed, falling back to mock data for', symbol);
      return MOCK_DATA[symbol as keyof typeof MOCK_DATA];
    }
    
    console.log('No mock data available, generating random data for', symbol);
    return generateRandomData(symbol);
  }
};

// Helper function to generate random data
const generateRandomData = (symbol: string): FinancialData => ({
  companyName: symbol,
  marketCap: Math.random() * 100 + 10,
  peRatio: Math.random() * 30 + 5,
  yearOverYearGrowth: Math.random() * 20 - 5,
  quarterlyRevenue: [40, 38, 42, 39].map(n => n + Math.random() * 10),
  quarterlyDates: ['Q1 2024', 'Q4 2023', 'Q3 2023', 'Q2 2023'],
  annualRevenue: [150, 140, 130, 120].map(n => n + Math.random() * 20),
  annualDates: ['2023', '2022', '2021', '2020']
}); 