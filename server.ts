import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '25mb' }));

// Initialise GoogleGenAI
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// System Prompt for Botanical Cannabis Expert (Differentiating Soil and Aeroponic)
const BOTANIST_SYSTEM_PROMPT = `Du bist ein erfahrener Botaniker mit über 20 Jahren Praxis in der Pflanzenkunde, spezialisiert auf Cannabis sativa L. Du verfügst über tiefgreifendes Wissen über gängige Genetiken und Sortenlinien (Sativa, Indica, Ruderalis, Hybride, Autoflower), Cannabinoid- und Terpenprofile, Wachstums- und Blütephysiologie sowie die Diagnose von Nährstoffmängeln, Schädlingsbefall und Wurzelerkrankungen.

Du beherrschst sowohl den Anbau in Bodensubstraten (Soil, Living Soil, BioBizz, Plagron, Kokos, Stofftöpfe, organische Mikrobiologie) als auch in substratlosen Aeroponik-Systemen (HPA Hochdruck 5–8 bar, LPA Niederdruck, Sprühdüsen, Nährlösungsmanagement, Pythium-Prävention).

Kontext: Der Nutzer ist eine Privatperson in Deutschland, die Cannabis im Rahmen des legalen Eigenanbaus nach dem Konsumcannabisgesetz (KCanG § 9 / § 10) kultiviert. 

WICHTIG - UNTERSCHEIDUNG DES ANBAUVERFAHRENS (SOIL vs. AEROPONIC):
Prüfe stets das übermittelte Anbauverfahren (cultivationMethod: 'soil' | 'aeroponic'):
- BEI SOIL (ERDE/SUBSTRAT):
  * pH-Zielkorridor: 6.2 – 6.8 (organisch puffert die Erde oft selbst).
  * Beurteile Gießmengen (1/3-Regel: Gießvolumen ca. 1/3 des Topfvolumens), Gießintervalle, Topfgewicht und Trocknungszyklen.
  * Prüfe typische Bodenprobleme: Staunässe, Wurzelerstickung durch tägliches Gießen in zu großen Töpfen, Trauermückenbefall, Versalzung des Substrats, Kationenaustausch-Blockaden (Calcium/Magnesium Antagonismus in Kokos/Erde).
  * Behandlungsanweisungen beziehen sich auf Substratspülung, Trockenphasen, Nematoden (SF-Nematoden gegen Trauermücken), mikrobielle Bodenaktivatoren (Mykorrhiza, Komposttee).
- BEI AEROPONIC:
  * pH-Zielkorridor: 5.6 – 6.0.
  * Beurteile Sprühdüsen (30–50 µm HPA vs. 100–150 µm LPA), Sprühintervalle (z.B. 3s An / 180s Aus), Wassertemperatur (>21°C akutes Pythium-Risiko!), Sauerstoffgehalt (DO).
  * Behandlungsanweisungen beziehen sich auf Tankspülung, H2O2-Behandlung, Chiller-Einsatz, Düsenreinigung und akute Fäulnisprävention.

Halte dich strikt an folgende Aufgaben und Richtlinien:
1. Eingaben prüfen: Daten auf Belastbarkeit prüfen. Fehlende Angaben kennzeichnen.
2. Anbaudaten erfassen: Sorte, Typ, Wachstumsphase & exakte Woche, Anbausystem (Soil vs Aero), Düngung, Messwerte (pH, EC mit Faktor, Temperatur, RLF, VPD), Licht, Symptome & Wurzel-/Bodenzustand.
3. Symptom-Analyse: Verständlicher Fließtext, physiologische Prozesse, betroffene Zonen (alte vs. junge Blätter, Adern vs. Blattfläche, Wurzeln/Substrat).
4. Ursachenermittlung: Geordnet nach Wahrscheinlichkeit (häufigste zuerst) mit entscheidenden Unterscheidungsmerkmalen.
5. Behandlungsanleitung erstellen: Schrittweise mit Werkzeugen, Handlungsanweisungen, Sicherheitshinweisen, Zielwerten und Prüfverfahren.
6. Erfolgskontroll-Checkliste: Tabellarisch nach Zeiträumen (12h/24h, 3-5 Tage, 7-10 Tage). Hinweis: Geschädigte Blätter erholen sich nicht, Neuaustrieb zählt.

Nutze ausschließlich metrische Einheiten (°C, ml, l, ml/l, g, mS/cm, ppm, bar, µm, µmol/m²/s). Erkläre Fachbegriffe beim ersten Auftreten kurz.

WICHTIG - FORMATIERUNG:
Gib die Antwort exakt in den drei Teilen aus:
Teil 1 – Problemanalyse (Fließtext)
Teil 2 – Behandlungsanleitung (Markdown für PDF)
Teil 3 – Erfolgskontrolle und Vorbeugung (Markdown für PDF)`;

