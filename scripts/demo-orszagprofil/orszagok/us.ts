/**
 * Amerikai Egyesült Államok (US) 2026-os profilja – kutatott vázlat, a relációs vezető pontosítja.
 * Források (hozzáférés: 2026-10-09):
 * - Alapadatok: IMF World Economic Outlook, 2025. október (IMF.RES:WEO_2025_OCT_VINTAGE, 2025-ös év: GDP 30 615,743 Mrd USD,
 *   GDP/fő 89 598,86 USD, reálnövekedés 2,017%, lakosság 341,698 millió) –
 *   https://api.imf.org/external/sdmx/2.1/data/IMF.RES,WEO_2025_OCT_VINTAGE,1.0.0/USA.NGDPD+NGDPDPC+NGDP_RPCH+LP.A?startPeriod=2025&endPeriod=2025
 * - Terület: Világbank AG.SRF.TOTL.K2 (2024: 9 831 510 km²) – https://data.worldbank.org/indicator/AG.SRF.TOTL.K2?locations=US
 * - GII 2025 (3. hely; ráfordítás 6., kibocsátás 3.; 22 klaszter; erősségek): https://www.wipo.int/edocs/gii-ranking/2025/us.pdf
 * - GERD: OECD MSTI, 2024 (becslés): a GDP 3,44%-a, 1 009 275 millió USD (2023: 952 115 millió USD); a vállalatok által finanszírozott
 *   rész 68,7%, a kormányzat által finanszírozott 19,3%; a kormányzati K+F-előirányzatok védelmi aránya 53% –
 *   https://www.oecd.org/en/data/datasets/main-science-and-technology-indicators.html
 * - Stratégia: OSTP „Science: A New Golden Age” és az FY2028 K+F-prioritási memorandum (M-26-16, 2026. július 21.) –
 *   https://www.whitehouse.gov/releases/2026/07/45470/ ;
 *   https://www.whitehouse.gov/wp-content/uploads/2026/07/M-26-16-Ushering-in-a-New-Golden-Age-of-American-Innovation-Fiscal-Year-2028-Administration-Research-and-Development-Budget-Priorities.pdf
 *   FY2027 K+F-prioritási memorandum (2025. szeptember 23.; a prioritások forrása) –
 *   https://www.whitehouse.gov/wp-content/uploads/2025/09/FY27-OMB-OSTP-RD-Priorites-Memo-FINALSIGNED.pdf
 *   America's AI Action Plan (2025. július) – https://www.whitehouse.gov/wp-content/uploads/2025/07/Americas-AI-Action-Plan.pdf
 *   Genesis Mission, EO 14363 (2025. november 24.) – https://www.whitehouse.gov/presidential-actions/2025/11/launching-the-genesis-mission/
 *   PCAST (2025. januári elnöki rendelet) – https://www.whitehouse.gov/presidential-actions/2025/01/presidents-council-of-advisors-on-science-and-technology/
 * - FY2026 szövetségi K+F-előirányzatok (javaslat: NIH −41%, NSF −55%; elfogadott: NIH +1%, NSF −3%; az NIH 27 intézete és központja;
 *   P.L. 119-21: a 2025. július 4-én aláírt költségvetési kiigazító törvény, 70302. szakasz: K+F-kiadások leírása) – CRS R48694 (2026. április 17.) –
 *   https://www.everycrsreport.com/files/2026-04-17_R48694_8e605289d9a019ab5ec895a2df98f1b2afd93f1f.html ;
 *   a hazai K+F-kiadások azonnali leírása (IRC 174A) – https://www.irs.gov/newsroom/working-families-tax-cuts
 * - H-1B-díj: a 2025. szeptember 19-i proklamáció (100 000 USD az új kérelmekre, 12 hónapra) –
 *   https://www.whitehouse.gov/presidential-actions/2025/09/restriction-on-entry-of-certain-nonimmigrant-workers/ ;
 *   meghosszabbítás 2027. szeptember 21-ig (2026. szeptember 18.) –
 *   https://www.whitehouse.gov/presidential-actions/2026/09/restriction-on-entry-of-certain-nonimmigrant-workers-faad/ ;
 *   a díjat két szövetségi bírósági döntés blokkolja: a massachusettsi bíróság 2026. júniusi, a díjat megsemmisítő ítélete (State of
 *   California v. Mullin; a fellebbviteli bíróság júliusban nem függesztette fel) és a kaliforniai (N.D. Cal.) bíróság 2026. szeptember
 *   30-i ideiglenes intézkedése (Global Nurse Force v. Trump; a meghosszabbításra is kiterjed) –
 *   https://www.fragomen.com/insights/united-states-california-federal-court-issues-preliminary-injunction-against-the-dollar100000-h-1b-fee.html ;
 *   https://www.fredlaw.com/alert-trump-orders-new-h-1b-restrictions-reviews-and-extends-100-000-fee-for-new-h-1b-nonimmigrant-applications
 * - TOP500, 2026. június (1. kínai rendszer, 2–4. El Capitan, Frontier, Aurora) – https://top500.org/lists/top500/2026/06/ ;
 *   a DOE 17 nemzeti laboratóriuma – https://www.energy.gov/national-laboratories
 * - Vállalatok: EU Industrial R&D Investment Scoreboard 2025 (2024-es adatok; a tíz legnagyobb amerikai K+F-ráfordító; SB2025_World2000.xlsx) –
 *   https://knowledge-for-policy.ec.europa.eu/sites/default/files/World2000%282004-2025%29.zip
 * - SBIR/STTR (I–III. fázis, vissza nem térítendő; évente kb. 4 Mrd USD, kb. 4000 vállalkozás) – https://www.sbir.gov/ ; a 2025. szeptember 30-i lejárat után az S. 3971
 *   2031. szeptember 30-ig újraengedélyezte (aláírva: 2026. április 13.) – https://legacy.sba.gov/article/2026/04/13/administrator-loeffler-applauds-sbir-sttr-reauthorization ;
 *   https://www.washington.edu/federalrelations/2026/04/14/trump-signs-sbir-sttr-reauthorization-bill-into-law/
 * - In-Q-Tel (a CIA által 1999-ben alapított független nonprofit stratégiai befektető) – https://www.iqt.org/about-iqt
 * - EU–USA S&T-megállapodás és Horizont Európa-részvétel – https://research-and-innovation.ec.europa.eu/news/all-research-and-innovation-news/council-approves-renewal-eu-us-science-technology-agreement-2023-10-05_en
 * - Technology Prosperity Deal-ek (UK: 2025. szeptember; Japán, Korea: 2025. október) –
 *   https://www.whitehouse.gov/releases/2025/10/the-united-states-signs-technology-prosperity-deals-with-japan-and-korea ;
 *   a brit megállapodás végrehajtásának felfüggesztése (2025. december; hozzáférés: 2026-10-12) –
 *   https://www.freemalaysiatoday.com/category/world/2025/12/17/uk-looks-to-restart-cooperation-after-us-suspends-tech-deal
 * - Kilépések: WHO (HHS) – https://www.hhs.gov/press-room/fact-sheet-us-withdrawal-from-the-world-health-organization.html ;
 *   Párizsi Megállapodás – https://eelp.law.harvard.edu/tracker/paris-climate-agreement ;
 *   66 szervezet (2026. január 7-i memorandum, 91 FR 2281–2284; 35 nem ENSZ- és 31 ENSZ-szervezet, köztük az IPCC és az UNFCCC) –
 *   https://www.govinfo.gov/content/pkg/FR-2026-01-16/html/2026-00976.htm ;
 *   UNESCO (a State Department 2025. július 22-i közleménye; hatály: 2026. december 31.) –
 *   https://www.state.gov/releases/office-of-the-spokesperson/2025/07/the-united-states-withdraws-from-the-united-nations-educational-scientific-and-cultural-organization-unesco
 * - Magyar vonatkozás:
 *   - TéT-megállapodás: 2010. évi XXX. törvény (aláírás: Budapest, 2010. február 4.; hatályos 2010. április 7-től; 10 évre, automatikus
 *     10 éves meghosszabbítással; vegyes bizottság) – https://njt.jog.gov.hu/jogszabaly/2010-30-00-00
 *   - Fulbright: 2/2008. (I. 8.) Korm. rendelet (Washington, 2007. március 8.; az 1990. december 6-i megállapodás helyett) –
 *     https://njt.jog.gov.hu/jogszabaly/2008-2-20-22
 *   - Fulbright–MTA mobilitási ösztöndíj (MTA–Fulbright megállapodás: 2023. július 19.; 2026–27: 5 millió Ft keret) –
 *     https://mta.hu/data/dokumentumok/palyazatok/2026/Fulbright-MTA_Mobilit%C3%A1si_%C3%96szt%C3%B6nd%C3%ADjak_p%C3%A1ly%C3%A1zati_felh%C3%ADv%C3%A1s_2026_2027_v%C3%A9gleges.pdf
 *   - NKFIH TéT-beszámoló, New York (2024. június – 2025. május; készítette: Novák Tamás TéT-szakdiplomata: a megállapodás
 *     meghosszabbodása, exportpartner és befektető, a Neumann Series, a Roosevelt House fórum – 2025. február 13-án indult, alapítói között
 *     Novák Tamás –, 758 magyar hallgató 2023/24-ben, a 2025-ös támogatás-befagyasztások) –
 *     https://nkfih.gov.hu/hivatalrol/tet-szakdiplomatak/tet-beszamolo2024-new-york
 *   - TéT-beszámoló, San Francisco (2024: Diaszpóra Felsőoktatási Ösztöndíjprogram) – https://tdf.kormany.hu/download/2/55/43000/2024_SAN%20FRANCISCO.docx
 *   - MIT–Hungary HUN-REN Seed Fund (2025. szeptember; 2026. április: három nyertes projekt) –
 *     https://hun-ren.hu/hunren_news/global-scientific-collaboration-launches-in-hungary-hun-ren-mit-109582 ;
 *     https://hun-ren.hu/hunren_news/three-hungarian-research-teams-selected-in-joint-mithun-ren-call-110066
 *   - Nukleáris együttműködés: a 2025. novemberi szándéknyilatkozat (kis moduláris reaktorok, kiégett üzemanyag tárolása) és a
 *     Westinghouse–MVM fűtőelem-szerződés – https://world-nuclear-news.org/articles/westinghouse-to-supply-fuel-to-hungarys-paks-nuclear-plant ;
 *     U.S.-Hungary Civil Nuclear Intergovernmental Agreement (Budapest, 2026. február 16.; SMR-együttműködés, Holtec: kiégett
 *     üzemanyag tárolása) – https://www.state.gov/releases/office-of-the-spokesperson/2026/02/secretary-rubio-advances-national-security-through-civil-nuclear-deals-in-central-europe ;
 *     https://www.neimagazine.com/news/hungary-us-sign-civil-nuclear-pact/
 *   - Karikó Katalin Nobel-díja (2023; Pennsylvaniai Egyetem) – https://www.nobelprize.org/prizes/medicine/2023/press-release/
 *   - Stipendium Hungaricum partnerországok (az USA nem szerepel) – https://stipendiumhungaricum.hu/partners/
 * - Rendezvények: CES 2027 (a honlap: „January 6-9 Las Vegas” a CES 2027 regisztráció mellett; CES Unveiled: 2027. január 4.) –
 *   https://www.ces.tech/ ; https://www.aaas.org/page/aaas-national-meetings-date ; https://www.sxsw.com/ ; https://www.nvidia.com/gtc/ ;
 *   https://www.selectusasummit.us/ ; https://convention.bio.org/ ;
 *   SEMI-közlemény (2026. július) – https://www.semi.org/en/semi-press-release/semi-announces-new-spring-schedule-for-semicon-west-beginning-march-30-april-1-2027 ;
 *   https://techcrunch.com/events/tc-disrupt-2026/
 * Kimaradt blokkok és mezők: nincs, mind a 8 blokk kitöltve. A John von Neumann Series (2023–2024) nem szerepel a rendezvények
 * között, mert a folytatása nem ellenőrizhető.
 */
