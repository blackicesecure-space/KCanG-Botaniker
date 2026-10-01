import React, { createContext, useContext, useState, useEffect } from 'react';
import { CultivationMethod, SoilSubstrateData } from '../types/botanist';
import { useAuth } from './AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface CultivationSystemContextType {
  method: CultivationMethod | null;
  setMethod: (method: CultivationMethod) => void;
  soilData: SoilSubstrateData;
  setSoilData: React.Dispatch<React.SetStateAction<SoilSubstrateData>>;
  showSelectionModal: boolean;
  setShowSelectionModal: (show: boolean) => void;
  resetSelection: () => void;
}

const DEFAULT_SOIL_DATA: SoilSubstrateData = {
  substrateType: 'biobizz_light',
  potSizeLiters: '11',
  potType: 'stofftopf',
  lastWateringDays: '1',
  wateringVolumePerPlantL: '2.0',
  runoffPresent: true,
  runoffPh: '6.4',
  runoffEc: '1.2',
  soilMoistureStatus: 'feucht_optimal',
  fertilizerRegime: 'organisch (BioBizz/Guanokalong)',
};

const CultivationSystemContext = createContext<CultivationSystemContextType | undefined>(undefined);

export const CultivationSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  // Load selection from localStorage if present
  const [method, setMethodState] = useState<CultivationMethod | null>(() => {
    const saved = localStorage.getItem('kcang_cultivation_method');
    if (saved === 'aeroponic' || saved === 'soil') {
      return saved as CultivationMethod;
    }
    return null;
  });

  const [soilData, setSoilData] = useState<SoilSubstrateData>(() => {
    const saved = localStorage.getItem('kcang_soil_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_SOIL_DATA;
  });

  // Modal is shown if no method has been chosen yet
  const [showSelectionModal, setShowSelectionModal] = useState<boolean>(() => {
    const saved = localStorage.getItem('kcang_cultivation_method');
    return !saved;
  });

  // When user logs in, load method preference from Firestore if present
  useEffect(() => {
    if (!currentUser) return;

    const loadUserPreference = async () => {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data?.cultivationMethod === 'soil' || data?.cultivationMethod === 'aeroponic') {
            setMethodState(data.cultivationMethod);
            localStorage.setItem('kcang_cultivation_method', data.cultivationMethod);
            setShowSelectionModal(false);
          } else {
            // First time login for this user: force selection modal
            setShowSelectionModal(true);
          }
        }
      } catch (e) {
        console.warn('Could not read user cultivation method from Firestore:', e);
      }
    };

    loadUserPreference();
  }, [currentUser]);

  const setMethod = (newMethod: CultivationMethod) => {
    setMethodState(newMethod);
    localStorage.setItem('kcang_cultivation_method', newMethod);
    setShowSelectionModal(false);

    // Save to Firestore if user is signed in
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      setDoc(userRef, { cultivationMethod: newMethod }, { merge: true }).catch((err) => {
        console.warn('Failed to sync cultivation method to Firestore:', err);
      });
    }
  };

  const resetSelection = () => {
    setShowSelectionModal(true);
  };

  // Save soil data changes to local storage
  useEffect(() => {
    localStorage.setItem('kcang_soil_data', JSON.stringify(soilData));
  }, [soilData]);

  return (
    <CultivationSystemContext.Provider
      value={{
        method,
        setMethod,
        soilData,
        setSoilData,
        showSelectionModal,
        setShowSelectionModal,
        resetSelection,
      }}
    >
      {children}
    </CultivationSystemContext.Provider>
  );
};

export const useCultivationSystem = () => {
  const context = useContext(CultivationSystemContext);
  if (!context) {
    throw new Error('useCultivationSystem must be used within CultivationSystemProvider');
  }
  return context;
};
