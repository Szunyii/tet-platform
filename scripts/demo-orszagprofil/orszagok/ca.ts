/**
 * Kanada (CA) 2026-os profilja – kutatott vázlat, a relációs vezető pontosítja.
 * Források (hozzáférés: 2026-10-09):
 * - Alapadatok: IMF World Economic Outlook, 2025. október (IMF.RES:WEO_2025_OCT_VINTAGE, 2025-ös év: GDP 2 283,599 Mrd USD,
 *   GDP/fő 54 934,843 USD, reálnövekedés 1,153%, lakosság 41,569 millió) –
 *   https://api.imf.org/external/sdmx/2.1/data/IMF.RES,WEO_2025_OCT_VINTAGE,1.0.0/CAN.NGDPD+NGDPDPC+NGDP_RPCH+LP.A?startPeriod=2025&endPeriod=2025
 * - Terület (szárazföld és édesvíz): Statistics Canada, Canada Year Book, 15.6. táblázat (forrás: NRCan) –
 *   https://www150.statcan.gc.ca/n1/pub/11-402-x/2012000/chap/geo/tbl/tbl06-eng.htm
 *   A Világbank AG.SRF.TOTL.K2 kanadai értéke (15 634 410 km², 2021–2024) a part menti vizek egy részét is tartalmazza, és mintegy
 *   másfélszerese a szokásos 9 984 670 km²-nek, ezért a profil a Statistics Canada adatát közli (más nagy országoknál, pl. Ausztrália,
 *   Brazília, Kína, Oroszország, a Világbank értéke a szokásos összterülettel egyezik) – https://data.worldbank.org/indicator/AG.SRF.TOTL.K2?locations=CA
 * - GII 2025 (17. hely; 2024: 14.; kibocsátás 20.; erősségek; klaszterek): https://www.wipo.int/edocs/gii-ranking/2025/ca.pdf
 * - GERD: Világbank GB.XPD.RSDV.GD.ZS (UNESCO UIS) és OECD MSTI, 2024 (előzetes): 1,79% –
 *   https://data.worldbank.org/indicator/GB.XPD.RSDV.GD.ZS?locations=CA ;
 *   OECD MSTI (OECD-átlag 2024: 2,72%; BERD 1,06%, OECD 2,00%; külföldi finanszírozású BERD 16%; GERD 2024: 55 726 millió CAD) –
 *   https://www.oecd.org/en/data/datasets/main-science-and-technology-indicators.html
 *   Statistics Canada, The Daily, 2025. november 27. (GERD 2023: 57,4 Mrd CAD, végleges) – https://www150.statcan.gc.ca/n1/daily-quotidien/251127/dq251127g-eng.htm
 * - Stratégia: Canada's National Artificial Intelligence Strategy: AI for All (2026. június 4.) –
 *   https://www.canada.ca/en/innovation-science-economic-development/news/2026/06/minister-solomon-highlights-canadas-national-artificial-intelligence.html
 *   Pan-Canadian AI Strategy (2017; Amii, Mila, Vector Institute, CIFAR) – https://ised-isde.canada.ca/site/ised/en/pan-canadian-artificial-intelligence-strategy
 *   Nemzeti Kvantumstratégia (2023. január) – https://www.perimeterinstitute.ca/news/government-canada-launches-national-quantum-strategy
 *   Budget 2025 (1,7 Mrd CAD kutatótoborzás; SR&ED: 35%-os kiemelt jóváírás, 6 millió CAD-os plafon, tőzsdei társaságok, a CRA 2026. április
 *   1-jétől választható előzetes jóváhagyása; 64%-ban kisvállalkozások; termelékenységi szuperleírás; 925,6 millió CAD MI-számítási
 *   kapacitás; a védelmi iparstratégia keretében 334,3 millió CAD a kvantumökoszisztémára; vámok által érintett iparágak) –
 *   https://budget.canada.ca/2025/report-rapport/chap1-en.html ;
 *   „Canada Strong” – https://budget.canada.ca/2025/home-accueil-en.html
 * - Vállalatok: EU Industrial R&D Investment Scoreboard 2025 (2024-es adatok; a tíz legnagyobb kanadai K+F-ráfordító a Toronto-Dominion
 *   Bank nélkül; SB2025_World2000.xlsx) – https://knowledge-for-policy.ec.europa.eu/sites/default/files/World2000%282004-2025%29.zip ;
 *   Cohere – https://cohere.com/about ; Xanadu – https://www.xanadu.ai/
 * - Globális Innovációs Klaszterek (5 klaszter; 706 projekt, 3627 partner, 3,55 Mrd CAD+ ipari társfinanszírozás) –
 *   https://ised-isde.canada.ca/site/global-innovation-clusters/en
 * - Horizont Európa II. pillér-társulás (Montréal, 2024. július 3.; közvetlen uniós finanszírozás) –
 *   https://euraxess.ec.europa.eu/worldwide/north-america/news/canada-joins-horizon-europe
 * - EUREKA: teljes jogú tagság (2022. június 22.; 2012 óta társult tag) –
 *   https://www.canada.ca/en/national-research-council/news/2022/06/canada-announces-full-membership-in-the-eureka-network.html ;
 *   kanadai finanszírozó: NRC IRAP – https://www.eurekanetwork.org/country/canada/ ; magyar finanszírozó: NKFIH – https://www.eurekanetwork.org/country/hungary/
 * - Rendezvények: PDAC 2026 – https://www.globalminingreview.com/exploration-development/25022026/toronto-to-host-global-mineral-sector-for-pdac-2026/ ;
 *   https://vancouver.websummit.com/ ; Inventures (Alberta Innovates; 2025. május, BMO Centre) – https://calgary.tech/2025/01/03/inventures-2025-innovation-calgary/ ,
 *   2025-ös és 2026-os rendezése (szövetségi támogatás) – https://search.open.canada.ca/grants/record/prairiescan,044-2025-2026-Q2-00022,current ;
 *   Toronto Tech Week – https://betakit.com/toronto-tech-week-returns-in-2026/ ;
 *   ALL IN 2026 – https://www.liaa.gov.lv/en/event/trade-mission-all-2026-connect-latvias-ai-excellence-montreal ;
 *   szervezők: Scale AI és Mila (a Mila 2024–25-ös hatásjelentése) – https://mila.quebec/en/about/impact-reports/impact-report-2024-2025 ;
 *   CSPC 2026 – https://sciencepolicy.ca/wp-content/uploads/2026/01/CSPC2026-Partnership-Prospectus.pdf
 * - Magyar vonatkozás: kétoldalú TéT-egyezmény nem ismert (a fiatalok ideiglenes munkavállalásáról szóló megállapodás 2007-es
 *   tárgyalási felhatalmazása – 10/2007. (IV. 3.) ME határozat, https://adozona.hu/jogtar/35932_10_2007_IV_3_ME_hatarozat_Magyar_Koztarsasag –
 *   nem TéT-egyezmény). A közös keretek (Horizont Európa, EUREKA) forrásai fent. Kanada nem Stipendium Hungaricum-partnerország –
 *   https://stipendiumhungaricum.hu/partners/
 * Kimaradt mezők: kapcsolatok.egyezmeny (nincs ellenőrzött kétoldalú TéT-egyezmény), kapcsolatok.mobilitas (nincs ellenőrzött
 * kétoldalú mobilitási program).
 */
