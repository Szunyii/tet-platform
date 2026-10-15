import type { ReactNode } from 'react';
import { Badge } from '../ui/badge';

/**
 * Szótár-színű jelvény: a szöveg a szín, a keret és a háttér annak áttetsző változata. Inline style
 * szándékosan: a szín a térképpel közös szótárból jön, nem Tailwind-tokenből. Az app ma csak világos
 * témájú; ha lesz sötét mód, ezekhez a színekhez `dark:` felülírás kell.
 */
export function SzinesBadge({ szin, children }: { szin: string; children: ReactNode }) {
  return (
    <Badge variant="outline" style={{ color: szin, borderColor: `${szin}55`, background: `${szin}14` }}>
      {children}
    </Badge>
  );
}
