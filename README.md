# Offsider

**The HR offsider for small Australian businesses too small to have an HR person.**

A manager types in what's going on with a worker — a problem *or* a win — and Offsider walks them
through a fair process step by step (like an "if this → then that" flowchart), spots the documents
they're missing and helps write them, nudges them to check in, and keeps a tidy dated record
including the next escalation step.

It covers the whole people‑management lifecycle, not just problems:

| The hard stuff | The good stuff |
|---|---|
| 📉 Underperformance | 🏆 Recognition / great work |
| ⚠️ Conduct & behaviour | 🌱 Growth, promotion & pay |
| ⏰ Absence & lateness | 🌿 Wellbeing & routine changes |
| ⚖️ Conflict between staff | |

And the whole lifecycle around it:

- **🚀 Career paths** — pick your **industry** (bricklaying, plumbing, electrical, carpentry, landscaping, automotive, fabrication, transport, hospitality, cleaning, or a general ladder) and Offsider loads a real career ladder with the concrete steps — tickets/licences, skills, experience — to climb each rung.
- **📈 Development tracking** — place each worker on the ladder, tick off the steps to their next role, set development goals, and generate a development or onboarding plan.
- **💬 Two‑way feedback** — send a worker a link (text/email, no login) to give feedback on their phone, including **anonymous upward feedback about their manager**, wellbeing pulses, onboarding check‑ins, stay interviews and an anonymous suggestion box.
- **💰 Award + Wage Builder** — load a Modern Award (Manufacturing Award MA000010 ships in `content/awards.js`), map each career rung to a classification level, and show managers the concrete path: *train these competencies → move up a level → earn ~$X more/hr*. Rates are indicative and editable (verify against the current Fair Work pay guide).
- **👤 Staff logins + scheduled check‑ins** — staff get their own login and an inbox of check‑ins pushed on a cadence (weekly pulse, monthly suggestion, quarterly training‑interest). They can also see their own career & pay path. Staff only ever see their own data.
- **🧠 Manager coach** — quick observation **notes** (positive / interest / watch / wellbeing) plus a proactive **Coach** panel that prompts managers to notice and act: "Jess put their hand up — follow it up", "Check in on your new starter", "Good work that hasn't been acknowledged".

Tuned for **Australia** — the guidance follows a genuinely fair process and the spirit of the
Fair Work system and the Small Business Fair Dismissal Code, and the career packs use real
Australian tickets and qualifications (White Card, Certificate III, trade licences). It's general
good‑practice guidance, **not legal advice**.

---

## Run it

Requires **Node.js 18+**.

```bash
npm install
npm start
```

Then open:

- **Marketing site:** http://localhost:4000/
- **The app:** http://localhost:4000/app
- **Manager login:** `demo@offsider.au` / `offsider123`
- **Staff login:** `tom@qualtest.com.au` / `staff1234`

(The demo seeds **Qualtest** — a geotech testing lab in Newcastle on the Manufacturing Award — so the
app isn't empty. Managers and staff see different things. Delete `offsider.db` to wipe it and reseed on
next start. Sign up from the app to create your own business instead.)

To run on a different port: `PORT=8080 npm start`.

---

## What's inside

```
server.js            Express server — marketing site + SPA + JSON API
db.js                SQLite schema (file-based, created on first run)
seed.js              Demo business + workers + sample cases
content/
  flows.js             The 7 guided decision-tree flows (the "HR brain")
  templates.js         18 Australian HR document templates (incl. dev & onboarding plans)
  compliance.js        Fair Work framing, disclaimers, glossary
  industries.js        12 career-ladder packs (incl. Qualtest geotech, award-linked)
  feedbackTemplates.js Feedback + scheduled check-in question sets
  awards.js            Modern Award classification packs + indicative rates
  coaching.js          Manager coaching library (nudges, note types, tips)
  brand.js             Marketing copy
public/
  index.html           Marketing site
  app.html + app.js    The single-page app (manager + staff, vanilla JS, no build)
  feedback.html        Public, no-login worker feedback form (/f/:token)
  styles.css           Design system
```

**Stack:** Node + Express + SQLite (`better-sqlite3`), session‑cookie auth with `bcryptjs`,
and a dependency‑free vanilla‑JS front end. No build step — `npm start` is all it takes.

### How the guided flows work

Each flow in `content/flows.js` is a graph of nodes. A node is one of:

- `intro` – sets the scene
- `question` – branches based on the manager's answer
- `checklist` – "which of these have you actually done?"; any item left unticked offers to generate the missing document
- `document` / `gap_check` – generates a specific document to fill a gap
- `log` – record a dated conversation or check‑in
- `action` – do this next (e.g. book the next check‑in)
- `escalation` – take it up the ladder; can generate a handover summary
- `outcome` – where it lands

To add or tweak guidance you just edit the data in `content/flows.js` and the document templates in
`content/templates.js` — no front‑end changes needed.

---

## Data & privacy

Everything is stored locally in `offsider.db` (SQLite) and scoped per business. Each business is a
separate tenant; managers only ever see their own business's workers, cases and documents.

## Deploy it (host it live)

Offsider's Express server serves the marketing site **and** the app from one place, so it deploys
as a single service to any host that runs Node. (Netlify/static hosts won't work for the app — it
needs a live server + database.)

**Render (recommended, has a free tier):**
1. Push this repo to GitHub.
2. Go to [render.com](https://render.com) → **New → Blueprint** → connect this repo.
3. Render reads `render.yaml`, builds, and gives you a live URL (e.g. `https://offsider.onrender.com`).

The marketing site is at `/`, the app at `/app`. `NODE_ENV=production` enables secure cookies; the
host injects `PORT` automatically.

> **Free-tier data:** the SQLite DB is ephemeral on free plans — it resets to the Qualtest demo on
> each deploy/sleep. To keep real data, switch to a paid plan and uncomment the disk + `DB_PATH`
> block in `render.yaml` (the DB then lives on a persistent disk). Railway and Fly.io work the same
> way — set `DB_PATH` to a path on a mounted volume.

## Notes for going to production

This is a complete, working v1. Before charging paying customers you'd also want: a persistent
session store, the subscription/billing layer (Stripe), password reset, and managed backups. The
app is structured so those slot in without a rewrite.
