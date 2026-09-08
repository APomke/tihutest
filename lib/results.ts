import { env } from 'cloudflare:workers';

export type TestResult = { id:string; title:string; model:string; description:string; accent:string; object_key:string; likes:number; dislikes:number; created_at:number };
let schemaReady: Promise<void> | undefined;

export function ensureSchema() {
  schemaReady ??= (async () => {
    await env.DB.batch([
      env.DB.prepare(`CREATE TABLE IF NOT EXISTS results (id TEXT PRIMARY KEY, title TEXT NOT NULL, model TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', accent TEXT NOT NULL DEFAULT '#f0523d', object_key TEXT NOT NULL, likes INTEGER NOT NULL DEFAULT 0, dislikes INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL)`),
      env.DB.prepare(`CREATE TABLE IF NOT EXISTS votes (result_id TEXT NOT NULL, ip_hash TEXT NOT NULL, value INTEGER NOT NULL CHECK(value IN (-1, 1)), created_at INTEGER NOT NULL, PRIMARY KEY (result_id, ip_hash))`),
      env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_results_created_at ON results(created_at DESC)'),
    ]);
  })();
  return schemaReady;
}

export async function listResults() { await ensureSchema(); return (await env.DB.prepare('SELECT * FROM results ORDER BY likes DESC, created_at DESC').all<TestResult>()).results; }
export async function getResult(id:string) { await ensureSchema(); return env.DB.prepare('SELECT * FROM results WHERE id = ?').bind(id).first<TestResult>(); }
export function getAdminPassword() {
  const password = env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
  if (!password) throw new Error('ADMIN_PASSWORD is not configured');
  return password;
}
export function validAccent(value:string) { return /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#f0523d'; }
