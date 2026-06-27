// Auto-generated manager coaching library (nudges, note types, tips).
module.exports = {
  "nudges": [
    {
      "id": "stale_checkin",
      "title": "Time for a quiet word",
      "trigger": "Fires when there's been no check-in or note logged for a worker in a set period (e.g. 6+ weeks).",
      "prompt": "You haven't had a recorded catch-up with {name} for a while. No drama needed - just grab them at the bench or over a cuppa and ask how things are tracking. A two-minute chat now often heads off a bigger issue later.",
      "why": "People who go quiet are easy to overlook, and silence isn't the same as everything being fine.",
      "tone": "watch",
      "action": "Start a check-in"
    },
    {
      "id": "interest_unactioned",
      "title": "{name} put their hand up - follow it up",
      "trigger": "Fires when a worker has an 'interest' note logged but no related training, task or check-in has happened since.",
      "prompt": "A while back {name} showed interest in learning something new and nothing's come of it yet. Worth giving them a go - even shadowing on the next job or a quick supervised run builds skill and shows you were listening. If you leave it too long, they stop bothering to ask.",
      "why": "When someone shows initiative and it goes nowhere, they learn not to bother next time.",
      "tone": "proactive",
      "action": "Plan a go at it"
    },
    {
      "id": "same_role_long",
      "title": "Same bench a long while - time to mix it up?",
      "trigger": "Fires when a worker has done the same role or test type for a long stretch with no goals or new skills recorded.",
      "prompt": "{name} has been doing much the same work for a good while now with no new goals on the board. Plenty of folks are happy where they are - but plenty also quietly want a change and won't say so. Have a chat about whether they'd like to cross-train on another test, rotate through field work, or take something new on. Ask, don't assume.",
      "why": "Good people drift off or go stale when nobody asks what they want next.",
      "tone": "proactive",
      "action": "Have a chat"
    },
    {
      "id": "recognise_positive",
      "title": "Good work that hasn't been acknowledged",
      "trigger": "Fires when a positive note or good outcome has been logged but not recognised or mentioned to the worker.",
      "prompt": "There's a win logged against {name} that you haven't said anything about yet. Don't let it slide by - a quick 'nice work on that one' at the bench means more than you'd think, and it costs nothing. If it's a real standout, mention it to the team or flag it for their next review.",
      "why": "Recognition is the cheapest thing you can give and the first thing people miss when it's gone.",
      "tone": "positive",
      "action": "Recognise it"
    },
    {
      "id": "near_level_up",
      "title": "{name} is close to the next level",
      "trigger": "Fires when a worker has ticked off most of the skills or steps for the next Award classification.",
      "prompt": "{name} has knocked over most of what's needed for the next classification under the Award. That's worth acting on - sit down, look at what's left, and start a proper wage and progression review. If someone's doing higher-level work, they should be on the matching level and pay before they start wondering why not.",
      "why": "People who've earned a step up notice when it doesn't come - and that's often when they start looking elsewhere.",
      "tone": "positive",
      "action": "Start a progression review"
    },
    {
      "id": "new_starter",
      "title": "Check in on your new starter",
      "trigger": "Fires when a worker started recently (e.g. within their first 8-12 weeks).",
      "prompt": "{name} is still finding their feet. Don't wait for the formal review - have a quick, friendly check-in about how they're settling in, whether the training's making sense, and if they've got what they need. Early on is when small problems are easy to fix and when people decide whether they'll stay.",
      "why": "The first few weeks set the tone, and new starters rarely speak up when something's not right.",
      "tone": "proactive",
      "action": "Start a check-in"
    }
  ],
  "noteTypes": [
    {
      "id": "positive",
      "label": "Good work / win",
      "icon": "👍",
      "hint": "Capture something they did well - a job done right, initiative taken, a problem solved, or a client looked after. Be specific so you can use it later in a review.",
      "examples": [
        "Picked up a moisture content error before the report went out - good eye.",
        "Stayed back to help finish the compaction samples without being asked.",
        "Handled the client site visit on their own and got good feedback."
      ]
    },
    {
      "id": "interest",
      "label": "Showed interest",
      "icon": "🌱",
      "hint": "Note when someone shows they want to learn a test, take on new work, or move up. These are the openings to act on before they go cold.",
      "examples": [
        "Showed interest in learning the triaxial test.",
        "Asked about getting NATA signatory status down the track.",
        "Keen to do more field density work and less lab prep."
      ]
    },
    {
      "id": "watch",
      "label": "Keep an eye on",
      "icon": "👀",
      "hint": "Something to monitor - not a formal issue yet, but worth a record so you spot a pattern. Stick to what you observed, not labels.",
      "examples": [
        "A few rushed sample IDs this week - worth a quiet reminder on labelling.",
        "Seemed frustrated with the new sieve setup - check it's not a training gap.",
        "Second late start this fortnight - keep an eye on, no need to make a thing of it yet."
      ]
    },
    {
      "id": "wellbeing",
      "label": "How they seem",
      "icon": "💙",
      "hint": "How the person seems in themselves - flat, stretched, more chipper than usual. You're not diagnosing, just noticing so you can check in.",
      "examples": [
        "Seemed flat this week, worth a check-in.",
        "Mentioned things are full-on at home - go a bit easier on the overtime asks.",
        "Back to their usual self after the rough patch - good to see."
      ]
    },
    {
      "id": "general",
      "label": "General note",
      "icon": "📝",
      "hint": "Anything else worth remembering that doesn't fit the other types - context, a conversation, something they mentioned in passing.",
      "examples": [
        "Off for two weeks in July - planned leave.",
        "Mentioned they'd done concrete testing at a previous job.",
        "Prefers a heads-up before being put on field work - family pickups."
      ]
    }
  ],
  "coachingTips": [
    "Catch people doing things right, not just wrong - the wins are worth recording too.",
    "If you wouldn't remember it in a month, write it down.",
    "Not everyone will put their hand up - go to them and ask.",
    "A two-minute chat at the bench beats a formal review you keep putting off.",
    "When someone shows interest, act on it before it goes cold - or they'll stop asking.",
    "Notice the quiet ones. Going silent isn't the same as being fine.",
    "If someone's doing the work of a higher level, sort out the level and the pay - don't make them ask.",
    "Recognition costs nothing and is the first thing people miss when it's gone."
  ]
};
