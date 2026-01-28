import { View, Text, Pressable } from 'react-native';
import { Link, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Home Screen - Hauptbildschirm der App
 * Bietet Zugang zu Scan und Verlauf
 */
export default function HomeScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'ScanApp', headerShown: false }} />
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 px-6 pt-12">
          {/* Header */}
          <View className="mb-12">
            <Text className="text-4xl font-bold text-white mb-2">
              ScanApp
            </Text>
            <Text className="text-lg text-gray-400">
              Scanne Gegenstände und ermittle deren Marktwert
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="gap-4">
            <Link href="/scan" asChild>
              <Pressable className="bg-primary-500 rounded-2xl p-6 active:bg-primary-600">
                <Text className="text-white text-xl font-semibold mb-1">
                  📸 Scannen
                </Text>
                <Text className="text-primary-200">
                  Fotografiere oder lade ein Bild hoch
                </Text>
              </Pressable>
            </Link>

            <Link href="/history" asChild>
              <Pressable className="bg-background-card rounded-2xl p-6 border border-gray-700 active:bg-background-elevated">
                <Text className="text-white text-xl font-semibold mb-1">
                  📋 Verlauf
                </Text>
                <Text className="text-gray-400">
                  Deine gescannten Gegenstände
                </Text>
              </Pressable>
            </Link>
          </View>

          {/* Info */}
          <View className="mt-auto mb-8">
            <Text className="text-center text-gray-500 text-sm">
              Marktwert-Analyse für eBay, Kleinanzeigen, Amazon & Idealo
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}
