import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
app.use(express.json({ limit: "25mb" }));
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
}) : null;
const BOTANIST_SYSTEM_PROMPT = `Du bist ein erfahrener Botaniker mit \xFCber 20 Jahren Praxis in der Pflanzenkunde, spezialisiert auf Cannabis sativa L. Du verf\xFCgst \xFCber tiefgreifendes Wissen \xFCber g\xE4ngige Genetiken und Sortenlinien (Sativa, Indica, Ruderalis, Hybride, Autoflower), Cannabinoid- und Terpenprofile, Wachstums- und Bl\xFCtephysiologie sowie die Diagnose von N\xE4hrstoffm\xE4ngeln, Sch\xE4dlingsbefall und Wurzelerkrankungen.

Du beherrschst sowohl den Anbau in Bodensubstraten (Soil, Living Soil, BioBizz, Plagron, Kokos, Stofft\xF6pfe, organische Mikrobiologie) als auch in substratlosen Aeroponik-Systemen (HPA Hochdruck 5\u20138 bar, LPA Niederdruck, Spr\xFChd\xFCsen, N\xE4hrl\xF6sungsmanagement, Pythium-Pr\xE4vention).

Kontext: Der Nutzer ist eine Privatperson in Deutschland, die Cannabis im Rahmen des legalen Eigenanbaus nach dem Konsumcannabisgesetz (KCanG \xA7 9 / \xA7 10) kultiviert. 

WICHTIG - UNTERSCHEIDUNG DES ANBAUVERFAHRENS (SOIL vs. AEROPONIC):
Pr\xFCfe stets das \xFCbermittelte Anbauverfahren (cultivationMethod: 'soil' | 'aeroponic'):
- BEI SOIL (ERDE/SUBSTRAT):
  * pH-Zielkorridor: 6.2 \u2013 6.8 (organisch puffert die Erde oft selbst).
  * Beurteile Gie\xDFmengen (1/3-Regel: Gie\xDFvolumen ca. 1/3 des Topfvolumens), Gie\xDFintervalle, Topfgewicht und Trocknungszyklen.
  * Pr\xFCfe typische Bodenprobleme: Staun\xE4sse, Wurzelerstickung durch t\xE4gliches Gie\xDFen in zu gro\xDFen T\xF6pfen, Trauerm\xFCckenbefall, Versalzung des Substrats, Kationenaustausch-Blockaden (Calcium/Magnesium Antagonismus in Kokos/Erde).
  * Behandlungsanweisungen beziehen sich auf Substratsp\xFClung, Trockenphasen, Nematoden (SF-Nematoden gegen Trauerm\xFCcken), mikrobielle Bodenaktivatoren (Mykorrhiza, Komposttee).
- BEI AEROPONIC:
  * pH-Zielkorridor: 5.6 \u2013 6.0.
  * Beurteile Spr\xFChd\xFCsen (30\u201350 \xB5m HPA vs. 100\u2013150 \xB5m LPA), Spr\xFChintervalle (z.B. 3s An / 180s Aus), Wassertemperatur (>21\xB0C akutes Pythium-Risiko!), Sauerstoffgehalt (DO).
  * Behandlungsanweisungen beziehen sich auf Tanksp\xFClung, H2O2-Behandlung, Chiller-Einsatz, D\xFCsenreinigung und akute F\xE4ulnispr\xE4vention.

Halte dich strikt an folgende Aufgaben und Richtlinien:
1. Eingaben pr\xFCfen: Daten auf Belastbarkeit pr\xFCfen. Fehlende Angaben kennzeichnen.
2. Anbaudaten erfassen: Sorte, Typ, Wachstumsphase & exakte Woche, Anbausystem (Soil vs Aero), D\xFCngung, Messwerte (pH, EC mit Faktor, Temperatur, RLF, VPD), Licht, Symptome & Wurzel-/Bodenzustand.
3. Symptom-Analyse: Verst\xE4ndlicher Flie\xDFtext, physiologische Prozesse, betroffene Zonen (alte vs. junge Bl\xE4tter, Adern vs. Blattfl\xE4che, Wurzeln/Substrat).
4. Ursachenermittlung: Geordnet nach Wahrscheinlichkeit (h\xE4ufigste zuerst) mit entscheidenden Unterscheidungsmerkmalen.
5. Behandlungsanleitung erstellen: Schrittweise mit Werkzeugen, Handlungsanweisungen, Sicherheitshinweisen, Zielwerten und Pr\xFCfverfahren.
6. Erfolgskontroll-Checkliste: Tabellarisch nach Zeitr\xE4umen (12h/24h, 3-5 Tage, 7-10 Tage). Hinweis: Gesch\xE4digte Bl\xE4tter erholen sich nicht, Neuaustrieb z\xE4hlt.

Nutze ausschlie\xDFlich metrische Einheiten (\xB0C, ml, l, ml/l, g, mS/cm, ppm, bar, \xB5m, \xB5mol/m\xB2/s). Erkl\xE4re Fachbegriffe beim ersten Auftreten kurz.

WICHTIG - FORMATIERUNG:
Gib die Antwort exakt in den drei Teilen aus:
Teil 1 \u2013 Problemanalyse (Flie\xDFtext)
Teil 2 \u2013 Behandlungsanleitung (Markdown f\xFCr PDF)
Teil 3 \u2013 Erfolgskontrolle und Vorbeugung (Markdown f\xFCr PDF)`;
app.post("/api/diagnose", async (req, res) => {
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
      photoMimeType
    } = req.body;
    const isSoil = cultivationMethod === "soil";
    const userPrompt = `Hier sind die erfassten Anbau- und Diagnosedaten:

### 1. Anbaudaten & System (${isSoil ? "SOIL / ERDE" : "AEROPONIK"}):
- Anbaumedium: ${isSoil ? "Bodenkultur (Soil / Erde / Substrat)" : "Aeroponik (HPA/LPA)"}
- Sorte/Genetik: ${strain || "nicht angegeben"}
- Typ: ${strainType || "nicht angegeben"}
- Wachstumsphase und exakte Woche: ${phase || "nicht angegeben"}, Woche ${week || "nicht angegeben"}
${isSoil ? `- Substratdetails:
  * Substrat: ${soilData?.substrateType || "Erde/Substrat"}
  * Topfgr\xF6\xDFe: ${soilData?.potSizeLiters ? soilData.potSizeLiters + " Liter" : "Standard"} (${soilData?.potType || "Topf"})
  * Letztes Gie\xDFen: vor ${soilData?.lastWateringDays || "nicht angegeben"} Tagen
  * Gie\xDFvolumen: ${soilData?.wateringVolumePerPlantL ? soilData.wateringVolumePerPlantL + " Liter" : "nicht angegeben"}
  * Bodenfeuchtigkeit: ${soilData?.soilMoistureStatus || "nicht angegeben"}
  * Drain-Messwerte: pH ${soilData?.runoffPh || "keiner"}, EC ${soilData?.runoffEc || "keiner"}` : `- Aeroponik-System: ${systemType || "nicht angegeben"} (${systemBrand ? "Modell: " + systemBrand : "Eigenbau"}), D\xFCsen: ${nozzlesCount || "nicht angegeben"} (${nozzleType || "nicht angegeben"}), Betriebsdruck: ${pressureBar ? pressureBar + " bar" : "nicht angegeben"}, Spr\xFChintervall: ${intervalOnSeconds ? intervalOnSeconds + "s an" : "nicht angegeben"} / ${intervalOffSeconds ? intervalOffSeconds + "s aus" : "nicht angegeben"}`}
- N\xE4hrl\xF6sung/D\xFCngung: Hersteller: ${nutrientBrand || "nicht angegeben"}, Produkte: ${nutrientProducts || "nicht angegeben"}, Dosierung: ${nutrientDose || "nicht angegeben"}, Volumen: ${tankVolumeL ? tankVolumeL + " Liter" : "nicht angegeben"}, Letzter Wechsel/Sp\xFClung: vor ${lastChangeDays ? lastChangeDays + " Tagen" : "nicht angegeben"}, Zus\xE4tze: ${additives || "nicht angegeben"}
- Messwerte:
  * pH-Wert: ${ph ?? "nicht angegeben"} ${isSoil ? "(Gie\xDFwasser/Boden)" : "(N\xE4hrl\xF6sung)"}
  * EC-Wert: ${ec ?? "nicht angegeben"} mS/cm (Faktor: ${ecFactor || "0.5"})
  * Wassertemperatur: ${waterTemp ? waterTemp + " \xB0C" : "nicht angegeben"}
  * Wurzelraum-/Topftemperatur: ${rootZoneTemp ? rootZoneTemp + " \xB0C" : "nicht angegeben"}
  * Raumtemperatur: ${ambientTemp ? ambientTemp + " \xB0C" : "nicht angegeben"}
  * Relative Luftfeuchtigkeit: ${ambientHumidity ? ambientHumidity + " %" : "nicht angegeben"}
  * VPD: ${vpd ? vpd + " kPa" : "nicht angegeben"}
- Beleuchtung: ${lightingType || "LED"}, ${lightingWattage ? lightingWattage + " Watt" : ""}, Abstand: ${lightingDistanceCm ? lightingDistanceCm + " cm" : ""}, Zyklus: ${lightingCycle || "nicht angegeben"}, PPFD: ${ppfd ? ppfd + " \xB5mol/m\xB2/s" : ""}

### 2. Symptome und Befunde:
- Bl\xE4tter & Triebe: ${leafSymptoms || "nicht angegeben"}
- Wurzeln / Substratzustand: ${rootSymptoms || "nicht angegeben"}
- Zus\xE4tzliche Beobachtungen: ${additionalObservations || "keine weiteren"}
${photoBase64 ? "Hinweis: Ein Foto wurde beigef\xFCgt." : "Kein Foto beigef\xFCgt."}

Erstelle nun deine vollst\xE4ndige, botanisch fundierte Analyse speziell abgestimmt auf das Anbaumedium (${isSoil ? "SOIL ERDE" : "AEROPONIK"}) in den drei festgelegten Teilen (Teil 1 \u2013 Problemanalyse als Flie\xDFtext, Teil 2 \u2013 Behandlungsanleitung als Markdown f\xFCr PDF, Teil 3 \u2013 Erfolgskontrolle und Vorbeugung als Markdown f\xFCr PDF).`;
    if (!ai) {
      const fallbackReport = generateAlgorithmicBotanicalReport(req.body);
      return res.json({
        success: true,
        report: fallbackReport,
        isFallback: true
      });
    }
    let contentsPayload;
    if (photoBase64 && photoMimeType) {
      const cleanBase64 = photoBase64.replace(/^data:image\/[a-z]+;base64,/, "");
      contentsPayload = {
        parts: [
          {
            inlineData: {
              mimeType: photoMimeType || "image/jpeg",
              data: cleanBase64
            }
          },
          {
            text: userPrompt
          }
        ]
      };
    } else {
      contentsPayload = userPrompt;
    }
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: contentsPayload,
      config: {
        systemInstruction: BOTANIST_SYSTEM_PROMPT,
        temperature: 0.2
      }
    });
    return res.json({
      success: true,
      report: response.text,
      isFallback: false
    });
  } catch (err) {
    console.error("Diagnosis generation failed:", err);
    return res.status(500).json({
      success: false,
      errorNotice: "Botanischer Analyse-Service momentan nicht erreichbar: " + (err.message || String(err))
    });
  }
});
function generateAlgorithmicBotanicalReport(data) {
  const isSoil = data.cultivationMethod === "soil";
  const strain = data.strain || "Cannabis sativa L.";
  const phase = data.phase || "Vegetation";
  const week = data.week || "3";
  const ph = parseFloat(data.ph) || (isSoil ? 6.4 : 5.8);
  const ec = parseFloat(data.ec) || 1.4;
  const waterTemp = parseFloat(data.waterTemp) || 19.5;
  if (isSoil) {
    const isOverwatered = data.soilData?.soilMoistureStatus === "nass_staunaesse";
    return `**Teil 1 \u2013 Problemanalyse (Flie\xDFtext):**

# Diagnosebericht: ${strain} | ${phase} Woche ${week} | Soil (Bodenkultur)
**Hauptbefund:** ${isOverwatered ? "Hypoxische Wurzelerstickung & Staun\xE4sse im Substrat" : "Boden-Ungleichgewicht & N\xE4hrstoff-Lockout"}

Beim Anbau in Erde puffert das Substrat Ionenverschiebungen im Gegensatz zur Hydroponik ab. Bei einem pH von ${ph} und einem EC von ${ec} mS/cm ${ph < 6 ? "ist der Boden f\xFCr organische Kulturen zu sauer, was zur Blockade von Phosphor und Magnesium f\xFChrt." : ph > 7 ? "ist das Milieu zu alkalisch, was Spurenelemente wie Eisen und Zink ausfallen l\xE4sst." : "liegt der pH im akzeptablen Bereich von 6.2\u20136.8."} 

${isOverwatered ? "Der Topf weist Anzeichen einer chronischen \xDCberw\xE4sserung auf. Wenn die Porenr\xE4ume des Substrats permanent mit Wasser gef\xFCllt sind, bricht die Sauerstoffdiffusion zusammen. Die Wurzelhaare ersticken, und anaerobe F\xE4ulnisbakterien sch\xE4digen die Wurzelspitzen." : "Das Wurzelmilieu zeigt typische Stressanzeichen bez\xFCglich N\xE4hrstoffbalance und mikrobieller Aktivit\xE4t."}

**Ursachen geordnet nach Wahrscheinlichkeit:**
1. **${isOverwatered ? "Substrat-Staun\xE4sse und Sauerstoffmangel im Wurzelballen" : "N\xE4hrstoffakkumulation und Salzablagerungen im unteren Topfdrittel"}**
2. **Kationenaustausch-Ungleichgewicht (Cal/Mag Mangel):** Insbesondere unter intensiven LED-Vollspektren verbrauchen Pflanzen mehr Calcium und Magnesium als Standard-Erden nachliefern k\xF6nnen.
3. **Wurzelstau oder beginnender Trauerm\xFCcken-Larvenbefall:** Bei zu nasser Erdoberfl\xE4che legen Trauerm\xFCcken Eier ab; die Larven fressen an den feinsten Wurzelh\xE4rchen.

---

**Teil 2 \u2013 Behandlungsanleitung (Markdown f\xFCr PDF):**

# Behandlungsanleitung: Bodenkultur & N\xE4hrstoff-Ausgleich

## \xDCbersicht
- Dringlichkeit: ${isOverwatered ? "SOFORT" : "innerhalb 24 h"}
- Gesch\xE4tzter Zeitaufwand: 30\u201345 Minuten

## Sofortma\xDFnahmen
1. **Gie\xDFstopp & Abtrocknungsphase:** Topf vollst\xE4ndig abtrocknen lassen, bis das Gewicht sp\xFCrbar um 50\u201360% abgenommen hat (1/3-Regel anwenden).
2. **Bel\xFCftung der Rhizosph\xE4re:** Untersetzer sofort von stehendem Drain-Wasser befreien. F\xFCr Luftzirkulation am Topfboden sorgen.
3. **Drain-Check:** Beim n\xE4chsten Gie\xDFen mit 15\u201320% Drain gie\xDFen und pH/EC des Ablaufs pr\xFCfen.
4. **Mikrobiologie st\xE4rken:** Frische Mykorrhiza-Pilze oder aeroben Komposttee zur Wiederherstellung der n\xFCtzlichen Bodenflora verabreichen.

---

**Teil 3 \u2013 Erfolgskontrolle und Vorbeugung:**

| Zeitraum | Zu pr\xFCfender Parameter | Soll-Zustand | KCanG Konformit\xE4t |
|---|---|---|---|
| **24 Stunden** | Topfgewicht & Turgor | Keine Staun\xE4sse im Untersetzer | \xA7 9 Abs. 1 KCanG eingehalten |
| **3\u20135 Tage** | Substratoberfl\xE4che | Hellbraun, abgetrocknet | Schutz vor Schimmel gem. \xA7 10 |
| **7\u201310 Tage** | Neuaustrieb | Satte gr\xFCne Blattfarbe ohne Krallen | Vitaler Ernteertrag im 50g-Limit |`;
  }
  const isPythiumRisk = waterTemp >= 21;
  return `**Teil 1 \u2013 Problemanalyse (Flie\xDFtext):**

# Diagnosebericht: ${strain} | ${phase} Woche ${week} | Aeroponik (HPA/LPA)
**Hauptbefund:** ${isPythiumRisk ? "Akutes Pythium-Risiko & Rhizosph\xE4re-Hypoxie (Wassertemperatur >= 21\xB0C)" : "N\xE4hrl\xF6sungs-Dysbalance"}

In der Aeroponik h\xE4ngen die Wurzeln frei in der Luftkammer ohne Puffermedium. Mit einem pH-Wert von ${ph} und Wassertemperatur ${waterTemp} \xB0C ${isPythiumRisk ? "sinkt ab 21 \xB0C der gel\xF6ste Sauerstoff rapide ab, w\xE4hrend Oomyceten wie Pythium ultimum explosionsartig gedeihen." : "ist das System stabil, sofern die Vernebelungsd\xFCsen frei von Verkrustungen sind."}

**Ursachen geordnet nach Wahrscheinlichkeit:**
1. **${isPythiumRisk ? "Sauerstoffmangel und Pythium-Biofilm in der Wurzelkammer" : "pH-induzierter N\xE4hrstoff-Lockout"}**
2. **D\xFCsenverstopfung oder asymmetrischer Spr\xFChkegel**
3. **Cal/Mag Mangel unter starker LED-Beleuchtung**

---

**Teil 2 \u2013 Behandlungsanleitung (Markdown f\xFCr PDF):**

# Behandlungsanleitung: Aeroponik-System Sp\xFClung & Sanierung

## \xDCbersicht
- Dringlichkeit: ${isPythiumRisk ? "SOFORT" : "innerhalb 24 h"}
- Zeitaufwand: 45 Minuten

## Sofortma\xDFnahmen
1. **N\xE4hrl\xF6sung austauschen & k\xFChlen:** Tank entleeren, Reservoir auf 18.5\u201319.5 \xB0C k\xFChlen (Chiller).
2. **Wurzelsp\xFClung:** Wurzeln mit 3%iger H2O2-L\xF6sung (2\u20133 ml/l Wasser) sanft bespr\xFChen, um Biofilme zu l\xF6sen.
3. **D\xFCsencheck:** Alle D\xFCsen auf vollen 360\xB0-Spr\xFChkegel und 30\u201350 \xB5m Schwebenebel pr\xFCfen.

---

**Teil 3 \u2013 Erfolgskontrolle und Vorbeugung:**

| Zeitraum | Zu pr\xFCfender Parameter | Soll-Zustand | KCanG Konformit\xE4t |
|---|---|---|---|
| **12\u201324 Stunden** | Wurzelfarbe & Wassertemperatur | < 20.0 \xB0C, kein modriger Geruch | \xA7 9 Abs. 1 KCanG konform |
| **3\u20135 Tage** | Neuaustrieb Wurzelhaare | Strahlend wei\xDFe Trichoblasten | Schutz vor F\xE4ulnis gem. \xA7 10 |
| **7\u201310 Tage** | Turgor & Blattkronen | Saftiges Gr\xFCn, ideale Transpiration | Qualit\xE4tsanbau im legalen Rahmen |`;
}
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "dist")));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
} else {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa"
  });
  app.use(vite.middlewares);
}
app.listen(PORT, "0.0.0.0", () => {
  console.log(`KCanG Botaniker Backend l\xE4uft auf Port ${PORT}`);
});