import { rendezvenyek, type DemoOrszag } from '../tipusok';

const orszag: DemoOrszag = {
  kod: 'US',
  profil: {
    alapadatok: {
      fovaros: 'Washington, D.C.',
      terulet: '9 831 510',
      penznem: 'amerikai dollár (USD)',
      lakossag: '341 698 000',
      gdp: '30 615,7',
      gdpEgyFore: '89 599',
      gdpNovekedes: '2,0',
      adatEv: '2025',
      forras: 'IMF World Economic Outlook (2025. október), Világbank (terület)',
      tagsagok: ['OECD', 'NATO', 'G7', 'G20'],
      tagsagEgyeb: 'APEC, USMCA (amerikai–mexikói–kanadai szabadkereskedelmi megállapodás), az ENSZ Biztonsági Tanácsának állandó tagja',
      agazatok: [
        'IKT és digitalizáció', 'Pénzügyi szolgáltatások', 'Biotechnológia és gyógyszeripar', 'Elektronika és félvezetők',
        'Energetika és fenntarthatóság', 'Védelmi ipar', 'Agrár- és élelmiszeripar', 'Kreatív ipar és média',
      ],
      agazatEgyeb: 'Repülőgép- és űripar, egészségügyi szolgáltatások, ingatlanszektor',
    },
    kfiRendszer: {
      teljesitmeny:
        'A Global Innovation Index 2025-ben a 3. hely a 139 gazdaság között (kibocsátásban 3., ráfordításban 6.). '
        + 'Az OECD MSTI becslése szerint a K+F-ráfordítás 2024-ben a GDP 3,44%-a, mintegy 1009 milliárd USD (2023: 952 milliárd USD); 69%-át a vállalatok, 19%-át a kormányzat finanszírozza, '
        + 'a kormányzati K+F-előirányzatok több mint fele (2024: 53%) védelmi célú.',
      gerd: '3,44',
      strategia: 'Science: A New Golden Age (OSTP, 2026) és az FY2028 K+F-prioritási memorandum; America’s AI Action Plan (2025); Genesis Mission (2025); CHIPS and Science Act (2022)',
      prioritasok: [
        'Digitalizáció és MI', 'Technológiai szuverenitás', 'Védelem és biztonság', 'Energiabiztonság', 'Űr',
        'Egészség és élettudomány', 'Alapkutatási kiválóság', 'Ipar 4.0 és gyártás',
      ],
      prioritasEgyeb: 'Kvantuminformatika, fejlett kommunikációs hálózatok, nukleáris energia (fisszió és fúzió), a kutatás MI-alapú gyorsítása (Genesis Mission)',
      kiemeltIparagak: [
        'Mesterséges intelligencia és adatgazdaság', 'Elektronika és félvezetők', 'Biotechnológia és gyógyszeripar', 'Kvantumtechnológia',
        'Űripar', 'Védelmi ipar',
      ],
      iparagEgyeb: 'Nukleáris és fúziós energia, fejlett gyártás, 6G és fejlett kommunikációs hálózatok',
      erossegek:
        'Vezető kutatóegyetemek és tudományos kibocsátás (a GII-ben az egyetemi rangsor és az idézettségi H-index alapján 1.); a legnagyobb vállalati K+F-befektetők '
        + '(az EU 2025-ös K+F-eredménytáblájának első öt helyezettje mind amerikai); a legnagyobb kockázatitőke-piac; a DOE 17 nemzeti laboratóriuma és exascale-szuperszámítógépei.',
      kihivasok:
        '2025 óta bizonytalanabb a szövetségi kutatásfinanszírozás: több támogatást befagyasztottak, és az elnök FY2026-os javaslata az NIH K+F-keretét 41%-kal, az NSF-ét 55%-kal csökkentette volna; '
        + 'a Kongresszus végül az NIH-t 1%-kal növelte, az NSF-et 3%-kal csökkentette. A vízumszigorítások nehezíthetik a nemzetközi kutatók toborzását: '
        + 'az új H-1B-kérelmekre 2025 szeptemberében bevezetett, 2026 szeptemberében egy évvel meghosszabbított 100 000 USD-s díj alkalmazását '
        + '2026 októberében két szövetségi bírósági döntés tiltja, a perek folyamatban vannak. A 2026. júniusi TOP500-listát kínai rendszer vezeti.',
    },
    intezmenyek: {
      iranyitoSzervek:
        'Fehér Ház Tudomány- és Technológiapolitikai Hivatala (OSTP) – a szövetségi KFI-politika koordinációja; tanácsadó testület: PCAST.\n'
        + 'Kongresszus – a szövetségi K+F-előirányzatok éves jóváhagyása.\n'
        + 'Finanszírozók: NSF, NIH (27 intézet és központ), DOE (17 nemzeti laboratórium; alapkutatás: Office of Science), Védelmi Minisztérium (DARPA), NASA, NIST.\n'
        + 'Statisztika: NSF National Center for Science and Engineering Statistics (NCSES).',
      egyetemek:
        'MIT, Stanford, Harvard, Caltech, University of California (Berkeley, San Francisco, Los Angeles), Princeton, Johns Hopkins, University of Michigan, Carnegie Mellon, University of Pennsylvania.',
      kutatokozpontok:
        'A DOE nemzeti laboratóriumai (pl. Argonne, Oak Ridge, Lawrence Berkeley, Lawrence Livermore, Los Alamos, Sandia, Brookhaven, Fermilab); az NIH bethesdai intézetei; '
        + 'NASA-központok (JPL, Goddard, Ames); NIST; nonprofit kutatóintézetek (Broad Institute, Howard Hughes Medical Institute, Scripps Research).',
      infrastrukturak:
        'Exascale-szuperszámítógépek: El Capitan (LLNL), Frontier (ORNL) és Aurora (ANL) – a 2026. júniusi TOP500-lista 2–4. helyén; National Ignition Facility (lézeres fúzió, LLNL); '
        + 'szinkrotronok és röntgenlézerek (APS, NSLS-II, LCLS); épülő nagyberendezések: Electron-Ion Collider (Brookhaven), LBNF/DUNE (Fermilab); LIGO gravitációshullám-obszervatóriumok.',
    },
    vallalati: {
      kiemeltAgazatok: [
        'Mesterséges intelligencia és adatgazdaság', 'Elektronika és félvezetők', 'Biotechnológia és gyógyszeripar', 'IKT és digitalizáció',
        'Űripar', 'Védelmi ipar',
      ],
      agazatEgyeb: 'Felhőszolgáltatások, kiberbiztonság, orvostechnika, repülőgépipar',
      topVallalatok: [
        'Amazon', 'Alphabet', 'Meta Platforms', 'Microsoft', 'Apple',
        'Johnson & Johnson', 'Intel', 'Merck & Co.', 'NVIDIA', 'Eli Lilly',
      ].join('\n'),
      startupok:
        'A GII 2025 szerint az unikornisok értékeltsége a GDP 8,45%-a, a késői fázisú kockázatitőke-ügyletek száma is világelső. '
        + 'Az SBIR/STTR szakaszos, vissza nem térítendő KKV-támogatása évente kb. 4 milliárd USD, kb. 4000 vállalkozásnak (2026 áprilisában 2031-ig újraengedélyezve). '
        + 'Védelmi és biztonsági célú technológiaszerzés és befektetés: Defense Innovation Unit (a Védelmi Minisztérium egysége), In-Q-Tel (a CIA által 1999-ben alapított független nonprofit befektető).',
      klaszterek:
        'A GII 2025 top 100-as listáján 22 amerikai klaszter szerepel, köztük San Jose–San Francisco (3.), New York (7.), Boston–Cambridge (9.), Los Angeles (10.) és San Diego (14.). '
        + 'Vezető akcelerátorok: Y Combinator, Plug and Play, 500 Global; regionális programok: NSF Regional Innovation Engines, EDA Tech Hubs.',
      technologiatranszfer:
        'Bayh–Dole-törvény (1980): az egyetemek megtarthatják a szövetségi támogatású kutatásokból származó találmányok jogait; egyetemi technológiatranszfer-irodák; '
        + 'a szövetségi laborok kutatási együttműködési megállapodásai (CRADA); az NSF I-Corps vállalkozásképzési programja.',
    },
    programok: {
      palyazatok:
        'NSF (pl. CAREER, Graduate Research Fellowship Program), NIH (R01 és más kutatási támogatások), DOE Office of Science és ARPA-E, DARPA, ARPA-H, NASA ROSES.',
      tamogatasiProgramok:
        'Genesis Mission (2025): a DOE MI-alapú kutatási platformja a nemzeti laboratóriumok szuperszámítógépeire és adataira építve; CHIPS for America (félvezetőgyártás és K+F); '
        + 'NSF Regional Innovation Engines, EDA Tech Hubs; SBIR/STTR.',
      finanszirozasiEszkozok:
        'K+F-adójóváírás (IRC 41. szakasz); a 2025. július 4-i adó- és költségvetési törvény (P.L. 119-21) a 2024 után kezdődő adóévektől ismét lehetővé teszi a hazai K+F-kiadások azonnali leírását; '
        + 'félvezetőgyártási beruházási adójóváírás (48D); DOE Loan Programs Office.',
      nemzetkoziReszvetel:
        'ITER-tagság, CERN-megfigyelői státusz; az NSF és az NIH nemzetközi programjai; Fulbright-program.',
    },
    rendezvenyek: rendezvenyek([
      { nev: 'CES', tipus: 'szakkiallitas', idopont: 'január, Las Vegas (2027: január 6–9.)', megjegyzes: 'Fogyasztói elektronika és technológia (CTA)' },
      { nev: 'AAAS Annual Meeting', tipus: 'konferencia', idopont: 'február, változó helyszín (2027: Chicago)', megjegyzes: 'Az AAAS éves tudományos és tudománypolitikai találkozója' },
      { nev: 'SXSW', tipus: 'forum', idopont: 'március, Austin (2027: március 15–21.)', megjegyzes: 'Innováció, technológia és kreatív ipar' },
      { nev: 'NVIDIA GTC', tipus: 'konferencia', idopont: 'március, San Jose', megjegyzes: 'MI és gyorsított számítástechnika' },
      { nev: 'SelectUSA Investment Summit', tipus: 'forum', idopont: 'május, National Harbor (Maryland)', megjegyzes: 'A Kereskedelmi Minisztérium befektetésösztönzési csúcstalálkozója' },
      { nev: 'BIO International Convention', tipus: 'szakkiallitas', idopont: 'június, változó helyszín (2027: június 7–10., Philadelphia)', megjegyzes: 'Biotechnológia és gyógyszeripar, partnering' },
      { nev: 'SEMICON West', tipus: 'szakkiallitas', idopont: '2026. október 13–15., San Francisco; 2027-től tavasszal (2027: március 30. – április 1., Phoenix)', megjegyzes: 'Félvezetőipari kiállítás és konferencia (SEMI)' },
      { nev: 'TechCrunch Disrupt', tipus: 'konferencia', idopont: 'október, San Francisco (2026: október 13–15.)', megjegyzes: 'Startupok és kockázati tőke' },
    ]),
    kapcsolatok: {
      euMultilateralis:
        'OECD, G7, G20; az EU–USA tudományos és technológiai megállapodás 1998 óta hatályos (2023-ban öt évre megújítva), és az USA a Horizont Európa legaktívabb nem társult résztvevője. '
        + '2026 januárjában kilépett a WHO-ból és a Párizsi Megállapodásból; egy 2026. januári elnöki memorandum 66 nemzetközi szervezetből (köztük az UNFCCC-ből és az IPCC-ből) rendelte el a kilépést; '
        + 'az UNESCO-ból 2026. december 31-i hatállyal lép ki.',
      partnerorszagok:
        'Egyesült Királyság, Japán és Dél-Korea (Technology Prosperity Deal-ek, 2025; többek között MI, kvantum, nukleáris és fúziós energia, 6G; a brit megállapodás végrehajtását az USA 2025 decemberében felfüggesztette), Kanada és Mexikó (USMCA), Ausztrália (AUKUS), EU-tagállamok.',
      egyezmeny: 'Magyar–amerikai tudományos és technológiai együttműködési megállapodás (Budapest, 2010; 2010. évi XXX. törvény): vegyes bizottság, tízévente automatikus meghosszabbítás',
      ketoldalu:
        'Az USA a 2024/25-ös New York-i TéT-beszámoló szerint Európán kívül Magyarország legfontosabb exportpartnere és egyik legnagyobb befektetője; 2025-ben indult az MIT–Hungary HUN-REN Seed Fund (2026-ban három közös projekt nyert). '
        + 'Nukleáris energia: szándéknyilatkozat (2025. november; kis moduláris reaktorok, kiégett üzemanyag tárolása), Westinghouse–MVM fűtőelem-szerződés (Paks), '
        + 'kormányközi nukleáris megállapodás (Budapest, 2026. február 16.). Az akkori New York-i TéT-attasé szervezte a John von Neumann Series rendezvénysorozatot (2023–2024), '
        + 'és társalapítója volt a Roosevelt House Science-to-Diplomacy Forumnak (2025). '
        + 'A magyar diaszpóra kiemelkedő alakja Karikó Katalin (Pennsylvaniai Egyetem, Nobel-díj, 2023).',
      mobilitas:
        'Fulbright-program (Magyar–Amerikai Oktatási Csereprogram Bizottság, 2007-es kormányközi egyezmény) és kiegészítő Fulbright–MTA ösztöndíj (2026–27: 5 millió Ft keret). '
        + '2023/24-ben 758 magyar hallgató tanult az USA-ban; a 2024-es San Franciscó-i TéT-beszámoló szerint a Diaszpóra Felsőoktatási Ösztöndíjprogram pályázóinak jelentős része az USA-ból érkezett. Az USA nem Stipendium Hungaricum-partnerország.',
    },
    magyarErtekeles: {
      osszegzes:
        'Az USA a világ vezető KFI-hatalma (GII 2025: 3.; mintegy 1000 milliárd USD K+F-ráfordítás), de 2025 óta a szövetségi kutatásfinanszírozás bizonytalanabbá vált. '
        + 'A kapcsolatok kerete a 2010-es TéT-megállapodás és a Fulbright-program; a következő lépés a célzott intézményi partnerségek (pl. MIT–HUN-REN) bővítése, valamint a nukleáris, MI- és élettudományi együttműködés.',
      egyuttmukodesiLehetosegek:
        'Magvető (seed) alapok további vezető egyetemekkel az MIT–HUN-REN mintájára; mRNS- és élettudományi kutatás a Pennsylvaniai Egyetemhez kötődő magyar kapcsolatokra építve; '
        + 'kis moduláris reaktorok és nukleáris szakemberképzés; MI- és félvezető-alkalmazások a nyugati parti ökoszisztémában; amerikai kutatók megszólítása magyar posztdoktori és vendégkutatói helyekkel.',
      joGyakorlatok:
        'Az egyetemi szellemi tulajdon Bayh–Dole-típusú hasznosítása; az SBIR/STTR szakaszos, vissza nem térítendő KKV-finanszírozása; a DARPA/ARPA-típusú, programmenedzserek vezette missziós finanszírozás; '
        + 'az NSF I-Corps kutatói vállalkozásképzése.',
      diplomaciaiPrioritasok:
        'A vegyes bizottság ülésének összehívása; rendszeres magas szintű kapcsolat az NSF-fel, az NIH-val és a DOE-val; a Fulbright- és a Fulbright–MTA-ösztöndíjak bővítése; '
        + 'a nukleáris együttműködés kutatási és képzési elemeinek kidolgozása; magyar startupok felkészítése a keleti és a nyugati parti ökoszisztémára.',
    },
  },
};

export default orszag;
