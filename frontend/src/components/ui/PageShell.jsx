import React from 'react';

/** Contenedor de página con fondo profesional y animación de entrada */
const PageShell = ({ children, className = '' }) => (
  <div className={`page-canvas min-h-full ${className}`}>
    <div className="page-canvas-inner max-w-7xl mx-auto p-5 sm:p-8 lg:p-10 space-y-6 page-enter">
      {children}
    </div>
  </div>
);

export default PageShell;
