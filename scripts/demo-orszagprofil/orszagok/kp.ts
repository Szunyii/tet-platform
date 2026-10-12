/**
 * Koreai NDK / Észak-Korea (KP) 2026-os profilja – kutatott vázlat, a relációs vezető pontosítja.
 * Források (hozzáférés: 2026-10-09; a [*] jelűeké: 2026-10-12):
 * - Alapadatok: az IMF World Economic Outlook nem közöl adatot a KNDK-ról (a 2025. októberi WEO-ban nincs PRK-sorozat),
 *   ezért becslések:
 *   - GDP-növekedés: Bank of Korea, „2025년 북한 경제성장률 추정 결과” (2026. július 31.): 2025-ben +3,5% (2024: +3,7%,
 *     2023: +3,1%); névleges GNI 48,5 billió won, 1 főre 1,873 millió won; GDP-szerkezet (névleges): szolgáltatások 29,6%,
 *     mezőgazdaság, erdő- és halgazdálkodás 21,2%, feldolgozóipar 20,9%, bányászat 9,1%; külkereskedelem 3,13 Mrd USD (+16%);
 *     a növekedés tényezői: az orosz együttműködés bővülése, a Kínával folytatott kereskedelem, állami projektek –
 *     https://eiec.kdi.re.kr/policy/materialView.do?num=284958 (a BOK-közlemény a KDI oldalán) ;
 *     https://koreatimes.co.kr/foreignaffairs/northkorea/20260731/n-korean-economy-grows-over-3-for-3rd-consecutive-year-in-2025-bok ;
 *     a növekedés tényezői (BOK): https://www.upi.com/Top_News/World-News/2026/07/31/North-Korea-economy-grows-three-percent-2025-cooperation-Russia-BOK/4401785519515/
 *   - Lakosság: ENSZ World Population Prospects 2024, közepes változat, 2025. július 1. (LocID 408): 26 571 036 fő –
 *     https://population.un.org/wpp/assets/Excel%20Files/1_Indicator%20(Standard)/CSV_FILES/WPP2024_TotalPopulationBySex.csv.gz
 *   - Terület: ENSZ Demográfiai Évkönyv 2024, 3. tábla (120 538 km²) –
 *     https://unstats.un.org/unsd/demographic-social/products/dyb/documents/dyb2024/table03.pdf
 * - Tagságok: ENSZ (1991. 09. 17.) – https://www.un.org/en/about-us/member-states ; El Nem Kötelezett Országok Mozgalma: tagállam
 *   (a mozgalom hivatalos oldala, Ázsia és a csendes-óceáni térség) – https://nam.go.ug/member-states/Asia-and-Pacific [*] ;
 *   felvétel a külügyminiszterek 1975-ös limai értekezletén – Wilson Center, 2021. 10. 04.:
 *   https://wilsoncenter.org/blog-post/tito-kim-correspondence-joining-movement-1973-1975 [*]
 * - ENSZ BT 2321 (2016), 10. és 11. pont – https://documents.un.org/api/symbol/access?s=S/RES/2321(2016)&l=en&t=pdf
 * - ENSZ BT 2270 (2016), 17. pont – https://documents.un.org/api/symbol/access?s=S/RES/2270(2016)&l=en&t=pdf
 * - EU korlátozó intézkedések: a Tanács (KKBP) 2016/849 határozata (2016. május 27.) és (EU) 2017/1509 rendelete (2017. augusztus 30.)
 *   a KNDK-val szembeni korlátozó intézkedésekről – https://eur-lex.europa.eu/eli/dec/2016/849/oj ;
 *   https://eur-lex.europa.eu/eli/reg/2017/1509/oj (a rendelet Hivatalos Lap-beli szövegében a 2016/849 határozatra hivatkozik:
 *   https://www.legislation.gov.uk/eur/2017/1509/pdfs/eur_20171509_adopted_en.pdf)
 * - Orosz–észak-koreai átfogó stratégiai partnerségi szerződés (aláírva Phenjanban, 2024. június 19-én; hatályos 2024. december 4-től) –
 *   Interfax, 2024. 12. 05.: https://interfax.com/newsroom/top-stories/108291/ [*]
 * - Stipendium Hungaricum partnerlista (a KNDK nem szerepel) – https://stipendiumhungaricum.hu/partners/
 * Kimaradt blokkok és mezők:
 * - Csak az Alapadatok, a Kapcsolatok és a Magyar értékelés blokk szerepel; a KFI-rendszer, az intézmények,
 *   a vállalati ökoszisztéma, a programok és a rendezvények mentetlenek (megbízható nyílt adat nincs, és az ENSZ BT
 *   2321 (2016) határozata a tudományos-műszaki együttműködést felfüggeszti).
 * - alapadatok.gdp és gdpEgyFore: üres, mert a Bank of Korea a GNI-t wonban becsli, USD-ben nem közöl hivatalos becslést.
 * - alapadatok.tagsagok: a szótár egyik szervezetének sem tagja. magyarKapcsolatok.egyezmeny és ketoldalu: hatályos TéT-egyezmény
 *   és kétoldalú TéT-program nem ismert. magyarErtekeles.joGyakorlatok: nem releváns.
 */
