export interface RootHealthLog {
  id: string;
  timestamp: number;
  dateStr: string;
  plantOrBatch: string;
  phase: string;
  week: string;
  colorGrade: 'strahlend_weiss' | 'elfenbein_creme' | 'gelblich_beige' | 'braun_stumpf' | 'dunkelbraun_schwarz';
  smell: 'frisch_erdig' | 'neutral' | 'schal_stagnierend' | 'muffig_modrig' | 'faulig_anaerob';
  slimeBiofilm: 'keiner' | 'minimal' | 'deutlich' | 'starker_schleimfilm';
  rootHairDensity: 'dichter_pelz' | 'gut_sichtbar' | 'spaerlich' | 'fehlt_vollstaendig';
  waterTempAtCheck: number;
  phAtCheck: number;
  ecAtCheck: number;
  pythiumRiskScore: number; // 0 (perfekt) bis 100 (akuteste Wurzelfäule)
  notes: string;
  treatmentApplied?: string;
  photoUrl?: string; // base64 or placeholder
}

export interface NutrientPhaseCurvePoint {
  weekLabel: string;
  phase: string;
  n: number; // Stickstoff N in ppm oder relativer %-Bedarf
  p: number; // Phosphor P
  k: number; // Kalium K
  ca: number; // Calcium Ca
  mg: number; // Magnesium Mg
  targetEcMin: number; // mS/cm
  targetEcMax: number; // mS/cm
  targetEcOptimal: number; // mS/cm
  phTarget: number;
  description: string;
}

export interface HistoryDataPoint {
  time: string;
  timestamp: number;
  airTemp: number; // °C
  humidity: number; // %
  vpd: number; // kPa
  waterTemp: number; // °C
  ph: number;
  ec: number;
  co2: number;
  isLightOn: boolean;
}
