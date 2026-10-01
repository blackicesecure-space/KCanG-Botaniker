import React, { useState } from 'react';
import {
  Scale,
  Shield,
  Zap,
  Droplets,
  AlertTriangle,
  Beaker,
  CheckCircle,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Leaf,
  Sun,
  Bug,
  Award,
} from 'lucide-react';

export const KCanGKnowledgeBase: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'library' | 'botany' | 'climate' | 'substrate' | 'ipm' | 'standards'>('library');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                  Fachbibliothek (760 Seiten)
                </span>
                <span className="text-xs text-slate-400 font-mono">Stand: 2026</span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight mt-1">
                KCanG BodenBotaniker — Umfassende Wissensbasis & Botanische Enzyklopädie
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
                Basierend auf der zusammengeführten Fachbibliothek (Ed Rosenthal, Cornell University Production Manual 2023, Cranshaw IPM, FLUENCE Cultivation Guide & FOCUS Standards). Für professionelle Botanikerinnen und fortgeschrittene Anbauer.
              </p>
            </div>
          </div>
        </div>

        {/* Category Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 border-t border-slate-800 pt-4">
          {[
            { id: 'library', label: '📚 Quellen & Fachbibliothek', icon: BookOpen },
            { id: 'botany', label: '🌿 Botanik & Chemotypen', icon: Leaf },
            { id: 'climate', label: '☀️ Klima & VPD', icon: Sun },
            { id: 'substrate', label: '💧 Substrate & Fertigation', icon: Droplets },
            { id: 'ipm', label: '🐛 IPM & Phytopathologie', icon: Bug },
            { id: 'standards', label: '⚖️ Regulatorik & GMP', icon: Award },
          ].map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CATEGORY 1: LIBRARY & REFERENCES */}
      {activeCategory === 'library' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Inhaltsverzeichnis der zugrundeliegenden 760-Seiten-Fachbibliothek</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400">1. The Marijuana Grower's Handbook (Ed Rosenthal)</span>
                <p className="text-slate-400 text-[11px]">Grundlagen zu Pflanzenanatomie, Licht (HID/Fluoreszenz), CO₂-Düngung, Temperatur, Bewässerung, Stecklingsvermehrung und Curing.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400">2. Cornell Cannabis sativa L. Production Manual (2023)</span>
                <p className="text-slate-400 text-[11px]">Wissenschaftliche Standards für Anbau, Bodentestung, Nährstoffmanagement, Gewächshaus- und Inneneinrichtung in NYS.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400">3. FLUENCE Cannabis Cultivation Guide</span>
                <p className="text-slate-400 text-[11px]">Optimierung unter Hochleistungs-LEDs, DLI-Berechnungen, Psychrometrie, HVAC-Enthalpie und präzises Crop Steering.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400">4. Cranshaw / Perennia IPM Manuals</span>
                <p className="text-slate-400 text-[11px]">Integriertes Schädlingsmanagement (IPM), Bestimmung von Cannabis-Blattläusen, Hanf-Rostmilben, Maiszünsler und Biokontrollen.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400">5. FOCUS Cultivation Standard FS-1001</span>
                <p className="text-slate-400 text-[11px]">Qualitätsmanagementsysteme (QMS), HACCP-Gefahrenanalyse, Kontaminationskontrolle und Produkttests.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400">6. Hemp and Cannabis Crop Diseases (Shouhua Wang)</span>
                <p className="text-slate-400 text-[11px]">Feld- und Labordiagnose von pilzlichen, bakteriellen und viralen Pathogenen (Pythium, Fusarium, Powdery Mildew).</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY 2: BOTANY & CHEMOMERES */}
      {activeCategory === 'botany' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2 text-emerald-400">
                <Leaf className="w-4 h-4" />
                <span>Taxonomie & Cannabinoid-Biosynthese</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Cannabis sativa L. gehört zur Familie der Cannabacae (Hopfen- und Hanfgewächse). Die Pflanze synthetisiert Phytocannabinoide und Terpenoide in den epidermalen Drüsenhaaren (Trichomen), insbesondere den <strong>capitate-stalked Trichomen</strong> der weiblichen Infloreszenzen.
              </p>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5 font-mono">
                <div className="flex justify-between text-slate-300">
                  <span>CBGA (Vorläufer):</span>
                  <span className="text-emerald-400">Geranylpyrophosphat + Olivetolsäure</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>THCA-Synthase:</span>
                  <span className="text-amber-400">Wandelt CBGA in THCA um</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>CBDA-Synthase:</span>
                  <span className="text-cyan-400">Wandelt CBGA in CBDA um</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2 text-cyan-400">
                <Beaker className="w-4 h-4" />
                <span>Chemotypen (Small et al.)</span>
              </h4>
              <ul className="text-xs text-slate-300 space-y-2">
                <li><strong>Typ I (High-THC):</strong> THC &gt; 0.3%, CBD &lt; 0.5% (Medizinischer und Freizeit-Anbau).</li>
                <li><strong>Typ II (Intermediär):</strong> Ausgeglichenes Verhältnis von THC zu CBD (1:1 bis 10:1).</li>
                <li><strong>Typ III (High-CBD / Faser/Öl):</strong> CBD dominant, THC &lt; 0.3% (Faser- und Nutzhanf).</li>
                <li><strong>Typ IV (CBV/THCV):</strong> Hoher Anteil an Propyl-Cannabinoiden.</li>
                <li><strong>Typ V (CBGM / Chemisch leer):</strong> Spurenfreie oder kaum Cannabinoid-produzierende Linien.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY 3: CLIMATE & VPD */}
      {activeCategory === 'climate' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 text-amber-400">
              <Sun className="w-4 h-4" />
              <span>DLI (Daily Light Integral) & VPD-Optimierung (FLUENCE Guide)</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Cannabis ist eine Hochleistungs-Pflanze (High DLI, Short-Day Flowering). Unter hochenergetischen LEDs muss der VPD exakt nach Entwicklungsphase gesteuert werden, um stomatären Verschluss oder Transpirationskollaps zu verhindern.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400">Stecklinge / Klone</span>
                <p className="text-slate-400 text-[11px]">PPFD: 150–250 µmol/m²/s<br />VPD: 0.4 – 0.8 kPa<br />RLF: 80–90%</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400">Vegetative Phase</span>
                <p className="text-slate-400 text-[11px]">PPFD: 400–650 µmol/m²/s<br />VPD: 0.8 – 1.1 kPa<br />RLF: 55–70%</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400">Generative Blüte</span>
                <p className="text-slate-400 text-[11px]">PPFD: 800–1200+ µmol/m²/s<br />VPD: 1.2 – 1.5 kPa<br />RLF: 50–60%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY 4: SUBSTRATE & FERTIGATION */}
      {activeCategory === 'substrate' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 text-cyan-400">
              <Droplets className="w-4 h-4" />
              <span>Crop Steering in Steinwolle & Erde (Grodan & Rosenthal)</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Crop Steering</strong> beschreibt die gezielte Steuerung des Pflanzenwachstums durch Bewässerungshäufigkeit (Shot Size), Trockenrückgänge (Dry Backs) und EC-Führung.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="font-bold text-cyan-400">🌱 Vegetatives Steering</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Kleine Schoot-Größen (1–3% des Substratvolumens) bei hoher Frequenz. Kleine Nacht-Trockenrückgänge. Höhere Wassergehalte (VWC 70-80%) und niedrigere EC-Werte im Wurzelraum fördern Internodienwachstum und Blattmasse.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="font-bold text-amber-400">🌸 Generatives Steering</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Größere Schüsse (4–6%) bei niedrigerer Frequenz. Große Nacht-Trockenrückgänge (Dry Backs bis 30-40%). Erhöhter EC im Wurzelraum signalisiert der Pflanze generative Reifung und schränkt übermäßiges Strecken ein.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY 5: IPM & PATHOLOGY */}
      {activeCategory === 'ipm' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 text-rose-400">
              <Bug className="w-4 h-4" />
              <span>Integriertes Schädlingsmanagement (Cranshaw & Wang)</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="font-bold text-rose-400">Hanf-Rostmilbe (Aculops cannabicola)</span>
                <p className="text-slate-400 text-[11px]">Sehr winzig (Eriophyidae). Verursacht bronzefarbene Blätter, Aufwärtsrollen der Ränder und verminderte Harzproduktion. Bekämpfung mit Schwefelpräparaten oder mineralischen Ölen.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="font-bold text-rose-400">Pythium & Wurzel-Oomyceten</span>
                <p className="text-slate-400 text-[11px]">Wasserpilze in feuchten, schlecht belüfteten Substraten. Zerstören den Wurzelkortex (Schleimhaut löst sich ab). Prävention durch Wassertemp &lt; 21°C und biologische Fungizide (Trichoderma / Bacillus).</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="font-bold text-rose-400">Echter Mehltau (Golovinomyces)</span>
                <p className="text-slate-400 text-[11px]">Bildet weiße Mycelrasen auf Blättern und Blüten. Begünstigt durch hohe RLF und stehende Luft. Bekämpfung durch Kaliumbicarbonat, Bacillus subtilis und präventive UV-C Bestrahlung.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY 6: REGULATIONS & STANDARDS */}
      {activeCategory === 'standards' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 text-emerald-400">
              <Award className="w-4 h-4" />
              <span>KCanG & FOCUS Standards FS-1001</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Der Eigenanbau in Deutschland unterliegt strengen gesetzlichen Vorgaben nach dem Cannabisgesetz (KCanG § 9/10). Kommerzielle Betriebe orientieren sich zudem an internationalen Good Agricultural Practices (GAP) und den FOCUS Standards.
            </p>
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Jugend- und Nachbarschaftsschutz:</strong> Zelt oder Raum müssen absolut blickdicht und diebsicher verschlossen sein. Keine Geruchsbelästigung in öffentlich zugänglichen Bereichen.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>HACCP & Rückstandsanalytik:</strong> Dokumentation aller Düngergaben, PH/EC-Werte, Chargenrückverfolgung (Batch Records) sowie Grenzwerte für Schwermetalle und Mykotoxine.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accordion FAQ for Botanist Knowledge */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h4 className="text-sm font-bold text-white mb-2">
          Botanische Praxisfibel: Häufige Aeroponik-Fehler & Lösungen (Aus der Fachbibliothek)
        </h4>

        {[
          {
            q: 'Warum verstopfen die Sprühdüsen in der Aeroponik und wie verhindert man es?',
            a: 'In der Aeroponik werden Mikrodüsen mit Bohrungen von 0.2 bis 0.5 mm verwendet. Zwei Hauptursachen führen zu Verstopfungen: 1. Organische Zusätze (wie Melasse, Algenextrakte, Humin- und Fulvosäuren), die im Nährstofftank Biofilme und schleimige Flocken bilden. In Aeroponik gehören ausschließlich 100% mineralische, chelatisierte Nährstoffe! 2. Calciumcarbonat-Ausfällungen bei pH-Werten über 6.5. Abhilfe: Ein 120-Mesh-Inline-Filter vor dem Düsenbalken und regelmäßiges Ultraschallreinigen mit milder Zitronensäure.',
          },
          {
            q: 'Warum ist der pH-Puffer in der Aeroponik so empfindlich gegenüber Erde?',
            a: 'Erde enthält Ton-Humus-Komplexe mit hoher Kationenaustauschkapazität (KAK) und Mikroorganismen, die als biologischer Puffer Schwankungen abfedern. In der Aeroponik hängen die Wurzeln nackt im Nebel. Die Pflanze scheidet bei der Ionenaufnahme Protonen (H+) oder Hydroxid-Ionen (OH-) direkt in die feine Flüssigkeitsschicht aus. Daher driftet der pH-Wert in kleinen Tanks schnell ab und muss täglich mit kalibrierten Glassonden kontrolliert werden.',
          },
          {
            q: 'Steriles System (H₂O₂ / Hypochlorige Säure) vs. Lebendes System (Mikroben)?',
            a: 'In der Hochdruck-Aeroponik (HPA) bevorzugen erfahrene Botaniker das strikt sterile System mit minimaler Gabe von hypochloriger Säure (HOCl) oder H₂O₂, da Biofilme sonst die feinen 0.3mm Düsen zusetzen. In Niederdruck-Systemen (LPA) mit großen Rotordüsen kann auch a lebendes System mit Bacillus amyloliquefaciens (z.B. Hydroguard) gefahren werden, um Pythium biologisch zu verdrängen.',
          },
          {
            q: 'Wie verhält sich die Tröpfchengröße zur Wurzelphysiologie?',
            a: 'Untersuchungen der NASA zeigen: Tröpfchen zwischen 30 und 50 µm (HPA) erzeugen den dichtesten Flaum aus absorbierenden Wurzelhaaren (Trichoblasten) und maximieren den Gasaustausch. Tröpfchen über 100 µm (LPA) erzeugen schwere Wassertropfen, die an den Wurzeln herablaufen und sie mit einem Wasserfilm überziehen, was den Sauerstoffzugang hemmt und die Wurzelarchitektur eher an Hydrokultur/DWC anpasst.',
          },
        ].map((faq, index) => (
          <div
            key={index}
            className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60"
          >
            <button
              onClick={() => toggleFaq(index)}
              className="w-full text-left px-4 py-3 flex items-center justify-between text-xs font-semibold text-slate-200 hover:text-emerald-400 transition"
            >
              <span>{faq.q}</span>
              {openFaq === index ? (
                <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 ml-2" />
              )}
            </button>
            {openFaq === index && (
              <div className="px-4 pb-3.5 pt-1 text-xs text-slate-400 leading-relaxed border-t border-slate-850">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
