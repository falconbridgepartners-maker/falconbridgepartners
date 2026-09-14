// Site copy — single source. Taken from the September 2026 partner-review documents:
// 0 Positioning and Messaging Foundation v1.1 · 1 Corporate Introduction v2.0 · 2 At a Glance
// 3 DSS Overview · 4.x Service Briefs · 5 Research Capability · 6.x Partner Profiles
// 7.x Situations · 8 Working with FalconBridge · 9 Bespoke Managed Services · 10 Visual Identity Guide
// Lines marked [DRAFT] were written in the documents' register where they are silent. Strike or edit.

export const firm = {
  name: 'FalconBridge Partners',
  legalEntity: 'FalconBridge Partners FZC LLC',
  domain: 'falconbp.com',
  tagline: 'Sharper thinking when the decision stays with you',
  subline: 'Research and strategic support for consequential business decisions.',
  shortDescription:
    'FalconBridge Partners provides research and strategic support for consequential business decisions, combining experienced human judgement with proprietary, AI-assisted methods.',
  standardIntroduction:
    'FalconBridge Partners helps founders, leaders, investors and advisers examine propositions, develop evidence and work through consequential business decisions. Its Decision Support System™ comprises Critical Evaluation, Research, Coaching, Execution Modelling and Advisory, available independently or together by choice. Experienced partners direct the work through proprietary systems, with humans remaining in control and actively involved throughout. The client retains the decision.',
  clientPromise:
    'We help you understand what supports a proposition, what remains uncertain and what your next decision requires. You retain the authority to decide. We agree the research, challenge or support that will be useful in your circumstances.',
  invitation: {
    heading: 'What needs to be understood before your next decision?',
    body: 'Bring the proposition, question or direction you are working on. Together, we can define the support it requires.',
    cta: 'Start a conversation',
  },
  linkedin: 'https://www.linkedin.com/company/falconbps',
  systemName: 'FalconBridge Decision Support System™',
  trademarkLine: 'FalconBridge Decision Support System™ is a trademark of FalconBridge Partners FZC LLC.',
  clarityLine: 'When the decision is yours, clarity cannot be outsourced. Borrowed certainty often introduces more risk than uncertainty itself.',
  integration:
    'Most decision-makers are not short of intelligence, experience or input. They are short of integration. Evidence, judgement and execution reality are usually examined separately, at different times, by different parties. The services below are available independently; what they have in common is that each is anchored to the decision the leader is actually making, so that the leader can integrate them.',
  whoWeAreNot: {
    heading: 'What FalconBridge is not',
    intro: 'The clearest way to describe the work is to say what it does not do.',
    items: [
      { title: 'Not a consultancy delivering recommendations', body: 'We do not provide answers for leaders to adopt, defend or hide behind. We examine what supports a proposition and what remains uncertain.' },
      { title: 'Not outsourced leadership', body: 'We do not step into the role of decision-maker, and we do not dilute accountability. The client retains the decision and operational responsibility.' },
      { title: 'Not coaching detached from consequence', body: 'Coaching is decision-bound. It exists to help a leader own a consequential choice, not as personal development without an outcome attached.' },
      { title: 'Not research without a decision attached', body: 'Research starts with the decision, the intended use and the evidence required. Information volume is not the product.' },
    ],
    closing: 'We do not make decisions for leaders. We make their thinking sharper.',
  },
  noDependency:
    'Our involvement is time-bound and decision-bound. When clarity stabilises and ownership is secure, our role diminishes. The goal is closure, not dependency.',
  honestFit:
    'Not every conversation results in an engagement. Where the decision does not warrant external support, or where the decision-maker is not prepared to retain ownership, we will say so. That protects trust and focus on both sides.',
  professionalExchange: 'A professional exchange, not a sales discussion.',
  firstQuestion: 'What decision are you actually being asked to make?',
  emails: { quincy: 'quincy@falconbp.com', joel: 'joel@falconbp.com', wayne: 'wayne@falconbp.com' },
};

export const forces = [
  {
    key: 'evidence',
    title: 'Evidence',
    questions: ['What supports the proposition?', 'What still needs to be established?'],
    services: ['ceaas', 'raas'],
    grouping: 'External signal',
  },
  {
    key: 'judgement',
    title: 'Judgement',
    questions: ['What matters to the decision-maker?', 'Which trade-offs can they own?'],
    services: ['caas'],
    grouping: 'Internal judgement',
  },
  {
    key: 'execution',
    title: 'Execution reality',
    questions: ['What will the organisation need?', 'What changes as delivery unfolds?'],
    services: ['emaas', 'aaas'],
    grouping: 'Execution reality',
  },
] as const;

export type ServiceKey = 'ceaas' | 'raas' | 'caas' | 'emaas' | 'aaas';

export interface Service {
  key: ServiceKey;
  slug: string;
  acronym: string;
  name: string;
  short: string;
  grouping: string;
  governingQuestion: string;
  summary: string; // one line from the DSS overview
  intro: string; // opening paragraph
  columns: { title: string; body: string }[];
  boundaryTitle: string;
  boundary: string;
  work: { title: string; body: string }[];
  outputs: { title: string; body: string };
  yourInvolvement: { title: string; body: string };
  limits: { title: string; body: string };
  closing: { title: string; body: string };
  related: ServiceKey[];
  notes?: { heading: string; items: { title: string; body: string }[]; closing?: string };
}

