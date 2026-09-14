# A fejléc éve vezérli az országprofilt és a térképet – tervezési spec

Dátum: 2026-09-14
Állapot: jóváhagyva
Előzmény: `2026-09-14-ciklus-evvalaszto-design.md` (a fejléc választója DB-évekből épül, a
választás ott még csak kliens-oldali kontextus volt).

## Cél

A fejléc „Ciklus" választójában kiválasztott év határozza meg az országprofil adatlapját
(`/orszagprofil/[kod]`), a szerkesztőt (`/orszagprofil/[kod]/szerkesztes`) és a térképet
(`/terkep`). Egyetlen évválasztó van: az oldalak saját `?ev=` alapú `EvValaszto`-ja
megszűnik. A kiválasztott év a szerver oldalon is elérhető, ezért cookie-ban él.

## Döntések

| Kérdés | Döntés | Indok |
| --- | --- | --- |
| Hol él a választott év | `tet-ev` httpOnly cookie, server action írja, a szerver oldal olvassa | Nem kell minden linkbe `?ev=`-et fűzni; a sidebar-navigáció és a vissza gomb sem felejti el. |
| Mit vezérel | `/terkep`, `/orszagprofil/[kod]`, `/orszagprofil/[kod]/szerkesztes`, a monitoring cím és a sidebar sora | A felhasználó döntése: az év a teljes adatlapot és a térképet is meghatározza. |
| Évlista a fejlécben | Admin: `EV_MIN..aktuális év` minden év; attasé: DB profil-évek + aktuális év; a cookie éve mindig bekerül | Az admin a szerkesztőben új évet is létrehozhat, és a szerkesztő saját évválasztója megszűnik. Attasénak csak az aktuális év szerkeszthető, neki elég a létező évek listája. |
| Nincs profil az évre | Üres adatlap: „Ehhez az évhez (2025) még nincs országprofil."; nincs visszaesés a legfrissebb évre | Egy választó = egyértelmű jelentés: azt látod, amit választottál. |
| Térkép állapota évnézetben | Országonként a legnagyobb év ≤ választott év profilja; van profil a választott évre → `friss`, csak régebbi → `elavult`, semmi → `nincs` | Az aktuális évre pontosan a mai szabály; múltbeli évre ugyanaz a logika értelmesen általánosítva. |
| Nem szerkeszthető év (attasé, múltbeli év) | A Szerkesztés / Saját országprofil gomb form-gomb: az action a cookie-t az aktuális évre állítja és a szerkesztőre irányít; felirat „Szerkesztés (2026)" | Egy forrás marad; a szerkesztő 404-e csak kézzel beírt URL-nél fordul elő. |
| `?ev=` paraméter | Nem értelmezett többé egyik oldalon sem | Két forrás (URL és cookie) kétértelmű állapotot adna. |

## Hatókörön kívül

A választott év URL-be tétele vagy megosztható év-linkek; a „Beadási határidő" és a
„Demóadatok" sidebar-sorok; a monitoring DB-re vitele; a riportok/ticketek évszűrése.

## Forrás és validálás

`lib/valasztott-ev.ts` (`import 'server-only'`, Next-függő, mint a `lib/session.ts` – a
CLAUDE.md `lib/` szabályának tudatos kivétele):

```ts
export const EV_COOKIE = 'tet-ev';
/** A fejlécben választott év a cookie-ból: négyjegyű egész EV_MIN..most között, különben most. React.cache. */
export const getValasztottEv: (most: number) => Promise<number>;
```

Server action `app/(app)/actions.ts` (a `logoutAction` mellett, shell-szintű):

```ts
export async function valasztEvAction(formData: FormData): Promise<void>
```

Mezők: `ev` (kötelező, négyjegyű, `EV_MIN..aktualisEv()`), `kod` (opcionális ISO-kód).
Sorrend: `requireSession()` → érvénytelen `ev` → csendben nem ír (visszatér) → cookie
írása (`httpOnly`, `sameSite: 'lax'`, `path: '/'`, `maxAge` 1 év, `secure` production-ban)
→ `revalidatePath('/', 'layout')` → ha `kod` érvényes (`orszagByKod`), `redirect` a
`/orszagprofil/<kod>/szerkesztes` útvonalra. A `redirect()` a try/catch-en kívül.

