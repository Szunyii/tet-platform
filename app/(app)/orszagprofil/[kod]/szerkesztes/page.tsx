import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Fragment } from 'react';
import { buttonVariants } from '../../../../../components/ui/button';
import { getProfil } from '../../../../../db/queries/orszagprofil';
import { aktualisEv, formatDatumIdo } from '../../../../../lib/datum';
import { orszagByKod } from '../../../../../lib/orszagok';
import { canEditProfil } from '../../../../../lib/orszagprofil-jog';
import { uresBlokk, type BlokkKulcs, type ProfilBlokkok } from '../../../../../lib/orszagprofil-szotar';
import { requireSession } from '../../../../../lib/session';
import { cn } from '../../../../../lib/utils';
import { getValasztottEv } from '../../../../../lib/valasztott-ev';
import { valasztEvAction } from '../../../actions';
import { mentBlokkAction } from '../../actions';
import { NemSzerkeszthetoEv } from '../../components/NemSzerkeszthetoEv';
import { AlapadatokMezok } from '../../components/mezok/AlapadatokMezok';
import { KfiRendszerMezok } from '../../components/mezok/KfiRendszerMezok';
import { IntezmenyekMezok } from '../../components/mezok/IntezmenyekMezok';
import { VallalatiMezok } from '../../components/mezok/VallalatiMezok';
import { ProgramokMezok } from '../../components/mezok/ProgramokMezok';
import { RendezvenyekMezok } from '../../components/mezok/RendezvenyekMezok';
import { NemzetkoziKapcsolatokMezok } from '../../components/mezok/NemzetkoziKapcsolatokMezok';
import { MagyarKapcsolatokMezok } from '../../components/mezok/MagyarKapcsolatokMezok';
import { MagyarErtekelesMezok } from '../../components/mezok/MagyarErtekelesMezok';

export const metadata: Metadata = { title: 'Országprofil szerkesztése' };

/**
 * Blokkonkénti szerkesztő. Az év a fejléc ciklusválasztójáé (tet-ev cookie). Admin: bármely
 * ország EV_MIN és az aktuális év között; attasé: csak az az ország, amelynek relációs vezetője,
 * és csak az aktuális év. Ha a választott év nem szerkeszthető, de az aktuális igen (attasé
 * múltbeli évvel – a fejléc ezt is felkínálja, és január 1-jén a nyitva hagyott szerkesztő is
 * ide jut), az űrlapok helyett a NemSzerkeszthetoEv kártya jelenik meg, nem 404: a notFound()
 * a Next 404-határán az útvonal változásáig beragadna, az évváltás pedig csak cookie, így a
 * visszaváltás után is 404 maradna. Ha az aktuális év sem szerkeszthető (nincs jog az
 * országhoz), 404 – ez a választott évtől független, ezért nem ragadhat be évváltáskor.
 */
export default async function SzerkesztesPage({ params }: { params: Promise<{ kod: string }> }) {
  const session = await requireSession();
  const { kod } = await params;
  const orszag = orszagByKod(kod);
  if (!orszag) notFound();
  const most = aktualisEv();
  const ev = await getValasztottEv(most);
  const szerkeszthet = canEditProfil(session, kod, ev, most);
  if (!szerkeszthet && !canEditProfil(session, kod, most, most)) notFound();

  const fejlec = (
    <div className="flex flex-wrap items-center gap-3">
      <h2 className="text-lg font-semibold">{orszag.nev} – profil szerkesztése</h2>
      <span className="text-sm text-muted-foreground">Év: {ev}</span>
      <Link href={`/orszagprofil/${kod}`} className={cn('ml-auto', buttonVariants({ variant: 'outline' }))}>
        Megtekintés
      </Link>
    </div>
  );

  if (!szerkeszthet) {
    return (
      <div className="flex max-w-4xl flex-col gap-4">
        {fejlec}
        <NemSzerkeszthetoEv kod={kod} ev={ev} most={most} action={valasztEvAction} />
      </div>
    );
  }

  const profil = getProfil(kod, ev);
  const mentve = profil ? formatDatumIdo(profil.updatedAt) : null;
  // A profil sor közös updatedAt-ja csak a ténylegesen mentett blokkoknál jelenik meg.
  const m = (k: BlokkKulcs) => (profil?.mentett.includes(k) ? mentve : null);
  const b: Partial<ProfilBlokkok> = profil?.blokkok ?? {};
  const kozos = { kod, ev, action: mentBlokkAction };

  return (
    <div className="flex max-w-4xl flex-col gap-4">
      {fejlec}
      <p className="text-sm text-muted-foreground">
        Minden blokk külön menthető; a mentett blokkok azonnal megjelennek a térképen és a profil oldalon.
      </p>
      {/* key={ev}: az App Router a cookie-ból jövő évet nem veszi az állapot-kulcsba, így
          évváltásnál a 9 blokk kliens-állapota (a beírt, nem mentett értékek) különben
          átcsúszna a másik évre. */}
      <Fragment key={ev}>
        <AlapadatokMezok {...kozos} initial={b.alapadatok ?? uresBlokk('alapadatok')} mentve={m('alapadatok')} />
        <KfiRendszerMezok {...kozos} initial={b.kfiRendszer ?? uresBlokk('kfiRendszer')} mentve={m('kfiRendszer')} />
        <IntezmenyekMezok {...kozos} initial={b.intezmenyek ?? uresBlokk('intezmenyek')} mentve={m('intezmenyek')} />
        <VallalatiMezok {...kozos} initial={b.vallalati ?? uresBlokk('vallalati')} mentve={m('vallalati')} />
        <ProgramokMezok {...kozos} initial={b.programok ?? uresBlokk('programok')} mentve={m('programok')} />
        <RendezvenyekMezok {...kozos} initial={b.rendezvenyek ?? uresBlokk('rendezvenyek')} mentve={m('rendezvenyek')} />
        <NemzetkoziKapcsolatokMezok {...kozos} initial={b.nemzetkoziKapcsolatok ?? uresBlokk('nemzetkoziKapcsolatok')} mentve={m('nemzetkoziKapcsolatok')} />
        <MagyarKapcsolatokMezok {...kozos} initial={b.magyarKapcsolatok ?? uresBlokk('magyarKapcsolatok')} mentve={m('magyarKapcsolatok')} />
        <MagyarErtekelesMezok {...kozos} initial={b.magyarErtekeles ?? uresBlokk('magyarErtekeles')} mentve={m('magyarErtekeles')} />
      </Fragment>
    </div>
  );
}
