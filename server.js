// Offsider — the HR offsider for small Australian businesses.
// Single Express server: marketing site + SPA + JSON API + SQLite. Runs with `npm start`.
const path = require('path');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const { db, init, uid, now, today } = require('./db');
const flows = require('./content/flows');
const templates = require('./content/templates');
const compliance = require('./content/compliance');
const brand = require('./content/brand');
const industries = require('./content/industries');
const feedbackTemplates = require('./content/feedbackTemplates');
const awards = require('./content/awards');
const coaching = require('./content/coaching');
const starterProfiles = require('./content/starterProfiles');
const impactTags = require('./content/impactTags');
const lifecycleRules = require('./content/lifecycleRules');
const reflectionPrompts = require('./content/reflectionPrompts');

const app = express();
const PORT = process.env.PORT || 4000;
const PUBLIC = path.join(__dirname, 'public');

init();

const PROD = process.env.NODE_ENV === 'production';
if (PROD) app.set('trust proxy', 1); // behind the host's HTTPS proxy (Render/Railway/Fly)
app.use(express.json({ limit: '1mb' }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'offsider-dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: PROD, maxAge: 1000 * 60 * 60 * 24 * 30 }
}));

// ---------- helpers ----------
const flowById = (id) => flows.find((f) => f.id === id);
const templateById = (id) => templates.find((t) => t.id === id);
const industryById = (id) => industries.find((i) => i.id === id);
const feedbackTemplateById = (id) => feedbackTemplates.find((t) => t.id === id);
const awardById = (id) => awards.find((a) => a.id === id);
const awardLevel = (awardId, code) => { const a = awardById(awardId); return a ? (a.levels.find((l) => l.id === code) || null) : null; };
const newToken = () => require('crypto').randomBytes(7).toString('hex');

// Build the career + pay picture for one worker (used by manager + staff views).
function buildWageView(e, business) {
  const packId = e.pathway_id || (business && business.industry_id);
  const pack = packId ? industryById(packId) : null;
  if (!pack || !pack.pathway) return null;
  const roles = (pack.pathway.roles || []).slice().sort((a, b) => a.level - b.level);
  const idx = roles.findIndex((r) => r.id === e.current_role);
  const cur = idx >= 0 ? roles[idx] : null;
  const next = idx >= 0 && idx < roles.length - 1 ? roles[idx + 1] : null;
  const aId = pack.awardId || e.award_id || 'manufacturing';
  const award = awardById(aId);
  const curLevel = cur && cur.awardLevel ? awardLevel(aId, cur.awardLevel) : (e.classification ? awardLevel(aId, e.classification) : null);
  const nextLevel = next && next.awardLevel ? awardLevel(aId, next.awardLevel) : null;
  return {
    packId, packName: pack.name, packIcon: pack.icon,
    award: award ? { id: award.id, code: award.code, name: award.shortName, note: award.note, payTool: award.payTool } : null,
    currentRole: cur, nextRole: next, currentLevel: curLevel, nextLevel,
    payRate: e.pay_rate, payBasis: e.pay_basis || 'hour'
  };
}

function periodStart(cadence) {
  const d = new Date();
  if (cadence === 'weekly') { const day = (d.getDay() + 6) % 7; d.setDate(d.getDate() - day); }
  else if (cadence === 'monthly') { d.setDate(1); }
  else if (cadence === 'quarterly') { d.setMonth(Math.floor(d.getMonth() / 3) * 3, 1); }
  else return '1970-01-01';
  return d.toISOString().slice(0, 10);
}

