/**
 * Országszótár: ISO 3166-1 alpha-2 kód, magyar név, world-atlas 110m térképnév (a
 * `countries-110m.json` `properties.name` értéke – ezzel párosít a `VilagTerkep`) és a
 * főváros koordinátája (a pin helye). A `user.orszag` és a `riport.orszag` a `kod`-ot
 * tárolja; a felület `orszagNev()`-vel ír. Framework-mentes.
 */
export interface Orszag {
  kod: string;
  nev: string;
  /**
   * world-atlas 110m térképnév (`properties.name`); üres string, ha a 110m atlaszban nincs
   * poligonja (kis állam) – ilyenkor csak a pin jelenik meg.
   */
  geo: string;
  /** [hosszúság, szélesség] */
  lonlat: [number, number];
}

export const ORSZAG_KOD_RE = /^[A-Z]{2}$/;

/**
 * Magyar név szerint rendezve (a select ebben a sorrendben listáz). A `geo: ''` sorok (SG, MT,
 * BH) a 110m atlaszban poligon nélküli kis államok: a térképen csak pin.
 */
export const ORSZAGOK: readonly Orszag[] = [
  { kod: 'AF', nev: 'Afganisztán', geo: 'Afghanistan', lonlat: [69.17, 34.53] },
  { kod: 'AL', nev: 'Albánia', geo: 'Albania', lonlat: [19.82, 41.33] },
  { kod: 'DZ', nev: 'Algéria', geo: 'Algeria', lonlat: [3.06, 36.75] },
  { kod: 'US', nev: 'Amerikai Egyesült Államok', geo: 'United States of America', lonlat: [-77.04, 38.9] },
  { kod: 'AO', nev: 'Angola', geo: 'Angola', lonlat: [13.23, -8.84] },
  { kod: 'AR', nev: 'Argentína', geo: 'Argentina', lonlat: [-58.38, -34.6] },
  { kod: 'AU', nev: 'Ausztrália', geo: 'Australia', lonlat: [149.13, -35.28] },
  { kod: 'AT', nev: 'Ausztria', geo: 'Austria', lonlat: [16.37, 48.21] },
  { kod: 'AZ', nev: 'Azerbajdzsán', geo: 'Azerbaijan', lonlat: [49.87, 40.41] },
  { kod: 'BS', nev: 'Bahama-szigetek', geo: 'Bahamas', lonlat: [-77.34, 25.06] },
  { kod: 'BH', nev: 'Bahrein', geo: '', lonlat: [50.58, 26.23] },
  { kod: 'BD', nev: 'Banglades', geo: 'Bangladesh', lonlat: [90.41, 23.81] },
  { kod: 'BY', nev: 'Belarusz', geo: 'Belarus', lonlat: [27.57, 53.9] },
  { kod: 'BE', nev: 'Belgium', geo: 'Belgium', lonlat: [4.35, 50.85] },
  { kod: 'BZ', nev: 'Belize', geo: 'Belize', lonlat: [-88.77, 17.25] },
  { kod: 'BJ', nev: 'Benin', geo: 'Benin', lonlat: [2.63, 6.5] },
  { kod: 'BT', nev: 'Bhután', geo: 'Bhutan', lonlat: [89.64, 27.47] },
  { kod: 'GW', nev: 'Bissau-Guinea', geo: 'Guinea-Bissau', lonlat: [-15.6, 11.86] },
  { kod: 'BO', nev: 'Bolívia', geo: 'Bolivia', lonlat: [-68.15, -16.5] },
  { kod: 'BA', nev: 'Bosznia-Hercegovina', geo: 'Bosnia and Herz.', lonlat: [18.41, 43.86] },
  { kod: 'BW', nev: 'Botswana', geo: 'Botswana', lonlat: [25.91, -24.65] },
  { kod: 'BR', nev: 'Brazília', geo: 'Brazil', lonlat: [-47.93, -15.78] },
  { kod: 'BN', nev: 'Brunei', geo: 'Brunei', lonlat: [114.94, 4.94] },
  { kod: 'BG', nev: 'Bulgária', geo: 'Bulgaria', lonlat: [23.32, 42.7] },
  { kod: 'BF', nev: 'Burkina Faso', geo: 'Burkina Faso', lonlat: [-1.52, 12.37] },
  { kod: 'BI', nev: 'Burundi', geo: 'Burundi', lonlat: [29.36, -3.38] },
  { kod: 'CL', nev: 'Chile', geo: 'Chile', lonlat: [-70.65, -33.45] },
  { kod: 'CY', nev: 'Ciprus', geo: 'Cyprus', lonlat: [33.38, 35.17] },
  { kod: 'CR', nev: 'Costa Rica', geo: 'Costa Rica', lonlat: [-84.09, 9.93] },
  { kod: 'TD', nev: 'Csád', geo: 'Chad', lonlat: [15.04, 12.13] },
  { kod: 'CZ', nev: 'Csehország', geo: 'Czechia', lonlat: [14.42, 50.09] },
  { kod: 'DK', nev: 'Dánia', geo: 'Denmark', lonlat: [12.57, 55.68] },
  { kod: 'ZA', nev: 'Dél-afrikai Köztársaság', geo: 'South Africa', lonlat: [28.19, -25.75] },
  { kod: 'SS', nev: 'Dél-Szudán', geo: 'S. Sudan', lonlat: [31.58, 4.85] },
  { kod: 'DO', nev: 'Dominikai Köztársaság', geo: 'Dominican Rep.', lonlat: [-69.93, 18.49] },
  { kod: 'DJ', nev: 'Dzsibuti', geo: 'Djibouti', lonlat: [43.15, 11.59] },
  { kod: 'EC', nev: 'Ecuador', geo: 'Ecuador', lonlat: [-78.47, -0.18] },
  { kod: 'GQ', nev: 'Egyenlítői-Guinea', geo: 'Eq. Guinea', lonlat: [8.78, 3.75] },
  { kod: 'AE', nev: 'Egyesült Arab Emírségek', geo: 'United Arab Emirates', lonlat: [54.37, 24.45] },
  { kod: 'GB', nev: 'Egyesült Királyság', geo: 'United Kingdom', lonlat: [-0.13, 51.51] },
  { kod: 'EG', nev: 'Egyiptom', geo: 'Egypt', lonlat: [31.24, 30.04] },
  { kod: 'CI', nev: 'Elefántcsontpart', geo: "Côte d'Ivoire", lonlat: [-5.28, 6.82] },
  { kod: 'ER', nev: 'Eritrea', geo: 'Eritrea', lonlat: [38.93, 15.32] },
  { kod: 'SZ', nev: 'Eswatini', geo: 'eSwatini', lonlat: [31.13, -26.32] },
  { kod: 'MK', nev: 'Észak-Macedónia', geo: 'Macedonia', lonlat: [21.43, 41.99] },
  { kod: 'EE', nev: 'Észtország', geo: 'Estonia', lonlat: [24.75, 59.44] },
  { kod: 'ET', nev: 'Etiópia', geo: 'Ethiopia', lonlat: [38.75, 9.03] },
  { kod: 'FJ', nev: 'Fidzsi', geo: 'Fiji', lonlat: [178.44, -18.14] },
  { kod: 'FI', nev: 'Finnország', geo: 'Finland', lonlat: [24.94, 60.17] },
  { kod: 'FR', nev: 'Franciaország', geo: 'France', lonlat: [2.35, 48.86] },
  { kod: 'PH', nev: 'Fülöp-szigetek', geo: 'Philippines', lonlat: [120.98, 14.6] },
  { kod: 'GA', nev: 'Gabon', geo: 'Gabon', lonlat: [9.45, 0.39] },
  { kod: 'GM', nev: 'Gambia', geo: 'Gambia', lonlat: [-16.58, 13.45] },
  { kod: 'GH', nev: 'Ghána', geo: 'Ghana', lonlat: [-0.19, 5.6] },
  { kod: 'GR', nev: 'Görögország', geo: 'Greece', lonlat: [23.73, 37.98] },
  { kod: 'GE', nev: 'Grúzia', geo: 'Georgia', lonlat: [44.79, 41.72] },
  { kod: 'GT', nev: 'Guatemala', geo: 'Guatemala', lonlat: [-90.51, 14.63] },
  { kod: 'GN', nev: 'Guinea', geo: 'Guinea', lonlat: [-13.68, 9.54] },
  { kod: 'GY', nev: 'Guyana', geo: 'Guyana', lonlat: [-58.16, 6.8] },
  { kod: 'HT', nev: 'Haiti', geo: 'Haiti', lonlat: [-72.34, 18.54] },
  { kod: 'NL', nev: 'Hollandia', geo: 'Netherlands', lonlat: [4.9, 52.37] },
  { kod: 'HN', nev: 'Honduras', geo: 'Honduras', lonlat: [-87.21, 14.07] },
  { kod: 'HR', nev: 'Horvátország', geo: 'Croatia', lonlat: [15.98, 45.81] },
  { kod: 'IN', nev: 'India', geo: 'India', lonlat: [77.21, 28.61] },
  { kod: 'ID', nev: 'Indonézia', geo: 'Indonesia', lonlat: [106.85, -6.21] },
  { kod: 'IQ', nev: 'Irak', geo: 'Iraq', lonlat: [44.37, 33.31] },
  { kod: 'IR', nev: 'Irán', geo: 'Iran', lonlat: [51.39, 35.69] },
  { kod: 'IE', nev: 'Írország', geo: 'Ireland', lonlat: [-6.26, 53.35] },
  { kod: 'IS', nev: 'Izland', geo: 'Iceland', lonlat: [-21.94, 64.15] },
  { kod: 'IL', nev: 'Izrael', geo: 'Israel', lonlat: [35.22, 31.77] },
  { kod: 'JM', nev: 'Jamaica', geo: 'Jamaica', lonlat: [-76.79, 18.0] },
  { kod: 'JP', nev: 'Japán', geo: 'Japan', lonlat: [139.69, 35.69] },
  { kod: 'YE', nev: 'Jemen', geo: 'Yemen', lonlat: [44.21, 15.35] },
  { kod: 'JO', nev: 'Jordánia', geo: 'Jordan', lonlat: [35.93, 31.95] },
  { kod: 'KH', nev: 'Kambodzsa', geo: 'Cambodia', lonlat: [104.92, 11.56] },
  { kod: 'CM', nev: 'Kamerun', geo: 'Cameroon', lonlat: [11.52, 3.87] },
  { kod: 'CA', nev: 'Kanada', geo: 'Canada', lonlat: [-75.7, 45.42] },
  { kod: 'QA', nev: 'Katar', geo: 'Qatar', lonlat: [51.53, 25.29] },
  { kod: 'KZ', nev: 'Kazahsztán', geo: 'Kazakhstan', lonlat: [71.45, 51.17] },
  { kod: 'TL', nev: 'Kelet-Timor', geo: 'Timor-Leste', lonlat: [125.57, -8.56] },
  { kod: 'KE', nev: 'Kenya', geo: 'Kenya', lonlat: [36.82, -1.29] },
  { kod: 'CN', nev: 'Kína', geo: 'China', lonlat: [116.4, 39.9] },
  { kod: 'KG', nev: 'Kirgizisztán', geo: 'Kyrgyzstan', lonlat: [74.59, 42.87] },
  { kod: 'CO', nev: 'Kolumbia', geo: 'Colombia', lonlat: [-74.07, 4.71] },
  { kod: 'CD', nev: 'Kongói Demokratikus Köztársaság', geo: 'Dem. Rep. Congo', lonlat: [15.31, -4.33] },
  { kod: 'CG', nev: 'Kongói Köztársaság', geo: 'Congo', lonlat: [15.28, -4.27] },
  { kod: 'KR', nev: 'Koreai Köztársaság', geo: 'South Korea', lonlat: [126.98, 37.57] },
  { kod: 'KP', nev: 'Koreai NDK', geo: 'North Korea', lonlat: [125.75, 39.02] },
  { kod: 'XK', nev: 'Koszovó', geo: 'Kosovo', lonlat: [21.17, 42.66] },
  { kod: 'CF', nev: 'Közép-afrikai Köztársaság', geo: 'Central African Rep.', lonlat: [18.56, 4.36] },
  { kod: 'CU', nev: 'Kuba', geo: 'Cuba', lonlat: [-82.37, 23.11] },
  { kod: 'KW', nev: 'Kuvait', geo: 'Kuwait', lonlat: [47.98, 29.38] },
  { kod: 'LA', nev: 'Laosz', geo: 'Laos', lonlat: [102.63, 17.97] },
  { kod: 'PL', nev: 'Lengyelország', geo: 'Poland', lonlat: [21.01, 52.23] },
  { kod: 'LS', nev: 'Lesotho', geo: 'Lesotho', lonlat: [27.48, -29.31] },
  { kod: 'LV', nev: 'Lettország', geo: 'Latvia', lonlat: [24.11, 56.95] },
  { kod: 'LB', nev: 'Libanon', geo: 'Lebanon', lonlat: [35.5, 33.89] },
  { kod: 'LR', nev: 'Libéria', geo: 'Liberia', lonlat: [-10.8, 6.3] },
  { kod: 'LY', nev: 'Líbia', geo: 'Libya', lonlat: [13.19, 32.89] },
  { kod: 'LT', nev: 'Litvánia', geo: 'Lithuania', lonlat: [25.28, 54.69] },
  { kod: 'LU', nev: 'Luxemburg', geo: 'Luxembourg', lonlat: [6.13, 49.61] },
  { kod: 'MG', nev: 'Madagaszkár', geo: 'Madagascar', lonlat: [47.51, -18.88] },
  { kod: 'HU', nev: 'Magyarország', geo: 'Hungary', lonlat: [19.04, 47.5] },
  { kod: 'MY', nev: 'Malajzia', geo: 'Malaysia', lonlat: [101.69, 3.14] },
  { kod: 'MW', nev: 'Malawi', geo: 'Malawi', lonlat: [33.79, -13.96] },
  { kod: 'ML', nev: 'Mali', geo: 'Mali', lonlat: [-8.0, 12.65] },
  { kod: 'MT', nev: 'Málta', geo: '', lonlat: [14.51, 35.9] },
  { kod: 'MA', nev: 'Marokkó', geo: 'Morocco', lonlat: [-6.85, 34.02] },
  { kod: 'MR', nev: 'Mauritánia', geo: 'Mauritania', lonlat: [-15.98, 18.09] },
  { kod: 'MX', nev: 'Mexikó', geo: 'Mexico', lonlat: [-99.13, 19.43] },
  { kod: 'MM', nev: 'Mianmar', geo: 'Myanmar', lonlat: [96.13, 19.75] },
  { kod: 'MD', nev: 'Moldova', geo: 'Moldova', lonlat: [28.86, 47.01] },
  { kod: 'MN', nev: 'Mongólia', geo: 'Mongolia', lonlat: [106.92, 47.92] },
  { kod: 'ME', nev: 'Montenegró', geo: 'Montenegro', lonlat: [19.26, 42.44] },
  { kod: 'MZ', nev: 'Mozambik', geo: 'Mozambique', lonlat: [32.59, -25.97] },
  { kod: 'NA', nev: 'Namíbia', geo: 'Namibia', lonlat: [17.08, -22.56] },
  { kod: 'DE', nev: 'Németország', geo: 'Germany', lonlat: [13.4, 52.52] },
  { kod: 'NP', nev: 'Nepál', geo: 'Nepal', lonlat: [85.32, 27.72] },
  { kod: 'NI', nev: 'Nicaragua', geo: 'Nicaragua', lonlat: [-86.25, 12.13] },
  { kod: 'NE', nev: 'Niger', geo: 'Niger', lonlat: [2.11, 13.51] },
  { kod: 'NG', nev: 'Nigéria', geo: 'Nigeria', lonlat: [7.49, 9.06] },
  { kod: 'NO', nev: 'Norvégia', geo: 'Norway', lonlat: [10.75, 59.91] },
  { kod: 'IT', nev: 'Olaszország', geo: 'Italy', lonlat: [12.5, 41.9] },
  { kod: 'OM', nev: 'Omán', geo: 'Oman', lonlat: [58.59, 23.59] },
  { kod: 'RU', nev: 'Oroszország', geo: 'Russia', lonlat: [37.62, 55.75] },
  { kod: 'AM', nev: 'Örményország', geo: 'Armenia', lonlat: [44.51, 40.18] },
  { kod: 'PK', nev: 'Pakisztán', geo: 'Pakistan', lonlat: [73.09, 33.69] },
  { kod: 'PS', nev: 'Palesztina', geo: 'Palestine', lonlat: [35.23, 31.9] },
  { kod: 'PA', nev: 'Panama', geo: 'Panama', lonlat: [-79.52, 8.98] },
  { kod: 'PG', nev: 'Pápua Új-Guinea', geo: 'Papua New Guinea', lonlat: [147.18, -9.44] },
  { kod: 'PY', nev: 'Paraguay', geo: 'Paraguay', lonlat: [-57.58, -25.28] },
  { kod: 'PE', nev: 'Peru', geo: 'Peru', lonlat: [-77.03, -12.05] },
  { kod: 'PT', nev: 'Portugália', geo: 'Portugal', lonlat: [-9.14, 38.72] },
  { kod: 'RO', nev: 'Románia', geo: 'Romania', lonlat: [26.1, 44.43] },
  { kod: 'RW', nev: 'Ruanda', geo: 'Rwanda', lonlat: [30.06, -1.94] },
  { kod: 'SB', nev: 'Salamon-szigetek', geo: 'Solomon Is.', lonlat: [159.97, -9.43] },
  { kod: 'SV', nev: 'Salvador', geo: 'El Salvador', lonlat: [-89.19, 13.69] },
  { kod: 'SL', nev: 'Sierra Leone', geo: 'Sierra Leone', lonlat: [-13.23, 8.48] },
  { kod: 'ES', nev: 'Spanyolország', geo: 'Spain', lonlat: [-3.7, 40.42] },
  { kod: 'LK', nev: 'Srí Lanka', geo: 'Sri Lanka', lonlat: [79.86, 6.93] },
  { kod: 'SR', nev: 'Suriname', geo: 'Suriname', lonlat: [-55.2, 5.85] },
  { kod: 'CH', nev: 'Svájc', geo: 'Switzerland', lonlat: [7.45, 46.95] },
  { kod: 'SE', nev: 'Svédország', geo: 'Sweden', lonlat: [18.07, 59.33] },
  { kod: 'SA', nev: 'Szaúd-Arábia', geo: 'Saudi Arabia', lonlat: [46.72, 24.69] },
  { kod: 'SN', nev: 'Szenegál', geo: 'Senegal', lonlat: [-17.44, 14.69] },
  { kod: 'RS', nev: 'Szerbia', geo: 'Serbia', lonlat: [20.46, 44.79] },
  { kod: 'SG', nev: 'Szingapúr', geo: '', lonlat: [103.82, 1.35] },
  { kod: 'SY', nev: 'Szíria', geo: 'Syria', lonlat: [36.29, 33.51] },
  { kod: 'SK', nev: 'Szlovákia', geo: 'Slovakia', lonlat: [17.11, 48.15] },
  { kod: 'SI', nev: 'Szlovénia', geo: 'Slovenia', lonlat: [14.51, 46.06] },
  { kod: 'SO', nev: 'Szomália', geo: 'Somalia', lonlat: [45.32, 2.05] },
  { kod: 'SD', nev: 'Szudán', geo: 'Sudan', lonlat: [32.53, 15.55] },
  { kod: 'TJ', nev: 'Tádzsikisztán', geo: 'Tajikistan', lonlat: [68.79, 38.56] },
  { kod: 'TW', nev: 'Tajvan', geo: 'Taiwan', lonlat: [121.57, 25.03] },
  { kod: 'TZ', nev: 'Tanzánia', geo: 'Tanzania', lonlat: [35.74, -6.16] },
  { kod: 'TH', nev: 'Thaiföld', geo: 'Thailand', lonlat: [100.5, 13.76] },
  { kod: 'TG', nev: 'Togo', geo: 'Togo', lonlat: [1.22, 6.14] },
  { kod: 'TR', nev: 'Törökország', geo: 'Turkey', lonlat: [32.85, 39.93] },
  { kod: 'TT', nev: 'Trinidad és Tobago', geo: 'Trinidad and Tobago', lonlat: [-61.52, 10.65] },
  { kod: 'TN', nev: 'Tunézia', geo: 'Tunisia', lonlat: [10.18, 36.81] },
  { kod: 'TM', nev: 'Türkmenisztán', geo: 'Turkmenistan', lonlat: [58.38, 37.95] },
  { kod: 'UG', nev: 'Uganda', geo: 'Uganda', lonlat: [32.58, 0.35] },
  { kod: 'NZ', nev: 'Új-Zéland', geo: 'New Zealand', lonlat: [174.78, -41.29] },
  { kod: 'UA', nev: 'Ukrajna', geo: 'Ukraine', lonlat: [30.52, 50.45] },
  { kod: 'UY', nev: 'Uruguay', geo: 'Uruguay', lonlat: [-56.16, -34.9] },
  { kod: 'UZ', nev: 'Üzbegisztán', geo: 'Uzbekistan', lonlat: [69.24, 41.3] },
  { kod: 'VU', nev: 'Vanuatu', geo: 'Vanuatu', lonlat: [168.32, -17.73] },
  { kod: 'VE', nev: 'Venezuela', geo: 'Venezuela', lonlat: [-66.88, 10.49] },
  { kod: 'VN', nev: 'Vietnám', geo: 'Vietnam', lonlat: [105.83, 21.03] },
  { kod: 'ZM', nev: 'Zambia', geo: 'Zambia', lonlat: [28.28, -15.42] },
  { kod: 'ZW', nev: 'Zimbabwe', geo: 'Zimbabwe', lonlat: [31.05, -17.83] },
];

const KOD_INDEX: ReadonlyMap<string, Orszag> = new Map(ORSZAGOK.map((o) => [o.kod, o]));

export function orszagByKod(kod: string | null | undefined): Orszag | undefined {
  return kod ? KOD_INDEX.get(kod) : undefined;
}

/** Megjelenítéshez: ismeretlen kódra magát a kódot adja (sosem üres egy létező érték), null-ra ''. */
export function orszagNev(kod: string | null | undefined): string {
  if (!kod) return '';
  return KOD_INDEX.get(kod)?.nev ?? kod;
}

const NEV_GEO_SZERINT = new Map(ORSZAGOK.filter((o) => o.geo).map((o) => [o.geo, o.nev] as const));

/**
 * A world-atlas térképnév (`properties.name`) magyar neve a szótárból – a térkép poszt nélküli
 * poligonjainak tooltipjéhez. Ha a szótárban nincs ilyen ország (pl. Grönland, Antarktisz),
 * maga a térképnév.
 */
export function geoNev(geo: string): string {
  return NEV_GEO_SZERINT.get(geo) ?? geo;
}
