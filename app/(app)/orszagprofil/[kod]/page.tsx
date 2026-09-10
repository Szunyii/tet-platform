import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AllapotBadge } from '../../../../components/orszagprofil/AllapotBadge';
import { BlokkNezet } from '../../../../components/orszagprofil/BlokkNezet';
import { buttonVariants } from '../../../../components/ui/button';
import { getProfil, listEvek } from '../../../../db/queries/orszagprofil';
import { aktualisEv, formatDatumIdo } from '../../../../lib/datum';
import { orszagByKod } from '../../../../lib/orszagok';
import { canEditProfil } from '../../../../lib/orszagprofil-jog';
import { BLOKK_KULCSOK, evParam } from '../../../../lib/orszagprofil-szotar';
import { requireSession } from '../../../../lib/session';
import { cn } from '../../../../lib/utils';
import { EvValaszto } from '../components/EvValaszto';

// Statikus cím: a generateMetadata jog-ellenőrzés nélkül nem szivárogtathat.
export const metadata: Metadata = { title: 'Országprofil' };

/**
 * Országprofil olvasó nézet. Bárki olvashat bármely profilt; a `?ev=` a meglévő évek közül
 * választ, ismeretlen év (vagy hiányzó param) esetén a legfrissebb jelenik meg. Ismeretlen
 * országkód 404. A Szerkesztés gomb mindig az aktuális évre visz, csak annak van, aki
 * azt szerkesztheti.
 */
export default async function OrszagprofilPage({
  params, searchParams,
}: { params: Promise<{ kod: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await requireSession();
  const { kod } = await params;
  const orszag = orszagByKod(kod);
  if (!orszag) notFound();
  const most = aktualisEv();
  const evek = listEvek(kod);
  const kert = evParam((await searchParams).ev, evek[0] ?? most);
  const ev = evek.includes(kert) ? kert : (evek[0] ?? most);
  const profil = evek.length ? getProfil(kod, ev) : null;
  const szerkeszthet = canEditProfil(session, kod, most, most);
  const allapot = !profil ? 'nincs' : profil.ev === most ? 'friss' : 'elavult';

  return (
    <div className="flex max-w-4xl flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold">{orszag.nev}</h2>
        <AllapotBadge allapot={allapot} ev={profil?.ev ?? null} />
        {evek.length > 1 && <EvValaszto evek={evek} ertek={ev} />}
        <div className="ml-auto flex gap-2">
          <Link href={`/terkep?o=${kod}`} className={cn(buttonVariants({ variant: 'outline' }))}>Vissza a térképre</Link>
          {szerkeszthet && (
            <Link href={`/orszagprofil/${kod}/szerkesztes?ev=${most}`} className={cn(buttonVariants())}>Szerkesztés</Link>
          )}
        </div>
      </div>
      {profil ? (
        <p className="text-sm text-muted-foreground">
          {profil.ev}. évi profil · utoljára módosítva {formatDatumIdo(profil.updatedAt)}
          {profil.szerzo ? ` · ${profil.szerzo.nev}` : ''} · {profil.mentett.length}/{BLOKK_KULCSOK.length} blokk kitöltve
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">Ehhez az országhoz még nincs országprofil.</p>
      )}
      {BLOKK_KULCSOK.map((k) => (
        <BlokkNezet key={k} kulcs={k} tartalom={profil?.blokkok[k] ?? null} />
      ))}
    </div>
  );
}
