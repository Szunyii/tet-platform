/**
 * Kína (CN) 2026-os profilja – kutatott vázlat, a relációs vezető pontosítja.
 * Források (hozzáférés: 2026-10-09; a [*] jelűeké: 2026-10-12):
 * - Alapadatok: IMF World Economic Outlook, 2025. október (WEO_2025_OCT_VINTAGE, 2025: GDP 19 398,577 Mrd USD,
 *   1 főre 13 806,031 USD, reálnövekedés 4,796%, lakosság 1405,08 millió) –
 *   https://api.imf.org/external/sdmx/2.1/data/IMF.RES,WEO_2025_OCT_VINTAGE,1.0.0/CHN.NGDPD+NGDPDPC+NGDP_RPCH+LP.A?startPeriod=2025&endPeriod=2025
 *   (adatkészlet: https://data.imf.org/en/datasets/IMF.RES:WEO)
 * - Terület: ENSZ Demográfiai Évkönyv 2024, 3. tábla (9 600 000 km², a kínai statisztikai hivatal adata) –
 *   https://unstats.un.org/unsd/demographic-social/products/dyb/documents/dyb2024/table03.pdf
 *   (a CIA World Factbook 2026. február 4-én megszűnt: https://www.cia.gov/stories/story/spotlighting-the-world-factbook-as-we-bid-a-fond-farewell/)
 * - GII 2025 (10. hely a 139-ből, először a top 10-ben; felső-közepes jövedelműek között 1.; pillérek; 24 top klaszter,
 *   Shenzhen–Hong Kong–Guangzhou 1., Peking 4., Sanghaj–Szucsou 6., Hangcsou 13., Nanking 15.; mutatószintű erősségek
 *   és gyengeségek) – https://www.wipo.int/edocs/gii-ranking/2025/cn.pdf
 * - GERD: OECD MSTI, 2024: 2,69% (vállalati végrehajtás 77,7%, alapkutatás 0,185% a GDP-ből ≈ a GERD 6,9%-a,
 *   kutatók 3,18 millió FTE) – https://www.oecd.org/en/data/datasets/main-science-and-technology-indicators.html
 *   (lekérdezés: https://sdmx.oecd.org/public/rest/data/OECD.STI.STP,DSD_MSTI@DF_MSTI,/CHN.....?startPeriod=2020)
 *   2025: több mint 3,92 billió jüan, a GDP 2,8%-a (az Állami Tanács Tájékoztatási Hivatalának sajtótájékoztatója, 2026. 09. 29.);
 *   ugyanitt Csiu Jung MOST-miniszterhelyettes:
 *   a Nemzeti Kockázatitőke-irányító Alap és a többi nemzeti szintű alap mérete meghaladja a 700 milliárd jüant –
 *   https://www.news.cn/20260930/d25e01d9e70d48158df107d7969ae334/c.html
 * - Stratégia: a 15. ötéves terv (2026–2030) vázlatát az NPC 2026. március 12-én fogadta el –
 *   https://subsites.chinadaily.com.cn/npc/2026-03/13/c_1168082.htm ; tartalom: https://www.everycrsreport.com/reports/IF13204.html ;
 *   az innovációvezérelt fejlődés nemzeti stratégiájának vázlata (2016. május; célok 2020/2030/2050) –
 *   https://www.rmzxw.com.cn/c/2016-05-20/824038.shtml
 * - Intézmények: a 2023-as reform (CSTC, MOST, Nemzeti Adatügyi Hivatal) –
 *   https://www.china-briefing.com/news/china-state-council-restructuring-2023-two-sessions/ ; NSFC (1986, RFIS) –
 *   https://www.nsfc.gov.cn/english/site_1/index.html ; MOST háttérintézményei (ITER China, Új Minőségi Termelőerők Központ) –
 *   https://en.most.gov.cn/organization/Affiliated/index.html
 * - Technológiai tőzsdék (China Technology Exchange, Shanghai Technology Exchange) –
 *   https://regional.chinadaily.com.cn/bjzpark/2020-08/19/c_530008.htm (China Technology Exchange, Peking) ;
 *   https://subsites.chinadaily.com.cn/en/2020-10/29/c_558054.htm (Shanghai Technology Exchange)
 * - Big Fund III (megalapítva 2024. 05. 24-én, 344 Mrd jüan jegyzett tőkével) – Reuters, 2024. 05. 27.:
 *   https://www.thejakartapost.com/business/2024/05/27/china-sets-up-third-fund-with-475-bln-to-boost-semiconductor-sector [*] ;
 *   STAR Market (a kereskedés 2019. 07. 22-én indult a Sanghaji Értéktőzsdén, 25 céggel) – China Daily, 2019. 07. 22.:
 *   https://www.chinaservicesinfo.com/s/201907/22/WS5d357edc498ed6fd11ca21a2/chinas-sci-tech-innovation-board-starts-trading.html [*] ;
 *   „STI 2030” nagyprojektek (repülőgép-hajtóművek és gázturbinák, kvantumkommunikáció és kvantumszámítógép, agykutatás, intelligens
 *   gyártás és robotok stb.) – az Államtanács közleménye a 13. ötéves nemzeti TéT-innovációs tervről, 2016. 08. 08.:
 *   https://www.gov.cn/zhengce/content/2016-08/08/content_5098072.htm [*] ;
 *   WTO-tagság (2001. 12. 11. óta) – https://www.wto.org/english/thewto_e/countries_e/china_e.htm [*] ;
 *   RCEP (az ASEAN tíz tagállama, Ausztrália, Kína, Japán, Új-Zéland és a Koreai Köztársaság megállapodása) – https://rcepsec.org/ [*]
 * - „AI+” kezdeményezés és „új minőségi termelőerők” – a 2024. március 5-i kormányzati munkajelentés:
 *   https://english.www.gov.cn/news/202403/13/content_WS65f0dfccc6d0868f4e8e5079.html [*] (a teljes szöveg:
 *   https://english.www.gov.cn/atts/stream/files/65f0dcf6c6d0c788098fff25 [*])
 * - EU–Kína TéT-megállapodás (1998; 2000/16/EK tanácsi határozat) – https://www.eumonitor.eu/9353000/1/j9vvik7m1c3gyxp/vitgbgi655zg ;
 *   Horizont Európa 2026–2027, Általános mellékletek (IA-kizárás, RIA csak megnevezett destinációkban, a MIIT-hez tartozó egyetemek kizárása) –
 *   https://ec.europa.eu/info/funding-tenders/opportunities/docs/2021-2027/horizon/wp-call/2026-2027/wp-15-general-annexes_horizon-2026-2027_en.pdf
 * - USA–Kína TéT-megállapodás meghosszabbítása (2024. 12. 13.) – https://english.www.gov.cn/news/202412/14/content_WS675cbe2dc6d0868f4e8edf27.html ;
 *   Csengtui Nyilatkozat (2025) – https://en.most.gov.cn/pressroom/202511/t20251104_195122.html ;
 *   Nemzetközi TéT-együttműködési Kezdeményezés (MOST, 2023. 11. 07.) – https://en.most.gov.cn/pressroom/202311/t20231107_188729.html
 * - Akkumulátoripar: a globális akkumulátorgyártó kapacitás és a 2025-ös termelés több mint 80%-a Kínában; a kínai gyártók
 *   részesedése az elektromos autók akkumulátor-telepítéseiben 2025-ben közel 75%; a CATL a világ legnagyobb akkumulátorgyártója –
 *   IEA Global EV Outlook 2026: https://www.iea.org/reports/global-ev-outlook-2026/electric-vehicle-batteries
 *   A CATL székhelye Ningde (Fujian) – https://www.catl.com/en/contactus/ [*]
 * - Magyar vonatkozás:
 *   - 2002-es TéT-megállapodás, vegyes bizottság (8. ülés: 2019. 04. 26., Peking), közös pályázatok, akadémiai megállapodás (1984),
 *     közös laborok (az akkori MTA Wigner FK és a CAS IMP, 2016; MTA KOKI és CAS ION, 2018 – ma HUN-REN Wigner, HUN-REN KOKI),
 *     ELI ALPS–SIOM (2018): pekingi TéT-szakdiplomata beszámolója (2018–2019) –
 *     https://nkfih.gov.hu/hivatalrol/tet-szakdiplomatak/2018-2019-tet-eves-191003-3
 *   - 2024-1.2.8-TÉT-IPARI-CN (kínai oldalon a MOST; 2025-re 1 Mrd Ft) –
 *     https://nkfih.gov.hu/palyazoknak/nkfi-alap/magyar-kinai-alkalmazott-kf-egyuttmukodes-2024-128-tet-ipari-cn/palyazati-csomag/palyazati-felhivas
 *   - 2025-1.2.6-HU-CN-LABOR (BME, Állatorvostudományi Egyetem) – https://nkfih.gov.hu/english/nrdi-fund/funded-projects-2025-126-hu-cn-labor
 *   - 2025-1.2.7-HU-CN-PARTNER (10 projekt, 100 M Ft) –
 *     https://nkfih.gov.hu/english/nrdi-fund/hungarian-chinese-partner-institution-program-2025-127-hu-cn-partner/call-for-applications
 *   - 2026-1.2.2-TÉT (francia és kínai reláció, a kínai relációra tervezett keret 120 M Ft; a kódszám a felhívás oldalának címében és
 *     dokumentumaiban így szerepel, az URL-ben „2026-112-tet”) –
 *     https://nkfih.gov.hu/palyazoknak/nkfi-alap/ketoldalu-tudomanyos-technologiai-egyuttmukodes-tamogatasa-2026-112-tet/palyazati-felhivas [*]
 *   - 2024-1.2.5-TÉT kínai reláció (50 M Ft) –
 *     https://nkfih.gov.hu/palyazoknak/nkfi-alap/ketoldalu-tudomanyos-technologiai-egyuttmukodes-tamogatasa-2024-125-tet/palyazati-csomag/palyazati-felhivas
 *   - Stipendium Hungaricum partnerország (China Scholarship Council) – https://stipendiumhungaricum.hu/partners/
 *   - CATL Debrecen – https://cnevpost.com/2022/09/06/catl-launches-battery-facility-project-in-hungary/ ;
 *     BYD európai központ és K+F-központ (2025) – https://www.byd.com/eu/news-list/BYD_commits_to_new_HQ_and_RD_base_in_Hungary ;
 *     BYD Szeged – https://www.electrive.com/2026/02/02/byd-begins-trial-production-of-passenger-cars-in-hungary/
 * - Rendezvények: https://www.zgcforum.com.cn/ (a 2026-os éves fórum Pekingben) ; WAIC – https://www.worldaic.com.cn/ (2026: július 17–20., Sanghaj)
 *   és https://english.shanghai.gov.cn/en-Latest-WhatsNew/20260708/0f7a6b8168d748d8bf9d37d00b6c7b1f.html [*] (július 17–20.; Sanghaj nyolc egymást
 *   követő évben adott otthont a konferenciának) ; https://www.worldrobotconference.com/ (Peking, augusztus) ;
 *   https://www.chtf.com/ (2026: 28. CHTF, Sencsen) ; https://www.wicinternet.org/ (2026: november, Vucsen) ;
 *   CIIE – https://www.ciie.org/zbh/en/ [*] (a 9. CIIE: 2026. november 5–10., National Exhibition and Convention Center, Sanghaj) ;
 *   Airshow China – https://www.airshow.com.cn/Category_1216/Index.aspx [*] (kétévente, Csuhaj; a 2026-os kiállítás december 7–13.) ;
 *   a 2024-es kiállítás november 12-én nyílt Csuhajban – GDToday: https://www.newsgd.com/node_5c070fdd03/2a690f6f55.shtml [*]
 * Kimaradt blokkok és mezők: nincs kimaradt blokk. A kiemelt iparágak közül az első (Hidrogén és akkumulátor) Kína globális
 * akkumulátoripari pozíciója miatt: a globális gyártókapacitás és a 2025-ös termelés több mint 80%-a Kínában van, a kínai gyártók
 * részesedése az elektromosautó-akkumulátorokban közel 75%, a CATL a világ legnagyobb gyártója (IEA GEVO 2026); a GII-ben a CATL
 * székhelye, Ningde a 4. klaszter intenzitás szerint.
 */
