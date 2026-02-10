import { useState, useCallback } from 'react';
import { View, Text, Image, Pressable, Alert, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import { useHistoryStore, HistoryItem } from '../../features/history/store/historyStore';
import { formatPrice } from '../../features/market/services/ebay';
import { exportAndShareCSV, calculateTotalValue } from '../../features/history/services/exportService';
import { FadeInView, BounceInView, AnimatedButton, StaggeredItem } from '../../shared/components/Animated';
import { Icons } from '../../shared/components/Icons';
import { useLibraryFilters } from '../../features/history/hooks/useLibraryFilters';
import { LibrarySearchBar } from '../../features/history/components/LibrarySearchBar';
import { LibraryFilterBar } from '../../features/history/components/LibraryFilterBar';
import { SwipeableLibraryItem } from '../../features/history/components/SwipeableLibraryItem';

/**
 * Bibliothek Tab - Gescannte Gegenstände
 */
export default function LibraryTab() {
  const items = useHistoryStore((state) => state.items);
  const removeItem = useHistoryStore((state) => state.removeItem);
  const isEmpty = items.length === 0;
  const [isExporting, setIsExporting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const {
    filters,
    setSearchQuery,
    setCategory,
    setSortBy,
    filteredItems,
    categories,
    isFiltered,
  } = useLibraryFilters(items);

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
    } catch {
      Alert.alert('Fehler', 'Export fehlgeschlagen');
    } finally {
      setIsExporting(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const totalValue = calculateTotalValue(filteredItems);

  const renderItem = ({ item, index }: { item: HistoryItem; index: number }) => (
    <StaggeredItem index={index}>
      <SwipeableLibraryItem
        itemName={item.productName}
        onDelete={() => removeItem(item.id)}
      >
        <Pressable
          className="bg-background-card rounded-xl p-4 mb-3 flex-row border border-gray-800 active:border-primary-500/50"
          onPress={() => router.push(`/history/${item.id}`)}
        >
          <MotiView
            from={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', delay: index * 50, damping: 25, stiffness: 300 }}
          >
            <Image
              source={{ uri: item.cachedImageUri || item.imageUri }}
              className="w-20 h-20 rounded-xl"
              resizeMode="cover"
            />
          </MotiView>

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
      </SwipeableLibraryItem>
    </StaggeredItem>
  );

  return (
    <View className="flex-1 bg-background">
      {isEmpty ? (
        <FadeInView delay={0} className="flex-1 items-center justify-center px-6">
          <MotiView
            from={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="mb-6 bg-gray-800/50 p-6 rounded-full"
          >
            <Icons.Inbox size={64} color="#6b7280" />
          </MotiView>
          <Text className="text-white text-2xl font-bold mb-2 text-center">
            Noch keine Scans
          </Text>
          <Text className="text-gray-400 text-center mb-8 max-w-xs">
            Scanne deinen ersten Gegenstand und entdecke seinen Marktwert
          </Text>
        </FadeInView>
      ) : (
        <View className="flex-1">
          {/* Suche & Filter bleiben sichtbar beim Scrollen */}
          <View className="px-4 pt-4">
            <LibrarySearchBar
              value={filters.searchQuery}
              onChangeText={setSearchQuery}
            />
            <LibraryFilterBar
              categories={categories}
              selectedCategory={filters.category}
              onSelectCategory={setCategory}
              sortBy={filters.sortBy}
              onSelectSort={setSortBy}
            />
          </View>

          <FlashList
            data={filteredItems}
            keyExtractor={(item: HistoryItem) => item.id}
            contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: 100 }}
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
                <BounceInView delay={100}>
                  <View className="bg-gradient-to-r from-primary-500/20 to-primary-600/10 border border-primary-500/30 rounded-2xl p-5 mb-4">
                    <View className="flex-row justify-between items-center">
                      <View>
                        <Text className="text-gray-400 text-sm">
                          {isFiltered ? 'Gefilterter Wert' : 'Geschätzter Gesamtwert'}
                        </Text>
                        <Text className="text-white text-3xl font-bold mt-1">
                          {formatPrice(totalValue)}
                        </Text>
                      </View>
                      <View className="bg-primary-500/20 w-14 h-14 rounded-xl items-center justify-center">
                        <Icons.Money size={32} color="#a78bfa" />
                      </View>
                    </View>
                    <View className="flex-row mt-4 pt-4 border-t border-gray-700/50">
                      <View className="flex-1">
                        <Text className="text-gray-500 text-xs">Anzahl</Text>
                        <Text className="text-white font-bold">
                          {isFiltered
                            ? `${filteredItems.length} von ${items.length}`
                            : items.length}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-500 text-xs">Ø Wert</Text>
                        <Text className="text-white font-bold">
                          {filteredItems.length > 0
                            ? formatPrice(totalValue / filteredItems.length)
                            : formatPrice(0)}
                        </Text>
                      </View>
                      <AnimatedButton
                        onPress={handleExport}
                        disabled={isExporting}
                        className="px-3 py-1 bg-primary-500/10 rounded-lg border border-primary-500/30 flex-row items-center"
                      >
                        <Icons.Share size={16} color="#c7d2fe" />
                        <Text className="text-primary-400 text-sm font-medium ml-2">
                          {isExporting ? '...' : 'Export'}
                        </Text>
                      </AnimatedButton>
                    </View>
                  </View>
                </BounceInView>

              </FadeInView>
            }
            ListEmptyComponent={
              isFiltered ? (
                <View className="items-center py-12">
                  <Icons.Search size={40} color="#4b5563" />
                  <Text className="text-gray-400 text-base mt-3">
                    Keine Treffer
                  </Text>
                  <Pressable onPress={() => { setSearchQuery(''); setCategory(null); }}>
                    <Text className="text-primary-400 text-sm mt-2">
                      Filter zurücksetzen
                    </Text>
                  </Pressable>
                </View>
              ) : null
            }
          />
        </View>
      )}
    </View>
  );
}
