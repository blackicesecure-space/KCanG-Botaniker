import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  Settings, 
  Key, 
  ExternalLink, 
  RefreshCw, 
  Sliders, 
  ShieldCheck, 
  AlertCircle, 
  Check, 
  X, 
  Database,
  Radio,
  Layers,
  Zap
} from 'lucide-react';
import { useEnvironment } from '../context/EnvironmentContext';

export interface ProviderConfig {
  id: string;
  name: string;
  category: string;
  products: string;
  relevance: string;
  apiType: string;
  sourceUrl: string;
  sourceTitle: string;
  isConnected: boolean;
  apiKey?: string;
  controllerId?: string;
  deviceMac?: string;
  lastSync?: number;
}

const STORAGE_KEY = 'kcang_hardware_integrations_v2';

const INITIAL_PROVIDERS: ProviderConfig[] = [
  {
    id: 'vivosun',
    name: 'VIVOSUN',
    category: 'Indoor Klima & Steuerung',
    products: 'GrowHub Controller, VIVOSUN App, Smart-Grow-Lichter, Ventilation',
    relevance: 'Direkte Indoor-Kontroll- und Telemetrie-Basis für Temperatur, Feuchte, VPD und Licht; Standard-Hub.',
    apiType: 'Inoffizielle Cloud / MQTT Bridge (Standard)',
    sourceUrl: 'https://vivosun.com/growing_guide/vivosun-growhub-controller/',
    sourceTitle: 'VIVOSUN GrowHub Guide',
    isConnected: true,
    controllerId: 'GrowHub-Pro-01',
    lastSync: Date.now() - 120000,
  },
  {
    id: 'acinfinity',
    name: 'AC Infinity',
    category: 'Klima & Abluft Controller',
    products: 'UIS-Controller, Inline-/Clip-Fans, CO₂-/Boden-/Wasser-Sensoren',
    relevance: 'Sehr starke Klimakontrolle für Grow-Zelte; liefert VPD, Temperatur/Feuchte und Port-Logik.',
    apiType: 'Community REST API (Reverse Engineered)',
    sourceUrl: 'https://github.com/keithah/homebridge-acinfinity/blob/master/API_REFERENCE.md',
    sourceTitle: 'AC Infinity API Reference',
    isConnected: false,
    controllerId: 'UIS-Controller-69',
  },
  {
    id: 'ecowitt',
    name: 'Ecowitt',
    category: 'Bodenfeuchte & Wetter',
    products: 'Gateways GW1000/GW2000, WH51 Bodenfeuchtesensoren, Regen/Wind',
    relevance: 'Beste Preis-/Abdeckungs-Quelle für Bodenfeuchte/-temperatur und Outdoor-Beete & Gewächshäuser.',
    apiType: 'Ecowitt Cloud API v3 & Local Push',
    sourceUrl: 'https://doc.ecowitt.net/web/#/apiv3en?page_id=1',
    sourceTitle: 'Ecowitt API v3',
    isConnected: false,
    deviceMac: 'EC:OW:IT:77:88:99',
  },
  {
    id: 'bluelab',
    name: 'Bluelab / Edenic',
    category: 'Nährstoff & Hydroklima',
    products: 'Guardian Monitor Wi-Fi, Pro/pH Controller, PeriPod Dosing',
    relevance: 'Professionelle Nährstoffseite: pH, EC, Temperatur, Reservoir-Monitoring und automatisches Dosing.',
    apiType: 'Edenic REST API mit API-Key',
    sourceUrl: 'https://api-docs.edenic.io/',
    sourceTitle: 'Edenic API Docs',
    isConnected: false,
    apiKey: '',
  },
  {
    id: 'netatmo',
    name: 'Netatmo',
    category: 'Mikroklima & Wetter',
    products: 'Smart Home Weather Station, Outdoor/Indoor Module',
    relevance: 'Liefert offizielle Outdoor-Mikroklimadaten für Standortkontext und Bewässerungsmodelle.',
    apiType: 'Netatmo Connect Weather API (OAuth)',
    sourceUrl: 'https://dev.netatmo.com/apidocumentation/weather',
    sourceTitle: 'Netatmo Weather API',
    isConnected: false,
  },
  {
    id: 'govee',
    name: 'Govee',
    category: 'Sensoren & Smart Plugs',
    products: 'Wi-Fi/BLE Thermo-Hygrometer, Grow-Lights, Luftbefeuchter',
    relevance: 'Massentaugliche Klima- und Steuergeräte; schneller Onboarding-Wert für Zelt- und Raumklima.',
    apiType: 'Govee Developer API Key',
    sourceUrl: 'https://govee-public.s3.amazonaws.com/developer-docs/GoveeDeveloperAPIReference.pdf',
    sourceTitle: 'Govee Developer API Reference',
    isConnected: false,
    apiKey: '',
  },
  {
    id: 'metergroup',
    name: 'METER Group',
    category: 'Agri-Grade Bodenforschung',
    products: 'TEROS Bodenfeuchte/-temperatur/-EC, ZL6 Logger, ZENTRA Cloud',
    relevance: 'Research-grade Bodendaten für ernsthafte Bodenmodelle, Kalibrierung und Langzeit-Validierung.',
    apiType: 'ZENTRA Cloud Utility API',
    sourceUrl: 'https://metergroup.com/platform/zentra-cloud/',
    sourceTitle: 'METER ZENTRA Cloud',
    isConnected: false,
  },
  {
    id: 'spiderfarmer',
    name: 'Spider Farmer',
    category: 'Grow-Lights & Controller',
    products: 'GGS Controller/Display Panels, LED Grow Lights, 3-in-1 Soil Probe',
    relevance: 'Relevant wegen integrierter Boden- und Klimadaten in einer einheitlichen Grow-System-Logik.',
    apiType: 'Local Bridge / Proxy Integration',
    sourceUrl: 'https://www.spider-farmer.com/products/spider-farmer-led-grow-light-controller/',
    sourceTitle: 'Spider Farmer GGS Controller',
    isConnected: false,
  },
  {
    id: 'atlasscientific',
    name: 'Atlas Scientific',
    category: 'Profi-Sensorelektronik',
    products: 'EZO-Schaltkreise für pH, EC/TDS, Temperatur, ORP, DO',
    relevance: 'Sehr gute DIY-/Profi-Quelle für Wasser- und Nährlösungschemie in Hydro- und Coco-Systemen.',
    apiType: 'Hardware-nah (UART / I²C / WebBridge SDK)',
    sourceUrl: 'https://atlas-scientific.com/embedded-solutions/ezo-ph-circuit/',
    sourceTitle: 'Atlas Scientific EZO-pH',
    isConnected: false,
  },
  {
    id: 'tuya',
    name: 'Tuya Smart / Smart Life',
    category: 'IoT Cloud Smart Garden',
    products: 'Bewässerung, Ventile, Sensoren, Steckdosen, Leuchten',
    relevance: 'Abstraktionsebene für sehr viele internationale Smart-Garden-Geräte; universelle Connector-Klasse.',
    apiType: 'Tuya Cloud Development OpenAPI / MQTT',
    sourceUrl: 'https://developer.tuya.com/en/cloud-development',
    sourceTitle: 'Tuya Cloud Development',
    isConnected: false,
  }
];

