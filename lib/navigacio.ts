/**
 * Az alkalmazás útvonalai egy táblában: az oldalsáv menüje, a fejléc címe és alcíme, és az admin-only
 * jelzés innen jön – új oldalhoz egy sort kell felvenni. Csak megjelenítés: az `adminOnly` a menüpontot
 * rejti el és a fejléc címét semlegesíti, a valódi védelem a page/action `requireAdmin()`-ja
 * (lib/session.ts).
 */
import type { Szerepkor } from './felhasznalo-validacio';

export interface Menupont {
  ikon: string;
  felirat: string;
  /** További útvonal-prefixek, amelyeken a menüpont aktív (pl. /orszagprofil/* → Országprofil). */
  alHrefek?: readonly string[];
}

export interface Utvonal {
  href: string;
  /** A fejléc címe és alcíme ezen az útvonalon és az alútvonalain. */
  cim: string;
  alcim: string;
  adminOnly?: boolean;
  /** Ha van, menüpont az oldalsávban; a menü sorrendje a tábla sorrendje. */
  menu?: Menupont;
}

export const UTVONALAK: readonly Utvonal[] = [
  {
    href: '/terkep',
    cim: 'Országprofil',
    alcim: 'A TéT attasé-posztok térképen, a beküldött országprofilok kivonatával',
    menu: { ikon: '◍', felirat: 'Országprofil', alHrefek: ['/orszagprofil'] },
  },
  {
    href: '/orszagprofil',
    cim: 'Országprofil',
    alcim: 'Az ország KFI körképe és alapadatai, évenkénti attasé-beadással',
  },
  {
    href: '/jelentesek',
    cim: 'Jelentések',
    alcim: 'A TéT hálózat információs bejegyzései kategóriák és kulcsszavak szerint',
    menu: { ikon: '▦', felirat: 'Jelentések' },
  },
  {
    href: '/uj-jelentes',
    cim: 'Új bejegyzés',
    alcim: 'Kategória, tárgy, vezetői összefoglaló, kulcsszavak – rendezvénynél dátum és helyszín',
    menu: { ikon: '✎', felirat: 'Új bejegyzés' },
  },
  {
    href: '/kommunikacio',
    cim: 'Kommunikáció',
    alcim: 'Ticket + üzenetszál az adminok és a TéT attasék között',
    menu: { ikon: '✉', felirat: 'Kommunikáció' },
  },
  {
    href: '/tudastar',
    cim: 'Tudástár',
    alcim: 'Magyarországról ajánlható programok, partnerek és együttműködési formák',
    menu: { ikon: '◫', felirat: 'Tudástár ??' },
  },
  {
    href: '/monitoring',
    cim: 'Monitoring és értékelés',
    alcim: '3 kategória, 14 szempont, rögzített adatforrás-metaadatokkal',
    menu: { ikon: '◈', felirat: 'Monitoring és értékelés ??' },
  },
  {
    href: '/felhasznalok',
    cim: 'Felhasználók',
    alcim: 'Admin és TéT attasé fiókok kezelése',
    adminOnly: true,
    menu: { ikon: '☺', felirat: 'Felhasználók' },
  },
];

const SEMLEGES_CIM: [string, string] = ['TéT Platform', ''];

/** Pontos egyezés vagy alútvonal (pl. /jelentesek/abc → /jelentesek). */
export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + '/');
}

/** A menüpont aktív: a saját útvonalán vagy valamelyik `alHrefek` prefixe alatt. */
export function menuAktiv(pathname: string, u: Utvonal): boolean {
  return isActive(pathname, u.href) || (u.menu?.alHrefek ?? []).some((h) => isActive(pathname, h));
}

/** A szerepkörnek látható menüpontok a tábla sorrendjében. */
export function menupontok(szerep: Szerepkor): (Utvonal & { menu: Menupont })[] {
  return UTVONALAK.filter((u): u is Utvonal & { menu: Menupont } => !!u.menu && (!u.adminOnly || szerep === 'admin'));
}

/**
 * A fejléc címe és alcíme: a leghosszabb illeszkedő útvonalé (pontos egyezés vagy prefix). Admin-only
 * útvonalon nem adminnak a semleges címet adja: a requireAdmin() 404-e az AppShellben renderelődik, és
 * a fejléc nem árulhatja el az oldal létét.
 */
export function titleFor(pathname: string, szerep: Szerepkor): [string, string] {
  if (szerep !== 'admin' && UTVONALAK.some((u) => u.adminOnly && isActive(pathname, u.href))) return SEMLEGES_CIM;
  const talalat = UTVONALAK.filter((u) => isActive(pathname, u.href)).sort((a, b) => b.href.length - a.href.length)[0];
  return talalat ? [talalat.cim, talalat.alcim] : SEMLEGES_CIM;
}
