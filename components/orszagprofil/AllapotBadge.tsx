import { ALLAPOT_CIMKE, ALLAPOT_SZINEK, type Allapot } from '../../lib/orszagprofil-szotar';
import { SzinesBadge } from './SzinesBadge';

/** Profil-állapot jelvény („Adott évi profil · 2026", „Elavult profil · 2025", „Nincs profil"). */
export function AllapotBadge({ allapot, ev }: { allapot: Allapot; ev: number | null }) {
  return <SzinesBadge szin={ALLAPOT_SZINEK[allapot]}>{ALLAPOT_CIMKE[allapot]}{ev ? ` · ${ev}` : ''}</SzinesBadge>;
}
