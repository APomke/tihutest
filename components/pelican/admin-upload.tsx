'use client';

import { CheckCircle2, LockKeyhole, UploadCloud } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function AdminUpload() {
  const [password,setPassword] = useState('');
  const [status,setStatus] = useState('');
  const [busy,setBusy] = useState(false);
  const [createdId,setCreatedId] = useState('');
  useEffect(() => { setPassword(sessionStorage.getItem('pelican-admin-key') || ''); }, []);
  async function submit(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setStatus('正在上传并入库…'); setCreatedId('');
    const response = await fetch('/api/results/upload', { method:'POST', headers:{'x-admin-password':password}, body:new FormData(event.currentTarget) });
    const data = await response.json().catch(() => ({}));
    if (response.ok) { sessionStorage.setItem('pelican-admin-key',password); setCreatedId(data.id); setStatus('发布成功'); event.currentTarget.reset(); }
    else setStatus(data.error || '上传失败，请稍后再试');
    setBusy(false);
  }
  return <div className="admin-shell">
    <div className="admin-intro"><span className="admin-icon"><LockKeyhole/></span><p>PRIVATE CONTROL ROOM</p><h1>发布测试结果</h1><span>上传其他 AI 生成的完整 HTML 文件。发布后会立即出现在首页，并启用独立投票。</span></div>
    <form className="admin-form" onSubmit={submit}>
      <label>管理员口令<Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="输入管理员口令" autoComplete="current-password"/></label>
      <div className="admin-two"><label>展示标题<Input name="title" required maxLength={80} placeholder="例如：城市里的鹈鹕"/></label><label>AI 模型<Input name="model" required maxLength={80} placeholder="例如：GPT-5.6 Luna"/></label></div>
      <label>一句话介绍（可选）<Textarea name="description" maxLength={240} placeholder="简要描述这份测试结果的特点"/></label>
      <label>卡片强调色<Input name="accent" type="color" defaultValue="#f0523d" className="color-input"/></label>
      <label className="file-drop"><UploadCloud/><strong>选择 HTML 文件</strong><span>完整单页 HTML，最大 10MB</span><Input name="html" type="file" accept=".html,.htm,text/html" required/></label>
      <Button type="submit" disabled={busy} size="lg" className="admin-submit">{busy ? '发布中…' : '发布到展厅'}</Button>
      {status && <div className={`admin-status ${createdId?'success':''}`}>{createdId && <CheckCircle2/>}<span>{status}</span>{createdId && <a href={`/result/${createdId}`}>查看结果</a>}</div>}
    </form>
  </div>;
}
