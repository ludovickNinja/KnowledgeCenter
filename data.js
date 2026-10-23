/* ============================================================
   Knowledge Center POC — mock data
   In production this would come from the document store / CMS.
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
     Documents. Each has a versions[] history (oldest → newest).
     The newest version with status 'published' is the current one.
     Older versions are 'archived'. A doc may also have a 'draft' or
     'review' version sitting above the current one (not yet live).
     Only published content is visible in Know / Ask / Learn.
     ------------------------------------------------------------ */
  const DOCS = [
    {
      id: 'our-story', title: 'Our Story: 25 Years of Manufacturing', category: 'company',
      depts: ['all'], owner: 'Executive Office', tags: ['history', 'founding', 'milestones'],
      versions: [
        { v: 1, status: 'archived',  date: '2024-02-01', summary: 'Initial release', pushed: true, sections: [] },
        { v: 2, status: 'published', date: '2026-01-15', summary: 'Added 2025 milestones and the Montréal expansion.', pushed: false, sections: [
          { h: 'Where we started', p: 'The company was founded in 2001 as a two-person workshop making custom wedding bands for local jewellers. The first commercial line launched in 2003 and was carried by a dozen independent retailers within a year.' },
          { h: 'Growth milestones', p: 'By 2010 we were manufacturing for retailers across Canada and the United States. The current production facility opened in 2014. In 2025 we expanded the Montréal facility to add a second casting line and an in-house finishing department.' },
          { h: 'What we make today', p: 'We design and manufacture wedding bands, engagement rings and fashion jewellery in precious metals and alternative metals, sold through independent jewellers and select retail chains under several brand names.' },
        ]},
      ],
    },
    {
      id: 'culture-values', title: 'Culture & Values', category: 'company',
      depts: ['all'], owner: 'People & Culture', tags: ['values', 'culture', 'behaviour'],
      versions: [
        { v: 1, status: 'published', date: '2025-05-20', summary: 'Initial release', pushed: true, sections: [
          { h: 'Craft first', p: 'Every piece we ship carries someone\'s name on the most important day of their life. We take the time to do it right, and we say so when something is not right.' },
          { h: 'Retailer partnership', p: 'Our retailers are partners, not accounts. We win when they win. Honest communication about timelines and problems is expected from every department.' },
          { h: 'Continuous improvement', p: 'Anyone can propose a process change. Proposals go through the department lead and are reviewed in the monthly improvement meeting.' },
        ]},
      ],
    },
    {
      id: 'org-structure', title: 'How We Are Organized', category: 'company',
      depts: ['all'], owner: 'People & Culture', tags: ['departments', 'org chart', 'who to ask'],
      versions: [
        { v: 1, status: 'archived',  date: '2025-05-20', summary: 'Initial release', pushed: true, sections: [] },
        { v: 2, status: 'published', date: '2026-09-02', summary: 'Operations & Shipping split from Production into its own department. Updated escalation contacts.', pushed: true, sections: [
          { h: 'Departments', p: 'There are four operating departments: Sales & Customer Service, Production & Quality, Marketing, and Operations & Shipping. Finance, People & Culture and Learning & Development are shared services.' },
          { h: 'Who to ask', p: 'Order and pricing questions go to Customer Service. Production timelines go to the Production Lead. Shipping and carrier issues go to Operations. Documentation and training questions go to Learning & Development.' },
          { h: 'Escalation', p: 'Escalate to your department lead first. Cross-department issues are escalated by the lead to the weekly operations meeting.' },
        ]},
      ],
    },
    {
      id: 'workplace-policies', title: 'Workplace Policies Handbook', category: 'policies',
      depts: ['all'], owner: 'People & Culture', tags: ['attendance', 'dress code', 'security', 'breaks', 'time off'],
      versions: [
        { v: 1, status: 'archived',  date: '2024-02-01', summary: 'Initial release', pushed: true, sections: [] },
        { v: 2, status: 'archived',  date: '2025-07-10', summary: 'Updated remote-work eligibility.', pushed: true, sections: [] },
        { v: 3, status: 'published', date: '2026-08-21', summary: 'New badge-access policy for the vault and casting area. Break schedule clarified.', pushed: true, sections: [
          { h: 'Hours and attendance', p: 'Standard hours are 8:00 to 16:30 with a 30-minute unpaid lunch. Shift start times vary by department. Report absences to your supervisor before the start of your shift.' },
          { h: 'Secure areas and badge access', p: 'The vault, casting area and finishing room are badge-restricted. Never hold a door for someone without a badge. Lost badges must be reported to Operations the same day so they can be deactivated.' },
          { h: 'Breaks', p: 'Two paid 15-minute breaks per full shift, taken at times set by the department schedule. Production breaks are staggered so that casting is never unattended.' },
          { h: 'Time off', p: 'Vacation requests are submitted in the HR portal at least two weeks in advance. Requests are approved by your supervisor in the order received.' },
        ]},
      ],
    },
    {
      id: 'communication', title: 'Communication Expectations', category: 'company',
      depts: ['all'], owner: 'People & Culture', tags: ['email', 'teams', 'response time', 'meetings'],
      versions: [
        { v: 1, status: 'published', date: '2025-09-15', summary: 'Initial release', pushed: true, sections: [
          { h: 'Channels', p: 'Use Teams chat for quick internal questions, email for anything a retailer or external party needs to see, and the ticketing system for anything that needs tracking. Do not use personal messaging apps for work.' },
          { h: 'Response times', p: 'Acknowledge retailer emails within 4 business hours even if you do not have the answer yet. Internal Teams messages should be answered the same day.' },
          { h: 'Meetings', p: 'Every recurring meeting has an owner and an agenda posted the day before. If you cannot attend, send your update in writing to the owner.' },
        ]},
      ],
    },
    {
      id: 'glossary', title: 'General Terminology & Glossary', category: 'reference',
      depts: ['all'], owner: 'Learning & Development', tags: ['glossary', 'terms', 'acronyms', 'definitions'],
      versions: [
        { v: 1, status: 'published', date: '2025-05-20', summary: 'Initial release', pushed: true, sections: [
          { h: 'Order terms', p: 'PO: purchase order from a retailer. WO: work order, the internal job created from a PO. ETA: promised ship date, not delivery date. RMA: return merchandise authorization, required before any item is sent back.' },
          { h: 'Product terms', p: 'Finger size: ring size in the North American scale. Width: band width in millimetres. Fit: the interior profile of a band, either standard or comfort fit. Finish: the surface treatment, such as polished, satin or hammered.' },
          { h: 'Production terms', p: 'Casting: pouring molten metal into a mould. Sprue: the channel through which metal enters the mould, removed after casting. Bench: a jeweller\'s workstation. QC: quality control inspection before shipping.' },
        ]},
      ],
    },
    {
      id: 'business-model', title: 'Business Model & Retailer Relationships', category: 'product',
      depts: ['all'], owner: 'Sales Leadership', tags: ['retailers', 'wholesale', 'channels', 'pricing tiers'],
      versions: [
        { v: 1, status: 'published', date: '2025-06-01', summary: 'Initial release', pushed: true, sections: [
          { h: 'How we sell', p: 'We are a wholesale manufacturer. We do not sell to consumers. Our customers are independent jewellers and retail chains, who sell our products under our brand names or their own.' },
          { h: 'Retailer tiers', p: 'Retailers are grouped into three tiers based on annual volume. Tier affects pricing, minimum order quantities and marketing support. Tier assignments are reviewed every January by Sales Leadership.' },
          { h: 'What retailers expect', p: 'Accurate ETAs, consistent quality and fast answers. A late order with warning is forgivable. A late order with no warning costs us the account.' },
        ]},
      ],
    },
    {
      id: 'jewellery-fundamentals', title: 'Jewellery Fundamentals', category: 'product',
      depts: ['all'], owner: 'Product Development', tags: ['metals', 'gold', 'platinum', 'karat', 'alloys'],
      versions: [
        { v: 1, status: 'published', date: '2025-06-01', summary: 'Initial release', pushed: true, sections: [
          { h: 'Precious metals', p: 'Gold is sold by karat: 10K is 41.7% gold, 14K is 58.3%, 18K is 75%. White gold is alloyed with palladium or nickel and usually rhodium plated. Platinum is 95% pure and heavier than gold.' },
          { h: 'Alternative metals', p: 'Tungsten carbide, titanium, cobalt and tantalum are used for men\'s bands. They are hard, lightweight or both, but most cannot be resized. Always confirm finger size before production on alternative metals.' },
          { h: 'Stones', p: 'We set natural diamonds, lab-grown diamonds and selected coloured gemstones. Every stone over 0.30 carat ships with a grading report. Lab-grown and natural stones must never be mixed in the same piece without documentation.' },
        ]},
      ],
    },
    {
      id: 'product-construction', title: 'Product Construction', category: 'product',
      depts: ['all'], owner: 'Product Development', tags: ['construction', 'comfort fit', 'die struck', 'cast'],
      versions: [
        { v: 1, status: 'published', date: '2025-06-01', summary: 'Initial release', pushed: true, sections: [
          { h: 'Cast vs die-struck', p: 'Cast rings are made by pouring metal into a mould and are best for detailed designs. Die-struck rings are stamped from solid metal under high pressure, producing a denser, more durable band. Most of our plain bands are die-struck.' },
          { h: 'Fit profiles', p: 'Standard fit is flat on the inside. Comfort fit is domed on the inside so the ring slides over the knuckle more easily. Comfort fit bands run about a quarter size larger, so customers used to standard fit should be sized down.' },
          { h: 'Finishes', p: 'Polished, satin, brushed, hammered and sandblast finishes are available on most bands. Finishes can be refreshed under the care program.' },
        ]},
      ],
    },
    {
      id: 'brands-collections', title: 'Brands & Collections Guide', category: 'product',
      depts: ['all'], owner: 'Marketing', tags: ['brands', 'collections', 'catalogue', 'launch'],
      versions: [
        { v: 1, status: 'archived',  date: '2025-06-01', summary: 'Initial release', pushed: true, sections: [] },
        { v: 2, status: 'published', date: '2026-10-01', summary: 'Added the Autumn 2026 collection (12 new styles) and retired 4 discontinued styles from the Classic line.', pushed: true, sections: [
          { h: 'Brand families', p: 'We sell under three brand families. Classic covers plain and traditional bands. Signature covers designer and diamond-set styles. Forge covers alternative-metal men\'s bands.' },
          { h: 'Autumn 2026 collection', p: 'The Autumn 2026 collection adds 12 styles to the Signature family, including the first two-tone tantalum styles. Retailers receive the lookbook and pricing on October 1. Orders open October 15.' },
          { h: 'Discontinued styles', p: 'Four Classic styles were retired on October 1, 2026. Existing orders are honoured. New orders for retired styles must be quoted as custom work.' },
        ]},
      ],
    },
    {
      id: 'erp-order-entry', title: 'Order Entry in the ERP', category: 'systems',
      depts: ['sales', 'operations'], owner: 'Customer Service Manager', tags: ['erp', 'order entry', 'purchase order', 'work order'],
      versions: [
        { v: 1, status: 'archived',  date: '2025-03-01', summary: 'Initial release', pushed: true, sections: [] },
        { v: 2, status: 'published', date: '2026-04-12', summary: 'Added the retailer PO number as a required field. New screenshot set for the ERP 11 interface.', pushed: true, sections: [
          { h: 'Before you enter an order', p: 'Confirm the retailer account is active and not on credit hold. Confirm the style number exists in the current catalogue. Confirm finger size, width, metal and finish are all specified on the PO.' },
          { h: 'Entering the order', p: 'Create the sales order from the retailer account, not from the product. Enter the retailer PO number in the reference field; it is required and orders without it will be rejected at release. Add one line per item and attach the PO as a PDF.' },
          { h: 'Releasing to production', p: 'Once all lines are entered, release the order. The ERP creates a work order per line and assigns a provisional ETA. Send the ETA to the retailer within 4 business hours.' },
        ]},
        { v: 3, status: 'review', date: '2026-10-20', summary: 'Clarified how to handle split shipments on multi-line orders. Minor wording fixes.', pushed: false, sections: [] },
      ],
    },
    {
      id: 'quotes-pricing', title: 'Quotes & Pricing Procedure', category: 'policies',
      depts: ['sales'], owner: 'Sales Leadership', tags: ['quote', 'pricing', 'metal price', 'discount'],
      versions: [
        { v: 1, status: 'published', date: '2025-09-01', summary: 'Initial release', pushed: true, sections: [
          { h: 'Quote validity', p: 'Quotes on precious-metal items are valid for 7 calendar days because they are tied to the daily metal price. Quotes on alternative-metal items are valid for 30 days.' },
          { h: 'Discounts', p: 'Tier pricing is applied automatically by the ERP. Any discount beyond tier pricing requires written approval from Sales Leadership before the quote is sent.' },
          { h: 'Custom work', p: 'Custom quotes require a CAD rendering and a Production review of feasibility before pricing. Allow 3 business days.' },
        ]},
      ],
    },
    {
      id: 'returns-repairs', title: 'Returns, Repairs & RMA Policy', category: 'policies',
      depts: ['sales', 'operations'], owner: 'Customer Service Manager', tags: ['returns', 'rma', 'repairs', 'warranty', 'resize'],
      versions: [
        { v: 1, status: 'archived', date: '2024-06-01', summary: 'Initial release', pushed: true, sections: [
          { h: 'Return window', p: 'Unworn stock items may be returned within 30 days of invoice for credit.' },
        ]},
        { v: 2, status: 'archived', date: '2025-11-10', summary: 'Restocking fee introduced for returns after 30 days.', pushed: true, sections: [
          { h: 'Return window', p: 'Unworn stock items may be returned within 30 days of invoice for full credit. Returns between 31 and 60 days are subject to a 15% restocking fee.' },
        ]},
        { v: 3, status: 'published', date: '2026-10-14', summary: 'RMA is now required before any return is accepted. Resizing on alternative metals is explicitly excluded. Lifetime care program described.', pushed: true, sections: [
          { h: 'RMA required', p: 'No return, repair or resize is accepted without an RMA number issued by Customer Service. Items received without an RMA are held for 10 days and then returned to the retailer at their cost.' },
          { h: 'Return window', p: 'Unworn stock items may be returned within 30 days of invoice for full credit. Returns between 31 and 60 days are subject to a 15% restocking fee. Custom and engraved items are not returnable.' },
          { h: 'Resizing', p: 'Precious-metal bands can be resized up to two sizes in either direction at no charge within the first year. Tungsten, cobalt, titanium and tantalum bands cannot be resized; offer an exchange under the care program instead.' },
          { h: 'Lifetime care program', p: 'The care program covers refinishing, rhodium plating and prong tightening for the life of the piece. Shipping to us is paid by the retailer; return shipping is paid by us.' },
        ]},
      ],
    },
    {
      id: 'retailer-comms', title: 'Retailer Communication Standards', category: 'policies',
      depts: ['sales', 'marketing'], owner: 'Customer Service Manager', tags: ['email', 'retailer', 'templates', 'tone'],
      versions: [
        { v: 1, status: 'published', date: '2025-10-05', summary: 'Initial release', pushed: true, sections: [
          { h: 'Tone', p: 'Professional, warm and specific. Lead with the answer, then the detail. Never blame another department in writing to a retailer.' },
          { h: 'Delays', p: 'If an ETA will be missed, tell the retailer before the ETA passes, give the new date, and say what caused the delay in one sentence.' },
          { h: 'Templates', p: 'Use the approved templates in the shared mailbox for order confirmations, ETA updates and RMA instructions. Edit the details, not the structure.' },
        ]},
      ],
    },
    {
      id: 'casting-basics', title: 'Casting Process Overview', category: 'quality',
      depts: ['production'], owner: 'Production Lead', tags: ['casting', 'investment', 'burnout', 'alloy'],
      versions: [
        { v: 1, status: 'published', date: '2025-04-15', summary: 'Initial release', pushed: true, sections: [
          { h: 'Process steps', p: 'Wax or resin models are attached to a sprue tree, invested in plaster, burned out in the kiln, then cast under vacuum. Trees are quenched, divested and cut before going to the bench.' },
          { h: 'Alloy control', p: 'Each alloy has its own crucible. Never mix gold karats or colours in one crucible. Record the alloy lot number on the casting sheet for every tree.' },
          { h: 'Common defects', p: 'Porosity is usually from an overheated flask or a wet investment. Incomplete fill is usually from a cold flask or a thin sprue. Log every defect on the casting sheet so patterns are visible.' },
        ]},
      ],
    },
    {
      id: 'qc-inspection', title: 'Final Quality Inspection Checklist', category: 'quality',
      depts: ['production', 'operations'], owner: 'Quality Lead', tags: ['qc', 'inspection', 'checklist', 'stamp', 'tolerance'],
      versions: [
        { v: 1, status: 'archived',  date: '2025-04-15', summary: 'Initial release', pushed: true, sections: [] },
        { v: 2, status: 'published', date: '2026-09-18', summary: 'Width tolerance tightened from ±0.15 mm to ±0.10 mm. Added stone-security tap test.', pushed: true, sections: [
          { h: 'Dimensions', p: 'Finger size must be within a quarter size of the work order. Width must be within ±0.10 mm of the specified width. Measure at three points around the band.' },
          { h: 'Stamps and marks', p: 'Every piece carries the metal quality stamp and the maker\'s mark. Check that the stamp is legible and matches the work order metal. Pieces with the wrong stamp are scrapped, never corrected.' },
          { h: 'Stone security', p: 'Run a fingernail over every prong and run the tap test: tap the ring on a wooden block and listen for a rattle. Any movement fails inspection.' },
          { h: 'Finish', p: 'Inspect under 10x magnification for scratches, pits and polishing compound in recesses. Compare the finish to the reference sample for that style.' },
        ]},
      ],
    },
    {
      id: 'bench-safety', title: 'Bench & Workshop Safety', category: 'policies',
      depts: ['production'], owner: 'Production Lead', tags: ['safety', 'ppe', 'torch', 'chemicals', 'pickle'],
      versions: [
        { v: 1, status: 'published', date: '2025-04-15', summary: 'Initial release', pushed: true, sections: [
          { h: 'Personal protective equipment', p: 'Safety glasses are required at every bench and in the casting area. Respirators are required at the polishing lathe. Tie back long hair and remove loose jewellery before operating any rotary tool.' },
          { h: 'Torches and gas', p: 'Check hoses for cracks at the start of every shift. Close the gas valve at the tank, not just the torch, at the end of the shift.' },
          { h: 'Chemicals', p: 'Pickle solution is acidic. Use copper tongs only; steel tongs will plate your work. Report any spill larger than a cup to the Production Lead immediately.' },
        ]},
      ],
    },
    {
      id: 'work-order-flow', title: 'Work Order Flow: From Release to Shipping', category: 'reference',
      depts: ['production', 'operations'], owner: 'Production Lead', tags: ['work order', 'routing', 'stations', 'traveller'],
      versions: [
        { v: 1, status: 'published', date: '2025-08-01', summary: 'Initial release', pushed: true, sections: [
          { h: 'Stations', p: 'A work order moves through Casting, Bench, Setting (if stones), Finishing, Engraving (if requested), QC and Shipping. Each station scans the traveller in and out.' },
          { h: 'Holds', p: 'Any station can put a work order on hold with a reason code. Holds longer than one day are reviewed by the Production Lead at the morning huddle.' },
          { h: 'Shipping handoff', p: 'Only pieces that passed QC may be scanned into Shipping. Shipping matches the piece to the packing slip and the retailer PO number before sealing the box.' },
        ]},
      ],
    },
    {
      id: 'shipping-carriers', title: 'Shipping & Carrier Procedures', category: 'policies',
      depts: ['operations', 'sales'], owner: 'Operations Lead', tags: ['shipping', 'carrier', 'insurance', 'tracking'],
      versions: [
        { v: 1, status: 'published', date: '2026-02-10', summary: 'Initial release', pushed: true, sections: [
          { h: 'Insurance', p: 'Every shipment is insured for full invoice value. Shipments over $10,000 require signature on delivery and must be split across two boxes.' },
          { h: 'Tracking', p: 'The tracking number is entered in the ERP on the sales order the same day the box leaves. The ERP sends the retailer an automatic notification.' },
        ]},
      ],
    },
    {
      id: 'social-media-guidelines', title: 'Social Media & Brand Voice Guidelines', category: 'policies',
      depts: ['marketing'], owner: 'Marketing', tags: ['social', 'brand', 'voice', 'approval'],
      versions: [
        { v: 1, status: 'draft', date: '2026-10-18', summary: 'First draft submitted by Marketing for L&D formatting review.', pushed: false, sections: [] },
      ],
    },
    {
      id: 'old-warranty', title: 'Warranty Policy (superseded)', category: 'policies',
      depts: ['sales'], owner: 'Customer Service Manager', tags: ['warranty'],
      versions: [
        { v: 1, status: 'archived', date: '2023-01-10', summary: 'Superseded by the Returns, Repairs & RMA Policy and the Lifetime care program.', pushed: true, sections: [
          { h: 'Warranty', p: 'All pieces carry a one-year warranty against manufacturing defects. Resizing on any metal is free for 90 days.' },
        ]},
      ],
    },
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
     Ongoing-learning queue items. These are generated when a new
     version is published with "push to learning queues" checked.
     They point at a doc + version so the completion record keeps
     the version the employee actually saw.
     ------------------------------------------------------------ */
  const ONGOING = [
    { id: 'o-returns-v3', docId: 'returns-repairs', version: 3, depts: ['sales', 'operations'], date: '2026-10-14', title: 'Policy update: Returns, Repairs & RMA (v3)', minutes: 5,
      quiz: [{ q: 'Under v3, what is required before any return is accepted?', a: ['A phone call', 'An RMA number', 'A manager signature', 'Nothing'], c: 1 }] },
    { id: 'o-brands-v2',  docId: 'brands-collections', version: 2, depts: ['all'], date: '2026-10-01', title: 'New collection: Autumn 2026 (12 styles)', minutes: 6,
      quiz: [{ q: 'When do orders open for the Autumn 2026 collection?', a: ['October 1', 'October 15', 'November 1', 'Already open'], c: 1 }] },
    { id: 'o-qc-v2',      docId: 'qc-inspection', version: 2, depts: ['production', 'operations'], date: '2026-09-18', title: 'Process update: QC width tolerance tightened', minutes: 4,
      quiz: [{ q: 'The new width tolerance is…', a: ['±0.05 mm', '±0.10 mm', '±0.15 mm', '±0.20 mm'], c: 1 }] },
    { id: 'o-org-v2',     stage: 'ongoing', docId: 'org-structure', version: 2, depts: ['all'], date: '2026-09-02', title: 'Org update: Operations & Shipping is now its own department', minutes: 3,
      quiz: [{ q: 'Shipping and carrier issues now go to…', a: ['Production', 'Operations & Shipping', 'Sales', 'Finance'], c: 1 }] },
    { id: 'o-policies-v3', docId: 'workplace-policies', version: 3, depts: ['all'], date: '2026-08-21', title: 'Policy update: badge access for vault and casting', minutes: 4,
      quiz: [{ q: 'A lost badge must be reported…', a: ['Within a week', 'The same day', 'At the next review', 'Never'], c: 1 }] },
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
      'o-org-v2': { date: '2026-09-03', version: 2 }, 'o-policies-v3': { date: '2026-08-22', version: 3 },
    },
    priya: { /* supervisor: fully complete */ },
    rosa: {},
    ld: {},
    tom: {
      'm-story': { date: '2025-03-11' }, 'm-culture': { date: '2025-03-11' }, 'm-org': { date: '2025-03-11', version: 1 }, 'm-policies': { date: '2025-03-12', version: 2 },
      'm-comms': { date: '2025-03-12' }, 'm-terms': { date: '2025-03-12' }, 'm-business': { date: '2025-03-13' }, 'm-metals': { date: '2025-03-13' },
      'm-construct': { date: '2025-03-14' }, 'm-brands': { date: '2025-03-14', version: 1 }, 'm-erp': { date: '2025-03-17', version: 1 }, 'm-quotes': { date: '2025-03-17' },
      'm-returns': { date: '2025-03-18', version: 1 }, 'm-retailer': { date: '2025-10-06' }, 'm-shipping': { date: '2026-02-12' },
      'o-policies-v3': { date: '2026-08-25', version: 3 }, 'o-org-v2': { date: '2026-09-04', version: 2 }, 'o-brands-v2': { date: '2026-10-03', version: 2 },
    },
    aisha: {
      'm-story': { date: '2024-08-20' }, 'm-culture': { date: '2024-08-20' }, 'm-org': { date: '2024-08-20', version: 1 }, 'm-policies': { date: '2024-08-21', version: 2 },
      'm-comms': { date: '2024-08-21' }, 'm-terms': { date: '2024-08-21' }, 'm-business': { date: '2024-08-22' }, 'm-metals': { date: '2024-08-22' },
      'm-construct': { date: '2024-08-23' }, 'm-brands': { date: '2024-08-23', version: 1 }, 'm-casting': { date: '2024-08-26' }, 'm-qc': { date: '2024-08-27', version: 1 },
      'm-safety': { date: '2024-08-27' }, 'm-flow': { date: '2024-08-28' }, 'o-policies-v3': { date: '2026-08-21', version: 3 }, 'o-org-v2': { date: '2026-09-02', version: 2 },
      'o-qc-v2': { date: '2026-09-18', version: 2 },
    },
  };
  // Supervisors have completed everything that applies to them.
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

  return { DEPARTMENTS, CATEGORIES, USERS, DOCS, MODULES, ONGOING, SEED_PROGRESS, SEED_REQUESTS, STAGES };
})();
