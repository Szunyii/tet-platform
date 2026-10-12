/**
 * Németország (DE) 2026-os profilja – kutatott vázlat, a relációs vezető pontosítja.
 * Három attasé fedi le (Berlin, Stuttgart, München), a profil országos.
 * Források (hozzáférés: 2026-10-09; a „2026-10-12” jelzésűek: 2026-10-12):
 * - Alapadatok: IMF World Economic Outlook, 2025. október (IMF.RES:WEO_2025_OCT_VINTAGE, 2025-ös év: GDP 5 013,574 Mrd USD,
 *   GDP/fő 59 925,317 USD, reálnövekedés 0,191%, lakosság 83,664 millió) –
 *   https://api.imf.org/external/sdmx/3.0/data/dataflow/IMF.RES/WEO_2025_OCT_VINTAGE/1.0.0/DEU.NGDPD+NGDPDPC+NGDP_RPCH+LP.A
 * - Terület: Destatis, Gemeindeverzeichnis, 2024. 12. 31-i állapot (357 684,22 km²) –
 *   https://www.destatis.de/DE/Themen/Laender-Regionen/Regionales/Gemeindeverzeichnis/Administrativ/02-bundeslaender.html
 * - GII 2025 (11. hely; 2024: 9.; pillérek: humántőke és kutatás 4., intézmények 23., infrastruktúra 28.; 7 klaszter, köztük
 *   München, Berlin, Köln, Stuttgart, Frankfurt; unikornisok): https://www.wipo.int/edocs/gii-ranking/2025/de.pdf ,
 *   https://www.wipo.int/web-publications/global-innovation-index-2025/en/gii-2025-results.html
 * - GERD (a gerd mező): OECD MSTI, 2026. márciusi kiadás, 2024: 3,13% (előzetes) –
 *   https://sdmx.oecd.org/public/rest/data/OECD.STI.STP,DSD_MSTI@DF_MSTI,1.3/DEU.A.G.PT_B1GQ..?startPeriod=2021 ,
 *   https://www.oecd.org/en/data/datasets/main-science-and-technology-indicators.html ;
 *   nemzeti adat: Destatis, 2024: 137,1 Mrd EUR, a GDP 3,17%-a, 1995 óta a legmagasabb (2026. március 27.) –
 *   https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Bildung-Forschung-Kultur/Forschung-Entwicklung/_inhalt.html ;
 *   vállalati K+F 2024 (a gépjárműipar a legnagyobb K+F-ágazat, a vegyipar és a gyógyszeripar belső K+F-je csökkent, a vállalati
 *   K+F reálértéken stagnált, Finnország megelőzte Németországot): Stifterverband, FuE-facts 2024 (2026. április) –
 *   https://www.stifterverband.org/sites/default/files/2026-04/fue-facts_2024.pdf ;
 *   gyenge ipari konjunktúra (2024: GDP −0,2%, a feldolgozóipar bruttó hozzáadott értéke −3,0%): Destatis, 2025. január 15. –
 *   https://www.destatis.de/DE/Presse/Pressemitteilungen/2025/01/PD25_019_811.html (2026-10-12)
 * - Stratégia: Hightech Agenda Deutschland (kormánydöntés: 2025. július 30.; 6 kulcstechnológia – köztük MI, mikroelektronika, kvantum,
 *   klímasemleges mobilitás – és stratégiai kutatási területek;
 *   a BMFTR szerint 2029-ig kb. 18 Mrd EUR) – https://www.bmftr.bund.de/EN/Technology/HightechAgenda/HightechAgenda.html ,
 *   https://www.bundesregierung.de/breg-de/aktuelles/hightech-agenda-deutschland-2366912 ,
 *   https://www.forschung-und-lehre.de/politik/hightech-agenda-passiert-bundeskabinett-7224 ;
 *   3,5%-os K+F-cél 2030-ra (BuFI 2026; a 2025-re kitűzött cél nem teljesült) –
 *   https://www.forschung-und-lehre.de/politik/fue-quote-von-35-prozent-auf-2030-verschoben-7737
 * - Intézmények: BMFTR – https://www.bmftr.bund.de/EN/Home/home_node.html ; Max Planck (85 intézet és létesítmény) –
 *   https://www.mpg.de/short-portrait ; Fraunhofer (74 intézet és önálló kutatóegység) –
 *   https://www.fraunhofer.de/en/about-fraunhofer/profile-structure.html ; Helmholtz (18 központ) – https://www.helmholtz.de/en/about-us/ ;
 *   Leibniz (96 intézet) – https://www.leibniz-gemeinschaft.de/en/about-us ; Exzellenzstrategie (70 klaszter 43 egyetemen, 2026-tól hét évig
 *   évi 539 M EUR) – https://www.dfg.de/de/foerderung/foerderinitiativen/exzellenzstrategie ; a tíz folytató helyszín (2026. március 11-i döntés;
 *   Konstanz 2027-től nem viseli a címet) – https://www.forschung-und-lehre.de/politik/zehn-exzellenzstandorte-behalten-ihren-titel-7580 (2026-10-12);
 *   az öt új helyszín (2026. október 2-i döntés; 2027-től összesen 15) – https://www.deutschland.de/de/news/deutschland-hat-funf-neue-exzellenzstandorte (2026-10-12);
 *   JUPITER – https://www.fz-juelich.de/en/jupiter ; EXIST (BMWE) – https://www.exist.de/EXIST/Navigation/DE/Home/home.html ;
 *   Forschungszulage – https://www.bescheinigung-forschungszulage.de/ ; ESMC (TSMC 70%, Bosch, Infineon és NXP 10–10%; a vegyesvállalat
 *   bejelentése: 2023. augusztus 8.; drezdai alapkőletétel: 2024. augusztus 20.) – https://pr.tsmc.com/english/news/3049 ,
 *   https://pr.tsmc.com/english/news/3169 (2026-10-12)
 * - Top 10 vállalat: a 2025-ös EU Industrial R&D Investment Scoreboard (2024-es üzleti év) legnagyobb K+F-ráfordítású német
 *   székhelyű vállalatai – World 2000 adatállomány: https://knowledge-for-policy.ec.europa.eu/sites/default/files/World2000%282004-2025%29.zip ;
 *   a listában 9. helyen álló Continental helyett a következő, a Merck KGaA szerepel, mert a Continental autóipari üzletága ma
 *   AUMOVIO néven önálló (https://www.aumovio.com/en/company/about-us/artificial-intelligence-for-automotive/ai-development-center-budapest.html).
 *   Startupok: GII-profil (Celonis, N26, Personio) és a CB Insights unikornislistája (2026. márciusi állapot: Trade Republic, Helsing, DeepL) –
 *   https://www.cbinsights.com/research-unicorn-companies (2026-10-12)
 * - Rendezvények (hivatalos oldalak): https://www.hannovermesse.de/en/ (2027: április 5–8.), https://www.embedded-world.de/en ,
 *   https://electronica.de/en/ , https://www.medica-tradefair.com/ (2026: november 16–19.), https://www.iaa-mobility.com/en ,
 *   https://www.achema.de/en/ (2024 után 2027-ben), https://www.ila-berlin.de/en , https://falling-walls.com/science-summit/ ,
 *   https://www.worldhealthsummit.org/ , https://www.lindau-nobel.org/
 * - Kapcsolatok: Egyesült Királyság–Németország barátsági és kétoldalú együttműködési szerződés (2025. július 17.; 5. projekt: stratégiai
 *   tudományos és technológiai partnerség) –
 *   https://www.gov.uk/government/news/friendship-and-bilateral-cooperation-treaty-the-17-projects-the-uk-and-germany-will-deliver-together (2026-10-12);
 *   CERN-tagság – https://home.cern/about/who-we-are/member-states ; ESO – https://www.eso.org/public/about-eso/memberstates/
 * - Magyar vonatkozás:
 *   - Kormányközi TéT-egyezmény (Bonn, 1987. október 7., aláíráskor hatályba lépett; közös bizottság, 4. cikk) – UNTS 1555, I-27015:
 *     https://treaties.un.org/doc/Publication/UNTS/Volume%201555/volume-1555-I-27015-English.pdf ; magyar cím: NKFIH, szerződéses országok –
 *     https://nkfih.gov.hu/hivatalrol/ketoldalu-kapcsolatok/szerzodeses-orszagok
 *   - Az utolsó külön magyar–német TéT-pályázat (TÉT_12_DE, 2013) – https://nkfih.gov.hu/palyazoknak/csomag/kiegeszites-tet-12-de ;
 *     a kétoldalú NKFIH-felhívások relációi 2019 és 2026 között (német reláció egyikben sincs):
 *     2019 (francia, osztrák) – https://nkfih.gov.hu/palyazoknak/nkfi-alap/ketoldalu-tet-egyuttmukodes-2019-2111-tet/palyazati-csomag/palyazati-felhivas-2020 ;
 *     2021 (francia, osztrák) – https://nkfih.gov.hu/palyazoknak/nkfi-alap/ketoldalu-tudomanyos-technologiai-egyuttmukodes-2021-124-tet/palyazati-csomag/palyazati-felhivas ;
 *     2023 (osztrák, horvát, szerb, francia) – https://nkfih.gov.hu/palyazoknak/nkfi-alap/ketoldalu-tudomanyos-technologiai-egyuttmukodes-tamogatasa-2023-124-tet/palyazati-csomag/palyazati-felhivas ;
 *     2024 (francia, kínai, szlovák) – https://nkfih.gov.hu/palyazoknak/nkfi-alap/ketoldalu-tudomanyos-technologiai-egyuttmukodes-tamogatasa-2024-125-tet/palyazati-csomag/palyazati-felhivas ;
 *     2025 (szlovén, francia, szerb) – https://nkfih.gov.hu/palyazoknak/nkfi-alap/ketoldalu-tudomanyos-technologiai-egyuttmukodes-tamogatasa-2025-124-tet/palyazati-csomag/palyazati-felhivas ;
 *     2026 (kínai, francia) – https://nkfih.gov.hu/palyazoknak/nkfi-alap/ketoldalu-tudomanyos-technologiai-egyuttmukodes-tamogatasa-2026-112-tet/palyazati-csomag/palyazati-felhivas
 *   - Német Külügyminisztérium, Ungarn – bilaterale Beziehungen (2026. szeptember 24.: Németország messze az első kereskedelmi partner,
 *     kb. 3000 német vállalat, kb. 600 felsőoktatási együttműködés; az Andrássy Egyetem az egyetlen teljesen német nyelvű egyetem
 *     a német nyelvterületen kívül) – https://www.auswaertiges-amt.de/de/service/laender/ungarn-node/bilateral-210228
 *   - European XFEL partnerországai (Magyarország: NKFIH) – https://www.xfel.eu/organization/partner_countries/index_eng.html
 *   - DAAD német–magyar projektalapú kutatócsere program (Tempus Közalapítvány) – https://tka.hu/daad-nemet-magyar-projektalapu-kutatocsere-program
 *   - Ipari K+F-központok: Bosch Budapest – https://www.bosch.hu/vallalatunk/a-bosch-magyarorszagon/budapest-robert-bosch-kft/ ;
 *     thyssenkrupp Budapest – https://thyssenkrupp.hu/hu/telephelyek/budapest/ ; evosoft (Siemens) – https://www.evosoft.hu/ ;
 *     AUMOVIO AI Development Center Budapest – https://www.aumovio.com/en/company/about-us/artificial-intelligence-for-automotive/ai-development-center-budapest.html ;
 *     Audi Hungaria (műszaki fejlesztés 2001 óta) – https://audi.hu/hu/a-vallalat/attekintes.html ; BMW Debrecen, az első Neue Klasse-gyár
 *     (2026. július 28.) – https://www.press.bmwgroup.com/global/article/detail/T0459620EN/ramp-up-in-record-time:-bmw-group-plant-debrecen-produces-50-000th-bmw-ix3
 *   - Stipendium Hungaricum: Németország nem partnerország – https://stipendiumhungaricum.hu/partners/
 * Kimaradt blokkok és mezők: egyik sem; a Stipendium Hungaricum nem szerepel (Németország nem partnerország).
 */
