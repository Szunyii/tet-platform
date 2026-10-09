/**
 * Izrael (IL) 2026-os profilja – kutatott vázlat, a relációs vezető pontosítja.
 * Források (hozzáférés: 2026-10-09):
 * - Alapadatok: IMF World Economic Outlook, 2025. október (az IMF Data „WEO 2025 October” vintage-adatfolyama) –
 *   https://www.imf.org/en/publications/weo/issues/2025/10/14/world-economic-outlook-october-2025
 *   https://api.imf.org/external/sdmx/2.1/data/IMF.RES,WEO_2025_OCT_VINTAGE,1.0.0/ISR.NGDPD+NGDPDPC+NGDP_RPCH+LP.A
 *   (2025: GDP 610,752 Mrd USD; GDP/fő 60 008,972 USD; reálnövekedés 2,495%; lakosság 10,178 millió fő)
 * - Terület: Izraeli Központi Statisztikai Hivatal (CBS, „Israel in Figures”: 22 072 km², Kelet-Jeruzsálemmel és a
 *   Golán-fennsíkkal együtt, amelyek annexióját a nemzetközi közösség nem ismeri el); összevetésként Világbank (FAO): 22 070 km² –
 *   https://data.worldbank.org/indicator/AG.SRF.TOTL.K2?locations=IL (a CIA World Factbook 2026 februárjában megszűnt)
 * - GII 2025 (14. hely, Észak-Afrika és Nyugat-Ázsia 1., erősségek és gyengeségek, Tel-Aviv–Jeruzsálem klaszter 19.) –
 *   https://www.wipo.int/edocs/gii-ranking/2025/il.pdf
 * - GERD: UNESCO UIS / Világbank, 2023: 6,35% – https://api.uis.unesco.org/api/public/data/indicators?indicator=EXPGDP.TOT&geoUnit=ISR
 *   https://data.worldbank.org/indicator/GB.XPD.RSDV.GD.ZS?locations=IL
 * - Stratégia: átfogó nemzeti KFI-stratégiai dokumentum nem ismert; a fő programok:
 *   Nemzeti MI-program 2. szakasza (2024. szept., 500 millió NIS, 2027-ig) – https://www.calcalistech.com/ctechnews/article/sy8rcn8tr
 *   https://innovationisrael.org.il/en/press_release/second-phase-ai-program/
 *   Nemzeti kvantumprogram (1,25 Mrd NIS) – https://che.org.il/en/?p=530217
 *   A MIST 2022-es K+F-prioritásai, intézményrendszer (TELEM, ISERD, DDR&D), évi 45,5 millió EUR-s MIST-pályázati alap
 *   (ERA Country Report 2023) – https://european-research-area.ec.europa.eu/country-report-israel
 * - EU: Horizont Európa-társulás (2021. december 6.; keretprogramokban 1996 óta) –
 *   https://research-and-innovation.ec.europa.eu/news/all-research-and-innovation-news/israel-joins-horizon-europe-research-and-innovation-programme-2021-12-06_en
 *   EIC Accelerator-felfüggesztési javaslat (2025. július) és elakadása a Tanácsban –
 *   https://north-africa-middle-east-gulf.ec.europa.eu/news/commission-proposes-partial-suspension-israels-association-horizon-europe-2025-07-29_en
 *   https://www.timesofisrael.com/eu-bid-to-suspend-israel-from-startup-funding-falls-short-of-majority/
 * - CERN-tagság (2014) és EMBL (alapító, 1974) – https://physicstoday.aip.org/news/israel-joins-cern ; https://embl.org/about/member-states
 * - Magyar vonatkozás: a tel-avivi TéT-szakdiplomata NKFIH-beszámolója – https://nkfih.gov.hu/hivatalrol/tet-szakdiplomatak/tet-beszamolo2024-tel-aviv –
 *   az alábbiak forrása: egyezmények (1991, 1997), MOST–ITM szándéknyilatkozat (2021), a munkacsoport 3. ülése, 53 pályázat / 7 nyertes projekt,
 *   „2019 óta az első” közös felhívás („2019. után először meghirdetésre került”), a Magyar–Izrael Tudós Társaság felélesztése („a Társaság
 *   működésének felélesztése kapcsán további találkozóra kerül sor”), az, hogy Izraelben nincs jelentős, magyar hallgatóknak szóló ösztöndíjprogram
 *   („Izraelben nem került meghirdetésre olyan ösztöndíjprogram…”), az alumnik becsült száma, IIA évi ~500 millió USD, zászlóshajó-programok,
 *   startup-tőkeadatok, V4–Izrael (2025 közepén szünetelt), HUN-REN KOKI–Weizmann, Technion–SZE; továbbá
 *   https://nkfih.gov.hu/hivatalrol/tet-szakdiplomatak/tet-beszamolo2023-tel-aviv
 *   NKFIH-felhívás 2024-1.2.10-TÉT-IPARI-IL (izraeli partner: MOST, 2025-re 400 millió Ft) –
 *   https://nkfih.gov.hu/palyazoknak/nkfi-alap/magyar-izraeli-kf-egyuttmukodes-2024-1210-tet-ipari-il/palyazati-csomag/palyazati-felhivas
 *   Űripari keretmegállapodás (Budapest, 2025. szeptember 16.) – https://hungarytoday.hu/deal-signed-with-israel-for-peaceful-use-of-space-technology/
 *   Stipendium Hungaricum (minden képzési szint) – https://stipendiumhungaricum.hu/partners/
 * - Rendezvények: Cybertech – https://www.cybertechisrael.com/sites/cybertlv2022/files/2026-01/Agenda%20TLV%202026%20A4%20Website%20hours_0.pdf
 *   Ilan Ramon-konferencia (2026. január 28., Tel-avivi Egyetem; ISA és Rakia) – https://asri.institute/the-21st-ilan-ramon-international-space-conference-2026/
 *   Biomed Israel – https://www.jetro.go.jp/en/database/j-messe/tradefair/detail/142823 ; https://www.worldcourier.com/news-and-events/events/biomed-israel
 *   MIXiii (2026. június 29–30.) – https://www.mixiii.com/ ; https://www.jns.org/feature/israels-health-tech-sector-looks-to-ai-as-medicines-next-frontier
 *   Cyber Week (2023: június 26–29.; 2025: december 8–11.; 2026: november 9–12.) – https://en-cyber.tau.ac.il/events/cw23-26-06-23 ;
 *   https://2025.cyberweektau.com/ ; https://cyberweektau.com/
 *   AI Week (2025: december 10–11.; 2026: november 9–11., a Cyber Week-kel párhuzamosan) – https://ramot.org/events/ai-week-2025/ ; https://ai-week.com/
 * Kimaradt blokkok és mezők: nincs.
 */
