/**
 * Guyana (GY) 2026-os profilja – kutatott vázlat, a relációs vezető pontosítja. Részleges profil.
 * Források (hozzáférés: 2026-10-09):
 * - Alapadatok: IMF World Economic Outlook, 2025. október (az IMF Data „WEO 2025 October” vintage-adatfolyama) –
 *   https://www.imf.org/en/publications/weo/issues/2025/10/14/world-economic-outlook-october-2025
 *   https://api.imf.org/external/sdmx/2.1/data/IMF.RES,WEO_2025_OCT_VINTAGE,1.0.0/GUY.NGDPD+NGDPDPC+NGDP_RPCH+LP.A
 *   (2025: GDP 25,064 Mrd USD; GDP/fő 31 377,593 USD; reálnövekedés 10,316%; lakosság 0,799 millió fő; 2024: reálnövekedés 43,569%)
 * - Terület: Világbank (FAO), 214 970 km² – https://data.worldbank.org/indicator/AG.SRF.TOTL.K2?locations=GY
 *   (a CIA World Factbook 2026 februárjában megszűnt)
 * - Mercosur társult állam (2013 óta) – https://www.gub.uy/ministerio-relaciones-exteriores/comunicacion/publicaciones/mercosur ;
 *   https://www.argentina.gob.ar/normativa/nacional/norma-220006/texto
 * - GII 2025: Guyana nem szerepel a rangsorban (gazdaságprofilja sincs) – https://www.wipo.int/global_innovation_index/en/
 * - GERD: az UNESCO UIS és a Világbank (GB.XPD.RSDV.GD.ZS) nem közöl adatot –
 *   https://api.uis.unesco.org/api/public/data/indicators?indicator=EXPGDP.TOT&geoUnit=GUY
 * - Tudomány- és technológiapolitika: a National Science and Technology Policy jóváhagyását 2013 decemberében jelentették be –
 *   https://caribbeanscience.org/?p=1484 ; a National Science, Technology and Innovation Policy háromnapos végrehajtási workshopját
 *   2015. március 30-án az Oktatási Minisztérium nyitotta meg UNESCO-támogatással, a résztvevők között a Nemzeti Tudományos, Technológiai
 *   és Innovációs Tanács tagjaival – https://www.stabroeknews.com/?p=328654 ; a politika hatályos változata nem ismert.
 * - Fejlesztési keret: Low Carbon Development Strategy 2030 (pillérek, erdők, ART TREES, kreditbevétel, árvízvédelem) – https://lcds.gov.gy/
 * - Intézmények: https://www.uog.edu.gy/ ; https://iast.gov.gy/ ; https://narei.org.gy/ ; https://iwokrama.org/
 * - Olajszektor (első olaj 2019. december, Stabroek és Canje, 30+ felfedezés, 900 ezer hordó/nap 2025. november) –
 *   https://corporate.exxonmobil.com/locations/guyana
 * - Az ExxonMobil 10 éves, 100 millió USD-s STEM-oktatási kezdeményezése (bejelentve 2026 februárjában) –
 *   https://corporate.exxonmobil.com/locations/guyana/guyana-newsroom/2026/the-pipeline-that-matters-most-for-guyanas-future
 *   https://oilnow.gy/featured/heres-everything-you-need-to-know-about-exxonmobils-us100m-10-year-guyana-stem-initiative/
 * - Rendezvény: Guyana Energy Conference and Supply Chain Expo (évente; 2026. február 17–20., Guyana Marriott) –
 *   https://www.iss-shipping.com/events/guyana-energy-conference-and-supply-chain-expo-2/
 * - Magyar vonatkozás: Guyana nem Stipendium Hungaricum-partnerország – https://stipendiumhungaricum.hu/partners/ ;
 *   a São Pauló-i TéT-szakdiplomata NKFIH-beszámolói Guyanát nem említik.
 * Kimaradt blokkok és mezők: vallalati és programok (nincs forrással alátámasztott tartalom); kfiRendszer.gerd (nincs adat);
 * intezmenyek.infrastrukturak (kutatási infrastruktúra nem ismert); kapcsolatok.euMultilateralis (az egyetlen ide illő tény, az ART TREES-
 * kreditértékesítés, a kfiRendszer.erossegek mezőben szerepel), .egyezmeny és .ketoldalu (kétoldalú TéT-megállapodás vagy -program nem ismert).
 */
