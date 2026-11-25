window.__grab110 = () => {
  const is = (el, name) => [...(el.classList || [])].some(c => c.replace(/^x_\d+/, '') === name);
  const one = (el, name) => [...el.querySelectorAll('*')].find(e => is(e, name)) || null;
  const all = (el, name) => [...el.querySelectorAll('*')].filter(e => is(e, name));
  const eyebrows = [...document.querySelectorAll('[class*="eyebrow"]')].filter(e => /WEEKLY SIGNAL/i.test(e.innerText || ''));
  if (!eyebrows.length) return null;
  const root = eyebrows[eyebrows.length - 1].closest('.zmMailContent') || document.querySelector('.zmPV') || document.body;
  const TAG = /\s*\b(FACT|CLAIM|INFERENCE|ESTIMATE|OPINION|UNVERIFIED|VERIFIED|CHECKED)\b\s*$/;
  const clean = (el) => {
    if (!el) return '';
    const c = el.cloneNode(true);
    c.querySelectorAll('button').forEach(b => b.remove());
    [...c.querySelectorAll('*')].filter(e => is(e, 'ev') || is(e, 'conf')).forEach(e => e.remove());
    c.querySelectorAll('div,p,li,br,tr,h1,h2,h3,h4,h5,h6').forEach(e => e.before('\n'));
    let t = (c.textContent || '').replace(/\u00a0/g, ' ');
    t = t.split('\n').map(s => s.replace(/[ \t]+/g, ' ').trim()).filter(s => s && !/^STRICTLY PRIVATE & CONFIDENTIAL/i.test(s)).join('\n');
    while (TAG.test(t)) t = t.replace(TAG, '');
    return t.trim();
  };
  const paras = (el) => (el ? [...el.children].map(clean).filter(Boolean) : []);
  const stories = [];
  for (const h of all(root, 'story-head')) {
    const cols = h.nextElementSibling && is(h.nextElementSibling, 'cols') ? h.nextElementSibling : null;
    const srcs = cols && cols.nextElementSibling && is(cols.nextElementSibling, 'srcs') ? cols.nextElementSibling : null;
    const lens = cols ? one(cols, 'lens') : null;
    const facts = cols ? [...((one(cols, 'facts') || cols).querySelectorAll('li'))].map(clean).filter(Boolean) : [];
    const lensParas = lens ? [...lens.children].filter(e => !is(e, 'label') && !is(e, 'entry')).map(clean).filter(Boolean) : [];
    const h3 = h.querySelector('h3,h2,h4');
    stories.push({
      role: clean(one(h, 'role')),
      title: clean(h3),
      outlet_head: clean(one(h, 'outlet-head')).replace(/^Outlet's headline:\s*/i, ''),
      held: is(h, 'held') || is(h.parentElement, 'held') || /\b(HELD|WITHHELD)\b/i.test(clean(one(h, 'role'))),
      facts, lens: lensParas, sources: clean(srcs).replace(/\s*\n\s*/g, ' ')
    });
  }
  const tbl = one(root, 'tbl');
  const rows = tbl ? [...tbl.querySelectorAll('tr')].slice(1).map(tr => [...tr.cells].map(c => clean(c).split('\n')[0])) : [];
  const status = one(root, 'status');
  const edition = one(root, 'editionbar');
  return {
    layout: 'v1.10',
    eyebrow: clean(one(root, 'eyebrow')),
    h1: clean(root.querySelector('h1')),
    meta: clean(one(root, 'meta')).replace(/\s+/g, ' '),
    attrib: clean(one(root, 'attrib')),
    edition: clean(one(root, 'flat-edition') || edition).replace(/^Edition\s*/i, '').replace(/\s*·\s*(full|short|nil)( edition)?\s*$/i, '').replace(/\s+/g, ' ').trim(),
    status: clean(status),
    notices: all(root, 'notice').map(clean).filter(Boolean),
    stories, rows,
    notes: paras(one(root, 'notes'))
  };
};

window.__parseSignal110 = (cur, meta) => {
  const g = cur.data || cur;
  const hold = [];
  const isNil = /NIL EDITION|NO QUALIFYING SIGNAL/i.test([g.status, g.eyebrow, g.h1].join(' '));
  const kind = (s) => { const r = s.role.toUpperCase(); if (/^LEAD/.test(r)) return 'lead'; if (/^THEME/.test(r)) return 'theme'; if (/^ONE TO WATCH|^WATCH/.test(r)) return 'watch'; return 'other'; };
  const out = { format: 'weekly-signal-v1', heading: g.eyebrow || 'FalconBridge Weekly Signal', themes: [], audit_log: [] };
  const item = (s) => ({ title: s.title, body: s.facts.join('\n\n'), ...(s.lens.length ? { lens: s.lens.join('\n\n') } : {}), ...(s.sources ? { sources: s.sources } : {}) });
  const skipped = [];
  for (const s of g.stories) {
    const k = kind(s);
    if (s.held) { skipped.push(s.role || s.title); continue; }
    if (k === 'lead' && !out.lead) out.lead = item(s);
    else if (k === 'theme') out.themes.push(item(s));
    else if (k === 'watch') out.watch = [s.title, ...s.facts, ...(s.lens.length ? ['FalconBridge Lens: ' + s.lens.join('\n\n')] : []), ...(s.sources ? [s.sources] : [])].join('\n\n');
  }
  for (const n of g.notices) { const m = n.match(/(Theme \d+|Lead topic|One to watch)[^.;]*?(withheld|held)/gi); if (m) skipped.push(...m); }
  for (const r of g.rows) { if (r.length >= 3) out.audit_log.push(`${r[0]}. ${r[1]} (${r[2]}), ${r[r.length - 2]} of 21${r[r.length - 1] ? ', selected' : ''}`); }
  out.audit_log.push(...g.notes);
  if (!out.audit_log.length) delete out.audit_log;
  out.issue = g.edition || g.eyebrow;
  const rp = (g.meta.match(/Review window\s*(.*?)\s*(?=Territory lead|Prepared|Register|$)/i) || [])[1];
  if (rp) out.review_period = rp;
  const register = (g.meta.match(/Register\s*(\S+ v[\d.]+)/i) || [])[1] || '';
  if (g.attrib) out.briefing = g.attrib;
  if (isNil) hold.push('Nil edition: not published, report in one line');
  if (!out.lead && !isNil) hold.push('No lead topic: HOLD for CJ');
  const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’'"]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const leadTitle = out.lead ? out.lead.title : (out.themes[0] ? out.themes[0].title : '');
  let slug = `${meta.territory}-week-${meta.week}-2026-${slugify(leadTitle)}`;
  if (slug.length > 80) slug = slug.slice(0, 80).replace(/-+$/, '').replace(/-[a-z0-9]*$/, '');
  const scan = { slug, title: `${meta.name} · Week ${meta.week} · Weekly Signal`, service: 'raas', week_of: meta.week_of, signal: out.lead ? out.lead.body : (out.themes[0] ? out.themes[0].body : ''), question: leadTitle, content: out };
  return { territory: meta.territory, scan, head: g.meta, register, hold, held_themes: skipped, notices: g.notices, edition: g.status };
};
'parser v1.10 ready';
