/**
 * Demó-adatok a két teszt attasé posztjához és országprofiljához (KR, JP) az aktuális évre.
 * Idempotens: a poszt-mezőket felülírja, a profil blokkjait blokkonként upsert-eli.
 * Az adatok a `validalBlokk` validátoron mennek át, tehát pontosan azt kapja a DB, amit az
 * űrlapon beírt érték adna.
 *
 * Futtatás: NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-orszagprofil.ts
 */
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { user } from '../db/schema';
import { upsertBlokk } from '../db/queries/orszagprofil';
import { validalBlokk } from '../lib/orszagprofil-validacio';
import { aktualisEv } from '../lib/datum';
import { BLOKK_KULCSOK, type BlokkKulcs } from '../lib/orszagprofil-szotar';

interface Poszt {
  fovaros: string;
  terulet: number;
  penznem: string;
  telefon: string;
  kapcsolatEmail: string;
}

/** Egy blokk űrlap-értékei: mezőnév → string vagy string-lista (listás mezők, több azonos név). */
type Urlap = Record<string, string | string[]>;

interface DemoOrszag {
  email: string;
  poszt: Poszt;
  profil: Record<BlokkKulcs, Urlap>;
}

function rendezvenyek(sorok: { nev: string; tipus: string; idopont: string; megjegyzes?: string }[]): Urlap {
  const u: Urlap = {};
  sorok.forEach((s, i) => {
    u[`rendezveny.${i}.nev`] = s.nev;
    u[`rendezveny.${i}.tipus`] = s.tipus;
    u[`rendezveny.${i}.idopont`] = s.idopont;
    u[`rendezveny.${i}.megjegyzes`] = s.megjegyzes ?? '';
  });
  return u;
}

