import { listFelhasznalok } from '../../../db/queries/felhasznalo';
import { requireAdmin } from '../../../lib/session';
import { FelhasznaloTabla } from './components/FelhasznaloTabla';
import { UjFelhasznaloDialog } from './components/UjFelhasznaloDialog';

export default async function FelhasznalokPage() {
  const me = await requireAdmin();
  const felhasznalok = listFelhasznalok();
  return (
    <div className="flex max-w-6xl flex-col gap-4">
      <div className="flex items-center gap-3">
        <p className="text-sm text-muted-foreground">{felhasznalok.length} felhasználó</p>
        <div className="ml-auto">
          <UjFelhasznaloDialog />
        </div>
      </div>
      <FelhasznaloTabla felhasznalok={felhasznalok} sajatId={me.userId} />
    </div>
  );
}
