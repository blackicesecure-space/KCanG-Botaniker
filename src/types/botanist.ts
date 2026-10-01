export type CultivationMethod = 'aeroponic' | 'soil';

export interface SoilSubstrateData {
  substrateType: 'living_soil' | 'biobizz_light' | 'biobizz_all' | 'plagron_grow' | 'coco_perlite' | 'compost_organic';
  potSizeLiters: string; // z.B. '11', '15', '20'
  potType: 'stofftopf' | 'airpot' | 'kunststoff' | 'autopot';
  lastWateringDays: string; // vor wie vielen Tagen
  wateringVolumePerPlantL: string; // z.B. '2.5'
  runoffPresent: boolean;
  runoffPh?: string;
  runoffEc?: string;
  soilMoistureStatus: 'trocken' | 'feucht_optimal' | 'nass_staunaesse';
  fertilizerRegime: 'organisch (BioBizz/Guanokalong)' | 'mineralisch (Canna Terra/Hesi)' | 'living_soil_no_till' | 'komposttee';
}

export interface CultivationData {
  // Anbaumethode (Soil Erde vs Aeroponic)
  cultivationMethod?: CultivationMethod;

  // Sorte & Genetik
  strain: string;
  strainType: string; // z.B. 'Feminisiert (70% Sativa / 30% Indica)', 'Autoflower (Hybride)', etc.
  phase: string; // 'Keimling', 'Vegetation', 'Frühe Blüte', 'Hauptblüte', 'Spätblüte / Spülen'
  week: string; // '1', '2', '3', etc.

  // Spezifisch für Aeroponik-System
  systemType: 'HPA (Hochdruck 5-8 bar)' | 'LPA (Niederdruck 1.5-3 bar)' | 'Hybrid / Eigenbau';
  systemBrand: string; // z.B. 'Platinium AeroTop', 'Nutriculture Amazon', 'Eigenbau HPA Drucktank'
  nozzlesCount: string; // z.B. '8 Düsen'
  nozzleType: string; // z.B. 'Tefen 0.3mm Nebeldüse (30-50µm)', '360° Rotordüse', 'Messing-Hochdrucknebler'
  pressureBar: string; // z.B. '6.5' oder '2.5'
  intervalOnSeconds: string; // z.B. '3' oder '15'
  intervalOffSeconds: string; // z.B. '180' oder '60'

  // Spezifisch für Boden / Erde (Soil)
  soilData?: SoilSubstrateData;

  // Nährlösung / Düngung
  nutrientBrand: string; // z.B. 'Canna Aqua', 'BioBizz', 'Terra Aquatica', 'Athena', 'Hesi'
  nutrientProducts: string; // z.B. 'Bio-Grow + Bio-Bloom' oder 'Aqua Vega A+B'
  nutrientDose: string; // z.B. '2 ml/l'
  tankVolumeL: string; // z.B. '40' (oder Gießkannen-Volumen bei Erde)
  lastChangeDays: string; // vor wie vielen Tagen
  additives: string; // z.B. 'Cal/Mag, Mykorrhiza, Enzyme'

  // Messwerte
  ph: string; // z.B. '6.5' bei Erde, '5.8' bei Aero
  ec: string; // z.B. '1.4'
  ecFactor: '0.5' | '0.7';
  waterTemp: string; // Wassertemperatur (Gießwasser oder Aero-Reservoir)
  rootZoneTemp: string; // Wurzelfeld- bzw. Topf-Innentemperatur
  ambientTemp: string; // Growbox Temperatur
  ambientHumidity: string; // Growbox RLF
  vpd: string; // VPD in kPa

  // Beleuchtung
  lightingType: string; // 'LED Vollspektrum', 'NDL / Natriumdampf', 'CMH / LEC'
  lightingWattage: string; // z.B. '300'
  lightingDistanceCm: string; // z.B. '40'
  lightingCycle: string; // '18/6', '12/12', '20/4', '24/0'
  ppfd: string; // z.B. '650'

  // Symptome & Befunde
  leafSymptoms: string;
  rootSymptoms: string; // bei Erde: Topfrand-Wurzeln, Staunässe, Trauermücken; bei Aero: Wurzelfarbe, Schleim
  additionalObservations: string;

  // Foto
  photoBase64?: string;
  photoMimeType?: string;
}

export interface PresetCase {
  id: string;
  title: string;
  method?: CultivationMethod;
  category: 'Wurzelfäule / Oomyceten' | 'Nährstoff-Lockout' | 'Überdüngung' | 'Technik / Düsen' | 'Klimastress' | 'Staunässe / Wurzelerstickung (Erde)' | 'Trauermücken / Schädlingsbefall (Erde)';
  urgency: 'sofort' | 'innerhalb 24 h' | 'beobachten';
  description: string;
  data: Partial<CultivationData>;
}
