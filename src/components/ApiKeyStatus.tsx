import React from 'react';

interface ApiKeyStatusProps {
  apiKeys: {
    google: { valid: boolean; source: string };
    gemini: { valid: boolean; source: string };
    alphaVantage: { valid: boolean; source: string };
  };
}

export const ApiKeyStatus: React.FC<ApiKeyStatusProps> = ({ apiKeys }) => {
  const getStatusText = (status: { valid: boolean; source: string }) => {
    if (!status.valid) return 'Not configured';
    return status.source === 'User Key' ? 'Using your API key' : 'Using environment variable';
  };

  const getStatusColor = (status: { valid: boolean; source: string }) => {
    if (!status.valid) return 'text-red-500';
    return status.source === 'User Key' ? 'text-green-500' : 'text-blue-500';
  };

  return (
    <div className="space-y-2 p-4 rounded-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <h3 className="font-semibold mb-4">API Key Status:</h3>
      <div className="space-y-2">
        <div className="flex items-baseline">
          <span className="w-32">Google Search:</span>
          <span className={getStatusColor(apiKeys.google)}>
            {getStatusText(apiKeys.google)}
          </span>
        </div>
        <div className="flex items-baseline">
          <span className="w-32">Gemini:</span>
          <span className={getStatusColor(apiKeys.gemini)}>
            {getStatusText(apiKeys.gemini)}
          </span>
        </div>
        <div className="flex items-baseline">
          <span className="w-32">Alpha Vantage:</span>
          <span className={getStatusColor(apiKeys.alphaVantage)}>
            {getStatusText(apiKeys.alphaVantage)}
          </span>
        </div>
      </div>
    </div>
  );
}; 