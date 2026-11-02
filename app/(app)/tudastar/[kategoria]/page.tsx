import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buttonVariants } from '../../../../components/ui/button';
import { listKartyak } from '../../../../db/queries/tudastar';
import { tudastarUrl, ujKartyaUrl } from '../../../../lib/routes';
import { canEditTudastar } from '../../../../lib/tudastar-jog';
import { kategoriaBySlug } from '../../../../lib/tudastar-szotar';
import { requireSession } from '../../../../lib/session';
import { cn } from '../../../../lib/utils';
import { mozgatKartyaAction } from '../actions';
import { Morzsa } from '../components/Morzsa';
import { SzamJelveny } from '../components/SzamJelveny';
import { TudastarElrendezes } from '../components/TudastarElrendezes';
import { TudastarKartya } from '../components/TudastarKartya';

// Statikus cím: mindenki mindent olvashat, a dinamikus cím nem védene semmit, és külön lekérdezést kérne.
export const metadata: Metadata = { title: 'TéT Tudástár' };

/** Egy kategória: bevezető és a kártyái sorrendben; adminnak új kártya és ↑/↓. Ismeretlen kategória: 404. */
export default async function KategoriaPage({ params }: { params: Promise<{ kategoria: string }> }) {
  const session = await requireSession();
  const { kategoria: slug } = await params;
  const kategoria = kategoriaBySlug(slug);
  if (!kategoria) notFound();
  const admin = canEditTudastar(session);
  const kartyak = listKartyak().filter((k) => k.kategoria === kategoria.slug);
  return (
    <TudastarElrendezes aktivKategoria={kategoria.slug} kartyak={kartyak}>
      <Morzsa elemek={[{ felirat: 'TéT Tudástár', href: tudastarUrl() }, { felirat: `${kategoria.szam}. ${kategoria.rovidCim}` }]} />
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="flex items-center gap-2 text-xl leading-snug font-semibold">
            <SzamJelveny szam={kategoria.szam} />
            {kategoria.cim}
          </h2>
          {admin && (
            <div className="ml-auto flex gap-2">
              <Link href={ujKartyaUrl(kategoria.slug, 'intezmeny')} className={cn(buttonVariants({ variant: 'outline' }))}>
                <span aria-hidden>+</span> Új intézmény
              </Link>
              <Link href={ujKartyaUrl(kategoria.slug, 'lista')} className={cn(buttonVariants({ variant: 'outline' }))}>
                <span aria-hidden>+</span> Új lista
              </Link>
            </div>
          )}
        </div>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{kategoria.bevezeto}</p>
      </header>
      {kartyak.length === 0 ? (
        <p className="rounded-xl border border-dashed border-input p-6 text-sm text-muted-foreground">
          Ebben a kategóriában még nincs kártya.
        </p>
      ) : (
        kartyak.map((k, i) => (
          <TudastarKartya
            key={k.id}
            kartya={k}
            mozgatas={
              admin
                ? {
                    fel: i > 0 ? mozgatKartyaAction.bind(null, k.id, 'fel') : undefined,
                    le: i < kartyak.length - 1 ? mozgatKartyaAction.bind(null, k.id, 'le') : undefined,
                  }
                : undefined
            }
          />
        ))
      )}
    </TudastarElrendezes>
  );
}
