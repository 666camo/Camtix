import { useState } from 'react';
import { Music } from 'lucide-react';

function PosterImage({ src, title, category, eager }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <div className="event-art-fallback"><span>CAMTIX / LIVE</span><Music size={30} aria-hidden="true" /><strong>{title}</strong><small>{category || 'LIVE MUSIC'}</small></div>;
  return <>
    <img className="event-art-backdrop" src={src} alt="" aria-hidden="true" loading={eager ? 'eager' : 'lazy'} />
    <img className="event-art-image" src={src} alt={title} loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(true)} />
  </>;
}

export default function EventPoster({ src, title, category, className = '', eager = false }) {
  return <div className={`event-art ${className}`}><PosterImage key={src || 'empty'} src={src} title={title} category={category} eager={eager} /></div>;
}
