import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from './ui/badge';
import { toast } from './ui/use-toast';

interface SettingsProps {
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const [settings, setSettings] = useState({
    googleApiKey: localStorage.getItem('user_google_key') || '',
    googleCseId: localStorage.getItem('user_google_cse_id') || '',
    geminiApiKey: localStorage.getItem('user_gemini_key') || '',
    alphaVantageApiKey: localStorage.getItem('user_alpha_vantage_key') || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [apiStatus, setApiStatus] = useState({
    gemini: { valid: false, source: '' },
    google: { valid: false, source: '' },
    alphaVantage: { valid: false, source: '' }
  });

  // Check if environment variables are available
  const hasEnvVars = {
    google: Boolean(import.meta.env.VITE_GOOGLE_API_KEY),
    gemini: Boolean(import.meta.env.VITE_GEMINI_API_KEY),
    alphaVantage: Boolean(import.meta.env.VITE_ALPHA_VANTAGE_API_KEY)
  };

  useEffect(() => {
    // Load saved keys from localStorage
    const savedGeminiKey = localStorage.getItem('user_gemini_key');
    const savedGoogleKey = localStorage.getItem('user_google_key');
    const savedGoogleCseId = localStorage.getItem('user_google_cse_id');
    const savedAlphaVantageKey = localStorage.getItem('user_alpha_vantage_key');

    if (savedGeminiKey) setSettings(prev => ({ ...prev, geminiApiKey: savedGeminiKey }));
    if (savedGoogleKey) setSettings(prev => ({ ...prev, googleApiKey: savedGoogleKey }));
    if (savedGoogleCseId) setSettings(prev => ({ ...prev, googleCseId: savedGoogleCseId }));
    if (savedAlphaVantageKey) setSettings(prev => ({ ...prev, alphaVantageApiKey: savedAlphaVantageKey }));

    // Update initial API status
    setApiStatus({
      gemini: { 
        valid: !!(savedGeminiKey || hasEnvVars.gemini), 
        source: savedGeminiKey ? 'User Key' : hasEnvVars.gemini ? 'Environment' : 'Not Set'
      },
      google: { 
        valid: !!(savedGoogleKey || hasEnvVars.google), 
        source: savedGoogleKey ? 'User Key' : hasEnvVars.google ? 'Environment' : 'Not Set'
      },
      alphaVantage: { 
        valid: !!(savedAlphaVantageKey || hasEnvVars.alphaVantage), 
        source: savedAlphaVantageKey ? 'User Key' : hasEnvVars.alphaVantage ? 'Environment' : 'Not Set'
      }
    });

    // Log environment variable status for debugging
    console.log('Environment variables status:', {
      google: hasEnvVars.google ? 'Present' : 'Missing',
      gemini: hasEnvVars.gemini ? 'Present' : 'Missing',
      alphaVantage: hasEnvVars.alphaVantage ? 'Present' : 'Missing'
    });
  }, []);

  const handleSave = () => {
    // Save values to localStorage
    if (settings.googleApiKey) {
      localStorage.setItem('user_google_key', settings.googleApiKey);
    } else {
      localStorage.removeItem('user_google_key');
    }
    
    if (settings.googleCseId) {
      localStorage.setItem('user_google_cse_id', settings.googleCseId);
    } else {
      localStorage.removeItem('user_google_cse_id');
    }
    
    if (settings.geminiApiKey) {
      localStorage.setItem('user_gemini_key', settings.geminiApiKey);
    } else {
      localStorage.removeItem('user_gemini_key');
    }
    
    if (settings.alphaVantageApiKey) {
      localStorage.setItem('user_alpha_vantage_key', settings.alphaVantageApiKey);
    } else {
      localStorage.removeItem('user_alpha_vantage_key');
    }
    
    // Trigger manual reset for caches
    window.dispatchEvent(new Event('alphavantage_reset'));
    
    // Force refresh other components watching localStorage
    window.dispatchEvent(new Event('storage'));
    
    // Show success message
    setIsSaving(false);
    setShowSuccess(true);
    toast({
      description: "Settings saved. API keys will be used for future requests.",
    });
  };

  const renderApiStatus = (api: 'gemini' | 'google' | 'alphaVantage') => {
    const status = apiStatus[api];
    const envVar = hasEnvVars[api];
    
    return (
      <div className="flex items-center space-x-2 mt-1">
        {status.valid ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" />
        )}
        <Badge 
          variant={status.valid ? "success" : "destructive"} 
          className="text-xs"
        >
          {status.source}
        </Badge>
        {envVar && !settings[`${api}ApiKey`] && (
          <Badge variant="secondary" className="text-xs">
            ENV Available
          </Badge>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>API Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <Label htmlFor="geminiApiKey">Gemini API Key</Label>
                {renderApiStatus('gemini')}
              </div>
              <Input
                id="geminiApiKey"
                type="password"
                value={settings.geminiApiKey}
                onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                placeholder="Enter your Gemini API key"
              />
              <p className="text-sm text-muted-foreground">
                Get your API key from the{' '}
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google AI Studio
                </a>
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <Label htmlFor="googleApiKey">Google Search API Key</Label>
                {renderApiStatus('google')}
              </div>
              <Input
                id="googleApiKey"
                type="password"
                value={settings.googleApiKey}
                onChange={(e) => setSettings({ ...settings, googleApiKey: e.target.value })}
                placeholder="Enter your Google Search API key"
              />
              <p className="text-sm text-muted-foreground">
                Get your API key from the{' '}
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google Cloud Console
                </a>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="googleCseId">Google Custom Search Engine ID</Label>
              <Input
                id="googleCseId"
                type="text"
                value={settings.googleCseId}
                onChange={(e) => setSettings({ ...settings, googleCseId: e.target.value })}
                placeholder="Enter your Custom Search Engine ID"
              />
              <p className="text-sm text-muted-foreground">
                Get your CSE ID from the{' '}
                <a
                  href="https://programmablesearchengine.google.com/controlpanel/all"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google Programmable Search Engine
                </a>
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <Label htmlFor="alphaVantageApiKey">Alpha Vantage API Key</Label>
                {renderApiStatus('alphaVantage')}
              </div>
              <Input
                id="alphaVantageApiKey"
                type="password"
                value={settings.alphaVantageApiKey}
                onChange={(e) => setSettings({ ...settings, alphaVantageApiKey: e.target.value })}
                placeholder="Enter your Alpha Vantage API key"
              />
              <p className="text-sm text-muted-foreground">
                Get your API key from the{' '}
                <a
                  href="https://www.alphavantage.co/support/#api-key"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Alpha Vantage
                </a>
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </div>

            {showSuccess && (
              <Alert className="bg-green-500/15 text-green-500 border-green-500/50">
                <AlertDescription>Settings saved successfully!</AlertDescription>
              </Alert>
            )}

            {showError && (
              <Alert className="bg-destructive/15 text-destructive border-destructive/50">
                <AlertDescription>Failed to save settings. Please try again.</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings; 