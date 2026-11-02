import type { Metadata } from 'next';
import { listKartyak } from '../../../db/queries/tudastar';
import type { SearchParams } from '../../../lib/routes';
import { KERESES_MAX, keres } from '../../../lib/tudastar-kereses';
import { requireSession } from '../../../lib/session';
import { KategoriaCsempek } from './components/KategoriaCsempek';
import { KeresesiTalalatok } from './components/KeresesiTalalatok';
import { KeresoMezo } from './components/KeresoMezo';

export const metadata: Metadata = { title: 'TéT Tudástár' };

/** A tudástár nyitólapja: keresőmező és a 9 kategória csempéje; `?q=` esetén a keresési találatok. */
export default async function TudastarPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireSession();
  const { q: nyers } = await searchParams;
  const q = typeof nyers === 'string' ? nyers.trim().slice(0, KERESES_MAX) : '';
  const kartyak = listKartyak();
  const darabok = new Map<string, number>();
  for (const k of kartyak) darabok.set(k.kategoria, (darabok.get(k.kategoria) ?? 0) + 1);
  return (
    <div className="flex max-w-6xl flex-col gap-5">
      <div className="max-w-2xl">
        <KeresoMezo id="tudastar-kereses" q={q} />
      </div>
      {q ? <KeresesiTalalatok q={q} talalatok={keres(kartyak, q)} /> : <KategoriaCsempek darabok={darabok} />}
    </div>
  );
}
