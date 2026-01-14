import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '../src/context/AuthContext';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { VehicleProvider } from '../src/context/VehicleContext';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};


export default function RootLayout() {
  return (
    <ThemeProvider>
      <ThemedRoot />
    </ThemeProvider>
  );
}

function ThemedRoot() {
  const { colors } = useTheme();
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <AuthProvider>
        <VehicleProvider>
          <StackWrapper />
        </VehicleProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

// Separate component to consume ThemeContext
function StackWrapper() {
  const { colors, resolvedTheme } = useTheme();

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          contentStyle: {
            backgroundColor: colors.background,
          },
          animation: 'slide_from_right', // Smooth slide animation
          presentation: 'card',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="add-vehicle" options={{ presentation: 'modal', title: 'Add Vehicle' }} />
        <Stack.Screen name="settings" options={{ title: 'Profile & Settings', headerBackTitle: 'Back' }} />
        <Stack.Screen name="vehicle-details" options={{ headerShown: false, animation: 'slide_from_right' }} />
      </Stack>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}
