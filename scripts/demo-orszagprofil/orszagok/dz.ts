/**
 * Algéria (DZ) 2026-os profilja – kutatott vázlat, a relációs vezető pontosítja.
 * Források (hozzáférés: 2026-10-09, a [2026-10-12] jelölésűeké 2026-10-12):
 * - Alapadatok: IMF World Economic Outlook, 2025. október (IMF Data, WEO_2025_OCT_VINTAGE adatfolyam) –
 *   https://data.imf.org/Datasets/WEO ; lekérdezés:
 *   https://api.imf.org/external/sdmx/2.1/data/IMF.RES,WEO_2025_OCT_VINTAGE,1.0.0/DZA.NGDPD+NGDPDPC+NGDP_RPCH+LP.A?startPeriod=2025&endPeriod=2025
 *   (GDP 288,013 Mrd USD; GDP/fő 6095,322 USD; reálnövekedés 3,357%; lakosság 47,251 millió – 2025, becslés).
 * - Terület: CIA World Factbook (2026. január 21-i állapot: 2 381 740 km²) – https://www.cia.gov/the-world-factbook/countries/algeria/
 *   (a Factbook 2026-ban megszűnt; archív: web.archive.org, 2026-01-30-i page-data.json); Világbank AG.SRF.TOTL.K2 ugyanennyi.
 * - GII 2025 (115. hely; 2024: 115.; felső-közepes jövedelműek közt 35. a 36-ból; erősségek, gyengeségek; vállalati K+F 2017):
 *   https://www.wipo.int/edocs/gii-ranking/2025/dz.pdf
 * - GERD: UNESCO UIS, 2024: 0,4440% (2023: 0,3779%; 2017: 0,4787%) –
 *   https://api.uis.unesco.org/api/public/data/indicators?indicator=EXPGDP.TOT&geoUnit=DZA ; Világbank GB.XPD.RSDV.GD.ZS ugyanez.
 * - Stratégia, jogi keret: 15-21. sz. törvény (2015) – https://www.joradp.dz/FTP/JO-FRANCAIS/2015/F2015071.pdf ; módosítás (20-02., 2020) –
 *   https://www.cnrst.dz/laws ; nemzeti kutatási programok – https://www.dgrsdt.dz/fr/pnr ; MI-stratégia végrehajtása (2026) –
 *   https://www.mesrs.dz/2026/09/premiere-reunion-de-coordination-consacree-a-la-mise-en-oeuvre-de-la-strategie-nationale-de-lintelligence-artificielle/ ;
 *   első MI-ház (2023) – https://www.mesrs.dz/2023/02/innoguration-maison-ia-alger1-ar/
 * - Intézmények: DGRSDT – https://www.dgrsdt.dz/en/oragnes_recherches , https://www.dgrsdt.dz/en/etab_intermediation ,
 *   https://www.dgrsdt.dz/en/entite_recherche , https://www.dgrsdt.dz/fr ; CNRST – https://www.cnrst.dz/ ; felsőoktatási adatok 2024/25 –
 *   https://www.mesrs.dz/index.php/fr/agregats-2024-2025-3/ ; intézményhálózat – https://www.mesrs.dz/index.php/reseau-universitaire/ ;
 *   USTHB – https://www.usthb.dz/ ; Alger 1 – https://www.univ-alger.dz/ ; ENSIA – https://www.ensia.edu.dz/school/ ;
 *   alkalmazott matematikai kutatóközpont – https://www.mesrs.dz/2025/12/inaugure-le-centre-de-recherche-en-mathematiques-appliquees/ ;
 *   CDER – https://www.cder.dz/spip.php?rubrique34 ; CDTA – https://www.cdta.dz/ ; CERIST – https://www.cerist.dz/index.php/fr/index.html ;
 *   CRAPC – https://www.crapc.dz/ ; CRBt – https://www.crbt.dz/ ; CRSTRA – https://www.crstra.dz/ ; CREAD – https://www.cread.dz/ ;
 *   COMENA – https://www.comena.dz/fr/post-2615/ , https://www.comena.dz/fr/post-2625/ ; ASAL – https://asal.dz/?page_id=50 ,
 *   https://asal.dz/?p=13542 , https://asal.dz/?page_id=72 , https://asal.dz/?page_id=1347 , https://asal.dz/?page_id=64 ;
 *   Alsat-3A (2026. 01. 15.; másodlagos forrás) – https://spaceinafrica.com/2026/01/15/algeria-launches-its-next-generation-earth-observation-satellite-alsat-3a/ ;
 *   ANPT – https://www.anpt.dz/ ; INAPI – https://www.inapi.dz/history
 * - Vállalati: Sonatrach – https://sonatrach.com/fr/recherche-et-developpement/ ; Sonelgaz – https://www.sonelgaz.dz/ ;
 *   Saidal – https://www.saidalgroup.dz/ ; Cevital – https://www.cevital.com/ ; Condor – https://www.condor.dz/ ;
 *   startup-címke (20-254. sz. rendelet) – https://www.joradp.dz/FTP/JO-FRANCAIS/2020/F2020055.pdf , https://startup.dz/ ;
 *   Algeria Startup Fund – https://asf.dz/ ; az Algíri 3. Egyetem kockázatitőke-alapja (a COSOB 2026. szeptember 29-én
 *   hagyta jóvá) – https://www.mesrs.dz/2026/10/creation-du-fonds-universitaire-pour-linnovation-et-les-startups/ , https://algerie-eco.com/?p=328807 [2026-10-12] ;
 *   Yassir – https://yassir.com/about-us/
 * - Rendezvények: https://www.algeriaexhibitions.dz/calendrier/export/pdf?year=2026 ; NAPEC – https://www.cder.dz/spip.php?article6515 ;
 *   Kahraba Expo első kiadása (2025. 11. 17–19.) –
 *   https://www.energy.gov.dz/en/2073/minister-of-energy-and-renewable-energies-presides-over-the-official-opening-of-the-first-edition-of-the-international-electricity-and-renewable-energy-fair [2026-10-12]
 * - EU és multilaterális: EU–Algéria TéT-megállapodás és vegyes bizottság –
 *   https://research-and-innovation.ec.europa.eu/strategy/strategy-research-and-innovation/europe-world/international-cooperation/bilateral-cooperation-science-and-technology-agreements-non-eu-countries/algeria_en ;
 *   PRIMA – https://research-and-innovation.ec.europa.eu/news/all-research-and-innovation-news/eu-and-algeria-conclude-prima-negotiations-2026-03-11_en ,
 *   https://prima-med.org/participating-states/ ; EU–Algéria kapcsolatok – https://www.eeas.europa.eu/algeria/european-union-and-algeria_en ;
 *   földgázimport 2025 (gáznemű földgáz: Norvégia 52,1%, Algéria 17,4%, Oroszország 10,4%) –
 *   https://ec.europa.eu/eurostat/web/products-eurostat-news/w/ddn-20260325-3 [2026-10-12] ;
 *   Horizont Európa (automatikusan finanszírozható) –
 *   https://ec.europa.eu/info/funding-tenders/opportunities/docs/2021-2027/common/guidance/list-3rd-country-participation_horizon-euratom_en.pdf ;
 *   PHC Tassili+ – https://www.campusfrance.org/fr/tassili ; Afrikai Unió – https://au.int/en/member_states/countryprofiles2 ;
 *   algériai–mauritániai felsőoktatási program – https://www.mesrs.gov.mr/en/article/27
 * - Magyar vonatkozás:
 *   gazdasági együttműködési megállapodás (Algír, 2012. 03. 06.; 221/2012. Korm. rendelet; hatályos 2014. 11. 12-től; gazdasági, tudományos
 *   és műszaki vegyes bizottság) – https://njt.jog.gov.hu/jogszabaly/2012-221-20-22 ; érvényes megállapodások (1965-ös kulturális és
 *   tudományos egyezmény, a 2014–2016-os időtartamú oktatási és tudományos megállapodás, NAIK-megállapodások, 2020-as SH-, szakképzési és levéltári
 *   megállapodás, 2021-es vízügyi szándéknyilatkozat), vegyes bizottsági ülések (2015, 2017), miniszteri látogatás (2020), agrárkutatás,
 *   SZTE Frankofón Egyetemi Központ – https://algir.mfa.gov.hu/hu/ketoldalu-kapcsolatok ; Stipendium Hungaricum (mester és doktori) –
 *   https://stipendiumhungaricum.hu/partners/
 * Kimaradt blokkok és mezők: nincs. Nem ellenőrizhető, ezért kimaradt: az MI-stratégia elfogadásának dátuma és időtávja, a gyógyszeripari
 * önellátás aránya, a minősített startupok országos száma, az Algeria Startup Fund tőkéje, a Nemzeti Kutatási Alap (FNRSDT) adatai,
 * a magyar–algériai vegyes bizottság 2017 utáni ülései, a Stipendium Hungaricum algériai kerete. Az algíri nagykövetség kétoldalú
 * kapcsolatokról szóló oldalán a legutóbbi említett esemény 2022-es.
 */
