import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

const ExposureStoreAdapter = {
    getItem: (key: string) => {
        return SecureStore.getItemAsync(key);
    },
    setItem: (key: string, value: string) => {
        return SecureStore.setItemAsync(key, value);
    },
    removeItem: (key: string) => {
        return SecureStore.deleteItemAsync(key);
    },
};

const supabaseUrl = 'https://otlcmnehpicyogagevuj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bGNtbmVocGljeW9nYWdldnVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0MDczMTYsImV4cCI6MjA4Mzk4MzMxNn0.9zzXikXaKXzjzjUxvbAtiY8HJR1czHG6_RUB0wWV7cE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: Platform.OS === 'web' ? AsyncStorage : ExposureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
