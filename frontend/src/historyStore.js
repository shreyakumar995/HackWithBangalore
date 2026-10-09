const KEY = 'shieldintern.history';
const MAX = 50;

export function readHistory() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordAudit(data) {
  if (!data || data.score == null) return;
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    company_domain: data.company_domain || null,
    score: data.score,
    verdict: data.verdict || null,
    critical_flag_detected: Boolean(data.critical_flag_detected),
    created_at: new Date().toISOString(),
  };
  const next = [entry, ...readHistory()].slice(0, MAX);
  localStorage.setItem(KEY, JSON.stringify(next));
}
