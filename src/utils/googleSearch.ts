// Get API key and CSE ID from environment variables or localStorage
const getGoogleApiKey = () => {
  const userKey = localStorage.getItem('user_google_key');
  if (userKey) {
    return userKey;
  }
  return import.meta.env.VITE_GOOGLE_API_KEY;
};

const getGoogleCseId = () => {
  const userCseId = localStorage.getItem('user_google_cse_id');
  if (userCseId) {
    return userCseId;
  }
  return import.meta.env.VITE_GOOGLE_CSE_ID;
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
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(query)}`;
    
    // Log which API key is being used (user-provided or default)
    const isUserKey = localStorage.getItem('user_google_key') !== null;
    console.log(`Using ${isUserKey ? 'user-provided' : 'default'} Google Search API key`);
    
    console.log(`Making request to: ${url.replace(apiKey, '[REDACTED]')}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google Search API error:', response.status);
      console.error('Error details:', errorData);

      // Handle rate limit error
      if (response.status === 429) {
        const quotaLimit = errorData.error?.details?.[0]?.metadata?.quota_limit_value || '100';
        const message = `You've hit the daily quota limit (${quotaLimit} queries) for the Google Search API. ` +
          (isUserKey 
            ? 'Please try again tomorrow or consider upgrading your quota in the Google Cloud Console.'
            : 'Please add your own API key in settings to use your own quota.');
        throw new Error(message);
      }

      // Handle other API errors
      throw new Error(`Google Search API error: ${errorData.error?.message || response.statusText}`);
    }

    const data: GoogleSearchResponse = await response.json();
    
    if (!data.items || data.items.length === 0) {
      console.log('No search results found');
      return 'No search results found. Please try a different search query.';
    }

    // Safely process each item
    const processedResults = data.items.map(item => {
      const title = item.title || 'No title';
      const link = item.link || '#';
      const snippet = item.snippet || 'No description available';
      return `Title: ${title}\nURL: ${link}\nSummary: ${snippet}`;
    }).join('\n\n---\n\n');

    return processedResults;
  } catch (error) {
    console.error('Error in searchWeb:', error);
    throw error;
  }
};
