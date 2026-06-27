// Offsider database layer.
// Works two ways from ONE codebase:
//   • Local dev  -> SQLite file (zero setup)            when DATABASE_URL is NOT set
//   • Production -> Postgres / Supabase                  when DATABASE_URL IS set
// All queries go through an async facade (prepare().get/all/run) so the rest of the app
// is identical for both. On Postgres, Offsider lives in its own schema (default "offsider")
// so it never clashes with anything else in the database.
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const usePg = !!process.env.DATABASE_URL;
const SCHEMA = process.env.DB_SCHEMA || 'offsider';

let pool = null;
let sqlite = null;

if (usePg) {
  const pg = require('pg');
  // COUNT(*) and other bigints come back as strings by default — parse them to numbers.
  pg.types.setTypeParser(20, (v) => (v === null ? null : parseInt(v, 10)));
  pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 5,
    options: `-c search_path=${SCHEMA},public`
  });
} else {
  const Database = require('better-sqlite3');
  const dbFile = process.env.DB_PATH || path.join(__dirname, 'offsider.db');
  fs.mkdirSync(path.dirname(dbFile), { recursive: true });
  sqlite = new Database(dbFile);
  sqlite.pragma('journal_mode = WAL');
}

// Mimics better-sqlite3's prepare().get/all/run, but every method returns a Promise.
function prepare(sql) {
  if (usePg) {
    let i = 0;
    const text = sql.replace(/\?/g, () => '$' + (++i)).replace(/\bcurrent_role\b/g, '"current_role"');
    return {
      get: async (...a) => (await pool.query(text, a)).rows[0],
      all: async (...a) => (await pool.query(text, a)).rows,
      run: async (...a) => { await pool.query(text, a); return {}; }
    };
  }
  const st = sqlite.prepare(sql);
  return {
    get: async (...a) => st.get(...a),
    all: async (...a) => st.all(...a),
    run: async (...a) => { st.run(...a); return {}; }
  };
}
async function exec(sql) { if (usePg) { await pool.query(sql); } else { sqlite.exec(sql); } }

const db = { prepare, exec, usePg };

// One consolidated schema (all columns) — works on SQLite and Postgres.
const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS businesses (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, industry TEXT, region TEXT DEFAULT 'AU',
    plan TEXT DEFAULT 'trial', industry_id TEXT, created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, business_id TEXT NOT NULL, name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, role TEXT DEFAULT 'manager',
    employee_id TEXT, created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY, business_id TEXT NOT NULL, name TEXT NOT NULL, job_title TEXT,
    employment_type TEXT, start_date TEXT, status TEXT DEFAULT 'active', pathway_id TEXT,
    "current_role" TEXT, development TEXT, award_id TEXT, classification TEXT, pay_rate REAL,
    pay_basis TEXT, starter_profile TEXT, created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS cases (
    id TEXT PRIMARY KEY, business_id TEXT NOT NULL, employee_id TEXT NOT NULL, flow_id TEXT NOT NULL,
    title TEXT, sentiment TEXT, status TEXT DEFAULT 'open', current_node TEXT, state TEXT DEFAULT '{}',
    next_check_in TEXT, created_by TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY, case_id TEXT NOT NULL, business_id TEXT NOT NULL, kind TEXT NOT NULL,
    summary TEXT, detail TEXT, occurred_at TEXT, tags TEXT, created_by TEXT, created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY, case_id TEXT, business_id TEXT NOT NULL, template_id TEXT NOT NULL,
    title TEXT, fields TEXT, content TEXT, employee_id TEXT, created_by TEXT, created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS feedback_requests (
    id TEXT PRIMARY KEY, business_id TEXT NOT NULL, employee_id TEXT, template_id TEXT NOT NULL,
    audience TEXT, title TEXT, token TEXT NOT NULL UNIQUE, anonymous INTEGER DEFAULT 1,
    status TEXT DEFAULT 'open', cadence TEXT, due_date TEXT, created_by TEXT, created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS feedback_responses (
    id TEXT PRIMARY KEY, request_id TEXT NOT NULL, business_id TEXT NOT NULL, answers TEXT,
    anonymous INTEGER DEFAULT 1, submitted_by TEXT, submitted_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS lifecycle_completions (
    id TEXT PRIMARY KEY, business_id TEXT NOT NULL, employee_id TEXT NOT NULL, rule_id TEXT NOT NULL,
    occurrence_key TEXT NOT NULL, status TEXT DEFAULT 'done', created_by TEXT, created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY, business_id TEXT NOT NULL, employee_id TEXT NOT NULL, kind TEXT DEFAULT 'general',
    body TEXT NOT NULL, tags TEXT, occurred_at TEXT, created_by TEXT, created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS lessons_progress (
    id TEXT PRIMARY KEY, business_id TEXT NOT NULL, employee_id TEXT NOT NULL, lesson_id TEXT NOT NULL,
    status TEXT DEFAULT 'assigned', score REAL, answers TEXT, assigned_by TEXT, assigned_at TEXT, completed_at TEXT
  );
  CREATE TABLE IF NOT EXISTS candidates (
    id TEXT PRIMARY KEY, business_id TEXT NOT NULL, name TEXT NOT NULL, email TEXT, phone TEXT,
    role_applied TEXT, status TEXT DEFAULT 'new', token TEXT UNIQUE, resume_text TEXT,
    application TEXT, interview TEXT, offer TEXT, hired_employee_id TEXT,
    created_by TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_users_business ON users(business_id);
  CREATE INDEX IF NOT EXISTS idx_emp_business   ON employees(business_id);
  CREATE INDEX IF NOT EXISTS idx_cases_business ON cases(business_id);
  CREATE INDEX IF NOT EXISTS idx_events_case    ON events(case_id);
  CREATE INDEX IF NOT EXISTS idx_docs_case      ON documents(case_id);
  CREATE INDEX IF NOT EXISTS idx_fbreq_business ON feedback_requests(business_id);
  CREATE INDEX IF NOT EXISTS idx_fbresp_request ON feedback_responses(request_id);
  CREATE INDEX IF NOT EXISTS idx_lifecycle_emp  ON lifecycle_completions(employee_id);
  CREATE INDEX IF NOT EXISTS idx_notes_emp      ON notes(employee_id);
  CREATE INDEX IF NOT EXISTS idx_lessons_emp    ON lessons_progress(employee_id);
  CREATE INDEX IF NOT EXISTS idx_candidates_biz ON candidates(business_id);
`;

async function init() {
  if (usePg) await exec(`CREATE SCHEMA IF NOT EXISTS ${SCHEMA}`);
  await exec(SCHEMA_SQL);
}

const uid = () => crypto.randomUUID();
const now = () => new Date().toISOString();
const today = () => new Date().toISOString().slice(0, 10);

module.exports = { db, init, uid, now, today };
