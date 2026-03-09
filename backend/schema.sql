-- ═══════════════════════════════════════════════════════════════
-- VERIS  —  SQLite Schema
-- ═══════════════════════════════════════════════════════════════

PRAGMA foreign_keys = ON;   -- SQLite has FK support off by default

-- ── USERS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT    NOT NULL,
    email         TEXT    UNIQUE,
    phone         TEXT UNIQUE CHECK (length(phone) = 10 AND phone GLOB '[0-9]*'),
    password_hash TEXT    NOT NULL,
    location      TEXT,
    created_at    TEXT    DEFAULT (datetime('now'))

    -- At least one of email / phone must be set.
    -- Enforced in the API layer (SQLite CHECK with IS NOT NULL on both is awkward).
);

-- ── REPORTS ────────────────────────────────────────────────────
-- One report = one uploaded document belonging to a user.
CREATE TABLE IF NOT EXISTS reports (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title      TEXT    NOT NULL,        -- original filename
    created_at TEXT    DEFAULT (datetime('now'))
);

-- ── FILES ──────────────────────────────────────────────────────
-- Stores metadata about the physical file (bytes live on disk/S3).
CREATE TABLE IF NOT EXISTS files (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id   INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    storage_url TEXT    NOT NULL,       -- relative path or S3 key
    file_type   TEXT    NOT NULL,       -- pdf | jpg | png | txt
    file_size   INTEGER NOT NULL,       -- bytes
    uploaded_at TEXT    DEFAULT (datetime('now'))
);

-- ── ANALYSIS_RUNS ──────────────────────────────────────────────
-- Each time a report is processed, one run is created.
-- status: pending → running → completed | failed
CREATE TABLE IF NOT EXISTS analysis_runs (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id     INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    model_version TEXT    NOT NULL DEFAULT 'v1.0',
    status        TEXT    NOT NULL DEFAULT 'pending',
    started_at    TEXT    DEFAULT (datetime('now')),
    completed_at  TEXT
);

-- ── ANALYSIS_RESULTS ───────────────────────────────────────────
-- Plain-language summary produced by the NLP pipeline.
CREATE TABLE IF NOT EXISTS analysis_results (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id          INTEGER NOT NULL REFERENCES analysis_runs(id) ON DELETE CASCADE,
    impression      TEXT,
    key_findings    TEXT,
    recommendations TEXT
);

-- ── ENTITIES ───────────────────────────────────────────────────
-- Individual named entities extracted by the NER model.
-- type: diagnosis | symptom | lab | medication
CREATE TABLE IF NOT EXISTS entities (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id INTEGER NOT NULL REFERENCES analysis_runs(id) ON DELETE CASCADE,
    text   TEXT    NOT NULL,
    type   TEXT    NOT NULL
);

-- ── ANOMALIES ──────────────────────────────────────────────────
-- Lab values flagged against reference ranges.
-- severity: critical | warning | normal
CREATE TABLE IF NOT EXISTS anomalies (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id    INTEGER NOT NULL REFERENCES analysis_runs(id) ON DELETE CASCADE,
    name      TEXT    NOT NULL,
    value     REAL    NOT NULL,
    unit      TEXT,
    reference TEXT,
    severity  TEXT    NOT NULL
);

-- ── SESSIONS ───────────────────────────────────────────────
-- One row per active login. Deleting the row = instant logout.
CREATE TABLE IF NOT EXISTS sessions (
    id         TEXT    PRIMARY KEY,          -- random 64-char hex token
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT    DEFAULT (datetime('now'))
);

-- ── INDEXES ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_sessions_user  ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_user   ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_files_report   ON files(report_id);
CREATE INDEX IF NOT EXISTS idx_runs_report    ON analysis_runs(report_id);
CREATE INDEX IF NOT EXISTS idx_results_run    ON analysis_results(run_id);
CREATE INDEX IF NOT EXISTS idx_entities_run   ON entities(run_id);
CREATE INDEX IF NOT EXISTS idx_anomalies_run  ON anomalies(run_id);
CREATE INDEX IF NOT EXISTS idx_users_email    ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone    ON users(phone);
