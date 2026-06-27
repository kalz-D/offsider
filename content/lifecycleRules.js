// Auto-generated lifecycle scheduling rules (+ appended manager-reflection rule).
module.exports = [
  {
    "id": "onboarding_day1_setup_welcome",
    "stage": "onboarding",
    "title": "Make day one easy for them",
    "detail": "Greet your new starter, walk them around, introduce the team and their buddy, and sort out gear, logins and PPE so nothing's a scramble.",
    "owner": "manager",
    "trigger": {
      "type": "after_start",
      "days": 1
    },
    "action": {
      "kind": "intro",
      "flowId": "onboarding"
    },
    "applies": {
      "starterProfiles": []
    }
  },
  {
    "id": "onboarding_day3_settle_in_check",
    "stage": "onboarding",
    "title": "First settle-in chat",
    "detail": "Pull them aside for 5 minutes: how are the first few days feeling, did they get everything they need, anything unclear or missing?",
    "owner": "manager",
    "trigger": {
      "type": "after_start",
      "days": 3
    },
    "action": {
      "kind": "check_in",
      "flowId": "onboarding"
    },
    "applies": {
      "starterProfiles": []
    }
  },
  {
    "id": "onboarding_day5_buddy_check_new",
    "stage": "onboarding",
    "title": "Buddy: quiet check on the new starter",
    "detail": "Ask the buddy to grab a coffee or lunch with them and check, mate-to-mate, that they're finding their feet and know who to ask for what.",
    "owner": "buddy",
    "trigger": {
      "type": "after_start",
      "days": 5
    },
    "action": {
      "kind": "check_in"
    },
    "applies": {
      "starterProfiles": [
        "school",
        "new_industry"
      ]
    }
  },
  {
    "id": "onboarding_day7_first_week_recap",
    "stage": "onboarding",
    "title": "End of week one recap",
    "detail": "Sit down 10 minutes: what went well this week, what they're still unsure on, and confirm what next week looks like for them.",
    "owner": "manager",
    "trigger": {
      "type": "after_start",
      "days": 7
    },
    "action": {
      "kind": "check_in",
      "feedbackTemplateId": "weekly_checkin"
    },
    "applies": {
      "starterProfiles": []
    }
  },
  {
    "id": "onboarding_day10_extra_checkin_new",
    "stage": "onboarding",
    "title": "Extra check-in for a green starter",
    "detail": "For someone fresh out of school or new to the industry, a quick mid-fortnight catch-up: are the basics sticking, are they comfortable asking questions?",
    "owner": "manager",
    "trigger": {
      "type": "after_start",
      "days": 10
    },
    "action": {
      "kind": "check_in"
    },
    "applies": {
      "starterProfiles": [
        "school",
        "new_industry"
      ]
    }
  },
  {
    "id": "probation_day12_quick_recap_trade",
    "stage": "probation",
    "title": "Quick recap with an experienced hand",
    "detail": "For an experienced tradie, a light touch-base: are the tools, processes and our way of doing things clear, and is there anything getting in their way?",
    "owner": "manager",
    "trigger": {
      "type": "after_start",
      "days": 12
    },
    "action": {
      "kind": "check_in"
    },
    "applies": {
      "starterProfiles": [
        "experienced_trade"
      ]
    }
  },
  {
    "id": "probation_day14_senior_manager_intro",
    "stage": "probation",
    "title": "Senior manager: introduce yourself",
    "detail": "Drop by, introduce yourself properly, thank them for joining and ask how the start has gone. It tells them they matter to the business.",
    "owner": "senior_manager",
    "trigger": {
      "type": "after_start",
      "days": 14
    },
    "action": {
      "kind": "intro"
    },
    "applies": {
      "starterProfiles": []
    }
  },
  {
    "id": "probation_day15_first_mini_review",
    "stage": "probation",
    "title": "First mini-review of their work",
    "detail": "Look over a sample of their actual work, then give them clear, specific feedback: what's good, what to tighten up, and how to get there.",
    "owner": "manager",
    "trigger": {
      "type": "after_start",
      "days": 15
    },
    "action": {
      "kind": "review",
      "flowId": "development"
    },
    "applies": {
      "starterProfiles": []
    }
  },
  {
    "id": "probation_day21_sit_down_chat",
    "stage": "probation",
    "title": "Three-week sit-down",
    "detail": "A proper chat: are they getting on with people, what still doesn't make sense, what would make the job easier? Listen more than you talk.",
    "owner": "manager",
    "trigger": {
      "type": "after_start",
      "days": 21
    },
    "action": {
      "kind": "conversation",
      "flowId": "onboarding"
    },
    "applies": {
      "starterProfiles": []
    }
  },
  {
    "id": "probation_day24_buddy_settling_check_new",
    "stage": "probation",
    "title": "Buddy: are they part of the crew yet?",
    "detail": "Ask the buddy how the new starter is fitting in socially and on the tools, and whether anything's worrying them they might not raise with you.",
    "owner": "buddy",
    "trigger": {
      "type": "after_start",
      "days": 24
    },
    "action": {
      "kind": "check_in"
    },
    "applies": {
      "starterProfiles": [
        "school",
        "new_industry"
      ]
    }
  },
  {
    "id": "probation_day28_culture_fit_check",
    "stage": "probation",
    "title": "Culture-fit check (only if you have doubts)",
    "detail": "If something's niggling on attitude, reliability or how they treat people, name it kindly and early, set the expectation, and give them a fair shot to lift.",
    "owner": "manager",
    "trigger": {
      "type": "after_start",
      "days": 28
    },
    "action": {
      "kind": "conversation",
      "flowId": "underperformance"
    },
    "applies": {
      "starterProfiles": []
    }
  },
  {
    "id": "probation_day45_midpoint_progress",
    "stage": "probation",
    "title": "Halfway progress catch-up",
    "detail": "Roughly halfway through probation: recap how they're tracking against the role, recognise the wins, and flag anything to improve before the end review.",
    "owner": "manager",
    "trigger": {
      "type": "after_start",
      "days": 45
    },
    "action": {
      "kind": "review",
      "feedbackTemplateId": "monthly_checkin"
    },
    "applies": {
      "starterProfiles": []
    }
  },
  {
    "id": "probation_day60_training_interest_check",
    "stage": "probation",
    "title": "Ask what they want to learn next",
    "detail": "Find out what tickets or skills they're keen to build. Showing you'll invest in them is one of the strongest reasons good people stay.",
    "owner": "manager",
    "trigger": {
      "type": "after_start",
      "days": 60
    },
    "action": {
      "kind": "development",
      "feedbackTemplateId": "training_interest"
    },
    "applies": {
      "starterProfiles": []
    }
  },
  {
    "id": "probation_day75_no_surprises_heads_up",
    "stage": "probation",
    "title": "No-surprises heads-up before the review",
    "detail": "A week or so out from the probation review, give them an honest preview so nothing in the formal sit-down catches them off guard.",
    "owner": "manager",
    "trigger": {
      "type": "after_start",
      "days": 75
    },
    "action": {
      "kind": "conversation"
    },
    "applies": {
      "starterProfiles": []
    }
  },
  {
    "id": "probation_day82_end_of_probation_review",
    "stage": "probation",
    "title": "End-of-probation review",
    "detail": "Sit down formally: confirm they've passed (or set out a clear plan if not), recognise their progress, and agree goals for the months ahead.",
    "owner": "manager",
    "trigger": {
      "type": "after_start",
      "days": 82
    },
    "action": {
      "kind": "review",
      "flowId": "development"
    },
    "applies": {
      "starterProfiles": []
    }
  },
  {
    "id": "ongoing_weekly_one_on_one",
    "stage": "ongoing",
    "title": "Weekly one-on-one",
    "detail": "Sit down for a short one-on-one: how's the week gone, what's getting in the way, anything you can clear for them.",
    "owner": "manager",
    "trigger": {
      "type": "recurring",
      "everyDays": 7,
      "startDay": 90,
      "untilDay": null
    },
    "action": {
      "kind": "check_in",
      "feedbackTemplateId": "weekly_checkin",
      "flowId": null
    },
    "applies": {
      "classifications": [],
      "starterProfiles": [],
      "minTenureDays": 90,
      "maxTenureDays": null
    }
  },
  {
    "id": "ongoing_monthly_deep_checkin",
    "stage": "ongoing",
    "title": "Monthly catch-up",
    "detail": "Have a proper monthly catch-up: zoom out past the day-to-day to workload, priorities and how they're tracking overall.",
    "owner": "manager",
    "trigger": {
      "type": "recurring",
      "everyDays": 30,
      "startDay": 90,
      "untilDay": null
    },
    "action": {
      "kind": "check_in",
      "feedbackTemplateId": "monthly_checkin",
      "flowId": null
    },
    "applies": {
      "classifications": [],
      "starterProfiles": [],
      "minTenureDays": 90,
      "maxTenureDays": null
    }
  },
  {
    "id": "ongoing_wellbeing_pulse",
    "stage": "wellbeing",
    "title": "Wellbeing pulse",
    "detail": "Send a light, low-key wellbeing pulse to check how they're really travelling, and follow up gently on anything that flags.",
    "owner": "manager",
    "trigger": {
      "type": "recurring",
      "everyDays": 21,
      "startDay": 90,
      "untilDay": null
    },
    "action": {
      "kind": "pulse",
      "feedbackTemplateId": null,
      "flowId": "wellbeing"
    },
    "applies": {
      "classifications": [],
      "starterProfiles": [],
      "minTenureDays": 90,
      "maxTenureDays": null
    }
  },
  {
    "id": "ongoing_monthly_suggestion_prompt",
    "stage": "ongoing",
    "title": "Ask for one idea",
    "detail": "Invite them to share one thing we could do better or smarter, then close the loop on what you'll do with it.",
    "owner": "manager",
    "trigger": {
      "type": "recurring",
      "everyDays": 30,
      "startDay": 105,
      "untilDay": null
    },
    "action": {
      "kind": "survey",
      "feedbackTemplateId": "monthly_suggestion",
      "flowId": "improvement"
    },
    "applies": {
      "classifications": [],
      "starterProfiles": [],
      "minTenureDays": 90,
      "maxTenureDays": null
    }
  },
  {
    "id": "ongoing_needs_check_quarterly",
    "stage": "ongoing",
    "title": "Are they set up to do their best?",
    "detail": "Sit down and ask straight up: do they have the tools, training and support they need, and what's one thing that would help.",
    "owner": "manager",
    "trigger": {
      "type": "recurring",
      "everyDays": 90,
      "startDay": 120,
      "untilDay": null
    },
    "action": {
      "kind": "conversation",
      "feedbackTemplateId": null,
      "flowId": "development"
    },
    "applies": {
      "classifications": [],
      "starterProfiles": [],
      "minTenureDays": 90,
      "maxTenureDays": null
    }
  },
  {
    "id": "ongoing_recognition_prompt",
    "stage": "ongoing",
    "title": "Notice good work out loud",
    "detail": "Think back over the last few weeks and call out one specific thing they did well, in person or in front of the team.",
    "owner": "manager",
    "trigger": {
      "type": "recurring",
      "everyDays": 45,
      "startDay": 100,
      "untilDay": null
    },
    "action": {
      "kind": "recognition",
      "feedbackTemplateId": null,
      "flowId": "recognition"
    },
    "applies": {
      "classifications": [],
      "starterProfiles": [],
      "minTenureDays": 90,
      "maxTenureDays": null
    }
  },
  {
    "id": "ongoing_growth_training_check",
    "stage": "development",
    "title": "Where to next?",
    "detail": "Have a forward-looking chat about what they'd like to learn or grow into, and flag any training that fits.",
    "owner": "manager",
    "trigger": {
      "type": "recurring",
      "everyDays": 180,
      "startDay": 180,
      "untilDay": null
    },
    "action": {
      "kind": "development",
      "feedbackTemplateId": "training_interest",
      "flowId": "development"
    },
    "applies": {
      "classifications": [],
      "starterProfiles": [],
      "minTenureDays": 90,
      "maxTenureDays": null
    }
  },
  {
    "id": "ongoing_senior_manager_skip_level",
    "stage": "ongoing",
    "title": "Skip-level check-in",
    "detail": "As the senior manager, have a quick informal chat with them away from their direct manager to hear how things are going.",
    "owner": "senior_manager",
    "trigger": {
      "type": "recurring",
      "everyDays": 180,
      "startDay": 180,
      "untilDay": null
    },
    "action": {
      "kind": "conversation",
      "feedbackTemplateId": null,
      "flowId": null
    },
    "applies": {
      "classifications": [],
      "starterProfiles": [],
      "minTenureDays": 90,
      "maxTenureDays": null
    }
  },
  {
    "id": "devpay_quarterly_training_interest",
    "stage": "development",
    "title": "Quarterly: ask what they want to learn",
    "detail": "Send the training interest check-in and skim the replies so you know who wants more tickets, skills or responsibility this quarter.",
    "owner": "manager",
    "applies": {
      "classifications": [],
      "starterProfiles": [],
      "minTenureDays": 90,
      "maxTenureDays": null
    },
    "trigger": {
      "type": "recurring",
      "everyDays": 91,
      "startDay": 90,
      "untilDay": null
    },
    "action": {
      "kind": "survey",
      "feedbackTemplateId": "training_interest",
      "flowId": null
    }
  },
  {
    "id": "devpay_sixmonthly_development_chat",
    "stage": "development",
    "title": "6-monthly: sit down on their development",
    "detail": "Run a proper development conversation: where they're at, what's next, and one concrete step you'll back them on.",
    "owner": "manager",
    "applies": {
      "classifications": [],
      "starterProfiles": [],
      "minTenureDays": 120,
      "maxTenureDays": null
    },
    "trigger": {
      "type": "recurring",
      "everyDays": 182,
      "startDay": 120,
      "untilDay": null
    },
    "action": {
      "kind": "development",
      "flowId": "development",
      "feedbackTemplateId": null
    }
  },
  {
    "id": "devpay_yearly_pay_classification_review",
    "stage": "milestone",
    "title": "Yearly: review their pay and classification",
    "detail": "Check their current rate and Award classification against the work they're actually doing, and decide if anything needs to move.",
    "owner": "manager",
    "applies": {
      "classifications": [],
      "starterProfiles": [],
      "minTenureDays": 300,
      "maxTenureDays": null
    },
    "trigger": {
      "type": "recurring",
      "everyDays": 365,
      "startDay": 300,
      "untilDay": null
    },
    "action": {
      "kind": "review",
      "flowId": null,
      "feedbackTemplateId": null
    }
  },
  {
    "id": "devpay_long_on_classification_entry",
    "stage": "development",
    "title": "Stuck on entry level? Make a plan",
    "detail": "They've sat on a starting classification (C14/C13) a long while. Map the few competencies that would lift them and tell them the path.",
    "owner": "manager",
    "applies": {
      "classifications": [
        "C14",
        "C13"
      ],
      "starterProfiles": [],
      "minTenureDays": 365,
      "maxTenureDays": null
    },
    "trigger": {
      "type": "recurring",
      "everyDays": 365,
      "startDay": 365,
      "untilDay": null
    },
    "action": {
      "kind": "development",
      "flowId": "development",
      "feedbackTemplateId": null
    }
  },
  {
    "id": "devpay_long_on_classification_mid",
    "stage": "development",
    "title": "Long time at the same level — act on it",
    "detail": "Two-plus years on the same mid-grade classification. Decide if they're ready to step up, or have an honest chat about what's holding it.",
    "owner": "senior_manager",
    "applies": {
      "classifications": [
        "C12",
        "C11",
        "C10"
      ],
      "starterProfiles": [],
      "minTenureDays": 730,
      "maxTenureDays": null
    },
    "trigger": {
      "type": "recurring",
      "everyDays": 365,
      "startDay": 730,
      "untilDay": null
    },
    "action": {
      "kind": "review",
      "flowId": "development",
      "feedbackTemplateId": null
    }
  },
  {
    "id": "devpay_skills_check_in_first_year",
    "stage": "development",
    "title": "First year: are the right skills landing?",
    "detail": "At the 6-month mark, check the new starter is picking up the core lab competencies and flag any training gaps early.",
    "owner": "manager",
    "applies": {
      "classifications": [],
      "starterProfiles": [
        "school",
        "new_industry",
        "career_changer",
        "returning"
      ],
      "minTenureDays": 0,
      "maxTenureDays": 365
    },
    "trigger": {
      "type": "after_start",
      "days": 180
    },
    "action": {
      "kind": "development",
      "flowId": "development",
      "feedbackTemplateId": null
    }
  },
  {
    "id": "devpay_recognise_growth",
    "stage": "development",
    "title": "Half-yearly: notice who's grown",
    "detail": "Before the development chats, name one person who's clearly stepped up and make sure they hear it from you.",
    "owner": "manager",
    "applies": {
      "classifications": [],
      "starterProfiles": [],
      "minTenureDays": 180,
      "maxTenureDays": null
    },
    "trigger": {
      "type": "recurring",
      "everyDays": 182,
      "startDay": 200,
      "untilDay": null
    },
    "action": {
      "kind": "recognition",
      "flowId": "recognition",
      "feedbackTemplateId": null
    }
  },
  {
    "id": "milestone_3_month_check",
    "stage": "milestone",
    "title": "3 months in - how's it really going?",
    "detail": "Sit down for 15 minutes: ask what's clicked, what's still confusing, and whether the job matches what they expected.",
    "owner": "manager",
    "applies": {},
    "trigger": {
      "type": "after_start",
      "days": 90
    },
    "action": {
      "kind": "check_in",
      "flowId": "development",
      "feedbackTemplateId": "monthly_checkin"
    }
  },
  {
    "id": "milestone_6_month_review",
    "stage": "milestone",
    "title": "6 months - take stock together",
    "detail": "Have a proper chat about how they've settled in, what they're proud of, and where they'd like to grow next.",
    "owner": "manager",
    "applies": {},
    "trigger": {
      "type": "after_start",
      "days": 180
    },
    "action": {
      "kind": "review",
      "flowId": "development"
    }
  },
  {
    "id": "milestone_12_month_review",
    "stage": "milestone",
    "title": "First year done - mark it and plan ahead",
    "detail": "Acknowledge a full year, talk about what's next for them, and check the role and pay still feel fair.",
    "owner": "manager",
    "applies": {},
    "trigger": {
      "type": "after_start",
      "days": 365
    },
    "action": {
      "kind": "review",
      "flowId": "development"
    }
  },
  {
    "id": "milestone_work_anniversary",
    "stage": "milestone",
    "title": "Work anniversary - say thanks",
    "detail": "Each year on their start date, take a moment to recognise their time with you - a genuine thank you goes a long way.",
    "owner": "manager",
    "applies": {},
    "trigger": {
      "type": "recurring",
      "everyDays": 365,
      "startDay": 730,
      "untilDay": null
    },
    "action": {
      "kind": "recognition",
      "flowId": "recognition"
    }
  },
  {
    "id": "retention_stay_interview_2yr",
    "stage": "milestone",
    "title": "Stay interview - keep a good one",
    "detail": "Ask your valued, longer-serving people what keeps them here and what would make them think about leaving, then act on it.",
    "owner": "manager",
    "applies": {},
    "trigger": {
      "type": "recurring",
      "everyDays": 365,
      "startDay": 730,
      "untilDay": null
    },
    "action": {
      "kind": "conversation",
      "flowId": "development"
    }
  },
  {
    "id": "retention_growth_check_18mo",
    "stage": "development",
    "title": "18 months - are they still stretching?",
    "detail": "Check whether they've got room to grow or are starting to coast; line up a new skill or responsibility before they get restless.",
    "owner": "manager",
    "applies": {},
    "trigger": {
      "type": "after_start",
      "days": 545
    },
    "action": {
      "kind": "development",
      "flowId": "development",
      "feedbackTemplateId": "training_interest"
    }
  },
  {
    "id": "risk_quiet_reengagement",
    "stage": "risk",
    "title": "Gone quiet? Reconnect early",
    "detail": "For someone who's been static or withdrawn, have a low-key catch-up to ask how they're travelling before small worries grow.",
    "owner": "manager",
    "applies": {},
    "trigger": {
      "type": "recurring",
      "everyDays": 120,
      "startDay": 240,
      "untilDay": null
    },
    "action": {
      "kind": "check_in",
      "flowId": "wellbeing",
      "feedbackTemplateId": "monthly_checkin"
    }
  },
  {
    "id": "retention_progression_chat_3yr",
    "stage": "milestone",
    "title": "3 years - talk about the next step",
    "detail": "Open a frank conversation about where they want to head: a higher classification, more variety, or a steady role they're happy in.",
    "owner": "manager",
    "applies": {},
    "trigger": {
      "type": "after_start",
      "days": 1095
    },
    "action": {
      "kind": "development",
      "flowId": "development"
    }
  },
  {
    "id": "manager_reflection",
    "stage": "ongoing",
    "title": "Take a minute to think about {name}",
    "detail": "A 2-minute reflection on how they're going — what they do well, what they could grow, what they're into. Keeps you a sharp manager and feeds their recognition and development.",
    "owner": "manager",
    "trigger": {
      "type": "recurring",
      "everyDays": 35,
      "startDay": 20,
      "untilDay": null
    },
    "applies": {},
    "action": {
      "kind": "reflection",
      "flowId": null,
      "feedbackTemplateId": null
    }
  }
];
