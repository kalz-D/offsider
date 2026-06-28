/* Offsider — single-page app (vanilla JS, no build step). */
(function () {
  'use strict';

  // ---------------- helpers ----------------
  const root = () => document.getElementById('root');
  const $ = (s, el) => (el || document).querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nl2br = (s) => esc(s).replace(/\n/g, '<br>');

  async function api(method, path, body) {
    const r = await fetch('/api' + path, {
      method,
      credentials: 'same-origin',
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined
    });
    const ct = r.headers.get('content-type') || '';
    const data = ct.includes('json') ? await r.json() : await r.text();
    if (!r.ok) throw new Error((data && data.error) || ('Something went wrong (' + r.status + ')'));
    return data;
  }

  function fmtDate(d) {
    if (!d) return '';
    const dt = new Date(String(d).length === 10 ? d + 'T00:00:00' : d);
    if (isNaN(dt)) return d;
    return dt.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  const todayStr = () => new Date().toISOString().slice(0, 10);
  function fmtDateTime(iso) { try { return new Date(iso).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }); } catch (e) { return iso; } }
  function toLocalInput(iso) { const d = new Date(iso); const p = (n) => String(n).padStart(2, '0'); return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + 'T' + p(d.getHours()) + ':' + p(d.getMinutes()); }

  const SENT = {
    positive: { cls: 'sentiment-positive', badge: 'badge-positive', label: 'Good news' },
    supportive: { cls: 'sentiment-supportive', badge: 'badge-supportive', label: 'Supportive' },
    watchful: { cls: 'sentiment-watchful', badge: 'badge-watchful', label: 'Keep an eye on it' }
  };
  const sent = (s) => SENT[s] || SENT.supportive;
  const STATUS = { open: 'Open', resolved: 'Sorted', escalated: 'Escalated', watching: 'Watching' };

  const LOGO = '<span class="logo-mark"><svg viewBox="0 0 24 24"><path d="M12 2 L16.5 12.5 L12 10.2 L7.5 12.5 Z" fill="#fff"/><path d="M12 22 L7.5 11.5 L12 13.8 L16.5 11.5 Z" fill="#fff" opacity=".4"/></svg></span>';

  // ---------------- state ----------------
  const State = { me: null, flows: [], templates: [], compliance: null, brand: null, industries: null, feedbackTemplates: null };
  const flowById = (id) => State.flows.find((f) => f.id === id);
  const templateById = (id) => State.templates.find((t) => t.id === id);
  async function getIndustries() { if (!State.industries) State.industries = await api('GET', '/industries'); return State.industries; }
  async function getFeedbackTemplates() { if (!State.feedbackTemplates) State.feedbackTemplates = await api('GET', '/feedback/templates'); return State.feedbackTemplates; }
  const audienceLabel = (a) => ({ upward: 'About me (the manager)', pulse: 'How they\'re going', onboarding: 'New starter check-in', stay: 'What keeps them here', suggestion: 'Suggestion box', training: 'Training & interests' }[a] || a);
  const cadenceLabel = (c) => ({ weekly: 'Weekly', monthly: 'Monthly', quarterly: 'Quarterly', once: 'One-off' }[c] || c);
  async function getAward(id) { State.awards = State.awards || {}; if (!State.awards[id]) State.awards[id] = await api('GET', '/awards/' + id); return State.awards[id]; }
  async function getNoteTypes() { if (!State.noteTypes) State.noteTypes = (await api('GET', '/note-types')).noteTypes; return State.noteTypes; }
  async function getConfig() { if (!State.config) State.config = await api('GET', '/config'); return State.config; }
  async function getLessons() { if (!State.lessons) State.lessons = await api('GET', '/lessons'); return State.lessons; }
  async function getAppKit() { if (!State.appKit) State.appKit = await api('GET', '/app-kit'); return State.appKit; }
  async function getLegalRefs() { if (!State.legalRefs) State.legalRefs = await api('GET', '/legal-refs'); return State.legalRefs; }
  function fileToB64(file) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = rej; r.readAsDataURL(file); }); }
  function reportSend(r, channel) {
    const isSms = channel === 'sms';
    if (r && r.sent) { toast((isSms ? 'Texted to ' : 'Emailed to ') + r.to + (isSms ? ' 📱' : ' 📨')); return; }
    const reason = r && r.reason;
    if (reason === 'not_configured') toast((isSms ? 'Texting' : 'Email') + ' not connected yet — turn it on in Hiring set-up', 'error');
    else if (reason === 'no_phone') toast('No phone number on file', 'error');
    else if (reason === 'no_email') toast('No email on file', 'error');
    else toast('Couldn\'t send' + (r && r.error ? ' — ' + r.error : ''), 'error');
  }

  // ---- notifications (shared by managers + staff) ----
  function bellHtml() { return '<button class="bell" id="notifBell" title="Notifications">🔔<span class="notif-dot" id="notifDot" style="display:none"></span></button>'; }
  async function refreshNotifBadge() { try { const ns = await api('GET', '/notifications/mine'); const u = ns.filter((n) => !n.read).length; const d = $('#notifDot'); if (d) d.style.display = u ? 'block' : 'none'; } catch (e) { /* ignore */ } }
  function wireBell() { const b = $('#notifBell'); if (b) { b.onclick = openNotifications; refreshNotifBadge(); } }
  async function openNotifications() {
    const ns = await api('GET', '/notifications/mine');
    const list = ns.length
      ? ns.map((n) => '<a href="' + (n.link || '#/') + '" class="notif-item ' + (n.read ? '' : 'unread') + '" data-id="' + n.id + '"><div class="ni-t">' + esc(n.title || '') + '</div>' + (n.body ? '<div class="ni-b">' + esc(n.body) + '</div>' : '') + '<div class="ni-d">' + fmtDate(n.created_at) + '</div></a>').join('')
      : '<div class="empty"><span class="ic">🔕</span>No notifications yet.</div>';
    openModal('<h2>Notifications</h2>' + (ns.some((n) => !n.read) ? '<button class="btn btn-ghost btn-sm" id="markAll" style="margin-bottom:.6rem">Mark all read</button>' : '') + '<div class="notif-list">' + list + '</div><div class="modal-foot"><button class="btn btn-ghost" id="nClose">Close</button></div>');
    $('#nClose').onclick = closeModal;
    const ma = $('#markAll'); if (ma) ma.onclick = async () => { await api('POST', '/notifications/read', {}); closeModal(); refreshNotifBadge(); };
    root().querySelectorAll('.notif-item').forEach((a) => { a.onclick = async () => { await api('POST', '/notifications/read', { id: a.getAttribute('data-id') }); refreshNotifBadge(); }; });
  }
  const money = (n) => '$' + Number(n).toFixed(2);
  const ownerLabel = (o) => ({ manager: 'You', senior_manager: 'Senior mgr', buddy: 'Buddy', staff: 'Staff' }[o] || o);
  function relativeDue(d) { if (d < 0) return 'Overdue by ' + (-d) + ' day' + (-d === 1 ? '' : 's'); if (d === 0) return 'Due today'; if (d === 1) return 'Due tomorrow'; if (d <= 21) return 'Due in ' + d + ' days'; return 'Due in ~' + Math.round(d / 7) + ' weeks'; }

  function questionsHtml(questions) {
    return (questions || []).map((q) => {
      let inner;
      if (q.type === 'scale') inner = '<div class="scale" data-scale="' + q.id + '">' + [1, 2, 3, 4, 5].map((n) => '<button type="button" data-q="' + q.id + '" data-v="' + n + '">' + n + '</button>').join('') + '</div><div class="scale-ends"><span>Not great</span><span>Spot on</span></div>';
      else if (q.type === 'choice') inner = '<div class="choices" data-choice="' + q.id + '">' + (q.options || []).map((o) => '<label><input type="radio" name="q_' + q.id + '" value="' + esc(o) + '"> ' + esc(o) + '</label>').join('') + '</div>';
      else inner = '<textarea data-text="' + q.id + '" placeholder="Type your answer…"></textarea>';
      return '<div class="q"><div class="qlabel">' + esc(q.label) + '</div>' + (q.help ? '<div class="qhelp">' + esc(q.help) + '</div>' : '') + inner + '</div>';
    }).join('');
  }
  function wireQuestions(ans) {
    root().querySelectorAll('[data-scale] button').forEach((b) => { b.onclick = () => { ans[b.getAttribute('data-q')] = b.getAttribute('data-v'); b.parentNode.querySelectorAll('button').forEach((x) => x.classList.remove('sel')); b.classList.add('sel'); }; });
    root().querySelectorAll('[data-choice] input').forEach((inp) => { inp.onchange = () => { ans[inp.name.slice(2)] = inp.value; inp.closest('[data-choice]').querySelectorAll('label').forEach((l) => l.classList.remove('sel')); inp.closest('label').classList.add('sel'); }; });
    root().querySelectorAll('[data-text]').forEach((t) => { t.oninput = () => { ans[t.getAttribute('data-text')] = t.value; }; });
  }

  async function loadContent() {
    const [flows, templates, compliance] = await Promise.all([
      api('GET', '/flows'), api('GET', '/templates'), api('GET', '/compliance')
    ]);
    State.flows = flows; State.templates = templates; State.compliance = compliance;
  }

  // ---------------- modal ----------------
  function openModal(html) {
    closeModal();
    const back = document.createElement('div');
    back.className = 'modal-backdrop';
    back.id = 'modal';
    back.innerHTML = '<div class="modal">' + html + '</div>';
    back.addEventListener('click', (e) => { if (e.target === back) closeModal(); });
    document.body.appendChild(back);
    return back;
  }
  function closeModal() { const m = $('#modal'); if (m) m.remove(); }

  function toast(msg, kind) {
    const t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = 'position:fixed;bottom:22px;left:50%;transform:translateX(-50%);background:' +
      (kind === 'error' ? '#be4032' : '#1b2027') + ';color:#fff;padding:.8em 1.3em;border-radius:999px;z-index:200;font-weight:600;box-shadow:0 10px 30px -8px rgba(0,0,0,.4)';
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2600);
  }

  // ---------------- layout ----------------
  function layout(active, title, content, crumbs) {
    const b = State.me.business;
    const item = (key, href, ic, label) =>
      '<a href="' + href + '" class="nav-item ' + (active === key ? 'active' : '') + '"><span class="ic">' + ic + '</span> ' + label + '</a>';
    root().innerHTML =
      '<div class="app-shell">' +
      '<aside class="sidebar" id="sidebar">' +
      '<a href="#/" class="logo">' + LOGO + 'Offsider</a>' +
      item('home', '#/', '🏠', 'Home') +
      item('new', '#/new', '✨', 'Start something') +
      '<div class="nav-group-label">Manage</div>' +
      item('hiring', '#/hiring', '🧑‍💼', 'Hiring') +
      item('team', '#/team', '👷', 'Workers') +
      item('onboarding', '#/onboarding', '👋', 'Onboarding') +
      item('cases', '#/cases', '🗂️', 'Cases') +
      item('docs', '#/documents', '📄', 'Documents') +
      '<div class="nav-group-label">Develop</div>' +
      item('career', '#/career', '🚀', 'Career paths') +
      item('feedback', '#/feedback', '💬', 'Feedback') +
      '<div class="nav-group-label">Team pulse</div>' +
      item('productivity', '#/productivity', '📊', 'Productivity') +
      item('leave', '#/leave', '🌴', 'Leave') +
      item('suggestions', '#/suggestions', '💡', 'Suggestions') +
      '<div class="nav-group-label">Learn</div>' +
      item('academy', '#/academy', '🎓', 'Manager academy') +
      item('guide', '#/guide', '⚖️', 'Fair Work guide') +
      item('legal', '#/legal', '📚', 'Legal backing') +
      item('support', '#/support', '🫶', 'Wellbeing & EAP') +
      '<div class="sidebar-foot"><div class="biz">' + esc(b.name) + '</div>' +
      '<div>' + esc(State.me.name) + ' · <a href="#" id="logout">Log out</a></div></div>' +
      '</aside>' +
      '<main class="main">' +
      '<div class="topbar"><div><button class="menu-btn" id="menuBtn">☰</button> ' +
      '<h2 style="display:inline-block;margin-left:.4rem">' + esc(title) + '</h2>' +
      (crumbs ? '<div class="crumbs">' + crumbs + '</div>' : '') + '</div>' +
      '<div style="display:flex;gap:.5rem;align-items:center">' + bellHtml() + '<button class="btn btn-ghost btn-sm" id="quickNoteBtn">✎ Quick note</button><a href="#/new" class="btn btn-primary btn-sm">+ Start something</a></div></div>' +
      '<div class="content" id="view">' + content + '</div>' +
      '</main></div>';
    $('#logout').onclick = async (e) => { e.preventDefault(); await api('POST', '/auth/logout'); State.me = null; location.hash = '#login'; routeChanged(); };
    const mb = $('#menuBtn'); if (mb) mb.onclick = () => $('#sidebar').classList.toggle('open');
    const qn = $('#quickNoteBtn'); if (qn) qn.onclick = () => openQuickNote();
    wireBell();
  }

  // ---------------- auth ----------------
  async function viewAuth(mode) {
    const isSignup = mode === 'signup';
    root().innerHTML =
      '<div class="auth-wrap">' +
      '<div class="auth-side">' +
      '<a href="/" class="logo">' + LOGO + 'Offsider</a>' +
      '<div><h1>' + (isSignup ? 'The people stuff, sorted.' : 'Welcome back.') + '</h1>' +
      '<p class="quote">Your right-hand for managing people — the fair way, with the paperwork done and a tidy record kept.</p>' +
      '<div class="feat">🧭 Step-by-step guidance for any situation</div>' +
      '<div class="feat">📝 Builds the documents you\'re missing</div>' +
      '<div class="feat">🏆 Handles the good stuff too, not just problems</div></div>' +
      '<div class="muted" style="color:#9fc0d4">General guidance, not legal advice.</div>' +
      '</div>' +
      '<div class="auth-main"><div class="auth-box">' +
      '<h2>' + (isSignup ? 'Start your free trial' : 'Log in to Offsider') + '</h2>' +
      '<p class="muted">' + (isSignup ? 'No card needed. Up and running in a minute.' : 'Good to see you again.') + '</p>' +
      '<div id="authErr"></div>' +
      '<form id="authForm">' +
      (isSignup ?
        '<div class="field"><label>Your business name</label><input name="businessName" required placeholder="e.g. Riverbend Bricklaying"></div>' +
        '<div class="field"><label>Industry</label><input name="industry" placeholder="e.g. Bricklaying & Construction"></div>' +
        '<div class="field"><label>Your name</label><input name="name" required placeholder="e.g. Dazza Mitchell"></div>'
        : '') +
      '<div class="field"><label>Email</label><input type="email" name="email" required placeholder="you@yourbusiness.com.au"></div>' +
      '<div class="field"><label>Password</label><input type="password" name="password" required placeholder="' + (isSignup ? 'At least 8 characters' : 'Your password') + '"></div>' +
      '<button class="btn btn-primary btn-block btn-lg" type="submit">' + (isSignup ? 'Create account →' : 'Log in →') + '</button>' +
      '</form>' +
      '<div class="auth-toggle">' + (isSignup
        ? 'Already with us? <a href="#login">Log in</a>'
        : 'New here? <a href="#signup">Start a free trial</a>') + '</div>' +
      (isSignup ? '' : '<div class="demo-hint"><strong>Have a look around with the demo:</strong><br>Email <code>demo@offsider.au</code> · Password <code>offsider123</code></div>') +
      '</div></div></div>';

    $('#authForm').onsubmit = async (e) => {
      e.preventDefault();
      const fd = Object.fromEntries(new FormData(e.target).entries());
      const btn = $('button', e.target); btn.disabled = true; btn.textContent = 'One sec…';
      try {
        const res = await api('POST', isSignup ? '/auth/signup' : '/auth/login', fd);
        State.me = res.user;
        await loadContent();
        location.hash = '#/';
        routeChanged();
      } catch (err) {
        $('#authErr').innerHTML = '<div class="error-msg">' + esc(err.message) + '</div>';
        btn.disabled = false; btn.textContent = isSignup ? 'Create account →' : 'Log in →';
      }
    };
  }

  // ---------------- dashboard ----------------
  function gentleDue(dd) { if (dd <= -8) return 'whenever you get a sec'; if (dd < 0) return 'a bit overdue'; if (dd === 0) return 'today'; if (dd <= 2) return 'in a day or two'; return 'soon'; }
  async function viewDashboard() {
    const [d, coach, upcoming, leave, suggestions, onboarding, interviews] = await Promise.all([
      api('GET', '/dashboard'), api('GET', '/coach'), api('GET', '/lifecycle'),
      api('GET', '/leave').catch(() => []), api('GET', '/suggestions').catch(() => []), api('GET', '/onboarding').catch(() => []), api('GET', '/interviews/upcoming').catch(() => [])
    ]);
    const s = d.stats;
    const firstName = State.me.name.split(' ')[0];
    const pendingLeave = (leave || []).filter((l) => l.status === 'pending');
    const newSuggestions = (suggestions || []).filter((x) => x.status === 'new');
    const dueMoments = (upcoming || []).filter((m) => m.daysUntil <= 3);
    const soonInterviews = (interviews || []).filter((i) => { const t = Date.parse(i.scheduled_at); return !isNaN(t) && t > Date.now() - 2 * 3600000 && t < Date.now() + 3 * 86400000; });

    // one merged, plain-language "worth a look" list — person first, calm hints
    const actions = [];
    soonInterviews.forEach((i) => actions.push({ icon: '📅', urgency: 3, title: 'Interview — ' + esc(i.candidate_name || 'candidate'), hint: fmtDateTime(i.scheduled_at) + (i.location ? ' · ' + esc(i.location) : ''), link: '#/candidate/' + i.candidate_id, urgent: true }));
    (d.attention || []).forEach((c) => actions.push({ icon: '🔔', urgency: 3, title: esc(c.title), hint: 'needs a look', link: '#/case/' + c.id, urgent: true }));
    pendingLeave.forEach((l) => actions.push({ icon: '🌴', urgency: 2, title: esc((l.employee_name || 'Someone').split(' ')[0]) + ' wants some time off', hint: 'tap to sort it', link: '#/leave', urgent: true }));
    dueMoments.forEach((m) => { const fn = (m.employee_name || '').split(' ')[0]; actions.push({ icon: '👋', urgency: m.daysUntil < -14 ? 2 : 1, title: esc(fn) + ' — ' + esc(m.title.replace(/\{name\}/g, fn).toLowerCase()), hint: gentleDue(m.daysUntil), link: '#/member/' + m.employee_id, urgent: false }); });
    newSuggestions.forEach((x) => actions.push({ icon: '💡', urgency: 1, title: (x.anonymous ? 'Someone' : esc((x.employee_name || 'Someone').split(' ')[0])) + ' shared an idea', hint: 'have a read', link: '#/suggestions', urgent: false }));
    actions.sort((a, b) => b.urgency - a.urgency);
    const top = actions.slice(0, 3);
    const more = actions.length - top.length;

    // the one constant, obvious thing to do
    const hero = '<a href="#/new" class="hero-action"><span class="ha-ic">＋</span><span class="ha-txt"><span class="ha-t">Something come up with the crew?</span><span class="ha-s">A problem, a bit of good news, a change — start here and I\'ll walk you through it.</span></span><span class="ha-go">→</span></a>';

    const look = top.length
      ? '<div class="look-list">' + top.map((a) => '<a href="' + a.link + '" class="look-row' + (a.urgent ? ' urgent' : '') + '"><span class="lr-ic">' + a.icon + '</span><span class="grow"><span class="lr-t">' + a.title + '</span><span class="lr-h">' + esc(a.hint) + '</span></span><span class="lr-go">›</span></a>').join('') + '</div>' +
        (more > 0 ? '<a href="#/cases" class="look-more">+ ' + more + ' more, no rush →</a>' : '')
      : '<div class="all-good"><span class="ag-ic">👍</span><span><strong>You\'re on top of it.</strong><span class="muted"> Nothing needs you right now.</span></span></div>';

    const nudge = (coach.nudges && coach.nudges.length)
      ? (function () { const n = coach.nudges[0]; return '<div class="section-soft">A thought 💭</div><div class="coach-card tone-' + n.tone + '"><div class="grow"><div class="ct">' + esc(n.title) + (n.employee_name ? ' · ' + esc(n.employee_name) : '') + '</div><div class="cp">' + esc(n.prompt) + '</div></div>' + (n.employee_id ? '<a href="#/member/' + n.employee_id + '" class="btn btn-ghost btn-sm">Open</a>' : '') + '</div>'; })()
      : '';

    const chip = (href, n, label, alert) => '<a href="' + href + '" class="navchip' + (alert ? ' alert' : '') + '"><strong>' + n + '</strong>' + label + '</a>';
    const strip = '<div class="navchips">' +
      chip('#/team', s.employees, 'workers') +
      chip('#/onboarding', (onboarding || []).length, 'onboarding') +
      chip('#/leave', pendingLeave.length, 'leave', pendingLeave.length > 0) +
      chip('#/suggestions', newSuggestions.length, 'ideas', newSuggestions.length > 0) +
      '</div>';

    const banner = d.industrySet ? '' :
      '<a href="#/career" class="banner" style="text-decoration:none"><span style="font-size:1.6rem">🚀</span><span class="grow"><strong>Set up career paths</strong><span class="muted" style="font-size:.9rem;display:block">Pick your industry so Offsider can map your crew\'s pay and progression.</span></span><span class="btn btn-primary btn-sm">Set up</span></a>';

    const content = banner +
      hero +
      '<div class="section-soft">Worth a look' + (actions.length ? ' · ' + actions.length : '') + '</div>' + look +
      nudge +
      strip;
    layout('home', 'G\'day, ' + firstName, content);
  }

  // ---------------- cases list ----------------
  async function viewCases() {
    const cases = await api('GET', '/cases');
    const content = cases.length
      ? '<div class="row-list">' + cases.map((c) =>
        '<a href="#/case/' + c.id + '" class="row ' + sent(c.sentiment).cls + '">' +
        '<span class="ic-circle">' + (c.flow_icon || '🗂️') + '</span>' +
        '<span class="grow"><span class="t">' + esc(c.title) + '</span><span class="s">' + esc(c.flow_name) + ' · ' + esc(c.employee_name || '') + '</span></span>' +
        '<span class="meta"><span class="badge ' + (c.status === 'resolved' ? 'badge-positive' : '') + '">' + (STATUS[c.status] || c.status) + '</span><br><span class="muted">' + fmtDate(c.updated_at) + '</span></span></a>').join('') + '</div>'
      : '<div class="empty"><span class="ic">🗂️</span>No cases yet.<br><a class="btn btn-primary" style="margin-top:1rem" href="#/new">Start something</a></div>';
    layout('cases', 'Cases', content);
  }

  // ---------------- new case ----------------
  async function viewNewCase() {
    const employees = await api('GET', '/employees');
    const opts = employees.map((e) => '<option value="' + e.id + '">' + esc(e.name) + (e.job_title ? ' — ' + esc(e.job_title) : '') + '</option>').join('');
    const noWorkers = employees.length === 0;
    const grid = State.flows.map((f) =>
      '<button class="flow-pick ' + sent(f.sentiment).cls + '" data-flow="' + f.id + '">' +
      '<span class="ic">' + (f.icon || '🗂️') + '</span>' +
      '<span class="t">' + esc(f.name) + '</span>' +
      '<span class="s">' + esc(f.blurb) + '</span>' +
      '<span class="badge ' + sent(f.sentiment).badge + '" style="margin-top:.7rem">' + sent(f.sentiment).label + '</span>' +
      '</button>').join('');

    const content =
      '<p class="muted" style="max-width:60ch">Pick the worker, then tell Offsider what\'s going on. It\'ll walk you through the rest — whether it\'s a problem to sort or a win to make the most of.</p>' +
      (noWorkers
        ? '<div class="card card-pad" style="margin:1rem 0"><strong>First, add a worker.</strong><p class="muted" style="margin:.3rem 0 .8rem">You\'ll need someone on your team before you can start a case.</p><a href="#/team" class="btn btn-primary btn-sm">Add a worker</a></div>'
        : '<div class="panel" style="margin:1rem 0;max-width:480px"><div class="field" style="margin:0"><label>Which worker is this about?</label><select id="empSelect">' + opts + '</select></div></div>') +
      '<div class="section-title"><h3>What\'s going on?</h3></div>' +
      '<div class="flow-grid">' + grid + '</div>';
    layout('new', 'Start something', content);

    if (!noWorkers) {
      root().querySelectorAll('.flow-pick').forEach((btn) => {
        btn.onclick = async () => {
          const flow_id = btn.getAttribute('data-flow');
          const employee_id = $('#empSelect').value;
          btn.style.opacity = '.5';
          try {
            const c = await api('POST', '/cases', { employee_id, flow_id });
            location.hash = '#/case/' + c.id;
          } catch (e) { toast(e.message, 'error'); btn.style.opacity = '1'; }
        };
      });
    }
  }

  // ---------------- case detail + wizard ----------------
  async function viewCase(id) {
    const c = await api('GET', '/cases/' + id);
    if (!c.state) c.state = {};
    const cfg = await getConfig();
    const impactById = {}; cfg.impactTags.forEach((t) => { impactById[t.id] = t.label; });
    const flow = c.flow || flowById(c.flow_id);
    const node = (flow.nodes || []).find((n) => n.id === c.current_node) || (flow.nodes || [])[0];
    const sm = sent(c.sentiment);

    const header =
      '<div class="card card-pad ' + sm.cls + '" style="margin-bottom:1.4rem;display:flex;gap:1rem;align-items:center">' +
      '<span class="ic-circle" style="width:52px;height:52px;font-size:1.5rem">' + (flow.icon || '🗂️') + '</span>' +
      '<div class="grow"><div style="font-family:var(--font-head);font-weight:800;font-size:1.3rem">' + esc(c.title) + '</div>' +
      '<div class="muted"><a href="#/member/' + c.employee.id + '">' + esc(c.employee.name) + '</a>' + (c.employee.job_title ? ' · ' + esc(c.employee.job_title) : '') + ' · ' + esc(flow.name) + '</div></div>' +
      '<div style="text-align:right"><span class="badge ' + sm.badge + '">' + sm.label + '</span><br>' +
      '<select id="statusSel" style="margin-top:.5rem;width:auto;padding:.3em .6em;font-size:.85rem">' +
      Object.keys(STATUS).map((k) => '<option value="' + k + '"' + (c.status === k ? ' selected' : '') + '>' + STATUS[k] + '</option>').join('') +
      '</select></div></div>';

    const checkinBanner = c.next_check_in
      ? '<div class="gap-box" style="' + (c.next_check_in <= todayStr() ? 'border-color:var(--danger);background:var(--danger-50)' : '') + ';margin-bottom:1.2rem;display:flex;align-items:center;gap:.7rem">🔔 <strong>Next check-in:</strong> ' + fmtDate(c.next_check_in) + (c.next_check_in <= todayStr() ? ' <span class="badge badge-danger">Due now</span>' : '') + '</div>'
      : '';

    const wizard = '<div class="wizard">' + renderNode(node, flow, c) + '</div>';

    const timeline = c.events.length
      ? '<div class="timeline">' + c.events.map((e) =>
        '<div class="tl-event kind-' + e.kind + '"><div class="tl-date">' + fmtDate(e.occurred_at || e.created_at) + ' · ' + eventKindLabel(e.kind) + '</div>' +
        '<div class="tl-summary">' + esc(e.summary) + '</div>' +
        (e.detail ? '<div class="tl-detail">' + nl2br(e.detail) + '</div>' : '') +
        ((e.tags && e.tags.length) ? '<div style="margin-top:.35rem">' + e.tags.map((t) => '<span class="step-tag" style="background:var(--danger-50);color:var(--danger);margin-bottom:.2rem">⚠ ' + esc(impactById[t] || t) + '</span>').join('') + '</div>' : '') +
        '</div>').join('') + '</div>'
      : '<div class="muted">No record yet — log your first conversation below.</div>';

    const docs = c.documents.length
      ? '<div class="row-list">' + c.documents.map((dc) =>
        '<a href="#/document/' + dc.id + '" class="row"><span class="ic-circle">📄</span><span class="grow"><span class="t">' + esc(dc.title) + '</span><span class="s">' + fmtDate(dc.created_at) + '</span></span><span class="meta">View →</span></a>').join('') + '</div>'
      : '<div class="muted">No documents yet.</div>';

    const recordPanel =
      '<div class="grid grid-2" style="margin-top:2rem;align-items:start">' +
      '<div><div class="section-title"><h3>The record</h3><button class="btn btn-ghost btn-sm" id="addNoteBtn">+ Log something</button></div>' + timeline + '</div>' +
      '<div><div class="section-title"><h3>Documents</h3><button class="btn btn-ghost btn-sm" id="addDocBtn">+ Create a document</button></div>' + docs +
      '<div class="section-title" style="margin-top:1.6rem"><h3>Next step up</h3></div>' +
      '<div class="card card-pad"><p class="muted" style="margin:.2rem 0 .8rem;font-size:.9rem">Need to take it higher? Record an escalation to the owner/director or an outside HR adviser.</p><button class="btn btn-danger btn-sm" id="escBtn">🪜 Record an escalation</button></div>' +
      '</div></div>';

    layout('cases', c.title, header + checkinBanner + wizard + recordPanel, '<a href="#/cases">Cases</a> / ' + esc(c.employee.name));

    // wire status
    $('#statusSel').onchange = async (e) => {
      await api('PATCH', '/cases/' + c.id, { status: e.target.value });
      toast('Status updated');
    };
    $('#addNoteBtn').onclick = () => openNoteModal(c.id);
    $('#addDocBtn').onclick = () => openDocPicker(c);
    $('#escBtn').onclick = () => openEscalation(c, null);
    wireNode(node, flow, c);
  }

  function eventKindLabel(k) {
    return { communication: 'Conversation', check_in: 'Check-in', document: 'Document', escalation: 'Escalation', note: 'Note', system: 'Offsider' }[k] || 'Note';
  }

  // ---------- wizard node rendering ----------
  function renderNode(node, flow, c) {
    if (!node) return '<div class="wizard-card">All done.</div>';
    const kindLabel = { intro: 'Let\'s begin', question: 'A quick question', checklist: 'Check what you\'ve done', document: 'Paperwork', gap_check: 'Paperwork', log: 'Record it', action: 'Do this next', escalation: 'Step it up', outcome: 'Where it lands' }[node.kind] || '';
    let inner = '<div class="wizard-kind">' + kindLabel + '</div><h2>' + esc(node.title) + '</h2>';
    if (node.body) inner += '<div class="wizard-body">' + nl2br(node.body) + '</div>';

    if (node.kind === 'question' && node.options) {
      inner += '<div class="choice-list">' + node.options.map((o, i) =>
        '<button class="choice" data-opt="' + i + '">' + esc(o.label) + (o.note ? '<span class="note">' + esc(o.note) + '</span>' : '') + '<span class="arr">→</span></button>').join('') + '</div>';
    } else if (node.kind === 'checklist' && node.items) {
      const checks = (c.state.checks && c.state.checks[node.id]) || {};
      inner += '<div class="checklist">' + node.items.map((it) =>
        '<label class="check-item" data-item="' + it.id + '"><input type="checkbox" ' + (checks[it.id] ? 'checked' : '') + '>' +
        '<span><span class="ci-label">' + esc(it.label) + '</span>' + (it.help ? '<br><span class="ci-help">' + esc(it.help) + '</span>' : '') +
        (it.suggestsDocument ? '<span class="gap" style="display:' + (checks[it.id] ? 'none' : 'block') + '"><button type="button" class="btn btn-accent btn-sm makedoc" data-doc="' + it.suggestsDocument + '">📝 Help me write this</button></span>' : '') +
        '</span></label>').join('') + '</div>';
      inner += wizardFoot(node, c, 'Next →');
    } else if (node.kind === 'document' || node.kind === 'gap_check') {
      const t = templateById(node.documentId);
      inner += '<div class="gap-box">' + (node.why ? '<div class="why">' + nl2br(node.why) + '</div>' : '') +
        '<button class="btn btn-accent" id="genDoc" data-doc="' + (node.documentId || '') + '">📝 Create ' + esc(t ? t.name : 'this document') + '</button></div>';
      inner += '<div class="wizard-foot"><button class="btn btn-ghost btn-sm" id="backStep">← Back</button>' +
        (node.next ? '<button class="btn btn-ghost" id="skipNext">I\'ve already got this →</button>' : '') + '</div>';
    } else if (node.kind === 'log') {
      inner += '<div class="panel" style="background:var(--paper)">' +
        '<div class="field"><label>What happened?</label><input id="logSummary" placeholder="e.g. Had a chat about render quality on site"></div>' +
        '<div class="grid grid-2"><div class="field"><label>When?</label><input type="date" id="logDate" value="' + todayStr() + '"></div>' +
        '<div class="field"><label>Type</label><select id="logKind"><option value="communication">Conversation</option><option value="check_in">Check-in</option><option value="note">Note</option></select></div></div>' +
        '<div class="field" style="margin:0"><label>Any detail? (optional)</label><textarea id="logDetail" placeholder="What was said, what you agreed…"></textarea></div></div>' +
        '<div class="wizard-foot"><button class="btn btn-ghost btn-sm" id="backStep">← Back</button><div><button class="btn btn-ghost" id="skipNext">Skip</button> <button class="btn btn-primary" id="saveLog">Save &amp; continue →</button></div></div>';
    } else if (node.kind === 'action') {
      inner += '<div class="panel" style="background:var(--paper)"><div class="field" style="margin:0"><label>🔔 Put the next check-in in the diary (optional)</label><input type="date" id="checkinDate" value="' + (c.next_check_in || '') + '"><div class="hint">Offsider will nudge you when it\'s due.</div></div></div>' +
        '<div class="wizard-foot"><button class="btn btn-ghost btn-sm" id="backStep">← Back</button><button class="btn btn-primary" id="actionDone">Done — next →</button></div>';
    } else if (node.kind === 'escalation') {
      inner += '<div class="gap-box" style="border-color:var(--danger);background:var(--danger-50)">' +
        (node.escalateTo ? '<div class="why" style="color:#7a241a"><strong>Take it to:</strong> ' + esc(node.escalateTo) + '</div>' : '') +
        '<button class="btn btn-danger" id="recEsc">🪜 Record this escalation</button>' +
        (node.documentId ? ' <button class="btn btn-accent" id="escDoc" data-doc="' + node.documentId + '">📝 Create handover summary</button>' : '') +
        '</div>' +
        '<div class="wizard-foot"><button class="btn btn-ghost btn-sm" id="backStep">← Back</button>' + (node.next ? '<button class="btn btn-ghost" id="skipNext">Continue →</button>' : '') + '</div>';
    } else if (node.kind === 'outcome') {
      inner = '<div class="outcome-box"><div class="ic">' + (c.sentiment === 'positive' ? '🎉' : '✅') + '</div>' + inner.replace('<div class="wizard-kind">' + kindLabel + '</div>', '') + '</div>';
      inner += '<div class="wizard-foot" style="justify-content:center;gap:.7rem">' +
        '<button class="btn btn-ghost" id="restart">Start the guide again</button>' +
        (c.status !== 'resolved' ? '<button class="btn btn-positive" id="markResolved">Mark this case sorted ✓</button>' : '') + '</div>';
    } else { // intro
      inner += '<div class="wizard-foot"><span></span><button class="btn btn-primary btn-lg" id="introNext">Let\'s go →</button></div>';
    }
    return '<div class="wizard-card">' + inner + '</div>';
  }

  function wizardFoot(node, c, nextLabel) {
    return '<div class="wizard-foot"><button class="btn btn-ghost btn-sm" id="backStep">← Back</button>' +
      (node.next !== undefined ? '<button class="btn btn-primary" id="primaryNext">' + nextLabel + '</button>' : '') + '</div>';
  }

  function wireNode(node, flow, c) {
    if (!node) return;
    const back = $('#backStep'); if (back) back.onclick = () => wizardBack(c);

    if (node.kind === 'intro') {
      $('#introNext').onclick = () => wizardNav(c, node.next);
    } else if (node.kind === 'question') {
      root().querySelectorAll('.choice').forEach((b) => {
        b.onclick = () => {
          const o = node.options[+b.getAttribute('data-opt')];
          c.state.answers = c.state.answers || {};
          c.state.answers[node.id] = o.value || o.label;
          wizardNav(c, o.next);
        };
      });
    } else if (node.kind === 'checklist') {
      // toggle gap buttons live
      root().querySelectorAll('.check-item').forEach((li) => {
        const cb = $('input', li); const gap = $('.gap', li);
        cb.onchange = () => { if (gap) gap.style.display = cb.checked ? 'none' : 'block'; };
      });
      root().querySelectorAll('.makedoc').forEach((b) => { b.onclick = () => openDocForm(c, b.getAttribute('data-doc'), undefined); });
      const pn = $('#primaryNext');
      if (pn) pn.onclick = () => {
        const checks = {};
        root().querySelectorAll('.check-item').forEach((li) => { checks[li.getAttribute('data-item')] = $('input', li).checked; });
        c.state.checks = c.state.checks || {}; c.state.checks[node.id] = checks;
        wizardNav(c, node.next);
      };
    } else if (node.kind === 'document' || node.kind === 'gap_check') {
      $('#genDoc').onclick = (e) => openDocForm(c, e.target.getAttribute('data-doc'), node.next);
      const sk = $('#skipNext'); if (sk) sk.onclick = () => wizardNav(c, node.next);
    } else if (node.kind === 'log') {
      $('#saveLog').onclick = async () => {
        const summary = $('#logSummary').value.trim();
        if (!summary) { toast('Add a short note of what happened', 'error'); return; }
        await api('POST', '/cases/' + c.id + '/events', { kind: $('#logKind').value, summary, detail: $('#logDetail').value.trim(), occurred_at: $('#logDate').value });
        wizardNav(c, node.next);
      };
      const sk = $('#skipNext'); if (sk) sk.onclick = () => wizardNav(c, node.next);
    } else if (node.kind === 'action') {
      $('#actionDone').onclick = () => {
        const d = $('#checkinDate').value;
        wizardNav(c, node.next, d ? { next_check_in: d } : undefined);
      };
    } else if (node.kind === 'escalation') {
      $('#recEsc').onclick = async () => {
        await api('POST', '/cases/' + c.id + '/events', { kind: 'escalation', summary: 'Escalated' + (node.escalateTo ? ': ' + node.escalateTo : ''), occurred_at: todayStr() });
        await api('PATCH', '/cases/' + c.id, { status: 'escalated' });
        toast('Escalation recorded');
        wizardNav(c, node.next);
      };
      const ed = $('#escDoc'); if (ed) ed.onclick = (e) => openDocForm(c, e.target.getAttribute('data-doc'), node.next);
      const sk = $('#skipNext'); if (sk) sk.onclick = () => wizardNav(c, node.next);
    } else if (node.kind === 'outcome') {
      const r = $('#restart'); if (r) r.onclick = () => wizardNav(c, flow.startNode);
      const mr = $('#markResolved'); if (mr) mr.onclick = async () => { await api('PATCH', '/cases/' + c.id, { status: 'resolved' }); toast('Nice work — case marked sorted ✓'); viewCase(c.id); };
    }
  }

  async function wizardNav(c, nextId, extra) {
    const state = c.state || {};
    state.history = state.history || [];
    if (nextId !== undefined && nextId !== null) state.history.push(c.current_node);
    const patch = Object.assign({ current_node: (nextId === undefined ? c.current_node : nextId), state }, extra || {});
    await api('PATCH', '/cases/' + c.id, patch);
    viewCase(c.id);
  }
  async function wizardBack(c) {
    const state = c.state || {}; state.history = state.history || [];
    const prev = state.history.pop();
    if (prev == null) { toast('You\'re at the start'); return; }
    await api('PATCH', '/cases/' + c.id, { current_node: prev, state });
    viewCase(c.id);
  }

  // ---------- documents ----------
  async function docFormModal(templateId, onCreate) {
    let t;
    try { t = await api('GET', '/templates/' + templateId); } catch (e) { toast('Couldn\'t load that document', 'error'); return; }
    const fields = (t.fields || []).map((f) => {
      const id = 'f_' + f.id;
      let input;
      if (f.type === 'textarea') input = '<textarea id="' + id + '" placeholder="' + esc(f.placeholder || '') + '"></textarea>';
      else if (f.type === 'date') input = '<input type="date" id="' + id + '" value="' + todayStr() + '">';
      else if (f.type === 'select') input = '<select id="' + id + '">' + (f.options || []).map((o) => '<option>' + esc(o) + '</option>').join('') + '</select>';
      else input = '<input type="text" id="' + id + '" placeholder="' + esc(f.placeholder || '') + '">';
      return '<div class="field"><label>' + esc(f.label) + (f.required ? ' *' : '') + '</label>' + (f.help ? '<div class="hint">' + esc(f.help) + '</div>' : '') + input + '</div>';
    }).join('');
    openModal(
      '<h2>' + esc(t.name) + '</h2><p class="muted">' + esc(t.purpose || '') + '</p>' +
      '<div id="docErr"></div>' + (fields || '<p class="muted">No details needed — Offsider has what it needs.</p>') +
      (t.legalNote ? '<div class="disclaimer-note" style="margin-top:.5rem">⚠️ ' + esc(t.legalNote) + '</div>' : '') +
      '<div class="modal-foot"><button class="btn btn-ghost" id="docCancel">Cancel</button><button class="btn btn-accent" id="docCreate">Create document →</button></div>'
    );
    $('#docCancel').onclick = closeModal;
    $('#docCreate').onclick = async () => {
      const out = {};
      let ok = true;
      (t.fields || []).forEach((f) => { const v = $('#f_' + f.id).value.trim(); if (f.required && !v) ok = false; out[f.id] = v; });
      if (!ok) { $('#docErr').innerHTML = '<div class="error-msg">Please fill in the required fields (*)</div>'; return; }
      const btn = $('#docCreate'); btn.disabled = true; btn.textContent = 'Creating…';
      try {
        const doc = await onCreate(out);
        closeModal();
        if (doc && doc.id) location.hash = '#/document/' + doc.id;
      } catch (e) { $('#docErr').innerHTML = '<div class="error-msg">' + esc(e.message) + '</div>'; btn.disabled = false; btn.textContent = 'Create document →'; }
    };
  }
  function openDocForm(c, templateId, advanceTo) {
    return docFormModal(templateId, async (out) => {
      const doc = await api('POST', '/cases/' + c.id + '/documents', { template_id: templateId, fields: out });
      if (advanceTo !== undefined) {
        const state = c.state || {}; state.history = state.history || []; state.history.push(c.current_node);
        await api('PATCH', '/cases/' + c.id, { current_node: advanceTo, state });
      }
      return doc;
    });
  }
  function openEmployeeDocForm(employeeId, templateId) {
    return docFormModal(templateId, (out) => api('POST', '/employees/' + employeeId + '/documents', { template_id: templateId, fields: out }));
  }

  function openDocPicker(c) {
    const groups = {};
    State.templates.forEach((t) => { (groups[t.category] = groups[t.category] || []).push(t); });
    const html = Object.keys(groups).map((g) =>
      '<div class="nav-group-label" style="color:var(--ink-faint);margin:.8rem 0 .3rem">' + esc(g) + '</div>' +
      groups[g].map((t) => '<button class="choice makedoc2" data-doc="' + t.id + '" style="margin-bottom:.4rem">' + esc(t.name) + '<span class="note">' + esc(t.purpose || '') + '</span></button>').join('')
    ).join('');
    openModal('<h2>Create a document</h2><p class="muted">Pick what you need — Offsider drafts it for you.</p>' + html + '<div class="modal-foot"><button class="btn btn-ghost" id="dpCancel">Cancel</button></div>');
    $('#dpCancel').onclick = closeModal;
    root().querySelectorAll('.makedoc2').forEach((b) => { b.onclick = () => { closeModal(); openDocForm(c, b.getAttribute('data-doc'), undefined); }; });
  }

  async function viewDocument(id) {
    const d = await api('GET', '/documents/' + id);
    const back = d.case_id ? '<a href="#/case/' + d.case_id + '" class="btn btn-ghost btn-sm">← Back to case</a>'
      : d.employee_id ? '<a href="#/member/' + d.employee_id + '" class="btn btn-ghost btn-sm">← Back to worker</a>'
        : '<a href="#/documents" class="btn btn-ghost btn-sm">← Back to documents</a>';
    const content =
      '<div class="doc-toolbar">' + back +
      '<button class="btn btn-primary btn-sm" onclick="window.print()">🖨️ Print / Save as PDF</button></div>' +
      '<div class="doc-paper">' + esc(d.content) + '</div>';
    layout('docs', d.title || 'Document', content);
  }

  async function viewDocuments() {
    const docs = await api('GET', '/documents');
    const content = docs.length
      ? '<div class="row-list">' + docs.map((d) =>
        '<a href="#/document/' + d.id + '" class="row"><span class="ic-circle">📄</span><span class="grow"><span class="t">' + esc(d.title) + '</span><span class="s">' + esc(d.employee_name || '') + '</span></span><span class="meta">' + fmtDate(d.created_at) + '</span></a>').join('') + '</div>'
      : '<div class="empty"><span class="ic">📄</span>No documents yet. They\'ll show up here as you create them inside a case.</div>';
    layout('docs', 'Documents', content);
  }

  // ---------- notes / escalation modals ----------
  async function openNoteModal(caseId) {
    const cfg = await getConfig();
    const impactBoxes = cfg.impactTags.map((t) => '<label class="check-item" style="padding:.5rem .75rem"><input type="checkbox" value="' + t.id + '"><span class="ci-label" style="font-weight:500">' + esc(t.label) + '</span></label>').join('');
    openModal(
      '<h2>Log something</h2><p class="muted">Keep a dated note of a conversation, a check-in or anything worth recording.</p>' +
      '<div class="field"><label>What happened?</label><input id="nSummary" placeholder="e.g. Toolbox chat about turning up on time"></div>' +
      '<div class="grid grid-2"><div class="field"><label>When?</label><input type="date" id="nDate" value="' + todayStr() + '"></div>' +
      '<div class="field"><label>Type</label><select id="nKind"><option value="communication">Conversation</option><option value="check_in">Check-in</option><option value="note">Note</option></select></div></div>' +
      '<div class="field"><label>Detail (optional)</label><textarea id="nDetail" placeholder="What was said, what you agreed…"></textarea></div>' +
      '<div class="field"><label>If this is a problem — why does it matter to the business? <span class="muted" style="font-weight:400">(optional, helps you see the real cost)</span></label><div class="checklist" id="nImpact">' + impactBoxes + '</div></div>' +
      '<div class="modal-foot"><button class="btn btn-ghost" id="nCancel">Cancel</button><button class="btn btn-primary" id="nSave">Save note</button></div>'
    );
    $('#nCancel').onclick = closeModal;
    $('#nSave').onclick = async () => {
      const summary = $('#nSummary').value.trim();
      if (!summary) { toast('Add a short note', 'error'); return; }
      const tags = Array.from(document.querySelectorAll('#nImpact input:checked')).map((i) => i.value);
      await api('POST', '/cases/' + caseId + '/events', { kind: $('#nKind').value, summary, detail: $('#nDetail').value.trim(), occurred_at: $('#nDate').value, tags });
      closeModal(); viewCase(caseId);
    };
  }

  function openEscalation(c) {
    openModal(
      '<h2>🪜 Record an escalation</h2><p class="muted">Taking it to the owner, a director or an outside HR/employment-law adviser is the smart move when it\'s getting serious. Note it here so the record\'s complete.</p>' +
      '<div class="field"><label>Who are you taking it to?</label><input id="eTo" placeholder="e.g. The owner, then our HR adviser"></div>' +
      '<div class="field"><label>What\'s the situation? (optional)</label><textarea id="eDetail" placeholder="Quick summary of where things are up to…"></textarea></div>' +
      '<div class="modal-foot"><button class="btn btn-ghost" id="eCancel">Cancel</button>' +
      '<button class="btn btn-accent" id="eDoc">Also create handover summary</button>' +
      '<button class="btn btn-danger" id="eSave">Record escalation</button></div>'
    );
    $('#eCancel').onclick = closeModal;
    const save = async () => {
      const to = $('#eTo').value.trim();
      await api('POST', '/cases/' + c.id + '/events', { kind: 'escalation', summary: 'Escalated' + (to ? ': ' + to : ''), detail: $('#eDetail').value.trim(), occurred_at: todayStr() });
      await api('PATCH', '/cases/' + c.id, { status: 'escalated' });
    };
    $('#eSave').onclick = async () => { await save(); closeModal(); toast('Escalation recorded'); viewCase(c.id); };
    $('#eDoc').onclick = async () => { await save(); closeModal(); openDocForm(c, 'escalation_summary', undefined); };
  }

  // ---------------- quick note (the fast, reactive path) ----------------
  async function openQuickNote(prefillEmployeeId) {
    const [employees, cfg, noteTypes] = await Promise.all([api('GET', '/employees'), getConfig(), getNoteTypes()]);
    if (!employees.length) { toast('Add a worker first', 'error'); location.hash = '#/team'; return; }
    const empOpts = employees.map((e) => '<option value="' + e.id + '"' + (e.id === prefillEmployeeId ? ' selected' : '') + '>' + esc(e.name) + '</option>').join('');
    const kindOpts = noteTypes.map((n) => '<option value="' + n.id + '">' + (n.icon || '') + ' ' + esc(n.label) + '</option>').join('');
    const impactBoxes = cfg.impactTags.map((t) => '<label class="check-item" style="padding:.45rem .7rem"><input type="checkbox" value="' + t.id + '"><span class="ci-label" style="font-weight:500">' + esc(t.label) + '</span></label>').join('');
    const flowOpts = State.flows.map((f) => '<option value="' + f.id + '"' + (f.id === 'underperformance' ? ' selected' : '') + '>' + (f.icon || '') + ' ' + esc(f.name) + '</option>').join('');
    openModal(
      '<h2>Quick note</h2><p class="muted">Already had a chat or spotted something? Jot it in 10 seconds — it lands on their record.</p>' +
      (prefillEmployeeId ? '' : '<div class="field"><label>Which worker?</label><select id="qnEmp">' + empOpts + '</select></div>') +
      '<div class="field"><label>What happened?</label><textarea id="qnBody" rows="2" placeholder="e.g. Quiet word with Sam about turning up 5 min late"></textarea></div>' +
      '<div class="grid grid-2"><div class="field"><label>When?</label><input type="date" id="qnDate" value="' + todayStr() + '"></div>' +
      '<div class="field"><label>Type</label><select id="qnKind">' + kindOpts + '</select></div></div>' +
      '<div class="field"><label>If it\'s a problem — why does it matter? <span class="muted" style="font-weight:400">(optional)</span></label><div class="checklist" id="qnImpact">' + impactBoxes + '</div></div>' +
      '<label class="check-item" style="margin:.4rem 0"><input type="checkbox" id="qnFollow"><span><span class="ci-label">This needs following up</span><br><span class="ci-help">Opens a tracked ticket for this worker with a check-in reminder.</span></span></label>' +
      '<div class="field" id="qnSitWrap" style="display:none"><label>What\'s it about?</label><select id="qnSit">' + flowOpts + '</select></div>' +
      '<div id="qnErr"></div>' +
      '<div class="modal-foot"><button class="btn btn-ghost" id="qnCancel">Cancel</button><button class="btn btn-primary" id="qnSave">Save note</button></div>'
    );
    const follow = $('#qnFollow'); const sitWrap = $('#qnSitWrap'); const saveBtn = $('#qnSave');
    follow.onchange = () => { sitWrap.style.display = follow.checked ? 'block' : 'none'; saveBtn.textContent = follow.checked ? 'Save & open ticket →' : 'Save note'; };
    $('#qnCancel').onclick = closeModal;
    saveBtn.onclick = async () => {
      const empId = prefillEmployeeId || ($('#qnEmp') && $('#qnEmp').value);
      const body = $('#qnBody').value.trim();
      if (!empId) { toast('Pick a worker', 'error'); return; }
      if (!body) { toast('Jot what happened', 'error'); return; }
      const tags = Array.from(document.querySelectorAll('#qnImpact input:checked')).map((i) => i.value);
      const date = $('#qnDate').value; const kind = $('#qnKind').value;
      saveBtn.disabled = true; saveBtn.textContent = 'Saving…';
      try {
        if (follow.checked) {
          const c = await api('POST', '/cases', { employee_id: empId, flow_id: $('#qnSit').value });
          await api('POST', '/cases/' + c.id + '/events', { kind: 'communication', summary: body, occurred_at: date, tags });
          closeModal();
          location.hash = '#/case/' + c.id;
        } else {
          await api('POST', '/employees/' + empId + '/notes', { kind, body, tags, occurred_at: date });
          closeModal(); toast('Note saved');
          if (location.hash.indexOf('#/member/' + empId) === 0) viewMember(empId);
        }
      } catch (e) { $('#qnErr').innerHTML = '<div class="error-msg">' + esc(e.message) + '</div>'; saveBtn.disabled = false; saveBtn.textContent = follow.checked ? 'Save & open ticket →' : 'Save note'; }
    };
  }

  // ---------------- reflection prompt (makes the manager think) ----------------
  async function openReflection(emp, reflectionId, ruleId, occKey) {
    const cfg = await getConfig();
    const sets = cfg.reflectionPrompts || [];
    const set = sets.find((r) => r.id === reflectionId) || sets[0];
    if (!set) { toast('No reflection available'); return; }
    const first = (emp.name || '').split(' ')[0];
    const fill = (s) => esc(String(s || '').replace(/\{name\}/g, first));
    const qs = set.questions.map((q) => '<div class="field"><label>' + fill(q.label) + '</label><textarea id="rf_' + q.id + '" rows="2"></textarea></div>').join('');
    openModal('<h2>' + fill(set.title) + '</h2><p class="muted">' + fill(set.intro) + '</p>' + qs + '<div id="rfErr"></div><div class="modal-foot"><button class="btn btn-ghost" id="rfCancel">Skip for now</button><button class="btn btn-primary" id="rfSave">Save reflection</button></div>');
    $('#rfCancel').onclick = closeModal;
    $('#rfSave').onclick = async () => {
      const answers = {}; set.questions.forEach((q) => { answers[q.id] = $('#rf_' + q.id).value.trim(); });
      const btn = $('#rfSave'); btn.disabled = true; btn.textContent = 'Saving…';
      try {
        const r = await api('POST', '/employees/' + emp.id + '/reflection', { reflectionId: set.id, answers, rule_id: ruleId, occurrence_key: occKey });
        closeModal(); toast(r.notes ? ('Saved — ' + r.notes + ' note' + (r.notes === 1 ? '' : 's') + ' added') : 'Saved');
        if (location.hash.indexOf('#/member/' + emp.id) === 0) viewMember(emp.id); else routeChanged();
      } catch (e) { $('#rfErr').innerHTML = '<div class="error-msg">' + esc(e.message) + '</div>'; btn.disabled = false; btn.textContent = 'Save reflection'; }
    };
  }

  // act on a lifecycle moment (the contextual "do it" button)
  async function doMoment(emp, m) {
    const a = m.action || {};
    if (a.kind === 'reflection') return openReflection(emp, a.reflectionId, m.rule_id, m.occurrence_key);
    if (a.feedbackTemplateId) {
      await api('POST', '/feedback/requests', { template_id: a.feedbackTemplateId, employee_id: emp.id });
      await api('POST', '/lifecycle/done', { employee_id: emp.id, rule_id: m.rule_id, occurrence_key: m.occurrence_key });
      toast('Check-in sent to ' + (emp.name || '').split(' ')[0]); return viewMember(emp.id);
    }
    if (a.flowId) {
      const c = await api('POST', '/cases', { employee_id: emp.id, flow_id: a.flowId });
      await api('POST', '/lifecycle/done', { employee_id: emp.id, rule_id: m.rule_id, occurrence_key: m.occurrence_key });
      location.hash = '#/case/' + c.id; return;
    }
    await api('POST', '/lifecycle/done', { employee_id: emp.id, rule_id: m.rule_id, occurrence_key: m.occurrence_key });
    openQuickNote(emp.id);
  }
  function momentPrimary(m) { const a = m.action || {}; if (a.kind === 'reflection') return '🧠 Reflect'; if (a.feedbackTemplateId) return 'Send check-in'; if (a.flowId) return 'Start →'; return 'Log it'; }

  // ---------------- workers ----------------
  async function viewTrainingRecord(id) {
    const e = await api('GET', '/employees/' + id);
    const dev = e.development || {}; const skills = dev.skills || {}; const goals = (dev.goals || []).filter((g) => !g.done);
    const packId = e.pathway_id || State.me.business.industry_id || null;
    let pack = null; if (packId) { try { pack = await api('GET', '/industries/' + packId); } catch (x) { pack = null; } }
    const roles = pack ? (pack.pathway.roles || []).slice().sort((a, b) => a.level - b.level) : [];
    const currentRole = roles.find((r) => r.id === e.current_role);
    const w = e.wage; const cl = w && w.currentLevel;
    // every ladder step the manager has signed off
    const signed = [];
    roles.forEach((r) => (r.stepsToNext || []).forEach((s, i) => { if (skills[r.id + ':' + i]) signed.push({ label: s.label, type: s.type || 'skill', detail: s.detail || '' }); }));
    const recordDate = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
    const group = (title, type) => { const items = signed.filter((s) => s.type === type); return items.length ? '<div style="margin-top:1.1rem"><strong>' + title + '</strong><ul style="margin:.35rem 0 0;padding-left:1.2rem;line-height:1.7">' + items.map((s) => '<li>' + esc(s.label) + (s.detail ? ' <span style="color:#777">— ' + esc(s.detail) + '</span>' : '') + '</li>').join('') + '</ul></div>' : ''; };
    const row = (k, v) => v ? '<tr><td style="padding:.25rem 0;width:42%;vertical-align:top"><strong>' + k + '</strong></td><td style="padding:.25rem 0">' + v + '</td></tr>' : '';
    const content =
      '<div class="doc-toolbar"><a href="#/member/' + e.id + '" class="btn btn-ghost btn-sm">← Back to worker</a><button class="btn btn-primary btn-sm" onclick="window.print()">🖨️ Print / Save as PDF</button></div>' +
      '<div class="doc-paper">' +
      '<div style="text-align:center;margin-bottom:1.4rem"><div style="font-family:var(--font-head);font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#555">' + esc(State.me.business.name) + '</div><h2 style="margin:.3rem 0 0;font-size:1.7rem">Training Record</h2></div>' +
      '<table style="width:100%;border-collapse:collapse">' +
      row('Name', esc(e.name)) +
      row('Role', esc(e.job_title || (currentRole ? currentRole.title : '') || '—')) +
      row('Award classification', cl ? (esc(cl.name) + (w.award ? ' · ' + esc(w.award.code) : '')) : '') +
      row('Started', e.start_date ? fmtDate(e.start_date) : '') +
      row('Record date', recordDate) +
      '</table>' +
      '<hr style="border:none;border-top:1px solid #ddd;margin:1.2rem 0">' +
      (signed.length
        ? '<h3 style="margin:0">Competencies signed off (' + signed.length + ')</h3>' +
          group('🎫 Tickets &amp; licences', 'ticket') + group('🔧 Skills &amp; test methods', 'skill') + group('📋 Experience', 'experience') + group('⭐ Attributes', 'behaviour')
        : '<p style="color:#777">No competencies signed off in Offsider yet.</p>') +
      (goals.length ? '<div style="margin-top:1.4rem"><h3 style="margin:0 0 .3rem">Currently working towards</h3><ul style="margin:0;padding-left:1.2rem;line-height:1.7">' + goals.map((g) => '<li>' + esc(g.title) + (g.target ? ' <span style="color:#777">(target ' + fmtDate(g.target) + ')</span>' : '') + '</li>').join('') + '</ul></div>' : '') +
      '<hr style="border:none;border-top:1px solid #ddd;margin:1.4rem 0">' +
      '<div style="color:#444;font-size:.88rem">Recorded by ' + esc(State.me.name) + ', ' + esc(State.me.business.name) + ', as at ' + recordDate + '. Reflects competencies signed off in Offsider. This is the worker&rsquo;s record to keep and take with them.</div>' +
      '<div style="margin-top:2.2rem;display:flex;gap:3rem"><div style="flex:1;border-top:1px solid #333;padding-top:.3rem;font-size:.82rem;color:#555">Manager signature &amp; date</div><div style="flex:1;border-top:1px solid #333;padding-top:.3rem;font-size:.82rem;color:#555">Worker signature &amp; date</div></div>' +
      '</div>';
    layout('team', 'Training record — ' + e.name, content, '<a href="#/team">Workers</a> / <a href="#/member/' + e.id + '">' + esc(e.name) + '</a>');
  }

  async function viewOnboarding() {
    const [starters, cfg] = await Promise.all([api('GET', '/onboarding'), getConfig()]);
    const spLabel = {}; (cfg.starterProfiles || []).forEach((p) => { spLabel[p.id] = p; });
    const card = (s) => {
      const pct = s.progress.total ? Math.round((s.progress.done / s.progress.total) * 100) : 0;
      const sp = spLabel[s.starter_profile];
      const next = s.next;
      const nextHtml = next
        ? '<div class="muted" style="font-size:.86rem;margin-top:.5rem">Next: <strong>' + esc(next.title) + '</strong> · ' + (next.daysUntil < 0 ? '<span style="color:var(--danger)">' + relativeDue(next.daysUntil) + '</span>' : relativeDue(next.daysUntil)) + (next.owner && next.owner !== 'manager' ? ' · ' + ownerLabel(next.owner) : '') + '</div>'
        : '<div class="muted" style="font-size:.86rem;margin-top:.5rem">All onboarding steps done 🎉</div>';
      return '<a href="#/member/' + s.id + '" class="card card-pad onb-card">' +
        '<div style="display:flex;gap:1rem;align-items:center">' +
        '<span class="ic-circle" style="width:48px;height:48px;font-size:1.4rem;background:var(--positive-50)">👋</span>' +
        '<div class="grow"><div style="font-family:var(--font-head);font-weight:800;font-size:1.1rem">' + esc(s.name) + '</div>' +
        '<div class="muted" style="font-size:.86rem">' + esc(s.job_title || '') + (s.tenure != null ? ' · day ' + s.tenure : '') + (sp ? ' · 🌱 ' + esc(sp.label) : '') + '</div></div>' +
        '<div style="text-align:right;min-width:84px"><div style="font-family:var(--font-head);font-weight:800;font-size:1.3rem;color:var(--positive-700)">' + pct + '%</div><div class="muted" style="font-size:.72rem">' + s.progress.done + '/' + s.progress.total + ' steps</div></div>' +
        '</div>' +
        '<div class="progress" style="margin-top:.7rem"><div class="progress-bar ' + (pct < 34 ? 'low' : '') + '" style="width:' + Math.max(pct, 3) + '%"></div></div>' +
        nextHtml + '</a>';
    };
    const body = starters.length
      ? '<div class="section-title"><h3>Currently onboarding (' + starters.length + ')</h3><button class="btn btn-primary btn-sm" id="addStarter">+ Onboard a new starter</button></div>' +
        '<p class="muted" style="max-width:64ch;margin-top:-.3rem">Everyone in their first few months. Tap a starter to open their full onboarding plan and tick off the steps.</p>' +
        starters.map(card).join('')
      : '<div class="empty"><span class="ic">👋</span>No one\'s being onboarded right now.<br>When you add a new worker, their onboarding plan kicks off automatically.<br><button class="btn btn-primary" style="margin-top:1.2rem" id="addStarter">+ Onboard a new starter</button></div>';
    layout('onboarding', 'Onboarding', body);
    const a = $('#addStarter'); if (a) a.onclick = openWorkerModal;
  }

  async function viewTeam() {
    const employees = await api('GET', '/employees');
    const content =
      '<div class="section-title"><h3>Your workers</h3><button class="btn btn-primary btn-sm" id="addWorker">+ Add a worker</button></div>' +
      (employees.length
        ? '<div class="row-list">' + employees.map((e) =>
          '<a href="#/member/' + e.id + '" class="row"><span class="ic-circle">👷</span><span class="grow"><span class="t">' + esc(e.name) + '</span><span class="s">' + esc(e.job_title || '') + (e.employment_type ? ' · ' + esc(e.employment_type) : '') + '</span></span>' +
          '<span class="meta">' + (e.open_cases ? '<span class="badge badge-watchful">' + e.open_cases + ' open</span>' : '<span class="muted">—</span>') + '</span></a>').join('') + '</div>'
        : '<div class="empty"><span class="ic">👷</span>No workers yet. Add your crew to get started.</div>');
    layout('team', 'Workers', content);
    $('#addWorker').onclick = openWorkerModal;
  }

  async function openWorkerModal() {
    const cfg = await getConfig();
    const spOpts = cfg.starterProfiles.map((p) => '<option value="' + p.id + '">' + esc(p.label) + '</option>').join('');
    const canOnboard = State.flows.some((f) => f.id === 'onboarding');
    openModal(
      '<h2>Add a worker</h2>' +
      '<div class="field"><label>Name *</label><input id="wName" placeholder="e.g. Sam Okafor"></div>' +
      '<div class="field"><label>Job title</label><input id="wTitle" placeholder="e.g. Laboratory Technician"></div>' +
      '<div class="grid grid-2"><div class="field"><label>Employment type</label><select id="wType"><option>Full time</option><option>Part time</option><option>Casual</option><option>Apprentice</option><option>Contractor</option></select></div>' +
      '<div class="field"><label>Started</label><input type="date" id="wStart" value="' + todayStr() + '"></div></div>' +
      '<div class="field"><label>What kind of starter? <span class="muted" style="font-weight:400">(sets their training pace)</span></label><select id="wStarter"><option value="">— not sure —</option>' + spOpts + '</select><div class="hint" id="wStarterHint"></div></div>' +
      (canOnboard ? '<label class="check-item" style="margin-bottom:1rem"><input type="checkbox" id="wOnboard" checked><span><span class="ci-label">Start onboarding now</span><br><span class="ci-help">Walk through gear, a buddy, the first-week plan and early check-ins.</span></span></label>' : '') +
      '<div class="modal-foot"><button class="btn btn-ghost" id="wCancel">Cancel</button><button class="btn btn-primary" id="wSave">Add worker</button></div>'
    );
    const sp = $('#wStarter'); const hint = $('#wStarterHint');
    sp.onchange = () => { const p = cfg.starterProfiles.find((x) => x.id === sp.value); hint.textContent = p ? (p.pace + ' · ' + p.note) : ''; };
    $('#wCancel').onclick = closeModal;
    $('#wSave').onclick = async () => {
      const name = $('#wName').value.trim();
      if (!name) { toast('A name is needed', 'error'); return; }
      const emp = await api('POST', '/employees', { name, job_title: $('#wTitle').value.trim(), employment_type: $('#wType').value, start_date: $('#wStart').value, starter_profile: sp.value || null });
      const onboard = canOnboard && $('#wOnboard') && $('#wOnboard').checked;
      closeModal();
      if (onboard) { const c = await api('POST', '/cases', { employee_id: emp.id, flow_id: 'onboarding' }); location.hash = '#/case/' + c.id; }
      else viewTeam();
    };
  }

  // ---------------- HIRING / recruitment ----------------
  async function getInterviewKit() { if (!State.kit) State.kit = await api('GET', '/interview-kit'); return State.kit; }
  async function getReferenceKit() { if (!State.refKit) State.refKit = await api('GET', '/reference-kit'); return State.refKit; }
  const CAND_STATUS = {
    new: { label: 'Added', cls: '' }, applied: { label: 'Applied', cls: 'badge-proactive' },
    interview: { label: 'Interviewing', cls: 'badge-watchful' }, offer: { label: 'Offer sent', cls: 'badge-proactive' },
    accepted: { label: 'Accepted ✓', cls: 'badge-positive' }, hired: { label: 'Hired 🎉', cls: 'badge-positive' },
    declined: { label: 'Declined', cls: '' }, rejected: { label: 'Not proceeding', cls: '' }
  };
  function statusBadge(s) { const m = CAND_STATUS[s] || { label: s, cls: '' }; return '<span class="badge ' + m.cls + '">' + esc(m.label) + '</span>'; }

  async function viewHiring() {
    const [cands, contracts, emailStatus, smsStatus, jobOpenings] = await Promise.all([api('GET', '/candidates'), api('GET', '/files?kind=contract').catch(() => []), api('GET', '/email-status').catch(() => ({ configured: false })), api('GET', '/sms-status').catch(() => ({ configured: false })), api('GET', '/job-openings').catch(() => [])]);
    const closedSet = { hired: 1, rejected: 1, declined: 1 };
    const active = cands.filter((c) => !closedSet[c.status]);
    const done = cands.filter((c) => closedSet[c.status]);
    const contract = (contracts && contracts.length) ? contracts[0] : null;
    const row = (c) => '<a href="#/candidate/' + c.id + '" class="row"><span class="ic-circle">🧑‍💼</span><span class="grow"><span class="t">' + esc(c.name) + '</span><span class="s">' + esc(c.role_applied || 'Role TBC') + (c.phone ? ' · ' + esc(c.phone) : '') + '</span></span><span class="meta">' + statusBadge(c.status) + '</span></a>';
    const setupPanel = '<details class="panel" style="margin-bottom:1.2rem"><summary style="cursor:pointer;font-weight:700">⚙️ Hiring set-up — contract &amp; email</summary><div style="margin-top:.9rem">' +
      '<strong>Employment contract</strong><div class="muted" style="font-size:.88rem;margin:.2rem 0 .5rem">Upload your standard contract once. It can be attached to offers and downloaded any time.</div>' +
      (contract ? '<div class="link-box"><code>📄 ' + esc(contract.name) + '</code><a href="/api/files/' + contract.id + '/download" target="_blank" class="btn btn-ghost btn-sm">View</a><button class="btn btn-ghost btn-sm" id="delContract">Remove</button></div>' : '') +
      '<label class="btn btn-ghost btn-sm" style="margin-top:.4rem;cursor:pointer">' + (contract ? '↻ Replace contract' : '⬆ Upload contract') + '<input type="file" id="contractFile" accept=".pdf,.doc,.docx" style="display:none"></label>' +
      '<div style="margin-top:1rem"><strong>Sending by email</strong><div class="muted" style="font-size:.88rem;margin-top:.2rem">' + (emailStatus.configured ? '✅ Connected as <strong>' + esc(emailStatus.from) + '</strong> — you can email forms and offers straight from the app.' : '✉️ Not connected yet — copy-and-paste for now. Add your email’s SMTP details (env vars) to switch on one-click send.') + '</div></div>' +
      '<div style="margin-top:1rem"><strong>Texting (SMS)</strong><div class="muted" style="font-size:.88rem;margin-top:.2rem">' + (smsStatus.configured ? '✅ Connected via <strong>' + esc(smsStatus.provider) + '</strong> — you can text application forms, reference requests and offer links.' : '📱 Not connected. Sign up for <strong>ClickSend</strong> (Aussie, simplest) or <strong>Twilio</strong>, then add the API keys as env vars and the “Text” buttons go live. Texts go out as your business name.') + '</div></div>' +
      '<div style="margin-top:1rem"><strong>Auto-import applications (advanced)</strong><div class="muted" style="font-size:.88rem;margin-top:.2rem">Use Seek/Indeed as normal, then just hit <strong>“📥 Import from email”</strong> below to drop an applicant (and resume) in — no setup. For fully automatic, point an inbound-email service (CloudMailin/SendGrid) at <code style="font-size:.8rem">/api/inbound/' + esc(State.me.business.id) + '?key=YOUR_SECRET</code> and forward your application emails there.</div></div>' +
      '</div></details>';
    const careersLink = location.origin + '/jobs/' + State.me.business.id;
    const openings = jobOpenings || [];
    const openingRow = (j) => {
      const applyLink = location.origin + '/apply/' + j.token;
      return '<div class="card card-pad" style="margin-bottom:.6rem"><div style="display:flex;justify-content:space-between;gap:1rem;align-items:flex-start"><div class="grow"><strong>' + esc(j.title) + '</strong> ' + (j.status === 'open' ? '<span class="badge badge-positive">Open</span>' : '<span class="badge">Closed</span>') + (j.applicants ? ' <span class="muted" style="font-size:.85rem">· ' + j.applicants + ' applicant' + (j.applicants === 1 ? '' : 's') + '</span>' : '') + ([j.location, j.employment_type, j.pay_note].filter(Boolean).length ? '<div class="muted" style="font-size:.85rem">' + [j.location, j.employment_type, j.pay_note].filter(Boolean).map(esc).join(' · ') + '</div>' : '') + '</div><button class="btn btn-ghost btn-sm job-edit" data-id="' + j.id + '">edit</button></div>' +
        (j.status === 'open' ? '<div class="link-box" style="margin-top:.5rem"><code>' + esc(applyLink) + '</code><button class="btn btn-ghost btn-sm job-copy" data-l="' + esc(applyLink) + '">Copy apply link</button></div>' : '') + '</div>';
    };
    const openingsSection = '<div class="section-title" style="margin-top:2.4rem"><h3>📣 Share a job link (your site &amp; socials)</h3><button class="btn btn-ghost btn-sm" id="postJob">+ Post a job</button></div>' +
      '<p class="muted" style="max-width:66ch;margin-top:-.3rem">Post a role and get a link to drop on your <strong>website, Facebook, Instagram or LinkedIn</strong> — anyone who clicks applies (resume and all) straight into your pipeline. Works as the “apply” link for Indeed too. <span style="color:var(--ink-faint)">(Seek needs a different setup — ask if you want it.)</span></p>' +
      (openings.length ? openings.map(openingRow).join('') + '<div class="link-box" style="margin-top:.4rem"><code>' + esc(careersLink) + '</code><button class="btn btn-ghost btn-sm" id="copyCareers">📋 Your careers page (all roles)</button></div>' : '<div class="muted">No openings yet — post one to get a shareable apply link for your socials.</div>');

    const body = setupPanel +
      '<div class="section-title"><h3>Hiring pipeline</h3><div style="display:flex;gap:.4rem;flex-wrap:wrap"><button class="btn btn-ghost btn-sm" id="importEmail">📥 Import from email</button><button class="btn btn-primary btn-sm" id="addCand">+ Add a candidate</button></div></div>' +
      '<p class="muted" style="max-width:64ch;margin-top:-.3rem">From first application to first day. Add a candidate, send them a quick form, run a fair interview, make an offer — and when they accept, turn them into a worker with onboarding ready to go.</p>' +
      (active.length ? '<div class="row-list">' + active.map(row).join('') + '</div>'
        : '<div class="empty"><span class="ic">🧑‍💼</span>No one in the pipeline yet.<br>Add a candidate to get started.<br><button class="btn btn-primary" style="margin-top:1.2rem" id="addCand2">+ Add a candidate</button></div>') +
      (done.length ? '<div class="section-title" style="margin-top:1.8rem"><h3>Closed (' + done.length + ')</h3></div><div class="row-list">' + done.map(row).join('') + '</div>' : '') +
      openingsSection;
    layout('hiring', 'Hiring', body);
    const a = $('#addCand'); if (a) a.onclick = openAddCandidate;
    const a2 = $('#addCand2'); if (a2) a2.onclick = openAddCandidate;
    const ie = $('#importEmail'); if (ie) ie.onclick = openImportEmail;
    const cf = $('#contractFile'); if (cf) cf.onchange = async (e) => { const file = e.target.files[0]; if (!file) return; if (file.size > 4 * 1024 * 1024) { toast('File too big (max ~4MB)', 'error'); return; } toast('Uploading…'); const data = await fileToB64(file); await api('POST', '/files', { kind: 'contract', name: file.name, mime: file.type || 'application/octet-stream', data: data }); toast('Contract saved'); viewHiring(); };
    const dc = $('#delContract'); if (dc) dc.onclick = async () => { await api('DELETE', '/files/' + contract.id); toast('Removed'); viewHiring(); };
    const pj = $('#postJob'); if (pj) pj.onclick = () => openJobModal(null);
    const cc = $('#copyCareers'); if (cc) cc.onclick = () => { if (navigator.clipboard) navigator.clipboard.writeText(careersLink); toast('Careers page link copied'); };
    root().querySelectorAll('.job-edit').forEach((b) => { b.onclick = () => openJobModal((jobOpenings || []).find((j) => j.id === b.getAttribute('data-id'))); });
    root().querySelectorAll('.job-copy').forEach((b) => { b.onclick = () => { if (navigator.clipboard) navigator.clipboard.writeText(b.getAttribute('data-l')); toast('Apply link copied — paste it into your Seek/Indeed ad'); }; });
  }

  async function openJobModal(job) {
    const kit = await api('GET', '/job-ad-kit').catch(() => ({}));
    job = job || {};
    const types = ['Full time', 'Part time', 'Casual', 'Apprentice', 'Contract'];
    const avoidHtml = (kit.avoid || []).map((a) => '<div class="dna-item"><div class="dna-topic">🚫 ' + esc(a.dont) + '</div><div class="dna-why">' + esc(a.why) + '</div>' + (a.instead ? '<div class="dna-instead">✅ Instead: ' + esc(a.instead) + '</div>' : '') + '</div>').join('');
    openModal('<h2>' + (job.id ? 'Edit job opening' : 'Post a job') + '</h2>' +
      '<div class="field"><label>Job title *</label><input id="joTitle" value="' + esc(job.title || '') + '" placeholder="e.g. Laboratory Assistant"></div>' +
      '<div class="field"><label>About the role</label><textarea id="joBlurb" rows="5" placeholder="What they\'ll do, the genuine requirements, what makes it a good gig. Describe the job, not the person.">' + esc(job.blurb || '') + '</textarea></div>' +
      '<div class="grid grid-2"><div class="field"><label>Location</label><input id="joLoc" value="' + esc(job.location || '') + '" placeholder="e.g. Newcastle, NSW"></div><div class="field"><label>Type</label><select id="joType"><option value="">—</option>' + types.map((t) => '<option' + (job.employment_type === t ? ' selected' : '') + '>' + t + '</option>').join('') + '</select></div></div>' +
      '<div class="field"><label>Pay (optional but recommended)</label><input id="joPay" value="' + esc(job.pay_note || '') + '" placeholder="e.g. $38–$44/hr + super, above award"></div>' +
      (avoidHtml ? '<details class="dna" style="margin:.4rem 0 1rem"><summary>⚖️ Keep the ad lawful — what not to write</summary><div class="dna-body"><p class="muted" style="margin:.5rem 0">' + esc(kit.intro || '') + '</p>' + avoidHtml + (kit.example && kit.example.good ? '<div class="lr-note" style="margin-top:.6rem"><strong>Good example:</strong> ' + esc(kit.example.good) + '</div>' : '') + '</div></details>' : '') +
      '<div class="modal-foot">' + (job.id ? '<button class="btn btn-ghost" id="joToggle">' + (job.status === 'open' ? 'Close role' : 'Reopen') + '</button><button class="btn btn-ghost" id="joDel">Delete</button>' : '<button class="btn btn-ghost" id="joCancel">Cancel</button>') + '<button class="btn btn-primary" id="joSave">' + (job.id ? 'Save' : 'Post & get link') + '</button></div>');
    const payload = () => ({ title: $('#joTitle').value.trim(), blurb: $('#joBlurb').value.trim(), location: $('#joLoc').value.trim(), employment_type: $('#joType').value, pay_note: $('#joPay').value.trim() });
    $('#joSave').onclick = async () => { if (!$('#joTitle').value.trim()) { toast('A title is needed', 'error'); return; } if (job.id) { await api('PATCH', '/job-openings/' + job.id, payload()); } else { await api('POST', '/job-openings', payload()); } closeModal(); toast('Saved'); viewHiring(); };
    const jt = $('#joToggle'); if (jt) jt.onclick = async () => { await api('PATCH', '/job-openings/' + job.id, { status: job.status === 'open' ? 'closed' : 'open' }); closeModal(); toast('Updated'); viewHiring(); };
    const jd = $('#joDel'); if (jd) jd.onclick = async () => { await api('DELETE', '/job-openings/' + job.id); closeModal(); toast('Deleted'); viewHiring(); };
    const jc = $('#joCancel'); if (jc) jc.onclick = closeModal;
  }

  function parseEmailClient(text) {
    const t = text || '';
    const NM = "([A-Z][a-zA-Z'\\-]+(?:[ \\t]+[A-Z][a-zA-Z'\\-]+){1,3})";
    const bad = /^(SEEK|Indeed|LinkedIn|Jora|Application|New|Candidate|Job|Apply|Dear|Hi|Hello)$/i;
    let name = '';
    const tries = [new RegExp('\\b(?:Name|Candidate|Applicant|application from|From)[: \\t]+' + NM), new RegExp(NM + '[ \\t]+(?:has applied|applied|submitted)')];
    for (const rx of tries) { const m = t.match(rx); if (m && !bad.test(m[1].split(' ')[0])) { name = m[1].trim(); break; } }
    const emails = t.match(/[\w.+\-]+@[\w\-]+\.[\w.\-]+/g) || [];
    const email = emails.find((e) => !/noreply|no-reply|donotreply|seek\.com|indeed\.com|linkedin\.com|messages\.|notification/i.test(e)) || '';
    const ph = (t.match(/(?:\+?61|0)\d[\d\s\-]{7,12}\d/) || [])[0] || '';
    return { name: name, email: email, phone: ph ? ph.replace(/[\s\-]/g, '') : '' };
  }
  function openImportEmail() {
    openModal('<h2>📥 Import an applicant from email</h2><p class="muted">Paste the Seek/Indeed application email — Offsider fills in their details for you to check. Attach their resume if you have it.</p>' +
      '<div class="field"><label>Paste the application email</label><textarea id="ieText" rows="6" placeholder="Paste the whole email here…"></textarea></div>' +
      '<div class="grid grid-2"><div class="field"><label>Name *</label><input id="ieName" placeholder="Auto-filled from the email"></div><div class="field"><label>Role</label><input id="ieRole" placeholder="e.g. Lab Assistant"></div></div>' +
      '<div class="grid grid-2"><div class="field"><label>Email</label><input id="ieEmail"></div><div class="field"><label>Phone</label><input id="iePhone"></div></div>' +
      '<div class="field"><label>Their resume (optional)</label><input type="file" id="ieResume" accept=".pdf,.doc,.docx"></div>' +
      '<div class="modal-foot"><button class="btn btn-ghost" id="ieCancel">Cancel</button><button class="btn btn-primary" id="ieSave">Add to pipeline</button></div>');
    $('#ieText').oninput = function () { const p = parseEmailClient(this.value); if (p.name && !$('#ieName').value) $('#ieName').value = p.name; if (p.email && !$('#ieEmail').value) $('#ieEmail').value = p.email; if (p.phone && !$('#iePhone').value) $('#iePhone').value = p.phone; };
    $('#ieCancel').onclick = closeModal;
    $('#ieSave').onclick = async () => {
      const name = $('#ieName').value.trim();
      const fi = $('#ieResume'); const file = fi && fi.files && fi.files[0];
      if (!name && !file) { toast('Add a name, or paste the email', 'error'); return; }
      const go = async (resume) => { const r = await api('POST', '/candidates/from-email', { text: $('#ieText').value.trim(), name: name, email: $('#ieEmail').value.trim(), phone: $('#iePhone').value.trim(), role: $('#ieRole').value.trim(), resume: resume }); closeModal(); toast('Added to pipeline'); location.hash = '#/candidate/' + r.id; };
      if (file) { if (file.size > 8 * 1024 * 1024) { toast('Resume too big (max ~8MB)', 'error'); return; } toast('Adding…'); go({ name: file.name, mime: file.type || 'application/octet-stream', data: await fileToB64(file) }); }
      else go(null);
    };
  }

  async function openAddCandidate() {
    openModal('<h2>Add a candidate</h2><p class="muted">Just the basics to start — you\'ll send them a quick application form next.</p>' +
      '<div class="field"><label>Name *</label><input id="cName" placeholder="e.g. Alex Rivera"></div>' +
      '<div class="field"><label>Role they\'re applying for</label><input id="cRole" placeholder="e.g. Laboratory Assistant"></div>' +
      '<div class="grid grid-2"><div class="field"><label>Email</label><input id="cEmail" placeholder="name@email.com"></div><div class="field"><label>Phone</label><input id="cPhone" placeholder="0400 000 000"></div></div>' +
      '<div class="modal-foot"><button class="btn btn-ghost" id="cCancel">Cancel</button><button class="btn btn-primary" id="cSave">Add candidate</button></div>');
    $('#cCancel').onclick = closeModal;
    $('#cSave').onclick = async () => {
      const name = $('#cName').value.trim();
      if (!name) { toast('A name is needed', 'error'); return; }
      const r = await api('POST', '/candidates', { name, role_applied: $('#cRole').value.trim(), email: $('#cEmail').value.trim(), phone: $('#cPhone').value.trim() });
      closeModal(); location.hash = '#/candidate/' + r.id;
    };
  }

  async function viewCandidate(id) {
    const [c, kit, refKit, refs, aiStatus] = await Promise.all([api('GET', '/candidates/' + id), getInterviewKit(), getReferenceKit(), api('GET', '/candidates/' + id + '/references'), api('GET', '/ai-status').catch(() => ({ configured: false }))]);
    const link = location.origin + '/c/' + c.token;
    const iv = c.interview && typeof c.interview === 'object' ? c.interview : {};
    iv.asked = iv.asked || {}; iv.notes = iv.notes || {}; iv.gut = iv.gut || {};

    // application
    let appHtml;
    if (c.application) {
      const fl = {}; (kit.applicationFields || []).forEach((f) => { fl[f.id] = f.label; });
      appHtml = '<div class="row-list">' + Object.keys(c.application).map((k) => '<div class="resp-card" style="margin:0 0 .5rem"><div class="resp-q">' + esc(fl[k] || k) + '</div><div class="resp-a">' + esc(c.application[k] || '—') + '</div></div>').join('') + '</div>';
    } else {
      appHtml = '<div class="panel"><strong>Send them this application link</strong><div class="muted" style="font-size:.9rem;margin:.2rem 0">A short, lawful form — right to work, ability to do the role, availability. They fill it on their phone, no login.</div><div class="link-box"><code>' + esc(link) + '</code><button class="btn btn-primary btn-sm" id="copyApp">Copy</button></div>' + ((c.email || c.phone) ? '<div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.5rem">' + (c.email ? '<button class="btn btn-ghost btn-sm" id="sendAppEmail2">✉️ Email it</button>' : '') + (c.phone ? '<button class="btn btn-ghost btn-sm" id="sendAppSms2">📱 Text it</button>' : '') + '</div>' : '') + '</div>';
    }

    // interview questions
    const groups = {};
    (kit.lawfulQuestions || []).forEach((q, i) => { const g = groups[q.category] = groups[q.category] || []; g.push({ key: 'L' + i, q: q.question, why: q.why }); });
    const jobG = (kit.jobRequirementQuestions || []).map((q, i) => ({ key: 'J' + i, q: q.question, why: q.why }));
    const qRow = (it) => '<div class="iq"><label class="iq-check"><input type="checkbox" data-asked="' + it.key + '"' + (iv.asked[it.key] ? ' checked' : '') + '><span>' + esc(it.q) + '</span></label>' +
      '<input class="iq-note" data-note="' + it.key + '" placeholder="What they said / your note…" value="' + esc(iv.notes[it.key] || '') + '">' +
      (it.why ? '<div class="iq-why">' + esc(it.why) + '</div>' : '') + '</div>';
    const lawfulHtml = Object.keys(groups).map((cat) => '<div class="iq-group"><div class="iq-cat">' + esc(cat) + '</div>' + groups[cat].map(qRow).join('') + '</div>').join('');
    const jobHtml = '<div class="iq-group"><div class="iq-cat">✅ Can they do the job? <span class="muted" style="font-weight:400">(always lawful — ask about the work)</span></div>' + jobG.map(qRow).join('') + '</div>';
    const dnaHtml = (kit.doNotAsk || []).map((d) => '<div class="dna-item"><div class="dna-topic">🚫 ' + esc(d.topic) + ' ' + refChip('recruitment', d.topic, d.topic) + '</div>' + (d.example ? '<div class="dna-eg">Avoid: ' + esc(d.example) + '</div>' : '') + '<div class="dna-why">' + esc(d.why) + '</div><div class="dna-instead">✅ Instead: ' + esc(d.insteadAsk) + '</div></div>').join('');
    const gutHtml = (kit.gutFeelPrompts || []).map((p, i) => '<div class="field"><label>' + esc(p) + '</label><textarea data-gut="G' + i + '" rows="2">' + esc(iv.gut['G' + i] || '') + '</textarea></div>').join('');

    // offer / hire actions
    const fn = c.name.split(' ')[0];
    let actionHtml;
    if (c.status === 'accepted') actionHtml = '<div class="panel" style="background:var(--positive-50);border-color:var(--positive)"><strong>🎉 ' + esc(fn) + ' accepted the offer!</strong><div class="muted" style="font-size:.9rem;margin:.2rem 0 .7rem">Turn them into a worker and their onboarding plan kicks off automatically.</div><button class="btn btn-primary" id="hireBtn">Convert to worker &amp; start onboarding →</button></div>';
    else if (c.status === 'hired') actionHtml = '<div class="panel"><strong>Hired 🎉</strong> &nbsp; <a href="#/member/' + c.hired_employee_id + '" class="btn btn-ghost btn-sm">Open their worker file →</a></div>';
    else if (c.status === 'offer') actionHtml = '<div class="panel"><strong>Offer sent — waiting on ' + esc(fn) + '</strong><div class="muted" style="font-size:.9rem;margin:.2rem 0">They can accept on their link, or record it here.</div><div class="link-box"><code>' + esc(link) + '</code><button class="btn btn-ghost btn-sm" id="copyOfferLink">Copy</button></div><div style="display:flex;gap:.5rem;margin-top:.6rem"><button class="btn btn-primary btn-sm" id="markAccepted">✓ They accepted</button><button class="btn btn-ghost btn-sm" id="makeOffer2">Edit / re-send offer</button></div></div>';
    else actionHtml = '<div class="panel"><strong>Ready to make an offer?</strong><div class="muted" style="font-size:.9rem;margin:.2rem 0 .7rem">Offsider writes the offer email for you and gives them a one-click accept link.</div><button class="btn btn-primary" id="makeOffer">💼 Make an offer</button></div>';

    // references
    const fillRef = (s) => String(s || '').replace(/\{\{managerName\}\}/g, State.me.name).replace(/\{\{businessName\}\}/g, State.me.business.name).replace(/\{\{candidateName\}\}/g, c.name).replace(/\{\{roleTitle\}\}/g, c.role_applied || 'the role');
    const refRow = (r) => {
      const rlink = location.origin + '/r/' + r.token;
      const sb = r.status === 'received' ? '<span class="badge badge-positive">Received ✓</span>' : '<span class="badge">Awaiting</span>';
      const ans = r.answers ? '<details style="margin-top:.5rem"><summary class="muted" style="cursor:pointer">View answers</summary>' + (refKit.questions || []).map((q, i) => r.answers['r' + i] ? ('<div class="resp-q" style="margin-top:.4rem">' + esc(fillRef(q.question)) + '</div><div class="resp-a">' + esc(r.answers['r' + i]) + '</div>') : '').join('') + (r.notes ? '<div class="resp-q" style="margin-top:.4rem">Your notes</div><div class="resp-a">' + esc(r.notes) + '</div>' : '') + '</details>' : '';
      return '<div class="card card-pad" style="margin-bottom:.6rem"><div><strong>' + esc(r.referee_name || 'Referee') + '</strong> ' + sb + '<div class="muted" style="font-size:.86rem">' + [r.relationship, r.company, r.phone, r.email].filter(Boolean).map(esc).join(' · ') + '</div></div><div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.6rem"><button class="btn btn-ghost btn-sm ref-copy" data-l="' + esc(rlink) + '">📋 Copy link</button>' + (r.email ? '<button class="btn btn-ghost btn-sm ref-send" data-id="' + r.id + '">✉️ Email request</button>' : '<button class="btn btn-ghost btn-sm ref-email" data-id="' + r.id + '">✉️ Email text</button>') + (r.phone ? '<button class="btn btn-ghost btn-sm ref-send-sms" data-id="' + r.id + '">📱 Text request</button>' : '') + '<button class="btn btn-primary btn-sm ref-fill" data-id="' + r.id + '">' + (r.status === 'received' ? 'Edit answers' : 'Record by phone') + '</button></div>' + ans + '</div>';
    };
    const refSection = '<div class="section-title" style="margin-top:1.8rem"><h3>📞 Reference checks</h3><button class="btn btn-primary btn-sm" id="addReferee">+ Add a referee</button></div>' +
      '<details class="dna" style="border-color:var(--brand);background:var(--brand-50)"><summary style="color:var(--brand)">📋 How to run a reference call (script + what to ask)</summary><div class="dna-body"><p style="margin:.6rem 0;white-space:pre-wrap">' + esc(fillRef(refKit.intro)) + '</p><div class="dna-instead">' + esc(refKit.lawfulNote || '') + ' ' + refChip('references', 'reference checking privacy consent discrimination', 'Reference checks') + '</div></div></details>' +
      (refs.length ? refs.map(refRow).join('') : '<div class="muted">No referees yet. Add one, then send them a link to fill out — or call them and record their answers.</div>');

    const header = '<div><h1 style="margin:0 0 .15rem">' + esc(c.name) + '</h1><div class="muted">' + esc(c.role_applied || 'Role TBC') + ' &nbsp;·&nbsp; ' + statusBadge(c.status) + '</div>' +
      ((c.email || c.phone) ? '<div class="muted" style="font-size:.86rem;margin-top:.25rem">' + [c.email, c.phone].filter(Boolean).map(esc).join(' &nbsp;·&nbsp; ') + '</div>' : '') + '</div>';

    const sched = c.schedule;
    const scheduleBlock = (sched && sched.scheduled_at)
      ? '<div class="panel" style="margin:1.2rem 0;background:var(--brand-50);border-color:var(--brand)"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:1rem"><div><strong>📅 Interview booked</strong><div style="font-family:var(--font-head);font-weight:800;font-size:1.1rem;margin-top:.2rem">' + esc(fmtDateTime(sched.scheduled_at)) + '</div>' + (sched.location ? '<div class="muted">📍 ' + esc(sched.location) + '</div>' : '') + (sched.note ? '<div class="muted" style="font-size:.88rem;margin-top:.2rem">' + esc(sched.note) + '</div>' : '') + '</div><button class="btn btn-ghost btn-sm" id="schedBtn">Reschedule</button></div>' + ((c.email || c.phone) ? '<div style="margin-top:.7rem;display:flex;gap:.5rem;flex-wrap:wrap">' + (c.email ? '<button class="btn btn-ghost btn-sm" id="sendAppEmail">✉️ Email the form</button>' : '') + (c.phone ? '<button class="btn btn-ghost btn-sm" id="sendAppSms">📱 Text the form</button>' : '') + '</div>' : '') + '</div>'
      : '<div class="panel" style="margin:1.2rem 0;border-style:dashed"><strong>📅 Schedule the interview</strong><div class="muted" style="font-size:.9rem;margin:.2rem 0 .6rem">Pop in a time — you\'ll get a reminder, and (with email on) their form can auto-send the day before.</div><button class="btn btn-primary btn-sm" id="schedBtn">+ Book a time</button></div>';
    const resumeFiles = (c.files || []).filter((f) => f.kind === 'resume');
    const resumeFilesHtml = resumeFiles.length ? '<div class="row-list" style="margin-bottom:.6rem">' + resumeFiles.map((f) => '<div class="row" style="cursor:default"><span class="ic-circle">📎</span><span class="grow"><span class="t">' + esc(f.name) + '</span></span><span class="meta"><a href="/api/candidate-files/' + f.id + '/download" target="_blank" class="btn btn-ghost btn-sm">View</a> <button class="btn btn-ghost btn-sm cfile-del" data-id="' + f.id + '">✕</button></span></div>').join('') + '</div>' : '';
    // ✨ AI résumé reader — show when there's a résumé (file or pasted text) to read
    const aiReadBtn = (resumeFiles.length || c.resume_text) ? '<button class="btn btn-ghost btn-sm" id="aiReadResume" title="Let the AI read the résumé and fill in their name, email &amp; phone">✨ Read with AI</button>' : '';

    layout('hiring', c.name,
      header +
      scheduleBlock +
      '<div class="section-title" style="margin-top:1.4rem"><h3>📋 Application</h3></div>' + appHtml +
      actionHtml +
      '<div class="section-title" style="margin-top:1.8rem"><h3>🎤 Interview</h3><button class="btn btn-primary btn-sm" id="saveIv">Save interview</button></div>' +
      '<div class="guard-banner">🧭 <strong>Ask about the job, not the person.</strong> Tick what you asked and jot their answers — every question below is lawful to ask. ' + refChip('recruitment', 'protected attributes discrimination interview hiring', 'Lawful interview questions') + '</div>' +
      lawfulHtml + jobHtml +
      '<details class="dna"><summary>⚠️ Questions you must NOT ask — and what to ask instead</summary><div class="dna-body">' + dnaHtml + '</div></details>' +
      refSection +
      '<div class="section-title" style="margin-top:1.4rem"><h3>🤔 Your read on them</h3></div>' + gutHtml +
      '<div class="field"><label>Things to tell the candidate (about the role, pay, next steps)</label><textarea id="tellThem" rows="2">' + esc(iv.tellThem || '') + '</textarea></div>' +
      '<div class="section-title" style="margin-top:1.8rem"><h3>📄 Resume &amp; notes</h3><span style="display:flex;gap:.4rem;flex-wrap:wrap">' + aiReadBtn + '<label class="btn btn-ghost btn-sm" style="cursor:pointer">⬆ Upload resume<input type="file" id="resumeFile" accept=".pdf,.doc,.docx" style="display:none"></label></span></div>' +
      (aiReadBtn && !aiStatus.configured ? '<div class="muted" style="font-size:.84rem;margin:-.4rem 0 .6rem">✨ Tip: switch on AI auto-fill by adding an <code>ANTHROPIC_API_KEY</code> — then résumés fill in name, email &amp; phone automatically.</div>' : '') +
      resumeFilesHtml +
      '<div class="field"><textarea id="resume" rows="4" placeholder="Or paste their resume / any notes here…">' + esc(c.resume_text || '') + '</textarea></div><button class="btn btn-ghost btn-sm" id="saveResume">Save notes</button>',
      '<a href="#/hiring">Hiring</a>');

    const cA = $('#copyApp'); if (cA) cA.onclick = () => { if (navigator.clipboard) navigator.clipboard.writeText(link); toast('Application link copied — text or email it'); };
    const cOL = $('#copyOfferLink'); if (cOL) cOL.onclick = () => { if (navigator.clipboard) navigator.clipboard.writeText(link); toast('Link copied'); };
    root().querySelectorAll('[data-asked]').forEach((el) => { el.onchange = () => { iv.asked[el.getAttribute('data-asked')] = el.checked; }; });
    root().querySelectorAll('[data-note]').forEach((el) => { el.oninput = () => { iv.notes[el.getAttribute('data-note')] = el.value; }; });
    root().querySelectorAll('[data-gut]').forEach((el) => { el.oninput = () => { iv.gut[el.getAttribute('data-gut')] = el.value; }; });
    const tt = $('#tellThem'); if (tt) tt.oninput = () => { iv.tellThem = tt.value; };
    $('#saveIv').onclick = async () => {
      const status = (c.status === 'new' || c.status === 'applied') ? 'interview' : c.status;
      await api('PATCH', '/candidates/' + id, { interview: iv, status });
      toast('Interview saved'); if (status !== c.status) viewCandidate(id);
    };
    const sr = $('#saveResume'); if (sr) sr.onclick = async () => { await api('PATCH', '/candidates/' + id, { resume_text: $('#resume').value }); toast('Saved'); };
    const sb = $('#schedBtn'); if (sb) sb.onclick = () => openScheduleInterview(c);
    const sae = $('#sendAppEmail'); if (sae) sae.onclick = async () => reportSend(await api('POST', '/candidates/' + id + '/send-application', { channel: 'email' }), 'email');
    const sas = $('#sendAppSms'); if (sas) sas.onclick = async () => reportSend(await api('POST', '/candidates/' + id + '/send-application', { channel: 'sms' }), 'sms');
    const sae2 = $('#sendAppEmail2'); if (sae2) sae2.onclick = async () => reportSend(await api('POST', '/candidates/' + id + '/send-application', { channel: 'email' }), 'email');
    const sas2 = $('#sendAppSms2'); if (sas2) sas2.onclick = async () => reportSend(await api('POST', '/candidates/' + id + '/send-application', { channel: 'sms' }), 'sms');
    const rfu = $('#resumeFile'); if (rfu) rfu.onchange = async (e) => { const file = e.target.files[0]; if (!file) return; if (file.size > 6 * 1024 * 1024) { toast('File too big (max ~6MB)', 'error'); return; } toast('Uploading…'); const data = await fileToB64(file); await api('POST', '/candidates/' + id + '/files', { kind: 'resume', name: file.name, mime: file.type || 'application/octet-stream', data: data }); toast('Resume uploaded'); viewCandidate(id); };
    const air = $('#aiReadResume'); if (air) air.onclick = async () => {
      const t0 = air.textContent; air.disabled = true; air.textContent = '✨ Reading…';
      try {
        const r = await api('POST', '/candidates/' + id + '/parse-resume', {});
        if (r && r.ok) { toast(r.filled && r.filled.length ? '✨ Filled in their ' + r.filled.join(', ') + ' from the résumé' : '✨ Read the résumé — added a summary to the notes'); viewCandidate(id); return; }
        air.disabled = false; air.textContent = t0;
        if (r && r.reason === 'not_configured') toast('AI reading isn\'t switched on yet — add an ANTHROPIC_API_KEY to enable it', 'error');
        else if (r && r.reason === 'no_resume') toast('No résumé to read yet — upload one first', 'error');
        else toast('Couldn\'t read that one — give it another go', 'error');
      } catch (err) { air.disabled = false; air.textContent = t0; toast('Couldn\'t read that one — give it another go', 'error'); }
    };
    root().querySelectorAll('.cfile-del').forEach((b) => { b.onclick = async () => { await api('DELETE', '/candidate-files/' + b.getAttribute('data-id')); viewCandidate(id); }; });
    const mo = $('#makeOffer'); if (mo) mo.onclick = () => openOffer(c);
    const mo2 = $('#makeOffer2'); if (mo2) mo2.onclick = () => openOffer(c);
    const ma = $('#markAccepted'); if (ma) ma.onclick = async () => { await api('PATCH', '/candidates/' + id, { status: 'accepted' }); toast('Marked as accepted'); viewCandidate(id); };
    const hb = $('#hireBtn'); if (hb) hb.onclick = async () => { const r = await api('POST', '/candidates/' + id + '/hire'); toast('Welcome aboard! Onboarding started'); location.hash = '#/member/' + r.employee_id; };
    const ar = $('#addReferee'); if (ar) ar.onclick = () => openAddReferee(id);
    root().querySelectorAll('.ref-copy').forEach((b) => { b.onclick = () => { if (navigator.clipboard) navigator.clipboard.writeText(b.getAttribute('data-l')); toast('Reference link copied'); }; });
    root().querySelectorAll('.ref-email').forEach((b) => { b.onclick = () => { const r = refs.find((x) => x.id === b.getAttribute('data-id')); if (r) openRefEmail(r, refKit, c); }; });
    root().querySelectorAll('.ref-send').forEach((b) => { b.onclick = async () => reportSend(await api('POST', '/references/' + b.getAttribute('data-id') + '/send', { channel: 'email' }), 'email'); });
    root().querySelectorAll('.ref-send-sms').forEach((b) => { b.onclick = async () => reportSend(await api('POST', '/references/' + b.getAttribute('data-id') + '/send', { channel: 'sms' }), 'sms'); });
    root().querySelectorAll('.ref-fill').forEach((b) => { b.onclick = () => { const r = refs.find((x) => x.id === b.getAttribute('data-id')); if (r) openReferenceAnswers(r, refKit, c); }; });
  }

  function openScheduleInterview(c) {
    const s = c.schedule || {};
    openModal('<h2>Schedule interview — ' + esc(c.name.split(' ')[0]) + '</h2>' +
      '<div class="field"><label>Date &amp; time</label><input type="datetime-local" id="ivWhen" value="' + (s.scheduled_at ? toLocalInput(s.scheduled_at) : '') + '"></div>' +
      '<div class="field"><label>Where</label><input id="ivWhere" value="' + esc(s.location || '') + '" placeholder="e.g. Newcastle lab, or a video link"></div>' +
      '<div class="field"><label>Notes for yourself (optional)</label><textarea id="ivNote" rows="2" placeholder="Who else is sitting in, things to probe…">' + esc(s.note || '') + '</textarea></div>' +
      (c.email ? '<div class="muted" style="font-size:.84rem;margin-bottom:.6rem">With email connected, their pre-fill form auto-sends the day before and you\'ll get a reminder 4 hours before.</div>' : '') +
      '<div class="modal-foot">' + (s.scheduled_at ? '<button class="btn btn-ghost" id="ivClear">Cancel interview</button>' : '<button class="btn btn-ghost" id="ivCancel">Cancel</button>') + '<button class="btn btn-primary" id="ivSave">Save</button></div>');
    $('#ivSave').onclick = async () => { const w = $('#ivWhen').value; if (!w) { toast('Pick a time', 'error'); return; } await api('PUT', '/candidates/' + c.id + '/interview-time', { scheduled_at: new Date(w).toISOString(), location: $('#ivWhere').value.trim(), note: $('#ivNote').value.trim() }); closeModal(); toast('Interview booked 📅'); viewCandidate(c.id); };
    const cl = $('#ivClear'); if (cl) cl.onclick = async () => { await api('DELETE', '/candidates/' + c.id + '/interview-time'); closeModal(); toast('Interview cleared'); viewCandidate(c.id); };
    const ca = $('#ivCancel'); if (ca) ca.onclick = closeModal;
  }

  async function openAddReferee(candidateId) {
    openModal('<h2>Add a referee</h2><p class="muted">Add their details, then send them a link or call them.</p>' +
      '<div class="field"><label>Referee name *</label><input id="rfName" placeholder="e.g. Dana Lee"></div>' +
      '<div class="grid grid-2"><div class="field"><label>Relationship</label><input id="rfRel" placeholder="e.g. Former supervisor"></div><div class="field"><label>Company</label><input id="rfCo" placeholder="Where they worked together"></div></div>' +
      '<div class="grid grid-2"><div class="field"><label>Phone</label><input id="rfPhone"></div><div class="field"><label>Email</label><input id="rfEmail"></div></div>' +
      '<div class="modal-foot"><button class="btn btn-ghost" id="rfCancel">Cancel</button><button class="btn btn-primary" id="rfSave">Add referee</button></div>');
    $('#rfCancel').onclick = closeModal;
    $('#rfSave').onclick = async () => {
      const n = $('#rfName').value.trim(); if (!n) { toast('A name is needed', 'error'); return; }
      await api('POST', '/candidates/' + candidateId + '/references', { referee_name: n, relationship: $('#rfRel').value.trim(), company: $('#rfCo').value.trim(), phone: $('#rfPhone').value.trim(), email: $('#rfEmail').value.trim() });
      closeModal(); toast('Referee added'); viewCandidate(candidateId);
    };
  }
  function openReferenceAnswers(r, refKit, c) {
    const ans = r.answers || {};
    const fill = (s) => String(s || '').replace(/\{\{candidateName\}\}/g, c.name).replace(/\{\{roleTitle\}\}/g, c.role_applied || 'the role').replace(/\{\{businessName\}\}/g, State.me.business.name);
    const qs = (refKit.questions || []).map((q, i) => '<div class="field"><label>' + esc(fill(q.question)) + '</label><textarea data-r="r' + i + '" rows="2">' + esc(ans['r' + i] || '') + '</textarea></div>').join('');
    openModal('<h2>Reference — ' + esc(r.referee_name || '') + '</h2><p class="muted">Jot their answers as you talk — saves to the candidate\'s file.</p>' + qs + '<div class="field"><label>Your notes</label><textarea id="refNotes" rows="2">' + esc(r.notes || '') + '</textarea></div><div class="modal-foot"><button class="btn btn-ghost" id="raCancel">Cancel</button><button class="btn btn-primary" id="raSave">Save reference</button></div>');
    $('#raCancel').onclick = closeModal;
    $('#raSave').onclick = async () => { const a = {}; root().querySelectorAll('[data-r]').forEach((t) => { a[t.getAttribute('data-r')] = t.value; }); await api('PATCH', '/references/' + r.id, { answers: a, notes: $('#refNotes').value, status: 'received' }); closeModal(); toast('Reference saved'); viewCandidate(c.id); };
  }
  function openRefEmail(r, refKit, c) {
    const data = { candidateName: c.name, roleTitle: c.role_applied || 'the role', businessName: State.me.business.name, managerName: State.me.name };
    const fill = (s) => String(s || '').replace(/\{\{(\w+)\}\}/g, (_, k) => (data[k] != null ? data[k] : ''));
    const subj = fill((refKit.requestEmail || {}).subject), body = fill((refKit.requestEmail || {}).body);
    openModal('<h2>Reference request email</h2><p class="muted">Copy this to ' + esc(r.referee_name || 'the referee') + ' — or just send them their link.</p><div class="field"><label>Subject</label><input value="' + esc(subj) + '" readonly></div><div class="field"><label>Message</label><textarea rows="10" readonly>' + esc(body) + '</textarea></div><div class="field"><label>Their link</label><div class="link-box"><code>' + esc(location.origin + '/r/' + r.token) + '</code></div></div><div class="modal-foot"><button class="btn btn-ghost" id="reClose">Close</button><button class="btn btn-primary" id="reCopy">Copy email</button></div>');
    $('#reClose').onclick = closeModal;
    $('#reCopy').onclick = () => { if (navigator.clipboard) navigator.clipboard.writeText(subj + '\n\n' + body); toast('Email copied'); };
  }

  async function openOffer(c) {
    openModal('<h2>Make an offer to ' + esc(c.name.split(' ')[0]) + '</h2>' +
      '<div class="grid grid-2"><div class="field"><label>Pay rate</label><input id="oRate" placeholder="e.g. 28.50"></div>' +
      '<div class="field"><label>Per</label><select id="oBasis"><option value="hour">hour</option><option value="week">week</option><option value="year">year</option></select></div></div>' +
      '<div class="grid grid-2"><div class="field"><label>Start date</label><input type="date" id="oStart"></div>' +
      '<div class="field"><label>Employment type</label><select id="oType"><option>Full time</option><option>Part time</option><option>Casual</option><option>Apprentice</option></select></div></div>' +
      '<div class="field"><label>A personal line (optional)</label><textarea id="oMsg" rows="2" placeholder="e.g. The whole team really enjoyed meeting you…"></textarea></div>' +
      '<div class="modal-foot"><button class="btn btn-ghost" id="oCancel">Cancel</button><button class="btn btn-primary" id="oSave">Generate offer →</button></div>');
    $('#oCancel').onclick = closeModal;
    $('#oSave').onclick = async () => {
      const r = await api('POST', '/candidates/' + c.id + '/offer', { rate: $('#oRate').value.trim(), pay_basis: $('#oBasis').value, start_date: $('#oStart').value, employment_type: $('#oType').value, message: $('#oMsg').value.trim() });
      const acceptLink = location.origin + r.acceptPath;
      const [emailStatus, contracts] = await Promise.all([api('GET', '/email-status').catch(() => ({ configured: false })), api('GET', '/files?kind=contract').catch(() => [])]);
      const contract = (contracts && contracts.length) ? contracts[0] : null;
      const canSend = !!c.email;
      openModal('<h2>Offer ready ✉️</h2><p class="muted">' + (canSend && emailStatus.configured ? 'Send it straight to ' + esc(c.email) + ', or copy it.' : 'Copy this into an email to ' + esc(c.name.split(' ')[0]) + '.') + ' They accept on their own link — you\'ll see it update here.</p>' +
        '<div class="field"><label>Subject</label><input value="' + esc(r.subject) + '" readonly></div>' +
        '<div class="field"><label>Message</label><textarea rows="10" readonly>' + esc(r.body) + '</textarea></div>' +
        (contract ? '<label class="check-item" style="margin:.2rem 0 .8rem"><input type="checkbox" id="oAttach" checked><span><span class="ci-label">📎 Attach our employment contract</span><br><span class="ci-help">' + esc(contract.name) + '</span></span></label>' : '') +
        '<div class="field"><label>Their accept link</label><div class="link-box"><code>' + esc(acceptLink) + '</code><button class="btn btn-ghost btn-sm" id="copyAccept">Copy</button></div></div>' +
        (canSend ? '' : '<div class="muted" style="font-size:.85rem;margin-bottom:.6rem">No email on file for ' + esc(c.name.split(' ')[0]) + ' — add one on their profile to send directly.</div>') +
        '<div class="modal-foot"><button class="btn btn-ghost" id="oClose">Close</button><button class="btn btn-ghost" id="copyBody">Copy</button>' + (c.phone ? '<button class="btn btn-ghost" id="sendSms">📱 Text link</button>' : '') + (canSend ? '<button class="btn btn-primary" id="sendEmail">✉️ Send to ' + esc(c.email) + '</button>' : '') + '</div>');
      $('#copyBody').onclick = () => { if (navigator.clipboard) navigator.clipboard.writeText(r.subject + '\n\n' + r.body); toast('Offer email copied'); };
      $('#copyAccept').onclick = () => { if (navigator.clipboard) navigator.clipboard.writeText(acceptLink); toast('Accept link copied'); };
      $('#oClose').onclick = () => { closeModal(); viewCandidate(c.id); };
      const ss2 = $('#sendSms'); if (ss2) ss2.onclick = async () => { ss2.disabled = true; ss2.textContent = 'Texting…'; const res = await api('POST', '/candidates/' + c.id + '/send-offer', { channel: 'sms' }); if (res.sent) { toast('Texted to ' + res.to + ' 📱'); closeModal(); viewCandidate(c.id); } else { ss2.disabled = false; ss2.textContent = '📱 Text link'; reportSend(res, 'sms'); } };
      const se = $('#sendEmail'); if (se) se.onclick = async () => {
        se.disabled = true; se.textContent = 'Sending…';
        const att = $('#oAttach') ? $('#oAttach').checked : false;
        const res = await api('POST', '/candidates/' + c.id + '/send-offer', { subject: r.subject, body: r.body, attachContract: att });
        if (res.sent) { toast('Sent to ' + res.to + ' 📨'); closeModal(); viewCandidate(c.id); }
        else { se.disabled = false; se.textContent = '✉️ Send to ' + c.email; toast(res.reason === 'not_configured' ? 'Email isn\'t connected yet — copy it for now' : ('Couldn\'t send — ' + (res.error || res.reason || 'try copy/paste')), 'error'); }
      };
    };
  }

  async function viewMember(id) {
    const e = await api('GET', '/employees/' + id);
    const [mPlans, mWorklog, mAllowances] = await Promise.all([api('GET', '/employees/' + id + '/plans'), api('GET', '/employees/' + id + '/worklog'), api('GET', '/employees/' + id + '/allowances').catch(() => [])]);
    e.development = e.development || {};
    e.development.goals = e.development.goals || [];
    e.development.skills = e.development.skills || {};
    const noteTypes = await getNoteTypes();
    const ntById = {}; noteTypes.forEach((n) => { ntById[n.id] = n; });
    const cfg = await getConfig();
    const starter = cfg.starterProfiles.find((p) => p.id === e.starter_profile);
    const canOnboard = State.flows.some((f) => f.id === 'onboarding');
    const impactById = {}; cfg.impactTags.forEach((t) => { impactById[t.id] = t.label; });
    const w = e.wage;
    const packId = e.pathway_id || State.me.business.industry_id || null;
    let pack = null;
    if (packId) { try { pack = await api('GET', '/industries/' + packId); } catch (x) { pack = null; } }
    const roles = pack ? (pack.pathway.roles || []).slice().sort((a, b) => a.level - b.level) : [];
    const curIdx = roles.findIndex((r) => r.id === e.current_role);
    const currentRole = curIdx >= 0 ? roles[curIdx] : null;
    const nextRole = curIdx >= 0 && curIdx < roles.length - 1 ? roles[curIdx + 1] : null;
    let award = null; if (w && w.award) { try { award = await getAward(w.award.id); } catch (x) { award = null; } }

    const header =
      '<div class="card card-pad" style="margin-bottom:1.4rem;display:flex;gap:1rem;align-items:center;flex-wrap:wrap">' +
      '<span class="ic-circle" style="width:54px;height:54px;font-size:1.6rem">👷</span>' +
      '<div class="grow"><div style="font-family:var(--font-head);font-weight:800;font-size:1.4rem">' + esc(e.name) + '</div>' +
      '<div class="muted">' + esc(e.job_title || '') + (e.employment_type ? ' · ' + esc(e.employment_type) : '') + (e.start_date ? ' · started ' + fmtDate(e.start_date) : '') + '</div>' +
      (currentRole ? '<span class="badge badge-supportive" style="margin-top:.4rem">🚀 ' + esc(currentRole.title) + '</span> ' : '') +
      (e.classification ? '<span class="badge" style="margin-top:.4rem">' + esc(e.classification) + (e.pay_rate ? ' · ' + money(e.pay_rate) + '/hr' : '') + '</span> ' : '') +
      (starter ? '<span class="badge" style="margin-top:.4rem">🌱 ' + esc(starter.label) + '</span>' : '') + '</div>' +
      (e.hasLogin ? '<span class="badge badge-positive">✓ Has staff login</span>' : '<button class="btn btn-ghost btn-sm" id="giveLogin">Give a staff login</button>') +
      (canOnboard ? ' <button class="btn btn-ghost btn-sm" id="startOnb">👋 Onboarding</button>' : '') +
      ' <button class="btn btn-ghost btn-sm" id="reflectBtn">🧠 Reflect</button>' +
      ' <a href="#/training/' + e.id + '" class="btn btn-ghost btn-sm">📜 Training record</a>' +
      ' <button class="btn btn-ghost btn-sm" id="wellbeingBtn">🫶 Wellbeing</button>' +
      ' <button class="btn btn-ghost btn-sm" id="quickNoteHere">✎ Quick note</button>' +
      ' <a href="#/new" class="btn btn-primary btn-sm">Start something</a></div>';

    // 💰 wage builder
    let wagePanel = '';
    if (w && (w.currentLevel || w.nextLevel || currentRole)) {
      const cl = w.currentLevel, nl = w.nextLevel;
      const bump = (cl && nl) ? (nl.hourly - cl.hourly) : 0;
      const classOpts = award ? award.levels.map((l) => '<option value="' + l.id + '"' + ((e.classification || (cl && cl.id)) === l.id ? ' selected' : '') + '>' + esc(l.name) + '</option>').join('') : '';
      wagePanel = '<div class="panel">' +
        '<div class="wage-grid">' +
        '<div class="wage-box"><div class="lab">Now</div><div class="lvl2">' + (currentRole ? esc(currentRole.title) : '—') + '</div>' + (cl ? '<div class="muted" style="font-size:.8rem">' + esc(cl.name) + '</div><div class="pay">' + money(cl.hourly) + '<small>/hr</small></div>' : '<div class="muted" style="font-size:.85rem">No award level set</div>') + '</div>' +
        '<div class="wage-arrow">→</div>' +
        '<div class="wage-box next"><div class="lab">Next step</div><div class="lvl2">' + (nextRole ? esc(nextRole.title) : 'Top of ladder 🎉') + '</div>' + (nl ? '<div class="muted" style="font-size:.8rem">' + esc(nl.name) + '</div><div class="pay">' + money(nl.hourly) + '<small>/hr</small></div>' : '') + '</div>' +
        '</div>' +
        (bump > 0 ? '<div class="wage-bump">↑ about +' + money(bump) + '/hr (~' + money(bump * 38) + '/wk) when they level up</div>' : '') +
        '<div class="grid grid-2" style="margin-top:1.2rem;gap:.8rem">' +
        '<div class="field" style="margin:0"><label>Their actual pay rate ($/hr)</label><input type="number" step="0.01" id="payRate" value="' + (e.pay_rate || '') + '" placeholder="e.g. 32.50"></div>' +
        '<div class="field" style="margin:0"><label>Award classification</label><select id="classSel">' + classOpts + '</select></div></div>' +
        '<div style="margin-top:.9rem;display:flex;gap:.6rem;flex-wrap:wrap"><button class="btn btn-primary btn-sm" id="savePay">Save pay</button><button class="btn btn-accent btn-sm" id="progDoc">📝 Progression plan</button><button class="btn btn-ghost btn-sm" id="wageDoc">📝 Wage review letter</button></div>' +
        (w.award ? '<div class="hint" style="margin-top:.8rem">' + esc(w.award.name) + ' (' + esc(w.award.code) + '). ' + esc(w.award.note) + ' <a href="' + esc(w.award.payTool || '#') + '" target="_blank" rel="noopener">Check current rates →</a></div>' : '') +
        '</div>';
    } else {
      wagePanel = '<div class="muted">Set this worker\'s role on the ladder (below) to build their wage path.</div>';
    }

    // 📝 notes
    const notesList = (e.notes && e.notes.length)
      ? e.notes.map((n) => { const nt = ntById[n.kind] || { icon: '📝', label: n.kind }; return '<div class="note-item note-kind-' + n.kind + '"><span class="nk">' + (nt.icon || '📝') + '</span><div class="grow"><div>' + esc(n.body) + '</div>' + ((n.tags && n.tags.length) ? '<div style="margin-top:.3rem">' + n.tags.map((t) => '<span class="step-tag" style="background:var(--danger-50);color:var(--danger)">⚠ ' + esc(impactById[t] || t) + '</span>').join('') + '</div>' : '') + '<div class="nmeta">' + esc(nt.label || n.kind) + ' · ' + fmtDate(n.occurred_at || n.created_at) + '</div></div><button class="btn btn-ghost btn-sm delNote" data-id="' + n.id + '">✕</button></div>'; }).join('')
      : '<div class="muted">No notes yet. Jot the little things — good and bad — so you remember them.</div>';
    const noteForm = '<div class="panel" style="background:var(--paper);margin-top:.6rem"><div class="grid grid-2" style="gap:.6rem"><div class="field" style="margin:0"><label>Type</label><select id="noteKind">' + noteTypes.map((n) => '<option value="' + n.id + '">' + (n.icon || '') + ' ' + esc(n.label) + '</option>').join('') + '</select></div><div class="field" style="margin:0"><label>What did you notice?</label><input id="noteBody" placeholder="e.g. Keen to learn the concrete cylinder test"></div></div><div style="margin-top:.6rem"><button class="btn btn-primary btn-sm" id="addNote">Add note</button></div></div>';

    // development panel
    let devPanel;
    if (!packId) {
      devPanel = '<div class="card card-pad"><strong>Set your industry to unlock career paths.</strong><p class="muted" style="margin:.3rem 0 .7rem">Pick your trade and Offsider loads the role ladder and the steps to build a career.</p><a href="#/career" class="btn btn-primary btn-sm">Pick your industry</a></div>';
    } else {
      const roleOpts = '<option value="">— not set —</option>' + roles.map((r) => '<option value="' + r.id + '"' + (e.current_role === r.id ? ' selected' : '') + '>' + esc(r.title) + '</option>').join('');
      let stepsHtml;
      if (currentRole && nextRole) {
        stepsHtml = '<div class="section-title" style="margin-top:1.3rem"><h3>Steps to reach ' + esc(nextRole.title) + '</h3></div>' +
          '<div class="checklist">' + (currentRole.stepsToNext || []).map((s, i) => {
            const key = currentRole.id + ':' + i; const done = !!e.development.skills[key];
            return '<label class="check-item" data-skill="' + key + '"><input type="checkbox" ' + (done ? 'checked' : '') + '><span><span class="ci-label">' + esc(s.label) + '</span> ' + (s.type ? '<span class="step-tag ' + s.type + '">' + esc(s.type) + '</span>' : '') + (s.detail ? '<br><span class="ci-help">' + esc(s.detail) + '</span>' : '') + '</span></label>';
          }).join('') + '</div>';
      } else if (currentRole && !nextRole) {
        stepsHtml = '<div class="muted" style="margin-top:1rem">Top of the ladder — now it\'s about growing the business and bringing others up behind them. 🎉</div>';
      } else {
        stepsHtml = '<div class="muted" style="margin-top:1rem">Set their current role above to see the next steps on the ladder.</div>';
      }
      const goalsHtml = '<div class="section-title" style="margin-top:1.5rem"><h3>Development goals</h3></div>' +
        (e.development.goals.length ? e.development.goals.map((g) => '<label class="goal ' + (g.done ? 'done' : '') + '" data-goal="' + g.id + '"><input type="checkbox" ' + (g.done ? 'checked' : '') + '><span class="grow"><span class="gtitle">' + esc(g.title) + '</span>' + (g.target ? '<span class="gmeta"> · target ' + fmtDate(g.target) + '</span>' : '') + '</span></label>').join('') : '<div class="muted">No goals yet — set one below.</div>') +
        '<div class="grid grid-2" style="margin-top:.6rem;gap:.5rem"><input id="newGoal" placeholder="e.g. Get the forklift ticket sorted"><div style="display:flex;gap:.5rem"><input type="date" id="newGoalDate" style="flex:1"><button class="btn btn-primary" id="addGoal">Add</button></div></div>';
      devPanel = '<div class="panel">' +
        '<div class="field" style="max-width:340px;margin-bottom:.4rem"><label>Current rung on the ladder</label><select id="roleSel">' + roleOpts + '</select></div>' +
        stepsHtml + goalsHtml +
        '<div style="margin-top:1.5rem;display:flex;gap:.6rem;flex-wrap:wrap"><button class="btn btn-accent btn-sm" id="devPlan">📝 Development plan</button><button class="btn btn-ghost btn-sm" id="onbPlan">📝 Onboarding plan</button><a href="#/career" class="btn btn-ghost btn-sm">See the full ladder →</a></div>' +
        '</div>';
    }

    const cases = (e.cases || []).map((c) => {
      const f = flowById(c.flow_id) || {};
      return '<a href="#/case/' + c.id + '" class="row ' + sent(c.sentiment).cls + '"><span class="ic-circle">' + (f.icon || '🗂️') + '</span><span class="grow"><span class="t">' + esc(c.title) + '</span><span class="s">' + esc(f.name || c.flow_id) + '</span></span><span class="meta"><span class="badge ' + (c.status === 'resolved' ? 'badge-positive' : '') + '">' + (STATUS[c.status] || c.status) + '</span></span></a>';
    }).join('');
    const casesSection = '<div class="section-title" style="margin-top:1.8rem"><h3>Cases</h3></div>' +
      (cases ? '<div class="row-list">' + cases + '</div>' : '<div class="muted">No cases for ' + esc(e.name.split(' ')[0]) + ' yet.</div>');
    const docsSection = (e.documents && e.documents.length)
      ? '<div class="section-title" style="margin-top:1.8rem"><h3>Their plans &amp; documents</h3></div><div class="row-list">' + e.documents.map((dc) => '<a href="#/document/' + dc.id + '" class="row"><span class="ic-circle">📄</span><span class="grow"><span class="t">' + esc(dc.title) + '</span><span class="s">' + fmtDate(dc.created_at) + '</span></span><span class="meta">View →</span></a>').join('') + '</div>'
      : '';

    // 🎓 lessons & tests
    const lessonStatus = (s) => s.status === 'passed' ? '<span class="badge badge-positive">✓ Passed' + (s.score != null ? ' ' + Math.round(s.score * 100) + '%' : '') + '</span>' : (s.status === 'failed' ? '<span class="badge badge-watchful">Not passed yet</span>' : '<span class="badge">Assigned</span>');
    const lessonsSection = '<div class="section-title" style="margin-top:1.8rem"><h3>🎓 Lessons & tests</h3><button class="btn btn-ghost btn-sm" id="assignLesson">+ Assign a lesson</button></div>' +
      ((e.lessons && e.lessons.length) ? '<div class="row-list">' + e.lessons.map((s) => '<div class="row" style="cursor:default"><span class="ic-circle">🎓</span><span class="grow"><span class="t">' + esc(s.title) + '</span>' + (s.competencyLabel ? '<span class="s">signs off: ' + esc(s.competencyLabel) + '</span>' : '') + '</span><span class="meta">' + lessonStatus(s) + '</span></div>').join('') + '</div>' : '<div class="muted">No lessons assigned yet. Assign one — passing it ticks the competency.</div>');

    // 📅 plan & work log
    const recentPlans = (mPlans || []).slice(0, 3);
    const planList = recentPlans.length
      ? '<div class="row-list">' + recentPlans.map((p) => '<div class="row" style="cursor:default"><span class="ic-circle">📅</span><span class="grow"><span class="t">' + esc(p.title || ((p.period === 'week' ? 'Weekly' : 'Daily') + ' plan')) + '</span><span class="s">' + (p.period === 'week' ? 'Week of ' : '') + esc(p.plan_date || '') + ' · ' + (p.items ? p.items.length : 0) + ' tasks</span></span></div>').join('') + '</div>'
      : '<div class="muted">No plans set yet.</div>';
    const wlDays = {}; (mWorklog || []).forEach((en) => { wlDays[en.occurred_on] = 1; });
    const wlSummary = (mWorklog || []).length
      ? '<div class="muted" style="font-size:.9rem">' + mWorklog.length + ' entries logged over ' + Object.keys(wlDays).length + ' day' + (Object.keys(wlDays).length === 1 ? '' : 's') + ' (last 7 days).</div><div class="row-list" style="margin-top:.5rem">' + mWorklog.slice(0, 8).map((en) => '<div class="row" style="cursor:default"><span class="ic-circle">📝</span><span class="grow"><span class="t">' + esc(en.label || en.note || 'Work') + (en.quantity != null ? ' · <strong>' + en.quantity + (en.unit === 'hours' ? 'h' : '') + '</strong>' : '') + '</span><span class="s">' + esc(en.occurred_on) + '</span></span></div>').join('') + '</div>'
      : '<div class="muted">Nothing logged yet — it appears here once they use the app.</div>';
    const planSection = '<div class="section-title" style="margin-top:1.8rem"><h3>📅 Plan &amp; work log</h3><button class="btn btn-ghost btn-sm" id="assignPlan">+ Set a plan</button></div>' + planList +
      '<div style="margin-top:1rem"><div class="muted" style="font-weight:700;font-size:.82rem;text-transform:uppercase;letter-spacing:.04em;margin-bottom:.4rem">Recent work logged</div>' + wlSummary + '</div>';

    // 💵 allowances & loadings (top-ups, not reclassification)
    const allowList = mAllowances || [];
    const hrSum = allowList.filter((a) => a.basis === 'hour').reduce((s, a) => s + (a.amount || 0), 0);
    const wkSum = allowList.filter((a) => a.basis === 'week').reduce((s, a) => s + (a.amount || 0), 0);
    const baseRate = e.pay_rate || 0;
    const allUp = baseRate + hrSum + (wkSum / 38);
    const allowRows = allowList.map((a) => '<div class="row" style="cursor:default"><span class="ic-circle">💵</span><span class="grow"><span class="t">' + esc(a.name) + '</span>' + (a.note ? '<span class="s">' + esc(a.note) + '</span>' : '') + '</span><span class="meta"><strong>+' + money(a.amount) + '/' + (a.basis === 'week' ? 'wk' : a.basis === 'shift' ? 'shift' : 'hr') + '</strong> <button class="btn btn-ghost btn-sm allow-del" data-id="' + a.id + '">✕</button></span></div>').join('');
    const allowancesSection = '<div class="section-title" style="margin-top:1.8rem"><h3>💵 Allowances &amp; loadings</h3><button class="btn btn-ghost btn-sm" id="addAllow">+ Add allowance</button></div>' +
      '<p class="muted" style="font-size:.88rem;margin-top:-.3rem">Top-ups for extra responsibility (like training new starters) — paid on top of their level, no reclassification needed.</p>' +
      (allowList.length
        ? '<div class="card card-pad"><div style="display:flex;justify-content:space-between;padding:.2rem 0;border-bottom:1px dashed var(--line)"><span class="muted">Base rate</span><strong>' + (baseRate ? money(baseRate) + '/hr' : '—') + '</strong></div><div class="row-list" style="margin:.4rem 0">' + allowRows + '</div><div style="display:flex;justify-content:space-between;padding-top:.5rem;border-top:2px solid var(--line)"><strong>All up' + (wkSum ? ' (weekly ÷38h)' : '') + '</strong><strong style="font-family:var(--font-head);font-size:1.1rem;color:var(--positive-700)">≈ ' + money(allUp) + '/hr</strong></div></div>'
        : '<div class="muted">No allowances yet. Add one for someone who takes on extra — like training new starters.</div>');

    // 📅 lifecycle plan
    const firstName = (e.name || '').split(' ')[0];
    const sched = (e.schedule || []).filter((m) => !m.done);
    const dueNow = sched.filter((m) => m.daysUntil <= 14);
    const later = sched.filter((m) => m.daysUntil > 14);
    const doneCount = (e.schedule || []).length - sched.length;
    const momentCard = (m) => { const tone = m.daysUntil < 0 ? 'tone-watch' : (m.daysUntil <= 14 ? 'tone-proactive' : ''); return '<div class="coach-card ' + tone + '"><div class="grow"><div class="ct">' + esc(m.title.replace(/\{name\}/g, firstName)) + ' <span class="badge" style="font-size:.6rem">' + ownerLabel(m.owner) + '</span></div><div class="cp">' + esc(m.detail.replace(/\{name\}/g, firstName)) + '</div><div class="muted" style="font-size:.78rem;margin-top:.2rem">' + relativeDue(m.daysUntil) + '</div></div><div style="display:flex;flex-direction:column;gap:.4rem;flex:none"><button class="btn btn-primary btn-sm moment-do" data-r="' + esc(m.rule_id) + '" data-k="' + esc(m.occurrence_key) + '">' + momentPrimary(m) + '</button><button class="btn btn-ghost btn-sm moment-done" data-r="' + esc(m.rule_id) + '" data-k="' + esc(m.occurrence_key) + '">✓ Done</button></div></div>'; };
    const scheduleSection = '<div class="section-title"><h3>📅 Lifecycle plan</h3>' + (doneCount ? '<span class="muted" style="font-size:.85rem">' + doneCount + ' done</span>' : '') + '</div>' +
      (dueNow.length ? dueNow.map(momentCard).join('') : '<div class="muted">Nothing due right now' + (later.length ? ' — next up ' + relativeDue(later[0].daysUntil).toLowerCase() : '') + '.</div>') +
      (later.length ? '<details style="margin-top:.5rem"><summary style="cursor:pointer;color:var(--ink-faint);font-size:.9rem">Coming up later (' + later.length + ')</summary><div style="margin-top:.5rem">' + later.map(momentCard).join('') + '</div></details>' : '');

    layout('team', e.name,
      header + scheduleSection +
      '<div class="section-title" style="margin-top:1.8rem"><h3>💰 Pay & progression ' + refChip('pay', 'award classification minimum wage pay slip records', 'Pay, awards &amp; records') + '</h3></div>' + wagePanel + allowancesSection +
      '<div class="section-title" style="margin-top:1.8rem"><h3>🚀 Development</h3></div>' + devPanel +
      lessonsSection + planSection +
      '<div class="section-title" style="margin-top:1.8rem"><h3>📝 Notes & observations</h3></div>' + notesList + noteForm +
      casesSection + docsSection, '<a href="#/team">Workers</a>');

    if (packId) {
      const rs = $('#roleSel');
      if (rs) rs.onchange = async () => { await api('PATCH', '/employees/' + e.id, { current_role: rs.value || null, pathway_id: packId }); viewMember(e.id); };
      root().querySelectorAll('[data-skill]').forEach((li) => {
        const cb = $('input', li);
        cb.onchange = async () => { e.development.skills[li.getAttribute('data-skill')] = cb.checked; await api('PATCH', '/employees/' + e.id, { development: e.development }); };
      });
      root().querySelectorAll('[data-goal]').forEach((li) => {
        const cb = $('input', li);
        cb.onchange = async () => { const g = e.development.goals.find((x) => x.id === li.getAttribute('data-goal')); if (g) g.done = cb.checked; await api('PATCH', '/employees/' + e.id, { development: e.development }); viewMember(e.id); };
      });
      const ag = $('#addGoal');
      if (ag) ag.onclick = async () => {
        const t = $('#newGoal').value.trim();
        if (!t) { toast('Add a goal first', 'error'); return; }
        e.development.goals.push({ id: 'g' + Date.now().toString(36), title: t, target: $('#newGoalDate').value || null, done: false });
        await api('PATCH', '/employees/' + e.id, { development: e.development }); viewMember(e.id);
      };
      const dp = $('#devPlan'); if (dp) dp.onclick = () => openEmployeeDocForm(e.id, 'development_plan');
      const op = $('#onbPlan'); if (op) op.onclick = () => openEmployeeDocForm(e.id, 'onboarding_plan');
    }
    // pay + progression
    const sp = $('#savePay'); if (sp) sp.onclick = async () => { const pr = $('#payRate').value; const cs = $('#classSel'); await api('PATCH', '/employees/' + e.id, { pay_rate: pr === '' ? null : parseFloat(pr), classification: cs ? cs.value : undefined }); toast('Pay saved'); viewMember(e.id); };
    const pgd = $('#progDoc'); if (pgd) pgd.onclick = () => openEmployeeDocForm(e.id, 'progression_plan');
    const wgd = $('#wageDoc'); if (wgd) wgd.onclick = () => openEmployeeDocForm(e.id, 'wage_review_outcome');
    // notes
    const an = $('#addNote'); if (an) an.onclick = async () => { const b = $('#noteBody').value.trim(); if (!b) { toast('Write a quick note', 'error'); return; } await api('POST', '/employees/' + e.id + '/notes', { kind: $('#noteKind').value, body: b }); viewMember(e.id); };
    root().querySelectorAll('.delNote').forEach((btn) => { btn.onclick = async () => { await api('DELETE', '/notes/' + btn.getAttribute('data-id')); viewMember(e.id); }; });
    // staff login
    const gl = $('#giveLogin'); if (gl) gl.onclick = () => openStaffLoginModal(e.id, e.name);
    const so = $('#startOnb'); if (so) so.onclick = async () => { const c = await api('POST', '/cases', { employee_id: e.id, flow_id: 'onboarding' }); location.hash = '#/case/' + c.id; };
    const qh = $('#quickNoteHere'); if (qh) qh.onclick = () => openQuickNote(e.id);
    const rb = $('#reflectBtn'); if (rb) rb.onclick = () => openReflection(e);
    const wbb = $('#wellbeingBtn'); if (wbb) wbb.onclick = () => openReferEap(e);
    const al = $('#assignLesson'); if (al) al.onclick = () => openLessonAssign(e.id);
    const ap = $('#assignPlan'); if (ap) ap.onclick = () => openPlanModal(e.id);
    const aa = $('#addAllow'); if (aa) aa.onclick = () => openAllowanceAdd(e.id);
    root().querySelectorAll('.allow-del').forEach((b) => { b.onclick = async () => { await api('DELETE', '/allowances/' + b.getAttribute('data-id')); viewMember(e.id); }; });
    root().querySelectorAll('.moment-done').forEach((b) => { b.onclick = async () => { await api('POST', '/lifecycle/done', { employee_id: e.id, rule_id: b.dataset.r, occurrence_key: b.dataset.k }); viewMember(e.id); }; });
    root().querySelectorAll('.moment-do').forEach((b) => { b.onclick = () => { const m = (e.schedule || []).find((x) => x.rule_id === b.dataset.r && x.occurrence_key === b.dataset.k); if (m) doMoment(e, m); }; });
  }

  function openStaffLoginModal(employeeId, name) {
    openModal('<h2>Give ' + esc(name) + ' a staff login</h2><p class="muted">They\'ll be able to log in, do their check-ins and see their own career & pay path — nothing else.</p>' +
      '<div id="glErr"></div>' +
      '<div class="field"><label>Their email</label><input id="glEmail" placeholder="name@business.com.au"></div>' +
      '<div class="field"><label>Temporary password</label><input id="glPass" placeholder="At least 6 characters"></div>' +
      '<div class="modal-foot"><button class="btn btn-ghost" id="glCancel">Cancel</button><button class="btn btn-primary" id="glCreate">Create login</button></div>');
    $('#glCancel').onclick = closeModal;
    $('#glCreate').onclick = async () => {
      try { await api('POST', '/employees/' + employeeId + '/login', { email: $('#glEmail').value.trim(), password: $('#glPass').value }); closeModal(); toast('Staff login created'); viewMember(employeeId); }
      catch (err) { $('#glErr').innerHTML = '<div class="error-msg">' + esc(err.message) + '</div>'; }
    };
  }

  // ---------------- Fair Work guide ----------------
  async function viewGuide() {
    const co = State.compliance || {};
    const fp = (co.fairProcess || []).map((s, i) =>
      '<div class="step"><div class="step-num">' + (i + 1) + '</div><div><h3>' + esc(s.step) + '</h3><p>' + esc(s.detail) + '</p></div></div>').join('');
    const ladder = (co.escalationLadder || []).map((l) =>
      '<div class="card card-pad" style="margin-bottom:.6rem"><strong>' + esc(l.level) + '</strong><div class="muted">' + esc(l.detail) + '</div></div>').join('');
    const help = (co.whenToGetHelp || []).map((x) => '<li>' + esc(x) + '</li>').join('');
    const glossary = (co.glossary || []).map((g) =>
      '<div class="faq-item"><h3>' + esc(g.term) + '</h3><p>' + esc(g.definition) + '</p></div>').join('');

    const content =
      '<div class="disclaimer-note" style="margin-bottom:1.6rem">⚠️ ' + esc(co.disclaimer || 'Offsider gives general good-practice guidance, not legal advice.') + '</div>' +
      '<a href="#/legal" class="panel" style="display:flex;align-items:center;gap:.8rem;margin-bottom:1.6rem;text-decoration:none"><span style="font-size:1.6rem">📚</span><span class="grow"><strong>Want the law behind it?</strong><div class="muted" style="font-size:.9rem">See the sources and references each piece of guidance is based on.</div></span><span class="meta">Legal backing →</span></a>' +
      '<div class="section-title"><h3>' + esc(co.fairProcessTitle || 'What a fair process looks like') + ' ' + refChip('performance', 'fair process underperformance warning procedural fairness dismissal', 'A fair process') + '</h3></div>' +
      '<div class="grid" style="gap:1.2rem">' + fp + '</div>' +
      (co.smallBusinessCode ? '<div class="panel section-ink" style="margin-top:1.6rem;background:var(--brand);color:#eaf1f6"><h3 style="color:#fff">Small Business Fair Dismissal Code</h3><p style="margin:0;color:#cfe0ea">' + esc(co.smallBusinessCode) + '</p></div>' : '') +
      '<div class="section-title" style="margin-top:1.8rem"><h3>Going up the ladder ' + refChip('performance', 'warning termination dismissal unfair', 'Warnings &amp; ending employment') + '</h3></div>' + ladder +
      '<div class="section-title" style="margin-top:1.8rem"><h3>When to stop and get real advice</h3></div><div class="card card-pad"><ul class="problem-list" style="margin:0">' + help.replace(/<li>/g, '<li style="color:var(--ink-soft)">') + '</ul></div>' +
      '<div class="section-title" style="margin-top:1.8rem"><h3>Plain-English glossary</h3></div>' + glossary;
    layout('guide', 'Fair Work guide', content);
  }

  // ---------------- career paths ----------------
  async function viewCareer() {
    const bizIndustryId = State.me.business.industry_id;
    if (!bizIndustryId) {
      const inds = await getIndustries();
      const grid = inds.map((i) => '<button class="flow-pick" data-ind="' + i.id + '"><span class="ic">' + i.icon + '</span><span class="t">' + esc(i.name) + '</span><span class="s">' + esc(i.blurb) + '</span></button>').join('');
      layout('career', 'Career paths', '<p class="muted" style="max-width:62ch">Pick your industry and Offsider loads a real career ladder for your trade — the roles, and the tickets, skills and experience your crew need to climb each rung.</p><div class="flow-grid">' + grid + '</div>');
      root().querySelectorAll('[data-ind]').forEach((b) => {
        b.onclick = async () => { const ind = b.getAttribute('data-ind'); await api('PATCH', '/business', { industry_id: ind }); State.me.business.industry_id = ind; viewCareer(); };
      });
      return;
    }
    const [pack, employees, payScale] = await Promise.all([api('GET', '/industries/' + bizIndustryId), api('GET', '/employees'), api('GET', '/pay-scale')]);
    const roles = (pack.pathway.roles || []).slice().sort((a, b) => a.level - b.level);
    const payMap = {}; (payScale.roles || []).forEach((r) => { payMap[r.role_id] = r; });
    const anyInternal = (payScale.roles || []).some((r) => r.internal && r.internal.rate != null);
    const aw = payScale.award;

    const payBlock = (r) => {
      const p = payMap[r.id] || { award_hourly: null, internal: null, award_code: r.awardLevel };
      const floor = p.award_hourly, ip = p.internal;
      if (ip && ip.rate != null) {
        const above = floor != null ? ip.rate - floor : null;
        const below = above != null && above < -0.001;
        return '<div class="rung-pay ' + (below ? 'pay-below' : 'pay-above') + '"><div class="rp-line"><span class="rp-name">' + esc(ip.name || 'Your rate') + '</span><strong>' + money(ip.rate) + (ip.range_max ? '–' + money(ip.range_max) : '') + '<span class="rp-u">/hr</span></strong></div>' +
          (floor != null ? '<div class="rp-floor">' + (below ? '⚠ below the award minimum ' + money(floor) : '✓ ' + money(Math.abs(above)) + ' above the award floor (' + money(floor) + (p.award_code ? ' · ' + p.award_code : '') + ')') + '</div>' : '') +
          '<button class="btn btn-ghost btn-sm rung-edit" data-r="' + r.id + '">edit</button></div>';
      }
      return '<div class="rung-pay pay-none"><div class="muted" style="font-size:.85rem">Award minimum ' + (floor != null ? money(floor) + '/hr' : '') + (p.award_code ? ' · ' + p.award_code : '') + '</div><button class="btn btn-primary btn-sm rung-edit" data-r="' + r.id + '">Set your rate</button></div>';
    };

    const ladder = roles.slice().reverse().map((r) => {
      const here = employees.filter((e) => e.current_role === r.id);
      return '<div class="rung"><span class="lvl">' + r.level + '</span><div class="grow"><div class="rtitle">' + esc(r.title) + '</div><div class="rsummary">' + esc(r.summary) + '</div>' +
        payBlock(r) +
        (here.length ? '<div style="margin-top:.5rem">' + here.map((e) => '<a href="#/member/' + e.id + '" class="ticket-chip" style="background:var(--brand-50);color:var(--brand-700);border-color:transparent">👷 ' + esc(e.name) + '</a>').join('') + '</div>' : '') +
        ((r.stepsToNext && r.stepsToNext.length) ? '<div style="margin-top:.6rem;font-size:.82rem;color:var(--ink-faint)">Next: ' + r.stepsToNext.slice(0, 3).map((s) => esc(s.label)).join(' · ') + '</div>' : '') +
        '</div></div>';
    }).join('');
    const tickets = (pack.tickets || []).map((t) => '<div class="card card-pad" style="margin-bottom:.5rem"><strong>' + esc(t.name) + '</strong>' + (t.note ? '<div class="muted" style="font-size:.88rem;margin-top:.2rem">' + esc(t.note) + '</div>' : '') + '</div>').join('');

    const payIntro = '<div class="panel" style="margin-bottom:1.2rem"><strong>💰 The award floor vs what you pay</strong>' +
      '<p class="muted" style="font-size:.9rem;margin:.3rem 0 ' + (anyInternal ? '0' : '.7rem') + '">The award is the <em>legal minimum</em> — the floor. Your internal levels are what you actually pay, set at or above it (most businesses pay well above). ' + (aw ? 'Floor shown is ' + esc(aw.code) + ', the minimums from ' + esc((aw.effective || '').replace(/-/g, '/')) + '. ' + refChip('pay', 'award classification minimum wage pay records', 'Award minimums & paying above') : '') + '</p>' +
      (anyInternal ? '' : '<button class="btn btn-primary btn-sm" id="suggestScale">Start me a scale (award + 20%)</button>') + '</div>';

    const posCard = (p) => {
      const floor = p.award_hourly, below = floor != null && p.rate != null && p.rate < floor - 0.001;
      const margin = (floor != null && p.rate != null) ? (below ? ' · <span style="color:var(--watch);font-weight:700">⚠ below the floor</span>' : ' · <span style="color:var(--positive-700)">✓ ' + money(p.rate - floor) + ' above</span>') : '';
      return '<div class="card card-pad" style="margin-bottom:.6rem"><div style="display:flex;justify-content:space-between;gap:1rem;align-items:flex-start"><div class="grow"><strong>' + esc(p.title) + '</strong>' + (p.rate != null ? ' &nbsp;<strong style="font-family:var(--font-head)">' + money(p.rate) + (p.range_max ? '–' + money(p.range_max) : '') + '/hr</strong>' : '') +
        '<div class="muted" style="font-size:.85rem;margin-top:.2rem">' + (p.award_code ? 'Award floor: ' + esc(p.award_code) + (floor != null ? ' · ' + money(floor) + '/hr' : '') : 'No award floor set yet') + margin + '</div>' + (p.note ? '<div class="muted" style="font-size:.85rem;margin-top:.15rem">' + esc(p.note) + '</div>' : '') + '</div><button class="btn btn-ghost btn-sm pos-edit" data-id="' + p.id + '">edit</button></div></div>';
    };
    const positionsSection = '<div class="section-title" style="margin-top:1.8rem"><h3>🏷️ Your own positions &amp; titles</h3><button class="btn btn-primary btn-sm" id="addPos">+ Add a position</button></div>' +
      '<p class="muted" style="max-width:66ch;margin-top:-.3rem">Invent any title that suits your business — “Training Supervisor”, “2IC”, “Lead Hand”. Anchor each to the award classification whose <em>actual duties</em> match the work — that sets the legal floor — then pay above it. The title is yours; the floor keeps you compliant. ' + refChip('pay', 'classification award duties minimum wage', 'How titles map to the award') + '</p>' +
      ((payScale.positions && payScale.positions.length) ? payScale.positions.map(posCard).join('') : '<div class="muted">None yet — add internal titles like a Training Supervisor or 2IC.</div>');

    layout('career', 'Career paths',
      '<div class="banner" style="background:var(--brand-50);border-color:transparent"><span style="font-size:1.6rem">' + pack.icon + '</span><div class="grow"><strong>' + esc(pack.name) + ' — ' + esc(pack.pathway.name) + '</strong><div class="muted" style="font-size:.9rem">' + esc(pack.blurb) + '</div></div><button class="btn btn-ghost btn-sm" id="changeInd">Change</button></div>' +
      payIntro +
      '<div class="grid grid-2" style="align-items:start"><div><div class="section-title"><h3>The ladder &amp; pay</h3></div><div class="ladder">' + ladder + '</div></div>' +
      '<div><div class="section-title"><h3>🎫 Tickets to chase</h3></div>' + (tickets || '<div class="muted">—</div>') + '</div></div>' +
      positionsSection);
    const ci = $('#changeInd');
    if (ci) ci.onclick = async () => { await api('PATCH', '/business', { industry_id: null }); State.me.business.industry_id = null; viewCareer(); };
    const ss = $('#suggestScale'); if (ss) ss.onclick = async () => { await api('POST', '/pay-scale/suggest', { margin: 0.2 }); toast('Starter scale added — tweak any rung'); viewCareer(); };
    root().querySelectorAll('.rung-edit').forEach((b) => { b.onclick = () => openPayLevelEdit(payMap[b.getAttribute('data-r')]); });
    const ap = $('#addPos'); if (ap) ap.onclick = () => openPositionEdit(null, payScale.awardLevels);
    root().querySelectorAll('.pos-edit').forEach((b) => { b.onclick = () => openPositionEdit((payScale.positions || []).find((p) => p.id === b.getAttribute('data-id')), payScale.awardLevels); });
  }
  function openPositionEdit(pos, awardLevels) {
    pos = pos || {};
    awardLevels = awardLevels || [];
    const floorOf = (code) => { const l = awardLevels.find((x) => x.id === code); return l ? l.hourly : null; };
    const opts = '<option value="">— pick the matching level —</option>' + awardLevels.map((l) => '<option value="' + l.id + '"' + (pos.award_code === l.id ? ' selected' : '') + '>' + esc(l.name) + ' ($' + l.hourly + '/hr floor)</option>').join('');
    openModal('<h2>' + (pos.id ? 'Edit position' : 'New internal position') + '</h2>' +
      '<p class="muted">Name it whatever suits, then anchor it to the award level whose <em>duties</em> match the real work — that\'s the legal floor.</p>' +
      '<div class="field"><label>Title *</label><input id="poTitle" value="' + esc(pos.title || '') + '" placeholder="e.g. Training Supervisor"></div>' +
      '<div class="field"><label>Award classification it sits at (the floor)</label><select id="poAward">' + opts + '</select><div class="hint" id="poFloor"></div></div>' +
      '<div class="grid grid-2"><div class="field"><label>Rate $/hr</label><input type="number" id="poRate" step="0.50" inputmode="decimal" value="' + (pos.rate != null ? pos.rate : '') + '"></div><div class="field"><label>Top of band (optional)</label><input type="number" id="poMax" step="0.50" inputmode="decimal" value="' + (pos.range_max != null ? pos.range_max : '') + '"></div></div>' +
      '<div class="field"><label>What this role actually does (optional)</label><input id="poNote" value="' + esc(pos.note || '') + '" placeholder="e.g. Runs all inductions and training, coordinates the crew\'s upskilling"></div>' +
      '<div id="poWarn"></div>' +
      '<div class="modal-foot">' + (pos.id ? '<button class="btn btn-ghost" id="poDel">Remove</button>' : '<button class="btn btn-ghost" id="poCancel">Cancel</button>') + '<button class="btn btn-primary" id="poSave">Save</button></div>');
    const warn = () => { const fl = floorOf($('#poAward').value); const v = parseFloat($('#poRate').value); const w = $('#poWarn'); $('#poFloor').textContent = fl != null ? 'Floor for that level: ' + money(fl) + '/hr' : ''; if (!isNaN(v) && fl != null) { w.innerHTML = v < fl ? '<div class="error-msg">⚠ Below the award floor (' + money(fl) + '/hr) for that classification.</div>' : '<div class="ok-msg">✓ ' + money(v - fl) + '/hr above the floor.</div>'; } else { w.innerHTML = ''; } };
    $('#poAward').onchange = warn; $('#poRate').oninput = warn; warn();
    $('#poSave').onclick = async () => { const t = $('#poTitle').value.trim(); if (!t) { toast('A title is needed', 'error'); return; } const payload = { title: t, award_code: $('#poAward').value || null, rate: $('#poRate').value, range_max: $('#poMax').value, note: $('#poNote').value.trim() }; if (pos.id) await api('PATCH', '/positions/' + pos.id, payload); else await api('POST', '/positions', payload); closeModal(); toast('Saved'); viewCareer(); };
    const del = $('#poDel'); if (del) del.onclick = async () => { await api('DELETE', '/positions/' + pos.id); closeModal(); toast('Removed'); viewCareer(); };
    const cancel = $('#poCancel'); if (cancel) cancel.onclick = closeModal;
  }
  function openPayLevelEdit(role) {
    if (!role) return;
    const ip = role.internal || {};
    openModal('<h2>Pay for ' + esc(role.title) + '</h2>' +
      '<p class="muted">Award floor: <strong>' + (role.award_hourly ? money(role.award_hourly) + '/hr' : '—') + '</strong>' + (role.award_code ? ' (' + role.award_code + ')' : '') + '. Set what you actually pay — at or above the floor.</p>' +
      '<div class="field"><label>Your level name</label><input id="plName" value="' + esc(ip.name || role.title || '') + '" placeholder="e.g. Senior Tech, Level 3"></div>' +
      '<div class="grid grid-2"><div class="field"><label>Rate $/hr</label><input type="number" id="plRate" step="0.50" inputmode="decimal" value="' + (ip.rate != null ? ip.rate : '') + '" placeholder="e.g. 38.00"></div>' +
      '<div class="field"><label>Top of band (optional)</label><input type="number" id="plMax" step="0.50" inputmode="decimal" value="' + (ip.range_max != null ? ip.range_max : '') + '" placeholder="e.g. 44.00"></div></div>' +
      '<div id="plWarn"></div>' +
      '<div class="modal-foot">' + (role.internal ? '<button class="btn btn-ghost" id="plClear">Remove</button>' : '<button class="btn btn-ghost" id="plCancel">Cancel</button>') + '<button class="btn btn-primary" id="plSave">Save</button></div>');
    const warn = () => { const v = parseFloat($('#plRate').value); const w = $('#plWarn'); if (!isNaN(v) && role.award_hourly) { w.innerHTML = v < role.award_hourly ? '<div class="error-msg">⚠ Below the award minimum of ' + money(role.award_hourly) + '/hr — you can\'t pay under the floor.</div>' : '<div class="ok-msg">✓ ' + money(v - role.award_hourly) + '/hr above the award floor.</div>'; } else { w.innerHTML = ''; } };
    $('#plRate').oninput = warn; warn();
    const c1 = $('#plCancel'); if (c1) c1.onclick = closeModal;
    const cl = $('#plClear'); if (cl) cl.onclick = async () => { await api('DELETE', '/pay-scale/' + role.role_id); closeModal(); toast('Removed'); viewCareer(); };
    $('#plSave').onclick = async () => { await api('PUT', '/pay-scale/' + role.role_id, { internal_name: $('#plName').value.trim(), rate: $('#plRate').value, range_max: $('#plMax').value }); closeModal(); toast('Saved'); viewCareer(); };
  }

  // ---------------- feedback ----------------
  async function viewFeedback() {
    const reqs = await api('GET', '/feedback/requests');
    const list = reqs.length
      ? '<div class="row-list">' + reqs.map((r) => '<a href="#/feedback/' + r.id + '" class="row"><span class="ic-circle">💬</span><span class="grow"><span class="t">' + esc(r.title) + '</span><span class="s">' + esc(audienceLabel(r.audience)) + (r.cadence && r.cadence !== 'once' ? ' · ' + cadenceLabel(r.cadence) : '') + (r.anonymous ? ' · anonymous' : '') + '</span></span><span class="meta"><span class="badge ' + (r.responses ? 'badge-positive' : '') + '">' + r.responses + ' ' + (r.responses === 1 ? 'reply' : 'replies') + '</span></span></a>').join('') + '</div>'
      : '<div class="empty"><span class="ic">💬</span>No feedback yet. Send your first request to hear what the crew really thinks.</div>';
    layout('feedback', 'Feedback',
      '<div class="section-title"><h3>Hear from your crew</h3><button class="btn btn-primary btn-sm" id="newFb">+ Request feedback</button></div>' +
      '<p class="muted" style="max-width:64ch;margin-top:-.3rem">Send a worker a link (text or email it) and they fill it in on their phone — no login needed. Upward feedback and the suggestion box can be anonymous, so you get the honest version.</p>' + list);
    $('#newFb').onclick = openFeedbackModal;
  }

  async function openFeedbackModal() {
    const [tmpls, employees] = await Promise.all([getFeedbackTemplates(), api('GET', '/employees')]);
    const tOpts = tmpls.map((t) => '<option value="' + t.id + '">' + esc(t.name) + '</option>').join('');
    const eOpts = '<option value="">— whole team / not specific —</option>' + employees.map((e) => '<option value="' + e.id + '">' + esc(e.name) + '</option>').join('');
    openModal('<h2>Request feedback</h2><p class="muted">Pick what you want to ask and who it\'s for. You\'ll get a link to share.</p>' +
      '<div class="field"><label>What kind of feedback?</label><select id="fbT">' + tOpts + '</select><div class="hint" id="fbPurpose"></div></div>' +
      '<div class="field"><label>Who\'s it about / for?</label><select id="fbE">' + eOpts + '</select></div>' +
      '<label class="check-item" style="margin-bottom:1rem"><input type="checkbox" id="fbAnon"><span><span class="ci-label">Make it anonymous</span><br><span class="ci-help">Names aren\'t recorded — best for honest upward feedback.</span></span></label>' +
      '<div class="modal-foot"><button class="btn btn-ghost" id="fbCancel">Cancel</button><button class="btn btn-primary" id="fbCreate">Create link →</button></div>');
    const setMeta = () => { const t = tmpls.find((x) => x.id === $('#fbT').value); $('#fbPurpose').textContent = t ? (t.purpose + (t.cadence && t.cadence !== 'once' ? ' · sent ' + cadenceLabel(t.cadence).toLowerCase() : '')) : ''; $('#fbAnon').checked = t ? !!t.anonymous_default : false; };
    $('#fbT').onchange = setMeta; setMeta();
    $('#fbCancel').onclick = closeModal;
    $('#fbCreate').onclick = async () => {
      const r = await api('POST', '/feedback/requests', { template_id: $('#fbT').value, employee_id: $('#fbE').value || null, anonymous: $('#fbAnon').checked });
      closeModal(); location.hash = '#/feedback/' + r.id;
    };
  }

  async function viewFeedbackDetail(id) {
    const r = await api('GET', '/feedback/requests/' + id);
    const link = location.origin + '/f/' + r.token;
    const qs = r.template.questions || [];
    const responses = r.responses.length ? r.responses.map((resp) => {
      const ans = qs.map((q) => {
        const v = resp.answers[q.id];
        if (v === undefined || v === '') return '';
        const disp = q.type === 'scale' ? '<span class="scale-pill">' + esc(v) + '</span> <span class="muted">/ 5</span>' : esc(v);
        return '<div class="resp-q">' + esc(q.label) + '</div><div class="resp-a">' + disp + '</div>';
      }).join('');
      return '<div class="resp-card"><div class="resp-head"><span>' + (resp.anonymous ? '🔒 Anonymous' : esc(resp.submitted_by || 'Someone')) + '</span><span>' + fmtDate(resp.submitted_at) + '</span></div>' + ans + '</div>';
    }).join('') : '<div class="empty"><span class="ic">📭</span>No replies yet. Share the link below and they\'ll show up here.</div>';
    layout('feedback', r.title,
      '<div class="panel" style="margin-bottom:1.4rem"><strong>Share this link with ' + (r.employee_name ? esc(r.employee_name) : 'your crew') + '</strong>' +
      '<div class="muted" style="font-size:.9rem;margin:.2rem 0">Text or email it — they fill it in on their phone, no login.' + (r.anonymous ? ' Replies are anonymous.' : '') + '</div>' +
      '<div class="link-box"><code id="fbLink">' + esc(link) + '</code><button class="btn btn-primary btn-sm" id="copyLink">Copy</button></div></div>' +
      '<div class="section-title"><h3>Replies (' + r.responses.length + ')</h3></div>' + responses,
      '<a href="#/feedback">Feedback</a>');
    $('#copyLink').onclick = () => {
      if (navigator.clipboard) navigator.clipboard.writeText(link);
      toast('Link copied — paste it into a text or email');
    };
  }

  // ---------------- LEGAL backing / references ----------------
  function confBadge(c) { return c === 'high' ? '<span class="badge badge-positive">verified</span>' : (c === 'low' ? '<span class="badge badge-watchful">check source</span>' : '<span class="badge">general</span>'); }
  function srcLink(s) { return s.url ? '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.name) + (s.citation ? ' — ' + esc(s.citation) : '') + ' ↗</a>' : '<span>' + esc(s.name) + (s.citation ? ' — ' + esc(s.citation) : '') + '</span>'; }
  function legalRefHtml(r) { return '<div class="legal-ref"><div class="lr-top"><strong>' + esc(r.topic) + '</strong> ' + confBadge(r.confidence) + '</div><div class="lr-claim">' + esc(r.claim) + '</div><div class="lr-basis">' + esc(r.basis) + '</div><div class="lr-src">' + (r.sources || []).map((s) => '<div>📎 ' + srcLink(s) + '</div>').join('') + '</div></div>'; }
  // a small inline "📎 source" chip that links guidance to its legal backing
  function refChip(domain, kw, title) { return '<button type="button" class="ref-chip" data-domain="' + esc(domain) + '" data-kw="' + esc(kw || '') + '" data-title="' + esc(title || '') + '">📎 source</button>'; }
  async function openSources(domain, kw, title) {
    const lr = await getLegalRefs();
    const d = (lr.domains || []).find((x) => x.id === domain);
    if (!d) { toast('No references found'); return; }
    let refs = d.references || [];
    if (kw) { const words = kw.toLowerCase().split(/[\s,/]+/).filter((w) => w.length > 3); const f = refs.filter((r) => { const hay = (r.topic + ' ' + r.claim + ' ' + r.basis + ' ' + (r.appArea || '')).toLowerCase(); return words.some((w) => hay.includes(w)); }); if (f.length) refs = f; }
    openModal('<h2>📎 The law behind this</h2><p class="muted">' + esc(title || d.title) + ' — from Offsider\'s legal backing. General info, not legal advice.</p>' + refs.map(legalRefHtml).join('') + '<div class="modal-foot"><a href="#/legal" class="btn btn-ghost" id="srcAll">All legal backing →</a><button class="btn btn-primary" id="srcClose">Close</button></div>');
    $('#srcClose').onclick = closeModal;
    $('#srcAll').onclick = closeModal;
  }

  async function viewLegal() {
    const lr = await getLegalRefs();
    const domainCard = (d) => {
      const prim = (d.primarySources || []).map((s) => '<a class="src-chip" href="' + esc(s.url || '#') + '" target="_blank" rel="noopener">' + esc(s.name) + ' ↗</a>').join('');
      const refs = (d.references || []).map((r) => legalRefHtml(r).replace('</div></div>', '</div>' + (r.appArea ? '<div class="lr-app">↪ In Offsider: ' + esc(r.appArea) + '</div>' : '') + '</div>')).join('');
      return '<details class="legal-domain"><summary><span class="ld-title">' + (d.icon ? esc(d.icon) + ' ' : '') + esc(d.title) + '</span><span class="muted" style="font-size:.85rem">' + (d.references || []).length + ' refs</span></summary><div class="ld-body">' + (d.subtitle ? '<div class="ld-sub">' + esc(d.subtitle) + '</div>' : '') + '<p class="muted">' + esc(d.summary) + '</p>' + (prim ? '<div class="src-chips">' + prim + '</div>' : '') + refs + (d.verifierNotes ? '<div class="lr-note">✔︎ Fact-check: ' + esc(d.verifierNotes) + '</div>' : '') + '</div></details>';
    };
    const contacts = (lr.contacts || []).map((c) => '<a class="row" href="' + esc(c.url) + '" target="_blank" rel="noopener"><span class="ic-circle">🏛️</span><span class="grow"><span class="t">' + esc(c.name) + '</span><span class="s">' + esc(c.detail) + '</span></span><span class="meta">Visit ↗</span></a>').join('');
    layout('legal', 'Legal backing',
      '<div class="panel" style="margin-bottom:1.4rem"><strong>📚 The law behind the advice</strong><p class="muted" style="margin:.3rem 0 0">' + esc(lr.disclaimer || '') + '</p></div>' +
      ((lr.domains && lr.domains.length)
        ? '<div class="section-title"><h3>By area</h3><span class="muted" style="font-size:.85rem">' + lr.domains.length + ' areas · updated ' + esc(lr.updated || '') + '</span></div>' + lr.domains.map(domainCard).join('')
        : '<div class="empty"><span class="ic">📚</span>Legal references are being compiled — check back shortly.</div>') +
      '<div class="section-title" style="margin-top:1.8rem"><h3>Official sources &amp; help</h3></div><div class="row-list">' + contacts + '</div>');
  }

  // ---------------- MANAGER ACADEMY ----------------
  async function viewAcademy() {
    const a = await api('GET', '/academy');
    const done = new Set(a.done || []);
    const all = (a.modules || []).flatMap((m) => m.lessons || []);
    const doneCount = all.filter((l) => done.has(l.id)).length;
    const pct = all.length ? Math.round(doneCount / all.length * 100) : 0;
    const moduleCard = (m, i) => {
      const ls = m.lessons || [];
      const md = ls.filter((l) => done.has(l.id)).length;
      const rows = ls.map((l) => '<a href="#/academy/' + l.id + '" class="row"><span class="ic-circle">' + (done.has(l.id) ? '✅' : '📖') + '</span><span class="grow"><span class="t">' + esc(l.title) + '</span><span class="s">' + (l.mins ? l.mins + ' min read' : '') + '</span></span><span class="meta">' + (done.has(l.id) ? '<span class="badge badge-positive">done</span>' : 'Read →') + '</span></a>').join('');
      return '<details class="legal-domain"' + (md < ls.length && i === 0 ? ' open' : '') + '><summary><span class="ld-title">' + (m.icon ? esc(m.icon) + ' ' : '') + esc(m.title) + '</span><span class="muted" style="font-size:.85rem">' + md + '/' + ls.length + '</span></summary><div class="ld-body"><p class="muted">' + esc(m.why) + '</p><div class="row-list">' + rows + '</div></div></details>';
    };
    layout('academy', 'Manager academy',
      '<div class="panel" style="margin-bottom:1.4rem"><strong>🎓 Become a better boss</strong><p class="muted" style="margin:.3rem 0 .7rem">' + esc(a.intro || '') + '</p><div class="progress"><div class="progress-bar" style="width:' + Math.max(pct, 3) + '%"></div></div><div class="muted" style="font-size:.85rem;margin-top:.3rem">' + doneCount + ' of ' + all.length + ' lessons done' + (pct === 100 ? ' — legend! 🎉' : '') + '</div></div>' +
      (a.modules || []).map(moduleCard).join(''));
  }
  async function viewAcademyLesson(lessonId) {
    const a = await api('GET', '/academy');
    const all = []; (a.modules || []).forEach((m) => (m.lessons || []).forEach((l) => all.push({ l, m })));
    const i = all.findIndex((x) => x.l.id === lessonId);
    if (i < 0) { location.hash = '#/academy'; return; }
    const lesson = all[i].l, mod = all[i].m, next = all[i + 1];
    const done = (a.done || []).includes(lessonId);
    const bodyHtml = (lesson.body || '').split(/\n\n+/).map((p) => '<p>' + esc(p) + '</p>').join('');
    layout('academy', lesson.title,
      '<div class="doc-narrow">' +
      '<div class="wizard-kind">' + (mod.icon ? esc(mod.icon) + ' ' : '') + esc(mod.title) + '</div>' +
      '<h1 style="margin:.2rem 0 .1rem">' + esc(lesson.title) + '</h1>' + (lesson.mins ? '<div class="muted">' + lesson.mins + ' min read</div>' : '') +
      '<div class="lesson-body">' + bodyHtml + '</div>' +
      (lesson.takeaway ? '<div class="panel" style="background:var(--brand-50);border-color:var(--brand);margin:1.2rem 0"><strong>💡 Takeaway</strong><div style="margin-top:.2rem">' + esc(lesson.takeaway) + '</div></div>' : '') +
      (lesson.science ? '<div class="lesson-extra"><strong>🔬 The science</strong><p>' + esc(lesson.science) + '</p></div>' : '') +
      (lesson.inOffsider ? '<div class="lesson-extra"><strong>↪ In Offsider</strong><p>' + esc(lesson.inOffsider) + '</p></div>' : '') +
      (lesson.reflection ? '<div class="lesson-extra reflect"><strong>🤔 Have a think</strong><p>' + esc(lesson.reflection) + '</p></div>' : '') +
      '<div style="display:flex;gap:.6rem;margin-top:1.4rem;flex-wrap:wrap">' + (done ? '<button class="btn btn-ghost" id="acUndone">✓ Completed — undo</button>' : '<button class="btn btn-primary" id="acDone">Mark complete</button>') + (next ? '<a href="#/academy/' + next.l.id + '" class="btn btn-ghost">Next lesson →</a>' : '<a href="#/academy" class="btn btn-ghost">Back to academy</a>') + '</div>' +
      '</div>', '<a href="#/academy">Manager academy</a>');
    const dn = $('#acDone'); if (dn) dn.onclick = async () => { await api('POST', '/academy/' + lessonId); toast('Nice — lesson done ✅'); viewAcademyLesson(lessonId); };
    const un = $('#acUndone'); if (un) un.onclick = async () => { await api('DELETE', '/academy/' + lessonId); viewAcademyLesson(lessonId); };
  }

  // ---------------- WELLBEING & EAP ----------------
  function crisisCardHtml(c, asLink) {
    const tel = 'tel:' + (c.phone || '').replace(/[^0-9]/g, '');
    const inner = '<div class="grow"><strong>' + esc(c.name) + '</strong>' + (c.when ? '<div class="muted" style="font-size:.82rem">' + esc(c.when) + '</div>' : '') + (c.detail ? '<div class="muted" style="font-size:.85rem">' + esc(c.detail) + '</div>' : '') + '</div><span class="crisis-phone">' + esc(c.phone) + '</span>';
    return asLink ? '<a href="' + tel + '" class="crisis-card">' + inner + '</a>' : '<div class="crisis-card">' + inner + '</div>';
  }
  async function viewSupport() {
    const wb = await api('GET', '/wellbeing');
    const k = wb.kit || {};
    const list = (arr) => '<ul class="tidy">' + (arr || []).map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>';
    const crisis = (k.crisisResources || []).map((c) => crisisCardHtml(c, true)).join('');
    const eapPanel = wb.eap
      ? '<div class="panel"><div style="display:flex;justify-content:space-between;align-items:center;gap:1rem"><strong>Your EAP — ' + esc(wb.eap.name || 'Employee Assistance Program') + '</strong><button class="btn btn-ghost btn-sm" id="editEap">Edit</button></div>' + (wb.eap.phone ? '<div style="margin-top:.4rem">📞 <a href="tel:' + esc((wb.eap.phone || '').replace(/[^0-9]/g, '')) + '">' + esc(wb.eap.phone) + '</a></div>' : '') + (wb.eap.url ? '<div>🔗 <a href="' + esc(wb.eap.url) + '" target="_blank" rel="noopener">' + esc(wb.eap.url) + '</a></div>' : '') + (wb.eap.notes ? '<div class="muted" style="margin-top:.3rem">' + esc(wb.eap.notes) + '</div>' : '') + '<div class="muted" style="font-size:.82rem;margin-top:.5rem">Your whole team can see this in their app, so they can reach out confidentially.</div></div>'
      : '<div class="panel" style="border-style:dashed"><strong>Set up your EAP</strong><div class="muted" style="font-size:.9rem;margin:.2rem 0 .7rem">If your business has an Employee Assistance Program (free, confidential counselling), add it so your team can find it any time.</div><button class="btn btn-primary btn-sm" id="setupEap">+ Add your EAP</button></div>';
    layout('support', 'Wellbeing & EAP',
      '<div class="panel" style="background:var(--brand);color:#eaf1f6;margin-bottom:1.4rem"><strong style="color:#fff">Looking after your people</strong><p style="margin:.3rem 0 0;color:#cfe0ea">' + esc(k.whatIsEap || '') + '</p></div>' +
      eapPanel +
      '<div class="section-title" style="margin-top:1.8rem"><h3>🆘 Crisis & support lines</h3></div><p class="muted" style="margin-top:-.2rem">Free, confidential, any time. Tap to call. Share with anyone who needs them.</p>' + crisis +
      '<div class="section-title" style="margin-top:1.8rem"><h3>When to reach out</h3></div><div class="card card-pad">' + list(k.whenToRefer) + '</div>' +
      '<div class="section-title" style="margin-top:1.4rem"><h3>How to raise it kindly</h3></div><div class="card card-pad">' + (k.conversation && k.conversation.opener ? '<p style="margin-top:0"><em>“' + esc(k.conversation.opener) + '”</em></p>' : '') + list((k.conversation && k.conversation.tips) || k.howToRefer) + '</div>' +
      '<div class="grid grid-2" style="margin-top:1.4rem"><div class="card card-pad"><strong>✅ Do</strong>' + list(k.managerDos) + '</div><div class="card card-pad"><strong>🚫 Don\'t</strong>' + list(k.managerDonts) + '</div></div>' +
      (k.legalNote ? '<div class="disclaimer-note" style="margin-top:1.4rem">' + esc(k.legalNote) + ' ' + refChip('whs', 'psychosocial duty care wellbeing health safety', 'Duty of care') + '</div>' : ''));
    const se = $('#setupEap'); if (se) se.onclick = () => openEapEdit(wb.eap);
    const ee = $('#editEap'); if (ee) ee.onclick = () => openEapEdit(wb.eap);
  }
  function openEapEdit(eap) {
    eap = eap || {};
    openModal('<h2>Your Employee Assistance Program</h2><p class="muted">Add your EAP provider so your team can reach confidential support. Leave blank if you don\'t have one yet.</p>' +
      '<div class="field"><label>Provider name</label><input id="eapName" value="' + esc(eap.name || '') + '" placeholder="e.g. AccessEAP, Acacia, Converge"></div>' +
      '<div class="field"><label>Phone</label><input id="eapPhone" value="' + esc(eap.phone || '') + '" placeholder="1800 ..."></div>' +
      '<div class="field"><label>Website / booking link</label><input id="eapUrl" value="' + esc(eap.url || '') + '" placeholder="https://..."></div>' +
      '<div class="field"><label>Notes for your team</label><textarea id="eapNotes" rows="2" placeholder="e.g. Free &amp; confidential, a few sessions a year. Just mention you work at [business].">' + esc(eap.notes || '') + '</textarea></div>' +
      '<div class="modal-foot"><button class="btn btn-ghost" id="eapCancel">Cancel</button><button class="btn btn-primary" id="eapSave">Save</button></div>');
    $('#eapCancel').onclick = closeModal;
    $('#eapSave').onclick = async () => { await api('POST', '/settings/eap', { eap_name: $('#eapName').value.trim(), eap_phone: $('#eapPhone').value.trim(), eap_url: $('#eapUrl').value.trim(), eap_notes: $('#eapNotes').value.trim() }); closeModal(); toast('Saved'); viewSupport(); };
  }
  async function openReferEap(emp) {
    const wb = await api('GET', '/wellbeing'); const k = wb.kit || {};
    const crisis = (k.crisisResources || []).slice(0, 4).map((c) => '<div style="display:flex;justify-content:space-between;padding:.35rem 0;border-bottom:1px dashed var(--line)"><span>' + esc(c.name) + '</span><strong>' + esc(c.phone) + '</strong></div>').join('');
    openModal('<h2>🫶 Wellbeing support for ' + esc(emp.name.split(' ')[0]) + '</h2>' +
      '<p class="muted">' + esc((k.conversation && k.conversation.opener) || 'Have a quiet, caring word and point them to confidential support.') + '</p>' +
      (wb.eap ? '<div class="panel"><strong>Your EAP: ' + esc(wb.eap.name || 'EAP') + '</strong>' + (wb.eap.phone ? ' · ' + esc(wb.eap.phone) : '') + '</div>' : '<div class="panel" style="border-style:dashed">No EAP set up yet. <a href="#/support">Add one →</a></div>') +
      '<div style="margin:.8rem 0"><div class="muted" style="font-weight:700;font-size:.78rem;text-transform:uppercase;letter-spacing:.04em;margin-bottom:.2rem">Crisis lines</div>' + crisis + '</div>' +
      '<label class="check-item" style="margin:.5rem 0"><input type="checkbox" id="logSupport" checked><span><span class="ci-label">Log a private wellbeing note</span><br><span class="ci-help">Records that you offered support — never what was discussed.</span></span></label>' +
      '<div class="modal-foot"><button class="btn btn-ghost" id="reapCancel">Close</button><button class="btn btn-primary" id="reapDone">Done</button></div>');
    $('#reapCancel').onclick = closeModal;
    $('#reapDone').onclick = async () => { if ($('#logSupport').checked) { await api('POST', '/employees/' + emp.id + '/refer-eap', {}); toast('Logged — good on you'); } closeModal(); };
  }

  // ---------------- MANAGER: productivity / leave / suggestions ----------------
  async function viewProductivity() {
    const days = 7;
    const data = await api('GET', '/productivity?days=' + days);
    const max = Math.max(1, ...data.workers.map((w) => w.entries));
    const rows = data.workers.length
      ? data.workers.map((w) => {
        const cats = Object.keys(w.byCategory).sort((a, b) => w.byCategory[b] - w.byCategory[a]).slice(0, 3).map((c) => c.replace(/_/g, ' ') + ' ×' + w.byCategory[c]).join(', ');
        return '<a href="#/member/' + w.employee_id + '" class="row"><span class="ic-circle">📊</span><span class="grow"><span class="t">' + esc(w.name) + '</span><span class="s">' + w.entries + ' entries · active ' + w.activeDays + '/' + days + ' days' + (cats ? ' · ' + esc(cats) : '') + '</span></span><span class="meta" style="min-width:90px"><div class="prod-bar"><div class="prod-fill" style="width:' + Math.round(w.entries / max * 100) + '%"></div></div></span></a>';
      }).join('')
      : '<div class="empty"><span class="ic">📊</span>No work logged yet.<br>When your team logs their work in the app, it shows up here.</div>';
    layout('productivity', 'Productivity', '<div class="section-title"><h3>Last ' + days + ' days</h3><span class="muted" style="font-size:.85rem">since ' + fmtDate(data.from) + '</span></div><p class="muted" style="max-width:64ch;margin-top:-.3rem">What your team\'s been logging from the app. Tap a worker for the detail.</p><div class="row-list">' + rows + '</div>');
  }

  async function viewLeave() {
    const reqs = await api('GET', '/leave');
    const pending = reqs.filter((r) => r.status === 'pending');
    const decided = reqs.filter((r) => r.status !== 'pending');
    const card = (l) => '<div class="card card-pad" style="margin-bottom:.7rem"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:1rem"><div><strong>' + esc(l.employee_name) + '</strong> <span class="muted">— ' + esc(l.leave_type || 'Leave') + '</span><div class="muted" style="font-size:.9rem">' + esc(l.start_date) + (l.end_date && l.end_date !== l.start_date ? ' → ' + esc(l.end_date) : '') + '</div>' + (l.note ? '<div style="margin-top:.3rem">' + esc(l.note) + '</div>' : '') + '</div>' + (l.status === 'pending' ? '<div style="display:flex;gap:.4rem;flex:none"><button class="btn btn-positive btn-sm lv-ok" data-id="' + l.id + '">Approve</button><button class="btn btn-ghost btn-sm lv-no" data-id="' + l.id + '">Decline</button></div>' : '<span class="badge ' + (l.status === 'approved' ? 'badge-positive' : 'badge-watchful') + '" style="flex:none">' + (l.status === 'approved' ? 'Approved' : 'Declined') + '</span>') + '</div></div>';
    layout('leave', 'Leave',
      '<div class="section-title"><h3>Waiting on you (' + pending.length + ')</h3></div>' + (pending.length ? pending.map(card).join('') : '<div class="muted">Nothing waiting on you. 👍</div>') +
      (decided.length ? '<div class="section-title" style="margin-top:1.8rem"><h3>Recent</h3></div>' + decided.slice(0, 20).map(card).join('') : ''));
    root().querySelectorAll('.lv-ok').forEach((b) => { b.onclick = async () => { await api('POST', '/leave/' + b.getAttribute('data-id') + '/decide', { status: 'approved' }); toast('Approved'); viewLeave(); }; });
    root().querySelectorAll('.lv-no').forEach((b) => { b.onclick = async () => { await api('POST', '/leave/' + b.getAttribute('data-id') + '/decide', { status: 'declined' }); toast('Declined'); viewLeave(); }; });
  }

  async function viewSuggestions() {
    const sg = await api('GET', '/suggestions');
    const nu = sg.filter((s) => s.status === 'new');
    const card = (s) => '<div class="card card-pad" style="margin-bottom:.7rem"><div style="display:flex;justify-content:space-between;gap:1rem"><div class="grow"><div class="muted" style="font-size:.8rem">' + (s.category ? esc(s.category) + ' · ' : '') + (s.anonymous ? '🔒 Anonymous' : esc(s.employee_name || 'Someone')) + ' · ' + fmtDate(s.created_at) + '</div><div style="margin-top:.2rem">' + esc(s.body) + '</div></div>' + (s.status === 'new' ? '<button class="btn btn-ghost btn-sm sg-seen" data-id="' + s.id + '" style="flex:none">✓ Mark seen</button>' : '<span class="badge" style="flex:none">Seen</span>') + '</div></div>';
    layout('suggestions', 'Suggestions',
      '<p class="muted" style="max-width:64ch">Ideas, concerns and wins from your team — new ones are notified to you.</p>' +
      '<div class="section-title"><h3>New (' + nu.length + ')</h3></div>' + (nu.length ? nu.map(card).join('') : '<div class="muted">Nothing new right now.</div>') +
      ((sg.length - nu.length) > 0 ? '<div class="section-title" style="margin-top:1.8rem"><h3>Earlier</h3></div>' + sg.filter((s) => s.status !== 'new').map(card).join('') : ''));
    root().querySelectorAll('.sg-seen').forEach((b) => { b.onclick = async () => { await api('POST', '/suggestions/' + b.getAttribute('data-id') + '/status', { status: 'seen' }); viewSuggestions(); }; });
  }

  // ---------------- STAFF portal ----------------
  function staffLayout(content, active) {
    const tab = (key, href, ic, label) => '<a href="' + href + '" class="staff-tab ' + (active === key ? 'active' : '') + '"><span class="st-ic">' + ic + '</span><span class="st-l">' + label + '</span></a>';
    root().innerHTML =
      '<div class="staff-wrap">' +
      '<div class="staff-top">' +
      '<a href="#/" class="logo">' + LOGO + 'Offsider</a>' +
      '<div style="display:flex;align-items:center;gap:.6rem">' + bellHtml() + '<div style="text-align:right"><div style="font-weight:700;font-size:.9rem">' + esc(State.me.name.split(' ')[0]) + '</div><a href="#" id="logout" class="muted" style="font-size:.8rem">Log out</a></div></div></div>' +
      '<div id="view" class="staff-view">' + content + '</div>' +
      '<nav class="staff-tabs">' +
      tab('home', '#/', '🏠', 'Home') +
      tab('log', '#/log', '➕', 'Log work') +
      tab('leave', '#/leave', '🌴', 'Leave') +
      tab('say', '#/say', '💬', 'Say') +
      tab('training', '#/training', '🎓', 'Training') +
      '</nav></div>';
    $('#logout').onclick = async (e) => { e.preventDefault(); await api('POST', '/auth/logout'); State.me = null; location.hash = '#login'; routeChanged(); };
    wireBell();
  }

  async function viewStaffHome() {
    const [me, assignments, myLessons, plans] = await Promise.all([api('GET', '/me'), api('GET', '/me/assignments'), api('GET', '/me/lessons'), api('GET', '/me/plans')]);
    const pending = assignments.filter((a) => !a.completed);
    const done = assignments.filter((a) => a.completed);
    const checkins = pending.length
      ? '<div class="row-list">' + pending.map((a) => '<a href="#/checkin/' + a.id + '" class="row"><span class="ic-circle">' + (a.anonymous ? '🔒' : '📝') + '</span><span class="grow"><span class="t">' + esc(a.title) + '</span><span class="s">' + cadenceLabel(a.cadence) + (a.anonymous ? ' · anonymous' : '') + '</span></span><span class="meta">Fill in →</span></a>').join('') + '</div>'
      : '<div class="card card-pad muted">All done — nothing to fill in right now. 👍</div>';
    const lessonsHtml = (myLessons && myLessons.length)
      ? '<div class="row-list">' + myLessons.map((l) => l.status === 'passed'
        ? '<div class="row" style="cursor:default"><span class="ic-circle" style="background:var(--positive-50)">✅</span><span class="grow"><span class="t">' + esc(l.title) + '</span><span class="s">Passed' + (l.score != null ? ' · ' + Math.round(l.score * 100) + '%' : '') + (l.competencyLabel ? ' · signed off ' + esc(l.competencyLabel) : '') + '</span></span></div>'
        : '<a href="#/lesson/' + l.lesson_id + '" class="row"><span class="ic-circle">🎓</span><span class="grow"><span class="t">' + esc(l.title) + '</span><span class="s">' + esc(l.blurb || '') + '</span></span><span class="meta">Start →</span></a>').join('') + '</div>'
      : '';

    const todayD = todayStr();
    const dayPlan = (plans || []).find((p) => p.period === 'day' && p.plan_date === todayD);
    const weekPlan = (plans || []).find((p) => p.period === 'week');
    const planCard = (p, label) => '<div class="panel" style="margin-bottom:.8rem"><div class="wizard-kind">' + label + '</div>' + (p.title ? '<h3 style="margin:.1rem 0 .5rem">' + esc(p.title) + '</h3>' : '') + ((p.items && p.items.length) ? '<ul class="plan-list">' + p.items.map((it) => '<li>' + esc(typeof it === 'string' ? it : (it.text || '')) + '</li>').join('') + '</ul>' : '') + (p.note ? '<p class="muted" style="margin-top:.4rem">' + esc(p.note) + '</p>' : '') + '</div>';
    const plansHtml = (dayPlan || weekPlan) ? ((dayPlan ? planCard(dayPlan, 'Today’s plan') : '') + (weekPlan ? planCard(weekPlan, 'This week') : '')) : '';

    const w = me.wage;
    let pathCard = '';
    if (w && w.currentRole) {
      const cl = w.currentLevel, nl = w.nextLevel;
      pathCard =
        '<div class="panel"><div class="wizard-kind">Where you\'re at</div><h2 style="margin:.1rem 0 .2rem">' + esc(w.currentRole.title) + '</h2>' +
        '<div class="muted">' + (cl ? esc(cl.name) + ' · award guide ~' + money(cl.hourly) + '/hr' : '') + (me.employee.pay_rate ? ' · you\'re on ' + money(me.employee.pay_rate) + '/hr' : '') + '</div>' +
        (w.nextRole ? '<div class="gap-box" style="margin-top:1rem"><strong>🚀 Next step: ' + esc(w.nextRole.title) + '</strong>' + (nl ? ' <span class="muted">(' + esc(nl.name) + ' · ~' + money(nl.hourly) + '/hr)</span>' : '') +
          '<div class="why" style="margin:.6rem 0 .3rem">What gets you there:</div><div class="checklist">' + (w.currentRole.stepsToNext || []).map((s) => '<div class="check-item" style="padding:.6rem .8rem"><span>✅ <span class="ci-label">' + esc(s.label) + '</span>' + (s.type ? ' <span class="step-tag ' + s.type + '">' + esc(s.type) + '</span>' : '') + (s.detail ? '<br><span class="ci-help">' + esc(s.detail) + '</span>' : '') + '</span></div>').join('') + '</div></div>' : '') +
        '</div>';
    }
    staffLayout(
      '<h1 style="font-size:1.7rem;margin-bottom:.2rem">G\'day, ' + esc(State.me.name.split(' ')[0]) + '</h1>' +
      '<p class="muted">Here\'s your day — most of this takes a minute.</p>' +
      (plansHtml ? '<div class="section-title"><h3>🎯 Your plan</h3></div>' + plansHtml : '') +
      '<a href="#/log" class="cta-log">➕ Log today\'s work</a>' +
      '<div class="section-title" style="margin-top:1.4rem"><h3>📋 Your check-ins</h3>' + (done.length ? '<span class="muted" style="font-size:.85rem">' + done.length + ' done this period</span>' : '') + '</div>' + checkins +
      (lessonsHtml ? '<div class="section-title" style="margin-top:1.8rem"><h3>📚 Your lessons</h3></div>' + lessonsHtml : '') +
      (pathCard ? '<div class="section-title" style="margin-top:1.8rem"><h3>Your career & pay</h3></div>' + pathCard : ''),
      'home');
  }

  async function viewStaffCheckin(id) {
    const assignments = await api('GET', '/me/assignments');
    const a = assignments.find((x) => x.id === id);
    if (!a) { location.hash = '#/'; return viewStaffHome(); }
    const ans = {};
    staffLayout(
      '<a href="#/" class="btn btn-ghost btn-sm">← Back</a>' +
      '<div class="panel" style="margin-top:1rem"><h2>' + esc(a.title) + '</h2><p class="muted">' + esc(a.intro || '') + '</p>' +
      (a.anonymous ? '<div class="ok-msg">🔒 This is anonymous — your name isn\'t recorded.</div>' : '') +
      questionsHtml(a.questions) + '<div id="ckErr"></div>' +
      '<button class="btn btn-primary btn-block btn-lg" id="ckSubmit">Send →</button></div>');
    wireQuestions(ans);
    $('#ckSubmit').onclick = async () => {
      const btn = $('#ckSubmit'); btn.disabled = true; btn.textContent = 'Sending…';
      try {
        await api('POST', '/me/assignments/' + a.id, { answers: ans });
        staffLayout('<div class="panel" style="text-align:center;padding:2.5rem 1.5rem"><div style="font-size:3rem">🙌</div><h2>Thanks, that\'s sent.</h2><p class="muted">Cheers for taking the time' + (a.anonymous ? ' — it\'s anonymous' : '') + '.</p><a href="#/" class="btn btn-primary">Back to your check-ins</a></div>');
      } catch (e) { $('#ckErr').innerHTML = '<div class="error-msg">' + esc(e.message) + '</div>'; btn.disabled = false; btn.textContent = 'Send →'; }
    };
  }

  async function viewStaffLesson(lessonId) {
    const l = await api('GET', '/me/lessons/' + lessonId);
    const sections = (l.sections || []).map((s) => '<div style="margin-bottom:1.1rem"><div style="font-family:var(--font-head);font-weight:700;margin-bottom:.2rem">' + esc(s.heading) + '</div><div style="color:var(--ink-soft)">' + nl2br(s.body) + '</div></div>').join('');
    const ans = {};
    const qHtml = (l.quiz || []).map((q, i) => '<div class="q"><div class="qlabel">' + (i + 1) + '. ' + esc(q.question) + '</div><div class="choices" data-choice="' + q.id + '">' + (q.options || []).map((o, oi) => '<label><input type="radio" name="q_' + q.id + '" value="' + oi + '"> ' + esc(o) + '</label>').join('') + '</div></div>').join('');
    staffLayout(
      '<a href="#/" class="btn btn-ghost btn-sm">← Back</a>' +
      '<div class="panel" style="margin-top:1rem"><div class="wizard-kind">Lesson</div><h2>' + esc(l.title) + '</h2><p class="muted">' + esc(l.intro || '') + '</p>' + sections +
      '<hr style="border:none;border-top:1px solid var(--line);margin:1.3rem 0"><h3 style="margin:0">Quick quiz</h3><p class="muted" style="font-size:.85rem;margin:.2rem 0 0">Get ' + Math.round((l.passMark || 0.7) * 100) + '% or better to pass — it ticks the competency on your record.</p>' +
      qHtml + '<div id="lqErr"></div><button class="btn btn-primary btn-block btn-lg" id="lqSubmit">Submit answers</button></div>');
    root().querySelectorAll('[data-choice] input').forEach((inp) => { inp.onchange = () => { ans[inp.name.slice(2)] = inp.value; inp.closest('[data-choice]').querySelectorAll('label').forEach((x) => x.classList.remove('sel')); inp.closest('label').classList.add('sel'); }; });
    $('#lqSubmit').onclick = async () => {
      const btn = $('#lqSubmit'); btn.disabled = true; btn.textContent = 'Marking…';
      try {
        const r = await api('POST', '/me/lessons/' + lessonId + '/submit', { answers: ans });
        const msg = r.passed
          ? '<div style="font-size:3rem">🎉</div><h2>Passed! ' + r.correct + '/' + r.total + '</h2>' + (r.signed ? '<p class="muted">You\'ve been signed off on <strong>' + esc(r.signed) + '</strong> — it\'s on your training record now.</p>' : '<p class="muted">Nice work.</p>')
          : '<div style="font-size:3rem">📚</div><h2>' + r.correct + '/' + r.total + ' — not quite there</h2><p class="muted">Have another read and give it another go.</p>';
        staffLayout('<div class="panel" style="text-align:center;padding:2.5rem 1.5rem">' + msg + '<a href="#/" class="btn btn-primary" style="margin-top:1.2rem">Back to your portal</a></div>');
      } catch (e) { $('#lqErr').innerHTML = '<div class="error-msg">' + esc(e.message) + '</div>'; btn.disabled = false; btn.textContent = 'Submit answers'; }
    };
  }

  function openPlanModal(employeeId) {
    openModal('<h2>Set a plan</h2><p class="muted">Give them a clear plan for the day or week — it shows up in their app.</p>' +
      '<div class="grid grid-2"><div class="field"><label>For</label><select id="plPeriod"><option value="day">Today</option><option value="week">This week</option></select></div><div class="field"><label>Date</label><input type="date" id="plDate" value="' + todayStr() + '"></div></div>' +
      '<div class="field"><label>Title</label><input id="plTitle" placeholder="e.g. Cardiff site testing"></div>' +
      '<div class="field"><label>Tasks (one per line)</label><textarea id="plItems" rows="5" placeholder="Density tests at lot 14&#10;Concrete cylinders for the Mayfield job&#10;Log samples from yesterday"></textarea></div>' +
      '<div class="field"><label>Note (optional)</label><input id="plNote" placeholder="Anything else"></div>' +
      '<div class="modal-foot"><button class="btn btn-ghost" id="plCancel">Cancel</button><button class="btn btn-primary" id="plSave">Send plan</button></div>');
    $('#plCancel').onclick = closeModal;
    $('#plSave').onclick = async () => {
      const items = $('#plItems').value.split('\n').map((s) => s.trim()).filter(Boolean).map((t) => ({ text: t }));
      await api('POST', '/employees/' + employeeId + '/plans', { period: $('#plPeriod').value, plan_date: $('#plDate').value, title: $('#plTitle').value.trim(), items: items, note: $('#plNote').value.trim() });
      closeModal(); toast('Plan sent'); viewMember(employeeId);
    };
  }

  async function openAllowanceAdd(employeeId) {
    const kit = await api('GET', '/allowance-kit');
    const chip = (a) => '<button type="button" class="log-chip allow-pick" data-name="' + esc(a.name) + '" data-amt="' + a.amount + '" data-basis="' + a.basis + '" data-note="' + esc(a.note || '') + '">' + esc(a.name) + ' <span class="cu">+$' + a.amount + '/' + (a.basis === 'week' ? 'wk' : 'hr') + '</span></button>';
    openModal('<h2>Add an allowance</h2><p class="muted">' + esc(kit.intro || '') + '</p>' +
      '<div class="alabel">Award allowances</div><div class="chip-grid">' + (kit.award || []).map(chip).join('') + '</div>' +
      '<div class="alabel" style="margin-top:.7rem">Or a top-up of your own</div><div class="chip-grid">' + (kit.suggestions || []).map(chip).join('') + '</div>' +
      '<div class="field" style="margin-top:1rem"><label>Name</label><input id="alName" placeholder="e.g. Training allowance"></div>' +
      '<div class="grid grid-2"><div class="field"><label>Amount $</label><input type="number" id="alAmt" step="0.01" inputmode="decimal" placeholder="e.g. 2.50"></div><div class="field"><label>Per</label><select id="alBasis"><option value="hour">hour</option><option value="week">week</option><option value="shift">shift</option></select></div></div>' +
      '<div class="field"><label>Note (optional)</label><input id="alNote" placeholder="What it\'s for"></div>' +
      '<div class="modal-foot"><button class="btn btn-ghost" id="alCancel">Cancel</button><button class="btn btn-primary" id="alSave">Add allowance</button></div>');
    root().querySelectorAll('.allow-pick').forEach((b) => { b.onclick = () => { $('#alName').value = b.getAttribute('data-name'); $('#alAmt').value = b.getAttribute('data-amt'); $('#alBasis').value = b.getAttribute('data-basis'); $('#alNote').value = b.getAttribute('data-note'); }; });
    $('#alCancel').onclick = closeModal;
    $('#alSave').onclick = async () => { const name = $('#alName').value.trim(); if (!name) { toast('A name is needed', 'error'); return; } await api('POST', '/employees/' + employeeId + '/allowances', { name: name, amount: $('#alAmt').value, basis: $('#alBasis').value, note: $('#alNote').value.trim() }); closeModal(); toast('Allowance added'); viewMember(employeeId); };
  }

  async function openLessonAssign(employeeId) {
    const ls = await getLessons();
    const opts = ls.map((l) => '<button class="choice makelesson" data-l="' + l.id + '" style="margin-bottom:.4rem">' + esc(l.title) + '<span class="note">' + esc(l.blurb || '') + (l.competencyLabel ? ' · signs off: ' + esc(l.competencyLabel) : '') + '</span></button>').join('');
    openModal('<h2>Assign a lesson</h2><p class="muted">They\'ll get it in their portal to read and sit the quiz. Passing ticks the competency automatically.</p>' + opts + '<div class="modal-foot"><button class="btn btn-ghost" id="lCancel">Cancel</button></div>');
    $('#lCancel').onclick = closeModal;
    root().querySelectorAll('.makelesson').forEach((b) => { b.onclick = async () => { await api('POST', '/employees/' + employeeId + '/lessons', { lesson_id: b.getAttribute('data-l') }); closeModal(); toast('Lesson assigned'); viewMember(employeeId); }; });
  }

  // ---- worker app: log work ----
  async function viewStaffLog(date) {
    date = date || todayStr();
    const [kit, wl] = await Promise.all([getAppKit(), api('GET', '/me/worklog?date=' + date)]);
    const cats = {}; (kit.worklog.categories || []).forEach((c) => { cats[c.id] = c; });
    const presets = kit.worklog.presets || [];
    const byCat = {}; presets.forEach((p) => { (byCat[p.category] = byCat[p.category] || []).push(p); });
    const chips = Object.keys(byCat).map((cid) => {
      const c = cats[cid] || { label: cid, icon: '•' };
      return '<div class="log-cat"><div class="log-cat-h">' + (c.icon || '') + ' ' + esc(c.label) + '</div><div class="chip-grid">' +
        byCat[cid].map((p) => '<button class="log-chip" data-idx="' + presets.indexOf(p) + '">' + esc(p.label) + (p.unit === 'hours' ? ' <span class="cu">hrs</span>' : (p.unit === 'count' ? ' <span class="cu">#</span>' : '')) + '</button>').join('') + '</div></div>';
    }).join('');
    const entries = wl.entries.length
      ? '<div class="row-list">' + wl.entries.map((en) => '<div class="row" style="cursor:default"><span class="ic-circle">' + (cats[en.category] ? cats[en.category].icon : '📝') + '</span><span class="grow"><span class="t">' + esc(en.label || en.note || 'Work') + (en.quantity != null ? ' · <strong>' + en.quantity + (en.unit === 'hours' ? 'h' : '') + '</strong>' : '') + '</span>' + (en.note && en.label ? '<span class="s">' + esc(en.note) + '</span>' : '') + '</span><button class="btn btn-ghost btn-sm wl-del" data-id="' + en.id + '">✕</button></div>').join('') + '</div>'
      : '<div class="muted">Nothing logged yet for this day. Tap something above ☝️</div>';
    staffLayout(
      '<h1 style="font-size:1.6rem;margin-bottom:.1rem">Log your work</h1><p class="muted">Tap what you did — takes seconds, and it helps the boss see what the team\'s getting through.</p>' +
      '<div class="log-datebar"><input type="date" id="logDate" value="' + date + '" max="' + todayStr() + '"><span class="muted">' + (date === todayStr() ? 'Today' : fmtDate(date)) + '</span></div>' +
      chips +
      '<button class="btn btn-ghost btn-block" id="logOther" style="margin:.2rem 0 1.2rem">+ Something else</button>' +
      '<div class="section-title"><h3>Logged ' + (date === todayStr() ? 'today' : '') + ' (' + wl.entries.length + ')</h3></div>' + entries,
      'log');
    $('#logDate').onchange = (e) => viewStaffLog(e.target.value);
    root().querySelectorAll('.log-chip').forEach((b) => { b.onclick = () => openQuickLog(presets[parseInt(b.getAttribute('data-idx'), 10)], date); });
    $('#logOther').onclick = () => openQuickLog({ label: '', category: 'other', unit: 'none' }, date);
    root().querySelectorAll('.wl-del').forEach((b) => { b.onclick = async () => { await api('DELETE', '/me/worklog/' + b.getAttribute('data-id')); viewStaffLog(date); }; });
  }
  function openQuickLog(item, date) {
    const free = !item.label;
    const needsQty = item.unit === 'count' || item.unit === 'hours';
    openModal('<h2>' + (free ? 'Log something' : esc(item.label)) + '</h2>' + (item.hint ? '<p class="muted">' + esc(item.hint) + '</p>' : '') +
      (free ? '<div class="field"><label>What did you do?</label><input id="qLogLabel" placeholder="e.g. Helped on the Cardiff site"></div>' : '') +
      (needsQty ? '<div class="field"><label>' + (item.unit === 'hours' ? 'Hours' : 'How many?') + '</label><input type="number" id="qLogN" value="1" min="0" step="' + (item.unit === 'hours' ? '0.5' : '1') + '" inputmode="decimal"></div>' : '') +
      '<div class="field"><label>Note (optional)</label><input id="qLogNote" placeholder="Job, site, anything"></div>' +
      '<div class="modal-foot"><button class="btn btn-ghost" id="qlCancel">Cancel</button><button class="btn btn-primary" id="qlSave">Add it</button></div>');
    $('#qlCancel').onclick = closeModal;
    $('#qlSave').onclick = async () => {
      const label = free ? $('#qLogLabel').value.trim() : item.label;
      if (free && !label) { toast('What did you do?', 'error'); return; }
      await api('POST', '/me/worklog', { category: item.category, label: label, quantity: needsQty ? ($('#qLogN').value || '') : '', unit: item.unit || null, note: $('#qLogNote').value.trim(), occurred_on: date });
      closeModal(); toast('Logged ✓'); viewStaffLog(date);
    };
  }

  // ---- worker app: leave ----
  async function viewStaffLeave() {
    const [kit, mine] = await Promise.all([getAppKit(), api('GET', '/me/leave')]);
    const badge = (s) => s === 'approved' ? '<span class="badge badge-positive">Approved ✓</span>' : (s === 'declined' ? '<span class="badge badge-watchful">Not approved</span>' : '<span class="badge">Pending</span>');
    const list = mine.length
      ? '<div class="row-list">' + mine.map((l) => '<div class="row" style="cursor:default"><span class="ic-circle">🌴</span><span class="grow"><span class="t">' + esc(l.leave_type || 'Leave') + '</span><span class="s">' + esc(l.start_date) + (l.end_date && l.end_date !== l.start_date ? ' → ' + esc(l.end_date) : '') + (l.decision_note ? ' · ' + esc(l.decision_note) : '') + '</span></span><span class="meta">' + badge(l.status) + '</span></div>').join('') + '</div>'
      : '<div class="muted">No leave requests yet.</div>';
    staffLayout('<h1 style="font-size:1.6rem;margin-bottom:.1rem">Leave</h1><p class="muted">Request time off and see where it\'s at.</p><button class="btn btn-primary btn-block" id="reqLeave" style="margin-bottom:1.2rem">+ Request leave</button><div class="section-title"><h3>Your requests</h3></div>' + list, 'leave');
    $('#reqLeave').onclick = () => openLeaveRequest(kit);
  }
  function openLeaveRequest(kit) {
    const opts = (kit.leaveTypes || []).map((t) => '<option value="' + esc(t.label) + '">' + esc(t.label) + (t.paid ? '' : ' (unpaid)') + '</option>').join('');
    openModal('<h2>Request leave</h2>' + (kit.leaveTip ? '<p class="muted">' + esc(kit.leaveTip) + '</p>' : '') +
      '<div class="field"><label>Type ' + refChip('leave', '', 'Leave entitlements (the NES)') + '</label><select id="lvType">' + opts + '</select></div>' +
      '<div class="grid grid-2"><div class="field"><label>From</label><input type="date" id="lvFrom" value="' + todayStr() + '"></div><div class="field"><label>To</label><input type="date" id="lvTo" value="' + todayStr() + '"></div></div>' +
      '<div class="field"><label>Note (optional)</label><textarea id="lvNote" rows="2" placeholder="Anything your manager should know"></textarea></div>' +
      '<div class="modal-foot"><button class="btn btn-ghost" id="lvCancel">Cancel</button><button class="btn btn-primary" id="lvSave">Send request</button></div>');
    $('#lvCancel').onclick = closeModal;
    $('#lvSave').onclick = async () => { const from = $('#lvFrom').value; if (!from) { toast('Pick a start date', 'error'); return; } await api('POST', '/me/leave', { leave_type: $('#lvType').value, start_date: from, end_date: $('#lvTo').value || from, note: $('#lvNote').value.trim() }); closeModal(); toast('Request sent'); viewStaffLeave(); };
  }

  // ---- worker app: say something (suggestions) ----
  async function viewStaffSay() {
    const kit = await getAppKit();
    const sg = kit.suggestions || { categories: [], intro: '', prompts: [] };
    staffLayout('<h1 style="font-size:1.6rem;margin-bottom:.1rem">Say something</h1><p class="muted">' + esc(sg.intro || '') + '</p>' +
      '<button class="btn btn-primary btn-block" id="newSuggest" style="margin:.4rem 0 1.4rem">💬 Send a suggestion</button>' +
      '<div class="panel"><strong>Got a scheduled check-in?</strong><p class="muted" style="font-size:.9rem;margin:.2rem 0">Some check-ins are fully anonymous — a safe way to give honest feedback.</p><a href="#/" class="btn btn-ghost btn-sm">See your check-ins →</a></div>' +
      '<a href="#/support" class="panel" style="display:flex;align-items:center;gap:.7rem;text-decoration:none;margin-top:.8rem"><span style="font-size:1.5rem">🫶</span><span class="grow"><strong>Need to talk to someone?</strong><div class="muted" style="font-size:.88rem">Free, confidential support — your EAP and 24/7 crisis lines.</div></span><span class="meta">→</span></a>', 'say');
    $('#newSuggest').onclick = () => openSuggest(sg);
  }
  async function viewStaffSupport() {
    const wb = await api('GET', '/wellbeing'); const k = wb.kit || {};
    const crisis = (k.crisisResources || []).map((c) => crisisCardHtml(c, true)).join('');
    staffLayout('<a href="#/say" class="btn btn-ghost btn-sm">← Back</a>' +
      '<h1 style="font-size:1.6rem;margin:.6rem 0 .1rem">Support</h1><p class="muted">Free, confidential help — any time, for anything. You won\'t get in any trouble for reaching out.</p>' +
      (wb.eap ? '<div class="panel"><strong>' + esc(wb.eap.name || 'Your workplace EAP') + '</strong><div class="muted" style="font-size:.9rem">Free, confidential counselling your work provides — they don\'t see what you talk about.</div>' + (wb.eap.phone ? '<div style="margin-top:.5rem"><a href="tel:' + esc((wb.eap.phone || '').replace(/[^0-9]/g, '')) + '" class="btn btn-primary btn-sm">📞 ' + esc(wb.eap.phone) + '</a></div>' : '') + (wb.eap.notes ? '<div class="muted" style="font-size:.85rem;margin-top:.4rem">' + esc(wb.eap.notes) + '</div>' : '') + '</div>' : '') +
      '<div class="section-title" style="margin-top:1.4rem"><h3>🆘 Anytime support lines</h3></div>' + crisis, 'say');
  }
  function openSuggest(sg) {
    const cats = (sg.categories || []).map((c) => '<option value="' + esc(c.label) + '">' + (c.icon || '') + ' ' + esc(c.label) + '</option>').join('');
    openModal('<h2>Send a suggestion</h2>' +
      '<div class="field"><label>What\'s it about?</label><select id="sgCat">' + cats + '</select></div>' +
      '<div class="field"><label>Your idea or message</label><textarea id="sgBody" rows="4" placeholder="' + esc((sg.prompts && sg.prompts[0]) || 'What\'s on your mind?') + '"></textarea></div>' +
      '<label class="check-item" style="margin-bottom:1rem"><input type="checkbox" id="sgAnon"><span><span class="ci-label">Send anonymously</span><br><span class="ci-help">Your name won\'t be attached.</span></span></label>' +
      '<div class="modal-foot"><button class="btn btn-ghost" id="sgCancel">Cancel</button><button class="btn btn-primary" id="sgSave">Send</button></div>');
    $('#sgCancel').onclick = closeModal;
    $('#sgSave').onclick = async () => { const body = $('#sgBody').value.trim(); if (!body) { toast('Write something first', 'error'); return; } await api('POST', '/me/suggestions', { category: $('#sgCat').value, body: body, anonymous: $('#sgAnon').checked }); closeModal(); toast('Sent — cheers!'); };
  }

  // ---- worker app: training ----
  async function viewStaffTraining() {
    const t = await api('GET', '/me/training');
    const w = t.wage;
    let body = '<h1 style="font-size:1.6rem;margin-bottom:.1rem">Your training</h1><p class="muted">Where you\'re at and what you\'re signed off on.</p>';
    if (w && w.currentRole) {
      const cl = w.currentLevel;
      const skills = (t.development || {}).skills || {};
      const steps = w.currentRole.stepsToNext || [];
      const done = steps.filter((s, i) => skills[w.currentRole.id + ':' + i]);
      const todo = steps.filter((s, i) => !skills[w.currentRole.id + ':' + i]);
      body += '<div class="panel"><div class="wizard-kind">You are</div><h2 style="margin:.1rem 0">' + esc(w.currentRole.title) + '</h2>' + (cl ? '<div class="muted">' + esc(cl.name) + (w.currentRole.awardLevel ? ' · ' + esc(w.currentRole.awardLevel) : '') + '</div>' : '') + '</div>';
      if (done.length) body += '<div class="section-title" style="margin-top:1.4rem"><h3>✅ Signed off</h3></div><div class="checklist">' + done.map((s) => '<div class="check-item"><span>✅ <span class="ci-label">' + esc(s.label) + '</span>' + (s.type ? ' <span class="step-tag ' + s.type + '">' + esc(s.type) + '</span>' : '') + '</span></div>').join('') + '</div>';
      if (w.nextRole && todo.length) body += '<div class="section-title" style="margin-top:1.4rem"><h3>🚀 Working towards ' + esc(w.nextRole.title) + '</h3></div><div class="checklist">' + todo.map((s) => '<div class="check-item"><span>⬜ <span class="ci-label">' + esc(s.label) + '</span>' + (s.type ? ' <span class="step-tag ' + s.type + '">' + esc(s.type) + '</span>' : '') + '</span></div>').join('') + '</div>';
    } else {
      body += '<div class="muted">Your training plan will show here once your manager sets up your role.</div>';
    }
    staffLayout(body, 'training');
  }

  // ---------------- router ----------------
  async function routeChanged() {
    const hash = location.hash || '#/';
    try {
      if (!State.me) {
        return viewAuth(hash.indexOf('signup') >= 0 ? 'signup' : 'login');
      }
      if (State.me.role === 'staff') {
        if (hash.indexOf('#/checkin/') === 0) return await viewStaffCheckin(hash.split('/')[2]);
        if (hash.indexOf('#/lesson/') === 0) return await viewStaffLesson(hash.split('/')[2]);
        if (hash.indexOf('#/log') === 0) return await viewStaffLog();
        if (hash.indexOf('#/leave') === 0) return await viewStaffLeave();
        if (hash.indexOf('#/say') === 0) return await viewStaffSay();
        if (hash.indexOf('#/support') === 0) return await viewStaffSupport();
        if (hash.indexOf('#/training') === 0) return await viewStaffTraining();
        return await viewStaffHome();
      }
      if (hash.indexOf('#/case/') === 0) return await viewCase(hash.split('/')[2]);
      if (hash.indexOf('#/candidate/') === 0) return await viewCandidate(hash.split('/')[2]);
      if (hash.indexOf('#/hiring') === 0) return await viewHiring();
      if (hash.indexOf('#/training/') === 0) return await viewTrainingRecord(hash.split('/')[2]);
      if (hash.indexOf('#/member/') === 0) return await viewMember(hash.split('/')[2]);
      if (hash.indexOf('#/document/') === 0) return await viewDocument(hash.split('/')[2]);
      if (hash.indexOf('#/new') === 0) return await viewNewCase();
      if (hash.indexOf('#/cases') === 0) return await viewCases();
      if (hash.indexOf('#/onboarding') === 0) return await viewOnboarding();
      if (hash.indexOf('#/team') === 0) return await viewTeam();
      if (hash.indexOf('#/documents') === 0) return await viewDocuments();
      if (hash.indexOf('#/career') === 0) return await viewCareer();
      if (hash.indexOf('#/feedback/') === 0) return await viewFeedbackDetail(hash.split('/')[2]);
      if (hash.indexOf('#/feedback') === 0) return await viewFeedback();
      if (hash.indexOf('#/productivity') === 0) return await viewProductivity();
      if (hash.indexOf('#/leave') === 0) return await viewLeave();
      if (hash.indexOf('#/suggestions') === 0) return await viewSuggestions();
      if (hash.indexOf('#/academy/') === 0) return await viewAcademyLesson(hash.split('/')[2]);
      if (hash.indexOf('#/academy') === 0) return await viewAcademy();
      if (hash.indexOf('#/support') === 0) return await viewSupport();
      if (hash.indexOf('#/guide') === 0) return await viewGuide();
      if (hash.indexOf('#/legal') === 0) return await viewLegal();
      return await viewDashboard();
    } catch (e) {
      if (/Not signed in/i.test(e.message)) { State.me = null; return viewAuth('login'); }
      root().innerHTML = '<div class="loading-full"><div class="empty"><span class="ic">⚠️</span>' + esc(e.message) + '<br><a href="#/" onclick="location.reload()">Reload</a></div></div>';
    }
  }

  // ---------------- boot ----------------
  async function boot() {
    try {
      const me = await api('GET', '/auth/me');
      State.me = me.user;
      await loadContent();
    } catch (e) { State.me = null; }
    window.addEventListener('hashchange', routeChanged);
    document.addEventListener('click', (e) => { const c = e.target.closest && e.target.closest('.ref-chip'); if (c) { e.preventDefault(); openSources(c.getAttribute('data-domain'), c.getAttribute('data-kw'), c.getAttribute('data-title')); } });
    routeChanged();
  }
  boot();
})();