app.post('/api/diagnose', async (req: Request, res: Response) => {
  try {
    const {
      cultivationMethod,
      soilData,
      strain,
      strainType,
      phase,
      week,
      systemType,
      systemBrand,
      nozzlesCount,
      nozzleType,
      pressureBar,
      intervalOnSeconds,
      intervalOffSeconds,
      nutrientBrand,
      nutrientProducts,
      nutrientDose,
      tankVolumeL,
      lastChangeDays,
      additives,
      ph,
      ec,
      ecFactor,
      waterTemp,
      rootZoneTemp,
      ambientTemp,
      ambientHumidity,
      vpd,
      lightingType,
      lightingWattage,
      lightingDistanceCm,
      lightingCycle,
      ppfd,
      leafSymptoms,
      rootSymptoms,
      additionalObservations,
      photoBase64,
      photoMimeType,
    } = req.body;

    const isSoil = cultivationMethod === 'soil';

    // Build comprehensive prompt based on cultivation system
    const userPrompt = `Hier sind die erfassten Anbau- und Diagnosedaten:

### 1. Anbaudaten & System (${isSoil ? 'SOIL / ERDE' : 'AEROPONIK'}):
- Anbaumedium: ${isSoil ? 'Bodenkultur (Soil / Erde / Substrat)' : 'Aeroponik (HPA/LPA)'}
- Sorte/Genetik: ${strain || 'nicht angegeben'}
- Typ: ${strainType || 'nicht angegeben'}
- Wachstumsphase und exakte Woche: ${phase || 'nicht angegeben'}, Woche ${week || 'nicht angegeben'}
${
  isSoil
    ? `- Substratdetails:
  * Substrat: ${soilData?.substrateType || 'Erde/Substrat'}
  * Topfgröße: ${soilData?.potSizeLiters ? soilData.potSizeLiters + ' Liter' : 'Standard'} (${soilData?.potType || 'Topf'})
  * Letztes Gießen: vor ${soilData?.lastWateringDays || 'nicht angegeben'} Tagen
  * Gießvolumen: ${soilData?.wateringVolumePerPlantL ? soilData.wateringVolumePerPlantL + ' Liter' : 'nicht angegeben'}
  * Bodenfeuchtigkeit: ${soilData?.soilMoistureStatus || 'nicht angegeben'}
  * Drain-Messwerte: pH ${soilData?.runoffPh || 'keiner'}, EC ${soilData?.runoffEc || 'keiner'}`
    : `- Aeroponik-System: ${systemType || 'nicht angegeben'} (${systemBrand ? 'Modell: ' + systemBrand : 'Eigenbau'}), Düsen: ${nozzlesCount || 'nicht angegeben'} (${nozzleType || 'nicht angegeben'}), Betriebsdruck: ${pressureBar ? pressureBar + ' bar' : 'nicht angegeben'}, Sprühintervall: ${intervalOnSeconds ? intervalOnSeconds + 's an' : 'nicht angegeben'} / ${intervalOffSeconds ? intervalOffSeconds + 's aus' : 'nicht angegeben'}`
}
- Nährlösung/Düngung: Hersteller: ${nutrientBrand || 'nicht angegeben'}, Produkte: ${nutrientProducts || 'nicht angegeben'}, Dosierung: ${nutrientDose || 'nicht angegeben'}, Volumen: ${tankVolumeL ? tankVolumeL + ' Liter' : 'nicht angegeben'}, Letzter Wechsel/Spülung: vor ${lastChangeDays ? lastChangeDays + ' Tagen' : 'nicht angegeben'}, Zusätze: ${additives || 'nicht angegeben'}
- Messwerte:
  * pH-Wert: ${ph ?? 'nicht angegeben'} ${isSoil ? '(Gießwasser/Boden)' : '(Nährlösung)'}
  * EC-Wert: ${ec ?? 'nicht angegeben'} mS/cm (Faktor: ${ecFactor || '0.5'})
  * Wassertemperatur: ${waterTemp ? waterTemp + ' °C' : 'nicht angegeben'}
  * Wurzelraum-/Topftemperatur: ${rootZoneTemp ? rootZoneTemp + ' °C' : 'nicht angegeben'}
  * Raumtemperatur: ${ambientTemp ? ambientTemp + ' °C' : 'nicht angegeben'}
  * Relative Luftfeuchtigkeit: ${ambientHumidity ? ambientHumidity + ' %' : 'nicht angegeben'}
  * VPD: ${vpd ? vpd + ' kPa' : 'nicht angegeben'}
- Beleuchtung: ${lightingType || 'LED'}, ${lightingWattage ? lightingWattage + ' Watt' : ''}, Abstand: ${lightingDistanceCm ? lightingDistanceCm + ' cm' : ''}, Zyklus: ${lightingCycle || 'nicht angegeben'}, PPFD: ${ppfd ? ppfd + ' µmol/m²/s' : ''}

### 2. Symptome und Befunde:
- Blätter & Triebe: ${leafSymptoms || 'nicht angegeben'}
- Wurzeln / Substratzustand: ${rootSymptoms || 'nicht angegeben'}
- Zusätzliche Beobachtungen: ${additionalObservations || 'keine weiteren'}
${photoBase64 ? 'Hinweis: Ein Foto wurde beigefügt.' : 'Kein Foto beigefügt.'}

Erstelle nun deine vollständige, botanisch fundierte Analyse speziell abgestimmt auf das Anbaumedium (${isSoil ? 'SOIL ERDE' : 'AEROPONIK'}) in den drei festgelegten Teilen (Teil 1 – Problemanalyse als Fließtext, Teil 2 – Behandlungsanleitung als Markdown für PDF, Teil 3 – Erfolgskontrolle und Vorbeugung als Markdown für PDF).`;

    if (!ai) {
      const fallbackReport = generateAlgorithmicBotanicalReport(req.body);
      return res.json({
        success: true,
        report: fallbackReport,
        isFallback: true,
      });
    }

    let contentsPayload: any;
    if (photoBase64 && photoMimeType) {
      const cleanBase64 = photoBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      contentsPayload = {
        parts: [
          {
            inlineData: {
              mimeType: photoMimeType || 'image/jpeg',
              data: cleanBase64,
            },
          },
          {
            text: userPrompt,
          },
        ],
      };
    } else {
      contentsPayload = userPrompt;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contentsPayload,
      config: {
        systemInstruction: BOTANIST_SYSTEM_PROMPT,
        temperature: 0.2,
      },
    });

    return res.json({
      success: true,
      report: response.text,
      isFallback: false,
    });
  } catch (err: any) {
    console.error('Diagnosis generation failed:', err);
    return res.status(500).json({
      success: false,
      errorNotice: 'Botanischer Analyse-Service momentan nicht erreichbar: ' + (err.message || String(err)),
    });
  }
});

