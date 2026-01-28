import { View, Text, Pressable } from 'react-native';
import { Link, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { FadeInView, BounceInView, AnimatedButton } from '../shared/components/Animated';
import { useHistoryStore } from '../features/history/store/historyStore';
import { formatPrice } from '../features/market/services/ebayService';
import { calculateTotalValue } from '../features/history/services/exportService';

/**
 * Home Screen - Premium Landing Page
 */
export default function HomeScreen() {
  const items = useHistoryStore((state) => state.items);
  const totalValue = calculateTotalValue(items);

  return (
    <>
      <Stack.Screen options={{ title: 'ScanApp', headerShown: false }} />
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 px-6 pt-8">
          {/* Animated Hero Header */}
          <FadeInView delay={0} className="mb-8">
            <MotiView
              from={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 12 }}
            >
              <Text className="text-5xl font-bold text-white mb-2">
                Scan<Text className="text-primary-400">App</Text>
              </Text>
              <Text className="text-lg text-gray-400">
                Entdecke den Wert deiner Sachen
              </Text>
            </MotiView>
          </FadeInView>

          {/* Stats Badge - wenn Items vorhanden */}
          {items.length > 0 && (
            <BounceInView delay={200}>
              <View className="bg-primary-500/10 border border-primary-500/30 rounded-2xl p-5 mb-6">
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-gray-400 text-sm">Dein Portfolio</Text>
                    <Text className="text-white text-3xl font-bold mt-1">
                      {formatPrice(totalValue)}
                    </Text>
                  </View>
                  <View className="bg-primary-500/20 px-4 py-2 rounded-xl">
                    <Text className="text-primary-400 text-lg font-bold">
                      {items.length}
                    </Text>
                    <Text className="text-primary-400/70 text-xs">
                      {items.length === 1 ? 'Item' : 'Items'}
                    </Text>
                  </View>
                </View>
              </View>
            </BounceInView>
          )}

          {/* Main Action Cards */}
          <View className="gap-4">
            {/* Scan Button - Hero */}
            <FadeInView delay={300}>
              <Link href="/scan" asChild>
                <AnimatedButton className="bg-primary-500 rounded-2xl p-6 overflow-hidden">
                  <View className="flex-row items-center">
                    <View className="w-14 h-14 bg-white/20 rounded-xl items-center justify-center mr-4">
                      <Text className="text-3xl">📸</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-white text-xl font-bold mb-1">
                        Scannen
                      </Text>
                      <Text className="text-primary-100">
                        Ermittle den Marktwert
                      </Text>
                    </View>
                    <Text className="text-white/50 text-2xl">→</Text>
                  </View>
                </AnimatedButton>
              </Link>
            </FadeInView>

            {/* History Button */}
            <FadeInView delay={400}>
              <Link href="/history" asChild>
                <AnimatedButton className="bg-background-card rounded-2xl p-6 border border-gray-800">
                  <View className="flex-row items-center">
                    <View className="w-14 h-14 bg-gray-700/50 rounded-xl items-center justify-center mr-4">
                      <Text className="text-3xl">📋</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-white text-xl font-bold mb-1">
                        Verlauf
                      </Text>
                      <Text className="text-gray-400">
                        {items.length > 0 
                          ? `${items.length} gescannte Gegenstände`
                          : 'Deine gescannten Gegenstände'
                        }
                      </Text>
                    </View>
                    <Text className="text-gray-600 text-2xl">→</Text>
                  </View>
                </AnimatedButton>
              </Link>
            </FadeInView>
          </View>

          {/* Platform Badges */}
          <FadeInView delay={500} className="mt-auto mb-8">
            <Text className="text-center text-gray-500 text-sm mb-3">
              Preisvergleich auf
            </Text>
            <View className="flex-row justify-center gap-3">
              {['🛒 eBay', '📦 Kleinanzeigen', '📱 Amazon', '🔍 Idealo'].map((platform, i) => (
                <MotiView
                  key={platform}
                  from={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', delay: 600 + i * 100 }}
                  className="bg-background-card px-3 py-1.5 rounded-full"
                >
                  <Text className="text-gray-400 text-xs">{platform}</Text>
                </MotiView>
              ))}
            </View>
          </FadeInView>
        </View>
      </SafeAreaView>
    </>
  );
}
