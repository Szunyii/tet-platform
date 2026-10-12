/**
 * Puerto Rico (PR) 2026-os profilja – kutatott vázlat, a relációs vezető pontosítja. Részleges profil: az Egyesült Államok
 * önkormányzó területe (Commonwealth), a KFI-rendszer szövetségi része (NSF, NIH, NASA) az USA-profilban.
 * Források (hozzáférés: 2026-10-09):
 * - Alapadatok: IMF World Economic Outlook, 2025. október (IMF.RES:WEO_2025_OCT_VINTAGE, 2025-ös év: GDP 126,546 Mrd USD,
 *   GDP/fő 39 853,523 USD, reálnövekedés −0,8%, lakosság 3,175 millió; 2023-ban 3,206 millió; az IMF a pénzügyi éves nemzeti
 *   számlákat rendeli a naptári évhez: FY2024/25 = 2025) –
 *   https://api.imf.org/external/sdmx/2.1/data/IMF.RES,WEO_2025_OCT_VINTAGE,1.0.0/PRI.NGDPD+NGDPDPC+NGDP_RPCH+LP.A?startPeriod=2023&endPeriod=2025
 * - Terület: Világbank AG.SRF.TOTL.K2 (2024: 8 870 km²) – https://data.worldbank.org/indicator/AG.SRF.TOTL.K2?locations=PR
 * - ECLAC-társult tagság (az ECLAC honlapja 2026 októberében is társult tagként sorolja fel; az USA 2026. január 7-i memoranduma az
 *   ECLAC-ból való kilépést is elrendelte, ennek a társult tagságra gyakorolt hatása nem ismert) –
 *   https://www.cepal.org/en/member-states-and-associate-members ; https://www.govinfo.gov/content/pkg/FR-2026-01-16/html/2026-00976.htm
 * - GII 2025: Puerto Rico nem szerepel a 139 gazdaság között – https://www.wipo.int/web-publications/global-innovation-index-2025/en/gii-2025-results.html
 * - GERD: Világbank GB.XPD.RSDV.GD.ZS (UNESCO UIS), a legutóbbi adat 2015: 0,429% – https://data.worldbank.org/indicator/GB.XPD.RSDV.GD.ZS?locations=PR
 * - PRSTRT (2004. évi 214. törvény; célágazatok; programok; Science City; Act 60 kutatói adókedvezmény) – https://prsciencetrust.org/about/ ;
 *   https://prsciencetrust.org/science-city/ ; https://prsciencetrust.org/act-60/
 * - Parallel18 (a PRSTRT programja; az alumni-jegyzék szerint több mint 600 startup a világ minden tájáról) – https://parallel18.com/ ;
 *   Colmena66 (a PRSTRT programja, SBIR/STTR-segítség) – https://www.colmena66.com
 * - NSF EPSCoR (Puerto Rico jogosult terület; E-CORE támogatás 2026. július 31.) – https://www.nsf.gov/funding/initiatives/epscor/state-websites ;
 *   https://www.nsf.gov/od/oia/updates/nsf-epscor-awards-major-research-ecosystem-expansions ; RAIS-PR (UPR Mayagüez) – https://www.uprm.edu/epscorraispr
 * - Arecibo (a 305 m-es távcső 2020. december 1-jei összeomlása; NSF Arecibo C3) – https://www.nsf.gov/news/media-toolkits/arecibo
 * - Invest Puerto Rico (feldolgozóipar: a GDP 43%-a; több mint 70 éves gyógyszer- és orvostechnikai gyártás; 30+ orvostechnikai gyártó;
 *   jelen lévő vállalatok; 4%-os társasági adókulcs; PRMA, PRiMEX, DDEC; Engine-4; UPR Molecular Sciences Research Center;
 *   21st Century Techforce Initiative; aguadillai repülőgépipari korridor; Puerto Rico Space Grant Consortium) –
 *   https://www.investpr.org/key-sectors/biosciences/ ; https://www.investpr.org/key-sectors/advanced-manufacturing/ ;
 *   https://www.investpr.org/key-sectors/aerospace/ ; https://www.investpr.org/key-sectors/technology-and-ict/
 * Kimaradt blokkok és mezők: rendezvenyek (nincs ellenőrzött, rendszeres KFI-rendezvény), kapcsolatok (nincs ellenőrzött magyar
 * vonatkozás; az ECLAC-társult tagság az Alapadatokban); kfiRendszer.strategia (nincs ellenőrzött, hatályos KFI-stratégia),
 * alapadatok.tagsagok (a szótár egyik szervezetének sem tagja).
 */
import type { DemoOrszag } from '../tipusok';

