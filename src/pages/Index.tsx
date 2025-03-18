
import React from 'react';
import { Helmet } from 'react-helmet';
import ResearchDashboard from '@/components/ResearchDashboard';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Helmet>
        <title>Company Research Intelligence</title>
        <meta name="description" content="AI-powered company research platform providing comprehensive business intelligence and investment analysis" />
      </Helmet>
      <ResearchDashboard />
    </div>
  );
};

export default Index;
