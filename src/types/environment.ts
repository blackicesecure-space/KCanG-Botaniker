export interface EnvironmentSettings {
  // Day / Night cycle
  isDayCycle: boolean;
  lightCycleMode: '18/6 (Vegetation)' | '12/12 (Blüte)' | '20/4 (Autoflower)' | 'Manuell';
  
  // Temperature Control
  tempDayTargetMin: number; // 20°C
  tempDayTargetMax: number; // 26°C
  tempNightTargetMin: number; // 18°C
  tempNightTargetMax: number; // 21°C
  
  // Humidity Regulation
  humidityTargetMin: number; // 40%
  humidityTargetMax: number; // 60%
  
  // CO2 Enrichment
  co2TargetPpm: number; // 800 - 1200 ppm during light
  co2EnrichmentEnabled: boolean;
  
  // Nutrient Solution (Hydro/Aero) Target Ranges & Custom Alert Thresholds
  phTargetMin: number; // 5.6
  phTargetMax: number; // 6.0
  ecTargetMin: number; // 1.1
  ecTargetMax: number; // 1.5
  waterTempTargetMin: number; // 18.0
  waterTempTargetMax: number; // 20.0

  // Custom User-Defined Alarm Boundaries (which immediately trigger SensorAlertsBanner)
  phCriticalMin: number; // e.g. 5.2
  phCriticalMax: number; // e.g. 6.4
  ecCriticalMin: number; // e.g. 0.8
  ecCriticalMax: number; // e.g. 1.85
  tempCriticalMin: number; // e.g. 17.0
  tempCriticalMax: number; // e.g. 28.5
  waterTempCriticalMax: number; // e.g. 21.0
}

export interface SensorTelemetry {
  timestamp: number;
  
  // Grow Tent Environment
  airTemp: number; // °C
  humidity: number; // %
  co2Ppm: number; // ppm
  vpd: number; // kPa
  
  // Hydroponic / Aeroponic Solution
  ph: number;
  ec: number; // mS/cm
  waterTemp: number; // °C
  dissolvedOxygen: number; // mg/L
  reservoirLevelPercent: number; // %
  
  // Actuator States
  exhaustFanSpeedPercent: number;
  heaterActive: boolean;
  acActive: boolean;
  humidifierActive: boolean;
  dehumidifierActive: boolean;
  co2SolenoidOpen: boolean;
  waterChillerActive: boolean;
  hpaPumpActive: boolean;
  phDosingActive: boolean;
  nutrientDosingActive: boolean;
}

export interface SystemAlert {
  id: string;
  timestamp: string;
  parameter: 'pH' | 'EC' | 'Wassertemperatur' | 'Luftfeuchtigkeit' | 'Raumtemperatur' | 'CO₂' | 'VPD';
  severity: 'warning' | 'critical';
  currentValue: number;
  unit: string;
  targetRange: string;
  title: string;
  botanicalExplanation: string;
  immediateAction: string;
}