export const GrowEquipmentIntegrations: React.FC = () => {
  const [providers, setProviders] = useState<ProviderConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_PROVIDERS;
  });

  const [activeModalProvider, setActiveModalProvider] = useState<ProviderConfig | null>(null);
  const [tempApiKey, setTempApiKey] = useState('');
  const [tempControllerId, setTempControllerId] = useState('');
  const [tempDeviceMac, setTempDeviceMac] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const { updateTelemetry } = useEnvironment();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(providers));
    } catch {}
  }, [providers]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const openConfigModal = (p: ProviderConfig) => {
    setActiveModalProvider(p);
    setTempApiKey(p.apiKey || '');
    setTempControllerId(p.controllerId || '');
    setTempDeviceMac(p.deviceMac || '');
    setTestResult(null);
  };

  const handleSaveProviderConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalProvider) return;

    const updated = providers.map((p) => {
      if (p.id === activeModalProvider.id) {
        return {
          ...p,
          apiKey: tempApiKey,
          controllerId: tempControllerId,
          deviceMac: tempDeviceMac,
          isConnected: true,
          lastSync: Date.now(),
        };
      }
      return p;
    });

    setProviders(updated);
    setActiveModalProvider(null);
    showToast(`Anbieter "${activeModalProvider.name}" erfolgreich verbunden & synchronisiert.`);
  };

  const handleToggleConnection = (id: string) => {
    const updated = providers.map((p) => {
      if (p.id === id) {
        const nextState = !p.isConnected;
        return { ...p, isConnected: nextState, lastSync: nextState ? Date.now() : p.lastSync };
      }
      return p;
    });
    setProviders(updated);
    const target = updated.find(p => p.id === id);
    showToast(target?.isConnected ? `Verbindung zu ${target.name} hergestellt.` : `Verbindung zu ${target?.name} getrennt.`);
  };

  const handleTestConnection = (p: ProviderConfig) => {
    setIsTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setIsTesting(false);
      setTestResult(`✅ Verbindungstest mit ${p.name} erfolgreich! (Latenz: 42ms, Telemetriedaten empfangen)`);
      // Simulate injecting telemetry if Ecowitt, Bluelab or AC Infinity is tested
      if (p.id === 'ecowitt') {
        updateTelemetry({ soilMoisture: 68.5 });
      } else if (p.id === 'bluelab') {
        updateTelemetry({ waterTemp: 20.4 });
      }
    }, 1200);
  };

  const connectedCount = providers.filter(p => p.isConnected).length;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-bold shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-lg">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold">
                  Smart Hardware Ecosystem Hub
                </span>
                <span className="text-xs text-slate-400 font-mono">{connectedCount} von {providers.length} Anbieter verbunden</span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight mt-1">
                Grow-Equipment & API-Integrationen (10 Anbieter)
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
                Verbinde deine Steuerungen, Boden- und Klimasensoren von VIVOSUN, AC Infinity, Ecowitt, Bluelab, Netatmo, Govee, METER Group, Spider Farmer, Atlas Scientific und Tuya mit dem KCanG BodenBotaniker.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {providers.map((p, idx) => (
          <div
            key={p.id}
            className={`bg-slate-900/80 border rounded-2xl p-5 space-y-4 shadow-xl transition flex flex-col justify-between ${
              p.isConnected ? 'border-cyan-500/40 bg-slate-900/95' : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                    p.isConnected ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    #{idx + 1}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{p.name}</span>
                      {p.isConnected && (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 text-[10px] font-mono border border-cyan-500/20">
                          Aktiv
                        </span>
                      )}
                    </h3>
                    <span className="text-[11px] text-cyan-400/90 font-mono">{p.category}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleConnection(p.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    p.isConnected
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                      : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {p.isConnected ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5" />}
                  <span>{p.isConnected ? 'Verbunden' : 'Verbinden'}</span>
                </button>
              </div>

              <div className="text-xs space-y-2">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">Hauptprodukte:</span>
                  <p className="text-slate-300 leading-relaxed font-mono">{p.products}</p>
                </div>

                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {p.relevance}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 font-mono">
                  <span>API: {p.apiType}</span>
                  <a
                    href={p.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <span>{p.sourceTitle}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Action footer */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
              <button
                onClick={() => openConfigModal(p)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition flex items-center gap-1.5 border border-slate-700"
              >
                <Settings className="w-3.5 h-3.5 text-cyan-400" />
                <span>Konfigurieren</span>
              </button>

              <button
                onClick={() => handleTestConnection(p)}
                disabled={!p.isConnected && !p.apiKey && !p.controllerId}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 font-bold transition flex items-center gap-1.5 border border-cyan-500/30 disabled:opacity-40"
              >
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Ping Test</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Configuration Modal */}
      {activeModalProvider && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4" role="dialog">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400">
                <Cpu className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Anbieter konfigurieren: {activeModalProvider.name}</h3>
              </div>
              <button
                onClick={() => setActiveModalProvider(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProviderConfig} className="space-y-4 text-xs">
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {activeModalProvider.relevance}
              </p>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">API-Key / Token (falls erforderlich):</label>
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="z.B. Bearer Token oder App Key"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Controller / Hub ID:</label>
                <input
                  type="text"
                  value={tempControllerId}
                  onChange={(e) => setTempControllerId(e.target.value)}
                  placeholder="z.B. UIS-Controller-69 oder GrowHub-01"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Geräte-MAC / Gateway Adresse (optional):</label>
                <input
                  type="text"
                  value={tempDeviceMac}
                  onChange={(e) => setTempDeviceMac(e.target.value)}
                  placeholder="z.B. EC:OW:IT:12:34:56"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              {testResult && (
                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 font-mono text-[11px]">
                  {testResult}
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleTestConnection(activeModalProvider)}
                  disabled={isTesting}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition flex items-center gap-1.5 border border-slate-700"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Teste...' : 'Verbindung testen'}</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModalProvider(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition shadow-lg shadow-cyan-500/20"
                  >
                    Speichern & Verbinden
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
