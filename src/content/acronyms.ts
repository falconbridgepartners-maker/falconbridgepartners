/**
 * The site's acronyms, spelled out. Wherever one appears in prose it is rendered by
 * src/components/dss/Acronym.tsx: the full name on hover, with the detail behind More.
 * Wording supplied by Joel, October 2026.
 */
export type AcronymInfo = {
  /** The acronym as it appears in text. */
  key: string;
  /** The words in full. */
  name: string;
  /** The governing question, where the service has one. */
  question?: string;
  /** The detail behind More, one string per paragraph. */
  more: string[];
  /** Where Visit the page points. */
  href?: string;
};

export const ACRONYMS: Record<string, AcronymInfo> = {
  GDRS: {
    key: 'GDRS',
    name: 'Global Discovery Research System',
    more: [
      'In full, GDRS stands for Global Discovery Research System, the current name of the practice formerly known as the Global Desktop Research Service. A GDRS study is desktop research: it is built from publicly verifiable sources, such as legislation, regulators, official registers, statutory filings, multilateral datasets, peer-reviewed literature and verified trade and retail evidence, every one of them fetched live during the study and recorded with its access date and fetch result. It does not include interviews, site visits or privileged information unless the engagement expressly commissioned them.',
      'Equally important is what a GDRS report is not. It is research intelligence, not professional advice: nothing in it is legal, regulatory, tax, investment or medical advice, and its regulatory findings are expressly research findings that require specialist confirmation before being relied on for any filing or transaction. Its recommendations are suggestive by design. The report will tell you what you could consider and what doing so could conceivably produce, and it will never tell you what you should do. That is not timidity; it is the boundary between research and advice, kept deliberately visible.',
      'Finally, the report is issued under a Single-Use Licence stated in its opening sections: it is prepared for its named recipient and purpose, and it is not for onward distribution without permission.',
    ],
    href: '/research',
  },
  CEaaS: {
    key: 'CEaaS',
    name: 'Critical Evaluation as a Service',
    question: 'What does the proposition presently support, and what must be substantiated before it receives further consideration?',
    more: [
      'CEaaS examines material claims, assumptions, dependencies and present substantiation in a proposition, plan or question. It distinguishes missing information, unsuccessful verification and contradictory evidence, and prioritises what should reasonably be established next.',
    ],
    href: '/decision-support-system/critical-evaluation',
  },
  RaaS: {
    key: 'RaaS',
    name: 'Research as a Service',
    question: 'What does the evidence support, what remains uncertain, and what does that mean for your decision?',
    more: [
      'RaaS investigates a defined question through the Global Discovery Research System (GDRS) and delivers a complete bespoke package: the investigation itself, and the means for readers to understand, challenge and apply it at the depth their decision requires.',
    ],
    href: '/decision-support-system/research',
  },
  CaaS: {
    key: 'CaaS',
    name: 'Coaching as a Service',
    question: 'What is the decision you need to understand, explain and own?',
    more: [
      'CaaS is a confidential coaching relationship that helps a leader examine assumptions, pressures and trade-offs to clarify a consequential decision. The leader develops a decision they can explain and own.',
    ],
    href: '/decision-support-system/coaching',
  },
  EMaaS: {
    key: 'EMaaS',
    name: 'Execution Modelling as a Service',
    question: 'What must be true, built, sequenced and governed for your chosen direction to work?',
    more: [
      'EMaaS makes the requirements for execution explicit and tests them against the organisation’s actual capacity. FBP designs the model. The client owns and manages implementation.',
    ],
    href: '/decision-support-system/execution-modelling',
  },
  AaaS: {
    key: 'AaaS',
    name: 'Advisory as a Service',
    question: 'What matters now as reality changes?',
    more: [
      'AaaS provides context-sensitive strategic advice as an initiative unfolds and circumstances change. It challenges drift and considers options within a defined mandate. The client retains executive authority and operational responsibility.',
    ],
    href: '/decision-support-system/advisory',
  },
  IRaaS: {
    key: 'IRaaS',
    name: 'Intelligence Research as a Service',
    more: [
      'Intelligence Research as a Service is an emerging application: client-specific services developed and operated using FalconBridge’s proprietary systems, processes and intellectual property. A continuing research capability shaped around the client’s priorities. It can connect relevant signals to research questions, selected investigations and communication outputs.',
    ],
    href: '/bespoke-managed-services',
  },
};

/** Matches any known acronym as a whole word. */
export const ACRONYM_PATTERN = /\b(GDRS|CEaaS|RaaS|CaaS|EMaaS|AaaS|IRaaS)\b/g;
