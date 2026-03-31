import { Tabs } from 'expo-router';
import { useThemeColors } from '../../shared/hooks/useThemeColors';

/**
 * Tabs Layout - Tab Bar wird global via GlobalTabBar gerendert
 */
export default function TabsLayout() {
  const colors = useThemeColors();

  return (
    <Tabs
      tabBar={() => null}
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Inventar',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: 'Entdecken',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
