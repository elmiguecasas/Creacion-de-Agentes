import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

export function openDatabase(filename) {
  if (filename !== ':memory:') fs.mkdirSync(path.dirname(path.resolve(filename)),{recursive:true});
  const db = new Database(filename);
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS users(user_id TEXT PRIMARY KEY, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS modules(
      module_id TEXT NOT NULL, version INTEGER NOT NULL CHECK(version>0), user_id TEXT REFERENCES users(user_id),
      area TEXT NOT NULL, metric TEXT NOT NULL, content_json TEXT NOT NULL CHECK(json_valid(content_json)),
      sources_json TEXT NOT NULL CHECK(json_valid(sources_json)), run_id TEXT, created_at TEXT NOT NULL,
      PRIMARY KEY(module_id,version));
    CREATE TABLE IF NOT EXISTS quizzes(
      quiz_id TEXT PRIMARY KEY, module_id TEXT NOT NULL, module_version INTEGER NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(user_id), version INTEGER NOT NULL CHECK(version>0),
      quiz_json TEXT NOT NULL CHECK(json_valid(quiz_json)), run_id TEXT, created_at TEXT NOT NULL,
      FOREIGN KEY(module_id,module_version) REFERENCES modules(module_id,version));
    CREATE TABLE IF NOT EXISTS attempts(
      attempt_id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(user_id),
      quiz_id TEXT NOT NULL REFERENCES quizzes(quiz_id), answers_json TEXT NOT NULL CHECK(json_valid(answers_json)),
      results_json TEXT NOT NULL CHECK(json_valid(results_json)), score INTEGER NOT NULL CHECK(score BETWEEN 0 AND 100),
      correct_count INTEGER NOT NULL CHECK(correct_count BETWEEN 0 AND 5), created_at TEXT NOT NULL,
      UNIQUE(user_id,quiz_id));
    CREATE TABLE IF NOT EXISTS agent_runs(
      run_id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(user_id),operation TEXT NOT NULL,
      model TEXT NOT NULL,prompt_version TEXT NOT NULL,input_json TEXT NOT NULL CHECK(json_valid(input_json)),
      tool_calls_json TEXT NOT NULL CHECK(json_valid(tool_calls_json)),output_json TEXT NOT NULL CHECK(json_valid(output_json)),
      status TEXT NOT NULL,error TEXT,created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS routes(
      route_id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(user_id),
      route_json TEXT NOT NULL CHECK(json_valid(route_json)),run_id TEXT NOT NULL,created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS decisions(
      decision_id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(user_id),run_id TEXT NOT NULL REFERENCES agent_runs(run_id),
      decision TEXT NOT NULL CHECK(decision IN ('accept','reject')),created_at TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS attempts_user_time ON attempts(user_id,created_at);
  `);
  for (const table of ['modules','quizzes','attempts','routes','decisions']) {
    db.exec(`CREATE TRIGGER IF NOT EXISTS ${table}_no_update BEFORE UPDATE ON ${table} BEGIN SELECT RAISE(ABORT,'immutable evidence'); END;
      CREATE TRIGGER IF NOT EXISTS ${table}_no_delete BEFORE DELETE ON ${table} BEGIN SELECT RAISE(ABORT,'immutable evidence'); END;`);
  }
  db.exec(`CREATE TRIGGER IF NOT EXISTS runs_no_update BEFORE UPDATE ON agent_runs WHEN OLD.status != 'running' BEGIN SELECT RAISE(ABORT,'immutable evidence'); END;
    CREATE TRIGGER IF NOT EXISTS runs_no_delete BEFORE DELETE ON agent_runs BEGIN SELECT RAISE(ABORT,'immutable evidence'); END;`);
  return db;
}
