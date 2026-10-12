/**
 * Banglades (BD) 2026-os profilja – kutatott vázlat, a relációs vezető pontosítja.
 * Források (hozzáférés: 2026-10-09):
 * - Alapadatok: IMF World Economic Outlook, 2025. október (WEO 9.0.0, közzétéve 2025-10-14; a 2025-ös oszlop a 2024/25-ös
 *   pénzügyi év) – https://data.imf.org/en/datasets/IMF.RES:WEO ; lekérdezés:
 *   https://api.imf.org/external/sdmx/3.0/data/dataflow/IMF.RES/WEO/9.0.0/BGD.NGDPD+NGDPDPC+NGDP_RPCH+LP.A?asOf=2025-11-01T00:00:00Z
 *   (GDP 475,011 Mrd USD; 2734,098 USD/fő; 3,76%; 173,736 millió fő)
 * - Terület: Világbank AG.SRF.TOTL.K2, a legutóbbi közölt (2024-es) érték: 147 570 km² (a BBS adatával egyező) –
 *   https://data.worldbank.org/indicator/AG.SRF.TOTL.K2?locations=BD
 * - GII 2025 (106. hely, pillérek, mutatók, egyetemek) – https://www.wipo.int/edocs/gii-ranking/2025/bd.pdf
 * - GERD: az UNESCO UIS (EXPGDP.TOT) és a Világbank (GB.XPD.RSDV.GD.ZS) Bangladesre nem közöl adatot –
 *   https://data.uis.unesco.org ; https://data.worldbank.org/indicator/GB.XPD.RSDV.GD.ZS?locations=BD
 * - Stratégia és hazai programok (National Science and Technology Policy 2011, National Biotechnology Policy 2012, kutatási
 *   támogatási és ösztöndíj-szabályzatok): a Tudományos és Technológiai Minisztérium szabályzatlistája – https://most.gov.bd/pages/policies
 * - Rooppuri atomerőmű (2 × VVER-1200, Rosatom/AtomStroyExport; a 2. blokk építés alatt) és a 3 MW-os TRIGA kutatóreaktor (1986 óta) –
 *   https://world-nuclear.org/information-library/country-profiles/countries-a-f/bangladesh ; az 1. blokk üzemeltetési engedélye
 *   (2026. április 16.) – https://www.world-nuclear-news.org/articles/operating-licence-issued-for-first-bangladesh-nuclear-power-unit ;
 *   a fűtőelem-betöltés kezdete (2026. április 28., a BAEC szerint az 1. blokk „fizikai indítása”) –
 *   https://www.world-nuclear-news.org/articles/fuel-loading-begins-for-bangladeshs-first-nuclear-power-plant ; https://baec.gov.bd/ ;
 *   a 163 fűtőelem-köteg betöltésének befejezése (WNN, 2026. május 12.) – https://www.world-nuclear-news.org/articles/nuclear-fuel-loading-completed-at-rooppur-1 ;
 *   a nukleáris hatóság (BAERA) 2026. október 8-án kiadta az első kritikusság elérését engedélyező B-2 engedélyt, a hálózatra
 *   kapcsolást 2026 végére tervezik – https://www.thedailystar.net/news/power-and-energy/news/rooppur-unit-1-cleared-first-nuclear-reaction-4293906 ;
 *   BHTPA – https://bhtpa.gov.bd/ ; icddr,b – https://www.icddrb.org/
 * - Horizont Európa automatikus finanszírozás (V4.2, 2026-10-07) –
 *   https://ec.europa.eu/info/funding-tenders/opportunities/docs/2021-2027/common/guidance/list-3rd-country-participation_horizon-euratom_en.pdf
 * - Magyar vonatkozás:
 *   - 1973-as műszaki-tudományos egyezmény, a 2016-os miniszterelnöki látogatáson felajánlott 100 SH-ösztöndíj – NKFIH TéT-beszámoló,
 *     Újdelhi, 2017 – https://nkfih.gov.hu/hivatalrol/tet-szakdiplomata/tet-szakdiplomatak-beszamoloi/uj-delhi-tet-attasei
 *   - 1973-as egyezmény (hatályos), 2017-es oktatási megállapodás és 2021-es megújítása (110 + 30 SH-hely), SH 2018 óta, 2016-os vízügyi
 *     megállapodás és a munkacsoport dakkai ülése (2020. február), nukleárisoktatási megállapodás (Budapest, 2022. június 7.), PTE Szentágothai
 *     Kutatóközpont projektje, dakkai konzuli iroda (2022) – NKFIH TéT-beszámoló, Újdelhi, 2021–22 –
 *     https://nkfih.gov.hu/hivatalrol/tet-szakdiplomatak/tet-beszamolo2022-uj
 *   - Stipendium Hungaricum (küldő fél, képzési területek) – https://stipendiumhungaricum.hu/partners/
 *   - Az újdelhi nagykövetség dakkai irodája – https://delhi.mfa.gov.hu/eng
 * Kimaradt blokkok és mezők: a vállalati blokk (nincs ellenőrizhető, rangsorolható cég- és startupadat) és a rendezvények (visszatérő
 * KFI-rendezvény ellenőrzött időponttal nem került elő; a BASIS SoftExpo honlapján a legutóbbi kiadás a 2023-as – https://softexpo.com.bd/).
 * Üres mezők: gerd (nincs nemzetközi adat); finanszirozasiEszkozok (a minisztérium szabályzatlistáján csak vissza nem térítendő
 * kutatási támogatások és ösztöndíjak szerepelnek, hitel-, garancia- vagy tőkealapról nem került elő ellenőrizhető forrás).
 * Kimaradt adat: a magyar–bangladesi kulturális és tudományos egyezmény éve (a két NKFIH-beszámoló eltérő évet ad).
 */
