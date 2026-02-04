/**
 * Price Estimate Card
 * Hauptkarte mit Preisstatistiken und Top 3 Listings
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { Icons } from '@/shared/components/Icons';
import { PriceStats, formatPrice, MARKETPLACE_NAMES, MarketListing } from '@/features/market/services/ebay';
import { Top3Listings } from '@/features/market/components/PriceEstimate/components/Top3Listings';
import { GroupedListings } from '@/features/market/components/PriceEstimate/types';

interface PriceEstimateCardProps {
  priceStats: PriceStats;
  top3Listings: MarketListing[];
  groupedListings: GroupedListings;
  selectedCount: number;
  hasSelection: boolean;
  onPress: () => void;
}

export function PriceEstimateCard({
  priceStats,
  top3Listings,
  groupedListings,
  selectedCount,
  hasSelection,
  onPress,
}: PriceEstimateCardProps) {
  return (
    <Pressable onPress={onPress}>
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 400 }}
        className="bg-gradient-to-r from-primary-600/20 to-primary-500/10 rounded-xl p-4 mb-4 border border-primary-500/30"
      >
        {/* Header */}
        <View className="flex-row items-center mb-3">
          <Icons.Money size={24} color="#a78bfa" />
          <Text className="text-white font-semibold text-lg ml-2">
            Preisschätzung
          </Text>
          <View className="ml-auto flex-row gap-1">
            {Object.keys(groupedListings)
              .slice(0, 3)
              .map((mp) => (
                <Text key={mp} className="text-xs">
                  {MARKETPLACE_NAMES[mp]?.split(' ')[0] || '🌍'}
                </Text>
              ))}
            {Object.keys(groupedListings).length > 3 && (
              <Text className="text-gray-400 text-xs">
                +{Object.keys(groupedListings).length - 3}
              </Text>
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
                  {formatPrice(priceStats.avgPrice)}
                </Text>
              </MotiView>
            </>
          ) : (
            <>
              <View className="flex-row items-center mb-1">
                <Icons.Warning size={16} color="#fbbf24" />
                <Text className="text-yellow-400 text-sm ml-1">
                  Kein Referenzprodukt
                </Text>
              </View>
              <Text className="text-gray-400 text-lg">Tippen zum Auswählen</Text>
            </>
          )}
        </View>

        {/* Price Range */}
        <View className="flex-row justify-between bg-gray-800/50 rounded-lg p-3 mt-2">
          <View className="items-center flex-1">
            <Text className="text-gray-400 text-xs">Von</Text>
            <Text className="text-green-400 font-semibold">
              {formatPrice(priceStats.minPrice)}
            </Text>
          </View>
          <View className="w-px bg-gray-700" />
          <View className="items-center flex-1">
            <Text className="text-gray-400 text-xs">Bis</Text>
            <Text className="text-red-400 font-semibold">
              {formatPrice(priceStats.maxPrice)}
            </Text>
          </View>
          <View className="w-px bg-gray-700" />
          <View className="items-center flex-1">
            <Text className="text-gray-400 text-xs">Länder</Text>
            <Text className="text-white font-semibold">
              {Object.keys(groupedListings).length}
            </Text>
          </View>
        </View>

        {/* Top 3 Cheapest Listings */}
        <Top3Listings listings={top3Listings} />

        {/* Footer */}
        <View className="flex-row items-center justify-center mt-3">
          <Text className="text-gray-500 text-xs">
            Tippen zum Auswählen der Angebote
          </Text>
          <View className="ml-1">
            <Icons.ChevronDown size={14} color="#6b7280" />
          </View>
        </View>
      </MotiView>
    </Pressable>
  );
}
