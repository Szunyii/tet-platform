import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { listKartyak } from '../../../../../../db/queries/tudastar';
import { kartyaUrl, tudastarUrl } from '../../../../../../lib/routes';
import { kategoriaBySlug, tudastarCim } from '../../../../../../lib/tudastar-szotar';
import { getSession, requireAdmin } from '../../../../../../lib/session';
import { deleteKartyaAction, mentKartyaAction } from '../../../actions';
import { KartyaForm } from '../../../components/KartyaForm';
import { Morzsa } from '../../../components/Morzsa';

type Props = { params: Promise<{ kategoria: string; slug: string }> };

/**
 * Lapcím: „Szerkesztés: <rövidítés vagy név>”, a page-dzsel azonos keresés (a `listKartyak` és a `getSession`
 * React.cache-ben). Ahol a page 404-et ad – nem admin is (`requireAdmin`) –, ott az alapcím, hogy a cím se árulja
 * el az oldal létét.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if ((await getSession())?.role !== 'admin') return { title: tudastarCim() };
  const { kategoria, slug } = await params;
  const kartya = listKartyak().find((k) => k.kategoria === kategoria && k.slug === slug);
  return { title: tudastarCim(kartya ? `Szerkesztés: ${kartya.rovidites ?? kartya.nev}` : undefined) };
}

/** Meglévő kártya szerkesztője (mindkét típus). Csak admin; ismeretlen vagy más kategóriájú kártya: 404. */
export default async function KartyaSzerkesztesPage({ params }: Props) {
  await requireAdmin();
  const { kategoria: kategoriaSlug, slug } = await params;
  const kategoria = kategoriaBySlug(kategoriaSlug);
  if (!kategoria) notFound();
  const kartya = listKartyak().find((k) => k.kategoria === kategoria.slug && k.slug === slug);
  if (!kartya) notFound();
  return (
    <div className="flex flex-col gap-4">
      <Morzsa
        elemek={[
          { felirat: 'TéT Tudástár', href: tudastarUrl() },
          { felirat: `${kategoria.szam}. ${kategoria.rovidCim}`, href: tudastarUrl(kategoria.slug) },
          { felirat: kartya.rovidites ?? kartya.nev, href: kartyaUrl(kartya) },
          { felirat: 'Szerkesztés' },
        ]}
      />
      <KartyaForm
        mod="szerkesztes"
        kartya={kartya}
        action={mentKartyaAction}
        torlesAction={deleteKartyaAction.bind(null, kartya.id)}
        megseHref={kartyaUrl(kartya)}
      />
    </div>
  );
}
