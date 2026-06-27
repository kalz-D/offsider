// Manager reflection prompts. These pop up periodically per worker to make the manager
// actually think about each person. Each answer is filed as a note of the given kind, so
// strengths feed recognition, growth areas feed development, interests feed the coach.
// {name} is replaced with the worker's first name in the app.
module.exports = [
  {
    id: 'reflect_basics',
    title: 'Take a minute on {name}',
    intro: 'No wrong answers — the more you notice, the better you lead. Two minutes, tops.',
    questions: [
      { id: 'strengths', label: 'What are 2–3 things {name} does really well?', noteKind: 'positive' },
      { id: 'improve', label: "What's one thing they could grow or get better at?", noteKind: 'watch' },
      { id: 'interest', label: "Anything they've shown interest in, or could be stretched with?", noteKind: 'interest' },
      { id: 'wellbeing', label: 'How are they travelling lately — any flags?', noteKind: 'wellbeing' }
    ]
  },
  {
    id: 'reflect_fresh',
    title: 'A fresh look at {name}',
    intro: 'Step back from the day-to-day for a sec and think about how {name} is really going.',
    questions: [
      { id: 'gone_well', label: "What's gone well for {name} lately that's worth saying out loud?", noteKind: 'positive' },
      { id: 'stuck', label: 'Where do they seem to get stuck or frustrated?', noteKind: 'watch' },
      { id: 'learn', label: "What would they love to learn or have a crack at next?", noteKind: 'interest' }
    ]
  },
  {
    id: 'reflect_human',
    title: '{name} — the human side',
    intro: "Good managers know their people. A quick think about what makes {name} tick.",
    questions: [
      { id: 'motivates', label: 'What seems to motivate {name} — what gets the best out of them?', noteKind: 'general' },
      { id: 'recognised', label: "Are they getting enough recognition? When did you last say thanks?", noteKind: 'positive' },
      { id: 'more_resp', label: 'Are they ready for, or wanting, more responsibility?', noteKind: 'interest' },
      { id: 'friction', label: 'Any friction with the team or the work to keep an eye on?', noteKind: 'watch' }
    ]
  }
];
