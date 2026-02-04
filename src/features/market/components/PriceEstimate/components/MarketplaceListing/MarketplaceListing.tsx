/**
 * Marketplace Listing Item
 * Einzelnes selektierbares Listing mit Checkbox und Link
 */

import React from 'react';
import { View, Text, Pressable, Image, Linking } from 'react-native';
import { Icons } from '@/shared/components/Icons';
import { MarketListing, formatPrice } from '@/features/market/services/ebay';

interface MarketplaceListingProps {
  listing: MarketListing;
  onToggle: (id: string) => void;
}

export function MarketplaceListingItem({ listing, onToggle }: MarketplaceListingProps) {
  return (
    <Pressable
      onPress={() => onToggle(listing.id)}
      className={`rounded-lg p-3 mb-2 flex-row ${
        listing.selected
          ? 'bg-primary-900/30 border border-primary-500/50'
          : 'bg-gray-700/30 border border-transparent'
      }`}
    >
      {/* Checkbox */}
      <View
        className={`w-6 h-6 rounded-md mr-3 items-center justify-center ${
          listing.selected ? 'bg-primary-500' : 'bg-gray-600'
        }`}
      >
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
        <Text className="text-gray-200 text-sm font-medium" numberOfLines={2}>
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
  );
}
