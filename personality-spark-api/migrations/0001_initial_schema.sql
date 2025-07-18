-- Initial schema for Personality Spark

-- Users table (optional accounts)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_login TEXT
);

CREATE INDEX idx_users_email ON users(email);

-- User preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id TEXT PRIMARY KEY,
    preferences TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Quiz results
CREATE TABLE IF NOT EXISTS quiz_results (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    quiz_type TEXT NOT NULL,
    results TEXT NOT NULL, -- JSON
    score REAL,
    percentile INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    shared INTEGER DEFAULT 0,
    share_id TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX idx_quiz_results_created_at ON quiz_results(created_at);
CREATE INDEX idx_quiz_results_share_id ON quiz_results(share_id);

-- Saved quizzes (for registered users)
CREATE TABLE IF NOT EXISTS saved_quizzes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    quiz_data TEXT NOT NULL, -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_saved_quizzes_user_id ON saved_quizzes(user_id);

-- Share cards
CREATE TABLE IF NOT EXISTS share_cards (
    id TEXT PRIMARY KEY,
    result_id TEXT NOT NULL,
    image_url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (result_id) REFERENCES quiz_results(id) ON DELETE CASCADE
);

CREATE INDEX idx_share_cards_result_id ON share_cards(result_id);

-- Analytics events
CREATE TABLE IF NOT EXISTS analytics_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    user_id TEXT,
    session_id TEXT NOT NULL,
    properties TEXT, -- JSON
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    ip_address TEXT,
    user_agent TEXT
);

CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id);

-- Quiz analytics aggregated data
CREATE TABLE IF NOT EXISTS quiz_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_type TEXT NOT NULL,
    completion_rate REAL,
    avg_time_seconds INTEGER,
    share_rate REAL,
    completion_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    total_time INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (date('now')),
    UNIQUE(quiz_type, created_at)
);

CREATE INDEX idx_quiz_analytics_created_at ON quiz_analytics(created_at);
CREATE INDEX idx_quiz_analytics_quiz_type ON quiz_analytics(quiz_type);