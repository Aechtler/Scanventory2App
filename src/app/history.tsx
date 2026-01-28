import { View, Text, FlatList, Image, Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHistoryStore, HistoryItem } from '@/features/history/store/historyStore';
import { formatPrice } from '@/features/market/services/ebayService';

/**
 * History Screen - Zeigt alle gescannten Gegenstände
 */
export default function HistoryScreen() {
  const items = useHistoryStore((state) => state.items);
  const removeItem = useHistoryStore((state) => state.removeItem);
  const isEmpty = items.length === 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <Pressable
      className="bg-background-card rounded-xl p-4 mb-3 flex-row"
      onLongPress={() => {
        // TODO: Confirm dialog
        removeItem(item.id);
      }}
    >
      {/* Thumbnail */}
      <Image
        source={{ uri: item.imageUri }}
        className="w-20 h-20 rounded-lg"
        resizeMode="cover"
      />
      
      {/* Info */}
      <View className="flex-1 ml-4 justify-center">
        <Text className="text-white font-semibold text-base" numberOfLines={2}>
          {item.productName}
        </Text>
        
        <View className="flex-row items-center mt-1 gap-2">
          <View className="bg-gray-700 px-2 py-0.5 rounded">
            <Text className="text-gray-300 text-xs">{item.category}</Text>
          </View>
          {item.brand && (
            <View className="bg-gray-700 px-2 py-0.5 rounded">
              <Text className="text-gray-300 text-xs">{item.brand}</Text>
            </View>
          )}
        </View>

        <View className="flex-row justify-between items-center mt-2">
          <Text className="text-primary-400 font-bold">
            ~{formatPrice(item.priceStats.avgPrice)}
          </Text>
          <Text className="text-gray-500 text-xs">
            {formatDate(item.scannedAt)}
          </Text>
        </View>
      </View>
    </Pressable>
  );

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
            <Text className="text-gray-400 text-center mb-6">
              Scanne deinen ersten Gegenstand um ihn hier zu sehen
            </Text>
            <Pressable
              onPress={() => router.push('/scan')}
              className="bg-primary-500 rounded-xl px-6 py-3 active:bg-primary-600"
            >
              <Text className="text-white font-semibold">Jetzt scannen</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16 }}
            renderItem={renderItem}
            ListHeaderComponent={
              <Text className="text-gray-400 mb-3">
                {items.length} {items.length === 1 ? 'Scan' : 'Scans'} · Lange drücken zum Löschen
              </Text>
            }
          />
        )}
      </SafeAreaView>
    </>
  );
}
