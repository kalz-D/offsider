// Auto-generated guided decision-tree flows.
module.exports = [
  {
    "id": "underperformance",
    "category": "performance",
    "name": "Underperformance",
    "blurb": "A worker isn't hitting the standard on quality, output or reliability, and you're not sure what to do next.",
    "sentiment": "supportive",
    "icon": "📉",
    "startNode": "where_up_to",
    "nodes": [
      {
        "id": "where_up_to",
        "kind": "question",
        "title": "Where are you up to?",
        "body": "Quick one so Offsider drops you in the right spot.",
        "options": [
          {
            "label": "Just a thought — I haven't said anything yet",
            "next": "intro",
            "note": "I'll help you prepare for the chat."
          },
          {
            "label": "I've already had a quick word",
            "next": "quick_log_existing",
            "note": "Let’s jot it down before it’s forgotten."
          },
          {
            "label": "It's been going on a while",
            "next": "intro",
            "note": "Let's look at the history and do it properly."
          }
        ]
      },
      {
        "id": "quick_log_existing",
        "kind": "log",
        "title": "Jot down the chat you had",
        "body": "Note what you said, when, and what you agreed. A quick dated note now saves a lot of grief later.",
        "documentId": "file_note",
        "next": "quick_followup"
      },
      {
        "id": "quick_followup",
        "kind": "action",
        "title": "Book a follow-up",
        "body": "Put a date in the diary to check whether it's improved. Offsider will nudge you when it's due.",
        "next": "quick_next"
      },
      {
        "id": "quick_next",
        "kind": "question",
        "title": "What now?",
        "body": "Totally up to you.",
        "options": [
          {
            "label": "Walk me through the full steps",
            "next": "intro"
          },
          {
            "label": "That's it for now",
            "next": "quick_parked"
          }
        ]
      },
      {
        "id": "quick_parked",
        "kind": "outcome",
        "title": "Logged — nice work",
        "body": "It's on the record with a follow-up booked. Come back and walk the full steps any time if it doesn't improve.",
        "next": null
      },
      {
        "id": "intro",
        "kind": "intro",
        "title": "Let's sort this out together",
        "body": "Someone on the team isn't meeting the standard, and that's frustrating. We'll walk through what you've set up so far and map fair next steps. Good notes here protect you, the business and the worker, so let's start calm and get it right.",
        "next": "oneoff_or_pattern"
      },
      {
        "id": "oneoff_or_pattern",
        "kind": "question",
        "title": "One-off slip or a pattern?",
        "body": "Be honest with yourself here. Is this a single bad day, or something you've noticed building over weeks or months?",
        "options": [
          {
            "label": "A one-off, out of character",
            "next": "quiet_word_outcome",
            "note": "Everyone has an off day."
          },
          {
            "label": "A pattern over recent weeks or months",
            "next": "what_standard",
            "note": "This needs a proper look."
          },
          {
            "label": "Honestly not sure yet",
            "next": "what_standard",
            "note": "Let's check the history and find out."
          }
        ]
      },
      {
        "id": "what_standard",
        "kind": "question",
        "title": "What standard are they missing?",
        "body": "Get specific. Pick the area where they're falling short so we know what we're really talking about.",
        "options": [
          {
            "label": "Quality of work",
            "next": "expectations_checklist"
          },
          {
            "label": "Output or speed",
            "next": "expectations_checklist"
          },
          {
            "label": "Reliability or attendance",
            "next": "expectations_checklist"
          },
          {
            "label": "A mix of things",
            "next": "expectations_checklist"
          }
        ]
      },
      {
        "id": "expectations_checklist",
        "kind": "checklist",
        "title": "What have you actually done so far?",
        "body": "Tick only the ones you've genuinely done. No judgement here, this just shows us where the gaps are.",
        "items": [
          {
            "id": "told_clearly",
            "label": "Told them clearly what 'good' looks like",
            "help": "Spelled out the actual standard, not just 'lift your game'.",
            "suggestsDocument": "expectations_letter"
          },
          {
            "id": "in_writing",
            "label": "Put the expectations in writing",
            "help": "A short letter or email they can look back on.",
            "suggestsDocument": "expectations_letter"
          },
          {
            "id": "gave_feedback",
            "label": "Given honest feedback early, not just bottled it up",
            "help": "Had a real chat when you first noticed the slip.",
            "suggestsDocument": "informal_chat_record"
          },
          {
            "id": "regular_checkins",
            "label": "Had regular check-ins over recent months",
            "help": "Not just one chat months ago.",
            "suggestsDocument": "check_in_record"
          },
          {
            "id": "kept_dates",
            "label": "Kept dated notes of those conversations",
            "help": "Dates, what was said, what you agreed.",
            "suggestsDocument": "file_note"
          }
        ],
        "next": "expectations_gap"
      },
      {
        "id": "expectations_gap",
        "kind": "question",
        "title": "Were expectations ever set and written down?",
        "body": "This is the big one. If the worker was never clearly told the standard, it isn't fair to warn them for missing it. We fix that first.",
        "options": [
          {
            "label": "No, never really set them out",
            "next": "make_expectations",
            "note": "Let's get this right before anything else."
          },
          {
            "label": "Set verbally but nothing in writing",
            "next": "make_expectations",
            "note": "Let's put it on paper."
          },
          {
            "label": "Yes, set clearly and in writing",
            "next": "feedback_history"
          }
        ]
      },
      {
        "id": "make_expectations",
        "kind": "document",
        "title": "Put the expectations in writing first",
        "documentId": "expectations_letter",
        "why": "You can't fairly pull someone up for missing a bar they were never shown. A short, plain letter setting out the standard gives them a real chance and gives you solid ground to stand on. This is the fair starting point, not a warning.",
        "next": "log_expectations_chat"
      },
      {
        "id": "log_expectations_chat",
        "kind": "log",
        "title": "Sit down and record the chat",
        "body": "Walk them through the expectations face to face, then jot down the date, who was there and what you agreed. A quick file note now saves a lot of grief later.",
        "documentId": "file_note",
        "next": "feedback_history"
      },
      {
        "id": "feedback_history",
        "kind": "question",
        "title": "Have you given honest feedback over recent months?",
        "body": "Think back. Has this person actually heard that they're falling short, more than once, with a chance to lift?",
        "options": [
          {
            "label": "Yes, several real conversations",
            "next": "log_recent_checkin"
          },
          {
            "label": "Once or twice, a while back",
            "next": "log_recent_checkin",
            "note": "Worth a fresh, clear chat."
          },
          {
            "label": "Not really, I've let it slide",
            "next": "informal_chat_doc",
            "note": "Start with an honest, supportive chat."
          }
        ]
      },
      {
        "id": "informal_chat_doc",
        "kind": "document",
        "title": "Start with an honest, supportive chat",
        "documentId": "informal_chat_record",
        "why": "Before anything formal, the worker deserves a clear heads-up and a real chance to turn it around. Record what you raised, what support you offered and what you agreed. Often a good chat is all it takes.",
        "next": "log_recent_checkin"
      },
      {
        "id": "log_recent_checkin",
        "kind": "log",
        "title": "Record where things stand now",
        "body": "Note today's date, what the gap is, and what you've already talked about. This becomes your timeline if things go further.",
        "documentId": "check_in_record",
        "next": "improved_question"
      },
      {
        "id": "improved_question",
        "kind": "question",
        "title": "After the chats, has anything improved?",
        "body": "Give it a fair shake. Have you seen any genuine effort or lift since you raised it?",
        "options": [
          {
            "label": "Yes, heading in the right direction",
            "next": "book_followup"
          },
          {
            "label": "A little, but not enough yet",
            "next": "pip_doc"
          },
          {
            "label": "No change despite clear feedback",
            "next": "pip_doc"
          }
        ]
      },
      {
        "id": "pip_doc",
        "kind": "document",
        "title": "Set up an improvement plan",
        "documentId": "performance_improvement_plan",
        "why": "A simple plan makes it fair and clear: here's the standard, here's the support, here's the timeframe, here's how we'll check in. It gives a real chance to improve and shows you did the right thing by them.",
        "next": "book_followup"
      },
      {
        "id": "book_followup",
        "kind": "action",
        "title": "Book the next check-in now",
        "body": "Don't leave it open-ended. Put a date in the diary, a couple of weeks out, to sit down and review honestly. Tell them when it is so they know it's coming.",
        "next": "review_outcome"
      },
      {
        "id": "review_outcome",
        "kind": "question",
        "title": "At the review, how's it looking?",
        "body": "Be fair and be honest. Where has it landed after a real chance to improve?",
        "options": [
          {
            "label": "Back on track, sorted",
            "next": "resolved_outcome"
          },
          {
            "label": "Improving, give it more time",
            "next": "book_followup"
          },
          {
            "label": "Still missing the standard",
            "next": "warning_doc"
          }
        ]
      },
      {
        "id": "warning_doc",
        "kind": "document",
        "title": "Time for a first written warning",
        "documentId": "first_written_warning",
        "why": "If clear expectations, support and a fair chance haven't worked, a written warning is the next honest step. Spell out the standard, what's still missing and what happens if it doesn't change. Let them bring a support person to the meeting.",
        "next": "escalate_adviser"
      },
      {
        "id": "escalate_adviser",
        "kind": "escalation",
        "title": "Loop in the right people before formal action",
        "body": "Before you issue a warning or go any further, talk it over with the owner or director, then get a quick word with an external HR or employment-law adviser. A short call now keeps you on the right side of the Fair Work system.",
        "escalateTo": "Owner or director, then an external HR or employment-law adviser",
        "documentId": "escalation_summary",
        "next": "moved_to_formal_outcome"
      },
      {
        "id": "quiet_word_outcome",
        "kind": "outcome",
        "title": "Probably just a quiet word",
        "body": "If it's genuinely a one-off, a friendly check-in is usually plenty. Make sure they're alright, remind them of the standard, and keep a short note in case a pattern shows up later.",
        "next": null
      },
      {
        "id": "resolved_outcome",
        "kind": "outcome",
        "title": "Sorted, and you did it right",
        "body": "Nice work. You set clear expectations, gave honest feedback and a real chance to improve, and it worked. Keep your dated notes on file and keep the check-ins going so it stays on track.",
        "next": null
      },
      {
        "id": "moved_to_formal_outcome",
        "kind": "outcome",
        "title": "Moving into a formal process",
        "body": "You've given this person a fair go: clear expectations, support, feedback and time. Now it's a formal matter, so lean on your adviser, keep every step dated and in writing, and follow their guidance from here. You've done the right thing by everyone.",
        "next": null
      }
    ]
  },
  {
    "id": "conduct",
    "category": "conduct",
    "name": "Conduct & behaviour",
    "blurb": "Someone's behaviour, attitude or safety habits are off, and you're not sure how to handle it the right way.",
    "sentiment": "watchful",
    "icon": "⚠️",
    "startNode": "where_up_to",
    "nodes": [
      {
        "id": "where_up_to",
        "kind": "question",
        "title": "Where are you up to?",
        "body": "Quick one so Offsider drops you in the right spot.",
        "options": [
          {
            "label": "Just a thought — I haven't said anything yet",
            "next": "intro",
            "note": "I'll help you prepare for the chat."
          },
          {
            "label": "I've already had a quick word",
            "next": "quick_log_existing",
            "note": "Let’s jot it down before it’s forgotten."
          },
          {
            "label": "It's been going on a while",
            "next": "intro",
            "note": "Let's look at the history and do it properly."
          }
        ]
      },
      {
        "id": "quick_log_existing",
        "kind": "log",
        "title": "Jot down the chat you had",
        "body": "Note what you said, when, and what you agreed. A quick dated note now saves a lot of grief later.",
        "documentId": "file_note",
        "next": "quick_followup"
      },
      {
        "id": "quick_followup",
        "kind": "action",
        "title": "Book a follow-up",
        "body": "Put a date in the diary to check whether it's improved. Offsider will nudge you when it's due.",
        "next": "quick_next"
      },
      {
        "id": "quick_next",
        "kind": "question",
        "title": "What now?",
        "body": "Totally up to you.",
        "options": [
          {
            "label": "Walk me through the full steps",
            "next": "intro"
          },
          {
            "label": "That's it for now",
            "next": "quick_parked"
          }
        ]
      },
      {
        "id": "quick_parked",
        "kind": "outcome",
        "title": "Logged — nice work",
        "body": "It's on the record with a follow-up booked. Come back and walk the full steps any time if it doesn't improve.",
        "next": null
      },
      {
        "id": "intro",
        "kind": "intro",
        "title": "Let's sort this out properly",
        "body": "Something about a worker's behaviour, attitude or safety habits isn't sitting right. We'll separate a one-off from a pattern, get the facts straight, and walk a fair process that protects you and them. Take it one step at a time.",
        "next": "safety_gate"
      },
      {
        "id": "safety_gate",
        "kind": "question",
        "title": "First up: is anyone in danger right now?",
        "body": "Before anything else, deal with immediate safety. If someone could get hurt this minute, stop the job and make the area safe first.",
        "options": [
          {
            "label": "Yes, there's an immediate safety risk",
            "next": "make_safe_now",
            "note": "Sort the danger before the paperwork."
          },
          {
            "label": "No, no one's in danger right now",
            "next": "one_off_or_pattern",
            "note": "Good. Let's work through it calmly."
          }
        ]
      },
      {
        "id": "make_safe_now",
        "kind": "action",
        "title": "Make it safe before anything else",
        "body": "Stop the task, remove the hazard or the person from it, and look after anyone affected. Once everyone's safe, come back and keep working through this. Safety always comes before process.",
        "next": "one_off_or_pattern"
      },
      {
        "id": "one_off_or_pattern",
        "kind": "question",
        "title": "Is this a one-off or a pattern?",
        "body": "Be honest with yourself. A genuine first slip is handled very differently from the same problem happening again and again.",
        "options": [
          {
            "label": "First time I've seen it",
            "next": "gather_facts",
            "note": "We'll keep it fair and proportionate."
          },
          {
            "label": "It's happened before / it's a pattern",
            "next": "gather_facts",
            "note": "Patterns need a clearer paper trail."
          }
        ]
      },
      {
        "id": "gather_facts",
        "kind": "log",
        "title": "Write down what actually happened",
        "body": "Before you talk to anyone, jot down the plain facts: what happened, when, where, and who was involved or saw it. Stick to what you know, not what you assume.",
        "next": "how_serious"
      },
      {
        "id": "how_serious",
        "kind": "question",
        "title": "How serious is it, really?",
        "body": "Most issues are misconduct: handle it, give a fair chance to fix it. A few are serious misconduct (like violence, theft, being drunk on site, or a deliberate major safety breach) where the job itself may be at risk.",
        "options": [
          {
            "label": "Minor or moderate (rudeness, cutting corners, breaking a rule)",
            "next": "expectations_check",
            "note": "The fair, coach-them-up path."
          },
          {
            "label": "Serious (violence, theft, intoxicated, deliberate danger)",
            "next": "serious_misconduct_pause",
            "note": "Slow right down and get advice."
          },
          {
            "label": "Not sure where it sits",
            "next": "serious_misconduct_pause",
            "note": "When in doubt, treat it carefully and get advice."
          }
        ]
      },
      {
        "id": "serious_misconduct_pause",
        "kind": "escalation",
        "title": "Pause and get the right advice",
        "body": "Serious misconduct can justify quicker action, but it's also where mistakes get costly. Don't act on the spot beyond making things safe. Talk to the owner or director, then an external HR or employment-law adviser before any suspension or dismissal.",
        "escalateTo": "Owner or director, then an external HR or employment-law adviser",
        "documentId": "escalation_summary",
        "next": "outcome_escalated"
      },
      {
        "id": "expectations_check",
        "kind": "checklist",
        "title": "Did they actually know the standard?",
        "body": "People can only meet a rule they understood. Tick what you've genuinely done. Anything you can't tick is a gap to fix before any warning.",
        "items": [
          {
            "id": "set_expectation",
            "label": "I made the expectation or site rule clear to them",
            "help": "e.g. the safety rule, how we treat each other, the standard for this site.",
            "suggestsDocument": "expectations_letter"
          },
          {
            "id": "in_writing",
            "label": "It's written down somewhere they can see it",
            "help": "Induction, toolbox notes, a policy or a short letter.",
            "suggestsDocument": "expectations_letter"
          },
          {
            "id": "regular_feedback",
            "label": "I've given them honest feedback over recent months",
            "help": "Not just at problems, but along the way.",
            "suggestsDocument": "check_in_record"
          }
        ],
        "next": "expectations_gap"
      },
      {
        "id": "expectations_gap",
        "kind": "gap_check",
        "title": "Set the standard in writing first",
        "body": "If the expectation was never set clearly or never written down, fix that before any warning. Putting it in writing isn't red tape, it's the fair thing, and it protects everyone. If it was already clear, skip ahead.",
        "documentId": "expectations_letter",
        "why": "A short, plain letter setting out the standard means no one can say they didn't know. That's the foundation a fair process stands on.",
        "next": "have_the_chat"
      },
      {
        "id": "have_the_chat",
        "kind": "action",
        "title": "Have a calm, private chat",
        "body": "Pull them aside somewhere private. Describe what you saw, listen to their side properly, and be clear about the standard you need going forward. Most things get sorted right here.",
        "next": "log_the_chat"
      },
      {
        "id": "log_the_chat",
        "kind": "log",
        "title": "Record the chat while it's fresh",
        "body": "Straight after, write down the date, who was there, what you raised, what they said, and what you both agreed. A couple of lines is plenty.",
        "next": "informal_record_doc"
      },
      {
        "id": "informal_record_doc",
        "kind": "document",
        "title": "Capture it as a proper note",
        "body": "Turn your scribble into a tidy, dated record. It's not a warning, just proof you handled it fairly and gave them a real chance.",
        "documentId": "informal_chat_record",
        "why": "If the behaviour stops, this quietly closes the loop. If it doesn't, you've got a clear, dated starting point and you're not caught flat-footed.",
        "next": "did_it_improve"
      },
      {
        "id": "did_it_improve",
        "kind": "question",
        "title": "After the chat, did things improve?",
        "body": "Give it a fair run, then check in. Did the behaviour actually change?",
        "options": [
          {
            "label": "Yes, it's sorted",
            "next": "book_followup",
            "note": "Lock in the good result."
          },
          {
            "label": "No, or it's slipped back",
            "next": "warning_decision",
            "note": "Time to step it up fairly."
          }
        ]
      },
      {
        "id": "book_followup",
        "kind": "action",
        "title": "Book a quick follow-up",
        "body": "Put a short check-in in the diary for a few weeks out to make sure it sticks. A bit of recognition when someone turns it around goes a long way.",
        "next": "outcome_resolved"
      },
      {
        "id": "warning_decision",
        "kind": "gap_check",
        "title": "Time for a written warning",
        "body": "You've set the standard, had the chat, and it hasn't changed. A first written warning is the fair next rung: it spells out the issue, the standard, and what happens if it continues.",
        "documentId": "first_written_warning",
        "why": "A clear written warning gives them one more honest chance and shows you've run a fair process. Have a quick word with the owner first, and get outside advice if dismissal is even on the horizon.",
        "next": "warning_escalation"
      },
      {
        "id": "warning_escalation",
        "kind": "escalation",
        "title": "Loop in the next rung up",
        "body": "Before you issue a formal warning, bring in the owner or director. If the path could lead to dismissal, get an external HR or employment-law adviser involved now, not after.",
        "escalateTo": "Owner or director, then an external HR or employment-law adviser",
        "documentId": "escalation_summary",
        "next": "outcome_formal"
      },
      {
        "id": "outcome_resolved",
        "kind": "outcome",
        "title": "Sorted, and on the record",
        "body": "You handled it early, fairly, and you've got a dated note to show it. That's exactly how this should go. Keep an eye out and recognise the turnaround.",
        "next": null
      },
      {
        "id": "outcome_formal",
        "kind": "outcome",
        "title": "Moved to a formal process",
        "body": "You've given a real chance to improve and you're now on a documented, fair footing. Keep dated records, let them bring a support person to formal meetings, and lean on your adviser before any big step.",
        "next": null
      },
      {
        "id": "outcome_escalated",
        "kind": "outcome",
        "title": "Escalated for the serious stuff",
        "body": "You did the right thing slowing down. With the owner and a proper adviser guiding it, you're protecting the business, yourself and the worker. Let them steer the next steps.",
        "next": null
      }
    ]
  },
  {
    "id": "absence",
    "category": "absence",
    "name": "Absence & lateness",
    "blurb": "Someone keeps turning up late, calling in sick a lot, or not showing at all, and you're not sure what to do.",
    "sentiment": "watchful",
    "icon": "⏰",
    "startNode": "where_up_to",
    "nodes": [
      {
        "id": "where_up_to",
        "kind": "question",
        "title": "Where are you up to?",
        "body": "Quick one so Offsider drops you in the right spot.",
        "options": [
          {
            "label": "Just a thought — I haven't said anything yet",
            "next": "intro",
            "note": "I'll help you prepare for the chat."
          },
          {
            "label": "I've already had a quick word",
            "next": "quick_log_existing",
            "note": "Let’s jot it down before it’s forgotten."
          },
          {
            "label": "It's been going on a while",
            "next": "intro",
            "note": "Let's look at the history and do it properly."
          }
        ]
      },
      {
        "id": "quick_log_existing",
        "kind": "log",
        "title": "Jot down the chat you had",
        "body": "Note what you said, when, and what you agreed. A quick dated note now saves a lot of grief later.",
        "documentId": "file_note",
        "next": "quick_followup"
      },
      {
        "id": "quick_followup",
        "kind": "action",
        "title": "Book a follow-up",
        "body": "Put a date in the diary to check whether it's improved. Offsider will nudge you when it's due.",
        "next": "quick_next"
      },
      {
        "id": "quick_next",
        "kind": "question",
        "title": "What now?",
        "body": "Totally up to you.",
        "options": [
          {
            "label": "Walk me through the full steps",
            "next": "intro"
          },
          {
            "label": "That's it for now",
            "next": "quick_parked"
          }
        ]
      },
      {
        "id": "quick_parked",
        "kind": "outcome",
        "title": "Logged — nice work",
        "body": "It's on the record with a follow-up booked. Come back and walk the full steps any time if it doesn't improve.",
        "next": null
      },
      {
        "id": "intro",
        "kind": "intro",
        "title": "Let's sort the absences out",
        "body": "Lateness and no-shows are frustrating, but most of the time there's a reason worth understanding first. This walks you through checking the pattern, having a fair chat, and keeping good records before anything formal."
      },
      {
        "id": "one_off_or_pattern",
        "kind": "question",
        "title": "Is this a one-off or a pattern?",
        "body": "Be honest with yourself here. One bad week is different from the same thing happening over and over.",
        "options": [
          {
            "label": "Genuinely a one-off",
            "next": "one_off_outcome",
            "note": "First slip, otherwise reliable."
          },
          {
            "label": "It's becoming a pattern",
            "next": "map_the_pattern",
            "note": "Late or absent more than a couple of times lately."
          },
          {
            "label": "Haven't actually checked",
            "next": "map_the_pattern",
            "note": "Going on a gut feeling so far."
          }
        ]
      },
      {
        "id": "one_off_outcome",
        "kind": "outcome",
        "title": "Probably just a quiet word",
        "body": "If they're usually solid, a friendly check-in is plenty. Let them know you noticed, ask if everything's alright, and leave it there. No need for anything heavy.",
        "next": "log_quiet_word"
      },
      {
        "id": "log_quiet_word",
        "kind": "log",
        "title": "Jot down the quiet word",
        "body": "Even for a one-off, write a quick dated note of what you said and how they responded. If it happens again you'll be glad you've got it.",
        "next": null
      },
      {
        "id": "map_the_pattern",
        "kind": "log",
        "title": "Map out the actual dates",
        "body": "Before anything else, write down the real dates and times of the lateness or absences. A pattern on paper is far clearer than a feeling, and it keeps you fair.",
        "next": "safety_check"
      },
      {
        "id": "safety_check",
        "kind": "question",
        "title": "Any sign something serious is going on?",
        "body": "Sometimes absence is the first sign of illness, a family crisis, mental health, or trouble at home. This changes how you approach it.",
        "options": [
          {
            "label": "Yes, something's clearly going on",
            "next": "support_options",
            "note": "Health, family or personal struggle."
          },
          {
            "label": "Not that I know of",
            "next": "asked_whats_going_on",
            "note": "No obvious reason yet."
          },
          {
            "label": "Not sure",
            "next": "asked_whats_going_on",
            "note": "Haven't asked properly."
          }
        ]
      },
      {
        "id": "asked_whats_going_on",
        "kind": "question",
        "title": "Have you actually asked them?",
        "body": "It's easy to assume someone's slacking when really their car's died or they're caring for a sick kid. A calm, private question often sorts it.",
        "options": [
          {
            "label": "Yes, we've talked about it",
            "next": "expectations_checklist",
            "note": "Had a real conversation."
          },
          {
            "label": "No, not properly yet",
            "next": "have_the_chat",
            "note": "Time to ask first."
          }
        ]
      },
      {
        "id": "have_the_chat",
        "kind": "action",
        "title": "Have the conversation first",
        "body": "Pull them aside somewhere private, no audience. Say what you've noticed, then ask what's going on and listen. Lead with care before correction.",
        "next": "log_the_chat"
      },
      {
        "id": "log_the_chat",
        "kind": "log",
        "title": "Record the chat",
        "body": "Write down the date, what you raised, what they said, and anything you both agreed. This informal record protects everyone if things continue.",
        "documentId": "informal_chat_record",
        "why": "A short dated note now means you're not relying on memory later. It's quick and it keeps the process fair.",
        "next": "support_options"
      },
      {
        "id": "support_options",
        "kind": "question",
        "title": "Is there support that would help?",
        "body": "If there's a real reason behind it, a small adjustment often fixes the problem faster than any warning. Think shift swaps, a temporary start time, leave, or an EAP if you have one.",
        "options": [
          {
            "label": "Yes, we can offer something",
            "next": "agree_support_plan",
            "note": "Some support is realistic."
          },
          {
            "label": "Off sick and needs a return plan",
            "next": "return_to_work",
            "note": "Coming back after absence."
          },
          {
            "label": "No clear reason, just unreliable",
            "next": "expectations_checklist",
            "note": "No genuine cause behind it."
          }
        ]
      },
      {
        "id": "agree_support_plan",
        "kind": "action",
        "title": "Agree the support and a date to review",
        "body": "Decide together what changes and for how long, then book a date to see how it's tracking. Support with a check-in beats support that's forgotten in a week.",
        "next": "return_to_work"
      },
      {
        "id": "return_to_work",
        "kind": "gap_check",
        "title": "Plan the return to work",
        "body": "When someone's been off, a short return-to-work chat clears the air and sets things up properly. It's a supportive conversation, not a telling-off.",
        "documentId": "absence_return_to_work",
        "why": "A simple return-to-work record shows you handled the absence with care and got everyone back on the same page.",
        "next": "expectations_checklist"
      },
      {
        "id": "expectations_checklist",
        "kind": "checklist",
        "title": "Have you set clear expectations?",
        "body": "Before any formal step, tick off what you've genuinely done. If something's missing, that's the bit to fix first, not skip.",
        "items": [
          {
            "id": "set_start_times",
            "label": "Told them the expected start time and call-in process",
            "help": "What time, and how to let you know if they'll be late or off."
          },
          {
            "id": "put_in_writing",
            "label": "Put those expectations in writing",
            "help": "A short letter or message they can't dispute later.",
            "suggestsDocument": "expectations_letter"
          },
          {
            "id": "early_feedback",
            "label": "Given honest feedback early, not just bottled it up",
            "help": "Raised it when it started, not months later."
          },
          {
            "id": "regular_checkins",
            "label": "Had regular check-ins over recent months",
            "help": "Touched base more than once, not a single ambush.",
            "suggestsDocument": "check_in_record"
          },
          {
            "id": "dates_recorded",
            "label": "Recorded the dates and conversations as they happened",
            "help": "A dated trail, not memory.",
            "suggestsDocument": "file_note"
          }
        ],
        "next": "expectations_gap"
      },
      {
        "id": "expectations_gap",
        "kind": "question",
        "title": "Were expectations actually set in writing?",
        "body": "This is the honest fork. You can't fairly warn someone for missing a standard they were never clearly given.",
        "options": [
          {
            "label": "Yes, clearly and in writing",
            "next": "did_it_continue",
            "note": "They knew what was expected."
          },
          {
            "label": "No, never really written down",
            "next": "write_expectations",
            "note": "Set it properly first."
          }
        ]
      },
      {
        "id": "write_expectations",
        "kind": "document",
        "title": "Put the expectations in writing first",
        "body": "Set out the expected hours, the call-in process, and what good attendance looks like. Give them a fair, reasonable chance to meet it before any warning.",
        "documentId": "expectations_letter",
        "why": "Getting this in writing now is the single biggest thing that keeps your process fair and protects the business down the track.",
        "next": "book_next_checkin"
      },
      {
        "id": "book_next_checkin",
        "kind": "action",
        "title": "Book the next check-in",
        "body": "Set a clear date a couple of weeks out to review attendance together. A booked check-in turns a vague worry into a fair, visible process.",
        "next": "did_it_continue"
      },
      {
        "id": "did_it_continue",
        "kind": "question",
        "title": "Has it kept happening since?",
        "body": "Once expectations are clear and support's been offered, give it real time. Then look honestly at whether the absence or lateness has actually continued.",
        "options": [
          {
            "label": "It's improved, settling down",
            "next": "improved_outcome",
            "note": "Back on track."
          },
          {
            "label": "Still happening despite the chat",
            "next": "escalate",
            "note": "No real change."
          }
        ]
      },
      {
        "id": "improved_outcome",
        "kind": "outcome",
        "title": "Good — keep it ticking over",
        "body": "Nicely handled. Acknowledge the turnaround with them so they know you noticed the effort, and keep your notes in case it ever flares up again.",
        "next": "log_improvement"
      },
      {
        "id": "log_improvement",
        "kind": "log",
        "title": "Record the improvement",
        "body": "Write a short dated note that things have improved and you recognised it. A fair record cuts both ways and it's worth keeping.",
        "documentId": "check_in_record",
        "why": "Recording the good as well as the bad shows your process is fair and balanced, which matters if anything resurfaces later.",
        "next": null
      },
      {
        "id": "escalate",
        "kind": "escalation",
        "title": "Time to go up the ladder",
        "body": "If it's continued despite a fair chance and support, loop in the owner or director, and get advice from an external HR or employment-law adviser before any formal warning. This is guidance, not legal advice, so get it checked before you act.",
        "escalateTo": "Owner or director, then an external HR or employment-law adviser",
        "documentId": "escalation_summary",
        "why": "A short summary of the dates, conversations and support offered gives your adviser exactly what they need and shows you've been fair throughout.",
        "next": "formal_outcome"
      },
      {
        "id": "formal_outcome",
        "kind": "outcome",
        "title": "Where this can land",
        "body": "With advice, this might move to a formal first written warning, or stay informal a bit longer if there's a genuine reason still being worked through. Either way you've documented a fair, supportive process, which protects you, the business and the worker.",
        "next": null
      }
    ]
  },
  {
    "id": "conflict",
    "category": "conflict",
    "name": "Conflict between staff",
    "blurb": "Two workers are clashing, someone's raised a grievance, or there's a bullying or harassment complaint.",
    "sentiment": "watchful",
    "icon": "⚖️",
    "startNode": "where_up_to",
    "nodes": [
      {
        "id": "where_up_to",
        "kind": "question",
        "title": "Where are you up to?",
        "body": "Quick one so Offsider drops you in the right spot.",
        "options": [
          {
            "label": "Just a thought — I haven't said anything yet",
            "next": "intro",
            "note": "I'll help you prepare for the chat."
          },
          {
            "label": "I've already had a quick word",
            "next": "quick_log_existing",
            "note": "Let’s jot it down before it’s forgotten."
          },
          {
            "label": "It's been going on a while",
            "next": "intro",
            "note": "Let's look at the history and do it properly."
          }
        ]
      },
      {
        "id": "quick_log_existing",
        "kind": "log",
        "title": "Jot down the chat you had",
        "body": "Note what you said, when, and what you agreed. A quick dated note now saves a lot of grief later.",
        "documentId": "file_note",
        "next": "quick_followup"
      },
      {
        "id": "quick_followup",
        "kind": "action",
        "title": "Book a follow-up",
        "body": "Put a date in the diary to check whether it's improved. Offsider will nudge you when it's due.",
        "next": "quick_next"
      },
      {
        "id": "quick_next",
        "kind": "question",
        "title": "What now?",
        "body": "Totally up to you.",
        "options": [
          {
            "label": "Walk me through the full steps",
            "next": "intro"
          },
          {
            "label": "That's it for now",
            "next": "quick_parked"
          }
        ]
      },
      {
        "id": "quick_parked",
        "kind": "outcome",
        "title": "Logged — nice work",
        "body": "It's on the record with a follow-up booked. Come back and walk the full steps any time if it doesn't improve.",
        "next": null
      },
      {
        "id": "intro",
        "kind": "intro",
        "title": "Let's sort this out fairly",
        "body": "Two of your people clashing is normal, and how you handle it matters. We'll help you stay neutral, hear both sides properly, and pick the right path. Take it seriously, keep notes, and you'll be on solid ground."
      },
      {
        "id": "q_safety",
        "kind": "question",
        "title": "Is anyone unsafe right now?",
        "body": "First things first. Is this about violence, threats, someone's safety, or a serious bullying or harassment complaint?",
        "options": [
          {
            "label": "Yes, it's serious",
            "next": "esc_serious",
            "note": "Safety or a formal complaint changes things."
          },
          {
            "label": "No, it's a clash or disagreement",
            "next": "q_pattern",
            "note": "Good, we can work through this calmly."
          }
        ]
      },
      {
        "id": "esc_serious",
        "kind": "escalation",
        "title": "This one goes up now",
        "body": "Violence, threats, or a bullying or harassment complaint are too big to carry alone. Loop in the owner or director today, then get an external HR or employment-law adviser before you act.",
        "escalateTo": "Owner or director, then an external HR or employment-law adviser",
        "documentId": "escalation_summary",
        "next": "log_serious"
      },
      {
        "id": "log_serious",
        "kind": "log",
        "title": "Write down what's happened",
        "body": "Before memory fades, record the facts: who, what was said or done, when, where, and who else saw it. Stick to what you know, not what you reckon.",
        "next": "out_formal"
      },
      {
        "id": "q_pattern",
        "kind": "question",
        "title": "One-off or a pattern?",
        "body": "Is this a one-off blow-up, or has it been building over weeks or months?",
        "options": [
          {
            "label": "One-off heated moment",
            "next": "log_what_happened",
            "note": "Often sorted with a calm chat."
          },
          {
            "label": "It keeps happening",
            "next": "log_what_happened",
            "note": "A pattern needs a firmer hand."
          }
        ]
      },
      {
        "id": "log_what_happened",
        "kind": "log",
        "title": "Get the facts down first",
        "body": "Jot down what you've actually seen or been told, with dates. Keep it factual and fair to both people. This protects everyone, including you.",
        "next": "check_neutral"
      },
      {
        "id": "check_neutral",
        "kind": "checklist",
        "title": "Are you staying neutral?",
        "body": "Tick off what you've genuinely done so far. Anything you've missed is your next move.",
        "items": [
          {
            "id": "no_sides",
            "label": "I haven't taken sides or made my mind up"
          },
          {
            "id": "heard_one",
            "label": "I've heard the first person's side",
            "suggestsDocument": "file_note"
          },
          {
            "id": "heard_two",
            "label": "I've heard the other person's side",
            "suggestsDocument": "file_note"
          },
          {
            "id": "kept_private",
            "label": "I've kept it private and not let it spread"
          },
          {
            "id": "expectations_clear",
            "label": "Both know the standard of behaviour I expect",
            "suggestsDocument": "expectations_letter"
          }
        ],
        "next": "q_heard_both"
      },
      {
        "id": "q_heard_both",
        "kind": "question",
        "title": "Have you heard both sides?",
        "body": "You can't be fair until you've sat down with each person separately and really listened.",
        "options": [
          {
            "label": "Not yet",
            "next": "action_hear_both",
            "note": "Do this before anything else."
          },
          {
            "label": "Yes, both heard",
            "next": "q_expectations_set",
            "note": "Good, you've got the full picture."
          }
        ]
      },
      {
        "id": "action_hear_both",
        "kind": "action",
        "title": "Sit down with each, separately",
        "body": "Meet each person on their own. Ask what happened, listen without judging, and let them know you're taking it seriously and staying fair. Then record each chat.",
        "next": "gap_chat_record"
      },
      {
        "id": "gap_chat_record",
        "kind": "gap_check",
        "title": "Capture those chats",
        "body": "A short dated note of each conversation means no one can later say it never happened. It keeps you fair and consistent.",
        "documentId": "informal_chat_record",
        "why": "A simple dated record of each side's story protects everyone and keeps the process fair.",
        "next": "q_expectations_set"
      },
      {
        "id": "q_expectations_set",
        "kind": "question",
        "title": "Do they know the standard expected?",
        "body": "Has it ever been made clear, ideally in writing, how people are expected to treat each other here?",
        "options": [
          {
            "label": "No, never spelled out",
            "next": "gap_expectations",
            "note": "Set this before any warning."
          },
          {
            "label": "Yes, they know",
            "next": "q_path"
          }
        ]
      },
      {
        "id": "gap_expectations",
        "kind": "gap_check",
        "title": "Set the expectation first",
        "body": "You can't fairly pull someone up on a standard they were never told. Put the behaviour you expect in writing so it's clear for everyone going forward.",
        "documentId": "expectations_letter",
        "why": "Setting the standard in writing first makes any later step fair, and most of the time it's all that's needed.",
        "next": "q_path"
      },
      {
        "id": "q_path",
        "kind": "question",
        "title": "Informal or formal?",
        "body": "Most clashes sort themselves with a guided chat. A formal grievance is for serious complaints or when informal hasn't worked.",
        "options": [
          {
            "label": "Try sorting it informally",
            "next": "action_mediate",
            "note": "Best first step for most clashes."
          },
          {
            "label": "It needs a formal grievance",
            "next": "gap_grievance",
            "note": "For serious or repeated issues."
          }
        ]
      },
      {
        "id": "action_mediate",
        "kind": "action",
        "title": "Bring them together, calmly",
        "body": "Get both in a room with you steering. Set ground rules, let each speak, and agree on what changes from here. Stay the neutral chair, not the judge.",
        "next": "gap_mediation_summary"
      },
      {
        "id": "gap_mediation_summary",
        "kind": "gap_check",
        "title": "Write up what you agreed",
        "body": "Note what was discussed and what both agreed to do differently. It gives everyone something to point back to.",
        "documentId": "conflict_mediation_summary",
        "why": "A short agreed summary keeps both people accountable and shows you handled it fairly.",
        "next": "action_checkin"
      },
      {
        "id": "gap_grievance",
        "kind": "gap_check",
        "title": "Acknowledge the grievance",
        "body": "When someone raises a formal complaint, let them know in writing that you've received it and are taking it seriously. They can bring a support person to any formal meeting.",
        "documentId": "grievance_acknowledgement",
        "why": "Acknowledging a grievance properly shows the worker they've been heard and starts a fair, documented process.",
        "next": "esc_formal_advice"
      },
      {
        "id": "esc_formal_advice",
        "kind": "escalation",
        "title": "Get backup before you go formal",
        "body": "A formal grievance has steps that are easy to trip on. Talk to the owner or director, then get an external HR or employment-law adviser before you run any meeting or decision.",
        "escalateTo": "Owner or director, then an external HR or employment-law adviser",
        "documentId": "escalation_summary",
        "next": "out_formal"
      },
      {
        "id": "action_checkin",
        "kind": "action",
        "title": "Book the next check-in now",
        "body": "Put a date in the diary, a week or two out, to see if things have settled. Don't leave it to chance, follow up while it's fresh.",
        "next": "log_checkin"
      },
      {
        "id": "log_checkin",
        "kind": "log",
        "title": "Record how the check-in goes",
        "body": "At the check-in, note whether things have improved, what's still rough, and what you agreed next. Date it.",
        "documentId": "check_in_record",
        "next": "q_resolved"
      },
      {
        "id": "q_resolved",
        "kind": "question",
        "title": "Has it settled down?",
        "body": "Be honest about where things are now after the chat and check-in.",
        "options": [
          {
            "label": "Yes, it's sorted",
            "next": "out_resolved",
            "note": "Nice work."
          },
          {
            "label": "Better, but not there yet",
            "next": "action_checkin",
            "note": "Keep the support going."
          },
          {
            "label": "No, it's not working",
            "next": "esc_unresolved",
            "note": "Time to take it up a rung."
          }
        ]
      },
      {
        "id": "esc_unresolved",
        "kind": "escalation",
        "title": "Take it up a rung",
        "body": "If a fair informal go hasn't worked, don't push on alone. Bring in the owner or director, then an external HR or employment-law adviser before any formal or serious step.",
        "escalateTo": "Owner or director, then an external HR or employment-law adviser",
        "documentId": "escalation_summary",
        "next": "out_formal"
      },
      {
        "id": "out_resolved",
        "kind": "outcome",
        "title": "Sorted, and on the record",
        "body": "You stayed neutral, heard both sides, and helped them work it out. Keep your notes filed in case it ever flares up again. Well handled."
      },
      {
        "id": "out_formal",
        "kind": "outcome",
        "title": "In good hands now",
        "body": "You've taken it seriously, kept fair records, and brought in the right people. That's exactly the right call. Let your adviser guide the next steps from here."
      }
    ]
  },
  {
    "id": "recognition",
    "category": "recognition",
    "name": "Recognise Good Work",
    "blurb": "One of your crew is doing great work and you want to make sure they feel seen and stick around.",
    "sentiment": "positive",
    "startNode": "intro",
    "nodes": [
      {
        "id": "intro",
        "kind": "intro",
        "title": "Someone's doing great work",
        "body": "Good on you for noticing. This walks you through saying it well, writing it down, and deciding if it deserves more than a thank you. Looking after your good people is the cheapest staff retention there is."
      },
      {
        "id": "q_one_off_or_pattern",
        "kind": "question",
        "title": "Is this a one-off or a pattern?",
        "body": "Be honest with yourself here. A great day is worth a thank you. A run of great weeks or months is worth a proper conversation.",
        "options": [
          {
            "label": "A one-off great effort",
            "next": "action_say_it",
            "note": "A standout job, a big save, a great attitude on a tough day."
          },
          {
            "label": "A steady pattern over months",
            "next": "q_what_stands_out",
            "note": "They keep going above and beyond, week after week."
          }
        ]
      },
      {
        "id": "action_say_it",
        "kind": "action",
        "title": "Say it now, while it's fresh",
        "body": "Tell them today, in plain words, what they did and why it mattered. Specific beats generic every time. Then jot it down so it isn't forgotten.",
        "next": "log_the_moment"
      },
      {
        "id": "log_the_moment",
        "kind": "log",
        "title": "Write down what happened",
        "body": "Record the date, what they did, and the difference it made. Small wins add up, and you'll be glad you have them at pay review time.",
        "next": "gap_file_note"
      },
      {
        "id": "gap_file_note",
        "kind": "gap_check",
        "title": "Pop it on file",
        "body": "A quick dated file note keeps the good stuff on record, not just the problems. It builds a fair, full picture of the person.",
        "documentId": "file_note",
        "why": "Most files only fill up when something goes wrong. A note about good work balances that out and helps you back this person later.",
        "next": "outcome_one_off"
      },
      {
        "id": "outcome_one_off",
        "kind": "outcome",
        "title": "Nicely done",
        "body": "You noticed it, you said it, and you wrote it down. That's the whole job for a one-off. Keep an eye out, because a few of these usually means a pattern worth rewarding.",
        "next": null
      },
      {
        "id": "q_what_stands_out",
        "kind": "question",
        "title": "What's actually standing out?",
        "body": "Naming it clearly helps you reward the right thing. Pick the closest fit.",
        "options": [
          {
            "label": "Quality and reliability of their work",
            "next": "checklist_recognition_done"
          },
          {
            "label": "Taking on more than their role",
            "next": "checklist_recognition_done",
            "note": "Stepping up, training others, running jobs."
          },
          {
            "label": "Attitude that lifts the whole crew",
            "next": "checklist_recognition_done"
          }
        ]
      },
      {
        "id": "checklist_recognition_done",
        "kind": "checklist",
        "title": "What have you actually done so far?",
        "body": "Tick what's true today. Don't worry about the gaps, that's what we're here to sort.",
        "items": [
          {
            "id": "told_them",
            "label": "Told them directly that their work is valued"
          },
          {
            "id": "told_specifics",
            "label": "Named the specific things they do well"
          },
          {
            "id": "wrote_it_down",
            "label": "Written it down somewhere dated",
            "suggestsDocument": "file_note"
          },
          {
            "id": "put_in_writing_to_them",
            "label": "Put recognition in writing to them",
            "suggestsDocument": "recognition_letter"
          }
        ],
        "next": "gap_recognition_letter"
      },
      {
        "id": "gap_recognition_letter",
        "kind": "gap_check",
        "title": "Make it official with a few words",
        "body": "A short recognition letter or note means a lot more than a passing comment. It's something they can keep, and it shows you don't take them for granted.",
        "documentId": "recognition_letter",
        "why": "People remember being thanked in writing far longer than a quick word on site. It costs you nothing and lands hard, in a good way.",
        "next": "q_what_next"
      },
      {
        "id": "q_what_next",
        "kind": "question",
        "title": "Does this deserve more than thanks?",
        "body": "Good recognition is the start. The real question is whether this person should be growing, earning more, or both. What feels right?",
        "options": [
          {
            "label": "More responsibility or a step up",
            "next": "q_ready_for_more"
          },
          {
            "label": "A pay review feels overdue",
            "next": "log_pay_case"
          },
          {
            "label": "A one-off bonus or reward",
            "next": "action_bonus"
          },
          {
            "label": "Recognition is enough for now",
            "next": "action_book_checkin"
          }
        ]
      },
      {
        "id": "q_ready_for_more",
        "kind": "question",
        "title": "Are they ready, and do they want it?",
        "body": "More responsibility should feel like an opportunity, not a dumping ground. Have you actually asked them what they want?",
        "options": [
          {
            "label": "Yes, and they're keen",
            "next": "gap_promotion_proposal"
          },
          {
            "label": "I think so, but haven't asked",
            "next": "action_ask_them"
          },
          {
            "label": "It's more a change of role than a step up",
            "next": "gap_role_change"
          }
        ]
      },
      {
        "id": "action_ask_them",
        "kind": "action",
        "title": "Have the conversation first",
        "body": "Sit down and ask what they enjoy and where they want to head. You'll make a far better call once you know what they actually want.",
        "next": "gap_promotion_proposal"
      },
      {
        "id": "gap_promotion_proposal",
        "kind": "gap_check",
        "title": "Put the step-up on paper",
        "body": "A simple proposal sets out the new role, what it pays, and what changes. It keeps everyone clear and makes the conversation with the owner easy.",
        "documentId": "promotion_proposal",
        "why": "A written proposal turns a vague 'maybe one day' into a real plan, and shows the worker you're serious about backing them.",
        "next": "escalation_owner"
      },
      {
        "id": "gap_role_change",
        "kind": "gap_check",
        "title": "Agree the new role clearly",
        "body": "If the job is changing shape, write down the new duties, hours and pay so there are no surprises later. Get it agreed, not assumed.",
        "documentId": "role_change_agreement",
        "why": "Changes to someone's role and pay should always be in writing and agreed by both of you. It protects the worker and the business.",
        "next": "escalation_owner"
      },
      {
        "id": "log_pay_case",
        "kind": "log",
        "title": "Build the case before you talk money",
        "body": "Write down the dates and examples of their good work, and check what the role should pay under the relevant award. Facts make the pay conversation easy.",
        "next": "escalation_owner"
      },
      {
        "id": "action_bonus",
        "kind": "action",
        "title": "Make the reward land well",
        "body": "Decide what the reward is, tell them what it's for, and put a quick note on file. A reward without the 'why' is just money, but a reward with a reason builds loyalty.",
        "next": "action_book_checkin"
      },
      {
        "id": "escalation_owner",
        "kind": "escalation",
        "title": "Take it to the owner or director",
        "body": "Pay rises, promotions and role changes need a sign-off and a budget check. Bring your written proposal or notes so the decision is quick and fair. If you're unsure about award rates or entitlements, a quick word with an HR or employment-law adviser is money well spent.",
        "escalateTo": "Owner or director, then an external HR or employment-law adviser if you're unsure on pay or award rates",
        "documentId": "escalation_summary",
        "next": "action_book_checkin"
      },
      {
        "id": "action_book_checkin",
        "kind": "action",
        "title": "Lock in the next check-in",
        "body": "Put a date in the diary to follow up, even if it's just a chat. Good people drift when they feel forgotten, so keep the conversation going.",
        "next": "outcome_kept_them"
      },
      {
        "id": "outcome_kept_them",
        "kind": "outcome",
        "title": "This is how you keep good people",
        "body": "You've noticed great work, said it well, recorded it, and made a real plan. That's exactly what makes someone want to stay. Keep doing this and your good ones won't go looking elsewhere.",
        "next": null
      }
    ],
    "icon": "🏆"
  },
  {
    "id": "development",
    "category": "development",
    "name": "Growth & promotion",
    "blurb": "You reckon someone on the team is ready for more, a step up, or a pay bump.",
    "sentiment": "positive",
    "icon": "🌱",
    "startNode": "intro",
    "documents": [
      "recognition_letter",
      "check_in_record",
      "role_change_agreement",
      "promotion_proposal",
      "expectations_letter",
      "file_note",
      "escalation_summary"
    ],
    "nodes": [
      {
        "id": "intro",
        "kind": "intro",
        "title": "Backing someone to step up",
        "body": "Good on you for thinking about this. We'll work out if they're ready, gather a few real examples, and shape a fair proposal you can take to the owner. No jargon, just sensible steps."
      },
      {
        "id": "what_are_you_after",
        "kind": "question",
        "title": "What are you weighing up?",
        "body": "Let's start with what you've got in mind. Pick the closest one.",
        "options": [
          {
            "label": "A promotion or bigger role",
            "value": "promotion",
            "next": "readiness_check"
          },
          {
            "label": "A pay review or raise",
            "value": "pay",
            "next": "pay_reason"
          },
          {
            "label": "More responsibility, same title",
            "value": "responsibility",
            "next": "readiness_check"
          }
        ]
      },
      {
        "id": "pay_reason",
        "kind": "question",
        "title": "Why a pay review now?",
        "body": "Be honest with yourself about what's driving it. That shapes how strong your case is.",
        "options": [
          {
            "label": "They've grown and earned it",
            "value": "earned",
            "next": "readiness_check"
          },
          {
            "label": "They've asked, or might walk",
            "value": "retention",
            "next": "readiness_check",
            "note": "Fair reason, but build the case on their work, not just the threat."
          },
          {
            "label": "Award or minimum rates changed",
            "value": "award",
            "next": "award_nudge"
          }
        ]
      },
      {
        "id": "award_nudge",
        "kind": "action",
        "title": "Check the award rate first",
        "body": "If this is about meeting minimum pay, check the worker's award rate on the Fair Work website or call them. Getting the base rate right comes before any extra.",
        "next": "readiness_check"
      },
      {
        "id": "readiness_check",
        "kind": "checklist",
        "title": "Are they actually ready?",
        "body": "Tick what's genuinely true today. No ticking boxes to be nice. This is the honest test.",
        "items": [
          {
            "id": "does_current_job_well",
            "label": "They do their current job well, consistently"
          },
          {
            "id": "shows_the_behaviours",
            "label": "They already show the behaviours the bigger role needs"
          },
          {
            "id": "reliable_and_trusted",
            "label": "Reliable, safe, and trusted by the crew"
          },
          {
            "id": "expectations_set",
            "label": "I've made clear what 'good' looks like in writing",
            "suggestsDocument": "expectations_letter"
          },
          {
            "id": "they_want_it",
            "label": "They actually want the step up (not just me wanting it for them)"
          }
        ],
        "next": "readiness_fork"
      },
      {
        "id": "readiness_fork",
        "kind": "question",
        "title": "How did that feel?",
        "body": "Looking at what you ticked, where do you honestly land?",
        "options": [
          {
            "label": "Ticked most, they're ready",
            "value": "ready",
            "next": "gather_examples"
          },
          {
            "label": "Close, but a few gaps",
            "value": "nearly",
            "next": "development_plan"
          },
          {
            "label": "Not yet, more growing to do",
            "value": "not_yet",
            "next": "development_plan"
          }
        ]
      },
      {
        "id": "gather_examples",
        "kind": "log",
        "title": "Jot down the real moments",
        "body": "Write down 3 or 4 actual examples with rough dates: a job they ran, a problem they solved, a time they stepped up. Specifics make your case, not vibes.",
        "next": "check_recent_feedback"
      },
      {
        "id": "check_recent_feedback",
        "kind": "question",
        "title": "Have you been checking in?",
        "body": "Think back over the last few months. Have you had regular catch-ups about how they're tracking?",
        "options": [
          {
            "label": "Yes, we talk regularly",
            "value": "yes",
            "next": "log_check_in"
          },
          {
            "label": "Not really, it's been ad hoc",
            "value": "no",
            "next": "book_check_in"
          }
        ]
      },
      {
        "id": "book_check_in",
        "kind": "action",
        "title": "Book a proper sit-down",
        "body": "Before promising anything, have a real conversation. Tell them you've noticed their growth, ask what they want, and listen. Put a date in the diary this week.",
        "next": "log_check_in"
      },
      {
        "id": "log_check_in",
        "kind": "document",
        "title": "Record the chat",
        "body": "Capture what you discussed and agreed in a check-in record, dated. It keeps everyone honest and shows you've talked this through fairly.",
        "documentId": "check_in_record",
        "why": "A dated record means the owner sees this is considered, not a snap decision, and the worker knows where they stand.",
        "next": "say_thanks"
      },
      {
        "id": "development_plan",
        "kind": "document",
        "title": "Set out a growth plan",
        "body": "They're worth investing in. Write a simple plan: what to build, how you'll support them, and when you'll review. Give it a fair, real timeframe.",
        "documentId": "role_change_agreement",
        "why": "A clear plan turns 'not yet' into a fair path forward, so they know exactly what readiness looks like.",
        "next": "book_growth_review"
      },
      {
        "id": "book_growth_review",
        "kind": "action",
        "title": "Set the next review date",
        "body": "Pop a review date in the diary, say 8 to 12 weeks out, to see how they're tracking against the plan. Tell them now so it feels like support, not a test.",
        "next": "growth_outcome"
      },
      {
        "id": "say_thanks",
        "kind": "document",
        "title": "Put the recognition in writing",
        "body": "Whatever the owner decides, telling someone in writing that you value their work is never wasted. A short recognition letter lands well.",
        "documentId": "recognition_letter",
        "why": "People remember being told they're appreciated. It costs nothing and builds the loyalty that keeps good workers around.",
        "next": "build_proposal"
      },
      {
        "id": "build_proposal",
        "kind": "document",
        "title": "Shape the proposal",
        "body": "Pull it together: the new role or pay, why they're ready, your examples, and the cost. Keep it one page so the owner can say yes easily.",
        "documentId": "promotion_proposal",
        "why": "A tidy, evidence-backed proposal makes the owner's decision simple and shows you've done the thinking.",
        "next": "take_to_owner"
      },
      {
        "id": "take_to_owner",
        "kind": "escalation",
        "title": "Take it to the owner",
        "body": "This is the owner's call, especially the money. Walk them through your proposal and the examples. If it's a big pay jump or a tricky award question, a quick word with an HR or employment-law adviser is worth it.",
        "escalateTo": "Owner or director, then an external HR or employment-law adviser if needed",
        "documentId": "escalation_summary",
        "next": "confirm_in_writing"
      },
      {
        "id": "confirm_in_writing",
        "kind": "document",
        "title": "Make the change official",
        "body": "If it's a yes, put the new role, pay and start date in writing and both sign it. Clear terms now save confusion later.",
        "documentId": "role_change_agreement",
        "why": "A signed agreement protects everyone. The worker knows exactly what they're getting, and you've got a clean record.",
        "next": "growth_outcome"
      },
      {
        "id": "growth_outcome",
        "kind": "outcome",
        "title": "Where this can land",
        "body": "Best case, you've recognised a good worker and locked in their loyalty. If it's 'not yet', you've given them a fair, honest path to get there. Either way, you've done right by them and the business."
      }
    ]
  },
  {
    "id": "wellbeing",
    "category": "wellbeing",
    "name": "Keeping people happy",
    "blurb": "One of your good people seems flat, stretched or checked out, and you want to sort it before they walk.",
    "sentiment": "positive",
    "startNode": "intro",
    "nodes": [
      {
        "id": "intro",
        "kind": "intro",
        "title": "Let's keep a good one onboard",
        "body": "Noticing someone is flat or stretched early is a good instinct, not an overreaction. This walks you through a quiet check-in, a couple of practical fixes, and how to lock in the next catch-up so it doesn't slip.",
        "next": "what_changed"
      },
      {
        "id": "what_changed",
        "kind": "question",
        "title": "What's caught your eye?",
        "body": "Pick the one that fits best. There's no wrong answer here, you're just deciding where to start.",
        "options": [
          {
            "label": "They seem worn out or stretched thin",
            "next": "one_off_or_pattern",
            "note": "Long hours, short fuse, running on empty."
          },
          {
            "label": "They've gone quiet or checked out",
            "next": "one_off_or_pattern",
            "note": "Less chat, less effort, keeping to themselves."
          },
          {
            "label": "They've hinted they might leave",
            "next": "stay_chat",
            "note": "A grumble about pay, hours or 'mates getting more elsewhere'."
          },
          {
            "label": "They're doing great and I want to keep it that way",
            "next": "recognise_path",
            "note": "Going well, you want to back them in."
          }
        ]
      },
      {
        "id": "one_off_or_pattern",
        "kind": "question",
        "title": "A rough patch or a real pattern?",
        "body": "Everyone has off weeks. The thing to sort out is whether this is a one-off or something that's been building for a while.",
        "options": [
          {
            "label": "Just the last week or two",
            "next": "quiet_chat",
            "note": "Recent, maybe a one-off."
          },
          {
            "label": "It's been creeping in for a couple of months",
            "next": "quiet_chat",
            "note": "A pattern worth getting ahead of."
          }
        ]
      },
      {
        "id": "quiet_chat",
        "kind": "action",
        "title": "Have a quiet, no-pressure chat",
        "body": "Grab five minutes one-on-one, somewhere private, no audience. Open simply: 'I've noticed you've seemed a bit flat lately, how are you actually travelling?' Then listen more than you talk.",
        "next": "log_checkin"
      },
      {
        "id": "log_checkin",
        "kind": "log",
        "title": "Jot down how the chat went",
        "body": "Right after, note the date, the gist of what they said, and anything you agreed to. Not to build a case, just so you remember to follow through and can see if things improve.",
        "documentId": "check_in_record",
        "why": "A quick dated note means the next catch-up picks up where this one left off, and shows the worker you actually listened.",
        "next": "whats_driving"
      },
      {
        "id": "whats_driving",
        "kind": "question",
        "title": "What's behind it?",
        "body": "From what they told you, what's the main thing weighing on them? This decides which fix to reach for.",
        "options": [
          {
            "label": "Workload, hours or the roster",
            "next": "adjust_work",
            "note": "Too much on, awkward shifts, no breather."
          },
          {
            "label": "The work's gone stale or they want a stretch",
            "next": "growth_path",
            "note": "Bored, ready for more, feeling stuck."
          },
          {
            "label": "Something personal going on at home",
            "next": "support_personal",
            "note": "Health, family, money stress outside work."
          },
          {
            "label": "Friction with a workmate",
            "next": "workmate_friction",
            "note": "Tension on the crew that's wearing them down."
          }
        ]
      },
      {
        "id": "adjust_work",
        "kind": "action",
        "title": "Adjust the load, roster or duties",
        "body": "Pick one real change you can make this week: even out the roster, hand off a draining task, or give a proper day off after a big push. Agree it together so it sticks.",
        "next": "role_change_doc"
      },
      {
        "id": "role_change_doc",
        "kind": "gap_check",
        "title": "Putting a duties change in writing?",
        "body": "If you're shifting their regular duties, hours or role in a lasting way, a short written agreement keeps you both clear on what changed and from when.",
        "documentId": "role_change_agreement",
        "why": "A simple written agreement avoids 'I never agreed to that' down the track, and shows you're treating the change as a genuine commitment.",
        "next": "book_next"
      },
      {
        "id": "growth_path",
        "kind": "question",
        "title": "Ready for more?",
        "body": "Sometimes the fix for a flat worker is a fresh challenge. How far are they ready to go?",
        "options": [
          {
            "label": "New skills or a bit more responsibility",
            "next": "role_change_doc",
            "note": "A stretch, not a promotion yet."
          },
          {
            "label": "They're ready to step up properly",
            "next": "promotion_doc",
            "note": "Earned a real step up."
          }
        ]
      },
      {
        "id": "promotion_doc",
        "kind": "document",
        "title": "Back them with a step up",
        "body": "If they've earned it, putting a proposal on paper makes it real and shows the rest of the crew that effort gets noticed.",
        "documentId": "promotion_proposal",
        "why": "A written proposal turns a vague 'maybe one day' into a genuine plan, which is exactly what keeps your best people from looking elsewhere.",
        "next": "book_next"
      },
      {
        "id": "support_personal",
        "kind": "action",
        "title": "Be human about it first",
        "body": "You don't need to fix their personal life. Ask what would actually help short-term, maybe a tweak to start times or a few days' flexibility, and point them to any support like an EAP if you have one.",
        "next": "log_support"
      },
      {
        "id": "log_support",
        "kind": "log",
        "title": "Record what you agreed",
        "body": "Note the date and the practical things you both agreed to, like adjusted hours or a check-in next week. Keep the personal details light, just enough to honour it.",
        "documentId": "check_in_record",
        "why": "A short dated note keeps your promise on the radar and shows you followed through when they needed it.",
        "next": "book_next"
      },
      {
        "id": "workmate_friction",
        "kind": "action",
        "title": "Clear the air on the crew",
        "body": "If two workmates are grinding on each other, get ahead of it. Hear both sides separately first, then bring them together calmly to agree how they'll work alongside each other.",
        "documentId": "conflict_mediation_summary",
        "why": "A short summary of what was agreed gives everyone a clean line to work from and stops the same tension flaring up again next week.",
        "next": "book_next"
      },
      {
        "id": "stay_chat",
        "kind": "action",
        "title": "Have the stay chat early",
        "body": "Don't wait for a resignation to ask what they want. Sit down and ask straight: 'What would make you want to stay and build something here?' Then be honest about what you can and can't do.",
        "next": "log_stay"
      },
      {
        "id": "log_stay",
        "kind": "log",
        "title": "Capture what matters to them",
        "body": "Note the date and the two or three things that came up: pay, hours, growth, recognition. This is your shortlist for keeping them, so don't let it disappear.",
        "documentId": "check_in_record",
        "why": "Writing down what they actually care about means you can act on it, instead of guessing once they've already handed in their notice.",
        "next": "whats_driving"
      },
      {
        "id": "recognise_path",
        "kind": "action",
        "title": "Tell them they're doing well",
        "body": "Recognition costs nothing and keeps good people loyal. Be specific: name the job they nailed and why it mattered. Say it to their face first.",
        "documentId": "recognition_letter",
        "why": "A short written thank-you they can keep makes the recognition land harder, and reminds them they're valued right where they are.",
        "next": "book_next"
      },
      {
        "id": "book_next",
        "kind": "action",
        "title": "Lock in the next catch-up",
        "body": "Before you move on, put a date in the diary, two to four weeks out, to check the change is working. A catch-up you've actually booked is the one that happens.",
        "documentId": "check_in_record",
        "why": "Booking the next check-in is the single thing that turns a good chat into a real result, because it keeps you both accountable.",
        "next": "still_struggling"
      },
      {
        "id": "still_struggling",
        "kind": "question",
        "title": "At the next catch-up, how are they?",
        "body": "When you sit back down, be honest with yourself about which way it's gone.",
        "options": [
          {
            "label": "Brighter, back on track",
            "next": "outcome_resolved",
            "note": "The change worked."
          },
          {
            "label": "A bit better, still keeping an eye on it",
            "next": "outcome_improving",
            "note": "Heading the right way."
          },
          {
            "label": "No better, or worse",
            "next": "escalate",
            "note": "Time for a hand."
          }
        ]
      },
      {
        "id": "escalate",
        "kind": "escalation",
        "title": "Bring in a hand",
        "body": "If they're still struggling despite real support, loop in the owner or director and, if it's tied to performance or their health, an external HR or employment-law adviser. Don't carry this one solo.",
        "escalateTo": "Owner or director, then an external HR or employment-law adviser",
        "documentId": "escalation_summary",
        "why": "A short summary of what you've tried and the dates gives whoever steps in a running start, and shows you gave them a fair, genuine go.",
        "next": "outcome_escalated"
      },
      {
        "id": "outcome_resolved",
        "kind": "outcome",
        "title": "Sorted, and well handled",
        "body": "You spotted it early, listened, and made a real change. That's exactly how good people decide to stay. Keep the casual check-ins going so you catch the next one just as early.",
        "next": null
      },
      {
        "id": "outcome_improving",
        "kind": "outcome",
        "title": "On the mend",
        "body": "Heading the right way is a win. Keep the booked check-ins running and your dated notes handy. If it stalls, you've already got the history to act on quickly.",
        "next": null
      },
      {
        "id": "outcome_escalated",
        "kind": "outcome",
        "title": "Handed up, with a clear record",
        "body": "You did the right things in the right order and brought in help when support wasn't enough. With your dated notes, whoever takes it from here can pick it up fairly and properly. This is guidance, not legal advice, so lean on that adviser before any formal step.",
        "next": null
      }
    ],
    "icon": "🌿"
  },
  {
    "id": "onboarding",
    "category": "onboarding",
    "name": "New starter onboarding",
    "blurb": "A new worker is joining and you want to set them up right from day one.",
    "sentiment": "positive",
    "icon": "👋",
    "startNode": "intro",
    "documents": [
      "onboarding_plan",
      "check_in_record",
      "development_plan",
      "expectations_letter",
      "file_note"
    ],
    "nodes": [
      {
        "id": "intro",
        "kind": "intro",
        "title": "Setting up your new starter",
        "body": "Good on you for thinking ahead. A new worker remembers their first few weeks for a long time, so a bit of planning now pays off. This walks you through gear, inductions, a buddy, a first-week and first-month plan, and early check-ins.",
        "next": "starter_kind"
      },
      {
        "id": "starter_kind",
        "kind": "question",
        "title": "What kind of starter is this?",
        "body": "This is the big one. Who they are sets the PACE of their training and where their career can head. A school leaver and a seasoned welder need very different runways, so pick the closest match.",
        "options": [
          {
            "label": "Fresh from school",
            "next": "pace_fresh",
            "note": "First real job, building habits from scratch."
          },
          {
            "label": "New to the industry",
            "next": "pace_fresh",
            "note": "Worked before, but not in geotech/enviro testing."
          },
          {
            "label": "Experienced from a related trade (e.g. welder, plant operator)",
            "next": "pace_related",
            "note": "Strong hands and site sense, new to our methods."
          },
          {
            "label": "Career changer in their 30s+",
            "next": "pace_related",
            "note": "Mature head, learning the technical side fresh."
          },
          {
            "label": "Returning to work after a break",
            "next": "pace_returner",
            "note": "Has skills but may need to rebuild confidence and currency."
          },
          {
            "label": "Late in their career",
            "next": "pace_returner",
            "note": "Deep experience; may value mentoring others over a long climb."
          }
        ]
      },
      {
        "id": "pace_fresh",
        "kind": "intro",
        "title": "Pace: steady and supported",
        "body": "Go slower and explain the why behind everything, not just the how. Build one competency at a time and check it has stuck before moving on. Their career path here is long, so frame early wins as the first rungs of a real progression.",
        "next": "gear_inductions"
      },
      {
        "id": "pace_related",
        "kind": "intro",
        "title": "Pace: brisk, with respect for what they know",
        "body": "They already get sites, safety and graft, so don't drown them in basics. Focus on what's different in our testing methods and standards, and let them move quicker. A career changer often becomes a steady, reliable hand fast.",
        "next": "gear_inductions"
      },
      {
        "id": "pace_returner",
        "kind": "intro",
        "title": "Pace: confidence first, then currency",
        "body": "The skills are likely still there; the job is rebuilding currency and confidence after time away or pointing deep experience at mentoring. Go at their pace, refresh what's changed, and lean on what they already know.",
        "next": "gear_inductions"
      },
      {
        "id": "gear_inductions",
        "kind": "checklist",
        "title": "Gear, inductions and access",
        "body": "Sort the basics before day one so they're not standing around. Nothing kills a first day like no boots and no logins.",
        "items": [
          {
            "id": "ppe",
            "label": "PPE issued: boots, hi-vis, hard hat, glasses, gloves"
          },
          {
            "id": "white_card",
            "label": "White Card sighted (or booked in if they don't have one)"
          },
          {
            "id": "site_safety",
            "label": "Site safety induction booked for their first day"
          },
          {
            "id": "system_access",
            "label": "System access set up: email, LIMS/sample system, timesheets"
          },
          {
            "id": "expectations",
            "label": "Day-one expectations written down and ready to hand over",
            "suggestsDocument": "expectations_letter"
          }
        ],
        "next": "buddy"
      },
      {
        "id": "buddy",
        "kind": "question",
        "title": "Who's their buddy or mentor?",
        "body": "Every new starter needs one go-to person who isn't you. A buddy answers the silly questions and shows them where the kettle is. Have you got someone lined up?",
        "options": [
          {
            "label": "Yes, I've got someone",
            "next": "buddy_confirm"
          },
          {
            "label": "Not yet",
            "next": "buddy_pick"
          }
        ]
      },
      {
        "id": "buddy_pick",
        "kind": "action",
        "title": "Pick a buddy before day one",
        "body": "Choose a steady team member who knows the ropes and has the patience to teach. Ask them today and give them a heads-up about the new starter's background and pace. Match the buddy to the starter where you can.",
        "next": "buddy_confirm"
      },
      {
        "id": "buddy_confirm",
        "kind": "log",
        "title": "Note who the buddy is and when they start",
        "body": "Write down the buddy's name, the starter's name and their first day. A quick dated note means everyone's clear on who's looking after whom.",
        "suggestsDocument": "file_note",
        "next": "first_week"
      },
      {
        "id": "first_week",
        "kind": "checklist",
        "title": "First-week plan",
        "body": "Week one is about belonging and safety, not output. Keep it light and let them watch and learn before they're flying solo.",
        "items": [
          {
            "id": "intros",
            "label": "Introduced to the team and shown around the lab/yard"
          },
          {
            "id": "shadow",
            "label": "Shadowing their buddy on real jobs"
          },
          {
            "id": "safety_walk",
            "label": "Walked through site hazards and emergency procedures"
          },
          {
            "id": "first_check",
            "label": "Quick end-of-week catch-up booked in"
          }
        ],
        "next": "first_month"
      },
      {
        "id": "first_month",
        "kind": "checklist",
        "title": "First-month plan",
        "body": "Month one is where they start doing, not just watching. Pace this to the kind of starter you picked earlier, faster for the experienced, gentler for the fresh.",
        "items": [
          {
            "id": "supervised_work",
            "label": "Doing real tasks under supervision"
          },
          {
            "id": "feedback",
            "label": "Regular feedback so they know how they're tracking"
          },
          {
            "id": "goals",
            "label": "First few learning goals agreed and written down",
            "suggestsDocument": "development_plan"
          }
        ],
        "next": "first_tickets"
      },
      {
        "id": "first_tickets",
        "kind": "checklist",
        "title": "First tickets and competencies",
        "body": "Pick a couple of clear, achievable competencies to start on, the building blocks they'll use every day. Tick them off as they're signed off so progress is visible to both of you.",
        "items": [
          {
            "id": "sample_handling",
            "label": "Sample handling and labelling"
          },
          {
            "id": "basic_test",
            "label": "One core test method (e.g. moisture content or compaction)"
          },
          {
            "id": "paperwork",
            "label": "Recording results and chain-of-custody paperwork"
          },
          {
            "id": "next_competency",
            "label": "Next competency identified once these are solid"
          }
        ],
        "next": "onboarding_doc"
      },
      {
        "id": "onboarding_doc",
        "kind": "document",
        "title": "Generate the onboarding plan",
        "body": "Pull it all together into one simple onboarding plan: their pace, their buddy, the first-week and first-month steps, and the competencies to start on. Give them a copy so they know what good looks like.",
        "documentId": "onboarding_plan",
        "why": "A written plan means the new starter isn't guessing, the buddy knows their part, and you can see at a glance whether onboarding is on track. It also shows you took their start seriously.",
        "next": "book_checkins"
      },
      {
        "id": "book_checkins",
        "kind": "action",
        "title": "Book early check-ins now",
        "body": "Put a few short check-ins straight in the calendar: end of week one, end of week four, and around the three-month mark. Booking them now means they actually happen instead of slipping.",
        "next": "checkin_record"
      },
      {
        "id": "checkin_record",
        "kind": "document",
        "title": "Record each check-in as you go",
        "body": "After each catch-up, jot down how they're settling, what they've picked up, and anything they need from you. Keep it short and honest.",
        "documentId": "check_in_record",
        "why": "Dated check-in records show the new starter is supported, catch small wobbles early, and give you a fair record if you ever need to talk about progress or extend their training.",
        "next": "outcome"
      },
      {
        "id": "outcome",
        "kind": "outcome",
        "title": "You're set up for a good start",
        "body": "Gear sorted, a buddy in their corner, a clear plan paced to who they are, and check-ins locked in. Keep showing up to those catch-ins and you'll have a confident, capable team member before long. Nicely done.",
        "next": null
      }
    ]
  },
  {
    "id": "operational_error",
    "category": "quality",
    "name": "Operational error / root cause",
    "blurb": "Something went wrong on a job and you want to fix the cause, not just blame the person.",
    "sentiment": "watchful",
    "icon": "🔧",
    "startNode": "intro",
    "nodes": [
      {
        "id": "intro",
        "kind": "intro",
        "title": "Something went wrong on a job",
        "body": "A mistake slipped through, like a wrong test result going out or a sample getting mislabelled. The goal here isn't to find someone to blame. It's to walk back through what happened and find what really caused it, so it doesn't happen again.",
        "next": "first_contain"
      },
      {
        "id": "first_contain",
        "kind": "action",
        "title": "First, contain the immediate problem",
        "body": "Before we dig into causes, make sure the damage is limited. Re-issue the correct result, flag the affected sample, or let the client know if you need to. Sort the safety and quality risk before anything else.",
        "next": "log_what_happened"
      },
      {
        "id": "log_what_happened",
        "kind": "log",
        "title": "Write down what actually happened",
        "body": "Note the date, the job, and what went wrong in plain terms, like 'wrong moisture result sent to client on the Smithfield job, 24 June'. Just the facts, no opinion about who's at fault yet.",
        "next": "why_one"
      },
      {
        "id": "why_one",
        "kind": "question",
        "title": "Why did the error happen? (1 of 3)",
        "body": "Start with the surface reason. What was the immediate thing that went wrong at the moment the mistake was made?",
        "options": [
          {
            "label": "A step got skipped or done wrong",
            "next": "log_why_one",
            "note": "e.g. a check wasn't done, a number got transposed"
          },
          {
            "label": "The person didn't know the right way",
            "next": "log_why_one",
            "note": "training or knowledge gap"
          },
          {
            "label": "They were rushed or stretched",
            "next": "log_why_one",
            "note": "workload or time pressure"
          },
          {
            "label": "A tool, form or system let it through",
            "next": "log_why_one",
            "note": "no check, confusing label, dodgy template"
          }
        ]
      },
      {
        "id": "log_why_one",
        "kind": "log",
        "title": "Record the first 'why'",
        "body": "Write down that immediate reason in a sentence. We'll keep asking why behind it. Resist the urge to stop at 'they made a mistake', that's a symptom, not a cause.",
        "next": "why_two"
      },
      {
        "id": "why_two",
        "kind": "question",
        "title": "Why did THAT happen? (2 of 3)",
        "body": "Now go one layer deeper. If a step got skipped, why was it easy to skip? If they didn't know, why weren't they shown? Keep asking why behind your first answer.",
        "options": [
          {
            "label": "There's no clear, written way to do it",
            "next": "log_why_two",
            "note": "process or checklist gap"
          },
          {
            "label": "They were never properly trained or signed off",
            "next": "log_why_two",
            "note": "training gap"
          },
          {
            "label": "Too much on, not enough time or people",
            "next": "log_why_two",
            "note": "workload gap"
          },
          {
            "label": "The setup makes mistakes easy to miss",
            "next": "log_why_two",
            "note": "system or design gap"
          }
        ]
      },
      {
        "id": "log_why_two",
        "kind": "log",
        "title": "Record the second 'why'",
        "body": "Note this deeper reason. You're starting to see whether this is about the system, the process, training or workload, rather than the person.",
        "next": "why_three"
      },
      {
        "id": "why_three",
        "kind": "question",
        "title": "Why did THAT happen? (3 of 3)",
        "body": "One more why. If there's no written way, why not? If they weren't trained, why did they end up doing the job anyway? This is usually where the real root cause sits.",
        "options": [
          {
            "label": "We never set up a proper process for this",
            "next": "name_root_cause",
            "note": "system gap"
          },
          {
            "label": "Onboarding or training never covered it",
            "next": "name_root_cause",
            "note": "training gap"
          },
          {
            "label": "We're short-staffed or it's a constant rush",
            "next": "name_root_cause",
            "note": "workload gap"
          },
          {
            "label": "Honestly, it was a genuine one-off slip",
            "next": "honest_one_off",
            "note": "even careful people slip sometimes"
          }
        ]
      },
      {
        "id": "honest_one_off",
        "kind": "gap_check",
        "title": "Is it really a one-off?",
        "body": "Sometimes a careful person just slips, and that's human. But check first: has anything like this happened before, even to someone else? If yes, it's probably a system gap wearing a one-off costume.",
        "documentId": "file_note",
        "why": "A short file note keeps a fair, factual record without treating a genuine one-off as a performance problem. If it recurs, you'll have the pattern.",
        "next": "name_root_cause"
      },
      {
        "id": "name_root_cause",
        "kind": "log",
        "title": "Name the root cause out loud",
        "body": "Write one sentence: 'The real cause was a [system / process / training / workload] gap, specifically...'. Naming it honestly is what makes the fix actually work.",
        "next": "agree_fix"
      },
      {
        "id": "agree_fix",
        "kind": "checklist",
        "title": "Agree a fix that stops it happening again",
        "body": "Fix the system, not just the symptom. Tick what you'll put in place so the next person can't fall into the same trap.",
        "items": [
          {
            "id": "fix_process",
            "label": "Add or fix a clear step / checklist for this task"
          },
          {
            "id": "fix_training",
            "label": "Book the training or sign-off that was missing",
            "suggestsDocument": "development_plan"
          },
          {
            "id": "fix_workload",
            "label": "Adjust the workload, timing or who does what"
          },
          {
            "id": "fix_system",
            "label": "Change the form, label or tool so the error can't slip through"
          },
          {
            "id": "fix_double_check",
            "label": "Add a second check at the point things went wrong"
          }
        ],
        "next": "assign_owner"
      },
      {
        "id": "assign_owner",
        "kind": "log",
        "title": "Assign who owns the fix and by when",
        "body": "A fix with no owner and no date doesn't happen. Write down who's responsible for putting it in place and the date it'll be done by. That's usually you or a team lead, not the person who made the error.",
        "next": "talk_to_person"
      },
      {
        "id": "talk_to_person",
        "kind": "action",
        "title": "Have a calm chat with the person involved",
        "body": "Keep it supportive. Thank them for being upfront, explain what you found about the cause, and tell them what's changing so it's easier next time. This is a fix-it conversation, not a telling-off.",
        "next": "record_incident"
      },
      {
        "id": "record_incident",
        "kind": "document",
        "title": "Record the incident and the fix",
        "body": "Capture what happened, the root cause you found, the agreed fix, who owns it and the due date. This is your record that you handled it fairly and systemically.",
        "documentId": "incident_record",
        "why": "An incident record proves you treated this as a process problem, not a blame exercise, and gives you a dated trail of the fix and its owner if the issue is ever revisited.",
        "next": "follow_up_check"
      },
      {
        "id": "follow_up_check",
        "kind": "action",
        "title": "Set a date to check the fix worked",
        "body": "Pop a reminder a few weeks out to see if the change actually stuck and nothing similar has happened. If the fix isn't holding, you've not yet found the real root cause.",
        "next": "outcome"
      },
      {
        "id": "outcome",
        "kind": "outcome",
        "title": "Sorted, and less likely to repeat",
        "body": "You've fixed the system that allowed the error, given it an owner and a date, and kept a fair record. That's how good labs get steadily more reliable, without the blame.",
        "next": null
      }
    ]
  },
  {
    "id": "improvement",
    "category": "improvement",
    "name": "Improve how we work",
    "blurb": "You reckon something at work should run better, and you want to actually do something about it.",
    "sentiment": "positive",
    "icon": "💡",
    "startNode": "intro",
    "nodes": [
      {
        "id": "intro",
        "kind": "intro",
        "title": "Good on you for not letting it slide",
        "body": "Most good improvements start as a niggle someone couldn't be bothered chasing. We'll turn your gut feeling into a small, clear experiment. No big project, no committee — just the next sensible step.",
        "next": "name_it"
      },
      {
        "id": "name_it",
        "kind": "question",
        "title": "What's the niggle?",
        "body": "First, let's name it in plain words. Which best matches what you reckon should run better?",
        "options": [
          {
            "label": "A task or process is clunky or slow",
            "next": "describe_problem",
            "note": "e.g. sample logging, reporting, handovers"
          },
          {
            "label": "Things keep getting dropped or missed",
            "next": "describe_problem",
            "note": "e.g. jobs falling through the cracks"
          },
          {
            "label": "People aren't sure who does what",
            "next": "describe_problem",
            "note": "roles, ownership, communication"
          },
          {
            "label": "A tool, kit or setup gets in the way",
            "next": "describe_problem",
            "note": "software, equipment, the ute, the bench"
          }
        ]
      },
      {
        "id": "describe_problem",
        "kind": "log",
        "title": "Write it down the way you'd say it",
        "body": "In a sentence or two, jot what's happening now and why it bugs you. Date it. Getting it out of your head and onto paper is half the battle.",
        "next": "what_good_looks_like"
      },
      {
        "id": "what_good_looks_like",
        "kind": "log",
        "title": "Picture 'good'",
        "body": "Now describe what it'd look like if this ran well. Keep it concrete — 'samples logged same day' beats 'better workflow'. This becomes your target.",
        "next": "check_quick_win"
      },
      {
        "id": "check_quick_win",
        "kind": "question",
        "title": "Is this yours to try, or bigger than you?",
        "body": "Be honest about scope before you sink time in.",
        "options": [
          {
            "label": "I can run a small trial myself",
            "next": "smallest_step"
          },
          {
            "label": "It needs a couple of others on board",
            "next": "who_to_involve"
          },
          {
            "label": "It's really a budget or owner call",
            "next": "raise_with_owner"
          }
        ]
      },
      {
        "id": "who_to_involve",
        "kind": "checklist",
        "title": "Get the right heads in the room",
        "body": "Quick tick-list before you change anything. Bringing people along beats springing it on them.",
        "items": [
          {
            "id": "ask_doers",
            "label": "Asked the people who do the task what they reckon"
          },
          {
            "id": "spot_blockers",
            "label": "Noted anything that might block it (cost, time, safety)"
          },
          {
            "id": "agree_worth",
            "label": "Agreed it's worth a small trial"
          }
        ],
        "next": "smallest_step"
      },
      {
        "id": "smallest_step",
        "kind": "action",
        "title": "Pick the smallest first step",
        "body": "What's the tiniest change you could try this week or fortnight? Not the perfect fix — just one thing to test. Small means low risk and easy to undo if it flops.",
        "next": "owner_and_when"
      },
      {
        "id": "owner_and_when",
        "kind": "log",
        "title": "Who owns it, and by when?",
        "body": "Name one owner (often you) and a date to check back. A thing with no owner and no date is a wish, not a plan. Write both down.",
        "next": "how_youll_know"
      },
      {
        "id": "how_youll_know",
        "kind": "log",
        "title": "How will you know it worked?",
        "body": "Pick one simple sign of success you'll actually notice — fewer reruns, faster turnaround, less chasing. Jot today's starting point so you can compare later.",
        "next": "tell_the_team"
      },
      {
        "id": "tell_the_team",
        "kind": "checklist",
        "title": "Give the team a heads-up",
        "body": "Let people know what you're trialling and why, so it doesn't feel like a curveball. A short note keeps it fair and on the record.",
        "items": [
          {
            "id": "explain_trial",
            "label": "Told the team what's changing and for how long"
          },
          {
            "id": "record_chat",
            "label": "Logged the conversation so everyone's clear",
            "suggestsDocument": "informal_chat_record"
          }
        ],
        "next": "run_the_trial"
      },
      {
        "id": "run_the_trial",
        "kind": "action",
        "title": "Run the trial",
        "body": "Give it a fair go for the agreed window. Don't tinker every day — let it run so you get a clean read on whether it helps.",
        "next": "review_results"
      },
      {
        "id": "review_results",
        "kind": "question",
        "title": "Check back: did it help?",
        "body": "On your check-back date, compare against the sign of success you picked. What happened?",
        "options": [
          {
            "label": "Yep, it's better — let's keep it",
            "next": "make_it_stick"
          },
          {
            "label": "Bit better, needs a tweak",
            "next": "tweak_and_retry"
          },
          {
            "label": "Nah, didn't move the dial",
            "next": "park_or_pivot"
          }
        ]
      },
      {
        "id": "tweak_and_retry",
        "kind": "action",
        "title": "Adjust one thing and run again",
        "body": "Change a single part — not everything at once — and give it another short run. Tweaking one lever at a time tells you what actually made the difference.",
        "next": "review_results"
      },
      {
        "id": "make_it_stick",
        "kind": "checklist",
        "title": "Make the good change the normal way",
        "body": "A win that isn't written down quietly drifts back to the old way. Lock it in.",
        "items": [
          {
            "id": "write_new_way",
            "label": "Wrote the new way down where people will find it"
          },
          {
            "id": "update_onboarding",
            "label": "Added it to how we bring new people up to speed",
            "suggestsDocument": "onboarding_plan"
          },
          {
            "id": "thank_people",
            "label": "Thanked whoever helped make it happen",
            "suggestsDocument": "recognition_letter"
          }
        ],
        "next": "good_outcome"
      },
      {
        "id": "park_or_pivot",
        "kind": "log",
        "title": "No shame in a flat trial",
        "body": "Note what you tried and why it didn't land — that's worth knowing. Decide whether to park it for now or test a different angle. Either way, you learned something cheap.",
        "next": "good_outcome"
      },
      {
        "id": "raise_with_owner",
        "kind": "escalation",
        "title": "Take it up the line",
        "body": "If it needs budget or an owner's say-so, that's not a dead end — it's the right door. Bring your plain problem, your 'good' picture and your suggested first step so it's an easy yes.",
        "escalateTo": "Business owner or manager",
        "documentId": "escalation_summary",
        "next": "good_outcome"
      },
      {
        "id": "good_outcome",
        "kind": "outcome",
        "title": "You turned a niggle into action",
        "body": "Whether it stuck, needs another go, or went up the line, you've done the hard part — named it and moved on it. Keep a light eye on it, and back yourself to chase the next one.",
        "next": null
      }
    ]
  },
  {
    "id": "offboarding",
    "category": "offboarding",
    "name": "Someone's leaving",
    "blurb": "A worker has resigned or is heading off, and you want to handle it well.",
    "sentiment": "watchful",
    "icon": "🚪",
    "startNode": "intro",
    "documents": [
      "exit_summary",
      "file_note"
    ],
    "nodes": [
      {
        "id": "intro",
        "kind": "intro",
        "title": "Someone's heading off",
        "body": "When a worker leaves, a bit of care now pays off later. You'll learn why they're going, keep the work from falling over, and part on good terms so they'd speak well of Qualtest down the track.",
        "next": "confirm_leaving"
      },
      {
        "id": "confirm_leaving",
        "kind": "question",
        "title": "What's the situation?",
        "body": "Let's get clear on how this leaving came about. That shapes what you do next.",
        "options": [
          {
            "label": "They've resigned (their choice)",
            "value": "resigned",
            "next": "log_resignation"
          },
          {
            "label": "Their contract or fixed term is ending",
            "value": "contract_end",
            "next": "log_resignation"
          },
          {
            "label": "We've let them go or it's a redundancy",
            "value": "involuntary",
            "next": "involuntary_escalation",
            "note": "Ending someone's job is a different beast with its own legal steps."
          }
        ]
      },
      {
        "id": "involuntary_escalation",
        "kind": "escalation",
        "title": "Get a hand before you act",
        "body": "Dismissals and redundancies have strict legal rules, and getting them wrong is costly. Before you do anything, talk to your HR adviser or check Fair Work so it's done right.",
        "escalateTo": "Your HR adviser or the Fair Work Ombudsman (fairwork.gov.au)",
        "next": "outcome"
      },
      {
        "id": "log_resignation",
        "kind": "log",
        "title": "Note the leaving date",
        "body": "Jot down the date they told you, their notice period, and their last working day. This anchors everything else, including final pay.",
        "next": "understand_why"
      },
      {
        "id": "understand_why",
        "kind": "question",
        "title": "Do you know why they're leaving?",
        "body": "Knowing the real reason helps you spot patterns and hang on to the next person. Have you had an honest chat about it?",
        "options": [
          {
            "label": "Yes, we've talked it through",
            "value": "known",
            "next": "decide_exit_interview"
          },
          {
            "label": "Not really, or only the surface reason",
            "value": "unknown",
            "next": "decide_exit_interview"
          }
        ]
      },
      {
        "id": "decide_exit_interview",
        "kind": "question",
        "title": "Worth doing an exit interview?",
        "body": "A short, relaxed chat near their last day often surfaces things people won't say earlier. It's usually worth 20 minutes for what you learn.",
        "options": [
          {
            "label": "Yes, let's do one",
            "value": "yes",
            "next": "exit_interview_action"
          },
          {
            "label": "I'd rather send a quick survey",
            "value": "survey",
            "next": "exit_survey_action"
          },
          {
            "label": "Not this time",
            "value": "no",
            "next": "knowledge_handover"
          }
        ]
      },
      {
        "id": "exit_interview_action",
        "kind": "action",
        "title": "Set up the exit chat",
        "body": "Pick a quiet spot in their last week and make it clear it's about learning, not blame. Good questions: What made you start looking? What did we do well? What would you change? Would you recommend Qualtest to a mate? Is there anything that would have kept you?",
        "next": "exit_survey_action"
      },
      {
        "id": "exit_survey_action",
        "kind": "action",
        "title": "Offer an exit survey too",
        "body": "Some people open up more in writing. You can send a short exit survey alongside or instead of the chat, so they can answer in their own time.",
        "next": "capture_feedback"
      },
      {
        "id": "capture_feedback",
        "kind": "checklist",
        "title": "Capture what you heard",
        "body": "Honest feedback is only useful if you write it down and act on it. Tick these off as you go.",
        "items": [
          {
            "id": "fb_reasons",
            "label": "Note the real reasons they're leaving",
            "help": "Pay, workload, a manager, growth, a better offer, life stuff."
          },
          {
            "id": "fb_patterns",
            "label": "Flag anything you've heard from others before",
            "help": "Repeat themes are the ones worth fixing."
          },
          {
            "id": "fb_wins",
            "label": "Note what they reckon we do well",
            "help": "Worth protecting, not just the gripes."
          },
          {
            "id": "fb_filenote",
            "label": "Save the feedback as a dated note",
            "help": "Keep it factual and respectful.",
            "suggestsDocument": "file_note"
          }
        ],
        "next": "knowledge_handover"
      },
      {
        "id": "knowledge_handover",
        "kind": "checklist",
        "title": "Sort the handover",
        "body": "This is the bit that stops the work falling over after they go. Get it moving while they're still around to ask.",
        "items": [
          {
            "id": "ho_tasks",
            "label": "List their key jobs, clients and deadlines",
            "help": "What only they know? Sampling routes, client quirks, lab methods."
          },
          {
            "id": "ho_files",
            "label": "Get files, records and logins documented",
            "help": "Where things live, what's half-finished, passwords to shared systems."
          },
          {
            "id": "ho_cover",
            "label": "Decide who covers what in the gap",
            "help": "Even a temporary split beats nothing."
          },
          {
            "id": "ho_intro",
            "label": "Have them introduce key clients to whoever takes over",
            "help": "A warm handover keeps clients comfortable."
          }
        ],
        "next": "leaving_steps"
      },
      {
        "id": "leaving_steps",
        "kind": "checklist",
        "title": "The practical leaving steps",
        "body": "The housekeeping that's easy to forget in the rush. Run through each one.",
        "items": [
          {
            "id": "ls_pay",
            "label": "Check final pay with your bookkeeper",
            "help": "Last pay, any owed annual leave, and super are all done right."
          },
          {
            "id": "ls_gear",
            "label": "Get company gear and PPE back",
            "help": "Laptop, phone, keys, swipe card, ute, hi-vis, boots, field kit."
          },
          {
            "id": "ls_access",
            "label": "Revoke system and site access",
            "help": "Email, cloud logins, the lab and site access on their last day."
          },
          {
            "id": "ls_ref",
            "label": "Agree what reference you'll give",
            "help": "Settle this now so there are no awkward surprises later."
          }
        ],
        "next": "part_well"
      },
      {
        "id": "part_well",
        "kind": "action",
        "title": "Part on good terms",
        "body": "How someone leaves is how they'll talk about Qualtest. Thank them properly, mark the send-off in some small way, and keep the door open. Today's leaver can be tomorrow's referral or rehire.",
        "next": "generate_summary"
      },
      {
        "id": "generate_summary",
        "kind": "document",
        "title": "Write up the exit summary",
        "documentId": "exit_summary",
        "why": "Pulls the leaving date, the feedback, the handover and the practical steps into one tidy record. It closes things off cleanly and means you'll spot patterns if more people leave.",
        "next": "outcome"
      },
      {
        "id": "outcome",
        "kind": "outcome",
        "title": "Handled well",
        "body": "You've understood why they left, kept the work standing, ticked off the practical bits, and parted on good terms. Keep the exit summary on file and act on anything the feedback flagged.",
        "next": null
      }
    ]
  }
];
