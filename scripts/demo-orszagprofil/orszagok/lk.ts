/**
 * Srí Lanka (LK) 2026-os profilja – kutatott vázlat, a relációs vezető pontosítja.
 * Források (hozzáférés: 2026-10-09):
 * - Alapadatok: az IMF World Economic Outlook (2025. október) Srí Lankára 2025-re nem közöl adatot (az utolsó adatév 2024:
 *   98,964 Mrd USD) – https://api.imf.org/external/sdmx/3.0/data/dataflow/IMF.RES/WEO/9.0.0/LKA.NGDPD+NGDPDPC+NGDP_RPCH+LP.A?asOf=2025-11-01T00:00:00Z ;
 *   ezért a hivatalos 2025-ös becslés: Srí Lanka-i Központi Bank (CBSL), Annual Economic Review 2025, Key Economic Indicators
 *   (GDP 108,8 Mrd USD; 5003 USD/fő; reálnövekedés 5,0%; évközepi népesség 21 756 ezer fő; a DCS 2026 márciusi GDP-becslése alapján) –
 *   https://www.cbsl.gov.lk/sites/default/files/cbslweb_documents/publications/aer/2025/en/04_KEI.pdf ;
 *   https://www.cbsl.gov.lk/sites/default/files/cbslweb_documents/publications/aer/2025/en/30_Statistical_Appendix.pdf
 * - Terület: Világbank AG.SRF.TOTL.K2, a legutóbbi közölt (2024-es) érték: 65 610 km² – https://data.worldbank.org/indicator/AG.SRF.TOTL.K2?locations=LK
 * - GII 2025 (93. hely, pillérek, mutatók, egyetemek) – https://www.wipo.int/edocs/gii-ranking/2025/lk.pdf
 * - GERD: UNESCO UIS EXPGDP.TOT, 2022: 0,105% (2016: 0,120%) – https://data.uis.unesco.org ; Világbank GB.XPD.RSDV.GD.ZS –
 *   https://data.worldbank.org/indicator/GB.XPD.RSDV.GD.ZS?locations=LK
 * - Stratégia: National Science and Technology Policy (2008) – https://www.nastec.gov.lk/files/national_science__technology_policy_of_sri_lanka_english.pdf ;
 *   NRDF fókuszterületei – https://www.nastec.gov.lk/reports/nrdf ; az új STI-politika 2018-as tervezete –
 *   https://www.nastec.gov.lk/files/policy_reports/National_STI_Policy_2018_draft_2018_10_10.pdf ; a koreai STEPI K-Innovation
 *   szakpolitikai tanácsadása (2019; a 2020-as folytatás a NASTEC dokumentumlistáján) –
 *   https://www.nastec.gov.lk/files/policy_reports/2019_K-Innovation_Policy_Consultation_FinalReport_SriLanka_Final_R7.pdf ;
 *   NASTEC STI-adatrendszer, STI Dashboard és S&T helyzetjelentések (2024-ig) – https://www.nastec.gov.lk/
 * - Programok: NSF támogatási sémák (Competitive Research Grants, Gap-Filling Research Grants Scheme, kutatási eszköz- és alkatrész-
 *   támogatások, publikációs és rendezvénytámogatások, International Travel Grants, Support Scheme for Supervision of Research Degrees,
 *   díjak) – https://www.nsf.gov.lk/index.php/en/grant-support ; NRC (Investigator Driven Research Grants 2026, célzott multidiszciplináris
 *   kutatási projektek 2025/26, elnöki díj tudományos publikációkért) – https://www.nrc.gov.lk/
 * - Külföldi munkavállalási elhelyezések (2022–2025) – CBSL statisztikai függelék (fent)
 * - Horizont Európa automatikus finanszírozás (V4.2, 2026-10-07) –
 *   https://ec.europa.eu/info/funding-tenders/opportunities/docs/2021-2027/common/guidance/list-3rd-country-participation_horizon-euratom_en.pdf
 * - Magyar vonatkozás:
 *   - 1975-ös műszaki-tudományos egyezmény; 2007-es kötött segélyhitel-megállapodás (51 millió euró, módosítva 2011), a Labugama és
 *     Kalatuwawa víztisztító mű és a kotrási-homoksótalanítási projekt a Fővárosi Vízművek kivitelezésében; indiai–Srí Lanka-i közös kutatási
 *     program – NKFIH TéT-beszámoló, Újdelhi, 2017 – https://nkfih.gov.hu/hivatalrol/tet-szakdiplomata/tet-szakdiplomatak-beszamoloi/uj-delhi-tet-attasei
 *   - Fővárosi Vízművek (Kalatuwawa és Labugama rehabilitációja) – https://www.vizmuvek.hu/files/public/new/angol/global-solutions/download/bww-general-presentation-en.pdf ;
 *     https://www.ft.lk/Front-Page/govt-gets-rs-6-billion-support-from-hungary/44-135964
 *   - az SH-megállapodás megújítása a 2025–2027-es időszakra (Colombo, 2025. november 4.; évente 20 teljes ösztöndíj; 2022 óta 40 hallgató) –
 *     https://delhi.mfa.gov.hu/hu/articles/szabo-istvan-nagykovet-2025-november-4-en-colomboban-alairta-a-2025-2027-evekre-szolo-magyar-sri-lanka-i-stipendium-hungaricum-osztondijprogramrol-szolo-egyetertesi-megallapodast
 *   - SH-megállapodás (2022. január, 20 hely, első kör 2022 novemberében), MedTech virtuális innovációs program (2021. december) –
 *     NKFIH TéT-beszámoló, Újdelhi, 2021–22 – https://nkfih.gov.hu/hivatalrol/tet-szakdiplomatak/tet-beszamolo2022-uj
 *   - Stipendium Hungaricum (küldő fél, képzési területek) – https://stipendiumhungaricum.hu/partners/ ;
 *     https://stipendiumhungaricum.hu/news/welcome-to-sri-lanka-in-the-stipendium-hungaricum-scholarship-programme/
 * Kimaradt blokkok és mezők:
 * - vállalati blokk: a GII csak márkaérték- és immateriálisjavak-rangsorokat közöl (bank, telekom, holding), rangsorolható
 *   KFI-vállalati, startup- vagy inkubátoradat nem került elő;
 * - rendezvények: az INFOTEL nemzeti IKT-kiállítás évente, novemberben van (FITIS, 1992 óta – https://infotel.lk/), de a helyszínét
 *   a hivatalos oldal nem közli, ezért nem került be;
 * - infrastrukturak: működő nemzeti kutatási infrastruktúráról ellenőrizhető, naprakész forrás nem került elő (az NKFIH 2017-es
 *   beszámolójában említett projektek mai állapota ismeretlen);
 * - finanszirozasiEszkozok: hitel-, garancia- vagy tőkealapú KFI-eszközről nem került elő forrás (az NSF és az NRC vissza nem térítendő
 *   támogatásokat nyújt).
 */
