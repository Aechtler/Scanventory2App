import { View, Text, FlatList } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * History Screen - Zeigt alle gescannten Gegenstände
 *
 * TODO: Mit echten Daten aus dem History-Store verbinden
 */

// Placeholder Daten für UI-Entwicklung
const MOCK_HISTORY: HistoryItem[] = [];

interface HistoryItem {
  id: string;
  name: string;
  scannedAt: Date;
  estimatedValue: number;
  imageUri: string;
}

export default function HistoryScreen() {
  const isEmpty = MOCK_HISTORY.length === 0;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Verlauf',
          headerBackTitle: 'Zurück',
        }}
      />
      <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
        {isEmpty ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-6xl mb-4">📭</Text>
            <Text className="text-white text-xl font-semibold mb-2">
              Noch keine Scans
            </Text>
            <Text className="text-gray-400 text-center">
              Scanne deinen ersten Gegenstand um ihn hier zu sehen
            </Text>
          </View>
        ) : (
          <FlatList
            data={MOCK_HISTORY}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <View className="bg-background-card rounded-xl p-4 mb-3">
                <Text className="text-white font-semibold">{item.name}</Text>
                <Text className="text-gray-400">
                  ca. {item.estimatedValue.toFixed(2)} €
                </Text>
              </View>
            )}
          />
        )}
      </SafeAreaView>
    </>
  );
}