export const services: Service[] = [
  {
    key: 'ceaas',
    slug: 'critical-evaluation',
    acronym: 'CEaaS',
    name: 'Critical Evaluation as a Service',
    short: 'Critical Evaluation',
    grouping: 'External signal',
    governingQuestion:
      'What does the proposition presently support, and what must be substantiated before it receives further consideration?',
    summary: 'Assess claims and prioritise evidence gaps.',
    intro:
      'CEaaS examines material claims, assumptions, dependencies and present substantiation in a proposition, plan or question. It distinguishes missing information, unsuccessful verification and contradictory evidence, and prioritises what should reasonably be established next.',
    columns: [
      {
        title: 'When it is useful',
        body: 'A founder is preparing a funding case. An adviser is assessing an introduction. An investor or board is screening a proposition. A team needs to understand what its plan assumes. CEaaS can start with a pitch, a verbal brief, strategic context or an unanswered question.',
      },
      {
        title: 'What we examine',
        body: 'We identify material claims, assumptions and dependencies, then assess the support available for the intended decision. We distinguish missing information, unsuccessful verification and contradictory evidence. A gap does not, by itself, establish that a claim is false.',
      },
      {
        title: 'What it helps you do',
        body: 'Understand which weaknesses matter most and what evidence should reasonably be obtained next. The result supports a better-informed decision about further investigation, revision or consideration of the proposition.',
      },
    ],
    boundaryTitle: 'A substantive evaluation',
    boundary:
      'CEaaS evaluates the support behind a proposition. It does not endorse the proposition or guarantee funding, approval or readiness.',
    work: [
      { title: 'Claims and support', body: 'Identify the evidence offered for each material claim.' },
      { title: 'Gaps and consequence', body: 'Distinguish missing support from contradictory evidence.' },
      { title: 'A closure agenda', body: 'Prioritise the questions and evidence needed next.' },
    ],
    outputs: {
      title: 'Agreed outputs',
      body: 'The scope may include a critical evaluation, a claims and assumptions register, prioritised evidence gaps, a bounded readiness assessment and an executive debrief. The proposal specifies the deliverables required for your situation.',
    },
    yourInvolvement: {
      title: 'Your involvement',
      body: 'Provide the proposition, relevant supporting material, known uncertainties and the decision context. Identify the commissioning sponsor, intended recipients and any confidentiality or conflict considerations.',
    },
    limits: {
      title: 'Where the boundary sits',
      body: 'Closing gaps may require client disclosures, RaaS, commercial validation or specialist investigation. CEaaS does not automatically include audit, due diligence, valuation, legal verification or technical certification. Follow-on work is optional.',
    },
    closing: {
      title: 'Start with the proposition',
      body: 'Each DSS service is available independently. Further work follows an agreed need and scope. The client retains decision authority.',
    },
    related: ['raas'],
  },
  {
    key: 'raas',
    slug: 'research',
    acronym: 'RaaS',
    name: 'Research as a Service',
    short: 'Research',
    grouping: 'External signal',
    governingQuestion:
      'What does the evidence support, what remains uncertain, and what does that mean for your decision?',
    summary: 'Investigate a defined question through GDRS.',
    intro:
      'RaaS investigates a defined question through the Global Discovery Research System (GDRS) and delivers a complete bespoke package: the investigation itself, and the means for readers to understand, challenge and apply it at the depth their decision requires.',
    columns: [
      {
        title: 'When it is useful',
        body: 'A market needs investigation, an opportunity warrants comparison, a thesis needs testing or a strategic question remains unresolved. A question can be refined and validated at the start; the work need not begin with a fully formed brief.',
      },
      {
        title: 'How we investigate',
        body: 'The Global Discovery Research System (GDRS) structures the work from the question and scope through source discovery, verification, analysis and synthesis. Research relies primarily on secondary evidence, with human review of material conclusions.',
      },
      {
        title: 'What the evidence must show',
        body: 'We examine source identity, date, context and the precise claim supported. Contradictions, assumptions and material uncertainties remain visible. Findings carry an evidence cut-off date and clear scope limits.',
      },
    ],
    boundaryTitle: 'Scope governs the investigation',
    boundary:
      'Primary research, interviews, site visits, paid databases and specialist advice are included only where expressly agreed. Research supports the client’s decision.',
    work: [
      { title: 'User guide', body: 'Navigation, evidence language and study-specific reading pathways.' },
      { title: 'Executive deck', body: 'A structured briefing of the question, findings and implications.' },
      { title: 'Full research report', body: 'The substantive analysis, method and supporting records.' },
      { title: 'Executive summary', body: 'The central answer, reasoning and qualifications in concise prose.' },
      { title: 'Executive visual', body: 'The key relationships, conditions and implications at a glance.' },
      { title: 'Reference and link audit', body: 'A separate source-checking record, with exceptions and limitations.' },
    ],
    outputs: {
      title: 'A complete bespoke research package',
      body: 'Every RaaS study includes six elements, tailored to the question and to how readers will use the work.',
    },
    yourInvolvement: {
      title: 'Commission the work and agree the use',
      body: 'Define the question, decision context and intended recipients with us. The default research licence is Type-1 for the agreed purpose; broader use or exclusivity can be negotiated. FBP retains its IP.',
    },
    limits: {
      title: 'Findings are bounded',
      body: 'Findings remain bounded by scope, evidence and date. Specialist advice or primary research requires appropriate scope. An FBP reference audit is a source-checking exercise within stated scope, not third-party certification of every calculation or inference.',
    },
    closing: {
      title: 'Begin with the question',
      body: 'Each DSS service is available independently. Further work follows an agreed need and scope. The client retains decision authority.',
    },
    related: ['ceaas'],
  },
  {
    key: 'caas',
    slug: 'coaching',
    acronym: 'CaaS',
    name: 'Coaching as a Service',
    short: 'Coaching',
    grouping: 'Internal judgement',
    governingQuestion: 'What is the decision you need to understand, explain and own?',
    summary: 'Help a leader clarify and own a decision.',
    intro:
      'CaaS is a confidential coaching relationship that helps a leader examine assumptions, pressures and trade-offs to clarify a consequential decision. The leader develops a decision they can explain and own.',
    columns: [
      {
        title: 'A consequential choice',
        body: 'Leadership choices can involve competing priorities, uncertain evidence, personal responsibility and pressure from others. CaaS creates confidential space to examine how those forces affect your judgement.',
      },
      {
        title: 'The coaching relationship',
        body: 'A human coach helps you clarify the real decision, examine assumptions, explore options and test trade-offs. Research or advice from other sources can inform the conversation without taking over your judgement.',
      },
      {
        title: 'A useful outcome',
        body: 'You can articulate the decision, your reasons, the trade-offs and the conditions that would make you reconsider. A deliberate decision to wait for further evidence can also be a valid outcome.',
      },
    ],
    boundaryTitle: 'Human judgement remains central',
    boundary:
      'AI does not conduct the coaching exchange. Any supporting use of technology must respect the agreed purpose, confidentiality and human oversight.',
    work: [
      { title: 'Agree the purpose and relationship', body: 'What useful support would look like and how progress will be reviewed.' },
      { title: 'Clarify the decision', body: 'Explore pressures, values and assumptions.' },
      { title: 'Examine consequences', body: 'Integrate what matters.' },
      { title: 'Identify a next step', body: 'One the client can own.' },
    ],
    outputs: {
      title: 'Possible outputs',
      body: 'A clearer decision frame, option and trade-off map, client-owned decision narrative, conversation preparation or agreed next-step record. Written session notes require express agreement; minimal-documentation work can be appropriate.',
    },
    yourInvolvement: {
      title: 'What you bring',
      body: 'A real decision or leadership situation, relevant context and a willingness to examine your own assumptions. The initial conversation establishes what useful support would look like and how progress will be reviewed.',
    },
    limits: {
      title: 'What remains with you',
      body: 'CaaS does not transfer decision authority to the coach. It is consequential decision coaching, with boundaries distinct from therapy, operational management and strategic advice. Other support can be separately scoped if needed.',
    },
    closing: {
      title: 'Begin with the decision',
      body: 'Bring the proposition, question or direction you are working on. Together, we can define the support it requires.',
    },
    related: ['aaas', 'raas'],
    notes: {
      heading: 'Two moments where coaching is used',
      items: [
        {
          title: 'Before research: clarity on the question',
          body: 'A leader senses that research is needed but cannot yet say what must be known to decide responsibly. Coaching isolates the decision, defines its constraints and articulates the question so that any research, by FBP or anyone else, is scoped to it.',
        },
        {
          title: 'After research: integration into a decision',
          body: 'Evidence is available but clarity has not translated into commitment. Coaching integrates the findings with the leader’s own judgement and execution reality, examines the trade-offs and surfaces the real source of hesitation.',
        },
      ],
      closing: 'Our involvement is time-bound and decision-bound. When clarity stabilises and ownership is secure, our role diminishes. The goal is closure, not dependency.',
    },
  },
  {
    key: 'emaas',
    slug: 'execution-modelling',
    acronym: 'EMaaS',
    name: 'Execution Modelling as a Service',
    short: 'Execution Modelling',
    grouping: 'Execution reality',
    governingQuestion: 'What must be true, built, sequenced and governed for your chosen direction to work?',
    summary: 'Design how an owned direction can work.',
    intro:
      'EMaaS makes the requirements for execution explicit and tests them against the organisation’s actual capacity. FBP designs the model. The client owns and manages implementation.',
    columns: [
      {
        title: 'An owned direction',
        body: 'You have selected a strategic direction or need to stress-test an existing plan. EMaaS makes the requirements for execution explicit and examines them against the organisation’s actual capacity and constraints.',
      },
      {
        title: 'Beyond a timetable',
        body: 'The model connects intended outcomes to alternative pathways, workstreams, dependencies and resources. It clarifies decision rights, measures, risk triggers, escalation and readiness for handover.',
      },
      {
        title: 'A workable design',
        body: 'The aim is a model that the client can understand, challenge and use. It identifies owners, unresolved decisions and assumptions, making the conditions for implementation visible before they are overlooked.',
      },
    ],
    boundaryTitle: 'The client owns implementation',
    boundary:
      'FBP designs and tests the execution model. The client retains operational responsibility and manages implementation.',
    work: [
      { title: 'Direction and pathways', body: 'Intended outcome, alternative routes and key assumptions.' },
      { title: 'Work and dependencies', body: 'Workstreams, sequence, capacity and decision gates.' },
      { title: 'Governance and controls', body: 'Accountability, measures, escalation and risk triggers.' },
      { title: 'Readiness and handover', body: 'Stress tests, unresolved decisions and tools for the client.' },
    ],
    outputs: {
      title: 'Configured outputs',
      body: 'An execution blueprint, pathway map, roadmap and gates, workstream architecture, responsibility model, risk controls, leading indicators and a readiness register. Tools and checklists are included where specified in the scope.',
    },
    yourInvolvement: {
      title: 'Your involvement',
      body: 'Provide the intended outcome, current plan, constraints and access to accountable owners. Client owners help test feasibility, resource assumptions, governance and the practical use of the resulting model.',
    },
    limits: {
      title: 'Mandate and use rights',
      body: 'Implementation management, PMO duties, staff augmentation and specialist technical design are not automatic inclusions. Agree operating, editing, updating and team-access rights for models and tools in the engagement terms.',
    },
    closing: {
      title: 'Make the chosen direction explicit',
      body: 'Each DSS service is available independently. Further work follows an agreed need and scope. The client retains decision authority.',
    },
    related: ['aaas', 'caas'],
  },
  {
    key: 'aaas',
    slug: 'advisory',
    acronym: 'AaaS',
    name: 'Advisory as a Service',
    short: 'Advisory',
    grouping: 'Execution reality',
    governingQuestion: 'What matters now as reality changes?',
    summary: 'Advise as circumstances change.',
    intro:
      'AaaS provides context-sensitive strategic advice as an initiative unfolds and circumstances change. It challenges drift and considers options within a defined mandate. The client retains executive authority and operational responsibility.',
    columns: [
      {
        title: 'When it is useful',
        body: 'A direction has been chosen and is under way. Conditions move, assumptions age and the plan meets the organisation. AaaS provides senior, independent challenge while the initiative is live.',
      },
      {
        title: 'How the advice works',
        body: 'Advisory is a human relationship. Within an agreed mandate, FBP considers drift, options and consequences as they arise, and offers strategic advice that the client can weigh against their own judgement.',
      },
      {
        title: 'A useful outcome',
        body: 'Decision notes, drift reviews or course-correction options as agreed. The advice informs the client’s decisions; it does not replace them.',
      },
    ],
    boundaryTitle: 'Authority stays with the client',
    boundary:
      'AaaS does not automatically transfer executive authority or operational accountability to FBP. The client retains both.',
    work: [
      { title: 'Agree the mandate', body: 'Scope, cadence, confidentiality and the decisions the advice will serve.' },
      { title: 'Review drift', body: 'Where reality has moved away from the plan, and what that means.' },
      { title: 'Consider options', body: 'Course-correction choices and their consequences.' },
      { title: 'Record the advice', body: 'Decision notes the client can act on and refer back to.' },
    ],
    outputs: {
      title: 'Agreed outputs',
      body: 'Decision notes, drift reviews or course-correction options as agreed within the mandate.',
    },
    yourInvolvement: {
      title: 'Your involvement',
      body: 'An accountable sponsor, access to the initiative’s actual state and a willingness to have assumptions challenged as conditions change.',
    },
    limits: {
      title: 'Where the boundary sits',
      body: 'Advisory is strategic, not operational. Implementation management, interim executive roles and specialist technical advice are separately scoped where required.',
    },
    closing: {
      title: 'Begin with the direction',
      body: 'Each DSS service is available independently. Further work follows an agreed need and scope. The client retains decision authority.',
    },
    related: ['emaas', 'caas'],
    notes: {
      heading: 'What advisory pays attention to',
      items: [
        {
          title: 'Pace and timing',
          body: 'Some directions fail because they move too slowly and the opportunity passes; others because they move too quickly, before integration has occurred. Advisory helps a leader sense when to slow because clarity is degrading, and when to accelerate because hesitation has become the risk.',
        },
        {
          title: 'Second-order consequences',
          body: 'The most common source of regret is not the primary outcome but the downstream effects across execution, culture, capability and stakeholder response. Examining them early is realism, not risk avoidance.',
        },
      ],
    },
  },
];
// AaaS has no service brief in the September set; its columns and steps are drawn from the
// foundation definition, the DSS specification and deck slide 8. [DRAFT] — review.