## Layout és AppShell

`app/(app)/layout.tsx`: `most = aktualisEv()`, `ev = await getValasztottEv(most)`, évlista:

- admin: `Array.from({ length: most - EV_MIN + 1 }, (_, i) => most - i)`;
- attasé: `[...new Set([most, ev, ...listProfilEvek()])].sort((a, b) => b - a)`.

Propok az `AppShell`-nek: `ev`, `evek` (az `aktualisEv` prop megszűnik, a fallback a
szerveré). Az `AppShell`:

- nincs `useState` az évre és nincs `setEv`; az `AppState` `ev: number`-t ad (a
  `setEv` kikerül a contextből, egyetlen hívója sem volt a shellen kívül);
- a fejléc `<select>` `value={ev}`, `onChange` → `startTransition(() => valasztEvAction(fd))`
  (`useTransition`; a select `disabled` amíg `pending`); a `valasztEvAction` propként jön a
  layoutból (mint a `logoutAction`), hogy a shell ne importáljon server modult;
- a sidebar sora „Aktív ciklus: {ev}" marad.

Az `if (!evek.includes(ev) …)` igazítás megszűnik: a layout garantálja, hogy `ev ∈ evek`.

## Térkép

`db/queries/orszagprofil.ts` `listTerkepAdat(ev, most)`: az év szerint csökkenő profil-sorok
közül országonként az első, amelynek `p.ev <= ev` (a `p.ev > ev` sorok átugorva);
`allapot: profilAllapot(prof?.ev ?? null, ev)`. `most` a `TerkepOrszag`-ban nem kell.
`ALLAPOT_CIMKE.friss` „Idei profil" → „Az évi profil" (a `TerkepUres` legendája és a
`TerkepNezet` „N idei profil" szövege „N az évi profil"-ra).

`app/(app)/terkep/page.tsx`: `ev = await getValasztottEv(most)`, `listTerkepAdat(ev, most)`,
`TerkepNezet` propjai: `ev`, `most` (az `aktualisEv` helyett), `valasztEvAction`.
`TerkepNezet` és `ProfilKivonat`: a szerkesztő-gomb közös komponens
`components/orszagprofil/SzerkesztesGomb.tsx`:

```tsx
<SzerkesztesGomb kod={kod} most={most} szerkeszthetEv={bool} szerkeszthetMost={bool} action={valasztEvAction} felirat="Szerkesztés" className? />
```

