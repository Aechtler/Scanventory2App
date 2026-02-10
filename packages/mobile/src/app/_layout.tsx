import '../global.css';

import { View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import { useAuthStore } from '../features/auth/store/authStore';
import { GlobalTabBar } from '../shared/components/GlobalTabBar';

/**
 * Root Layout - App-weite Navigation und Provider
 */
export default function RootLayout() {
  const { isAuthenticated, isLoading, loadUser } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'register';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <View style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: '#1a1a2e' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: '600' },
              contentStyle: { backgroundColor: '#1a1a2e' },
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
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
