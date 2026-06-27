// Offsider — SQLite database setup.
// File-based DB so the app runs with zero external services. Created on first run.
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const Database = require('better-sqlite3');

// DB_PATH lets a host point the database at a persistent disk (e.g. /data/offsider.db).
const dbFile = process.env.DB_PATH || path.join(__dirname, 'offsider.db');
fs.mkdirSync(path.dirname(dbFile), { recursive: true });
const db = new Database(dbFile);
db.pragma('journal_mode = WAL');

function init() {
  db.exec(`
  CREATE TABLE IF NOT EXISTS businesses (
    id         TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    industry   TEXT,
    region     TEXT DEFAULT 'AU',
    plan       TEXT DEFAULT 'trial',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id            TEXT PRIMARY KEY,
    business_id   TEXT NOT NULL,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role          TEXT DEFAULT 'manager',
    created_at    TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS employees (
    id              TEXT PRIMARY KEY,
    business_id     TEXT NOT NULL,
    name            TEXT NOT NULL,
    job_title       TEXT,
    employment_type TEXT,
    start_date      TEXT,
    status          TEXT DEFAULT 'active',
    created_at      TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS cases (
    id            TEXT PRIMARY KEY,
    business_id   TEXT NOT NULL,
    employee_id   TEXT NOT NULL,
    flow_id       TEXT NOT NULL,
    title         TEXT,
    sentiment     TEXT,
    status        TEXT DEFAULT 'open',
    current_node  TEXT,
    state         TEXT DEFAULT '{}',
    next_check_in TEXT,
    created_by    TEXT,
    created_at    TEXT NOT NULL,
    updated_at    TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS events (
    id          TEXT PRIMARY KEY,
    case_id     TEXT NOT NULL,
    business_id TEXT NOT NULL,
    kind        TEXT NOT NULL,
    summary     TEXT,
    detail      TEXT,
    occurred_at TEXT,
    created_by  TEXT,
    created_at  TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS documents (
    id          TEXT PRIMARY KEY,
    case_id     TEXT,
    business_id TEXT NOT NULL,
    template_id TEXT NOT NULL,
    title       TEXT,
    fields      TEXT,
    content     TEXT,
    created_by  TEXT,
    created_at  TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS feedback_requests (
    id           TEXT PRIMARY KEY,
    business_id  TEXT NOT NULL,
    employee_id  TEXT,
    template_id  TEXT NOT NULL,
    audience     TEXT,
    title        TEXT,
    token        TEXT NOT NULL UNIQUE,
    anonymous    INTEGER DEFAULT 1,
    status       TEXT DEFAULT 'open',
    created_by   TEXT,
    created_at   TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS feedback_responses (
    id           TEXT PRIMARY KEY,
    request_id   TEXT NOT NULL,
    business_id  TEXT NOT NULL,
    answers      TEXT,
    anonymous    INTEGER DEFAULT 1,
    submitted_by TEXT,
    submitted_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS lifecycle_completions (
    id           TEXT PRIMARY KEY,
    business_id  TEXT NOT NULL,
    employee_id  TEXT NOT NULL,
    rule_id      TEXT NOT NULL,
    occurrence_key TEXT NOT NULL,
    status       TEXT DEFAULT 'done',
    created_by   TEXT,
    created_at   TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS notes (
    id          TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    employee_id TEXT NOT NULL,
    kind        TEXT DEFAULT 'general',
    body        TEXT NOT NULL,
    created_by  TEXT,
    created_at  TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_users_business   ON users(business_id);
  CREATE INDEX IF NOT EXISTS idx_emp_business     ON employees(business_id);
  CREATE INDEX IF NOT EXISTS idx_cases_business   ON cases(business_id);
  CREATE INDEX IF NOT EXISTS idx_events_case      ON events(case_id);
  CREATE INDEX IF NOT EXISTS idx_docs_case        ON documents(case_id);
  CREATE INDEX IF NOT EXISTS idx_fbreq_business   ON feedback_requests(business_id);
  CREATE INDEX IF NOT EXISTS idx_fbresp_request   ON feedback_responses(request_id);
  CREATE INDEX IF NOT EXISTS idx_lifecycle_emp    ON lifecycle_completions(employee_id);
  CREATE INDEX IF NOT EXISTS idx_notes_emp        ON notes(employee_id);
  `);
  migrate();
}

function hasColumn(table, col) {
  return db.prepare(`PRAGMA table_info(${table})`).all().some((c) => c.name === col);
}
function addCol(table, col, def) {
  if (!hasColumn(table, col)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
}
function migrate() {
  addCol('businesses', 'industry_id', 'TEXT');
  addCol('employees', 'pathway_id', 'TEXT');
  addCol('employees', 'current_role', 'TEXT');
  addCol('employees', 'development', 'TEXT');
  addCol('documents', 'employee_id', 'TEXT');
  // staff logins + award/pay
  addCol('users', 'employee_id', 'TEXT');
  addCol('employees', 'award_id', 'TEXT');
  addCol('employees', 'classification', 'TEXT');
  addCol('employees', 'pay_rate', 'REAL');
  addCol('employees', 'pay_basis', 'TEXT');
  // scheduled check-ins
  addCol('feedback_requests', 'cadence', 'TEXT');
  addCol('feedback_requests', 'due_date', 'TEXT');
  // onboarding starter profile + business-impact tags on timeline events
  addCol('employees', 'starter_profile', 'TEXT');
  addCol('events', 'tags', 'TEXT');
  // quick notes: impact tags + back-dating
  addCol('notes', 'tags', 'TEXT');
  addCol('notes', 'occurred_at', 'TEXT');
}

const uid = () => crypto.randomUUID();
const now = () => new Date().toISOString();
const today = () => new Date().toISOString().slice(0, 10);

module.exports = { db, init, uid, now, today };
