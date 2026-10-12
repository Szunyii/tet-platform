/**
 * Brazília (BR) 2026-os profilja – kutatott vázlat, a relációs vezető pontosítja.
 * Források (hozzáférés: 2026-10-09):
 * - Alapadatok: IMF World Economic Outlook, 2025. október (az IMF Data „WEO 2025 October” vintage-adatfolyama) –
 *   https://www.imf.org/en/publications/weo/issues/2025/10/14/world-economic-outlook-october-2025
 *   https://api.imf.org/external/sdmx/2.1/data/IMF.RES,WEO_2025_OCT_VINTAGE,1.0.0/BRA.NGDPD+NGDPDPC+NGDP_RPCH+LP.A
 *   (2025: GDP 2256,910 Mrd USD; GDP/fő 10 577,855 USD; reálnövekedés 2,4%; lakosság 213,362 millió fő)
 * - Terület: IBGE, 8 509 360,850 km² (Portaria IBGE nº 441/2026, DOU 2026. március 16.) –
 *   https://www.ibge.gov.br/geociencias/organizacao-do-territorio/estrutura-territorial/15761-areas-dos-municipios.html
 *   (további forrás: https://www.diariodepernambuco.com.br/brasil/2026/03/11711226-o-brasil-encolheu-entenda-o-que-mudou-nos-calculos.html)
 * - GII 2025 (52. hely, LAC 2., felső-közepes jövedelműek 5., erősségek és gyengeségek, São Paulo klaszter 49.) –
 *   https://www.wipo.int/edocs/gii-ranking/2025/br.pdf
 * - GERD: UNESCO UIS / Világbank, 2023: 1,19% (2010–2023 között 1,12–1,28%) –
 *   https://api.uis.unesco.org/api/public/data/indicators?indicator=EXPGDP.TOT&geoUnit=BRA
 *   https://data.worldbank.org/indicator/GB.XPD.RSDV.GD.ZS?locations=BR
 * - Stratégia: az ENCTI 2024–2034 hivatalos szövege (MCTI–CCT–CGEE; 2% a GDP-ben 2034-re, főként vállalati K+F-fel; négy pillér;
 *   globálisan vezető területek; a Nova Indústria Brasil hat missziója; az FNDCT költségvetésének helyreállása; innovációs törvény
 *   2004, Lei do Bem 2005, jogi keretrendszer 2016, Lei de Informática) –
 *   https://portal-cct.prd.ibict.br/files/original/6c7c0f15bdcfed82c8b70c48e14142dfa942b5c9.pdf
 *   Jóváhagyás: Portaria MCTI nº 10.226, 2026. július 28.; PACTI 2027–2031 –
 *   https://atlaspublico.com.br/noticias/ministra-luciana-santos-aprova-estrategia-nacional-de-75932
 *   https://convergenciadigital.com.br/governo/plano-de-acao-em-ciencia-tecnologia-e-inovacao-do-brasil-para-os-proximos-10-anos-tem-de-ser-detalhado-em-120-dias/
 * - Nova Indústria Brasil (2024. január, 2033-ig, 300 Mrd BRL 2026-ig) –
 *   https://www.gov.br/planalto/en/latest-news/2024/01/brazil-launches-new-industrial-policy-with-development-goals-and-measures-up-to-2033
 * - PBIA 2024–2028 (23 Mrd BRL) – https://revistapesquisa.fapesp.br/plano-nacional-de-ia-elenca-areas-prioritarias-para-receber-investimentos/
 * - EU–Brazília TéT-megállapodás (aláírva 2004, hatályos 2007-től, megújítva 2012-ben és 2018-ban) –
 *   https://oeil.europarl.europa.eu/oeil/en/document-summary?id=1687679
 * - EU–Mercosur (aláírás 2026. január 17.; az átmeneti kereskedelmi megállapodás ideiglenes alkalmazása 2026. május 1-jétől;
 *   ratifikáció folyamatban) – https://policy.trade.ec.europa.eu/eu-trade-relationships-country-and-region/countries-and-regions/mercosur_en
 * - ERC-jogosultság (bármely nemzetiség, EU-tagállambeli vagy társult országbeli fogadóintézmény) – https://erc.europa.eu/apply-grant/starting-grant
 * - CERN társult tagság (2024. március 13.) – https://home.cern/news/brazil-becomes-associate-member-state-cern
 * - CBERS (1988-as protokoll) – https://www.satellitetoday.com/government-military/2014/07/21/china-brazil-extend-cbers-satellite-program/
 * - KFI-rendszer, intézmények, startupok, EU-kapcsolatok (Horizont-részvétel, CONFAP-mechanizmus, digitális párbeszéd) és minden
 *   magyar vonatkozás (egyezmények, NKFIH–Embrapii, űripari megállapodás, BME–Visiona, VNL–CNPEM, Dr. Bata, Sectec, SH-megállapodás
 *   2025. február 7., hallgatói létszámok, PEC-G, USP-megállapodás, South Summit, SNCT): a São Pauló-i TéT-szakdiplomata
 *   NKFIH-beszámolói – https://nkfih.gov.hu/hivatalrol/tet-szakdiplomatak/tet-beszamolo2024-sao-paulo (2024. június – 2025. június,
 *   véglegesítve 2025. június 10.; ebből az NKFIH–Embrapii pályázat állapota is) és
 *   https://nkfih.gov.hu/hivatalrol/tet-szakdiplomatak/tet-beszamolo2023-sao-paulo
 * - Magyar–brazil egyezmény: aláírva 1986. június 20-án Budapesten, a brazil Kongresszus jóváhagyása 1991. december 12., hatályba lépett
 *   1992. január 2-án (Decreto nº 443, 1992. február 6.) – https://planalto.gov.br/ccivil_03/decreto/1990-1994/D0443.htm
 *   (a 2023-as és 2024-es NKFIH-beszámolók hatálybalépésként 1991. március 21-ét közölnek; a kiegészítő egyezmény: 1987, NKFIH)
 * - Stipendium Hungaricum (jelenleg mesteri/doktori részképzés) – https://stipendiumhungaricum.hu/partners/
 * - Embraer C-390 (szerződés 2020, első gép 2024. szeptember 5.) –
 *   https://www.aviationpros.com/aircraft/press-release/55137853/embraer-delivers-the-first-c-390-millennium-to-the-hungarian-air-force
 * - Rendezvények: Agrishow – https://www.correiobraziliense.com.br/brasil/2026/04/7405987-agrishow-2026-abre-com-foco-em-inovacao-e-negocios-no-agro.html
 *   ROG.e – https://brasilenergia.com.br/brasilenergia/roge-2026/brasil-energia-acompanha-a-roge-2026-de-volta-ao-riocentro
 *   Web Summit Rio – https://olhardigital.com.br/2026/06/09/pro/web-summit-rio-2026-pode-reunir-multidoes-e-centralizar-debates-sobre-inteligencia-artificial/
 *   https://rio.websummit.com/ (2027: június 14–17., Riocentro)
 *   SBPC (78. ülés, 2026. július 26. – augusztus 1., UFF, Niterói) – https://ra.sbpcnet.org.br/78RA/wp-content/uploads/2025/12/1_Normas_de_inscricao_78RA.pdf
 *   Futurecom – https://www.futurecom.com.br/ ; Hospitalar – https://www.hospitalar.com/ ; LAAD – https://www.laadexpo.com.br/
 * Kimaradt blokkok és mezők: nincs.
 */
