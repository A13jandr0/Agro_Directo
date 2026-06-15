import React from 'react';
import { Quote } from 'lucide-react';

export default function TestimonialCard({ name, role, location, quote, avatarUrl }) {
  const initials = name ? name.split(' ').map(n => n[0]).join('').substring(0, 2) : 'AD';

  return (
    <div className="bg-white p-8 rounded-3xl shadow-lg shadow-slate-200/40 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-400 flex flex-col">
      <Quote className="w-8 h-8 text-emerald-200 mb-4 flex-shrink-0" />
      <p className="text-slate-600 leading-relaxed italic flex-grow mb-6">
        "{quote}"
      </p>
      <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-12 h-12 rounded-full object-cover border-2 border-emerald-100" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-sm border-2 border-emerald-200">
            {initials}
          </div>
        )}
        <div>
          <p className="font-black text-slate-900 text-sm">{name}</p>
          <p className="text-xs text-slate-500 font-medium">{role} · {location}</p>
        </div>
      </div>
    </div>
  );
}
