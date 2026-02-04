import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

interface StorageAdapter {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

const isWeb = Platform.OS === 'web';

async function migrateLegacyItem(key: string): Promise<string | null> {
  const legacyValue = await AsyncStorage.getItem(key);
  if (!legacyValue) return null;

  await SecureStore.setItemAsync(key, legacyValue);
  await AsyncStorage.removeItem(key);
  return legacyValue;
}

export const authStorage: StorageAdapter = {
  getItem: async (key: string) => {
    if (isWeb) {
      return AsyncStorage.getItem(key);
    }

    try {
      const value = await SecureStore.getItemAsync(key);
      if (value !== null) return value;
      return await migrateLegacyItem(key);
    } catch {
      return AsyncStorage.getItem(key);
    }
  },
  setItem: async (key: string, value: string) => {
    if (isWeb) {
      return AsyncStorage.setItem(key, value);
    }

    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      await AsyncStorage.setItem(key, value);
    }
  },
  removeItem: async (key: string) => {
    if (isWeb) {
      return AsyncStorage.removeItem(key);
    }

    try {
      await SecureStore.deleteItemAsync(key);
    } finally {
      await AsyncStorage.removeItem(key);
    }
  },
};
