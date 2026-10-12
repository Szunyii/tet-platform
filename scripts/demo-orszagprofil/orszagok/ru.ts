/**
 * Oroszország (RU) 2026-os profilja – kutatott vázlat, a relációs vezető pontosítja.
 * Források (hozzáférés: 2026-10-09; a [*] jelűeké: 2026-10-12):
 * - Alapadatok: GDP, 1 főre jutó GDP és reálnövekedés: IMF World Economic Outlook, 2025. október (WEO_2025_OCT_VINTAGE,
 *   2025: GDP 2540,656 Mrd USD, 1 főre 17 445,75 USD, reálnövekedés 0,609%) –
 *   https://api.imf.org/external/sdmx/2.1/data/IMF.RES,WEO_2025_OCT_VINTAGE,1.0.0/RUS.NGDPD+NGDPDPC+NGDP_RPCH+LP.A?startPeriod=2025&endPeriod=2025
 *   (adatkészlet: https://data.imf.org/en/datasets/IMF.RES:WEO)
 *   Lakosság (döntés: a nemzetközileg elismert határok szerint, mert Magyarország és az EU nem ismeri el az annexiót):
 *   ENSZ World Population Prospects 2024, közepes változat, 2025. július 1. (LocID 643): 143 997 393 fő; a WPP a Krímet
 *   Ukrajnánál veszi számba (a WPP 2024 megjegyzései: „(15) Including Crimea.” Ukrajna sorában) –
 *   https://population.un.org/wpp/assets/Excel%20Files/1_Indicator%20(Standard)/CSV_FILES/WPP2024_TotalPopulationBySex.csv.gz
 *   Az IMF orosz adatai a hivatalos orosz statisztikán (Rosstat) alapulnak: az IMF 2024-es lakossága (146,135 millió) azonos az
 *   orosz adatszolgáltatással, amely az ENSZ Demográfiai Évkönyve (2024, 3. tábla, 156. lábjegyzet) szerint a Krímet és
 *   Szevasztopolt is tartalmazza; a Rosstat éves GDP-táblájának 2) lábjegyzete szerint a 2022–2025-ös GDP a Donyeck, Luhanszk,
 *   Zaporizzsja és Herszon régió adatai nélkül értendő – https://rosstat.gov.ru/storage/mediabank/VVP_god_s1995-2025.xlsx ;
 *   a Krímet és Szevasztopolt a Rosstat regionális GDP-táblája az orosz összegben szerepelteti –
 *   https://rosstat.gov.ru/storage/mediabank/VRP_s1998.xlsx
 *   Az IMF 1 főre jutó GDP-je az IMF saját lakosságával (2025: 145,632 millió) számolt; a GDP és az 1 főre jutó GDP ezért az IMF
 *   hivatalos, változatlan értéke, nem a fenti lakossággal újraszámolt.
 * - Terület: ENSZ Demográfiai Évkönyv 2024, 3. tábla (17 098 246 km²) –
 *   https://unstats.un.org/unsd/demographic-social/products/dyb/documents/dyb2024/table03.pdf
 *   (a CIA World Factbook 2026. február 4-én megszűnt: https://www.cia.gov/stories/story/spotlighting-the-world-factbook-as-we-bid-a-fond-farewell/)
 * - GII 2025 (60. hely a 139-ből; 2021: 45.; pillérek; Moszkva klaszter: 48.; 2684 FTE kutató/millió fő, 2022) –
 *   https://www.wipo.int/edocs/gii-ranking/2025/ru.pdf
 * - GERD: UNESCO UIS a Világbank adatbázisában, 2024: 0,937% – https://data.worldbank.org/indicator/GB.XPD.RSDV.GD.ZS?locations=RU
 *   Az állami finanszírozás aránya (2020: a GERD 67,8%-a): OECD MSTI –
 *   https://www.oecd.org/en/data/datasets/main-science-and-technology-indicators.html
 * - Stratégia: a tudományos-technológiai fejlődés stratégiája, 145. sz. elnöki rendelet (2024. február 28.; hosszú távú,
 *   záró év nélkül; a technológiai szuverenitás az elsődleges cél; partnerkeretek: Uniós Állam, FÁK, BRICS, SCO, EAEU) –
 *   https://rulaws.ru/president/Ukaz-Prezidenta-RF-ot-28.02.2024-N-145/
 *   A 309. sz. elnöki rendelet (2024) „technológiai vezető szerep” nemzeti célja, K+F 2% a GDP-ből 2030-ig –
 *   https://xn--90aivcdt6dxbc.xn--p1ai/articles/news/dmitriy-chernyshenko-raskhody-na-nauku-uvelichatsya-do-2-vvp-k-2030-godu/ (объясняем.рф)
 * - EU: az együttműködés felfüggesztése (2022. 03. 03.) és az 5. szankciós csomag (2022. 04. 08.) –
 *   https://research-and-innovation.ec.europa.eu/strategy/strategy-2020-2024/europe-world/international-cooperation/bilateral-cooperation-science-and-technology-agreements-non-eu-countries/russia_en
 *   Horizont Európa 2026–2027, Általános mellékletek (az Oroszországban bejegyzett jogi személyek semmilyen minőségben nem
 *   vehetnek részt, eseti kivétellel) –
 *   https://ec.europa.eu/info/funding-tenders/opportunities/docs/2021-2027/horizon/wp-call/2026-2027/wp-15-general-annexes_horizon-2026-2027_en.pdf
 *   Erasmus+ Programme Guide: Oroszország a 4. régió; a 833/2014/EU rendelet hatálya alá eső szervezetek csak a felhívás engedélyével
 *   és kivétellel, az egyéni mobilitás és a személyes kapcsolatok támogatására vehetnek részt –
 *   https://erasmus-plus.ec.europa.eu/programme-guide/part-a/eligible-countries ;
 *   https://erasmus-plus.ec.europa.eu/programme-guide/part-c/how-to-apply/step-2-compliance
 * - CERN (megfigyelői státusz felfüggesztve 2022. 03. 08.; a megállapodás 2024. 11. 30-án lejárt; CERN–JINR) –
 *   https://physicstoday.aip.org/news/with-no-end-in-sight-for-the-war-in-ukraine-cern-ceases-cooperation-with-russia
 * - Magyar vonatkozás:
 *   - 1993-as egyezmény (kultúra, tudomány, oktatás; 148/1998. Korm. rendelet) – https://njt.jog.gov.hu/jogszabaly/1998-148-20-22
 *   - nukleáris egyezmény, Paks II. (2014. évi II. törvény) – https://njt.jog.gov.hu/jogszabaly/2014-2-00-00
 *   - végzettségek és tudományos fokozatok elismerése (2019. évi XXII. törvény) – https://njt.jog.gov.hu/jogszabaly/2019-22-00-00
 *   - NKFIH 2021-1.2.5-TÉT-IPARI-RU – https://nkfih.gov.hu/english/nrdi-fund/hungarian-russian-cooperation-2021-125-tet-ipari-ru
 *   - a moszkvai TéT-szakdiplomata beszámolói (2023–2024: https://tdf.kormany.hu/download/d/45/43000/2024_MOSZKVA.docx ;
 *     2024–2025: https://nkfih.gov.hu/hivatalrol/tet-szakdiplomatak/tet-beszamolo2024-moszkva): a 2024. szeptember 20-i KKB-ülés és
 *     a két szándéknyilatkozat, SH-jelentkezők (600 fő, 200 hely, 2025/2026), magyar nyelvoktatás 7 egyetemen (2025), ITER, BRICS-elnökség
 *     2024, egyetemi kampuszprogram 2030-ig, az adatgazdasági nemzeti projekt, kutatói elvándorlás, importfüggőség
 *   - Stipendium Hungaricum partnerország – https://stipendiumhungaricum.hu/partners/
 * - Rendezvények: SPIEF (évente, 1997 óta; a 29. fórum: 2026. június 3–6., Expoforum; szervező: Roscongress Alapítvány) – TASS:
 *   https://tass.com/economy/2140121 [*] ; Keleti Gazdasági Fórum (évente, 2015 óta, Vlagyivosztok, Távol-keleti Szövetségi Egyetem;
 *   a 11. fórum: 2026. szeptember 1–4.) – TASS: https://tass.com/economy/2179867 [*] ; INNOPROM – https://innoprom.com/en/ ;
 *   AI Journey (2026. november 25–27.) – https://aij.ru/en
 * - Egyéb: RSF (2013) – https://rscf.ru/en/about/ ; Skolkovo (a Skolkovo Innovációs Központról szóló 244-FZ szövetségi törvény,
 *   2010. 09. 28.) – https://www.wipo.int/wipolex/en/legislation/details/17086 [*] ; NTI (a 2014. december 4-i elnöki üzenet) –
 *   https://nti2035.ru/nti/ [*] ; Minobrnauki (a 215. sz. elnöki rendelet, 2018. 05. 15.: az Oktatási és Tudományos Minisztérium
 *   kettéválasztása) – https://rg.ru/2018/05/15/struktura-site-dok.html [*] ; megagrantok (a 220. sz. kormányrendelet, 2010. 04. 09.) –
 *   https://megagrant.ru/ [*] ;
 *   Prioritet 2030 – https://priority2030.ru/ ; a 2025-től futó nemzeti projektek (pl. Новые атомные и энергетические технологии,
 *   Новые материалы и химия, Средства производства и автоматизации, Беспилотные авиационные системы, Экономика данных) –
 *   https://xn--80aapampemcchfmo7a3c9ehj.xn--p1ai/ (национальныепроекты.рф) ; VEB.RF (a „VEB.RF” állami fejlesztési korporációról szóló
 *   82-FZ szövetségi törvény, 2007. 05. 17.) – https://www.consultant.ru/document/cons_doc_LAW_68404/ [*] ; Interfax, 2022. 10. 03.:
 *   https://interfax.com/newsroom/top-stories/83474/ [*] ; Baikal-GVD (a Bajkál-tó déli részén) – https://baikalgvd.jinr.ru/ [*] ;
 *   tagságok: APEC (Oroszország: 1998. november) – https://www.apec.org/who-we-are/our-members [*] ; EAEU (öt tagállam) –
 *   https://www.eaeunion.org/?lang=en [*] ; SCO (tíz tagállam) – https://eng.sectsco.org/20170109/192193.html [*]
 * Kimaradt blokkok és mezők: nincs kimaradt blokk.
 */
