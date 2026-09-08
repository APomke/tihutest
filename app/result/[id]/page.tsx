import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Viewer } from '@/components/pelican/viewer';
import { getResult } from '@/lib/results';

export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }:{params:Promise<{id:string}>}):Promise<Metadata> {
  const {id}=await params; const result=await getResult(id);
  if (!result) return { title:'结果不存在 · 鹈鹕测试馆', openGraph:{images:[]}, twitter:{images:[]} };
  const description=result.description || `查看 ${result.model} 的鹈鹕测试结果`;
  return { title:`${result.model} · ${result.title}`, description, openGraph:{title:`${result.model} · ${result.title}`,description,images:[]}, twitter:{title:`${result.model} · ${result.title}`,description,images:[]} };
}
export default async function ResultPage({params}:{params:Promise<{id:string}>}) { const {id}=await params; const result=await getResult(id); if(!result) notFound(); return <Viewer id={id} model={result.model} title={result.title}/>; }
