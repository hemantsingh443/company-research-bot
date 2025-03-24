import React from 'react';
import { motion } from 'framer-motion';
import { WebSource } from '@/utils/researchAgents';
import { Card } from '@/components/ui/card';
import { 
  Globe, 
  Building2, 
  PieChart, 
  BarChart4, 
  TrendingUp,
  Briefcase
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WebSourceCardProps {
  source: WebSource;
  index: number;
}

const agentIcons = {
  'company': Building2,
  'financial': PieChart,
  'market': BarChart4,
  'competitors': Briefcase,
  'investment': TrendingUp,
  'default': Globe
};

const agentColors = {
  'company': 'from-blue-500/20 to-blue-500/10',
  'financial': 'from-green-500/20 to-green-500/10',
  'market': 'from-purple-500/20 to-purple-500/10',
  'competitors': 'from-orange-500/20 to-orange-500/10',
  'investment': 'from-cyan-500/20 to-cyan-500/10',
  'default': 'from-gray-500/20 to-gray-500/10'
};

const WebSourceCard: React.FC<WebSourceCardProps> = ({ source, index }) => {
  const Icon = agentIcons[source.agentId as keyof typeof agentIcons] || agentIcons.default;
  const gradientColor = agentColors[source.agentId as keyof typeof agentColors] || agentColors.default;
  
  // Extract domain from URL
  const domain = new URL(source.url).hostname.replace('www.', '');
  
  // Get favicon URL
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "p-4 rounded-lg border bg-card text-card-foreground shadow-sm",
        "hover:shadow-md transition-shadow duration-200"
      )}
    >
      <motion.div 
        className="flex items-start gap-2"
        initial={{ x: -10 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
      >
        <Globe className="h-4 w-4 text-primary mt-1" />
        <div>
          <motion.a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium hover:underline truncate block"
            whileHover={{ color: 'var(--primary)' }}
          >
            {source.title}
          </motion.a>
          <motion.p 
            className="text-xs text-muted-foreground mt-1 line-clamp-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 + 0.4 }}
          >
            {source.snippet}
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WebSourceCard; 