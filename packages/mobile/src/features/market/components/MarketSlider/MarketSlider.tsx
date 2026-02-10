/**
 * MarketSlider - Kompakte, aufklappbare Marktanalyse
 * Eingeklappt: Einzeiler mit KI-Preis + Plattform-Averages
 * Ausgeklappt: Kompakte Karten fuer KI, eBay, Kleinanzeigen — Tap → Detail-Modal
 */

import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { MotiView } from 'moti';
import { Icons } from '@/shared/components/Icons';
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
  kleinanzeigenPriceStats,
  kleinanzeigenListings,
  kleinanzeigenLoading,
  kleinanzeigenError,
  onRefreshKleinanzeigen,
  onEbayListingsChange,
}: MarketSliderProps) {
  const [expanded, setExpanded] = useState(false);
  const [showMarketValueModal, setShowMarketValueModal] = useState(false);
  const [showEbayModal, setShowEbayModal] = useState(false);
  const [showKleinanzeigenModal, setShowKleinanzeigenModal] = useState(false);

  // Local listings state for selection
  const [localEbayListings, setLocalEbayListings] = useState<MarketListing[]>(ebayListings || []);
  const [localKAListings, setLocalKAListings] = useState<MarketListing[]>(kleinanzeigenListings || []);

  useEffect(() => { if (ebayListings) setLocalEbayListings(ebayListings); }, [ebayListings]);
  useEffect(() => { if (kleinanzeigenListings) setLocalKAListings(kleinanzeigenListings); }, [kleinanzeigenListings]);

  const hasEbaySelection = localEbayListings.some((l) => l.selected);
  const ebayDisplayStats = useMemo(() => {
    if (hasEbaySelection) return recalculatePriceStats(localEbayListings);
    return ebayPriceStats;
  }, [localEbayListings, ebayPriceStats, hasEbaySelection]);

  const hasKASelection = localKAListings.some((l) => l.selected);
  const kaDisplayStats = useMemo(() => {
    if (hasKASelection) return recalculatePriceStats(localKAListings);
    return kleinanzeigenPriceStats;
  }, [localKAListings, kleinanzeigenPriceStats, hasKASelection]);

  // Grouped listings for modals
  const ebayGrouped: GroupedListings = useMemo(() => {
    const g: GroupedListings = {};
    localEbayListings.forEach((l) => { const mp = l.marketplace || 'UNKNOWN'; if (!g[mp]) g[mp] = []; g[mp].push(l); });
    return g;
  }, [localEbayListings]);

  const kaGrouped: GroupedListings = useMemo(() => {
    const g: GroupedListings = {};
    localKAListings.forEach((l) => { const mp = l.marketplace || 'KLEINANZEIGEN'; if (!g[mp]) g[mp] = []; g[mp].push(l); });
    return g;
  }, [localKAListings]);

  // Toggle helpers
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
  const toggleKAListing = (id: string) => {
    setLocalKAListings((prev) => prev.map((l) => l.id === id ? { ...l, selected: !l.selected } : l));
  };
  const toggleKAMarketplace = (marketplace: string) => {
    const allSelected = localKAListings.filter((l) => l.marketplace === marketplace).every((l) => l.selected);
    setLocalKAListings((prev) => prev.map((l) => l.marketplace === marketplace ? { ...l, selected: !allSelected } : l));
  };

  const isLoading = marketValueLoading || ebayLoading || kleinanzeigenLoading;

  return (
    <>
      <View className="bg-background-card rounded-xl border border-gray-800 overflow-hidden">
        {/* Collapsed Header — immer sichtbar */}
        <Pressable onPress={() => setExpanded(!expanded)} className="p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Icons.Stats size={18} color="#a78bfa" />
              <Text className="text-white font-semibold text-sm">Marktanalyse</Text>
              {isLoading && <ActivityIndicator size="small" color="#a78bfa" />}
            </View>
            {expanded ? (
              <Icons.ChevronUp size={18} color="#6b7280" />
            ) : (
              <Icons.ChevronDown size={18} color="#6b7280" />
            )}
          </View>

          {/* Kompakte Preis-Uebersicht — nur wenn eingeklappt */}
          {!expanded && (
            <CollapsedSummary
              marketValue={marketValue}
              marketValueLoading={marketValueLoading}
              ebayStats={ebayDisplayStats}
              ebayLoading={ebayLoading}
              kaStats={kaDisplayStats}
              kaLoading={kleinanzeigenLoading}
            />
          )}
        </Pressable>

        {/* Expanded Content */}
        {expanded && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 200 }}
            className="px-4 pb-4"
          >
              {/* KI-Karte */}
              <CompactCard
                icon={<Icons.AI size={16} color="#a78bfa" />}
                label="KI-Schaetzung"
                color="purple"
                badge={marketValue?.confidence}
                onPress={() => marketValue && setShowMarketValueModal(true)}
                isLoading={marketValueLoading}
              >
                {marketValue ? (
                  <View>
                    <Text className="text-white text-lg font-bold">{marketValue.estimatedPrice}</Text>
                    {marketValue.priceRange && (
                      <Text className="text-gray-500 text-xs">{marketValue.priceRange}</Text>
                    )}
                    {marketValue.summary && (
                      <Text className="text-gray-400 text-xs mt-1" numberOfLines={2}>
                        {marketValue.summary}
                      </Text>
                    )}
                  </View>
                ) : (
                  <Text className="text-gray-600 text-xs">Nicht verfuegbar</Text>
                )}
              </CompactCard>

              {/* eBay-Karte */}
              <CompactCard
                icon={<Icons.Money size={16} color="#818cf8" />}
                label="eBay"
                color="indigo"
                count={localEbayListings.length}
                onPress={() => setShowEbayModal(true)}
                isLoading={ebayLoading}
              >
                {ebayDisplayStats ? (
                  <View className="flex-row items-baseline gap-3">
                    <Text className="text-white text-lg font-bold">
                      {formatPrice(ebayDisplayStats.avgPrice)}
                    </Text>
                    <Text className="text-gray-500 text-xs">
                      {formatPrice(ebayDisplayStats.minPrice)} – {formatPrice(ebayDisplayStats.maxPrice)}
                    </Text>
                  </View>
                ) : (
                  <Text className="text-gray-600 text-xs">Keine Daten</Text>
                )}
              </CompactCard>

              {/* Kleinanzeigen-Karte */}
              <CompactCard
                icon={<Icons.Tag size={16} color="#22c55e" />}
                label="Kleinanzeigen"
                color="green"
                count={localKAListings.length}
                onPress={() => kleinanzeigenError ? onRefreshKleinanzeigen?.() : setShowKleinanzeigenModal(true)}
                isLoading={kleinanzeigenLoading}
              >
                {kaDisplayStats ? (
                  <View className="flex-row items-baseline gap-3">
                    <Text className="text-white text-lg font-bold">
                      {formatPrice(kaDisplayStats.avgPrice)}
                    </Text>
                    <Text className="text-gray-500 text-xs">
                      {formatPrice(kaDisplayStats.minPrice)} – {formatPrice(kaDisplayStats.maxPrice)}
                    </Text>
                  </View>
                ) : kleinanzeigenError ? (
                  <Text className="text-red-400/70 text-xs">Suche fehlgeschlagen – tippen zum Wiederholen</Text>
                ) : (
                  <Text className="text-gray-600 text-xs">Keine Treffer</Text>
                )}
              </CompactCard>
          </MotiView>
        )}
      </View>

      {/* Modals — bleiben wie bisher */}
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
      {kaDisplayStats && (
        <PriceEstimateModal
          visible={showKleinanzeigenModal}
          priceStats={kaDisplayStats}
          groupedListings={kaGrouped}
          listings={localKAListings}
          selectedCount={localKAListings.filter((l) => l.selected).length}
          onClose={() => setShowKleinanzeigenModal(false)}
          onToggleListing={toggleKAListing}
          onToggleMarketplace={toggleKAMarketplace}
          onRefresh={onRefreshKleinanzeigen}
        />
      )}
    </>
  );
}