import { rendezvenyek, type DemoOrszag } from '../tipusok';

const orszag: DemoOrszag = {
  kod: 'CA',
  profil: {
    alapadatok: {
      fovaros: 'Ottawa',
      terulet: '9 984 670',
      penznem: 'kanadai dollár (CAD)',
      lakossag: '41 569 000',
      gdp: '2 283,6',
      gdpEgyFore: '54 935',
      gdpNovekedes: '1,2',
      adatEv: '2025',
      forras: 'IMF World Economic Outlook (2025. október), Statistics Canada (terület)',
      tagsagok: ['OECD', 'NATO', 'G7', 'G20', 'Nemzetközösség'],
      tagsagEgyeb: 'APEC, USMCA/CUSMA, CPTPP, Frankofónia (OIF)',
      agazatok: [
        'Energetika és fenntarthatóság', 'Bányászat és nyersanyagok', 'Pénzügyi szolgáltatások', 'Agrár- és élelmiszeripar',
        'Mobilitás és autóipar', 'IKT és digitalizáció',
      ],
      agazatEgyeb: 'Repülőgépipar, erdő- és faipar',
    },
    kfiRendszer: {
      teljesitmeny:
        'A Global Innovation Index 2025-ben a 17. hely (2024-ben 14.); erőssége a tudományos teljesítmény (idézettségi H-index: 4.), a vezető egyetemek (5.) és az egyetem–ipar K+F-együttműködés (6.); '
        + 'a világ 100 vezető klasztere között Toronto (33.), Montréal (62.) és Vancouver (66.). A K+F-ráfordítás 2024-ben a GDP 1,79%-a (előzetes adat; Világbank, OECD MSTI), '
        + 'jóval az OECD-átlag (2,72%) alatt; összege 55,7 milliárd CAD (2023: 57,4 milliárd CAD).',
      gerd: '1,79',
      strategia: 'Canada’s National AI Strategy: AI for All (2026); Nemzeti Kvantumstratégia (2023); a Budget 2025 (Canada Strong) kutatói tehetségvonzási és SR&ED-intézkedései',
      prioritasok: [
        'Digitalizáció és MI', 'Tehetség és mobilitás', 'Alapkutatási kiválóság', 'Technológiai szuverenitás', 'Védelem és biztonság',
        'Zöld átállás és klímasemlegesség', 'Startup és vállalkozói ökoszisztéma',
      ],
      prioritasEgyeb: 'Kvantumtechnológia (Nemzeti Kvantumstratégia), szuverén MI-számítási kapacitás, a hazai szellemi tulajdon létrehozása és megtartása',
      kiemeltIparagak: [
        'Mesterséges intelligencia és adatgazdaság', 'Kvantumtechnológia', 'Biotechnológia és gyógyszeripar',
        'Energetika és fenntarthatóság', 'Agrár- és élelmiszeripar', 'Űripar',
      ],
      iparagEgyeb: 'Óceántechnológia, fejlett gyártás, repülőgépipar és szimuláció',
      erossegek:
        'Világszínvonalú MI-alapkutatás: a 2017-ben indított Pan-Canadian AI Strategy három nemzeti MI-intézetre (Amii, Mila, Vector Institute) és a CIFAR koordinációjára épül; '
        + 'erős kvantumkutatás és -ipar (Perimeter Institute és Institute for Quantum Computing – Waterloo; pl. Xanadu); kiemelkedő tudományos kibocsátás; jól működő egyetem–ipar együttműködés.',
      kihivasok:
        'Alacsony vállalati K+F-intenzitás (BERD: a GDP 1,06%-a 2024-ben, nagyjából fele az OECD-átlagnak) és gyengébb hasznosítás (a GII-ben a kibocsátási oldalon 20.); '
        + 'a vállalati K+F mintegy hatodát külföldről finanszírozzák (2024: 16%). Kockázatot jelent az USA vámintézkedéseinek hatása az érintett iparágakra.',
    },
    intezmenyek: {
      iranyitoSzervek:
        'Innovation, Science and Economic Development Canada (ISED) – az innovációs, tudomány- és iparpolitika minisztériuma.\n'
        + 'Mesterséges Intelligencia és Digitális Innováció minisztere – a nemzeti MI-stratégia gazdája.\n'
        + 'Kanada tudományos főtanácsadója (Chief Science Advisor).\n'
        + 'Finanszírozók: NSERC, CIHR és SSHRC (a három kutatásfinanszírozó tanács), Canada Foundation for Innovation (infrastruktúra), National Research Council (NRC, IRAP-programmal), Canadian Space Agency.',
      egyetemek:
        'University of Toronto, McGill University, University of British Columbia, Université de Montréal, University of Alberta, McMaster University, University of Waterloo, '
        + 'Université Laval, University of Calgary, Western University (mind a kutatóegyetemeket tömörítő U15 csoport tagja).',
      kutatokozpontok:
        'Az NRC kutatóközpontjai; a nemzeti MI-intézetek: Mila (Montréal), Vector Institute (Toronto), Amii (Edmonton) és a CIFAR; Perimeter Institute és Institute for Quantum Computing (Waterloo); '
        + 'Defence Research and Development Canada (DRDC).',
      infrastrukturak:
        'TRIUMF részecskegyorsító-központ (Vancouver); Canadian Light Source szinkrotron (Saskatoon); SNOLAB föld alatti laboratórium (Sudbury); Ocean Networks Canada óceáni megfigyelőhálózat; '
        + 'a Budget 2025 öt év alatt 925,6 millió CAD-t biztosít szuverén MI-számítási kapacitásra.',
    },
    vallalati: {
      kiemeltAgazatok: [
        'Mesterséges intelligencia és adatgazdaság', 'IKT és digitalizáció', 'Kvantumtechnológia', 'Mobilitás és autóipar', 'Űripar',
        'Biotechnológia és gyógyszeripar',
      ],
      agazatEgyeb: 'Repülőgépipar és szimuláció (Bombardier, CAE), vállalati szoftver',
      topVallalatok: [
        'Constellation Software', 'Shopify', 'Magna International', 'OpenText', 'Bausch Health',
        'Thomson Reuters', 'Bausch + Lomb', 'BRP', 'Xenon Pharmaceuticals', 'AbCellera',
      ].join('\n'),
      startupok:
        'Ismert MI- és kvantumcégek: Cohere (generatív nyelvi modellek; 2019-ben Torontóban alapították), Xanadu (kvantumszámítógép-fejlesztő). '
        + 'A KKV-k innovációját az NRC IRAP és az SR&ED-adóhitel támogatja; 2024–25-ben az SR&ED-igénylések 64%-át kisvállalkozások nyújtották be.',
      klaszterek:
        'Globális Innovációs Klaszterek: digitális technológia (DIGITAL), fehérjeipar (Protein Industries Canada), fejlett gyártás (NGen), MI (Scale AI), óceángazdaság (Canada’s Ocean Supercluster) – '
        + '706 projekt, 3627 partner, több mint 3,55 milliárd CAD ipari társfinanszírozás; MaRS Discovery District (Toronto).',
      technologiatranszfer:
        'Egyetemi technológiatranszfer-irodák; az NRC IRAP tanácsadói hálózata; a Mitacs egyetem–ipar kutatási gyakornoki programjai; a Budget 2025 a hazai szellemi tulajdon megtartását célzó intézkedései.',
    },
    programok: {
      palyazatok:
        'Az NSERC, a CIHR és az SSHRC pályázatai (pl. NSERC Discovery Grants, CIHR Project Grants); New Frontiers in Research Fund; CFI infrastruktúra-pályázatok; Canada Research Chairs, Canada Excellence Research Chairs.',
      tamogatasiProgramok:
        'Budget 2025: legfeljebb 1,7 milliárd CAD több mint ezer nemzetközi kutató Kanadába vonzására (ebből 1 milliárd CAD 13 év alatt katedraprogramra, 400 millió CAD a CFI-n át infrastruktúrára); '
        + 'Pan-Canadian AI Strategy; Nemzeti Kvantumstratégia (2023); a Budget 2025 a védelmi iparstratégia keretében öt év alatt további 334,3 millió CAD-t ad a kanadai kvantumökoszisztémára; '
        + 'Strategic Innovation Fund.',
      finanszirozasiEszkozok:
        'SR&ED-adóhitel: a kiemelt, 35%-os jóváírás kiadási plafonja 6 millió CAD (a 2024. december 16-tól kezdődő adóévektől), és a jogosult kanadai tőzsdei társaságokra is kiterjed; '
        + 'a Budget 2025 szerint 2026. április 1-jétől választható előzetes (pre-claim) jóváhagyás. Termelékenységi szuperleírás (pl. gépek, kutatási beruházások azonnali leírása); NRC IRAP; BDC Capital.',
      nemzetkoziReszvetel:
        'Horizont Európa II. pillér: a kanadai résztvevők közvetlenül a programból kaphatnak finanszírozást; EUREKA (Eurostars, Network Projects): a kanadai résztvevők finanszírozója az NRC IRAP.',
    },
    rendezvenyek: rendezvenyek([
      { nev: 'PDAC Convention', tipus: 'szakkiallitas', idopont: 'március, Toronto (Metro Toronto Convention Centre)', megjegyzes: 'Ásványkutatás és bányászat (2026-ban 94. alkalommal)' },
      { nev: 'Web Summit Vancouver', tipus: 'konferencia', idopont: 'május, Vancouver (2026: május 11–14.)', megjegyzes: 'Technológiai és startup-konferencia' },
      { nev: 'Inventures', tipus: 'forum', idopont: 'május, Calgary', megjegyzes: 'Az Alberta Innovates innovációs konferenciája' },
      { nev: 'Toronto Tech Week', tipus: 'forum', idopont: 'május–június, Toronto (2026: május 25–29.)', megjegyzes: 'Technológiai és startup-rendezvénysorozat (2025 óta)' },
      { nev: 'ALL IN', tipus: 'konferencia', idopont: 'szeptember, Montréal (2026: szeptember 16–17.)', megjegyzes: 'MI-konferencia (szervezők: Scale AI és Mila)' },
      { nev: 'Canadian Science Policy Conference (CSPC)', tipus: 'konferencia', idopont: 'november, Ottawa (2026: november 25–27.)', megjegyzes: 'Tudomány- és innovációpolitikai konferencia' },
    ]),
    kapcsolatok: {
      euMultilateralis:
        'Horizont Európa II. pillér-társulás (Montréal, 2024. július 3.); az EUREKA teljes jogú tagja 2022 óta (2012-től társult tag); CETA az EU-val (2017 óta ideiglenesen alkalmazva); '
        + 'OECD, G7, G20, Nemzetközösség, Frankofónia.',
      partnerorszagok: 'Egyesült Államok (USMCA/CUSMA), EU-tagállamok (Horizont Európa, CETA), Egyesült Királyság, Franciaország, Japán (CPTPP).',
      egyezmeny: '',
      ketoldalu:
        'A közös projektek keretei: a kanadai partnerek társult országként vehetnek részt magyar részvételű Horizont Európa II. pillér-konzorciumokban; az EUREKA-projektekben a magyar résztvevőket az NKFIH finanszírozza.',
      mobilitas: '',
    },
    magyarErtekeles: {
      osszegzes:
        'Kanada erős alapkutatással és MI-ökoszisztémával rendelkező, de a vállalati K+F-ben gyengébb G7-ország. A magyar–kanadai együttműködés a Horizont Európa és az EUREKA keretében, '
        + 'külön kétoldalú megállapodás nélkül is bővíthető, elsősorban az MI, a kvantumtechnológia és a tiszta energia területén.',
      egyuttmukodesiLehetosegek:
        'Közös Horizont Európa II. pillér-konzorciumok kanadai partnerekkel (digitális, ipari, éghajlati és energetikai témák); Eurostars-projektek magyar és kanadai KKV-kkal; '
        + 'MI- (Mila, Vector Institute, Amii) és kvantumkutatási (Waterloo) együttműködés; a Budget 2025 nemzetközi kutatótoborzása a magyar kutatók számára egyszerre lehetőség és elszívó hatás.',
      joGyakorlatok:
        'A nemzeti MI-stratégia intézeti modellje (CIFAR-koordináció, három nemzeti MI-intézet); az SR&ED KKV-barát kiemelt adójóváírása és az előzetes (pre-claim) jóváhagyás; '
        + 'a Globális Innovációs Klaszterek ipari társfinanszírozású együttműködési modellje; a nemzetközi kutatótoborzás célzott katedraprogramja.',
      diplomaciaiPrioritasok:
        'Egy magyar–kanadai TéT-együttműködési keret (szándéknyilatkozat vagy közös felhívás) feltárása; a kanadai Horizont Európa-részvétel népszerűsítése a magyar pályázók körében; '
        + 'MI- és kvantumdelegációk az ALL IN és a Web Summit Vancouver rendezvényekre; kapcsolatépítés a kanadai magyar tudományos diaszpórával.',
    },
  },
};

export default orszag;
