// Auto-generated HR document templates.
module.exports = [
  {
    "id": "file_note",
    "name": "File Note",
    "category": "Record keeping",
    "purpose": "Use this to quickly jot down what happened and what was said after a chat, an incident or anything worth remembering.",
    "tone": "factual and neutral",
    "fields": [
      {
        "id": "note_date",
        "label": "When did this happen?",
        "type": "date",
        "required": true,
        "placeholder": "",
        "help": "The date of the event or conversation, not necessarily today."
      },
      {
        "id": "who_was_there",
        "label": "Who was there?",
        "type": "text",
        "required": false,
        "placeholder": "e.g. Just me and Sam, on site at the Dandenong job",
        "help": "List anyone present, or note if it was a private observation."
      },
      {
        "id": "what_happened",
        "label": "What happened or what was said?",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. Sam turned up about 40 mins late again. I asked him about it and he said he slept in.",
        "help": "Stick to the facts. Write what you saw or heard, not how you felt about it."
      },
      {
        "id": "what_i_said",
        "label": "What did you say or do about it?",
        "type": "textarea",
        "required": false,
        "placeholder": "e.g. I reminded him our start time is 7am sharp and asked him to give me a call if he's running late.",
        "help": "Note any expectations you set or actions you agreed on."
      },
      {
        "id": "follow_up",
        "label": "Anything to follow up?",
        "type": "text",
        "required": false,
        "placeholder": "e.g. Keep an eye on start times over the next fortnight.",
        "help": "Leave blank if there's nothing to track."
      }
    ],
    "body": "FILE NOTE\n\nBusiness: {{businessName}}\nWritten by: {{managerName}}\nDate written: {{date}}\n\nAbout: {{employeeName}}\nDate of event: {{note_date}}\nWho was present: {{who_was_there}}\n\nWHAT HAPPENED\n{{what_happened}}\n\nWHAT I SAID / DID\n{{what_i_said}}\n\nTO FOLLOW UP\n{{follow_up}}\n\n---\nThis note was written by {{managerName}} on {{date}} as a record of events. It is a factual record kept on file.",
    "legalNote": "Write file notes as soon as you can after the event, and stick to facts you saw or heard. Down the track, a dated note written at the time carries far more weight than memory."
  },
  {
    "id": "expectations_letter",
    "name": "Setting Expectations Letter",
    "category": "Getting on the front foot",
    "purpose": "Use this to put your expectations in writing up front, so everyone's clear on what good looks like before any problems start.",
    "tone": "supportive and clear",
    "fields": [
      {
        "id": "role_title",
        "label": "What's their role?",
        "type": "text",
        "required": true,
        "placeholder": "e.g. Second-year apprentice carpenter",
        "help": "The job title or role you're setting expectations for."
      },
      {
        "id": "expectations",
        "label": "What do you expect of them?",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. On site and ready to go by 7am. Tools cleaned and packed away before knock-off. Let me know straight away if something's not safe.",
        "help": "List the key things clearly. Be specific so there's no guessing."
      },
      {
        "id": "why_it_matters",
        "label": "Why does this matter?",
        "type": "textarea",
        "required": false,
        "placeholder": "e.g. When we all start on time, the whole crew can crack on and we keep the client happy.",
        "help": "A quick reason helps people buy in, not just comply."
      },
      {
        "id": "support_offered",
        "label": "How will you support them?",
        "type": "textarea",
        "required": false,
        "placeholder": "e.g. Come see me anytime if you're not sure on something. I'll do a quick check-in with you each Friday.",
        "help": "Show them you're in their corner."
      }
    ],
    "body": "Dear {{employeeName}},\n\nWelcome and good to have you on board. I wanted to put a few things in writing so we're both on the same page about what we're after in your role as {{role_title}}. None of this is a worry — it's just so you know exactly what good looks like here at {{businessName}}.\n\nWHAT I'M LOOKING FOR\n{{expectations}}\n\nWHY IT MATTERS\n{{why_it_matters}}\n\nHOW I'LL SUPPORT YOU\n{{support_offered}}\n\nIf anything here isn't clear, or you reckon something's going to be tricky, come and have a chat with me. I'd much rather sort it out early than have you guessing. The aim here is to set you up to do well.\n\nThanks,\n\n{{managerName}}\n{{businessName}}\n{{date}}",
    "legalNote": "Setting clear expectations early is one of the fairest things you can do. If a problem ever comes up later, this letter shows the worker always knew the standard."
  },
  {
    "id": "informal_chat_record",
    "name": "Informal Chat Record",
    "category": "Early conversations",
    "purpose": "Use this after a quiet, friendly word to record that you raised a concern early, before anything became formal.",
    "tone": "supportive and low-key",
    "fields": [
      {
        "id": "chat_date",
        "label": "When did you have the chat?",
        "type": "date",
        "required": true,
        "placeholder": "",
        "help": "The date you actually spoke, not necessarily today."
      },
      {
        "id": "concern_raised",
        "label": "What did you raise?",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. I mentioned that paperwork has been coming in late and a couple of dockets had jobs missing.",
        "help": "Keep it plain and specific. What's the actual concern?"
      },
      {
        "id": "their_response",
        "label": "What did they say?",
        "type": "textarea",
        "required": false,
        "placeholder": "e.g. Jess said she's been flat out and didn't realise it was a problem. She's happy to fix it up.",
        "help": "Their side matters. Note it fairly, even if you don't fully agree."
      },
      {
        "id": "agreed_next_steps",
        "label": "What did you both agree to?",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. Jess will get dockets in by end of each day. I'll check back in a couple of weeks.",
        "help": "A simple, agreed plan. Nothing heavy."
      }
    ],
    "body": "INFORMAL CHAT RECORD\n\nBusiness: {{businessName}}\nManager: {{managerName}}\nEmployee: {{employeeName}}\nDate of chat: {{chat_date}}\nRecord written: {{date}}\n\nThis is a simple record of an informal, friendly conversation. It is not a warning.\n\nWHAT I RAISED\n{{concern_raised}}\n\nWHAT THEY SAID\n{{their_response}}\n\nWHAT WE AGREED\n{{agreed_next_steps}}\n\nThis was a casual chat to sort things out early. I let {{employeeName}} know my door is open if they want to talk anything through.\n\n{{managerName}}\n{{date}}",
    "legalNote": "A quiet word early is often all it takes, and many issues never go further. Keeping a short record shows you gave honest feedback and a fair go before anything formal."
  },
  {
    "id": "performance_improvement_plan",
    "name": "Performance Improvement Plan (PIP)",
    "category": "Working on performance",
    "purpose": "Use this when performance needs to lift and you want to set clear goals, real support and a fair timeframe to turn things around.",
    "tone": "firm but fair",
    "fields": [
      {
        "id": "areas_to_improve",
        "label": "What needs to improve?",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. Quality of finish on cabinetry. Last three jobs needed rework before the client would sign off.",
        "help": "Be specific. Use examples so it's clear what you mean."
      },
      {
        "id": "what_good_looks_like",
        "label": "What does success look like?",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. Jobs passing the final check first time, with no rework needed.",
        "help": "Spell out the goal so they know exactly what they're aiming for."
      },
      {
        "id": "support_offered",
        "label": "What support will you give?",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. I'll pair you with Dave on the next two jobs and we'll do a quality check together each Friday.",
        "help": "A fair plan gives real help, not just a deadline."
      },
      {
        "id": "review_period",
        "label": "How long is the plan?",
        "type": "select",
        "required": true,
        "placeholder": "",
        "help": "Give enough time to genuinely improve. Four to twelve weeks is common.",
        "options": [
          "4 weeks",
          "6 weeks",
          "8 weeks",
          "12 weeks"
        ]
      },
      {
        "id": "check_in_dates",
        "label": "When will you check in?",
        "type": "text",
        "required": true,
        "placeholder": "e.g. Every Friday afternoon, plus a final review at the end.",
        "help": "Regular check-ins keep it fair and on track."
      },
      {
        "id": "review_date",
        "label": "Final review date",
        "type": "date",
        "required": true,
        "placeholder": "",
        "help": "The date you'll sit down and review how things have gone."
      }
    ],
    "body": "PERFORMANCE IMPROVEMENT PLAN\n\nBusiness: {{businessName}}\nEmployee: {{employeeName}}\nManager: {{managerName}}\nDate: {{date}}\n\nDear {{employeeName}},\n\nWe've had a chat about some areas of your work that need to improve. I want to be upfront and clear with you, and I also want to back you to get there. This plan sets out what needs to change, the support you'll get from me, and how we'll track it together. The goal is to see you do well.\n\nWHAT NEEDS TO IMPROVE\n{{areas_to_improve}}\n\nWHAT SUCCESS LOOKS LIKE\n{{what_good_looks_like}}\n\nTHE SUPPORT YOU'LL GET\n{{support_offered}}\n\nHOW LONG THIS PLAN RUNS\nThis plan runs for {{review_period}}.\nWe'll check in: {{check_in_dates}}\nFinal review: {{review_date}}\n\nWHAT HAPPENS NEXT\nIf things improve to where we need them, that's the result we're both after and we'll close out the plan. If they don't, we may need to look at next steps, which could include a formal warning. I'm telling you that now so there are no surprises.\n\nYou're welcome to bring a support person to any of our review meetings, and to share your side at any point. If you think anything in this plan is unfair or unrealistic, tell me — I want this to be a genuine and reasonable chance to turn things around.\n\nSigned:\n\nManager: {{managerName}}   Date: __________\n\nEmployee: {{employeeName}}   Date: __________\n(Signing means you've received and discussed this plan, not that you agree with everything in it.)",
    "legalNote": "A PIP works best as genuine support, not a box-tick on the way out. Before you start one, it's worth a quick call to an HR or employment-law adviser so the goals and timeframe are fair and realistic."
  },
  {
    "id": "first_written_warning",
    "name": "First Written Warning",
    "category": "Formal warnings",
    "purpose": "Use this when an informal chat hasn't fixed things and you need to formally put a performance or conduct issue in writing.",
    "tone": "firm but fair",
    "fields": [
      {
        "id": "meeting_date",
        "label": "When did you meet about this?",
        "type": "date",
        "required": true,
        "placeholder": "",
        "help": "The date of the meeting where you discussed the issue."
      },
      {
        "id": "issue",
        "label": "What's the issue?",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. Turning up late to site. You've started after 7am on six days in the past three weeks.",
        "help": "Be specific. Include dates or examples where you can."
      },
      {
        "id": "previous_discussions",
        "label": "Have you raised this before?",
        "type": "textarea",
        "required": false,
        "placeholder": "e.g. We had an informal chat about this on 10 May and agreed you'd call if running late.",
        "help": "Note any earlier chats. It shows they had a fair go already."
      },
      {
        "id": "required_change",
        "label": "What needs to change?",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. Be on site and ready to start by 7am every shift. Call me before 6:30am if there's a genuine problem.",
        "help": "Spell out exactly what you need going forward."
      },
      {
        "id": "support_offered",
        "label": "What support will you offer?",
        "type": "textarea",
        "required": false,
        "placeholder": "e.g. Happy to look at your start time if there's a transport issue we can sort out.",
        "help": "Even a firm warning should offer a hand."
      },
      {
        "id": "their_response",
        "label": "What did they say in the meeting?",
        "type": "textarea",
        "required": false,
        "placeholder": "e.g. You said the traffic from the new place has been bad and you'll leave earlier.",
        "help": "Recording their side shows you genuinely listened."
      }
    ],
    "body": "FIRST WRITTEN WARNING\n\nBusiness: {{businessName}}\nEmployee: {{employeeName}}\nIssued by: {{managerName}}\nDate of warning: {{date}}\nDate we met: {{meeting_date}}\n\nDear {{employeeName}},\n\nThis letter is a formal first written warning. I don't take this step lightly, and I want to be fair and clear with you about where things are at.\n\nTHE ISSUE\n{{issue}}\n\nWHAT WE'VE ALREADY TALKED ABOUT\n{{previous_discussions}}\n\nWHAT YOU TOLD ME\n{{their_response}}\n\nWHAT NEEDS TO CHANGE\n{{required_change}}\n\nHOW I CAN HELP\n{{support_offered}}\n\nWHAT HAPPENS NEXT\nI'm confident you can sort this out, and I want to see that happen. But I also need to be straight with you: if the issue continues, it may lead to a further warning and, down the track, could put your job at risk. I'm telling you this now so it's fair and there are no surprises.\n\nYOUR RIGHTS\nWe discussed this at our meeting and you had the chance to share your side. You were entitled to bring a support person. If you feel this warning is unfair, you're welcome to put your response in writing and it will be kept on file with this letter.\n\nSigned:\n\nManager: {{managerName}}   Date: __________\n\nEmployee: {{employeeName}}   Date: __________\n(Signing means you've received this warning, not that you agree with it.)",
    "legalNote": "Give the worker a chance to explain before you finalise a warning, and let them bring a support person to the meeting. It's wise to get HR or employment-law advice before issuing any formal warning."
  },
  {
    "id": "second_written_warning",
    "name": "Second Written Warning",
    "category": "Formal warnings",
    "purpose": "Use this when a first warning hasn't fixed the issue and you need to formally escalate, while still giving a fair chance to improve.",
    "tone": "firm but fair",
    "fields": [
      {
        "id": "meeting_date",
        "label": "When did you meet about this?",
        "type": "date",
        "required": true,
        "placeholder": "",
        "help": "The date of the meeting where you discussed the issue."
      },
      {
        "id": "first_warning_date",
        "label": "When was the first warning?",
        "type": "date",
        "required": true,
        "placeholder": "",
        "help": "The date of the first written warning for this issue."
      },
      {
        "id": "issue",
        "label": "What's still happening?",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. Despite the first warning on 1 June, you've been late again on 8, 11 and 15 June.",
        "help": "Be specific. Show it's continued since the first warning."
      },
      {
        "id": "required_change",
        "label": "What needs to change?",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. On site and ready by 7am every shift, with no exceptions unless agreed with me first.",
        "help": "Restate clearly what you need going forward."
      },
      {
        "id": "support_offered",
        "label": "What support will you offer?",
        "type": "textarea",
        "required": false,
        "placeholder": "e.g. Let's sit down and work out what's getting in the way so we can fix it for good.",
        "help": "Keep the door open even now."
      },
      {
        "id": "their_response",
        "label": "What did they say in the meeting?",
        "type": "textarea",
        "required": false,
        "placeholder": "e.g. You said things have been tough at home. I appreciate you being honest about that.",
        "help": "Record their side fairly."
      }
    ],
    "body": "SECOND WRITTEN WARNING\n\nBusiness: {{businessName}}\nEmployee: {{employeeName}}\nIssued by: {{managerName}}\nDate of warning: {{date}}\nDate we met: {{meeting_date}}\n\nDear {{employeeName}},\n\nThis letter is a formal second written warning. We've been here before and I'd much rather not be writing this, but I need to be honest with you about where things stand.\n\nTHE ISSUE\nYou received a first written warning on {{first_warning_date}}. Unfortunately, the issue has continued:\n{{issue}}\n\nWHAT YOU TOLD ME\n{{their_response}}\n\nWHAT NEEDS TO CHANGE\n{{required_change}}\n\nHOW I CAN HELP\n{{support_offered}}\n\nWHAT HAPPENS NEXT\nI want to be clear and fair with you: this is a serious step. If the issue continues, the next step would be a final written warning, and after that your job could be at risk. I'm setting that out plainly now so you know exactly where you stand and have a real chance to turn it around.\n\nYOUR RIGHTS\nWe talked this through at our meeting and you had the chance to share your side. You were entitled to bring a support person. If you feel this warning is unfair, you're welcome to put your response in writing and it will be kept on file with this letter.\n\nSigned:\n\nManager: {{managerName}}   Date: __________\n\nEmployee: {{employeeName}}   Date: __________\n(Signing means you've received this warning, not that you agree with it.)",
    "legalNote": "By the second warning, things are getting serious. This is a good point to call an HR or employment-law adviser, so you're confident the process has been fair before it goes any further."
  },
  {
    "id": "final_written_warning",
    "name": "Final Written Warning",
    "category": "Formal warnings",
    "purpose": "Use this as the last formal step before dismissal, to make crystal clear that the job is now at risk if things don't change.",
    "tone": "serious but respectful",
    "fields": [
      {
        "id": "meeting_date",
        "label": "When did you meet about this?",
        "type": "date",
        "required": true,
        "placeholder": "",
        "help": "The date of the meeting where you discussed the issue."
      },
      {
        "id": "warning_history",
        "label": "What warnings have come before?",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. First warning 1 June, second warning 20 June, both about lateness.",
        "help": "List the earlier warnings with dates. It shows a fair process."
      },
      {
        "id": "issue",
        "label": "What's still happening?",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. Despite both warnings, you were late again on 28 June and 2 July.",
        "help": "Be specific. Show the issue has continued."
      },
      {
        "id": "required_change",
        "label": "What must change, and by when?",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. On site and ready by 7am every single shift, starting immediately, with sustained improvement over the next month.",
        "help": "Make the standard and timeframe unmistakable."
      },
      {
        "id": "support_offered",
        "label": "What support will you offer?",
        "type": "textarea",
        "required": false,
        "placeholder": "e.g. I'm still happy to work through anything that's getting in the way if you'll let me.",
        "help": "Even now, a fair process keeps offering support."
      },
      {
        "id": "their_response",
        "label": "What did they say in the meeting?",
        "type": "textarea",
        "required": false,
        "placeholder": "e.g. You said you understand how serious this is and you're committed to fixing it.",
        "help": "Record their side fairly."
      }
    ],
    "body": "FINAL WRITTEN WARNING\n\nBusiness: {{businessName}}\nEmployee: {{employeeName}}\nIssued by: {{managerName}}\nDate of warning: {{date}}\nDate we met: {{meeting_date}}\n\nDear {{employeeName}},\n\nThis letter is a final written warning. This is the most serious step before dismissal, and I want to be completely honest and clear with you so you understand exactly where things stand.\n\nWHAT'S HAPPENED SO FAR\n{{warning_history}}\n\nTHE ISSUE\n{{issue}}\n\nWHAT YOU TOLD ME\n{{their_response}}\n\nWHAT MUST CHANGE\n{{required_change}}\n\nHOW I CAN HELP\n{{support_offered}}\n\nWHAT HAPPENS NEXT\nI need to be direct with you: your job is now at risk. If this issue is not fixed and kept fixed, it may result in your employment being ended. I'm not saying this to frighten you — I'm saying it because you deserve a clear, fair and final chance to turn things around, and I genuinely hope you do.\n\nYOUR RIGHTS\nWe talked this through at our meeting and you had a full chance to share your side. You were entitled to bring a support person. If you feel this warning is unfair, you're welcome to put your response in writing and it will be kept on file with this letter.\n\nSigned:\n\nManager: {{managerName}}   Date: __________\n\nEmployee: {{employeeName}}   Date: __________\n(Signing means you've received this warning, not that you agree with it.)",
    "legalNote": "Do not dismiss anyone off the back of this letter without getting proper advice first. Before a final warning or any dismissal, speak with the owner or director and an external HR or employment-law adviser, and make sure your process lines up with the Small Business Fair Dismissal Code."
  },
  {
    "id": "meeting_invite_letter",
    "name": "Meeting Invite Letter",
    "category": "Formal meetings",
    "purpose": "Use this to formally invite someone to a meeting about their performance or conduct, so they can prepare and bring a support person.",
    "tone": "respectful and clear",
    "fields": [
      {
        "id": "meeting_subject",
        "label": "What's the meeting about?",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. Concerns about start times on site over the past few weeks.",
        "help": "Tell them plainly so they can prepare. Don't blindside people."
      },
      {
        "id": "meeting_date",
        "label": "Meeting date",
        "type": "date",
        "required": true,
        "placeholder": "",
        "help": "Give a few days' notice so it's fair."
      },
      {
        "id": "meeting_time",
        "label": "Meeting time",
        "type": "text",
        "required": true,
        "placeholder": "e.g. 2:00pm",
        "help": "Pick a reasonable time during working hours."
      },
      {
        "id": "meeting_place",
        "label": "Where will you meet?",
        "type": "text",
        "required": true,
        "placeholder": "e.g. The site office at the Geelong yard",
        "help": "Somewhere private and away from the crew."
      },
      {
        "id": "possible_outcome",
        "label": "What might the meeting lead to?",
        "type": "select",
        "required": false,
        "placeholder": "",
        "help": "Being upfront about possible outcomes is part of a fair process.",
        "options": [
          "A general discussion, no outcome decided yet",
          "A possible formal warning",
          "A possible final warning",
          "A decision about your ongoing employment"
        ]
      }
    ],
    "body": "Dear {{employeeName}},\n\nI'd like to meet with you to talk through something important. I'm writing to you so you have time to prepare and aren't caught on the hop.\n\nWHAT THE MEETING IS ABOUT\n{{meeting_subject}}\n\nWHEN AND WHERE\nDate: {{meeting_date}}\nTime: {{meeting_time}}\nPlace: {{meeting_place}}\n\nWHAT THIS MAY LEAD TO\n{{possible_outcome}}\n\nBRINGING A SUPPORT PERSON\nYou are welcome to bring a support person with you — a workmate, a friend or family member, or a union rep. Their job is to support you, not to speak for you. Just let me know beforehand if you're bringing someone.\n\nThis is a genuine two-way conversation. You'll have a full chance to share your side of things, and no decision has been made before we talk. If the date or time doesn't suit, get in touch and we'll find something that works.\n\nThanks,\n\n{{managerName}}\n{{businessName}}\n{{date}}",
    "legalNote": "Give fair notice, say plainly what the meeting is about, and always offer the right to a support person. Letting someone prepare and be heard is a core part of a fair process under the Fair Work system."
  },
  {
    "id": "recognition_letter",
    "name": "Recognition Letter",
    "category": "Recognition",
    "purpose": "Use this to put genuine praise in writing when someone has gone above and beyond, nailed a tough job, or hit a milestone worth marking.",
    "tone": "celebratory",
    "fields": [
      {
        "id": "what_they_did",
        "label": "What they did",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. Stepped up to run the Henderson Road site for three weeks while Dave was off, kept the crew on track and the client happy.",
        "help": "Be specific. Name the actual thing, not just \"great work\"."
      },
      {
        "id": "why_it_mattered",
        "label": "Why it mattered",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. We hit the deadline without a hitch and the client has already booked us for the next job.",
        "help": "Spell out the difference it made to the team, the job or the business."
      },
      {
        "id": "qualities_shown",
        "label": "Qualities they showed",
        "type": "text",
        "required": false,
        "placeholder": "e.g. leadership, calm under pressure, looking out for the younger blokes",
        "help": "The character behind the work — what you'd want more of."
      },
      {
        "id": "personal_note",
        "label": "Personal note (optional)",
        "type": "textarea",
        "required": false,
        "placeholder": "e.g. I know it meant some long days away from the family, and that didn't go unnoticed.",
        "help": "A line that shows you actually mean it. Skip if it feels forced."
      }
    ],
    "body": "{{businessName}}\n\n{{date}}\n\nDear {{employeeName}},\n\nI wanted to put this in writing properly, not just say it in passing — because you've earned it.\n\nWHAT YOU DID\n{{what_they_did}}\n\nWHY IT MATTERED\n{{why_it_mattered}}\n\nThe thing that stood out to me was {{qualities_shown}}. That's exactly the sort of thing that keeps this place ticking, and it doesn't go unnoticed.\n\n{{personal_note}}\n\nThanks for the effort and for the way you went about it. I'm glad to have you on the team, and I wanted you to have something to look back on that says so.\n\nCheers,\n\n{{managerName}}\n{{businessName}}",
    "legalNote": "This is a positive letter with no legal weight, but keep it accurate — recognition letters can be read back to you later if a pay, promotion or performance question ever comes up."
  },
  {
    "id": "promotion_proposal",
    "name": "Promotion Proposal",
    "category": "Growth",
    "purpose": "Use this to set out the case for promoting someone — for your own records or to take to the owner before you make it official.",
    "tone": "supportive",
    "fields": [
      {
        "id": "current_role",
        "label": "Current role",
        "type": "text",
        "required": true,
        "placeholder": "e.g. Leading Hand",
        "help": "What they do now."
      },
      {
        "id": "proposed_role",
        "label": "Proposed new role",
        "type": "text",
        "required": true,
        "placeholder": "e.g. Site Supervisor",
        "help": "The role you want to move them into."
      },
      {
        "id": "the_case",
        "label": "The case for it",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. He's been doing half the supervisor's job for six months already — running toolbox talks, sorting materials, mentoring the apprentices.",
        "help": "What they've already shown that proves they're ready."
      },
      {
        "id": "new_responsibilities",
        "label": "New responsibilities",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. Running the daily site plan, signing off on quality checks, managing a crew of four.",
        "help": "What changes in the actual job."
      },
      {
        "id": "proposed_pay",
        "label": "Proposed pay or package",
        "type": "text",
        "required": false,
        "placeholder": "e.g. $38/hr, up from $33/hr, plus site allowance",
        "help": "Leave blank if pay is still being worked out."
      },
      {
        "id": "support_offered",
        "label": "Support to set them up",
        "type": "textarea",
        "required": false,
        "placeholder": "e.g. A first-aid and supervisor ticket paid for by us, plus a fortnightly check-in with me for the first three months.",
        "help": "Training, mentoring or a settling-in period — promotions stick when people are set up to win."
      },
      {
        "id": "start_date",
        "label": "Proposed start date",
        "type": "date",
        "required": false,
        "placeholder": "",
        "help": "When the new role would kick off."
      }
    ],
    "body": "PROMOTION PROPOSAL\n{{businessName}}\n\nDate: {{date}}\nPrepared by: {{managerName}}\nEmployee: {{employeeName}}\n\nCURRENT ROLE: {{current_role}}\nPROPOSED ROLE: {{proposed_role}}\nProposed start date: {{start_date}}\n\nTHE CASE FOR IT\n{{the_case}}\n\nWHAT THE NEW ROLE INVOLVES\n{{new_responsibilities}}\n\nPAY / PACKAGE\n{{proposed_pay}}\n\nHOW WE'LL SET THEM UP TO SUCCEED\n{{support_offered}}\n\nRECOMMENDATION\nI believe {{employeeName}} is ready for this step and that backing them now is good for them and good for the business. I'd like to confirm the move and talk it through with {{employeeName}} directly.\n\nApproved by: __________________________   Date: ____________\n\nNote: Once approved, confirm the new role, pay and any changed conditions to {{employeeName}} in writing before the start date.",
    "legalNote": "A promotion usually changes pay and conditions, so check the move still meets the relevant award or agreement and confirm the new terms in writing before it starts."
  },
  {
    "id": "role_change_agreement",
    "name": "Role Change Agreement",
    "category": "Growth",
    "purpose": "Use this to record an agreed change to someone's role, hours, duties or pay so both of you are clear on what's changing and from when.",
    "tone": "supportive",
    "fields": [
      {
        "id": "current_arrangement",
        "label": "Current arrangement",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. Full-time labourer, 38 hours a week, Mon-Fri, $32/hr.",
        "help": "How things stand right now — role, hours, days, pay."
      },
      {
        "id": "whats_changing",
        "label": "What's changing",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. Moving to a machine operator role, same hours, lifting pay to $36/hr once the ticket comes through.",
        "help": "Spell out exactly what's different. Be clear about pay, hours and duties."
      },
      {
        "id": "reason",
        "label": "Reason for the change",
        "type": "textarea",
        "required": false,
        "placeholder": "e.g. You asked to get off the shovel and into machinery, and we've got the work to support it.",
        "help": "A short, honest line on why — helps it feel fair and agreed, not imposed."
      },
      {
        "id": "effective_date",
        "label": "Date the change starts",
        "type": "date",
        "required": true,
        "placeholder": "",
        "help": "When the new arrangement kicks in."
      },
      {
        "id": "review_arrangement",
        "label": "Trial or review period",
        "type": "text",
        "required": false,
        "placeholder": "e.g. We'll check in at 4 weeks to make sure it's working for both of us.",
        "help": "Optional. Useful if it's a try-it-and-see change."
      },
      {
        "id": "what_stays_same",
        "label": "What stays the same",
        "type": "text",
        "required": false,
        "placeholder": "e.g. Your leave, superannuation and length of service all carry over unchanged.",
        "help": "Reassures the worker that they're not losing anything they've built up."
      }
    ],
    "body": "ROLE CHANGE AGREEMENT\n{{businessName}}\n\nDate: {{date}}\nBetween: {{businessName}} (represented by {{managerName}}) and {{employeeName}}\n\nThis is to confirm a change to {{employeeName}}'s role that we've talked through and agreed.\n\nWHERE THINGS STAND NOW\n{{current_arrangement}}\n\nWHAT'S CHANGING\n{{whats_changing}}\n\nWHY\n{{reason}}\n\nWHEN IT STARTS\nThis change takes effect from {{effective_date}}.\n\nCHECKING IN\n{{review_arrangement}}\n\nWHAT ISN'T CHANGING\n{{what_stays_same}}\n\nEverything else in your existing terms of employment stays as it is unless we agree otherwise in writing.\n\nWe've both read this and we're happy with it.\n\nEmployee: {{employeeName}}\nSignature: __________________________   Date: ____________\n\nFor {{businessName}}: {{managerName}}\nSignature: __________________________   Date: ____________",
    "legalNote": "A real change to pay, hours or duties needs the employee's genuine agreement and must still meet the relevant award or agreement — get advice before changing anything to someone's detriment or you risk a dispute."
  },
  {
    "id": "check_in_record",
    "name": "Check-In Record",
    "category": "Wellbeing",
    "purpose": "Use this to jot down a quick, friendly one-on-one — how someone's tracking at work and in themselves — so nothing important slips through the cracks.",
    "tone": "supportive",
    "fields": [
      {
        "id": "whats_going_well",
        "label": "What's going well",
        "type": "textarea",
        "required": false,
        "placeholder": "e.g. Really happy on the new crew, getting on well with the team, learning the cranes.",
        "help": "Always start here. What's good is worth noting too."
      },
      {
        "id": "any_challenges",
        "label": "Anything tough right now",
        "type": "textarea",
        "required": false,
        "placeholder": "e.g. The early starts are wearing thin, and there's a bit on at home.",
        "help": "Work or personal, only what they're happy to share. Don't push."
      },
      {
        "id": "support_needed",
        "label": "Support they need",
        "type": "textarea",
        "required": false,
        "placeholder": "e.g. Asked if he could swap to a later start two days a week for a bit.",
        "help": "What would actually help. Be realistic about what you can offer."
      },
      {
        "id": "actions_agreed",
        "label": "What we'll do",
        "type": "textarea",
        "required": false,
        "placeholder": "e.g. I'll sort the roster change and flag the EAP number. He'll let me know if it's not easing up.",
        "help": "Who's doing what. Keep it small and doable."
      },
      {
        "id": "next_check_in",
        "label": "Next check-in",
        "type": "date",
        "required": false,
        "placeholder": "",
        "help": "Set a date so it actually happens."
      }
    ],
    "body": "CHECK-IN RECORD\n{{businessName}}\n\nDate: {{date}}\nWith: {{employeeName}}\nChecked in by: {{managerName}}\n\nThis is a private record of a friendly catch-up — no formal action, just making sure {{employeeName}} is travelling alright and has what they need.\n\nWHAT'S GOING WELL\n{{whats_going_well}}\n\nANYTHING TOUGH RIGHT NOW\n{{any_challenges}}\n\nSUPPORT NEEDED\n{{support_needed}}\n\nWHAT WE'LL DO\n{{actions_agreed}}\n\nNEXT CHECK-IN\n{{next_check_in}}\n\nA reminder from me: if anything's weighing on you, my door's open and you don't have to wait for the next catch-up. If you'd ever like a hand finding extra support, just say the word.\n\n{{managerName}}",
    "legalNote": "These notes can touch on personal or health matters, so keep them private and stored securely, and never use a wellbeing chat as a substitute for a fair, documented process if a real performance or conduct issue arises."
  },
  {
    "id": "absence_return_to_work",
    "name": "Return to Work Chat (after time off or unexplained absence)",
    "category": "Absence",
    "purpose": "Use this to record a friendly catch-up when someone comes back after time off, an injury, an extended absence, or a run of unexplained no-shows.",
    "tone": "supportive",
    "fields": [
      {
        "id": "absence_reason",
        "label": "What was the absence?",
        "type": "select",
        "required": true,
        "placeholder": "Pick the closest fit",
        "help": "Sets the right tone for the chat.",
        "options": [
          "Illness or injury",
          "Personal or family reason",
          "Extended leave (holiday, parental, etc.)",
          "Unexplained or unapproved absence",
          "Other"
        ]
      },
      {
        "id": "absence_dates",
        "label": "Dates away from work",
        "type": "text",
        "required": true,
        "placeholder": "e.g. 2 to 13 June 2026",
        "help": "Roughly when they were off.",
        "options": []
      },
      {
        "id": "return_date",
        "label": "Date they returned (or are returning)",
        "type": "date",
        "required": true,
        "placeholder": "",
        "help": "The day they're back on the tools.",
        "options": []
      },
      {
        "id": "fit_for_work",
        "label": "Any restrictions or things to ease back into?",
        "type": "textarea",
        "required": false,
        "placeholder": "e.g. No heavy lifting for two weeks per the doctor's note, lighter duties to start",
        "help": "Note any medical advice or adjustments. Leave blank if none.",
        "options": []
      },
      {
        "id": "support_offered",
        "label": "Support or adjustments offered",
        "type": "textarea",
        "required": false,
        "placeholder": "e.g. Flexible start times this week, swapped to yard duties, EAP details shared",
        "help": "What you're doing to help them settle back in.",
        "options": []
      },
      {
        "id": "catch_up_notes",
        "label": "Anything they need catching up on",
        "type": "textarea",
        "required": false,
        "placeholder": "e.g. New site safety rules, the change to the roster, the Henderson job",
        "help": "Updates from while they were away.",
        "options": []
      },
      {
        "id": "next_check_in",
        "label": "Next check-in",
        "type": "text",
        "required": false,
        "placeholder": "e.g. End of next week, or first day back next month",
        "help": "When you'll touch base again.",
        "options": []
      }
    ],
    "body": "RETURN TO WORK CHAT\n\nBusiness: {{businessName}}\nEmployee: {{employeeName}}\nManager: {{managerName}}\nDate of this chat: {{date}}\n\nWelcome back, {{employeeName}}.\n\nThis is a short, friendly note to record our return-to-work chat. There's nothing to worry about here. It just helps us make sure you've got everything you need to get back into the swing of things, and it keeps a clear record for both of us.\n\nABOUT THE TIME AWAY\nReason for the absence: {{absence_reason}}\nDates away from work: {{absence_dates}}\nDate back at work: {{return_date}}\n\nGETTING BACK INTO IT SAFELY\nThings to ease back into or any restrictions we talked about:\n{{fit_for_work}}\n\nIf a doctor has given you any advice about what you can and can't do for now, please make sure we have a copy so we can look after you properly and keep the job safe for everyone.\n\nSUPPORT WE'RE PUTTING IN PLACE\n{{support_offered}}\n\nWHAT YOU MISSED WHILE YOU WERE AWAY\n{{catch_up_notes}}\n\nIf anything's unclear, just ask. Better to check than to guess.\n\nNEXT CATCH-UP\nWe'll check in again: {{next_check_in}}\n\nIf something's not sitting right, your health changes, or you're finding it tough to get back into the routine, come and have a yarn with me. My door's open.\n\nGood to have you back.\n\n\nSigned:\n\n_______________________________            _______________________________\n{{managerName}} ({{businessName}})           {{employeeName}}\nDate: {{date}}                              Date: _______________",
    "legalNote": "If the absence was due to illness or a work injury, or there are medical restrictions, get the worker's doctor's clearance in writing and check your obligations under workers compensation and the Fair Work Act before changing their duties."
  },
  {
    "id": "conflict_mediation_summary",
    "name": "Workmate Dispute Sort-Out (mediation summary)",
    "category": "Conflict",
    "purpose": "Use this to write up what was agreed after you've sat two workmates down to sort out a clash, falling-out or ongoing friction.",
    "tone": "calm and even-handed",
    "fields": [
      {
        "id": "other_person",
        "label": "Other person involved",
        "type": "text",
        "required": true,
        "placeholder": "e.g. Sam Patel",
        "help": "The other worker in the dispute.",
        "options": []
      },
      {
        "id": "meeting_date",
        "label": "Date of the sit-down",
        "type": "date",
        "required": true,
        "placeholder": "",
        "help": "When you all met to talk it through.",
        "options": []
      },
      {
        "id": "what_happened",
        "label": "What the disagreement was about",
        "type": "textarea",
        "required": true,
        "placeholder": "Keep it factual and even-handed. e.g. Tension over how jobs were being handed out on site, which boiled over on Tuesday",
        "help": "Stick to the facts, no taking sides.",
        "options": []
      },
      {
        "id": "agreed_actions",
        "label": "What everyone agreed to do",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. Both to keep talk respectful, raise issues with the supervisor not on the floor, daily 5-minute handover",
        "help": "The practical steps going forward.",
        "options": []
      },
      {
        "id": "manager_commitments",
        "label": "What you (the business) agreed to do",
        "type": "textarea",
        "required": false,
        "placeholder": "e.g. Clearer job allocation each morning, check in with both in two weeks",
        "help": "Your part in making it work.",
        "options": []
      },
      {
        "id": "follow_up_date",
        "label": "Follow-up date",
        "type": "date",
        "required": false,
        "placeholder": "",
        "help": "When you'll check the fix is holding.",
        "options": []
      }
    ],
    "body": "WORKMATE DISPUTE - SUMMARY OF OUR SIT-DOWN\n\nBusiness: {{businessName}}\nPrepared by: {{managerName}}\nDate written up: {{date}}\nDate we met: {{meeting_date}}\n\nWho was there:\n- {{employeeName}}\n- {{other_person}}\n- {{managerName}} (sitting in to help sort it out)\n\nWHY WE MET\nThere'd been some friction between {{employeeName}} and {{other_person}}, and we sat down together to talk it through, clear the air and agree a sensible way forward. Everyone got a fair go to have their say.\n\nWHAT THE DISAGREEMENT WAS ABOUT\n{{what_happened}}\n\nThis summary isn't about deciding who was right or wrong. It's about getting things back on track so the crew can work together well and the job runs smoothly.\n\nWHAT WE ALL AGREED\n{{agreed_actions}}\n\nWHAT THE BUSINESS WILL DO\n{{manager_commitments}}\n\nKEEPING IT RESPECTFUL\nBoth {{employeeName}} and {{other_person}} agreed to treat each other with respect, sort small things out early before they grow, and bring anything they can't resolve to {{managerName}} rather than letting it simmer. Everyone deserves a workplace that's safe and free from bullying or harassment, and that's on all of us.\n\nFOLLOW-UP\nWe'll check in on {{follow_up_date}} to make sure things are travelling well. If the agreement isn't holding or something new comes up, come and see {{managerName}} early.\n\nThis is a shared record of what we agreed. Signing just means you've read it and you're on board with giving it a fair go.\n\n\nSigned:\n\n_______________________________\n{{employeeName}}     Date: _______________\n\n_______________________________\n{{other_person}}     Date: _______________\n\n_______________________________\n{{managerName}} ({{businessName}})     Date: {{date}}",
    "legalNote": "If the dispute involves bullying, harassment, discrimination or safety, this is more than a friendly mediation. Treat it seriously, keep it confidential and get advice from an external HR or employment-law adviser before going further."
  },
  {
    "id": "grievance_acknowledgement",
    "name": "We've Got Your Complaint (grievance acknowledgement)",
    "category": "Conflict",
    "purpose": "Use this to confirm in writing that you've received a worker's complaint or concern and to set out what happens next.",
    "tone": "reassuring and fair",
    "fields": [
      {
        "id": "grievance_date",
        "label": "Date the concern was raised",
        "type": "date",
        "required": true,
        "placeholder": "",
        "help": "When they first brought it to you.",
        "options": []
      },
      {
        "id": "grievance_summary",
        "label": "What the concern is about (in their words)",
        "type": "textarea",
        "required": true,
        "placeholder": "Summarise neutrally. e.g. Concern about the way they've been spoken to on site by a workmate",
        "help": "Stay neutral. Don't judge it yet.",
        "options": []
      },
      {
        "id": "how_raised",
        "label": "How it was raised",
        "type": "select",
        "required": false,
        "placeholder": "Pick one",
        "help": "Helps keep the record straight.",
        "options": [
          "In person",
          "By phone",
          "By email or text",
          "In writing (letter or form)"
        ]
      },
      {
        "id": "next_steps",
        "label": "What you'll do next",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. Have a confidential chat with those involved, look into what happened, then come back to you",
        "help": "Be honest about the process, not the outcome.",
        "options": []
      },
      {
        "id": "contact_person",
        "label": "Who they can contact in the meantime",
        "type": "text",
        "required": false,
        "placeholder": "e.g. Me directly, or Jo in the office",
        "help": "Give them a clear point of contact.",
        "options": []
      },
      {
        "id": "expected_timeframe",
        "label": "Rough timeframe to get back to them",
        "type": "text",
        "required": false,
        "placeholder": "e.g. Within the next week or so",
        "help": "An honest, realistic estimate.",
        "options": []
      }
    ],
    "body": "ACKNOWLEDGEMENT OF YOUR CONCERN\n\nBusiness: {{businessName}}\nTo: {{employeeName}}\nFrom: {{managerName}}\nDate: {{date}}\n\nHi {{employeeName}},\n\nThanks for coming to me and raising this. I know it isn't always easy to speak up, and I want you to know it was the right thing to do. This note is to confirm I've received your concern and to let you know what happens from here.\n\nWHAT YOU RAISED\nDate you raised it: {{grievance_date}}\nHow it was raised: {{how_raised}}\n\nAs I understand it, your concern is about:\n{{grievance_summary}}\n\nIf I've got any of that wrong or left something out, please tell me so I can get it right.\n\nWHAT HAPPENS NEXT\n{{next_steps}}\n\nI'll look into this fairly and with an open mind. Everyone involved will get a chance to have their say before any decisions are made, and I'll keep things as private as I reasonably can.\n\nWHEN YOU'LL HEAR BACK\nI'll aim to get back to you: {{expected_timeframe}}\n\nIN THE MEANTIME\nIf you've got questions or anything else comes up, you can contact: {{contact_person}}\n\nYou won't be treated badly for raising this in good faith. That's not how we do things here. If you ever feel that's happening, tell me straight away.\n\nThanks again for trusting me with this.\n\n{{managerName}}\n{{businessName}}",
    "legalNote": "Take every genuine grievance seriously and keep it confidential. If it involves bullying, harassment, discrimination, safety or possible dismissal, get advice from an external HR or employment-law adviser before you act on it."
  },
  {
    "id": "escalation_summary",
    "name": "Time to Step This Up (escalation summary)",
    "category": "Escalation",
    "purpose": "Use this to record that an unresolved issue is being escalated to the owner, a director or an outside adviser before any serious decision is made.",
    "tone": "firm but fair",
    "fields": [
      {
        "id": "issue_type",
        "label": "What kind of issue is this?",
        "type": "select",
        "required": true,
        "placeholder": "Pick the closest fit",
        "help": "Frames the escalation correctly.",
        "options": [
          "Performance",
          "Conduct or behaviour",
          "Unresolved grievance or dispute",
          "Attendance or absence",
          "Other"
        ]
      },
      {
        "id": "background",
        "label": "What's happened so far",
        "type": "textarea",
        "required": true,
        "placeholder": "Plain timeline. e.g. Two informal chats and a first written warning over missed deadlines, still no improvement",
        "help": "The story to date, with dates if you have them.",
        "options": []
      },
      {
        "id": "steps_taken",
        "label": "Steps already taken to fix it",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. Clear expectations set, support and extra training offered, warnings given, chances to improve",
        "help": "Show the fair process you've already run.",
        "options": []
      },
      {
        "id": "escalating_to",
        "label": "Who you're escalating to",
        "type": "text",
        "required": true,
        "placeholder": "e.g. The owner and our external HR adviser",
        "help": "The person or people now stepping in.",
        "options": []
      },
      {
        "id": "why_now",
        "label": "Why it's being escalated now",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. The issue hasn't improved despite a fair go, and we may be heading toward formal action",
        "help": "Be clear and honest about where this could lead.",
        "options": []
      },
      {
        "id": "decision_pending",
        "label": "What decision is being considered",
        "type": "textarea",
        "required": false,
        "placeholder": "e.g. Whether a final warning or further action is warranted, after getting proper advice",
        "help": "Keep it open. No decision is made yet.",
        "options": []
      },
      {
        "id": "advice_sought",
        "label": "Outside advice being sought?",
        "type": "select",
        "required": false,
        "placeholder": "Pick one",
        "help": "Strongly recommended before serious action.",
        "options": [
          "Yes - already engaged",
          "Yes - about to arrange",
          "Not yet, but planned before any decision",
          "No"
        ]
      }
    ],
    "body": "ESCALATION SUMMARY - INTERNAL RECORD\n\nThis is an internal file note. It is not a warning and is not a final decision.\n\nBusiness: {{businessName}}\nPrepared by: {{managerName}}\nDate: {{date}}\nAbout: {{employeeName}}\nType of issue: {{issue_type}}\n\nWHY I'M WRITING THIS\nThis issue hasn't been able to be sorted at my level, so I'm stepping it up to make sure it's handled properly and fairly. Putting it in writing keeps the record straight and protects everyone - {{employeeName}}, the business and me.\n\nWHAT'S HAPPENED SO FAR\n{{background}}\n\nWHAT WE'VE ALREADY DONE TO PUT IT RIGHT\n{{steps_taken}}\n\nThroughout this, the aim has been to be fair: set clear expectations, give honest feedback early, offer support and a genuine chance to improve, and keep dated records along the way.\n\nWHO I'M ESCALATING THIS TO\n{{escalating_to}}\n\nWHY NOW\n{{why_now}}\n\nWHAT'S BEING CONSIDERED\n{{decision_pending}}\n\nTo be clear, no decision has been made yet. The point of escalating is to get a second set of eyes and proper advice before anything serious is decided, so the right and fair thing is done.\n\nOUTSIDE ADVICE\nExternal HR or employment-law advice: {{advice_sought}}\n\nIf this is heading toward a formal warning or dismissal, {{employeeName}} must get a fair process from here: a clear explanation of the concern, a real chance to respond, the right to bring a support person to any formal meeting, and proper advice taken before any final call.\n\nNEXT STEP\nThe owner or director, with outside advice, will review this and decide how to proceed. {{employeeName}} will be kept informed and given a fair say before any decision is made.\n\n\nPrepared by:\n\n_______________________________\n{{managerName}} ({{businessName}})\nDate: {{date}}",
    "legalNote": "This is the point to slow down and get proper help. Before any final warning or dismissal, get advice from the owner or director and an external HR or employment-law adviser, and follow a fair process - including the Small Business Fair Dismissal Code if you have fewer than 15 staff."
  },
  {
    "id": "development_plan",
    "name": "Career & Development Plan",
    "category": "Growth & development",
    "purpose": "A simple plan that maps where a worker is now, where they want to head, and the practical steps and support to help them get there.",
    "tone": "Warm, encouraging and forward-looking. Plain Australian English, short sentences, no jargon.",
    "fields": [
      {
        "id": "current_role",
        "label": "Current role and main jobs",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. 2nd year apprentice carpenter. Framing, fit-outs, lending a hand on small jobs.",
        "help": "In a sentence or two, what does this person do day to day right now?"
      },
      {
        "id": "strengths",
        "label": "What they're already great at",
        "type": "textarea",
        "required": false,
        "placeholder": "e.g. Reliable, great with customers, picks up new tools fast, calm under pressure.",
        "help": "Call out the real strengths. People grow faster when they know what they're already doing well."
      },
      {
        "id": "career_goal",
        "label": "Where they want to head",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. Run their own crew within 3 years, then chase a builder's licence.",
        "help": "What's the bigger goal? Could be a role, a licence, more responsibility, or a whole new direction. Ask them, don't guess."
      },
      {
        "id": "skills_to_build",
        "label": "Skills and tickets to chase",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. EWP ticket, quoting, reading plans, leading a small team, first aid.",
        "help": "List the skills, tickets, courses or licences that get them closer to the goal. Mix a few quick wins with the bigger ones."
      },
      {
        "id": "business_support",
        "label": "How the business will back them",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. We'll pay for the EWP course, pair them with Dave on quoting, give them a lead role on the next small job.",
        "help": "Be specific about what you'll put in: time, money, mentoring, chances to step up. This is your half of the deal."
      },
      {
        "id": "first_steps",
        "label": "First steps and who does what",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. Book the EWP course this month (manager). Shadow Dave on two quotes (worker). Start a logbook of jobs led.",
        "help": "List the first few actions, who owns each one, and roughly when. Keep it small and doable so it actually happens."
      },
      {
        "id": "timeframe",
        "label": "Timeframe for this plan",
        "type": "select",
        "required": true,
        "placeholder": "",
        "help": "How far ahead does this plan look? You can always set a new one once you get there.",
        "options": [
          "3 months",
          "6 months",
          "12 months",
          "2 years"
        ]
      },
      {
        "id": "review_date",
        "label": "Next catch-up to review progress",
        "type": "date",
        "required": true,
        "placeholder": "",
        "help": "Put a real date in the diary now. A plan with no review date tends to fade away."
      }
    ],
    "body": "CAREER & DEVELOPMENT PLAN\n\nFor: {{employeeName}}\nBusiness: {{businessName}}\nManager: {{managerName}}\nDate: {{date}}\nPlan timeframe: {{timeframe}}\n\n---\n\nWHY WE'RE DOING THIS\n\n{{employeeName}}, this plan is about your future here. It sets out where you're at now, where you want to head, and how {{businessName}} is going to help you get there. It's a two-way deal: you put in the effort, and we put in the backing. We'll review it together and adjust as we go. Nothing here is set in stone.\n\nWHERE YOU'RE AT NOW\n\n{{current_role}}\n\nWHAT YOU'RE ALREADY GREAT AT\n\n{{strengths}}\n\nWHERE YOU WANT TO HEAD\n\n{{career_goal}}\n\nSKILLS AND TICKETS TO CHASE\n\nThese are the things that move you closer to that goal:\n\n{{skills_to_build}}\n\nHOW {{businessName}} WILL BACK YOU\n\n{{business_support}}\n\nFIRST STEPS (WHO DOES WHAT)\n\n{{first_steps}}\n\nOUR NEXT CATCH-UP\n\nWe'll sit down on {{review_date}} to see how you're tracking, celebrate the wins, and sort out what's next. If something's getting in the way before then, come and have a chat sooner.\n\nYou've got a real future here, {{employeeName}}. Let's build it.\n\n---\n\nSigned ({{employeeName}}): ______________________   Date: __________\n\nSigned ({{managerName}}, {{businessName}}): ______________________   Date: __________",
    "legalNote": "This is a development plan, not a contract or a promise of a pay rise or promotion. Keep wording about future roles and pay as goals, not guarantees."
  },
  {
    "id": "onboarding_plan",
    "name": "New Starter 30/60/90-Day Plan",
    "category": "Growth & development",
    "purpose": "A clear first-90-days plan that shows a new starter what good looks like, who shows them the ropes, and when you'll check in.",
    "tone": "Warm, welcoming and practical. Plain Australian English, short sentences, no jargon.",
    "fields": [
      {
        "id": "role_title",
        "label": "Their role",
        "type": "text",
        "required": true,
        "placeholder": "e.g. Apprentice electrician",
        "help": "What's the job title or the role in plain terms?"
      },
      {
        "id": "start_date",
        "label": "First day",
        "type": "date",
        "required": true,
        "placeholder": "",
        "help": "The day they start. The check-in dates work back from here."
      },
      {
        "id": "buddy_name",
        "label": "Who shows them the ropes",
        "type": "text",
        "required": true,
        "placeholder": "e.g. Dave (leading hand)",
        "help": "Name the buddy or mentor who'll be their go-to person for questions. Every new starter needs one."
      },
      {
        "id": "inductions_tickets",
        "label": "Inductions, tickets and gear needed",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. Site induction, White Card check, PPE issued, phone and logins set up, first aid briefing.",
        "help": "List the inductions, tickets, licences, gear and logins they need sorted early so they can get going safely."
      },
      {
        "id": "first_30",
        "label": "First 30 days - finding their feet",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. Knows the team, the site rules and where everything lives. Working safely under supervision. Handling basic tasks on their own.",
        "help": "What does good look like by day 30? Keep it about settling in, safety, and learning the basics. Go easy."
      },
      {
        "id": "first_60",
        "label": "First 60 days - hitting their stride",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. Running standard jobs with less supervision. Asking good questions. Pulling their weight on the crew.",
        "help": "By day 60, what should they be doing more confidently and with less hand-holding?"
      },
      {
        "id": "first_90",
        "label": "First 90 days - standing on their own",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. A trusted part of the crew. Owns their tasks. Knows our standards and meets them. Ready to take on more.",
        "help": "By day 90, what does a fully settled, contributing team member look like in this role?"
      },
      {
        "id": "checkin_dates",
        "label": "Check-in dates",
        "type": "textarea",
        "required": false,
        "placeholder": "e.g. Day 7, day 30, day 60, day 90. Plus a quick chat at the end of each week for the first month.",
        "help": "When will you sit down and see how they're going? Regular check-ins early on make a huge difference."
      }
    ],
    "body": "NEW STARTER 30/60/90-DAY PLAN\n\nWelcome: {{employeeName}}\nRole: {{role_title}}\nBusiness: {{businessName}}\nManager: {{managerName}}\nStart date: {{start_date}}\nPrepared: {{date}}\n\n---\n\nWELCOME ABOARD, {{employeeName}}\n\nGreat to have you joining {{businessName}}. This plan lays out your first 90 days so you know what to expect, what good looks like, and who to go to when you've got a question. Nobody expects you to know everything on day one. Take it step by step, ask plenty of questions, and you'll be right.\n\nYOUR GO-TO PERSON\n\n{{buddy_name}} is your buddy. They'll show you the ropes and you can ask them anything, no question is too small. {{managerName}} is also here whenever you need a hand.\n\nGETTING YOU SET UP (FIRST WEEK)\n\nWe'll get these sorted early so you can work safely and get stuck in:\n\n{{inductions_tickets}}\n\nFIRST 30 DAYS - FINDING YOUR FEET\n\n{{first_30}}\n\nFIRST 60 DAYS - HITTING YOUR STRIDE\n\n{{first_60}}\n\nFIRST 90 DAYS - STANDING ON YOUR OWN\n\n{{first_90}}\n\nOUR CHECK-INS\n\nWe'll catch up regularly so you're never left wondering how you're tracking:\n\n{{checkin_dates}}\n\nThese chats go both ways. Tell us what's working, what isn't, and how we can help. We want you to do well here.\n\nWelcome to the team, {{employeeName}}. Let's get you off to a cracking start.\n\n---\n\nSigned ({{employeeName}}): ______________________   Date: __________\n\nSigned ({{managerName}}, {{businessName}}): ______________________   Date: __________",
    "legalNote": "This plan supports a new starter's settling in. It is not an employment contract and does not change any probation terms or notice periods set out in their formal agreement."
  },
  {
    "id": "progression_plan",
    "name": "Progression Plan to Next Classification",
    "category": "Pay & progression",
    "purpose": "Maps out a clear, encouraging path for a team member to move up to their next award classification — the competencies and tests to sign off, the support and timeframe involved, and what it means for their pay. Use it in a development chat so everyone is on the same page about what 'good' looks like and how to get there.",
    "tone": "Warm, encouraging and concrete. Plain-spoken and practical, never vague. Treats progression as something the business actively supports, not a hurdle.",
    "fields": [
      {
        "id": "current_level",
        "label": "Current award classification",
        "type": "select",
        "required": true,
        "placeholder": "Select current level",
        "help": "The level they sit at now under the Manufacturing Award (MA000010).",
        "options": [
          "C14",
          "C13",
          "C12",
          "C11",
          "C10",
          "C9",
          "C8",
          "C7",
          "C6",
          "C5"
        ]
      },
      {
        "id": "target_level",
        "label": "Next classification we're working towards",
        "type": "select",
        "required": true,
        "placeholder": "Select target level",
        "help": "The next step up. Usually one level above their current classification.",
        "options": [
          "C13",
          "C12",
          "C11",
          "C10",
          "C9",
          "C8",
          "C7",
          "C6",
          "C5",
          "C4"
        ]
      },
      {
        "id": "current_role_summary",
        "label": "What they do well now",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. Confidently runs moisture content, particle size distribution and Atterberg limits unsupervised. Reliable on sample prep and field density (sand replacement). Good with paperwork and chain of custody.",
        "help": "A genuine, specific snapshot of their current strengths. Start positive — this is the foundation we're building on."
      },
      {
        "id": "competencies_to_sign_off",
        "label": "Tests and competencies to sign off",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. 1) Demonstrate compaction/Proctor and CBR to NATA standard, 2) Run nuclear densometer field testing unsupervised, 3) Concrete sampling and compressive strength prep, 4) Step towards NATA signatory status for selected soil tests.",
        "help": "List the concrete things to demonstrate to reach the next level. Be specific about the test methods and the standard expected. Number them so progress is easy to track."
      },
      {
        "id": "support_provided",
        "label": "Support we'll provide",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. Paired shifts with a senior technician on CBR, time set aside each fortnight for method reading, internal sign-off checks before any NATA assessment, and coverage of any relevant short course.",
        "help": "Name the practical help — mentoring, paired work, training, study time, who they can go to. Progression is a two-way commitment."
      },
      {
        "id": "review_timeframe",
        "label": "Timeframe and check-in points",
        "type": "text",
        "required": true,
        "placeholder": "e.g. Around 6 months, with a catch-up every 4 weeks and a formal review in December 2026",
        "help": "A realistic window plus when you'll check in along the way. Regular catch-ups keep momentum and surface roadblocks early."
      },
      {
        "id": "pay_impact",
        "label": "What it means for pay",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. Moving from C12 to C11 lifts the base award rate. We'll confirm the exact figure against the current Fair Work pay guide at the time of the move, and the new rate applies from the next pay cycle after sign-off.",
        "help": "Explain the pay change in plain terms. Don't quote a hard figure here unless you've just checked it — confirm against the current Fair Work rate when the move actually happens."
      },
      {
        "id": "first_steps",
        "label": "First steps to start this week",
        "type": "textarea",
        "required": false,
        "placeholder": "e.g. Sit in on Thursday's CBR run with Sam, read AS 1289 method for compaction, and book your first paired field-density shift.",
        "help": "Two or three small, doable actions to build momentum straight away. Optional, but a great way to end the chat on a concrete note."
      }
    ],
    "body": "PROGRESSION PLAN\n\nPrepared for: {{employeeName}}\nPrepared by: {{managerName}}, {{businessName}}\nDate: {{date}}\n\nHi {{employeeName}},\n\nThis plan sets out a clear path for you to step up from {{current_level}} to {{target_level}} under the Manufacturing and Associated Industries Award (MA000010). It's something we want to support you with, and it lays out exactly what we're looking for, the help you'll get, how long we expect it to take, and what it means for your pay.\n\nWHERE YOU'RE AT NOW\n{{current_role_summary}}\n\nThis is a solid base, and it's the reason we're having this conversation.\n\nWHAT WE'RE WORKING TOWARDS: {{target_level}}\nTo reach {{target_level}}, here's what we'd like you to demonstrate and sign off:\n{{competencies_to_sign_off}}\n\nHOW WE'LL SUPPORT YOU\nThis isn't on you alone. Here's what we'll put in place:\n{{support_provided}}\n\nTIMEFRAME AND CHECK-INS\n{{review_timeframe}}\n\nThese catch-ups are a chance to celebrate progress, sort out anything that's getting in the way, and adjust the plan if we need to.\n\nWHAT IT MEANS FOR YOUR PAY\n{{pay_impact}}\n\nFIRST STEPS\n{{first_steps}}\n\nNone of this is set in stone — if your circumstances change or something here doesn't sit right, come and talk to me and we'll work it through together. We're backing you to get there.\n\nKind regards,\n{{managerName}}\n{{businessName}}",
    "legalNote": "Award classifications and minimum pay rates change — most commonly from 1 July each year. Before confirming any pay figure, check the current rate for the relevant classification under the Manufacturing and Associated Industries and Occupations Award (MA000010) at fairwork.gov.au or by calling the Fair Work Infoline on 13 13 94. This plan is a development tool, not a guarantee of a pay rise or promotion."
  },
  {
    "id": "wage_review_outcome",
    "name": "Wage and Classification Review Outcome",
    "category": "Pay & progression",
    "purpose": "A short, respectful letter confirming the outcome of a pay or classification review — whether the result is a move up a level or a clear explanation of what's still needed and when you'll look at it again. Gives the team member certainty and a fair, documented record either way.",
    "tone": "Respectful, clear and human. Decisive without being cold. When the answer is 'not yet', it stays encouraging and gives a genuine path forward rather than leaving someone hanging.",
    "fields": [
      {
        "id": "review_outcome",
        "label": "Outcome of the review",
        "type": "select",
        "required": true,
        "placeholder": "Select the outcome",
        "help": "Choose the result. This sets the tone of the whole letter, so pick the one that genuinely reflects the decision.",
        "options": [
          "Moving up to a higher classification",
          "Pay increase within the same classification",
          "No change at this time — review again later"
        ]
      },
      {
        "id": "current_level",
        "label": "Current classification",
        "type": "select",
        "required": true,
        "placeholder": "Select current level",
        "help": "Their classification under the Manufacturing Award (MA000010) at the time of this review.",
        "options": [
          "C14",
          "C13",
          "C12",
          "C11",
          "C10",
          "C9",
          "C8",
          "C7",
          "C6",
          "C5"
        ]
      },
      {
        "id": "new_level_or_rate",
        "label": "New classification or pay rate (if changing)",
        "type": "text",
        "required": false,
        "placeholder": "e.g. C11, or $XX.XX per hour effective 1 July 2026",
        "help": "Fill this in if pay or level is changing. Leave blank if there's no change. Confirm any figure against the current Fair Work rate before sending."
      },
      {
        "id": "effective_date",
        "label": "Date the change takes effect",
        "type": "date",
        "required": false,
        "placeholder": "Select the effective date",
        "help": "When the new rate or level starts — usually the beginning of the next pay cycle. Leave blank if there's no change."
      },
      {
        "id": "reason_summary",
        "label": "Reason for the outcome",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. Over the past six months you've consistently run compaction and CBR testing to standard and taken on field density work unsupervised, which meets the requirements for C11. OR: You've made strong progress on sample prep, and a couple of the C11 competencies still need signing off before we can confirm the move.",
        "help": "Explain the decision honestly and specifically, tied to what they've actually done. This is the part people remember — make it fair and grounded in real work."
      },
      {
        "id": "whats_needed_next",
        "label": "What's needed and when we'll look again",
        "type": "textarea",
        "required": false,
        "placeholder": "e.g. To reach C11, we'd like to see CBR signed off to NATA standard and one full cycle of unsupervised nuclear densometer testing. Let's set a follow-up review for December 2026.",
        "help": "Important when the answer is 'not yet'. Give a clear, achievable path and a date to revisit, so the conversation ends with hope rather than a closed door. Leave blank for a straightforward move-up."
      },
      {
        "id": "closing_note",
        "label": "Personal closing note",
        "type": "textarea",
        "required": false,
        "placeholder": "e.g. Thanks for the steady, careful work you put in — it doesn't go unnoticed, and I'm glad to be able to confirm this.",
        "help": "A short, genuine line to finish on. Optional, but it makes the letter feel like it came from a person, not a form."
      }
    ],
    "body": "WAGE AND CLASSIFICATION REVIEW — OUTCOME\n\nTo: {{employeeName}}\nFrom: {{managerName}}, {{businessName}}\nDate: {{date}}\n\nHi {{employeeName}},\n\nThank you for taking part in your recent pay and classification review. This letter confirms the outcome.\n\nOUTCOME: {{review_outcome}}\n\nYour current classification is {{current_level}} under the Manufacturing and Associated Industries Award (MA000010).\n\nWhere a change applies, the details are:\nNew classification or rate: {{new_level_or_rate}}\nEffective from: {{effective_date}}\n\nTHE REASONING\n{{reason_summary}}\n\nWHAT'S NEXT\n{{whats_needed_next}}\n\n{{closing_note}}\n\nIf anything here isn't clear, or you'd like to talk it through, my door is open — just let me know a good time.\n\nKind regards,\n{{managerName}}\n{{businessName}}",
    "legalNote": "Minimum pay rates and classification definitions under the Manufacturing and Associated Industries and Occupations Award (MA000010) are reviewed regularly, usually with changes from 1 July each year. Confirm the current minimum rate for the relevant classification at fairwork.gov.au or on the Fair Work Infoline (13 13 94) before stating any figure in this letter. Any agreed rate must be at or above the award minimum for the employee's classification."
  },
  {
    "id": "incident_record",
    "name": "Incident & Root Cause Record",
    "category": "Operations & Risk",
    "purpose": "A calm, factual record of an operational error or near-miss that focuses on the system or process behind it — not on blaming a person. It captures what happened, the lead-up, the true root cause, the fix to stop it happening again, and who owns that fix by when. The aim is to learn and improve, so the same gap doesn't trip up the next person.",
    "tone": "Calm, factual, and blame-free. Plain Australian English. Curious about the system, not the person.",
    "fields": [
      {
        "id": "incident_summary",
        "label": "What happened (in plain terms)",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. A soil sample (job #4127) was logged against the wrong client, so the results report nearly went out to the wrong company.",
        "help": "One or two sentences. Just the facts of what went wrong — no opinions, no blame. Imagine explaining it to a colleague who wasn't there.",
        "options": []
      },
      {
        "id": "when_where",
        "label": "When and where it happened",
        "type": "text",
        "required": true,
        "placeholder": "e.g. Tuesday 17 June, around 2pm, in the sample receiving area",
        "help": "Day, rough time, and the part of the lab or business where it occurred. Approximate is fine.",
        "options": []
      },
      {
        "id": "lead_up",
        "label": "The lead-up — what was going on at the time",
        "type": "textarea",
        "required": false,
        "placeholder": "e.g. End of day, three batches came in at once, the usual logging step was rushed because the courier was waiting.",
        "help": "Set the scene. Was it a busy patch, a handover, a new process, a one-off pressure? This context usually points straight at the real cause.",
        "options": []
      },
      {
        "id": "root_cause",
        "label": "Root cause — the real reason it could happen",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. There's no second check on client matching before a sample is logged, so a single slip isn't caught.",
        "help": "Look past the person to the system. Ask 'why' a few times. Most errors trace back to a missing step, unclear process, gap in training, or a tool that makes the wrong thing easy. That's what we fix.",
        "options": []
      },
      {
        "id": "immediate_action",
        "label": "What was done straight away",
        "type": "textarea",
        "required": false,
        "placeholder": "e.g. Report was held before sending, sample re-logged correctly, client confirmed nothing was sent in error.",
        "help": "Any action taken on the spot to sort it out or limit the impact. Shows the issue was contained.",
        "options": []
      },
      {
        "id": "prevention_fix",
        "label": "The fix to prevent it happening again",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. Add a mandatory second-person client check on the logging sheet; update the sample intake checklist.",
        "help": "Aim at the system, not at telling someone to 'be more careful'. A good fix would have caught the error even on a bad day. Think checklist, double-check, clearer label, better tool, or quick refresher.",
        "options": []
      },
      {
        "id": "owner_and_due",
        "label": "Who owns the fix, and by when",
        "type": "text",
        "required": true,
        "placeholder": "e.g. {{managerName}} to update the intake checklist by Friday 27 June",
        "help": "Name one person responsible and a clear date. A fix without an owner and a date tends not to happen.",
        "options": []
      },
      {
        "id": "severity",
        "label": "How serious was it (this time)",
        "type": "select",
        "required": false,
        "placeholder": "",
        "help": "A rough gauge to help you prioritise. A near-miss can still point to a serious gap worth fixing now.",
        "options": [
          "Near-miss (caught before any impact)",
          "Minor (small impact, easily corrected)",
          "Moderate (noticeable impact, some rework or cost)",
          "Serious (significant impact on a client, safety, or compliance)"
        ]
      }
    ],
    "body": "INCIDENT & ROOT CAUSE RECORD\n\nBusiness: {{businessName}}\nRecorded by: {{managerName}}\nDate recorded: {{date}}\nPerson(s) involved: {{employeeName}}\n\nThis is a factual record made to understand and fix a process gap. It is not a disciplinary document and is not about assigning blame.\n\n--------------------------------------------------\n\nWHAT HAPPENED\n{{incident_summary}}\n\nWHEN & WHERE\n{{when_where}}\n\nHOW SERIOUS (THIS TIME)\n{{severity}}\n\nTHE LEAD-UP\n{{lead_up}}\n\nROOT CAUSE (THE REAL REASON)\n{{root_cause}}\n\nWHAT WE DID STRAIGHT AWAY\n{{immediate_action}}\n\nTHE FIX (TO PREVENT RECURRENCE)\n{{prevention_fix}}\n\nWHO OWNS IT & BY WHEN\n{{owner_and_due}}\n\n--------------------------------------------------\n\nThe goal of this record is to make the right thing the easy thing next time. We fix the system, support the people, and move on.\n\nSigned (manager): {{managerName}}    Date: {{date}}",
    "tone_note": "",
    "legalNote": "This is an internal learning and improvement record, not a disciplinary or performance document — keep it factual and blame-free. If the incident involves a workplace injury, a dangerous occurrence, or a serious risk to health and safety, you may have separate notification duties to your state or territory WHS regulator (e.g. SafeWork) and your insurer — record-keeping here does not replace those. Store it securely and only share on a need-to-know basis. For anything involving potential serious misconduct, significant client harm, or legal exposure, get HR or legal advice before acting."
  },
  {
    "id": "exit_summary",
    "name": "Employee Exit Summary",
    "category": "Offboarding",
    "purpose": "A tidy, respectful wrap-up when someone leaves the business. It captures their last day, a brief and respectful reason for leaving, what work was handed over and to whom, what gear and access were returned, and anything left to follow up. The aim is a clean handover so nothing falls through the cracks and the person leaves on good terms.",
    "tone": "Warm, respectful, and practical. Plain Australian English. Tidy and matter-of-fact, never sour.",
    "fields": [
      {
        "id": "last_day",
        "label": "Last working day",
        "type": "date",
        "required": true,
        "placeholder": "",
        "help": "The person's final day of work. If they have leave or notice running out separately, note that in the follow-ups field.",
        "options": []
      },
      {
        "id": "departure_type",
        "label": "Type of departure",
        "type": "select",
        "required": true,
        "placeholder": "",
        "help": "A simple category for the record. Keep the detail brief and respectful in the next field.",
        "options": [
          "Resignation",
          "End of contract / fixed term",
          "Retirement",
          "Mutual agreement",
          "Redundancy",
          "Other"
        ]
      },
      {
        "id": "reason_brief",
        "label": "Reason for leaving (brief and respectful)",
        "type": "textarea",
        "required": false,
        "placeholder": "e.g. Resigned to take up a role closer to home. Left on good terms.",
        "help": "One or two neutral sentences. No need for detail or commentary — keep it the kind of thing you'd be comfortable for the person to read.",
        "options": []
      },
      {
        "id": "handover_details",
        "label": "What was handed over, and to whom",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. Active client jobs (#4101–#4130) handed to Priya; field schedule and equipment calibration log handed to Tom; supplier contacts shared in the team drive.",
        "help": "List the key work, files, jobs, contacts and responsibilities, and name who has picked each one up. This is the part that saves headaches later.",
        "options": []
      },
      {
        "id": "gear_returned",
        "label": "Gear and access returned",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. Returned: laptop, site phone, keys, swipe card, hi-vis. Disabled: email, lab software login, shared drive access, building alarm code.",
        "help": "Two quick lists — physical gear handed back, and digital access switched off. Don't forget keys, alarm codes, fuel cards, and any shared passwords that should be changed.",
        "options": []
      },
      {
        "id": "final_pay_note",
        "label": "Final pay and entitlements",
        "type": "textarea",
        "required": false,
        "placeholder": "e.g. Final pay including accrued annual leave to be processed in the next pay run. Super up to date.",
        "help": "A short note on final pay, any leave being paid out, and that super is sorted. This is a reminder for you — check the actual figures against the relevant award or agreement.",
        "options": []
      },
      {
        "id": "follow_ups",
        "label": "Anything to follow up",
        "type": "textarea",
        "required": false,
        "placeholder": "e.g. Send separation certificate if requested; remove from client contact list; forward any stray emails to Priya for 30 days.",
        "help": "Loose ends — references, certificates, redirecting email, updating contact lists, or anything promised to the person.",
        "options": []
      },
      {
        "id": "on_good_terms",
        "label": "Leaving on good terms / rehire?",
        "type": "select",
        "required": false,
        "placeholder": "",
        "help": "A quick note for future you. A good leaver today can be a great rehire or referral down the track.",
        "options": [
          "Yes — would happily rehire",
          "Yes — left on good terms",
          "Neutral",
          "Note added in follow-ups"
        ]
      }
    ],
    "body": "EMPLOYEE EXIT SUMMARY\n\nBusiness: {{businessName}}\nEmployee: {{employeeName}}\nPrepared by: {{managerName}}\nDate prepared: {{date}}\n\n--------------------------------------------------\n\nLAST WORKING DAY\n{{last_day}}\n\nTYPE OF DEPARTURE\n{{departure_type}}\n\nREASON FOR LEAVING\n{{reason_brief}}\n\nHANDOVER — WHAT WENT WHERE\n{{handover_details}}\n\nGEAR & ACCESS RETURNED\n{{gear_returned}}\n\nFINAL PAY & ENTITLEMENTS\n{{final_pay_note}}\n\nTO FOLLOW UP\n{{follow_ups}}\n\nLEAVING ON GOOD TERMS / REHIRE\n{{on_good_terms}}\n\n--------------------------------------------------\n\nThanks to {{employeeName}} for their contribution to {{businessName}}. This summary is to ensure a clean, respectful handover.\n\nSigned (manager): {{managerName}}    Date: {{date}}",
    "tone_note": "",
    "legalNote": "Final pay (including any accrued annual leave and applicable notice or redundancy) must be calculated and paid in line with the National Employment Standards and the relevant award or enterprise agreement — check the actual entitlements rather than relying on a note here. Keep the reason for leaving factual and respectful, as the employee may request a copy. For redundancies, dismissals, or any departure that feels contested, get HR or legal advice before finalising, as unfair dismissal and final-entitlement rules may apply. Store this record securely under your privacy obligations."
  }
];
