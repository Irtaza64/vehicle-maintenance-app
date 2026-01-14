import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { DarkColors, LightColors } from '../theme';

type ThemeType = 'light' | 'dark' | 'system';

type ThemeContextType = {
    theme: ThemeType;
    resolvedTheme: 'light' | 'dark';
    colors: typeof DarkColors;
    setTheme: (theme: ThemeType) => void;
};

const ThemeContext = createContext<ThemeContextType>({
    theme: 'system',
    resolvedTheme: 'dark',
    colors: DarkColors,
    setTheme: () => { },
});

export function useTheme() {
    return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemScheme = useColorScheme();
    const [theme, setTheme] = useState<ThemeType>('dark'); // Default to dark as per premium req

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const stored = await AsyncStorage.getItem('app_theme');
            if (stored === 'light' || stored === 'dark' || stored === 'system') {
                setTheme(stored);
            }
        } catch (e) {
            console.log('Failed to load theme', e);
        }
    };

    const updateTheme = async (newTheme: ThemeType) => {
        setTheme(newTheme);
        await AsyncStorage.setItem('app_theme', newTheme);
    };

    const resolvedTheme = theme === 'system' ? (systemScheme || 'dark') : theme;
    const colors = resolvedTheme === 'dark' ? DarkColors : LightColors;

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, colors, setTheme: updateTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
