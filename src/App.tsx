import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ResearchDashboard from './components/ResearchDashboard';
import { Settings } from './components/Settings';
import { Button } from './components/ui/button';
import { Settings as SettingsIcon } from 'lucide-react';
import { ApiKeyStatus } from './components/ApiKeyStatus';

const queryClient = new QueryClient();

const App = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [apiStatus, setApiStatus] = useState({
    google: { valid: false, source: '' },
    gemini: { valid: false, source: '' },
    alphaVantage: { valid: false, source: '' }
  });

  useEffect(() => {
    const updateApiStatus = () => {
      const hasEnvVars = {
        google: !!import.meta.env.VITE_GOOGLE_API_KEY,
        gemini: !!import.meta.env.VITE_GEMINI_API_KEY,
        alphaVantage: !!import.meta.env.VITE_ALPHA_VANTAGE_API_KEY
      };

      const savedKeys = {
        google: localStorage.getItem('user_google_key'),
        gemini: localStorage.getItem('user_gemini_key'),
        alphaVantage: localStorage.getItem('user_alpha_vantage_key')
      };

      setApiStatus({
        google: { 
          valid: !!(savedKeys.google || hasEnvVars.google), 
          source: savedKeys.google ? 'User Key' : hasEnvVars.google ? 'Environment' : 'Not Set'
        },
        gemini: { 
          valid: !!(savedKeys.gemini || hasEnvVars.gemini), 
          source: savedKeys.gemini ? 'User Key' : hasEnvVars.gemini ? 'Environment' : 'Not Set'
        },
        alphaVantage: { 
          valid: !!(savedKeys.alphaVantage || hasEnvVars.alphaVantage), 
          source: savedKeys.alphaVantage ? 'User Key' : hasEnvVars.alphaVantage ? 'Environment' : 'Not Set'
        }
      });
    };

    // Update status initially
    updateApiStatus();

    // Listen for storage changes
    const handleStorageChange = () => {
      updateApiStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Company Research Bot</h1>
                <div className="flex items-center gap-4">
                  <ApiKeyStatus apiKeys={apiStatus} />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowSettings(true)}
                    className="rounded-full"
                  >
                    <SettingsIcon className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <Routes>
                <Route path="/" element={<Index />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </TooltipProvider>
      {showSettings && (
        <Settings 
          onClose={() => {
            setShowSettings(false);
            // Force update of API status when settings are closed
            window.dispatchEvent(new Event('storage'));
          }} 
        />
      )}
    </QueryClientProvider>
  );
};

export default App;
