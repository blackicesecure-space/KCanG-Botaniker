export type CultivationSystemType = 'soil' | 'aeroponic' | 'hydroponic' | 'coco' | 'aquaponic';
export type IrrigationType = 'manual' | 'automated_drip' | 'high_pressure_aero' | 'ebb_flow' | 'deep_water_culture';
export type NutrientConceptType = 'organic_liquid' | 'mineral_salt' | 'living_soil_water_only' | 'bio_mineral';
export type SubstrateType = 'eigene_kompost_mischung' | 'perlite_coco' | 'expanded_clay' | 'rockwool' | 'organic_potting_soil' | 'none_aeroponic';

export interface GrowConfig {
  system: CultivationSystemType;
  irrigation: IrrigationType;
  nutrientConcept: NutrientConceptType;
  substrate: SubstrateType;
  potVolumeLiters: number;
  createdAt: string;
  version: number;
}

export interface ConfigModuleRule {
  fieldKey: string;
  requiredSystems?: CultivationSystemType[];
  requiredIrrigation?: IrrigationType[];
  requiredNutrients?: NutrientConceptType[];
  hiddenIf?: (config: GrowConfig) => boolean;
}

export const DIAGNOSIS_MODULE: ConfigModuleRule[] = [
  { fieldKey: 'strain' },
  { fieldKey: 'strainType' },
  { fieldKey: 'phase' },
  { fieldKey: 'week' },
  {
    fieldKey: 'systemType',
    hiddenIf: (c) => c.system === 'soil',
  },
  {
    fieldKey: 'nozzlesCount',
    hiddenIf: (c) => c.system !== 'aeroponic' || c.irrigation === 'manual',
  },
  {
    fieldKey: 'nozzleType',
    hiddenIf: (c) => c.irrigation === 'manual',
  },
  {
    fieldKey: 'pressureBar',
    hiddenIf: (c) => (c.system !== 'aeroponic' && c.irrigation !== 'high_pressure_aero') || c.irrigation === 'manual',
  },
  {
    fieldKey: 'intervalOnSeconds',
    hiddenIf: (c) => c.irrigation === 'manual',
  },
  {
    fieldKey: 'intervalOffSeconds',
    hiddenIf: (c) => c.irrigation === 'manual',
  },
  {
    fieldKey: 'tankVolumeL',
    hiddenIf: (c) => c.irrigation === 'manual',
  },
  {
    fieldKey: 'lastChangeDays',
    hiddenIf: (c) => c.irrigation === 'manual',
  },
  {
    fieldKey: 'soilData',
    hiddenIf: (c) => c.system !== 'soil',
  },
  {
    fieldKey: 'waterTemp',
    hiddenIf: (c) => c.system === 'soil' && c.irrigation === 'manual',
  },
  {
    fieldKey: 'ph',
    hiddenIf: (c) => c.nutrientConcept === 'living_soil_water_only',
  },
  {
    fieldKey: 'ec',
    hiddenIf: (c) => c.nutrientConcept === 'living_soil_water_only',
  },
];

export function visibleFields(moduleRules: ConfigModuleRule[], config: GrowConfig): string[] {
  const visible: string[] = [];
  for (const rule of moduleRules) {
    if (rule.hiddenIf && rule.hiddenIf(config)) {
      continue;
    }
    visible.push(rule.fieldKey);
  }
  return visible;
}
