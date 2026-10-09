/**
 * Maldív-szigetek (MV) 2026-os profilja – kutatott vázlat (részleges profil), a relációs vezető pontosítja.
 * Források (hozzáférés: 2026-10-09):
 * - Alapadatok: IMF World Economic Outlook, 2025. október (WEO 9.0.0, közzétéve 2025-10-14) – https://data.imf.org/en/datasets/IMF.RES:WEO ;
 *   lekérdezés: https://api.imf.org/external/sdmx/3.0/data/dataflow/IMF.RES/WEO/9.0.0/MDV.NGDPD+NGDPDPC+NGDP_RPCH+LP.A?asOf=2025-11-01T00:00:00Z
 *   (GDP 7,676 Mrd USD; 18 683,902 USD/fő; 4,786%; 0,411 millió fő)
 * - Terület: Világbank AG.SRF.TOTL.K2, a legutóbbi közölt (2024-es) érték: 300 km² (a Nemzetközösség adatával egyező) –
 *   https://data.worldbank.org/indicator/AG.SRF.TOTL.K2?locations=MV
 * - GII 2025: a Maldív-szigetek nem szerepel a 139 rangsorolt gazdaság között, WIPO-országprofil sem készült róla –
 *   https://www.wipo.int/web-publications/global-innovation-index-2025/en/gii-2025-economy-briefs-and-profiles.html
 * - GERD: az UNESCO UIS és a Világbank nem közöl adatot – https://data.uis.unesco.org
 * - Nemzetközösség (1982, kilépés 2016, újracsatlakozás 2020. február 1.) – https://thecommonwealth.org/our-member-countries/maldives
 * - Horizont Európa automatikus finanszírozás (V4.2, 2026-10-07) –
 *   https://ec.europa.eu/info/funding-tenders/opportunities/docs/2021-2027/common/guidance/list-3rd-country-participation_horizon-euratom_en.pdf
 * - Intézmények: Maldives National University – https://mnu.edu.mv/ ; Islamic University of Maldives – https://www.ium.edu.mv/ ;
 *   Maldives Marine Research Institute (MMRI, korábban Marine Research Centre) – https://mmri.gov.mv/ ;
 *   a felsőoktatási minisztérium mint SH-küldő fél – https://stipendiumhungaricum.hu/partners/ ; az MNU természettudományi kara –
 *   NKFIH TéT-beszámoló, Újdelhi, 2017 – https://nkfih.gov.hu/hivatalrol/tet-szakdiplomata/tet-szakdiplomatak-beszamoloi/uj-delhi-tet-attasei
 * - Magyar vonatkozás:
 *   - SH-megállapodás (aláírva 2021. november 8., 15 hely; az első, 2022/23-as körben 74 jelentkező); online konferencia tíz magyar
 *     vízügyi cég bemutatkozásával (2021. november 17., a beszámoló szerint „a nagykövetség és a Maldív Tiszteletbeli Konzuli Iroda
 *     szervezésében”; a beszámoló nem nevezi meg, melyik ország tiszteletbeli konzuli irodájáról van szó; a nagykövetség honlapja szerint
 *     Magyarországnak Maléban tiszteletbeli főkonzula van – https://delhi.mfa.gov.hu/hu/13-konzuli-kepviselet ; utána
 *     megkezdődött a lehetséges projektek azonosítása) – NKFIH TéT-beszámoló, Újdelhi, 2021–22 –
 *     https://nkfih.gov.hu/hivatalrol/tet-szakdiplomatak/tet-beszamolo2022-uj
 *   - Stipendium Hungaricum (küldő fél, képzési területek) – https://stipendiumhungaricum.hu/partners/ ;
 *     https://stipendiumhungaricum.hu/news/4-must-known-facts-about-stipendium-hungaricum-from-2022-2023/
 * Kimaradt blokkok és mezők (részleges profil):
 * - a KFI-rendszer: nincs GII-helyezés, GERD-adat és ismert KFI-stratégia;
 * - a vállalati blokk, a programok és a rendezvények: nincs ellenőrizhető tartalom;
 * - infrastrukturak: nemzeti kutatási infrastruktúráról nem került elő forrás;
 * - partnerorszagok: a Maldív-szigetek kétoldalú TéT-partnerségeiről hivatalos, ellenőrizhető forrás nem került elő;
 * - egyezmeny: magyar–maldív TéT-egyezmény nem ismert;
 * - joGyakorlatok: önálló KFI-rendszer és -programok híján nincs olyan dokumentált gyakorlat, amelyre hazai adaptációs javaslat épülhetne.
 */
