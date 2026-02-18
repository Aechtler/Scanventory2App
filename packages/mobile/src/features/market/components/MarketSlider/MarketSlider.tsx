/**
 * MarketSlider - Marktanalyse mit Preis-Eingabe
 * Preis-Feld (links, größer) + KI-Schätzung + eBay-Schätzung (rechts gestapelt)
 * Tap auf KI → MarketValueModal, Tap auf eBay → PriceEstimateModal
 */

import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Icons } from '@/shared/components/Icons';
import { useThemeColors } from '@/shared/hooks';
import { recalculatePriceStats, formatPrice, MarketListing } from '@/features/market/services/ebay';
import { MarketValueModal } from '@/features/market/components/MarketValue/components/MarketValueModal';
import { PriceEstimateModal } from '@/features/market/components/PriceEstimate/components/PriceEstimateModal';
import { GroupedListings } from '@/features/market/components/PriceEstimate/types';
import { confidenceColors } from '@/features/market/components/MarketValue/utils';
import { MarketSliderProps } from './types';

export function MarketSlider({
  marketValue,
  marketValueLoading,
  onRefreshMarketValue,
  ebayPriceStats,
  ebayListings,
  ebayLoading,
  onRefreshEbay,
  onEbayListingsChange,
  finalPrice,
  onPricePress,
}: MarketSliderProps) {
  const colors = useThemeColors();
  const [showMarketValueModal, setShowMarketValueModal] = useState(false);
  const [showEbayModal, setShowEbayModal] = useState(false);
  const [localEbayListings, setLocalEbayListings] = useState<MarketListing[]>(ebayListings || []);

  useEffect(() => { if (ebayListings) setLocalEbayListings(ebayListings); }, [ebayListings]);

  const hasEbaySelection = localEbayListings.some((l) => l.selected);
  const ebayDisplayStats = useMemo(() => {
    if (hasEbaySelection) return recalculatePriceStats(localEbayListings);
    return ebayPriceStats;
  }, [localEbayListings, ebayPriceStats, hasEbaySelection]);

  const ebayGrouped: GroupedListings = useMemo(() => {
    const g: GroupedListings = {};
    localEbayListings.forEach((l) => {
      const mp = l.marketplace || 'UNKNOWN';
      if (!g[mp]) g[mp] = [];
      g[mp].push(l);
    });
    return g;
  }, [localEbayListings]);

  const toggleEbayListing = (id: string) => {
    const updated = localEbayListings.map((l) => l.id === id ? { ...l, selected: !l.selected } : l);
    setLocalEbayListings(updated);
    onEbayListingsChange?.(updated);
  };

  const toggleEbayMarketplace = (marketplace: string) => {
    const allSelected = localEbayListings.filter((l) => l.marketplace === marketplace).every((l) => l.selected);
    const updated = localEbayListings.map((l) => l.marketplace === marketplace ? { ...l, selected: !allSelected } : l);
    setLocalEbayListings(updated);
    onEbayListingsChange?.(updated);
  };

  const isLoading = marketValueLoading || ebayLoading;
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

          {/* Rechte Spalte: KI + eBay gestapelt */}
          <View className="flex-1 gap-2">

            {/* KI-Schätzung */}
            <Pressable
              onPress={() => marketValue && setShowMarketValueModal(true)}
              className="flex-1 rounded-xl border border-purple-500/20 bg-purple-500/10 p-3"
            >
              <View className="flex-row items-center justify-between mb-1.5">
                <View className="flex-row items-center gap-1">
                  <Icons.AI size={13} color={colors.primaryLight} />
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
                <View className="flex-row items-center justify-between">
                  <Text className="text-white font-bold text-base">{marketValue.estimatedPrice}</Text>
                  <Icons.ChevronRight size={14} color={colors.textSecondary} />
                </View>
              ) : (
                <Text className="text-foreground-secondary text-xs">Nicht verfügbar</Text>
              )}
            </Pressable>

            {/* eBay */}
            <Pressable
              onPress={() => setShowEbayModal(true)}
              className="flex-1 rounded-xl border border-blue-500/20 bg-blue-500/10 p-3"
            >
              <View className="flex-row items-center justify-between mb-1.5">
                <View className="flex-row items-center gap-1">
                  <Icons.Money size={13} color={colors.primary} />
                  <Text className="text-foreground-secondary text-xs font-medium">eBay</Text>
                </View>
                {localEbayListings.length > 0 && (
                  <Text className="text-foreground-secondary text-[10px]">
                    {localEbayListings.length}×
                  </Text>
                )}
              </View>

              {ebayLoading ? (
                <ActivityIndicator size="small" color={colors.primary} style={{ alignSelf: 'flex-start' }} />
              ) : ebayDisplayStats ? (
                <View className="flex-row items-center justify-between">
                  <Text className="text-white font-bold text-base">
                    {formatPrice(ebayDisplayStats.avgPrice)}
                  </Text>
                  <Icons.ChevronRight size={14} color={colors.textSecondary} />
                </View>
              ) : (
                <Text className="text-foreground-secondary text-xs">Keine Daten</Text>
              )}
            </Pressable>

          </View>
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
      {ebayDisplayStats && (
        <PriceEstimateModal
          visible={showEbayModal}
          priceStats={ebayDisplayStats}
          groupedListings={ebayGrouped}
          listings={localEbayListings}
          selectedCount={localEbayListings.filter((l) => l.selected).length}
          onClose={() => setShowEbayModal(false)}
          onToggleListing={toggleEbayListing}
          onToggleMarketplace={toggleEbayMarketplace}
          onRefresh={onRefreshEbay}
        />
      )}
    </>
  );
}
