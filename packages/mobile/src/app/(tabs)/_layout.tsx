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
          title: 'Scannen',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Bibliothek',
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
