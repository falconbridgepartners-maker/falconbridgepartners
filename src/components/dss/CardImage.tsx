'use client';
import { useEffect, useState } from 'react';

/**
 * Shows the first image in `sources` that loads, trying each in turn, and nothing if none does.
 * The card behind it carries the falcon mark, so an image that is missing never leaves a blank tile.
 *
 * The image is added once the page is interactive, so a failed load is always caught and the next
 * source tried; a browser's own "loaded" flag is unreliable for images it has deferred.
 */
export default function CardImage({ sources, alt, className }: { sources: string[]; alt: string; className?: string }) {
  const [ready, setReady] = useState(false);
  const [i, setI] = useState(0);
  useEffect(() => setReady(true), []);
  if (!ready || i >= sources.length) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img key={sources[i]} src={sources[i]} alt={alt} loading="lazy" decoding="async" className={className} onError={() => setI((n) => n + 1)} />;
}
