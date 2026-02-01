import { useState, useCallback } from 'react';
import { View, Text, Image, Pressable, Alert, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { useHistoryStore, HistoryItem } from '../features/history/store/historyStore';
import { formatPrice } from '../features/market/services/ebay';
import { exportAndShareCSV, calculateTotalValue } from '../features/history/services/exportService';
import { FadeInView, BounceInView, AnimatedButton, StaggeredItem } from '../shared/components/Animated';
import { HistoryItemSkeleton } from '../shared/components/Skeleton';

/**
 * History Screen - Premium Liste mit Animationen
 */
export default function HistoryScreen() {
  const items = useHistoryStore((state) => state.items);
  const removeItem = useHistoryStore((state) => state.removeItem);
  const isEmpty = items.length === 0;
  const [isExporting, setIsExporting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simuliere Refresh
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const totalValue = calculateTotalValue(items);

  const renderItem = ({ item, index }: { item: HistoryItem; index: number }) => (
    <StaggeredItem index={index}>
      <Pressable
        className="bg-background-card rounded-xl p-4 mb-3 flex-row border border-gray-800 active:border-primary-500/50"
        onPress={() => router.push(`/history/${item.id}`)}
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
        {/* Animated Thumbnail */}
        <MotiView
          from={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', delay: index * 50 }}
        >
          <Image
            source={{ uri: item.cachedImageUri || item.imageUri }}
            className="w-20 h-20 rounded-xl"
            resizeMode="cover"
          />
        </MotiView>
        
        {/* Info */}
        <View className="flex-1 ml-4 justify-center">
          <Text className="text-white font-semibold text-base" numberOfLines={2}>
            {item.productName}
          </Text>
          
          <View className="flex-row items-center mt-1.5 gap-2">
            <View className="bg-gray-700/50 px-2 py-0.5 rounded">
              <Text className="text-gray-300 text-xs">{item.category}</Text>
            </View>
            {item.brand && (
              <View className="bg-gray-700/50 px-2 py-0.5 rounded">
                <Text className="text-gray-300 text-xs">{item.brand}</Text>
              </View>
            )}
          </View>

          <View className="flex-row justify-between items-center mt-2">
            <Text className="text-primary-400 font-bold text-lg">
              {formatPrice(item.priceStats.avgPrice)}
            </Text>
            <Text className="text-gray-500 text-xs">
              {formatDate(item.scannedAt)}
            </Text>
          </View>
        </View>
      </Pressable>
    </StaggeredItem>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Verlauf',
          headerBackTitle: 'Zurück',
          headerRight: () => 
            items.length > 0 ? (
              <AnimatedButton 
                onPress={handleExport} 
                disabled={isExporting}
                className="mr-2 px-3 py-1"
              >
                <Text className="text-primary-400 text-base font-medium">
                  {isExporting ? '...' : '📤 Export'}
                </Text>
              </AnimatedButton>
            ) : null,
        }}
      />
      <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
        {isEmpty ? (
          <FadeInView delay={0} className="flex-1 items-center justify-center px-6">
            {/* Animated Empty State */}
            <MotiView
              from={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 12 }}
            >
              <Text className="text-7xl mb-6 text-center">📭</Text>
            </MotiView>
            <Text className="text-white text-2xl font-bold mb-2 text-center">
              Noch keine Scans
            </Text>
            <Text className="text-gray-400 text-center mb-8 max-w-xs">
              Scanne deinen ersten Gegenstand und entdecke seinen Marktwert
            </Text>
            <AnimatedButton
              onPress={() => router.push('/scan')}
              className="bg-primary-500 rounded-xl px-8 py-4"
            >
              <Text className="text-white font-semibold text-lg">
                📸 Jetzt scannen
              </Text>
            </AnimatedButton>
          </FadeInView>
        ) : (
          <FlashList
            data={items}
            keyExtractor={(item: HistoryItem) => item.id}
            contentContainerStyle={{ padding: 16 }}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#6366f1"
              />
            }
            ListHeaderComponent={
              <FadeInView delay={0} className="mb-4">
                {/* Portfolio Value Card */}
                <BounceInView delay={100}>
                  <View className="bg-gradient-to-r from-primary-500/20 to-primary-600/10 border border-primary-500/30 rounded-2xl p-5 mb-4">
                    <View className="flex-row justify-between items-center">
                      <View>
                        <Text className="text-gray-400 text-sm">Geschätzter Gesamtwert</Text>
                        <Text className="text-white text-3xl font-bold mt-1">
                          {formatPrice(totalValue)}
                        </Text>
                      </View>
                      <View className="bg-primary-500/20 w-14 h-14 rounded-xl items-center justify-center">
                        <Text className="text-2xl">💰</Text>
                      </View>
                    </View>
                    <View className="flex-row mt-4 pt-4 border-t border-gray-700/50">
                      <View className="flex-1">
                        <Text className="text-gray-500 text-xs">Anzahl Scans</Text>
                        <Text className="text-white font-bold">{items.length}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-500 text-xs">Ø Wert</Text>
                        <Text className="text-white font-bold">
                          {formatPrice(totalValue / items.length)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </BounceInView>
                
                <Text className="text-gray-500 text-sm">
                  Lange drücken zum Löschen
                </Text>
              </FadeInView>
            }
          />
        )}
      </SafeAreaView>
    </>
  );
}
