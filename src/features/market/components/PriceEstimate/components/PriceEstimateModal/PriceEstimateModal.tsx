/**
 * Price Estimate Detail Modal
 * Zeigt alle Listings gruppiert nach Marktplatz mit Auswahl-Optionen
 */

import React from 'react';
import { View, Text, Pressable, ScrollView, Modal } from 'react-native';
import { Icons } from '@/shared/components/Icons';
import {
  PriceStats,
  formatPrice,
  formatPriceRange,
  MarketListing,
  MARKETPLACE_NAMES,
} from '@/features/market/services/ebay';
import { MarketplaceListingItem } from '@/features/market/components/PriceEstimate/components/MarketplaceListing';
import { GroupedListings } from '@/features/market/components/PriceEstimate/types';

interface PriceEstimateModalProps {
  visible: boolean;
  priceStats: PriceStats;
  groupedListings: GroupedListings;
  listings: MarketListing[];
  selectedCount: number;
  onClose: () => void;
  onToggleListing: (id: string) => void;
  onToggleMarketplace: (marketplace: string) => void;
  onRefresh?: () => void;
}

export function PriceEstimateModal({
  visible,
  priceStats,
  groupedListings,
  listings,
  selectedCount,
  onClose,
  onToggleListing,
  onToggleMarketplace,
  onRefresh,
}: PriceEstimateModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-gray-900">
        {/* Modal Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-700">
          <View className="flex-row items-center gap-3">
            <Icons.Money size={24} color="#a78bfa" />
            <View>
              <Text className="text-white font-bold text-lg">Preisanalyse</Text>
              <Text className="text-gray-400 text-xs">
                {selectedCount} von {listings.length} ausgewählt
              </Text>
            </View>
          </View>
          <Pressable
            onPress={onClose}
            className="bg-gray-800 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-medium">Fertig</Text>
          </Pressable>
        </View>

        <ScrollView className="flex-1 p-4">
          {/* Calculated Price */}
          <View className="bg-primary-900/30 rounded-xl p-4 mb-4 border border-primary-500/30">
            <Text className="text-primary-300 text-sm mb-2">
              Berechneter Durchschnitt
            </Text>
            <Text className="text-white text-4xl font-bold text-center">
              {formatPrice(priceStats.avgPrice)}
            </Text>
            <Text className="text-gray-400 text-center mt-2">
              {formatPriceRange(priceStats.minPrice, priceStats.maxPrice)}
            </Text>
            <Text className="text-gray-500 text-xs text-center mt-2">
              Basierend auf {selectedCount} ausgewählten Angeboten
            </Text>
          </View>

          {/* Listings by Marketplace */}
          {Object.entries(groupedListings).map(([marketplace, mpListings]) => {
            const selectedInMp = mpListings.filter((l) => l.selected).length;
            const allSelected = mpListings.every((l) => l.selected);

            return (
              <View
                key={marketplace}
                className="bg-gray-800/50 rounded-xl p-4 mb-4"
              >
                {/* Marketplace Header */}
                <Pressable
                  onPress={() => onToggleMarketplace(marketplace)}
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
                  <View
                    className={`px-3 py-1 rounded-lg flex-row items-center ${
                      allSelected ? 'bg-primary-500' : 'bg-gray-600'
                    }`}
                  >
                    {allSelected && (
                      <View className="mr-1">
                        <Icons.Check size={14} color="#ffffff" />
                      </View>
                    )}
                    <Text className="text-white text-sm">
                      {allSelected ? 'Alle' : 'Auswählen'}
                    </Text>
                  </View>
                </Pressable>

                {/* Listings */}
                {mpListings.map((listing) => (
                  <MarketplaceListingItem
                    key={listing.id}
                    listing={listing}
                    onToggle={onToggleListing}
                  />
                ))}
              </View>
            );
          })}

          {/* No listings fallback */}
          {listings.length === 0 && (
            <View className="bg-gray-800/50 rounded-xl p-4 mb-4">
              <Text className="text-gray-400 text-center">
                Keine Angebote gefunden.{'\n'}Bitte "Neu laden" drücken.
              </Text>
            </View>
          )}

          {/* Refresh Button */}
          {onRefresh && (
            <Pressable
              onPress={() => {
                onRefresh();
                onClose();
              }}
              className="bg-primary-600 py-4 px-6 rounded-xl items-center mb-6"
            >
              <View className="flex-row items-center">
                <Icons.Refresh size={18} color="#ffffff" />
                <Text className="text-white font-semibold ml-2">Neu laden</Text>
              </View>
            </Pressable>
          )}

          <Text className="text-gray-600 text-xs text-center mb-4">
            Wähle Angebote aus um den Durchschnittspreis anzupassen
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}
