import { NutrientPhaseCurvePoint, HistoryDataPoint, RootHealthLog } from '../types/rootLog';

// Standard 24h realistic telemetry history generation for aeroponics grow tent
export function generate24hHistory(): HistoryDataPoint[] {
  const points: HistoryDataPoint[] = [];
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  // 24 points: 23 hours ago up to current hour
  for (let i = 23; i >= 0; i--) {
    const t = new Date(now - i * oneHour);
    const hour = t.getHours();
    const timeStr = `${hour.toString().padStart(2, '0')}:00`;

    // 18/6 cycle or 12/12 cycle assumption: light on from 06:00 to 22:00
    const isLightOn = hour >= 6 && hour < 22;

    // Air temp: ~24.5-25.5°C during day, ~19.5-20.5°C during night
    const baseTemp = isLightOn ? 24.8 : 19.8;
    const tempNoise = Math.sin(i * 0.4) * 0.7;
    const airTemp = parseFloat((baseTemp + tempNoise).toFixed(1));

    // Humidity: ~50-55% during day, ~58-62% during night
    const baseHum = isLightOn ? 51.5 : 59.0;
    const humNoise = Math.cos(i * 0.5) * 2.5;
    const humidity = parseFloat((baseHum + humNoise).toFixed(1));

    // Calculate VPD
    const vpsatAir = 0.61078 * Math.exp((17.27 * airTemp) / (airTemp + 237.3));
    const leafTemp = airTemp - 1.5;
    const vpsatLeaf = 0.61078 * Math.exp((17.27 * leafTemp) / (leafTemp + 237.3));
    const actualVP = vpsatAir * (humidity / 100);
    const vpd = parseFloat(Math.max(0.4, vpsatLeaf - actualVP).toFixed(2));

    // Water temp: ~18.8 to 19.8°C (slight rise mid-day, then chiller kicks in)
    const waterTemp = parseFloat((19.2 + Math.sin(i * 0.3) * 0.6).toFixed(1));

    // pH: drift around 5.8
    const ph = parseFloat((5.78 + Math.cos(i * 0.25) * 0.12).toFixed(2));

    // EC: around 1.35
    const ec = parseFloat((1.33 + Math.sin(i * 0.2) * 0.06).toFixed(2));

    // CO2: 1000 ppm day, 430 ppm night
    const co2 = isLightOn ? Math.round(1020 + Math.sin(i) * 50) : Math.round(440 + Math.cos(i) * 20);

    points.push({
      time: timeStr,
      timestamp: t.getTime(),
      airTemp,
      humidity,
      vpd,
      waterTemp,
      ph,
      ec,
      co2,
      isLightOn,
    });
  }

  return points;
}

