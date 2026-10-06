import { listFelhasznalok } from '../../../db/queries/felhasznalo';
import { orszagonkent, vezetoNelkuliOrszagok } from '../../../lib/attase-orszag';
import { requireAdmin } from '../../../lib/session';
import { FelhasznaloTabla } from './components/FelhasznaloTabla';
import { UjFelhasznaloDialog } from './components/UjFelhasznaloDialog';
import { VezetoFigyelmeztetes } from './components/VezetoFigyelmeztetes';

export default async function FelhasznalokPage() {
  const me = await requireAdmin();
  const felhasznalok = listFelhasznalok();
  // Országonként a lefedő attasék (vezető-jelölő súgója, ★, figyelmeztetés): a listából, új lekérdezés nélkül.
  const orszagTagok = orszagonkent(felhasznalok);
  const hianyos = vezetoNelkuliOrszagok(orszagTagok);
  return (
    <div className="flex max-w-6xl flex-col gap-4">
      <div className="flex items-center gap-3">
        <p className="text-sm text-muted-foreground">{felhasznalok.length} felhasználó</p>
        <div className="ml-auto">
          <UjFelhasznaloDialog orszagTagok={orszagTagok} />
        </div>
      </div>
      {hianyos.length > 0 && <VezetoFigyelmeztetes orszagok={hianyos} />}
      <FelhasznaloTabla felhasznalok={felhasznalok} sajatId={me.userId} orszagTagok={orszagTagok} />
    </div>
  );
}
