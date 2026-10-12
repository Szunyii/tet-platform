/**
 * Nepál (NP) 2026-os profilja – kutatott vázlat, a relációs vezető pontosítja.
 * Források (hozzáférés: 2026-10-09):
 * - Alapadatok: IMF World Economic Outlook, 2025. október (WEO 9.0.0, közzétéve 2025-10-14; a 2025-ös oszlop a 2024/25-ös
 *   pénzügyi év) – https://data.imf.org/en/datasets/IMF.RES:WEO ; lekérdezés:
 *   https://api.imf.org/external/sdmx/3.0/data/dataflow/IMF.RES/WEO/9.0.0/NPL.NGDPD+NGDPDPC+NGDP_RPCH+LP.A?asOf=2025-11-01T00:00:00Z
 *   (GDP 45,513 Mrd USD; 1535,241 USD/fő; 4,315%; 29,645 millió fő)
 * - Terület: Világbank AG.SRF.TOTL.K2, a legutóbbi közölt (2024-es) érték: 147 181 km² (a 2022-ig közölt évekre 147 180) –
 *   https://data.worldbank.org/indicator/AG.SRF.TOTL.K2?locations=NP ;
 *   https://api.worldbank.org/v2/country/NPL/indicator/AG.SRF.TOTL.K2?format=json&mrnev=1
 * - GII 2025 (107. hely, pillérek, mutatók) – https://www.wipo.int/edocs/gii-ranking/2025/np.pdf
 * - GERD: az UNESCO UIS (EXPGDP.TOT) utolsó adata 2010-es (0,302%), költségvetési előirányzaton alapuló, részleges adat, ezért a gerd
 *   mező üres – https://data.uis.unesco.org ; https://data.worldbank.org/indicator/GB.XPD.RSDV.GD.ZS?locations=NP
 * - Stratégia: nemzeti tudományos, technológiai és innovációs politika 2076 (2019) – a korábbi Oktatási, Tudományos és Technológiai
 *   Minisztérium (MoEST) szakpolitikai listája (a honlap ma az Oktatási és Sportminisztériumé) – https://moest.gov.np/category/1701
 * - Minisztériumi átszervezés (2026. május): a MoEST tudományos-technológiai részéből önálló Tudományos, Technológiai és Innovációs
 *   Minisztérium jött létre, az oktatás az Oktatási és Sportminisztériumhoz került –
 *   https://thehimalayantimes.com/nepal/govt-slashes-federal-ministries-to-18 (2026. május 14.) ; https://moest.gov.np/ ;
 *   a NAST honlapján a tudományos, technológiai és innovációs miniszter a NAST prokancellárja – https://nast.gov.np/
 * - NAST (Innovation Nepal) – https://nast.gov.np/ ; a NAST kutatólaboratóriumai – NKFIH TéT-beszámoló, Újdelhi, 2017 –
 *   https://nkfih.gov.hu/hivatalrol/tet-szakdiplomata/tet-szakdiplomatak-beszamoloi/uj-delhi-tet-attasei
 * - ICIMOD (székhely Katmandu, 8 regionális tagország) – https://www.icimod.org/
 * - Horizont Európa automatikus finanszírozás (V4.2, 2026-10-07) –
 *   https://ec.europa.eu/info/funding-tenders/opportunities/docs/2021-2027/common/guidance/list-3rd-country-participation_horizon-euratom_en.pdf
 * - Magyar vonatkozás:
 *   - a 2021 januárjában hatályba lépett oktatási keretmegállapodás, a még egyeztetett SH-kvótamegállapodás, a nepáli hallgatók
 *     önköltséges jelentkezése – NKFIH TéT-beszámoló, Újdelhi, 2021–22 – https://nkfih.gov.hu/hivatalrol/tet-szakdiplomatak/tet-beszamolo2022-uj
 *   - Nepál nem szerepel a Stipendium Hungaricum partnerországai között – https://stipendiumhungaricum.hu/partners/
 *   - kétoldalú TéT-kapcsolatról az NKFIH 2017-es beszámolója nem számol be – lásd fent (2017)
 * Kimaradt blokkok és mezők:
 * - a vállalati blokk és a programok: ellenőrizhető, naprakész forrás nem került elő;
 * - rendezvények: visszatérő KFI-rendezvény ellenőrzött időponttal és helyszínnel nem került elő;
 * - gerd: nincs megbízható adat (lásd fent);
 * - infrastrukturak: működő kutatási infrastruktúráról ellenőrizhető, naprakész forrás nem került elő (a NepaliSat-1 2019-es
 *   CubeSat-küldetése történeti adat, nem működő infrastruktúra);
 * - partnerorszagok: Nepál kétoldalú TéT-partnerségeiről hivatalos, ellenőrizhető forrás nem került elő;
 * - egyezmeny és ketoldalu: magyar–nepáli TéT-egyezmény vagy -program nem ismert.
 */