import { rendezvenyek, type DemoOrszag } from '../tipusok';

const orszag: DemoOrszag = {
  kod: 'CN',
  profil: {
    alapadatok: {
      fovaros: 'Peking',
      terulet: '9 600 000',
      penznem: 'kínai jüan (CNY)',
      lakossag: '1 405 080 000',
      gdp: '19 398,6',
      gdpEgyFore: '13 806',
      gdpNovekedes: '4,8',
      adatEv: '2025',
      forras: 'IMF World Economic Outlook (2025. október); terület: ENSZ Demográfiai Évkönyv 2024 (a kínai statisztikai hivatal adata)',
      tagsagok: ['G20', 'BRICS'],
      tagsagEgyeb: 'ENSZ BT állandó tagja, APEC, Sanghaji Együttműködési Szervezet (SCO), RCEP, WTO (2001 óta)',
      agazatok: ['Elektronika és félvezetők', 'Gépipar', 'Autóipar', 'Vegyipar', 'IKT és szoftver', 'Építőipar'],
      agazatEgyeb: 'Acélipar, textilipar, akkumulátor- és napelemgyártás, hajógyártás',
    },
    kfiRendszer: {
      teljesitmeny:
        'A Global Innovation Index 2025-ben a 10. hely – először a legjobb tízben, a felső-közepes jövedelműek között az első; a tudás- és technológiai kibocsátásban '
        + 'világelső, az intézmények pillérében 44. A top klaszterek között 24 kínai van, a Sencsen–Hongkong–Kanton az első. A K+F-ráfordítás 2024-ben a GDP 2,69%-a '
        + '(OECD MSTI), a nemzeti adat szerint 2025-ben 2,8%; a ráfordítás 77,7%-át a vállalatok végzik (2024).',
      gerd: '2,69',
      strategia: '15. ötéves terv (2026–2030, elfogadva 2026 márciusában); az innovációvezérelt fejlődés nemzeti stratégiájának vázlata (2016, célok 2020/2030/2050)',
      prioritasok: [
        'Technológiai szuverenitás', 'Digitalizáció és MI', 'Alapkutatási kiválóság', 'Ipar 4.0 és gyártás',
        'Zöld átállás és klímasemlegesség', 'Egészség és élettudomány', 'Űr', 'Tehetség és mobilitás',
      ],
      prioritasEgyeb: '„Új minőségi termelőerők”, „AI+” (mesterséges intelligencia+) akció, a szén-dioxid-kibocsátási csúcs és a karbonsemlegesség („kettős szén-cél”)',
      kiemeltIparagak: [
        'Hidrogén és akkumulátor', 'Mesterséges intelligencia és adatgazdaság', 'Félvezetők és mikroelektronika', 'Mobilitás és autóipar',
        'Kvantumtechnológia', 'Biotechnológia és gyógyszeripar', 'Űripar',
      ],
      iparagEgyeb: 'Robotika (humanoid robotok), agy–számítógép interfész, biogyártás, 6G, napelemgyártás',
      erossegek:
        'A világ legnagyobb kutatói állománya (2024: 3,18 millió FTE – OECD MSTI) és erős vállalati K+F; a GII szerint a belföldi piac mérete és a GDP-arányos '
        + 'használati minták, ipari minták és védjegyek alapján világelső. A globális akkumulátorgyártás több mint 80%-a Kínában folyik, a CATL a világ legnagyobb '
        + 'akkumulátorgyártója (IEA, 2026); nagy kutatási infrastruktúrák és missziós állami programok.',
      kihivasok:
        'Alacsony alapkutatási arány (2024: a K+F 6,9%-a); importfüggőség a csúcschipek, gyártóberendezések, ipari szoftverek és műszerek terén, amelyet az amerikai '
        + 'exportkorlátozások tovább nehezítenek – a 15. ötéves terv „rendkívüli intézkedéseket” ír elő. Gyengébb GII-eredmények: az intézmények pillére (44.), a nemzetközi '
        + 'hallgatói beáramlás (107.). Csökkenő, öregedő népesség; korlátozott uniós programrészvétel.',
    },
    intezmenyek: {
      iranyitoSzervek:
        'Központi Tudományos és Technológiai Bizottság (CSTC, 2023) – a TéT-politika legfelső szintű irányítása a KKP KB alatt.\n'
        + 'Tudományos és Technológiai Minisztérium (MOST) – stratégia, nemzeti K+F programok; 2023 óta a CSTC hivatali feladatait is ellátja.\n'
        + 'Kínai Nemzeti Természettudományi Alap (NSFC, 2018 óta a MOST alatt) – alapkutatás-finanszírozás.\n'
        + 'Ágazati szervek: Ipari és Informatikai Minisztérium (MIIT), Nemzeti Fejlesztési és Reformbizottság (NDRC; alatta a Nemzeti Adatügyi Hivatal), '
        + 'Oktatási Minisztérium, Nemzeti Szellemi Tulajdon Hivatal (CNIPA); akadémiák: Kínai Tudományos Akadémia (CAS), Kínai Mérnöki Akadémia (CAE).',
      egyetemek:
        'Tsinghua Egyetem és Pekingi Egyetem (Peking), Zhejiang Egyetem (Hangcsou), Shanghai Jiao Tong Egyetem és Fudan Egyetem (Sanghaj), '
        + 'University of Science and Technology of China (USTC, Hofej), Harbin Institute of Technology, Nankingi Egyetem, '
        + 'Huazhong University of Science and Technology (Vuhan), Sun Yat-sen Egyetem (Kanton).',
      kutatokozpontok:
        'A CAS intézethálózata (pl. Institute of Physics, Institute of Computing Technology, Institute of Neuroscience – Sanghaj); nemzeti laboratóriumok '
        + '(pl. Pengcheng Laboratory – Sencsen, Zhangjiang Laboratory – Sanghaj); CAAS (agrártudomány), CAMS (orvostudomány), Beijing Academy of Artificial Intelligence (BAAI).',
      infrastrukturak:
        'FAST 500 méteres rádióteleszkóp (Kujcsou tartomány), Tiangong űrállomás, EAST szupravezető tokamak (Hofej), Shanghai Synchrotron Radiation Facility (SSRF), '
        + 'China Spallation Neutron Source (Tungkuan), LHAASO kozmikussugár-obszervatórium (Szecsuan), nemzeti szuperszámítógép-központok (Vuhszi, Tiencsin, Kanton).',
    },
    vallalati: {
      kiemeltAgazatok: [
        'Hidrogén és akkumulátor', 'Mobilitás és autóipar', 'Mesterséges intelligencia és adatgazdaság', 'Félvezetők és mikroelektronika',
        'IKT és digitalizáció', 'Energetika és fenntarthatóság',
      ],
      agazatEgyeb: 'Napelem- és szélenergia-ipar, robotika, drónok, telekommunikáció (5G)',
      topVallalatok: [
        'Huawei', 'Tencent', 'Alibaba Group', 'BYD', 'CATL',
        'ByteDance', 'Baidu', 'Xiaomi', 'ZTE', 'SMIC',
      ].join('\n'),
      startupok:
        'A STAR Market (a Sanghaji Értéktőzsde tudományos-technológiai innovációs szegmense, 2019) a mélytech-cégek tőzsdei finanszírozását segíti; '
        + 'a MIIT „specializált, kifinomult, különleges és innovatív” („kis óriás”) KKV-programja a technológiai beszállítókat támogatja. '
        + 'Ismert MI- és robotikai startupok: DeepSeek, Moonshot AI, Zhipu AI, Unitree Robotics.',
      klaszterek:
        'A GII 2025 top klaszterei: Sencsen–Hongkong–Kanton (1.), Peking (4.), Sanghaj–Szucsou (6.), Hangcsou (13.), Nanking (15.); '
        + 'Zhongguancun Tudományos Park (Peking), Zhangjiang Tudományváros (Sanghaj), a hofeji átfogó nemzeti tudományos központ, a Kuangtung–Hongkong–Makaó Nagy Öböl-térség (Greater Bay Area).',
      technologiatranszfer:
        'A tudományos-technológiai eredmények hasznosításának előmozdításáról szóló törvény ösztönzi a kutatói és intézményi hasznosítást; '
        + 'technológiai tőzsdék (pl. China Technology Exchange – Peking, Shanghai Technology Exchange); egyetemi technológiatranszfer-központok; '
        + 'a Zhongguancun Fórum technológiai tranzakciós platformja.',
    },
    programok: {
      palyazatok:
        'NSFC alapkutatási pályázatok (általános, fiatal és kiváló fiatal kutatói programok; külföldieknek: Research Fund for International Scientists – RFIS); '
        + 'a MOST nemzeti kiemelt K+F programjai; a „Tudományos és technológiai innováció 2030” nagyprojektek (pl. repülőgép-hajtóművek, kvantumtechnológia, '
        + 'agykutatás, intelligens gyártás).',
      tamogatasiProgramok:
        'Az Övezet és Út TéT-együttműködési akcióterv programjai (közös laboratóriumok, kutatócsere); a CAS President’s International Fellowship Initiative (PIFI) '
        + 'külföldi kutatóknak; az „AI+” akció ágazati programjai; tartományi és városi tehetség- és innovációs programok.',
      finanszirozasiEszkozok:
        'Az integráltáramkör-ipari nemzeti befektetési alap („Big Fund”) III. szakasza (2024, 344 milliárd jüan jegyzett tőke); a Nemzeti Kockázatitőke-irányító Alap '
        + 'és más nemzeti szintű alapok (a MOST miniszterhelyettese szerint 2026 szeptemberében együttesen több mint 700 milliárd jüan); a STAR Market; '
        + 'a K+F-költségek többletlevonása a társasági adóalapból.',
      nemzetkoziReszvetel:
        'Kína nem társult ország a Horizont Európában, a kínai szervezetek részvétele korlátozott (lásd Kapcsolatok). ITER-tag; a BRICS TéT-keretprogram multilaterális felhívásai; '
        + 'kétoldalú közös felhívások (pl. NKFIH–MOST); az Övezet és Út közös laboratóriumai; az NSFC RFIS és a CAS PIFI külföldi kutatóknak.',
    },
    rendezvenyek: rendezvenyek([
      { nev: 'Zhongguancun Fórum (ZGC Forum)', tipus: 'forum', idopont: 'tavasz, Peking', megjegyzes: 'Nemzeti szintű innovációs fórum technológiai tranzakciós platformmal' },
      { nev: 'World Artificial Intelligence Conference (WAIC)', tipus: 'konferencia', idopont: 'július, Sanghaj', megjegyzes: 'Mesterséges intelligencia: konferencia és kiállítás' },
      { nev: 'World Robot Conference', tipus: 'konferencia', idopont: 'augusztus, Peking', megjegyzes: 'Konferencia, kiállítás és verseny' },
      { nev: 'China Hi-Tech Fair (CHTF)', tipus: 'szakkiallitas', idopont: 'november, Sencsen', megjegyzes: 'Csúcstechnológiai vásár; 2026-ban a 28.' },
      { nev: 'World Internet Conference – Wuzhen Summit', tipus: 'konferencia', idopont: 'november, Vucsen (Csöcsiang tartomány)' },
      { nev: 'China International Import Expo (CIIE)', tipus: 'szakkiallitas', idopont: 'november, Sanghaj', megjegyzes: 'Nemzetközi importkiállítás; 2026: 9. CIIE, november 5–10.' },
      { nev: 'Airshow China', tipus: 'szakkiallitas', idopont: 'páros években november–december, Csuhaj', megjegyzes: 'Repülő- és űripari kiállítás; 2026: december 7–13. (2024-ben novemberben volt)' },
    ]),
    kapcsolatok: {
      euMultilateralis:
        'EU–Kína TéT-megállapodás (1998). Kína nem társult ország a Horizont Európában; a 2026–2027-es munkaprogram szerint kínai jogi személyek innovációs akciókban '
        + 'nem, kutatási-innovációs akciókban csak megnevezett területeken (pl. a 2., 5. és 6. klaszter egyes részei, missziók, Widening) vehetnek részt, a MIIT-hez '
        + 'tartozó állami egyetemek egyikben sem. Kína az ITER tagja; BRICS-, SCO- és APEC-együttműködés.',
      partnerorszagok:
        'USA (az 1979-es TéT-megállapodást 2024 decemberében módosítva öt évre meghosszabbították), Oroszország és a BRICS-országok, valamint az Övezet és Út partnerei '
        + '(Csengtui Nyilatkozat az Övezet és Út TéT-közösség építéséről, 2025); a MOST 2023-ban Nemzetközi TéT-együttműködési Kezdeményezést hirdetett.',
      egyezmeny: 'Magyar–kínai tudományos és technológiai együttműködési megállapodás (2002)',
      ketoldalu:
        'A 2002-es megállapodás alapján közös pályázatok (2019-ig kétévente; a kétoldalú TéT-felhívás kínai relációja legutóbb a 2024-1.2.5-TÉT és a 2026-1.2.2-TÉT felhívásban szerepelt) és vegyes bizottság '
        + '(a 8. ülés 2019. április 26-án Pekingben volt). NKFIH–MOST alkalmazott K+F program '
        + '(2024-1.2.8-TÉT-IPARI-CN; témák: informatika és digitális átállás, agrár- és élelmiszertudomány, egészség, megújuló energia és környezet, matematika, kémia, fizika); '
        + 'közös laborok (2025: BME, Állatorvostudományi Egyetem; korábban HUN-REN Wigner, HUN-REN KOKI); akadémiai megállapodás (1984), ELI ALPS–SIOM (2018). '
        + 'Kínai ipar: CATL (Debrecen), BYD (Szeged; 2025-ben bejelentett budapesti K+F-központ).',
      mobilitas:
        'Stipendium Hungaricum partnerország (China Scholarship Council). NKFIH: a kétoldalú felhívás kínai relációja (2024-1.2.5-TÉT: 50 millió Ft; 2026-1.2.2-TÉT: tervezett keret 120 millió Ft) és a '
        + '2025-1.2.7-HU-CN-PARTNER partnerintézményi program (10 projekt, kiutazások Kínába); külföldi kutatóknak NSFC RFIS és CAS PIFI.',
    },
    magyarErtekeles: {
      osszegzes:
        'Kína a GII 2025-ben először került a top 10-be, GERD-je 2,69% (2024), kutatói állománya a világ legnagyobb. A magyar–kínai TéT-kapcsolatok intézményesek '
        + '(2002-es megállapodás, vegyes bizottság, NKFIH–MOST programok, közös laborok), a CATL és a BYD beruházásai ipari K+F-együttműködésre is alapot adnak. '
        + 'Az uniós programokban a kínai részvétel korlátozott, ezért a kétoldalú csatornák szerepe nő.',
      egyuttmukodesiLehetosegek:
        'Akkumulátor- és elektromobilitási K+F, képzés és beszállítófejlesztés a debreceni, szegedi és budapesti beruházásokhoz kapcsolódva; megújuló energia és '
        + 'állatorvos-tudomány a 2025-ös közös laborokra építve; az NKFIH–MOST program témakörei (lásd Kapcsolatok); lézerfizika (ELI ALPS–SIOM).',
      joGyakorlatok:
        'A STAR Market és a „kis óriás” KKV-program: a mélytech-cégek célzott tőkepiaci és ipari támogatása; a Zhongguancun Fórum technológiai tranzakciós platformja; '
        + 'a nemzeti laboratóriumok missziós finanszírozása; a K+F-költségek adóalapból történő többletlevonása.',
      diplomaciaiPrioritasok:
        'A vegyes bizottság rendszeres ülésezése és a közös felhívások folytatása; a kínai befektetők K+F-tevékenységének (pl. a BYD budapesti K+F-központja) '
        + 'bekapcsolása a hazai kutatói hálózatba; az uniós kutatásbiztonsági és exportellenőrzési szabályok alkalmazása; Stipendium Hungaricum-alumnihálózat.',
    },
  },
};

export default orszag;
