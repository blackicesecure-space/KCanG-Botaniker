import React, { useState, useEffect } from 'react';
import { CultivationData } from './types/botanist';
import { EnvironmentProvider, useEnvironment } from './context/EnvironmentContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CultivationSystemProvider, useCultivationSystem } from './context/CultivationSystemContext';
import { Header, ActiveTab } from './components/Header';
import { SystemSelectionModal } from './components/SystemSelectionModal';
import { SensorAlertsBanner } from './components/SensorAlertsBanner';
import { EnvironmentalControls } from './components/EnvironmentalControls';
import { DiagnosticForm } from './components/DiagnosticForm';
import { ReportViewer } from './components/ReportViewer';
import { AeroponicCalculators } from './components/AeroponicCalculators';
import { RootHealthTracker } from './components/RootHealthTracker';
import { TrichomeDevelopmentTracker } from './components/TrichomeDevelopmentTracker';
import { KCanGKnowledgeBase } from './components/KCanGKnowledgeBase';
import { GrowDashboard } from './components/GrowDashboard';
import { PRESET_CASES } from './data/presets';
import { saveDiagnosisReportToFirestore } from './services/firestoreData';
import { GrowConfigProvider } from './config/GrowConfigContext';
import { GrowConfigSync } from './config/GrowConfigSync';

const INITIAL_FORM_DATA: CultivationData = {
  strain: '',
  strainType: 'Feminisiert (70% Sativa / 30% Indica)',
  phase: 'Vegetation',
  week: '1',
  systemType: 'HPA (Hochdruck 5-8 bar)',
  systemBrand: '',
  nozzlesCount: '8 Düsen',
  nozzleType: '0.3mm Nebeldüsen (30-50µm Tröpfchen)',
  pressureBar: '6.0',
  intervalOnSeconds: '3',
  intervalOffSeconds: '180',
  nutrientBrand: '',
  nutrientProducts: '',
  nutrientDose: '',
  tankVolumeL: '50',
  lastChangeDays: '0',
  additives: '',
  ph: '5.8',
  ec: '1.2',
  ecFactor: '0.5',
  waterTemp: '19.0',
  rootZoneTemp: '19.2',
  ambientTemp: '24.0',
  ambientHumidity: '55',
  vpd: '1.10',
  lightingType: 'LED Vollspektrum',
  lightingWattage: '240',
  lightingDistanceCm: '45',
  lightingCycle: '18/6',
  ppfd: '600',
  leafSymptoms: '',
  rootSymptoms: '',
  additionalObservations: '',
};

function MainContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('mygrow');
  const [formData, setFormData] = useState<CultivationData>(INITIAL_FORM_DATA);
  const [reportText, setReportText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorNotice, setErrorNotice] = useState<string>('');

  const { telemetry } = useEnvironment();
  const { currentUser } = useAuth();
  const { method, showSelectionModal, setShowSelectionModal } = useCultivationSystem();

  // Update default pH/EC when method switches
  useEffect(() => {
    if (method === 'soil') {
      setFormData((prev) => ({
        ...prev,
        cultivationMethod: 'soil',
        ph: prev.ph === '5.8' ? '6.4' : prev.ph,
      }));
    } else if (method === 'aeroponic') {
      setFormData((prev) => ({
        ...prev,
        cultivationMethod: 'aeroponic',
        ph: prev.ph === '6.4' ? '5.8' : prev.ph,
      }));
    }
  }, [method]);

  const handleTransferTelemetryToDiagnosis = () => {
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
    setActiveTab('diagnosis');
  };

  const handleDiagnose = async () => {
    setIsLoading(true);
    setErrorNotice('');

    try {
      const payload = {
        ...formData,
        cultivationMethod: method || 'aeroponic',
      };

      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success && data.report) {
        setReportText(data.report);
        setActiveTab('report');

        // If user is authenticated, automatically persist diagnosis report to Firestore
        if (currentUser) {
          saveDiagnosisReportToFirestore(currentUser.uid, {
            id: `report-${Date.now()}`,
            timestamp: Date.now(),
            dateStr: new Date().toLocaleDateString('de-DE'),
            strain: formData.strain || 'Cannabis Pflanze',
            phase: `${formData.phase} W${formData.week} (${method === 'soil' ? 'Soil' : 'Aero'})`,
            reportText: data.report,
            ph: parseFloat(formData.ph) || (method === 'soil' ? 6.4 : 5.8),
            ec: parseFloat(formData.ec) || 1.4,
            waterTemp: parseFloat(formData.waterTemp) || 19.0,
          }).catch(console.warn);
        }
      } else {
        setErrorNotice(data.errorNotice || 'Fehler beim Erstellen der Diagnose. Bitte Eingaben prüfen.');
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setErrorNotice('Netzwerkfehler: Backend-Diagnose konnte nicht abgeschlossen werden.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Direct System Selection Modal on Login / App Launch */}
      <SystemSelectionModal
        isOpen={showSelectionModal}
        onClose={() => setShowSelectionModal(false)}
      />

      {/* Header with Navigation and System Switcher */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasReport={!!reportText}
      />

      <GrowConfigSync />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Real-Time Sensor Alert Banner */}
        <SensorAlertsBanner onTransferToDiagnosis={handleTransferTelemetryToDiagnosis} />

        {/* Global Error Banner */}
        {errorNotice && (
          <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center justify-between">
            <span>{errorNotice}</span>
            <button
              onClick={() => setErrorNotice('')}
              className="text-xs font-semibold text-rose-400 hover:text-rose-100"
            >
              Schließen
            </button>
          </div>
        )}

        {/* Tab 0: Mein Grow & Fahrplan */}
        {activeTab === 'mygrow' && (
          <GrowDashboard onNavigateToCalculators={() => setActiveTab('calculators')} />
        )}

        {/* Tab 1: Diagnose & Fallaufnahme */}
        {activeTab === 'diagnosis' && (
          <DiagnosticForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleDiagnose}
            isLoading={isLoading}
          />
        )}

        {/* Tab 2: Klima- & Hydro/Boden-Sensoren (Live Controls) */}
        {activeTab === 'environment' && (
          <EnvironmentalControls onTransferToDiagnosis={handleTransferTelemetryToDiagnosis} />
        )}

        {/* Tab 3: Wurzel-Tagebuch & Pythium-Verlauf */}
        {activeTab === 'root-log' && <RootHealthTracker />}

        {/* Tab 4: Trichom-Reifegrad & KCanG Erntezeitpunkt */}
        {activeTab === 'trichome-log' && <TrichomeDevelopmentTracker />}

        {/* Tab 5: Botanischer Befundbericht & Therapieplan */}
        {activeTab === 'report' && (
          reportText ? (
            <ReportViewer
              reportText={reportText}
              onNewDiagnosis={() => setActiveTab('diagnosis')}
              strainName={formData.strain}
            />
          ) : (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
                <span className="text-3xl">📋</span>
              </div>
              <h3 className="text-lg font-bold text-white">Noch kein Befundbericht generiert</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Erfasse im Diagnose-Labor deine Anbaudaten und Symptome oder wähle einen typischen Praxisfall, um die botanische Analyse nach KCanG zu starten.
              </p>
              <button
                onClick={() => setActiveTab('diagnosis')}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
              >
                Zum Diagnose-Formular
              </button>
            </div>
          )
        )}

        {/* Tab 6: Aeroponik-Kalkulatoren & VPD */}
        {activeTab === 'calculators' && <AeroponicCalculators />}

        {/* Tab 7: KCanG Rechtsrahmen & Kompendium */}
        {activeTab === 'knowledge' && <KCanGKnowledgeBase />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>KCanG {method === 'soil' ? 'BodenBotaniker' : 'AeroBotaniker'} • Cannabis Diagnose & Umweltregelung</span>
          <span>Legal gem. Konsumcannabisgesetz (KCanG) für den privaten Eigenanbau in Deutschland</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CultivationSystemProvider>
        <GrowConfigProvider>
          <EnvironmentProvider>
            <MainContent />
          </EnvironmentProvider>
        </GrowConfigProvider>
      </CultivationSystemProvider>
    </AuthProvider>
  );
}
