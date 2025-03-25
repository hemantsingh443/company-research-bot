// Get API key and CSE ID from environment variables or localStorage
const getGoogleApiKey = () => {
  try {
    // First check for user-provided key
    const userKey = localStorage.getItem('user_google_key');
    console.log('Checking localStorage for Google API key...');
    console.log('localStorage access successful:', !!userKey);
    
    if (userKey) {
      console.log('User key found in localStorage:', {
        length: userKey.length,
        isEmpty: userKey.trim() === '',
        firstChars: userKey.substring(0, 4)
      });
      
      if (userKey.trim() !== '') {
        console.log('Using user-provided Google API key:', userKey.substring(0, 4) + '...');
        return userKey;
      } else {
        console.log('User key is empty or whitespace only');
      }
    } else {
      console.log('No user key found in localStorage');
    }
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    console.log('localStorage error details:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
  
  // Fall back to environment variable
  const envKey = import.meta.env.VITE_GOOGLE_API_KEY;
  console.log('Checking environment variable...');
  console.log('Environment key status:', {
    exists: !!envKey,
    isEmpty: envKey ? envKey.trim() === '' : true
  });
  
  if (envKey && envKey.trim() !== '') {
    console.log('Using environment variable Google API key:', envKey.substring(0, 4) + '...');
    return envKey;
  }
  
  console.log('No valid Google API key found in either localStorage or environment variables');
  return null;
};

const getGoogleCseId = () => {
  try {
    // First check for user-provided CSE ID
    const userCseId = localStorage.getItem('user_google_cse_id');
    if (userCseId && userCseId.trim() !== '') {
      console.log('Using user-provided Google CSE ID:', userCseId.substring(0, 4) + '...');
      return userCseId;
    }
  } catch (error) {
    console.warn('Error accessing localStorage:', error);
  }
  
  // Fall back to environment variable
  const envCseId = import.meta.env.VITE_GOOGLE_CSE_ID;
  if (envCseId && envCseId.trim() !== '') {
    console.log('Using environment variable Google CSE ID:', envCseId.substring(0, 4) + '...');
    return envCseId;
  }
  
  console.log('No Google CSE ID found');
  return null;
};

// Validate API key and CSE ID
const validateGoogleConfig = () => {
  const apiKey = getGoogleApiKey();
  const cseId = getGoogleCseId();
  
  if (!apiKey) {
    throw new Error('No Google API key found. Please add your API key in settings.');
  }
  if (!cseId) {
    throw new Error('No Google Custom Search Engine ID found. Please add your CSE ID in settings.');
  }
  
  return { apiKey, cseId };
};

interface GoogleSearchResponse {
  items?: {
    title: string;
    link: string;
    snippet: string;
  }[];
}

export const searchWeb = async (query: string): Promise<string> => {
  try {
    console.log(`Searching web for: ${query}`);
    
    const { apiKey, cseId } = validateGoogleConfig();
    
    // Log key details (safely)
    console.log('API Configuration:', {
      keyExists: !!apiKey,
      keyLength: apiKey?.length,
      keyFirstChars: apiKey?.substring(0, 4),
      cseIdExists: !!cseId,
      cseIdLength: cseId?.length,
      isUserKey: !!localStorage.getItem('user_google_key')
    });
    
    // Add site: operator to focus on major business and financial sites
    const majorSites = [
      'reuters.com',
      'bloomberg.com',
      'forbes.com',
      'cnbc.com',
      'wsj.com',
      'ft.com',
      'yahoo.com/finance',
      'marketwatch.com',
      'businesswire.com',
      'prnewswire.com',
      'sec.gov',
      'linkedin.com/company'
    ];
    
    // Create a site-specific query
    const siteQuery = majorSites.map(site => `site:${site}`).join(' OR ');
    const enhancedQuery = `${query} (${siteQuery})`;
    
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(enhancedQuery)}`;
    
    // Log request details (without sensitive info)
    console.log('Making request with:', {
      queryLength: query.length,
      enhancedQueryLength: enhancedQuery.length,
      endpoint: 'customsearch/v1',
      urlLength: url.length
    });
    
    const response = await fetch(url);
    
    // Log response details
    console.log('Response received:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google Search API error details:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        headers: Object.fromEntries(response.headers.entries())
      });

      // Handle rate limit error
      if (response.status === 429) {
        const quotaLimit = errorData.error?.details?.[0]?.metadata?.quota_limit_value || '100';
        const message = `You've hit the daily quota limit (${quotaLimit} queries) for the Google Search API. ` +
          (!!localStorage.getItem('user_google_key')
            ? 'Please try again tomorrow or consider upgrading your quota in the Google Cloud Console.'
            : 'Please add your own API key in settings to use your own quota.');
        throw new Error(message);
      }

      // Handle authentication errors
      if (response.status === 401 || response.status === 403) {
        throw new Error(`Google Search API authentication error: ${errorData.error?.message || 'Invalid API key'}. Please check your API key in settings.`);
      }

      // Handle other API errors
      throw new Error(`Google Search API error: ${errorData.error?.message || response.statusText}`);
    }

    const data: GoogleSearchResponse = await response.json();
    
    // Log response data summary
    console.log('Search results summary:', {
      totalResults: data.items?.length || 0,
      hasResults: !!data.items && data.items.length > 0
    });
    
    if (!data.items || data.items.length === 0) {
      console.log('No search results found');
      return 'No search results found. Please try a different search query.';
    }

    // Filter and process results to ensure they're from major sites
    const processedResults = data.items
      .filter(item => {
        const url = item.link.toLowerCase();
        return majorSites.some(site => url.includes(site));
      })
      .map(item => {
        const title = item.title || 'No title';
        const link = item.link || '#';
        const snippet = item.snippet || 'No description available';
        return `Title: ${title}\nURL: ${link}\nSummary: ${snippet}`;
      })
      .join('\n\n---\n\n');

    return processedResults || 'No results from major sources found. Please try a different search query.';
  } catch (error) {
    console.error('Error in searchWeb:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown error',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
};
