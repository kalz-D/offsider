// Offsider — the HR offsider for small Australian businesses.
// Single Express server: marketing site + SPA + JSON API. Database via ./db (SQLite locally,
// Postgres/Supabase in production). All DB calls are async.
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
const lessons = require('./content/lessons');
const interviewKit = require('./content/interviewKit');
const referenceKit = require('./content/referenceKit');
const worklogKit = require('./content/worklogKit');
const leaveTypes = require('./content/leaveTypes');
const suggestionKit = require('./content/suggestionKit');
const legalRefs = require('./content/legalRefs');
const managerAcademy = require('./content/managerAcademy');
const wellbeingKit = require('./content/wellbeingKit');
const allowanceKit = require('./content/allowances');
const careersCopy = require('./content/careersCopy');
const jobAdKit = require('./content/jobAdKit');
const hrCoach = require('./content/hrCoach');
const safetyKit = require('./content/safetyKit');
const nodemailer = require('nodemailer');

// Email sending is OFF until SMTP creds are set in the environment (SMTP_HOST/USER/PASS).
// Works with any SMTP — a Google Workspace/Gmail app password, Microsoft 365, or a provider.
const MAIL = { configured: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS), from: process.env.SMTP_FROM || process.env.SMTP_USER || '' };
let mailTransport = null;
function getTransport() {
  if (!MAIL.configured) return null;
  if (!mailTransport) mailTransport = nodemailer.createTransport({
    host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT) || 587,
    secure: String(process.env.SMTP_SECURE) === 'true' || Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  return mailTransport;
}
async function sendEmail({ to, subject, text, attachments }) {
  const t = getTransport();
  if (!t) return { sent: false, reason: 'not_configured' };
  try { await t.sendMail({ from: MAIL.from, to, subject, text, attachments: attachments || [] }); return { sent: true }; }
  catch (e) { console.error('email send failed:', e.message); return { sent: false, reason: 'send_failed', error: e.message }; }
}
function fmtWhen(iso) { try { return new Date(iso).toLocaleString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }); } catch (e) { return iso; } }

// Pull a candidate's name + contact out of a forwarded Seek/Indeed application email (best-effort; the manager can tidy it).
function parseApplicationEmail(subject, text) {
  const t = (subject || '') + '\n' + (text || '');
  const subj = subject || '';
  const NM = "([A-Z][a-zA-Z'\\-]+(?:[ \\t]+[A-Z][a-zA-Z'\\-]+){1,3})";
  const bad = /^(SEEK|Indeed|LinkedIn|Jora|Application|New|Candidate|Job|Apply|Dear|Hi|Hello)$/i;
  let name = '';
  const tries = [
    new RegExp('\\b(?:Name|Candidate|Applicant|application from|From)[: \\t]+' + NM),
    new RegExp(NM + '[ \\t]+(?:has applied|applied|submitted)'),
    new RegExp('[-–—][ \\t]*' + NM + '[ \\t]*$', 'm')
  ];
  for (const rx of tries) { const m = (rx.flags.includes('m') ? subj : t).match(rx); if (m && !bad.test(m[1].split(' ')[0])) { name = m[1].trim(); break; } }
  const emails = t.match(/[\w.+\-]+@[\w\-]+\.[\w.\-]+/g) || [];
  const email = emails.find((e) => !/noreply|no-reply|donotreply|seek\.com|indeed\.com|linkedin\.com|messages\.|notification/i.test(e)) || null;
  const phoneRaw = (t.match(/(?:\+?61|0)\d[\d\s\-]{7,12}\d/) || [])[0] || null;
  return { name: name || '', email: email, phone: phoneRaw ? phoneRaw.replace(/[\s\-]/g, '') : null };
}
async function createApplicantCandidate(businessId, parsed, opts) {
  opts = opts || {};
  const id = uid(); const token = newToken();
  await db.prepare('INSERT INTO candidates (id, business_id, name, email, phone, role_applied, status, token, application, resume_text, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
    .run(id, businessId, parsed.name || 'New applicant', parsed.email || null, parsed.phone || null, opts.role || null, 'applied', token, '{}', opts.note || null, now(), now());
  if (opts.resume && opts.resume.data && opts.resume.name) {
    const data = String(opts.resume.data).replace(/^data:[^,]*,/, '');
    if (data && Math.floor(data.length * 3 / 4) <= 8 * 1024 * 1024) {
      await db.prepare('INSERT INTO candidate_files (id, business_id, candidate_id, kind, name, mime, data, created_at) VALUES (?,?,?,?,?,?,?,?)')
        .run(uid(), businessId, id, 'resume', String(opts.resume.name).slice(0, 200), opts.resume.mime || 'application/octet-stream', data, now());
    }
  }
  return id;
}

// SMS sending is OFF until a provider's creds are set. Supports Twilio or ClickSend (native fetch, no SDK).
const SMS = (function () {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM) return { configured: true, provider: 'twilio', from: process.env.TWILIO_FROM };
  if (process.env.CLICKSEND_USERNAME && process.env.CLICKSEND_API_KEY) return { configured: true, provider: 'clicksend', from: process.env.CLICKSEND_FROM || '' };
  return { configured: false, provider: null, from: '' };
})();
function toE164AU(phone) {
  let p = String(phone || '').replace(/[^\d+]/g, '');
  if (!p) return '';
  if (p[0] === '+') return p;
  if (p.startsWith('61')) return '+' + p;
  if (p[0] === '0') return '+61' + p.slice(1);
  return '+61' + p;
}
// ClickSend's /sms/send returns HTTP 200 even when a message is rejected — the truth is the
// top-level response_code plus the per-message data.messages[0].status. Judge on those, not r.ok.
function clickSendOutcome(httpOk, httpStatus, j, raw) {
  const respCode = j && (j.response_code || j.responseCode);
  const respMsg = (j && (j.response_msg || j.responseMsg)) || '';
  const msgs = (j && j.data && Array.isArray(j.data.messages)) ? j.data.messages : [];
  const mStatus = msgs.length ? String(msgs[0].status || '') : '';
  if (!httpOk) {
    const detail = respMsg || respCode || (raw ? String(raw).slice(0, 160) : '');
    return { sent: false, reason: 'rejected', error: 'ClickSend ' + httpStatus + (detail ? ' — ' + detail : '') };
  }
  const codeOk = !respCode || String(respCode).toUpperCase() === 'SUCCESS';
  const up = mStatus.toUpperCase();
  const msgOk = !mStatus || up === 'SUCCESS' || up === 'QUEUED';
  if (codeOk && msgOk) return { sent: true };
  const why = (mStatus && up !== 'SUCCESS' && up !== 'QUEUED') ? mStatus : (respMsg || respCode || 'message not accepted');
  return { sent: false, reason: 'rejected', error: 'ClickSend: ' + why };
}
async function sendSms({ to, body, from }) {
  if (!SMS.configured) return { sent: false, reason: 'not_configured' };
  const num = toE164AU(to);
  if (!num) return { sent: false, reason: 'no_phone' };
  const sender = (from === undefined ? SMS.from : from); // pass from:'' to drop the alphanumeric sender ID and send from a number
  try {
    if (SMS.provider === 'twilio') {
      const sid = process.env.TWILIO_ACCOUNT_SID;
      const auth = 'Basic ' + Buffer.from(sid + ':' + process.env.TWILIO_AUTH_TOKEN).toString('base64');
      const r = await fetch('https://api.twilio.com/2010-04-01/Accounts/' + sid + '/Messages.json', { method: 'POST', headers: { Authorization: auth, 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ From: sender || SMS.from, To: num, Body: body }) });
      if (!r.ok) throw new Error('twilio ' + r.status + ' ' + (await r.text()).slice(0, 140));
      return { sent: true };
    }
    if (SMS.provider === 'clicksend') {
      const auth = 'Basic ' + Buffer.from(process.env.CLICKSEND_USERNAME + ':' + process.env.CLICKSEND_API_KEY).toString('base64');
      const r = await fetch('https://rest.clicksend.com/v3/sms/send', { method: 'POST', headers: { Authorization: auth, 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ source: 'offsider', from: sender || undefined, to: num, body: body }] }) });
      const raw = await r.text();
      let j = null; try { j = JSON.parse(raw); } catch (e) {}
      return clickSendOutcome(r.ok, r.status, j, raw);
    }
    return { sent: false, reason: 'not_configured' };
  } catch (e) { console.error('sms send failed:', e.message); return { sent: false, reason: 'send_failed', error: e.message }; }
}

// ---------- AI résumé reader (OFF until ANTHROPIC_API_KEY is set in the environment) ----------
// Reads an uploaded résumé (PDF, Word .docx, or a photo/image) with Claude and pulls the
// applicant's name, email, phone, location + a short summary straight into their file.
// Set ANTHROPIC_API_KEY to switch it on; optional ANTHROPIC_MODEL (defaults to claude-opus-4-8;
// set claude-haiku-4-5 for a cheaper, faster read).
const AI = { configured: !!process.env.ANTHROPIC_API_KEY, model: process.env.ANTHROPIC_MODEL || 'claude-opus-4-8' };
let anthropicClient = null;
function getAnthropic() {
  if (!AI.configured) return null;
  if (!anthropicClient) { const Anthropic = require('@anthropic-ai/sdk'); anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 60000, maxRetries: 1 }); }
  return anthropicClient;
}
const RESUME_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    name: { type: 'string', description: "The applicant's own full name (not a referee or past employer). Empty string if unclear." },
    email: { type: 'string', description: 'Their email address, or empty string.' },
    phone: { type: 'string', description: 'Their phone number as written, or empty string.' },
    location: { type: 'string', description: 'Their suburb / city / state, or empty string.' },
    current_role: { type: 'string', description: 'Their most recent job title, or empty string.' },
    summary: { type: 'string', description: 'One plain-English sentence on who they are and their experience (max ~25 words).' },
    skills: { type: 'array', items: { type: 'string' }, description: 'Up to 8 short skill, ticket or licence keywords.' },
    questions: { type: 'array', items: { type: 'string' }, description: 'Exactly 5 interview questions tailored to THIS résumé — probe their actual experience, achievements, gaps and claims. Specific, not generic. Lawful only: about the work and their experience, never about age, race, health/disability, religion, relationships, pregnancy/family or other protected attributes.' }
  },
  required: ['name', 'email', 'phone', 'location', 'current_role', 'summary', 'skills', 'questions']
};
// Build the user-message content for Claude from a stored résumé file (base64) — or fall back to text.
async function resumeToContent(file, resumeText) {
  const mime = ((file && file.mime) || '').toLowerCase();
  const fname = ((file && file.name) || '').toLowerCase();
  if (file && file.data) {
    if (mime.includes('pdf') || fname.endsWith('.pdf')) return [{ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: file.data } }];
    if (mime.startsWith('image/')) return [{ type: 'image', source: { type: 'base64', media_type: mime, data: file.data } }];
    if (mime.includes('wordprocessingml') || fname.endsWith('.docx')) {
      try {
        const mammoth = require('mammoth');
        const out = await mammoth.extractRawText({ buffer: Buffer.from(file.data, 'base64') });
        const txt = ((out && out.value) || '').trim();
        if (txt) return [{ type: 'text', text: 'Résumé (extracted from a Word document):\n\n' + txt.slice(0, 60000) }];
      } catch (e) { console.error('docx extract failed:', e.message); }
    }
  }
  const fb = String(resumeText || '').trim();
  if (fb) return [{ type: 'text', text: 'Applicant details / résumé text:\n\n' + fb.slice(0, 60000) }];
  return null;
}
async function extractResumeFields(file, resumeText) {
  const client = getAnthropic();
  if (!client) return { ok: false, reason: 'not_configured' };
  const blocks = await resumeToContent(file, resumeText);
  if (!blocks) return { ok: false, reason: 'no_resume' };
  blocks.push({ type: 'text', text: "Extract this job applicant's contact and profile details from the résumé above, and write 5 interview questions tailored specifically to this person's résumé." });
  try {
    const resp = await client.messages.create({
      model: AI.model,
      max_tokens: 1024,
      system: "You read a job applicant's résumé/CV and extract their details. For the contact/profile fields, only use what is clearly present — never guess or invent a value; use an empty string when something is not stated, and the name is the applicant's own (not a referee or an employer). For the `questions` field you DO use judgement: write sharp, specific interview questions grounded in this candidate's actual experience and claims — and keep them lawful (about the work only, never about protected attributes).",
      messages: [{ role: 'user', content: blocks }],
      output_config: { format: { type: 'json_schema', schema: RESUME_SCHEMA } }
    });
    const txt = ((resp.content || []).find((b) => b.type === 'text') || {}).text || '{}';
    return { ok: true, fields: JSON.parse(txt) };
  } catch (e) {
    console.error('résumé AI parse failed:', e.message);
    return { ok: false, reason: 'ai_failed', error: e.message };
  }
}
function mergeResumeNote(existing, f) {
  const marker = '✨ From their résumé';
  let base = String(existing || '');
  const idx = base.indexOf(marker);
  if (idx >= 0) base = base.slice(0, idx).trim();
  const tail = [];
  if (f.current_role) tail.push('Now: ' + f.current_role);
  if (f.location) tail.push(f.location);
  let line = marker + ' — ' + (String(f.summary || '').trim() || '(no summary)');
  if (tail.length) line += ' · ' + tail.join(' · ');
  if (Array.isArray(f.skills) && f.skills.length) line += '\nSkills: ' + f.skills.slice(0, 8).join(', ');
  return (base ? base + '\n\n' : '') + line;
}
const looksLikeEmail = (s) => /^[\w.+\-]+@[\w\-]+\.[\w.\-]+$/.test(String(s || '').trim());
// Read a candidate's latest résumé with AI and fill in any blank name/email/phone (+ a short summary note).
async function aiFillCandidateFromResume(businessId, candidateId, opts) {
  opts = opts || {};
  const c = await db.prepare('SELECT * FROM candidates WHERE id=? AND business_id=?').get(candidateId, businessId);
  if (!c) return { ok: false, reason: 'not_found' };
  const file = await db.prepare("SELECT name, mime, data FROM candidate_files WHERE candidate_id=? AND kind='resume' ORDER BY created_at DESC").get(candidateId);
  const r = await extractResumeFields(file, c.resume_text);
  if (!r.ok) return r;
  const f = r.fields || {};
  const overwrite = !!opts.overwrite;
  const placeholderName = !c.name || /^new applicant$/i.test(String(c.name).trim());
  const filled = [];
  let name = c.name, email = c.email, phone = c.phone;
  if (String(f.name || '').trim() && (overwrite || placeholderName)) { name = String(f.name).trim(); filled.push('name'); }
  if (looksLikeEmail(f.email) && (overwrite || !c.email)) { email = String(f.email).trim(); filled.push('email'); }
  if (String(f.phone || '').trim() && (overwrite || !c.phone)) { phone = String(f.phone).trim(); filled.push('phone'); }
  const notes = mergeResumeNote(c.resume_text, f);
  // tailored interview questions → stored inside the interview JSON so they show in the interview section and persist
  let interviewJson = c.interview;
  if (Array.isArray(f.questions) && f.questions.length) {
    const iv = safeParse(c.interview, {}) || {};
    iv.aiQuestions = f.questions.map((q) => String(q || '').trim()).filter(Boolean).slice(0, 8);
    interviewJson = JSON.stringify(iv);
  }
  await db.prepare('UPDATE candidates SET name=?, email=?, phone=?, resume_text=?, interview=?, updated_at=? WHERE id=?').run(name, email, phone, notes, interviewJson, now(), candidateId);
  return { ok: true, filled, fields: f };
}

