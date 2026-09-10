import { Badge } from '../ui/badge';
import { ALLAPOT_CIMKE, ALLAPOT_SZINEK, type Allapot } from '../../lib/orszagprofil-szotar';

/** Profil-állapot jelvény („Idei profil · 2026", „Elavult profil · 2025", „Nincs profil"). */
export function AllapotBadge({ allapot, ev }: { allapot: Allapot; ev: number | null }) {
  const szin = ALLAPOT_SZINEK[allapot];
  // Inline style szándékosan: a szín a térképpel közös szótárból jön, nem Tailwind-tokenből.
  return (
    <Badge variant="outline" style={{ color: szin, borderColor: `${szin}55`, background: `${szin}14` }}>
      {ALLAPOT_CIMKE[allapot]}{ev ? ` · ${ev}` : ''}
    </Badge>
  );
}
