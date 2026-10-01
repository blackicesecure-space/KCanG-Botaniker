export interface TrichomeLog {
  id: string;
  timestamp: number;
  dateStr: string;
  plantOrStrain: string;
  flowerWeek: number;
  bloomDay: number;
  sampleLocation: 'head_bud' | 'side_branch' | 'sugar_leaf' | 'calyx_lower';
  
  // Percentages (Sum ideally ~100%)
  percentClear: number;  // Glasig / Unreif
  percentMilky: number;  // Milchig / Trüb (Maximales THC/Cannabinoid-Peak)
  percentAmber: number;  // Bernstein / Bernsteinfarben (CBN-Degradation, Sedierend)

  // Desired harvest profile
  intendedProfile: 'cerebral_active' | 'balanced_hybrid' | 'body_relax' | 'medical_sedative';

  // Analysis Result
  harvestReadinessScore: number; // 0 - 100%
  harvestRecommendation: 'Zu früh (Glasig dominiert)' | 'Erntefenster öffnet sich' | 'Optimales Erntefenster (Peak THC)' | 'Späte Ernte (Erhöhter CBN-Gehalt)' | 'Überreif';
  estimatedDaysToHarvest: number; // 0 = heute, 3, 7, 14 etc.
  
  // Cannabinoid & Terpene botanical prediction
  thcDevelopmentPhase: 'Synthese' | 'Peak (Maximum)' | 'Abbau zu CBN';
  cbnEstimationPercent: number; // estimated CBN %
  terpeneQuality: 'intensiv_flüchtig' | 'voll_ausgeprägt' | 'beginnende_oxidation';

  // KCanG Legal Guidance (§ 9 / § 10)
  kcangGuidance: {
    plantStatus: 'Lebende Pflanze (zählt zu den 3 legalen Pflanzen gem. § 9 Abs. 1)';
    harvestLimitNotice: 'Achtung: Bis zu 50 g getrocknetes Cannabis am Wohnsitz legal (§ 3 KCanG). Erntemenge planen!';
    curingAdvice: 'Schonende Trocknung bei 18°C & 60% RLF über 10-14 Tage zur Erhaltung der Monoterpene.';
  };

  notes?: string;
  photoUrl?: string; // macro shot attachment
}
