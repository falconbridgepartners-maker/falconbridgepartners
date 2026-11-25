/**
 * Research licence prices, price bands and the local-currency estimate.
 *
 * Prices are set in AED in the Research Licences (Version 1.0) and shown in US$ at the AED peg. Buyers registered in a
 * country the World Bank does not class as high income pay 40% less. UAE buyers pay 5% UAE VAT; nobody else is charged VAT.
 */

export const AED_PER_USD = 3.6725;
export const REDUCTION = 0.4;
export const UAE_VAT = 0.05;

export type LicenceId = 't2' | 't3';
export type Tier = 'new' | 'back';

/** AED prices from section 7 of the Research Licences, standard band. */
export const AED_PRICES = {
  commissioned: { t2: 49500, t3: 85780, t4: 128670 },
  new: { t2: 24750, t3: 42900 },
  back: { t2: 19875, t3: 34450 },
} as const;

export const LICENCES: { id: LicenceId; name: string; short: string; term: string; desc: string }[] = [
  { id: 't2', name: 'Type 2 · Single Use · 12 months', short: 'Type 2: Single Use', term: '12 months', desc: 'One stated business purpose, for your officers, staff and professional advisers.' },
  { id: 't3', name: 'Type 3 · Multi-Use · 24 months', short: 'Type 3: Multi-Use', term: '24 months', desc: 'Any purpose within your organisation, and sharing with controlled external recipients such as agents, partners and investors.' },
];

export const usdFromAed = (aed: number) => Math.round(aed / AED_PER_USD);

/** Ready-made reports become back-catalogue reports three months after publication. */
export function tierFor(publishedAt: string | null, now = new Date()): Tier {
  if (!publishedAt) return 'back';
  const p = new Date(publishedAt);
  const cutoff = new Date(p);
  cutoff.setUTCMonth(cutoff.getUTCMonth() + 3);
  return now >= cutoff ? 'back' : 'new';
}

/**
 * High-income economies in the World Bank classification for FY27 (1 Jul 2026 to 30 Jun 2027), as ISO 3166 codes.
 * FY27 moved no country into or out of high income (World Bank Data Blog, 1 Jul 2026). Review each July.
 * Channel Islands = JE and GG.
 */
export const HIGH_INCOME = new Set([
  'AS', 'AD', 'AG', 'AW', 'AU', 'AT', 'BS', 'BH', 'BB', 'BE', 'BM', 'VG', 'BN', 'BG', 'CA', 'KY', 'JE', 'GG', 'CL', 'CR', 'HR', 'CW',
  'CY', 'CZ', 'DK', 'EE', 'FO', 'FI', 'FR', 'PF', 'DE', 'GI', 'GR', 'GL', 'GU', 'GY', 'HK', 'HU', 'IS', 'IE', 'IM', 'IL', 'IT', 'JP',
  'KR', 'KW', 'LV', 'LI', 'LT', 'LU', 'MO', 'MT', 'MC', 'NR', 'NL', 'NC', 'NZ', 'MP', 'NO', 'OM', 'PW', 'PA', 'PL', 'PT', 'PR', 'QA',
  'RO', 'RU', 'SM', 'SA', 'SC', 'SG', 'SX', 'SK', 'SI', 'ES', 'KN', 'MF', 'SE', 'CH', 'TW', 'TT', 'TC', 'AE', 'GB', 'US', 'UY', 'VI',
]);

/** Every country a buyer can be registered in (ISO 3166-1 alpha-2). */
const CODES = (
  'AF AL DZ AS AD AO AG AR AM AW AU AT AZ BS BH BD BB BY BE BZ BJ BM BT BO BA BW BR VG BN BG BF BI CV KH CM CA KY CF TD CL CN CO KM CD CG ' +
  'CR CI HR CU CW CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FO FJ FI FR PF GA GM GE DE GH GI GR GL GD GU GT GG GN GW GY HT HN HK HU IS ' +
  'IN ID IR IQ IE IM IL IT JM JP JE JO KZ KE KI KP KR XK KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME ' +
  'MA MZ MM NA NR NP NL NC NZ NI NE NG MK MP NO OM PK PW PS PA PG PY PE PH PL PT PR QA RO RU RW WS SM ST SA SN RS SC SL SG SX SK SI SB SO ' +
  'ZA SS ES LK KN LC MF VC SD SR SE CH SY TW TJ TZ TH TL TG TO TT TN TR TM TC TV UG UA AE GB US UY UZ VU VE VN VI YE ZM ZW'
).split(' ');

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
export const countryName = (code: string) => (code === 'XK' ? 'Kosovo' : regionNames.of(code) ?? code);

export type Country = { code: string; name: string; high: boolean; currency: string | null };