import { rendezvenyek, type DemoOrszag } from '../tipusok';

const orszag: DemoOrszag = {
  kod: 'RU',
  profil: {
    alapadatok: {
      fovaros: 'Moszkva',
      terulet: '17 098 246',
      penznem: 'orosz rubel (RUB)',
      lakossag: '143 997 393',
      gdp: '2 540,7',
      gdpEgyFore: '17 446',
      gdpNovekedes: '0,6',
      adatEv: '2025',
      forras: 'IMF WEO (2025. október; a GDP Rosstat-alapon, a Krímmel), lakosság: ENSZ WPP 2024 (Krím nélkül), terület: ENSZ Demográfiai Évkönyv 2024',
      tagsagok: ['G20', 'BRICS'],
      tagsagEgyeb:
        'ENSZ BT állandó tagja, Eurázsiai Gazdasági Unió (EAEU), Sanghaji Együttműködési Szervezet (SCO), Független Államok Közössége (FÁK), APEC',
      agazatok: ['Energetika', 'Bányászat és nyersanyagok', 'Mezőgazdaság és élelmiszeripar', 'Vegyipar', 'Védelmi ipar'],
      agazatEgyeb: 'Kohászat és fémipar (acél, alumínium, nikkel), atomipar, műtrágyagyártás',
    },
    kfiRendszer: {
      teljesitmeny:
        'A Global Innovation Index 2025-ben a 60. hely a 139 gazdaság között (2021-ben a 45.); legerősebb pillére a humántőke és kutatás (28.), '
        + 'leggyengébb az intézmények pillére (131.). A K+F-ráfordítás 2024-ben a GDP 0,94%-a (UNESCO UIS/Világbank), döntően állami forrásból '
        + '(OECD MSTI, 2020: 67,8%). Nemzeti cél a 2%-os K+F-intenzitás 2030-ig; 2022 óta a hangsúly az importhelyettesítésen és a technológiai szuverenitáson van.',
      gerd: '0,94',
      strategia:
        'A tudományos-technológiai fejlődés stratégiája (145. sz. elnöki rendelet, 2024, hosszú távú); nemzeti célok 2030-ig és 2036-ig (309. sz. elnöki rendelet, 2024)',
      prioritasok: [
        'Technológiai szuverenitás', 'Digitalizáció és MI', 'Ipar 4.0 és gyártás', 'Energiabiztonság',
        'Egészség és élettudomány', 'Védelem és biztonság', 'Űr', 'Tehetség és mobilitás',
      ],
      prioritasEgyeb: 'Importhelyettesítés, élelmezésbiztonság, a közlekedési összeköttetés és az Északi-sarkvidék fejlesztése, klímaalkalmazkodás',
      kiemeltIparagak: [
        'Energetika és fenntarthatóság', 'Űripar', 'Mesterséges intelligencia és adatgazdaság', 'Anyagtudomány',
        'Biotechnológia és gyógyszeripar', 'Agrár- és élelmiszertechnológia', 'Védelmi technológia',
      ],
      iparagEgyeb: 'Atomenergetika és nukleáris technológiák, pilóta nélküli légijármű-rendszerek, szerszámgépgyártás és robotika',
      erossegek:
        'Erős alapkutatás a matematikában, az elméleti és a magfizikában; nagy kutatói állomány (2684 FTE kutató/millió lakos, 2022 – GII). '
        + 'Teljes nukleáris ipari vertikum (Rosatom) és jelentős űrkapacitások (Szojuz, a Nemzetközi Űrállomás orosz szegmense); nagy belső piac (GII: 4. hely), '
        + '„megascience” nagyberendezés-program.',
      kihivasok:
        'Alacsony K+F-intenzitás, állami túlsúly, gyenge vállalati K+F; a GII intézmények pillérében a 131. hely. A 2022 óta érvényes szankciók korlátozzák '
        + 'a hozzáférést a nyugati technológiákhoz és a nemzetközi programokhoz (Horizont Európa, CERN); a mikroelektronikában importfüggőség. '
        + 'A 2022 utáni kutatói elvándorlás és az IT- és mérnökhiány az utánpótlást is érinti.',
    },
    intezmenyek: {
      iranyitoSzervek:
        'Elnöki Tudományos és Oktatási Tanács – legfelső szintű tanácsadó testület.\n'
        + 'Tudományos és Felsőoktatási Minisztérium (Minobrnauki, 2018) – tudománypolitika; a legtöbb állami egyetem és az akadémiai intézetek fenntartója.\n'
        + 'Orosz Tudományos Akadémia (RAN) – tudományos-módszertani irányítás, szakértés.\n'
        + 'Ipari és Kereskedelmi Minisztérium (Minpromtorg) – ipari technológiai programok.\n'
        + 'Ügynökségek: Orosz Tudományos Alap (RSF, 2013), Innovációtámogatási Alap (FASIE), Skolkovo Alapítvány.',
      egyetemek:
        'Lomonoszov Moszkvai Állami Egyetem (MSU), Szentpétervári Állami Egyetem, MIPT (Moszkvai Fizikai-Műszaki Intézet), HSE University, '
        + 'Bauman Moszkvai Állami Műszaki Egyetem, ITMO (Szentpétervár), Novoszibirszki Állami Egyetem, Tomszki Állami Egyetem, MEPhI (nukleáris kutatóegyetem), Skoltech.',
      kutatokozpontok:
        'Kurcsatov Intézet (NRC „Kurchatov Institute”), Egyesített Atomkutató Intézet (JINR, Dubna – kormányközi szervezet); a RAN intézetei, pl. Lebegyev Fizikai '
        + 'Intézet (FIAN), Ioffe Intézet, Budker Magfizikai Intézet, Szteklov Matematikai Intézet, Űrkutatási Intézet (IKI); a Rosatom kutatóintézetei.',
      infrastrukturak:
        '„Megascience” nagyberendezések: NICA ütköztető (JINR, Dubna), SKIF szinkrotronsugárforrás (Kolcovo, Novoszibirszki terület), PIK kutatóreaktor (Gatcsina); '
        + 'Baikal-GVD neutrínóteleszkóp (Bajkál-tó); Akademgorodok tudományváros (Novoszibirszk); a Nemzetközi Űrállomás orosz szegmense.',
    },
    vallalati: {
      kiemeltAgazatok: [
        'Energetika és fenntarthatóság', 'IKT és digitalizáció', 'Űripar', 'Mesterséges intelligencia és adatgazdaság',
        'Agrár- és élelmiszertechnológia', 'Védelmi technológia',
      ],
      agazatEgyeb: 'Atomipar (Rosatom), olaj- és gázipari technológiák, kiberbiztonság, szoftverfejlesztés',
      topVallalatok: [
        'Gazprom', 'Rosneft', 'Sberbank', 'Lukoil', 'Rosatom',
        'Rostec', 'Yandex', 'Nornickel', 'Novatek', 'Russian Railways (RZD)',
      ].join('\n'),
      startupok:
        'A technológiai KKV-kat az Innovációtámogatási Alap (FASIE) Start és UMNIK programjai, valamint a Skolkovo Alapítvány támogatásai segítik. '
        + 'A nyugati szoftvercégek 2022-es kivonulása után az orosz IT-piac a hazai fejlesztők felé fordult; a digitális szektor meghatározó szereplői '
        + 'a Yandex, a VK, a Kaspersky Lab, az Ozon és a Wildberries.',
      klaszterek:
        'Skolkovo Innovációs Központ (Moszkva, 2010), Akademgorodok (Novoszibirszk), Innopolisz (Tatárföld); technológiai-innovációs különleges gazdasági övezetek '
        + '(pl. Zelenograd, Dubna, Tomszk, Szentpétervár); a 2030-ig tartó egyetemi kampuszépítési program a kutatás és az ipar összekapcsolását is szolgálja.',
      technologiatranszfer:
        'A Nemzeti Technológiai Kezdeményezés (NTI) egyetemi kompetenciaközpontjai; innovációs tudományos-technológiai központok (INTC); '
        + 'a Prioritet 2030 egyetemi program és az élvonalbeli mérnöki iskolák ipari partnerségei; az állami vállalatok (Rosatom, Rostec) technológiai programjai.',
    },
    programok: {
      palyazatok:
        'Az Orosz Tudományos Alap (RSF) versenyalapú pályázatai kutatócsoportoknak, fiatal kutatóknak és laboroknak; '
        + 'a Tudományos és Felsőoktatási Minisztérium megagrantjai (2010 óta) vezető kutatók által irányított új laborok létrehozására; '
        + 'az állami kutatóintézetek feladatalapú finanszírozása.',
      tamogatasiProgramok:
        'Prioritet 2030 egyetemfejlesztési program (2030-ig); a technológiai vezető szerep nemzeti projektjei (2025–2030), pl. „Új atom- és energetikai technológiák”, '
        + '„Új anyagok és kémia”, „Termelőeszközök és automatizálás”, „Pilóta nélküli légijármű-rendszerek”; a FASIE Start és UMNIK programjai; Skolkovo-támogatások.',
      finanszirozasiEszkozok:
        'VEB.RF állami fejlesztési intézmény; az Ipari Fejlesztési Alap (FRP) kedvezményes hitelei; az „Adatgazdaság és az állam digitális átalakítása” nemzeti projekt '
        + '(a közszféra és az állami vállalatok hazai szoftverre állását több mint 50 milliárd rubellel támogatja); K+F-adókedvezmények; a nagy állami vállalatok K+F-programjai.',
      nemzetkoziReszvetel:
        'Orosz szervezetek 2022 óta nem vehetnek részt a Horizont Európában (az állami hátterűek részvétele a folyamatban lévő projektekben is megszűnt); '
        + 'a 2026–2027-es munkaprogram szerint orosz jogi személyek semmilyen minőségben nem lehetnek résztvevők (eseti kivétellel). Az Erasmus+-ban az Oroszországban bejegyzett (és a többségi orosz '
        + 'tulajdonú) szervezetek a 833/2014/EU rendelet 5l. cikke miatt csak a felhívás engedélyével és kivétellel, egyéni mobilitás és személyes kapcsolatok '
        + 'céljából vehetnek részt. '
        + 'Fő csatornák: ITER, JINR, a BRICS TéT-keretprogram, az SCO és az EAEU.',
    },
    rendezvenyek: rendezvenyek([
      { nev: 'Szentpétervári Nemzetközi Gazdasági Fórum (SPIEF)', tipus: 'forum', idopont: 'június, Szentpétervár (ExpoForum)', megjegyzes: 'Gazdasági fórum technológiai szekciókkal (Roscongress)' },
      { nev: 'INNOPROM', tipus: 'szakkiallitas', idopont: 'július, Jekatyerinburg', megjegyzes: 'Nemzetközi ipari kiállítás' },
      { nev: 'Keleti Gazdasági Fórum (EEF)', tipus: 'forum', idopont: 'szeptember, Vlagyivosztok (Távol-keleti Szövetségi Egyetem)', megjegyzes: 'Ázsiai–csendes-óceáni gazdasági fórum' },
      { nev: 'AI Journey', tipus: 'konferencia', idopont: 'november, Moszkva', megjegyzes: 'Mesterséges intelligencia (Sber); 2026: november 25–27.' },
    ]),
    kapcsolatok: {
      euMultilateralis:
        'Az Európai Bizottság 2022. március 3-án felfüggesztette a kutatási és innovációs együttműködést az orosz szervezetekkel; az 5. szankciós csomag '
        + '(2022. április 8.) után az állami hátterű szervezetek részvétele a folyamatban lévő projektekben is megszűnt. A CERN 2022-ben felfüggesztette '
        + 'Oroszország megfigyelői státuszát, megállapodása 2024. november 30-án lejárt. Oroszország az ITER tagja, 2024-ben a BRICS soros elnöke volt.',
      partnerorszagok:
        'A 2024-es stratégia kiemelt partnerként a Belarusszal alkotott Uniós Államot, a FÁK-tagállamokat és a „barátságos” országokat nevezi meg (keretek: BRICS, SCO, '
        + 'EAEU). A moszkvai TéT-szakdiplomata 2023–2025-ös beszámolói szerint az orosz egyetemek elsősorban Kína, India, Közép- és Délkelet-Ázsia felé építenek új kapcsolatokat.',
      egyezmeny:
        'Magyar–orosz egyezmény a kultúra, a tudomány és az oktatás területén folyó együttműködésről (Moszkva, 1993; kihirdetve: 148/1998. Korm. rendelet)',
      ketoldalu:
        'Paks II.: a 2014-es kormányközi nukleáris egyezmény (2014. évi II. törvény) két új VVER-blokkot irányoz elő, kutatási és képzési együttműködéssel. '
        + 'Az NKFIH 2021-ben magyar–orosz alkalmazott K+F felhívást hirdetett (2021-1.2.5-TÉT-IPARI-RU). A gazdasági együttműködési kormányközi bizottság '
        + '2024. szeptember 20-i ülésén két felsőoktatási szándéknyilatkozatot írtak alá (Stipendium Hungaricum 2024–2026; felsőoktatási együttműködés).',
      mobilitas:
        'Stipendium Hungaricum partnerország (felelős szerv: Tudományos és Felsőoktatási Minisztérium); a 2025/2026-os tanévre 600-an jelentkeztek a 200 helyre. '
        + 'Hatályos a végzettségek és tudományos fokozatok kölcsönös elismeréséről szóló egyezmény (2018; 2019. évi XXII. törvény). Magyar nyelvet 7 orosz egyetemen '
        + 'oktatnak (2025), 4 helyen államközi egyezmény alapján.',
    },
    magyarErtekeles: {
      osszegzes:
        'Oroszország kutatási rendszere nagy, döntően államilag finanszírozott: erős alapkutatás, nukleáris és űrtechnológiai kapacitások, de alacsony '
        + 'K+F-intenzitás (0,94%, 2024). Az együttműködést 2022 óta az uniós szankciók és az orosz szervezetek uniós kutatási programokból való kizárása korlátozza; '
        + 'a kapcsolatok súlypontja a felsőoktatás (Stipendium Hungaricum) és a Paks II.-höz kötődő nukleáris terület.',
      egyuttmukodesiLehetosegek:
        'A Paks II.-höz kapcsolódó nukleáris szakemberképzés és sugárbiztonsági kutatás; nukleáris medicina; alapkutatás (matematika, elméleti fizika) egyéni '
        + 'kutatói szinten; sarki és klímakutatás; felsőoktatási mobilitás – mindenhol az uniós szankciós és exportellenőrzési szabályok előzetes vizsgálatával.',
      joGyakorlatok:
        'A megagrant program: vezető (akár külföldi) kutatók köré szervezett új laborok; a Prioritet 2030 versenyalapú egyetemfejlesztési támogatása; '
        + 'az élvonalbeli mérnöki iskolák ipari partnerekkel közösen kialakított képzése.',
      diplomaciaiPrioritasok:
        'A felsőoktatási és tudományos párbeszéd fenntartása a szankciós megfelelés biztosításával; a 2024-es felsőoktatási szándéknyilatkozatok végrehajtása; '
        + 'a Stipendium Hungaricum-alumnihálózat építése; a Paks II.-höz kötődő képzési és kutatási együttműködés támogatása.',
    },
  },
};

export default orszag;