import { rendezvenyek, type DemoOrszag } from '../tipusok';

const orszag: DemoOrszag = {
  kod: 'BR',
  profil: {
    alapadatok: {
      fovaros: 'Brazíliaváros (Brasília)',
      terulet: '8 509 361',
      penznem: 'brazil reál (BRL)',
      lakossag: '213 362 000',
      gdp: '2 256,9',
      gdpEgyFore: '10 578',
      gdpNovekedes: '2,4',
      adatEv: '2025',
      forras: 'IMF World Economic Outlook (2025. október), IBGE (Brazil Földrajzi és Statisztikai Intézet)',
      tagsagok: ['G20', 'BRICS', 'Mercosur'],
      tagsagEgyeb: 'ENSZ, WTO, Portugál Nyelvű Országok Közössége (CPLP), Amazóniai Együttműködési Szerződés Szervezete (ACTO); OECD-csatlakozási folyamat 2022 óta',
      agazatok: [
        'Agrár- és élelmiszeripar', 'Bányászat és nyersanyagok', 'Energetika és fenntarthatóság', 'Mobilitás és autóipar',
        'Pénzügyi szolgáltatások',
      ],
      agazatEgyeb: 'Repülőgépgyártás (Embraer), cellulóz- és papíripar, bioüzemanyagok',
    },
    kfiRendszer: {
      teljesitmeny:
        'A Global Innovation Index 2025-ben az 52. hely a 139 gazdaság között (Latin-Amerika és a Karib-térség 21 gazdasága között a 2., '
        + 'a felső-közepes jövedelműek között az 5.); az innovációs kimenetekben jobb (50.), mint a ráfordításokban (63.), '
        + 'a São Pauló-i klaszter a világ 49. legnagyobb innovációs klasztere. '
        + 'A GDP-arányos K+F-ráfordítás 1,19% (2023, UNESCO UIS / Világbank), egy évtizede 1,1–1,3% között mozog. '
        + '2024-ben mintegy 95 ezer Scopus-indexált brazil publikáció jelent meg, és közel 28 ezer szabadalmi bejelentés érkezett az iparjogvédelmi hivatalhoz (INPI).',
      gerd: '1,19',
      strategia: 'ENCTI (nemzeti tudományos, technológiai és innovációs stratégia) 2024–2034 – cél: K+F a GDP 2%-a 2034-re; Nova Indústria Brasil (2024–2033); PBIA MI-terv (2024–2028)',
      prioritasok: [
        'Digitalizáció és MI', 'Zöld átállás és klímasemlegesség', 'Egészség és élettudomány', 'Ipar 4.0 és gyártás',
        'Technológiai szuverenitás', 'Űr', 'Védelem és biztonság',
      ],
      prioritasEgyeb: 'Agrártudományok és bioökonómia, félvezetők, energiaátmenet (az ENCTI kiemelt területei)',
      kiemeltIparagak: [
        'Agrár- és élelmiszeripar', 'Energetika és fenntarthatóság', 'Biotechnológia és gyógyszeripar',
        'Mesterséges intelligencia és adatgazdaság', 'Űripar', 'Elektronika és félvezetők',
      ],
      iparagEgyeb: 'Bioüzemanyagok, kritikus ásványok értéklánca, repülőgépgyártás, védelmi ipar',
      erossegek:
        'Az ENCTI szerint globálisan vezető területek: trópusi agrártudományok, egészségtudomány (trópusi orvoslás, epidemiológia), megújuló energia és bioökonómia – '
        + 'erős intézményekkel (Embrapa, Fiocruz, Butantan). Nagy belső piac (GII: a hazai piac mérete 7. hely), erős védjegy- és késői fázisú kockázatitőke-aktivitás '
        + '(GII: 9. és 16. hely); kiemelkedő kutatási infrastruktúrák (Sirius szinkrotron); nagy startup-ökoszisztéma (mintegy 19 ezer startup, 24 unikornis); '
        + 'szövetségi KFI-alap (FNDCT) és erős tagállami kutatástámogató alapítványok (pl. FAPESP).',
      kihivasok:
        'A K+F-intenzitás egy évtizede 1,1–1,3% körül stagnál; a 2034-re kitűzött 2%-hoz az ENCTI szerint elsősorban a vállalati K+F erőteljes bővülése kell. '
        + 'A GII gyengeségei: a szakpolitikák stabilitása az üzleti szféra számára (128.), a beruházási ráta (118.), a kormányzati hatékonyság (102.), '
        + 'valamint a természettudományi és mérnöki diplomások aránya (100.).',
    },
    intezmenyek: {
      iranyitoSzervek:
        'Tudományos, Technológiai és Innovációs Minisztérium (MCTI) – a KFI-politika gazdája, hozzá tartozik a CNPq és a Finep.\n'
        + 'Nemzeti Tudományos és Technológiai Tanács (CCT) – a köztársasági elnök KFI-tanácsadó testülete.\n'
        + 'Fejlesztési, Ipari, Kereskedelmi és Szolgáltatási Minisztérium (MDIC) – iparpolitika (Nova Indústria Brasil).\n'
        + 'Oktatási Minisztérium (MEC) – a CAPES révén a posztgraduális képzés és ösztöndíjak gazdája.\n'
        + 'Ügynökségek és alapok: CNPq (kutatási pályázatok és ösztöndíjak), Finep (innovációfinanszírozás, az FNDCT kezelője), Embrapii (ipari K+F), '
        + 'BNDES (fejlesztési bank), ABDI (iparfejlesztés), Brazil Űrügynökség (AEB), INPI (iparjogvédelem); tagállami kutatástámogató alapítványok (FAP-ok, pl. FAPESP) és ezek tanácsa, a CONFAP.',
      egyetemek:
        'São Pauló-i Egyetem (USP), Campinasi Állami Egyetem (Unicamp), Rio de Janeiró-i Szövetségi Egyetem (UFRJ) – a nemzetközi rangsorok legjobb brazil intézményei; '
        + 'Paulista Állami Egyetem (UNESP), Minas Gerais-i Szövetségi Egyetem (UFMG), Rio Grande do Sul-i Szövetségi Egyetem (UFRGS), '
        + 'Instituto Tecnológico de Aeronáutica (ITA, São José dos Campos – repüléstechnika). Mintegy 2600 felsőoktatási intézmény, közel 90%-uk magánintézmény.',
      kutatokozpontok:
        'Embrapa (agrárkutatás, országos hálózat), Fiocruz (közegészségügy és vakcinák, Rio de Janeiro), Instituto Butantan (biomedicina és vakcinagyártás, São Paulo), '
        + 'CNPEM (anyag- és energiakutatás, Campinas – LNLS, LNBio, LNBR, LNNano), INPE (űrkutatás és földmegfigyelés), IPT (műszaki kutatás, São Paulo), '
        + 'LNCC (tudományos számítástechnika), IMPA (matematika). Mintegy 300 tudományos és technológiai intézmény (ICT) végez alap- és alkalmazott kutatást.',
      infrastrukturak:
        'Sirius – negyedik generációs szinkrotron fényforrás (CNPEM, Campinas); az épülő Orion laborkomplexum, Latin-Amerika első BSL-4 szintű laborja, '
        + 'amely a Sirius nyalábjaihoz kapcsolódik; Alcântara indítóbázis; Santos Dumont szuperszámítógép (LNCC, Petrópolis); '
        + 'a PNIPE nemzeti kutatásiinfrastruktúra-platform 579 intézmény 7522 laborjáról és 48 571 berendezéséről ad adatot.',
    },
    vallalati: {
      kiemeltAgazatok: [
        'Agrár- és élelmiszeripar', 'Energetika és fenntarthatóság', 'IKT és digitalizáció', 'Biotechnológia és gyógyszeripar', 'Űripar',
        'Védelmi ipar',
      ],
      agazatEgyeb: 'Fintech, repülőgépgyártás, bioüzemanyagok',
      topVallalatok: [
        'Petrobras', 'Vale', 'Embraer', 'WEG', 'Natura &Co',
        'Suzano', 'Braskem', 'Itaú Unibanco', 'Nubank', 'Totvs',
      ].join('\n'),
      startupok:
        'Mintegy 19 ezer startup és 24 unikornis (ismert példák: Nubank, iFood, QuintoAndar, CloudWalk). 2024-ben a startupok 13,9 milliárd BRL tőkét vontak be, '
        + 'mintegy 50%-kal többet, mint 2023-ban; a legnagyobb befektetések az energia-, a fintech- és a logisztikai szektorba érkeztek. '
        + 'A központ São Paulo állam, mellette Minas Gerais és Rio de Janeiro; a legfontosabb startup-események a Web Summit Rio és a Porto Alegre-i South Summit.',
      klaszterek:
        'São Paulo (a GII 2025 szerint a világ 49. legnagyobb innovációs klasztere); Campinas (Unicamp, CNPEM); São José dos Campos (Embraer, ITA, INPE, PIT technológiai park); '
        + 'Porto Digital (Recife); Curitiba (Vale do Pinhão ökoszisztéma, a PUCPR Hotmilk innovációs parkja). Országosan mintegy 100 technológiai park és több mint 400 inkubátor és gyorsító.',
      technologiatranszfer:
        'Az innovációs törvény (2004) és a KFI jogi keretrendszere (2016) alapján működő technológiatranszfer-irodák (NIT-ek) az egyetemeken és kutatóintézetekben; '
        + 'egyetemi innovációs ügynökségek (Inova Unicamp, USP Innovációs Ügynökség); az Embrapii akkreditált egységei a vállalat–kutatóintézet közös projekteket társfinanszírozzák; '
        + 'a PROFNIT országos posztgraduális szellemitulajdon- és technológiatranszfer-képzés.',
    },
    programok: {
      palyazatok:
        'CNPq: Chamada Universal (alapkutatás) és az INCT nemzeti tudományos-technológiai intézethálózat; CAPES: posztgraduális ösztöndíjak és a PrInt nemzetköziesítési program; '
        + 'FAPESP: tematikus projektek, CEPID kutatóközpontok, PIPE (kisvállalati innováció), évente meghirdetett SPRINT nemzetközi kutatómobilitás (kölcsönösségi alapon); '
        + 'az Amazon+10 kezdeményezés (FAPESP és további tagállami FAP-ok, külföldi társfinanszírozással).',
      tamogatasiProgramok:
        'Nova Indústria Brasil (2024–2033): hat misszió – agráripari értékláncok, egészségipar, infrastruktúra és mobilitás, az ipar digitális átalakulása, '
        + 'bioökonómia és energiaátmenet, védelmi és szuverenitási technológiák –, 2026-ig 300 milliárd BRL finanszírozás a BNDES, a Finep és az Embrapii révén; '
        + 'Brazil MI-terv (PBIA) 2024–2028: 23 milliárd BRL, mintegy 60%-a vállalati innovációs projektekre; '
        + 'Brazil Űrprogram (PNAE) 2022–2031; Nemzeti Hidrogénprogram (PNH2); Digitális Átalakulás Stratégia (E-Digital) 2022–2026.',
      finanszirozasiEszkozok:
        'FNDCT – a fő szövetségi KFI-alap (vissza nem térítendő támogatás és hitel, kezelője a Finep); az ENCTI szerint költségvetése példátlan mértékben helyreállt. '
        + 'Finep-hitelek, BNDES innovációs finanszírozás; a „Lei do Bem” (2005) K+F-adókedvezményei és az informatikai törvény (Lei de Informática) ösztönzői.',
      nemzetkoziReszvetel:
        'Horizont Európa: Brazília nem társult ország; a brazil szervezetek a legtöbb felhívásban részt vehetnek, uniós támogatást azonban csak ott kapnak, ahol a felhívás '
        + 'ezt kifejezetten lehetővé teszi vagy részvételük nélkülözhetetlen. Ezt pótolja a CONFAP, a CNPq és a Finep 2021–2027-es társfinanszírozási mechanizmusa '
        + '(a brazil pályázók sikerességi aránya 26%). Az ERC- és az MSCA-ösztöndíjakra brazil kutatók is pályázhatnak EU-tagállambeli vagy társult országbeli '
        + 'fogadóintézménnyel. CERN társult tagállam (2024); a FAPESP SPRINT-pályázatai és nemzetközi megállapodásai.',
    },
    rendezvenyek: rendezvenyek([
      { nev: 'Agrishow', tipus: 'szakkiallitas', idopont: 'április–május, Ribeirão Preto (São Paulo állam)', megjegyzes: 'Évente; agrártechnológiai szakvásár; 2026: április 27. – május 1. (31. alkalommal)' },
      { nev: 'Hospitalar', tipus: 'szakkiallitas', idopont: 'május, São Paulo (São Paulo Expo)', megjegyzes: 'Évente; egészségipari szakvásár; 2027: május 18–21.' },
      { nev: 'Web Summit Rio', tipus: 'konferencia', idopont: 'június, Rio de Janeiro (Riocentro)', megjegyzes: 'Technológiai és startup-konferencia; 2026: június 8–11., 2027: június 14–17.' },
      { nev: 'South Summit Brazil', tipus: 'forum', idopont: 'március–április, Porto Alegre', megjegyzes: 'Startup- és innovációs esemény; 2025: április 9–11., két magyar cég részvételével' },
      { nev: 'Reunião Anual da SBPC', tipus: 'konferencia', idopont: 'július, változó helyszín', megjegyzes: 'Évente; a Brazil Tudományos Haladás Társaságának találkozója; 2026: július 26. – augusztus 1., Niterói (UFF)' },
      { nev: 'Semana Nacional de Ciência e Tecnologia (SNCT)', tipus: 'forum', idopont: 'október, országszerte', megjegyzes: 'Nemzeti tudományos és technológiai hét' },
      { nev: 'Futurecom', tipus: 'szakkiallitas', idopont: 'október, São Paulo (São Paulo Expo)', megjegyzes: 'Évente; digitális gazdaság, távközlés, MI; 2026: október 6–8.' },
      { nev: 'ROG.e (Rio Oil & Gas)', tipus: 'szakkiallitas', idopont: 'szeptember, Rio de Janeiro', megjegyzes: 'Kétévente (páros években); az IBP energetikai kiállítása és konferenciája; 2026: szeptember 21–24., Riocentro' },
      { nev: 'LAAD Defence & Security', tipus: 'szakkiallitas', idopont: 'április, Rio de Janeiro (Riocentro)', megjegyzes: 'Kétévente (páratlan években); védelmi és biztonsági szakvásár; következő: 2027. április 13–16.' },
    ]),
    kapcsolatok: {
      euMultilateralis:
        'EU–Brazília tudományos és technológiai együttműködési megállapodás (aláírva 2004, hatályos 2007-től, többször megújítva); digitális párbeszéd '
        + '(MI, 5G/6G, adatgazdaság), Copernicus-együttműködés, BELLA adatkábel-program; CERN társult tagállam 2024 óta, elsőként az amerikai kontinensen. '
        + 'Az EU–Mercosur megállapodást 2026 januárjában aláírták; az átmeneti kereskedelmi megállapodást 2026 májusa óta ideiglenesen alkalmazzák, '
        + 'a teljes megállapodás ratifikációja folyamatban.',
      partnerorszagok:
        'Kína (CBERS közös földmegfigyelő műholdprogram, 1988 óta), USA (Artemis-egyezmények, 2021), EU-tagállamok (Horizont Európa-konzorciumok), BRICS-partnerek; '
        + 'a brazil hallgatók legnépszerűbb célországai az USA, Portugália, Kanada és Németország. '
        + 'A 2017-ben indított Innovációs Diplomácia Program keretében 64 brazil külképviseleten – köztük Budapesten – működik tudományos-technológiai (Sectec) képviselet.',
      egyezmeny: 'Magyar–brazil műszaki-tudományos együttműködési megállapodás (aláírva 1986, hatályba lépett 1992. január 2-án) és kiegészítő egyezménye (1987); ötévente megújulnak',
      ketoldalu:
        'Az NKFIH–Embrapii megállapodás (2022) közös projekteket irányzott elő, de a 2024/25-ös (2025. júniusi) TéT-beszámoló szerint az NKFIH programstratégiája '
        + 'és a hazai forrás hiánya miatt pályázat nem hirdethető meg. '
        + 'Ágazati megállapodások: űrtevékenység, agrárkutatás, szabványosítás (2019), vízgazdálkodás (2022); az űrmegállapodás nyomán a BME és az Embraer-csoporthoz '
        + 'tartozó Visiona titoktartási megállapodást kötött (2024). Egyéb szálak: a Virológiai Nemzeti Laboratórium (VNL) és a CNPEM döntése három közös projektről (2025), a Dr. Bata Zrt. chapecói üzeme (2024), '
        + 'a Magyar Honvédség két Embraer C-390-ese.',
      mobilitas:
        'Stipendium Hungaricum: a 2025. február 7-én aláírt megállapodással egy kihagyott kör után ismét pályázhatnak brazil hallgatók (jelenleg mesteri és doktori részképzésre); '
        + 'a program indulása óta 985 brazil hallgató iratkozott be, a 2024/25-ös tanévben 230 brazil hallgató tanult Magyarországon (114 SH-, 23 Diaszpóra-ösztöndíjas). '
        + 'A 2024/25-ös São Pauló-i TéT-beszámoló szerint Magyarország programország a brazil PEC-G ösztöndíjprogramban; a KKM–USP vendégoktatói megállapodás 2030-ig érvényes.',
    },
    magyarErtekeles: {
      osszegzes:
        'Brazília Latin-Amerika legnagyobb gazdasága és a régió egyik vezető KFI-szereplője (GII 2025: 52., a régióban 2.), erős agrár-, egészség- és űripari '
        + 'kutatással és nagy startup-piaccal. A kapcsolatok főként kutatói és felsőoktatási szintűek; a Stipendium Hungaricum 2025-ös megújítása, '
        + 'a 2022-es NKFIH–Embrapii megállapodás és a VNL–CNPEM együttműködés jó alap, de a közös projektekhez hiányzik a dedikált magyar pályázati forrás.',
      egyuttmukodesiLehetosegek:
        'Agrártechnológia és vízgazdálkodás (Embrapa, tagállami FAP-ok); virológia és biobiztonság (VNL – CNPEM, Orion); űripar az űrtevékenységre vonatkozó megállapodás alapján '
        + '(BME – Visiona); akkumulátor- és járműipari K+F; egészségipar; Horizont Európa-konzorciumok brazil partnerrel, a CONFAP társfinanszírozására építve.',
      joGyakorlatok:
        'Az Embrapii-modell: akkreditált kutatóegységeken keresztüli társfinanszírozás a vállalat–kutatóintézet közös projektekben; a tagállami kutatástámogató alapítványok '
        + '(FAPESP) súlya a kutatásfinanszírozásban; a CONFAP–EU társfinanszírozási mechanizmus a Horizont Európa-részvételhez; a PNIPE nyilvános kutatásiinfrastruktúra-adatbázis; '
        + 'a Sectec innovációs diplomáciai hálózat.',
      diplomaciaiPrioritasok:
        'Kis összegű magyar–brazil kísérleti pályázat indítása, például az NKFIH és az Embrapii 2022-es együttműködésének felújításával; a Stipendium Hungaricum-ajánlat bővítése a teljes képzésekre; '
        + 'az űrtevékenységre vonatkozó megállapodás megtöltése konkrét projektekkel; közös felhívások a tagállami (São Paulo, Paraná, Santa Catarina, Rio de Janeiro) '
        + 'kutatástámogató alapítványokkal; a magyar agrár-, egészség- és víztechnológiai cégek piacra lépésének támogatása.',
    },
  },
};

export default orszag;