import type { DemoOrszag } from '../tipusok';

const orszag: DemoOrszag = {
  kod: 'BD',
  profil: {
    alapadatok: {
      fovaros: 'Dakka',
      terulet: '147 570',
      penznem: 'bangladesi taka (BDT)',
      lakossag: '173 736 000',
      gdp: '475,0',
      gdpEgyFore: '2 734',
      gdpNovekedes: '3,8',
      adatEv: '2025',
      forras: 'IMF World Economic Outlook (2025. október; a 2025-ös év a 2024/25-ös pénzügyi év), Világbank',
      tagsagok: ['Nemzetközösség'],
      tagsagEgyeb: 'SAARC, BIMSTEC (titkárság: Dakka), D-8, Iszlám Együttműködési Szervezet (OIC), Indiai-óceáni Peremországok Szövetsége (IORA)',
      agazatok: ['Agrár- és élelmiszeripar', 'Biotechnológia és gyógyszeripar', 'IKT és digitalizáció', 'Építőipar', 'Energetika és fenntarthatóság'],
      agazatEgyeb: 'Készruha- és textilipar (a legnagyobb exportágazat), bőr- és jutaipar',
    },
    kfiRendszer: {
      teljesitmeny:
        'A Global Innovation Index 2025-ben a 106. hely a 139 gazdaság közül (2024-ben szintén 106., 2020-ban 116.); a 37 alsó-közepes jövedelmű '
        + 'ország között 19., Közép- és Dél-Ázsia 10 országa közül 8. A kimeneti oldalon (95.) erősebb, mint a ráfordításokban (115.); legjobb pillérei '
        + 'a kreatív kibocsátás (86.) és az infrastruktúra (90.), leggyengébb a humántőke és kutatás (133.). '
        + 'GDP-arányos K+F-ráfordítási adatot az UNESCO UIS és a Világbank nem közöl.',
      gerd: '',
      strategia: 'Nemzeti tudomány- és technológiapolitika (National Science and Technology Policy, 2011) és cselekvési terve; nemzeti biotechnológiai politika (National Biotechnology Policy, 2012)',
      prioritasok: ['Digitalizáció és MI', 'Egészség és élettudomány', 'Energiabiztonság'],
      prioritasEgyeb: 'Környezetvédelem és természeti erőforrások (a 2011-es tudománypolitika kiemelt területei közül)',
      kiemeltIparagak: ['Agrár- és élelmiszeripar', 'Biotechnológia és gyógyszeripar', 'IKT és digitalizáció', 'Energetika és fenntarthatóság'],
      iparagEgyeb: 'Atomenergia (Rooppuri atomerőmű)',
      erossegek:
        'Nagy és fiatal népesség (a GII ifjúsági demográfiai mutatójában 40.) és nagy hazai piac (23.); jelentős gyógyszeripar és kiterjedt '
        + 'mezőgazdasági kutatóhálózat (BRRI, BARI); a mikrofinanszírozásban (11.) és a mobilpénz-szolgáltatásokban szerzett tapasztalat; '
        + 'magas energiahatékonyság (GDP/energiaegység: 9.).',
      kihivasok:
        'Alacsony oktatási ráfordítás (a GII-ben 129.), gyenge egyetem–ipar K+F-együttműködés (124.) és kevés természettudományos-mérnöki diplomás (115.); '
        + 'hiányos K+F-statisztika; erős exportkoncentráció a ruhaiparban; nagyfokú éghajlati kitettség (áradások, ciklonok, tengerszint-emelkedés).',
    },
    intezmenyek: {
      iranyitoSzervek:
        'Tudományos és Technológiai Minisztérium (MoST) – a nemzeti tudománypolitika, a kutatási támogatások és ösztöndíjak gazdája.\n'
        + 'Nemzeti Tudományos és Technológiai Tanács (NCST) – a tudománypolitika legfelső szintű tanácsadó testülete.\n'
        + 'Oktatási Minisztérium és a University Grants Commission of Bangladesh – felsőoktatás és egyetemi kutatás.\n'
        + 'Ágazati kutatási szervezetek: Bangladesh Agricultural Research Council (BARC), Bangladesh Council of Scientific and Industrial Research (BCSIR), '
        + 'Bangladesh Atomic Energy Commission (BAEC).',
      egyetemek:
        'University of Dhaka, Bangladesh University of Engineering and Technology (BUET), Bangladesh Agricultural University (Mymensingh), '
        + 'University of Chittagong, University of Rajshahi; magánegyetemek: North South University, BRAC University, Daffodil International University.',
      kutatokozpontok:
        'icddr,b (nemzetközi hasmenéses betegségkutató központ, Dakka – a szájon át adható rehidráló oldat kutatásának úttörője); '
        + 'Bangladesh Rice Research Institute (BRRI) és Bangladesh Agricultural Research Institute (BARI); a BCSIR laboratóriumai; '
        + 'National Institute of Biotechnology; a BAEC atomenergia-kutató intézetei.',
      infrastrukturak:
        'A Rooppuri atomerőmű (két VVER-1200 blokk, egyenként 1200 MW, a Rosatom fővállalkozásában; az 1. blokk 2026 áprilisában üzemeltetési '
        + 'engedélyt kapott, a fűtőelemek betöltése 2026. április 28-án kezdődött és májusban befejeződött, 2026. október 8-án a nukleáris hatóság (BAERA) '
        + 'engedélyezte az első kritikusság elérését, a hálózatra kapcsolást 2026 végére tervezik; a 2. blokk épül); a BAEC savari kutatóközpontjának '
        + '3 MW-os TRIGA kutatóreaktora (1986 óta); a Bangladesh Hi-Tech Park Authority technológiai parkjai.',
    },
    programok: {
      palyazatok:
        'A Tudományos és Technológiai Minisztérium (MoST) különleges kutatási támogatása (Special Research Grant), valamint a technológiai innovációs, '
        + 'kutatási és fejlesztési projektek támogatása; pénzügyi támogatás tudományos szervezeteknek és intézményeknek (2012-es, 2025-ben módosított szabályzat).',
      tamogatasiProgramok:
        'Nemzeti tudományos és technológiai ösztöndíj (National Science and Technology Fellowship, 2020-as szabályzat); '
        + 'a Science and Technology Fellowship Trust ösztöndíjai (2025-ben módosított szabályzat).',
      finanszirozasiEszkozok: '',
      nemzetkoziReszvetel:
        'Horizont Európa: Banglades alacsony és közepes jövedelmű országként szerepel az Európai Bizottság automatikus finanszírozási listáján (2026), '
        + 'így a bangladesi résztvevők automatikusan jogosultak EU-finanszírozásra.',
    },
    kapcsolatok: {
      euMultilateralis:
        'Horizont Európa: automatikusan EU-finanszírozásra jogosult ország (EC-lista, 2026). A Nemzetközösség, a SAARC, a BIMSTEC (titkársága Dakkában), '
        + 'a D-8 és az Iszlám Együttműködési Szervezet tagja.',
      partnerorszagok: 'Oroszország – a Rooppuri atomerőművet a Rosatom építi.',
      egyezmeny: 'Magyar–bangladesi műszaki-tudományos együttműködési egyezmény (1973)',
      ketoldalu:
        'A 2016-os vízügyi együttműködési megállapodás közös munkacsoportja 2020 februárjában Dakkában ülésezett; 2022 júniusában Budapesten '
        + 'nukleárisoktatási együttműködési megállapodást írtak alá a bangladesi külügyminiszter látogatásán. A PTE Szentágothai János Kutatóközpont '
        + 'Virológiai Nemzeti Laboratóriuma 2021–22-ben kutatási projektet zárt Bangladesben a trópusi betegségek terjesztőiről (denevérek, szúnyogok). '
        + 'Magyarország 2022 óta konzuli irodát működtet Dakkában.',
      mobilitas:
        'Stipendium Hungaricum: Banglades 2018 óta partnerország (küldő fél az oktatási minisztérium közép- és felsőoktatási részlege; bármely szakterület, '
        + 'az orvosképzést is beleértve). A 2021-ben megújított és módosított megállapodás 110 általános és 30 nukleáris szakirányú helyet biztosított, '
        + 'a jelentkezők száma évente ezer fölött volt (NKFIH, 2022).',
    },
    magyarErtekeles: {
      osszegzes:
        'Banglades nagy népességű, iparosodó, szerény K+F-kapacitású ország (GII 2025: 106.), erős mezőgazdasági és egészségügyi kutatási hagyománnyal. '
        + 'A magyar kapcsolatok fő pillére a Stipendium Hungaricum (2022-ben 110 általános és 30 nukleáris hely), mellette a vízügyi és a nukleáris oktatási '
        + 'együttműködés; a bangladesi partnerek automatikus Horizont Európa-finanszírozása közös uniós pályázatokat is lehetővé tesz.',
      egyuttmukodesiLehetosegek:
        'Vízgazdálkodás, árvízvédelem és ivóvízkezelés (a 2016-os vízügyi megállapodásra építve); nukleáris oktatás és sugárbiztonság (a Rooppuri '
        + 'atomerőmű szakemberképzése); trópusi betegségek és járványügy (a PTE virológiai együttműködésének folytatása); mezőgazdasági és '
        + 'élelmiszer-biztonsági kutatás; közös Horizont Európa-pályázatok.',
      joGyakorlatok:
        'A mikrofinanszírozás és a mobilpénz széles körű elterjesztése mint társadalmi innováció; az icddr,b modellje, amely a helyi egészségügyi '
        + 'problémák kutatását nemzetközi partnerségekkel köti össze.',
      diplomaciaiPrioritasok:
        'A Stipendium Hungaricum-ösztöndíjasok bevonása a kutatási együttműködésekbe és alumni-hálózatba szervezése; a vízügyi közös munkacsoport '
        + 'üléseinek felújítása; a nukleárisoktatási megállapodás végrehajtása; a TéT-párbeszéd megújítása az 1973-as egyezmény alapján.',
    },
  },
};

export default orszag;
