export type CultivationMethod = 'aeroponic' | 'soil';

export interface SoilSubstrateDetails {
  soilType: 'living_soil' | 'biobizz_light' | 'biobizz_all' | 'plagron_grow' | 'coco_perlite' | 'compost_mix';
  potSizeLiters: number;
  potType: 'fabric_pot' | 'air_pot' | 'plastic_pot' | 'autopot';
  lastWateringDays: number;
  wateringVolumeLiters: number;
  drainageRunoffPercent: number; // e.g. 10-20%
  soilMoistureLevel: 'trocken' | 'feucht_ideal' | 'durchnaesst_stauend';
  topDressingOrMicrobes: string;
}

export interface CultivationSystemSelection {
  method: CultivationMethod;
  selectedAt: number;
  soilDetails?: SoilSubstrateDetails;
}