export const serviceByKey = (k: ServiceKey) => services.find((s) => s.key === k)!;

export interface Situation {
  slug: string;
  title: string;
  audience: string;
  short: string;
  opening: string;
  columns: { title: string; body: string }[];
  noteTitle: string;
  note: string;
  services: ServiceKey[];
}

export const situations: Situation[] = [
  {
    slug: 'advance-a-proposition',
    title: 'You have a proposition to advance',
    short: 'A proposition to substantiate',
    audience: 'For founders, promoters and advisers preparing a case for capital, partnership or strategic approval.',
    opening: 'What must this proposition substantiate before someone else can evaluate it?',
    columns: [
      {
        title: 'The situation',
        body: 'Your thesis may be compelling, but the recipient needs to understand what supports it. The question is which claims, assumptions and dependencies must withstand scrutiny before the proposition receives further attention.',
      },
      {
        title: 'A useful starting point',
        body: 'CEaaS can examine present substantiation and prioritise the evidence gaps. The result can guide improvements, disclosures or further investigation. RaaS can investigate a defined uncertainty under a separate scope.',
      },
      {
        title: 'What to bring',
        body: 'The proposition, its intended audience, supporting material and the decision or support being sought. Identify known weaknesses, relevant constraints and who is authorised to commission the work.',
      },
    ],
    noteTitle: 'Readiness depends on evidence',
    note: 'A serious pre-revenue proposition can be suitable. FBP does not promise funding, endorsement or approval. Agree intended recipients and permitted circulation of the work at the outset.',
    services: ['ceaas', 'raas'],
  },
  {
    slug: 'evaluate-a-proposition',
    title: 'You have a proposition to evaluate',
    short: 'A proposition to evaluate',
    audience: 'For investors, boards, sponsors and advisers deciding whether a case warrants further attention or investigation.',
    opening: 'Which assumptions carry the decision, and what evidence supports them?',
    columns: [
      {
        title: 'The situation',
        body: 'A proposal contains claims about a market, capability, opportunity or future outcome. You need to identify which assumptions carry the decision and what supporting evidence should reasonably exist.',
      },
      {
        title: 'A useful starting point',
        body: 'CEaaS provides a bounded assessment of substantiation and an agenda for closing material gaps. RaaS can investigate a defined question. Specialist diligence or verification remains separately scoped where required.',
      },
      {
        title: 'What to bring',
        body: 'The proposal, decision context, evaluation criteria, available supporting evidence and the intended use of the assessment. Agree the commissioning relationship, confidentiality, conflicts and access to further information.',
      },
    ],
    noteTitle: 'Allocate scrutiny deliberately',
    note: 'Missing evidence does not automatically make a claim false. Evaluation should distinguish absence, failed verification and contradiction. FBP supports your judgement; the decision remains yours.',
    services: ['ceaas', 'raas'],
  },
  {
    slug: 'own-a-decision',
    title: 'You have a decision to own',
    short: 'A decision to own',
    audience: 'For leaders and their advisers making a consequential choice under uncertainty, competing priorities and personal responsibility.',
    opening: 'What is the decision you need to be able to explain and own?',
    columns: [
      {
        title: 'The situation',
        body: 'A leader faces uncertainty, competing priorities or personal responsibility for a consequential choice. The team may have supplied everything asked of it, and the decision still has to be made by one person.',
      },
      {
        title: 'A useful starting point',
        body: 'CaaS provides confidential human coaching to examine pressures, assumptions and trade-offs. It helps the leader articulate a choice and the conditions attached to it. Research can be separately scoped when the uncertainty is evidential.',
      },
      {
        title: 'What to bring',
        body: 'A real decision or leadership situation, the relevant context and a willingness to examine your own assumptions. The first conversation establishes what useful support would look like.',
      },
    ],
    noteTitle: 'Choose the support that fits the present need',
    note: 'These are independent services, not a compulsory sequence. Bring the choice that needs attention, together with the relevant context and accountable sponsor.',
    services: ['caas', 'raas'],
  },
  {
    slug: 'make-a-direction-workable',
    title: 'You need to make a direction workable',
    short: 'A direction to make workable',
    audience: 'For businesses and their advisers designing execution or responding to changing conditions.',
    opening: 'What must be true for this to work in your organisation?',
    columns: [
      {
        title: 'Make it workable',
        body: 'EMaaS models what an owned direction requires: pathways, workstreams, capacity, governance, measures and readiness. FBP provides the design; the client owns and manages implementation.',
      },
      {
        title: 'Navigate changing reality',
        body: 'AaaS provides strategic challenge as an initiative unfolds. It considers drift, options and consequences within a defined mandate. It does not automatically transfer executive authority or operational accountability to FBP.',
      },
      {
        title: 'What to bring',
        body: 'The intended outcome, the current plan, constraints, access to accountable owners and the conditions that have changed or may change.',
      },
    ],
    noteTitle: 'Choose the support that fits the present need',
    note: 'These are independent services, not a compulsory sequence. Bring the plan or changing condition that needs attention, together with the relevant context and accountable sponsor.',
    services: ['emaas', 'aaas'],
  },
];
// Situations 3 and 4 split document 7.2 (Owning and Delivering a Direction) into its two halves;
// the "situation" column for 3 and the "what to bring" column for 4 are [DRAFT].

