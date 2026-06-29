// The HR coach — Offsider's little "HR offsider" that trains managers on the people stuff.
// Curated tips work with no API key; the "ask anything" box uses ANTHROPIC_API_KEY when set.
module.exports = {
  askIntro: 'Ask me anything about managing your crew — a tricky conversation, what\'s fair, how to bring someone along, what the law expects. Plain, practical, Australian.',
  askSuggestions: [
    'How do I bring up someone\'s lateness fairly?',
    'What\'s a good way to give feedback that actually lands?',
    'How do I help a good worker step up to more responsibility?',
    'What should a probation check-in cover?',
    'Someone\'s not pulling their weight — what do I do first?',
    'How do I keep a good worker from leaving?'
  ],
  managerTips: [
    { title: 'Catch them doing it right', body: 'Specific praise ("the way you handled that callout") beats a generic "good job" — it tells them exactly what to repeat. Aim for more positive than corrective; it buys you trust for the hard chats.' },
    { title: 'A 15-minute check-in prevents fires', body: 'A short one-on-one every week or two surfaces small problems before they blow up — and shows you\'re invested. The best question: "what\'s getting in your way?"' },
    { title: 'Develop, don\'t just manage', body: 'Everyone wants to feel they\'re going somewhere. Talk about the next ticket, skill or rung — even a small stretch task tells someone you see their potential. It\'s the cheapest retention there is.' },
    { title: 'Jot a quick note after a real conversation', body: 'A line with the date and what was said protects everyone — it\'s not bureaucracy, it\'s memory you\'ll be glad of if things ever get formal. Offsider keeps these on the worker\'s file.' },
    { title: 'Address it early, in private', body: 'A quiet word at the first sign beats a formal process later. Stick to the behaviour and its impact ("when the report\'s late, the lab backs up") — not the person.' },
    { title: 'Fair process matters as much as the decision', body: 'People will accept a tough call if they felt heard and the process was fair. Ask their side before you decide — every time.' },
    { title: 'New starters need a real first week', body: 'A buddy, a clear plan, and someone checking in beats "there\'s your bench, good luck". The first month largely decides whether they stay.' },
    { title: 'Praise in public, correct in private', body: 'Never pull someone up in front of the crew — it costs you respect and them their dignity, and the whole team clocks it.' },
    { title: 'Pay above the floor, and say so', body: 'If you pay above the award (most good employers do), make sure people know — it\'s one of the simplest ways to feel valued. Offsider shows the floor vs what you actually pay.' },
    { title: 'Exit chats are gold', body: 'When someone leaves, a calm "what would\'ve made you stay?" tells you more about your business than any survey. Listen, don\'t defend.' }
  ],
  workerTips: [
    { title: 'Ask for feedback — don\'t wait for it', body: '"How am I going? Anything I could do better?" shows you want to grow. Most managers respect it and remember it.' },
    { title: 'Chase the next ticket', body: 'Tickets and competencies are how you climb and earn more. Ask which one\'s worth doing next — and whether the business will help with it.' },
    { title: 'Raise things early and calmly', body: 'If something\'s not right — safety, hours, a problem with a workmate — say it early and matter-of-factly. Good managers want to know while it\'s still small.' }
  ]
};
