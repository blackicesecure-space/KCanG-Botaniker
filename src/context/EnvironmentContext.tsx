import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { EnvironmentSettings, SensorTelemetry, SystemAlert } from '../types/environment';
import { calculateVPD, getDissolvedOxygenSaturation } from '../utils/vpd';
import { useGrowConfig } from '../config/GrowConfigContext';

interface EnvironmentContextType {
  settings: EnvironmentSettings;
  telemetry: SensorTelemetry;
  alerts: SystemAlert[];
  updateSettings: (newSettings: Partial<EnvironmentSettings>) => void;
  updateTelemetry: (newTelemetry: Partial<SensorTelemetry>) => void;
  toggleDayNight: () => void;
  toggleActuator: (actuator: keyof SensorTelemetry, value?: boolean | number) => void;
  resetToOptimal: () => void;
  injectStressScenario: (type: 'pythium' | 'phLockout' | 'co2Drop' | 'heatHumidity') => void;
  clearAlert: (id: string) => void;
  soundAlertsEnabled: boolean;
  setSoundAlertsEnabled: (enabled: boolean) => void;
}

const DEFAULT_SETTINGS: EnvironmentSettings = {
  isDayCycle: true,
  lightCycleMode: '12/12 (Blüte)',
  tempDayTargetMin: 20.0,
  tempDayTargetMax: 26.0,
  tempNightTargetMin: 18.0,
  tempNightTargetMax: 21.0,
  humidityTargetMin: 40.0,
  humidityTargetMax: 60.0,
  co2TargetPpm: 1000,
  co2EnrichmentEnabled: true,
  phTargetMin: 5.6,
  phTargetMax: 6.0,
  ecTargetMin: 1.1,
  ecTargetMax: 1.5,
  waterTempTargetMin: 18.0,
  waterTempTargetMax: 20.0,
  phCriticalMin: 5.2,
  phCriticalMax: 6.4,
  ecCriticalMin: 0.8,
  ecCriticalMax: 1.85,
  tempCriticalMin: 17.0,
  tempCriticalMax: 28.5,
  waterTempCriticalMax: 21.0,
};

const INITIAL_TELEMETRY: SensorTelemetry = {
  timestamp: Date.now(),
  airTemp: 24.5,
  humidity: 52.0,
  co2Ppm: 1050,
  vpd: 1.15,
  ph: 5.82,
  ec: 1.34,
  waterTemp: 19.2,
  dissolvedOxygen: 9.2,
  reservoirLevelPercent: 88,
  exhaustFanSpeedPercent: 45,
  heaterActive: false,
  acActive: false,
  humidifierActive: false,
  dehumidifierActive: false,
  co2SolenoidOpen: false,
  waterChillerActive: false,
  hpaPumpActive: true,
  phDosingActive: false,
  nutrientDosingActive: false,
};

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(undefined);

