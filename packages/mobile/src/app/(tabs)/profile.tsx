import { View, Text, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../features/auth/store/authStore';
import { useHistoryStore } from '../../features/history/store/historyStore';
import { formatPrice } from '../../features/market/services/ebay';
import { calculateTotalValue } from '../../features/history/services/exportService';
import { FadeInView } from '../../shared/components/Animated';
import { Icons } from '../../shared/components/Icons';
import { ThemeSelector } from '../../shared/components/ThemeSelector';
import { useThemeColors } from '../../shared/hooks/useThemeColors';
import { useTabBarPadding } from '../../shared/hooks/useTabBarPadding';
import Constants from 'expo-constants';

/**
 * Profil Tab - User-Info, Portfolio-Stats, Theme, Logout
 */
export default function ProfileTab() {
  const { user, logout } = useAuthStore();
  const items = useHistoryStore((state) => state.items);
  const totalValue = calculateTotalValue(items);
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';
  const colors = useThemeColors();
  const tabBarPadding = useTabBarPadding();

  const handleLogout = () => {
    Alert.alert('Abmelden', 'Möchtest du dich wirklich abmelden?', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Abmelden',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 pt-8">
        {/* User Avatar & Name */}
        <FadeInView delay={0} className="items-center mb-8">
          <View className="w-20 h-20 bg-primary/20 rounded-full items-center justify-center mb-4 border-2 border-primary/30">
            <Icons.User size={36} color={colors.primary} />
          </View>
          <Text className="text-foreground text-2xl font-bold">
            {user?.name || 'Benutzer'}
          </Text>
          <Text className="text-foreground-secondary text-sm mt-1">
            {user?.email}
          </Text>
        </FadeInView>

        {/* Portfolio Stats */}
        <FadeInView delay={100}>
          <View className="bg-background-card rounded-2xl p-5 border border-border mb-6">
            <Text className="text-foreground-secondary text-sm mb-4">Dein Portfolio</Text>
            <View className="flex-row">
              <View className="flex-1 items-center">
                <Text className="text-foreground text-2xl font-bold">{items.length}</Text>
                <Text className="text-foreground-secondary text-xs mt-1">Gegenstände</Text>
              </View>
              <View className="w-px bg-border" />
              <View className="flex-1 items-center">
                <Text className="text-primary text-2xl font-bold">
                  {formatPrice(totalValue)}
                </Text>
                <Text className="text-foreground-secondary text-xs mt-1">Gesamtwert</Text>
              </View>
            </View>
          </View>
        </FadeInView>

        {/* Theme Selector */}
        <FadeInView delay={150}>
          <View className="bg-background-card rounded-2xl p-5 border border-border mb-6">
            <Text className="text-foreground-secondary text-sm mb-3">Erscheinungsbild</Text>
            <ThemeSelector />
          </View>
        </FadeInView>

        {/* Logout */}
        <FadeInView delay={200}>
          <Pressable
            onPress={handleLogout}
            className="bg-red-500/10 rounded-2xl p-4 border border-red-500/20 flex-row items-center active:bg-red-500/20"
          >
            <Icons.LogOut size={20} color="#ef4444" />
            <Text className="text-red-400 font-semibold ml-3">Abmelden</Text>
          </Pressable>
        </FadeInView>

        {/* App Version */}
        <View className="items-center" style={{ paddingBottom: tabBarPadding, marginTop: 'auto' }}>
          <Text className="text-foreground-secondary/50 text-xs">ScanApp v{appVersion}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