export const humanAuthority = [
  {
    title: 'Human-in-control',
    body: 'People set the question, scope and standards. They retain authority over material judgements, overrides and release.',
  },
  {
    title: 'Human-in-the-loop',
    body: 'People review evidence, challenge interpretations and resolve exceptions throughout the work.',
  },
  {
    title: 'AI-assisted delivery',
    body: 'AI assists discovery, analysis and production within the agreed process. Tool output does not establish a fact or replace accountable judgement.',
  },
  {
    title: 'Client decision ownership',
    body: 'The client retains the decision and operational responsibility. FBP supplies the agreed research, modelling, coaching or advice.',
  },
];

export const trustAndUse = [
  {
    title: 'Confidentiality',
    body: 'Client information and commissioned work stay within agreed disclosure boundaries. We do not publish client names. We do not showcase case studies publicly. We do not discuss engagements outside strict boundaries.',
  },
  {
    title: 'Ownership and licence',
    body: 'FBP retains its research IP. The client receives agreed rights to use the work. Broader use or exclusivity is available by agreement.',
  },
  {
    title: 'Evidence and corrections',
    body: 'Findings carry a date and scope. We disclose material uncertainty and address source or correction queries.',
  },
];
export const trustLine = 'Trust is not a by-product of the work. It is the product.';

