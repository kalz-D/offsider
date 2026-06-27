// Auto-generated employee feedback + check-in question sets.
module.exports = [
  {
    "id": "upward_feedback",
    "name": "How am I going as your manager?",
    "audience": "upward",
    "purpose": "Give your worker a safe way to tell the boss honestly how they're being led and what would help.",
    "intro": "Your honest take helps me lead the crew better. There are no wrong answers here, and this is anonymous unless you choose to add your name.",
    "anonymous_default": true,
    "questions": [
      {
        "id": "clear_expectations",
        "label": "Do you know what's expected of you day to day?",
        "type": "scale",
        "help": "1 = never sure, 5 = always crystal clear"
      },
      {
        "id": "feel_supported",
        "label": "When things go wrong, do you feel backed up?",
        "type": "scale",
        "help": "1 = on my own, 5 = always got my back"
      },
      {
        "id": "listened_to",
        "label": "Do you feel heard when you raise something?",
        "type": "scale"
      },
      {
        "id": "do_more_of",
        "label": "What's one thing I should keep doing?",
        "type": "text"
      },
      {
        "id": "do_differently",
        "label": "What's one thing I could do better as your boss?",
        "type": "text",
        "help": "Be straight with me. I won't take it personally."
      },
      {
        "id": "anything_else",
        "label": "Anything else on your mind?",
        "type": "text"
      }
    ]
  },
  {
    "id": "wellbeing_pulse",
    "name": "How are you going?",
    "audience": "pulse",
    "purpose": "A quick check on workload, morale and what would make things easier right now.",
    "intro": "Just a quick one to see how you're travelling. Takes a minute, and it helps me sort things before they become a headache.",
    "anonymous_default": false,
    "questions": [
      {
        "id": "overall_week",
        "label": "How's your week been?",
        "type": "scale",
        "help": "1 = rough, 5 = ripper"
      },
      {
        "id": "workload",
        "label": "How's your workload right now?",
        "type": "choice",
        "options": [
          "Too quiet",
          "About right",
          "Bit much",
          "Flat out, drowning"
        ]
      },
      {
        "id": "energy",
        "label": "How are your energy levels?",
        "type": "scale",
        "help": "1 = running on empty, 5 = full tank"
      },
      {
        "id": "going_well",
        "label": "What's going well at the moment?",
        "type": "text"
      },
      {
        "id": "would_help",
        "label": "What's one thing that would make your job easier?",
        "type": "text"
      },
      {
        "id": "need_chat",
        "label": "Want a quiet word about anything?",
        "type": "choice",
        "options": [
          "No, all good",
          "Yeah, grab me when you can"
        ]
      }
    ]
  },
  {
    "id": "onboarding_check",
    "name": "How's your first few weeks?",
    "audience": "onboarding",
    "purpose": "Check a new starter is set up, supported and clear on the job in their early weeks.",
    "intro": "Welcome aboard. You're still finding your feet, so tell me how it's going. Your answers help me give you a better start.",
    "anonymous_default": false,
    "questions": [
      {
        "id": "feel_welcome",
        "label": "Do you feel welcome on the crew?",
        "type": "scale",
        "help": "1 = not really, 5 = part of the team"
      },
      {
        "id": "have_gear",
        "label": "Have you got the gear and tools you need to do the job?",
        "type": "choice",
        "options": [
          "Yep, all sorted",
          "Mostly, a few gaps",
          "No, still waiting on stuff"
        ]
      },
      {
        "id": "clear_on_job",
        "label": "Are you clear on what your job involves?",
        "type": "scale",
        "help": "1 = pretty lost, 5 = know exactly what I'm doing"
      },
      {
        "id": "know_who_to_ask",
        "label": "Do you know who to go to when you've got a question?",
        "type": "choice",
        "options": [
          "Yes",
          "Not really sure"
        ]
      },
      {
        "id": "going_well",
        "label": "What's been good so far?",
        "type": "text"
      },
      {
        "id": "confusing",
        "label": "What's still confusing or could be explained better?",
        "type": "text",
        "help": "No question is a dumb question. Tell me what'd help."
      }
    ]
  },
  {
    "id": "stay_interview",
    "name": "What keeps you here?",
    "audience": "stay",
    "purpose": "Understand what keeps a good worker around and what would make them leave, so problems get sorted early.",
    "intro": "You're a valued part of this crew and I want to keep you. Be honest with me here so I can make this a place worth staying at.",
    "anonymous_default": false,
    "questions": [
      {
        "id": "keeps_you_here",
        "label": "What keeps you working here?",
        "type": "text"
      },
      {
        "id": "look_forward",
        "label": "Most days, do you look forward to coming to work?",
        "type": "scale",
        "help": "1 = not at all, 5 = most days yeah"
      },
      {
        "id": "would_make_leave",
        "label": "What would make you think about leaving?",
        "type": "text",
        "help": "Better I hear it now than find out when you're out the door."
      },
      {
        "id": "valued",
        "label": "Do you feel your work is valued?",
        "type": "scale",
        "help": "1 = taken for granted, 5 = properly appreciated"
      },
      {
        "id": "grow_here",
        "label": "Is there something you'd like to learn or work towards here?",
        "type": "text",
        "help": "A ticket, a new skill, more responsibility, whatever it is."
      },
      {
        "id": "one_change",
        "label": "If you could change one thing about the job, what would it be?",
        "type": "text"
      }
    ]
  },
  {
    "id": "suggestion_box",
    "name": "Got an idea or something on your mind?",
    "audience": "suggestion",
    "purpose": "An open, anonymous spot to drop ideas, concerns or anything worth raising.",
    "intro": "Spotted a better way to do something, or got something bugging you? Chuck it in here. It's anonymous, so say it straight.",
    "anonymous_default": true,
    "questions": [
      {
        "id": "topic",
        "label": "What's this about?",
        "type": "choice",
        "options": [
          "An idea or improvement",
          "A safety concern",
          "A problem on the job",
          "Tools or gear",
          "Something else"
        ]
      },
      {
        "id": "the_suggestion",
        "label": "What's on your mind?",
        "type": "text",
        "help": "Tell it how you see it. No filter needed."
      },
      {
        "id": "why_matters",
        "label": "Why does it matter, or what would it fix?",
        "type": "text"
      },
      {
        "id": "urgent",
        "label": "Does this need looking at quickly?",
        "type": "choice",
        "options": [
          "No rush",
          "Soon would be good",
          "Yeah, it's urgent"
        ]
      }
    ]
  },
  {
    "id": "weekly_checkin",
    "name": "Weekly Check-in",
    "audience": "pulse",
    "purpose": "A quick weekly read on how each staff member is travelling - their workload, how they're feeling, and anything blocking them or that they need a hand with - so issues get picked up early.",
    "intro": "G'day! Just a quick one to see how your week's going. Takes about a minute - no wrong answers, and it helps us sort things before they pile up.",
    "cadence": "weekly",
    "anonymous_default": false,
    "questions": [
      {
        "id": "workload",
        "label": "How's your workload been this week?",
        "type": "scale",
        "help": "1 = way too quiet, 3 = about right, 5 = flat out / too much on"
      },
      {
        "id": "feeling",
        "label": "How are you feeling overall this week?",
        "type": "scale",
        "help": "1 = pretty flat, 5 = going really well"
      },
      {
        "id": "blockers",
        "label": "Anything getting in your way or slowing you down?",
        "type": "text",
        "help": "Gear, samples, paperwork, waiting on someone - whatever it is."
      },
      {
        "id": "need_help",
        "label": "Anything you need a hand with right now?",
        "type": "text",
        "help": "Leave blank if all good."
      },
      {
        "id": "anything_else",
        "label": "Anything else you want to flag?",
        "type": "text"
      }
    ]
  },
  {
    "id": "monthly_suggestion",
    "name": "Monthly Suggestion Box",
    "audience": "suggestion",
    "purpose": "An open, anonymous-by-default monthly box for staff to raise ideas, gripes, or anything they reckon could be done better around the lab.",
    "intro": "Got an idea, a niggle, or something you reckon we could do better? This is your spot to say it. It's anonymous unless you choose to add your name.",
    "cadence": "monthly",
    "anonymous_default": true,
    "questions": [
      {
        "id": "suggestion",
        "label": "What's your suggestion or something you'd like to raise?",
        "type": "text",
        "help": "Big or small - safety, gear, process, the tearoom, anything goes."
      },
      {
        "id": "area",
        "label": "What's it mostly about?",
        "type": "choice",
        "options": [
          "Safety / WHS",
          "Equipment or gear",
          "Process or paperwork",
          "Workload or rosters",
          "Team / communication",
          "Facilities (lab, tearoom, etc.)",
          "Other"
        ]
      },
      {
        "id": "idea_to_fix",
        "label": "Any idea on how we could fix or improve it?",
        "type": "text",
        "help": "Optional - even a rough thought helps."
      },
      {
        "id": "leave_name",
        "label": "Want to leave your name so we can follow up with you?",
        "type": "text",
        "help": "Optional. Leave blank to stay anonymous."
      }
    ]
  },
  {
    "id": "training_interest",
    "name": "Training & Progression Check",
    "audience": "training",
    "purpose": "A quarterly read on what tests and skills each person wants to learn next, whether they want more responsibility, and what would help them move up - feeds straight into the wage ladder and training plan.",
    "intro": "Where do you want to take your skills next? This one helps us line up training and work out who's ready for the next step. Have a think and be honest - it feeds into how we plan your progression.",
    "cadence": "quarterly",
    "anonymous_default": false,
    "questions": [
      {
        "id": "skills_to_learn",
        "label": "What tests or skills would you like to learn next?",
        "type": "text",
        "help": "e.g. CBR, compaction/Proctor, nuclear densometer, concrete strength, acid sulfate soils, report writing."
      },
      {
        "id": "more_responsibility",
        "label": "Would you like more responsibility in your role?",
        "type": "choice",
        "options": [
          "Yes, I'm keen for more now",
          "Maybe, in time",
          "Happy where I'm at for now",
          "Not sure"
        ]
      },
      {
        "id": "responsibility_type",
        "label": "If you're keen, what sort? (tick the ones that fit)",
        "type": "choice",
        "options": [
          "Working more unsupervised",
          "Becoming a NATA signatory",
          "Supervising or training others",
          "Running my own jobs end to end",
          "Field work",
          "Not sure yet"
        ],
        "help": "Optional - skip if you said you're happy where you are."
      },
      {
        "id": "what_would_help",
        "label": "What would help you progress?",
        "type": "text",
        "help": "Time on the bench with someone, a formal course, more practice, sign-off chances - whatever it is."
      },
      {
        "id": "confidence",
        "label": "How confident do you feel about your next step here?",
        "type": "scale",
        "help": "1 = not sure there is one, 5 = clear on it and ready"
      }
    ]
  },
  {
    "id": "monthly_checkin",
    "name": "Monthly Check-in",
    "audience": "pulse",
    "purpose": "A slightly deeper monthly read on how the role is going overall - whether people are learning, feel valued, and what would make the job better - so managers can act on patterns over time.",
    "intro": "A slightly bigger one than the weekly - just checking in on how the job's going for you lately. A few minutes, and it genuinely shapes what we work on next.",
    "cadence": "monthly",
    "anonymous_default": false,
    "questions": [
      {
        "id": "role_going",
        "label": "Overall, how's the role going for you this month?",
        "type": "scale",
        "help": "1 = struggling, 5 = going really well"
      },
      {
        "id": "learning",
        "label": "Are you learning and growing in the job?",
        "type": "scale",
        "help": "1 = stuck / stale, 5 = picking up plenty"
      },
      {
        "id": "feel_valued",
        "label": "Do you feel valued for the work you do?",
        "type": "scale",
        "help": "1 = not really, 5 = absolutely"
      },
      {
        "id": "going_well",
        "label": "What's been going well for you?",
        "type": "text"
      },
      {
        "id": "make_it_better",
        "label": "What's one thing that would make the job better?",
        "type": "text"
      },
      {
        "id": "anything_for_manager",
        "label": "Anything you'd like your manager to know?",
        "type": "text",
        "help": "Optional - leave blank if nothing comes to mind."
      }
    ]
  },
  {
    "id": "exit_interview",
    "name": "Exit Interview",
    "audience": "exit",
    "purpose": "Hear honestly from someone who is leaving so we can learn what we do well, what we could do better, and what makes people want to stay. The aim is to improve the place for the people still here, not to change anyone's mind or put anyone on the spot.",
    "intro": "Thanks for taking a few minutes to fill this in. Whatever's brought you to leaving, we're grateful for the time you've put in here and we wish you all the best. This isn't a test and there are no wrong answers. We'd genuinely rather hear the honest version than the polite one, because that's the only way we get better for the people still here. It's anonymous unless you choose to tell us who you are, and nothing you write will change your final pay, your reference, or how we'd speak about you down the track. Feel free to skip anything you'd rather not answer. Take your time, and thanks again.",
    "anonymous_default": true,
    "cadence": "once",
    "questions": [
      {
        "id": "main_reason",
        "label": "What's the main reason you've decided to leave?",
        "type": "choice",
        "options": [
          "Better pay or conditions somewhere else",
          "More career growth or opportunity elsewhere",
          "The work itself wasn't the right fit",
          "Workload, hours or work-life balance",
          "Relationship with my manager or the team",
          "Health, family or personal reasons",
          "Relocating or a change in circumstances",
          "End of a contract or fixed-term role",
          "Retirement",
          "Prefer not to say",
          "Other (I'll explain below)"
        ],
        "help": "Pick the one that's closest. There's room to add detail in the next question, so don't stress if it's not a perfect match."
      },
      {
        "id": "reason_detail",
        "label": "If you're happy to, tell us a bit more about what's behind that decision.",
        "type": "text",
        "help": "The story behind the reason is often the most useful part for us. Only share what you're comfortable sharing."
      },
      {
        "id": "did_well",
        "label": "What did we do well? What should we make sure we keep doing?",
        "type": "text",
        "help": "Anything that worked for you, big or small. Good gear, a fair roster, a manager who had your back, decent training, the people. It all helps us know what not to lose."
      },
      {
        "id": "could_do_better",
        "label": "What could we do better? If you could change one thing about working here, what would it be?",
        "type": "text",
        "help": "Be as straight as you like. We can't fix what we don't hear about, and you won't cop any grief for being honest."
      },
      {
        "id": "could_have_stayed",
        "label": "Was there anything we could have done that would have made you stay?",
        "type": "text",
        "help": "Maybe yes, maybe the decision was always going to be no, and that's completely fine. If there was something, we'd like to know so we can think about it for the next person."
      },
      {
        "id": "management_support",
        "label": "How well supported did you feel by your manager and the people around you?",
        "type": "scale",
        "help": "1 means not supported at all, 5 means really well supported. There's a question right after this if you'd like to explain your rating."
      },
      {
        "id": "management_support_detail",
        "label": "Anything you'd add about how you found your manager or the support here?",
        "type": "text",
        "help": "What worked, what didn't, what you'd want a new starter to be able to count on. Optional, but useful."
      },
      {
        "id": "would_recommend",
        "label": "Would you recommend us to a mate as a place to work?",
        "type": "choice",
        "options": [
          "Yes, without hesitation",
          "Yes, with a few caveats",
          "Maybe, it depends on the person",
          "Probably not",
          "No"
        ],
        "help": "An honest gut answer is plenty. If you'd like to say why, the last box is open for anything else on your mind."
      },
      {
        "id": "anything_else",
        "label": "Anything else you'd like to tell us before you go?",
        "type": "text",
        "help": "The floor's yours. Anything we didn't ask about, a thank you, a heads up, or something that's been on your mind. All welcome."
      }
    ]
  }
];