import { rendezvenyek, type DemoOrszag } from '../tipusok';

const orszag: DemoOrszag = {
  kod: 'DZ',
  profil: {
    alapadatok: {
      fovaros: 'Algír',
      terulet: '2 381 740',
      penznem: 'algériai dinár (DZD)',
      lakossag: '47 251 000',
      gdp: '288,0',
      gdpEgyFore: '6 095',
      gdpNovekedes: '3,4',
      adatEv: '2025',
      forras: 'IMF World Economic Outlook (2025. október); terület: CIA World Factbook (archív)',
      tagsagok: ['Afrikai Unió', 'Arab Liga'],
      tagsagEgyeb: 'OPEC, Gázexportáló Országok Fóruma, Iszlám Együttműködési Szervezet, Arab Maghreb Unió; EU-társulási megállapodás (2005)',
      agazatok: [
        'Energetika és fenntarthatóság', 'Bányászat és nyersanyagok', 'Agrár- és élelmiszeripar', 'Biotechnológia és gyógyszeripar',
        'Építőipar',
      ],
      agazatEgyeb: 'Kőolaj- és földgázipar, petrolkémia, háztartási elektronika',
    },
    kfiRendszer: {
      teljesitmeny:
        'A Global Innovation Index 2025-ben a 115. hely (2024-ben is), a felső-közepes jövedelmű országok között a 35. a 36-ból; a WIPO szerint '
        + 'fejlettségi szintje alatt teljesít. Erősségei: a beruházási ráta (10.), a természettudományi és mérnöki diplomások aránya (15.) és az oktatási '
        + 'ráfordítás (22.). A K+F-ráfordítás a GDP 0,44%-a (2024, UNESCO UIS).',
      gerd: '0,44',
      strategia: 'A kutatásról és technológiai fejlesztésről szóló 15-21. sz. orientációs törvény (2015, módosítva 2020); nemzeti MI-stratégia (végrehajtás 2026-tól)',
      prioritasok: [
        'Energiabiztonság', 'Egészség és élettudomány', 'Digitalizáció és MI', 'Technológiai szuverenitás',
        'Startup és vállalkozói ökoszisztéma', 'Zöld átállás és klímasemlegesség',
      ],
      prioritasEgyeb: 'Élelmiszer-biztonság, „a polgár egészsége” (a nemzeti kutatási programok kiemelt területei)',
      kiemeltIparagak: [
        'Energetika és fenntarthatóság', 'Mesterséges intelligencia és adatgazdaság', 'Agrár- és élelmiszeripar',
        'Biotechnológia és gyógyszeripar', 'Űripar',
      ],
      iparagEgyeb: 'Szénhidrogén-ipari K+F (Sonatrach), megújuló energia és zöld hidrogén (CDER), száraz területek kutatása (CRSTRA)',
      erossegek:
        'Nagy, bővülő felsőoktatás (2024/25: 117 intézmény, 1,53 millió hallgató, 1851 kutatólaboratórium); saját űrprogram (ASAL; Alsat- és '
        + 'Alcomsat-műholdak); 32 állami kutatóközpont; erős állami energetikai vállalatok (Sonatrach, Sonelgaz).',
      kihivasok:
        'A GII 2025-ben minden pillérben elmarad jövedelmi csoportja átlagától; kiemelten gyenge a szoftverráfordítás '
        + '(137.). A vállalati K+F csekély (2017-ben a GDP 0,04%-a; a ráfordítás mintegy 7%-át finanszírozták cégek), a gazdaság erősen a szénhidrogénekre épül.',
    },
    intezmenyek: {
      iranyitoSzervek:
        'Felsőoktatási és Tudományos Kutatási Minisztérium (MESRS) – kutatáspolitika, MI-stratégia.\n'
        + 'DGRSDT – a kutatás állandó nemzeti irányító szerve, nemzeti kutatási programok; mellette három tematikus kutatási ügynökség.\n'
        + 'CNRST – alkotmányos tanácsadó testület a köztársasági elnök mellett.\n'
        + 'Tudásgazdasági, Startup- és Mikrovállalkozási Minisztérium – startup-címke, Algeria Startup Fund.\n'
        + 'ASAL (űrügynökség), COMENA (atomenergia), INAPI (iparjogvédelem).',
      egyetemek:
        'USTHB (Algír), Université d’Alger 1, Université Sétif 1, Université Constantine 1, Université d’Oran 1, USTO-MB (Oran), Université de Tlemcen, '
        + 'École Nationale Polytechnique; új nemzeti felsőfokú iskolák: mesterséges intelligencia (ENSIA), matematika, kiberbiztonság, nanotudomány.',
      kutatokozpontok:
        'CDER (megújuló energiák, hidrogén), CDTA (fejlett technológiák), CERIST (tudományos információ), CRAPC (fizikai-kémiai '
        + 'analitika), CRBt (biotechnológia, Constantine), CRSTRA (száraz területek, Biskra), CREAD (fejlesztésgazdaságtan), alkalmazott matematikai '
        + 'kutatóközpont (2025); a COMENA nukleáris kutatóközpontjai.',
      infrastrukturak:
        'NUR (Draria) és Es-Salam (Birine) kutatóreaktor; Alsat földmegfigyelő műholdak (Alsat-2B 2016-tól, 2,5 m-es felbontás; Alsat-3A 2026-tól) '
        + 'és az Alcomsat-1 távközlési műhold (2017); ARN kutatási hálózat (CERIST).',
    },
    vallalati: {
      kiemeltAgazatok: [
        'Energetika és fenntarthatóság', 'Biotechnológia és gyógyszeripar', 'Agrár- és élelmiszeripar', 'IKT és digitalizáció', 'Űripar',
      ],
      agazatEgyeb: 'Szénhidrogén-ipar és petrolkémia, háztartási elektronika',
      topVallalatok: ['Sonatrach', 'Sonelgaz', 'Saidal', 'Cevital', 'Condor Electronics', 'Algérie Télécom', 'Yassir'].join('\n'),
      startupok:
        'A 2020-as startup-címke (20-254. sz. rendelet: legfeljebb 8 éves, 250 fős cégeknek) mellett innovatívprojekt-, inkubátor- és scale-up-minősítés '
        + 'is létezik. Az Algeria Startup Fund (2020, hat állami bank) projektenként legfeljebb 150 millió dinárt fektet be. '
        + 'Ismert startup a Yassir szuperapp.',
      klaszterek:
        'A Sidi Abdellah-i tudományos és technológiai pólus (ANPT-technopark, ENSIA, kutatóközpontok); az ANPT 7 technoparkot és inkubátort működtet '
        + '800-nál több projekttel; a felsőoktatásban 134 inkubátor és 63 fablab működik (DGRSDT).',
      technologiatranszfer:
        'A DGRSDT eszközei: társadalmi-gazdasági hatású projektek (PISE), gazdasági szereplőkkel közös innovatív partnerségi projektek és vegyes '
        + 'csapatok; a kutatóhelyek leányvállalatai; vállalati példa a Saidal–USTHB partnerség.',
    },
    programok: {
      palyazatok:
        'Nemzeti kutatási programok (PNR): energiabiztonság, élelmiszer-biztonság, egészség; a DGRSDT szerint 421 társadalmi-gazdasági hatású '
        + '(PISE), 133 tematikus és 76 innovatív partnerségi projekt.',
      tamogatasiProgramok:
        'A nemzeti MI-stratégia végrehajtása (2026-tól): öt tematikus bizottság, nemzeti MI- és adatkutató központ (tervezett), 2030-ra 50 ezer MI-szakember; '
        + '20 kiválósági („TAMAYOUZ”) laboratórium; MI-házak az egyetemeken (az első 2023-ban).',
      finanszirozasiEszkozok: 'Algeria Startup Fund (állami kockázatitőke-társaság); az Algíri 3. Egyetem kockázatitőke-alapja (a tőzsdefelügyelet, a COSOB jóváhagyása: 2026. szeptember).',
      nemzetkoziReszvetel:
        'Horizont Európa: nem társult, de automatikusan finanszírozható ország; PRIMA: a 269 támogatott projektből 99-ben vett részt, a 2025–2027-es '
        + 'részvételről a tárgyalások 2026 márciusában lezárultak (parafálva, hatálybalépés előtt); PHC Tassili+ Franciaországgal (legutóbbi közzétett felhívás: 2025-ös programév).',
    },
    rendezvenyek: rendezvenyek([
      { nev: 'Foire Internationale d’Alger (FIA)', tipus: 'szakkiallitas', idopont: 'június, Algír (Pins Maritimes vásárközpont)', megjegyzes: 'Általános nemzetközi vásár; 2026: június 22–27.' },
      { nev: 'NAPEC', tipus: 'szakkiallitas', idopont: 'október, Oran', megjegyzes: 'Energetikai és hidrogénipari kiállítás és konferencia; 2026: október 5–7. (14. kiadás)' },
      { nev: 'SIPHAL', tipus: 'szakkiallitas', idopont: 'február, Algír', megjegyzes: 'Gyógyszeripar; 2026: február 4–7.' },
      { nev: 'Djazagro', tipus: 'szakkiallitas', idopont: 'április, Algír', megjegyzes: 'Élelmiszeripari technológiák; 2026: április 12–15.' },
      { nev: 'ICT Africa Summit', tipus: 'konferencia', idopont: 'április, Algír', megjegyzes: 'Infokommunikáció; 2026: április 21–23.' },
      { nev: 'SIPSA-Filaha', tipus: 'szakkiallitas', idopont: 'május, Algír', megjegyzes: 'Mezőgazdaság és állattenyésztés; 2026: május 18–21.' },
      { nev: 'Kahraba Expo', tipus: 'szakkiallitas', idopont: 'ősz, Algír', megjegyzes: 'Villamos energia és megújuló energia; 2025-ben indult (1. kiadás: 2025. november 17–19.); 2026: október 13–15.' },
    ]),
    kapcsolatok: {
      euMultilateralis:
        'EU–Algéria társulási megállapodás (hatályos 2005) és tudományos-technológiai megállapodás (2012; 5. vegyes bizottsági ülés: 2023); '
        + 'energetikai stratégiai partnerség 2015 óta – Algéria 2025-ben az EU második legnagyobb vezetékesföldgáz-szállítója. Az Afrikai Unió alapító tagja, '
        + 'az Arab Liga és az OPEC tagja.',
      partnerorszagok:
        'Franciaország (PHC Tassili+; űrügyi megállapodás a CNES-szel), Kína (Alsat-3A, Alcomsat-1), India (az Alsat-2B indítása), Argentína és Ukrajna '
        + '(űrügyi megállapodások), Oroszország, Németország, Egyesült Királyság (űrügyi memorandumok), Mauritánia (felsőoktatási program).',
      egyezmeny: 'Magyar–algériai egyezmény a kulturális és tudományos együttműködésről (1965)',
      ketoldalu:
        'A 2012-es, 2014-től hatályos gazdasági együttműködési megállapodás vegyes bizottsága a tudományos-műszaki együttműködést is lefedi '
        + '(ismert ülései: 2015, 2017). A NAIK 2016–2017-ben három algériai agrár-, erdészeti és halászati kutatóintézettel kötött megállapodást; '
        + '2020-ban SH-, szakképzési és levéltári megállapodás, 2021-ben vízügyi szándéknyilatkozat született.',
      mobilitas:
        'Stipendium Hungaricum: Algéria partnerország (mester- és doktori képzés; megállapodás 2020); a nagykövetség honlapja szerint (az oldalon '
        + 'említett legutóbbi esemény 2022-es) kiemelten népszerűsítették az SZTE Frankofón Egyetemi Központjának afrikai hallgatóknak szóló mesterképzéseit.',
    },
    magyarErtekeles: {
      osszegzes:
        'Algéria nagy piacú energiaexportőr, gyengén teljesítő, de bővülő KFI-rendszerrel (GII 2025: 115.). A magyar–algériai tudományos kapcsolatok '
        + 'régiek (1965-ös egyezmény), a legtöbb eredményt az agrárkutatás hozta; építkezni a Stipendium Hungaricumra és a vegyes bizottságra lehet.',
      egyuttmukodesiLehetosegek:
        'Agrár- és erdészeti kutatás (elsivatagosodás, klímaváltozás), gabonanemesítés, halászat és akvakultúra; vízgazdálkodás; megújuló energia '
        + 'és zöld hidrogén (CDER); gyógyszeripar és biotechnológia (Saidal, CRBt); MI-képzés; közös PRIMA- és Horizont Európa-pályázatok.',
      joGyakorlatok:
        'Startup-címke és állami startup-alap (Algeria Startup Fund) egy rendszerben; egyetemi inkubátorok és fablabok országos hálózata; '
        + 'tematikus nemzeti felsőfokú iskolák (MI, matematika, kiberbiztonság, nanotudomány) a stratégiai területek szakemberképzésére.',
      diplomaciaiPrioritasok:
        'A vegyes bizottság rendszeres ülésezésének szorgalmazása tudományos munkacsoporttal; új oktatási és tudományos munkaterv; '
        + 'az agrárkutatási együttműködés folytatása; magyar partnerek bevonása algériai PRIMA- és Horizont Európa-projektekbe.',
    },
  },
};

export default orszag;