import type { DemoOrszag } from '../tipusok';

const orszag: DemoOrszag = {
  kod: 'LK',
  profil: {
    alapadatok: {
      fovaros: 'Srí Dzsajavardanapura Kotte (kereskedelmi főváros: Colombo)',
      terulet: '65 610',
      penznem: 'Srí Lanka-i rúpia (LKR)',
      lakossag: '21 756 000',
      gdp: '108,8',
      gdpEgyFore: '5 003',
      gdpNovekedes: '5,0',
      adatEv: '2025',
      forras: 'Srí Lanka-i Központi Bank (CBSL, Annual Economic Review 2025), előzetes adat (az IMF WEO 2025. októberi kiadása 2025-re nem közöl adatot); Világbank',
      tagsagok: ['Nemzetközösség'],
      tagsagEgyeb: 'SAARC, BIMSTEC, Indiai-óceáni Peremországok Szövetsége (IORA)',
      agazatok: ['Turizmus', 'Mezőgazdaság és élelmiszeripar', 'Logisztika', 'IKT és szoftver', 'Pénzügyi szolgáltatások', 'Építőipar'],
      agazatEgyeb: 'Ruhaipar; tea-, gumi- és kókusztermelés',
    },
    kfiRendszer: {
      teljesitmeny:
        'A Global Innovation Index 2025-ben a 93. hely a 139 gazdaság közül (2024-ben 89.); a 37 alsó-közepes jövedelmű ország között 11., '
        + 'Közép- és Dél-Ázsiában 5. A kimeneti oldalon (86.) erősebb, mint a ráfordításokban (103.): az IKT-szolgáltatások exportjában és a szoftverkiadásokban '
        + 'egyaránt 24., a GDP-arányos K+F-ráfordításban viszont csak 102. A K+F-ráfordítás az UNESCO UIS szerint 2022-ben a GDP 0,11%-a volt (2016-ban 0,12%).',
      gerd: '0,11',
      strategia: 'Nemzeti tudomány- és technológiapolitika (National Science and Technology Policy, NASTEC, 2008); nemzeti K+F-keretrendszer (NRDF); az új STI-politika 2018-as tervezete',
      prioritasok: ['Egészség és élettudomány', 'Digitalizáció és MI', 'Energiabiztonság', 'Alapkutatási kiválóság'],
      prioritasEgyeb: 'Az NRDF további fókuszterületei: víz, élelmezés és mezőgazdaság, lakhatás, környezet, ásványkincsek, textilipar, őshonos tudás',
      kiemeltIparagak: [
        'Agrár- és élelmiszertechnológia', 'IKT és digitalizáció', 'Anyagtudomány', 'Biotechnológia és gyógyszeripar', 'Energetika és fenntarthatóság',
      ],
      iparagEgyeb: 'Nanotechnológia (SLINTEC, nemzeti nanotechnológiai kezdeményezés)',
      erossegek:
        'Ültetvényes növénykutatási hagyomány (tea, gumi, kókusz); növekvő IT- és szoftverszolgáltatás-export (a GII-ben 24.); a GII-ben az infrastruktúra '
        + 'a legerősebb pillére (66.), az energiahatékonyságban (GDP/energiaegység) 6.; viszonylag sok természettudományos-mérnöki diplomás (41.).',
      kihivasok:
        'A 2022-es gazdasági válság utáni szűkös költségvetés; nagyon alacsony K+F- és oktatási ráfordítás (a GII-ben 102., illetve 131.); '
        + 'a munkaerő tömeges külföldi munkavállalása (2022 óta évente mintegy 300 ezer külföldi munkavállalási elhelyezés); '
        + 'gyenge üzleti kifinomultság (121.) és egyetem–ipar kapcsolat.',
    },
    intezmenyek: {
      iranyitoSzervek:
        'Tudományos és Technológiai Minisztérium (Ministry of Science and Technology) – a KFI-politika gazdája.\n'
        + 'National Science and Technology Commission (NASTEC) – szakpolitikai tanácsadás és tervezés (az 1994-es tudomány- és technológiafejlesztési törvény alapján); STI-adatrendszert és rendszeres tudományos-technológiai helyzetjelentéseket közöl.\n'
        + 'National Science Foundation (NSF) – kutatásfinanszírozás és K+F-statisztika; National Research Council (NRC) – kutatási támogatások.\n'
        + 'Oktatási, Felsőoktatási és Szakképzési Minisztérium és a University Grants Commission – felsőoktatás.',
      egyetemek:
        'University of Colombo, University of Peradeniya, University of Moratuwa (mérnöki és IT-képzés), University of Sri Jayewardenepura, '
        + 'University of Kelaniya, University of Ruhuna.',
      kutatokozpontok:
        'Industrial Technology Institute (ITI), Sri Lanka Institute of Nanotechnology (SLINTEC), National Institute of Fundamental Studies (NIFS, Kandy), '
        + 'Arthur C Clarke Institute for Modern Technologies; ültetvényes kutatóintézetek: Tea Research Institute, Rubber Research Institute, '
        + 'Coconut Research Institute; Medical Research Institute.',
      infrastrukturak: '',
    },
    programok: {
      palyazatok:
        'National Science Foundation (NSF): versenypályázati kutatási támogatások (Competitive Research Grants), hiánypótló kutatási támogatások '
        + '(Gap-Filling Research Grants Scheme), kutatási eszköz- és alkatrész-támogatások; National Research Council (NRC): kutatói kezdeményezésű '
        + 'kutatási támogatások (Investigator Driven Research Grants, 2026-os felhívás) és célzott, multidiszciplináris kutatási projektek.',
      tamogatasiProgramok:
        'Az NSF publikációs, tudományos rendezvény- és nemzetközi utazási támogatásai, valamint a posztgraduális témavezetés támogatása '
        + '(Support Scheme for Supervision of Research Degrees); elismerések: az NSF kutatási és technológiai díjai, National Awards for Science '
        + '& Technology Achievements (NASTA), az NRC elnöki díja tudományos publikációkért.',
      finanszirozasiEszkozok: '',
      nemzetkoziReszvetel:
        'Horizont Európa: Srí Lanka alacsony és közepes jövedelmű országként szerepel az Európai Bizottság automatikus finanszírozási listáján (2026), '
        + 'így a Srí Lanka-i résztvevők automatikusan jogosultak EU-finanszírozásra.',
    },
    kapcsolatok: {
      euMultilateralis:
        'Horizont Európa: alacsony és közepes jövedelmű országként automatikusan jogosult EU-finanszírozásra (EC-lista, 2026). '
        + 'A Nemzetközösség, a SAARC, a BIMSTEC és az IORA tagja.',
      partnerorszagok:
        'India (indiai–Srí Lanka-i közös kutatási program, indiai kutatói ösztöndíjak – NKFIH, 2017); Dél-Korea (a STEPI K-Innovation szakpolitikai '
        + 'tanácsadása az STI-politika és -intézményrendszer fejlesztésére, 2019–2020).',
      egyezmeny: 'Magyar–Srí Lanka-i műszaki-tudományos együttműködési egyezmény (1975)',
      ketoldalu:
        'A 2007-es kormányközi megállapodás alapján nyújtott magyar kötött segélyhitelből (51 millió euró) a Fővárosi Vízművek közreműködésével '
        + 'újult meg és bővült a Colombót ellátó Labugama és Kalatuwawa víztisztító mű, és megvalósult egy kotrási és homoksótalanítási projekt. '
        + '2021 decemberében Srí Lanka a magyar nagykövetség virtuális MedTech innovációs programsorozatának egyik célországa volt.',
      mobilitas:
        'Stipendium Hungaricum: Srí Lanka partnerország; a 2022 januárjában aláírt megállapodást 2025. november 4-én Colombóban a 2025–2027-es '
        + 'időszakra megújították, évente 20 teljes ösztöndíjjal (2022 óta 40 Srí Lanka-i hallgató vett részt a programban). Küldő fél az oktatási '
        + 'minisztérium; mezőgazdasági, mérnöki (mesterszinten vízgazdálkodás is) és közgazdasági alap- és mesterképzés, doktori képzés bármely területen.',
    },
    magyarErtekeles: {
      osszegzes:
        'Srí Lanka a 2022-es válság után stabilizálódó, kis K+F-kapacitású ország (GII 2025: 93., GERD 0,11%), viszonylag erős IT-szolgáltatásokkal '
        + 'és ültetvényes növénykutatással. A magyar kapcsolatok alapja az 1975-ös műszaki-tudományos egyezmény, a magyar segélyhitelből megújult '
        + 'víztisztító művek és a 2022-es, 2025-ben megújított Stipendium Hungaricum-megállapodás; a vízügy, a mezőgazdaság és az egészségipar a legígéretesebb terület.',
      egyuttmukodesiLehetosegek:
        'Víztisztítás és vízellátás (a Fővárosi Vízművek Srí Lanka-i referenciáira építve); mezőgazdasági és élelmiszer-biztonsági kutatás (az SH-ösztöndíj '
        + 'agrár- és vízgazdálkodási képzéseihez kapcsolva); orvostechnikai és digitális egészségügyi innováció (a MedTech program folytatása); '
        + 'közös Horizont Európa-pályázatok Srí Lanka-i partnerekkel, akik automatikusan jogosultak EU-finanszírozásra.',
      joGyakorlatok:
        'Az ültetvényes kutatóintézetek (tea, gumi, kókusz) ágazatközeli kutatási modellje; a NASTEC STI-adatrendszere és rendszeres tudományos-technológiai '
        + 'helyzetjelentései a szakpolitika megalapozására.',
      diplomaciaiPrioritasok:
        'Az 1975-ös egyezményen alapuló TéT-párbeszéd felélesztése; a Stipendium Hungaricum-ösztöndíjasok és -alumnik bevonása a kutatási kapcsolatokba; '
        + 'a vízügyi projektek tapasztalatainak továbbvitele új együttműködésekbe.',
    },
  },
};

export default orszag;
