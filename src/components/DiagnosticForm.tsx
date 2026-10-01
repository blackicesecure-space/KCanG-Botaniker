import React, { useState } from 'react';
import { CultivationData, SoilSubstrateData } from '../types/botanist';
import { PRESET_CASES } from '../data/presets';
import { useEnvironment } from '../context/EnvironmentContext';
import { useCultivationSystem } from '../context/CultivationSystemContext';
import { useGrowConfig } from '../config/GrowConfigContext';
import { DIAGNOSIS_MODULE, visibleFields } from '../config/growConfig';
import { DiagnosticRootTimeline } from './DiagnosticRootTimeline';
import { RootHealthLog } from '../types/rootLog';
import {
  Sparkles,
  Camera,
  Trash2,
  Upload,
  RefreshCw,
  Sliders,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  FileSearch,
  Zap,
  Sprout,
  Wind,
  Layers,
  Droplets,
} from 'lucide-react';

interface DiagnosticFormProps {
  formData: CultivationData;
  setFormData: React.Dispatch<React.SetStateAction<CultivationData>>;
  onSubmit: () => void;
  isLoading: boolean;
}

export const DiagnosticForm: React.FC<DiagnosticFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  isLoading,
}) => {
  const { telemetry } = useEnvironment();
  const { method, setMethod, soilData, setSoilData } = useCultivationSystem();
  const { config } = useGrowConfig();
  const fields = visibleFields(DIAGNOSIS_MODULE, config);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [photoError, setPhotoError] = useState<string | null>(null);

  const isSoil = method === 'soil';

  const handleInputChange = (field: keyof CultivationData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSoilChange = (field: keyof SoilSubstrateData, value: any) => {
    const updatedSoil = {
      ...(formData.soilData || soilData),
      [field]: value,
    };
    setSoilData(updatedSoil);
    setFormData((prev) => ({
      ...prev,
      soilData: updatedSoil,
    }));
  };

  const handleLoadPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = PRESET_CASES.find((p) => p.id === presetId);
    if (preset) {
      if (preset.method && preset.method !== method) {
        setMethod(preset.method);
      }
      setFormData((prev) => ({
        ...prev,
        ...preset.data,
      }));
    }
  };

  const handleImportTelemetry = () => {
    setFormData((prev) => ({
      ...prev,
      ph: telemetry.ph.toFixed(2),
      ec: telemetry.ec.toFixed(2),
      waterTemp: telemetry.waterTemp.toFixed(1),
      rootZoneTemp: (telemetry.waterTemp + 0.3).toFixed(1),
      ambientTemp: telemetry.airTemp.toFixed(1),
      ambientHumidity: telemetry.humidity.toFixed(0),
      vpd: telemetry.vpd.toFixed(2),
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError(null);

    if (file.size > 12 * 1024 * 1024) {
      setPhotoError('Das Foto ist zu groß (maximal 12 MB). Bitte wählen Sie eine kleinere Datei.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setFormData((prev) => ({
        ...prev,
        photoBase64: base64String,
        photoMimeType: file.type,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoError(null);
    setFormData((prev) => ({
      ...prev,
      photoBase64: undefined,
      photoMimeType: undefined,
    }));
  };

  const handleSelectTimelineEvent = (log: RootHealthLog) => {
    setFormData((prev) => ({
      ...prev,
      ph: log.phAtCheck.toFixed(2),
      ec: log.ecAtCheck.toFixed(2),
      waterTemp: log.waterTempAtCheck.toFixed(1),
      rootSymptoms: `Wurzelbefund (${log.colorGrade.replace('_', ' ')}): ${log.notes}. Geruch: ${log.smell.replace('_', ' ')}. Biofilm: ${log.slimeBiofilm.replace('_', ' ')}. Pelz: ${log.rootHairDensity.replace('_', ' ')}.`,
      phase: log.phase || prev.phase,
      week: log.week || prev.week,
    }));
  };

  // Filter presets matching active cultivation method
  const filteredPresets = PRESET_CASES.filter((p) => !p.method || p.method === method);

  return (
    <div className="space-y-6">
      {/* Top Banner: Method Indicator & Preset Case Selector & Live Sensor Import */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${
                  isSoil
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                }`}
              >
                {isSoil ? <Sprout className="w-3.5 h-3.5" /> : <Wind className="w-3.5 h-3.5" />}
                {isSoil ? 'Kanal: Soil (Erde/Substrat)' : 'Kanal: Aeroponik (HPA/LPA)'}
              </span>
              <span className="text-xs text-slate-500 font-mono">KCanG § 9 / § 10</span>
            </div>
            <h3 className="text-base font-bold text-white">
              Anbaudaten, Messwerte & Symptome erfassen
            </h3>
            <p className="text-xs text-slate-400">
              {isSoil
                ? 'Erfasse Topfgröße, Substrat, Gießzyklen, Drain und pH/EC für deine Erdkultur.'
                : 'Erfasse Düsendruck, Sprühintervalle, Nährlösung und Wassertemperatur für deine Aeroponik.'}
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {/* Presets Select */}
            <select
              value={selectedPresetId}
              onChange={(e) => handleLoadPreset(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
            >
              <option value="">-- Typischen {isSoil ? 'Boden-Fall' : 'Aero-Fall'} laden --</option>
              {filteredPresets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.title}
                </option>
              ))}
            </select>

            {/* Import from Environment Sensors */}
            <button
              type="button"
              onClick={handleImportTelemetry}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 transition"
              title="Aktuelle Sondenwerte (pH, EC, Wassertemp, RLF, VPD) aus den Sensoren übernehmen"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sensordaten übernehmen</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Timeline Widget: Correlating pH/EC with Root Health Logs */}
      {!isSoil && <DiagnosticRootTimeline onSelectEventLog={handleSelectTimelineEvent} />}

      {/* Main Form Fields */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          // Ensure cultivationMethod is set in formData
          formData.cultivationMethod = method || 'aeroponic';
          onSubmit();
        }}
        className="space-y-6"
      >
        {/* SECTION 1: GENETIK & PFLANZENSTATUS */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-sm font-bold text-white">
            <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
              1
            </span>
            <h4>Sorte & Pflanzendaten (KCanG konform)</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Sorte / Genetik *</label>
              <input
                type="text"
                required
                value={formData.strain}
                onChange={(e) => handleInputChange('strain', e.target.value)}
                placeholder="z.B. Amnesia Haze, Super Lemon Haze"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Genetik-Typ *</label>
              <input
                type="text"
                value={formData.strainType}
                onChange={(e) => handleInputChange('strainType', e.target.value)}
                placeholder="z.B. Feminisiert (70% Sativa / 30% Indica), Autoflower"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Wachstumsphase *</label>
              <select
                value={formData.phase}
                onChange={(e) => handleInputChange('phase', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="Keimling">Keimling / Sämling</option>
                <option value="Vegetation">Vegetationsphase (Vegi)</option>
                <option value="Frühe Blüte">Frühe Blüte (Stretch / Vorblüte)</option>
                <option value="Hauptblüte">Hauptblüte (Mitte Blüte)</option>
                <option value="Spätblüte / Spülen">Spätblüte / Abreife / Spülen</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Exakte Woche *</label>
              <input
                type="text"
                value={formData.week}
                onChange={(e) => handleInputChange('week', e.target.value)}
                placeholder="z.B. 3 oder 5"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: SYSTEMPARAMETER (SOIL vs. AEROPONIC) */}
        {isSoil ? (
          /* SECTION 2 FOR SOIL: ERDE & SUBSTRAT-PARAMETER */
          <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-sm font-bold text-white">
              <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">
                2
              </span>
              <h4>Soil Substrat, Topf & Gießverhalten (Erde)</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Boden / Substratart *</label>
                <select
                  value={formData.soilData?.substrateType || soilData.substrateType}
                  onChange={(e) => handleSoilChange('substrateType', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="biobizz_light">BioBizz Light Mix (Schwach vorgedüngt)</option>
                  <option value="biobizz_all">BioBizz All Mix (Stark vorgedüngt)</option>
                  <option value="living_soil">Living Soil / No-Till (Mikrobiell aktiv)</option>
                  <option value="plagron_grow">Plagron Growmix</option>
                  <option value="coco_perlite">Kokos / Perlit (Hydro-Substrat)</option>
                  <option value="compost_organic">Eigene Kompost- / Erdmischung</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Topfgröße & Topfart</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.soilData?.potSizeLiters || soilData.potSizeLiters}
                    onChange={(e) => handleSoilChange('potSizeLiters', e.target.value)}
                    placeholder="z.B. 11 L"
                    className="w-20 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                  <select
                    value={formData.soilData?.potType || soilData.potType}
                    onChange={(e) => handleSoilChange('potType', e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="stofftopf">Stofftopf (Gronest/Root Pouch)</option>
                    <option value="airpot">Air-Pot (Superoots)</option>
                    <option value="kunststoff">Klassischer Kunststofftopf</option>
                    <option value="autopot">AutoPot Bewässerungstopf</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Letztes Gießen (vor X Tagen)</label>
                <input
                  type="text"
                  value={formData.soilData?.lastWateringDays || soilData.lastWateringDays}
                  onChange={(e) => handleSoilChange('lastWateringDays', e.target.value)}
                  placeholder="z.B. 2 Tage"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Gießmenge pro Pflanze (Liter)</label>
                <input
                  type="text"
                  value={formData.soilData?.wateringVolumePerPlantL || soilData.wateringVolumePerPlantL}
                  onChange={(e) => handleSoilChange('wateringVolumePerPlantL', e.target.value)}
                  placeholder="z.B. 2.5 Liter (1/3 Regel)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Substrat-Feuchtigkeitszustand</label>
                <select
                  value={formData.soilData?.soilMoistureStatus || soilData.soilMoistureStatus}
                  onChange={(e) => handleSoilChange('soilMoistureStatus', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="trocken">Trocken (Topf ist federleicht)</option>
                  <option value="feucht_optimal">Feucht & optimal (Dunkel, locker)</option>
                  <option value="nass_staunaesse">Durchnässt / Staunässe (Schwer wie Blei)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Drainage-Wasser gemessen?</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.soilData?.runoffPh || ''}
                    onChange={(e) => handleSoilChange('runoffPh', e.target.value)}
                    placeholder="Drain-pH"
                    className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    value={formData.soilData?.runoffEc || ''}
                    onChange={(e) => handleSoilChange('runoffEc', e.target.value)}
                    placeholder="Drain-EC"
                    className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* SECTION 2 FOR AEROPONICS: DÜSEN & BETRIEBSDRUCK */
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-sm font-bold text-white">
              <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">
                2
              </span>
              <h4>Aeroponik-System, Betriebsdruck & Sprühintervall</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Aeroponik-Kategorie *</label>
                <select
                  value={formData.systemType}
                  onChange={(e) => handleInputChange('systemType', e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="HPA (Hochdruck 5-8 bar)">HPA (Hochdruck 5–8 bar, 30–50 µm Schwebenebel)</option>
                  <option value="LPA (Niederdruck 1.5-3 bar)">LPA (Niederdruck 1.5–3 bar, 100–150 µm Pralltropfen)</option>
                  <option value="Hybrid / Eigenbau">Hybrid / Eigenbau (z.B. Aero-DWC Kombi)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Hersteller / Modell</label>
                <input
                  type="text"
                  value={formData.systemBrand}
                  onChange={(e) => handleInputChange('systemBrand', e.target.value)}
                  placeholder="z.B. Platinium AeroTop, Nutriculture, Eigenbau"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Betriebsdruck an den Düsen (bar)</label>
                <input
                  type="text"
                  value={formData.pressureBar}
                  onChange={(e) => handleInputChange('pressureBar', e.target.value)}
                  placeholder="z.B. 6.5 (HPA) oder 2.2 (LPA)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Düsenanzahl & Typ</label>
                <input
                  type="text"
                  value={formData.nozzleType}
                  onChange={(e) => handleInputChange('nozzleType', e.target.value)}
                  placeholder="z.B. 12x Tefen 0.3mm Nebeldüsen, 360° Rotordüsen"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Sprühzeit AN (Sekunden) *</label>
                <input
                  type="text"
                  value={formData.intervalOnSeconds}
                  onChange={(e) => handleInputChange('intervalOnSeconds', e.target.value)}
                  placeholder="z.B. 3 Sekunden (HPA) oder 20s (LPA)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Pausenzeit AUS (Sekunden) *</label>
                <input
                  type="text"
                  value={formData.intervalOffSeconds}
                  onChange={(e) => handleInputChange('intervalOffSeconds', e.target.value)}
                  placeholder="z.B. 180 Sekunden (HPA) oder 60s (LPA)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: DÜNGUNG & NÄHRSTOFFE */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-sm font-bold text-white">
            <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs">
              3
            </span>
            <h4>{isSoil ? 'Düngemittel, Produkte & Boden-Zusätze' : 'Nährlösung, Düngerprodukte & Zusätze'}</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Düngerhersteller & Produktlinie</label>
              <input
                type="text"
                value={formData.nutrientBrand}
                onChange={(e) => handleInputChange('nutrientBrand', e.target.value)}
                placeholder={isSoil ? 'z.B. BioBizz, Plagron, Canna Terra, Guanokalong' : 'z.B. Canna Aqua, GHE TriPart, Athena Pro'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Dosierung</label>
              <input
                type="text"
                value={formData.nutrientDose}
                onChange={(e) => handleInputChange('nutrientDose', e.target.value)}
                placeholder={isSoil ? 'z.B. 2 ml/l Bio-Grow oder 1 EL Top-Dress' : 'z.B. 2.0 ml/l A + 2.0 ml/l B'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                {isSoil ? 'Gießkannen- / Tankvolumen (L)' : 'Tankvolumen & Letzter Wechsel'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={formData.tankVolumeL}
                  onChange={(e) => handleInputChange('tankVolumeL', e.target.value)}
                  placeholder="Volumen (L)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500"
                />
                <input
                  type="text"
                  value={formData.lastChangeDays}
                  onChange={(e) => handleInputChange('lastChangeDays', e.target.value)}
                  placeholder={isSoil ? 'Spülung vor X T.' : 'vor X Tagen'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-slate-400 mb-1 font-medium">
                Zusätze (Mykorrhiza, Melasse, Enzyme, Cal/Mag, Silikat)
              </label>
              <input
                type="text"
                value={formData.additives}
                onChange={(e) => handleInputChange('additives', e.target.value)}
                placeholder={isSoil ? 'z.B. Mykorrhiza-Sporen, Wurmhumus, Cal/Mag 1.0 ml/l' : 'z.B. Cal/Mag 0.5 ml/l, Cannazym, kein H2O2, Bacillus'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: EXAKTE MESSWERTE */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">
                4
              </span>
              <h4>{isSoil ? 'Exakte Messwerte (Gießwasser & Growbox)' : 'Exakte Messwerte (Rhizosphäre & Growbox)'}</h4>
            </div>
            <button
              type="button"
              onClick={handleImportTelemetry}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Live-Sensoren abgleichen
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                {isSoil ? 'pH-Wert (Gießwasser) *' : 'pH-Wert der Nährlösung *'}
              </label>
              <input
                type="text"
                required
                value={formData.ph}
                onChange={(e) => handleInputChange('ph', e.target.value)}
                placeholder={isSoil ? 'z.B. 6.3 – 6.7' : 'z.B. 5.8'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">EC-Wert (mS/cm) *</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  required
                  value={formData.ec}
                  onChange={(e) => handleInputChange('ec', e.target.value)}
                  placeholder="z.B. 1.2"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono font-bold"
                />
                <select
                  value={formData.ecFactor}
                  onChange={(e) => handleInputChange('ecFactor', e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2 text-[11px] text-slate-400"
                  title="ppm Umrechnungsfaktor"
                >
                  <option value="0.5">x0.5</option>
                  <option value="0.7">x0.7</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                {isSoil ? 'Gießwassertemperatur (°C)' : 'Wassertemperatur (°C) *'}
              </label>
              <input
                type="text"
                value={formData.waterTemp}
                onChange={(e) => handleInputChange('waterTemp', e.target.value)}
                placeholder="z.B. 19.5"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Topf- / Wurzelraumtemperatur</label>
              <input
                type="text"
                value={formData.rootZoneTemp}
                onChange={(e) => handleInputChange('rootZoneTemp', e.target.value)}
                placeholder="z.B. 20.0"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Raumtemperatur Growbox (°C)</label>
              <input
                type="text"
                value={formData.ambientTemp}
                onChange={(e) => handleInputChange('ambientTemp', e.target.value)}
                placeholder="z.B. 25.0"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Relative Luftfeuchte RLF (%)</label>
              <input
                type="text"
                value={formData.ambientHumidity}
                onChange={(e) => handleInputChange('ambientHumidity', e.target.value)}
                placeholder="z.B. 55"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Vapor Pressure Deficit (VPD)</label>
              <input
                type="text"
                value={formData.vpd}
                onChange={(e) => handleInputChange('vpd', e.target.value)}
                placeholder="z.B. 1.15"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Beleuchtung (Typ)</label>
              <input
                type="text"
                value={formData.lightingType}
                onChange={(e) => handleInputChange('lightingType', e.target.value)}
                placeholder="z.B. LED Vollspektrum"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Leistung (Watt)</label>
              <input
                type="text"
                value={formData.lightingWattage}
                onChange={(e) => handleInputChange('lightingWattage', e.target.value)}
                placeholder="z.B. 240"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: SYMPTOME & SCHADBILD */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-sm font-bold text-white">
            <span className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs">
              5
            </span>
            <h4>Symptome, Blatt- & Wurzelbefunde</h4>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                Blattsymptome & sichtbare Schäden *
              </label>
              <textarea
                required
                rows={3}
                value={formData.leafSymptoms}
                onChange={(e) => handleInputChange('leafSymptoms', e.target.value)}
                placeholder={
                  isSoil
                    ? 'z.B. Gelbe Blattränder an den unteren Blättern, krallenartiges Einrollen der Spitzen, punktförmige braune Nekrosen, Welken trotz feuchtem Boden...'
                    : 'z.B. Hängen der Fächerblätter, gelbe Blattadern, Chlorosen an älteren Blättern, verbrannte Blattspitzen...'
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                {isSoil
                  ? 'Boden- / Wurzelzustand (Trauermücken, Staunässe, Geruch, Topfrand)'
                  : 'Wurzelzustand (Farbe, Geruch, Schleim, Biofilm, Wurzelhaardichte)'}
              </label>
              <textarea
                rows={2}
                value={formData.rootSymptoms}
                onChange={(e) => handleInputChange('rootSymptoms', e.target.value)}
                placeholder={
                  isSoil
                    ? 'z.B. Wurzeln am Topfboden bräunlich verfärbt, muffiger Geruch aus der Erde, kleine schwarze Fliegen (Trauermücken) auf dem Substrat...'
                    : 'z.B. Wurzeln schleimig braun, muffiger Geruch, kein weißer Pelz mehr sichtbar...'
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-slate-400 mb-2 font-medium">
                Diagnose-Foto beifügen (Optional, aber dringend empfohlen)
              </label>

              {photoError && (
                <div className="mb-2 p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{photoError}</span>
                </div>
              )}

              {formData.photoBase64 ? (
                <div className="relative inline-block border border-slate-700 rounded-xl overflow-hidden bg-slate-950 p-2">
                  <img
                    src={formData.photoBase64}
                    alt="Pflanzenbefund"
                    className="max-h-56 max-w-full rounded-lg object-contain"
                  />
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute top-4 right-4 p-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-500 text-white shadow-lg transition"
                    title="Foto entfernen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 bg-slate-950/60 cursor-pointer transition">
                  <Camera className="w-8 h-8 text-slate-500 mb-2" />
                  <span className="text-slate-300 font-semibold mb-1">
                    Foto hochladen ({isSoil ? 'Blatt-Schadbild oder Boden/Wurzelzone' : 'Wurzeln oder Schadbild der Blätter'})
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    PNG, JPG oder WEBP (max. 12 MB) • Wird von der botanischen KI analysiert
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-3 transition shadow-xl ${
              isLoading
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                : isSoil
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-900/30'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-900/30'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Botaniker analysiert Anbaudaten & erstellt Behandlungsplan...</span>
              </>
            ) : (
              <>
                <FileSearch className="w-5 h-5" />
                <span>Botanischen {isSoil ? 'Boden-Befund' : 'Aero-Befund'} & Behandlungsplan erstellen</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
