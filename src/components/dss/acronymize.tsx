import React from 'react';
import Acronym from '@/components/dss/Acronym';
import { ACRONYM_PATTERN, ACRONYMS } from '@/content/acronyms';

/**
 * Wraps every known acronym in a string with its hover definition. Safe in server components;
 * anything that is not a string is returned untouched.
 */
export function acronymize(text?: string | null): React.ReactNode {
  if (!text || typeof text !== 'string') return text ?? null;
  const parts = text.split(ACRONYM_PATTERN);
  if (parts.length === 1) return text;
  return (
    <>
      {parts.map((part, i) => (ACRONYMS[part] ? <Acronym key={i} term={part} /> : <React.Fragment key={i}>{part}</React.Fragment>))}
    </>
  );
}
