import { Gallery } from '@/components/pelican/gallery';
import { listResults } from '@/lib/results';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const results = await listResults();
  return <main className="pure-page">
    <section className="pure-gallery" aria-label="鹈鹕测试结果">
      <Gallery initialResults={results}/>
    </section>
  </main>;
}
