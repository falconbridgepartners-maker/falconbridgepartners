import React from 'react';
import type { SignalContent, SignalItem } from '@/lib/weekly/manifest';
import { acronymize } from '@/components/dss/acronymize';

/** One item of the signal: the report, then the FalconBridge Lens set apart from it, then its sources. */
function Item({ item, lead, n }: { item: SignalItem; lead?: boolean; n?: number }) {
  return (
    <article className="tile p-7 md:p-9">
      <h3 className={lead ? 'text-2xl md:text-3xl mb-4' : 'text-xl md:text-2xl mb-4'}>
        {n ? <span className="governing mr-3" aria-hidden="true">{n}.</span> : null}{item.title}
      </h3>
      <p className="text-white/75 whitespace-pre-line max-w-4xl">{acronymize(item.body)}</p>
      {item.lens && (
        <div className="tile-ivory p-5 md:p-6 mt-6 max-w-4xl">
          <h4 className="governing text-lg mb-2" style={{ color: '#262626' }}>FalconBridge Lens</h4>
          <p className="text-[0.95rem] whitespace-pre-line">{acronymize(item.lens)}</p>
        </div>
      )}
      {item.sources && <p className="text-white/45 text-sm mt-5">{item.sources}</p>}
    </article>
  );
}

/**
 * A Weekly Signal shown as issued, in its own order: the themes, the lead topic, one to watch,
 * and the log of articles considered. Nothing here is rewritten by the site.
 */
export default function SignalAsIssued({ content }: { content: SignalContent }) {
  const themes = content.themes ?? [];
  const log = content.audit_log ?? [];
  return (
    <div className="space-y-14">
      {themes.length > 0 && (
        <section aria-labelledby="signal-themes">
          <h2 id="signal-themes" className="mb-6">Top {themes.length} theme{themes.length === 1 ? '' : 's'}</h2>
          <div className="space-y-5">{themes.map((t, i) => <Item key={t.title} item={t} n={i + 1} />)}</div>
        </section>
      )}
      {content.lead && (
        <section aria-labelledby="signal-lead">
          <h2 id="signal-lead" className="mb-6">Lead topic</h2>
          <Item item={content.lead} lead />
        </section>
      )}
      {content.watch && (
        <section aria-labelledby="signal-watch">
          <h2 id="signal-watch" className="mb-6">One to watch</h2>
          <div className="border-l-2 border-brand-gold pl-6 md:pl-8 py-1"><p className="text-white/75 whitespace-pre-line max-w-4xl">{acronymize(content.watch)}</p></div>
        </section>
      )}
      {log.length > 0 && (
        <section aria-labelledby="signal-log">
          <h2 id="signal-log" className="text-xl md:text-2xl mb-4">Article audit log: sources considered this scan</h2>
          <ol className="list-decimal pl-5 space-y-1.5 text-white/60 text-sm max-w-4xl">{log.map((a) => <li key={a}>{a}</li>)}</ol>
        </section>
      )}
    </div>
  );
}
