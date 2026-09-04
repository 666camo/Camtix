import React from 'react';

export default function SpotlightCard({ 
  children, 
  className = '', 
  bgColor = 'bg-slate-900/95',
  borderClass = 'border-slate-800/80'
}) {
  return (
    <div className={`relative overflow-hidden border ${borderClass} ${bgColor} ${className}`}>
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
