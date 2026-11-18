import 'react-native-url-polyfill/auto';

import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

export const supabaseConfigured = Boolean(url && publishableKey);

/** SecureStore-backed session persistence that works inside Expo Go. */
const secureStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  publishableKey || 'placeholder',
  {
    auth: {
      storage: secureStorage,
      autoRefreshToken: true,
      persistSession: supabaseConfigured,
      detectSessionInUrl: false,
    },
  },
);