import type { DemoOrszag } from '../tipusok';

const orszag: DemoOrszag = {
  kod: 'KP',
  profil: {
    alapadatok: {
      fovaros: 'Phenjan',
      terulet: '120 538',
      penznem: 'észak-koreai von (KPW)',
      lakossag: '26 571 036',
      gdp: '',
      gdpEgyFore: '',
      gdpNovekedes: '3,5',
      adatEv: '2025',
      forras: 'Bank of Korea becslése (2026. július; GDP-növekedés), ENSZ World Population Prospects 2024, ENSZ Demográfiai Évkönyv 2024',
      tagsagok: [],
      tagsagEgyeb: 'ENSZ (1991 óta), El Nem Kötelezett Országok Mozgalma (1975 óta)',
      agazatok: ['Agrár- és élelmiszeripar', 'Bányászat és nyersanyagok'],
      agazatEgyeb: 'Feldolgozóipar (a GDP 20,9%-a), szolgáltatások (29,6%) – Bank of Korea, 2025',
    },
    nemzetkoziKapcsolatok: {
      partnerorszagok:
        'A Bank of Korea szerint a 2025-ös 3,5%-os becsült növekedést az Oroszországgal bővülő együttműködés, a Kínával folytatott kereskedelem növekedése és állami '
        + 'projektek hajtották; a külkereskedelmi forgalom (a két Korea közötti forgalom nélkül) 2025-ben 3,13 milliárd USD volt (+16%). '
        + 'Oroszországgal 2024-ben átfogó stratégiai partnerségi szerződést kötött.',
      euMultilateralis:
        'A KNDK-t az ENSZ BT 1718 (2006) határozata óta fokozatosan bővülő szankciós rendszer érinti. A 2321 (2016) határozat 11. pontja szerint minden tagállam felfüggeszti '
        + 'a KNDK által hivatalosan támogatott vagy azt képviselő személyekkel, csoportokkal folytatott tudományos és műszaki együttműködést, az orvosi cserék kivételével. '
        + 'Kivétel csak akkor lehetséges, ha (a) a nukleáris tudomány és technológia, a repülő- és űrmérnöki terület, illetve a fejlett gyártástechnológiák esetében '
        + 'az 1718-as Szankcióbizottság eseti alapon megállapítja, hogy a tevékenység nem segíti a KNDK proliferációs szempontból érzékeny nukleáris tevékenységét '
        + 'vagy ballisztikusrakéta-programjait; (b) minden más területen az együttműködő állam állapítja meg ugyanezt, és erről előzetesen értesíti a Bizottságot. '
        + 'Magyarország az ENSZ-határozatok mellett az EU korlátozó intézkedéseit is alkalmazza (a Tanács (KKBP) 2016/849 határozata és (EU) 2017/1509 rendelete).',
    },
    magyarKapcsolatok: {
      egyezmeny: '',
      ketoldalu: '',
      mobilitas:
        'Az ENSZ BT 2270 (2016) határozatának 17. pontja szerint a tagállamok megakadályozzák, hogy KNDK-állampolgárok a proliferációt elősegítő szakterületeken '
        + '(pl. haladó fizika, haladó számítógépes szimuláció és kapcsolódó informatika, térinformatikai navigáció, nukleáris, repülő- és űrmérnöki terület) '
        + 'speciális oktatást vagy képzést kapjanak; a 2321 (2016) 10. pontja pontosítja, hogy ide tartozik többek között a haladó anyagtudomány, valamint '
        + 'a haladó vegyész-, gépész-, villamos- és ipari mérnöki képzés. '
        + 'A KNDK nem Stipendium Hungaricum partnerország.',
    },
    magyarErtekeles: {
      osszegzes:
        'Az ENSZ BT 2321 (2016) határozata a KNDK hivatalos szereplőivel folytatott tudományos és műszaki együttműködést – az orvosi cserék kivételével – '
        + 'felfüggeszti; kivétel csak szankcióbizottsági döntéssel vagy előzetes bejelentéssel lehetséges. Magyar–észak-koreai TéT-együttműködés ezért nem '
        + 'tervezhető; a feladat a fejlemények figyelése.',
      egyuttmukodesiLehetosegek:
        'Csak orvosi cserék, illetve a 2321-es határozat eljárása szerint egyedileg vizsgált, nem érzékeny területek jöhetnek szóba, előzetes jogi és szankciós megfelelőségi vizsgálattal.',
      diplomaciaiPrioritasok:
        'A BT-határozatok és az uniós korlátozó intézkedések maradéktalan betartása; a Koreai-félsziget fejleményeinek követése a szöuli TéT-szakdiplomata regionális feladataként.',
    },
  },
};

export default orszag;