// ---------- auto-import from a resume inbox (OFF until IMAP_* env vars are set) ----------
// Reads new application emails (e.g. Seek/Indeed forwards) from a dedicated mailbox over IMAP,
// turns each into a candidate (+ resume) and runs the AI fill. Provider-agnostic — works with
// any IMAP host that allows an app password (Gmail is the easy one; personal Outlook.com no
// longer allows password/IMAP access). Polled by the cron and a manual "Check inbox now" button.
const INBOX = {
  configured: !!(process.env.IMAP_HOST && process.env.IMAP_USER && process.env.IMAP_PASS),
  host: process.env.IMAP_HOST || '', port: Number(process.env.IMAP_PORT) || 993,
  user: process.env.IMAP_USER || '', bizId: process.env.IMAP_BIZ_ID || ''
};
async function resolveInboxBiz() {
  if (INBOX.bizId) return INBOX.bizId;
  const rows = await db.prepare('SELECT id FROM businesses').all();
  return (rows && rows.length === 1) ? rows[0].id : null; // single-tenant convenience
}
async function pollMailbox(opts) {
  opts = opts || {};
  if (!INBOX.configured) return { ok: false, reason: 'not_configured' };
  const bizId = await resolveInboxBiz();
  if (!bizId) return { ok: false, reason: 'no_business', note: 'Set IMAP_BIZ_ID to your business id.' };
  const { ImapFlow } = require('imapflow');
  const { simpleParser } = require('mailparser');
  const client = new ImapFlow({ host: INBOX.host, port: INBOX.port, secure: true, auth: { user: INBOX.user, pass: process.env.IMAP_PASS }, logger: false });
  const limit = opts.limit || 25;
  let scanned = 0, imported = 0; const created = [];
  try {
    await client.connect();
    const lock = await client.getMailboxLock('INBOX');
    try {
      const uids = (await client.search({ seen: false }, { uid: true })) || [];
      for (const uid of uids.slice(0, limit)) {
        scanned++;
        let mail;
        try {
          const msg = await client.fetchOne(uid, { source: true }, { uid: true });
          if (!msg || !msg.source) continue;
          mail = await simpleParser(msg.source);
        } catch (e) { console.error('mail parse failed:', e.message); continue; }
        const subject = mail.subject || '';
        const text = mail.text || (mail.html ? String(mail.html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '') || '';
        let resume = null;
        const atts = (mail.attachments || []).filter((a) => a && a.content && a.content.length);
        const ra = atts.find((a) => /\.(pdf|docx?|rtf)$/i.test(a.filename || '') || /pdf|wordprocessing|msword|officedocument/i.test(a.contentType || '')) || atts[0];
        if (ra) {
          const b64 = Buffer.from(ra.content).toString('base64');
          if (Math.floor(b64.length * 3 / 4) <= 8 * 1024 * 1024) resume = { name: ra.filename || 'resume', mime: ra.contentType || 'application/octet-stream', data: b64 };
        }
        const parsed = parseApplicationEmail(subject, text);
        const id = await createApplicantCandidate(bizId, parsed, { note: text || null, resume });
        if (AI.configured) { try { await aiFillCandidateFromResume(bizId, id, {}); } catch (e) {} }
        try { await notifyManagers(bizId, 'application', 'New application — ' + (parsed.name || 'New applicant'), 'Auto-imported from your resume inbox', '#/candidate/' + id, null); } catch (e) {}
        try { await client.messageFlagsAdd(uid, ['\\Seen'], { uid: true }); } catch (e) { console.error('flag Seen failed:', e.message); }
        imported++; created.push(id);
      }
    } finally { lock.release(); }
    await client.logout();
    return { ok: true, scanned, imported, created };
  } catch (e) {
    try { await client.logout(); } catch (_) {}
    console.error('mailbox poll failed:', e.message);
    return { ok: false, reason: 'imap_failed', error: e.message };
  }
}

const app = express();
const PORT = process.env.PORT || 4000;
const PUBLIC = path.join(__dirname, 'public');

const PROD = process.env.NODE_ENV === 'production';
if (PROD) app.set('trust proxy', 1); // behind the host's HTTPS proxy (Render/Railway/Fly)
app.use(express.json({ limit: '15mb' })); // generous — base64 file uploads (resumes, contracts) and forwarded emails
app.use(express.urlencoded({ extended: false, limit: '15mb' })); // some inbound-email providers post form-encoded

const sessionOpts = {
  secret: process.env.SESSION_SECRET || 'offsider-dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: PROD, maxAge: 1000 * 60 * 60 * 24 * 30 }
};
if (db.usePg) {
  // persistent session store so logins survive restarts in production
  const PgStore = require('connect-pg-simple')(session);
  sessionOpts.store = new PgStore({
    conString: process.env.DATABASE_URL,
    schemaName: process.env.DB_SCHEMA || 'offsider',
    createTableIfMissing: true
  });
}
app.use(session(sessionOpts));

// ---------- content helpers (in-memory, sync) ----------
const flowById = (id) => flows.find((f) => f.id === id);
const templateById = (id) => templates.find((t) => t.id === id);
const industryById = (id) => industries.find((i) => i.id === id);
const feedbackTemplateById = (id) => feedbackTemplates.find((t) => t.id === id);
const awardById = (id) => awards.find((a) => a.id === id);
const lessonById = (id) => lessons.find((l) => l.id === id);
const awardLevel = (awardId, code) => { const a = awardById(awardId); return a ? (a.levels.find((l) => l.id === code) || null) : null; };
const newToken = () => require('crypto').randomBytes(7).toString('hex');
function safeParse(s, fallback) { if (s == null || s === '') return fallback; try { const v = JSON.parse(s); return v == null ? fallback : v; } catch (e) { return fallback; } }
function fillTemplate(body, data) {
  return String(body || '').replace(/{{\s*([\w.]+)\s*}}/g, (_, key) => { const v = data[key]; return v === undefined || v === null ? '' : String(v); });
}
function publicUser(u, biz) {
  return { id: u.id, name: u.name, email: u.email, role: u.role, employee_id: u.employee_id || null, business: { id: biz.id, name: biz.name, industry: biz.industry, industry_id: biz.industry_id || null, plan: biz.plan } };
}

// Build the career + pay picture for one worker (in-memory only).
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
function addDays(iso, n) { const d = new Date(iso + 'T00:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }
function diffDays(a, b) { return Math.round((new Date(a + 'T00:00:00') - new Date(b + 'T00:00:00')) / 86400000); }
function daysBetween(a, b) { return Math.round((new Date(b) - new Date(a)) / 86400000); }
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

// ---------- DB-backed helpers (async) ----------
async function lifecycleSchedule(emp) {
  const t = today();
  const start = emp.start_date || null;
  if (!start) return [];
  const tenureDays = diffDays(t, start);
  const comps = await db.prepare('SELECT rule_id, occurrence_key, status FROM lifecycle_completions WHERE employee_id = ?').all(emp.id);
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
    if (!isDone && (daysUntil > 150 || daysUntil < -45)) continue;
    const action = Object.assign({}, r.action);
    if (action.kind === 'reflection' && reflectionPrompts.length) action.reflectionId = reflectionPrompts[idx % reflectionPrompts.length].id;
    out.push({ rule_id: r.id, occurrence_key: key, title: r.title, detail: r.detail, stage: r.stage, owner: r.owner, action, due: dueISO, daysUntil, done: isDone });
  }
  out.sort((a, b) => (a.due < b.due ? -1 : 1));
  return out;
}

async function currentUser(req) {
  if (!req.session.userId) return null;
  return (await db.prepare('SELECT id, business_id, name, email, role, employee_id FROM users WHERE id = ?').get(req.session.userId)) || null;
}
async function requireAuth(req, res, next) {
  try {
    const user = await currentUser(req);
    if (!user) return res.status(401).json({ error: 'Not signed in' });
    req.user = user;
    req.business = await db.prepare('SELECT * FROM businesses WHERE id = ?').get(user.business_id);
    next();
  } catch (e) { next(e); }
}
function requireManager(req, res, next) {
  if (req.user && req.user.role === 'staff') return res.status(403).json({ error: 'This part of Offsider is for managers.' });
  next();
}

async function caseView(c) {
  const emp = (await db.prepare('SELECT * FROM employees WHERE id = ?').get(c.employee_id)) || {};
  const events = (await db.prepare('SELECT * FROM events WHERE case_id = ? ORDER BY COALESCE(occurred_at, created_at) DESC').all(c.id)).map((ev) => ({ ...ev, tags: safeParse(ev.tags, []) }));
  const docs = await db.prepare('SELECT id, template_id, title, created_at FROM documents WHERE case_id = ? ORDER BY created_at DESC').all(c.id);
  return {
    ...c, state: safeParse(c.state, {}),
    employee: { id: emp.id, name: emp.name, job_title: emp.job_title },
    flow: flowById(c.flow_id) || null, events, documents: docs
  };
}

// wrap async route handlers so thrown errors return a clean 500
const h = (fn) => (req, res) => Promise.resolve(fn(req, res)).catch((e) => { console.error(e); if (!res.headersSent) res.status(500).json({ error: 'Something went wrong on our end.' }); });

// ---------- auth routes ----------
app.post('/api/auth/signup', h(async (req, res) => {
  const { businessName, industry, name, email, password } = req.body || {};
  if (!businessName || !name || !email || !password) return res.status(400).json({ error: 'Please fill in every field.' });
  if (String(password).length < 8) return res.status(400).json({ error: 'Use a password of at least 8 characters.' });
  const existing = await db.prepare('SELECT id FROM users WHERE email = ?').get(String(email).toLowerCase());
  if (existing) return res.status(409).json({ error: 'That email is already signed up. Try logging in.' });
  const bizId = uid();
  await db.prepare('INSERT INTO businesses (id, name, industry, region, plan, created_at) VALUES (?,?,?,?,?,?)').run(bizId, businessName, industry || null, 'AU', 'trial', now());
  const userId = uid();
  await db.prepare('INSERT INTO users (id, business_id, name, email, password_hash, role, created_at) VALUES (?,?,?,?,?,?,?)').run(userId, bizId, name, String(email).toLowerCase(), bcrypt.hashSync(password, 10), 'owner', now());
  req.session.userId = userId;
  const biz = await db.prepare('SELECT * FROM businesses WHERE id = ?').get(bizId);
  const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  res.json({ user: publicUser(user, biz) });
}));

app.post('/api/auth/login', h(async (req, res) => {
  const { email, password } = req.body || {};
  const user = await db.prepare('SELECT * FROM users WHERE email = ?').get(String(email || '').toLowerCase());
  if (!user || !bcrypt.compareSync(password || '', user.password_hash)) return res.status(401).json({ error: 'Email or password is not right.' });
  req.session.userId = user.id;
  const biz = await db.prepare('SELECT * FROM businesses WHERE id = ?').get(user.business_id);
  res.json({ user: publicUser(user, biz) });
}));

app.post('/api/auth/logout', (req, res) => { req.session.destroy(() => res.json({ ok: true })); });

app.get('/api/auth/me', h(async (req, res) => {
  const user = await currentUser(req);
  if (!user) return res.status(401).json({ error: 'Not signed in' });
  const biz = await db.prepare('SELECT * FROM businesses WHERE id = ?').get(user.business_id);
  const full = await db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  res.json({ user: publicUser(full, biz) });
}));

// ---------- content routes ----------
app.get('/api/flows', (req, res) => res.json(flows.map((f) => ({ id: f.id, name: f.name, blurb: f.blurb, sentiment: f.sentiment, category: f.category, icon: f.icon }))));
app.get('/api/flows/:id', (req, res) => { const f = flowById(req.params.id); if (!f) return res.status(404).json({ error: 'Unknown flow' }); res.json(f); });
app.get('/api/templates', (req, res) => res.json(templates.map((t) => ({ id: t.id, name: t.name, category: t.category, purpose: t.purpose, tone: t.tone, fields: t.fields }))));
app.get('/api/templates/:id', (req, res) => { const t = templateById(req.params.id); if (!t) return res.status(404).json({ error: 'Unknown template' }); res.json({ id: t.id, name: t.name, category: t.category, purpose: t.purpose, tone: t.tone, fields: t.fields, legalNote: t.legalNote }); });
app.get('/api/compliance', (req, res) => res.json(compliance));
app.get('/api/brand', (req, res) => res.json(brand));

// ---------- PUBLIC feedback (no login) ----------
app.get('/api/public/feedback/:token', h(async (req, res) => {
  const fr = await db.prepare('SELECT * FROM feedback_requests WHERE token = ?').get(req.params.token);
  if (!fr) return res.status(404).json({ error: 'This feedback link is not valid.' });
  const tmpl = feedbackTemplateById(fr.template_id);
  if (!tmpl) return res.status(404).json({ error: 'This feedback form is no longer available.' });
  const biz = (await db.prepare('SELECT name FROM businesses WHERE id = ?').get(fr.business_id)) || {};
  const emp = fr.employee_id ? await db.prepare('SELECT name FROM employees WHERE id = ?').get(fr.employee_id) : null;
  res.json({ title: fr.title || tmpl.name, intro: tmpl.intro || '', audience: fr.audience, anonymous: !!fr.anonymous, closed: fr.status === 'closed', businessName: biz.name || '', employeeName: emp ? emp.name : null, questions: tmpl.questions || [] });
}));
app.post('/api/public/feedback/:token', h(async (req, res) => {
  const fr = await db.prepare('SELECT * FROM feedback_requests WHERE token = ?').get(req.params.token);
  if (!fr) return res.status(404).json({ error: 'This feedback link is not valid.' });
  if (fr.status === 'closed') return res.status(410).json({ error: 'This feedback form is closed.' });
  const { answers, submitted_by } = req.body || {};
  if (!answers || typeof answers !== 'object') return res.status(400).json({ error: 'No answers were sent.' });
  await db.prepare('INSERT INTO feedback_responses (id, request_id, business_id, answers, anonymous, submitted_by, submitted_at) VALUES (?,?,?,?,?,?,?)').run(uid(), fr.id, fr.business_id, JSON.stringify(answers), fr.anonymous ? 1 : 0, (fr.anonymous ? null : (submitted_by || null)), now());
  res.json({ ok: true });
}));

// ---------- public CANDIDATE page (pre-interview application form + offer accept) ----------
app.get('/api/public/candidate/:token', h(async (req, res) => {
  const c = await db.prepare('SELECT * FROM candidates WHERE token = ?').get(req.params.token);
  if (!c) return res.status(404).json({ error: 'This link is not valid.' });
  const biz = (await db.prepare('SELECT name FROM businesses WHERE id = ?').get(c.business_id)) || {};
  const offer = safeParse(c.offer, null);
  let stage = 'done';
  if (c.status === 'offer' && offer) stage = 'offer';
  else if (!c.application && (c.status === 'new' || c.status === 'applied')) stage = 'application';
  res.json({
    businessName: biz.name || '', candidateName: c.name, roleApplied: c.role_applied || '', stage,
    applicationFields: stage === 'application' ? interviewKit.applicationFields : [],
    offer: stage === 'offer' ? { roleTitle: c.role_applied || '', rate: offer.rate, pay_basis: offer.pay_basis, start_date: offer.start_date, message: offer.message } : null,
    accepted: c.status === 'accepted' || c.status === 'hired'
  });
}));
app.post('/api/public/candidate/:token/apply', h(async (req, res) => {
  const c = await db.prepare('SELECT * FROM candidates WHERE token = ?').get(req.params.token);
  if (!c) return res.status(404).json({ error: 'This link is not valid.' });
  const { answers, phone } = req.body || {};
  if (!answers || typeof answers !== 'object') return res.status(400).json({ error: 'No answers were sent.' });
  await db.prepare('UPDATE candidates SET application=?, phone=COALESCE(?,phone), status=?, updated_at=? WHERE id=?')
    .run(JSON.stringify(answers), phone || null, (c.status === 'new' ? 'applied' : c.status), now(), c.id);
  res.json({ ok: true });
}));
app.post('/api/public/candidate/:token/accept', h(async (req, res) => {
  const c = await db.prepare('SELECT * FROM candidates WHERE token = ?').get(req.params.token);
  if (!c) return res.status(404).json({ error: 'This link is not valid.' });
  if (c.status !== 'offer') return res.status(400).json({ error: 'There is no offer to accept right now.' });
  await db.prepare('UPDATE candidates SET status=?, updated_at=? WHERE id=?').run('accepted', now(), c.id);
  res.json({ ok: true });
}));

// ---------- public REFERENCES page (the CANDIDATE lists their referees here, no login) ----------
app.get('/api/public/candidate/:token/refs', h(async (req, res) => {
  const c = await db.prepare('SELECT * FROM candidates WHERE token = ?').get(req.params.token);
  if (!c) return res.status(404).json({ error: 'This link is not valid.' });
  const biz = (await db.prepare('SELECT name FROM businesses WHERE id = ?').get(c.business_id)) || {};
  const existing = await db.prepare('SELECT id FROM candidate_references WHERE candidate_id = ?').all(c.id);
  res.json({ businessName: biz.name || '', candidateName: c.name, firstName: (c.name || '').split(' ')[0], roleApplied: c.role_applied || '', suggested: 2, submittedCount: (existing || []).length });
}));
app.post('/api/public/candidate/:token/refs', h(async (req, res) => {
  const c = await db.prepare('SELECT * FROM candidates WHERE token = ?').get(req.params.token);
  if (!c) return res.status(404).json({ error: 'This link is not valid.' });
  const list = Array.isArray(req.body && req.body.referees) ? req.body.referees : [];
  const clean = list.map((r) => ({
    name: String((r && r.name) || '').trim(), relationship: String((r && r.relationship) || '').trim(),
    company: String((r && r.company) || '').trim(), phone: String((r && r.phone) || '').trim(), email: String((r && r.email) || '').trim()
  })).filter((r) => r.name && (r.phone || r.email)).slice(0, 5);
  if (!clean.length) return res.status(400).json({ error: 'Add at least one referee with a name and a phone or email.' });
  for (const r of clean) {
    await db.prepare('INSERT INTO candidate_references (id, business_id, candidate_id, referee_name, relationship, company, phone, email, token, status, created_by, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)')
      .run(uid(), c.business_id, c.id, r.name, r.relationship || null, r.company || null, r.phone || null, r.email || null, newToken(), 'pending', null, now(), now());
  }
  await notifyManagers(c.business_id, 'application', 'References in — ' + c.name, c.name + ' added ' + clean.length + ' referee' + (clean.length === 1 ? '' : 's'), '#/candidate/' + c.id, null);
  res.json({ ok: true, count: clean.length });
}));

// ---------- public REFERENCE check (referee fills this, no login) ----------
app.get('/api/public/reference/:token', h(async (req, res) => {
  const r = await db.prepare('SELECT * FROM candidate_references WHERE token = ?').get(req.params.token);
  if (!r) return res.status(404).json({ error: 'This link is not valid.' });
  const c = await db.prepare('SELECT name, role_applied FROM candidates WHERE id = ?').get(r.candidate_id);
  const biz = (await db.prepare('SELECT name FROM businesses WHERE id = ?').get(r.business_id)) || {};
  const data = { candidateName: c ? c.name : 'the candidate', roleTitle: c ? (c.role_applied || 'the role') : 'the role', businessName: biz.name || '' };
  res.json({
    businessName: biz.name || '', candidateName: c ? c.name : '', roleApplied: c ? c.role_applied : '', refereeName: r.referee_name || '',
    submitted: r.status === 'received',
    questions: (referenceKit.questions || []).map((q, i) => ({ id: 'r' + i, category: q.category, question: fillTemplate(q.question, data) }))
  });
}));
app.post('/api/public/reference/:token', h(async (req, res) => {
  const r = await db.prepare('SELECT * FROM candidate_references WHERE token = ?').get(req.params.token);
  if (!r) return res.status(404).json({ error: 'This link is not valid.' });
  const b = req.body || {};
  if (!b.answers || typeof b.answers !== 'object') return res.status(400).json({ error: 'No answers were sent.' });
  await db.prepare('UPDATE candidate_references SET answers=?, status=?, updated_at=? WHERE id=?').run(JSON.stringify(b.answers), 'received', now(), r.id);
  res.json({ ok: true });
}));

// ---------- public CAREERS page + self-apply (no login) — own the application from click one ----------
app.get('/api/public/careers/:bizId', h(async (req, res) => {
  const biz = await db.prepare('SELECT id, name, industry FROM businesses WHERE id = ?').get(req.params.bizId);
  if (!biz) return res.status(404).json({ error: 'Not found' });
  const jobs = await db.prepare("SELECT title, blurb, location, employment_type, pay_note, token FROM job_openings WHERE business_id = ? AND status = 'open' ORDER BY created_at DESC").all(biz.id);
  res.json({ businessName: biz.name, industry: biz.industry, intro: careersCopy.careersIntro, noRoles: careersCopy.noRoles, jobs });
}));
app.get('/api/public/job/:token', h(async (req, res) => {
  const job = await db.prepare('SELECT * FROM job_openings WHERE token = ?').get(req.params.token);
  if (!job) return res.status(404).json({ error: 'This job link is not valid.' });
  const biz = (await db.prepare('SELECT name FROM businesses WHERE id = ?').get(job.business_id)) || {};
  res.json({ businessName: biz.name || '', title: job.title, blurb: job.blurb, location: job.location, employment_type: job.employment_type, pay_note: job.pay_note, closed: job.status !== 'open', applyIntro: careersCopy.applyIntro, whatNext: careersCopy.whatNext, applicationFields: interviewKit.applicationFields });
}));
app.post('/api/public/job/:token/apply', h(async (req, res) => {
  const job = await db.prepare('SELECT * FROM job_openings WHERE token = ?').get(req.params.token);
  if (!job) return res.status(404).json({ error: 'This job link is not valid.' });
  if (job.status !== 'open') return res.status(410).json({ error: 'Sorry, this role is now closed.' });
  const b = req.body || {};
  if (!b.name || !String(b.name).trim()) return res.status(400).json({ error: 'Please enter your name.' });
  const id = uid(); const token = newToken();
  await db.prepare('INSERT INTO candidates (id, business_id, name, email, phone, role_applied, status, token, application, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
    .run(id, job.business_id, String(b.name).trim(), b.email || null, b.phone || null, job.title || null, 'applied', token, JSON.stringify(b.answers || {}), now(), now());
  if (b.resume && b.resume.data && b.resume.name) {
    const data = String(b.resume.data).replace(/^data:[^,]*,/, '');
    if (Math.floor(data.length * 3 / 4) <= 6 * 1024 * 1024) {
      await db.prepare('INSERT INTO candidate_files (id, business_id, candidate_id, kind, name, mime, data, created_at) VALUES (?,?,?,?,?,?,?,?)')
        .run(uid(), job.business_id, id, 'resume', String(b.resume.name).slice(0, 200), b.resume.mime || 'application/octet-stream', data, now());
      if (AI.configured) aiFillCandidateFromResume(job.business_id, id, {}).catch(() => {});
    }
  }
  await notifyManagers(job.business_id, 'application', 'New application — ' + String(b.name).trim(), (job.title || 'a role') + ' · applied via your careers page', '#/candidate/' + id, null);
  res.json({ ok: true, thanks: careersCopy.thanks });
}));

// ---------- inbound email hook (no login; guarded by INBOUND_SECRET) ----------
// Point an inbound-email service (CloudMailin JSON format, SendGrid Inbound, Mailgun Routes) at
// POST /api/inbound/<businessId>?key=YOUR_SECRET (or just /api/inbound?key=... for a single business)
// and forward your Seek/Indeed application emails there — each becomes a candidate (with resume).
async function ingestInboundEmail(bizId, b) {
  b = b || {};
  const subject = b.subject || (b.headers && (b.headers.Subject || b.headers.subject)) || '';
  const text = b.plain || b.text || b['body-plain'] || b['stripped-text'] || (b.html ? String(b.html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '') || '';
  let resume = null;
  const atts = Array.isArray(b.attachments) ? b.attachments : [];
  if (atts.length) {
    const a = atts.find((x) => /\.(pdf|docx?|rtf)$/i.test(x.file_name || x.filename || x.name || '') || /pdf|wordprocessing|msword|officedocument/i.test(x.content_type || x.type || '')) || atts[0];
    if (a) resume = { name: a.file_name || a.filename || a.name || 'resume', mime: a.content_type || a.type || 'application/octet-stream', data: a.content || a.data || '' };
  }
  const parsed = parseApplicationEmail(subject, text);
  const id = await createApplicantCandidate(bizId, parsed, { note: text || null, resume });
  if (AI.configured) aiFillCandidateFromResume(bizId, id, {}).catch(() => {});
  await notifyManagers(bizId, 'application', 'New application — ' + (parsed.name || 'New applicant'), 'Forwarded in from your job board', '#/candidate/' + id, null);
  return id;
}
app.post('/api/inbound/:bizId', h(async (req, res) => {
  if (!process.env.INBOUND_SECRET || req.query.key !== process.env.INBOUND_SECRET) return res.status(403).json({ error: 'forbidden' });
  const biz = await db.prepare('SELECT id FROM businesses WHERE id = ?').get(req.params.bizId);
  if (!biz) return res.status(404).json({ error: 'unknown business' });
  const id = await ingestInboundEmail(biz.id, req.body);
  res.json({ ok: true, id });
}));
app.post('/api/inbound', h(async (req, res) => {
  if (!process.env.INBOUND_SECRET || req.query.key !== process.env.INBOUND_SECRET) return res.status(403).json({ error: 'forbidden' });
  const bizId = await resolveInboxBiz();
  if (!bizId) return res.status(400).json({ error: 'add your business id to the URL: /api/inbound/<businessId>' });
  const id = await ingestInboundEmail(bizId, req.body);
  res.json({ ok: true, id });
}));

// ---------- cron hook (no login; guarded by CRON_SECRET) ----------
// Wire a free cron (e.g. cron-job.org) to GET /api/cron/run?key=YOUR_SECRET every ~15 min.
// Sends the pre-fill form ~24h before an interview, and reminds the manager ~4h before.
app.get('/api/cron/run', h(async (req, res) => {
  if (!process.env.CRON_SECRET || req.query.key !== process.env.CRON_SECRET) return res.status(403).json({ error: 'forbidden' });
  const nowMs = Date.now();
  let prefillSent = 0, remindersSent = 0;
  const host = req.get('host');
  const rows = await db.prepare('SELECT i.*, c.name AS candidate_name, c.email AS candidate_email, c.phone AS candidate_phone, c.token AS candidate_token, c.application AS application, b.name AS biz_name FROM interviews i JOIN candidates c ON c.id=i.candidate_id JOIN businesses b ON b.id=i.business_id WHERE i.scheduled_at IS NOT NULL').all();
  for (const i of rows) {
    const t = Date.parse(i.scheduled_at); if (isNaN(t)) continue;
    const hoursTo = (t - nowMs) / 3600000;
    if (!i.prefill_sent && !i.application && hoursTo <= 24 && hoursTo > 0) {
      const link = 'https://' + host + '/c/' + i.candidate_token;
      const fn = (i.candidate_name || '').split(' ')[0];
      let r = { sent: false };
      if (i.candidate_email) r = await sendEmail({ to: i.candidate_email, subject: 'Quick form before your interview', text: 'Hi ' + fn + ',\n\nLooking forward to your interview. Could you fill out this quick form beforehand? Takes a couple of minutes.\n\n' + link + '\n\nCheers,\n' + (i.biz_name || '') });
      if (!r.sent && i.candidate_phone) r = await sendSms({ to: i.candidate_phone, body: (i.biz_name || 'Hi') + ': Hi ' + fn + ', quick form before your interview (2 min): ' + link });
      if (r.sent) { await db.prepare('UPDATE interviews SET prefill_sent=1 WHERE candidate_id=?').run(i.candidate_id); prefillSent++; }
    }
    if (!i.reminder_sent && hoursTo <= 4 && hoursTo > 0) {
      await notifyManagers(i.business_id, 'interview', 'Interview soon — ' + i.candidate_name, fmtWhen(i.scheduled_at) + (i.location ? ' · ' + i.location : ''), '#/candidate/' + i.candidate_id, null);
      await db.prepare('UPDATE interviews SET reminder_sent=1 WHERE candidate_id=?').run(i.candidate_id); remindersSent++;
    }
  }
  let inbox = { skipped: true };
  if (INBOX.configured) { try { inbox = await pollMailbox({ limit: 25 }); } catch (e) { inbox = { ok: false, error: e.message }; } }
  // ticket/licence expiry reminders — anything expiring within 30 days (or already lapsed), once each
  let certReminders = 0;
  const today2 = new Date(nowMs).toISOString().slice(0, 10);
  const soon = new Date(nowMs + 30 * 86400000).toISOString().slice(0, 10);
  const certs = await db.prepare("SELECT c.*, e.name AS employee_name FROM competencies c JOIN employees e ON e.id=c.employee_id WHERE c.expires IS NOT NULL AND c.expires <= ? AND c.reminded_at IS NULL").all(soon);
  for (const c of certs) {
    await notifyManagers(c.business_id, 'safety', '🎫 ' + (c.employee_name || 'A worker') + '’s ' + c.name + (c.expires < today2 ? ' has expired' : ' expires soon'), 'Expiry: ' + c.expires, '#/safety', null);
    await db.prepare('UPDATE competencies SET reminded_at=? WHERE id=?').run(now(), c.id);
    certReminders++;
  }
  res.json({ ok: true, prefillSent, remindersSent, inbox, certReminders });
}));

// ---------- everything below requires a login ----------
app.use('/api', requireAuth);

// ---------- STAFF self-service ----------
async function myEmployee(req) {
  return req.user.employee_id ? await db.prepare('SELECT * FROM employees WHERE id = ? AND business_id = ?').get(req.user.employee_id, req.business.id) : null;
}
async function notify(businessId, userId, kind, title, body, link) {
  if (!userId) return;
  await db.prepare('INSERT INTO notifications (id, business_id, user_id, kind, title, body, link, read, created_at) VALUES (?,?,?,?,?,?,?,0,?)').run(uid(), businessId, userId, kind, title || '', body || null, link || null, now());
}
async function notifyManagers(businessId, kind, title, body, link, exceptUserId) {
  const mgrs = await db.prepare("SELECT id FROM users WHERE business_id = ? AND role IN ('owner','manager')").all(businessId);
  for (const m of mgrs) { if (m.id !== exceptUserId) await notify(businessId, m.id, kind, title, body, link); }
}
async function userIdForEmployee(employeeId) {
  const u = await db.prepare('SELECT id FROM users WHERE employee_id = ?').get(employeeId);
  return u ? u.id : null;
}
app.get('/api/me', h(async (req, res) => {
  const e = await myEmployee(req);
  if (!e) return res.json({ role: req.user.role, name: req.user.name, employee: null });
  const dev = safeParse(e.development, {});
  const wage = buildWageView(e, req.business);
  const pending = (await db.prepare("SELECT COUNT(*) c FROM feedback_requests WHERE business_id = ? AND status = 'open' AND (employee_id = ? OR employee_id IS NULL)").get(req.business.id, e.id)).c;
  res.json({
    role: req.user.role, name: req.user.name, business: { name: req.business.name },
    employee: { id: e.id, name: e.name, job_title: e.job_title, employment_type: e.employment_type, start_date: e.start_date, development: dev, current_role: e.current_role, pay_rate: e.pay_rate },
    wage, pending
  });
}));
app.get('/api/me/assignments', h(async (req, res) => {
  const e = await myEmployee(req); if (!e) return res.json([]);
  const reqs = await db.prepare("SELECT * FROM feedback_requests WHERE business_id = ? AND status = 'open' AND (employee_id = ? OR employee_id IS NULL) ORDER BY created_at DESC").all(req.business.id, e.id);
  const out = await Promise.all(reqs.map(async (r) => {
    const t = feedbackTemplateById(r.template_id) || { questions: [] };
    let completed = false;
    if (!r.anonymous) {
      const since = periodStart(r.cadence || 'once');
      completed = (await db.prepare('SELECT COUNT(*) c FROM feedback_responses WHERE request_id = ? AND submitted_by = ? AND substr(submitted_at,1,10) >= ?').get(r.id, e.name, since)).c > 0;
    }
    return { id: r.id, title: r.title || t.name, audience: r.audience, cadence: r.cadence || 'once', anonymous: !!r.anonymous, intro: t.intro || '', questions: t.questions || [], completed };
  }));
  res.json(out);
}));
app.post('/api/me/assignments/:id', h(async (req, res) => {
  const e = await myEmployee(req); if (!e) return res.status(400).json({ error: 'No worker profile linked to this login.' });
  const r = await db.prepare('SELECT * FROM feedback_requests WHERE id = ? AND business_id = ?').get(req.params.id, req.business.id);
  if (!r || (r.employee_id && r.employee_id !== e.id)) return res.status(404).json({ error: 'Not found' });
  const { answers } = req.body || {};
  await db.prepare('INSERT INTO feedback_responses (id, request_id, business_id, answers, anonymous, submitted_by, submitted_at) VALUES (?,?,?,?,?,?,?)').run(uid(), r.id, req.business.id, JSON.stringify(answers || {}), r.anonymous ? 1 : 0, r.anonymous ? null : e.name, now());
  res.json({ ok: true });
}));

// staff: lessons assigned to me
app.get('/api/me/lessons', h(async (req, res) => {
  const e = await myEmployee(req); if (!e) return res.json([]);
  const rows = await db.prepare('SELECT * FROM lessons_progress WHERE employee_id = ? ORDER BY assigned_at DESC').all(e.id);
  res.json(rows.map((r) => { const l = lessonById(r.lesson_id) || {}; return { lesson_id: r.lesson_id, title: l.title || r.lesson_id, blurb: l.blurb || '', competencyLabel: l.competencyLabel || '', status: r.status, score: r.score }; }));
}));
app.get('/api/me/lessons/:lessonId', h(async (req, res) => {
  const e = await myEmployee(req); if (!e) return res.status(400).json({ error: 'No worker profile.' });
  const l = lessonById(req.params.lessonId); if (!l) return res.status(404).json({ error: 'Lesson not found' });
  const row = await db.prepare('SELECT * FROM lessons_progress WHERE employee_id = ? AND lesson_id = ?').get(e.id, l.id);
  if (!row) return res.status(403).json({ error: 'This lesson is not assigned to you.' });
  res.json({ id: l.id, title: l.title, intro: l.intro, sections: l.sections || [], passMark: l.passMark || 0.7, status: row.status, score: row.score, quiz: (l.quiz || []).map((q) => ({ id: q.id, question: q.question, options: q.options })) });
}));
app.post('/api/me/lessons/:lessonId/submit', h(async (req, res) => {
  const e = await myEmployee(req); if (!e) return res.status(400).json({ error: 'No worker profile.' });
  const l = lessonById(req.params.lessonId); if (!l) return res.status(404).json({ error: 'Lesson not found' });
  const row = await db.prepare('SELECT * FROM lessons_progress WHERE employee_id = ? AND lesson_id = ?').get(e.id, l.id);
  if (!row) return res.status(403).json({ error: 'This lesson is not assigned to you.' });
  const answers = (req.body && req.body.answers) || {};
  const quiz = l.quiz || [];
  let correct = 0;
  for (const q of quiz) { if (String(answers[q.id]) === String(q.answer)) correct++; }
  const total = quiz.length || 1;
  const score = correct / total;
  const passed = score >= (l.passMark || 0.7);
  await db.prepare('UPDATE lessons_progress SET status=?, score=?, answers=?, completed_at=? WHERE id=?').run(passed ? 'passed' : 'failed', score, JSON.stringify(answers), now(), row.id);
  let signed = null;
  if (passed && l.signsOff) {
    const emp = await db.prepare('SELECT development FROM employees WHERE id = ?').get(e.id);
    const dev = safeParse(emp.development, {}); dev.skills = dev.skills || {}; dev.skills[l.signsOff] = true;
    await db.prepare('UPDATE employees SET development=? WHERE id=?').run(JSON.stringify(dev), e.id);
    signed = l.competencyLabel || l.signsOff;
  }
  res.json({ passed, correct, total, score, signed });
}));

// ---------- shared (any logged-in user): app kit + legal refs + notifications ----------
app.get('/api/app-kit', (req, res) => res.json({ worklog: worklogKit, leaveTypes: leaveTypes.types || [], leaveTip: leaveTypes.tip || '', suggestions: suggestionKit }));
app.get('/api/legal-refs', (req, res) => res.json(legalRefs));
app.get('/api/email-status', (req, res) => res.json({ configured: MAIL.configured, from: MAIL.from }));
app.get('/api/sms-status', (req, res) => res.json({ configured: SMS.configured, provider: SMS.provider }));
app.get('/api/ai-status', (req, res) => res.json({ configured: AI.configured, model: AI.model }));
app.get('/api/inbox-status', (req, res) => res.json({
  configured: INBOX.configured, user: INBOX.user, host: INBOX.host,
  webhookReady: !!process.env.INBOUND_SECRET,
  webhookUrl: process.env.INBOUND_SECRET ? ('https://' + req.get('host') + '/api/inbound/' + req.business.id + '?key=' + process.env.INBOUND_SECRET) : null
}));
// Manually pull new application emails from the resume inbox right now (also runs on the cron).
app.post('/api/inbox/check', h(async (req, res) => {
  if (!INBOX.configured) return res.json({ ok: false, reason: 'not_configured' });
  res.json(await pollMailbox({ limit: 25 }));
}));
// ---------- HR coach (curated tips always; "ask anything" runs on ANTHROPIC_API_KEY) ----------
app.get('/api/hr-coach', h(async (req, res) => {
  const manager = req.user.role === 'owner' || req.user.role === 'manager';
  res.json({
    tips: manager ? hrCoach.managerTips : hrCoach.workerTips,
    askIntro: hrCoach.askIntro,
    suggestions: manager ? hrCoach.askSuggestions : [],
    canAsk: manager,
    askConfigured: AI.configured
  });
}));
app.post('/api/hr-coach/ask', h(async (req, res) => {
  const q = (req.body && req.body.question ? String(req.body.question) : '').trim();
  if (!q) return res.status(400).json({ error: 'Type a question first.' });
  if (!AI.configured) return res.json({ ok: false, reason: 'not_configured' });
  const client = getAnthropic();
  const industry = req.business.industry_id ? ((industryById(req.business.industry_id) || {}).name || '') : '';
  try {
    const resp = await client.messages.create({
      model: AI.model,
      max_tokens: 700,
      system: "You are Offsider's HR coach for a small Australian business — warm, plain-spoken and practical, like a sharp mate who's run teams for years. The person asking is " + (req.user.role === 'owner' ? 'the owner' : 'a manager') + " of " + (industry ? ('a ' + industry + ' business') : 'a small business') + " called " + (req.business.name || 'their business') + ". Give genuinely useful, specific guidance on managing and developing people — tough conversations, feedback, fair process, check-ins, motivation, keeping good people. Use Australian context (Fair Work, the NES, awards) where it matters, but stay human, not legalistic. Be concise: a few short paragraphs or a short list, no preamble, no sign-off. If something is a real legal or safety risk (dismissal, discrimination, bullying, serious safety), say so plainly and suggest they check Offsider's Legal references or get proper advice — you coach, you don't give a legal ruling.",
      messages: [{ role: 'user', content: q.slice(0, 2000) }]
    });
    const answer = ((resp.content || []).find((b) => b.type === 'text') || {}).text || '';
    res.json({ ok: true, answer });
  } catch (e) {
    console.error('hr-coach ask failed:', e.message);
    return res.json({ ok: false, reason: 'ai_failed', error: e.message });
  }
}));
// Send a real test text so the manager can prove the SMS connection actually works (not just env-vars-present).
app.post('/api/sms/test', h(async (req, res) => {
  if (!SMS.configured) return res.json({ sent: false, reason: 'not_configured' });
  const to = (req.body && req.body.to ? String(req.body.to) : '').trim();
  if (!to || to.replace(/\D/g, '').length < 8) return res.status(400).json({ error: 'Enter a valid mobile number to text.' });
  const plain = !!(req.body && req.body.plain); // plain = drop the sender name and send from a number (to rule out alphanumeric sender-ID blocking)
  const opts = { to, body: req.business.name + ': Your Offsider texting is connected. (Test message — no reply needed.)' };
  if (plain) opts.from = '';
  const r = await sendSms(opts);
  res.json(Object.assign({ to: toE164AU(to), provider: SMS.provider, sender: plain ? 'a shared number' : (SMS.from || 'a shared number') }, r));
}));
// Validate the ClickSend account (auth + balance) WITHOUT sending — separates "wrong key / no balance" from "delivered but blocked".
app.get('/api/sms/diagnose', h(async (req, res) => {
  if (!SMS.configured) return res.json({ configured: false });
  const out = { configured: true, provider: SMS.provider, from: SMS.from || '', alpha: !!(SMS.from && /[A-Za-z]/.test(SMS.from)) };
  if (SMS.provider === 'clicksend') {
    try {
      const auth = 'Basic ' + Buffer.from(process.env.CLICKSEND_USERNAME + ':' + process.env.CLICKSEND_API_KEY).toString('base64');
      const r = await fetch('https://rest.clicksend.com/v3/account', { headers: { Authorization: auth } });
      const raw = await r.text(); let j = null; try { j = JSON.parse(raw); } catch (e) {}
      if (!r.ok) { out.auth_ok = false; out.error = 'ClickSend ' + r.status + ((j && j.response_msg) ? ' — ' + j.response_msg : ''); }
      else { const d = (j && j.data) || {}; out.auth_ok = true; out.balance = (d.balance != null ? String(d.balance) : null); out.active = d.active; out.username = d.username || ''; }
    } catch (e) { out.auth_ok = false; out.error = e.message; }
  } else { out.auth_ok = null; out.note = 'Check your provider console for balance and sender setup.'; }
  res.json(out);
}));
app.get('/api/wellbeing', h(async (req, res) => {
  const st = await db.prepare('SELECT * FROM business_settings WHERE business_id = ?').get(req.business.id);
  const eap = (st && (st.eap_name || st.eap_phone || st.eap_url)) ? { name: st.eap_name, phone: st.eap_phone, url: st.eap_url, notes: st.eap_notes } : null;
  res.json({ kit: wellbeingKit, eap });
}));
app.get('/api/notifications/mine', h(async (req, res) => {
  const rows = await db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY read ASC, created_at DESC LIMIT 50').all(req.user.id);
  res.json(rows.map((n) => ({ id: n.id, kind: n.kind, title: n.title, body: n.body, link: n.link, read: !!n.read, created_at: n.created_at })));
}));
app.post('/api/notifications/read', h(async (req, res) => {
  const id = (req.body || {}).id;
  if (id) await db.prepare('UPDATE notifications SET read=1 WHERE id=? AND user_id=?').run(id, req.user.id);
  else await db.prepare('UPDATE notifications SET read=1 WHERE user_id=?').run(req.user.id);
  res.json({ ok: true });
}));

// ---------- tasks (delegate a job — e.g. "check in with the new starter" — to whoever's responsible) ----------
// people you can assign a task to (anyone with a login in the business)
app.get('/api/users', h(async (req, res) => {
  const rows = await db.prepare('SELECT id, name, role FROM users WHERE business_id = ? ORDER BY name').all(req.business.id);
  res.json(rows);
}));
async function taskView(t, meId) {
  const assignee = t.assignee_user_id ? await db.prepare('SELECT name FROM users WHERE id = ?').get(t.assignee_user_id) : null;
  const about = t.about_employee_id ? await db.prepare('SELECT name FROM employees WHERE id = ?').get(t.about_employee_id) : null;
  const creator = t.created_by ? await db.prepare('SELECT name FROM users WHERE id = ?').get(t.created_by) : null;
  return {
    id: t.id, title: t.title, detail: t.detail, due: t.due, status: t.status,
    about_employee_id: t.about_employee_id, about_name: about ? about.name : null,
    assignee_user_id: t.assignee_user_id, assignee_name: assignee ? assignee.name : null,
    created_by: t.created_by, created_by_name: creator ? creator.name : null,
    mine: t.assignee_user_id === meId, created_at: t.created_at, done_at: t.done_at
  };
}
app.get('/api/tasks', h(async (req, res) => {
  const manager = req.user.role === 'owner' || req.user.role === 'manager';
  const rows = manager
    ? await db.prepare("SELECT * FROM tasks WHERE business_id = ? ORDER BY (status='done'), COALESCE(due,'9999'), created_at DESC").all(req.business.id)
    : await db.prepare("SELECT * FROM tasks WHERE business_id = ? AND assignee_user_id = ? ORDER BY (status='done'), COALESCE(due,'9999'), created_at DESC").all(req.business.id, req.user.id);
  res.json(await Promise.all(rows.map((t) => taskView(t, req.user.id))));
}));
app.post('/api/tasks', h(async (req, res) => {
  const b = req.body || {};
  if (!b.title || !String(b.title).trim()) return res.status(400).json({ error: 'Give the task a title.' });
  const id = uid();
  const assignee = b.assignee_user_id || req.user.id; // default to self if unassigned
  await db.prepare('INSERT INTO tasks (id, business_id, title, detail, about_employee_id, assignee_user_id, created_by, due, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
    .run(id, req.business.id, String(b.title).trim(), b.detail || null, b.about_employee_id || null, assignee, req.user.id, b.due || null, 'open', now(), now());
  if (assignee && assignee !== req.user.id) await notify(req.business.id, assignee, 'task', 'New task from ' + req.user.name, String(b.title).trim(), '#/tasks');
  res.json({ id });
}));
app.patch('/api/tasks/:id', h(async (req, res) => {
  const t = await db.prepare('SELECT * FROM tasks WHERE id=? AND business_id=?').get(req.params.id, req.business.id);
  if (!t) return res.status(404).json({ error: 'Not found' });
  const b = req.body || {};
  const pick = (k) => (b[k] !== undefined ? b[k] : t[k]);
  const newAssignee = b.assignee_user_id !== undefined ? b.assignee_user_id : t.assignee_user_id;
  await db.prepare('UPDATE tasks SET title=?, detail=?, about_employee_id=?, assignee_user_id=?, due=?, updated_at=? WHERE id=?')
    .run(String(pick('title') || t.title).trim(), pick('detail'), pick('about_employee_id'), newAssignee, pick('due'), now(), t.id);
  if (newAssignee && newAssignee !== t.assignee_user_id && newAssignee !== req.user.id) {
    await notify(req.business.id, newAssignee, 'task', (req.user.name || 'A manager') + ' pushed you a task', String(pick('title') || t.title).trim(), '#/tasks');
  }
  res.json({ ok: true });
}));
app.post('/api/tasks/:id/done', h(async (req, res) => {
  const t = await db.prepare('SELECT * FROM tasks WHERE id=? AND business_id=?').get(req.params.id, req.business.id);
  if (!t) return res.status(404).json({ error: 'Not found' });
  const reopen = !!(req.body && req.body.reopen);
  await db.prepare('UPDATE tasks SET status=?, done_at=?, done_by=?, updated_at=? WHERE id=?')
    .run(reopen ? 'open' : 'done', reopen ? null : now(), reopen ? null : req.user.id, now(), t.id);
  if (!reopen && t.created_by && t.created_by !== req.user.id) await notify(req.business.id, t.created_by, 'task', 'Task done — ' + (t.title || ''), (req.user.name || 'Someone') + ' marked it complete', '#/tasks');
  res.json({ ok: true });
}));
app.delete('/api/tasks/:id', h(async (req, res) => {
  await db.prepare('DELETE FROM tasks WHERE id=? AND business_id=?').run(req.params.id, req.business.id);
  res.json({ ok: true });
}));

// ---------- Health & Safety: toolbox talks + policy sign-on, hazards, tickets/licences ----------
app.get('/api/safety/library', h(async (req, res) => res.json({ toolbox: safetyKit.toolboxLibrary, policies: safetyKit.policyStarters, severities: safetyKit.severities, hazardIntro: safetyKit.hazardIntro })));
// toolbox talks + policies (shared "items" — kind distinguishes); each is signed on by the crew
app.get('/api/safety/items', h(async (req, res) => {
  const kind = req.query.kind;
  const rows = kind
    ? await db.prepare("SELECT * FROM safety_items WHERE business_id=? AND kind=? AND status='active' ORDER BY created_at DESC").all(req.business.id, kind)
    : await db.prepare("SELECT * FROM safety_items WHERE business_id=? AND status='active' ORDER BY created_at DESC").all(req.business.id);
  const total = (await db.prepare("SELECT COUNT(*) c FROM employees WHERE business_id=? AND status='active'").get(req.business.id)).c;
  const out = [];
  for (const it of rows) {
    const signed = (await db.prepare('SELECT COUNT(*) c FROM safety_signons WHERE item_id=?').get(it.id)).c;
    out.push({ id: it.id, kind: it.kind, title: it.title, body: it.body, created_at: it.created_at, signed: signed, total: total });
  }
  res.json(out);
}));
app.get('/api/safety/items/:id', h(async (req, res) => {
  const it = await db.prepare('SELECT * FROM safety_items WHERE id=? AND business_id=?').get(req.params.id, req.business.id);
  if (!it) return res.status(404).json({ error: 'Not found' });
  const signons = await db.prepare('SELECT * FROM safety_signons WHERE item_id=? ORDER BY signed_at').all(it.id);
  const signedIds = new Set(signons.map((s) => s.employee_id).filter(Boolean));
  const emps = await db.prepare("SELECT id, name FROM employees WHERE business_id=? AND status='active' ORDER BY name").all(req.business.id);
  res.json(Object.assign({}, it, { signons: signons.map((s) => ({ name: s.signed_name, comment: s.comment, signed_at: s.signed_at })), outstanding: emps.filter((e) => !signedIds.has(e.id)).map((e) => e.name) }));
}));
app.post('/api/safety/items', h(async (req, res) => {
  const b = req.body || {};
  if (!b.title || !String(b.title).trim()) return res.status(400).json({ error: 'Give it a title.' });
  const kind = b.kind === 'policy' ? 'policy' : 'toolbox';
  const id = uid();
  await db.prepare('INSERT INTO safety_items (id, business_id, kind, title, body, created_by, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)')
    .run(id, req.business.id, kind, String(b.title).trim(), b.body || null, req.user.id, 'active', now(), now());
  const staff = await db.prepare("SELECT id FROM users WHERE business_id=? AND role='staff'").all(req.business.id);
  for (const s of staff) await notify(req.business.id, s.id, 'safety', (kind === 'policy' ? 'Please read & sign: ' : 'New toolbox talk: ') + String(b.title).trim(), 'Open your home screen to read it and sign on.', '#/');
  res.json({ id });
}));
app.delete('/api/safety/items/:id', h(async (req, res) => {
  await db.prepare('DELETE FROM safety_items WHERE id=? AND business_id=?').run(req.params.id, req.business.id);
  await db.prepare('DELETE FROM safety_signons WHERE item_id=?').run(req.params.id);
  res.json({ ok: true });
}));
app.post('/api/safety/items/:id/sign', h(async (req, res) => {
  const it = await db.prepare('SELECT * FROM safety_items WHERE id=? AND business_id=?').get(req.params.id, req.business.id);
  if (!it) return res.status(404).json({ error: 'Not found' });
  const emp = await myEmployee(req); const empId = emp ? emp.id : (req.user.employee_id || null);
  if (empId) { const ex = await db.prepare('SELECT id FROM safety_signons WHERE item_id=? AND employee_id=?').get(it.id, empId); if (ex) return res.json({ ok: true, already: true }); }
  await db.prepare('INSERT INTO safety_signons (id, business_id, item_id, employee_id, signed_name, comment, signed_at) VALUES (?,?,?,?,?,?,?)')
    .run(uid(), req.business.id, it.id, empId, req.user.name, (req.body && req.body.comment) || null, now());
  await notifyManagers(req.business.id, 'safety', 'Signed: ' + it.title, (req.user.name || 'A worker') + ' signed on' + (req.body && req.body.comment ? ' — “' + req.body.comment + '”' : ''), '#/safety', null);
  res.json({ ok: true });
}));
// what the logged-in worker still needs to read & sign
app.get('/api/me/safety', h(async (req, res) => {
  const emp = await myEmployee(req); const empId = emp ? emp.id : (req.user.employee_id || null);
  const items = await db.prepare("SELECT * FROM safety_items WHERE business_id=? AND status='active' ORDER BY created_at DESC").all(req.business.id);
  const signed = empId ? new Set((await db.prepare('SELECT item_id FROM safety_signons WHERE employee_id=?').all(empId)).map((r) => r.item_id)) : new Set();
  res.json(items.map((it) => ({ id: it.id, kind: it.kind, title: it.title, body: it.body, signed: signed.has(it.id) })));
}));
// hazards / near-misses
app.get('/api/safety/hazards', h(async (req, res) => {
  res.json(await db.prepare("SELECT * FROM hazards WHERE business_id=? ORDER BY (status='actioned'), created_at DESC").all(req.business.id));
}));
app.post('/api/safety/hazards', h(async (req, res) => {
  const b = req.body || {};
  if (!b.title || !String(b.title).trim()) return res.status(400).json({ error: 'What’s the hazard?' });
  const emp = await myEmployee(req);
  const id = uid();
  await db.prepare('INSERT INTO hazards (id, business_id, title, location, severity, detail, reported_by_employee_id, reported_by_name, status, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)')
    .run(id, req.business.id, String(b.title).trim(), b.location || null, b.severity || null, b.detail || null, emp ? emp.id : null, req.user.name, 'open', now());
  await notifyManagers(req.business.id, 'safety', '⚠️ Hazard reported — ' + String(b.title).trim(), (req.user.name || 'Someone') + (b.location ? ' · ' + b.location : '') + (b.severity ? ' · ' + b.severity : ''), '#/safety', null);
  res.json({ id });
}));
app.patch('/api/safety/hazards/:id', h(async (req, res) => {
  const hz = await db.prepare('SELECT * FROM hazards WHERE id=? AND business_id=?').get(req.params.id, req.business.id);
  if (!hz) return res.status(404).json({ error: 'Not found' });
  const b = req.body || {};
  const status = b.status || hz.status;
  await db.prepare('UPDATE hazards SET status=?, action_note=?, actioned_by=?, actioned_at=? WHERE id=?')
    .run(status, b.action_note != null ? b.action_note : hz.action_note, status === 'actioned' ? req.user.name : hz.actioned_by, status === 'actioned' ? now() : hz.actioned_at, hz.id);
  res.json({ ok: true });
}));
app.delete('/api/safety/hazards/:id', h(async (req, res) => {
  await db.prepare('DELETE FROM hazards WHERE id=? AND business_id=?').run(req.params.id, req.business.id);
  res.json({ ok: true });
}));
// tickets, licences & competencies (with expiry)
app.get('/api/safety/competencies', h(async (req, res) => {
  res.json(await db.prepare("SELECT c.*, e.name AS employee_name FROM competencies c JOIN employees e ON e.id=c.employee_id WHERE c.business_id=? ORDER BY COALESCE(c.expires,'9999-12-31')").all(req.business.id));
}));
app.post('/api/safety/competencies', h(async (req, res) => {
  const b = req.body || {};
  if (!b.employee_id || !b.name || !String(b.name).trim()) return res.status(400).json({ error: 'Pick a worker and name the ticket.' });
  const id = uid();
  await db.prepare('INSERT INTO competencies (id, business_id, employee_id, name, issued, expires, note, created_at) VALUES (?,?,?,?,?,?,?,?)')
    .run(id, req.business.id, b.employee_id, String(b.name).trim(), b.issued || null, b.expires || null, b.note || null, now());
  res.json({ id });
}));
app.delete('/api/safety/competencies/:id', h(async (req, res) => {
  await db.prepare('DELETE FROM competencies WHERE id=? AND business_id=?').run(req.params.id, req.business.id);
  res.json({ ok: true });
}));

// ---------- STAFF worker-app: plans, work log, leave, suggestions, training ----------
app.get('/api/me/plans', h(async (req, res) => {
  const e = await myEmployee(req); if (!e) return res.json([]);
  const since = new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10);
  const rows = await db.prepare('SELECT * FROM plans WHERE employee_id = ? AND (plan_date IS NULL OR plan_date >= ?) ORDER BY plan_date DESC, created_at DESC').all(e.id, since);
  res.json(rows.map((p) => ({ id: p.id, period: p.period, plan_date: p.plan_date, title: p.title, items: safeParse(p.items, []), note: p.note, created_at: p.created_at })));
}));
app.get('/api/me/worklog', h(async (req, res) => {
  const e = await myEmployee(req); if (!e) return res.json({ date: today(), entries: [] });
  const date = req.query.date || today();
  const entries = await db.prepare('SELECT * FROM worklog WHERE employee_id = ? AND occurred_on = ? ORDER BY created_at DESC').all(e.id, date);
  res.json({ date, entries });
}));
app.post('/api/me/worklog', h(async (req, res) => {
  const e = await myEmployee(req); if (!e) return res.status(400).json({ error: 'No worker profile.' });
  const b = req.body || {};
  if (!b.label && !b.category && !b.note) return res.status(400).json({ error: 'Nothing to log.' });
  const id = uid();
  await db.prepare('INSERT INTO worklog (id, business_id, employee_id, occurred_on, category, label, quantity, unit, note, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)')
    .run(id, req.business.id, e.id, b.occurred_on || today(), b.category || null, b.label || null, (b.quantity != null && b.quantity !== '') ? Number(b.quantity) : null, b.unit || null, b.note || null, now());
  res.json({ ok: true, id });
}));
app.delete('/api/me/worklog/:id', h(async (req, res) => {
  const e = await myEmployee(req); if (!e) return res.status(400).json({ error: 'No worker profile.' });
  await db.prepare('DELETE FROM worklog WHERE id = ? AND employee_id = ?').run(req.params.id, e.id);
  res.json({ ok: true });
}));
app.get('/api/me/leave', h(async (req, res) => {
  const e = await myEmployee(req); if (!e) return res.json([]);
  res.json(await db.prepare('SELECT * FROM leave_requests WHERE employee_id = ? ORDER BY created_at DESC').all(e.id));
}));
app.post('/api/me/leave', h(async (req, res) => {
  const e = await myEmployee(req); if (!e) return res.status(400).json({ error: 'No worker profile.' });
  const b = req.body || {};
  if (!b.start_date) return res.status(400).json({ error: 'A start date is needed.' });
  const id = uid();
  await db.prepare('INSERT INTO leave_requests (id, business_id, employee_id, leave_type, start_date, end_date, note, status, created_at) VALUES (?,?,?,?,?,?,?,?,?)')
    .run(id, req.business.id, e.id, b.leave_type || null, b.start_date, b.end_date || b.start_date, b.note || null, 'pending', now());
  await notifyManagers(req.business.id, 'leave', e.name + ' requested leave', (b.leave_type || 'Leave') + ' · ' + b.start_date + (b.end_date && b.end_date !== b.start_date ? ' to ' + b.end_date : ''), '#/leave', req.user.id);
  res.json({ ok: true, id });
}));
app.post('/api/me/suggestions', h(async (req, res) => {
  const e = await myEmployee(req); if (!e) return res.status(400).json({ error: 'No worker profile.' });
  const b = req.body || {};
  if (!b.body || !String(b.body).trim()) return res.status(400).json({ error: 'Write something first.' });
  const anon = b.anonymous ? 1 : 0;
  await db.prepare('INSERT INTO suggestions (id, business_id, employee_id, anonymous, category, body, status, created_at) VALUES (?,?,?,?,?,?,?,?)')
    .run(uid(), req.business.id, anon ? null : e.id, anon, b.category || null, String(b.body).trim(), 'new', now());
  await notifyManagers(req.business.id, 'suggestion', (anon ? 'A team member' : e.name) + ' sent a suggestion', (b.category ? '[' + b.category + '] ' : '') + String(b.body).trim().slice(0, 90), '#/suggestions', null);
  res.json({ ok: true });
}));
app.get('/api/me/training', h(async (req, res) => {
  const e = await myEmployee(req); if (!e) return res.json({ wage: null, development: {} });
  res.json({ name: e.name, job_title: e.job_title, classification: e.classification, wage: buildWageView(e, req.business), development: safeParse(e.development, {}) });
}));

// ---------- everything below is MANAGERS ONLY ----------
app.use('/api', requireManager);

// employees
app.get('/api/employees', h(async (req, res) => {
  const rows = await db.prepare('SELECT * FROM employees WHERE business_id = ? ORDER BY name').all(req.business.id);
  const out = await Promise.all(rows.map(async (e) => {
    const open = (await db.prepare("SELECT COUNT(*) c FROM cases WHERE employee_id = ? AND status NOT IN ('resolved')").get(e.id)).c;
    return { ...e, open_cases: open };
  }));
  res.json(out);
}));
app.post('/api/employees', h(async (req, res) => {
  const { name, job_title, employment_type, start_date, starter_profile } = req.body || {};
  if (!name) return res.status(400).json({ error: 'A name is needed.' });
  const id = uid();
  await db.prepare('INSERT INTO employees (id, business_id, name, job_title, employment_type, start_date, status, pathway_id, starter_profile, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)').run(id, req.business.id, name, job_title || null, employment_type || null, start_date || null, 'active', req.business.industry_id || null, starter_profile || null, now());
  res.json(await db.prepare('SELECT * FROM employees WHERE id = ?').get(id));
}));
app.get('/api/employees/:id', h(async (req, res) => {
  const e = await db.prepare('SELECT * FROM employees WHERE id = ? AND business_id = ?').get(req.params.id, req.business.id);
  if (!e) return res.status(404).json({ error: 'Not found' });
  const cases = await db.prepare('SELECT * FROM cases WHERE employee_id = ? ORDER BY updated_at DESC').all(e.id);
  const documents = await db.prepare('SELECT id, template_id, title, created_at FROM documents WHERE employee_id = ? ORDER BY created_at DESC').all(e.id);
  const notes = (await db.prepare('SELECT * FROM notes WHERE employee_id = ? ORDER BY created_at DESC').all(e.id)).map((n) => ({ ...n, tags: safeParse(n.tags, []) }));
  const hasLogin = !!(await db.prepare('SELECT id FROM users WHERE employee_id = ?').get(e.id));
  const wage = buildWageView(e, req.business);
  const schedule = await lifecycleSchedule(e);
  const lessonsProg = (await db.prepare('SELECT * FROM lessons_progress WHERE employee_id = ? ORDER BY assigned_at DESC').all(e.id)).map((r) => { const l = lessonById(r.lesson_id) || {}; return { lesson_id: r.lesson_id, title: l.title || r.lesson_id, competencyLabel: l.competencyLabel || '', status: r.status, score: r.score }; });
  res.json({ ...e, development: safeParse(e.development, {}), cases, documents, notes, wage, hasLogin, schedule, lessons: lessonsProg });
}));
app.patch('/api/employees/:id', h(async (req, res) => {
  const e = await db.prepare('SELECT * FROM employees WHERE id = ? AND business_id = ?').get(req.params.id, req.business.id);
  if (!e) return res.status(404).json({ error: 'Not found' });
  const { name, job_title, employment_type, start_date, status, pathway_id, current_role, development, award_id, classification, pay_rate, pay_basis, starter_profile } = req.body || {};
  await db.prepare('UPDATE employees SET name=?, job_title=?, employment_type=?, start_date=?, status=?, pathway_id=?, current_role=?, development=?, award_id=?, classification=?, pay_rate=?, pay_basis=?, starter_profile=? WHERE id=?').run(
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
  const out = await db.prepare('SELECT * FROM employees WHERE id = ?').get(e.id);
  res.json({ ...out, development: safeParse(out.development, {}), wage: buildWageView(out, req.business) });
}));

// observation notes
app.post('/api/employees/:id/notes', h(async (req, res) => {
  const e = await db.prepare('SELECT * FROM employees WHERE id = ? AND business_id = ?').get(req.params.id, req.business.id);
  if (!e) return res.status(404).json({ error: 'Not found' });
  const { kind, body, tags, occurred_at } = req.body || {};
  if (!body) return res.status(400).json({ error: 'Write a quick note.' });
  const id = uid();
  await db.prepare('INSERT INTO notes (id, business_id, employee_id, kind, body, tags, occurred_at, created_by, created_at) VALUES (?,?,?,?,?,?,?,?,?)').run(id, req.business.id, e.id, kind || 'general', body, (tags && tags.length) ? JSON.stringify(tags) : null, occurred_at || today(), req.user.id, now());
  res.json(await db.prepare('SELECT * FROM notes WHERE id = ?').get(id));
}));
app.delete('/api/notes/:id', h(async (req, res) => {
  await db.prepare('DELETE FROM notes WHERE id = ? AND business_id = ?').run(req.params.id, req.business.id);
  res.json({ ok: true });
}));

// staff login for a worker
app.post('/api/employees/:id/login', h(async (req, res) => {
  const e = await db.prepare('SELECT * FROM employees WHERE id = ? AND business_id = ?').get(req.params.id, req.business.id);
  if (!e) return res.status(404).json({ error: 'Not found' });
  const { email, password } = req.body || {};
  if (!email || !password || String(password).length < 6) return res.status(400).json({ error: 'Need an email and a password of at least 6 characters.' });
  if (await db.prepare('SELECT id FROM users WHERE email = ?').get(String(email).toLowerCase())) return res.status(409).json({ error: 'That email is already in use.' });
  await db.prepare('INSERT INTO users (id, business_id, name, email, password_hash, role, employee_id, created_at) VALUES (?,?,?,?,?,?,?,?)').run(uid(), req.business.id, e.name, String(email).toLowerCase(), bcrypt.hashSync(password, 10), 'staff', e.id, now());
  res.json({ ok: true, email: String(email).toLowerCase() });
}));

// awards
app.get('/api/awards/:id', (req, res) => { const a = awardById(req.params.id); if (!a) return res.status(404).json({ error: 'Unknown award' }); res.json(a); });

// coaching
app.get('/api/note-types', (req, res) => res.json({ noteTypes: coaching.noteTypes || [], tips: coaching.coachingTips || [] }));
app.get('/api/coach', h(async (req, res) => {
  const bid = req.business.id;
  const emps = await db.prepare("SELECT * FROM employees WHERE business_id = ? AND status = 'active'").all(bid);
  const lib = {}; (coaching.nudges || []).forEach((n) => { lib[n.id] = n; });
  const t = today();
  const daysAgo = (d) => (d ? Math.round((new Date(t) - new Date(String(d).slice(0, 10))) / 86400000) : 9999);
  const out = [];
  const mk = (id, e, extra) => { const n = lib[id]; if (!n) return; const first = (e.name || '').split(' ')[0]; const sub = (s) => String(s || '').replace(/\{name\}/g, first); out.push({ id, employee_id: e.id, employee_name: e.name, title: sub(n.title), prompt: sub(n.prompt), why: n.why, tone: n.tone, action: n.action, extra: extra || null }); };
  for (const e of emps) {
    const lastNote = (await db.prepare('SELECT MAX(created_at) m FROM notes WHERE employee_id = ?').get(e.id)).m;
    const lastEvent = (await db.prepare('SELECT MAX(COALESCE(ev.occurred_at, ev.created_at)) m FROM events ev JOIN cases c ON c.id = ev.case_id WHERE c.employee_id = ?').get(e.id)).m;
    const lastTouch = [lastNote, lastEvent].filter(Boolean).sort().pop();
    const interest = await db.prepare("SELECT * FROM notes WHERE employee_id = ? AND kind = 'interest' ORDER BY created_at DESC LIMIT 1").get(e.id);
    const positive = await db.prepare("SELECT * FROM notes WHERE employee_id = ? AND kind = 'positive' ORDER BY created_at DESC LIMIT 1").get(e.id);
    const dev = safeParse(e.development, {}); const goals = dev.goals || []; const skills = dev.skills || {};
    if (daysAgo(e.start_date) <= 45) mk('new_starter', e);
    else if (daysAgo(lastTouch) >= 28) mk('stale_checkin', e);
    if (interest && daysAgo(interest.created_at) >= 10) mk('interest_unactioned', e, interest.body);
    if (positive && daysAgo(positive.created_at) <= 21 && (await db.prepare("SELECT COUNT(*) c FROM cases WHERE employee_id = ? AND flow_id = 'recognition'").get(e.id)).c === 0) mk('recognise_positive', e);
    const wage = buildWageView(e, req.business);
    if (wage && wage.currentRole && wage.nextRole) {
      const steps = wage.currentRole.stepsToNext || [];
      if (steps.length) { const done = steps.filter((s, i) => skills[wage.currentRole.id + ':' + i]).length; if (done / steps.length >= 0.6) mk('near_level_up', e); }
    }
    if (daysAgo(e.start_date) >= 730 && goals.length === 0) mk('same_role_long', e);
  }
  res.json({ nudges: out.slice(0, 8), tips: coaching.coachingTips || [] });
}));

// lifecycle scheduler
app.get('/api/lifecycle', h(async (req, res) => {
  const emps = await db.prepare("SELECT * FROM employees WHERE business_id = ? AND status = 'active'").all(req.business.id);
  const items = [];
  for (const e of emps) {
    let n = 0;
    const sched = await lifecycleSchedule(e);
    for (const m of sched) {
      if (!m.done && m.daysUntil <= 14) { items.push(Object.assign({}, m, { employee_id: e.id, employee_name: e.name })); if (++n >= 3) break; }
    }
  }
  items.sort((a, b) => (a.due < b.due ? -1 : 1));
  res.json(items.slice(0, 12));
}));
app.post('/api/lifecycle/done', h(async (req, res) => {
  const { employee_id, rule_id, occurrence_key, status } = req.body || {};
  const e = await db.prepare('SELECT id FROM employees WHERE id = ? AND business_id = ?').get(employee_id, req.business.id);
  if (!e) return res.status(404).json({ error: 'Not found' });
  await db.prepare('INSERT INTO lifecycle_completions (id, business_id, employee_id, rule_id, occurrence_key, status, created_by, created_at) VALUES (?,?,?,?,?,?,?,?)').run(uid(), req.business.id, employee_id, rule_id, occurrence_key, status === 'skipped' ? 'skipped' : 'done', req.user.id, now());
  res.json({ ok: true });
}));
app.post('/api/employees/:id/reflection', h(async (req, res) => {
  const e = await db.prepare('SELECT * FROM employees WHERE id = ? AND business_id = ?').get(req.params.id, req.business.id);
  if (!e) return res.status(404).json({ error: 'Not found' });
  const { reflectionId, answers, rule_id, occurrence_key } = req.body || {};
  const set = reflectionPrompts.find((r) => r.id === reflectionId);
  if (!set) return res.status(400).json({ error: 'Unknown reflection' });
  let saved = 0;
  for (const q of set.questions) {
    const v = (answers || {})[q.id];
    if (v && String(v).trim()) {
      await db.prepare('INSERT INTO notes (id, business_id, employee_id, kind, body, occurred_at, created_by, created_at) VALUES (?,?,?,?,?,?,?,?)').run(uid(), req.business.id, e.id, q.noteKind || 'general', String(v).trim(), today(), req.user.id, now());
      saved++;
    }
  }
  if (rule_id && occurrence_key) await db.prepare('INSERT INTO lifecycle_completions (id, business_id, employee_id, rule_id, occurrence_key, status, created_by, created_at) VALUES (?,?,?,?,?,?,?,?)').run(uid(), req.business.id, e.id, rule_id, occurrence_key, 'done', req.user.id, now());
  res.json({ ok: true, notes: saved });
}));

// onboarding overview — new starters + their progress
app.get('/api/onboarding', h(async (req, res) => {
  const bid = req.business.id;
  const emps = await db.prepare("SELECT * FROM employees WHERE business_id = ? AND status = 'active'").all(bid);
  const t = today();
  const out = [];
  for (const e of emps) {
    const tenure = e.start_date ? diffDays(t, e.start_date) : null;
    const onbCase = await db.prepare("SELECT id, status FROM cases WHERE employee_id = ? AND flow_id = 'onboarding' ORDER BY created_at DESC LIMIT 1").get(e.id);
    const isNew = (tenure != null && tenure <= 90) || (onbCase && onbCase.status !== 'resolved');
    if (!isNew) continue;
    const onbRules = lifecycleRules.filter((r) => (r.stage === 'onboarding' || r.stage === 'probation') && r.trigger && r.trigger.type === 'after_start' && ruleApplies(r, e, tenure));
    const comps = await db.prepare("SELECT rule_id, occurrence_key FROM lifecycle_completions WHERE employee_id = ? AND status = 'done'").all(e.id);
    const doneSet = new Set(comps.map((c) => c.rule_id + '|' + c.occurrence_key));
    let doneCount = 0;
    for (const r of onbRules) { if (doneSet.has(r.id + '|d' + (r.trigger.days || 0))) doneCount++; }
    const sched = await lifecycleSchedule(e);
    const nextOnb = sched.filter((m) => (m.stage === 'onboarding' || m.stage === 'probation') && !m.done).sort((a, b) => a.daysUntil - b.daysUntil)[0] || null;
    out.push({
      id: e.id, name: e.name, job_title: e.job_title, starter_profile: e.starter_profile, start_date: e.start_date, tenure,
      progress: { done: doneCount, total: onbRules.length },
      next: nextOnb ? { title: nextOnb.title, daysUntil: nextOnb.daysUntil, owner: nextOnb.owner } : null,
      case_id: onbCase ? onbCase.id : null
    });
  }
  out.sort((a, b) => (a.tenure == null ? 9999 : a.tenure) - (b.tenure == null ? 9999 : b.tenure));
  res.json(out);
}));

// lessons — list + assign to a worker
app.get('/api/lessons', (req, res) => res.json(lessons.map((l) => ({ id: l.id, title: l.title, blurb: l.blurb, forRoles: l.forRoles || [], competencyLabel: l.competencyLabel, signsOff: l.signsOff || null, questions: (l.quiz || []).length }))));
app.post('/api/employees/:id/lessons', h(async (req, res) => {
  const e = await db.prepare('SELECT * FROM employees WHERE id = ? AND business_id = ?').get(req.params.id, req.business.id);
  if (!e) return res.status(404).json({ error: 'Not found' });
  const l = lessonById((req.body || {}).lesson_id);
  if (!l) return res.status(400).json({ error: 'Unknown lesson' });
  const existing = await db.prepare('SELECT id FROM lessons_progress WHERE employee_id = ? AND lesson_id = ?').get(e.id, l.id);
  if (existing) return res.json({ ok: true, already: true });
  await db.prepare('INSERT INTO lessons_progress (id, business_id, employee_id, lesson_id, status, assigned_by, assigned_at) VALUES (?,?,?,?,?,?,?)').run(uid(), req.business.id, e.id, l.id, 'assigned', req.user.id, now());
  res.json({ ok: true });
}));

// worker-attached document
app.post('/api/employees/:id/documents', h(async (req, res) => {
  const e = await db.prepare('SELECT * FROM employees WHERE id = ? AND business_id = ?').get(req.params.id, req.business.id);
  if (!e) return res.status(404).json({ error: 'Not found' });
  const { template_id, fields } = req.body || {};
  const tmpl = templateById(template_id);
  if (!tmpl) return res.status(400).json({ error: 'Unknown document' });
  const data = { ...(fields || {}), employeeName: e.name || '', employeeRole: e.job_title || '', businessName: req.business.name, managerName: req.user.name, date: today() };
  const content = fillTemplate(tmpl.body, data);
  const id = uid();
  const title = `${tmpl.name} — ${e.name || ''}`.trim();
  await db.prepare('INSERT INTO documents (id, case_id, employee_id, business_id, template_id, title, fields, content, created_by, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)').run(id, null, e.id, req.business.id, tmpl.id, title, JSON.stringify(fields || {}), content, req.user.id, now());
  res.json(await db.prepare('SELECT * FROM documents WHERE id = ?').get(id));
}));

// config + industries + business
app.get('/api/config', (req, res) => res.json({ impactTags, starterProfiles, reflectionPrompts }));
app.get('/api/industries', (req, res) => res.json(industries.map((i) => ({ id: i.id, name: i.name, icon: i.icon, blurb: i.blurb, roles: (i.pathway && i.pathway.roles || []).length }))));
app.get('/api/industries/:id', (req, res) => { const i = industryById(req.params.id); if (!i) return res.status(404).json({ error: 'Unknown industry' }); res.json(i); });
app.patch('/api/business', h(async (req, res) => {
  const { name, industry, industry_id } = req.body || {};
  const b = req.business;
  await db.prepare('UPDATE businesses SET name=?, industry=?, industry_id=? WHERE id=?').run(name ?? b.name, industry ?? b.industry, industry_id !== undefined ? industry_id : b.industry_id, b.id);
  res.json(await db.prepare('SELECT * FROM businesses WHERE id = ?').get(b.id));
}));

// feedback — manager side
app.get('/api/feedback/templates', (req, res) => res.json(feedbackTemplates.map((t) => ({ id: t.id, name: t.name, audience: t.audience, cadence: t.cadence || 'once', purpose: t.purpose, anonymous_default: !!t.anonymous_default, questions: t.questions }))));
app.get('/api/feedback/requests', h(async (req, res) => {
  const rows = await db.prepare('SELECT * FROM feedback_requests WHERE business_id = ? ORDER BY created_at DESC').all(req.business.id);
  const out = await Promise.all(rows.map(async (r) => {
    const emp = r.employee_id ? await db.prepare('SELECT name FROM employees WHERE id = ?').get(r.employee_id) : null;
    const count = (await db.prepare('SELECT COUNT(*) c FROM feedback_responses WHERE request_id = ?').get(r.id)).c;
    return { id: r.id, title: r.title, audience: r.audience, cadence: r.cadence || 'once', token: r.token, anonymous: !!r.anonymous, status: r.status, employee_name: emp ? emp.name : null, responses: count, created_at: r.created_at };
  }));
  res.json(out);
}));
app.post('/api/feedback/requests', h(async (req, res) => {
  const { template_id, employee_id, anonymous } = req.body || {};
  const tmpl = feedbackTemplateById(template_id);
  if (!tmpl) return res.status(400).json({ error: 'Pick a feedback type.' });
  let emp = null;
  if (employee_id) emp = await db.prepare('SELECT * FROM employees WHERE id = ? AND business_id = ?').get(employee_id, req.business.id);
  const id = uid();
  const token = newToken();
  const anon = anonymous === undefined ? (tmpl.anonymous_default ? 1 : 0) : (anonymous ? 1 : 0);
  const cadence = (req.body && req.body.cadence) || tmpl.cadence || 'once';
  const title = tmpl.name + (emp ? ' — ' + emp.name : '');
  await db.prepare('INSERT INTO feedback_requests (id, business_id, employee_id, template_id, audience, title, token, anonymous, status, cadence, created_by, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').run(id, req.business.id, emp ? emp.id : null, tmpl.id, tmpl.audience, title, token, anon, 'open', cadence, req.user.id, now());
  res.json({ id, token, title, anonymous: !!anon, cadence });
}));
app.get('/api/feedback/requests/:id', h(async (req, res) => {
  const r = await db.prepare('SELECT * FROM feedback_requests WHERE id = ? AND business_id = ?').get(req.params.id, req.business.id);
  if (!r) return res.status(404).json({ error: 'Not found' });
  const tmpl = feedbackTemplateById(r.template_id) || { questions: [] };
  const emp = r.employee_id ? await db.prepare('SELECT name FROM employees WHERE id = ?').get(r.employee_id) : null;
  const responses = (await db.prepare('SELECT * FROM feedback_responses WHERE request_id = ? ORDER BY submitted_at DESC').all(r.id)).map((x) => ({ id: x.id, answers: safeParse(x.answers, {}), anonymous: !!x.anonymous, submitted_by: x.submitted_by, submitted_at: x.submitted_at }));
  res.json({ id: r.id, title: r.title, audience: r.audience, token: r.token, anonymous: !!r.anonymous, status: r.status, employee_name: emp ? emp.name : null, template: { id: tmpl.id, name: tmpl.name, intro: tmpl.intro, questions: tmpl.questions || [] }, responses });
}));
app.patch('/api/feedback/requests/:id', h(async (req, res) => {
  const r = await db.prepare('SELECT * FROM feedback_requests WHERE id = ? AND business_id = ?').get(req.params.id, req.business.id);
  if (!r) return res.status(404).json({ error: 'Not found' });
  const { status } = req.body || {};
  await db.prepare('UPDATE feedback_requests SET status=? WHERE id=?').run(status || r.status, r.id);
  res.json({ ok: true });
}));

// cases
app.get('/api/cases', h(async (req, res) => {
  const rows = await db.prepare('SELECT * FROM cases WHERE business_id = ? ORDER BY updated_at DESC').all(req.business.id);
  const out = await Promise.all(rows.map(async (c) => {
    const emp = (await db.prepare('SELECT name, job_title FROM employees WHERE id = ?').get(c.employee_id)) || {};
    const f = flowById(c.flow_id);
    return { ...c, state: undefined, employee_name: emp.name, employee_title: emp.job_title, flow_name: f ? f.name : c.flow_id, flow_icon: f ? f.icon : '' };
  }));
  res.json(out);
}));
app.post('/api/cases', h(async (req, res) => {
  const { employee_id, flow_id, title } = req.body || {};
  const emp = await db.prepare('SELECT * FROM employees WHERE id = ? AND business_id = ?').get(employee_id, req.business.id);
  const flow = flowById(flow_id);
  if (!emp || !flow) return res.status(400).json({ error: 'Pick a worker and a situation.' });
  const id = uid();
  await db.prepare('INSERT INTO cases (id, business_id, employee_id, flow_id, title, sentiment, status, current_node, state, created_by, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').run(id, req.business.id, emp.id, flow.id, title || `${flow.name} — ${emp.name}`, flow.sentiment, 'open', flow.startNode, '{}', req.user.id, now(), now());
  await db.prepare('INSERT INTO events (id, case_id, business_id, kind, summary, occurred_at, created_by, created_at) VALUES (?,?,?,?,?,?,?,?)').run(uid(), id, req.business.id, 'system', `Case opened: ${flow.name}`, today(), req.user.id, now());
  res.json(await caseView(await db.prepare('SELECT * FROM cases WHERE id = ?').get(id)));
}));
app.get('/api/cases/:id', h(async (req, res) => {
  const c = await db.prepare('SELECT * FROM cases WHERE id = ? AND business_id = ?').get(req.params.id, req.business.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  res.json(await caseView(c));
}));
app.patch('/api/cases/:id', h(async (req, res) => {
  const c = await db.prepare('SELECT * FROM cases WHERE id = ? AND business_id = ?').get(req.params.id, req.business.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  const { state, current_node, status, title, next_check_in } = req.body || {};
  await db.prepare('UPDATE cases SET state=?, current_node=?, status=?, title=?, next_check_in=?, updated_at=? WHERE id=?').run(
    state !== undefined ? JSON.stringify(state) : c.state,
    current_node !== undefined ? current_node : c.current_node,
    status || c.status, title || c.title,
    next_check_in !== undefined ? next_check_in : c.next_check_in,
    now(), c.id
  );
  res.json(await caseView(await db.prepare('SELECT * FROM cases WHERE id = ?').get(c.id)));
}));

// timeline events
app.post('/api/cases/:id/events', h(async (req, res) => {
  const c = await db.prepare('SELECT * FROM cases WHERE id = ? AND business_id = ?').get(req.params.id, req.business.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  const { kind, summary, detail, occurred_at, tags } = req.body || {};
  if (!summary) return res.status(400).json({ error: 'Add a short note of what happened.' });
  const id = uid();
  await db.prepare('INSERT INTO events (id, case_id, business_id, kind, summary, detail, occurred_at, tags, created_by, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)').run(id, c.id, req.business.id, kind || 'note', summary, detail || null, occurred_at || today(), (tags && tags.length) ? JSON.stringify(tags) : null, req.user.id, now());
  await db.prepare('UPDATE cases SET updated_at=? WHERE id=?').run(now(), c.id);
  res.json(await db.prepare('SELECT * FROM events WHERE id = ?').get(id));
}));

// generate a document from a template (in a case)
app.post('/api/cases/:id/documents', h(async (req, res) => {
  const c = await db.prepare('SELECT * FROM cases WHERE id = ? AND business_id = ?').get(req.params.id, req.business.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  const { template_id, fields } = req.body || {};
  const tmpl = templateById(template_id);
  if (!tmpl) return res.status(400).json({ error: 'Unknown document' });
  const emp = (await db.prepare('SELECT * FROM employees WHERE id = ?').get(c.employee_id)) || {};
  const data = { ...(fields || {}), employeeName: emp.name || '', employeeRole: emp.job_title || '', businessName: req.business.name, managerName: req.user.name, date: today() };
  const content = fillTemplate(tmpl.body, data);
  const id = uid();
  const title = `${tmpl.name} — ${emp.name || ''}`.trim();
  await db.prepare('INSERT INTO documents (id, case_id, business_id, template_id, title, fields, content, created_by, created_at) VALUES (?,?,?,?,?,?,?,?,?)').run(id, c.id, req.business.id, tmpl.id, title, JSON.stringify(fields || {}), content, req.user.id, now());
  await db.prepare('INSERT INTO events (id, case_id, business_id, kind, summary, occurred_at, created_by, created_at) VALUES (?,?,?,?,?,?,?,?)').run(uid(), c.id, req.business.id, 'document', `Created document: ${tmpl.name}`, today(), req.user.id, now());
  await db.prepare('UPDATE cases SET updated_at=? WHERE id=?').run(now(), c.id);
  res.json(await db.prepare('SELECT * FROM documents WHERE id = ?').get(id));
}));

app.get('/api/documents', h(async (req, res) => {
  const rows = await db.prepare('SELECT d.*, COALESCE(ec.name, ed.name) AS employee_name FROM documents d LEFT JOIN cases c ON c.id = d.case_id LEFT JOIN employees ec ON ec.id = c.employee_id LEFT JOIN employees ed ON ed.id = d.employee_id WHERE d.business_id = ? ORDER BY d.created_at DESC').all(req.business.id);
  res.json(rows.map((d) => ({ id: d.id, case_id: d.case_id, employee_id: d.employee_id, template_id: d.template_id, title: d.title, employee_name: d.employee_name, created_at: d.created_at })));
}));
app.get('/api/documents/:id', h(async (req, res) => {
  const d = await db.prepare('SELECT * FROM documents WHERE id = ? AND business_id = ?').get(req.params.id, req.business.id);
  if (!d) return res.status(404).json({ error: 'Not found' });
  res.json({ ...d, fields: safeParse(d.fields, {}) });
}));

// dashboard
app.get('/api/dashboard', h(async (req, res) => {
  const bid = req.business.id;
  const cases = await db.prepare('SELECT * FROM cases WHERE business_id = ?').all(bid);
  const employees = (await db.prepare('SELECT COUNT(*) c FROM employees WHERE business_id = ?').get(bid)).c;
  const docs = (await db.prepare('SELECT COUNT(*) c FROM documents WHERE business_id = ?').get(bid)).c;
  const open = cases.filter((c) => c.status !== 'resolved');
  const t = today();
  const attention = [];
  for (const c of open) {
    const emp = (await db.prepare('SELECT name FROM employees WHERE id = ?').get(c.employee_id)) || {};
    const f = flowById(c.flow_id);
    const last = (await db.prepare('SELECT MAX(COALESCE(occurred_at, created_at)) m FROM events WHERE case_id = ?').get(c.id)).m;
    let reason = null;
    if (c.next_check_in && c.next_check_in <= t) reason = 'Check-in due';
    else if (last && daysBetween(last, t) >= 14) reason = `No activity for ${daysBetween(last, t)} days`;
    if (reason) attention.push({ id: c.id, title: c.title, employee_name: emp.name, flow_name: f ? f.name : c.flow_id, flow_icon: f ? f.icon : '', sentiment: c.sentiment, reason, next_check_in: c.next_check_in });
  }
  const recentSorted = cases.slice().sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1)).slice(0, 6);
  const recent = await Promise.all(recentSorted.map(async (c) => {
    const emp = (await db.prepare('SELECT name FROM employees WHERE id = ?').get(c.employee_id)) || {};
    const f = flowById(c.flow_id);
    return { id: c.id, title: c.title, status: c.status, sentiment: c.sentiment, employee_name: emp.name, flow_name: f ? f.name : c.flow_id, flow_icon: f ? f.icon : '', updated_at: c.updated_at };
  }));
  const inDevelopment = (await db.prepare('SELECT COUNT(*) c FROM employees WHERE business_id = ? AND current_role IS NOT NULL').get(bid)).c;
  const feedbackResponses = (await db.prepare('SELECT COUNT(*) c FROM feedback_responses WHERE business_id = ?').get(bid)).c;
  const openFeedback = (await db.prepare("SELECT COUNT(*) c FROM feedback_requests WHERE business_id = ? AND status = 'open'").get(bid)).c;
  res.json({
    stats: { employees, openCases: open.length, positive: open.filter((c) => c.sentiment === 'positive').length, watch: open.filter((c) => c.sentiment !== 'positive').length, documents: docs, inDevelopment, feedbackResponses, openFeedback },
    industrySet: !!req.business.industry_id, attention, recent
  });
}));

// ---------- RECRUITMENT (candidates) — managers only ----------
app.get('/api/interview-kit', (req, res) => res.json(interviewKit));
app.get('/api/candidates', h(async (req, res) => {
  res.json(await db.prepare('SELECT id, name, email, phone, role_applied, status, created_at, updated_at FROM candidates WHERE business_id = ? ORDER BY updated_at DESC').all(req.business.id));
}));
app.post('/api/candidates', h(async (req, res) => {
  const { name, email, phone, role_applied } = req.body || {};
  if (!name || !String(name).trim()) return res.status(400).json({ error: 'A name is needed.' });
  const id = uid(); const token = newToken();
  await db.prepare('INSERT INTO candidates (id, business_id, name, email, phone, role_applied, status, token, created_by, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
    .run(id, req.business.id, String(name).trim(), email || null, phone || null, role_applied || null, 'new', token, req.user.id, now(), now());
  res.json({ id, token });
}));
app.get('/api/candidates/:id', h(async (req, res) => {
  const c = await db.prepare('SELECT * FROM candidates WHERE id = ? AND business_id = ?').get(req.params.id, req.business.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  const sched = await db.prepare('SELECT * FROM interviews WHERE candidate_id = ?').get(c.id);
  const files = await db.prepare('SELECT id, kind, name, mime, created_at FROM candidate_files WHERE candidate_id = ? ORDER BY created_at DESC').all(c.id);
  res.json({ ...c, application: safeParse(c.application, null), interview: safeParse(c.interview, null), offer: safeParse(c.offer, null), schedule: sched ? { scheduled_at: sched.scheduled_at, location: sched.location, note: sched.note } : null, files });
}));
app.patch('/api/candidates/:id', h(async (req, res) => {
  const c = await db.prepare('SELECT * FROM candidates WHERE id = ? AND business_id = ?').get(req.params.id, req.business.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  const b = req.body || {};
  const pick = (k, col) => (b[k] != null ? b[k] : c[col != null ? col : k]);
  await db.prepare('UPDATE candidates SET name=?, email=?, phone=?, role_applied=?, status=?, resume_text=?, interview=?, updated_at=? WHERE id=?')
    .run(pick('name'), pick('email'), pick('phone'), pick('role_applied'), pick('status'), pick('resume_text'), b.interview != null ? JSON.stringify(b.interview) : c.interview, now(), c.id);
  res.json({ ok: true });
}));
app.post('/api/candidates/:id/offer', h(async (req, res) => {
  const c = await db.prepare('SELECT * FROM candidates WHERE id = ? AND business_id = ?').get(req.params.id, req.business.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  const { rate, pay_basis, start_date, employment_type, message } = req.body || {};
  const offer = { rate: rate || '', pay_basis: pay_basis || 'hour', start_date: start_date || '', employment_type: employment_type || 'Full time', message: message || '', sent_at: now() };
  await db.prepare('UPDATE candidates SET offer=?, status=?, updated_at=? WHERE id=?').run(JSON.stringify(offer), 'offer', now(), c.id);
  const basis = pay_basis === 'year' ? 'year' : pay_basis === 'week' ? 'week' : 'hour';
  const rateStr = rate ? ('$' + rate + '/' + basis) : 'as discussed';
  const data = { candidateName: c.name, roleTitle: c.role_applied || 'the role', businessName: req.business.name, rate: rateStr, startDate: start_date || 'to be confirmed', managerName: req.user.name, date: today(), message: message || '' };
  const ol = interviewKit.offerLetter || { subject: '', body: '' };
  res.json({ subject: fillTemplate(ol.subject, data), body: fillTemplate(ol.body, data), acceptPath: '/c/' + c.token });
}));
app.post('/api/candidates/:id/hire', h(async (req, res) => {
  const c = await db.prepare('SELECT * FROM candidates WHERE id = ? AND business_id = ?').get(req.params.id, req.business.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  if (c.hired_employee_id) return res.json({ employee_id: c.hired_employee_id, already: true });
  const offer = safeParse(c.offer, {});
  const empId = uid();
  await db.prepare('INSERT INTO employees (id, business_id, name, job_title, employment_type, start_date, status, pathway_id, pay_rate, pay_basis, starter_profile, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
    .run(empId, req.business.id, c.name, c.role_applied || null, offer.employment_type || 'Full time', offer.start_date || today(), 'active', req.business.industry_id || null, offer.rate ? (Number(offer.rate) || null) : null, offer.pay_basis || 'hour', 'new_to_industry', now());
  const flow = flowById('onboarding');
  if (flow) {
    const cid = uid();
    await db.prepare('INSERT INTO cases (id, business_id, employee_id, flow_id, title, sentiment, status, current_node, state, created_by, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
      .run(cid, req.business.id, empId, 'onboarding', 'Onboarding — ' + c.name, 'positive', 'open', flow.startNode, '{}', req.user.id, now(), now());
    await db.prepare('INSERT INTO events (id, case_id, business_id, kind, summary, occurred_at, created_by, created_at) VALUES (?,?,?,?,?,?,?,?)')
      .run(uid(), cid, req.business.id, 'system', 'Hired through recruitment — onboarding started', today(), req.user.id, now());
  }
  await db.prepare('UPDATE candidates SET status=?, hired_employee_id=?, updated_at=? WHERE id=?').run('hired', empId, now(), c.id);
  res.json({ employee_id: empId });
}));

// candidate files (resume etc.)
app.post('/api/candidates/:id/files', h(async (req, res) => {
  const c = await db.prepare('SELECT id FROM candidates WHERE id=? AND business_id=?').get(req.params.id, req.business.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  const b = req.body || {};
  if (!b.name || !b.data) return res.status(400).json({ error: 'No file.' });
  const data = String(b.data).replace(/^data:[^,]*,/, '');
  if (Math.floor(data.length * 3 / 4) > 6 * 1024 * 1024) return res.status(413).json({ error: 'File too big — keep it under about 6MB.' });
  const id = uid();
  await db.prepare('INSERT INTO candidate_files (id, business_id, candidate_id, kind, name, mime, data, created_at) VALUES (?,?,?,?,?,?,?,?)')
    .run(id, req.business.id, c.id, b.kind || 'resume', b.name, b.mime || 'application/octet-stream', data, now());
  if (AI.configured && (b.kind || 'resume') === 'resume') aiFillCandidateFromResume(req.business.id, c.id, {}).catch(() => {});
  res.json({ ok: true, id });
}));
app.get('/api/candidate-files/:id/download', h(async (req, res) => {
  const f = await db.prepare('SELECT * FROM candidate_files WHERE id=? AND business_id=?').get(req.params.id, req.business.id);
  if (!f) return res.status(404).send('Not found');
  res.setHeader('Content-Type', f.mime || 'application/octet-stream');
  res.setHeader('Content-Disposition', 'inline; filename="' + String(f.name || 'file').replace(/[^\w.\- ]/g, '_') + '"');
  res.send(Buffer.from(f.data, 'base64'));
}));
app.delete('/api/candidate-files/:id', h(async (req, res) => {
  await db.prepare('DELETE FROM candidate_files WHERE id=? AND business_id=?').run(req.params.id, req.business.id);
  res.json({ ok: true });
}));
// AI: read the résumé and auto-fill the candidate's name / email / phone (+ a short summary)
app.post('/api/candidates/:id/parse-resume', h(async (req, res) => {
  const c = await db.prepare('SELECT id FROM candidates WHERE id=? AND business_id=?').get(req.params.id, req.business.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  if (!AI.configured) return res.json({ ok: false, reason: 'not_configured' });
  const r = await aiFillCandidateFromResume(req.business.id, c.id, { overwrite: !!(req.body && req.body.overwrite) });
  res.json(r);
}));

// interview scheduling
app.put('/api/candidates/:id/interview-time', h(async (req, res) => {
  const c = await db.prepare('SELECT id, name FROM candidates WHERE id=? AND business_id=?').get(req.params.id, req.business.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  const b = req.body || {};
  const ex = await db.prepare('SELECT candidate_id FROM interviews WHERE candidate_id=?').get(c.id);
  if (ex) await db.prepare('UPDATE interviews SET scheduled_at=?, location=?, note=?, prefill_sent=0, reminder_sent=0, updated_at=? WHERE candidate_id=?').run(b.scheduled_at || null, b.location || null, b.note || null, now(), c.id);
  else await db.prepare('INSERT INTO interviews (candidate_id, business_id, scheduled_at, location, note, updated_at) VALUES (?,?,?,?,?,?)').run(c.id, req.business.id, b.scheduled_at || null, b.location || null, b.note || null, now());
  if (b.scheduled_at) await notifyManagers(req.business.id, 'interview', 'Interview booked — ' + c.name, fmtWhen(b.scheduled_at) + (b.location ? ' · ' + b.location : ''), '#/candidate/' + c.id, null);
  res.json({ ok: true });
}));
app.delete('/api/candidates/:id/interview-time', h(async (req, res) => {
  await db.prepare('DELETE FROM interviews WHERE candidate_id=? AND business_id=?').run(req.params.id, req.business.id);
  res.json({ ok: true });
}));
app.get('/api/interviews/upcoming', h(async (req, res) => {
  res.json(await db.prepare('SELECT i.*, c.name AS candidate_name, c.role_applied FROM interviews i JOIN candidates c ON c.id=i.candidate_id WHERE i.business_id=? AND i.scheduled_at IS NOT NULL ORDER BY i.scheduled_at').all(req.business.id));
}));

// email the application form / a reference request (uses the email integration)
app.post('/api/candidates/:id/send-application', h(async (req, res) => {
  const c = await db.prepare('SELECT * FROM candidates WHERE id=? AND business_id=?').get(req.params.id, req.business.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  const channel = (req.body && req.body.channel) || 'email';
  const link = 'https://' + req.get('host') + '/c/' + c.token;
  const fn = c.name.split(' ')[0];
  if (channel === 'sms') {
    if (!c.phone) return res.json({ sent: false, reason: 'no_phone' });
    const r = await sendSms({ to: c.phone, body: req.business.name + ': Hi ' + fn + ', thanks for your interest. Quick form before we chat (2 min): ' + link });
    return res.json(Object.assign({ to: c.phone, link, channel }, r));
  }
  if (!c.email) return res.json({ sent: false, reason: 'no_email' });
  const body = 'Hi ' + fn + ',\n\nThanks for your interest in the ' + (c.role_applied || 'role') + ' at ' + req.business.name + '. Before we have a chat, could you fill out this quick form? It only takes a couple of minutes.\n\n' + link + '\n\nCheers,\n' + req.user.name + '\n' + req.business.name;
  const r = await sendEmail({ to: c.email, subject: 'Quick application form — ' + req.business.name, text: body });
  res.json(Object.assign({ to: c.email, link, channel }, r));
}));
app.post('/api/references/:id/send', h(async (req, res) => {
  const r = await db.prepare('SELECT * FROM candidate_references WHERE id=? AND business_id=?').get(req.params.id, req.business.id);
  if (!r) return res.status(404).json({ error: 'Not found' });
  const channel = (req.body && req.body.channel) || 'email';
  const c = await db.prepare('SELECT name, role_applied FROM candidates WHERE id=?').get(r.candidate_id);
  const link = 'https://' + req.get('host') + '/r/' + r.token;
  if (channel === 'sms') {
    if (!r.phone) return res.json({ sent: false, reason: 'no_phone' });
    const msg = req.business.name + ': Hi ' + (r.referee_name || 'there') + ', ' + (c ? c.name : 'a candidate') + ' listed you as a referee. Quick confidential reference here: ' + link;
    const sr = await sendSms({ to: r.phone, body: msg });
    return res.json(Object.assign({ to: r.phone, link, channel }, sr));
  }
  if (!r.email) return res.json({ sent: false, reason: 'no_email' });
  const body = 'Hi ' + (r.referee_name || 'there') + ',\n\n' + req.user.name + ' from ' + req.business.name + ' here. ' + (c ? c.name : 'A candidate') + ' has applied for ' + (c && c.role_applied ? 'the ' + c.role_applied + ' role' : 'a role') + ' and listed you as a referee. Could you fill out a short, confidential reference here? It only takes a few minutes:\n\n' + link + '\n\nThanks very much,\n' + req.user.name + '\n' + req.business.name;
  const er = await sendEmail({ to: r.email, subject: 'Reference request — ' + (c ? c.name : 'a candidate'), text: body });
  res.json(Object.assign({ to: r.email, link, channel }, er));
}));
// Ask the CANDIDATE (after the interview) to list their referees via a link — they load straight back in.
app.post('/api/candidates/:id/request-references', h(async (req, res) => {
  const c = await db.prepare('SELECT * FROM candidates WHERE id=? AND business_id=?').get(req.params.id, req.business.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  const channel = (req.body && req.body.channel) || 'email';
  const link = 'https://' + req.get('host') + '/refs/' + c.token;
  const fn = (c.name || '').split(' ')[0] || 'there';
  if (channel === 'sms') {
    if (!c.phone) return res.json({ sent: false, reason: 'no_phone' });
    const sr = await sendSms({ to: c.phone, body: req.business.name + ': Hi ' + fn + ', thanks for coming in. Could you add a couple of referees here? Takes a minute: ' + link });
    return res.json(Object.assign({ to: c.phone, link, channel }, sr));
  }
  if (!c.email) return res.json({ sent: false, reason: 'no_email' });
  const body = 'Hi ' + fn + ',\n\nThanks for coming in to chat with us. To move things along, could you add a couple of references here — just their name, how you know them, and a phone or email? It only takes a minute:\n\n' + link + '\n\nThanks,\n' + req.user.name + '\n' + req.business.name;
  const er = await sendEmail({ to: c.email, subject: 'Your references — ' + req.business.name, text: body });
  res.json(Object.assign({ to: c.email, link, channel }, er));
}));

// quick-add an applicant by pasting a Seek/Indeed email (+ optional resume) — no integration needed
app.post('/api/candidates/from-email', h(async (req, res) => {
  const b = req.body || {};
  const text = b.text || '';
  if (!String(text).trim() && !(b.resume && b.resume.data) && !(b.name && String(b.name).trim())) return res.status(400).json({ error: 'Paste the email, add a name, or attach a resume.' });
  const parsed = parseApplicationEmail(b.subject || '', text);
  if (b.name && String(b.name).trim()) parsed.name = String(b.name).trim();
  if (b.email) parsed.email = b.email;
  if (b.phone) parsed.phone = b.phone;
  const id = await createApplicantCandidate(req.business.id, parsed, { role: b.role || null, note: text || null, resume: b.resume });
  if (AI.configured) aiFillCandidateFromResume(req.business.id, id, {}).catch(() => {});
  res.json({ ok: true, id, parsed });
}));

// ---------- job openings (own careers page + self-apply links) ----------
app.get('/api/job-ad-kit', (req, res) => res.json(jobAdKit));
app.get('/api/job-openings', h(async (req, res) => {
  const rows = await db.prepare('SELECT * FROM job_openings WHERE business_id = ? ORDER BY created_at DESC').all(req.business.id);
  const out = await Promise.all(rows.map(async (j) => {
    const cc = (await db.prepare('SELECT COUNT(*) c FROM candidates WHERE business_id = ? AND role_applied = ?').get(req.business.id, j.title)).c;
    return { id: j.id, title: j.title, blurb: j.blurb, location: j.location, employment_type: j.employment_type, pay_note: j.pay_note, status: j.status, token: j.token, applicants: cc };
  }));
  res.json(out);
}));
app.post('/api/job-openings', h(async (req, res) => {
  const b = req.body || {};
  if (!b.title || !String(b.title).trim()) return res.status(400).json({ error: 'A title is needed.' });
  const id = uid(); const token = newToken();
  await db.prepare('INSERT INTO job_openings (id, business_id, title, blurb, location, employment_type, pay_note, status, token, created_by, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
    .run(id, req.business.id, String(b.title).trim(), b.blurb || null, b.location || null, b.employment_type || null, b.pay_note || null, 'open', token, req.user.id, now());
  res.json({ ok: true, id, token });
}));
app.patch('/api/job-openings/:id', h(async (req, res) => {
  const j = await db.prepare('SELECT * FROM job_openings WHERE id=? AND business_id=?').get(req.params.id, req.business.id);
  if (!j) return res.status(404).json({ error: 'Not found' });
  const b = req.body || {};
  const pick = (k) => (b[k] != null ? b[k] : j[k]);
  await db.prepare('UPDATE job_openings SET title=?, blurb=?, location=?, employment_type=?, pay_note=?, status=? WHERE id=?')
    .run(pick('title'), pick('blurb'), pick('location'), pick('employment_type'), pick('pay_note'), pick('status'), j.id);
  res.json({ ok: true });
}));
app.delete('/api/job-openings/:id', h(async (req, res) => {
  await db.prepare('DELETE FROM job_openings WHERE id=? AND business_id=?').run(req.params.id, req.business.id);
  res.json({ ok: true });
}));

// ---------- worker-app management: plans, productivity, leave, suggestions ----------
app.post('/api/employees/:id/plans', h(async (req, res) => {
  const e = await db.prepare('SELECT * FROM employees WHERE id=? AND business_id=?').get(req.params.id, req.business.id);
  if (!e) return res.status(404).json({ error: 'Not found' });
  const b = req.body || {};
  const id = uid();
  await db.prepare('INSERT INTO plans (id, business_id, employee_id, period, plan_date, title, items, note, created_by, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)')
    .run(id, req.business.id, e.id, b.period || 'day', b.plan_date || today(), b.title || null, JSON.stringify(b.items || []), b.note || null, req.user.id, now());
  await notify(req.business.id, await userIdForEmployee(e.id), 'plan', 'New ' + (b.period === 'week' ? 'weekly' : 'daily') + ' plan', b.title || 'Your plan is ready', '#/');
  res.json({ ok: true, id });
}));
app.get('/api/employees/:id/plans', h(async (req, res) => {
  const e = await db.prepare('SELECT id FROM employees WHERE id=? AND business_id=?').get(req.params.id, req.business.id);
  if (!e) return res.status(404).json({ error: 'Not found' });
  const rows = await db.prepare('SELECT * FROM plans WHERE employee_id=? ORDER BY plan_date DESC, created_at DESC LIMIT 30').all(e.id);
  res.json(rows.map((p) => ({ id: p.id, period: p.period, plan_date: p.plan_date, title: p.title, items: safeParse(p.items, []), note: p.note, created_at: p.created_at })));
}));
app.get('/api/employees/:id/worklog', h(async (req, res) => {
  const e = await db.prepare('SELECT id FROM employees WHERE id=? AND business_id=?').get(req.params.id, req.business.id);
  if (!e) return res.status(404).json({ error: 'Not found' });
  const from = req.query.from || new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const to = req.query.to || today();
  res.json(await db.prepare('SELECT * FROM worklog WHERE employee_id=? AND occurred_on >= ? AND occurred_on <= ? ORDER BY occurred_on DESC, created_at DESC').all(e.id, from, to));
}));
app.get('/api/productivity', h(async (req, res) => {
  const days = Math.min(parseInt(req.query.days || '7', 10) || 7, 60);
  const from = new Date(Date.now() - (days - 1) * 86400000).toISOString().slice(0, 10);
  const rows = await db.prepare('SELECT w.employee_id, e.name AS name, w.occurred_on, w.category, w.quantity FROM worklog w JOIN employees e ON e.id = w.employee_id WHERE w.business_id = ? AND w.occurred_on >= ?').all(req.business.id, from);
  const byWorker = {};
  for (const r of rows) {
    const w = byWorker[r.employee_id] || (byWorker[r.employee_id] = { employee_id: r.employee_id, name: r.name, entries: 0, days: {}, byCategory: {} });
    w.entries++; w.days[r.occurred_on] = 1;
    const c = r.category || 'other'; w.byCategory[c] = (w.byCategory[c] || 0) + 1;
  }
  const workers = Object.keys(byWorker).map((k) => { const w = byWorker[k]; return { employee_id: w.employee_id, name: w.name, entries: w.entries, activeDays: Object.keys(w.days).length, byCategory: w.byCategory }; }).sort((a, b) => b.entries - a.entries);
  res.json({ from, days, workers });
}));
app.get('/api/leave', h(async (req, res) => {
  res.json(await db.prepare("SELECT l.*, e.name AS employee_name FROM leave_requests l JOIN employees e ON e.id = l.employee_id WHERE l.business_id = ? ORDER BY (l.status = 'pending') DESC, l.created_at DESC").all(req.business.id));
}));
app.post('/api/leave/:id/decide', h(async (req, res) => {
  const l = await db.prepare('SELECT * FROM leave_requests WHERE id=? AND business_id=?').get(req.params.id, req.business.id);
  if (!l) return res.status(404).json({ error: 'Not found' });
  const status = (req.body || {}).status === 'approved' ? 'approved' : 'declined';
  await db.prepare('UPDATE leave_requests SET status=?, decided_by=?, decided_at=?, decision_note=? WHERE id=?').run(status, req.user.id, now(), (req.body || {}).decision_note || null, l.id);
  await notify(req.business.id, await userIdForEmployee(l.employee_id), 'leave', 'Leave ' + status, (l.leave_type || 'Leave') + ' · ' + l.start_date + (status === 'approved' ? ' — approved ✓' : ' — not approved'), '#/leave');
  res.json({ ok: true });
}));
app.get('/api/suggestions', h(async (req, res) => {
  const rows = await db.prepare("SELECT s.*, e.name AS employee_name FROM suggestions s LEFT JOIN employees e ON e.id = s.employee_id WHERE s.business_id = ? ORDER BY (s.status = 'new') DESC, s.created_at DESC").all(req.business.id);
  res.json(rows.map((s) => ({ id: s.id, category: s.category, body: s.body, status: s.status, anonymous: !!s.anonymous, employee_name: s.anonymous ? null : s.employee_name, created_at: s.created_at })));
}));
app.post('/api/suggestions/:id/status', h(async (req, res) => {
  await db.prepare('UPDATE suggestions SET status=? WHERE id=? AND business_id=?').run((req.body || {}).status || 'seen', req.params.id, req.business.id);
  res.json({ ok: true });
}));

// ---------- manager academy + EAP/wellbeing settings ----------
app.get('/api/academy', h(async (req, res) => {
  const rows = await db.prepare('SELECT lesson_id FROM academy_progress WHERE user_id = ?').all(req.user.id);
  res.json({ intro: managerAcademy.intro, modules: managerAcademy.modules, done: rows.map((r) => r.lesson_id) });
}));
app.post('/api/academy/:lessonId', h(async (req, res) => {
  const ex = await db.prepare('SELECT id FROM academy_progress WHERE user_id = ? AND lesson_id = ?').get(req.user.id, req.params.lessonId);
  if (!ex) await db.prepare('INSERT INTO academy_progress (id, business_id, user_id, lesson_id, completed_at) VALUES (?,?,?,?,?)').run(uid(), req.business.id, req.user.id, req.params.lessonId, now());
  res.json({ ok: true });
}));
app.delete('/api/academy/:lessonId', h(async (req, res) => {
  await db.prepare('DELETE FROM academy_progress WHERE user_id = ? AND lesson_id = ?').run(req.user.id, req.params.lessonId);
  res.json({ ok: true });
}));
app.post('/api/settings/eap', h(async (req, res) => {
  const b = req.body || {};
  const ex = await db.prepare('SELECT business_id FROM business_settings WHERE business_id = ?').get(req.business.id);
  if (ex) await db.prepare('UPDATE business_settings SET eap_name=?, eap_phone=?, eap_url=?, eap_notes=?, updated_at=? WHERE business_id=?').run(b.eap_name || null, b.eap_phone || null, b.eap_url || null, b.eap_notes || null, now(), req.business.id);
  else await db.prepare('INSERT INTO business_settings (business_id, eap_name, eap_phone, eap_url, eap_notes, updated_at) VALUES (?,?,?,?,?,?)').run(req.business.id, b.eap_name || null, b.eap_phone || null, b.eap_url || null, b.eap_notes || null, now());
  res.json({ ok: true });
}));
app.post('/api/employees/:id/refer-eap', h(async (req, res) => {
  const e = await db.prepare('SELECT * FROM employees WHERE id=? AND business_id=?').get(req.params.id, req.business.id);
  if (!e) return res.status(404).json({ error: 'Not found' });
  const note = (req.body || {}).note || 'Pointed them toward confidential support (EAP / crisis lines).';
  await db.prepare('INSERT INTO notes (id, business_id, employee_id, kind, body, created_by, created_at) VALUES (?,?,?,?,?,?,?)').run(uid(), req.business.id, e.id, 'wellbeing', 'Wellbeing support: ' + note, req.user.id, now());
  res.json({ ok: true });
}));

// ---------- internal pay scale (sits above the award floor) ----------
app.get('/api/pay-scale', h(async (req, res) => {
  const pack = req.business.industry_id ? industryById(req.business.industry_id) : null;
  if (!pack || !pack.pathway) return res.json({ roles: [], award: null });
  const aId = pack.awardId || 'manufacturing';
  const award = awardById(aId);
  const rows = await db.prepare('SELECT * FROM role_pay WHERE business_id = ?').all(req.business.id);
  const byRole = {}; rows.forEach((r) => { byRole[r.role_id] = r; });
  const roles = (pack.pathway.roles || []).slice().sort((a, b) => a.level - b.level).map((r) => {
    const lvl = r.awardLevel ? awardLevel(aId, r.awardLevel) : null;
    const ip = byRole[r.id];
    return { role_id: r.id, title: r.title, level: r.level, award_code: r.awardLevel || null, award_name: lvl ? lvl.name : null, award_hourly: lvl ? lvl.hourly : null, internal: ip ? { name: ip.internal_name, rate: ip.rate, range_max: ip.range_max } : null };
  });
  const posRows = await db.prepare('SELECT * FROM internal_positions WHERE business_id = ? ORDER BY created_at').all(req.business.id);
  const positions = posRows.map((p) => { const lvl = p.award_code ? awardLevel(aId, p.award_code) : null; return { id: p.id, title: p.title, award_code: p.award_code, award_hourly: lvl ? lvl.hourly : null, rate: p.rate, range_max: p.range_max, note: p.note }; });
  const awardLevels = award ? award.levels.map((l) => ({ id: l.id, name: l.name, hourly: l.hourly })) : [];
  res.json({ roles, positions, awardLevels, award: award ? { code: award.code, name: award.shortName, effective: award.effective, note: award.note, payTool: award.payTool, casualLoading: award.casualLoading } : null });
}));
// custom internal positions (any title the business invents, anchored to an award floor)
app.post('/api/positions', h(async (req, res) => {
  const b = req.body || {};
  if (!b.title || !String(b.title).trim()) return res.status(400).json({ error: 'A title is needed.' });
  const id = uid();
  await db.prepare('INSERT INTO internal_positions (id, business_id, title, award_code, rate, range_max, note, created_at) VALUES (?,?,?,?,?,?,?,?)')
    .run(id, req.business.id, String(b.title).trim(), b.award_code || null, (b.rate != null && b.rate !== '') ? Number(b.rate) : null, (b.range_max != null && b.range_max !== '') ? Number(b.range_max) : null, b.note || null, now());
  res.json({ ok: true, id });
}));
app.patch('/api/positions/:id', h(async (req, res) => {
  const p = await db.prepare('SELECT * FROM internal_positions WHERE id=? AND business_id=?').get(req.params.id, req.business.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  const b = req.body || {};
  const num = (v, cur) => (v == null) ? cur : (v === '' ? null : Number(v));
  await db.prepare('UPDATE internal_positions SET title=?, award_code=?, rate=?, range_max=?, note=? WHERE id=?')
    .run(b.title != null ? b.title : p.title, b.award_code != null ? b.award_code : p.award_code, num(b.rate, p.rate), num(b.range_max, p.range_max), b.note != null ? b.note : p.note, p.id);
  res.json({ ok: true });
}));
app.delete('/api/positions/:id', h(async (req, res) => {
  await db.prepare('DELETE FROM internal_positions WHERE id=? AND business_id=?').run(req.params.id, req.business.id);
  res.json({ ok: true });
}));

// business files (e.g. the employment contract) — stored in the DB as base64
app.get('/api/files', h(async (req, res) => {
  const kind = req.query.kind;
  const rows = kind
    ? await db.prepare('SELECT id, kind, name, mime, created_at FROM business_files WHERE business_id=? AND kind=? ORDER BY created_at DESC').all(req.business.id, kind)
    : await db.prepare('SELECT id, kind, name, mime, created_at FROM business_files WHERE business_id=? ORDER BY created_at DESC').all(req.business.id);
  res.json(rows);
}));
app.post('/api/files', h(async (req, res) => {
  const b = req.body || {};
  if (!b.name || !b.data) return res.status(400).json({ error: 'No file.' });
  const data = String(b.data).replace(/^data:[^,]*,/, '');
  if (Math.floor(data.length * 3 / 4) > 4 * 1024 * 1024) return res.status(413).json({ error: 'File too big — keep it under about 4MB.' });
  const id = uid();
  await db.prepare('INSERT INTO business_files (id, business_id, kind, name, mime, data, created_by, created_at) VALUES (?,?,?,?,?,?,?,?)')
    .run(id, req.business.id, b.kind || 'file', b.name, b.mime || 'application/octet-stream', data, req.user.id, now());
  res.json({ ok: true, id });
}));
app.get('/api/files/:id/download', h(async (req, res) => {
  const f = await db.prepare('SELECT * FROM business_files WHERE id=? AND business_id=?').get(req.params.id, req.business.id);
  if (!f) return res.status(404).send('Not found');
  res.setHeader('Content-Type', f.mime || 'application/octet-stream');
  res.setHeader('Content-Disposition', 'inline; filename="' + String(f.name || 'file').replace(/[^\w.\- ]/g, '_') + '"');
  res.send(Buffer.from(f.data, 'base64'));
}));
app.delete('/api/files/:id', h(async (req, res) => {
  await db.prepare('DELETE FROM business_files WHERE id=? AND business_id=?').run(req.params.id, req.business.id);
  res.json({ ok: true });
}));

// send an offer email (only actually sends when SMTP is configured; otherwise copy/paste stays)
app.post('/api/candidates/:id/send-offer', h(async (req, res) => {
  const c = await db.prepare('SELECT * FROM candidates WHERE id=? AND business_id=?').get(req.params.id, req.business.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  const b = req.body || {};
  if (b.channel === 'sms') {
    if (!c.phone) return res.json({ sent: false, reason: 'no_phone' });
    const link = 'https://' + req.get('host') + '/c/' + c.token;
    const sr = await sendSms({ to: c.phone, body: req.business.name + ': Great news ' + c.name.split(' ')[0] + '! We\'d like to offer you the ' + (c.role_applied || 'role') + '. Details & accept here: ' + link });
    return res.json(Object.assign({ to: c.phone, channel: 'sms' }, sr));
  }
  if (!c.email) return res.json({ sent: false, reason: 'no_email' });
  const attachments = [];
  if (b.attachContract) {
    const f = await db.prepare("SELECT * FROM business_files WHERE business_id=? AND kind='contract' ORDER BY created_at DESC").get(req.business.id);
    if (f) attachments.push({ filename: f.name || 'Employment contract', content: Buffer.from(f.data, 'base64'), contentType: f.mime || undefined });
  }
  const r = await sendEmail({ to: c.email, subject: b.subject || ('An offer from ' + req.business.name), text: b.body || '', attachments });
  res.json(Object.assign({ to: c.email }, r));
}));
app.put('/api/pay-scale/:roleId', h(async (req, res) => {
  const b = req.body || {};
  const rate = (b.rate != null && b.rate !== '') ? Number(b.rate) : null;
  const rmax = (b.range_max != null && b.range_max !== '') ? Number(b.range_max) : null;
  const ex = await db.prepare('SELECT 1 AS x FROM role_pay WHERE business_id=? AND role_id=?').get(req.business.id, req.params.roleId);
  if (ex) await db.prepare('UPDATE role_pay SET internal_name=?, rate=?, range_max=?, updated_at=? WHERE business_id=? AND role_id=?').run(b.internal_name || null, rate, rmax, now(), req.business.id, req.params.roleId);
  else await db.prepare('INSERT INTO role_pay (business_id, role_id, internal_name, rate, range_max, updated_at) VALUES (?,?,?,?,?,?)').run(req.business.id, req.params.roleId, b.internal_name || null, rate, rmax, now());
  res.json({ ok: true });
}));
app.delete('/api/pay-scale/:roleId', h(async (req, res) => {
  await db.prepare('DELETE FROM role_pay WHERE business_id=? AND role_id=?').run(req.business.id, req.params.roleId);
  res.json({ ok: true });
}));
app.post('/api/pay-scale/suggest', h(async (req, res) => {
  // seed a starting internal scale: award floor + a margin, rounded — editable afterwards
  const pack = req.business.industry_id ? industryById(req.business.industry_id) : null;
  if (!pack || !pack.pathway) return res.json({ ok: true, created: 0 });
  const aId = pack.awardId || 'manufacturing';
  const margin = (req.body && req.body.margin) ? Number(req.body.margin) : 0.2;
  let created = 0;
  for (const r of (pack.pathway.roles || [])) {
    const lvl = r.awardLevel ? awardLevel(aId, r.awardLevel) : null;
    if (!lvl) continue;
    const ex = await db.prepare('SELECT 1 AS x FROM role_pay WHERE business_id=? AND role_id=?').get(req.business.id, r.id);
    if (ex) continue;
    const rate = Math.round((lvl.hourly * (1 + margin)) * 2) / 2; // nearest $0.50
    await db.prepare('INSERT INTO role_pay (business_id, role_id, internal_name, rate, range_max, updated_at) VALUES (?,?,?,?,?,?)').run(req.business.id, r.id, r.title, rate, null, now());
    created++;
  }
  res.json({ ok: true, created });
}));

// ---------- allowances & loadings (top-ups, not reclassification) ----------
app.get('/api/allowance-kit', (req, res) => res.json(allowanceKit));
app.get('/api/employees/:id/allowances', h(async (req, res) => {
  const e = await db.prepare('SELECT id FROM employees WHERE id=? AND business_id=?').get(req.params.id, req.business.id);
  if (!e) return res.status(404).json({ error: 'Not found' });
  res.json(await db.prepare('SELECT * FROM allowances WHERE employee_id=? ORDER BY created_at').all(e.id));
}));
app.post('/api/employees/:id/allowances', h(async (req, res) => {
  const e = await db.prepare('SELECT id FROM employees WHERE id=? AND business_id=?').get(req.params.id, req.business.id);
  if (!e) return res.status(404).json({ error: 'Not found' });
  const b = req.body || {};
  if (!b.name || !String(b.name).trim()) return res.status(400).json({ error: 'A name is needed.' });
  const id = uid();
  await db.prepare('INSERT INTO allowances (id, business_id, employee_id, name, amount, basis, note, created_at) VALUES (?,?,?,?,?,?,?,?)')
    .run(id, req.business.id, e.id, String(b.name).trim(), (b.amount != null && b.amount !== '') ? Number(b.amount) : 0, b.basis || 'hour', b.note || null, now());
  res.json({ ok: true, id });
}));
app.delete('/api/allowances/:id', h(async (req, res) => {
  await db.prepare('DELETE FROM allowances WHERE id=? AND business_id=?').run(req.params.id, req.business.id);
  res.json({ ok: true });
}));

// ---------- references (recruitment) ----------
app.get('/api/reference-kit', (req, res) => res.json(referenceKit));
app.get('/api/candidates/:id/references', h(async (req, res) => {
  const c = await db.prepare('SELECT id FROM candidates WHERE id=? AND business_id=?').get(req.params.id, req.business.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  const rows = await db.prepare('SELECT * FROM candidate_references WHERE candidate_id=? ORDER BY created_at').all(c.id);
  res.json(rows.map((r) => ({ id: r.id, referee_name: r.referee_name, relationship: r.relationship, company: r.company, phone: r.phone, email: r.email, token: r.token, status: r.status, answers: safeParse(r.answers, null), notes: r.notes })));
}));
app.post('/api/candidates/:id/references', h(async (req, res) => {
  const c = await db.prepare('SELECT id FROM candidates WHERE id=? AND business_id=?').get(req.params.id, req.business.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  const b = req.body || {};
  const id = uid(); const token = newToken();
  await db.prepare('INSERT INTO candidate_references (id, business_id, candidate_id, referee_name, relationship, company, phone, email, token, status, created_by, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .run(id, req.business.id, c.id, b.referee_name || null, b.relationship || null, b.company || null, b.phone || null, b.email || null, token, 'pending', req.user.id, now(), now());
  res.json({ ok: true, id, token });
}));
app.patch('/api/references/:id', h(async (req, res) => {
  const r = await db.prepare('SELECT * FROM candidate_references WHERE id=? AND business_id=?').get(req.params.id, req.business.id);
  if (!r) return res.status(404).json({ error: 'Not found' });
  const b = req.body || {};
  await db.prepare('UPDATE candidate_references SET answers=?, notes=?, status=?, updated_at=? WHERE id=?')
    .run(b.answers != null ? JSON.stringify(b.answers) : r.answers, b.notes != null ? b.notes : r.notes, b.status || r.status, now(), r.id);
  res.json({ ok: true });
}));

// ---------- page routes ----------
app.get('/', (req, res) => res.sendFile(path.join(PUBLIC, 'index.html')));
app.get(/^\/app(\/.*)?$/, (req, res) => res.sendFile(path.join(PUBLIC, 'app.html')));
app.get('/f/:token', (req, res) => res.sendFile(path.join(PUBLIC, 'feedback.html')));
app.get('/c/:token', (req, res) => res.sendFile(path.join(PUBLIC, 'candidate.html')));
app.get('/r/:token', (req, res) => res.sendFile(path.join(PUBLIC, 'reference.html')));
app.get('/apply/:token', (req, res) => res.sendFile(path.join(PUBLIC, 'apply.html')));
app.get('/refs/:token', (req, res) => res.sendFile(path.join(PUBLIC, 'refs.html')));
app.get('/jobs/:bizId', (req, res) => res.sendFile(path.join(PUBLIC, 'careers.html')));
app.use(express.static(PUBLIC));

// ---------- startup ----------
if (require.main === module) {
  (async () => {
    await init();
    await require('./seed')({ db, uid, now, today, bcrypt, flows, templates, fillTemplate, industries, feedbackTemplates });
    app.listen(PORT, () => {
      console.log(`\n  Offsider is running on port ${PORT}.`);
      console.log(`  Database: ${db.usePg ? 'Postgres/Supabase' : 'SQLite (local)'}`);
      console.log(`  Demo login: demo@offsider.au / offsider123\n`);
    });
  })().catch((e) => { console.error('Startup failed:', e); process.exit(1); });
}

// exported for unit tests (require.main guard above means requiring this file won't start the server)
module.exports = { clickSendOutcome, toE164AU };
