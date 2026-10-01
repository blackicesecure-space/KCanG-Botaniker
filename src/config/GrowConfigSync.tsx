import React, { useEffect } from 'react';
import { useCultivationSystem } from '../context/CultivationSystemContext';
import { useGrowConfig } from './GrowConfigContext';
import type { GrowConfig } from './growConfig';

/**
 * Brücke: Spiegelt die Systemwahl aus CultivationSystemContext
 * in die GrowConfig, damit ALLE Module (hiddenIf-Regeln,
 * Schwellwerte, Kalkulatoren) auf die Wahl reagieren.
 * Muss INNERHALB beider Provider gerendert werden.
 */
export const GrowConfigSync: React.FC = () => {
  const { method } = useCultivationSystem();
  const { config, setConfig } = useGrowConfig();

  useEffect(() => {
    if (!method) return;
    const targetSystem = method; // 'soil' | 'aeroponic'
    if (config.system === targetSystem) return;

    setConfig({
      ...config,
      system: targetSystem,
      irrigation: targetSystem === 'aeroponic' ? 'high_pressure_aero' : 'manual',
      substrate: targetSystem === 'aeroponic' ? 'none_aeroponic' : config.substrate,
      version: config.version + 1,
    } as GrowConfig);
  }, [method]);

  return null;
};
