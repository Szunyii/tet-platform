import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { listKartyak } from '../../../../../db/queries/tudastar';
import { canEditTudastar } from '../../../../../lib/tudastar-jog';
import { kategoriaBySlug } from '../../../../../lib/tudastar-szotar';
import { requireSession } from '../../../../../lib/session';
import { IntezmenyReszlet } from '../../components/IntezmenyReszlet';
import { TudastarElrendezes } from '../../components/TudastarElrendezes';

export const metadata: Metadata = { title: 'TéT Tudástár' };

/**
 * Egy intézmény részletoldala. 404: ismeretlen kategória vagy slug, a slug más kategóriáé, vagy a kártya
 * lista (annak nincs részletoldala).
 */
export default async function IntezmenyPage({ params }: { params: Promise<{ kategoria: string; slug: string }> }) {
  const session = await requireSession();
  const { kategoria: kategoriaSlug, slug } = await params;
  const kategoria = kategoriaBySlug(kategoriaSlug);
  if (!kategoria) notFound();
  const kartyak = listKartyak().filter((k) => k.kategoria === kategoria.slug);
  const kartya = kartyak.find((k) => k.slug === slug);
  if (!kartya || kartya.tipus !== 'intezmeny') notFound();
  return (
    <TudastarElrendezes aktivKategoria={kategoria.slug} kartyak={kartyak} aktivSlug={kartya.slug}>
      <IntezmenyReszlet kartya={kartya} kategoria={kategoria} szerkeszthet={canEditTudastar(session)} />
    </TudastarElrendezes>
  );
}