`szerkeszthetEv` (a nézett év szerkeszthető) → `Link` a `/orszagprofil/<kod>/szerkesztes`-re,
felirat a hívóé („Szerkesztés" / „Profil kitöltése" / „Saját országprofil"); különben
`szerkeszthetMost` → `<form action={action}>` rejtett `ev=<most>` és `kod` mezővel, gomb-felirat
„<felirat> (<most>)"; egyik sem → nem renderel semmit. A jog számítása a hívónál marad
(térkép: `admin || kod === sajatKod`, ami évtől független, tehát `szerkeszthetEv = jog && (admin || ev === most)`,
`szerkeszthetMost = jog`; profil oldal: `canEditProfil(session, kod, ev, most)` ill.
`canEditProfil(session, kod, most, most)`).

## Profil oldal

`app/(app)/orszagprofil/[kod]/page.tsx`: `ev = await getValasztottEv(most)`,
`profil = getProfil(kod, ev)`; a `listEvek`, `evParam`, `EvValaszto`, `searchParams`
kikerül. Az `AllapotBadge` az évnézet szabályával: `legfrissebbEv` helyett a legnagyobb
profil-év ≤ `ev` (`listEvek` helyett új `getUtolsoEv(kod, ev): number | null` a query
modulban; a `listEvek` törölhető, ha nem marad hívója). Szöveg nincs profilnál:
„Ehhez az évhez ({ev}) még nincs országprofil." A Szerkesztés gomb a
`SzerkesztesGomb`-bal (`szerkeszthetEv = canEditProfil(session, kod, ev, most)`,
`szerkeszthetMost = canEditProfil(session, kod, most, most)`).

## Szerkesztő

`app/(app)/orszagprofil/[kod]/szerkesztes/page.tsx`: `ev = await getValasztottEv(most)`,
`canEditProfil` hiba → 404 (mint ma); `EvValaszto` és `searchParams` kikerül, marad az
„Év: {ev}" szöveg; „Megtekintés" link `?ev=` nélkül; `<Fragment key={ev}>` marad.
`mentBlokkAction` változatlan (a rejtett `ev` mezőt továbbra is az űrlap adja).

## Takarítás

`app/(app)/orszagprofil/components/EvValaszto.tsx` törlése; `evParam` törlése a szótárból;
`listEvek` törlése, ha nem marad hívója; CLAUDE.md Országprofil/Térkép/UI shell bekezdései
és a README frissítése.

## Ellenőrzés

- `npx tsc --noEmit`, `npm run build`.
- gstack, admin: fejléc lista 2026…2020; 2025-re váltás → `/terkep`: JP `friss` („Az évi
  profil", van 2025-ös profilja), KR `nincs` (csak 2026-os profilja van, az a 2025-ös nézetben
  nem számít). `/orszagprofil/KR` → „Ehhez az évhez (2025) még nincs országprofil.";
  `/orszagprofil/JP` → a 2025-ös alapadatok. 2026-ra vissza → mint ma (KR `friss`, JP `friss`).
- gstack, attasé (JP): lista 2026, 2025; 2025-ben a profil oldalon „Szerkesztés (2026)"
  → kattintás után a fejléc 2026, a szerkesztő nyílik; a térkép „Saját országprofil
  (2026)" ugyanígy. Kézzel `/orszagprofil/JP/szerkesztes` 2025-ös cookie-val → 404.
- Érvénytelen cookie (`tet-ev=abc` vagy 1999) → aktuális év.
- Monitoring cím követi a fejlécet.

## Eltérések a megvalósításban

- `listTerkepAdat(ev)` – a `most` paraméter nem kell, az állapot az `ev`-hez viszonyít (`profilAllapot(profilEv, viszonyitasiEv)`).
- `ALLAPOT_CIMKE.friss` = „Adott évi profil" (nem „Az évi profil"), a térkép számlálója „N profil (2025)".
- A fejléc selectje nem `disabled` a váltás alatt, hanem `useOptimistic`-kal azonnal az új évet mutatja és `aria-busy`; a hiba `unstable_rethrow` után csak logolódik.
- `parseEv` közös parser a helperben és az actionben; az attasé évlistája `EV_MIN..most`-ra szűrve; admin lista `Math.max(0, …)` védelemmel.
- `SzerkesztesGomb` kapott `feliratMost` propot (a form-ág felirata nem függ a nézett év állapotától), a form-gomb `KuldGomb` (`useFormStatus`, pending). A térkép a jogot `canEditProfil`-lal számolja a `useApp().user`-ből, a `TerkepNezet` nem kap `sajatKod`/`admin` propot.
- A `/terkep` `key`-ében az év nincs benne: évváltáskor a kiválasztás, a fül és a szűrő megmarad, a `TerkepNezet` render közben törli a kiválasztást, ha az ország eltűnik.
- Profil oldal üres évnél: ha van korábbi profil (a jelvény „Elavult profil · 2025"), a szöveg megnevezi és egy form-gomb („Ugrás a(z) 2025. évi profilra", `valasztEvAction`) átvált rá – automatikus visszaesés továbbra sincs.
- `mentBlokkAction` és a CLAUDE.md: egyetlen `revalidatePath('/', 'layout')` (korábbi feature), a `lib/` kivétel-lista bővült a `lib/valasztott-ev.ts`-sel.
