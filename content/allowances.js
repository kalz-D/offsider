// Allowances & loadings — a top-up for extra responsibility or conditions, paid ON TOP of
// someone's classification without changing their level. Award figures are the Manufacturing
// Award (MA000010) allowances effective 1 July 2026 — verify with the Fair Work pay guide.
module.exports = {
  intro: 'An allowance is a top-up for extra responsibility or conditions, paid on top of someone\'s base rate — without changing their classification. Perfect for a worker who takes on something extra (like training new starters) but isn\'t moving up a rung.',
  note: 'The award ones below are the Manufacturing Award\'s standard allowances. You can also add your own loading — since you already pay above award, a discretionary "training allowance" is completely fine and common.',
  award: [
    { name: 'Leading hand — in charge of 3–10', amount: 1.29, basis: 'hour', note: 'Award allowance for taking charge of / guiding 3–10 other workers. Fits a senior hand who oversees and trains a few others.' },
    { name: 'Leading hand — in charge of 11–20', amount: 1.93, basis: 'hour', note: 'Award allowance for being in charge of 11–20 workers.' },
    { name: 'Leading hand — in charge of 20+', amount: 2.45, basis: 'hour', note: 'Award allowance for being in charge of more than 20 workers.' },
    { name: 'First aid officer', amount: 22.26, basis: 'week', note: 'For a designated first aid officer who holds a current first aid certificate.' },
    { name: 'In charge of plant', amount: 47.03, basis: 'week', note: 'For being placed in charge of plant/equipment as defined by the award.' }
  ],
  suggestions: [
    { name: 'Training allowance', amount: 2.50, basis: 'hour', note: 'Discretionary top-up for training and mentoring new starters — above award, your call.' },
    { name: 'Site / dirty work allowance', amount: 2.00, basis: 'hour', note: 'Discretionary loading for tougher site conditions.' }
  ]
};
