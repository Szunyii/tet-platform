# Attasé-adatok bővítése (főváros, terület, pénznem, elérhetőségek) – tervezési spec

Dátum: 2026-09-10
Állapot: jóváhagyva

## Cél

Az admin felhasználó-kezelőben (`/felhasznalok`) az attasé felvételekor és
szerkesztésekor az ország mellett további adatok is rögzíthetők: a poszt
országának fővárosa, területe és pénzneme, valamint az attasé elérhetőségei
(telefon, kapcsolattartási e-mail). Az adatok a Better Auth `user` rekordján
tárolódnak, mint a meglévő `orszag`.

## Döntések

| Kérdés | Döntés | Indok |
| --- | --- | --- |
| Hol tárolódnak az adatok | Mind az öt mező a `user` táblán, Better Auth `additionalFields`-ként | A felhasználó döntése; a meglévő `orszag` mintáját követi, nincs új tábla. |
| Elérhetőségek tartalma | `telefon` + `kapcsolatEmail` (külön a bejelentkezési e-mailtől) | A felhasználó kérte; a kapcsolattartási cím eltérhet a fiók e-mailjétől (pl. külképviseleti cím). |
| Terület formátuma | Egész szám, km²-ben (`terulet`) | Rendezhető, összehasonlítható; a felületen „km²” utótag. |
| Kötelezőség | Mind az öt mező opcionális | Csak az `orszag` marad kötelező attasénál; a többi utólag pótolható. |
| Ország-adatok szerepkör szerint | `fovaros`, `terulet`, `penznem` csak attasénál tölthető; adminra váltáskor az `orszag`-gal együtt törlődik | Ezek a poszt országának adatai, adminnak nincs posztja. |
| Elérhetőségek szerepkör szerint | `telefon`, `kapcsolatEmail` mindkét szerepkörnél megadható | Az adminnak is lehet telefonszáma. |
| Megjelenés | Új felvétel + szerkesztés dialógus; a táblázat csak `Telefon` oszlopot kap | A többi oszlop túl szélessé tenné a táblát. |

## Hatókörön kívül

Külön országprofil tábla, a térkép/tudástár demóadatainak DB-re vitele, önkiszolgáló
profilszerkesztés, a session (`AppSession`) bővítése az új mezőkkel, a seed script
módosítása.

## Adatmodell

`db/schema/auth.ts` `user` tábla, új oszlopok (mind nullable):

| Mező (Better Auth / Drizzle kulcs) | Oszlop | Típus | Korlát |
| --- | --- | --- | --- |
| `fovaros` | `fovaros` | text | ≤ 100 karakter |
| `terulet` | `terulet` | integer | pozitív egész, ≤ 999 999 999 |
| `penznem` | `penznem` | text | ≤ 100 karakter |
| `telefon` | `telefon` | text | ≤ 40 karakter, csak `0-9`, szóköz, `+ - / ( )` |
| `kapcsolatEmail` | `kapcsolat_email` | text | a meglévő `EMAIL_RE`, kisbetűsítve |

`lib/auth.ts` `user.additionalFields`: az öt mező `required: false, input: false`
(`terulet`: `type: 'number'`, a többi `'string'`). Az `input: false` miatt a
felhasználó saját `/update-user` végpontján nem írhatja; az admin plugin
`createUser`/`adminUpdateUser` `data` mezőjén át az admin UI írja.

Migráció: `npm run db:generate` (`drizzle/0004_*.sql`, öt `ALTER TABLE user ADD`).
A `db/schema/auth.ts`-t kézzel bővítjük (az `auth:generate` ugyanezt adná, de
felülírná a fájl formázását).

## Validáció (`lib/felhasznalo-validacio.ts`)

`UjFelhasznaloInput` és `SzerkesztesInput` közös bővítése egy `AttaseAdatok`
interfésszel:

```ts
interface AttaseAdatok {
  orszag: string | null;
  fovaros: string | null;
  terulet: number | null;
  penznem: string | null;
  telefon: string | null;
  kapcsolatEmail: string | null;
}
```

- `validOrszag` változatlan. `fovaros`, `penznem`: csak attasénál értelmezett, adminnál
  (és érvénytelen szerepkörnél) `null` hiba nélkül; üres → `null`; > 100 karakter → hiba.
