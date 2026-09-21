import React from 'react';
import { research } from '@/content/site';
import type { PartnerView } from '@/lib/partners';
import { WORLD_OUTLINE } from './worldOutline';

/** Where we work — scan territories and partner bases on a restrained equirectangular map. */
const points: { key: string; name: string; lon: number; lat: number; kind: 'scan' | 'planned'; labelLeft?: boolean }[] = [
    { key: 'uae-gcc', name: 'UAE / GCC', lon: 55.3, lat: 25.2, kind: 'scan' },
    { key: 'south-africa', name: 'South Africa', lon: 28.0, lat: -26.2, kind: 'scan', labelLeft: true },
    { key: 'new-zealand', name: 'New Zealand', lon: 174.8, lat: -41.3, kind: 'scan' },
    { key: 'mauritius', name: 'Mauritius', lon: 57.5, lat: -20.2, kind: 'scan' },
    { key: 'north-carolina', name: 'North Carolina', lon: -79.0, lat: 35.6, kind: 'scan' },
    { key: 'singapore', name: 'Singapore', lon: 103.8, lat: 1.35, kind: 'planned' },
];

const W = 1000, H = 440;
// Equirectangular, longitude −120…180 and latitude −60…70, so the five points sit comfortably on the canvas.
const project = (lon: number, lat: number) => ({ x: ((lon + 120) / 300) * (W - 120) + 60, y: ((70 - lat) / 130) * (H - 80) + 40 });

const TerritoryMap: React.FC<{ partners: PartnerView[] }> = ({ partners }) => (
    <div className="tile p-4 md:p-6">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Territories covered by FalconBridge's weekly scans and where its partners are based">
            <defs>
                <clipPath id="tmClip"><rect x="0" y="0" width={W} height={H} /></clipPath>
            </defs>
            {/* land outlines — no labels */}
            <path d={WORLD_OUTLINE} clipPath="url(#tmClip)" fill="none" stroke="#c8a86a" strokeOpacity="0.35" strokeWidth="0.9" strokeLinejoin="round" />
            {/* graticule */}
            {Array.from({ length: 11 }).map((_, i) => (
                <line key={`v${i}`} x1={(i * W) / 10} y1={0} x2={(i * W) / 10} y2={H} stroke="#c8a86a" strokeOpacity="0.08" />
            ))}
            {Array.from({ length: 6 }).map((_, i) => (
                <line key={`h${i}`} x1={0} y1={(i * H) / 5} x2={W} y2={(i * H) / 5} stroke="#c8a86a" strokeOpacity="0.08" />
            ))}
            {(() => { const eq = project(0, 0).y; return <line x1={0} y1={eq} x2={W} y2={eq} stroke="#c8a86a" strokeOpacity="0.25" />; })()}
            {points.map((p) => {
                const { x, y } = project(p.lon, p.lat);
                const planned = p.kind === 'planned';
                const who = partners.filter((x) => x.territories.includes(p.key)).map((x) => `${x.name} · ${x.shortTitle}`).join('  ·  ');
                const partnerLabel = who || undefined;
                const flip = p.labelLeft || p.lon > 120; // label to the left near the right edge or where labels would collide
                const tx = flip ? x - 16 : x + 16;
                const anchor = flip ? 'end' : 'start';
                return (
                    <g key={p.key}>
                        <circle cx={x} cy={y} r={planned ? 7 : 8} fill={planned ? 'none' : '#c8a86a'} stroke="#e3ce98" strokeWidth={planned ? 1.5 : 1} strokeDasharray={planned ? '3 3' : undefined} />
                        <circle cx={x} cy={y} r="18" fill="#c8a86a" fillOpacity="0.12" />
                        <text x={tx} y={y + 5} textAnchor={anchor} fontFamily="Arial, Helvetica, sans-serif" fontSize="15" fontWeight="700" fill="#f4f2ec">{p.name}</text>
                        {partnerLabel && <text x={tx} y={y + 24} textAnchor={anchor} fontFamily="Arial, Helvetica, sans-serif" fontSize="12" fill="#b8bdc8">{partnerLabel}</text>}
                    </g>
                );
            })}
        </svg>
        <div className="flex flex-wrap gap-x-8 gap-y-2 mt-4 text-sm text-white/55">
            <span className="inline-flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-brand-gold inline-block" /> Weekly scan territory</span>
            <span className="inline-flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full border border-dashed border-brand-gold-pale inline-block" /> Building</span>
            <span className="ml-auto">{research.curiosity.territoryNote}</span>
        </div>
        <p className="text-sm text-white/45 mt-3">
            Partners: {partners.map((p) => `${p.name} (${p.locationShort}) · ${p.title}`).join('  ·  ')}.
        </p>
    </div>
);

export default TerritoryMap;
