import React from 'react';

/** Campo de formulario con estilo unificado (inputs grises redondeados) */
const FormField = ({
  label,
  required,
  error,
  hint,
  children,
  className = '',
}) => (
  <div className={`space-y-1.5 ${className}`}>
    {label && (
      <label className="form-label">
        {label}
        {required && <span className="text-[#9b2335] ml-0.5">*</span>}
      </label>
    )}
    {children}
    {error && <p className="form-error">{error}</p>}
    {hint && !error && <p className="form-hint">{hint}</p>}
  </div>
);

export const formInputClass = (hasError = false) =>
  `form-input-pro ${hasError ? 'form-input-pro--error' : ''}`;

export default FormField;
