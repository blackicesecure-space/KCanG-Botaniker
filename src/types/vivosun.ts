export interface VivosunDevice {
  id: string;
  name: string;
  type: 'hub_e42a' | 'aero_wave_fan' | 'aerolight_se' | 'dosing_pump' | 'hydro_sensor_pro';
  status: 'online' | 'syncing' | 'offline';
  ipAddress?: string;
  macAddress: string;
  firmwareVersion: string;
  lastTelemetrySync: number;
}

export interface VivosunAccountCredentials {
  email: string;
  password?: string;
  hubDeviceId: string;
  hubPinOrToken?: string;
  region: 'EU (Frankfurt)' | 'US (East)' | 'Global';
  autoSync: boolean;
  syncInterval: number; // in seconds
  lastUpdated?: number;
}

export interface VivosunSyncState {
  isConnected: boolean;
  cloudSyncEnabled: boolean;
  appAccountEmail?: string;
  hubDeviceId: string;
  apiKeyOrToken?: string;
  syncIntervalSeconds: number;
  lastSuccessfulSync?: number;
  devices: VivosunDevice[];
  autoPushToVivosun: boolean;
}
