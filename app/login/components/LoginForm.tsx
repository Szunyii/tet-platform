'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { signIn } from '../../../lib/auth-client';

function hibaSzoveg(error: { code?: string; status?: number }): string {
  if (error.code === 'BANNED_USER') return 'A fiók le van tiltva.';
  if (error.status === 429) return 'Túl sok próbálkozás. Várj néhány másodpercet, majd próbáld újra.';
  // 400 (érvénytelen e-mail formátum) és 401 (rossz e-mail vagy jelszó) egyformán:
  // nem különböztetünk, hogy ne lehessen fiókokat felderíteni.
  if (error.status === 400 || error.status === 401) return 'Hibás e-mail cím vagy jelszó.';
  return 'Bejelentkezés sikertelen, próbáld újra.';
}

export default function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Add meg az e-mail címet és a jelszót.');
      return;
    }
    setError('');
    setPending(true);
    try {
      const res = await signIn.email({ email: trimmedEmail, password });
      if (res.error) {
        setError(hibaSzoveg(res.error));
        setPending(false);
        return;
      }
      // replace: a /login ne maradjon a history-ban (a vissza gomb ne vigyen a loginra).
      // A céloldal RSC-lekérése már az új cookie-val megy, refresh() nem kell.
      router.replace(next);
    } catch {
      // A signIn.email hálózati hibánál dob (nincs válasz), nem { error }-t ad vissza.
      setError('Nem sikerült elérni a szervert. Ellenőrizd a kapcsolatot, és próbáld újra.');
      setPending(false);
    }
  }

  const hasError = Boolean(error);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">E-mail cím</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          autoFocus
          required
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? 'login-hiba' : undefined}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Jelszó</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? 'login-hiba' : undefined}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && (
        <p id="login-hiba" role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="mt-1">
        {pending ? 'Bejelentkezés…' : 'Bejelentkezés'}
      </Button>
    </form>
  );
}
