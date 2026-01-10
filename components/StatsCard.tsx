
import React from 'react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
  subtitle?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color, subtitle }) => {
  const colorVariants = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      border: 'border-blue-100',
      accent: 'bg-blue-600',
      shadow: 'shadow-blue-100'
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      border: 'border-green-100',
      accent: 'bg-green-600',
      shadow: 'shadow-green-100'
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      border: 'border-purple-100',
      accent: 'bg-purple-600',
      shadow: 'shadow-purple-100'
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'text-orange-600',
      border: 'border-orange-100',
      accent: 'bg-orange-600',
      shadow: 'shadow-orange-100'
    },
  };

  const theme = colorVariants[color];

  return (
    <div className={`bg-white p-5 rounded-2xl shadow-sm border ${theme.border} hover:shadow-md transition-all group overflow-hidden relative`}>
      <div className={`absolute top-0 right-0 w-24 h-24 ${theme.bg} rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-110 transition-transform duration-500`}></div>
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
          <p className="text-3xl font-black text-gray-900 leading-none">{value}</p>
          {subtitle && <p className="text-[10px] text-gray-500 mt-2 font-medium">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${theme.bg} ${theme.icon} shadow-sm group-hover:scale-110 transition-transform`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
      </div>
      
      <div className="mt-4 w-full bg-gray-100 h-1 rounded-full overflow-hidden">
        <div className={`${theme.accent} h-full rounded-full transition-all duration-1000 w-[70%]`}></div>
      </div>
    </div>
  );
};

export default StatsCard;
