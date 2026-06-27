// Lawful Australian reference-check kit (general guidance, not legal advice). Authored by workflow.
module.exports = {
  "intro": "\"Hi, is that [referee's name]? My name's {{managerName}} and I'm calling from {{businessName}}, a geotech and environmental testing lab. {{candidateName}} has applied for a role with us as {{roleTitle}} and has given your name as a referee. Is now an okay time for a quick chat, or would another time suit you better? It should only take about ten minutes. Anything you share stays confidential between us and is just used to help us make a fair hiring decision. There are no right or wrong answers — I'm just after your honest take. Happy to start?\"",
  "lawfulNote": "Keep every question about how the person did the job — the same anti-discrimination rules that apply in interviews apply to reference calls, so steer clear of anything personal.",
  "questions": [
    {
      "category": "Confirm the role",
      "question": "Can you confirm the role {{candidateName}} held with you, and roughly the dates they worked there?",
      "why": "Verifies the basic facts on their application and makes sure you're both talking about the same job and time period."
    },
    {
      "category": "Working relationship",
      "question": "How did you work together — were you their manager, or in another role alongside them?",
      "why": "Tells you how close the referee was to the day-to-day work, so you know how much weight to give their answers."
    },
    {
      "category": "What they did",
      "question": "What were their main duties day to day, and what kind of work did they handle?",
      "why": "Confirms the candidate's experience matches what they told you and what the {{roleTitle}} role needs."
    },
    {
      "category": "Strengths",
      "question": "What would you say they were really good at — where did they add the most value?",
      "why": "Shows where the person shines and whether those strengths line up with what your lab needs."
    },
    {
      "category": "Areas to develop",
      "question": "Is there anything they could work on, or where they needed more support?",
      "why": "Everyone has areas to grow. An honest answer here is a good sign, and it helps you support them well if you hire."
    },
    {
      "category": "Reliability and attendance",
      "question": "How did they go with reliability — turning up on time, being there when rostered, and following through on what they took on?",
      "why": "In a testing lab, jobs run to a schedule and clients rely on turnaround times, so dependable attendance really matters."
    },
    {
      "category": "Safety and procedures",
      "question": "How did they handle safety and following set procedures — did they stick to the steps and use the right protective gear without being chased?",
      "why": "Lab and field testing work involves real hazards, so you need someone who takes safety and method seriously."
    },
    {
      "category": "Accuracy and attention to detail",
      "question": "How careful and accurate was their work — did they get the detail right, and could you trust their results and records?",
      "why": "Geotech and environmental results have to stand up to scrutiny, so accuracy and good record-keeping are critical."
    },
    {
      "category": "Taking feedback",
      "question": "When you gave them feedback or a correction, how did they take it and act on it?",
      "why": "Shows whether the person learns, adapts, and works well with supervisors — important in a small, hands-on team."
    },
    {
      "category": "Teamwork",
      "question": "How did they get on with the rest of the team and with clients or site contacts?",
      "why": "In a small lab everyone pitches in, so it helps to know how they work with others under pressure."
    },
    {
      "category": "Would you re-employ",
      "question": "If you had a suitable role open, would you re-employ them — and is there anything that would make you hesitate?",
      "why": "The single most telling question. A clear 'yes' is reassuring; any hesitation is worth gently exploring."
    },
    {
      "category": "Anything else",
      "question": "Is there anything else you think I should know that would help us make a good decision?",
      "why": "Gives the referee an open door to raise something useful that your questions didn't cover."
    }
  ],
  "redFlags": [
    "Long pauses or hesitation before answering simple questions like 'would you re-employ them?' — the words might be positive but the delay isn't.",
    "Vague, non-committal answers that dodge specifics — 'they were fine', 'yeah, okay', with nothing concrete behind it.",
    "'I'd rather not comment on that' or steering away from a particular area, especially around reliability, safety or honesty.",
    "Refusing or being unable to confirm basic facts like the role, dates, or that they actually managed the person.",
    "Praise that feels scripted or over-the-top with no real examples — references that are all glow and no detail can be a setup.",
    "A mismatch between what the referee says and what the candidate told you about their role, duties, or reason for leaving."
  ],
  "requestEmail": {
    "subject": "Quick reference chat about {{candidateName}} — {{businessName}}",
    "body": "Hi [Referee's name],\n\nI'm {{managerName}} from {{businessName}}, a geotech and environmental testing lab. {{candidateName}} has applied for a role with us as {{roleTitle}} and listed you as a referee.\n\nWould you have ten minutes for a quick phone chat about your experience working with them? I'm just after an honest, general sense of how they went in the role — nothing too formal, and anything you share stays confidential.\n\nCould you let me know a couple of times that suit you over the next few days, and the best number to reach you on? I'm happy to work around you.\n\nThanks very much for your help.\n\nKind regards,\n{{managerName}}\n{{businessName}}"
  },
  "doNotAsk": [
    {
      "topic": "Age or how close they are to retirement",
      "why": "Age is a protected attribute — asking about it (or hints like 'are they slowing down?') can be unlawful discrimination and tells you nothing about the work.",
      "insteadAsk": "Ask about their reliability, energy on the job, and whether they kept up with the demands of the role."
    },
    {
      "topic": "Health, disability, injuries or workers' comp history",
      "why": "A person's medical history and any disability are protected, and reference calls are not the place to dig into them.",
      "insteadAsk": "Ask whether they reliably met the requirements of the role and followed safety procedures."
    },
    {
      "topic": "Family, pregnancy, kids or relationship status",
      "why": "Family and carer responsibilities are protected attributes and have nothing to do with how someone performs the job.",
      "insteadAsk": "Ask about their attendance, dependability, and whether they followed through on their commitments at work."
    },
    {
      "topic": "Religion, ethnicity, nationality or cultural background",
      "why": "These are protected attributes — asking about them is discriminatory and irrelevant to the role.",
      "insteadAsk": "Ask about how they worked with the team and clients, and how they handled the actual duties."
    },
    {
      "topic": "Union membership, political views, or making a past complaint/claim",
      "why": "It's unlawful to screen people out for union activity or for having raised a workplace complaint, and it has no bearing on job performance.",
      "insteadAsk": "Ask how they took feedback and worked within the team's processes and standards."
    }
  ]
};
