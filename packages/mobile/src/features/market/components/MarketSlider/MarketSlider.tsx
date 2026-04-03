/**
 * MarketSlider - Marktanalyse mit Preis-Eingabe
 * Preis-Feld (links, größer) + KI-Schätzung + eBay-Schätzung (rechts gestapelt)
 * Tap auf KI → MarketValueModal, Tap auf eBay → PriceEstimateModal
 */

import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Icons } from '@/shared/components/Icons';
import { useThemeColors } from '@/shared/hooks';
import { MarketValueModal } from '@/features/market/components/MarketValue/components/MarketValueModal';
import { MarketSliderProps } from './types';

export function MarketSlider({
  marketValue,
  marketValueLoading,
  onRefreshMarketValue,
  finalPrice,
  onPricePress,
}: MarketSliderProps) {
  const colors = useThemeColors();
  const [showMarketValueModal, setShowMarketValueModal] = useState(false);

  const hasPriceSet = finalPrice !== undefined && finalPrice !== null;
  const priceFormatted = hasPriceSet
    ? finalPrice.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
    : null;

  return (
    <>
      {/* 2-spalten Layout: Preis (links) + Schätzungen (rechts) */}
      <View className="flex-row gap-3">

          {/* Linke Spalte: Mein Preis */}
          <Pressable
            onPress={onPricePress}
            className="flex-[1] p-4 justify-center items-center"
          >
            <Text className="text-foreground-secondary text-xs mb-2 font-medium">Mein Preis</Text>

            {hasPriceSet ? (
              <>
                <Text className="text-white text-3xl font-bold text-center">{priceFormatted}</Text>
                <View className="flex-row items-center mt-2 gap-1 opacity-60">
                  <Icons.Pencil size={11} color={colors.textSecondary} />
                  <Text className="text-foreground-secondary text-[11px]">Ändern</Text>
                </View>
              </>
            ) : marketValue?.estimatedPrice ? (
              <>
                <Text className="text-white/30 text-3xl font-bold text-center">{marketValue.estimatedPrice}</Text>
                <View className="flex-row items-center mt-2 gap-1">
                  <Icons.Plus size={12} color={colors.primary} />
                  <Text className="text-xs font-medium" style={{ color: colors.primary }}>
                    Festlegen
                  </Text>
                </View>
              </>
            ) : (
              <>
                <Text className="text-foreground-secondary text-3xl font-light mb-1.5">—</Text>
                <View className="flex-row items-center gap-1">
                  <Icons.Plus size={12} color={colors.primary} />
                  <Text className="text-xs font-medium" style={{ color: colors.primary }}>
                    Festlegen
                  </Text>
                </View>
              </>
            )}
          </Pressable>

          {/* Rechte Spalte: KI-Schätzung */}
          <Pressable
            onPress={() => marketValue && setShowMarketValueModal(true)}
            className="flex-[1] p-4 justify-center items-center"
          >
            <View className="flex-row items-center gap-1 mb-2">
              <Icons.AI size={12} color={colors.primaryLight} />
              <Text className="text-foreground-secondary text-xs font-medium">KI-Schätzung</Text>
            </View>

            {marketValueLoading ? (
              <ActivityIndicator size="small" color={colors.primaryLight} />
            ) : marketValue ? (
              <>
                <Text className="text-white text-2xl font-bold text-center" adjustsFontSizeToFit numberOfLines={1}>
                  {marketValue.priceRange || marketValue.estimatedPrice}
                </Text>
                <View className="flex-row items-center mt-2 gap-1 opacity-60">
                  <Icons.ChevronRight size={11} color={colors.textSecondary} />
                  <Text className="text-foreground-secondary text-[11px]">Details</Text>
                </View>
              </>
            ) : (
              <>
                <Text className="text-foreground-secondary text-3xl font-light mb-1.5">—</Text>
                <Text className="text-foreground-secondary text-xs opacity-60">Nicht verfügbar</Text>
              </>
            )}
          </Pressable>
      </View>

      {/* Modals */}
      {marketValue && (
        <MarketValueModal
          visible={showMarketValueModal}
          result={marketValue}
          onClose={() => setShowMarketValueModal(false)}
          onRefresh={onRefreshMarketValue}
        />
      )}
    </>
  );
}
