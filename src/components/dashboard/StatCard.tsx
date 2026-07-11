import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, subtitle }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-border p-6 flex flex-col hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {Icon && (
          <div className="p-2 bg-primary/10 rounded-full">
             <Icon className="w-5 h-5 text-primary" />
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-foreground mt-2">{value}</div>
      {subtitle && <p className="text-xs text-muted-foreground mt-2 font-medium">{subtitle}</p>}
    </div>
  );
};

export default StatCard;