import { rendezvenyek, type DemoOrszag } from '../tipusok';

const orszag: DemoOrszag = {
  kod: 'IL',
  profil: {
    alapadatok: {
      fovaros: 'Jeruzsálem (státusza nemzetközileg vitatott; a legtöbb nagykövetség Tel-Avivban működik)',
      terulet: '22 072',
      penznem: 'új izraeli sékel (ILS)',
      lakossag: '10 178 000',
      gdp: '610,8',
      gdpEgyFore: '60 009',
      gdpNovekedes: '2,5',
      adatEv: '2025',
      forras: 'IMF World Economic Outlook (2025. október), Izraeli Központi Statisztikai Hivatal (CBS; a terület Kelet-Jeruzsálemmel és a Golán-fennsíkkal együtt)',
      tagsagok: ['OECD'],
      tagsagEgyeb: 'ENSZ, WTO, CERN (teljes jogú tag 2014 óta), EMBL (alapító tag, 1974), Horizont Európa társult ország',
      agazatok: ['IKT és szoftver', 'Elektronika és félvezetők', 'Védelmi ipar', 'Gyógyszeripar', 'Vegyipar'],
      agazatEgyeb: 'Kiberbiztonság, orvostechnika, gyémántfeldolgozás és -kereskedelem',
    },
    kfiRendszer: {
      teljesitmeny:
        'A Global Innovation Index 2025-ben a 14. hely a 139 gazdaság között (Észak-Afrika és Nyugat-Ázsia régióban az első); a kimenetekben 13., a ráfordításokban 25. '
        + 'A GII több mutatójában világelső: GDP-arányos K+F-ráfordítás és vállalati K+F, IKT-szolgáltatás-export, GDP-arányos kockázatitőke-ügyletszám és unikornis-érték, '
        + 'egyetem–ipar K+F-együttműködés; a Tel-Aviv–Jeruzsálem klaszter a világ 19. legnagyobb innovációs klasztere. '
        + 'A K+F-ráfordítás 6,35% (2023, UNESCO UIS / Világbank), ebből a vállalati szektor a GDP 5,9%-át végzi. '
        + 'A 2023. októberi háború óta a high-tech foglalkoztatás csökkent; a high-tech cégek tőkebevonása 2025 I. negyedévében 24%-kal nőtt (2,13 milliárd USD).',
      gerd: '6,35',
      strategia: 'Átfogó nemzeti KFI-stratégiai dokumentum nem ismert; fő programok: Nemzeti MI-program 2. szakasza (2027-ig, 500 millió NIS), nemzeti kvantumprogram (1,25 milliárd NIS)',
      prioritasok: [
        'Digitalizáció és MI', 'Egészség és élettudomány', 'Zöld átállás és klímasemlegesség', 'Űr', 'Védelem és biztonság',
        'Startup és vállalkozói ökoszisztéma',
      ],
      prioritasEgyeb: 'Biokonvergencia, élelmiszer-technológia (foodtech), megújuló energia és energiatárolás, kék gazdaság (bluetech), kvantumtechnológia, kiberbiztonság',
      kiemeltIparagak: [
        'IKT és digitalizáció', 'Mesterséges intelligencia és adatgazdaság', 'Biotechnológia és gyógyszeripar', 'Digitális egészségügy',
        'Félvezetők és mikroelektronika', 'Védelmi technológia', 'Kvantumtechnológia', 'Agrár- és élelmiszertechnológia',
      ],
      iparagEgyeb: 'Kiberbiztonság, víztechnológia, klímatechnológia, civil űripar',
      erossegek:
        'A világ legmagasabb K+F-intenzitása, döntően vállalati végrehajtással; sűrű startup- és kockázatitőke-ökoszisztéma; világelső egyetem–ipar együttműködés '
        + 'és egyetemi technológiatranszfer-cégek; számos multinacionális K+F-központ (pl. Intel, Nvidia, Google, Microsoft); erős védelmi K+F és kiberbiztonsági ipar; '
        + 'az EU kutatási keretprogramjaiban 1996 óta teljes jogú társult részvétel.',
      kihivasok:
        'A 2023. októberi háború hatásai: a tartalékos szolgálat és a tartós elvándorlás csökkenti a high-tech munkaerőt, a légtérzárak és járattörlések nehezítik a nemzetközi kapcsolatokat. '
        + 'Az A–D sorozatú kockázatitőke-befektetések 2023-ban mintegy 72%-kal estek vissza. A GII gyengeségei: a vállalkozások működési stabilitása (86.) és a hazai ipar '
        + 'diverzifikáltsága (55.). Az EU-programokban való részvétel politikai vita tárgya lett (EIC Accelerator, 2025).',
    },
    intezmenyek: {
      iranyitoSzervek:
        'Innovációs, Tudományos és Technológiai Minisztérium (MIST) – a tudományos kutatás állami finanszírozása és a nemzeti K+F-prioritások; hozzá tartozik az Izraeli Űrügynökség (ISA).\n'
        + 'Izraeli Innovációs Hatóság (IIA) – az ipari K+F fő állami ügynöksége, évente mintegy 500 millió USD-t fektet az innovációs ökoszisztémába.\n'
        + 'Felsőoktatási Tanács (CHE) és Tervezési és Költségvetési Bizottsága (PBC) – az egyetemek finanszírozása, a nemzeti kvantumprogram egyik finanszírozója.\n'
        + 'Izraeli Tudományos Alapítvány (ISF) – az alapkutatás fő finanszírozója.\n'
        + 'További szervek: Védelmi K+F Igazgatóság (DDR&D/MAFAT); TELEM – a nemzeti kutatási infrastruktúrák tervezési fóruma; ISERD – az EU-keretprogramokban '
        + 'való részvétel igazgatósága; Nemzeti Kiberigazgatóság (INCD).',
      egyetemek:
        'Weizmann Institute of Science (Rehovot), Technion – Israel Institute of Technology (Haifa), Jeruzsálemi Héber Egyetem, Tel-avivi Egyetem, '
        + 'Bar-Ilan Egyetem (Ramat Gan), Ben-Gurion Egyetem (Beér-Seva), Haifai Egyetem, Reichman Egyetem (Herzlija, magánegyetem).',
      kutatokozpontok:
        'Volcani Intézet (ARO – agrárkutatás), Soreq Nukleáris Kutatóközpont, Izraeli Biológiai Kutatóintézet (IIBR), Izraeli Óceánográfiai és Limnológiai Kutatóintézet (IOLR), '
        + 'Izraeli Geológiai Szolgálat; a Tel-avivi Egyetem Blavatnik Interdiszciplináris Kiberkutatási Központja (ICRC) és MI- és Adattudományi Központja (TAD).',
      infrastrukturak:
        'A nemzeti kvantumprogram keretében kvantumszámítógép-infrastruktúra épül; a MIST 2023-ban nemzeti tudásközpontot hozott létre a kutatási infrastruktúrákhoz, '
        + 'a TELEM tervezi a nemzeti kutatásiinfrastruktúra-beruházásokat; a nemzeti MI-program 2. szakaszában nemzeti MI-kutatóintézet jön létre; '
        + 'a CERN- és az EMBL-tagság hozzáférést ad az európai nagy kutatási infrastruktúrákhoz.',
    },
    vallalati: {
      kiemeltAgazatok: [
        'IKT és digitalizáció', 'Mesterséges intelligencia és adatgazdaság', 'Digitális egészségügy', 'Biotechnológia és gyógyszeripar',
        'Félvezetők és mikroelektronika', 'Védelmi technológia',
      ],
      agazatEgyeb: 'Kiberbiztonság, mobilitás (Mobileye), klíma- és víztechnológia',
      topVallalatok: [
        'Teva Pharmaceutical Industries', 'Check Point Software Technologies', 'Elbit Systems', 'Israel Aerospace Industries', 'Rafael Advanced Defense Systems',
        'NICE', 'Mobileye', 'Wix', 'ICL Group', 'Tower Semiconductor',
      ].join('\n'),
      startupok:
        'A GII 2025 szerint a kockázatitőke-ügyletek GDP-arányos számában és az unikornisok GDP-arányos értékében világelső. 2023-ban a startupok forrásbevonása mintegy 55%-kal '
        + 'esett vissza, a kiberbiztonság részaránya viszont nőtt (3,8 milliárd USD, a befektetések 36%-a); 2025 I. negyedévében a befektetések 25%-a a kiberbiztonsági ágazatba érkezett.',
      klaszterek:
        'Tel-Aviv–Jeruzsálem (a GII 2025 szerint a világ 19. legnagyobb innovációs klasztere, vezető szabadalmi területe az orvostechnika); Herzlija; Haifa (Technion, MATAM technológiai park); '
        + 'Beér-Seva (kiberbiztonsági technológiai park a Ben-Gurion Egyetem mellett); az IIA technológiai inkubátorprogramja.',
      technologiatranszfer:
        'Egyetemi technológiatranszfer-cégek: Yissum (Héber Egyetem), Yeda (Weizmann), Ramot (Tel-avivi Egyetem), T3 (Technion), BGN Technologies (Ben-Gurion Egyetem), '
        + 'BIRAD (Bar-Ilan Egyetem); az IIA KAMIN-programja az akadémiai kutatás alkalmazását, a Magnet-program a vállalat–egyetem konzorciumokat támogatja.',
    },
    programok: {
      palyazatok:
        'ISF egyéni kutatási pályázatok (alapkutatás); a MIST kutatási pályázatai (nemzeti, nemzetközi, tudásközponti és ösztöndíj-programok; a 2023-as ERA-országjelentés szerint évente mintegy 45,5 millió EUR, '
        + 'a nemzeti prioritásokra fókuszálva); az IIA K+F-alapja, Tnufa (korai fázisú ötletek), technológiai inkubátorok, KAMIN és Magnet programjai.',
      tamogatasiProgramok:
        'Nemzeti MI-program 2. szakasza (2024-ben bejelentve, 2027-ig, 500 millió NIS – kutatási infrastruktúra, nemzeti MI-kutatóintézet, tehetségfejlesztés); '
        + 'nemzeti kvantumtudományi és -technológiai program (1,25 milliárd NIS, több tárca és az IIA finanszírozásával); '
        + 'fenntarthatósági és klímaváltozási zászlóshajó-program (450 millió NIS, 2024–2028); az alkalmazott kutatás ösztönzése (100 millió NIS, 2025–2027).',
      finanszirozasiEszkozok:
        'Az IIA K+F-támogatásai (sikeres termék esetén jogdíjból visszafizetendők); binacionális alapok: BIRD (amerikai–izraeli ipari K+F), BSF (amerikai–izraeli tudományos), '
        + 'GIF (német–izraeli); a kockázatitőke-piacot az állami Yozma-program (1993) indította el.',
      nemzetkoziReszvetel:
        'Horizont Európa társult ország (2021. december 6.; 1996 óta minden EU-keretprogramban), az ISERD a nemzeti kapcsolattartó; EUREKA és Eurostars; CERN- és EMBL-tagság; '
        + 'a MIST és az IIA kétoldalú programjai, köztük a közös NKFIH–MIST pályázat.',
    },
    rendezvenyek: rendezvenyek([
      { nev: 'Cybertech Global Tel Aviv', tipus: 'konferencia', idopont: 'január, Tel-Aviv (Expo Tel Aviv)', megjegyzes: 'Kiberbiztonsági konferencia és kiállítás; 2026: január 26–28.' },
      { nev: 'Israel Space Week – Ilan Ramon International Space Conference', tipus: 'konferencia', idopont: 'január, Tel-Aviv (Tel-avivi Egyetem)', megjegyzes: 'Az izraeli űrhét fő konferenciája (Izraeli Űrügynökség, Rakia); 2026: január 28. (21. alkalommal)' },
      { nev: 'Biomed Israel', tipus: 'konferencia', idopont: 'május, Tel-Aviv (David InterContinental)', megjegyzes: 'Élettudományi és orvostechnológiai hét kiállítással (Kenes Exhibitions); 2026: május 12–14.' },
      { nev: 'MIXiii Health-Tech.IL', tipus: 'konferencia', idopont: 'változó hónap, Jeruzsálem (ICC)', megjegyzes: 'Élettudományi és egészségtechnológiai konferencia (IATI); 2026: június 29–30.' },
      { nev: 'Cyber Week', tipus: 'konferencia', idopont: 'változó hónap, Tel-Aviv (Tel-avivi Egyetem)', megjegyzes: 'Évente, korábban jellemzően júniusban; 2025: december 8–11., 2026: november 9–12.; több mint 11 ezer résztvevő (Blavatnik ICRC)' },
      { nev: 'AI Week', tipus: 'konferencia', idopont: 'változó hónap, Tel-Aviv (Tel-avivi Egyetem)', megjegyzes: 'Mesterséges intelligencia konferencia, a Cyber Week-kel párhuzamosan (2025: december 10–11.; 2026: november 9–11.)' },
    ]),
    kapcsolatok: {
      euMultilateralis:
        'Az EU kutatási keretprogramjaiban 1996 óta társult (elsőként Európán kívül), a Horizont Európához 2021-ben társult. A Bizottság 2025 júliusában '
        + 'javasolta az izraeli szervezetek EIC Accelerator-részvételének felfüggesztését (a kollaboratív kutatást nem érintette volna); a javaslat 2025 nyarán '
        + 'nem kapott elegendő támogatást a Tanácsban.',
      partnerorszagok:
        'USA (BIRD és BSF binacionális alapok, amerikai multinacionális K+F-központok), Németország (GIF), EU-tagállamok a Horizont Európában; '
        + 'az Ábrahám-megállapodások (2020) után az Egyesült Arab Emírségek és Marokkó; a V4–Izrael pályázati együttműködés 2025 közepén szünetelt.',
      egyezmeny: 'Magyar–izraeli tudományos és műszaki együttműködési megállapodás (Jeruzsálem, 1991)',
      ketoldalu:
        'Hatályos megállapodások: tudományos és műszaki (Jeruzsálem, 1991), műszaki (1997); emellett a tudományos tárcák szándéknyilatkozata (2021) és a békés célú '
        + 'űrtevékenységről szóló keretmegállapodás (aláírva: Budapest, 2025. szeptember 16.). '
        + 'Az NKFIH és az izraeli MIST 2019 óta első közös K+F-pályázatára (2024) 53 pályázat érkezett, 7 közös projekt nyert (magyar keret 2025-re: '
        + '400 millió Ft). Intézményi szálak: HUN-REN Kísérleti Orvostudományi Kutatóintézet (KOKI) – Weizmann Intézet (idegtudomány), Technion – Széchenyi István Egyetem; '
        + 'napirenden a Magyar–Izrael Tudós Társaság újjáélesztése.',
      mobilitas:
        'Stipendium Hungaricum-partnerország minden képzési szinten; a magyar (orvosi) képzés népszerű az izraeli hallgatók körében, a magyar ösztöndíjjal tanult alumnik száma '
        + 'becslés szerint néhány száz fő. Izraelben nincs jelentős, magyar hallgatóknak meghirdetett ösztöndíjprogram; a Technion és a Széchenyi István Egyetem '
        + 'közös Erasmus+ KA171 pályázatot nyújtott be (2025).',
    },
    magyarErtekeles: {
      osszegzes:
        'Izrael a világ legmagasabb K+F-intenzitású gazdasága (6,35%; GII 2025: 14.), erős startup-, kiberbiztonsági és élettudományi ökoszisztémával. '
        + 'A magyar–izraeli TéT-kapcsolatok intézményesítettek: az 1991-es egyezmény, a 2024-ben újraindult NKFIH–MIST közös pályázat (7 nyertes projekt) '
        + 'és a 2025-ös űripari keretmegállapodás a következő lépések alapja; a háborús helyzet a személyes programokat nehezíti.',
      egyuttmukodesiLehetosegek:
        'A közös pályázat témái: agrárinnováció és vízgazdálkodás, MI és kvantumtechnológia, egészségipar és diagnosztika, tiszta energia, okos mobilitás; '
        + 'űripar a 2025-ös keretmegállapodás alapján; idegtudomány (HUN-REN KOKI – Weizmann); kiberbiztonság; közös Horizont Európa-konzorciumok.',
      joGyakorlatok:
        'Az IIA programkínálata a korai fázistól az egyetem–ipar konzorciumokig, jogdíj-alapú visszafizetéssel; az egyetemi technológiatranszfer-cégek modellje (Yissum, Yeda, Ramot); '
        + 'a binacionális alapok (BIRD, BSF) mint tartós kétoldalú finanszírozási eszközök; a nemzeti MI- és kvantumprogramok célzott, többéves, szakaszolt felépítése.',
      diplomaciaiPrioritasok:
        'A közös NKFIH–MIST pályázat folytatása és a nyertes projektek utókövetése; az űripari keretmegállapodás megtöltése projektekkel; a V4–Izrael együttműködés '
        + 'újraindítása, amint a helyzet engedi; a Stipendium Hungaricum-alumnik megszólítása és a Magyar–Izrael Tudós Társaság újjáélesztésének támogatása.',
    },
  },
};

export default orszag;
