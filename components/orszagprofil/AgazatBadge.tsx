import { Badge } from '../ui/badge';
import { AGAZAT_SZINEK, type Agazat } from '../../lib/orszagprofil-szotar';

/** Ágazat-címke a szótár színével (a térképpel azonos); az országprofil mindhárom ágazat-mezője ezt használja. */
export function AgazatBadge({ agazat }: { agazat: Agazat }) {
  const szin = AGAZAT_SZINEK[agazat];
  // Inline style szándékosan: a szín a térképpel közös szótárból jön, nem Tailwind-tokenből.
  // Az app ma csak világos témájú; ha lesz sötét mód, ezekhez a színekhez `dark:` felülírás kell.
  return (
    <Badge variant="outline" style={{ color: szin, borderColor: `${szin}55`, background: `${szin}14` }}>
      {agazat}
    </Badge>
  );
}
