/**
 * FalconBridge Research Licences (Version 1.0), as set out in the licence document and the 24 Nov 2026 mock-up.
 * One source for the legal page, the Buy page and the report notices. Prices are set in AED in the document and shown in US$
 * at the AED peg (3.6725). Edit wording here only.
 */
export type Item = { t: string; bullet?: boolean; note?: boolean };
export type Block = { h: string; items: Item[] };
const P = (t: string): Item => ({ t, bullet: true });
const T = (t: string): Item => ({ t });
const B = (h: string, items: Item[]): Block => ({ h, items });
const N = (t: string): Block => B('Short notice', [{ t, note: true }]);
const INC = 'This licence incorporates the FalconBridge Research Licence Common Terms (Version 1.0), which form part of it.';
export const intro: string[] = [
'Welcome to FalconBridge Partners’ guide to research licensing. It explains the ways you can use the research reports we prepare, so you can choose the licence that fits your purpose and use our research properly.',
'At FalconBridge we are not only researchers but also users of research. We believe management and decision-making should rest on well-founded information, and that good research saves time, effort and cost over the long term.',
'Thorough research is unpredictable and time-consuming, and it takes place amid a great deal of information and misinformation. Our licences balance what our clients need with the cost of doing the work properly. We prefer to be open about how we license our work, because clear terms build lasting, mutually beneficial relationships.',
'This guide sets out four licence types, from a free personal licence to an exclusive licence for commissioned studies, and the prices that apply to each. We never disclose one client’s information to another.'
];
export const ways: { a: string; b: string; c: string }[] = [
{ a: 'What it is', b: 'Research FalconBridge has already completed and published', c: 'Research prepared for your own question and brief' },
{ a: 'Free personal use', b: '✓ Type 1', c: '—' },
{ a: 'Business licences', b: '✓ Type 2 or Type 3', c: '✓ Type 2, 3 or 4' },
{ a: 'Exclusivity', b: '✗ commission a study instead', c: '✓ Type 4' },
{ a: 'How to buy', b: 'Online at falconbp.com', c: 'By proposal and Terms of Engagement' }
];
export const audiences: { a: string; b: string; c: string }[] = [
{ a: 'A1  Closed', b: 'Your officers and staff', c: 'Restricted' },
{ a: 'A2  Closed', b: 'Your professional advisers (legal, audit, banking, consulting)', c: 'Restricted; bound by confidentiality' },
{ a: 'B   Controlled', b: 'Distribution networks, agents, partners, investors, named external recipients', c: 'Limited; recipients are known to you' },
{ a: 'C   Public', b: 'Advertising, social media, press, open websites', c: 'Uncontrolled' }
];
export const types: { term: string; name: string; desc: string }[] = [
{ term: '90 days', name: 'Type 1: FREE', desc: 'Personal, non-commercial reading of ready-made reports.' },
{ term: '12 months', name: 'Type 2: Single Use', desc: 'One stated business purpose, for your officers, staff and professional advisers.' },
{ term: '24 months', name: 'Type 3: Multi-Use', desc: 'Any purpose within your organisation, and sharing with controlled external recipients such as agents, partners and investors.' },
{ term: '36 months', name: 'Type 4: Exclusive', desc: 'All of the above, plus public use and exclusivity. Available for commissioned studies only.' }
];
export const aiRows: { a: string; b: string; c: string }[] = [
{ a: '1  Business systems', b: 'Cloud email, document management, shared drives', c: '✓ Type 2 and above; storage and sharing within the licensed circle only' },
{ a: '2  Controlled AI', b: 'Business AI tools that contractually do not train on inputs; access confined to the licensed circle; buyer controls retention', c: '✓ Type 2 and above; FalconBridge credited as source' },
{ a: '3  Public or consumer AI', b: 'Free or personal AI tools that may retain or train on inputs', c: '✗ all types' }
];
export const commonTerms: { n: string; h: string; t: string }[] = [
{ n: '1.', h: 'Ownership.', t: 'The report and all intellectual property in it ("IP") remain the exclusive property of FalconBridge Partners ("FalconBridge"). A licence grants a right of use only. No IP is transferred.' },
{ n: '2.', h: 'Credit.', t: 'Every permitted quotation, reproduction or use must credit FalconBridge Partners as the source. Permitted reproductions must be unchanged.' },
{ n: '3.', h: 'Quoting, links and social media.', t: 'Short excerpts may be quoted in any medium, including social media, with credit to FalconBridge Partners. A short excerpt is no more than 100 words of text, or one chart or table, per publication. For ready-made reports, the link to the report’s page on falconbp.com may be shared freely. For commissioned studies, excerpts may be quoted publicly only under a Type 4 licence; under Types 2 and 3 they may be quoted only within the audience the licence permits. Posting in any group, feed, page or forum counts as public use, even where membership is restricted. Posting, attaching or uploading the report itself, or reproducing substantial parts of it, is permitted only where the licence allows public use.' },
{ n: '4.', h: 'Derivative output.', t: 'Any summary, translation, rewording or other output derived from the report, whether produced by hand or with artificial intelligence (AI), remains derived from FalconBridge research. FalconBridge retains all rights in it. It must credit FalconBridge as the source and may be used only within the licence held.' },
{ n: '5.', h: 'Electronic systems and AI.', t: 'Where the licence permits, the report may be stored and shared in the licensee’s business systems (such as cloud email and document management), and used in controlled AI tools that contractually do not train on inputs, with access limited to those the licence permits and retention under the licensee’s control. The report must never be loaded into public or consumer AI tools that may retain or train on inputs.' },
{ n: '6.', h: 'Confidentiality.', t: 'The licensee keeps the report within the audience its licence permits and ensures that everyone given access complies with these terms.' },
{ n: '7.', h: 'No resale or transfer.', t: 'The licensee may not sell, sub-license, assign or otherwise transfer the report or the licence.' },
{ n: '8.', h: 'Term and expiry.', t: 'The licence runs for the term stated in the licence statement. On expiry, all use must stop, except that one archival copy may be kept where needed for legal or regulatory record-keeping.' },
{ n: '9.', h: 'Upgrades.', t: 'A licence may be upgraded to a higher type by paying only the difference in price. The upgraded licence runs from the original licence date.' },
{ n: '10.', h: 'No warranty; not advice.', t: 'The report reflects information available at its date of publication and is provided "as is", without warranty of any kind, express or implied, as to its content, accuracy or completeness. It does not constitute investment, legal, tax or other professional advice. The licensee remains the decision-maker.' },
{ n: '11.', h: 'Liability.', t: 'FalconBridge’s total liability in connection with the report is limited to the fee paid for the licence. For a free licence, FalconBridge accepts no liability to the fullest extent permitted by law.' },
{ n: '12.', h: 'Breach.', t: 'If these terms are breached, FalconBridge may end the licence immediately and reserves the right to recover any damages incurred.' },
{ n: '13.', h: 'Governing law.', t: 'These terms are governed by the laws of the United Arab Emirates, and the courts of the United Arab Emirates have jurisdiction.' },
{ n: '14.', h: 'Enquiries.', t: 'For further usage rights or upgrades, contact joel@falconbp.com.' }
];
export type SumRow = { g?: string; a?: string; b?: string; c?: string; d?: string; e?: string };
export const summaryRows: SumRow[] = [
{ g: 'Use and audience' },
{ a: 'Personal use', b: '✓', c: '✓', d: '✓', e: '✓' },
{ a: 'A1: Officers and staff', b: '✗', c: '✓ one stated purpose', d: '✓ any purpose', e: '✓ any purpose' },
{ a: 'A2: Professional advisers', b: '✗', c: '✓ under confidentiality', d: '✓', e: '✓' },
{ a: 'B: Controlled external', b: '✗', c: '✗', d: '✓ unchanged, credited', e: '✓ unchanged, credited' },
{ a: 'C: Public', b: '✗', c: '✗', d: '✗', e: '✓ unchanged, credited' },
{ g: 'Content rights' },
{ a: 'Quote short excerpts with credit, any medium (max. 100 words, or one chart or table, per publication)', b: '✓', c: '✓ ready-made; commissioned: internal only', d: '✓ ready-made; commissioned: internal only', e: '✓' },
{ a: 'Share the link to the report page', b: '✓', c: '✓ ready-made', d: '✓ ready-made', e: '—' },
{ a: 'Post the report itself on social media or websites', b: '✗', c: '✗', d: '✗', e: '✓ unchanged, credited' },
{ a: 'Amend or create derivative works', b: '✗', c: '✗', d: '✗', e: '✓ by written agreement' },
{ a: 'Resell or sub-license', b: '✗', c: '✗', d: '✗', e: '✗' },
{ g: 'Systems and AI (see section 6)' },
{ a: 'Business systems (cloud email, storage)', b: '✗', c: '✓', d: '✓', e: '✓' },
{ a: 'Controlled AI, with credit', b: '✗', c: '✓', d: '✓', e: '✓' },
{ a: 'Public or consumer AI', b: '✗', c: '✗', d: '✗', e: '✗' },
{ g: 'Term and availability' },
{ a: 'Exclusivity', b: '✗', c: '✗', d: '✗', e: '✓' },
{ a: 'Term', b: '90 days', c: '12 months', d: '24 months', e: '36 months' },
{ a: 'Upgrade (pay only the difference)', b: 'to any paid type', c: 'to Type 3 or 4', d: 'to Type 4', e: 'Renew by agreement' },
{ a: 'Commissioned studies', b: '—', c: '✓', d: '✓', e: '✓' },
{ a: 'Ready-made reports', b: '✓', c: '✓', d: '✓', e: '✗ commission instead' }
];
export const statements: { title: string; blocks: Block[] }[] = [
{ title: 'Licence statement: Type 1: FREE (Personal Use)', blocks: [
B('', [T('This research report ("report") was prepared by FalconBridge Partners ("FalconBridge") as part of its own research. It is made available free of charge for personal, non-commercial use for 90 days from the date of download.')]),
B('You may', [P('• read the report for your own information;'), P('• share the link to the report’s page on falconbp.com; and'), P('• quote short excerpts (up to 100 words, or one chart or table, per publication) in any medium, including social media, with credit to FalconBridge Partners.')]),
B('You may not', [P('• use the report in or for any business, including your employer’s or clients’ work, board or investment papers, proposals or decisions;'), P('• upload, attach or post the report itself on social media or any website, or reproduce substantial parts of it;'), P('• share, distribute, reproduce or publish the report;'), P('• amend the report or create derivative works from it;'), P('• load the report into any AI tool or electronic system other than for personal reading; or'), P('• sell or transfer the report.')]),
B('', [T('Business use requires a paid licence (Type 2 or Type 3), available at falconbp.com. ' + INC + ' By downloading this report you accept these terms.')]),
N('FalconBridge Research Licence Type 1 (FREE): personal, non-commercial use only, for 90 days from download. Business use requires a paid licence: falconbp.com. © FalconBridge Partners. E&OE | All Rights Strictly Reserved.')
] },
{ title: 'Licence statement: Type 2: Single Use (12 months)', blocks: [
B('', [T('This research report ("report") is licensed by FalconBridge Partners ("FalconBridge") to [Licensee] for 12 months from [date of delivery] for the following stated objective: [Purpose] within the [Target market / sector / focus area] as viewed from the perspective of [Own market / sector / focus area].')]),
B('Permitted, for the stated objective only', [P('• use by the licensee’s officers and staff;'), P('• sharing with the licensee’s professional advisers who are bound by confidentiality; and'), P('• storage in the licensee’s business systems and use in controlled AI tools, as defined in the Common Terms.')]),
B('Quoting and links', [P('• for ready-made reports: sharing the link to the report’s page on falconbp.com, and quoting short excerpts (up to 100 words, or one chart or table, per publication) in any medium, with credit to FalconBridge Partners; and'), P('• for commissioned studies: quoting excerpts only within the audience permitted above.')]),
B('Not permitted', [P('• use for any purpose other than the stated objective;'), P('• sharing with anyone other than officers, staff and professional advisers;'), P('• posting the report itself, or substantial parts of it, on social media or any website;'), P('• inclusion in marketing, sales or promotional material, or any distribution or publication;'), P('• amending the report or creating derivative works from it;'), P('• loading the report into public or consumer AI tools; or'), P('• selling or transferring the report or this licence.')]),
B('', [T('This licence is not exclusive. FalconBridge may license the same research to others. For a commissioned study, FalconBridge will do so only after 90 days from delivery, and only in an anonymised form that does not identify the licensee or disclose its confidential information. Wider rights are available by upgrading to Type 3 (or, for commissioned studies, Type 4) and paying only the difference. ' + INC + ' By accepting this report the licensee accepts these terms.')]),
N('FalconBridge Research Licence Type 2 (Single Use): licensed to [Licensee] for its stated objective only, for 12 months from [date]. Officers, staff and professional advisers only. © FalconBridge Partners. E&OE | All Rights Strictly Reserved.')
] },
{ title: 'Licence statement: Type 3: Multi-Use (24 months)', blocks: [
B('', [T('This research report ("report") is licensed by FalconBridge Partners ("FalconBridge") to [Licensee] for 24 months from [date of delivery], for multiple purposes.')]),
B('Permitted', [P('• use for any purpose by the licensee’s officers and staff;'), P('• sharing with the licensee’s professional advisers;'), P('• sharing with controlled external recipients known to the licensee, such as distribution networks, agents, partners, investors and named recipients;'), P('• inclusion in marketing, sales and promotional material sent to those controlled recipients;'), P('• reproduction and distribution within that controlled circle, unchanged and with credit to FalconBridge Partners; and'), P('• storage in the licensee’s business systems and use in controlled AI tools, as defined in the Common Terms.')]),
B('Quoting and links', [P('• for ready-made reports: sharing the link to the report’s page on falconbp.com, and quoting short excerpts (up to 100 words, or one chart or table, per publication) in any medium, with credit to FalconBridge Partners; and'), P('• for commissioned studies: quoting excerpts only within the internal and controlled external audience permitted above.')]),
B('Not permitted', [P('• public use, including advertising, social media, press and open websites;'), P('• posting in any group, feed, page or forum, including closed or members-only LinkedIn groups;'), P('• amending the report or creating derivative works from it;'), P('• loading the report into public or consumer AI tools; or'), P('• selling or transferring the report or this licence.')]),
B('', [T('This licence is not exclusive. FalconBridge may license the same research to others. For a commissioned study, FalconBridge will do so only after 90 days from delivery, and only in an anonymised form that does not identify the licensee or disclose its confidential information. For commissioned studies, exclusive and public rights are available by upgrading to Type 4 and paying only the difference. ' + INC + ' By accepting this report the licensee accepts these terms.')]),
N('FalconBridge Research Licence Type 3 (Multi-Use): licensed to [Licensee] for 24 months from [date]. Internal and controlled external use, unchanged and credited; no public use. © FalconBridge Partners. E&OE | All Rights Strictly Reserved.')
] },
{ title: 'Licence statement: Type 4: Exclusive (36 months, commissioned studies only)', blocks: [
B('', [T('This research report ("report") was commissioned by [Licensee] and is licensed to it by FalconBridge Partners ("FalconBridge") on an exclusive basis for 36 months from [date of delivery].')]),
B('Permitted', [P('• use for any purpose by the licensee’s officers and staff;'), P('• sharing with the licensee’s professional advisers;'), P('• sharing with controlled external recipients known to the licensee, such as distribution networks, agents, partners, investors and named recipients;'), P('• inclusion in marketing, sales and promotional material sent to those controlled recipients;'), P('• reproduction and distribution within that controlled circle, unchanged and with credit to FalconBridge Partners;'), P('• public use, including advertising, social media, press and open websites, unchanged and with credit to FalconBridge Partners;'), P('• storage in the licensee’s business systems and use in controlled AI tools, as defined in the Common Terms;'), P('• quoting excerpts publicly in any medium, with credit to FalconBridge Partners; and'), P('• amending the report or creating derivative works from it, but only by prior written agreement with FalconBridge.')]),
B('Exclusivity', [T('During the licence term, FalconBridge will not license, sell, publish or otherwise make available this report, or any substantial part of it, to anyone else. After the term, FalconBridge may do so, but only in an anonymised form that does not identify the licensee or disclose its confidential information. The licence may be renewed by agreement.')]),
B('Not permitted', [P('• loading the report into public or consumer AI tools; or'), P('• selling or transferring the report or this licence.')]),
B('', [T(INC + ' By accepting this report the licensee accepts these terms.')]),
N('FalconBridge Research Licence Type 4 (Exclusive): licensed exclusively to [Licensee] for 36 months from [date]. © FalconBridge Partners. E&OE | All Rights Strictly Reserved.')
] }
];