export const origins = {
  heading: 'Experience before establishment',
  intro: 'FalconBridge’s independent identity grew from a research need first encountered within PRiVATi Capital.',
  milestones: [
    {
      figure: '2015',
      title: 'PRiVATi Capital',
      body: 'Established in 2015. It later provided the setting for the initial Equity Research Tool concept.',
    },
    {
      figure: '2025',
      title: 'FalconBridge Partners',
      body: 'Established as an independent business with its own systems, processes and intellectual property.',
    },
    {
      figure: '≈158',
      title: 'Research reports',
      body: 'Produced across the development of the FalconBridge concept, including its ERT origins, as at September 2026.',
    },
  ],
  qualifier:
    'The research count is a dated statement of accumulated output. It is not a count of clients, proof of client outcomes, or a claim that every report was produced by FBP after its 2025 establishment.',
  history:
    'Established in 2025, FalconBridge Partners brings together years of business experience, specialist expertise and professional networks through independently developed systems and intellectual property. Its origins lie in a research need identified within PRiVATi Capital, established in 2015. An initial Equity Research Tool developed into a broader approach to business research and decision support, warranting its own identity and positioning.',
};

export interface Partner {
  slug: string;
  name: string;
  title: string;
  location: string;
  emphasis: string;
  email: string;
  linkedin?: string;
  image?: 'joel' | 'quincy';
  initials: string;
  sections: { title: string; body: string }[];
}

