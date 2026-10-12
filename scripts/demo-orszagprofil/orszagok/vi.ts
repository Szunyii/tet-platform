/**
 * Amerikai Virgin-szigetek (VI) 2026-os profilja – kutatott vázlat, a relációs vezető pontosítja. Részleges profil: az Egyesült
 * Államok területe, a KFI-rendszer szövetségi része (NSF, USDA, NIH) az USA-profilban.
 * Források (hozzáférés: 2026-10-09):
 * - Alapadatok: az IMF WEO nem közöl adatot. GDP és reálnövekedés: U.S. Bureau of Economic Analysis (BEA), Gross Domestic Product
 *   for the U.S. Virgin Islands, 2022 (2024. június 17.; 2022: 4 672 millió USD, −1,3%, előzetes becslés; ágazati szerkezet 2021:
 *   közszféra 19%, szálláshely és vendéglátás 11%, kereskedelem 10%; a BEA finanszírozás hiányában felfüggesztette a GDP-becslést,
 *   ez a legfrissebb hivatalos adat) – https://www.bea.gov/data/gdp/gdp-us-virgin-islands-usvi ;
 *   https://www.bea.gov/sites/default/files/2024-06/vigdp0624.pdf ; https://www.bea.gov/sites/default/files/2024-06/vigdp0624.xlsx
 *   Lakosság: ENSZ World Population Prospects 2024, közepes változat, 2025: 84 138 fő (LocID 850; a 2020-as népszámlálás 87 146 főjére
 *   épül) – https://population.un.org/wpp/ (WPP2024_TotalPopulationBySex.csv). A Világbank SP.POP.TOTL 2025-ös értéke (103 792) nem
 *   tartalmazza a 2020-as népszámlálást („Latest population census: 2020 (expected)”), ezért a profil nem ezt közli.
 *   A 2020-as népszámlálás (87 146 fő, 18,1%-kal kevesebb, mint 2010-ben; a Kihívásokban) –
 *   https://www.census.gov/newsroom/press-releases/2021/2020-census-us-virgin-islands.html
 *   Terület: Világbank AG.SRF.TOTL.K2 (2024: 348 km²) – https://data.worldbank.org/indicator/AG.SRF.TOTL.K2?locations=VI
 * - ECLAC-társult tagság (az ECLAC honlapja 2026 októberében is társult tagként sorolja fel; az USA 2026. január 7-i memoranduma az
 *   ECLAC-ból való kilépést is elrendelte, ennek a társult tagságra gyakorolt hatása nem ismert) –
 *   https://www.cepal.org/en/member-states-and-associate-members ; https://www.govinfo.gov/content/pkg/FR-2026-01-16/html/2026-00976.htm
 * - GII 2025: a terület nem szerepel – https://www.wipo.int/web-publications/global-innovation-index-2025/en/gii-2025-results.html
 * - GERD: a Világbank GB.XPD.RSDV.GD.ZS legutóbbi adata 2007-es (0,027%), elavult, ezért a mező üres –
 *   https://data.worldbank.org/indicator/GB.XPD.RSDV.GD.ZS?locations=VI
 * - NSF EPSCoR (az USVI jogosult terület; projektek, összegek: BCCR, ICCE, Mare Nostrum Caribbean, Ridge to Reef, VICAR) –
 *   https://www.nsf.gov/funding/initiatives/epscor/state-websites ; https://www.viepscor.org/
 * - University of the Virgin Islands (alapítás 1962, land-grant 1972, egyetem és HBCU 1986; kutatóközpontok; Cooperative Extension
 *   Service) – https://www.uvi.edu/about/history.html ; https://www.uvi.edu/research/index.html ; https://www.uvi.edu/about/programs-centers.html
 * Kimaradt blokkok és mezők: vallalati, rendezvenyek, nemzetkoziKapcsolatok, magyarKapcsolatok (nincs ellenőrzött tartalom, magyar vonatkozás sem);
 * alapadatok.gdpEgyFore (nincs hivatalos egy főre jutó becslés; a GDP 2022-es, a lakosság 2025-ös becslés), alapadatok.tagsagok (a szótár
 * egyik szervezetének sem tagja), kfiRendszer.gerd (csak elavult, 2007-es adat), kfiRendszer.strategia (nincs ellenőrzött
 * KFI-stratégia), intezmenyek.infrastrukturak, programok.finanszirozasiEszkozok és programok.nemzetkoziReszvetel (nincs
 * ellenőrzött tartalom).
 */
