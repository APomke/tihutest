'use client';

import { ArrowLeft, Maximize2 } from 'lucide-react';
import { useRef } from 'react';

export function Viewer({ id, model, title }:{id:string;model:string;title:string}) {
  const frameWrap = useRef<HTMLDivElement>(null);
  return <main className="viewer-page">
    <header className="viewer-bar"><a href="/" aria-label="返回首页"><ArrowLeft/>返回展厅</a><div><strong>{model}</strong><span>{title}</span></div><button onClick={() => frameWrap.current?.requestFullscreen()}><Maximize2/><span>全屏</span></button></header>
    <div className="viewer-frame" ref={frameWrap}><iframe src={`/api/results/html/${id}`} title={`${model}：${title}`} sandbox="allow-scripts allow-forms allow-modals"/></div>
  </main>;
}
