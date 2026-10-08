'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ACRONYMS } from '@/content/acronyms';

/**
 * An acronym with its words in full on hover or tap, and the detail behind More.
 * Keyboard: the term is focusable, Escape closes. The popover is plain text; nothing inside it is wrapped again.
 */
export default function Acronym({ term }: { term: string }) {
  const info = ACRONYMS[term];
  const [open, setOpen] = useState(false);
  const [more, setMore] = useState(false);
  /** Horizontal shift and vertical flip so the popover stays inside the viewport whatever the term's position. */
  const [shift, setShift] = useState(0);
  const [below, setBelow] = useState(false);
  const root = useRef<HTMLSpanElement>(null);
  const pop = useRef<HTMLSpanElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useLayoutEffect(() => {
    if (!open) { setShift(0); setBelow(false); return; }
    const place = () => {
      const el = pop.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const margin = 12;
      let dx = 0;
      if (r.left - 0 < margin) dx = margin - r.left;
      else if (r.right > window.innerWidth - margin) dx = window.innerWidth - margin - r.right;
      if (dx) setShift((s) => s + dx);
      if (!below && r.top < margin) setBelow(true);
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => { window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true); };
  }, [open, more, below]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); setMore(false); } };
    const onDown = (e: MouseEvent | TouchEvent) => { if (root.current && !root.current.contains(e.target as Node)) { setOpen(false); setMore(false); } };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onDown); document.removeEventListener('touchstart', onDown); };
  }, [open]);

  if (!info) return <>{term}</>;
  const show = () => { if (hideTimer.current) clearTimeout(hideTimer.current); setOpen(true); };
  const hide = () => { hideTimer.current = setTimeout(() => { setOpen(false); setMore(false); }, 180); };

  return (
    <span ref={root} className="relative z-10 inline-block" onMouseEnter={show} onMouseLeave={hide}>
      <button
        type="button"
        onClick={() => (open ? (setOpen(false), setMore(false)) : setOpen(true))}
        onFocus={show}
        aria-expanded={open}
        aria-label={`${term}: ${info.name}`}
        className="font-[inherit] text-[inherit] leading-[inherit] text-current underline decoration-dotted decoration-brand-gold/70 underline-offset-4 cursor-help focus:outline-none focus-visible:decoration-brand-gold"
      >
        {term}
      </button>
      {open && (
        <span
          ref={pop}
          role="tooltip"
          style={{ transform: `translateX(calc(-50% + ${shift}px))` }}
          className={`absolute left-1/2 ${below ? 'top-full mt-2' : 'bottom-full mb-2'} z-50 block w-[min(24rem,88vw)] rounded-xl border border-brand-gold/40 bg-[#0d1322] p-5 text-left shadow-2xl normal-case not-italic font-normal tracking-normal`}
        >
          <span className="block text-white font-bold text-sm leading-snug">{info.name}</span>
          {info.question && <span className="governing block text-brand-gold-pale text-sm leading-snug mt-2">{info.question}</span>}
          {!more && (
            <button type="button" onClick={() => setMore(true)} className="mt-3 block text-xs font-bold tracking-wide text-brand-gold-pale underline underline-offset-4">
              More
            </button>
          )}
          {more && (
            <span className="block mt-3 max-h-64 overflow-y-auto pr-1">
              {info.more.map((p) => (
                <span key={p.slice(0, 24)} className="block text-xs leading-relaxed text-white/75 mb-2 last:mb-0">{p}</span>
              ))}
              {info.href && (
                <Link href={info.href} className="mt-1 inline-block text-xs font-bold text-brand-gold-pale underline underline-offset-4">
                  Visit the page
                </Link>
              )}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