/** Local currency for the estimate. US$ countries and anything unlisted get no estimate. */
const CURRENCY: Record<string, string> = {
  AE: 'AED', SA: 'SAR', QA: 'QAR', KW: 'KWD', BH: 'BHD', OM: 'OMR', JO: 'JOD', EG: 'EGP', MA: 'MAD', TN: 'TND', LB: 'LBP', IQ: 'IQD', TR: 'TRY', IL: 'ILS',
  GB: 'GBP', IE: 'EUR', DE: 'EUR', FR: 'EUR', NL: 'EUR', BE: 'EUR', LU: 'EUR', AT: 'EUR', IT: 'EUR', ES: 'EUR', PT: 'EUR', GR: 'EUR', FI: 'EUR', EE: 'EUR',
  LV: 'EUR', LT: 'EUR', SK: 'EUR', SI: 'EUR', MT: 'EUR', CY: 'EUR', HR: 'EUR', MC: 'EUR', SM: 'EUR', AD: 'EUR', BG: 'BGN', RO: 'RON', PL: 'PLN', CZ: 'CZK',
  HU: 'HUF', DK: 'DKK', SE: 'SEK', NO: 'NOK', IS: 'ISK', CH: 'CHF', LI: 'CHF',
  CA: 'CAD', MX: 'MXN', BR: 'BRL', AR: 'ARS', CL: 'CLP', CO: 'COP', PE: 'PEN', UY: 'UYU', CR: 'CRC',
  ZA: 'ZAR', NA: 'NAD', BW: 'BWP', ZW: 'ZWG', ZM: 'ZMW', MW: 'MWK', MZ: 'MZN', KE: 'KES', UG: 'UGX', TZ: 'TZS', RW: 'RWF', ET: 'ETB', NG: 'NGN', GH: 'GHS',
  MU: 'MUR', SC: 'SCR', MG: 'MGA',
  IN: 'INR', PK: 'PKR', BD: 'BDT', LK: 'LKR', NP: 'NPR', SG: 'SGD', MY: 'MYR', ID: 'IDR', TH: 'THB', PH: 'PHP', VN: 'VND', CN: 'CNY', HK: 'HKD', TW: 'TWD',
  JP: 'JPY', KR: 'KRW', AU: 'AUD', NZ: 'NZD', FJ: 'FJD', KZ: 'KZT', UZ: 'UZS', AZ: 'AZN', GE: 'GEL', AM: 'AMD',
};

export const COUNTRIES: Country[] = CODES.map((code) => ({ code, name: countryName(code), high: HIGH_INCOME.has(code), currency: CURRENCY[code] ?? null }))
  .sort((a, b) => a.name.localeCompare(b.name, 'en'));

export const isCountry = (code: string | null | undefined): code is string => Boolean(code && COUNTRIES.some((c) => c.code === code));

export type Quote = { aedStandard: number; aed: number; usd: number; usdStandard: number; vat: number; total: number; reduced: boolean; uae: boolean };

/** The price a buyer pays for a ready-made report, in US$, from the AED price list. */
export function quote(licence: LicenceId, tier: Tier, country: string): Quote {
  const aedStandard = AED_PRICES[tier][licence];
  const reduced = !HIGH_INCOME.has(country);
  const aed = reduced ? aedStandard * (1 - REDUCTION) : aedStandard;
  const usd = usdFromAed(aed);
  const uae = country === 'AE';
  const vat = uae ? Math.round(usd * UAE_VAT) : 0;
  return { aedStandard, aed, usd, usdStandard: usdFromAed(aedStandard), vat, total: usd + vat, reduced, uae };
}

/** The standard Single Use price for a report, for the "From US$…" line (as in the 24 Nov 2026 mock-up). */
export const fromPrice = (tier: Tier) => usdFromAed(AED_PRICES[tier].t2);

/**
 * Units of each currency per US$, refreshed daily from a public rate feed. Used only for the estimate shown beside the
 * US$ price; the exact local amount is set at checkout. Returns an empty map if the feed is unreachable, and the
 * estimate is then left out. AED is the peg and never depends on the feed.
 */
export async function usdRates(): Promise<Record<string, number>> {
  const out: Record<string, number> = { AED: AED_PER_USD, SAR: 3.75, QAR: 3.64, BHD: 0.376, OMR: 0.3845, JOD: 0.709 };
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', { next: { revalidate: 86400 } });
    if (!res.ok) return out;
    const data = (await res.json()) as { result?: string; rates?: Record<string, number> };
    if (data.result !== 'success' || !data.rates) return out;
    for (const [k, v] of Object.entries(data.rates)) if (typeof v === 'number' && v > 0 && !(k in out)) out[k] = v;
  } catch { /* estimate omitted */ }
  return out;
}