import type { DemoOrszag } from '../tipusok';

const orszag: DemoOrszag = {
  kod: 'VI',
  profil: {
    alapadatok: {
      fovaros: 'Charlotte Amalie',
      terulet: '348',
      penznem: 'amerikai dollár (USD)',
      lakossag: '84 138',
      gdp: '4,7',
      gdpEgyFore: '',
      gdpNovekedes: '-1,3',
      adatEv: '2022',
      forras: 'USA Gazdaságelemzési Hivatala (BEA; GDP és reálnövekedés: 2022, előzetes), ENSZ World Population Prospects 2024 (lakosság: 2025), Világbank (terület)',
      tagsagok: [],
      tagsagEgyeb: 'Az ENSZ Latin-amerikai és Karibi Gazdasági Bizottságának (ECLAC) társult tagja',
      agazatok: ['Turizmus'],
      agazatEgyeb: 'Közszféra (a GDP 19%-a, 2021), kereskedelem (10%)',
    },
    kfiRendszer: {
      teljesitmeny:
        'Az Amerikai Virgin-szigetek nem szerepel a Global Innovation Indexben, és nincs friss K+F-ráfordítási adat (a Világbank legutóbbi adata 2007-es). '
        + 'A kutatás a University of the Virgin Islandsre (UVI) összpontosul. A szigetcsoport 2002 óta az NSF EPSCoR-programjában jogosult terület; az egymást követő projektek a korallzátonyok és a part menti ökoszisztémák kutatására épültek '
        + '(Ridge to Reef, 2020–2026: 20 millió USD), a 2025-ben indult VICAR (7 millió USD) pedig robotikát és MI-t alkalmaz a környezeti megfigyelésben.',
      gerd: '',
      strategia: '',
      prioritasok: ['Zöld átállás és klímasemlegesség', 'Tehetség és mobilitás', 'Digitalizáció és MI'],
      prioritasEgyeb: 'A tengeri és part menti ökoszisztémák (korallzátonyok, mangrovék) védelme, katasztrófakockázat-csökkentés, víz- és élelmiszerbiztonság',
      kiemeltIparagak: ['Energetika és fenntarthatóság', 'Agrár- és élelmiszeripar', 'Mesterséges intelligencia és adatgazdaság'],
      iparagEgyeb: 'Tengerkutatás és autonóm környezeti megfigyelés (robotika)',
      erossegek:
        'Több mint két évtizedes, folyamatos NSF EPSCoR-támogatás: 2003 óta öt egymást követő projekt (BCCR, ICCE, Mare Nostrum Caribbean, Ridge to Reef, VICAR); '
        + 'a trópusi tengeri és környezeti kutatás terepe (korallzátonyok, mangrovék); az UVI földtámogatású (land-grant) egyetemként mezőgazdasági kísérleti állomást és szaktanácsadó szolgálatot működtet.',
      kihivasok:
        'Kicsi és fogyó népesség (2020-ban 87 146 fő, 18,1%-kal kevesebb, mint 2010-ben); a turizmustól és a közszférától függő gazdaság; a 2017-es hurrikánok utáni helyreállítás; '
        + 'hiányos statisztikai adatszolgáltatás – a BEA 2024-ben finanszírozás hiányában felfüggesztette a GDP-becslést, és nincs friss K+F-adat.',
    },
    intezmenyek: {
      iranyitoSzervek:
        'Szövetségi szinten: NSF (EPSCoR – a VI-EPSCoR program az UVI-n működik), USDA (földtámogatású egyetemi programok), NIH (National Institute on Minority Health and Health Disparities).\n'
        + 'University of the Virgin Islands (UVI) – a terület egyetlen egyeteme és a kutatás fő szervezője.',
      egyetemek:
        'University of the Virgin Islands (UVI): 1962-ben alapított állami egyetem St. Thomas és St. Croix szigeti kampusszal; 1972 óta földtámogatású (land-grant) intézmény, '
        + '1986 óta egyetem. A Kongresszus 1986-ban a HBCU-k (eredetileg afroamerikai hallgatók képzésére alapított egyetemek) közé sorolta – ez az egyetlen ilyen intézmény a kontinentális USA-n kívül.',
      kutatokozpontok:
        'UVI Center for Marine & Environmental Studies (CMES) és William P. MacLean Marine Science Center; Agricultural Experiment Station (agronómia, állattenyésztés, akvakultúra, biotechnológia); '
        + 'Caribbean Green Technology Center (energia, anyaggazdálkodás, víz- és élelmiszerbiztonság, katasztrófakockázat-csökkentés); Caribbean Exploratory Research Center (egészségkutatás, NIMHD-finanszírozással); '
        + 'Eastern Caribbean Center (a terület népszámlálási adatközpontja).',
      infrastrukturak: '',
    },
    programok: {
      palyazatok:
        'NSF EPSCoR-projektek: Biocomplexity of Caribbean Coral Reefs (2003–2008, 4,5 millió USD), Integrated Caribbean Coastal Ecosystems (2008–2014, 12,4 millió USD), '
        + 'Mare Nostrum Caribbean (2014–2019, 20 millió USD), Ridge to Reef (2020–2026, 20 millió USD), Virgin Islands Center for Autonomous Research – VICAR (2025–2029, 7 millió USD).',
      tamogatasiProgramok:
        'Az UVI Cooperative Extension Service mezőgazdasági, természetierőforrás-gazdálkodási és digitális képzési programjai; a VI-EPSCoR STEM-oktatási és munkaerő-fejlesztési programjai.',
      finanszirozasiEszkozok: '',
      nemzetkoziReszvetel: '',
    },
    magyarErtekeles: {
      osszegzes:
        'Az Amerikai Virgin-szigetek kis, turizmusra és közszférára épülő gazdaság (GDP 2022-ben 4,7 milliárd USD). A kutatás a University of the Virgin Islandsre és az NSF EPSCoR-programra összpontosul '
        + '(korallzátony- és tengerkutatás, autonóm környezeti megfigyelés). Magyar szempontból legfeljebb célzott, tematikus tudományos kapcsolat jöhet szóba; önálló TéT-prioritásként nem indokolt.',
      egyuttmukodesiLehetosegek:
        'Tengerbiológiai és éghajlati alkalmazkodási kutatás (korallzátonyok, mangrovék) magyar ökológiai és hidrobiológiai műhelyek bevonásával; autonóm és MI-alapú környezeti megfigyelés (VICAR); '
        + 'trópusi mezőgazdaság és akvakultúra (Agricultural Experiment Station).',
      joGyakorlatok:
        'Az EPSCoR-modell: hosszú távú, egymásra épülő szövetségi kapacitásépítő projektek egy kis kutatási rendszerben; a land-grant egyetem kutatási, oktatási és szaktanácsadói feladatainak összekapcsolása.',
      diplomaciaiPrioritasok:
        'A regionális lefedettségen belül alacsony prioritás; kapcsolattartás az UVI-vel és a VI-EPSCoR-ral tematikus (tengerkutatási, éghajlati alkalmazkodási) megkeresések esetén.',
    },
  },
};

export default orszag;
