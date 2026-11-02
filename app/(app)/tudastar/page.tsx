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
  const q = (Array.isArray(nyers) ? nyers[0] : nyers)?.trim().slice(0, KERESES_MAX) ?? '';
  const kartyak = listKartyak();
  const talalatok = q ? keres(kartyak, q) : [];
  return (
    <div className="flex max-w-6xl flex-col gap-5">
      <div className="max-w-2xl">
        <KeresoMezo id="tudastar-kereses" q={q} />
      </div>
      {/* Állandó élő régió: a keresés címet nem vált, ezért a Next útvonal-bemondója hallgat; a page kliens-állapota
          a ?q= változásakor megmarad, így ennek a szövegváltozását a felolvasó bemondja. */}
      <p role="status" className="sr-only">
        {q ? (talalatok.length > 0 ? `${talalatok.length} találat erre: „${q}”` : `Nincs találat erre: „${q}”.`) : ''}
      </p>
      {q ? <KeresesiTalalatok q={q} talalatok={talalatok} /> : <KategoriaCsempek kartyak={kartyak} />}
    </div>
  );
}
