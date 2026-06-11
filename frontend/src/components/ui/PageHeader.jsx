import React from 'react';

const PageHeader = ({
  icon: Icon,
  title,
  subtitle,
  badge,
  actions,
  variant = 'light',
}) => (
  <div
    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
      variant === 'hero' ? 'mb-2' : 'mb-1'
    }`}
  >
    <div className="flex items-start gap-4 min-w-0">
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 shrink-0">
          <Icon className="w-6 h-6" strokeWidth={2} />
        </div>
      )}
      <div className="min-w-0">
        {badge && (
          <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full mb-2">
            {badge}
          </span>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm text-slate-500 font-medium mt-1 max-w-2xl">{subtitle}</p>
        )}
      </div>
    </div>
    {actions && <div className="flex flex-wrap gap-2 shrink-0">{actions}</div>}
  </div>
);

export default PageHeader;
