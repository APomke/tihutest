import { env } from 'cloudflare:workers';
import { ensureSchema, getResult } from '@/lib/results';

async function hashIp(ip:string) {
  const bytes = new TextEncoder().encode(`pelican-vote-2026:${ip}`);
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map((n) => n.toString(16).padStart(2,'0')).join('');
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { id?:string; value?:number } | null;
  if (!body?.id || (body.value !== 1 && body.value !== -1)) return Response.json({ error: '无效的投票' }, { status: 400 });
  await ensureSchema();
  if (!(await getResult(body.id))) return Response.json({ error: '测试结果不存在' }, { status: 404 });
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const result = await env.DB.prepare('INSERT OR IGNORE INTO votes (result_id,ip_hash,value,created_at) VALUES (?,?,?,?)')
    .bind(body.id, await hashIp(ip), body.value, Date.now()).run();
  if (!result.meta.changes) return Response.json({ error: '这个 IP 已经为该结果投过票了', alreadyVoted: true }, { status: 409 });
  const column = body.value === 1 ? 'likes' : 'dislikes';
  await env.DB.prepare(`UPDATE results SET ${column} = ${column} + 1 WHERE id = ?`).bind(body.id).run();
  const updated = await getResult(body.id);
  return Response.json({ ok: true, likes: updated?.likes, dislikes: updated?.dislikes });
}
