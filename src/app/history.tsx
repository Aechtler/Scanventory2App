import { useState } from 'react';
import { View, Text, Image, Pressable, Alert, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHistoryStore, HistoryItem } from '../features/history/store/historyStore';
import { formatPrice } from '../features/market/services/ebayService';
import { exportAndShareCSV, calculateTotalValue } from '../features/history/services/exportService';

/**
 * History Screen - Zeigt alle gescannten Gegenstände
 */
export default function HistoryScreen() {
  const items = useHistoryStore((state) => state.items);
  const removeItem = useHistoryStore((state) => state.removeItem);
  const isEmpty = items.length === 0;
  const [isExporting, setIsExporting] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleExport = async () => {
    if (items.length === 0) return;
    
    setIsExporting(true);
    try {
      await exportAndShareCSV(items);
    } catch (error) {
      Alert.alert('Fehler', 'Export fehlgeschlagen');
    } finally {
      setIsExporting(false);
    }
  };

  const totalValue = calculateTotalValue(items);

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <Pressable
      className="bg-background-card rounded-xl p-4 mb-3 flex-row"
      onLongPress={() => {
        Alert.alert(
          'Löschen?',
          `${item.productName} wirklich löschen?`,
          [
            { text: 'Abbrechen', style: 'cancel' },
            { text: 'Löschen', style: 'destructive', onPress: () => removeItem(item.id) },
          ]
        );
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
          headerRight: () => 
            items.length > 0 ? (
              <Pressable 
                onPress={handleExport} 
                disabled={isExporting}
                className="mr-2"
              >
                <Text className="text-primary-400 text-base">
                  {isExporting ? '...' : '📤 Export'}
                </Text>
              </Pressable>
            ) : null,
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
          <FlashList
            data={items}
            keyExtractor={(item: HistoryItem) => item.id}
            contentContainerStyle={{ padding: 16 }}
            renderItem={renderItem}
            ListHeaderComponent={
              <View className="mb-4">
                {/* Gesamtwert */}
                <View className="bg-primary-500/10 border border-primary-500/30 rounded-xl p-4 mb-4">
                  <Text className="text-gray-400 text-sm">Geschätzter Gesamtwert</Text>
                  <Text className="text-white text-2xl font-bold">
                    {formatPrice(totalValue)}
                  </Text>
                  <Text className="text-gray-500 text-xs mt-1">
                    basierend auf {items.length} {items.length === 1 ? 'Scan' : 'Scans'}
                  </Text>
                </View>
                
                <Text className="text-gray-400">
                  Lange drücken zum Löschen
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </>
  );
}
