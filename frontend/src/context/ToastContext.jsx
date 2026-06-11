import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, Sparkles, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe ser utilizado dentro de un ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, title, description = '', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => {
      const list = [...prev, { id, type, title, description, duration }];
      // Keep maximum of 4 toasts
      if (list.length > 4) {
        return list.slice(list.length - 4);
      }
      return list;
    });

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (title, desc, dur) => addToast('success', title, desc, dur),
    error: (title, desc, dur) => addToast('error', title, desc, dur),
    warning: (title, desc, dur) => addToast('warning', title, desc, dur),
    info: (title, desc, dur) => addToast('info', title, desc, dur),
    celebration: (title, desc, dur) => addToast('celebration', title, desc, dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      
      {/* CSS keyframe for progress bar */}
      <style>{`
        @keyframes shrinkWidth {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
        @keyframes confettiFloat {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-30px) rotate(360deg); opacity: 0; }
        }
        .animate-slide-in-right {
          animation: slideInRight 300ms ease-out forwards;
        }
        .confetti-dot {
          position: absolute;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          animation: confettiFloat 1s ease-out forwards;
        }
      `}</style>

      {/* Toast Portal Container */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 w-80 max-w-[90vw] pointer-events-none">
        {toasts.map((t) => {
          let bgClass = 'bg-white';
          let borderLeftColor = '';
          let iconBgColor = '';
          let iconColor = '';
          let IconComponent = Info;
          let showConfetti = false;

          switch (t.type) {
            case 'success':
              bgClass = 'bg-emerald-50';
              borderLeftColor = 'border-l-4 border-l-[#0d9f6e]';
              iconColor = 'text-[#0d9f6e]';
              iconBgColor = 'bg-[#e6f4ea]';
              IconComponent = CheckCircle2;
              break;
            case 'error':
              bgClass = 'bg-rose-50';
              borderLeftColor = 'border-l-4 border-l-[#9b2335]';
              iconColor = 'text-[#9b2335]';
              iconBgColor = 'bg-[#fce8e6]';
              IconComponent = XCircle;
              break;
            case 'warning':
              bgClass = 'bg-amber-50';
              borderLeftColor = 'border-l-4 border-l-[#f59e0b]';
              iconColor = 'text-[#f59e0b]';
              iconBgColor = 'bg-[#fef7e0]';
              IconComponent = AlertTriangle;
              break;
            case 'celebration':
              bgClass = 'bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100';
              borderLeftColor = 'border-l-4 border-l-[#0d9f6e]';
              iconColor = 'text-[#0d9f6e]';
              iconBgColor = 'bg-[#e6f4ea]';
              IconComponent = Sparkles;
              showConfetti = true;
              break;
            case 'info':
            default:
              bgClass = 'bg-blue-50';
              borderLeftColor = 'border-l-4 border-l-[#3b82f6]';
              iconColor = 'text-[#3b82f6]';
              iconBgColor = 'bg-[#e8f0fe]';
              IconComponent = Info;
              break;
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start justify-between p-4 rounded-xl shadow-lg border border-slate-100 relative overflow-hidden ${bgClass} ${borderLeftColor} animate-slide-in-right`}
              role="alert"
            >
              {/* Confetti effect */}
              {showConfetti && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="confetti-dot bg-red-400" style={{ left: '20%', top: '60%', animationDelay: '0s' }} />
                  <div className="confetti-dot bg-yellow-400" style={{ left: '40%', top: '70%', animationDelay: '0.2s' }} />
                  <div className="confetti-dot bg-blue-400" style={{ left: '60%', top: '50%', animationDelay: '0.1s' }} />
                  <div className="confetti-dot bg-pink-400" style={{ left: '80%', top: '65%', animationDelay: '0.3s' }} />
                </div>
              )}

              <div className="flex gap-3 pr-2">
                <div className={`w-8 h-8 rounded-lg ${iconBgColor} flex items-center justify-center shrink-0 ${iconColor}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800 leading-tight">{t.title}</h4>
                  {t.description && (
                    <p className="text-[10px] text-slate-500 font-semibold mt-1 leading-normal">
                      {t.description}
                    </p>
                  )}
                  <span className="text-[9px] text-slate-400 font-bold block mt-1">Hace un momento</span>
                </div>
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-black/5 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Animated Progress Bar */}
              <div 
                className={`absolute bottom-0 left-0 h-0.5 ${iconColor}`} 
                style={{
                  animation: `shrinkWidth ${t.duration}ms linear forwards`,
                  backgroundColor: 'currentColor',
                  opacity: 0.4
                }}
              />
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastContext;