export const EnvironmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { config } = useGrowConfig();
  const [settings, setSettings] = useState<EnvironmentSettings>(DEFAULT_SETTINGS);
  const [telemetry, setTelemetry] = useState<SensorTelemetry>(INITIAL_TELEMETRY);
  const [soundAlertsEnabled, setSoundAlertsEnabled] = useState<boolean>(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (config.system === 'soil') {
      setSettings((prev) => ({
        ...prev,
        phTargetMin: 6.2,
        phTargetMax: 6.8,
        ecTargetMin: 1.2,
        ecTargetMax: 2.0,
        waterTempTargetMin: 19.0,
        waterTempTargetMax: 23.0,
        phCriticalMin: 5.8,
        phCriticalMax: 7.2,
        ecCriticalMin: 0.8,
        ecCriticalMax: 2.3,
        waterTempCriticalMax: 25.0,
      }));
    } else {
      setSettings((prev) => ({
        ...prev,
        phTargetMin: 5.5,
        phTargetMax: 6.1,
        ecTargetMin: 1.1,
        ecTargetMax: 1.8,
        waterTempTargetMin: 18.0,
        waterTempTargetMax: 21.0,
        phCriticalMin: 5.2,
        phCriticalMax: 6.4,
        ecCriticalMin: 0.8,
        ecCriticalMax: 2.0,
        waterTempCriticalMax: 21.0,
      }));
    }
  }, [config.system]);

  // Function to evaluate alerts based on current state
  const alerts = useMemo(() => {
    const list: SystemAlert[] = [];
    const nowStr = new Date().toLocaleTimeString('de-DE');

    // 1. pH Sensor Check
    if (telemetry.ph < settings.phTargetMin) {
      const isCritical = telemetry.ph <= (settings.phCriticalMin ?? 5.2);
      list.push({
        id: 'alert-ph-low',
        timestamp: nowStr,
        parameter: 'pH',
        severity: isCritical ? 'critical' : 'warning',
        currentValue: telemetry.ph,
        unit: '',
        targetRange: `${settings.phTargetMin} – ${settings.phTargetMax}`,
        title: isCritical
          ? `ALARM: Kritische Säuregrenze unterschritten (${telemetry.ph} <= ${settings.phCriticalMin})`
          : `pH-Wert zu sauer (${telemetry.ph})`,
        botanicalExplanation: 'Bei pH < 5.5 wird die Aufnahme von Calcium, Kalium und Magnesium drastisch gehemmt. Säurestress schädigt die Wurzelhaare in der Aeroponikkammer.',
        immediateAction: 'Zudosierung von leicht verdünntem pH-Plus (Kaliumhydroxid) oder anteiliger Frischwasserwechsel.',
      });
    } else if (telemetry.ph > settings.phTargetMax) {
      const isCritical = telemetry.ph >= (settings.phCriticalMax ?? 6.4);
      list.push({
        id: 'alert-ph-high',
        timestamp: nowStr,
        parameter: 'pH',
        severity: isCritical ? 'critical' : 'warning',
        currentValue: telemetry.ph,
        unit: '',
        targetRange: `${settings.phTargetMin} – ${settings.phTargetMax}`,
        title: isCritical
          ? `ALARM: Kritische Alkalität / Nährstoff-Lockout (${telemetry.ph} >= ${settings.phCriticalMax})`
          : `pH-Wert alkalisch / Lockout-Gefahr (${telemetry.ph})`,
        botanicalExplanation: 'Bei pH > 6.2 fallen Eisen, Phosphor und Mikronährstoffe (Mangan, Zink) als unlösliche Salze aus. Gefahr von Chlorosen und Spitzenverbrennungen.',
        immediateAction: 'Peristaltikpumpe für pH-Down (Phosphorsäure 59%) aktivieren oder tropfenweise einregulieren.',
      });
    }

    // 2. EC Sensor Check
    if (telemetry.ec < settings.ecTargetMin) {
      const isCritical = telemetry.ec <= (settings.ecCriticalMin ?? 0.8);
      list.push({
        id: 'alert-ec-low',
        timestamp: nowStr,
        parameter: 'EC',
        severity: isCritical ? 'critical' : 'warning',
        currentValue: telemetry.ec,
        unit: 'mS/cm',
        targetRange: `${settings.ecTargetMin} – ${settings.ecTargetMax} mS/cm`,
        title: isCritical
          ? `ALARM: Akuter Nährstoffmangel (${telemetry.ec} <= ${settings.ecCriticalMin} mS/cm)`
          : `EC-Wert zu niedrig / Unterversorgung (${telemetry.ec} mS/cm)`,
        botanicalExplanation: 'Die Pflanze zehrt schneller an Ionen als Wasser nachgeliefert wird. Zieht Aufhellung alter Blätter und Triebstagnation nach sich.',
        immediateAction: 'Ausgewogenen A+B Mehrkomponentendünger nachdosieren.',
      });
    } else if (telemetry.ec > settings.ecTargetMax) {
      const isCritical = telemetry.ec >= (settings.ecCriticalMax ?? 1.85);
      list.push({
        id: 'alert-ec-high',
        timestamp: nowStr,
        parameter: 'EC',
        severity: isCritical ? 'critical' : 'warning',
        currentValue: telemetry.ec,
        unit: 'mS/cm',
        targetRange: `${settings.ecTargetMin} – ${settings.ecTargetMax} mS/cm`,
        title: isCritical
          ? `ALARM: Akuter osmotischer Schock / Versalzung (${telemetry.ec} >= ${settings.ecCriticalMax} mS/cm)`
          : `EC-Wert überhöht / Salinitätsstress (${telemetry.ec} mS/cm)`,
        botanicalExplanation: 'Hoher osmotischer Druck hemmt die Wasseraufnahme der Wurzeln („physiologische Trockenheit“). Gefahr von Adlerkrallen und Blattspitzenbrand.',
        immediateAction: 'Reservoir mit reinem Osmosewasser verdünnen, um den osmotischen Schock sofort zu stoppen.',
      });
    }

    // 3. Wassertemperatur & Pythium Sensor Check
    if (telemetry.waterTemp > settings.waterTempTargetMax) {
      const isCritical = telemetry.waterTemp >= (settings.waterTempCriticalMax ?? 21.0);
      list.push({
        id: 'alert-water-temp-high',
        timestamp: nowStr,
        parameter: 'Wassertemperatur',
        severity: isCritical ? 'critical' : 'warning',
        currentValue: telemetry.waterTemp,
        unit: '°C',
        targetRange: `${settings.waterTempTargetMin} – ${settings.waterTempTargetMax} °C`,
        title: isCritical
          ? `AKUT: Pythium-Wurzelfäule-Gefahr (${telemetry.waterTemp} >= ${settings.waterTempCriticalMax} °C)`
          : `Wassertemperatur erhöht (${telemetry.waterTemp} °C)`,
        botanicalExplanation: 'Ab 21.0 °C sinkt der Sauerstoffgehalt unter 8.5 mg/l. Fakultativ anaerobe Oomyceten (Pythium / Wurzelfäule) vermehren sich exponentiell und zerstören den Wurzelapparat in wenigen Stunden.',
        immediateAction: 'Nährlösungs-Chiller (Durchlaufkühler) auf 18.5 °C erzwingen oder gefrorene Kühlakkus im geschlossenen Beutel ins Reservoir legen.',
      });
    } else if (telemetry.waterTemp < settings.waterTempTargetMin) {
      list.push({
        id: 'alert-water-temp-low',
        timestamp: nowStr,
        parameter: 'Wassertemperatur',
        severity: 'warning',
        currentValue: telemetry.waterTemp,
        unit: '°C',
        targetRange: `${settings.waterTempTargetMin} – ${settings.waterTempTargetMax} °C`,
        title: `Wassertemperatur zu kühl (${telemetry.waterTemp} °C)`,
        botanicalExplanation: 'Unter 17 °C verlangsamt sich der Wurzelstoffwechsel drastisch; Phosphoraufnahme wird fast vollständig inhibiert.',
        immediateAction: 'Heizstab im Reservoir auf 19.0 °C justieren.',
      });
    }

    // 4. Luftfeuchtigkeit (Humidity)
    if (telemetry.humidity < settings.humidityTargetMin) {
      list.push({
        id: 'alert-humidity-low',
        timestamp: nowStr,
        parameter: 'Luftfeuchtigkeit',
        severity: 'warning',
        currentValue: telemetry.humidity,
        unit: '%',
        targetRange: `${settings.humidityTargetMin} – ${settings.humidityTargetMax} %`,
        title: `Luftfeuchtigkeit zu niedrig (${telemetry.humidity} %)`,
        botanicalExplanation: 'Führt zu extrem hohem VPD und Schließen der Stomata (Spaltöffnungen). Die Pflanze stoppt CO₂-Assimilation.',
        immediateAction: 'Ultraschall-Luftbefeuchter aktivieren oder Abluftleistung vorübergehend drosseln.',
      });
    } else if (telemetry.humidity > settings.humidityTargetMax) {
      list.push({
        id: 'alert-humidity-high',
        timestamp: nowStr,
        parameter: 'Luftfeuchtigkeit',
        severity: telemetry.humidity > 70 ? 'critical' : 'warning',
        currentValue: telemetry.humidity,
        unit: '%',
        targetRange: `${settings.humidityTargetMin} – ${settings.humidityTargetMax} %`,
        title: `Luftfeuchtigkeit zu hoch (${telemetry.humidity} %)`,
        botanicalExplanation: 'Akute Gefahr von Grauschimmel (Botrytis cinerea) in dichten Blütenständen sowie Kondenswasser an Blattunterseiten.',
        immediateAction: 'Entfeuchter aktivieren und Umluftventilatoren auf maximale Oszillation stellen.',
      });
    }

    // 5. Raumtemperatur Growbox
    const minTemp = settings.isDayCycle ? settings.tempDayTargetMin : settings.tempNightTargetMin;
    const maxTemp = settings.isDayCycle ? settings.tempDayTargetMax : settings.tempNightTargetMax;
    const cycleName = settings.isDayCycle ? 'Lichtphase (Tag)' : 'Dunkelphase (Nacht)';

    if (telemetry.airTemp < minTemp) {
      const isCritical = telemetry.airTemp <= (settings.tempCriticalMin ?? 17.0);
      list.push({
        id: 'alert-temp-low',
        timestamp: nowStr,
        parameter: 'Raumtemperatur',
        severity: isCritical ? 'critical' : 'warning',
        currentValue: telemetry.airTemp,
        unit: '°C',
        targetRange: `${minTemp} – ${maxTemp} °C (${cycleName})`,
        title: isCritical
          ? `ALARM: Kritische Kälteperiode (${telemetry.airTemp} <= ${settings.tempCriticalMin} °C)`
          : `Temperatur zu niedrig für ${cycleName} (${telemetry.airTemp} °C)`,
        botanicalExplanation: 'Reduziert die enzymatische Aktivität von RuBisCO und bremst das Zellwachstum.',
        immediateAction: 'Zulufterwärmung oder Box-Heizung aktivieren.',
      });
    } else if (telemetry.airTemp > maxTemp) {
      const isCritical = telemetry.airTemp >= (settings.tempCriticalMax ?? 28.5);
      list.push({
        id: 'alert-temp-high',
        timestamp: nowStr,
        parameter: 'Raumtemperatur',
        severity: isCritical ? 'critical' : 'warning',
        currentValue: telemetry.airTemp,
        unit: '°C',
        targetRange: `${minTemp} – ${maxTemp} °C (${cycleName})`,
        title: isCritical
          ? `ALARM: Akuter Hitzestress (${telemetry.airTemp} >= ${settings.tempCriticalMax} °C)`
          : `Hitzestress in ${cycleName} (${telemetry.airTemp} °C)`,
        botanicalExplanation: 'Ab 28 °C beginnen Terpene zu verdampfen und Photosynthese-Enzyme denaturieren, Blattränder rollen sich ein.',
        immediateAction: 'Abluftventilator auf 100% schalten, LED dimmen oder Klimakühlung zuschalten.',
      });
    }

    // 6. CO2 Enrichment
    if (settings.isDayCycle && settings.co2EnrichmentEnabled) {
      if (telemetry.co2Ppm < 800) {
        list.push({
          id: 'alert-co2-low',
          timestamp: nowStr,
          parameter: 'CO₂',
          severity: 'warning',
          currentValue: telemetry.co2Ppm,
          unit: 'ppm',
          targetRange: '800 – 1200 ppm (Tag)',
          title: `CO₂-Niveau unter Sollwert (${telemetry.co2Ppm} ppm)`,
          botanicalExplanation: 'Bei intensiver LED-Beleuchtung (>700 µmol/m²/s) limitiert ein zu geringer CO₂-Gehalt die Photosyntheseleistung.',
          immediateAction: 'CO₂-Magnetventil öffnen und Abluftzyklus takten (verschlossenes oder semi-closed System).',
        });
      } else if (telemetry.co2Ppm > 1350) {
        list.push({
          id: 'alert-co2-high',
          timestamp: nowStr,
          parameter: 'CO₂',
          severity: 'warning',
          currentValue: telemetry.co2Ppm,
          unit: 'ppm',
          targetRange: '800 – 1200 ppm',
          title: `CO₂-Konzentration überhöht (${telemetry.co2Ppm} ppm)`,
          botanicalExplanation: 'CO₂ über 1400 ppm bringt im Eigenanbau keinen zusätzlichen Nutzen und kann toxisch auf Stomata wirken.',
          immediateAction: 'CO₂-Zufuhr unterbrechen und Frischluftzufuhr erhöhen.',
        });
      }
    }

    return list.filter((a) => !dismissedAlerts.has(a.id));
  }, [telemetry, settings, dismissedAlerts]);

  // Periodic simulation loop to keep physical interactions lifelike
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry((prev) => {
        // Continuous small physical drift and actuator compensations
        let nextTemp = prev.airTemp;
        let nextHumidity = prev.humidity;
        let nextCo2 = prev.co2Ppm;
        let nextWaterTemp = prev.waterTemp;
        let nextPh = prev.ph;
        let nextEc = prev.ec;

        // Actuators effects
        if (prev.heaterActive) nextTemp += 0.08;
        if (prev.acActive) nextTemp -= 0.08;
        if (prev.humidifierActive) nextHumidity = Math.min(85, nextHumidity + 0.3);
        if (prev.dehumidifierActive) nextHumidity = Math.max(30, nextHumidity - 0.3);
        if (prev.co2SolenoidOpen && settings.isDayCycle) nextCo2 = Math.min(1400, nextCo2 + 15);
        if (!prev.co2SolenoidOpen && nextCo2 > 450) nextCo2 -= 4; // natural air exchange
        if (prev.waterChillerActive && nextWaterTemp > 18.2) nextWaterTemp -= 0.05;
        if (!prev.waterChillerActive && nextWaterTemp < prev.airTemp - 2) nextWaterTemp += 0.02;

        // Auto-control logic
        const targetTempMax = settings.isDayCycle ? settings.tempDayTargetMax : settings.tempNightTargetMax;
        const targetTempMin = settings.isDayCycle ? settings.tempDayTargetMin : settings.tempNightTargetMin;

        const heaterActive = nextTemp < targetTempMin;
        const acActive = nextTemp > targetTempMax;
        const humidifierActive = nextHumidity < settings.humidityTargetMin;
        const dehumidifierActive = nextHumidity > settings.humidityTargetMax;
        const co2SolenoidOpen = settings.isDayCycle && settings.co2EnrichmentEnabled && nextCo2 < settings.co2TargetPpm;
        const waterChillerActive = nextWaterTemp > settings.waterTempTargetMax;

        // Recalculate VPD & Dissolved Oxygen
        const vpdCalc = calculateVPD(nextTemp, nextHumidity);
        const doCalc = getDissolvedOxygenSaturation(nextWaterTemp);

        return {
          ...prev,
          timestamp: Date.now(),
          airTemp: parseFloat(nextTemp.toFixed(1)),
          humidity: parseFloat(nextHumidity.toFixed(1)),
          co2Ppm: Math.round(nextCo2),
          waterTemp: parseFloat(nextWaterTemp.toFixed(1)),
          ph: parseFloat(nextPh.toFixed(2)),
          ec: parseFloat(nextEc.toFixed(2)),
          vpd: vpdCalc.vpdLeaf,
          dissolvedOxygen: doCalc.mgPerLiter,
          heaterActive,
          acActive,
          humidifierActive,
          dehumidifierActive,
          co2SolenoidOpen,
          waterChillerActive,
        };
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [settings]);

  const updateSettings = useCallback((newSettings: Partial<EnvironmentSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const updateTelemetry = useCallback((newTelemetry: Partial<SensorTelemetry>) => {
    setTelemetry((prev) => {
      const merged = { ...prev, ...newTelemetry, timestamp: Date.now() };
      const vpdCalc = calculateVPD(merged.airTemp, merged.humidity);
      const doCalc = getDissolvedOxygenSaturation(merged.waterTemp);
      return {
        ...merged,
        vpd: vpdCalc.vpdLeaf,
        dissolvedOxygen: doCalc.mgPerLiter,
      };
    });
  }, []);

  const toggleDayNight = useCallback(() => {
    setSettings((prev) => {
      const nextIsDay = !prev.isDayCycle;
      // Also adjust simulated temperature and CO2 naturally
      setTelemetry((t) => ({
        ...t,
        airTemp: nextIsDay ? 24.5 : 19.5,
        co2Ppm: nextIsDay ? 1000 : 420,
      }));
      return {
        ...prev,
        isDayCycle: nextIsDay,
      };
    });
  }, []);

  const toggleActuator = useCallback((actuator: keyof SensorTelemetry, value?: boolean | number) => {
    setTelemetry((prev) => ({
      ...prev,
      [actuator]: value !== undefined ? value : !prev[actuator],
    }));
  }, []);

  const resetToOptimal = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    setTelemetry(INITIAL_TELEMETRY);
    setDismissedAlerts(new Set());
  }, []);

  const injectStressScenario = useCallback((type: 'pythium' | 'phLockout' | 'co2Drop' | 'heatHumidity') => {
    setDismissedAlerts(new Set());
    if (type === 'pythium') {
      updateTelemetry({
        waterTemp: 24.5,
        waterChillerActive: false,
      });
    } else if (type === 'phLockout') {
      updateTelemetry({
        ph: 6.85,
        ec: 1.85,
      });
    } else if (type === 'co2Drop') {
      updateTelemetry({
        co2Ppm: 510,
        co2SolenoidOpen: false,
      });
    } else if (type === 'heatHumidity') {
      updateTelemetry({
        airTemp: 29.5,
        humidity: 34,
        exhaustFanSpeedPercent: 20,
      });
    }
  }, [updateTelemetry]);

  const clearAlert = useCallback((id: string) => {
    setDismissedAlerts((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  return (
    <EnvironmentContext.Provider
      value={{
        settings,
        telemetry,
        alerts,
        updateSettings,
        updateTelemetry,
        toggleDayNight,
        toggleActuator,
        resetToOptimal,
        injectStressScenario,
        clearAlert,
        soundAlertsEnabled,
        setSoundAlertsEnabled,
      }}
    >
      {children}
    </EnvironmentContext.Provider>
  );
};

export const useEnvironment = () => {
  const context = useContext(EnvironmentContext);
  if (!context) {
    throw new Error('useEnvironment must be used within an EnvironmentProvider');
  }
  return context;
};
