import { kategoriaByKulcs, type KategoriaKulcs } from '../../lib/riport-szotar';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/badge';

/** A kategória színes címkéje. A lista, a részletnézet és az új bejegyzés oldalpanelje is ezt használja. */
export function KategoriaBadge({ kulcs }: { kulcs: KategoriaKulcs }) {
  const k = kategoriaByKulcs(kulcs);
  return <Badge className={cn('border-transparent', k.szin)}>{k.rovid}</Badge>;
}
