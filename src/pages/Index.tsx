// src/pages/Index.tsx
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import ResearchDashboard from '../components/ResearchDashboard';
import Streamlit from '@/components/Streamlit';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'research' | 'usecase'>('research');
  const [companyName, setCompanyName] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = () => {
    setCompanyName(searchInput.trim());
  };

  return (
    <div className="min-h-screen border border-red-500 bg-gradient-to-b from-background to-muted/30">
      {/* <p>helo</p>
      <Helmet> */}
      <div className='border border-green-500 flex flex-col items-center justify-center'>
        <h1 className='text-6xl text-center py-5 font-bold text-[#2D95FE]'>Company Research Intelligence</h1>
        <p className='text-2xl text-center py-5 font-semibold text-gray-400 w-[70%]'>AI-powered company research platform providing comprehensive business intelligence and investment analysis</p>
      </div>

      <div className="container mx-auto py-8 px-4">
        {/* Search Header */}
        <div className="max-w-2xl mx-auto mb-8 space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter company name (e.g., Apple, Tesla, Amazon)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 border rounded-lg px-4 py-2 focus:outline-primary"
            />
            <button
              onClick={handleSearch}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Search
            </button>
          </div>

          {/* Toggle Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setActiveTab('research')}
              className={`px-6 py-2 rounded-lg transition-colors ${activeTab === 'research'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              Research Dashboard
            </button>
            <button
              onClick={() => setActiveTab('usecase')}
              className={`px-6 py-2 rounded-lg transition-colors ${activeTab === 'usecase'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              AI Use Cases
            </button>
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode='wait'>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'research' ? (
              <ResearchDashboard companyName={companyName} />
            ) : (
              <Streamlit companyName={companyName} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;