const orszag: DemoOrszag = {
  kod: 'PR',
  profil: {
    alapadatok: {
      fovaros: 'San Juan',
      terulet: '8 870',
      penznem: 'amerikai dollár (USD)',
      lakossag: '3 175 000',
      gdp: '126,5',
      gdpEgyFore: '39 854',
      gdpNovekedes: '-0,8',
      adatEv: '2025',
      forras: 'IMF World Economic Outlook (2025. október; a GDP-adatoknál 2025 = a 2024/25-ös pénzügyi év, becslés), Világbank (terület)',
      tagsagok: [],
      tagsagEgyeb: 'Az ENSZ Latin-amerikai és Karibi Gazdasági Bizottságának (ECLAC) társult tagja',
      agazatok: ['Biotechnológia és gyógyszeripar', 'Turizmus', 'Pénzügyi szolgáltatások', 'IKT és digitalizáció'],
      agazatEgyeb: 'Orvostechnikai eszközök gyártása, repülőgépipar (karbantartás, alkatrészgyártás), elektronika',
    },
    kfiRendszer: {
      teljesitmeny:
        'Puerto Rico nem szerepel a Global Innovation Indexben. A K+F-ráfordítás a Világbank (UNESCO UIS) legutóbbi, 2015-ös adata szerint a GDP 0,43%-a volt. '
        + 'Az Invest Puerto Rico szerint a feldolgozóipar adja a GDP 43%-át, a gyógyszer- és orvostechnikai gyártásnak több mint 70 éves hagyománya van. '
        + 'A sziget az NSF EPSCoR-programjában jogosult terület: 2026 júliusában új E-CORE támogatást kapott a „Research Infrastructure for AI-based Sustainable STEM Technologies in Puerto Rico” (RAIS-PR) projekt.',
      gerd: '0,43',
      strategia: '',
      prioritasok: [
        'Egészség és élettudomány', 'Startup és vállalkozói ökoszisztéma', 'Tehetség és mobilitás', 'Digitalizáció és MI', 'Energiabiztonság',
      ],
      prioritasEgyeb: 'Népegészségügy és vektorkontroll, trópusi biodiverzitás, tengerszint-emelkedés (PRSTRT-programok)',
      kiemeltIparagak: [
        'Biotechnológia és gyógyszeripar', 'IKT és digitalizáció', 'Mesterséges intelligencia és adatgazdaság', 'Energetika és fenntarthatóság',
      ],
      iparagEgyeb: 'Orvostechnikai eszközök, repülőgép-karbantartás és -alkatrészgyártás',
      erossegek:
        'Globális gyógyszer- és orvostechnikai gyártóbázis (az Invest Puerto Rico szerint több mint 30 orvostechnikai gyártó van jelen); amerikai jogi és szabályozási keretek; '
        + 'kétnyelvű, műszaki végzettségű munkaerő; kedvező adóösztönzők (Act 60, 4%-os társasági adókulcs); '
        + 'a PRSTRT egy szervezetben fogja össze a kutatásfinanszírozást, a technológiatranszfert, a startup-támogatást (Parallel18) és a népegészségügyi programokat.',
      kihivasok:
        'Alacsony K+F-intenzitás (0,43%, 2015): a gyártóbázisban multinacionális vállalatok (pl. AbbVie, Amgen, Medtronic) üzemei működnek, a helyi K+F-ráfordítás kicsi. '
        + 'A népesség fogy (IMF: 2023-ban 3,21 millió, 2025-ben 3,18 millió fő), és az IMF 2025. októberi becslése szerint a gazdaság a 2024/25-ös pénzügyi évben 0,8%-kal zsugorodott. '
        + 'A 305 m-es Arecibo-rádiótávcső 2020-as összeomlásával a sziget elveszítette legismertebb kutatási nagyberendezését.',
    },
    intezmenyek: {
      iranyitoSzervek:
        'Puerto Rico Science, Technology & Research Trust (PRSTRT) – a 2004. évi 214. törvénnyel létrehozott autonóm szervezet: kutatásfinanszírozás, technológiatranszfer, startup-támogatás és népegészségügyi programok.\n'
        + 'Department of Economic Development and Commerce (DDEC) – gazdaságfejlesztés és ösztönzők.\n'
        + 'Invest Puerto Rico – befektetésösztönzés.\n'
        + 'Szövetségi szinten: NSF (EPSCoR), NIH, NASA (Puerto Rico Space Grant Consortium).',
      egyetemek:
        'University of Puerto Rico (UPR) rendszer – kiemelten a mayagüezi kampusz (mérnöki képzés; az NSF EPSCoR RAIS-PR központ székhelye), a Río Piedras-i kampusz és az orvostudományi kampusz (Medical Sciences Campus); '
        + 'Ponce Health Sciences University; Universidad Ana G. Méndez; Inter American University of Puerto Rico.',
      kutatokozpontok:
        'UPR Molecular Sciences Research Center; a PRSTRT kutatóintézete, Caribbean Center for Rising Seas és Center for Tropical Biodiversity; Puerto Rico Vector Control Unit; '
        + 'Puerto Rico Consortium for Clinical Investigation; Puerto Rico Public Health Institute; RAIS-PR központ (UPR Mayagüez, NSF EPSCoR).',
      infrastrukturak:
        'A PRSTRT Science City kutatási komplexuma San Juanban (laboratóriumok, inkubátorterek, konferenciaközpont, Puerto Rico Environmental Research Laboratory); Engine-4 maker-labor és inkubátor (Bayamón); '
        + 'az NSF Arecibo-obszervatóriuma, ahol a 305 m-es rádiótávcső 2020. decemberi összeomlása után az NSF Arecibo C3 oktatási és kutatási központ jött létre; az aguadillai repülőtér és repülőgépipari korridor.',
    },
    vallalati: {
      kiemeltAgazatok: ['Biotechnológia és gyógyszeripar', 'IKT és digitalizáció'],
      agazatEgyeb: 'Orvostechnikai eszközök, repülőgép-karbantartás és -alkatrészgyártás, elektronika',
      topVallalatok: [
        'AbbVie', 'Amgen', 'Medtronic', 'Boston Scientific', 'Stryker',
        'Zimmer Biomet', 'Lufthansa Technik', 'Collins Aerospace', 'Jabil', 'Microsoft',
      ].join('\n'),
      startupok:
        'Parallel18: a PRSTRT globális startup-akcelerátora és befektetési platformja (inkubációs program élettudományi startupoknak, akceleráció és skálázás), több mint 600 végzett (alumni) startuppal a világ minden tájáról; '
        + 'Colmena66: a PRSTRT vállalkozói támogató hálózata, amely az SBIR/STTR szövetségi pályázatokhoz is segítséget nyújt.',
      klaszterek:
        'A PRSTRT Science City-je San Juanban; az Engine-4 inkubátor (Bayamón); az aguadillai repülőgépipari korridor; '
        + 'a Puerto Rico Manufacturers Association (PRMA) és a Puerto Rico Manufacturing Extension (PRiMEX) gyártásfejlesztési hálózata.',
      technologiatranszfer:
        'A PRSTRT technológiatranszfer-irodája; az Act 60 kutatói adókedvezménye (a kompetitív K+F-pályázatokból kapott kutatói fizetés adómentessége a Puerto Ricó-i felsőoktatási intézményekben).',
    },
    programok: {
      palyazatok:
        'PRSTRT Research Grants Program; NSF EPSCoR (2026-tól a RAIS-PR E-CORE-projekt); szövetségi kutatási pályázatok (NSF, NIH, NASA Space Grant).',
      tamogatasiProgramok:
        'Parallel18 (akceleráció, skálázás), Colmena66 és a PRSTRT SBIR/STTR-pályázati segítsége; STEM-oktatási és munkaerő-fejlesztési programok; '
        + 'a 21st Century Techforce Initiative 2035-ig 50 ezer további szakképzett munkavállalót céloz.',
      finanszirozasiEszkozok:
        'Act 60 (Puerto Ricó-i ösztönzési kódex): 4%-os kedvezményes társasági adókulcs a jogosult tevékenységekre, kutatói jövedelemadó-mentesség; a Parallel18 befektetési platformja.',
      nemzetkoziReszvetel:
        'A Parallel18 a világ minden tájáról fogad startupokat; Puerto Rico az ENSZ Latin-amerikai és Karibi Gazdasági Bizottságának (ECLAC) társult tagja.',
    },
    magyarErtekeles: {
      osszegzes:
        'Puerto Rico globális gyógyszer- és orvostechnikai gyártóbázis, de saját K+F-kapacitása kicsi. A KFI-rendszer a PRSTRT-re, az UPR-re és a szövetségi programokra (NSF EPSCoR) épül. '
        + 'Magyar szempontból elsősorban a gyógyszer- és orvostechnikai beszállítói kapcsolatok, valamint a Parallel18 akcelerátor kínál belépési pontot; önálló TéT-prioritásként nem indokolt.',
      egyuttmukodesiLehetosegek:
        'Magyar gyógyszeripari és orvostechnikai KKV-k bekapcsolása a Puerto Ricó-i gyártók beszállítói láncába; magyar startupok jelentkezése a Parallel18 programjaiba; '
        + 'trópusi betegségek és vektorkontroll-kutatás (Puerto Rico Vector Control Unit); MI-alapú energiarendszerek és távérzékelés (RAIS-PR).',
      joGyakorlatok:
        'A PRSTRT integrált modellje: egy szervezet fogja össze a kutatásfinanszírozást, a technológiatranszfert, a startup-akcelerációt és a népegészségügyi programokat; '
        + 'a kutatói fizetések adómentessége a kompetitív pályázatok ösztönzésére (Act 60).',
      diplomaciaiPrioritasok:
        'Regionális kapcsolatépítés a PRSTRT-vel és az UPR-rel; a Parallel18 felhívásainak népszerűsítése a magyar startupok körében; a magyar gyógyszeripar és orvostechnika célzott bemutatása.',
    },
  },
};

export default orszag;
