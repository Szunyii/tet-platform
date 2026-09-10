import { Badge } from '../ui/badge';
import { IPARAG_SZINEK, type Iparag } from '../../lib/orszagprofil-szotar';

/** Iparág-címke a szótár színével (a térképpel azonos). */
export function IparagBadge({ iparag }: { iparag: Iparag }) {
  const szin = IPARAG_SZINEK[iparag];
  // Inline style szándékosan: a szín a térképpel közös szótárból jön, nem Tailwind-tokenből.
  return (
    <Badge variant="outline" style={{ color: szin, borderColor: `${szin}55`, background: `${szin}14` }}>
      {iparag}
    </Badge>
  );
}