// ---------- lifecycle scheduler ----------
function addDays(iso, n) { const d = new Date(iso + 'T00:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }
function diffDays(a, b) { return Math.round((new Date(a + 'T00:00:00') - new Date(b + 'T00:00:00')) / 86400000); }
function ruleApplies(r, emp, tenureDays) {
  const a = r.applies || {};
  if (a.starterProfiles && a.starterProfiles.length && !a.starterProfiles.includes(emp.starter_profile)) return false;
  if (a.classifications && a.classifications.length && !a.classifications.includes(emp.classification)) return false;
  if (tenureDays != null) {
    if (a.minTenureDays != null && tenureDays < a.minTenureDays) return false;
    if (a.maxTenureDays != null && tenureDays > a.maxTenureDays) return false;
  }
  return true;
}
// Reads a worker's context and returns the moments that are due/upcoming.
function lifecycleSchedule(emp) {
  const t = today();
  const start = emp.start_date || null;
  if (!start) return [];
  const tenureDays = diffDays(t, start);
  const comps = db.prepare('SELECT rule_id, occurrence_key, status FROM lifecycle_completions WHERE employee_id = ?').all(emp.id);
  const done = new Set(comps.filter((c) => c.status === 'done').map((c) => c.rule_id + '|' + c.occurrence_key));
  const skipped = new Set(comps.filter((c) => c.status === 'skipped').map((c) => c.rule_id + '|' + c.occurrence_key));
  const out = [];
  for (const r of lifecycleRules) {
    if (!ruleApplies(r, emp, tenureDays)) continue;
    const tr = r.trigger || {};
    let dueDay, key, idx = 0;
    if (tr.type === 'recurring') {
      const every = tr.everyDays || 30; const anchor = tr.startDay || 0;
      idx = tenureDays < anchor ? 0 : Math.floor((tenureDays - anchor) / every);
      dueDay = anchor + idx * every; key = 'r' + dueDay;
      if (done.has(r.id + '|' + key)) { idx++; dueDay = anchor + idx * every; key = 'r' + dueDay; }
      if (tr.untilDay != null && dueDay > tr.untilDay) continue;
    } else {
      dueDay = tr.days || 0; key = 'd' + dueDay;
    }
    const k = r.id + '|' + key;
    if (skipped.has(k)) continue;
    const dueISO = addDays(start, dueDay);
    const isDone = done.has(k);
    const daysUntil = diffDays(dueISO, t);
    // hide far-future and stale-overdue (e.g. onboarding moments for a 5-year veteran)
    if (!isDone && (daysUntil > 150 || daysUntil < -45)) continue;
    const action = Object.assign({}, r.action);
    if (action.kind === 'reflection' && reflectionPrompts.length) action.reflectionId = reflectionPrompts[idx % reflectionPrompts.length].id;
    out.push({ rule_id: r.id, occurrence_key: key, title: r.title, detail: r.detail, stage: r.stage, owner: r.owner, action, due: dueISO, daysUntil, done: isDone });
  }
  out.sort((a, b) => (a.due < b.due ? -1 : 1));
  return out;
}

function fillTemplate(body, data) {
  return String(body || '').replace(/{{\s*([\w.]+)\s*}}/g, (_, key) => {
    const v = data[key];
    return v === undefined || v === null ? '' : String(v);
  });
}

function currentUser(req) {
  if (!req.session.userId) return null;
  return db.prepare('SELECT id, business_id, name, email, role, employee_id FROM users WHERE id = ?').get(req.session.userId) || null;
}

function requireAuth(req, res, next) {
  const user = currentUser(req);
  if (!user) return res.status(401).json({ error: 'Not signed in' });
  req.user = user;
  req.business = db.prepare('SELECT * FROM businesses WHERE id = ?').get(user.business_id);
  next();
}
function requireManager(req, res, next) {
  if (req.user && req.user.role === 'staff') return res.status(403).json({ error: 'This part of Offsider is for managers.' });
  next();
}

function publicUser(u, biz) {
  return { id: u.id, name: u.name, email: u.email, role: u.role, employee_id: u.employee_id || null, business: { id: biz.id, name: biz.name, industry: biz.industry, industry_id: biz.industry_id || null, plan: biz.plan } };
}

function caseView(c) {
  const emp = db.prepare('SELECT * FROM employees WHERE id = ?').get(c.employee_id) || {};
  const events = db.prepare('SELECT * FROM events WHERE case_id = ? ORDER BY COALESCE(occurred_at, created_at) DESC').all(c.id).map((ev) => ({ ...ev, tags: safeParse(ev.tags, []) }));
  const docs = db.prepare('SELECT id, template_id, title, created_at FROM documents WHERE case_id = ? ORDER BY created_at DESC').all(c.id);
  return {
    ...c,
    state: safeParse(c.state, {}),
    employee: { id: emp.id, name: emp.name, job_title: emp.job_title },
    flow: flowById(c.flow_id) || null,
    events,
    documents: docs
  };
}

function safeParse(s, fallback) { if (s == null || s === '') return fallback; try { const v = JSON.parse(s); return v == null ? fallback : v; } catch (e) { return fallback; } }

// ---------- auth routes ----------
app.post('/api/auth/signup', (req, res) => {
  const { businessName, industry, name, email, password } = req.body || {};
  if (!businessName || !name || !email || !password) return res.status(400).json({ error: 'Please fill in every field.' });
  if (String(password).length < 8) return res.status(400).json({ error: 'Use a password of at least 8 characters.' });
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(String(email).toLowerCase());
  if (existing) return res.status(409).json({ error: 'That email is already signed up. Try logging in.' });

  const bizId = uid();
  db.prepare('INSERT INTO businesses (id, name, industry, region, plan, created_at) VALUES (?,?,?,?,?,?)')
    .run(bizId, businessName, industry || null, 'AU', 'trial', now());
  const userId = uid();
  db.prepare('INSERT INTO users (id, business_id, name, email, password_hash, role, created_at) VALUES (?,?,?,?,?,?,?)')
    .run(userId, bizId, name, String(email).toLowerCase(), bcrypt.hashSync(password, 10), 'owner', now());

  req.session.userId = userId;
  const biz = db.prepare('SELECT * FROM businesses WHERE id = ?').get(bizId);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  res.json({ user: publicUser(user, biz) });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(String(email || '').toLowerCase());
  if (!user || !bcrypt.compareSync(password || '', user.password_hash)) {
    return res.status(401).json({ error: 'Email or password is not right.' });
  }
  req.session.userId = user.id;
  const biz = db.prepare('SELECT * FROM businesses WHERE id = ?').get(user.business_id);
  res.json({ user: publicUser(user, biz) });
});

app.post('/api/auth/logout', (req, res) => { req.session.destroy(() => res.json({ ok: true })); });

app.get('/api/auth/me', (req, res) => {
  const user = currentUser(req);
  if (!user) return res.status(401).json({ error: 'Not signed in' });
  const biz = db.prepare('SELECT * FROM businesses WHERE id = ?').get(user.business_id);
  const full = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  res.json({ user: publicUser(full, biz) });
});

// ---------- content routes ----------
app.get('/api/flows', (req, res) => {
  res.json(flows.map((f) => ({ id: f.id, name: f.name, blurb: f.blurb, sentiment: f.sentiment, category: f.category, icon: f.icon })));
});
app.get('/api/flows/:id', (req, res) => {
  const f = flowById(req.params.id);
  if (!f) return res.status(404).json({ error: 'Unknown flow' });
  res.json(f);
});
app.get('/api/templates', (req, res) => {
  res.json(templates.map((t) => ({ id: t.id, name: t.name, category: t.category, purpose: t.purpose, tone: t.tone, fields: t.fields })));
});
app.get('/api/templates/:id', (req, res) => {
  const t = templateById(req.params.id);
  if (!t) return res.status(404).json({ error: 'Unknown template' });
  res.json({ id: t.id, name: t.name, category: t.category, purpose: t.purpose, tone: t.tone, fields: t.fields, legalNote: t.legalNote });
});
app.get('/api/compliance', (req, res) => res.json(compliance));
app.get('/api/brand', (req, res) => res.json(brand));

// ---------- PUBLIC feedback (no login — a worker filling in a shared link) ----------
app.get('/api/public/feedback/:token', (req, res) => {
  const fr = db.prepare('SELECT * FROM feedback_requests WHERE token = ?').get(req.params.token);
  if (!fr) return res.status(404).json({ error: 'This feedback link is not valid.' });
  const tmpl = feedbackTemplateById(fr.template_id);
  if (!tmpl) return res.status(404).json({ error: 'This feedback form is no longer available.' });
  const biz = db.prepare('SELECT name FROM businesses WHERE id = ?').get(fr.business_id) || {};
  const emp = fr.employee_id ? db.prepare('SELECT name FROM employees WHERE id = ?').get(fr.employee_id) : null;
  res.json({
    title: fr.title || tmpl.name,
    intro: tmpl.intro || '',
    audience: fr.audience,
    anonymous: !!fr.anonymous,
    closed: fr.status === 'closed',
    businessName: biz.name || '',
    employeeName: emp ? emp.name : null,
    questions: tmpl.questions || []
  });
});
app.post('/api/public/feedback/:token', (req, res) => {
  const fr = db.prepare('SELECT * FROM feedback_requests WHERE token = ?').get(req.params.token);
  if (!fr) return res.status(404).json({ error: 'This feedback link is not valid.' });
  if (fr.status === 'closed') return res.status(410).json({ error: 'This feedback form is closed.' });
  const { answers, submitted_by } = req.body || {};
  if (!answers || typeof answers !== 'object') return res.status(400).json({ error: 'No answers were sent.' });
  db.prepare('INSERT INTO feedback_responses (id, request_id, business_id, answers, anonymous, submitted_by, submitted_at) VALUES (?,?,?,?,?,?,?)')
    .run(uid(), fr.id, fr.business_id, JSON.stringify(answers), fr.anonymous ? 1 : 0, (fr.anonymous ? null : (submitted_by || null)), now());
  res.json({ ok: true });
});

// ---------- everything below requires a login ----------
app.use('/api', requireAuth);

// ---------- STAFF self-service (any logged-in user, incl. staff logins) ----------
function myEmployee(req) {
  return req.user.employee_id ? db.prepare('SELECT * FROM employees WHERE id = ? AND business_id = ?').get(req.user.employee_id, req.business.id) : null;
}
app.get('/api/me', (req, res) => {
  const e = myEmployee(req);
  if (!e) return res.json({ role: req.user.role, name: req.user.name, employee: null });
  const dev = safeParse(e.development, {});
  const wage = buildWageView(e, req.business);
  const pending = db.prepare("SELECT COUNT(*) c FROM feedback_requests WHERE business_id = ? AND status = 'open' AND (employee_id = ? OR employee_id IS NULL)").get(req.business.id, e.id).c;
  res.json({
    role: req.user.role, name: req.user.name, business: { name: req.business.name },
    employee: { id: e.id, name: e.name, job_title: e.job_title, employment_type: e.employment_type, start_date: e.start_date, development: dev, current_role: e.current_role, pay_rate: e.pay_rate },
    wage, pending
  });
});
app.get('/api/me/assignments', (req, res) => {
  const e = myEmployee(req); if (!e) return res.json([]);
  const reqs = db.prepare("SELECT * FROM feedback_requests WHERE business_id = ? AND status = 'open' AND (employee_id = ? OR employee_id IS NULL) ORDER BY created_at DESC").all(req.business.id, e.id);
  res.json(reqs.map((r) => {
    const t = feedbackTemplateById(r.template_id) || { questions: [] };
    let completed = false;
    if (!r.anonymous) {
      const since = periodStart(r.cadence || 'once');
      completed = db.prepare('SELECT COUNT(*) c FROM feedback_responses WHERE request_id = ? AND submitted_by = ? AND substr(submitted_at,1,10) >= ?').get(r.id, e.name, since).c > 0;
    }
    return { id: r.id, title: r.title || t.name, audience: r.audience, cadence: r.cadence || 'once', anonymous: !!r.anonymous, intro: t.intro || '', questions: t.questions || [], completed };
  }));
});
app.post('/api/me/assignments/:id', (req, res) => {
  const e = myEmployee(req); if (!e) return res.status(400).json({ error: 'No worker profile linked to this login.' });
  const r = db.prepare('SELECT * FROM feedback_requests WHERE id = ? AND business_id = ?').get(req.params.id, req.business.id);
  if (!r || (r.employee_id && r.employee_id !== e.id)) return res.status(404).json({ error: 'Not found' });
  const { answers } = req.body || {};
  db.prepare('INSERT INTO feedback_responses (id, request_id, business_id, answers, anonymous, submitted_by, submitted_at) VALUES (?,?,?,?,?,?,?)')
    .run(uid(), r.id, req.business.id, JSON.stringify(answers || {}), r.anonymous ? 1 : 0, r.anonymous ? null : e.name, now());
  res.json({ ok: true });
});

// ---------- everything below is MANAGERS ONLY ----------
app.use('/api', requireManager);

// employees
app.get('/api/employees', (req, res) => {
  const rows = db.prepare('SELECT * FROM employees WHERE business_id = ? ORDER BY name').all(req.business.id);
  const out = rows.map((e) => {
    const open = db.prepare("SELECT COUNT(*) c FROM cases WHERE employee_id = ? AND status NOT IN ('resolved')").get(e.id).c;
    return { ...e, open_cases: open };
  });
  res.json(out);
});
app.post('/api/employees', (req, res) => {
  const { name, job_title, employment_type, start_date, starter_profile } = req.body || {};
  if (!name) return res.status(400).json({ error: 'A name is needed.' });
  const id = uid();
  db.prepare('INSERT INTO employees (id, business_id, name, job_title, employment_type, start_date, status, pathway_id, starter_profile, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)')
    .run(id, req.business.id, name, job_title || null, employment_type || null, start_date || null, 'active', req.business.industry_id || null, starter_profile || null, now());
  res.json(db.prepare('SELECT * FROM employees WHERE id = ?').get(id));
});
app.get('/api/employees/:id', (req, res) => {
  const e = db.prepare('SELECT * FROM employees WHERE id = ? AND business_id = ?').get(req.params.id, req.business.id);
  if (!e) return res.status(404).json({ error: 'Not found' });
  const cases = db.prepare('SELECT * FROM cases WHERE employee_id = ? ORDER BY updated_at DESC').all(e.id);
  const documents = db.prepare('SELECT id, template_id, title, created_at FROM documents WHERE employee_id = ? ORDER BY created_at DESC').all(e.id);
  const notes = db.prepare('SELECT * FROM notes WHERE employee_id = ? ORDER BY created_at DESC').all(e.id).map((n) => ({ ...n, tags: safeParse(n.tags, []) }));
  const hasLogin = !!db.prepare('SELECT id FROM users WHERE employee_id = ?').get(e.id);
  const wage = buildWageView(e, req.business);
  const schedule = lifecycleSchedule(e);
  res.json({ ...e, development: safeParse(e.development, {}), cases, documents, notes, wage, hasLogin, schedule });
});
app.patch('/api/employees/:id', (req, res) => {
  const e = db.prepare('SELECT * FROM employees WHERE id = ? AND business_id = ?').get(req.params.id, req.business.id);
  if (!e) return res.status(404).json({ error: 'Not found' });
  const { name, job_title, employment_type, start_date, status, pathway_id, current_role, development, award_id, classification, pay_rate, pay_basis, starter_profile } = req.body || {};
  db.prepare('UPDATE employees SET name=?, job_title=?, employment_type=?, start_date=?, status=?, pathway_id=?, current_role=?, development=?, award_id=?, classification=?, pay_rate=?, pay_basis=?, starter_profile=? WHERE id=?')
    .run(
      name ?? e.name, job_title ?? e.job_title, employment_type ?? e.employment_type, start_date ?? e.start_date, status ?? e.status,
      pathway_id !== undefined ? pathway_id : e.pathway_id,
      current_role !== undefined ? current_role : e.current_role,
      development !== undefined ? JSON.stringify(development) : e.development,
      award_id !== undefined ? award_id : e.award_id,
      classification !== undefined ? classification : e.classification,
      pay_rate !== undefined ? pay_rate : e.pay_rate,
      pay_basis !== undefined ? pay_basis : e.pay_basis,
      starter_profile !== undefined ? starter_profile : e.starter_profile,
      e.id
    );
  const out = db.prepare('SELECT * FROM employees WHERE id = ?').get(e.id);
  res.json({ ...out, development: safeParse(out.development, {}), wage: buildWageView(out, req.business) });
});

// observation notes against a worker (the "recognise issues AND positives" habit)
app.post('/api/employees/:id/notes', (req, res) => {
  const e = db.prepare('SELECT * FROM employees WHERE id = ? AND business_id = ?').get(req.params.id, req.business.id);
  if (!e) return res.status(404).json({ error: 'Not found' });
  const { kind, body, tags, occurred_at } = req.body || {};
  if (!body) return res.status(400).json({ error: 'Write a quick note.' });
  const id = uid();
  db.prepare('INSERT INTO notes (id, business_id, employee_id, kind, body, tags, occurred_at, created_by, created_at) VALUES (?,?,?,?,?,?,?,?,?)')
    .run(id, req.business.id, e.id, kind || 'general', body, (tags && tags.length) ? JSON.stringify(tags) : null, occurred_at || today(), req.user.id, now());
  res.json(db.prepare('SELECT * FROM notes WHERE id = ?').get(id));
});
app.delete('/api/notes/:id', (req, res) => {
  db.prepare('DELETE FROM notes WHERE id = ? AND business_id = ?').run(req.params.id, req.business.id);
  res.json({ ok: true });
});

// create a staff login for a worker (so they can do check-ins + see their wage path)
app.post('/api/employees/:id/login', (req, res) => {
  const e = db.prepare('SELECT * FROM employees WHERE id = ? AND business_id = ?').get(req.params.id, req.business.id);
  if (!e) return res.status(404).json({ error: 'Not found' });
  const { email, password } = req.body || {};
  if (!email || !password || String(password).length < 6) return res.status(400).json({ error: 'Need an email and a password of at least 6 characters.' });
  if (db.prepare('SELECT id FROM users WHERE email = ?').get(String(email).toLowerCase())) return res.status(409).json({ error: 'That email is already in use.' });
  db.prepare('INSERT INTO users (id, business_id, name, email, password_hash, role, employee_id, created_at) VALUES (?,?,?,?,?,?,?,?)')
    .run(uid(), req.business.id, e.name, String(email).toLowerCase(), bcrypt.hashSync(password, 10), 'staff', e.id, now());
  res.json({ ok: true, email: String(email).toLowerCase() });
});

// award classification packs (for the wage builder)
app.get('/api/awards/:id', (req, res) => {
  const a = awardById(req.params.id);
  if (!a) return res.status(404).json({ error: 'Unknown award' });
  res.json(a);
});

// coaching: proactive nudges + note types + tips
app.get('/api/note-types', (req, res) => res.json({ noteTypes: coaching.noteTypes || [], tips: coaching.coachingTips || [] }));
app.get('/api/coach', (req, res) => {
  const bid = req.business.id;
  const emps = db.prepare("SELECT * FROM employees WHERE business_id = ? AND status = 'active'").all(bid);
  const lib = {}; (coaching.nudges || []).forEach((n) => { lib[n.id] = n; });
  const t = today();
  const daysAgo = (d) => (d ? Math.round((new Date(t) - new Date(String(d).slice(0, 10))) / 86400000) : 9999);
  const out = [];
  const mk = (id, e, extra) => { const n = lib[id]; if (!n) return; const first = (e.name || '').split(' ')[0]; const sub = (s) => String(s || '').replace(/\{name\}/g, first); out.push({ id, employee_id: e.id, employee_name: e.name, title: sub(n.title), prompt: sub(n.prompt), why: n.why, tone: n.tone, action: n.action, extra: extra || null }); };
  for (const e of emps) {
    const lastNote = db.prepare('SELECT MAX(created_at) m FROM notes WHERE employee_id = ?').get(e.id).m;
    const lastEvent = db.prepare('SELECT MAX(COALESCE(ev.occurred_at, ev.created_at)) m FROM events ev JOIN cases c ON c.id = ev.case_id WHERE c.employee_id = ?').get(e.id).m;
    const lastTouch = [lastNote, lastEvent].filter(Boolean).sort().pop();
    const interest = db.prepare("SELECT * FROM notes WHERE employee_id = ? AND kind = 'interest' ORDER BY created_at DESC LIMIT 1").get(e.id);
    const positive = db.prepare("SELECT * FROM notes WHERE employee_id = ? AND kind = 'positive' ORDER BY created_at DESC LIMIT 1").get(e.id);
    const dev = safeParse(e.development, {}); const goals = dev.goals || []; const skills = dev.skills || {};
    if (daysAgo(e.start_date) <= 45) mk('new_starter', e);
    else if (daysAgo(lastTouch) >= 28) mk('stale_checkin', e);
    if (interest && daysAgo(interest.created_at) >= 10) mk('interest_unactioned', e, interest.body);
    if (positive && daysAgo(positive.created_at) <= 21 && db.prepare("SELECT COUNT(*) c FROM cases WHERE employee_id = ? AND flow_id = 'recognition'").get(e.id).c === 0) mk('recognise_positive', e);
    const wage = buildWageView(e, req.business);
    if (wage && wage.currentRole && wage.nextRole) {
      const steps = wage.currentRole.stepsToNext || [];
      if (steps.length) { const done = steps.filter((s, i) => skills[wage.currentRole.id + ':' + i]).length; if (done / steps.length >= 0.6) mk('near_level_up', e); }
    }
    if (daysAgo(e.start_date) >= 730 && goals.length === 0) mk('same_role_long', e);
  }
  res.json({ nudges: out.slice(0, 8), tips: coaching.coachingTips || [] });
});

// lifecycle scheduler — what's coming up across the team
app.get('/api/lifecycle', (req, res) => {
  const emps = db.prepare("SELECT * FROM employees WHERE business_id = ? AND status = 'active'").all(req.business.id);
  const items = [];
  for (const e of emps) {
    let n = 0;
    for (const m of lifecycleSchedule(e)) {
      if (!m.done && m.daysUntil <= 14) { items.push(Object.assign({}, m, { employee_id: e.id, employee_name: e.name })); if (++n >= 3) break; }
    }
  }
  items.sort((a, b) => (a.due < b.due ? -1 : 1));
  res.json(items.slice(0, 12));
});
app.post('/api/lifecycle/done', (req, res) => {
  const { employee_id, rule_id, occurrence_key, status } = req.body || {};
  const e = db.prepare('SELECT id FROM employees WHERE id = ? AND business_id = ?').get(employee_id, req.business.id);
  if (!e) return res.status(404).json({ error: 'Not found' });
  db.prepare('INSERT INTO lifecycle_completions (id, business_id, employee_id, rule_id, occurrence_key, status, created_by, created_at) VALUES (?,?,?,?,?,?,?,?)')
    .run(uid(), req.business.id, employee_id, rule_id, occurrence_key, status === 'skipped' ? 'skipped' : 'done', req.user.id, now());
  res.json({ ok: true });
});
// a manager reflection on a worker -> each answer becomes a note that feeds the coach
app.post('/api/employees/:id/reflection', (req, res) => {
  const e = db.prepare('SELECT * FROM employees WHERE id = ? AND business_id = ?').get(req.params.id, req.business.id);
  if (!e) return res.status(404).json({ error: 'Not found' });
  const { reflectionId, answers, rule_id, occurrence_key } = req.body || {};
  const set = reflectionPrompts.find((r) => r.id === reflectionId);
  if (!set) return res.status(400).json({ error: 'Unknown reflection' });
  let saved = 0;
  for (const q of set.questions) {
    const v = (answers || {})[q.id];
    if (v && String(v).trim()) {
      db.prepare('INSERT INTO notes (id, business_id, employee_id, kind, body, occurred_at, created_by, created_at) VALUES (?,?,?,?,?,?,?,?)')
        .run(uid(), req.business.id, e.id, q.noteKind || 'general', String(v).trim(), today(), req.user.id, now());
      saved++;
    }
  }
  if (rule_id && occurrence_key) {
    db.prepare('INSERT INTO lifecycle_completions (id, business_id, employee_id, rule_id, occurrence_key, status, created_by, created_at) VALUES (?,?,?,?,?,?,?,?)')
      .run(uid(), req.business.id, e.id, rule_id, occurrence_key, 'done', req.user.id, now());
  }
  res.json({ ok: true, notes: saved });
});

// generate a development/onboarding document tied to a worker (no case needed)
app.post('/api/employees/:id/documents', (req, res) => {
  const e = db.prepare('SELECT * FROM employees WHERE id = ? AND business_id = ?').get(req.params.id, req.business.id);
  if (!e) return res.status(404).json({ error: 'Not found' });
  const { template_id, fields } = req.body || {};
  const tmpl = templateById(template_id);
  if (!tmpl) return res.status(400).json({ error: 'Unknown document' });
  const data = {
    ...(fields || {}),
    employeeName: e.name || '', employeeRole: e.job_title || '',
    businessName: req.business.name, managerName: req.user.name, date: today()
  };
  const content = fillTemplate(tmpl.body, data);
  const id = uid();
  const title = `${tmpl.name} — ${e.name || ''}`.trim();
  db.prepare('INSERT INTO documents (id, case_id, employee_id, business_id, template_id, title, fields, content, created_by, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)')
    .run(id, null, e.id, req.business.id, tmpl.id, title, JSON.stringify(fields || {}), content, req.user.id, now());
  res.json(db.prepare('SELECT * FROM documents WHERE id = ?').get(id));
});

// config: business-impact tags + new-starter profiles
app.get('/api/config', (req, res) => res.json({ impactTags, starterProfiles, reflectionPrompts }));

// industries / career packs
app.get('/api/industries', (req, res) => {
  res.json(industries.map((i) => ({ id: i.id, name: i.name, icon: i.icon, blurb: i.blurb, roles: (i.pathway && i.pathway.roles || []).length })));
});
app.get('/api/industries/:id', (req, res) => {
  const i = industryById(req.params.id);
  if (!i) return res.status(404).json({ error: 'Unknown industry' });
  res.json(i);
});

// business settings
app.patch('/api/business', (req, res) => {
  const { name, industry, industry_id } = req.body || {};
  const b = req.business;
  db.prepare('UPDATE businesses SET name=?, industry=?, industry_id=? WHERE id=?')
    .run(name ?? b.name, industry ?? b.industry, industry_id !== undefined ? industry_id : b.industry_id, b.id);
  const out = db.prepare('SELECT * FROM businesses WHERE id = ?').get(b.id);
  res.json(out);
});

// feedback — manager side
app.get('/api/feedback/templates', (req, res) => {
  res.json(feedbackTemplates.map((t) => ({ id: t.id, name: t.name, audience: t.audience, cadence: t.cadence || 'once', purpose: t.purpose, anonymous_default: !!t.anonymous_default, questions: t.questions })));
});
app.get('/api/feedback/requests', (req, res) => {
  const rows = db.prepare('SELECT * FROM feedback_requests WHERE business_id = ? ORDER BY created_at DESC').all(req.business.id);
  res.json(rows.map((r) => {
    const emp = r.employee_id ? db.prepare('SELECT name FROM employees WHERE id = ?').get(r.employee_id) : null;
    const count = db.prepare('SELECT COUNT(*) c FROM feedback_responses WHERE request_id = ?').get(r.id).c;
    return { id: r.id, title: r.title, audience: r.audience, cadence: r.cadence || 'once', token: r.token, anonymous: !!r.anonymous, status: r.status, employee_name: emp ? emp.name : null, responses: count, created_at: r.created_at };
  }));
});
app.post('/api/feedback/requests', (req, res) => {
  const { template_id, employee_id, anonymous } = req.body || {};
  const tmpl = feedbackTemplateById(template_id);
  if (!tmpl) return res.status(400).json({ error: 'Pick a feedback type.' });
  let emp = null;
  if (employee_id) emp = db.prepare('SELECT * FROM employees WHERE id = ? AND business_id = ?').get(employee_id, req.business.id);
  const id = uid();
  const token = newToken();
  const anon = anonymous === undefined ? (tmpl.anonymous_default ? 1 : 0) : (anonymous ? 1 : 0);
  const cadence = (req.body && req.body.cadence) || tmpl.cadence || 'once';
  const title = tmpl.name + (emp ? ' — ' + emp.name : '');
  db.prepare('INSERT INTO feedback_requests (id, business_id, employee_id, template_id, audience, title, token, anonymous, status, cadence, created_by, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
    .run(id, req.business.id, emp ? emp.id : null, tmpl.id, tmpl.audience, title, token, anon, 'open', cadence, req.user.id, now());
  res.json({ id, token, title, anonymous: !!anon, cadence });
});
app.get('/api/feedback/requests/:id', (req, res) => {
  const r = db.prepare('SELECT * FROM feedback_requests WHERE id = ? AND business_id = ?').get(req.params.id, req.business.id);
  if (!r) return res.status(404).json({ error: 'Not found' });
  const tmpl = feedbackTemplateById(r.template_id) || { questions: [] };
  const emp = r.employee_id ? db.prepare('SELECT name FROM employees WHERE id = ?').get(r.employee_id) : null;
  const responses = db.prepare('SELECT * FROM feedback_responses WHERE request_id = ? ORDER BY submitted_at DESC').all(r.id)
    .map((x) => ({ id: x.id, answers: safeParse(x.answers, {}), anonymous: !!x.anonymous, submitted_by: x.submitted_by, submitted_at: x.submitted_at }));
  res.json({ id: r.id, title: r.title, audience: r.audience, token: r.token, anonymous: !!r.anonymous, status: r.status, employee_name: emp ? emp.name : null, template: { id: tmpl.id, name: tmpl.name, intro: tmpl.intro, questions: tmpl.questions || [] }, responses });
});
app.patch('/api/feedback/requests/:id', (req, res) => {
  const r = db.prepare('SELECT * FROM feedback_requests WHERE id = ? AND business_id = ?').get(req.params.id, req.business.id);
  if (!r) return res.status(404).json({ error: 'Not found' });
  const { status } = req.body || {};
  db.prepare('UPDATE feedback_requests SET status=? WHERE id=?').run(status || r.status, r.id);
  res.json({ ok: true });
});

// cases
app.get('/api/cases', (req, res) => {
  const rows = db.prepare('SELECT * FROM cases WHERE business_id = ? ORDER BY updated_at DESC').all(req.business.id);
  res.json(rows.map((c) => {
    const emp = db.prepare('SELECT name, job_title FROM employees WHERE id = ?').get(c.employee_id) || {};
    const f = flowById(c.flow_id);
    return { ...c, state: undefined, employee_name: emp.name, employee_title: emp.job_title, flow_name: f ? f.name : c.flow_id, flow_icon: f ? f.icon : '' };
  }));
});
app.post('/api/cases', (req, res) => {
  const { employee_id, flow_id, title } = req.body || {};
  const emp = db.prepare('SELECT * FROM employees WHERE id = ? AND business_id = ?').get(employee_id, req.business.id);
  const flow = flowById(flow_id);
  if (!emp || !flow) return res.status(400).json({ error: 'Pick a worker and a situation.' });
  const id = uid();
  db.prepare('INSERT INTO cases (id, business_id, employee_id, flow_id, title, sentiment, status, current_node, state, created_by, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
    .run(id, req.business.id, emp.id, flow.id, title || `${flow.name} — ${emp.name}`, flow.sentiment, 'open', flow.startNode, '{}', req.user.id, now(), now());
  db.prepare('INSERT INTO events (id, case_id, business_id, kind, summary, occurred_at, created_by, created_at) VALUES (?,?,?,?,?,?,?,?)')
    .run(uid(), id, req.business.id, 'system', `Case opened: ${flow.name}`, today(), req.user.id, now());
  res.json(caseView(db.prepare('SELECT * FROM cases WHERE id = ?').get(id)));
});
app.get('/api/cases/:id', (req, res) => {
  const c = db.prepare('SELECT * FROM cases WHERE id = ? AND business_id = ?').get(req.params.id, req.business.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  res.json(caseView(c));
});
app.patch('/api/cases/:id', (req, res) => {
  const c = db.prepare('SELECT * FROM cases WHERE id = ? AND business_id = ?').get(req.params.id, req.business.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  const { state, current_node, status, title, next_check_in } = req.body || {};
  db.prepare('UPDATE cases SET state=?, current_node=?, status=?, title=?, next_check_in=?, updated_at=? WHERE id=?')
    .run(
      state !== undefined ? JSON.stringify(state) : c.state,
      current_node !== undefined ? current_node : c.current_node,
      status || c.status,
      title || c.title,
      next_check_in !== undefined ? next_check_in : c.next_check_in,
      now(), c.id
    );
  res.json(caseView(db.prepare('SELECT * FROM cases WHERE id = ?').get(c.id)));
});

// timeline events
app.post('/api/cases/:id/events', (req, res) => {
  const c = db.prepare('SELECT * FROM cases WHERE id = ? AND business_id = ?').get(req.params.id, req.business.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  const { kind, summary, detail, occurred_at, tags } = req.body || {};
  if (!summary) return res.status(400).json({ error: 'Add a short note of what happened.' });
  const id = uid();
  db.prepare('INSERT INTO events (id, case_id, business_id, kind, summary, detail, occurred_at, tags, created_by, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)')
    .run(id, c.id, req.business.id, kind || 'note', summary, detail || null, occurred_at || today(), (tags && tags.length) ? JSON.stringify(tags) : null, req.user.id, now());
  db.prepare('UPDATE cases SET updated_at=? WHERE id=?').run(now(), c.id);
  res.json(db.prepare('SELECT * FROM events WHERE id = ?').get(id));
});

// generate a document from a template
app.post('/api/cases/:id/documents', (req, res) => {
  const c = db.prepare('SELECT * FROM cases WHERE id = ? AND business_id = ?').get(req.params.id, req.business.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  const { template_id, fields } = req.body || {};
  const tmpl = templateById(template_id);
  if (!tmpl) return res.status(400).json({ error: 'Unknown document' });
  const emp = db.prepare('SELECT * FROM employees WHERE id = ?').get(c.employee_id) || {};
  const data = {
    ...(fields || {}),
    employeeName: emp.name || '',
    employeeRole: emp.job_title || '',
    businessName: req.business.name,
    managerName: req.user.name,
    date: today()
  };
  const content = fillTemplate(tmpl.body, data);
  const id = uid();
  const title = `${tmpl.name} — ${emp.name || ''}`.trim();
  db.prepare('INSERT INTO documents (id, case_id, business_id, template_id, title, fields, content, created_by, created_at) VALUES (?,?,?,?,?,?,?,?,?)')
    .run(id, c.id, req.business.id, tmpl.id, title, JSON.stringify(fields || {}), content, req.user.id, now());
  db.prepare('INSERT INTO events (id, case_id, business_id, kind, summary, occurred_at, created_by, created_at) VALUES (?,?,?,?,?,?,?,?)')
    .run(uid(), c.id, req.business.id, 'document', `Created document: ${tmpl.name}`, today(), req.user.id, now());
  db.prepare('UPDATE cases SET updated_at=? WHERE id=?').run(now(), c.id);
  res.json(db.prepare('SELECT * FROM documents WHERE id = ?').get(id));
});

app.get('/api/documents', (req, res) => {
  const rows = db.prepare('SELECT d.*, COALESCE(ec.name, ed.name) AS employee_name FROM documents d LEFT JOIN cases c ON c.id = d.case_id LEFT JOIN employees ec ON ec.id = c.employee_id LEFT JOIN employees ed ON ed.id = d.employee_id WHERE d.business_id = ? ORDER BY d.created_at DESC').all(req.business.id);
  res.json(rows.map((d) => ({ id: d.id, case_id: d.case_id, employee_id: d.employee_id, template_id: d.template_id, title: d.title, employee_name: d.employee_name, created_at: d.created_at })));
});
app.get('/api/documents/:id', (req, res) => {
  const d = db.prepare('SELECT * FROM documents WHERE id = ? AND business_id = ?').get(req.params.id, req.business.id);
  if (!d) return res.status(404).json({ error: 'Not found' });
  res.json({ ...d, fields: safeParse(d.fields, {}) });
});

// dashboard
app.get('/api/dashboard', (req, res) => {
  const bid = req.business.id;
  const cases = db.prepare('SELECT * FROM cases WHERE business_id = ?').all(bid);
  const employees = db.prepare('SELECT COUNT(*) c FROM employees WHERE business_id = ?').get(bid).c;
  const docs = db.prepare('SELECT COUNT(*) c FROM documents WHERE business_id = ?').get(bid).c;
  const open = cases.filter((c) => c.status !== 'resolved');
  const t = today();
  const attention = [];
  for (const c of open) {
    const emp = db.prepare('SELECT name FROM employees WHERE id = ?').get(c.employee_id) || {};
    const f = flowById(c.flow_id);
    const last = db.prepare('SELECT MAX(COALESCE(occurred_at, created_at)) m FROM events WHERE case_id = ?').get(c.id).m;
    let reason = null;
    if (c.next_check_in && c.next_check_in <= t) reason = 'Check-in due';
    else if (last && daysBetween(last, t) >= 14) reason = `No activity for ${daysBetween(last, t)} days`;
    if (reason) attention.push({ id: c.id, title: c.title, employee_name: emp.name, flow_name: f ? f.name : c.flow_id, flow_icon: f ? f.icon : '', sentiment: c.sentiment, reason, next_check_in: c.next_check_in });
  }
  const recent = cases.sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1)).slice(0, 6).map((c) => {
    const emp = db.prepare('SELECT name FROM employees WHERE id = ?').get(c.employee_id) || {};
    const f = flowById(c.flow_id);
    return { id: c.id, title: c.title, status: c.status, sentiment: c.sentiment, employee_name: emp.name, flow_name: f ? f.name : c.flow_id, flow_icon: f ? f.icon : '', updated_at: c.updated_at };
  });
  const inDevelopment = db.prepare('SELECT COUNT(*) c FROM employees WHERE business_id = ? AND current_role IS NOT NULL').get(bid).c;
  const feedbackResponses = db.prepare('SELECT COUNT(*) c FROM feedback_responses WHERE business_id = ?').get(bid).c;
  const openFeedback = db.prepare("SELECT COUNT(*) c FROM feedback_requests WHERE business_id = ? AND status = 'open'").get(bid).c;
  res.json({
    stats: {
      employees,
      openCases: open.length,
      positive: open.filter((c) => c.sentiment === 'positive').length,
      watch: open.filter((c) => c.sentiment !== 'positive').length,
      documents: docs,
      inDevelopment,
      feedbackResponses,
      openFeedback
    },
    industrySet: !!req.business.industry_id,
    attention,
    recent
  });
});

function daysBetween(a, b) {
  const d1 = new Date(a); const d2 = new Date(b);
  return Math.round((d2 - d1) / 86400000);
}

// ---------- page routes ----------
app.get('/', (req, res) => res.sendFile(path.join(PUBLIC, 'index.html')));
app.get(/^\/app(\/.*)?$/, (req, res) => res.sendFile(path.join(PUBLIC, 'app.html')));
app.get('/f/:token', (req, res) => res.sendFile(path.join(PUBLIC, 'feedback.html')));
app.use(express.static(PUBLIC));

// ---------- seed demo data on first run ----------
require('./seed')({ db, uid, now, today, bcrypt, flows, templates, fillTemplate, industries, feedbackTemplates });

app.listen(PORT, () => {
  console.log(`\n  Offsider is running.`);
  console.log(`  Marketing site:  http://localhost:${PORT}/`);
  console.log(`  The app:         http://localhost:${PORT}/app`);
  console.log(`  Demo login:      demo@offsider.au  /  offsider123\n`);
});
