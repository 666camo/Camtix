import React from 'react';

export default function SplitText({ text = '', className = '' }) {
  return <span className={className}>{text}</span>;
}
