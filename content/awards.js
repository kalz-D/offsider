// Modern Award classification packs (for the wage builder).
// Rates are INDICATIVE full-time adult minimums and must be verified against the current
// Fair Work pay guide — award rates change (usually 1 July) and exclude casual loading,
// penalties, overtime and allowances. Businesses set their own actual rates per worker.
//
// Manufacturing Award (MA000010): C14 anchor = $24.28/hr ($922.70/wk, 38h) effective 1 Jul 2025.
// Other levels derived from the standard Manufacturing/Metal classification relativities to C10.
module.exports = [
  {
    id: 'manufacturing',
    code: 'MA000010',
    name: 'Manufacturing and Associated Industries and Occupations Award',
    shortName: 'Manufacturing Award',
    effective: '2025-07-01',
    note: 'Indicative full-time adult minimum rates as at 1 July 2025. Verify current rates with the Fair Work Pay & Conditions Tool (P.A.C.T.). Excludes casual loading (25%), penalty rates, overtime and allowances.',
    source: 'https://www.fairwork.gov.au/employment-conditions/awards/awards-summary/ma000010-summary',
    payTool: 'https://calculate.fairwork.gov.au/',
    levels: [
      { id: 'C14', name: 'C14 — Entry level', relativity: 78.0, weekly: 922.70, hourly: 24.28, defines: 'A new starter doing basic, closely supervised tasks while they learn the ropes.' },
      { id: 'C13', name: 'C13 — Entry+', relativity: 82.0, weekly: 970.02, hourly: 25.53, defines: 'Performs routine duties to set procedures with some supervision; building basic skills.' },
      { id: 'C12', name: 'C12 — Operator', relativity: 87.4, weekly: 1033.90, hourly: 27.21, defines: 'Works to standard methods across a range of tasks with limited supervision.' },
      { id: 'C11', name: 'C11 — Experienced operator', relativity: 92.4, weekly: 1093.04, hourly: 28.76, defines: 'Competent across most routine work, exercises judgement, works with minimal supervision.' },
      { id: 'C10', name: 'C10 — Qualified / unsupervised', relativity: 100.0, weekly: 1182.95, hourly: 31.13, defines: 'Trade-qualified or equivalent; works unsupervised, plans own work, can guide others.' },
      { id: 'C9', name: 'C9 — Advanced', relativity: 105.0, weekly: 1242.10, hourly: 32.69, defines: 'Advanced technical work; takes responsibility for quality and may sign off results.' },
      { id: 'C8', name: 'C8 — Specialist', relativity: 110.0, weekly: 1301.25, hourly: 34.24, defines: 'Specialist or diagnostic technical skills; trains and checks the work of others.' },
      { id: 'C7', name: 'C7 — Senior / lead', relativity: 115.0, weekly: 1360.39, hourly: 35.80, defines: 'Leads a section or technical area; coordinates work and mentors the team.' },
      { id: 'C6', name: 'C6 — Supervisor', relativity: 125.0, weekly: 1478.69, hourly: 38.91, defines: 'Supervises a team or operation, with technical depth and accountability for output.' },
      { id: 'C5', name: 'C5 — Technical officer / coordinator', relativity: 130.0, weekly: 1537.84, hourly: 40.47, defines: 'Coordinates technical operations, quality systems and people across the lab.' }
    ]
  }
];
