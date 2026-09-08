import { env } from 'cloudflare:workers';
import { getResult } from '@/lib/results';

export async function GET(_request:Request, { params }: { params: Promise<{ id:string }> }) {
  const { id } = await params;
  const result = await getResult(id);
  if (!result) return new Response('Not found', { status: 404 });
  const object = await env.FILES.get(result.object_key);
  if (!object) return new Response('File not found', { status: 404 });
  return new Response(object.body, { headers: {
    'content-type': 'text/html; charset=utf-8',
    'content-security-policy': "sandbox allow-scripts allow-forms allow-modals; default-src 'self' data: blob: https:; script-src 'unsafe-inline' 'unsafe-eval' data: blob: https:; style-src 'unsafe-inline' https:; img-src data: blob: https:; media-src data: blob: https:; connect-src https:; form-action 'none';",
    'x-content-type-options': 'nosniff',
    'cache-control': 'no-store',
  }});
}
