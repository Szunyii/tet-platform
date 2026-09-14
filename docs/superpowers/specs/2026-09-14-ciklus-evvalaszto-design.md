# Ciklusválasztó valódi évekből – tervezési spec

Dátum: 2026-09-14
Állapot: jóváhagyva

## Cél

A fejléc „Ciklus” választója ma a `lib/data.ts` demó `CYCLES` listájából
(`2025 Q4` … `2026 Q3`) dolgozik. Ehelyett az adatbázisban ténylegesen létező
országprofil-évekből és az aktuális évből választ. A kiválasztott év továbbra is
kliens-oldali kontextus (`useApp()`), amelyet a monitoring oldal címe és a sidebar
„Aktív ciklus” sora mutat.

## Döntések

| Kérdés | Döntés | Indok |
| --- | --- | --- |
| Az évek forrása | `orszagprofil.ev` distinct értékei + `aktualisEv()`, deduplikálva, csökkenő sorrendben | A felhasználó kérése: releváns adatokból; az aktuális év akkor is választható, ha még nincs hozzá profil. |
| Mit vezérel a választás | Semmi újat: marad kliens-oldali kontextus, a monitoring cím és a sidebar sor használja | A felhasználó döntése; a térkép és a profil oldalak évkezelése (`?ev=`, `aktualisEv`) érintetlen. |
| Hogyan jut az évlista a kliensre | Az `app/(app)/layout.tsx` kérdezi le és `evek` propként adja az `AppShell`-nek | Ugyanaz a minta, mint az `olvasatlan` prop; nincs kliens-fetch, nincs új API route. |
| Az állapot típusa | `number` (`ev`, `setEv`), alapértéke `aktualisEv()` | A demó stringes `cycle` helyett; a fogyasztó (monitoring) számot ír ki. |
| Felirat | Marad „Ciklus” a fejlécben és „Aktív ciklus: …” a sidebarban | A ciklus itt éves; a szöveg nem változik, csak az értékkészlet. |
| Demó-konstansok | `CYCLES` és `DEFAULT_CYCLE` törlődik a `lib/data.ts`-ből | Más nem használja. A `DEADLINE` marad, a beadási határidő nem ennek a feladatnak a része. |

## Hatókörön kívül

A választott év átvezetése a térképre vagy az országprofil oldalakra; az év URL-be
vagy cookie-ba mentése; a „Beadási határidő” és a „Demóadatok – 14 poszt…” sidebar
sorok; a monitoring DB-re vitele.

## Adatréteg

`db/queries/orszagprofil.ts`, új export:

```ts
/** Az összes ország profil-évei egyszer, csökkenő sorrendben (fejléc ciklusválasztó). */
export function listProfilEvek(): number[]
```

`db.selectDistinct({ ev: orszagprofil.ev }).from(orszagprofil).orderBy(desc(orszagprofil.ev))`.
Nincs séma-változás, nincs migráció.

## Layout

`app/(app)/layout.tsx`:

```ts
const most = aktualisEv();
const evek = [...new Set([most, ...listProfilEvek()])].sort((a, b) => b - a);
<AppShell user={session} logoutAction={logoutAction} olvasatlan={olvasatlan} evek={evek} aktualisEv={most}>
```

Üres táblánál `evek = [most]`.

## AppShell

`components/AppShell.tsx`:

- Új propok: `evek: number[]`, `aktualisEv: number`.
- Az `AppState` `cycle: string` / `setCycle` helyett `ev: number` / `setEv: (ev: number) => void`.
- `const [ev, setEv] = useState(aktualisEv)`.
- Ha a layout újrarenderelésekor a kiválasztott `ev` már nincs az `evek` listában,
  render közben `aktualisEv`-re áll (ugyanaz a „prop változásra állapot igazítása”
  minta, mint az `olvasatlan`-nál, az előző `evek` listát nem kell tárolni: elég az
  `evek.includes(ev)` ellenőrzés).
- A fejléc `<select>` az `evek`-ből épül, `value={ev}`, `onChange` → `setEv(Number(...))`.
- A sidebar sora: `Aktív ciklus: {ev}`.
- A `CYCLES`/`DEFAULT_CYCLE` import törlődik.

## Fogyasztók

`app/(app)/monitoring/page.tsx`: `const { ev } = useApp()` és `Hálózati rangsor · {ev}`.
Más `cycle`-fogyasztó nincs (grep-pel ellenőrizve).

## Frissesség

`app/(app)/orszagprofil/actions.ts` `mentBlokkAction` a meglévő három
`revalidatePath` mellé `revalidatePath('/', 'layout')`-ot is hív, hogy egy új év első
mentése után a választó kliens-oldali navigációnál is frissüljön. (A ticket-actionök
ugyanezt teszik az olvasatlan-számláló miatt.)

## Ellenőrzés

- `npx tsc --noEmit`, `npm run build` zöld.
- gstack böngésző, admin bejelentkezés: a fejléc select opciói a DB évei (a helyi DB-ben
  2025, 2026) és az aktuális év, csökkenő sorrendben, az aktuális év kiválasztva.
- `/monitoring`: a cím „Hálózati rangsor · 2026”, évváltás után követi a választást.
- `grep -rn "CYCLES\|DEFAULT_CYCLE\|cycle" app components lib` üres.