// Algorithmic Fallback Report for Soil and Aeroponic
function generateAlgorithmicBotanicalReport(data: any): string {
  const isSoil = data.cultivationMethod === 'soil';
  const strain = data.strain || 'Cannabis sativa L.';
  const phase = data.phase || 'Vegetation';
  const week = data.week || '3';
  const ph = parseFloat(data.ph) || (isSoil ? 6.4 : 5.8);
  const ec = parseFloat(data.ec) || 1.4;
  const waterTemp = parseFloat(data.waterTemp) || 19.5;

  if (isSoil) {
    const isOverwatered = data.soilData?.soilMoistureStatus === 'nass_staunaesse';
    return `**Teil 1 – Problemanalyse (Fließtext):**

# Diagnosebericht: ${strain} | ${phase} Woche ${week} | Soil (Bodenkultur)
**Hauptbefund:** ${isOverwatered ? 'Hypoxische Wurzelerstickung & Staunässe im Substrat' : 'Boden-Ungleichgewicht & Nährstoff-Lockout'}

Beim Anbau in Erde puffert das Substrat Ionenverschiebungen im Gegensatz zur Hydroponik ab. Bei einem pH von ${ph} und einem EC von ${ec} mS/cm ${
      ph < 6.0
        ? 'ist der Boden für organische Kulturen zu sauer, was zur Blockade von Phosphor und Magnesium führt.'
        : ph > 7.0
        ? 'ist das Milieu zu alkalisch, was Spurenelemente wie Eisen und Zink ausfallen lässt.'
        : 'liegt der pH im akzeptablen Bereich von 6.2–6.8.'
    } 

${
  isOverwatered
    ? 'Der Topf weist Anzeichen einer chronischen Überwässerung auf. Wenn die Porenräume des Substrats permanent mit Wasser gefüllt sind, bricht die Sauerstoffdiffusion zusammen. Die Wurzelhaare ersticken, und anaerobe Fäulnisbakterien schädigen die Wurzelspitzen.'
    : 'Das Wurzelmilieu zeigt typische Stressanzeichen bezüglich Nährstoffbalance und mikrobieller Aktivität.'
}

**Ursachen geordnet nach Wahrscheinlichkeit:**
1. **${isOverwatered ? 'Substrat-Staunässe und Sauerstoffmangel im Wurzelballen' : 'Nährstoffakkumulation und Salzablagerungen im unteren Topfdrittel'}**
2. **Kationenaustausch-Ungleichgewicht (Cal/Mag Mangel):** Insbesondere unter intensiven LED-Vollspektren verbrauchen Pflanzen mehr Calcium und Magnesium als Standard-Erden nachliefern können.
3. **Wurzelstau oder beginnender Trauermücken-Larvenbefall:** Bei zu nasser Erdoberfläche legen Trauermücken Eier ab; die Larven fressen an den feinsten Wurzelhärchen.

---

**Teil 2 – Behandlungsanleitung (Markdown für PDF):**

# Behandlungsanleitung: Bodenkultur & Nährstoff-Ausgleich

## Übersicht
- Dringlichkeit: ${isOverwatered ? 'SOFORT' : 'innerhalb 24 h'}
- Geschätzter Zeitaufwand: 30–45 Minuten

## Sofortmaßnahmen
1. **Gießstopp & Abtrocknungsphase:** Topf vollständig abtrocknen lassen, bis das Gewicht spürbar um 50–60% abgenommen hat (1/3-Regel anwenden).
2. **Belüftung der Rhizosphäre:** Untersetzer sofort von stehendem Drain-Wasser befreien. Für Luftzirkulation am Topfboden sorgen.
3. **Drain-Check:** Beim nächsten Gießen mit 15–20% Drain gießen und pH/EC des Ablaufs prüfen.
4. **Mikrobiologie stärken:** Frische Mykorrhiza-Pilze oder aeroben Komposttee zur Wiederherstellung der nützlichen Bodenflora verabreichen.

---

**Teil 3 – Erfolgskontrolle und Vorbeugung:**

| Zeitraum | Zu prüfender Parameter | Soll-Zustand | KCanG Konformität |
|---|---|---|---|
| **24 Stunden** | Topfgewicht & Turgor | Keine Staunässe im Untersetzer | § 9 Abs. 1 KCanG eingehalten |
| **3–5 Tage** | Substratoberfläche | Hellbraun, abgetrocknet | Schutz vor Schimmel gem. § 10 |
| **7–10 Tage** | Neuaustrieb | Satte grüne Blattfarbe ohne Krallen | Vitaler Ernteertrag im 50g-Limit |`;
  }

  // Aeroponic fallback
  const isPythiumRisk = waterTemp >= 21.0;
  return `**Teil 1 – Problemanalyse (Fließtext):**

# Diagnosebericht: ${strain} | ${phase} Woche ${week} | Aeroponik (HPA/LPA)
**Hauptbefund:** ${isPythiumRisk ? 'Akutes Pythium-Risiko & Rhizosphäre-Hypoxie (Wassertemperatur >= 21°C)' : 'Nährlösungs-Dysbalance'}

In der Aeroponik hängen die Wurzeln frei in der Luftkammer ohne Puffermedium. Mit einem pH-Wert von ${ph} und Wassertemperatur ${waterTemp} °C ${
    isPythiumRisk
      ? 'sinkt ab 21 °C der gelöste Sauerstoff rapide ab, während Oomyceten wie Pythium ultimum explosionsartig gedeihen.'
      : 'ist das System stabil, sofern die Vernebelungsdüsen frei von Verkrustungen sind.'
  }

**Ursachen geordnet nach Wahrscheinlichkeit:**
1. **${isPythiumRisk ? 'Sauerstoffmangel und Pythium-Biofilm in der Wurzelkammer' : 'pH-induzierter Nährstoff-Lockout'}**
2. **Düsenverstopfung oder asymmetrischer Sprühkegel**
3. **Cal/Mag Mangel unter starker LED-Beleuchtung**

---

**Teil 2 – Behandlungsanleitung (Markdown für PDF):**

# Behandlungsanleitung: Aeroponik-System Spülung & Sanierung

## Übersicht
- Dringlichkeit: ${isPythiumRisk ? 'SOFORT' : 'innerhalb 24 h'}
- Zeitaufwand: 45 Minuten

## Sofortmaßnahmen
1. **Nährlösung austauschen & kühlen:** Tank entleeren, Reservoir auf 18.5–19.5 °C kühlen (Chiller).
2. **Wurzelspülung:** Wurzeln mit 3%iger H2O2-Lösung (2–3 ml/l Wasser) sanft besprühen, um Biofilme zu lösen.
3. **Düsencheck:** Alle Düsen auf vollen 360°-Sprühkegel und 30–50 µm Schwebenebel prüfen.

---

**Teil 3 – Erfolgskontrolle und Vorbeugung:**

| Zeitraum | Zu prüfender Parameter | Soll-Zustand | KCanG Konformität |
|---|---|---|---|
| **12–24 Stunden** | Wurzelfarbe & Wassertemperatur | < 20.0 °C, kein modriger Geruch | § 9 Abs. 1 KCanG konform |
| **3–5 Tage** | Neuaustrieb Wurzelhaare | Strahlend weiße Trichoblasten | Schutz vor Fäulnis gem. § 10 |
| **7–10 Tage** | Turgor & Blattkronen | Saftiges Grün, ideale Transpiration | Qualitätsanbau im legalen Rahmen |`;
}

// In development, mount Vite middleware; in production serve static files
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  // Development mode: Vite dynamic middlewares
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`KCanG Botaniker Backend läuft auf Port ${PORT}`);
});
