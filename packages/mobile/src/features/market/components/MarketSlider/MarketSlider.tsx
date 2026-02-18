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
import { confidenceColors } from '@/features/market/components/MarketValue/utils';
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

  const isLoading = marketValueLoading;
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
            className="flex-1 rounded-xl border border-purple-500/20 bg-purple-500/10 p-4 justify-center"
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-1.5">
                <Icons.AI size={15} color={colors.primaryLight} />
                <Text className="text-foreground-secondary text-xs font-medium">KI-Schätzung</Text>
              </View>
              {marketValue?.confidence && confidenceColors[marketValue.confidence as keyof typeof confidenceColors] && (
                <View className={`px-1.5 py-0.5 rounded-full ${confidenceColors[marketValue.confidence as keyof typeof confidenceColors].bg}`}>
                  <Text className={`text-[9px] font-bold uppercase ${confidenceColors[marketValue.confidence as keyof typeof confidenceColors].text}`}>
                    {marketValue.confidence}
                  </Text>
                </View>
              )}
            </View>

            {marketValueLoading ? (
              <ActivityIndicator size="small" color={colors.primaryLight} style={{ alignSelf: 'flex-start' }} />
            ) : marketValue ? (
              <>
                <Text className="text-white font-bold text-2xl mb-1">{marketValue.estimatedPrice}</Text>
                {marketValue.priceRange && (
                  <Text className="text-foreground-secondary text-xs">{marketValue.priceRange}</Text>
                )}
                <View className="flex-row items-center mt-2 gap-1 opacity-60">
                  <Icons.ChevronRight size={12} color={colors.textSecondary} />
                  <Text className="text-foreground-secondary text-[11px]">Details</Text>
                </View>
              </>
            ) : (
              <Text className="text-foreground-secondary text-xs">Nicht verfügbar</Text>
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
