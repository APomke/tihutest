import { env } from 'cloudflare:workers';
import { ensureSchema, getAdminPassword, validAccent } from '@/lib/results';

export async function POST(request: Request) {
  if (request.headers.get('x-admin-password') !== getAdminPassword()) return Response.json({ error: '管理员口令不正确' }, { status: 401 });
  const form = await request.formData();
  const title = String(form.get('title') || '').trim();
  const model = String(form.get('model') || '').trim();
  const description = String(form.get('description') || '').trim().slice(0, 240);
  const accent = validAccent(String(form.get('accent') || ''));
  const file = form.get('html');
  if (!title || !model || !(file instanceof File)) return Response.json({ error: '请填写标题、模型并选择 HTML 文件' }, { status: 400 });
  if (title.length > 80 || model.length > 80) return Response.json({ error: '标题或模型名称过长' }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return Response.json({ error: 'HTML 文件不能超过 10MB' }, { status: 413 });
  const html = await file.text();
  if (!/<html|<!doctype|<body/i.test(html)) return Response.json({ error: '文件看起来不是完整的 HTML 页面' }, { status: 400 });

  await ensureSchema();
  const id = crypto.randomUUID();
  const objectKey = `results/${id}.html`;
  await env.FILES.put(objectKey, html, { httpMetadata: { contentType: 'text/html; charset=utf-8' } });
  try {
    await env.DB.prepare('INSERT INTO results (id,title,model,description,accent,object_key,likes,dislikes,created_at) VALUES (?,?,?,?,?,?,0,0,?)')
      .bind(id, title, model, description, accent, objectKey, Date.now()).run();
  } catch (error) {
    await env.FILES.delete(objectKey);
    throw error;
  }
  return Response.json({ ok: true, id });
}
