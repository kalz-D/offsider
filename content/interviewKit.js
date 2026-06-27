// Lawful Australian interview kit (general guidance, not legal advice).
// Authored by the offsider-interview-kit workflow. Keeps non-HR managers on the right
// side of anti-discrimination law: ask about the JOB, not the person.
module.exports = {
  "applicationFields": [
    {
      "id": "rightToWork",
      "label": "Do you have the right to work in Australia?",
      "type": "choice",
      "options": [
        "Yes — I'm an Australian/NZ citizen or permanent resident",
        "Yes — I hold a valid visa with work rights",
        "Not yet — I'd need sponsorship or a visa"
      ],
      "required": true,
      "help": "We just need to confirm you're legally able to work here. We'll sight a document (passport, visa or similar) if you're offered the role."
    },
    {
      "id": "canPerformRole",
      "label": "This role involves lab testing, accurate numerical data entry and recording results on a computer, some site/field work, lifting up to about 20kg, and driving to sites. Are you able to perform these genuine requirements of the role, with or without reasonable adjustments?",
      "type": "choice",
      "options": [
        "Yes, without any adjustments",
        "Yes, with some reasonable adjustments (tell us below)",
        "Not sure — happy to discuss"
      ],
      "required": true,
      "help": "If you'd need any adjustments to do the job, just note them in the next field. We're glad to work things out with you."
    },
    {
      "id": "roleAdjustments",
      "label": "If you'd need any reasonable adjustments to perform the role, please describe them (optional)",
      "type": "textarea",
      "required": false,
      "help": "Only fill this in if it's relevant to you. Leave it blank otherwise."
    },
    {
      "id": "interviewAdjustments",
      "label": "Do you need any adjustments for the interview itself (e.g. accessible parking, a support person, materials sent ahead, more time)?",
      "type": "textarea",
      "required": false,
      "help": "We want the interview to be fair and comfortable. Tell us anything that would help and we'll sort it."
    },
    {
      "id": "ticketsLicences",
      "label": "Which relevant tickets or licences do you currently hold?",
      "type": "choice",
      "options": [
        "Current Australian driver licence",
        "White Card (construction induction)",
        "First aid certificate",
        "More than one of the above",
        "None of these yet"
      ],
      "required": true,
      "help": "Don't worry if you don't have them all yet — let us know what you've got and we can talk about the rest."
    },
    {
      "id": "licenceDetails",
      "label": "List any tickets/licences you hold and roughly when each expires (optional)",
      "type": "textarea",
      "required": false,
      "help": "For example: 'Open driver licence', 'White Card 2024', 'First aid expires 2027'. We'll sight the originals if you're offered the role."
    },
    {
      "id": "availability",
      "label": "What's your earliest availability or start date?",
      "type": "text",
      "required": true,
      "help": "A rough date is fine — e.g. 'available now', 'two weeks notice', or a specific date."
    },
    {
      "id": "whyRole",
      "label": "Why does this role interest you?",
      "type": "textarea",
      "required": true,
      "help": "A few sentences is plenty. Tell us what draws you to lab/testing work with us."
    }
  ],
  "lawfulQuestions": [
    {
      "category": "Experience",
      "question": "Tell me about any work, study or hobbies where you've followed a set procedure or method closely — what was it, and what was your part in it?",
      "why": "Gets at relevant, transferable experience without assuming a particular background. Lab work is procedure-driven, so this surfaces how they handle defined methods."
    },
    {
      "category": "Experience",
      "question": "Have you done any work that involved measuring, recording numbers, or entering data into a computer? Walk me through an example.",
      "why": "Directly tests the core of the job — accurate measurement and data entry — using their real experience rather than a hypothetical."
    },
    {
      "category": "Attention to detail & accuracy",
      "question": "Describe a time you spotted a mistake — yours or someone else's — before it caused a problem. How did you catch it?",
      "why": "In a testing lab, catching errors early protects the client's results and the lab's accreditation. This shows whether checking work is a habit for them."
    },
    {
      "category": "Attention to detail & accuracy",
      "question": "When you're entering numbers or readings, what do you do to make sure they're right?",
      "why": "Reveals their personal checking routine (double-entry, re-reading, cross-checking) — the day-to-day behaviour that keeps lab data accurate."
    },
    {
      "category": "Attention to detail & accuracy",
      "question": "You're recording results and notice one figure looks odd or doesn't fit the pattern. What do you do?",
      "why": "Tests judgement and honesty around data — whether they flag and investigate rather than 'fix' or ignore an outlier, which matters hugely for sample integrity."
    },
    {
      "category": "Attention to detail & accuracy",
      "question": "How do you keep your focus and accuracy up when a task is repetitive or you're doing the same test many times in a day?",
      "why": "Much lab testing is repetitive; accuracy can't drop on the 50th sample. This checks how they sustain care under monotony."
    },
    {
      "category": "Reliability",
      "question": "Tell me about a time you had a lot on and a deadline. How did you make sure the important things still got done properly?",
      "why": "Reliability and consistent turnaround matter for client samples. Shows how they prioritise without cutting corners."
    },
    {
      "category": "Reliability",
      "question": "How do you organise yourself so nothing slips through — appointments, tasks, things you've promised to do?",
      "why": "Day-to-day dependability is a genuine requirement; this gets at their systems rather than asking about personal circumstances."
    },
    {
      "category": "Safety mindset",
      "question": "Tell me about a time you noticed something unsafe at work or on a site. What did you do about it?",
      "why": "Field and lab work carry real hazards. Shows whether they speak up and act on safety rather than walking past it."
    },
    {
      "category": "Safety mindset",
      "question": "How do you approach a job that needs PPE or has a safety procedure you have to follow exactly?",
      "why": "Tests their attitude to following safety rules and using equipment correctly — non-negotiable in a lab and on site."
    },
    {
      "category": "Teamwork",
      "question": "Describe a time you worked closely with others to get a job done. What was your role, and how did you handle any disagreements?",
      "why": "Lab and field work is collaborative; results depend on people handing over accurate information. Shows how they cooperate and communicate."
    },
    {
      "category": "Teamwork",
      "question": "How do you ask for help, or hand a task over, when you're not sure about something?",
      "why": "In a lab, guessing instead of asking can ruin results. This checks whether they'll raise their hand early rather than push on regardless."
    },
    {
      "category": "Motivation",
      "question": "What kind of work do you find satisfying, and what would make this role a good fit for you?",
      "why": "Gauges genuine interest and likely staying power without touching anything personal or protected."
    },
    {
      "category": "Motivation",
      "question": "Is there anything in this role you'd want to learn or get better at over the next year?",
      "why": "Shows appetite to grow into the tickets and competencies the job can build, and helps you picture them developing with the business."
    }
  ],
  "jobRequirementQuestions": [
    {
      "question": "This role involves accurately entering numerical data and recording test results on a computer. Are you able to do this, with or without reasonable adjustments?",
      "why": "This is the heart of the job — accurate data and results. Asking it as an ability question (with adjustments) keeps it lawful while confirming they can meet the genuine requirement."
    },
    {
      "question": "The role requires lifting and carrying up to about 20kg (e.g. soil or sample containers). Are you able to do this safely, with or without reasonable adjustments?",
      "why": "Manual handling up to 20kg is a real, regular part of the work. Framing it around the task — not the person's health — keeps the focus on the genuine requirement."
    },
    {
      "question": "The job includes driving to sites and working at field locations. Are you able to do this, with or without reasonable adjustments, and do you hold a current driver licence?",
      "why": "Driving and site attendance are genuine requirements. Pairing 'are you able' with the licence question covers both ability and the legal ticket needed."
    },
    {
      "question": "Some of the work is outdoors and in varied weather. Are you able to work outdoors as the role requires, with or without reasonable adjustments?",
      "why": "Field testing happens in the elements. Asking about ability to do the outdoor work avoids prying into health while confirming they can meet the requirement."
    },
    {
      "question": "The role requires following written test methods and procedures precisely, step by step. Are you able to do this, with or without reasonable adjustments?",
      "why": "Lab accreditation depends on methods being followed exactly. This confirms they can work to a documented procedure — a core, genuine requirement."
    },
    {
      "question": "There are tasks that need close attention to detail and accuracy over a full shift. Are you able to sustain that level of accuracy, with or without reasonable adjustments?",
      "why": "Sustained accuracy is genuinely required for reliable results. Asking about ability keeps it lawful while testing fit for the work."
    },
    {
      "question": "The role can involve being on your feet, moving around the lab and sites, and handling equipment and samples. Are you able to perform this kind of physical work, with or without reasonable adjustments?",
      "why": "Confirms ability to do the practical, hands-on parts of the job without asking about disability or medical history."
    },
    {
      "question": "If you'd need any reasonable adjustments to do any part of this job well, what would help? We're glad to work that out with you.",
      "why": "Invites the candidate to raise adjustments openly. It signals you'll meet your duty to make reasonable adjustments and keeps the conversation about the job, not the person."
    }
  ],
  "doNotAsk": [
    {
      "topic": "Disability, health conditions or medical history",
      "example": "'Do you have any health problems, disabilities or conditions we should know about?' or 'Have you ever had a back injury?'",
      "why": "The Disability Discrimination Act makes it unlawful to screen people out because of disability. Health questions before an offer are high-risk and can look like discrimination, even if you didn't mean it that way.",
      "insteadAsk": "Ask about the job: 'This role involves lifting up to about 20kg and entering accurate data on a computer — are you able to do these things, with or without reasonable adjustments?'"
    },
    {
      "topic": "Age or date of birth",
      "example": "'How old are you?', 'What year were you born?', or 'Aren't you a bit young/old for this kind of work?'",
      "why": "The Age Discrimination Act protects both younger and older workers. Age has nothing to do with whether someone can do the job, and asking it can land you in trouble.",
      "insteadAsk": "Confirm legal capacity only where relevant — 'Are you legally able to work in Australia?' — and ask about relevant experience and ability to do the role's tasks."
    },
    {
      "topic": "Marital or family status, children, pregnancy or plans to have children",
      "example": "'Are you married?', 'Do you have kids?', 'Are you planning to start a family?' or 'Who looks after your children?'",
      "why": "Sex Discrimination Act and Fair Work general protections cover family/carer responsibilities and pregnancy. These questions are a classic discrimination trap and have nothing to do with the work.",
      "insteadAsk": "Ask about the genuine requirement instead: 'This role sometimes needs early starts and travel to sites — are you able to meet those requirements of the job?'"
    },
    {
      "topic": "Race, ethnicity, nationality, ancestry or where someone is 'really' from",
      "example": "'Where are you originally from?', 'What's your background?' or 'Were you born here?'",
      "why": "The Racial Discrimination Act makes it unlawful to treat people differently on race or ethnicity. The only thing you legitimately need is whether they can work in Australia.",
      "insteadAsk": "Ask the single lawful version: 'Do you have the right to work in Australia?' — and confirm with a document if you make an offer."
    },
    {
      "topic": "Religion or religious beliefs",
      "example": "'What religion are you?', 'Do you need time off for religious holidays?' or 'Will your beliefs affect your work?'",
      "why": "Religion is protected under Fair Work general protections and state anti-discrimination laws. It's not relevant to lab work and asking can be seen as discriminatory.",
      "insteadAsk": "Ask about real scheduling needs neutrally for everyone: 'The role needs you available for the rostered hours — are you able to work those hours?'"
    },
    {
      "topic": "Sexual orientation or gender identity",
      "example": "'Are you married — to a husband or a wife?', 'Is there a partner at home?' or any question hinting at someone's sexuality or gender identity.",
      "why": "Sexual orientation and gender identity are protected under Fair Work general protections and state laws. They're completely irrelevant to whether someone can do the job.",
      "insteadAsk": "Don't go there at all. Keep the conversation on experience, accuracy, reliability and ability to do the role's genuine tasks."
    },
    {
      "topic": "Past workers compensation or injury claims",
      "example": "'Have you ever made a workers comp claim?' or 'Have you been injured at work before?'",
      "why": "Asking about past claims or injuries is treated as disability-related screening and can breach the Disability Discrimination Act and workers comp laws. It's a serious risk area.",
      "insteadAsk": "Stick to current ability to do the job: 'Are you able to safely lift up to about 20kg and do the field work this role involves, with or without reasonable adjustments?'"
    },
    {
      "topic": "Personal circumstances unrelated to the job (housing, finances, relationships, social life)",
      "example": "'Do you live nearby?', 'How will you afford to get here?' or 'Do you go out a lot on weekends?'",
      "why": "These don't measure ability to do the job and can act as a back-door way of discriminating (e.g. on age or family status). They erode trust and add legal risk for no benefit.",
      "insteadAsk": "Ask the work-relevant version: 'The role needs reliable attendance at our Newcastle lab and travel to sites — are you able to meet that requirement?'"
    }
  ],
  "gutFeelPrompts": [
    "Would I trust this person with a client's sample and their results? Why or why not?",
    "Did they show genuine attention to detail — checking their work, caring about getting numbers right?",
    "How did they come across on reliability and turning up — anything that gives me confidence, or any doubts?",
    "Did they seem safety-minded and willing to follow a method exactly, even when it's repetitive?",
    "Any concerns or red flags I want to note while it's fresh (and is the concern about the job, not the person)?",
    "Overall gut feel out of 10 — and one line on what tipped it that way."
  ],
  "offerLetter": {
    "subject": "An offer to join {{businessName}} — {{roleTitle}}",
    "body": "Hi {{candidateName}},\n\nThanks for taking the time to meet with us. We were genuinely impressed, and I'm pleased to offer you the role of {{roleTitle}} with {{businessName}}.\n\nHere's the gist of it:\n- Role: {{roleTitle}}\n- Pay: {{rate}}\n- Proposed start date: {{startDate}}\n\n{{message}}\n\nLike any role, this offer is subject to the usual checks — references, confirming your right to work in Australia, and sighting any tickets or licences the job needs (such as a driver licence, White Card or first aid). Nothing unusual, just the standard bits to make it official.\n\nWe'll send through the formal paperwork with your full terms and conditions, but I wanted you to hear the good news from me first. We reckon you'll be a great fit and we're looking forward to having you on the team.\n\nTo accept, just reply to this email or click the accept link, and we'll take it from there. If you've got any questions at all before then, give me a call or flick me a message — happy to talk anything through.\n\nWelcome aboard (pending those last few checks)!\n\nCheers,\n{{managerName}}\n{{businessName}}\n{{date}}"
  },
  "tips": [
    "Ask every candidate the same core questions in the same order — it's fairer and makes comparing people far easier when you sit down to decide.",
    "Take notes as you go, while it's fresh. Jot what they actually said, not just your impression — it protects you and helps you remember weeks later.",
    "Focus on the job, not the person. If a question isn't about doing the work, leave it out — when in doubt, ask 'are you able to… with or without reasonable adjustments?'",
    "Always check references before you commit — a couple of quick calls to past supervisors tells you more than another interview.",
    "Get any tickets and licences sighted in person (driver licence, White Card, first aid) and note the expiry dates — don't just take their word for it.",
    "Offer interview adjustments to everyone up front (parking, extra time, materials ahead). It's the right thing to do and keeps the process fair.",
    "This kit is practical guidance to keep you on the right track, not legal advice. For anything tricky or high-stakes, check Fair Work or get proper advice."
  ]
};
