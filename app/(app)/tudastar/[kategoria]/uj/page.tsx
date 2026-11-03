import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { tudastarUrl, type SearchParams } from '../../../../../lib/routes';
import { isKartyaTipus, kategoriaBySlug, tudastarCim, type KartyaTipus } from '../../../../../lib/tudastar-szotar';
import { getSession, requireAdmin } from '../../../../../lib/session';
import { mentKartyaAction } from '../../actions';
import { KartyaForm } from '../../components/KartyaForm';
import { Morzsa } from '../../components/Morzsa';

type Props = { params: Promise<{ kategoria: string }>; searchParams: Promise<SearchParams> };

const UJ_CIM: Record<KartyaTipus, string> = { intezmeny: 'Új intézmény', lista: 'Új lista' };

/**
 * Lapcím: „Új intézmény” / „Új lista”. Ahol a page 404-et ad – ismeretlen kategória vagy típus, nem admin
 * (`requireAdmin`; a `getSession` React.cache-ben) –, ott az alapcím.
 */
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  if ((await getSession())?.role !== 'admin') return { title: tudastarCim() };
  const { kategoria } = await params;
  const { tipus } = await searchParams;
  return { title: tudastarCim(kategoriaBySlug(kategoria) && isKartyaTipus(tipus) ? UJ_CIM[tipus] : undefined) };
}

/** Új kártya a kategóriában (`?tipus=intezmeny|lista`). Csak admin; ismeretlen kategória vagy típus: 404. */
export default async function UjKartyaPage({ params, searchParams }: Props) {
  await requireAdmin();
  const { kategoria: slug } = await params;
  const { tipus } = await searchParams;
  const kategoria = kategoriaBySlug(slug);
  if (!kategoria || !isKartyaTipus(tipus)) notFound();
  return (
    <div className="flex flex-col gap-4">
      <Morzsa
        elemek={[
          { felirat: 'TéT Tudástár', href: tudastarUrl() },
          { felirat: `${kategoria.szam}. ${kategoria.rovidCim}`, href: tudastarUrl(kategoria.slug) },
          { felirat: 'Új kártya' },
        ]}
      />
      <KartyaForm mod="uj" tipus={tipus} kategoria={kategoria.slug} action={mentKartyaAction} megseHref={tudastarUrl(kategoria.slug)} />
    </div>
  );
}
