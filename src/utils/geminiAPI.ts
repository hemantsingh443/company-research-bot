// Get API key from environment variables or localStorage
const getGeminiApiKey = () => {
  const userKey = localStorage.getItem('user_gemini_key');
  if (userKey) {
    return userKey;
  }
  return import.meta.env.VITE_GEMINI_API_KEY;
};

// Updated API URL to use the latest endpoint
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-lite:generateContent';

// Validate API key
const validateApiKey = () => {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('No Gemini API key found. Please add your API key in settings.');
  }
  return apiKey;
};

export interface GeminiRequest {
  contents: {
    role: string;
    parts: {
      text: string;
    }[];
  }[];
  generationConfig: {
    temperature: number;
    topK: number;
    topP: number;
    maxOutputTokens: number;
    stopSequences?: string[];
  };
  safetySettings: {
    category: string;
    threshold: string;
  }[];
}

export interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
    finishReason: string;
    safetyRatings: {
      category: string;
      probability: string;
    }[];
  }[];
  promptFeedback: {
    safetyRatings: {
      category: string;
      probability: string;
    }[];
  };
}

export const geminiGenerate = async (prompt: string): Promise<string> => {
  try {
    console.log(`Generating content with Gemini. Prompt length: ${prompt.length} characters`);
    const apiKey = validateApiKey();
    const url = `${GEMINI_API_URL}?key=${apiKey}`;
    
    const request: GeminiRequest = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        }
      ]
    };

    console.log('Sending request to Gemini API...');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    console.log('Response received from Gemini API');
    const data: GeminiResponse = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response generated from Gemini');
    }

    const resultText = data.candidates[0].content.parts[0].text;
    console.log(`Generated content length: ${resultText.length} characters`);
    return resultText;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
};
