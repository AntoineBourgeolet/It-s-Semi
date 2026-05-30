import React, { useState } from 'react';
import { type Crop } from '../data';

export function CropIcon({ crop, className = "" }: { crop: Crop; className?: string }) {
  const [error, setError] = useState(false);
  const rawImageSrc = (crop.image && crop.image !== '?') ? crop.image : '/pictures/inconnu.webp';

  const formatImageSrc = (src: string) => {
    if (src.startsWith('/')) {
      const baseUrl = import.meta.env.BASE_URL;
      return baseUrl.endsWith('/') ? `${baseUrl}${src.slice(1)}` : `${baseUrl}${src}`;
    }
    return src;
  };

  const imageSrc = formatImageSrc(rawImageSrc);
  const fallbackSrc = formatImageSrc('/pictures/inconnu.webp');

  return (
    <img 
      src={error ? fallbackSrc : imageSrc} 
      alt={crop.name} 
      className={`object-contain ${className}`} 
      referrerPolicy="no-referrer"
      onError={() => setError(true)}
    />
  );
}
