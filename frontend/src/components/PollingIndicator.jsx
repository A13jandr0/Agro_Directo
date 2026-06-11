import React from 'react';

const PollingIndicator = ({ segundosDesdeUpdate }) => (
  <div className="flex items-center gap-1 text-xs text-gray-400">
    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
    Actualizado hace {segundosDesdeUpdate}s
  </div>
);

export default PollingIndicator;