export const partners: Partner[] = [
  {
    slug: 'quincy-jc-beukes',
    name: 'Quincy JC Beukes',
    title: 'Co-Founder & Research Partner',
    location: 'Remote',
    emphasis: 'Corporate finance, strategy and private capital experience informing research and decision analysis.',
    email: firm.emails.quincy,
    linkedin: 'https://www.linkedin.com/in/quincy-jc-beukes/',
    image: 'quincy',
    initials: 'QB',
    sections: [
      {
        title: 'Experience brought to the work',
        body: 'Quincy’s background spans banking, financial services, corporate finance, private capital and business transformation, including senior executive responsibilities. His work centres on contextual clarity and structured analysis for boards, shareholders, investors and leaders.',
      },
      {
        title: 'The research philosophy',
        body: 'Direction by Information reflects the importance of understanding the context before committing to a course of action. At FBP, research is intended to expose evidence, assumptions and uncertainty so that the decision-maker can examine the reasoning.',
      },
      {
        title: 'FalconBridge’s origins',
        body: 'Quincy identified a broader application for an Equity Research Tool first developed in the PRiVATi setting. FalconBridge became an independent business in 2025, owning its own systems, processes and intellectual property.',
      },
    ],
  },
  {
    slug: 'joel-arcus',
    name: 'Joel Arcus',
    title: 'Co-Founder & Managing Partner',
    location: 'UAE',
    emphasis: 'Human capital and leadership experience informing confidential coaching and strategic advisory.',
    email: firm.emails.joel,
    linkedin: 'https://www.linkedin.com/in/joelarcus/',
    image: 'joel',
    initials: 'JA',
    sections: [
      {
        title: 'Experience brought to the work',
        body: 'Based in Dubai, with professional roots in South Africa, Joel brings experience across coaching, consulting, strategy, human capital and leadership development. His perspective connects organisational context with the people responsible for decisions.',
      },
      {
        title: 'Space for considered judgement',
        body: 'Leadership transitions and consequential choices can compress reflective space. Joel’s work emphasises examining assumptions, pressures and trade-offs, while preserving the client’s authority to understand and own the decision.',
      },
      {
        title: 'A complementary perspective',
        body: 'Joel’s people focus sits alongside FBP’s evidence and execution disciplines. Coaching remains a confidential human relationship. Strategic advisory supports considered action as circumstances change, within an agreed mandate.',
      },
    ],
  },
  {
    slug: 'wayne-loraine-grews',
    name: 'Wayne Loraine-Grews',
    title: 'Partner — North America',
    location: 'Based in North Carolina, USA',
    emphasis: 'Operating and transformation experience across retail, supply chains and franchise businesses.',
    email: firm.emails.wayne,
    initials: 'WL',
    sections: [
      {
        title: 'Experience brought to the work',
        body: 'Wayne’s professional background includes multi-site operations, supply chains, franchise networks and business transformation. These settings bring practical questions of capacity, dependencies and organisational execution into view.',
      },
      {
        title: 'An operating perspective',
        body: 'A strategic direction must work through people, resources, processes and changing conditions. Wayne brings this practical perspective to conversations about the assumptions behind a plan and the requirements for making it workable.',
      },
      {
        title: 'The North American partnership',
        body: 'Wayne is FBP’s Partner — North America, based in North Carolina. He joins founding partners Quincy and Joel in connecting client situations with the support available through FalconBridge’s five-service DSS and separate bespoke capability.',
      },
    ],
  },
];

