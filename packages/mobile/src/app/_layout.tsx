import '../global.css';

import { View } from 'react-native';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import { useColorScheme } from 'nativewind';
import { useAuthStore } from '../features/auth/store/authStore';
import { GlobalTabBar } from '../shared/components/GlobalTabBar';
import { useThemeStore, useResolvedColorScheme } from '../shared/store/themeStore';
import { useThemeColors } from '../shared/hooks/useThemeColors';
import { ScanActionSheet } from '../shared/components/ScanActionSheet';
import { CampaignActionSheet } from '../features/campaigns/components/CampaignActionSheet';

/**
 * Root Layout - App-weite Navigation und Provider
 */
export default function RootLayout() {
  const { isAuthenticated, isLoading, loadUser } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const theme = useThemeStore((s) => s.theme);
  const resolvedScheme = useResolvedColorScheme();
  const colors = useThemeColors();
  const { setColorScheme } = useColorScheme();

  // NativeWind Farbschema synchronisieren
  useEffect(() => {
    setColorScheme(theme === 'system' ? 'system' : theme);
  }, [theme]);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    // Wait until the navigator is mounted before navigating
    if (!navigationState?.key) return;
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'register';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)/library');
    }
  }, [isAuthenticated, isLoading, segments, navigationState?.key]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style={resolvedScheme === 'dark' ? 'light' : 'dark'} />
        <View style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.textPrimary,
              headerTitleStyle: { fontWeight: '600' },
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen
              name="analyze"
              options={{
                title: 'Analyse',
                presentation: 'modal',
              }}
            />
            <Stack.Screen name="campaigns" options={{ headerShown: false }} />
            <Stack.Screen
              name="history/[id]"
              options={{
                title: 'Details',
                headerBackTitle: 'Zurück',
              }}
            />
            <Stack.Screen
              name="history/edit/[id]"
              options={{
                title: 'Bearbeiten',
                headerBackTitle: 'Zurück',
              }}
            />
          </Stack>
          <GlobalTabBar />
          <ScanActionSheet />
          <CampaignActionSheet />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
