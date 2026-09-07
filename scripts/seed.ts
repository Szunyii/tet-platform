import { hashPassword } from 'better-auth/crypto';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { account, user } from '../db/schema';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Hiányzó környezeti változó: ${name} (lásd .env.example)`);
    process.exit(1);
  }
  return value;
}

async function main() {
  const email = requireEnv('SEED_ADMIN_EMAIL').trim().toLowerCase();
  const password = requireEnv('SEED_ADMIN_PASSWORD');
  const name = requireEnv('SEED_ADMIN_NAME');

  if (password.length < 8) {
    console.error('SEED_ADMIN_PASSWORD legalább 8 karakter legyen.');
    process.exit(1);
  }

  const existing = db.select({ id: user.id }).from(user).where(eq(user.email, email)).get();
  if (existing) {
    console.log(`Admin már létezik, nincs teendő: ${email} (${existing.id})`);
    return;
  }

  const now = new Date();
  const userId = crypto.randomUUID();
  const passwordHash = await hashPassword(password);

  // Miért közvetlen insert: a disableSignUp a signUpEmail API-t is tiltja, az admin
  // plugin createUser végpontja pedig admin sessiont kér, ami az első adminnál még nincs.
  // A providerId 'credential' és accountId = userId a Better Auth email+jelszó konvenciója.
  db.transaction((tx) => {
    tx.insert(user)
      .values({
        id: userId,
        name,
        email,
        emailVerified: true,
        role: 'admin',
        createdAt: now,
        updatedAt: now,
      })
      .run();
    tx.insert(account)
      .values({
        id: crypto.randomUUID(),
        userId,
        accountId: userId,
        providerId: 'credential',
        password: passwordHash,
        createdAt: now,
        updatedAt: now,
      })
      .run();
  });

  console.log(`Admin létrehozva: ${email} (${userId})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