import type { DemoOrszag } from '../tipusok';

const orszag: DemoOrszag = {
  kod: 'MV',
  profil: {
    alapadatok: {
      fovaros: 'Malé',
      terulet: '300',
      penznem: 'maldív rufiyaa (MVR)',
      lakossag: '411 000',
      gdp: '7,7',
      gdpEgyFore: '18 684',
      gdpNovekedes: '4,8',
      adatEv: '2025',
      forras: 'IMF World Economic Outlook (2025. október), Világbank',
      tagsagok: ['Nemzetközösség'],
      tagsagEgyeb: 'SAARC, Iszlám Együttműködési Szervezet (OIC), Kis Szigetállamok Szövetsége (AOSIS)',
      agazatok: ['Turizmus', 'Építőipar'],
      agazatEgyeb: 'Halászat és halfeldolgozás (tonhal)',
    },
    intezmenyek: {
      iranyitoSzervek:
        'Felsőoktatási, Munkaügyi és Szakképzési Minisztérium (Ministry of Higher Education, Labour and Skills Development) – felsőoktatás és '
        + 'ösztöndíjak, a Stipendium Hungaricum küldő fele.',
      egyetemek:
        'Maldives National University (MNU; természettudományi karán informatikai, környezettudományi, biológiai, kémiai és fizikai képzés), '
        + 'Islamic University of Maldives.',
      kutatokozpontok: 'Maldives Marine Research Institute (MMRI) – tengeri és halászati kutatás.',
      infrastrukturak: '',
    },
    kapcsolatok: {
      euMultilateralis:
        'Horizont Európa: alacsony és közepes jövedelmű országként automatikusan jogosult EU-finanszírozásra (EC-lista, 2026). '
        + 'A Nemzetközösség (2020-ban újra csatlakozott), a SAARC és a Kis Szigetállamok Szövetsége (AOSIS) tagja.',
      partnerorszagok: '',
      egyezmeny: '',
      ketoldalu:
        '2021. november 17-én az újdelhi magyar nagykövetség és a „Maldív Tiszteletbeli Konzuli Iroda” közös online konferenciáján tíz magyar vízügyi cég mutatta be '
        + 'technológiáit a maldív államigazgatásnak és vízügyi szakembereknek.',
      mobilitas:
        'Stipendium Hungaricum: a Maldív-szigetek a 2021. november 8-án aláírt megállapodás óta partnerország (15 ösztöndíjhely; az első, 2022/23-as '
        + 'pályázati körben 74 jelentkező). Küldő fél a felsőoktatási minisztérium; bármely szakterületen és képzési szinten.',
    },
    magyarErtekeles: {
      osszegzes:
        'A Maldív-szigetek kis, turizmusra épülő szigetállam, nemzetközi innovációs mutatók nélkül (a GII-ben nem szerepel). A magyar kapcsolatok '
        + 'alapja a 2021-es Stipendium Hungaricum-megállapodás és a magyar vízügyi technológiák iránti érdeklődés; az ivóvízellátás, az éghajlati '
        + 'alkalmazkodás és a tengeri kutatás kínál együttműködési lehetőséget.',
      egyuttmukodesiLehetosegek:
        'Ivóvíz-előállítás és -kezelés szigeti környezetben (a 2021. novemberi magyar vízügyi bemutató nyomán); éghajlati alkalmazkodás és partvédelem; '
        + 'tengerbiológiai és halászati kutatás; közös Horizont Európa-pályázatok maldív partnerekkel, akik automatikusan jogosultak EU-finanszírozásra.',
      joGyakorlatok: '',
      diplomaciaiPrioritasok:
        'A Stipendium Hungaricum-helyek kihasználásának növelése és az ösztöndíjasok szakmai kapcsolatainak ápolása; a magyar vízügyi cégek '
        + 'bemutatkozására épülő projektlehetőségek feltárása.',
    },
  },
};

export default orszag;