export const research = {
  heading: 'Research that readers can examine',
  intro:
    'FBP’s research capability combines a substantive investigation with the means to navigate, discuss and challenge its findings.',
  columns: [
    {
      title: 'A question with purpose',
      body: 'Research starts with the decision, intended use and evidence required. GDRS provides the method behind RaaS; the research question determines scope, analytical instruments and the depth of investigation.',
    },
    {
      title: 'Accessible at different depths',
      body: 'Use the guide, summary and visual for orientation. Use the deck for discussion. Examine the full report for the analysis and supporting records. Use the reference and link audit to investigate source checks and exceptions.',
    },
    {
      title: 'An accumulated body of work',
      body: 'Approximately 158 research reports were produced across the development of the FalconBridge concept, including its earlier ERT origins, as at September 2026. This is a record of output, not a count of clients or proof of commercial outcomes.',
    },
  ],
  readersLine: 'Research is written to be read by decision-makers, not analysts. The six elements exist so that a reader can orient, discuss, examine and challenge the work at the depth their decision requires.',
  publicNote:
    'FBP funds selected studies out of professional curiosity and makes reports available to readers. Client-confidential work remains within its agreed disclosure boundaries.',
  evidence: [
    {
      title: 'Traceable support',
      body: 'Source identity, date, context and the cited claim matter. A bibliography alone does not validate a conclusion. Research should expose the relationship between evidence, assumptions, analysis and findings.',
    },
    {
      title: 'Visible limitations',
      body: 'Contradictions, uncertainty and access limits remain part of the record. An FBP reference audit is a source-checking exercise within stated scope, not third-party certification of every calculation or inference.',
    },
    {
      title: 'Questions and corrections',
      body: 'A link can become inaccessible after publication. Raise the report version, page and reference with FBP so the underlying source and supported claim can be investigated. Link failure alone does not establish that the finding is false.',
    },
    {
      title: 'Research is licensed for agreed use',
      body: 'FBP retains its research IP. Broader circulation, publication, reproduction or exclusivity must follow the agreed licence. Availability of a public download does not transfer ownership.',
    },
  ],
  curiosity: {
    heading: 'Research that demonstrates the work',
    intro: 'We also fund studies into questions we consider worth investigating and make selected full reports available to readers.',
    steps: [
      { title: 'Weekly signals', body: 'Systematic territorial scans identify significant developments.' },
      { title: 'Research questions', body: 'Our interpretation turns a development into a question worth testing.' },
      { title: 'GDRS studies', body: 'We investigate the question through the research system.' },
      { title: 'Public access', body: 'Research and companion outputs make the depth available to readers.' },
    ],
    territories: [
      { key: 'uae-gcc', name: 'UAE / GCC', status: 'active' },
      { key: 'south-africa', name: 'South Africa', status: 'active' },
      { key: 'new-zealand', name: 'New Zealand', status: 'active' },
      { key: 'mauritius', name: 'Mauritius', status: 'active' },
      { key: 'north-carolina', name: 'North Carolina', status: 'planned' },
    ] as const,
    territoryNote: 'Current scans: UAE/GCC, South Africa, New Zealand and Mauritius. North Carolina is planned.',
    distinction:
      'The scan frames an investigation; subsequent research must establish the evidence supporting its findings. Research findings and FBP’s interpretation are kept visibly distinct.',
  },
};

export const featuredStudy = {
  slug: 'can-south-africa-break-3-percent-growth',
  title: 'Can South Africa Break 3% Growth?',
  subtitle: 'An FBP-commissioned study of the conditions behind a public economic target.',
  territory: 'South Africa',
  facts: [
    { figure: '196 pages', body: 'The full research report includes twelve thematic reviews and supporting appendices.' },
    { figure: '12 thematic reviews', body: 'A structured investigation of the question.' },
    {
      figure: 'Decision instruments',
      body: 'Growth-bridge calculations, reform dependencies, contrasting scenarios and a monitor with explicit thresholds.',
    },
  ],
  extractNote:
    'The FalconBridge 3% Monitor, from page 158 of the report, illustrates how findings can be connected to observable conditions.',
  qualifier:
    'This study’s page count and instruments are specific to its question. They are not universal promises. Each commissioned study follows its own question and evidence requirements.',
  package: ['User guide', 'Executive deck', 'Full research report', 'Executive summary', 'Executive visual', 'Reference and link audit'],
};

// Sample scan entries — PROTOTYPE PLACEHOLDERS. Illustrative structure only; replaced by real scans before launch.
export interface ScanEntry {
  slug: string;
  territory: string;
  territoryKey: string;
  week: string;
  signal: string;
  question: string;
  finding: string;
  interpretation: string;
  openQuestions: string[];
  sample: true;
}

export const sampleScans: ScanEntry[] = [
  {
    slug: 'uae-supplier-compliance-thresholds',
    territory: 'UAE / GCC',
    territoryKey: 'uae-gcc',
    week: 'Week of 7 September 2026',
    signal: 'Sample: a change to supplier-compliance obligations for larger buyers is being discussed for implementation.',
    question: 'If buyer-side compliance obligations tighten, which SMEs in a supply chain carry the readiness burden, and what would a verifiable standing look like?',
    finding: 'Sample finding text. What the evidence establishes appears here, with sources, dates and the scope of what was examined.',
    interpretation: 'Sample interpretation. FBP’s reading of what the finding may mean for a decision-maker appears here, kept visibly separate from the finding itself.',
    openQuestions: ['Sample open question one.', 'Sample open question two.'],
    sample: true,
  },
  {
    slug: 'south-africa-growth-monitor-update',
    territory: 'South Africa',
    territoryKey: 'south-africa',
    week: 'Week of 7 September 2026',
    signal: 'Sample: a reform dependency tracked in the 3% Monitor has moved.',
    question: 'Does the movement change any threshold in the monitor, and what should a reader of the study re-examine?',
    finding: 'Sample finding text. What the evidence establishes appears here, with sources, dates and the scope of what was examined.',
    interpretation: 'Sample interpretation. FBP’s reading of what the finding may mean for a decision-maker appears here, kept visibly separate from the finding itself.',
    openQuestions: ['Sample open question one.'],
    sample: true,
  },
  {
    slug: 'new-zealand-sector-signal',
    territory: 'New Zealand',
    territoryKey: 'new-zealand',
    week: 'Week of 31 August 2026',
    signal: 'Sample: a sector development identified in the weekly scan.',
    question: 'What would need to be true for this development to matter to an accountable decision-maker in the sector?',
    finding: 'Sample finding text. What the evidence establishes appears here, with sources, dates and the scope of what was examined.',
    interpretation: 'Sample interpretation. FBP’s reading of what the finding may mean for a decision-maker appears here, kept visibly separate from the finding itself.',
    openQuestions: ['Sample open question one.', 'Sample open question two.', 'Sample open question three.'],
    sample: true,
  },
];

