import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { tudastarUrl, type SearchParams } from '../../../../../lib/routes';
import { isKartyaTipus, kategoriaBySlug } from '../../../../../lib/tudastar-szotar';
import { requireAdmin } from '../../../../../lib/session';
import { mentKartyaAction } from '../../actions';
import { KartyaForm } from '../../components/KartyaForm';
import { Morzsa } from '../../components/Morzsa';

export const metadata: Metadata = { title: 'TéT Tudástár' };

/** Új kártya a kategóriában (`?tipus=intezmeny|lista`). Csak admin; ismeretlen kategória vagy típus: 404. */
export default async function UjKartyaPage({
  params, searchParams,
}: { params: Promise<{ kategoria: string }>; searchParams: Promise<SearchParams> }) {
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