- `terulet`: csak attasénál; üres → `null`. A beírt értékből a szóközöket és pontokat
  (ezreselválasztó) eltávolítjuk, majd `/^\d{1,9}$/` és > 0 kell; különben
  `terulet: 'A terület pozitív egész szám legyen (km²).'`.
- `telefon`: mindkét szerepkörnél; üres → `null`; > 40 karakter vagy a
  `/^[0-9+\-/() ]+$/` mintán kívüli karakter → hiba.
- `kapcsolatEmail`: mindkét szerepkörnél; `mezo()` + kisbetű; üres → `null`;
  `EMAIL_RE` sikertelen → `kapcsolatEmail: 'Érvénytelen e-mail cím.'`.
- A mezőnevek a FormData-ban és a hibakulcsokban azonosak az input `id`-jával
  (`fovaros`, `terulet`, `penznem`, `telefon`, `kapcsolatEmail`), hogy a
  `useMuveletForm` fókusza a hibás mezőre kerüljön.

## Server action-ök (`app/(app)/felhasznalok/actions.ts`)

A `FelhasznaloAdatok` interfész az öt új mezővel bővül; `createFelhasznaloAction`
és `updateFelhasznaloAction` a parse eredményéből mind az öt mezőt a `data`-ba
teszi. Az `updateFelhasznaloAction` továbbra is egyetlen `adminUpdateUser` hívás.
A Better Auth `INVALID_EMAIL` hibája továbbra is a bejelentkezési `email` mezőre
megy (a `kapcsolatEmail`-t a Better Auth nem validálja, csak a saját validátor).

## Lekérdezés (`db/queries/felhasznalo.ts`)

`FelhasznaloSor` az öt új mezővel bővül (`fovaros`, `penznem`, `telefon`,
`kapcsolatEmail`: `string | null`; `terulet`: `number | null`), a `listFelhasznalok`
select-je és map-je ennek megfelelően. A szerkesztés dialógus ebből kapja a kezdő
értékeket.

## Felület

`UjFelhasznaloDialog` és `SzerkesztesDialog`: a mezők három, feliratozott blokkra
tagolódnak (`<fieldset>` + `<legend>` a shadcn tipográfiával):

1. **Fiók**: név, e-mail (csak új felvételnél), kezdő jelszó (csak új felvételnél),
   szerepkör.
2. **Elérhetőség**: telefon (`type="tel"`, `inputMode="tel"`), kapcsolattartási e-mail
   (`type="email"`), kétoszlopos rácsban (`sm:grid-cols-2`).
3. **TéT poszt** (csak attasénál, mint eddig az ország): ország (kötelező), főváros
   egy sorban kétoszloposan; terület (`inputMode="numeric"`, utótag „km²” a mező
   mellett) és pénznem (`placeholder="pl. dél-koreai won (KRW)"`) kétoszloposan.

Az ismétlődő mező-blokkot (`Label` + `Input` + `MezoHiba`) a két dialógus közös
`AttaseMezok` komponense adja (`app/(app)/felhasznalok/components/AttaseMezok.tsx`):
propként kapja a vezérelt értékeket és setter-eket, a `szerepkor`-t és az
`errors`-t, és a 2–3. blokkot rendereli. Az 1. blokk a két dialógusban marad, mert
eltérő.

A dialógus szélesebb: a `MuveletDialog` új, opcionális `szeles` propja
`sm:max-w-lg`-t ad a `DialogContent`-nek (alapértelmezés változatlan). A vezérelt
mezők mintája (React 19 form-reset elleni state) az új mezőkre is vonatkozik.

A `SzerkesztesDialog` „Adminra váltva az ország törlődik.” szövege „Adminra váltva
az ország és a poszt adatai törlődnek.”-re változik.

`FelhasznaloTabla`: az „Ország” után új „Telefon” oszlop (`–` ha üres).

## Ellenőrzés

- `npx tsc --noEmit`, `npm run build`.
- `npm run db:migrate` a lokális DB-n; a migráció commitolva.
- Böngészőben (gstack `browse`): attasé felvétele minden mezővel, majd a
  szerkesztés dialógusban a kezdő értékek megjelennek; szerkesztésnél adminra
  váltva az ország és a poszt-adatok `null`-ra íródnak, a telefon és a kapcsolat
  e-mail megmarad; hibás telefon (`abc`), hibás terület (`-5`, `12,5`), hibás
  kapcsolat e-mail visszajelzése a mező alatt, fókusz a hibás mezőn; a táblázat
  Telefon oszlopa.