import { rendezvenyek, type DemoOrszag } from '../tipusok';

const orszag: DemoOrszag = {
  kod: 'GY',
  profil: {
    alapadatok: {
      fovaros: 'Georgetown',
      terulet: '214 970',
      penznem: 'guyanai dollár (GYD)',
      lakossag: '799 000',
      gdp: '25,1',
      gdpEgyFore: '31 378',
      gdpNovekedes: '10,3',
      adatEv: '2025',
      forras: 'IMF World Economic Outlook (2025. október), Világbank (terület: FAO)',
      tagsagok: ['Nemzetközösség'],
      tagsagEgyeb: 'CARICOM (titkárság: Georgetown), OAS, Iszlám Együttműködési Szervezet (OIC), Amazóniai Együttműködési Szerződés Szervezete (ACTO), ENSZ; Mercosur társult állam (2013 óta)',
      agazatok: ['Energetika és fenntarthatóság', 'Bányászat és nyersanyagok', 'Agrár- és élelmiszeripar'],
      agazatEgyeb: 'Offshore kőolaj-kitermelés (Stabroek-blokk, 2019 óta), aranybányászat, cukor- és rizstermelés, erdőgazdálkodás',
    },
    kfiRendszer: {
      teljesitmeny:
        'Guyana nem szerepel a GII 2025-ben vizsgált 139 gazdaság között, GDP-arányos K+F-ráfordításáról az UNESCO UIS és a Világbank nem közöl adatot. '
        + 'Az offshore kőolaj-kitermelés 2019. decemberi indulása óta a gazdaság rendkívül gyorsan nő: az IMF szerint a reálnövekedés 2024-ben 43,6% volt, 2025-re 10,3%; '
        + 'a Stabroek-blokk napi kitermelése 2025 novemberében elérte a 900 ezer hordót.',
      gerd: '',
      strategia: 'Nemzeti tudomány- és technológiapolitika (National Science and Technology Policy, 2013); hatályos változata nem ismert; fejlesztési keret: LCDS 2030',
      prioritasok: ['Zöld átállás és klímasemlegesség'],
      prioritasEgyeb: 'Erdei klímaszolgáltatások (szén-dioxid-kreditek), biodiverzitás, alkalmazkodás és árvízvédelem, tiszta energia, kék gazdaság, digitális infrastruktúra (LCDS 2030)',
      kiemeltIparagak: ['Energetika és fenntarthatóság', 'Agrár- és élelmiszeripar'],
      iparagEgyeb: 'Erdei szén-dioxid-kreditek, bioprospektálás és bioenergia, tengeri és folyami ökológia',
      erossegek:
        'Az olajbevételek gyorsan bővülő fejlesztési forrást adnak. Mintegy 18 millió hektár erdő, az erdőirtás üteme a globális átlagnál 90%-kal alacsonyabb; '
        + 'Guyana kapott elsőként ART TREES-tanúsítást országos szintű (jurisdictional) erdei szén-dioxid-kreditekre (első kereskedelmi értékesítéséből 2024 januárjáig '
        + '187,5 millió USD bevétel); nemzetközi esőerdő-kutatási központ (Iwokrama).',
      kihivasok:
        'Nincs nemzetközileg összevethető K+F- és innovációs statisztika; a növekedés döntően az offshore kőolajra épül. '
        + 'Szűk az intézményi bázis: a kutatás néhány állami intézetben (IAST, NAREI) és a University of Guyanán folyik. '
        + 'Jelentős az éghajlatváltozás és az áradások kockázata: az LCDS keretében 2023-ban több mint 94 millió USD jutott árvízvédelmi alkalmazkodásra.',
    },
    intezmenyek: {
      iranyitoSzervek:
        'Oktatási Minisztérium (Ministry of Education) – 2015-ben ez indította el (UNESCO-támogatással) a nemzeti tudományos, technológiai és innovációs politika végrehajtását.\n'
        + 'Nemzeti Tudományos, Technológiai és Innovációs Tanács (National Science, Technology and Innovation Council) – tagjai 2015-ben a végrehajtási workshop résztvevői között voltak; '
        + 'jelenlegi működése nem ismert.',
      egyetemek:
        'University of Guyana (Turkeyen és Berbice/Tain campus) – kutatási, innovációs és vállalkozói intézettel (Institute of Research, Innovation and Entrepreneurship), '
        + 'tengeri és folyami ökológiai és gazdasági intézettel (IMAREE), vállalkozói és üzleti innovációs iskolával (SEBI) és posztgraduális iskolával; fejlesztési terve a Blueprint 2040.',
      kutatokozpontok:
        'Institute of Applied Science and Technology (IAST, 1977, a University of Guyana Turkeyen campusán – bioenergia, bioprospektálás, hazai alapanyagok, élelmiszer és takarmány, analitika); '
        + 'National Agricultural Research and Extension Institute (NAREI, 2010, elődje 1984-től – vetőmag-technológia, növényi biotechnológia, növényvédelem, talajgazdálkodás, '
        + 'klímarezilient mezőgazdaság, mangrove-helyreállítás); Iwokrama International Centre for Rain Forest Conservation and Development '
        + '(a trópusi erdők fenntartható kezelésének és a biodiverzitás megőrzésének kutatása).',
      infrastrukturak: '',
    },
    rendezvenyek: rendezvenyek([
      { nev: 'Guyana Energy Conference and Supply Chain Expo', tipus: 'konferencia', idopont: 'február, Georgetown (Guyana Marriott)', megjegyzes: 'Évente; energetikai és ellátásilánc-konferencia kiállítással; 2026: február 17–20.' },
    ]),
    kapcsolatok: {
      euMultilateralis: '',
      partnerorszagok:
        'USA (az ExxonMobil üzemelteti az offshore Stabroek- és Canje-blokkot, 2015 óta több mint 30 jelentős felfedezéssel, és 2026-ban 10 éves, 100 millió USD-s '
        + 'STEM-oktatási kezdeményezést indított); '
        + 'Brazília (szomszédos amazóniai partner az ACTO-ban); a CARICOM-tagállamok; Kína (Konfuciusz Intézet a University of Guyanán).',
      egyezmeny: '',
      ketoldalu: '',
      mobilitas: 'Guyana nem szerepel a Stipendium Hungaricum partnerországai között (2026).',
    },
    magyarErtekeles: {
      osszegzes:
        'Guyana kis népességű, az olajkitermelés nyomán rendkívül gyorsan növekvő gazdaság; KFI-rendszere szűk, nemzetközileg összevethető K+F-adata nincs. '
        + 'Magyar szempontból az agrárkutatás, a víz- és árvízvédelem, az erdő- és biodiverzitás-kutatás, valamint az energetikai képzés lehet kapcsolódási pont; '
        + 'a kapcsolatépítés a São Pauló-i TéT-szakdiplomata regionális feladata.',
      egyuttmukodesiLehetosegek:
        'Agrárkutatás és klímarezilient mezőgazdaság (NAREI); víz- és árvízvédelmi technológiák; erdészeti, biodiverzitás- és vízi ökológiai kutatás (Iwokrama, IMAREE); '
        + 'bioprospektálás és bioenergia (IAST); a University of Guyana kutatási és vállalkozói intézetei; energetikai és mérnöki képzés.',
      joGyakorlatok: 'Az LCDS-modell, amely az erdők megőrzését nemzetközi szén-dioxid-kredit-bevételekből finanszírozza.',
      diplomaciaiPrioritasok:
        'Kapcsolatfelvétel a University of Guyanával, a NAREI-vel és az IAST-tal; a Stipendium Hungaricum-partnerség lehetőségének vizsgálata; '
        + 'a magyar energetikai és víztechnológiai megoldások bemutatása, például a guyanai energetikai konferencián.',
    },
  },
};

export default orszag;
