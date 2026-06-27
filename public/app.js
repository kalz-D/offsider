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
      item('team', '#/team', '👷', 'Workers') +
      item('onboarding', '#/onboarding', '👋', 'Onboarding') +
      item('cases', '#/cases', '🗂️', 'Cases') +
      item('docs', '#/documents', '📄', 'Documents') +
      '<div class="nav-group-label">Develop</div>' +
      item('career', '#/career', '🚀', 'Career paths') +
      item('feedback', '#/feedback', '💬', 'Feedback') +
      '<div class="nav-group-label">Learn</div>' +
      item('guide', '#/guide', '⚖️', 'Fair Work guide') +
      '<div class="sidebar-foot"><div class="biz">' + esc(b.name) + '</div>' +
      '<div>' + esc(State.me.name) + ' · <a href="#" id="logout">Log out</a></div></div>' +
      '</aside>' +
      '<main class="main">' +
      '<div class="topbar"><div><button class="menu-btn" id="menuBtn">☰</button> ' +
      '<h2 style="display:inline-block;margin-left:.4rem">' + esc(title) + '</h2>' +
      (crumbs ? '<div class="crumbs">' + crumbs + '</div>' : '') + '</div>' +
      '<div style="display:flex;gap:.5rem"><button class="btn btn-ghost btn-sm" id="quickNoteBtn">✎ Quick note</button><a href="#/new" class="btn btn-primary btn-sm">+ Start something</a></div></div>' +
      '<div class="content" id="view">' + content + '</div>' +
      '</main></div>';
    $('#logout').onclick = async (e) => { e.preventDefault(); await api('POST', '/auth/logout'); State.me = null; location.hash = '#login'; routeChanged(); };
    const mb = $('#menuBtn'); if (mb) mb.onclick = () => $('#sidebar').classList.toggle('open');
    const qn = $('#quickNoteBtn'); if (qn) qn.onclick = () => openQuickNote();
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
  async function viewDashboard() {
    const [d, coach, upcoming] = await Promise.all([api('GET', '/dashboard'), api('GET', '/coach'), api('GET', '/lifecycle')]);
    const s = d.stats;
    const coachPanel = (coach.nudges && coach.nudges.length)
      ? '<div class="section-title"><h3>🧠 Your coach reckons…</h3></div>' +
        (coach.tips && coach.tips.length ? '<div class="coach-tip" style="margin-bottom:.7rem">💡 ' + esc(coach.tips[Math.floor(Math.random() * coach.tips.length)]) + '</div>' : '') +
        coach.nudges.map((n) => '<div class="coach-card tone-' + n.tone + '"><div class="grow"><div class="ct">' + esc(n.title) + (n.employee_name ? ' · ' + esc(n.employee_name) : '') + '</div><div class="cp">' + esc(n.prompt) + '</div>' + (n.extra ? '<div class="muted" style="font-size:.82rem;margin-top:.2rem">“' + esc(n.extra) + '”</div>' : '') + '</div>' + (n.employee_id ? '<a href="#/member/' + n.employee_id + '" class="btn btn-ghost btn-sm">' + esc(n.action || 'Open') + '</a>' : '') + '</div>').join('')
      : '';
    const kpis =
      '<div class="kpi-row">' +
      '<div class="kpi"><div class="n">' + s.employees + '</div><div class="l">Workers</div></div>' +
      '<div class="kpi"><div class="n">' + s.openCases + '</div><div class="l">Open cases</div></div>' +
      '<div class="kpi dev"><div class="n">' + (s.inDevelopment || 0) + '</div><div class="l">On a career path</div></div>' +
      '<div class="kpi pos"><div class="n">' + s.positive + '</div><div class="l">Good-news cases</div></div>' +
      '<div class="kpi watch"><div class="n">' + s.watch + '</div><div class="l">Needs attention</div></div>' +
      '<div class="kpi"><div class="n">' + (s.feedbackResponses || 0) + '</div><div class="l">Feedback replies</div></div>' +
      '</div>';
    const banner = d.industrySet ? '' :
      '<div class="banner"><span style="font-size:1.6rem">🚀</span><div class="grow"><strong>Unlock career paths</strong><div class="muted" style="font-size:.9rem">Pick your industry and Offsider loads role ladders and the steps your crew can take to build a career.</div></div><a href="#/career" class="btn btn-primary btn-sm">Pick your industry</a></div>';

    const attention = d.attention.length
      ? '<div class="row-list">' + d.attention.map((c) =>
        '<a href="#/case/' + c.id + '" class="row attention-card ' + sent(c.sentiment).cls + '">' +
        '<span class="ic-circle">' + (c.flow_icon || '🔔') + '</span>' +
        '<span class="grow"><span class="t">' + esc(c.title) + '</span><span class="s">' + esc(c.flow_name) + ' · ' + esc(c.employee_name || '') + '</span></span>' +
        '<span class="meta"><span class="badge badge-watchful">' + esc(c.reason) + '</span></span></a>').join('') + '</div>'
      : '<div class="card card-pad muted">Nothing needs chasing right now. Nice and tidy. 👌</div>';

    const recent = d.recent.length
      ? '<div class="row-list">' + d.recent.map((c) =>
        '<a href="#/case/' + c.id + '" class="row ' + sent(c.sentiment).cls + '">' +
        '<span class="ic-circle">' + (c.flow_icon || '🗂️') + '</span>' +
        '<span class="grow"><span class="t">' + esc(c.title) + '</span><span class="s">' + esc(c.employee_name || '') + '</span></span>' +
        '<span class="meta"><span class="badge">' + (STATUS[c.status] || c.status) + '</span><br><span class="muted">' + fmtDate(c.updated_at) + '</span></span></a>').join('') + '</div>'
      : '<div class="empty"><span class="ic">🗂️</span>No cases yet. <a href="#/new">Start something</a> when a situation comes up.</div>';

    const comingPanel = (upcoming && upcoming.length)
      ? '<div class="section-title"><h3>📅 Coming up</h3></div><div class="row-list">' + upcoming.map((m) => '<a href="#/member/' + m.employee_id + '" class="row"><span class="ic-circle">' + (m.daysUntil < 0 ? '⏰' : '📅') + '</span><span class="grow"><span class="t">' + esc(m.title.replace(/\{name\}/g, (m.employee_name || '').split(' ')[0])) + '</span><span class="s">' + esc(m.employee_name) + '</span></span><span class="meta"><span class="badge ' + (m.daysUntil < 0 ? 'badge-watchful' : '') + '">' + relativeDue(m.daysUntil) + '</span></span></a>').join('') + '</div>'
      : '';
    const content = banner + kpis + coachPanel + comingPanel +
      '<div class="section-title"><h3>Needs your attention</h3></div>' + attention +
      '<div class="section-title"><h3>Recent activity</h3><a href="#/cases" class="btn btn-ghost btn-sm">See all</a></div>' + recent;
    layout('home', 'G\'day, ' + State.me.name.split(' ')[0], content);
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

  async function viewMember(id) {
    const e = await api('GET', '/employees/' + id);
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
      '<div class="section-title" style="margin-top:1.8rem"><h3>💰 Pay & progression</h3></div>' + wagePanel +
      '<div class="section-title" style="margin-top:1.8rem"><h3>🚀 Development</h3></div>' + devPanel +
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
      '<div class="section-title"><h3>' + esc(co.fairProcessTitle || 'What a fair process looks like') + '</h3></div>' +
      '<div class="grid" style="gap:1.2rem">' + fp + '</div>' +
      (co.smallBusinessCode ? '<div class="panel section-ink" style="margin-top:1.6rem;background:var(--brand);color:#eaf1f6"><h3 style="color:#fff">Small Business Fair Dismissal Code</h3><p style="margin:0;color:#cfe0ea">' + esc(co.smallBusinessCode) + '</p></div>' : '') +
      '<div class="section-title" style="margin-top:1.8rem"><h3>Going up the ladder</h3></div>' + ladder +
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
    const [pack, employees] = await Promise.all([api('GET', '/industries/' + bizIndustryId), api('GET', '/employees')]);
    const roles = (pack.pathway.roles || []).slice().sort((a, b) => a.level - b.level);
    let award = null; if (pack.awardId) { try { award = await getAward(pack.awardId); } catch (x) { award = null; } }
    const levelInfo = (code) => (award && code) ? (award.levels.find((l) => l.id === code) || null) : null;
    const ladder = roles.slice().reverse().map((r) => {
      const here = employees.filter((e) => e.current_role === r.id);
      const lvl = levelInfo(r.awardLevel);
      return '<div class="rung"><span class="lvl">' + r.level + '</span><div class="grow"><div class="rtitle">' + esc(r.title) + (lvl ? ' <span class="badge">' + esc(lvl.id) + ' · ~' + money(lvl.hourly) + '/hr</span>' : '') + '</div><div class="rsummary">' + esc(r.summary) + '</div>' +
        (here.length ? '<div style="margin-top:.5rem">' + here.map((e) => '<a href="#/member/' + e.id + '" class="ticket-chip" style="background:var(--brand-50);color:var(--brand-700);border-color:transparent">👷 ' + esc(e.name) + '</a>').join('') + '</div>' : '') +
        ((r.stepsToNext && r.stepsToNext.length) ? '<div style="margin-top:.6rem;font-size:.82rem;color:var(--ink-faint)">Next: ' + r.stepsToNext.slice(0, 3).map((s) => esc(s.label)).join(' · ') + '</div>' : '') +
        '</div></div>';
    }).join('');
    const tickets = (pack.tickets || []).map((t) => '<div class="card card-pad" style="margin-bottom:.5rem"><strong>' + esc(t.name) + '</strong>' + (t.note ? '<div class="muted" style="font-size:.88rem;margin-top:.2rem">' + esc(t.note) + '</div>' : '') + '</div>').join('');
    layout('career', 'Career paths',
      '<div class="banner" style="background:var(--brand-50);border-color:transparent"><span style="font-size:1.6rem">' + pack.icon + '</span><div class="grow"><strong>' + esc(pack.name) + ' — ' + esc(pack.pathway.name) + '</strong><div class="muted" style="font-size:.9rem">' + esc(pack.blurb) + '</div></div><button class="btn btn-ghost btn-sm" id="changeInd">Change</button></div>' +
      '<div class="grid grid-2" style="align-items:start"><div><div class="section-title"><h3>The ladder</h3></div><div class="ladder">' + ladder + '</div></div>' +
      '<div><div class="section-title"><h3>🎫 Tickets to chase</h3></div>' + (tickets || '<div class="muted">—</div>') + '</div></div>');
    const ci = $('#changeInd');
    if (ci) ci.onclick = async () => { await api('PATCH', '/business', { industry_id: null }); State.me.business.industry_id = null; viewCareer(); };
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

  // ---------------- STAFF portal ----------------
  function staffLayout(content) {
    root().innerHTML =
      '<div class="staff-wrap">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.4rem">' +
      '<a href="#/" class="logo">' + LOGO + 'Offsider</a>' +
      '<div style="text-align:right"><div style="font-weight:700">' + esc(State.me.name) + '</div><div class="muted" style="font-size:.85rem">' + esc(State.me.business.name) + ' · <a href="#" id="logout">Log out</a></div></div></div>' +
      '<div id="view">' + content + '</div></div>';
    $('#logout').onclick = async (e) => { e.preventDefault(); await api('POST', '/auth/logout'); State.me = null; location.hash = '#login'; routeChanged(); };
  }

  async function viewStaffHome() {
    const [me, assignments] = await Promise.all([api('GET', '/me'), api('GET', '/me/assignments')]);
    const pending = assignments.filter((a) => !a.completed);
    const done = assignments.filter((a) => a.completed);
    const checkins = pending.length
      ? '<div class="row-list">' + pending.map((a) => '<a href="#/checkin/' + a.id + '" class="row"><span class="ic-circle">' + (a.anonymous ? '🔒' : '📝') + '</span><span class="grow"><span class="t">' + esc(a.title) + '</span><span class="s">' + cadenceLabel(a.cadence) + (a.anonymous ? ' · anonymous' : '') + '</span></span><span class="meta">Fill in →</span></a>').join('') + '</div>'
      : '<div class="card card-pad muted">All done — nothing to fill in right now. 👍</div>';

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
      '<h1 style="font-size:1.8rem;margin-bottom:.2rem">G\'day, ' + esc(State.me.name.split(' ')[0]) + '</h1>' +
      '<p class="muted">Anything the team needs from you is below — most take a minute.</p>' +
      '<div class="section-title"><h3>📋 Your check-ins</h3>' + (done.length ? '<span class="muted" style="font-size:.85rem">' + done.length + ' done this period</span>' : '') + '</div>' + checkins +
      (pathCard ? '<div class="section-title" style="margin-top:1.8rem"><h3>Your career & pay</h3></div>' + pathCard : ''));
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

  // ---------------- router ----------------
  async function routeChanged() {
    const hash = location.hash || '#/';
    try {
      if (!State.me) {
        return viewAuth(hash.indexOf('signup') >= 0 ? 'signup' : 'login');
      }
      if (State.me.role === 'staff') {
        if (hash.indexOf('#/checkin/') === 0) return await viewStaffCheckin(hash.split('/')[2]);
        return await viewStaffHome();
      }
      if (hash.indexOf('#/case/') === 0) return await viewCase(hash.split('/')[2]);
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
      if (hash.indexOf('#/guide') === 0) return await viewGuide();
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
    routeChanged();
  }
  boot();
})();
