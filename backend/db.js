const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'submissions.db'));

// Create the table if it doesn't exist yet
db.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_domain TEXT,
    score INTEGER NOT NULL,
    verdict TEXT NOT NULL,
    critical_flag_detected INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

// Save a new analysis result
function saveSubmission({ companyDomain, score, verdict, criticalFlagDetected }) {
  const stmt = db.prepare(`
    INSERT INTO submissions (company_domain, score, verdict, critical_flag_detected)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(companyDomain || null, score, verdict, criticalFlagDetected ? 1 : 0);
}

// Look up prior submissions for the same company domain, excluding the one just inserted
function getPriorSubmissions(companyDomain) {
  if (!companyDomain) return [];
  const stmt = db.prepare(`
    SELECT score, verdict, critical_flag_detected, created_at
    FROM submissions
    WHERE company_domain = ?
    ORDER BY created_at DESC
  `);
  return stmt.all(companyDomain);
}

module.exports = { saveSubmission, getPriorSubmissions };