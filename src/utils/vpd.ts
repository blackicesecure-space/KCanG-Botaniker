// Botanical calculations for Cannabis sativa L. in Aeroponics

/**
 * Calculates Saturation Vapor Pressure (VPsat) in kPa using Tetens equation
 */
export function getSaturationVaporPressure(tempCelsius: number): number {
  return 0.61078 * Math.exp((17.27 * tempCelsius) / (tempCelsius + 237.3));
}

/**
 * Calculates Vapor Pressure Deficit (VPD) in kPa
 * @param airTemp Air temperature in °C
 * @param humidity Relative humidity in %
 * @param leafTempOffset Leaf temp offset from air temp (typically -1.5°C to -2°C under LED)
 */
export function calculateVPD(airTemp: number, humidity: number, leafTempOffset: number = -1.5): {
  vpdAir: number;
  vpdLeaf: number;
  status: 'Zu niedrig (Schimmelgefahr / Stagnation)' | 'Optimal' | 'Erhöht (Transpirationsstress)' | 'Kritisch hoch (Stomata schließen)';
  color: string;
} {
  const leafTemp = airTemp + leafTempOffset;
  const vpsatAir = getSaturationVaporPressure(airTemp);
  const vpsatLeaf = getSaturationVaporPressure(leafTemp);
  const actualVaporPressure = vpsatAir * (humidity / 100);

  const vpdAir = Math.max(0, parseFloat((vpsatAir - actualVaporPressure).toFixed(2)));
  const vpdLeaf = Math.max(0, parseFloat((vpsatLeaf - actualVaporPressure).toFixed(2)));

  let status: 'Zu niedrig (Schimmelgefahr / Stagnation)' | 'Optimal' | 'Erhöht (Transpirationsstress)' | 'Kritisch hoch (Stomata schließen)' = 'Optimal';
  let color = 'text-emerald-400';

  if (vpdLeaf < 0.6) {
    status = 'Zu niedrig (Schimmelgefahr / Stagnation)';
    color = 'text-blue-400';
  } else if (vpdLeaf >= 0.6 && vpdLeaf <= 1.4) {
    status = 'Optimal';
    color = 'text-emerald-400';
  } else if (vpdLeaf > 1.4 && vpdLeaf <= 1.8) {
    status = 'Erhöht (Transpirationsstress)';
    color = 'text-amber-400';
  } else {
    status = 'Kritisch hoch (Stomata schließen)';
    color = 'text-rose-400';
  }

  return { vpdAir, vpdLeaf, status, color };
}

/**
 * Calculates theoretical dissolved oxygen (DO) saturation in pure water at sea level
 * based on Henry's law as a function of temperature
 */
export function getDissolvedOxygenSaturation(tempCelsius: number): {
  mgPerLiter: number;
  pythiumRiskLevel: 'Sehr gering' | 'Gering' | 'Mäßig (Achtung)' | 'Hoch (Gefahrenzone)' | 'Extrem kritisch';
  riskColor: string;
} {
  // Approximate standard curve for water DO saturation at 1 atm
  // 15°C ~ 10.1 mg/L, 18°C ~ 9.4 mg/L, 20°C ~ 9.1 mg/L, 24°C ~ 8.4 mg/L, 28°C ~ 7.8 mg/L
  const doSat = parseFloat((14.652 - 0.41022 * tempCelsius + 0.007991 * Math.pow(tempCelsius, 2) - 0.000077774 * Math.pow(tempCelsius, 3)).toFixed(2));

  let pythiumRiskLevel: 'Sehr gering' | 'Gering' | 'Mäßig (Achtung)' | 'Hoch (Gefahrenzone)' | 'Extrem kritisch' = 'Gering';
  let riskColor = 'text-emerald-400';

  if (tempCelsius < 17) {
    pythiumRiskLevel = 'Sehr gering';
    riskColor = 'text-blue-400';
  } else if (tempCelsius <= 19.5) {
    pythiumRiskLevel = 'Gering';
    riskColor = 'text-emerald-400';
  } else if (tempCelsius <= 21.0) {
    pythiumRiskLevel = 'Mäßig (Achtung)';
    riskColor = 'text-amber-400';
  } else if (tempCelsius <= 23.5) {
    pythiumRiskLevel = 'Hoch (Gefahrenzone)';
    riskColor = 'text-orange-500';
  } else {
    pythiumRiskLevel = 'Extrem kritisch';
    riskColor = 'text-rose-500';
  }

  return { mgPerLiter: Math.max(0, doSat), pythiumRiskLevel, riskColor };
}

/**
 * Nutrient availability approximation in hydroponics/aeroponics across pH 4.0 - 8.0
 */
export interface ElementAvailability {
  symbol: string;
  name: string;
  availability: number; // 0 to 100%
  lockoutRisk: string;
}

export function getNutrientAvailabilityAtPh(ph: number): ElementAvailability[] {
  // Hydroponic availability curves
  return [
    {
      symbol: 'N',
      name: 'Stickstoff (Nitrat/Ammonium)',
      availability: ph >= 5.5 && ph <= 7.0 ? 98 : ph < 5.0 ? 55 : 80,
      lockoutRisk: ph < 5.0 ? 'Ammoniumaufnahme gestört' : 'Optimal',
    },
    {
      symbol: 'P',
      name: 'Phosphor',
      availability: ph >= 5.5 && ph <= 6.2 ? 95 : ph > 6.5 ? 40 : ph < 5.0 ? 30 : 70,
      lockoutRisk: ph > 6.5 ? 'Ausfällung mit Calcium (Calciumphosphat)' : ph < 5.2 ? 'Fixierung' : 'Optimal',
    },
    {
      symbol: 'K',
      name: 'Kalium',
      availability: ph >= 5.5 && ph <= 6.8 ? 95 : ph < 5.2 ? 60 : 85,
      lockoutRisk: ph < 5.0 ? 'Kationen-Konkurrenz mit H+' : 'Optimal',
    },
    {
      symbol: 'Ca',
      name: 'Calcium',
      availability: ph >= 5.4 && ph <= 6.2 ? 90 : ph < 5.2 ? 45 : 75,
      lockoutRisk: ph < 5.2 ? 'Akute Zellwand-Instabilität, Spitzenfäule' : 'Optimal',
    },
    {
      symbol: 'Mg',
      name: 'Magnesium',
      availability: ph >= 5.6 && ph <= 6.4 ? 92 : ph < 5.4 ? 50 : 80,
      lockoutRisk: ph < 5.4 ? 'Intercostale Blattaufhellung (Chlorose)' : 'Optimal',
    },
    {
      symbol: 'Fe',
      name: 'Eisen (Chelatiert)',
      availability: ph >= 5.2 && ph <= 6.0 ? 95 : ph > 6.5 ? 35 : 75,
      lockoutRisk: ph > 6.3 ? 'Oxidation und Ausfall, gelbe Neutriebe' : 'Optimal',
    },
    {
      symbol: 'Mn',
      name: 'Mangan',
      availability: ph >= 5.0 && ph <= 6.2 ? 92 : ph > 6.5 ? 40 : 70,
      lockoutRisk: ph > 6.5 ? 'Blockade bei hohem pH' : 'Optimal',
    },
    {
      symbol: 'B',
      name: 'Bor',
      availability: ph >= 5.2 && ph <= 6.4 ? 90 : ph > 7.0 ? 45 : 80,
      lockoutRisk: ph > 6.8 ? 'Verkrüppelte Triebspitzen' : 'Optimal',
    },
  ];
}