/** Kompakte Zusammenfassung im eingeklappten Zustand */
function CollapsedSummary({
  marketValue,
  marketValueLoading,
  ebayStats,
  ebayLoading,
  kaStats,
  kaLoading,
}: {
  marketValue: MarketSliderProps['marketValue'];
  marketValueLoading: boolean;
  ebayStats: ReturnType<typeof recalculatePriceStats> | null;
  ebayLoading: boolean;
  kaStats: ReturnType<typeof recalculatePriceStats> | null;
  kaLoading: boolean;
}) {
  const anyData = marketValue || ebayStats || kaStats;
  const allLoading = marketValueLoading && ebayLoading && kaLoading;

  if (allLoading) {
    return (
      <View className="flex-row items-center mt-3">
        <Text className="text-gray-500 text-sm">Daten werden geladen...</Text>
      </View>
    );
  }

  if (!anyData && !marketValueLoading && !ebayLoading && !kaLoading) {
    return (
      <View className="flex-row items-center mt-3">
        <Text className="text-gray-600 text-sm">Keine Marktdaten verfuegbar</Text>
      </View>
    );
  }

  return (
    <View className="flex-row items-center gap-4 mt-3">
      {/* KI-Preis */}
      {marketValueLoading ? (
        <PricePill label="KI" loading color="#a78bfa" />
      ) : marketValue ? (
        <PricePill label="KI" value={marketValue.estimatedPrice} color="#a78bfa" />
      ) : null}

      {/* eBay */}
      {ebayLoading ? (
        <PricePill label="eBay" loading color="#818cf8" />
      ) : ebayStats ? (
        <PricePill label="eBay" value={formatPrice(ebayStats.avgPrice)} color="#818cf8" />
      ) : null}

      {/* Kleinanzeigen */}
      {kaLoading ? (
        <PricePill label="KA" loading color="#22c55e" />
      ) : kaStats ? (
        <PricePill label="KA" value={formatPrice(kaStats.avgPrice)} color="#22c55e" />
      ) : null}
    </View>
  );
}

