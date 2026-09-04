import React from 'react';

export default function Magnet({ children, className = '' }) {
  return <div className={`inline-block ${className}`}>{children}</div>;
}