import { rendezvenyek, type DemoOrszag } from '../tipusok';

const orszag: DemoOrszag = {
  kod: 'DE',
  profil: {
    alapadatok: {
      fovaros: 'Berlin',
      terulet: '357 684',
      penznem: 'euró (EUR)',
      lakossag: '83 664 000',
      gdp: '5 013,6',
      gdpEgyFore: '59 925',
      gdpNovekedes: '0,2',
      adatEv: '2025',
      forras: 'IMF World Economic Outlook (2025. október), Destatis',
      tagsagok: ['EU', 'OECD', 'NATO', 'G7', 'G20'],
      tagsagEgyeb: 'euróövezet, schengeni övezet; ESA, CERN, ESO, EMBL',
      agazatok: ['Autóipar', 'Gépipar', 'Vegyipar', 'Elektronika és félvezetők', 'Gyógyszeripar', 'IKT és szoftver'],
      agazatEgyeb: 'Orvostechnika, optika és fotonika',
    },
    kfiRendszer: {
      teljesitmeny:
        'A Global Innovation Index 2025-ben a 11. hely (2024-ben a 9.); legerősebb pillére a humántőke és kutatás (4.), leggyengébb az infrastruktúra (28.). '
        + 'A K+F-ráfordítás az OECD MSTI előzetes adata szerint 2024-ben a GDP 3,13%-a (a Destatis szerint 3,17%, 1995 óta a legmagasabb). '
        + 'A vállalati K+F 2024-ben reálértéken stagnált, a 3,5%-os célt a kormány 2030-ra halasztotta.',
      gerd: '3,13',
      strategia: 'Hightech Agenda Deutschland (2025, a 2025–2029-es ciklusra; hat kulcstechnológia, köztük MI, mikroelektronika, kvantum, klímasemleges mobilitás); cél: 2030-ra a GDP 3,5%-a K+F-re',
      prioritasok: [
        'Digitalizáció és MI', 'Technológiai szuverenitás', 'Zöld átállás és klímasemlegesség', 'Energiabiztonság',
        'Egészség és élettudomány', 'Űr', 'Védelem és biztonság',
      ],
      prioritasEgyeb: 'A Hightech Agenda további stratégiai területei: tenger-, klíma- és fenntarthatósági kutatás, társadalom- és bölcsészettudományok',
      kiemeltIparagak: [
        'Mobilitás és autóipar', 'Mesterséges intelligencia és adatgazdaság', 'Félvezetők és mikroelektronika', 'Kvantumtechnológia',
        'Biotechnológia és gyógyszeripar', 'Energetika és fenntarthatóság', 'Űripar',
      ],
      iparagEgyeb: 'Fúziós energia, gépgyártás és ipari automatizálás',
      erossegek:
        'Munkamegosztásra épülő kutatási rendszer: Max Planck (alapkutatás), Fraunhofer (alkalmazott kutatás), Helmholtz (nagy infrastruktúrák), '
        + 'Leibniz-intézetek és a tartományok egyetemei. Erős, gyártásra épülő vállalati K+F, ezen belül a gépjárműipar a legnagyobb K+F-ágazat; '
        + 'sűrű infrastruktúra-hálózat (JUPITER, European XFEL); a GII szerint hét klaszterével Európa élén.',
      kihivasok:
        'A gazdasági bizonytalanság és a gyenge ipari konjunktúra feltehetően visszafogja a vállalati K+F-et: 2024-ben a vegyipar és a gyógyszeripar belső K+F-je csökkent, '
        + 'a K+F-intenzitásban Finnország megelőzte Németországot. Kihívás a digitalizáció üteme, a növekedési szakaszú kockázati tőke és a szakemberhiány; '
        + 'a GII-ben az intézményi környezet csak a 23.',
    },
    intezmenyek: {
      iranyitoSzervek:
        'Szövetségi Kutatási, Technológiai és Űrügyi Minisztérium (BMFTR, 2025-től) – a Hightech Agenda gazdája.\n'
        + 'Szövetségi Gazdasági és Energiaügyi Minisztérium (BMWE) – vállalati innováció (ZIM, IGF, EXIST).\n'
        + 'Közös Tudományos Konferencia (GWK) – szövetségi–tartományi koordináció.\n'
        + 'Tudományos Tanács (Wissenschaftsrat) – tanácsadás.\n'
        + 'DFG (Deutsche Forschungsgemeinschaft) – alapkutatás.\n'
        + 'SPRIND – áttörő innovációk finanszírozása.',
      egyetemek:
        'Az Exzellenzstrategie kiválósági helyszínei 2027-től: a 2026. márciusi döntés szerint megtartja címét a TU München, az LMU München, Heidelberg, '
        + 'az RWTH Aachen, a KIT, Bonn, a TU Dresden, Hamburg, Tübingen és a Berlin University Alliance (Konstanz elveszíti); 2026 októberében öt újat választottak '
        + '(Freiburg, Jena, Köln, Rhein-Main-Universitäten, Ruhr Innovation Lab), így összesen 15 lesz. 2026-tól 70 kiválósági klaszter működik.',
      kutatokozpontok:
        'Max-Planck-Gesellschaft (85 intézet és kutatóhely, alapkutatás), Fraunhofer-Gesellschaft (74 intézet és kutatóegység, alkalmazott kutatás), '
        + 'Helmholtz-Gemeinschaft (18 kutatóközpont, pl. DLR, DESY, Forschungszentrum Jülich, DKFZ), Leibniz-Gemeinschaft (96 önálló kutatóintézet).',
      infrastrukturak:
        'JUPITER (Forschungszentrum Jülich) – Európa első exaszintű szuperszámítógépe (2025); European XFEL röntgenlézer (Hamburg–Schenefeld) és DESY PETRA III (Hamburg); '
        + 'az épülő FAIR gyorsítókomplexum (Darmstadt); Wendelstein 7-X sztellarátor (Greifswald). Németországban van az EMBL (Heidelberg), '
        + 'az ESO (Garching) és az ESA ESOC műholdirányító központjának (Darmstadt) székhelye.',
    },
    vallalati: {
      kiemeltAgazatok: [
        'Mobilitás és autóipar', 'IKT és digitalizáció', 'Biotechnológia és gyógyszeripar', 'Félvezetők és mikroelektronika',
        'Mesterséges intelligencia és adatgazdaság', 'Anyagtudomány',
      ],
      agazatEgyeb: 'Gépgyártás és ipari automatizálás, vegyipar, orvostechnika',
      topVallalatok: [
        'Volkswagen', 'Mercedes-Benz Group', 'BMW Group', 'Robert Bosch', 'Bayer',
        'Siemens', 'Boehringer Ingelheim', 'SAP', 'ZF Friedrichshafen', 'Merck KGaA',
      ].join('\n'),
      startupok:
        'Ismert startupok és scale-upok: Celonis és Personio (vállalati szoftver), N26 és Trade Republic (fintech), Helsing (védelmi MI), DeepL (gépi fordítás); '
        + 'a fő központok München és Berlin. A tudományos alapítást az EXIST, a magvető és korai fázisú tőkét a High-Tech Gründerfonds, a KKV-k innovációját a ZIM támogatja.',
      klaszterek:
        'A GII 2025 hét német klasztere közül a legnagyobbak München, Berlin, Köln, Stuttgart és Frankfurt. Drezda a „Silicon Saxony” mikroelektronikai klaszter '
        + 'központja, ahol az ESMC (TSMC, Bosch, Infineon, NXP) chipgyára épül; tudományos parkok: Berlin-Adlershof, a garchingi kutatási campus.',
      technologiatranszfer:
        'A Fraunhofer-modell (vállalati megbízásos alkalmazott kutatás), egyetemi transzferirodák és a Steinbeis-hálózat; az EXIST-Forschungstransfer a kutatói '
        + 'spin-offokat, az IGF és a ZIM a KKV–kutatóhely együttműködést támogatja; a SPRIND kihívásokkal és projektcégekkel finanszíroz áttörő innovációkat.',
    },
    programok: {
      palyazatok:
        'DFG: egyéni projektek, közös kutatóközpontok (Sonderforschungsbereiche), Emmy Noether program, Leibniz-díj; a BMFTR tematikus programjai '
        + '(pl. MI, kvantum, mikroelektronika, egészség); a BMWE ZIM- és IGF-felhívásai; a tartományok saját programjai.',
      tamogatasiProgramok:
        'Hightech Agenda Deutschland (a BMFTR szerint 2029-ig mintegy 18 milliárd euró); Exzellenzstrategie (2026-tól hét évig évi 539 millió euró '
        + 'a kiválósági klaszterekre); EXIST; SPRIND-kihívások.',
      finanszirozasiEszkozok:
        'Forschungszulage – jogszabályi alapú K+F-adótámogatás minden németországi adóalanyú vállalatnak; felső határát a 2025-ös beruházási adócsomag megemelte. '
        + 'High-Tech Gründerfonds (magvető és korai fázisú tőke); a KfW Capital és a szövetségi Zukunftsfonds kockázatitőke-programjai.',
      nemzetkoziReszvetel:
        'Horizont Európa, EUREKA és Eurostars, COST; DAAD- és Humboldt-ösztöndíjak és professzori programok; a BMFTR kétoldalú együttműködései; '
        + 'nemzetközi infrastruktúrák (European XFEL, FAIR, EMBL, ESO, ESA).',
    },
    rendezvenyek: rendezvenyek([
      { nev: 'HANNOVER MESSE', tipus: 'szakkiallitas', idopont: 'április, Hannover', megjegyzes: 'Az ipari technológiák vezető vására; 2027: április 5–8.' },
      { nev: 'embedded world', tipus: 'szakkiallitas', idopont: 'március, Nürnberg', megjegyzes: 'Beágyazott rendszerek és elektronika; 2027: március 16–18.' },
      { nev: 'electronica', tipus: 'szakkiallitas', idopont: 'november, München', megjegyzes: 'Kétévente; elektronikai alkatrészek és rendszerek; 2026: november 10–13.' },
      { nev: 'MEDICA', tipus: 'szakkiallitas', idopont: 'november, Düsseldorf', megjegyzes: 'Orvostechnika és egészségügyi innováció; 2026: november 16–19.' },
      { nev: 'IAA MOBILITY', tipus: 'szakkiallitas', idopont: 'szeptember, München', megjegyzes: 'Kétévente; mobilitás és autóipar; 2027: szeptember 7–12.' },
      { nev: 'ACHEMA', tipus: 'szakkiallitas', idopont: 'június, Frankfurt am Main', megjegyzes: 'Háromévente; vegyipar és folyamattechnológia; 2027: június 14–18.' },
      { nev: 'ILA Berlin', tipus: 'szakkiallitas', idopont: 'május–június, Berlin (ExpoCenter Airport)', megjegyzes: 'Kétévente, páros években; repülés és űripar; következő: 2028. május 17–21.' },
      { nev: 'Falling Walls Science Summit', tipus: 'konferencia', idopont: 'november, Berlin', megjegyzes: 'Tudományos áttörések fóruma; 2026: november 6–9.' },
      { nev: 'World Health Summit', tipus: 'konferencia', idopont: 'október, Berlin', megjegyzes: 'Globális egészségügyi csúcstalálkozó; 2026: október 11–13.' },
      { nev: 'Lindau Nobel Laureate Meeting', tipus: 'konferencia', idopont: 'június–július, Lindau (Bodeni-tó)', megjegyzes: 'Nobel-díjasok és fiatal kutatók; 2027: június 27.–július 2. (élettan/orvostudomány)' },
    ]),
    kapcsolatok: {
      euMultilateralis:
        'Az uniós kutatási keretprogramok egyik legnagyobb résztvevője; a CERN alapító tagja, az ESA, az ESO és az EMBL tagja; több európai kutatási '
        + 'infrastruktúra székhelye (European XFEL, FAIR, EMBL, ESO); OECD- és G7-tag.',
      partnerorszagok:
        'Franciaország (aacheni szerződés, 2019), Egyesült Királyság (a 2025-ös barátsági szerződés stratégiai tudományos-technológiai partnerséget indít), '
        + 'USA, Japán, Izrael, India; Kína a kutatásbiztonsági szempontok mérlegelésével.',
      egyezmeny: 'Magyar–német kormányközi egyezmény a tudományos kutatásban és a műszaki fejlesztésben való együttműködésről (Bonn, 1987. október 7.)',
      ketoldalu:
        'Az 1987-es egyezmény közös bizottságot hozott létre; német relációjú TéT-pályázat legutóbb 2013-ban jelent meg. Németország messze Magyarország legnagyobb '
        + 'kereskedelmi partnere; mintegy 3000 német vállalat működik Magyarországon (német Külügyminisztérium, 2026). Magyarország a European XFEL részvényese. '
        + 'Fejlesztés: Bosch, thyssenkrupp, evosoft (Siemens), AUMOVIO, Audi Hungaria (a gyártás mellett 2001 óta műszaki fejlesztés); gyártás: BMW Debrecen.',
      mobilitas:
        'A Tempus Közalapítvány által kezelt DAAD német–magyar projektalapú kutatócsere program (1–2 éves projektek, minden tudományterület); DAAD- és '
        + 'Humboldt-ösztöndíjak; mintegy 600 felsőoktatási együttműködés (német Külügyminisztérium, 2026); a budapesti Andrássy Gyula Egyetem, '
        + 'a német nyelvterületen kívüli egyetlen teljesen német nyelvű egyetem; Erasmus+.',
    },
    magyarErtekeles: {
      osszegzes:
        'A szoros gazdasági kapcsolatok és a magyarországi német gyárak, fejlesztési központok miatt Németország kulcsfontosságú TéT-partner: az ipari '
        + 'K+F-együttműködés alapjai adottak. A Hightech Agenda hat kulcstechnológiája közül több (MI, mikroelektronika, kvantum, klímasemleges mobilitás) '
        + 'illeszkedik a magyar profilhoz, német relációjú TéT-pályázat viszont 2013 óta nem volt.',
      egyuttmukodesiLehetosegek:
        'Járműipari K+F és klímasemleges mobilitás a magyarországi német gyárak és beszállítóik bevonásával; mikroelektronika és félvezető-szakemberképzés; '
        + 'MI és kvantum közös Horizont Európa-konzorciumokban; a nagy német infrastruktúrák (European XFEL, FAIR, JUPITER) magyar felhasználói részvételének bővítése.',
      joGyakorlatok:
        'A Fraunhofer-modell (alkalmazott kutatás vállalati megbízásokkal, kiszámítható alapfinanszírozással); a SPRIND rugalmas, kihívásalapú finanszírozása; '
        + 'a Forschungszulage mint egyszerű K+F-adótámogatás; az Exzellenzstrategie versenyalapú kiválósági finanszírozása.',
      diplomaciaiPrioritasok:
        'Az 1987-es egyezmény szerinti közös bizottság rendszeres ülésezése és közös TéT-pályázat a Hightech Agenda prioritásai mentén; '
        + 'a magyarországi német fejlesztési központok bekapcsolása a hazai kutatóhálózatba; tartományi kapcsolatok a berlini, stuttgarti és müncheni attasé munkamegosztásával.',
    },
  },
};

export default orszag;
