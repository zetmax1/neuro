import React from 'react';
import { TopicSnapshot } from '@/api/analytics.api';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TopicHighlightProps {
  title: string;
  topic: TopicSnapshot | null;
  type: 'strongest' | 'weakest';
}

const TopicHighlight: React.FC<TopicHighlightProps> = ({ title, topic, type }) => {
  const isStrongest = type === 'strongest';
  
  if (!topic) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-border p-6 flex flex-col h-full justify-center items-center hover:shadow-md transition-shadow">
         <h3 className="text-sm font-medium text-muted-foreground mb-4 w-full text-left">{title}</h3>
         <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground text-sm italic">No data available yet</p>
         </div>
      </div>
    );
  }

  const progressColor = isStrongest ? 'bg-green-500' : 'bg-orange-500';
  const Icon = isStrongest ? TrendingUp : TrendingDown;
  const iconColor = isStrongest ? 'text-green-500' : 'text-orange-500';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-border p-6 flex flex-col h-full hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-6">
         <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
         <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      
      <div className="flex-1 flex flex-col justify-end">
        <div className="text-2xl font-bold text-foreground mb-4 line-clamp-2 leading-tight">
           {topic.name}
        </div>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-semibold text-foreground">Mastery Level</span>
          <span className="font-bold">{topic.mastery_level}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-3 overflow-hidden border border-border/50">
          <div 
             className={`h-full rounded-full ${progressColor} transition-all duration-1000 ease-out`} 
             style={{ width: `${topic.mastery_level}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default TopicHighlight;
