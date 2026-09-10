import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AllapotBadge } from '../../../../components/orszagprofil/AllapotBadge';
import { BlokkNezet } from '../../../../components/orszagprofil/BlokkNezet';
import { buttonVariants } from '../../../../components/ui/button';
import { getAttaseNev, getProfil, listEvek } from '../../../../db/queries/orszagprofil';
import { aktualisEv, formatDatumIdo } from '../../../../lib/datum';
import { orszagByKod } from '../../../../lib/orszagok';
import { canEditProfil } from '../../../../lib/orszagprofil-jog';
import { BLOKK_KULCSOK, evParam, profilAllapot, type BlokkKulcs } from '../../../../lib/orszagprofil-szotar';
import { requireSession } from '../../../../lib/session';
import { cn } from '../../../../lib/utils';
import { EvValaszto } from '../components/EvValaszto';

// Statikus cím az egyszerűség kedvéért; nincs szivárgási kockázat, minden bejelentkezett
// felhasználó minden profilt olvashat, és az országnév szótáradat.
export const metadata: Metadata = { title: 'Országprofil' };

/**
 * Országprofil olvasó nézet. Bárki olvashat bármely profilt; a `?ev=` a meglévő évek közül
 * választ, ismeretlen év (vagy hiányzó param) esetén a legfrissebb jelenik meg. Ismeretlen
 * országkód 404. A Szerkesztés gomb a nézett évre visz, ha azt a felhasználó szerkesztheti
 * (admin: EV_MIN-től az aktuális évig), különben az aktuális évre – ilyenkor a gomb felirata
 * jelzi a célévet. Csak annak látszik, aki a célévet szerkesztheti.
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
  const alapEv = evek[0] ?? most;
  const kert = evParam((await searchParams).ev, alapEv);
  const ev = evek.includes(kert) ? kert : alapEv;
  const profil = evek.length ? getProfil(kod, ev) : null;
  const attaseNev = getAttaseNev(kod);
  const szerkesztEv = canEditProfil(session, kod, ev, most) ? ev : most;
  const szerkeszthet = canEditProfil(session, kod, szerkesztEv, most);
  const allapot = profilAllapot(profil?.ev ?? null, most);
  // Korrelált generikus: a K köti össze a kulcsot és a blokk-típust (a map-ben unió lenne).
  const blokk = <K extends BlokkKulcs>(k: K) => <BlokkNezet key={k} kulcs={k} tartalom={profil?.blokkok[k] ?? null} />;

  return (
    <div className="flex max-w-4xl flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-lg font-semibold">{orszag.nev}</h2>
          <p className="text-sm text-muted-foreground">{attaseNev ? `Attasé: ${attaseNev}` : 'Nincs aktív attasé'}</p>
        </div>
        <AllapotBadge allapot={allapot} ev={profil?.ev ?? null} />
        {evek.length > 1 && <EvValaszto evek={evek} ertek={ev} />}
        <div className="ml-auto flex gap-2">
          <Link href={`/terkep?o=${kod}`} className={cn(buttonVariants({ variant: 'outline' }))}>Vissza a térképre</Link>
          {szerkeszthet && (
            <Link href={`/orszagprofil/${kod}/szerkesztes?ev=${szerkesztEv}`} className={cn(buttonVariants())}>
              Szerkesztés{szerkesztEv !== ev ? ` (${szerkesztEv})` : ''}
            </Link>
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
      {BLOKK_KULCSOK.map(blokk)}
    </div>
  );
}