const KR: DemoOrszag = {
  email: 'teszt.attase@niu.hu',
  poszt: {
    fovaros: 'Szöul',
    terulet: 100210,
    penznem: 'dél-koreai won (KRW)',
    telefon: '+82 2 792 2105',
    kapcsolatEmail: 'tet.szoul@niu.hu',
  },
  profil: {
    alapadatok: {
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

const JP: DemoOrszag = {
  email: 'masodik.attase@niu.hu',
  poszt: {
    fovaros: 'Tokió',
    terulet: 377975,
    penznem: 'japán jen (JPY)',
    telefon: '+81 3 3798 8801',
    kapcsolatEmail: 'tet.tokio@niu.hu',
  },
  profil: {
    alapadatok: {
      lakossag: '123 800 000',
      gdp: '4 190,0',
      gdpEgyFore: '33 900',
      gdpNovekedes: '1,1',
      adatEv: '2025',
      forras: 'IMF World Economic Outlook (2025. október), Világbank, Japán Statisztikai Hivatal',
      tagsagok: ['OECD', 'G7', 'G20'],
      tagsagEgyeb: 'APEC, CPTPP, RCEP, Quad',
      agazatok: ['Autóipar', 'Gépipar', 'Elektronika és félvezetők', 'Vegyipar', 'Gyógyszeripar', 'Pénzügyi szolgáltatások'],
      agazatEgyeb: 'Robotika és precíziós műszerek',
    },
    kfiRendszer: {
      teljesitmeny:
        'A Global Innovation Index 2025-ben a 13. hely; abszolút K+F ráfordításban a világ 3. legnagyobb (az USA és Kína után). '
        + 'A ráfordítások mintegy 78%-a vállalati; szabadalmi bejelentésekben tartósan a top 3-ban. '
        + 'A magas idézettségű publikációk részaránya az elmúlt két évtizedben csökkent, ennek visszafordítása kormányzati prioritás.',
      gerd: '3,41',
      strategia: '7. Tudomány-, Technológia- és Innovációs Alapterv (2026–2030); Integrált Innovációs Stratégia (évente)',
      prioritasok: [
        'Digitalizáció és MI', 'Zöld átállás és klímasemlegesség', 'Technológiai szuverenitás', 'Alapkutatási kiválóság',
        'Tehetség és mobilitás', 'Startup és vállalkozói ökoszisztéma', 'Regionális felzárkózás',
      ],
      prioritasEgyeb: 'Gazdaságbiztonság (Economic Security Promotion Act), Society 5.0',
      kiemeltIparagak: [
        'Félvezetők és mikroelektronika', 'Kvantumtechnológia', 'Mesterséges intelligencia és adatgazdaság',
        'Biotechnológia és gyógyszeripar', 'Hidrogén és akkumulátor', 'Anyagtudomány',
      ],
      iparagEgyeb: 'Robotika, fúziós energia',
      erossegek:
        'Világszínvonalú anyagtudomány és gyártástechnológia; a félvezető-berendezések és -alapanyagok globális kulcsszállítója; '
        + 'stabil, hosszú távú alapkutatás-finanszírozás (KAKENHI); nagy kutatási infrastruktúrák (SPring-8, J-PARC, Fugaku); '
        + 'erős vállalati K+F-kultúra és szabadalmi portfóliók.',
      kihivasok:
        'Elöregedő társadalom és fogyó kutatói utánpótlás; alacsony nemzetközi mobilitás és kevés külföldi kutató; '
        + 'a doktori képzés vonzerejének csökkenése; a startup-ökoszisztéma a méretéhez képest kicsi; '
        + 'lassú digitalizáció a közszférában és a KKV-knál.',
    },
    intezmenyek: {
      iranyitoSzervek:
        'Tudomány-, Technológia- és Innovációs Tanács (CSTI, a Kabinetiroda alatt) – stratégiai irányítás.\n'
        + 'MEXT (oktatás, kultúra, sport, tudomány és technológia) – alapkutatás, egyetemek.\n'
        + 'METI (gazdaság, kereskedelem, ipar) – ipari K+F, félvezető-politika.\n'
        + 'Finanszírozó ügynökségek: JST, JSPS (MEXT alatt), NEDO (METI alatt), AMED (orvosi K+F).',
      egyetemek:
        'Tokiói Egyetem, Kiotói Egyetem, Oszakai Egyetem, Tohoku Egyetem (az első „nemzetközi kutatási kiválósági egyetem"), '
        + 'Institute of Science Tokyo (a Tokyo Tech és a TMDU 2024-es egyesüléséből), Nagojai Egyetem, Hokkaidói Egyetem, Kjúsúi Egyetem, Keio, Waseda.',
      kutatokozpontok:
        'RIKEN (természettudományi alapkutatás), AIST (ipari tudomány és technológia), NIMS (anyagtudomány), JAXA (űr), '
        + 'NICT (infokommunikáció), QST (kvantum- és sugárzástudomány), NIES (környezet), NIBIOHN.',
      infrastrukturak:
        'Fugaku szuperszámítógép (Kóbe) és a 2030-ra tervezett utódja; SPring-8 szinkrotron és SACLA röntgenlézer (Harima); '
        + 'J-PARC protongyorsító (Tókai); Super-Kamiokande és az épülő Hyper-Kamiokande; Cukuba tudományváros; '
        + 'a Rapidus 2 nm-es félvezető-gyár (Hokkaidó) és a TSMC kumamotói üzemei.',
    },
    vallalati: {
      kiemeltAgazatok: [
        'Mobilitás és autóipar', 'Félvezetők és mikroelektronika', 'Biotechnológia és gyógyszeripar', 'Anyagtudomány',
        'Mesterséges intelligencia és adatgazdaság',
      ],
      agazatEgyeb: 'Robotika, optika és képalkotás',
      topVallalatok: [
        'Toyota Motor', 'Sony Group', 'Hitachi', 'Panasonic Holdings', 'Honda Motor',
        'SoftBank Group', 'Mitsubishi Electric', 'Takeda Pharmaceutical', 'Tokyo Electron', 'NTT',
      ].join('\n'),
      startupok:
        'A Startup Fejlesztési Ötéves Terv (2022) 2027-re 10 billió jen befektetést és 100 unikornist céloz; '
        + 'kiemelt startupok: Preferred Networks, Sakana AI, SmartHR, Spiber, Telexistence. '
        + 'A J-Startup (METI/JETRO) és a JST START program a mélytech-cégeket támogatja; a KKV-k innovációját az SME Agency programjai segítik.',
      klaszterek:
        'Cukuba tudományváros; Kavaszaki King Skyfront (élettudomány); Kanszai Innovációs Övezet (Oszaka–Kiotó–Kóbe, regeneratív orvoslás); '
        + 'Sibuja és Fukuoka startup-központok; a hokkaidói félvezető-klaszter (Rapidus); Kumamoto (TSMC beszállítói lánc).',
      technologiatranszfer:
        'Egyetemi technológiatranszfer-irodák a TLO-törvény (1998) alapján; egyetemi kockázatitőke-cégek (UTokyo IPC, Kyoto-iCAP, Osaka University Venture Capital); '
        + 'JST A-STEP és START programok; AIST vállalati közös laborok; a RIKEN Innovation Design Office.',
    },
    programok: {
      palyazatok:
        'JSPS KAKENHI (Grants-in-Aid for Scientific Research – a legnagyobb alapkutatási felhívás); JST CREST, PRESTO, ERATO; '
        + 'NEDO ipari K+F felhívások; AMED orvosi K+F programok.',
      tamogatasiProgramok:
        'Moonshot K+F Program (2050-ig szóló célok); SIP (tárcaközi Stratégiai Innovációs Program); '
        + '10 billió jenes Egyetemi Alap a nemzetközi kutatási kiválósági egyetemeknek; WPI (World Premier International Research Center Initiative); '
        + 'GX (zöld transzformáció) 20 billió jenes átmeneti kötvényprogram.',
      finanszirozasiEszkozok:
        'Japan Investment Corporation (JIC) és a JIC Venture Growth Investments; Development Bank of Japan (DBJ); '
        + 'K+F adókedvezmény (a K+F költség 1–14%-a); a Rapidus félvezető-programjának közvetlen állami támogatása.',
      nemzetkoziReszvetel:
        'JSPS kétoldalú programok és Core-to-Core; JST SICORP és e-ASIA JRP; Horizont Európa társulási tárgyalások; '
        + 'ITER (Japán az EU mellett a fő partner), IEA, OECD; Sakura Science Program külföldi fiataloknak.',
    },
    rendezvenyek: rendezvenyek([
      { nev: 'CEATEC', tipus: 'szakkiallitas', idopont: 'október, Makuhari Messe (Csiba)', megjegyzes: 'Elektronika, IKT, Society 5.0' },
      { nev: 'SEMICON Japan', tipus: 'szakkiallitas', idopont: 'december, Tokyo Big Sight' },
      { nev: 'BioJapan', tipus: 'szakkiallitas', idopont: 'október, Jokohama', megjegyzes: 'Ázsia legnagyobb biotech partnering-eseménye' },
      { nev: 'nano tech', tipus: 'szakkiallitas', idopont: 'január–február, Tokyo Big Sight', megjegyzes: 'Nanotechnológia és anyagtudomány' },
      { nev: 'Innovation Japan', tipus: 'forum', idopont: 'augusztus, Tokió', megjegyzes: 'JST egyetemi technológiabörze' },
      { nev: 'Science Agora', tipus: 'konferencia', idopont: 'október–november, Tokió (Odaiba)', megjegyzes: 'JST tudomány–társadalom fórum' },
      { nev: 'Japan Mobility Show', tipus: 'szakkiallitas', idopont: 'kétévente október–november, Tokyo Big Sight', megjegyzes: 'Következő: 2027' },
    ]),
    kapcsolatok: {
      euMultilateralis:
        'EU–Japán tudományos és technológiai együttműködési megállapodás (2011) és Digitális Partnerség (2022); '
        + 'Horizont Európa társult tagság tárgyalás alatt; OECD CSTP aktív részvétel; G7 tudományos miniszteri folyamat; ITER és Broader Approach.',
      partnerorszagok:
        'USA (félvezető, kvantum, MI – 2023-as közös nyilatkozatok), EU (Horizont Európa, zöld átállás), Egyesült Királyság (Hiroshima Accord), '
        + 'Németország (Ipar 4.0, hidrogén), India és Ausztrália (Quad kritikus technológiák), Dél-Korea (ellátási láncok).',
      egyezmeny: 'Magyar–japán tudományos és technológiai együttműködési egyezmény (1988)',
      ketoldalu:
        'NKFIH–JSPS kétoldalú kutatócsere-program és közös pályázat; HUN-REN–RIKEN és HUN-REN–AIST kapcsolatok; '
        + 'BME és ELTE megállapodásai a Tokiói Egyetemmel és a Tohoku Egyetemmel; a Suzuki (Esztergom) és a Bridgestone (Tatabánya) magyar K+F-hátterű telephelyei; '
        + 'magyar–japán TéT vegyes bizottság.',
      mobilitas:
        'MEXT (Monbukagakusho) ösztöndíj magyar hallgatóknak; JSPS posztdoktori ösztöndíjak; Stipendium Hungaricum japán kvóta; '
        + 'Sakura Science Program középiskolásoknak és fiatal kutatóknak; Erasmus+ nemzetközi kreditmobilitás (Waseda, Keio, Tohoku).',
    },
    magyarErtekeles: {
      osszegzes:
        'Japán az egyik legnagyobb K+F-költő, stabil alapkutatás-finanszírozással és nagy infrastruktúrákkal; a magyar–japán kapcsolatok '
        + 'hagyományosak (1988-as egyezmény, JSPS-csere), a következő lépés az anyagtudomány, a kvantum és a zöld hidrogén területén közös projektek indítása.',
      egyuttmukodesiLehetosegek:
        'Anyagtudomány és félvezető-alapanyagok (NIMS – HUN-REN EK, BME); kvantumtechnológia (RIKEN – Wigner); '
        + 'hidrogén és energiatárolás (NEDO programok magyar partnerekkel); egészségipar és elöregedő társadalom kutatása (AMED); '
        + 'a Horizont Európa japán társulása után közös konzorciumok.',
      joGyakorlatok:
        'KAKENHI: kiszámítható, többéves, kutatói kezdeményezésű alapkutatás-finanszírozás; WPI nemzetközi kiválósági központok; '
        + 'Moonshot – hosszú távú, missziós célok programmenedzserekkel; Sakura Science – korai, célzott tehetségvonzás.',
      diplomaciaiPrioritasok:
        'A TéT vegyes bizottság ülésének megszervezése; közös NKFIH–JSPS felhívás bővítése; magyar kutatóintézetek bekapcsolása a Moonshot és a WPI hálózatba; '
        + 'a japán vállalatok magyarországi K+F-tevékenységének ösztönzése.',
    },
  },
};

function urlapFormData(u: Urlap): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(u)) {
    if (Array.isArray(v)) v.forEach((x) => fd.append(k, x));
    else fd.append(k, v);
  }
  return fd;
}

function main() {
  const ev = aktualisEv();
  for (const o of [KR, JP]) {
    const u = db.select({ id: user.id, orszag: user.orszag, name: user.name }).from(user).where(eq(user.email, o.email)).get();
    if (!u) throw new Error(`Nincs ilyen felhasználó: ${o.email}`);
    if (!u.orszag) throw new Error(`${o.email}: nincs ország a felhasználón`);

    db.update(user).set({ ...o.poszt, updatedAt: new Date() }).where(eq(user.id, u.id)).run();

    for (const blokk of BLOKK_KULCSOK) {
      const eredmeny = validalBlokk(blokk, urlapFormData(o.profil[blokk]), ev);
      if (!eredmeny.ok) {
        throw new Error(`${u.orszag} ${ev} ${blokk}: ${JSON.stringify(eredmeny.errors)}`);
      }
      upsertBlokk(u.orszag, ev, blokk, eredmeny.ertek, u.id);
    }
    console.log(`${u.name} (${u.orszag}): poszt-adatok + ${BLOKK_KULCSOK.length} blokk mentve ${ev}-ra`);
  }
}

main();
