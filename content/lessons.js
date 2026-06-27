// Lessons + quizzes. Push one to a worker; they read it and sit the quiz in their portal.
// Pass it, and the linked competency ticks itself on their career ladder + Training Record.
//
// To add your own lesson, copy the shape below:
//   {
//     id: 'unique_id',
//     title: 'Lesson title',
//     blurb: 'One line shown in the list.',
//     forRoles: ['role_id'],            // optional — which ladder roles it suits (just a hint)
//     signsOff: 'role_id:stepIndex',    // optional — competency key it ticks when passed (e.g. 'lab_technician:0')
//     competencyLabel: 'What it signs off',
//     passMark: 0.7,                    // fraction of questions correct needed to pass
//     intro: 'Short intro shown at the top.',
//     sections: [ { heading: '...', body: '...' } ],   // the lesson content
//     quiz: [ { id: 'q1', question: '...', options: ['a','b','c','d'], answer: 1 } ]  // answer = index of correct option
//   }
module.exports = [
  {
    id: 'lab_site_safety',
    title: 'Lab & site safety basics',
    blurb: 'The non-negotiables before you touch a sample or step on site.',
    forRoles: ['lab_assistant_sample_prep'],
    signsOff: 'lab_assistant_sample_prep:3',
    competencyLabel: 'White Card / site safety',
    passMark: 0.7,
    intro: 'Before you touch a sample or step on site, these basics keep you and the crew safe. Quick read, then a few questions.',
    sections: [
      { heading: 'Your White Card', body: 'Anyone working on a construction site in Australia needs a Construction Induction Card (White Card). It proves you have done the general safety induction. No White Card, no site.' },
      { heading: 'PPE, every time', body: 'In the lab and on site: safety boots, hi-vis, eye protection, and gloves when handling chemicals or hot gear. Hard hat on site. If you have not got the right gear, do not start the task.' },
      { heading: 'Speak up', body: 'If something looks unsafe — dodgy scaffold, a spill, a missing guard — stop and tell your supervisor. Near-misses get reported too. Nobody ever got in trouble for raising a hazard.' }
    ],
    quiz: [
      { id: 'q1', question: 'What does a White Card prove?', options: ['You are a qualified tradesperson', 'You have completed the general construction safety induction', 'You can drive the work ute', 'You are a trained first aider'], answer: 1 },
      { id: 'q2', question: 'You realise you have forgotten your safety glasses. What do you do?', options: ['Start anyway, just be careful', 'Borrow a mate’s used pair', 'Do not start the task until you have proper eye protection', 'Wait until smoko'], answer: 2 },
      { id: 'q3', question: 'You spot a small chemical spill near the bench. Best move?', options: ['Ignore it — someone will clean it', 'Stop, make it safe if you can, and tell your supervisor', 'Walk around it', 'Wipe it up with your bare hand'], answer: 1 }
    ]
  },
  {
    id: 'moisture_content',
    title: 'Moisture content testing (AS 1289.2.1.1)',
    blurb: 'One of the most common soil tests — the method and what good looks like.',
    forRoles: ['lab_assistant_sample_prep', 'lab_technician'],
    signsOff: 'lab_assistant_sample_prep:0',
    competencyLabel: 'Moisture content testing',
    passMark: 0.7,
    intro: 'Moisture content underpins compaction and a lot of other results. Here is the method and the easy mistakes to avoid.',
    sections: [
      { heading: 'What it measures', body: 'The moisture content is the mass of water in a soil sample, as a percentage of the dry soil mass. Get this wrong and everything built on it is wrong too.' },
      { heading: 'The method', body: 'Weigh a clean, dry container and record its mass. Add the moist sample and weigh again. Dry it in the oven at 105–110°C until constant mass (usually overnight). Weigh the dry sample. Moisture content % = (mass of water ÷ mass of dry soil) × 100.' },
      { heading: 'Getting it right', body: 'Use a clean container and record its mass. Do not lose any sample. Make sure it is fully dry before the final weigh — a sample still damp gives a wrong, low reading. Record every mass clearly as you go.' }
    ],
    quiz: [
      { id: 'q1', question: 'Moisture content is the mass of water as a percentage of…', options: ['the wet soil mass', 'the dry soil mass', 'the container mass', 'the total including the container'], answer: 1 },
      { id: 'q2', question: 'What oven temperature is used to dry the sample?', options: ['50–60°C', '75–85°C', '105–110°C', '150–160°C'], answer: 2 },
      { id: 'q3', question: 'You weigh it after a few hours but it may still be damp. What now?', options: ['Record it anyway', 'Keep drying until it reaches constant mass', 'Add more water', 'Estimate the dry mass'], answer: 1 },
      { id: 'q4', question: 'Why record the empty container mass?', options: ['So you can subtract it to get the true soil mass', 'It is not needed', 'Just to label the sample', 'For the invoice'], answer: 0 }
    ]
  },
  {
    id: 'concrete_cylinders',
    title: 'Concrete cylinders — sampling & testing (AS 1012)',
    blurb: 'Sampling, curing and testing concrete for compressive strength.',
    forRoles: ['field_technician'],
    signsOff: 'field_technician:1',
    competencyLabel: 'Concrete cylinder testing',
    passMark: 0.7,
    intro: 'Sampling and testing concrete cylinders is a core field-and-lab job. Here is the rundown to AS 1012.',
    sections: [
      { heading: 'Sampling on site', body: 'Sample to AS 1012.1. Fill the moulds in layers and compact each layer (rod or vibrate) to remove trapped air. Level off the top. Label clearly with the job, date and location.' },
      { heading: 'Curing', body: 'Keep the cylinders moist and protected on site for the first day, then transport them carefully and cure in a controlled water bath or moist room until testing — usually at 7 and 28 days.' },
      { heading: 'Testing (AS 1012.9)', body: 'Cap or grind the ends flat, place the cylinder centrally in the machine, and load at the standard rate until it fails. Record the maximum load. Compressive strength = load ÷ cross-sectional area.' }
    ],
    quiz: [
      { id: 'q1', question: 'Why compact each layer when filling the mould?', options: ['To remove trapped air for an accurate result', 'To make it heavier', 'To speed up curing', 'No real reason'], answer: 0 },
      { id: 'q2', question: 'Concrete cylinders are commonly tested at…', options: ['1 and 3 days', '7 and 28 days', '14 and 60 days', 'only 28 days'], answer: 1 },
      { id: 'q3', question: 'Compressive strength is calculated as…', options: ['load × area', 'load ÷ cross-sectional area', 'mass ÷ volume', 'load ÷ length'], answer: 1 },
      { id: 'q4', question: 'Why must the cylinder ends be flat (capped or ground)?', options: ['So the load is applied evenly', 'Just to look neat', 'To fit the label', 'It does not matter'], answer: 0 }
    ]
  }
];
