/**
 * Dél-Korea (KR) 2026-os demó-profilja (a 2026-09-15-i adat, a korábbi scripts/demo-orszagprofil.ts-ből
 * változatlanul). Források: IMF World Economic Outlook (2025. október), Világbank, KOSTAT, GII 2025.
 */
import { rendezvenyek, type DemoOrszag } from '../tipusok';

const orszag: DemoOrszag = {
  kod: 'KR',
  profil: {
    alapadatok: {
      fovaros: 'Szöul',
      terulet: '100 210',
      penznem: 'dél-koreai von (KRW)',
      lakossag: '51 700 000',
      gdp: '1 790,0',
      gdpEgyFore: '34 600',
      gdpNovekedes: '1,0',
      adatEv: '2025',
      forras: 'IMF World Economic Outlook (2025. október), Világbank, KOSTAT',
      tagsagok: ['OECD', 'G20'],
      tagsagEgyeb: 'APEC, RCEP, IPEF',
      agazatok: ['Elektronika és félvezetők', 'Autóipar', 'Gépipar', 'Vegyipar', 'IKT és szoftver'],
      agazatEgyeb: 'Hajógyártás, acélipar',
    },
    kfiRendszer: {
      teljesitmeny:
        'A Global Innovation Index 2025-ben a 4. hely (Ázsiában az első), a Bloomberg Innovation Index rendszeres élmezőnye. '
        + 'A K+F ráfordítás GDP-arányosan a világ egyik legmagasabbja; a ráfordítások közel 80%-át a vállalati szektor adja, '
        + 'erős koncentrációval a félvezető- és autóipari konglomerátumoknál. Szabadalmi aktivitásban (PCT-bejelentések) az 5 legaktívabb ország között.',
      gerd: '4,96',
      strategia: '5. Tudomány- és Technológiai Alapterv (2023–2027); 12 nemzeti stratégiai technológia programja',
      prioritasok: [
        'Digitalizáció és MI', 'Technológiai szuverenitás', 'Zöld átállás és klímasemlegesség', 'Űr',
        'Tehetség és mobilitás', 'Startup és vállalkozói ökoszisztéma',
      ],
      prioritasEgyeb: 'Félvezető-ellátási lánc biztonsága',
      kiemeltIparagak: [
        'Félvezetők és mikroelektronika', 'Mesterséges intelligencia és adatgazdaság', 'Kvantumtechnológia',
        'Hidrogén és akkumulátor', 'Digitális egészségügy',
      ],
      iparagEgyeb: 'Robotika',
      erossegek:
        'Memóriachip-gyártásban világelső (Samsung, SK hynix), gyors iparosítási és technológiaadaptációs képesség, '
        + 'a kormányzati és a vállalati K+F összehangolt tervezése, magas mérnökképzési kibocsátás, '
        + 'kiemelkedő digitális infrastruktúra (5G-lefedettség, adatközpontok).',
      kihivasok:
        'A K+F erősen a nagyvállalatokra koncentrálódik, a KKV-szektor innovációs képessége gyengébb. '
        + 'Alacsony születésszám és a kutatói utánpótlás szűkülése; az alapkutatás részaránya elmarad a fejlesztéstől. '
        + 'A félvezető-ellátási láncok geopolitikai kitettsége (USA–Kína), valamint a 2024-es K+F költségvetési vita után a kutatói bizalom helyreállítása.',
    },
    intezmenyek: {
      iranyitoSzervek:
        'Elnöki Tudomány- és Technológiai Tanácsadó Testület (PACST) – a KFI-politika legfelső szintű koordinációja.\n'
        + 'Tudomány- és IKT-minisztérium (MSIT) – az alapkutatás, az IKT és az űrpolitika gazdája.\n'
        + 'Kereskedelmi, Ipari és Energiaügyi Minisztérium (MOTIE) – ipari K+F és technológiai kereskedelem.\n'
        + 'Ügynökségek: Nemzeti Kutatási Alapítvány (NRF), KISTEP (értékelés és tervezés), IITP (IKT), KEIT (ipari technológia), KIAT.',
      egyetemek:
        'KAIST (Tedzson), Szöuli Nemzeti Egyetem (SNU), POSTECH (Pohang), Yonsei Egyetem, Korea Egyetem, Sungkyunkwan Egyetem (SKKU – Samsung-hátterű), '
        + 'UNIST (Ulszan), GIST (Kvangdzsu), DGIST (Tegu).',
      kutatokozpontok:
        'Koreai Tudományos és Technológiai Intézet (KIST), ETRI (elektronika és távközlés), KRISS (metrológia), KAERI (atomenergia), '
        + 'KRIBB (biotudományok), KIMM (gépészet), KIER (energia), KARI (űrkutatás), IBS (Institute for Basic Science – alapkutatási központhálózat).',
      infrastrukturak:
        'Daedeok Innopolis (Tedzson) – az ország legnagyobb kutatóváros-komplexuma; Pangyo Techno Valley (IKT és startupok); '
        + 'PAL-XFEL szabadelektron-lézer (Pohang); KSTAR szupravezető tokamak; Nuri hordozórakéta és a Naro űrközpont; '
        + 'a KISTI nemzeti szuperszámítógépe (Nurion, 2026-tól a 6. generációs rendszer).',
    },
    vallalati: {
      kiemeltAgazatok: [
        'Félvezetők és mikroelektronika', 'Mobilitás és autóipar', 'Hidrogén és akkumulátor', 'Digitális egészségügy',
        'Mesterséges intelligencia és adatgazdaság',
      ],
      agazatEgyeb: 'Hajóépítés, kijelzőgyártás',
      topVallalatok: [
        'Samsung Electronics', 'SK hynix', 'Hyundai Motor', 'LG Electronics', 'LG Energy Solution',
        'Kia', 'POSCO Holdings', 'Naver', 'Kakao', 'Celltrion',
      ].join('\n'),
      startupok:
        'Mintegy 20 unikornis (Coupang, Krafton, Viva Republica/Toss, Yanolja, Dunamu); a TIPS program évi több száz mélytech-startupot finanszíroz. '
        + 'A K-Startup Grand Challenge külföldi csapatokat hoz Koreába; a KKV-k innovációját a Kis- és Középvállalkozási Minisztérium (MSS) programjai támogatják.',
      klaszterek:
        'Pangyo Techno Valley (IKT, játék, fintech), Daedeok Innopolis (mélytech), Songdo (biotechnológia, Samsung Biologics, Celltrion), '
        + 'a tervezett Yongin félvezető-megaklaszter; a Kreatív Gazdasági Innovációs Központok (CCEI) 19 régiós hálózata inkubátorként működik.',
      technologiatranszfer:
        'Egyetemi és intézeti technológiatranszfer-irodák (KAIST, ETRI, KIST TLO); a KIAT technológiaértékelése; '
        + 'a KOTEC technológiaalapú hitelgaranciái; a nagyvállalatok vállalati kockázatitőke-alapjai (Samsung Ventures, Hyundai CRADLE).',
    },
    programok: {
      palyazatok:
        'NRF alapkutatási pályázatok (Basic Research Program, fiatal kutatói és csoportos sémák); IITP IKT K+F felhívások; '
        + 'KEIT ipari technológiai programok; az MSIT 12 nemzeti stratégiai technológiájához kötött célzott felhívások.',
      tamogatasiProgramok:
        'TIPS (Tech Incubator Program for Startup) – állami társfinanszírozás magánbefektető mellé; K-Startup Grand Challenge; '
        + 'Global R&D program – az MSIT 2024-től jelentősen bővített nemzetközi K+F kerete; Brain Pool (külföldi kutatók fogadása).',
      finanszirozasiEszkozok:
        'Korea Venture Investment Corp. (KVIC) alapok alapja; KOTEC technológiai garanciák; Korea Development Bank (KDB) innovációs hitelek; '
        + 'K+F adókedvezmény (nemzeti stratégiai technológiáknál 30–40%-os beruházási adójóváírás).',
      nemzetkoziReszvetel:
        'Horizont Európa társult ország 2025-től (II. pillér); az EUREKA teljes jogú tagja (2022); ITER, IEA, OECD; '
        + 'NRF–NKFIH közös felhívások; Brain Pool és Global R&D program külföldi partnerekkel.',
    },
    rendezvenyek: rendezvenyek([
      { nev: 'SEMICON Korea', tipus: 'szakkiallitas', idopont: 'február, Szöul (COEX)', megjegyzes: 'Félvezetőipari kiállítás és konferencia' },
      { nev: 'BIO KOREA', tipus: 'szakkiallitas', idopont: 'május, Szöul (COEX)', megjegyzes: 'Biotech és gyógyszeripar, partnering' },
      { nev: 'NANO KOREA', tipus: 'szakkiallitas', idopont: 'július, Ilszan (KINTEX)' },
      { nev: 'World Knowledge Forum', tipus: 'konferencia', idopont: 'szeptember, Szöul', megjegyzes: 'Maeil Business – gazdaság és technológia' },
      { nev: 'COMEUP', tipus: 'forum', idopont: 'november–december, Szöul', megjegyzes: 'Nemzetközi startup-fesztivál (MSS)' },
      { nev: 'Korea–EU Research and Innovation Day', tipus: 'forum', idopont: 'ősz, Szöul', megjegyzes: 'Horizont Európa-tájékoztató, partnerkeresés' },
    ]),
    kapcsolatok: {
      euMultilateralis:
        'Horizont Európa társult ország 2025-től; EU–Korea Digitális Partnerség (2022) és Zöld Partnerség (2023); '
        + 'OECD CSTP és Global Science Forum aktív tag; ITER és EUREKA részvétel; az IEA tagja.',
      partnerorszagok:
        'USA (félvezető, MI, űr – Nemzeti Stratégiai Technológiai Szövetség), Japán (ellátási lánc, kvantum), EU (Horizont Európa), '
        + 'Németország és Franciaország (Ipar 4.0, hidrogén), Egyesült Királyság (kvantum), Vietnám (technológia-transzfer).',
      egyezmeny: 'Magyar–koreai tudományos és technológiai együttműködési egyezmény (1992)',
      ketoldalu:
        'NKFIH–NRF közös kutatói csereprogram és TéT-pályázat; magyar–koreai TéT vegyes bizottság; '
        + 'KAIST–BME és SNU–ELTE intézményi megállapodások; a Samsung SDI (Göd) és az SK On (Iváncsa, Komárom) magyar telephelyei köré épülő ipari K+F.',
      mobilitas:
        'Global Korea Scholarship (GKS) – magyar hallgatói kvóta; Stipendium Hungaricum koreai hallgatóknak; '
        + 'NRF Brain Pool külföldi kutatóknak; Campus Mundi és Erasmus+ nemzetközi kreditmobilitás a KAIST-tel és a Korea Egyetemmel.',
    },
    magyarErtekeles: {
      osszegzes:
        'Dél-Korea a világ egyik legintenzívebb K+F-befektetője; a magyarországi koreai akkumulátor- és elektronikai beruházások '
        + 'kész ipari alapot adnak a TéT-kapcsolatok elmélyítéséhez, elsősorban akkumulátor, félvezető és MI területen.',
      egyuttmukodesiLehetosegek:
        'Akkumulátor-technológia és újrahasznosítás (a magyar gyártóbázisra épülő közös K+F); félvezető-utánpótlás képzés (BME, ELTE – KAIST, SNU); '
        + 'MI és adatgazdaság közös Horizont Európa projektjei; kvantumtechnológia (HUN-REN Wigner – IBS, KRISS); hidrogéngazdaság.',
      joGyakorlatok:
        'TIPS modell: állami társfinanszírozás csak akkreditált magánbefektető mellé; a KISTEP független programértékelése; '
        + 'a 12 nemzeti stratégiai technológia célzott, mérhető útitervei; CCEI hálózat a régiós startup-inkubációra.',
      diplomaciaiPrioritasok:
        'A TéT vegyes bizottság ülésének felújítása; közös NKFIH–NRF felhívás indítása; magyar beszállítók bevonása a koreai ipari K+F programokba; '
        + 'a Horizont Európa társulás kínálta közös konzorciumok szervezése.',
    },
  },
};

export default orszag;
