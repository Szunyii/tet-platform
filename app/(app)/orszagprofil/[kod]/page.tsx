import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AllapotBadge } from '../../../../components/orszagprofil/AllapotBadge';
import { BlokkNezet } from '../../../../components/orszagprofil/BlokkNezet';
import { SzerkesztesGomb } from '../../../../components/orszagprofil/SzerkesztesGomb';
import { buttonVariants } from '../../../../components/ui/button';
import { getAttaseNev, getProfil, getUtolsoEv } from '../../../../db/queries/orszagprofil';
import { aktualisEv, formatDatumIdo } from '../../../../lib/datum';
import { orszagByKod } from '../../../../lib/orszagok';
import { canEditProfil } from '../../../../lib/orszagprofil-jog';
import { BLOKK_KULCSOK, profilAllapot, type BlokkKulcs } from '../../../../lib/orszagprofil-szotar';
import { requireSession } from '../../../../lib/session';
import { cn } from '../../../../lib/utils';
import { getValasztottEv } from '../../../../lib/valasztott-ev';
import { valasztEvAction } from '../../actions';

// Statikus cím az egyszerűség kedvéért; nincs szivárgási kockázat, minden bejelentkezett
// felhasználó minden profilt olvashat, és az országnév szótáradat.
export const metadata: Metadata = { title: 'Országprofil' };

/**
 * Országprofil olvasó nézet. Bárki olvashat bármely profilt; a nézett év a fejléc
 * ciklusválasztójáé (tet-ev cookie). Ha az évre nincs profil, üres adatlap – nincs visszaesés
 * a legfrissebb évre. Ismeretlen országkód 404. A Szerkesztés gomb a nézett évre visz, ha azt
 * a felhasználó szerkesztheti (admin: EV_MIN-től az aktuális évig), különben – attasé múltbeli
 * évnézetben – az aktuális évre vált és úgy nyitja a szerkesztőt („Szerkesztés (2026)").
 */
export default async function OrszagprofilPage({ params }: { params: Promise<{ kod: string }> }) {
  const session = await requireSession();
  const { kod } = await params;
  const orszag = orszagByKod(kod);
  if (!orszag) notFound();
  const most = aktualisEv();
  const ev = await getValasztottEv(most);
  const profil = getProfil(kod, ev);
  const attaseNev = getAttaseNev(kod);
  // A jelvény az évnézet szabályával (mint a térkép): a legnagyobb profil-év ≤ ev állapota az ev-hez képest.
  const utolsoEv = getUtolsoEv(kod, ev);
  const allapot = profilAllapot(utolsoEv, ev);
  // Korrelált generikus: a K köti össze a kulcsot és a blokk-típust (a map-ben unió lenne).
  const blokk = <K extends BlokkKulcs>(k: K) => <BlokkNezet key={k} kulcs={k} tartalom={profil?.blokkok[k] ?? null} />;

  return (
    <div className="flex max-w-4xl flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-lg font-semibold">{orszag.nev}</h2>
          <p className="text-sm text-muted-foreground">{attaseNev ? `Attasé: ${attaseNev}` : 'Nincs aktív attasé'}</p>
        </div>
        <AllapotBadge allapot={allapot} ev={utolsoEv} />
        <div className="ml-auto flex gap-2">
          <Link href={`/terkep?o=${kod}`} className={cn(buttonVariants({ variant: 'outline' }))}>Vissza a térképre</Link>
          <SzerkesztesGomb
            kod={kod}
            most={most}
            szerkeszthetEv={canEditProfil(session, kod, ev, most)}
            szerkeszthetMost={canEditProfil(session, kod, most, most)}
            action={valasztEvAction}
            felirat="Szerkesztés"
          />
        </div>
      </div>
      {profil ? (
        <p className="text-sm text-muted-foreground">
          {profil.ev}. évi profil · utoljára módosítva {formatDatumIdo(profil.updatedAt)}
          {profil.szerzo ? ` · ${profil.szerzo.nev}` : ''} · {profil.mentett.length}/{BLOKK_KULCSOK.length} blokk kitöltve
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">Ehhez az évhez ({ev}) még nincs országprofil.</p>
      )}
      {BLOKK_KULCSOK.map(blokk)}
    </div>
  );
}