import type { DemoOrszag } from '../tipusok';

const orszag: DemoOrszag = {
  kod: 'NP',
  profil: {
    alapadatok: {
      fovaros: 'Katmandu',
      terulet: '147 181',
      penznem: 'nepáli rúpia (NPR)',
      lakossag: '29 645 000',
      gdp: '45,5',
      gdpEgyFore: '1 535',
      gdpNovekedes: '4,3',
      adatEv: '2025',
      forras: 'IMF World Economic Outlook (2025. október; a 2025-ös év a 2024/25-ös pénzügyi év), Világbank',
      tagsagok: [],
      tagsagEgyeb: 'SAARC (titkárság: Katmandu), BIMSTEC',
      agazatok: ['Agrár- és élelmiszeripar', 'Turizmus', 'Energetika és fenntarthatóság', 'Építőipar'],
      agazatEgyeb: 'Vízenergia; szőnyeg- és textilipar',
    },
    kfiRendszer: {
      teljesitmeny:
        'A Global Innovation Index 2025-ben a 107. hely a 139 gazdaság közül (2024-ben 109.); a 37 alsó-közepes jövedelmű ország között 20., '
        + 'Közép- és Dél-Ázsia 10 országa közül 9. Legerősebb pillére a piaci fejlettség (61.) – a mikrohitelek GDP-arányában a GII-ben első –, '
        + 'leggyengébb a humántőke és kutatás (127.). Megbízható GDP-arányos K+F-ráfordítási adat nincs: az UNESCO UIS utolsó, 2010-es értéke (0,30%) '
        + 'költségvetési előirányzaton alapuló, részleges adat.',
      gerd: '',
      strategia: 'Nemzeti tudományos, technológiai és innovációs politika (National Science, Technology and Innovation Policy, 2076/2019)',
      prioritasok: ['Energiabiztonság', 'Zöld átállás és klímasemlegesség', 'Egészség és élettudomány'],
      prioritasEgyeb: 'Vízgazdálkodás, biodiverzitás és hegyvidéki környezet',
      kiemeltIparagak: ['Energetika és fenntarthatóság', 'Agrár- és élelmiszeripar', 'Biotechnológia és gyógyszeripar'],
      iparagEgyeb: 'Vízenergia, gyógynövények és természetes vegyületek kutatása',
      erossegek:
        'Jelentős vízenergia-potenciál és alacsony szén-dioxid-intenzitású energiafelhasználás (a GII-ben 26.); gazdag biológiai sokféleség és '
        + 'gyógynövénykincs; a hindukusi–himalájai kutatás regionális központja (ICIMOD, Katmandu); kiterjedt mikrofinanszírozás; '
        + 'a közkutatás és az ipar közös publikációinak aránya viszonylag jó (a GII-ben 54.).',
      kihivasok:
        'Rendkívül alacsony és hiányosan mért K+F-ráfordítás; gyenge humántőke- és kutatási alapok (a GII-ben 127.), kevés szabadalmi család (100.) és '
        + 'csekély high-tech export (136.); a fiatal munkavállalók nagyarányú külföldi munkavállalása; földrajzi és infrastrukturális korlátok, '
        + 'természeti veszélyek (földrengés, áradás).',
    },
    intezmenyek: {
      iranyitoSzervek:
        'Tudományos, Technológiai és Innovációs Minisztérium (Ministry of Science, Technology and Innovation; 2026 májusától, a MoEST szétválásával) – a KFI-politika gazdája.\n'
        + 'Nepal Academy of Science and Technology (NAST) – kutatólaboratóriumok, tehetséggondozás, „Innovation Nepal” platform.\n'
        + 'Oktatási és Sportminisztérium (Ministry of Education and Sports) és a University Grants Commission (UGC Nepal) – felsőoktatás, egyetemi kutatási támogatások.\n'
        + 'Ágazati kutatási tanácsok: Nepal Agricultural Research Council (NARC), Nepal Health Research Council (NHRC).',
      egyetemek:
        'Tribhuvan University (Kirtipur), Kathmandu University (Dhulikhel), Pokhara University, Purbanchal University, '
        + 'Agriculture and Forestry University, B.P. Koirala Institute of Health Sciences.',
      kutatokozpontok:
        'A NAST kutatólaboratóriumai (molekuláris biotechnológia, természetes vegyületek kémiája, környezetkutatás, anyagtudomány és nanotechnológia, '
        + 'nap-, szél- és kisvízenergia); Nemzetközi Integrált Hegyvidékfejlesztési Központ (ICIMOD, Katmandu) – a hindukusi–himalájai térség '
        + 'nyolc országának kormányközi tudásközpontja.',
      infrastrukturak: '',
    },
    nemzetkoziKapcsolatok: {
      partnerorszagok: '',
      euMultilateralis:
        'Horizont Európa: alacsony és közepes jövedelmű országként automatikusan jogosult EU-finanszírozásra (EC-lista, 2026). '
        + 'A SAARC (titkársága Katmanduban) és a BIMSTEC tagja; az ICIMOD székhelye.',
    },
    magyarKapcsolatok: {
      egyezmeny: '',
      ketoldalu: '',
      mobilitas:
        'Nepál nem szerepel a Stipendium Hungaricum partnerországai között (2026. októberi lista): a 2021 januárjában hatályba lépett oktatási '
        + 'keretmegállapodás után a kvótákról szóló kiegészítő megállapodás 2022-ben még egyeztetés alatt állt. A nepáli hallgatók elsősorban '
        + 'önköltséges képzésekre jelentkeznek Magyarországra (NKFIH, 2022).',
    },
    magyarErtekeles: {
      osszegzes:
        'Nepál alsó-közepes jövedelmű, kis K+F-kapacitású hegyvidéki ország (GII 2025: 107.), ahol a vízenergia, a mezőgazdaság, a biodiverzitás és a '
        + 'Himalája-kutatás a fő tudományos területek. Magyarországgal TéT-egyezmény nem ismert, és a Stipendium Hungaricum-részvétel sem valósult meg; '
        + 'a kapcsolatépítés első lépése az ösztöndíj-megállapodás véglegesítése, majd vízügyi és klímakutatási együttműködés lehet.',
      egyuttmukodesiLehetosegek:
        'Vízenergia és vízgazdálkodás; klímaváltozás-, gleccser- és hegyvidékkutatás (az ICIMOD bevonásával); természetes vegyületek és gyógynövények '
        + 'kutatása; közös Horizont Európa-pályázatok nepáli partnerekkel, akik automatikusan jogosultak EU-finanszírozásra.',
      joGyakorlatok:
        'Az ICIMOD mint több ország közös, kormányközi tudásközpontja: a hegyvidéki kutatás, adatmegosztás és szakpolitikai tanácsadás regionális modellje.',
      diplomaciaiPrioritasok:
        'A Stipendium Hungaricum-kvótamegállapodás lezárása; intézményi kapcsolatok kiépítése a NAST-tal és a vezető egyetemekkel (Tribhuvan University, '
        + 'Kathmandu University); az ICIMOD-hoz kapcsolódó regionális programok feltérképezése.',
    },
  },
};

export default orszag;
