'use server';

import { revalidatePath } from 'next/cache';
import { unstable_rethrow } from 'next/navigation';
import { mozgatKartya } from '../../../db/queries/tudastar';
import { canEditTudastar } from '../../../lib/tudastar-jog';
import { requireSession } from '../../../lib/session';

/** ↑/↓ a kategória-oldalon (bind-olt `<form action>`): a szomszéddal cserél sorrendet. */
export async function mozgatKartyaAction(id: string, irany: 'fel' | 'le'): Promise<void> {
  const session = await requireSession();
  if (!canEditTudastar(session)) return;
  try {
    mozgatKartya(id, irany);
  } catch (err) {
    unstable_rethrow(err);
    console.error('[tudastar] mozgatás sikertelen:', err);
    return;
  }
  revalidatePath('/tudastar', 'layout');
}