// Complete 12-week cycle curve for Cannabis sativa L. in Aeroponics
export const NUTRIENT_CYCLE_CURVE: NutrientPhaseCurvePoint[] = [
  {
    weekLabel: 'W1',
    phase: 'Keimling / Anwurzeln',
    n: 40,
    p: 30,
    k: 35,
    ca: 35,
    mg: 20,
    targetEcMin: 0.6,
    targetEcMax: 0.8,
    targetEcOptimal: 0.7,
    phTarget: 5.7,
    description: 'Empfindliche Wurzelinitiation. Niedriger EC schützt zarte Wurzelhaare vor Osmoseschock. Wurzelstimulator (Rhizotonic/Kelp) prioritär.',
  },
  {
    weekLabel: 'W2',
    phase: 'Frühe Vegetation',
    n: 70,
    p: 45,
    k: 55,
    ca: 50,
    mg: 30,
    targetEcMin: 0.9,
    targetEcMax: 1.1,
    targetEcOptimal: 1.0,
    phTarget: 5.8,
    description: 'Erstes vegetatives Blattpaar. Aufbau des internen Chlorophyll- und Enzymapparats. Stickstoff-Bedarf steigt stetig.',
  },
  {
    weekLabel: 'W3',
    phase: 'Vegetatives Hauptwachstum',
    n: 100,
    p: 60,
    k: 80,
    ca: 70,
    mg: 45,
    targetEcMin: 1.1,
    targetEcMax: 1.3,
    targetEcOptimal: 1.2,
    phTarget: 5.8,
    description: 'Explosives Trieb- und Wurzelwachstum. Maximale N-Aufnahme zur Proteinsynthese. Dichter weißer Wurzelhaarflaum im Nebel.',
  },
  {
    weekLabel: 'W4',
    phase: 'Späte Vegi / Vorblüte',
    n: 110,
    p: 65,
    k: 90,
    ca: 80,
    mg: 50,
    targetEcMin: 1.2,
    targetEcMax: 1.4,
    targetEcOptimal: 1.3,
    phTarget: 5.8,
    description: 'Letzte Woche 18/6. Volle Kronenausleuchtung. Systemcheck vor Umstellung auf 12/12 Blütezyklus.',
  },
  {
    weekLabel: 'W5',
    phase: 'Blüte W1 (Stretch-Phase)',
    n: 105,
    p: 80,
    k: 110,
    ca: 85,
    mg: 55,
    targetEcMin: 1.3,
    targetEcMax: 1.5,
    targetEcOptimal: 1.4,
    phTarget: 5.8,
    description: 'Starkes Längenwachstum (Internodien). Pflanze benötigt weiterhin Stickstoff, erhöht jedoch drastisch den Phosphor- und Kaliumbedarf.',
  },
  {
    weekLabel: 'W6',
    phase: 'Blüte W2 (Stretch-Ende)',
    n: 95,
    p: 95,
    k: 125,
    ca: 90,
    mg: 60,
    targetEcMin: 1.4,
    targetEcMax: 1.6,
    targetEcOptimal: 1.5,
    phTarget: 5.9,
    description: 'Erste weiße Stigmen (Blütenfäden) erscheinen an den Nodien. Calcium-Bedarf für stabile Zellteilung ist auf Höchststand.',
  },
  {
    weekLabel: 'W7',
    phase: 'Blüte W3 (Knospenbildung)',
    n: 85,
    p: 110,
    k: 140,
    ca: 85,
    mg: 60,
    targetEcMin: 1.4,
    targetEcMax: 1.7,
    targetEcOptimal: 1.55,
    phTarget: 5.9,
    description: 'Bildung dichter Blütenstände („Buttoning“). N-Zufuhr wird behutsam gedrosselt, um Blattüberschuss in Blüten zu vermeiden.',
  },
  {
    weekLabel: 'W8',
    phase: 'Blüte W4 (Hauptblüte PK-Peak)',
    n: 70,
    p: 130,
    k: 165,
    ca: 80,
    mg: 55,
    targetEcMin: 1.5,
    targetEcMax: 1.8,
    targetEcOptimal: 1.65,
    phTarget: 5.9,
    description: 'PK 13/14 oder Blüten-Booster Phase. Kalium treibt die Kohlenhydratsynthese und Zellexpansion in den Calyxen maximal an.',
  },
  {
    weekLabel: 'W9',
    phase: 'Blüte W5 (Trichomreife & Harz)',
    n: 60,
    p: 125,
    k: 160,
    ca: 75,
    mg: 50,
    targetEcMin: 1.4,
    targetEcMax: 1.7,
    targetEcOptimal: 1.55,
    phTarget: 6.0,
    description: 'Trichombildung und Terpensynthese auf Hochtouren. Hohe Luftfeuchtigkeit über 50% unbedingt vermeiden (Botrytis-Schutz!).',
  },
  {
    weekLabel: 'W10',
    phase: 'Blüte W6 (Knospen-Dichte)',
    n: 45,
    p: 105,
    k: 135,
    ca: 65,
    mg: 45,
    targetEcMin: 1.2,
    targetEcMax: 1.5,
    targetEcOptimal: 1.35,
    phTarget: 6.0,
    description: 'Blüten schwellen an. Erste bernsteinfarbene Drüsenköpfe. Beginnende Reduzierung der Gesamtsalzkonzentration.',
  },
  {
    weekLabel: 'W11',
    phase: 'Blüte W7 (Abreife / Seneszenz)',
    n: 25,
    p: 65,
    k: 85,
    ca: 45,
    mg: 30,
    targetEcMin: 0.8,
    targetEcMax: 1.1,
    targetEcOptimal: 0.95,
    phTarget: 6.0,
    description: 'Gezielter Nährstoffabbau. Die Fächerblätter beginnen natürlich aufzuhellen (Chlorophyll-Rückresorption in die Calyxen).',
  },
  {
    weekLabel: 'W12',
    phase: 'Spülen / Reinstwasser-Finish',
    n: 5,
    p: 10,
    k: 15,
    ca: 15,
    mg: 10,
    targetEcMin: 0.2,
    targetEcMax: 0.5,
    targetEcOptimal: 0.35,
    phTarget: 5.8,
    description: 'Spülen mit reinem temperiertem Wasser oder milden Enzymen. Wurzeln bleiben sauber; weicher, asche-reiner Geschmack im Endprodukt.',
  },
];

// Initial preloaded root logs (leer nach Nutzeranforderung - keine Mockdaten)
export const INITIAL_ROOT_LOGS: RootHealthLog[] = [];
