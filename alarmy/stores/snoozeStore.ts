// Simple store for snooze settings to pass between screens
type SnoozeSettings = {
  snoozeEnabled: boolean;
  snoozeInterval: number;
  maxSnoozeCount: number | 'unlimited';
};

let snoozeSettingsStore: SnoozeSettings = {
  snoozeEnabled: true,
  snoozeInterval: 5,
  maxSnoozeCount: 3,
};

let listeners: (() => void)[] = [];

export const snoozeStore = {
  getSettings: () => snoozeSettingsStore,
  
  setSettings: (settings: Partial<SnoozeSettings>) => {
    snoozeSettingsStore = { ...snoozeSettingsStore, ...settings };
    listeners.forEach(listener => listener());
  },
  
  subscribe: (listener: () => void) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  },
};
