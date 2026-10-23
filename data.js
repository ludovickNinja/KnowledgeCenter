/* ============================================================
   Knowledge Center POC — mock data (people, modules, seed progress).
   Documents and queue items come from content.js, built from content/.
   ============================================================ */

window.KC_DATA = (() => {

  const DEPARTMENTS = {
    sales:      { id: 'sales',      name: 'Sales & Customer Service', short: 'Sales' },
    production: { id: 'production', name: 'Production & Quality',     short: 'Production' },
    marketing:  { id: 'marketing',  name: 'Marketing',                 short: 'Marketing' },
    operations: { id: 'operations', name: 'Operations & Shipping',     short: 'Operations' },
  };

  const CATEGORIES = [
    { id: 'company',    name: 'Company & Culture',             icon: '🏛️' },
    { id: 'product',    name: 'Product & Industry Knowledge',  icon: '💍' },
    { id: 'systems',    name: 'Systems & Tools',               icon: '🖥️' },
    { id: 'policies',   name: 'Policies & Procedures',         icon: '📋' },
    { id: 'quality',    name: 'Quality & Manufacturing',       icon: '🔬' },
    { id: 'reference',  name: 'Reference & Troubleshooting',   icon: '🧭' },
  ];

  const USERS = [
    { id: 'maya',   name: 'Maya Chen',       role: 'employee',   dept: 'sales',      title: 'Customer Service Rep',    started: '2026-10-05', supervisor: 'priya' },
    { id: 'daniel', name: 'Daniel Ortiz',    role: 'employee',   dept: 'production', title: 'Bench Jeweller',          started: '2023-02-13', supervisor: 'rosa' },
    { id: 'priya',  name: 'Priya Shah',      role: 'supervisor', dept: 'sales',      title: 'Customer Service Manager', started: '2019-06-03', supervisor: null },
    { id: 'rosa',   name: 'Rosa Lindqvist',  role: 'supervisor', dept: 'production', title: 'Production Lead',         started: '2017-09-11', supervisor: null },
    { id: 'ld',     name: 'L&D Admin',       role: 'admin',      dept: 'operations', title: 'Learning & Development',  started: '2021-01-18', supervisor: null },
    { id: 'tom',    name: 'Tom Baptiste',    role: 'employee',   dept: 'sales',      title: 'Inside Sales',            started: '2025-03-10', supervisor: 'priya' },
    { id: 'aisha',  name: 'Aisha Rahman',    role: 'employee',   dept: 'production', title: 'Quality Inspector',       started: '2024-08-19', supervisor: 'rosa' },
  ];

  /* ------------------------------------------------------------
     Learning modules. Content is pulled from DOCS by id — the module
     is just a wrapper (purpose, completion criteria, quiz).
     stage: foundation | products | path | ongoing
     depts: ['all'] or department ids (for path / ongoing)
     ------------------------------------------------------------ */
  const MODULES = [
    // Stage 1 — Company foundation (ALL)
    { id: 'm-story',    stage: 'foundation', depts: ['all'], title: 'Our Story',               purpose: 'Know where the company came from and what it makes.', docs: ['our-story'],          minutes: 8,
      quiz: [{ q: 'What year was the company founded?', a: ['1998', '2001', '2010', '2014'], c: 1 }, { q: 'Who do we sell to?', a: ['Consumers online', 'Independent jewellers and retail chains', 'Department stores only', 'Auction houses'], c: 1 }] },
    { id: 'm-culture',  stage: 'foundation', depts: ['all'], title: 'Culture & Values',        purpose: 'Understand how we expect each other to work.', docs: ['culture-values'],     minutes: 6,
      quiz: [{ q: 'Where do process-improvement proposals get reviewed?', a: ['Annual review', 'Monthly improvement meeting', 'Never', 'Retailer meeting'], c: 1 }] },
    { id: 'm-org',      stage: 'foundation', depts: ['all'], title: 'How We Are Organized',     purpose: 'Know the departments and who to ask for what.', docs: ['org-structure'],    minutes: 5,
      quiz: [{ q: 'Who handles carrier and shipping issues?', a: ['Customer Service', 'Operations & Shipping', 'Marketing', 'Finance'], c: 1 }, { q: 'How many operating departments are there?', a: ['2', '3', '4', '6'], c: 2 }] },
    { id: 'm-policies', stage: 'foundation', depts: ['all'], title: 'Workplace Policies',       purpose: 'Know the rules on hours, secure areas, breaks and time off.', docs: ['workplace-policies'], minutes: 12,
      quiz: [{ q: 'A colleague without a badge asks you to hold the vault door. What do you do?', a: ['Hold it, they work here', 'Do not hold it; secure areas require a badge', 'Ask a manager later', 'Hold it if you recognize them'], c: 1 }, { q: 'How far in advance must vacation be requested?', a: ['24 hours', '1 week', '2 weeks', '1 month'], c: 2 }] },
    { id: 'm-comms',    stage: 'foundation', depts: ['all'], title: 'Communication Expectations', purpose: 'Use the right channel and respond on time.', docs: ['communication'], minutes: 5,
      quiz: [{ q: 'Within how long must a retailer email be acknowledged?', a: ['1 hour', '4 business hours', '24 hours', '3 days'], c: 1 }] },
    { id: 'm-terms',    stage: 'foundation', depts: ['all'], title: 'General Terminology',      purpose: 'Speak the same language as everyone else.', docs: ['glossary'],            minutes: 6,
      quiz: [{ q: 'What is an RMA?', a: ['A rush order', 'A return merchandise authorization', 'A retail marketing allowance', 'A ring measurement aid'], c: 1 }, { q: 'ETA means…', a: ['Promised ship date', 'Delivery date', 'Estimated total amount', 'Engraving time allowed'], c: 0 }] },

    // Stage 2 — Products & industry fundamentals (ALL)
    { id: 'm-business', stage: 'products', depts: ['all'], title: 'Business Model & Retailers', purpose: 'Understand wholesale, tiers and what retailers expect.', docs: ['business-model'], minutes: 8,
      quiz: [{ q: 'How many retailer tiers are there?', a: ['2', '3', '4', '5'], c: 1 }, { q: 'Do we sell to consumers?', a: ['Yes, online', 'Yes, in-store', 'No', 'Only at trade shows'], c: 2 }] },
    { id: 'm-metals',   stage: 'products', depts: ['all'], title: 'Jewellery Fundamentals',     purpose: 'Metals, karats, alloys and stones.', docs: ['jewellery-fundamentals'], minutes: 15,
      quiz: [{ q: 'What percentage of 14K gold is pure gold?', a: ['41.7%', '58.3%', '75%', '95%'], c: 1 }, { q: 'Which of these can usually NOT be resized?', a: ['14K gold', 'Platinum', 'Tungsten carbide', 'Sterling silver'], c: 2 }] },
    { id: 'm-construct', stage: 'products', depts: ['all'], title: 'Product Construction',      purpose: 'Cast vs die-struck, fit profiles and finishes.', docs: ['product-construction'], minutes: 10,
      quiz: [{ q: 'A customer used to standard fit orders comfort fit. What do you advise?', a: ['Same size', 'Size up', 'Size down', 'Order two'], c: 2 }] },
    { id: 'm-brands',   stage: 'products', depts: ['all'], title: 'Brands & Collections',       purpose: 'Know the three brand families and what is current.', docs: ['brands-collections'], minutes: 10,
      quiz: [{ q: 'Which brand family covers alternative-metal men\'s bands?', a: ['Classic', 'Signature', 'Forge', 'Heritage'], c: 2 }] },

    // Stage 3 — Department learning paths
    { id: 'm-erp',      stage: 'path', depts: ['sales', 'operations'], title: 'Order Entry in the ERP', purpose: 'Enter and release a retailer order correctly.', docs: ['erp-order-entry'], minutes: 20,
      quiz: [{ q: 'Which field is required or the order is rejected at release?', a: ['Retailer PO number', 'Sales rep initials', 'Carrier', 'Gift message'], c: 0 }] },
    { id: 'm-quotes',   stage: 'path', depts: ['sales'], title: 'Quotes & Pricing',             purpose: 'Quote accurately and know when approval is needed.', docs: ['quotes-pricing'], minutes: 10,
      quiz: [{ q: 'How long is a precious-metal quote valid?', a: ['24 hours', '7 days', '30 days', '90 days'], c: 1 }] },
    { id: 'm-returns',  stage: 'path', depts: ['sales', 'operations'], title: 'Returns, Repairs & RMA', purpose: 'Handle returns and resizes under the current policy.', docs: ['returns-repairs'], minutes: 12,
      quiz: [{ q: 'An item arrives without an RMA. What happens?', a: ['Processed normally', 'Held 10 days then returned at retailer cost', 'Scrapped', 'Credited immediately'], c: 1 }, { q: 'Can a tungsten band be resized?', a: ['Yes, up to 2 sizes', 'Yes, once', 'No; offer an exchange', 'Only down'], c: 2 }] },
    { id: 'm-retailer', stage: 'path', depts: ['sales', 'marketing'], title: 'Retailer Communication', purpose: 'Write to retailers in the approved tone and structure.', docs: ['retailer-comms'], minutes: 8,
      quiz: [{ q: 'When must you tell a retailer about a missed ETA?', a: ['After it passes', 'Before it passes', 'Only if they ask', 'At month end'], c: 1 }] },
    { id: 'm-shipping', stage: 'path', depts: ['operations', 'sales'], title: 'Shipping & Carriers', purpose: 'Ship insured, tracked and on time.', docs: ['shipping-carriers'], minutes: 8,
      quiz: [{ q: 'Shipments over what value must be split across two boxes?', a: ['$1,000', '$5,000', '$10,000', '$25,000'], c: 2 }] },
    { id: 'm-casting',  stage: 'path', depts: ['production'], title: 'Casting Process',          purpose: 'Understand the casting steps and alloy control.', docs: ['casting-basics'], minutes: 15,
      quiz: [{ q: 'Porosity is usually caused by…', a: ['A cold flask', 'An overheated flask or wet investment', 'Too much metal', 'A thin sprue'], c: 1 }] },
    { id: 'm-qc',       stage: 'path', depts: ['production', 'operations'], title: 'Final Quality Inspection', purpose: 'Pass or fail a piece against the checklist.', docs: ['qc-inspection'], minutes: 12,
      quiz: [{ q: 'What is the width tolerance?', a: ['±0.05 mm', '±0.10 mm', '±0.15 mm', '±0.25 mm'], c: 1 }, { q: 'A piece has the wrong metal stamp. What happens?', a: ['Re-stamp it', 'Ship with a note', 'Scrap it', 'Discount it'], c: 2 }] },
    { id: 'm-safety',   stage: 'path', depts: ['production'], title: 'Bench & Workshop Safety',  purpose: 'Work safely with torches, tools and chemicals.', docs: ['bench-safety'], minutes: 10,
      quiz: [{ q: 'Which tongs are used in the pickle?', a: ['Steel', 'Copper', 'Aluminum', 'Any'], c: 1 }] },
    { id: 'm-flow',     stage: 'path', depts: ['production', 'operations'], title: 'Work Order Flow',      purpose: 'Know the stations and how holds work.', docs: ['work-order-flow'], minutes: 8,
      quiz: [{ q: 'Who may scan a piece into Shipping?', a: ['Anyone', 'Only after QC pass', 'Bench', 'Sales'], c: 1 }] },
  ];

  /* ------------------------------------------------------------
     Seed completion records (what each persona has already done).
     Keyed by userId → moduleId/ongoingId → { date, version }
     ------------------------------------------------------------ */
  const SEED_PROGRESS = {
    maya: {
      'm-story': { date: '2026-10-06' }, 'm-culture': { date: '2026-10-06' }, 'm-org': { date: '2026-10-06', version: 2 },
      'm-policies': { date: '2026-10-07', version: 3 },
    },
    daniel: {
      'm-story': { date: '2023-02-14', version: 1 }, 'm-culture': { date: '2023-02-14' }, 'm-org': { date: '2023-02-14', version: 1 },
      'm-policies': { date: '2023-02-15', version: 1 }, 'm-comms': { date: '2023-02-15' }, 'm-terms': { date: '2023-02-15' },
      'm-business': { date: '2023-02-16' }, 'm-metals': { date: '2023-02-16' }, 'm-construct': { date: '2023-02-17' }, 'm-brands': { date: '2023-02-17', version: 1 },
      'm-casting': { date: '2023-02-20' }, 'm-qc': { date: '2023-02-21', version: 1 }, 'm-safety': { date: '2023-02-21' }, 'm-flow': { date: '2023-02-22' },
      'o-org-structure-v2': { date: '2026-09-03', version: 2 }, 'o-workplace-policies-v3': { date: '2026-08-22', version: 3 },
    },
    priya: { /* supervisor: fully complete */ },
    rosa: {},
    ld: {},
    tom: {
      'm-story': { date: '2025-03-11' }, 'm-culture': { date: '2025-03-11' }, 'm-org': { date: '2025-03-11', version: 1 }, 'm-policies': { date: '2025-03-12', version: 2 },
      'm-comms': { date: '2025-03-12' }, 'm-terms': { date: '2025-03-12' }, 'm-business': { date: '2025-03-13' }, 'm-metals': { date: '2025-03-13' },
      'm-construct': { date: '2025-03-14' }, 'm-brands': { date: '2025-03-14', version: 1 }, 'm-erp': { date: '2025-03-17', version: 1 }, 'm-quotes': { date: '2025-03-17' },
      'm-returns': { date: '2025-03-18', version: 1 }, 'm-retailer': { date: '2025-10-06' }, 'm-shipping': { date: '2026-02-12' },
      'o-workplace-policies-v3': { date: '2026-08-25', version: 3 }, 'o-org-structure-v2': { date: '2026-09-04', version: 2 }, 'o-brands-collections-v2': { date: '2026-10-03', version: 2 },
    },
    aisha: {
      'm-story': { date: '2024-08-20' }, 'm-culture': { date: '2024-08-20' }, 'm-org': { date: '2024-08-20', version: 1 }, 'm-policies': { date: '2024-08-21', version: 2 },
      'm-comms': { date: '2024-08-21' }, 'm-terms': { date: '2024-08-21' }, 'm-business': { date: '2024-08-22' }, 'm-metals': { date: '2024-08-22' },
      'm-construct': { date: '2024-08-23' }, 'm-brands': { date: '2024-08-23', version: 1 }, 'm-casting': { date: '2024-08-26' }, 'm-qc': { date: '2024-08-27', version: 1 },
      'm-safety': { date: '2024-08-27' }, 'm-flow': { date: '2024-08-28' }, 'o-workplace-policies-v3': { date: '2026-08-21', version: 3 }, 'o-org-structure-v2': { date: '2026-09-02', version: 2 },
      'o-qc-inspection-v2': { date: '2026-09-18', version: 2 },
    },
  };
  // Supervisors have completed everything that applies to them (queue items come from content.js).
  const ONGOING = (window.KC_CONTENT && window.KC_CONTENT.ongoing) || [];
  ['priya', 'rosa'].forEach(u => {
    const user = USERS.find(x => x.id === u);
    MODULES.concat(ONGOING).forEach(m => {
      if (m.depts.includes('all') || m.depts.includes(user.dept)) SEED_PROGRESS[u][m.id] = { date: '2026-10-15', version: m.version };
    });
  });

  const SEED_REQUESTS = [
    { id: 'r1', user: 'tom',   date: '2026-10-12', type: 'question', text: 'Can we get a doc on how to handle a retailer that wants to pay by wire instead of card? Nothing in the KB covers it.', status: 'open' },
    { id: 'r2', user: 'aisha', date: '2026-10-09', type: 'module',   text: 'A short refresher module on reading grading reports would help the QC team with the lab-grown stones.', status: 'planned' },
    { id: 'r3', user: 'maya',  date: '2026-10-20', type: 'correction', text: 'The glossary says ETA is the ship date but the ERP label says "Delivery". Which is it?', status: 'open' },
  ];

  const STAGES = [
    { id: 'foundation', name: 'Company Foundation',             who: 'Everyone', blurb: 'History, culture, organization, workplace policies, communication expectations and terminology.' },
    { id: 'products',   name: 'Products & Industry Fundamentals', who: 'Everyone', blurb: 'Business model, retailer relationships, jewellery fundamentals, product construction, brands and collections.' },
    { id: 'path',       name: 'Department Learning Path',       who: 'Your department', blurb: 'Processes, systems, policies and knowledge for your department, with quizzes along the way.' },
    { id: 'ongoing',    name: 'Ongoing Learning',               who: 'Your department', blurb: 'Refreshers, new products, process and policy updates. Items are added here when documentation changes.' },
  ];

  return { DEPARTMENTS, CATEGORIES, USERS, MODULES, SEED_PROGRESS, SEED_REQUESTS, STAGES };
})();
