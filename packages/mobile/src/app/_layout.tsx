import '../global.css';

import { View, Platform } from 'react-native';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import { useColorScheme } from 'nativewind';
import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useAuthStore } from '../features/auth/store/authStore';
import { GlobalTabBar } from '../shared/components/GlobalTabBar';
import { useThemeStore, useResolvedColorScheme } from '../shared/store/themeStore';
import { useThemeColors } from '../shared/hooks/useThemeColors';
import { ScanActionSheet } from '../shared/components/ScanActionSheet';
import { CampaignActionSheet } from '../features/campaigns/components/CampaignActionSheet';
import { useEbayConnectionStore } from '../features/listings/store/ebayConnectionStore';
import { apiPatch } from '../shared/services/apiClient';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function registerPushToken(): Promise<void> {
  if (!Device.isDevice) return; // Kein echtes Gerät (Simulator) → überspringen

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Verkaufsbenachrichtigungen',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const token = await Notifications.getExpoPushTokenAsync();
  await apiPatch('/api/users/me/push-token', { pushToken: token.data });
}

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
  const { setConnected, check: checkEbay } = useEbayConnectionStore();

  // NativeWind Farbschema synchronisieren
  useEffect(() => {
    setColorScheme(theme === 'system' ? 'system' : theme);
  }, [theme]);

  useEffect(() => {
    loadUser();
  }, []);

  // Push-Token registrieren sobald User eingeloggt ist
  useEffect(() => {
    if (!isAuthenticated) return;
    registerPushToken().catch(() => {});
  }, [isAuthenticated]);

  // eBay OAuth Callback — scandirwas://ebay-callback?ok=true
  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      if (!url.includes('ebay-callback')) return;
      const { queryParams } = Linking.parse(url);
      if (queryParams?.ok === 'true') {
        setConnected(true);
        // Nochmal verifizieren via Backend
        checkEbay();
      }
    });
    return () => subscription.remove();
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
