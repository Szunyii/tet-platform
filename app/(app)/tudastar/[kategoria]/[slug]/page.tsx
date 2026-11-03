import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { listKartyak } from '../../../../../db/queries/tudastar';
import { tudastarUrl } from '../../../../../lib/routes';
import { canEditTudastar } from '../../../../../lib/tudastar-jog';
import { kategoriaBySlug, tudastarCim } from '../../../../../lib/tudastar-szotar';
import { requireSession } from '../../../../../lib/session';
import { IntezmenyReszlet } from '../../components/IntezmenyReszlet';
import { Morzsa } from '../../components/Morzsa';
import { TudastarElrendezes } from '../../components/TudastarElrendezes';

type Props = { params: Promise<{ kategoria: string; slug: string }> };

/**
 * Lapcím: a kártya rövidítése vagy neve, a page-dzsel azonos keresés (a `listKartyak` React.cache-ben: egy kérésen
 * belül egy lekérdezés). Ahol a page 404-et ad, ott az alapcím.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kategoria, slug } = await params;
  const kartya = listKartyak().find((k) => k.kategoria === kategoria && k.slug === slug);
  return { title: tudastarCim(kartya?.tipus === 'intezmeny' ? kartya.rovidites ?? kartya.nev : undefined) };
}

/**
 * Egy intézmény részletoldala. 404: ismeretlen kategória vagy slug, a slug más kategóriáé, vagy a kártya
 * lista (annak nincs részletoldala).
 */
export default async function IntezmenyPage({ params }: Props) {
  const session = await requireSession();
  const { kategoria: kategoriaSlug, slug } = await params;
  const kategoria = kategoriaBySlug(kategoriaSlug);
  if (!kategoria) notFound();
  const kartyak = listKartyak().filter((k) => k.kategoria === kategoria.slug);
  const kartya = kartyak.find((k) => k.slug === slug);
  if (!kartya || kartya.tipus !== 'intezmeny') notFound();
  return (
    <TudastarElrendezes aktivKategoria={kategoria.slug} kartyak={kartyak} aktivSlug={kartya.slug}>
      <Morzsa
        elemek={[
          { felirat: 'TéT Tudástár', href: tudastarUrl() },
          { felirat: `${kategoria.szam}. ${kategoria.rovidCim}`, href: tudastarUrl(kategoria.slug) },
          { felirat: kartya.rovidites ?? kartya.nev },
        ]}
      />
      <IntezmenyReszlet kartya={kartya} szerkeszthet={canEditTudastar(session)} />
    </TudastarElrendezes>
  );
}
