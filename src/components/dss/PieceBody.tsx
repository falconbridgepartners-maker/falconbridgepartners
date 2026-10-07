import React from 'react';
import type { PieceBlock, PieceContent } from '@/lib/pieces';

const TOKEN = /(\*\*.+?\*\*|\*.+?\*|\[[^\]]+\]\((?:https?:\/\/|\/)[^)\s]+\))/g;

/** Text with the emphasis it was issued with: **bold**, *italic* and [a link](https://…). Nothing else is interpreted. */
export function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split(TOKEN).map((part, i) => {
        if (part.length > 4 && part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
        if (part.length > 2 && part.startsWith('*') && part.endsWith('*')) return <em key={i}>{part.slice(1, -1)}</em>;
        const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
        if (link) {
          const external = !link[2].startsWith('/');
          return <a key={i} href={link[2]} className="text-brand-gold-pale underline underline-offset-4" {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{link[1]}</a>;
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
}

const two = (n: number) => String(n).padStart(2, '0');

function Block({ block }: { block: PieceBlock }) {
  switch (block.type) {
    case 'paragraph':
      return <p className="text-white/75 whitespace-pre-line max-w-3xl"><Inline text={block.text} /></p>;
    case 'heading':
      return <h2 className="text-2xl md:text-3xl max-w-3xl pt-4"><Inline text={block.text} /></h2>;
    case 'quote':
      return (
        <blockquote className="border-l-2 border-brand-gold pl-6 md:pl-8 py-1 max-w-3xl">
          <p className="governing text-xl md:text-2xl leading-snug whitespace-pre-line"><Inline text={block.text} /></p>
          {block.attribution && <footer className="text-sm text-white/50 mt-3">{block.attribution}</footer>}
        </blockquote>
      );
    case 'stats':
      return (
        <div className={`grid grid-cols-1 gap-4 ${block.items.length === 2 ? 'sm:grid-cols-2' : block.items.length === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'}`}>
          {block.items.map((s, i) => (
            <div key={i} className="tile-ivory p-6 [&_strong]:text-[#262626]">
              <p className="governing text-3xl md:text-4xl leading-tight mb-2" style={{ color: '#262626' }}>{s.figure}</p>
              <p className="text-sm"><Inline text={s.label} /></p>
            </div>
          ))}
        </div>
      );
    case 'callouts':
      return (
        <section>
          {block.heading && <h2 className="text-2xl md:text-3xl max-w-3xl mb-6"><Inline text={block.heading} /></h2>}
          <ol className="list-none space-y-4">
            {block.items.map((c, i) => (
              <li key={i} className="tile p-6 md:p-7 flex gap-5 md:gap-7">
                <span className="governing text-3xl md:text-4xl leading-none shrink-0 w-10 md:w-12" aria-hidden="true">{two(i + 1)}</span>
                <div className="min-w-0">
                  {c.title && <h3 className="text-lg md:text-xl mb-2"><Inline text={c.title} /></h3>}
                  <p className="text-white/75 text-[0.95rem] md:text-base whitespace-pre-line"><Inline text={c.body} /></p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      );
    case 'questions':
      return (
        <section className="tile p-7 md:p-9 border-brand-gold/40">
          {block.heading && <h2 className="text-2xl md:text-3xl mb-6"><Inline text={block.heading} /></h2>}
          <ol className="list-none space-y-5">
            {block.items.map((q, i) => (
              <li key={i} className="flex gap-4 md:gap-5">
                <span className="governing text-2xl leading-tight shrink-0 w-7" aria-hidden="true">{i + 1}.</span>
                <p className="text-white/85 max-w-3xl"><Inline text={q} /></p>
              </li>
            ))}
          </ol>
        </section>
      );
    case 'list':
      return <ul className="list-disc pl-6 space-y-2 text-white/75 max-w-3xl marker:text-brand-gold">{block.items.map((it, i) => <li key={i}><Inline text={it} /></li>)}</ul>;
  }
}

/**
 * A Professional Curiosity piece shown as issued, block by block: paragraphs, stat tiles, numbered callouts,
 * numbered questions, then the closing disclaimer. Nothing here is rewritten by the site.
 */
export default function PieceBody({ content }: { content: PieceContent }) {
  return (
    <div className="space-y-7 [&_strong]:text-white [&_strong]:font-bold">
      {content.standfirst && <p className="governing text-xl md:text-2xl leading-snug max-w-3xl"><Inline text={content.standfirst} /></p>}
      {content.blocks.map((b, i) => <Block key={i} block={b} />)}
    </div>
  );
}
