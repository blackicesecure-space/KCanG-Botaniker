export interface PlanWeek {
  week: number;               // Grow-Woche ab Keimung (1-basiert)
  phase: 'keimung' | 'saemling' | 'vegi' | 'vorbluete' | 'bluete' | 'reife' | 'trocknung';
  titel: string;
  // Soll-Korridore
  phMin: number; phMax: number;
  ecMin: number; ecMax: number;   // 0 = nur Wasser
  waterLiters: string;            // z.B. "0.1–0.2"
  drainPercent: string;           // z.B. "0" oder "10–20 %"
  // Praxis-Hinweise aus dem Referenz-Grow
  aktionen: string[];
}

// Referenz-Profil: GrowStorys-Autoflower-Soil-Fahrplan (90 Tage)
export const GROWSTORYS_AUTO_PLAN: PlanWeek[] = [
  { week: 1, phase: 'keimung', titel: 'Keimung & Sämling',
    phMin: 5.8, phMax: 6.4, ecMin: 0, ecMax: 0,
    waterLiters: '0.1 → 0.2', drainPercent: '0',
    aktionen: [
      'Samen direkt im 20-L-Endtopf keimen (3–4 cm Blähton-Drainage unten)',
      'Leicht vorgedüngte Erde + Perlite; Haube für hohe RLF',
      'Nur klares Wasser, pH 5.8–6.4, optional 0.1 g Bittersalz/L',
      'Licht 20/4, ca. 35 cm Abstand, ~380 PPFD',
    ] },
  { week: 2, phase: 'saemling', titel: 'Sämling etabliert',
    phMin: 5.8, phMax: 6.4, ecMin: 0, ecMax: 0,
    waterLiters: '0.5', drainPercent: '0',
    aktionen: [
      'Gießen im wachsenden Radius, nicht am Stängel',
      'Weiter nur Wasser — Erde versorgt noch alles',
      'Fingertest als Gieß-Indikator',
    ] },
  { week: 3, phase: 'vegi', titel: 'Wachstum & LST-Beginn',
    phMin: 5.8, phMax: 6.4, ecMin: 0, ecMax: 0,
    waterLiters: '1.0 → 2.0', drainPercent: '0',
    aktionen: [
      'Gießmenge in 500-ml-Schritten mit 5–10 min Pausen',
      'Topfgewicht wird Gieß-Indikator (halb so schwer = gießen)',
      'LST starten (kein Topping bei Autos!)',
      'Licht noch 50 %, Spektrum Wachstum',
    ] },
  { week: 4, phase: 'vorbluete', titel: 'Vorblüte & erste Düngung',
    phMin: 5.8, phMax: 6.4, ecMin: 1.0, ecMax: 1.4,
    waterLiters: '⅓ Topfvolumen', drainPercent: '10 %',
    aktionen: [
      'Weiße Härchen = Blütebeginn → erste Düngung (Blütewoche-1-Schema)',
      'Gießen bis ~10 % Drain; Licht auf 65 % (130 W)',
      'VPD 0.8–1.2',
    ] },
  { week: 5, phase: 'bluete', titel: 'Blüte W2 — Stretch',
    phMin: 5.8, phMax: 6.4, ecMin: 1.4, ecMax: 2.0,
    waterLiters: '⅓ Topfvolumen', drainPercent: '10–20 %',
    aktionen: ['Triebe täglich nach außen biegen', 'Licht auf 100 % (650–700 PPFD)'] },
  { week: 6, phase: 'bluete', titel: 'Blüte W3 — Stretch-Ende',
    phMin: 5.8, phMax: 6.4, ecMin: 1.8, ecMax: 2.3,
    waterLiters: '⅓ Topfvolumen', drainPercent: '10–20 %',
    aktionen: ['Entlaubung: Licht tiefer in die Pflanze, schwache Ansätze entfernen', 'VPD auf 1.2–1.6 stellen'] },
  { week: 7, phase: 'bluete', titel: 'Blüte W4 — EC-Peak',
    phMin: 5.8, phMax: 6.4, ecMin: 2.3, ecMax: 2.6,
    waterLiters: '⅓ Topfvolumen', drainPercent: '10–20 %',
    aktionen: ['PK moderat zugeben (P: Blütenstruktur, K: Stoffwechsel)', 'Höhepunkt der Nährstofflast'] },
  { week: 8, phase: 'bluete', titel: 'Blüte W5 — Absenkung beginnt',
    phMin: 5.8, phMax: 6.4, ecMin: 2.0, ecMax: 2.4,
    waterLiters: '⅓ Topfvolumen', drainPercent: '10–20 %',
    aktionen: ['Bloom A/B reduzieren, PK leicht erhöhen', 'Max. 25 °C — Terpenschutz'] },
  { week: 9, phase: 'bluete', titel: 'Blüte W6 — Reifeansatz',
    phMin: 5.8, phMax: 6.4, ecMin: 1.8, ecMax: 2.3,
    waterLiters: '⅓ Topfvolumen', drainPercent: '10–20 %',
    aktionen: ['EC weiter senken', 'RLF ~50 %, Temp 24–25 °C'] },
  { week: 10, phase: 'reife', titel: 'Blüte W7–8 — Reifung',
    phMin: 5.8, phMax: 6.4, ecMin: 1.5, ecMax: 1.7,
    waterLiters: 'nach Bedarf', drainPercent: '10–20 %',
    aktionen: ['Ziel-EC 1.7 → 1.5', 'Trichom-Kontrolle beginnt (Lupe!)', 'Keine großen Eingriffe mehr, Stabilität zählt'] },
  { week: 11, phase: 'reife', titel: 'Erntefenster',
    phMin: 5.8, phMax: 6.4, ecMin: 1.3, ecMax: 1.5,
    waterLiters: 'nach Bedarf', drainPercent: '10 %',
    aktionen: [
      'Ernten wenn milchige Trichome dominieren + erste bernsteinfarbene',
      'LED aus beim Prüfen — Reflexion täuscht!',
      'Natürliches Aufhellen der Blätter ist kein Mangel, sondern Reifung',
    ] },
  { week: 12, phase: 'trocknung', titel: 'Trocknung & Curing',
    phMin: 0, phMax: 0, ecMin: 0, ecMax: 0,
    waterLiters: '—', drainPercent: '—',
    aktionen: [
      'Trocknung: 18–20 °C, 55–60 % RLF, dunkel, 8–12 Tage',
      'Luft zirkuliert, aber kein Direktwind auf die Blüten',
      'Stängel-Knick-Test: fertig wenn Stängel biegt statt knickt',
      'Curing im Behälter mit Hygrometer, Ziel 55–60 % RLF',
    ] },
];

export interface Grow {
  id: string;
  strain: string;            // z.B. "Mimosa Zkittlez Auto"
  plantCount: number;
  startDate: number;         // Keimungsdatum (timestamp)
  potLiters: number;         // 20
  plan: PlanWeek[];          // GROWSTORYS_AUTO_PLAN
}

export function currentGrowWeek(grow: Grow): number {
  const days = (Date.now() - grow.startDate) / 86400000;
  return Math.min(Math.max(Math.floor(days / 7) + 1, 1), grow.plan.length);
}

export function currentPlanWeek(grow: Grow): PlanWeek {
  return grow.plan[currentGrowWeek(grow) - 1];
}

// Ampel: vergleicht Ist-Messung mit Soll-Korridor
export type TrafficLight = 'green' | 'yellow' | 'red';
export function checkAgainstPlan(value: number, min: number, max: number): TrafficLight {
  if (min === 0 && max === 0) return 'green';
  const tolerance = (max - min) * 0.25 + 0.1;
  if (value >= min && value <= max) return 'green';
  if (value >= min - tolerance && value <= max + tolerance) return 'yellow';
  return 'red';
}
