import { Tabs } from 'expo-router';
import { CustomTabBar } from '../../shared/components/CustomTabBar';

/**
 * Tabs Layout - Bottom Navigation mit Custom Tab Bar
 */
export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: '#1a1a2e' },
        headerTintColor: '#fff',
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
