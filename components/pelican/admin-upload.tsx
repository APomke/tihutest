'use client';

import { CheckCircle2, ExternalLink, LockKeyhole, RefreshCw, Save, Trash2, UploadCloud } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type AdminResult = {
  id: string; title: string; model: string; description: string; accent: string;
  likes: number; dislikes: number; created_at: number;
};

function ResultEditor({ result, password, onChanged }:{ result:AdminResult; password:string; onChanged:()=>void }) {
  const [status,setStatus] = useState('');
  const [busy,setBusy] = useState(false);

  async function save(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setStatus('保存中…');
    const response = await fetch('/api/results/manage', { method:'PATCH', headers:{'x-admin-password':password}, body:new FormData(event.currentTarget) });
    const data = await response.json().catch(() => ({}));
    setStatus(response.ok ? '已保存' : (data.error || '保存失败'));
    setBusy(false);
    if (response.ok) onChanged();
  }

  async function remove() {
    if (!window.confirm(`确定删除“${result.model}”吗？相关投票和 HTML 文件也会一起删除。`)) return;
    setBusy(true); setStatus('删除中…');
    const response = await fetch('/api/results/manage', { method:'DELETE', headers:{'content-type':'application/json','x-admin-password':password}, body:JSON.stringify({id:result.id}) });
    const data = await response.json().catch(() => ({}));
    if (response.ok) onChanged(); else { setStatus(data.error || '删除失败'); setBusy(false); }
  }

  return <form className="result-editor" onSubmit={save}>
    <Input type="hidden" name="id" value={result.id}/>
    <div className="result-editor-head">
      <div><strong>{result.model}</strong><span>{result.likes} 赞 · {result.dislikes} 踩</span></div>
      <a href={`/result/${result.id}`} target="_blank" rel="noreferrer" aria-label="查看结果"><ExternalLink/></a>
    </div>
    <div className="admin-two"><label>展示标题<Input name="title" required maxLength={80} defaultValue={result.title}/></label><label>AI 模型<Input name="model" required maxLength={80} defaultValue={result.model}/></label></div>
    <label>一句话介绍<Textarea name="description" maxLength={240} defaultValue={result.description}/></label>
    <div className="editor-options">
      <label>强调色<Input name="accent" type="color" defaultValue={result.accent} className="color-input"/></label>
      <label className="replace-file">替换 HTML（可选）<Input name="html" type="file" accept=".html,.htm,text/html"/></label>
    </div>
    <div className="editor-actions">
      <Button type="submit" disabled={busy}><Save/>保存修改</Button>
      <Button type="button" variant="destructive" disabled={busy} onClick={remove}><Trash2/>删除</Button>
      {status && <span>{status}</span>}
    </div>
  </form>;
}

export function AdminUpload() {
  const [password,setPassword] = useState('');
  const [status,setStatus] = useState('');
  const [busy,setBusy] = useState(false);
  const [connected,setConnected] = useState(false);
  const [results,setResults] = useState<AdminResult[]>([]);

  useEffect(() => { setPassword(sessionStorage.getItem('pelican-admin-key') || ''); }, []);

  async function load(key = password) {
    if (!key) { setStatus('请先输入管理员口令'); return; }
    setBusy(true); setStatus('正在读取…');
    const response = await fetch('/api/results/manage', { headers:{'x-admin-password':key} });
    const data = await response.json().catch(() => ({}));
    if (response.ok) {
      sessionStorage.setItem('pelican-admin-key',key); setResults(data.results); setConnected(true); setStatus('');
    } else { setConnected(false); setStatus(data.error || '连接失败'); }
    setBusy(false);
  }

  async function submit(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true); setStatus('正在上传并入库…');
    const response = await fetch('/api/results/upload', { method:'POST', headers:{'x-admin-password':password}, body:new FormData(form) });
    const data = await response.json().catch(() => ({}));
    if (response.ok) { sessionStorage.setItem('pelican-admin-key',password); setStatus('发布成功'); form.reset(); await load(password); }
    else { setStatus(data.error || '上传失败，请稍后再试'); setBusy(false); }
  }

  return <div className="admin-shell">
    <div className="admin-intro"><span className="admin-icon"><LockKeyhole/></span><p>PRIVATE CONTROL ROOM</p><h1>管理测试结果</h1><span>发布新结果，也可以修改、替换或删除已经上传的内容。</span></div>
    <div className="admin-content">
      <div className="admin-access">
        <label>管理员口令<Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="输入管理员口令" autoComplete="current-password"/></label>
        <Button type="button" onClick={() => load()} disabled={busy}>{connected ? <RefreshCw/> : <LockKeyhole/>}{connected ? '刷新列表' : '进入管理'}</Button>
      </div>
      {status && <div className={`admin-status ${status.includes('成功')?'success':''}`}>{status.includes('成功') && <CheckCircle2/>}<span>{status}</span></div>}

      {connected && <>
        <section className="admin-section">
          <div className="admin-section-title"><div><span>NEW RESULT</span><h2>上传新结果</h2></div></div>
          <form className="admin-form" onSubmit={submit}>
            <div className="admin-two"><label>展示标题<Input name="title" required maxLength={80} placeholder="例如：城市里的鹈鹕"/></label><label>AI 模型<Input name="model" required maxLength={80} placeholder="例如：GPT-5.6 Luna"/></label></div>
            <label>一句话介绍（可选）<Textarea name="description" maxLength={240} placeholder="简要描述这份测试结果的特点"/></label>
            <label>卡片强调色<Input name="accent" type="color" defaultValue="#f0523d" className="color-input"/></label>
            <label className="file-drop"><UploadCloud/><strong>选择 HTML 文件</strong><span>完整单页 HTML，最大 10MB</span><Input name="html" type="file" accept=".html,.htm,text/html" required/></label>
            <Button type="submit" disabled={busy} size="lg" className="admin-submit">{busy ? '处理中…' : '发布到展厅'}</Button>
          </form>
        </section>
        <section className="admin-section manage-section">
          <div className="admin-section-title"><div><span>EXISTING RESULTS</span><h2>管理已有结果</h2></div><b>{results.length}</b></div>
          <div className="result-editor-list">{results.length ? results.map((result) => <ResultEditor key={result.id} result={result} password={password} onChanged={() => load(password)}/>) : <p className="no-results">还没有上传任何结果</p>}</div>
        </section>
      </>}
    </div>
  </div>;
}
