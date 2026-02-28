import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: 'blue' | 'emerald' | 'amber';
}

const colorMap = {
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  amber: 'bg-amber-50 text-amber-600 border-amber-100',
};

export const StatsCard: React.FC<StatsCardProps> = ({ icon: Icon, label, value, color }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border", colorMap[color])}>
        <Icon size={28} />
      </div>
      <div>
        <p className="text-3xl font-bold text-slate-800">{value}</p>
        <p className="text-sm font-medium text-slate-500">{label}</p>
      </div>
    </div>
  );
};
