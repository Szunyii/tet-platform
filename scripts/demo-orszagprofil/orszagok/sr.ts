/**
 * Suriname (SR) 2026-os profilja – kutatott vázlat, a relációs vezető pontosítja. Részleges profil.
 * Források (hozzáférés: 2026-10-09):
 * - Alapadatok: IMF World Economic Outlook, 2025. október (az IMF Data „WEO 2025 October” vintage-adatfolyama) –
 *   https://www.imf.org/en/publications/weo/issues/2025/10/14/world-economic-outlook-october-2025
 *   https://api.imf.org/external/sdmx/2.1/data/IMF.RES,WEO_2025_OCT_VINTAGE,1.0.0/SUR.NGDPD+NGDPDPC+NGDP_RPCH+LP.A
 *   (2025: GDP 4,496 Mrd USD; GDP/fő 6 843,471 USD; reálnövekedés 2,734%; lakosság 0,657 millió fő)
 * - Terület: Világbank (FAO), 163 820 km² – https://data.worldbank.org/indicator/AG.SRF.TOTL.K2?locations=SR
 *   (a CIA World Factbook 2026 februárjában megszűnt)
 * - Mercosur társult állam (2013 óta) – https://www.gub.uy/ministerio-relaciones-exteriores/comunicacion/publicaciones/mercosur
 * - GII 2025: Suriname nem szerepel a rangsorban (gazdaságprofilja sincs) – https://www.wipo.int/global_innovation_index/en/
 * - GERD: az UNESCO UIS és a Világbank (GB.XPD.RSDV.GD.ZS) nem közöl adatot –
 *   https://api.uis.unesco.org/api/public/data/indicators?indicator=EXPGDP.TOT&geoUnit=SUR
 * - Minisztériumok: https://gov.sr/ministeries/
 * - Egyetem, intézetek és kutatási programok (CELOS, nemzeti herbárium – BBS, NZCS, MWI, IMWO, Blue Carbon Restoration, BioREPS,
 *   Konfuciusz Intézet, amerikai–suriname-i akadémiai workshop): https://www.uvs.edu/
 * - Olajszektor (Staatsolie, GranMorgu – TotalEnergies): https://www.staatsolie.com/en/
 * - Rendezvény: SEOGS 2026 (június 23–26., Paramaribo, házigazda: Staatsolie, 6. alkalommal) – https://www.ipieca.org/insights/events/seogs2026
 * - Magyar vonatkozás: Suriname nem Stipendium Hungaricum-partnerország – https://stipendiumhungaricum.hu/partners/ ;
 *   a São Pauló-i TéT-szakdiplomata NKFIH-beszámolói Surinamét nem említik.
 * Kimaradt blokkok és üres mezők: vallalati és programok (nincs forrással alátámasztott tartalom); kfiRendszer.gerd (nincs adat), .strategia,
 * .prioritasok és .prioritasEgyeb (nemzeti KFI-stratégia vagy -prioritáslista nem ismert); intezmenyek.infrastrukturak (kutatási
 * infrastruktúra nem ismert); kapcsolatok.euMultilateralis (a tagságokon – lásd tagsagEgyeb – túl nincs forrással alátámasztott
 * KFI-vonatkozású tartalom), .egyezmeny és .ketoldalu (kétoldalú TéT-megállapodás vagy -program nem ismert);
 * magyarErtekeles.joGyakorlatok (átvehető jó gyakorlat nem ismert).
 */
import { rendezvenyek, type DemoOrszag } from '../tipusok';

