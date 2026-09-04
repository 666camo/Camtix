import React from 'react';

export default function TiltedCard({ children, className = '' }) {
  return (
    <div className={`w-full h-full ${className}`}>
      {children}
    </div>
  );
}
