import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2 } from 'lucide-react';

interface SettingsProps {
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const [settings, setSettings] = useState({
    googleApiKey: localStorage.getItem('user_google_key') || '',
    googleCseId: localStorage.getItem('user_google_cse_id') || '',
    geminiApiKey: localStorage.getItem('user_gemini_key') || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  // Check if environment variables are available
  const hasEnvVars = {
    google: !!import.meta.env.VITE_GOOGLE_API_KEY,
    gemini: !!import.meta.env.VITE_GEMINI_API_KEY
  };

  useEffect(() => {
    // Load saved keys from localStorage
    const savedGeminiKey = localStorage.getItem('user_gemini_key');
    const savedGoogleKey = localStorage.getItem('user_google_key');
    const savedGoogleCseId = localStorage.getItem('user_google_cse_id');

    if (savedGeminiKey) setSettings({ ...settings, geminiApiKey: savedGeminiKey });
    if (savedGoogleKey) setSettings({ ...settings, googleApiKey: savedGoogleKey });
    if (savedGoogleCseId) setSettings({ ...settings, googleCseId: savedGoogleCseId });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setShowSuccess(false);
    setShowError(false);

    try {
      // Save to localStorage
      localStorage.setItem('user_gemini_key', settings.geminiApiKey);
      localStorage.setItem('user_google_key', settings.googleApiKey);
      localStorage.setItem('user_google_cse_id', settings.googleCseId);

      // Test Gemini API key
      if (settings.geminiApiKey) {
        const testUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-lite:generateContent?key=${settings.geminiApiKey}`;
        const response = await fetch(testUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'Test' }] }],
            generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 10 }
          })
        });

        if (!response.ok) {
          throw new Error('Invalid Gemini API key');
        }
      }

      setShowSuccess(true);
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setShowError(true);
    } finally {
      setIsSaving(false);
    }
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
              <Label htmlFor="geminiApiKey">Gemini API Key</Label>
              <Input
                id="geminiApiKey"
                type="password"
                value={settings.geminiApiKey}
                onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                placeholder="Enter your Gemini API key"
              />
              <p className="text-sm text-muted-foreground">
                {hasEnvVars.gemini ? (
                  <>
                    Currently using environment variable. Enter your own key to override it.
                    Get your API key from the{' '}
                    <a
                      href="https://makersuite.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Google AI Studio
                    </a>
                  </>
                ) : (
                  <>
                    Get your API key from the{' '}
                    <a
                      href="https://makersuite.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Google AI Studio
                    </a>
                  </>
                )}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="googleApiKey">Google Search API Key</Label>
              <Input
                id="googleApiKey"
                type="password"
                value={settings.googleApiKey}
                onChange={(e) => setSettings({ ...settings, googleApiKey: e.target.value })}
                placeholder="Enter your Google Search API key"
              />
              <p className="text-sm text-muted-foreground">
                {hasEnvVars.google ? (
                  <>
                    Currently using environment variable. Enter your own key to override it.
                    Get your API key from the{' '}
                    <a
                      href="https://console.cloud.google.com/apis/credentials"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Google Cloud Console
                    </a>
                  </>
                ) : (
                  <>
                    Get your API key from the{' '}
                    <a
                      href="https://console.cloud.google.com/apis/credentials"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Google Cloud Console
                    </a>
                  </>
                )}
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
                {hasEnvVars.google ? (
                  <>
                    Currently using environment variable. Enter your own CSE ID to override it.
                    Get your CSE ID from the{' '}
                    <a
                      href="https://programmablesearchengine.google.com/controlpanel/all"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Google Programmable Search Engine
                    </a>
                  </>
                ) : (
                  <>
                    Get your CSE ID from the{' '}
                    <a
                      href="https://programmablesearchengine.google.com/controlpanel/all"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Google Programmable Search Engine
                    </a>
                  </>
                )}
              </p>
            </div>

            {showSuccess && (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">
                  Settings saved successfully!
                </AlertDescription>
              </Alert>
            )}

            {showError && (
              <Alert variant="destructive">
                <AlertDescription>
                  Error saving settings. Please check your API keys and try again.
                </AlertDescription>
              </Alert>
            )}

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
                  'Save Settings'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 