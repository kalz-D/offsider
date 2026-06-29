// Safety kit — ready-to-run toolbox talks + policy/SWMS starters for a small AU business.
// Toolbox talks are short, practical safety chats; the crew signs on after. Edit any of these.
module.exports = {
  toolboxLibrary: [
    { title: 'Manual handling & lifting', body: 'Plan the lift, test the weight, get help or gear for anything awkward.\n• Bend the knees, keep the load close, no twisting.\n• Break big loads into smaller trips.\n• Speak up early about niggles — strains add up.\nDiscussion: what\'s the heaviest/most awkward thing we lift here, and is there a better way?' },
    { title: 'Hazardous substances & chemicals', body: 'Know what you\'re handling before you open it.\n• Read the label and the SDS; store chemicals correctly and labelled.\n• Wear the right PPE — gloves, eye protection, ventilation.\n• Never mix unknowns; clean spills straight away per the SDS.\nDiscussion: where are our SDS kept, and which chemicals here need the most care?' },
    { title: 'PPE — right gear, worn right', body: 'PPE is the last line of defence — but only if it\'s worn and in good nick.\n• Safety glasses, gloves, hearing, hi-vis, boots — match to the task.\n• Check it before use; replace damaged gear.\n• If PPE is uncomfortable or missing, tell your supervisor.\nDiscussion: any PPE that\'s worn out or that people skip — and why?' },
    { title: 'Housekeeping & slips/trips', body: 'A tidy site is a safe site.\n• Clean as you go; cords and hoses off walkways.\n• Spills wiped immediately; bins not overflowing.\n• Clear access to exits, switchboards and extinguishers.\nDiscussion: where do we keep tripping or having to step around mess?' },
    { title: 'Working near plant & machinery', body: 'Respect the machines and the people running them.\n• Stay clear of moving parts; no loose clothing/jewellery.\n• Only operate gear you\'re trained and authorised for.\n• Lock-out/tag-out before clearing jams or maintenance.\nDiscussion: which machine here would you want everyone reminded about?' },
    { title: 'Fatigue & taking breaks', body: 'Tired workers make mistakes and get hurt.\n• Take your breaks; hydrate, especially in the heat.\n• Flag it if you\'re running on empty — we\'ll sort the load.\n• Watch out for each other late in the shift.\nDiscussion: when in the day/week are we most likely to be running tired?' },
    { title: 'Electrical safety', body: 'Treat all leads and gear as live.\n• Visually check leads and plugs; tag-out anything damaged.\n• Keep electrical away from water; use RCDs.\n• Don\'t do electrical work unless you\'re licensed for it.\nDiscussion: any dodgy leads or power points we should pull from service?' },
    { title: 'Emergency procedures', body: 'Know the plan before you need it.\n• Where are the exits, assembly point, first aid kit, extinguishers?\n• Who are our first aiders and fire wardens?\n• Report incidents and near-misses — every time.\nDiscussion: if the alarm went now, does everyone know where to go?' }
  ],
  policyStarters: [
    { title: 'Drug & alcohol policy', body: 'Summarise your expectations: fit for work, no alcohol/drugs on site, testing if applicable, support available. Replace this with your actual policy text.' },
    { title: 'Code of conduct', body: 'How we treat each other and customers: respect, no bullying/harassment, honesty, looking after gear. Replace with your wording.' },
    { title: 'Safe Work Method Statement (SWMS)', body: 'For a high-risk task: the steps, the hazards at each step, and the controls. Paste your SWMS here and have the crew sign on before the job.' }
  ],
  severities: ['Low', 'Medium', 'High', 'Critical'],
  hazardIntro: 'See something unsafe — a hazard, a near-miss, or something that needs fixing? Flag it here. Quick is fine; we\'ll follow up.'
};
