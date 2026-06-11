import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MetricCard = ({
  label,
  value,
  sublabel,
  icon: Icon,
  trend,
  trendUp = true,
  accent = 'emerald',
}) => {
  const accents = {
    emerald: 'from-emerald-500 to-teal-600',
    violet: 'from-violet-500 to-purple-600',
    amber: 'from-amber-500 to-orange-500',
    rose: 'from-rose-500 to-pink-600',
    slate: 'from-slate-600 to-slate-800',
    wine: 'from-[#9b2335] to-[#7a1c2a]',
  };

  return (
    <div className="metric-card group">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div
          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${
            accents[accent] || accents.emerald
          } flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-105`}
        >
          {Icon && <Icon className="w-5 h-5 text-white" strokeWidth={2} />}
        </div>
        {trend != null && (
          <span
            className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-1 rounded-lg ${
              trendUp ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {trendUp ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
        {label}
      </p>
      {sublabel && <p className="text-xs text-slate-500 mt-1">{sublabel}</p>}
    </div>
  );
};

export default MetricCard;
