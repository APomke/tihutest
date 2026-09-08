'use client';

import { ArrowUpRight, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useState } from 'react';
import type { TestResult } from '@/lib/results';

export function Gallery({ initialResults }: { initialResults: TestResult[] }) {
  const [results, setResults] = useState(initialResults);
  const [pending, setPending] = useState<string>();
  const [messages, setMessages] = useState<Record<string,string>>({});
  async function vote(id:string, value:1|-1) {
    setPending(id); setMessages((m) => ({ ...m, [id]: '' }));
    const response = await fetch('/api/results/vote', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({id,value}) });
    const data = await response.json();
    if (response.ok) setResults((items) => items.map((item) => item.id === id ? { ...item, likes:data.likes, dislikes:data.dislikes } : item));
    else setMessages((m) => ({ ...m, [id]: data.error || '投票失败，请稍后再试' }));
    setPending(undefined);
  }
  if (!results.length) return (
    <div className="empty-state"><span>01</span><h3>展厅正在布展</h3><p>管理员上传第一份 AI 生成的 HTML 测试结果后，它就会出现在这里。</p></div>
  );
  return <div className="card-grid">
    {results.map((item,index) => (
      <article className="test-card" key={item.id} style={{ '--accent': item.accent } as React.CSSProperties}>
        <a className="card-main" href={`/result/${item.id}`} aria-label={`全屏查看 ${item.model} 测试结果`}>
          <div className="card-top"><span className="rank">{String(index+1).padStart(2,'0')}</span><h3>{item.model}</h3><span className="open"><ArrowUpRight size={16}/></span></div>
          <div className="iframe-preview"><iframe src={`/api/results/html/${item.id}`} title={`${item.model} 预览`} sandbox="allow-scripts allow-forms allow-modals" tabIndex={-1}/><span className="preview-shield"/></div>
        </a>
        <div className="vote-row">
          <button disabled={pending===item.id} onClick={() => vote(item.id,1)} aria-label={`点赞 ${item.model}`}><ThumbsUp size={16}/><span>{item.likes}</span></button>
          <button disabled={pending===item.id} onClick={() => vote(item.id,-1)} aria-label={`点踩 ${item.model}`}><ThumbsDown size={16}/><span>{item.dislikes}</span></button>
          <span className={`vote-message ${messages[item.id] ? 'show':''}`}>{messages[item.id] || '社区投票'}</span>
        </div>
      </article>
    ))}
  </div>;
}
