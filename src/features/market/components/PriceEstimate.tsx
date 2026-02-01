/**
 * Price Estimate Component
 * Zeigt die Preisschätzung von eBay an mit Listings nach Marktplatz gruppiert
 */

import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, Modal, Linking, Image } from 'react-native';
import { MotiView } from 'moti';
import { Icons } from '../../../shared/components/Icons';
import { 
  PriceStats, 
  formatPrice, 
  formatPriceRange, 
  MarketListing,
  MarketplaceResult,
  MARKETPLACE_NAMES,
  recalculatePriceStats
} from '../services/ebay';

interface PriceEstimateProps {
  priceStats: PriceStats | null;
  listings?: MarketListing[];
  marketplaceResults?: MarketplaceResult[];
  isLoading: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onListingsChange?: (listings: MarketListing[]) => void;
}

/**
 * Zeigt Preisschätzung mit Loading/Error States
 */
export function PriceEstimate({ 
  priceStats, 
  listings, 
  marketplaceResults,
  isLoading, 
  error, 
  onRefresh,
  onListingsChange 
}: PriceEstimateProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [localListings, setLocalListings] = useState<MarketListing[]>(listings || []);
  
  // Update local listings when prop changes
  React.useEffect(() => {
    if (listings) {
      setLocalListings(listings);
    }
  }, [listings]);

  // Calculate stats from selected listings
  const calculatedStats = useMemo(() => {
    if (localListings.length === 0) return priceStats;
    return recalculatePriceStats(localListings);
  }, [localListings, priceStats]);

  // Group listings by marketplace
  const groupedListings = useMemo(() => {
    const groups: Record<string, MarketListing[]> = {};
    localListings.forEach(listing => {
      const mp = listing.marketplace || 'UNKNOWN';
      if (!groups[mp]) groups[mp] = [];
      groups[mp].push(listing);
    });
    return groups;
  }, [localListings]);

  const toggleListing = (listingId: string) => {
    const updated = localListings.map(l => 
      l.id === listingId ? { ...l, selected: !l.selected } : l
    );
    setLocalListings(updated);
    onListingsChange?.(updated);
  };

  const toggleMarketplace = (marketplace: string) => {
    const marketplaceListings = localListings.filter(l => l.marketplace === marketplace);
    const allSelected = marketplaceListings.every(l => l.selected);
    
    const updated = localListings.map(l => 
      l.marketplace === marketplace ? { ...l, selected: !allSelected } : l
    );
    setLocalListings(updated);
    onListingsChange?.(updated);
  };

  const selectedCount = localListings.filter(l => l.selected).length;
  const selectedListing = localListings.find(l => l.selected);
  const hasSelection = selectedCount > 0;
  
  // Loading State
  if (isLoading) {
    return (
      <View className="bg-background-card rounded-xl p-4 mb-4 border border-gray-800">
        <View className="flex-row items-center">
          <MotiView
            from={{ rotate: '0deg' }}
            animate={{ rotate: '360deg' }}
            transition={{ type: 'timing', duration: 1000, loop: true }}
          >
            <Icons.Money size={24} color="#a78bfa" />
          </MotiView>
          <View className="flex-1">
            <Text className="text-white font-semibold">Lade Preisdaten...</Text>
            <Text className="text-gray-400 text-xs mt-1">
              Durchsuche 5 Marktplätze parallel...
            </Text>
            <View className="h-1 bg-gray-700 rounded-full mt-2 overflow-hidden">
              <MotiView
                from={{ translateX: -100 }}
                animate={{ translateX: 100 }}
                transition={{ type: 'timing', duration: 800, loop: true }}
                className="w-16 h-full bg-primary-500 rounded-full"
              />
            </View>
          </View>
        </View>
      </View>
    );
  }

  // Error or no data
  if (error || !priceStats) {
    return null;
  }

  const displayStats = calculatedStats || priceStats;

  return (
    <>
      <Pressable onPress={() => setShowDetails(true)}>
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 400 }}
          className="bg-gradient-to-r from-primary-600/20 to-primary-500/10 rounded-xl p-4 mb-4 border border-primary-500/30"
        >
          {/* Header */}
          <View className="flex-row items-center mb-3">
            <Icons.Money size={24} color="#a78bfa" />
            <Text className="text-white font-semibold text-lg">Preisschätzung</Text>
            <View className="ml-auto flex-row gap-1">
              {Object.keys(groupedListings).slice(0, 3).map(mp => (
                <Text key={mp} className="text-xs">
                  {MARKETPLACE_NAMES[mp]?.split(' ')[0] || '🌍'}
                </Text>
              ))}
              {Object.keys(groupedListings).length > 3 && (
                <Text className="text-gray-400 text-xs">+{Object.keys(groupedListings).length - 3}</Text>
              )}
            </View>
          </View>

          {/* Main Price */}
          <View className="items-center py-3">
            {hasSelection ? (
              <>
                <Text className="text-gray-400 text-sm mb-1">
                  Referenzpreis ({selectedCount} gewählt)
                </Text>
                <MotiView
                  from={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', delay: 100, stiffness: 400 }}
                >
                  <Text className="text-white text-4xl font-bold">
                    {formatPrice(displayStats.avgPrice)}
                  </Text>
                </MotiView>
              </>
            ) : (
              <>
                <View className="flex-row items-center mb-1"><Icons.Warning size={16} color="#fbbf24" /><Text className="text-yellow-400 text-sm ml-1">Kein Referenzprodukt</Text></View>
                <Text className="text-gray-400 text-lg">Tippen zum Auswählen</Text>
              </>
            )}
          </View>

          {/* Price Range */}
          <View className="flex-row justify-between bg-gray-800/50 rounded-lg p-3 mt-2">
            <View className="items-center flex-1">
              <Text className="text-gray-400 text-xs">Von</Text>
              <Text className="text-green-400 font-semibold">
                {formatPrice(displayStats.minPrice)}
              </Text>
            </View>
            <View className="w-px bg-gray-700" />
            <View className="items-center flex-1">
              <Text className="text-gray-400 text-xs">Bis</Text>
              <Text className="text-red-400 font-semibold">
                {formatPrice(displayStats.maxPrice)}
              </Text>
            </View>
            <View className="w-px bg-gray-700" />
            <View className="items-center flex-1">
              <Text className="text-gray-400 text-xs">Länder</Text>
              <Text className="text-white font-semibold">{Object.keys(groupedListings).length}</Text>
            </View>
          </View>

          <View className="flex-row items-center justify-center mt-3">
            <Text className="text-gray-500 text-xs">Tippen zum Auswählen der Angebote</Text>
            <View className="ml-1">
              <Icons.ChevronDown size={14} color="#6b7280" />
            </View>
          </View>
        </MotiView>
      </Pressable>

      {/* Detail Modal */}
      <Modal
        visible={showDetails}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetails(false)}
      >
        <View className="flex-1 bg-gray-900">
          {/* Modal Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-700">
            <View className="flex-row items-center">
              <Icons.Money size={24} color="#a78bfa" />
              <View>
                <Text className="text-white font-bold text-lg">Preisanalyse</Text>
                <Text className="text-gray-400 text-xs">{selectedCount} von {localListings.length} ausgewählt</Text>
              </View>
            </View>
            <Pressable 
              onPress={() => setShowDetails(false)}
              className="bg-gray-800 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-medium">Fertig</Text>
            </Pressable>
          </View>

          <ScrollView className="flex-1 p-4">
            {/* Calculated Price */}
            <View className="bg-primary-900/30 rounded-xl p-4 mb-4 border border-primary-500/30">
              <Text className="text-primary-300 text-sm mb-2">Berechneter Durchschnitt</Text>
              <Text className="text-white text-4xl font-bold text-center">
                {formatPrice(displayStats.avgPrice)}
              </Text>
              <Text className="text-gray-400 text-center mt-2">
                {formatPriceRange(displayStats.minPrice, displayStats.maxPrice)}
              </Text>
              <Text className="text-gray-500 text-xs text-center mt-2">
                Basierend auf {selectedCount} ausgewählten Angeboten
              </Text>
            </View>

            {/* Listings by Marketplace */}
            {Object.entries(groupedListings).map(([marketplace, mpListings]) => {
              const selectedInMp = mpListings.filter(l => l.selected).length;
              const allSelected = mpListings.every(l => l.selected);
              
              return (
                <View key={marketplace} className="bg-gray-800/50 rounded-xl p-4 mb-4">
                  {/* Marketplace Header */}
                  <Pressable 
                    onPress={() => toggleMarketplace(marketplace)}
                    className="flex-row items-center justify-between mb-3"
                  >
                    <View className="flex-row items-center">
                      <Text className="text-white font-semibold text-lg">
                        {MARKETPLACE_NAMES[marketplace] || marketplace}
                      </Text>
                      <Text className="text-gray-400 ml-2">
                        ({selectedInMp}/{mpListings.length})
                      </Text>
                    </View>
                    <View className={`px-3 py-1 rounded-lg flex-row items-center ${allSelected ? 'bg-primary-500' : 'bg-gray-600'}`}>
                      {allSelected && <View className="mr-1"><Icons.Check size={14} color="#ffffff" /></View>}
                      <Text className="text-white text-sm">
                        {allSelected ? 'Alle' : 'Auswählen'}
                      </Text>
                    </View>
                  </Pressable>

                  {/* Listings */}
                  {mpListings.map((listing) => (
                    <Pressable
                      key={listing.id}
                      onPress={() => toggleListing(listing.id)}
                      className={`rounded-lg p-3 mb-2 flex-row ${
                        listing.selected ? 'bg-primary-900/30 border border-primary-500/50' : 'bg-gray-700/30 border border-transparent'
                      }`}
                    >
                      {/* Checkbox */}
                      <View className={`w-6 h-6 rounded-md mr-3 items-center justify-center ${
                        listing.selected ? 'bg-primary-500' : 'bg-gray-600'
                      }`}>
                        {listing.selected && <Icons.Check size={16} color="#ffffff" />}
                      </View>

                      {/* Product Image */}
                      {listing.imageUrl ? (
                        <Image 
                          source={{ uri: listing.imageUrl }}
                          style={{ width: 56, height: 56, borderRadius: 8 }}
                          resizeMode="cover"
                        />
                      ) : (
                        <View 
                          style={{ width: 56, height: 56, borderRadius: 8 }}
                          className="bg-gray-600 items-center justify-center"
                        >
                          <Icons.Package size={20} color="#9ca3af" />
                        </View>
                      )}
                      
                      {/* Listing Info */}
                      <View className="flex-1 ml-3">
                        <Text 
                          className="text-gray-200 text-sm font-medium"
                          numberOfLines={2}
                        >
                          {listing.title}
                        </Text>
                        <View className="flex-row items-center mt-1">
                          <Text className="text-primary-400 font-bold text-lg">
                            {formatPrice(listing.price, listing.currency)}
                          </Text>
                          {listing.condition && (
                            <View className="bg-gray-600/50 px-2 py-0.5 rounded ml-2">
                              <Text className="text-gray-300 text-xs">{listing.condition}</Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {/* Open Link */}
                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          if (listing.itemUrl) Linking.openURL(listing.itemUrl);
                        }}
                        className="ml-2 p-2"
                      >
                        <Icons.ExternalLink size={20} color="#a78bfa" />
                      </Pressable>
                    </Pressable>
                  ))}
                </View>
              );
            })}

            {/* No listings fallback */}
            {localListings.length === 0 && (
              <View className="bg-gray-800/50 rounded-xl p-4 mb-4">
                <Text className="text-gray-400 text-center">
                  Keine Angebote gefunden.
                  {'\n'}Bitte "Neu laden" drücken.
                </Text>
              </View>
            )}

            {/* Refresh Button */}
            {onRefresh && (
              <Pressable 
                onPress={() => {
                  onRefresh();
                  setShowDetails(false);
                }}
                className="bg-primary-600 py-4 px-6 rounded-xl items-center mb-6"
              >
                <View className="flex-row items-center"><Icons.Refresh size={18} color="#ffffff" /><Text className="text-white font-semibold ml-2">Neu laden</Text></View>
              </Pressable>
            )}

            <Text className="text-gray-600 text-xs text-center mb-4">
              Wähle Angebote aus um den Durchschnittspreis anzupassen
            </Text>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

/**
 * Kompakte Version für Listen
 */
export function PriceEstimateCompact({ priceStats, isLoading }: PriceEstimateProps) {
  if (isLoading) {
    return (
      <View className="flex-row items-center py-2">
        <MotiView
          from={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 500, loop: true }}
          className="h-4 w-20 bg-gray-700 rounded"
        />
      </View>
    );
  }

  if (!priceStats) {
    return null;
  }

  return (
    <View className="flex-row items-center gap-2">
      <Text className="text-primary-400 font-bold">
        ~{formatPrice(priceStats.avgPrice)}
      </Text>
      <Text className="text-gray-500 text-sm">
        ({formatPriceRange(priceStats.minPrice, priceStats.maxPrice)})
      </Text>
    </View>
  );
}
