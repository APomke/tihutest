import { env } from 'cloudflare:workers';
import { getAdminPassword, getResult, listResults, validAccent } from '@/lib/results';

function authorized(request: Request) {
  return request.headers.get('x-admin-password') === getAdminPassword();
}

function unauthorized() {
  return Response.json({ error: '管理员口令不正确' }, { status: 401 });
}

export async function GET(request: Request) {
  if (!authorized(request)) return unauthorized();
  return Response.json({ results: await listResults() });
}

export async function PATCH(request: Request) {
  if (!authorized(request)) return unauthorized();
  const form = await request.formData();
  const id = String(form.get('id') || '');
  const title = String(form.get('title') || '').trim();
  const model = String(form.get('model') || '').trim();
  const description = String(form.get('description') || '').trim().slice(0, 240);
  const accent = validAccent(String(form.get('accent') || ''));
  const file = form.get('html');

  if (!id || !title || !model) return Response.json({ error: '标题和模型名称不能为空' }, { status: 400 });
  if (title.length > 80 || model.length > 80) return Response.json({ error: '标题或模型名称过长' }, { status: 400 });
  const current = await getResult(id);
  if (!current) return Response.json({ error: '测试结果不存在' }, { status: 404 });

  let nextObjectKey = current.object_key;
  let uploadedNewFile = false;
  if (file instanceof File && file.size > 0) {
    if (file.size > 10 * 1024 * 1024) return Response.json({ error: 'HTML 文件不能超过 10MB' }, { status: 413 });
    const html = await file.text();
    if (!/<html|<!doctype|<body/i.test(html)) return Response.json({ error: '文件看起来不是完整的 HTML 页面' }, { status: 400 });
    nextObjectKey = `results/${id}-${crypto.randomUUID()}.html`;
    await env.FILES.put(nextObjectKey, html, { httpMetadata: { contentType: 'text/html; charset=utf-8' } });
    uploadedNewFile = true;
  }

  try {
    await env.DB.prepare('UPDATE results SET title = ?, model = ?, description = ?, accent = ?, object_key = ? WHERE id = ?')
      .bind(title, model, description, accent, nextObjectKey, id).run();
  } catch (error) {
    if (uploadedNewFile) await env.FILES.delete(nextObjectKey);
    throw error;
  }
  if (uploadedNewFile) await env.FILES.delete(current.object_key);
  return Response.json({ ok: true, result: await getResult(id) });
}

export async function DELETE(request: Request) {
  if (!authorized(request)) return unauthorized();
  const body = await request.json().catch(() => null) as { id?: string } | null;
  if (!body?.id) return Response.json({ error: '缺少结果 ID' }, { status: 400 });
  const current = await getResult(body.id);
  if (!current) return Response.json({ error: '测试结果不存在' }, { status: 404 });
  await env.DB.batch([
    env.DB.prepare('DELETE FROM votes WHERE result_id = ?').bind(body.id),
    env.DB.prepare('DELETE FROM results WHERE id = ?').bind(body.id),
  ]);
  await env.FILES.delete(current.object_key);
  return Response.json({ ok: true });
}
