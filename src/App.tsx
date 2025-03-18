import React, { useState } from 'react';
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

const queryClient = new QueryClient();

const App = () => {
  const [showSettings, setShowSettings] = useState(false);

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
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowSettings(true)}
                  className="rounded-full"
                >
                  <SettingsIcon className="h-5 w-5" />
                </Button>
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
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </QueryClientProvider>
  );
};

export default App;