export const bespoke = {
  heading: 'Bespoke Managed Services',
  intro: 'Client-specific services developed and operated using FalconBridge’s proprietary systems, processes and intellectual property.',
  columns: [
    {
      title: 'A separate capability',
      body: 'Bespoke Managed Services sits outside the five-service Decision Support System. The category allows a programme to be shaped around a client’s recurring need, with an agreed mandate, human governance and use rights.',
    },
    {
      title: 'IRaaS in development',
      body: 'Intelligence Research as a Service is an emerging application: a continuing research capability shaped around the client’s priorities. It can connect relevant signals to research questions, selected investigations and communication outputs.',
    },
    {
      title: 'Client direction and evidence',
      body: 'A client-defined lens determines relevance and the research agenda. Evidence governs the findings. An accountable human sponsor reviews proposed questions; FBP directs and reviews the research and agreed outputs.',
    },
  ],
  noteTitle: 'Explore the need before defining the programme',
  note: 'IRaaS remains in development. Programme scope, delivery cadence, capacity, fees and terms are established through discussion and agreement.',
  detail: [
    {
      title: 'An indicative workflow',
      body: 'Scan relevant developments; identify signals and topics; propose research questions; obtain the client sponsor’s direction; investigate selected questions; prepare agreed executive and communication outputs.',
    },
    {
      title: 'A complete research foundation',
      body: 'Where the programme commissions a GDRS study, the standard six-part RaaS package applies. The programme determines which additional communication formats, editorial support or library organisation are required.',
    },
    {
      title: 'Branding and licensed use',
      body: 'Agree client branding, FBP attribution, permitted audiences, internal or public use, exclusivity and rights after any exclusive period. FBP retains its IP, with confidentiality governing reuse.',
    },
    {
      title: 'What to define together',
      body: 'Territories and topics; research sponsorship; selection and review points; cadence and capacity; outputs; source and correction handling; publication approval; fees and change control. No universal turnaround or volume is assumed.',
    },
  ],
};

export const workingWith = {
  heading: 'Working with FalconBridge',
  intro: 'An engagement begins with the question, the intended use and the people accountable for the decision.',
  steps: [
    {
      title: 'Define the need',
      body: 'Describe the proposition, uncertainty or direction. Identify the decision, intended audience and commissioning sponsor. Share the context that will make the work useful, including constraints, existing evidence and known open questions.',
    },
    {
      title: 'Agree the engagement',
      body: 'The proposal defines the service, scope, outputs, timing, fees, expenses and client inputs. It also addresses confidentiality, IP and licence, review, acceptance, changes and completion. There is no mandatory sequence of service purchases.',
    },
    {
      title: 'Work with clear responsibilities',
      body: 'FBP performs the agreed research, modelling, coaching or advisory work. The client provides the relevant context and retains decision and operational authority. Material changes in need or scope are considered explicitly.',
    },
  ],
  completionTitle: 'Completion follows the agreed scope',
  completion:
    'The engagement concludes through the contracted delivery and review process, with relevant limitations disclosed. Further work requires an agreed need rather than an automatic extension.',
  rights: [
    {
      title: 'Confidentiality and human control',
      body: 'Client information stays within agreed disclosure boundaries. People govern scope, review and material judgements. Coaching and advisory remain human relationships; supporting technology use respects the purpose and confidentiality of the engagement.',
    },
    {
      title: 'Research use rights',
      body: 'The default research licence is Type-1 for the specified purpose. FBP retains ownership of its IP. Additional internal uses, external circulation, reproduction, publication or exclusivity require the appropriate agreed rights and may attract additional fees.',
    },
    {
      title: 'Models and bespoke programmes',
      body: 'For execution tools, agree editing, updating and team-access rights. For bespoke programmes, define branding, attribution, exclusivity and continuing use. The signed engagement and licence govern the particular arrangement.',
    },
    {
      title: 'Source or correction queries',
      body: 'Provide the report version, page, reference and the point in question. We investigate source access and what the evidence supports, and address material corrections. A dead link alone does not establish that the underlying claim is false.',
    },
  ],
  planTitle: 'Plan intended use at the start',
  plan: 'Tell us who needs access and whether the outputs will support internal decisions, advisers, funding discussions, client communication or public publication. This guide summarises the approach; it does not grant a licence.',
  fit: {
    title: 'Fit and qualification',
    body: 'A useful engagement has a consequential question, an accountable sponsor, access to relevant context and willingness to examine inconvenient evidence. A serious proposition can qualify before revenue or funding. FBP’s cross-sector samples demonstrate applications of a method, rather than unrestricted expertise in every industry.',
  },
  advisers: {
    title: 'Advisers as clients',
    body: 'Professional advisers can commission FBP work to support their own mandates. Clarify the ultimate decision, audience and permitted uses at the outset. The adviser’s client relationship does not automatically confer onward-distribution or publication rights.',
  },
};

export const nav = {
  primary: [
    { label: 'Home', href: '/' },
    {
      label: 'Decision Support System™',
      href: '/decision-support-system',
      children: [
        ...services.map((s) => ({ label: `${s.acronym} · ${s.name}`, href: `/decision-support-system/${s.slug}` })),
        { label: 'Bespoke Managed Services', href: '/bespoke-managed-services' },
      ],
    },
    { label: 'Research', href: '/research' },
    { label: 'About', href: '/about' },
  ],
  cta: { label: firm.invitation.cta, href: '/contact' },
};