const orszag: DemoOrszag = {
  kod: 'SR',
  profil: {
    alapadatok: {
      fovaros: 'Paramaribo',
      terulet: '163 820',
      penznem: 'suriname-i dollár (SRD)',
      lakossag: '657 000',
      gdp: '4,5',
      gdpEgyFore: '6 843',
      gdpNovekedes: '2,7',
      adatEv: '2025',
      forras: 'IMF World Economic Outlook (2025. október), Világbank (terület: FAO)',
      tagsagok: [],
      tagsagEgyeb: 'CARICOM, Iszlám Együttműködési Szervezet (OIC), OAS, Amazóniai Együttműködési Szerződés Szervezete (ACTO), ENSZ; Mercosur társult állam (2013 óta)',
      agazatok: ['Bányászat és nyersanyagok', 'Energetika és fenntarthatóság', 'Agrár- és élelmiszeripar'],
      agazatEgyeb: 'Aranybányászat, kőolaj-kitermelés és -feldolgozás (Staatsolie), offshore olajmező-fejlesztés (GranMorgu), erdőgazdálkodás',
    },
    kfiRendszer: {
      teljesitmeny:
        'Suriname nem szerepel a GII 2025-ben vizsgált 139 gazdaság között, GDP-arányos K+F-ráfordításáról az UNESCO UIS és a Világbank nem közöl adatot. '
        + 'Az IMF 2025-re 2,7%-os reálnövekedést becsült; folyamatban van a GranMorgu offshore olajprojekt fejlesztése (TotalEnergies). '
        + 'A kutatás fő bázisa az Anton de Kom Egyetem és intézetei (agrár-, biodiverzitás-, orvos- és társadalomtudományi kutatás).',
      gerd: '',
      strategia: '',
      prioritasok: [],
      prioritasEgyeb: '',
      kiemeltIparagak: ['Energetika és fenntarthatóság', 'Agrár- és élelmiszeripar'],
      iparagEgyeb: 'Biodiverzitás-kutatás, kék szén (mangrove-helyreállítás)',
      erossegek:
        'Gazdag trópusi biodiverzitás, amelyre egyetemi gyűjtemények és programok épülnek (nemzeti herbárium, NZCS, BioREPS); '
        + 'a fejlődő offshore olajszektor új bevételi forrást ígér; külön minisztérium felel a gazdaságért, a vállalkozásokért és a technológiai innovációért.',
      kihivasok:
        'Nincs nemzetközileg összevethető K+F- és innovációs statisztika (sem a GII, sem az UNESCO UIS nem tartalmazza); '
        + 'a gazdaság a nyersanyag-kitermelésre (arany, kőolaj) épül.',
    },
    intezmenyek: {
      iranyitoSzervek:
        'Oktatási, Tudományos és Kulturális Minisztérium (Ministerie van Onderwijs, Wetenschap en Cultuur) – felsőoktatás és tudomány.\n'
        + 'Gazdasági, Vállalkozási és Technológiai Innovációs Minisztérium (Ministerie van Economische Zaken, Ondernemerschap en Technologische Innovatie).\n'
        + 'Olaj-, Gáz- és Környezetvédelmi Minisztérium (Ministerie van Olie, Gas en Milieu) – az olajszektor és a környezetvédelem.',
      egyetemek:
        'Anton de Kom Universiteit van Suriname (AdeKUS, Paramaribo) – hat karral (bölcsészet-, jog-, társadalom- és orvostudomány, műszaki tudományok, '
        + 'matematika és természettudományok), valamint karközi posztgraduális és kutatási egységgel; Konfuciusz Intézet.',
      kutatokozpontok:
        'Az AdeKUS intézetei: CELOS (mezőgazdasági kutatóközpont), a nemzeti herbárium (BBS), a nemzeti zoológiai gyűjtemény (NZCS), az MWI (orvostudományi kutatóintézet) '
        + 'és az IMWO (társadalomtudományi kutatóintézet); kutatási programok: Blue Carbon Restoration (mangrove és kék szén) és BioREPS (biodiverzitás-kutatási és -oktatási program).',
      infrastrukturak: '',
    },
    rendezvenyek: rendezvenyek([
      { nev: 'Suriname Energy, Oil and Gas Summit and Exhibition (SEOGS)', tipus: 'konferencia', idopont: 'június, Paramaribo', megjegyzes: 'Energetikai és olajipari csúcstalálkozó és kiállítás, házigazda: Staatsolie; 2026: június 23–26. (6. alkalommal)' },
    ]),
    kapcsolatok: {
      euMultilateralis: '',
      partnerorszagok:
        'Hollandia (történelmi és nyelvi kapcsolatok – a holland a hivatalos nyelv); '
        + 'USA (amerikai–suriname-i akadémiai kapcsolat- és kutatáskapacitás-építő workshop az AdeKUS-on); Franciaország (TotalEnergies – GranMorgu); '
        + 'Kína (Konfuciusz Intézet az AdeKUS-on).',
      egyezmeny: '',
      ketoldalu: '',
      mobilitas: 'Suriname nem szerepel a Stipendium Hungaricum partnerországai között (2026).',
    },
    magyarErtekeles: {
      osszegzes:
        'Suriname kis népességű, nyersanyag-alapú (arany, kőolaj) gazdaság; KFI-tevékenységének fő bázisa az Anton de Kom Egyetem és intézetei, nemzetközileg összevethető '
        + 'K+F-adata nincs. Magyar szempontból az agrárkutatás, a biodiverzitás- és mangrovekutatás, valamint az orvostudományi kutatás lehet kapcsolódási pont; '
        + 'a kapcsolatépítés a São Pauló-i TéT-szakdiplomata regionális feladata.',
      egyuttmukodesiLehetosegek:
        'Agrárkutatás (CELOS); biodiverzitás, herbáriumi és zoológiai gyűjtemények (nemzeti herbárium, NZCS, BioREPS); mangrove- és kékszén-kutatás (Blue Carbon Restoration); '
        + 'orvostudományi kutatás (MWI); egyetemi kapcsolatok az AdeKUS-szal.',
      joGyakorlatok: '',
      diplomaciaiPrioritasok:
        'Kapcsolatfelvétel az Anton de Kom Egyetemmel és intézeteivel; a Stipendium Hungaricum-partnerség lehetőségének vizsgálata; '
        + 'a magyar energetikai és víztechnológiai megoldások bemutatása, például a SEOGS energetikai csúcstalálkozón.',
    },
  },
};

export default orszag;
