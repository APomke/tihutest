import type { Metadata } from 'next';
import { AdminUpload } from '@/components/pelican/admin-upload';

export const metadata: Metadata = { title:'管理后台 · 鹈鹕测试馆', robots:{ index:false, follow:false } };
export default function AdminPage() { return <main className="admin-page"><AdminUpload/></main>; }
