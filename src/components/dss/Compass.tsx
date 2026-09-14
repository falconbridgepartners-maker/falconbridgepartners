import React from 'react';
import Link from 'next/link';
import { services } from '@/content/site';

/**
 * Decision Support System compass — built in code from deck slide 4 / DSS Overview.
 * "Your decision" at the centre; five services around it; the client holds the middle.
 * Replace with the locked Decision Compass v1.0 asset if the partners prefer the original.
 */
const positions: Record<string, { angle: number }> = {
    ceaas: { angle: -90 },
    raas: { angle: -18 },
    caas: { angle: 54 },
    emaas: { angle: 126 },
    aaas: { angle: 198 },
};

const Compass: React.FC<{ linked?: boolean }> = ({ linked = true }) => {
    const size = 640;
    const c = size / 2;
    const rOuter = 262;
    const rInner = 128;
    const rLabel = 196;

    const toXY = (angle: number, r: number) => {
        const a = (angle * Math.PI) / 180;
        return { x: c + r * Math.cos(a), y: c + r * Math.sin(a) };
    };

    const sectors = services.map((s, i) => {
        const start = positions[s.key].angle - 36;
        const end = positions[s.key].angle + 36;
        const p1 = toXY(start, rOuter), p2 = toXY(end, rOuter);
        const p3 = toXY(end, rInner), p4 = toXY(start, rInner);
        const d = `M ${p1.x} ${p1.y} A ${rOuter} ${rOuter} 0 0 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${rInner} ${rInner} 0 0 0 ${p4.x} ${p4.y} Z`;
        const l = toXY(positions[s.key].angle, rLabel);
        return { s, d, l, i };
    });

    return (
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[640px] mx-auto" role="img" aria-label="The FalconBridge Decision Support System: five services around the client's decision">
            <defs>
                <radialGradient id="cmpCentre" cx="50%" cy="45%" r="60%">
                    <stop offset="0%" stopColor="#3a3a3a" />
                    <stop offset="100%" stopColor="#1f1f1f" />
                </radialGradient>
                <linearGradient id="cmpSector" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#333333" />
                    <stop offset="100%" stopColor="#2a2a2a" />
                </linearGradient>
                <filter id="cmpShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000" floodOpacity="0.45" />
                </filter>
            </defs>

            {/* outer hairline ring */}
            <circle cx={c} cy={c} r={rOuter + 14} fill="none" stroke="#c8a86a" strokeOpacity="0.35" strokeWidth="1" />

            {sectors.map(({ s, d, l }) => {
                const content = (
                    <g className="group">
                        <path d={d} fill="url(#cmpSector)" stroke="#c8a86a" strokeOpacity="0.55" strokeWidth="1" filter="url(#cmpShadow)"
                              className="transition-all duration-300 group-hover:stroke-[#e3ce98]" />
                        <text x={l.x} y={l.y - 6} textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="22" fontWeight="700" fill="#e3ce98">{s.acronym}</text>
                        <text x={l.x} y={l.y + 16} textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="12.5" fill="#d9d9d9">{s.short}</text>
                    </g>
                );
                return linked ? (
                    <Link key={s.key} href={`/decision-support-system/${s.slug}`} aria-label={`${s.acronym} — ${s.name}`}>{content}</Link>
                ) : (
                    <g key={s.key}>{content}</g>
                );
            })}

            {/* centre */}
            <circle cx={c} cy={c} r={rInner - 10} fill="url(#cmpCentre)" stroke="#c8a86a" strokeWidth="1.5" filter="url(#cmpShadow)" />
            <text x={c} y={c - 6} textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontStyle="italic" fontSize="28" fill="#e3ce98">Your decision</text>
            <text x={c} y={c + 22} textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="12" fill="#b8bdc8">remains yours</text>
        </svg>
    );
};

export default Compass;
