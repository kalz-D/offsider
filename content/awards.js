// Modern Award classification packs (for the wage builder).
// Rates are the LEGAL MINIMUM (the floor). You can — and most businesses do — pay ABOVE these;
// Offsider's internal pay levels sit on top. You just can't pay BELOW the minimum for a worker's
// actual classification, and award entitlements (overtime, penalties, allowances, super) still apply.
//
// VERIFIED against the Fair Work Manufacturing Award pay guide (MA000010), effective from the first
// full pay period on or after 1 July 2026 (pay guide published 24 June 2026). Full-time adult minimums.
// These change every year (the 1 July increase) — re-check with the Fair Work Pay Calculator (P.A.C.T.).
module.exports = [
  {
    id: 'manufacturing',
    code: 'MA000010',
    name: 'Manufacturing and Associated Industries and Occupations Award',
    shortName: 'Manufacturing Award',
    effective: '2026-07-01',
    casualLoading: 0.25,
    note: 'Legal minimum full-time adult rates from the first full pay period on or after 1 July 2026. These are the floor — pay above them freely. Excludes the 25% casual loading, penalty rates, overtime, allowances and superannuation, which apply on top. Verify with the Fair Work Pay Calculator.',
    source: 'https://www.fairwork.gov.au/employment-conditions/awards/awards-summary/ma000010-summary',
    payTool: 'https://calculate.fairwork.gov.au/',
    levels: [
      { id: 'C14', name: 'C14 — Entry level', weekly: 978.10, hourly: 25.74, defines: 'A new starter doing basic, closely supervised tasks while they learn the ropes.' },
      { id: 'C13', name: 'C13 — Entry+', weekly: 1004.90, hourly: 26.44, defines: 'Performs routine duties to set procedures with some supervision; building basic skills.' },
      { id: 'C12', name: 'C12 — Operator', weekly: 1029.10, hourly: 27.08, defines: 'Works to standard methods across a range of tasks with limited supervision.' },
      { id: 'C11', name: 'C11 — Lab tester / experienced', weekly: 1062.90, hourly: 27.97, defines: 'Runs established tests and procedures with limited supervision; the award\'s Laboratory tester level.' },
      { id: 'C10', name: 'C10 — Qualified / unsupervised', weekly: 1119.10, hourly: 29.45, defines: 'Trade-qualified or equivalent; works unsupervised, plans own work, can guide others.' },
      { id: 'C9', name: 'C9 — Technician', weekly: 1154.30, hourly: 30.38, defines: 'Technician-level work; takes responsibility for quality and may sign off results.' },
      { id: 'C8', name: 'C8 — Technician (specialist)', weekly: 1189.40, hourly: 31.30, defines: 'Specialist or diagnostic technical skills; trains and checks the work of others.' },
      { id: 'C7', name: 'C7 — Senior technician / supervisor', weekly: 1221.10, hourly: 32.13, defines: 'Leads a section or technical area; coordinates work and mentors the team.' },
      { id: 'C6', name: 'C6 — Technical officer', weekly: 1283.10, hourly: 33.77, defines: 'Advanced technical officer; depth across methods with accountability for output.' },
      { id: 'C5', name: 'C5 — Senior technical officer', weekly: 1309.50, hourly: 34.46, defines: 'Coordinates technical operations, quality systems and people across the lab.' }
    ]
  }
];
