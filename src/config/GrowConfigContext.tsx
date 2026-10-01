import React, { createContext, useContext, useState, useEffect } from 'react';
import type { GrowConfig } from './growConfig';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const DEFAULT_CONFIG: GrowConfig = {
  system: 'soil',
  irrigation: 'manual',
  nutrientConcept: 'organic_liquid',
  substrate: 'eigene_kompost_mischung',
  potVolumeLiters: 19,
  createdAt: new Date().toISOString(),
  version: 1,
};

const GrowConfigContext = createContext<{
  config: GrowConfig;
  setConfig: (c: GrowConfig) => void;
}>({ config: DEFAULT_CONFIG, setConfig: () => {} });

export const useGrowConfig = () => useContext(GrowConfigContext);

export function GrowConfigProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const [config, setConfig] = useState<GrowConfig>(() => {
    const saved = localStorage.getItem('kcang_grow_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_CONFIG;
  });

  // Load from Firestore if logged in
  useEffect(() => {
    if (!currentUser) return;
    const userRef = doc(db, 'users', currentUser.uid);
    getDoc(userRef)
      .then((snap) => {
        if (snap.exists() && snap.data()?.growConfig) {
          const cloudConfig = snap.data().growConfig as GrowConfig;
          setConfig(cloudConfig);
          localStorage.setItem('kcang_grow_config', JSON.stringify(cloudConfig));
        }
      })
      .catch((err) => {
        console.warn('Could not load GrowConfig from Firestore:', err);
      });
  }, [currentUser]);

  const handleSetConfig = (newConfig: GrowConfig) => {
    setConfig(newConfig);
    localStorage.setItem('kcang_grow_config', JSON.stringify(newConfig));

    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      setDoc(userRef, { growConfig: newConfig }, { merge: true }).catch((err) => {
        console.warn('GrowConfig-Sync fehlgeschlagen:', err);
      });
    }
  };

  return (
    <GrowConfigContext.Provider value={{ config, setConfig: handleSetConfig }}>
      {children}
    </GrowConfigContext.Provider>
  );
}
