import React from 'react';

export default function Aurora({ children, className = '' }) {
  return (
    <div className={`min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-base ${className}`}>
      {/* Soft floating glow layers (static/non-moving) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl"></div>
      </div>
      <div className="relative z-10 w-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
