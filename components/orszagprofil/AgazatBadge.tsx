import { AGAZAT_SZINEK, type Agazat } from '../../lib/orszagprofil-szotar';
import { SzinesBadge } from './SzinesBadge';

/** Ágazat-címke a szótár színével (a térképpel azonos); az országprofil mindhárom ágazat-mezője ezt használja. */
export function AgazatBadge({ agazat }: { agazat: Agazat }) {
  return <SzinesBadge szin={AGAZAT_SZINEK[agazat]}>{agazat}</SzinesBadge>;
}
