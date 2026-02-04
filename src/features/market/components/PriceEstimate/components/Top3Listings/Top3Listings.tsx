/**
 * Top 3 Cheapest Listings
 * Zeigt die 3 günstigsten Angebote mit Rang-Badges
 */

import React from 'react';
import { View, Text, Pressable, Image, Linking } from 'react-native';
import { Icons } from '@/shared/components/Icons';
import { MarketListing, formatPrice, MARKETPLACE_NAMES } from '@/features/market/services/ebay';

interface Top3ListingsProps {
  listings: MarketListing[];
}

export function Top3Listings({ listings }: Top3ListingsProps) {
  if (listings.length === 0) {
    return null;
  }

  const getRankBadgeStyle = (index: number) => {
    if (index === 0) return 'bg-yellow-500/20';
    if (index === 1) return 'bg-gray-400/20';
    return 'bg-orange-500/20';
  };

  const getRankTextStyle = (index: number) => {
    if (index === 0) return 'text-yellow-400';
    if (index === 1) return 'text-gray-300';
    return 'text-orange-400';
  };

  return (
    <View className="mt-4">
      <Text className="text-gray-400 text-xs font-semibold mb-2">
        🏆 Beste Treffer
      </Text>
      <View className="gap-2">
        {listings.slice(0, 3).map((listing, index) => (
          <Pressable
            key={listing.id}
            onPress={() => listing.itemUrl && Linking.openURL(listing.itemUrl)}
            className="flex-row items-center bg-gray-800/40 rounded-lg p-2 border border-gray-700/50"
          >
            {/* Rank Badge */}
            <View
              className={`w-6 h-6 rounded-full items-center justify-center mr-2 ${getRankBadgeStyle(
                index
              )}`}
            >
              <Text className={`text-xs font-bold ${getRankTextStyle(index)}`}>
                {index + 1}
              </Text>
            </View>

            {/* Product Image */}
            {listing.imageUrl ? (
              <Image
                source={{ uri: listing.imageUrl }}
                className="w-12 h-12 rounded bg-gray-700"
                resizeMode="cover"
              />
            ) : (
              <View className="w-12 h-12 rounded bg-gray-700 items-center justify-center">
                <Icons.Package size={18} color="#6b7280" />
              </View>
            )}

            {/* Product Info */}
            <View className="flex-1 ml-2">
              <Text className="text-white text-xs font-medium" numberOfLines={1}>
                {listing.title}
              </Text>
              <View className="flex-row items-center mt-0.5 gap-1">
                <Text className="text-primary-400 font-bold text-sm">
                  {formatPrice(listing.price, listing.currency)}
                </Text>
                {listing.marketplace && (
                  <Text className="text-gray-500 text-xs">
                    {MARKETPLACE_NAMES[listing.marketplace]?.split(' ')[0] || ''}
                  </Text>
                )}
              </View>
            </View>

            {/* Arrow */}
            <Icons.ChevronRight size={16} color="#6b7280" />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
