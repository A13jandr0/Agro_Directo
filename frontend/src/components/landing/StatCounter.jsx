import React, { useState, useEffect, useRef } from 'react';

export default function StatCounter({ value, suffix = '', label, icon: Icon, color = 'emerald' }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  const colorMap = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
    slate: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100' },
  };
  const c = colorMap[color] || colorMap.emerald;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const end = value;
          const duration = 1800;
          const step = Math.max(1, Math.floor(end / (duration / 16)));
          const timer = setInterval(() => {
            start += step;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(start);
            }
          }, 16);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return (
    <div ref={ref} className="text-center group">
      <div className={`w-14 h-14 ${c.bg} rounded-2xl flex items-center justify-center mx-auto mb-4 border ${c.border} group-hover:scale-110 transition-transform duration-300`}>
        {Icon && <Icon className={`w-6 h-6 ${c.text}`} />}
      </div>
      <p className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-sm font-bold text-slate-500 mt-2 uppercase tracking-wider">{label}</p>
    </div>
  );
}
