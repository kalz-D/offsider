// New-starter profiles. The "pace" tailors how fast their career path is built.
module.exports = [
  { id: 'school', label: 'Fresh from school / first job', pace: 'Steady — lots of guidance', note: 'New to work itself. Go slow, explain the why behind things, and check in often.' },
  { id: 'new_industry', label: 'New to the industry', pace: 'Moderate', note: 'Has worked before, but not in this field. Focus on the technical basics and the first tickets.' },
  { id: 'experienced_trade', label: 'Experienced, from a related trade', pace: 'Faster — fast-track the overlap', note: 'e.g. used to be a welder. Recognise transferable skills and fast-track what already overlaps.' },
  { id: 'career_changer', label: 'Career changer (30s+, new field)', pace: 'Moderate', note: 'Mature starter with strong work habits, learning new technical skills from scratch.' },
  { id: 'returning', label: 'Returning to work', pace: 'Moderate — rebuild confidence', note: 'Back after a break. Refresh skills and rebuild confidence before stretching them.' },
  { id: 'late_career', label: 'Late in career / winding back', pace: 'Light', note: 'Values stability and is great at mentoring. Tap their experience to lift others.' }
];
