import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Tag, MapPin, Package, BarChart3, Sprout, TrendingUp } from 'lucide-react';

const DECO_ICONS = [
  { Icon: Calendar, top: '14%', left: '10%', delay: '0s' },
  { Icon: Tag, top: '24%', right: '12%', delay: '0.4s' },
  { Icon: MapPin, bottom: '30%', left: '8%', delay: '0.8s' },
  { Icon: Package, bottom: '20%', right: '10%', delay: '1.2s' },
  { Icon: BarChart3, top: '48%', left: '6%', delay: '0.6s' },
  { Icon: Sprout, top: '58%', right: '7%', delay: '1s' },
  { Icon: TrendingUp, bottom: '42%', right: '16%', delay: '0.2s' },
];

/**
 * Modal a pantalla completa: overlay cubre sidebar + header + contenido.
 * Solo la tarjeta central queda nítida (portal en document.body).
 */
const FocusModal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: HeaderIcon = Sprout,
  children,
  footer,
  maxWidth = 'max-w-4xl',
  disabledClose = false,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape' && !disabledClose) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, disabledClose]);

  if (!isOpen) return null;

  const modal = (
    <div
      className="focus-modal-root"
      role="presentation"
    >
      {/* Capa 1: oscurece TODA la ventana (viewport completo) */}
      <div
        className="focus-modal-overlay"
        onClick={disabledClose ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Capa 2: iconos decorativos sobre el overlay */}
      <div className="focus-modal-deco-layer pointer-events-none" aria-hidden="true">
        {DECO_ICONS.map(({ Icon, top, left, right, bottom, delay }, i) => (
          <div
            key={i}
            className="focus-modal-deco-icon"
            style={{ top, left, right, bottom, animationDelay: delay }}
          >
            <Icon className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={1.25} />
          </div>
        ))}
        <p className="focus-modal-footer-hint">
          AgroDirecto · Santa Cruz · Conectando productores y compradores
        </p>
      </div>

      {/* Capa 3: tarjeta enfocada (único elemento nítido) */}
      <div className="focus-modal-stage">
        <div
          className={`focus-modal-card w-full ${maxWidth} max-h-[min(92vh,900px)] flex flex-col animate-scale-bounce`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="focus-modal-title"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-slate-100 shrink-0 bg-white rounded-t-2xl">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                <HeaderIcon className="w-5 h-5" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <h2 id="focus-modal-title" className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={disabledClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-40 shrink-0"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-[#f8f9fb] px-6 sm:px-8 py-6 min-h-0">{children}</div>

          {footer && (
            <div className="px-6 sm:px-8 py-5 border-t border-slate-100 bg-white rounded-b-2xl shrink-0 flex flex-wrap justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default FocusModal;
