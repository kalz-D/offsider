// Seeds a realistic demo on first run. Customised for Qualtest (geotech lab, Newcastle NSW).
// Manager login: demo@offsider.au / offsider123    Staff login: tom@qualtest.com.au / staff1234
module.exports = async function seed(ctx) {
  const { db, uid, now, today, bcrypt, flows, industries, feedbackTemplates } = ctx;
  if ((await db.prepare('SELECT COUNT(*) c FROM businesses').get()).c > 0) return;

  const off = (days) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
  const crypto = require('crypto');

  const bizId = uid();
  await db.prepare('INSERT INTO businesses (id, name, industry, region, industry_id, plan, created_at) VALUES (?,?,?,?,?,?,?)')
    .run(bizId, 'Qualtest', 'Geotechnical & Environmental Testing', 'AU', 'geotech_lab', 'crew', now());

  const ownerId = uid();
  await db.prepare('INSERT INTO users (id, business_id, name, email, password_hash, role, created_at) VALUES (?,?,?,?,?,?,?)')
    .run(ownerId, bizId, 'Steve Harrow', 'demo@offsider.au', bcrypt.hashSync('offsider123', 10), 'owner', now());

  const geo = (industries || []).find((i) => i.id === 'geotech_lab');
  const roleLevel = (rid) => { const r = geo && geo.pathway.roles.find((x) => x.id === rid); return r ? r.awardLevel : null; };

  const people = [
    { name: 'Bao Nguyen', role: 'lab_assistant_sample_prep', type: 'Full time', start: off(-32), pay: 26.0 },
    { name: 'Jess Kelner', role: 'lab_technician', type: 'Full time', start: '2023-06-01', pay: 28.5 },
    { name: 'Tom Whitfield', role: 'field_technician', type: 'Full time', start: '2021-09-15', pay: 32.5 },
    { name: 'Priya Anand', role: 'senior_technician_nata_signatory', type: 'Full time', start: '2020-03-01', pay: 34.5 },
    { name: 'Dylan Foster', role: 'lab_supervisor_team_leader', type: 'Full time', start: '2017-02-01', pay: 39.0 }
  ];
  const ids = {};
  for (const p of people) {
    const id = uid(); ids[p.name] = id;
    const role = geo ? geo.pathway.roles.find((r) => r.id === p.role) : null;
    await db.prepare('INSERT INTO employees (id, business_id, name, job_title, employment_type, start_date, status, pathway_id, current_role, award_id, classification, pay_rate, pay_basis, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
      .run(id, bizId, p.name, role ? role.title : null, p.type, p.start, 'active', 'geotech_lab', p.role, 'manufacturing', roleLevel(p.role), p.pay, 'hour', now());
  }

  // Tom is progressing C10 -> C9
  if (ids['Tom Whitfield']) {
    const dev = {
      skills: { 'field_technician:0': true, 'field_technician:1': true, 'field_technician:2': true, 'field_technician:3': true },
      goals: [{ id: 'g1', title: 'Get signed off as NATA signatory for compaction & CBR', target: off(90), done: false }]
    };
    await db.prepare('UPDATE employees SET development=? WHERE id=?').run(JSON.stringify(dev), ids['Tom Whitfield']);
    // a lesson waiting in his portal so the demo shows the training-lessons feature
    await db.prepare('INSERT INTO lessons_progress (id, business_id, employee_id, lesson_id, status, assigned_by, assigned_at) VALUES (?,?,?,?,?,?,?)').run(uid(), bizId, ids['Tom Whitfield'], 'concrete_cylinders', 'assigned', ownerId, off(-2));
  }

  // staff login for Tom
  await db.prepare('INSERT INTO users (id, business_id, name, email, password_hash, role, employee_id, created_at) VALUES (?,?,?,?,?,?,?,?)')
    .run(uid(), bizId, 'Tom Whitfield', 'tom@qualtest.com.au', bcrypt.hashSync('staff1234', 10), 'staff', ids['Tom Whitfield'], now());

  // observation notes (drive the Coach panel)
  const note = (emp, kind, body, days) => db.prepare('INSERT INTO notes (id, business_id, employee_id, kind, body, created_by, created_at) VALUES (?,?,?,?,?,?,?)')
    .run(uid(), bizId, ids[emp], kind, body, ownerId, off(days));
  await note('Tom Whitfield', 'positive', 'Smashed the nuclear densometer field testing on the Maitland job — client rang to say he was excellent.', -5);
  await note('Jess Kelner', 'interest', 'Mentioned she\'d really like to learn the concrete cylinder testing.', -14);
  await note('Bao Nguyen', 'general', 'Settling in well, keen as mustard and asking good questions.', -20);
  await note('Priya Anand', 'wellbeing', 'Seems a bit stretched lately covering all the signatory sign-offs on her own.', -8);

  const addEvent = (caseId, kind, summary, detail, when) => db.prepare('INSERT INTO events (id, case_id, business_id, kind, summary, detail, occurred_at, created_by, created_at) VALUES (?,?,?,?,?,?,?,?,?)')
    .run(uid(), caseId, bizId, kind, summary, detail || null, when, ownerId, now());

  const mkCase = async (emp, flowId, sentiment, title, startDays) => {
    const f = flows.find((x) => x.id === flowId); if (!f) return null;
    const cid = uid();
    await db.prepare('INSERT INTO cases (id, business_id, employee_id, flow_id, title, sentiment, status, current_node, state, created_by, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
      .run(cid, bizId, ids[emp], flowId, title, sentiment, 'open', f.startNode, '{}', ownerId, off(startDays), now());
    await addEvent(cid, 'system', 'Case opened: ' + f.name, null, off(startDays));
    return cid;
  };
  await mkCase('Priya Anand', 'recognition', 'positive', 'Recognition — Priya Anand', -7);
  const tomCase = await mkCase('Tom Whitfield', 'development', 'positive', 'Growth & promotion — Tom Whitfield', -12);
  if (tomCase) await addEvent(tomCase, 'note', 'Ready for the next step', 'Tom\'s across nearly everything at C10 — time to map his run at NATA signatory and a pay review.', off(-12));

  // Bao is a school leaver, mid-onboarding
  if (ids['Bao Nguyen']) {
    await db.prepare('UPDATE employees SET starter_profile=? WHERE id=?').run('school', ids['Bao Nguyen']);
    await mkCase('Bao Nguyen', 'onboarding', 'positive', 'Onboarding — Bao Nguyen', -28);
    const firstWeek = [['onboarding_day1_setup_welcome', 'd1'], ['onboarding_day3_settle_in_check', 'd3'], ['onboarding_day5_buddy_check_new', 'd5'], ['onboarding_day7_first_week_recap', 'd7'], ['onboarding_day10_extra_checkin_new', 'd10']];
    for (const rk of firstWeek) {
      await db.prepare('INSERT INTO lifecycle_completions (id, business_id, employee_id, rule_id, occurrence_key, status, created_by, created_at) VALUES (?,?,?,?,?,?,?,?)')
        .run(uid(), bizId, ids['Bao Nguyen'], rk[0], rk[1], 'done', ownerId, now());
    }
  }
  // operational error example with business-impact tags
  const opCase = await mkCase('Jess Kelner', 'operational_error', 'watchful', 'Operational error — wrong moisture result', -3);
  if (opCase) {
    await db.prepare('INSERT INTO events (id, case_id, business_id, kind, summary, detail, occurred_at, tags, created_by, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)')
      .run(uid(), opCase, bizId, 'note', 'Moisture content result sent out wrong on the Cardiff job', 'Client flagged it. On the face of it not Jess\'s fault — working back through what led to it.', off(-3), JSON.stringify(['incorrect', 'rework', 'client']), ownerId, now());
  }

  // scheduled staff check-ins + feedback
  const assign = async (templateId, employeeId, anon, cadence, days) => {
    const t = (feedbackTemplates || []).find((x) => x.id === templateId); if (!t) return null;
    const id = uid(); const token = crypto.randomBytes(7).toString('hex');
    const emp = employeeId ? await db.prepare('SELECT name FROM employees WHERE id=?').get(employeeId) : null;
    await db.prepare('INSERT INTO feedback_requests (id, business_id, employee_id, template_id, audience, title, token, anonymous, status, cadence, created_by, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
      .run(id, bizId, employeeId, t.id, t.audience, t.name + (emp ? ' — ' + emp.name : ''), token, anon ? 1 : 0, 'open', cadence || t.cadence || 'once', ownerId, off(days));
    return { id, token };
  };
  await assign('weekly_checkin', null, false, 'weekly', -2);
  await assign('monthly_suggestion', null, true, 'monthly', -10);
  await assign('training_interest', null, false, 'quarterly', -20);
  const upward = await assign('upward_feedback', null, true, 'once', -9);

  if (upward) {
    await db.prepare('INSERT INTO feedback_responses (id, request_id, business_id, answers, anonymous, submitted_by, submitted_at) VALUES (?,?,?,?,?,?,?)')
      .run(uid(), upward.id, bizId, JSON.stringify({ clear_expectations: '4', feel_supported: '5', listened_to: '4', do_more_of: 'Backing us when clients push for same-day turnaround.', do_differently: 'A bit more notice when field jobs get added last minute.' }), 1, null, off(-7));
  }

  console.log('  Seeded demo business "Qualtest" (geotech lab).');
};
