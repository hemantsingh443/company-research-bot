// Get API keys from environment variables
const GOOGLE_SEARCH_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const GOOGLE_SEARCH_ENGINE_ID = import.meta.env.VITE_GOOGLE_CSE_ID;

// Validate API keys
if (!GOOGLE_SEARCH_API_KEY) {
  throw new Error('VITE_GOOGLE_API_KEY is not set in environment variables');
}
if (!GOOGLE_SEARCH_ENGINE_ID) {
  throw new Error('VITE_GOOGLE_CSE_ID is not set in environment variables');
}

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
    
    // Note: In a production app, this would be done server-side to protect API key
    const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_SEARCH_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}`;
    
    console.log(`Making request to: ${url.replace(GOOGLE_SEARCH_API_KEY, '[REDACTED]')}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Search API error:', response.status, response.statusText);
      console.error('Error details:', errorText);
      return `Unable to get latest information. Error: ${response.status} ${response.statusText}. Using AI knowledge instead.`;
    }
    
    const data: GoogleSearchResponse = await response.json();
    console.log('Search response received:', data.items ? `${data.items.length} results` : 'No results');
    
    if (!data.items || data.items.length === 0) {
      return `No search results found for ${query}. Using AI knowledge instead.`;
    }
    
    // Compile the search results
    const results = data.items.slice(0, 5).map(item => {
      return `
Title: ${item.title}
URL: ${item.link}
Summary: ${item.snippet}
      `;
    }).join('\n---\n');
    
    return results;
  } catch (error) {
    console.error('Error searching the web:', error);
    // Return a more informative error message
    return `Web search error: ${error instanceof Error ? error.message : 'Unknown error'}. Using AI knowledge instead.`;
  }
};
