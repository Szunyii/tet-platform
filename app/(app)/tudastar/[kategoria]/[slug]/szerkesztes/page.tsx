import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { listKartyak } from '../../../../../../db/queries/tudastar';
import { kartyaUrl, tudastarUrl } from '../../../../../../lib/routes';
import { kategoriaBySlug } from '../../../../../../lib/tudastar-szotar';
import { requireAdmin } from '../../../../../../lib/session';
import { deleteKartyaAction, mentKartyaAction } from '../../../actions';
import { KartyaForm } from '../../../components/KartyaForm';
import { Morzsa } from '../../../components/Morzsa';

export const metadata: Metadata = { title: 'TéT Tudástár' };

/** Meglévő kártya szerkesztője (mindkét típus). Csak admin; ismeretlen vagy más kategóriájú kártya: 404. */
export default async function KartyaSzerkesztesPage({ params }: { params: Promise<{ kategoria: string; slug: string }> }) {
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
          { felirat: `${kartya.rovidites ?? kartya.nev} szerkesztése` },
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
