import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const VerificationCelebrationModal = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-fade-in">
        <div className="w-20 h-20 mx-auto mb-5 bg-emerald-50 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-bounce" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">🎉 ¡Tu cuenta fue verificada!</h2>
        <p className="text-sm text-slate-500 font-medium mb-6">
          Ya podés usar todas las funcionalidades de AgroDirecto.
        </p>
        <button
          onClick={onClose}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition-colors shadow-lg shadow-emerald-600/20"
        >
          ¡Empezar!
        </button>
      </div>
    </div>
  );
};

export default VerificationCelebrationModal;