/** Kleines Preis-Pill fuer die collapsed Ansicht */
function PricePill({ label, value, loading, color }: {
  label: string;
  value?: string;
  loading?: boolean;
  color: string;
}) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
      <Text className="text-gray-500 text-xs">{label}</Text>
      {loading ? (
        <ActivityIndicator size={10} color={color} />
      ) : (
        <Text className="text-white text-sm font-semibold">{value}</Text>
      )}
    </View>
  );
}

/** Kompakte Karte fuer den expanded Zustand */
function CompactCard({
  icon,
  label,
  color,
  badge,
  count,
  onPress,
  isLoading,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  badge?: string;
  count?: number;
  onPress: () => void;
  isLoading: boolean;
  children: React.ReactNode;
}) {
  const borderColor =
    color === 'purple' ? 'border-purple-500/20' :
    color === 'indigo' ? 'border-indigo-500/20' :
    'border-green-500/20';

  return (
    <Pressable onPress={onPress} className="mb-2">
      <View className={`bg-gray-800/40 rounded-lg p-3 border ${borderColor} flex-row items-center`}>
        {/* Left: Icon + Info */}
        <View className="flex-1">
          <View className="flex-row items-center gap-1.5 mb-1">
            {icon}
            <Text className="text-gray-400 text-xs font-medium">{label}</Text>
            {badge && confidenceColors[badge as keyof typeof confidenceColors] && (
              <View className={`px-1.5 py-0.5 rounded-full ${confidenceColors[badge as keyof typeof confidenceColors].bg}`}>
                <Text className={`text-[10px] font-bold uppercase ${confidenceColors[badge as keyof typeof confidenceColors].text}`}>
                  {badge}
                </Text>
              </View>
            )}
            {count !== undefined && count > 0 && (
              <Text className="text-gray-600 text-[10px]">{count} Angebote</Text>
            )}
          </View>
          {isLoading ? (
            <ActivityIndicator size="small" color="#6b7280" style={{ alignSelf: 'flex-start' }} />
          ) : (
            children
          )}
        </View>

        {/* Right: Chevron */}
        <Icons.ChevronRight size={16} color="#4b5563" />
      </View>
    </Pressable>
  );
}
