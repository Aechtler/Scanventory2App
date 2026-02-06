/**
 * MarketSlider - Orchestrator fuer den horizontalen Markt-Slider
 * Zeigt 3 Slides: Summary, eBay, Kleinanzeigen
 */

import React, { useState, useMemo, useEffect } from 'react';
import { recalculatePriceStats, MarketListing } from '@/features/market/services/ebay';
import { CardSlider } from '@/shared/components/CardSlider';
import { MarketValueModal } from '@/features/market/components/MarketValue/components/MarketValueModal';
import { PriceEstimateModal } from '@/features/market/components/PriceEstimate/components/PriceEstimateModal';
import { GroupedListings } from '@/features/market/components/PriceEstimate/types';
import { SummarySlide } from './slides/SummarySlide';
import { EbaySlide } from './slides/EbaySlide';
import { KleinanzeigenSlide } from './slides/KleinanzeigenSlide';
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
  onRefreshKleinanzeigen,
  onEbayListingsChange,
}: MarketSliderProps) {
  const [showMarketValueModal, setShowMarketValueModal] = useState(false);
  const [showEbayModal, setShowEbayModal] = useState(false);
  const [showKleinanzeigenModal, setShowKleinanzeigenModal] = useState(false);

  // Local eBay listings state for selection
  const [localEbayListings, setLocalEbayListings] = useState<MarketListing[]>(
    ebayListings || []
  );
  useEffect(() => {
    if (ebayListings) setLocalEbayListings(ebayListings);
  }, [ebayListings]);

  // Local Kleinanzeigen listings state for selection
  const [localKAListings, setLocalKAListings] = useState<MarketListing[]>(
    kleinanzeigenListings || []
  );
  useEffect(() => {
    if (kleinanzeigenListings) setLocalKAListings(kleinanzeigenListings);
  }, [kleinanzeigenListings]);

  // eBay stats: use recalculated if user has selection, otherwise original
  const hasEbaySelection = localEbayListings.some((l) => l.selected);
  const ebayDisplayStats = useMemo(() => {
    if (hasEbaySelection) return recalculatePriceStats(localEbayListings);
    return ebayPriceStats;
  }, [localEbayListings, ebayPriceStats, hasEbaySelection]);

  // KA stats: use recalculated if user has selection, otherwise original
  const hasKASelection = localKAListings.some((l) => l.selected);
  const kaDisplayStats = useMemo(() => {
    if (hasKASelection) return recalculatePriceStats(localKAListings);
    return kleinanzeigenPriceStats;
  }, [localKAListings, kleinanzeigenPriceStats, hasKASelection]);

  // Grouped eBay listings
  const ebayGrouped: GroupedListings = useMemo(() => {
    const groups: GroupedListings = {};
    localEbayListings.forEach((l) => {
      const mp = l.marketplace || 'UNKNOWN';
      if (!groups[mp]) groups[mp] = [];
      groups[mp].push(l);
    });
    return groups;
  }, [localEbayListings]);

  // Grouped Kleinanzeigen listings
  const kaGrouped: GroupedListings = useMemo(() => {
    const groups: GroupedListings = {};
    localKAListings.forEach((l) => {
      const mp = l.marketplace || 'KLEINANZEIGEN';
      if (!groups[mp]) groups[mp] = [];
      groups[mp].push(l);
    });
    return groups;
  }, [localKAListings]);

  const ebaySelectedCount = localEbayListings.filter((l) => l.selected).length;
  const kaSelectedCount = localKAListings.filter((l) => l.selected).length;

  // eBay toggle helpers
  const toggleEbayListing = (id: string) => {
    const updated = localEbayListings.map((l) =>
      l.id === id ? { ...l, selected: !l.selected } : l
    );
    setLocalEbayListings(updated);
    onEbayListingsChange?.(updated);
  };

  const toggleEbayMarketplace = (marketplace: string) => {
    const mpListings = localEbayListings.filter((l) => l.marketplace === marketplace);
    const allSelected = mpListings.every((l) => l.selected);
    const updated = localEbayListings.map((l) =>
      l.marketplace === marketplace ? { ...l, selected: !allSelected } : l
    );
    setLocalEbayListings(updated);
    onEbayListingsChange?.(updated);
  };

  // KA toggle helpers
  const toggleKAListing = (id: string) => {
    const updated = localKAListings.map((l) =>
      l.id === id ? { ...l, selected: !l.selected } : l
    );
    setLocalKAListings(updated);
  };

  const toggleKAMarketplace = (marketplace: string) => {
    const mpListings = localKAListings.filter((l) => l.marketplace === marketplace);
    const allSelected = mpListings.every((l) => l.selected);
    const updated = localKAListings.map((l) =>
      l.marketplace === marketplace ? { ...l, selected: !allSelected } : l
    );
    setLocalKAListings(updated);
  };

  return (
    <>
      <CardSlider>
        <SummarySlide
          marketValue={marketValue}
          marketValueLoading={marketValueLoading}
          ebayPriceStats={ebayDisplayStats}
          ebayLoading={ebayLoading}
          kleinanzeigenPriceStats={kaDisplayStats}
          kleinanzeigenLoading={kleinanzeigenLoading}
          onPress={() => marketValue && setShowMarketValueModal(true)}
        />
        <EbaySlide
          platform="ebay"
          priceStats={ebayDisplayStats}
          listings={localEbayListings}
          isLoading={ebayLoading}
          onPress={() => setShowEbayModal(true)}
        />
        <KleinanzeigenSlide
          platform="kleinanzeigen"
          priceStats={kaDisplayStats}
          listings={localKAListings}
          isLoading={kleinanzeigenLoading}
          onPress={() => setShowKleinanzeigenModal(true)}
        />
      </CardSlider>

      {/* Market Value Modal */}
      {marketValue && (
        <MarketValueModal
          visible={showMarketValueModal}
          result={marketValue}
          onClose={() => setShowMarketValueModal(false)}
          onRefresh={onRefreshMarketValue}
        />
      )}

      {/* eBay Modal */}
      {ebayDisplayStats && (
        <PriceEstimateModal
          visible={showEbayModal}
          priceStats={ebayDisplayStats}
          groupedListings={ebayGrouped}
          listings={localEbayListings}
          selectedCount={ebaySelectedCount}
          onClose={() => setShowEbayModal(false)}
          onToggleListing={toggleEbayListing}
          onToggleMarketplace={toggleEbayMarketplace}
          onRefresh={onRefreshEbay}
        />
      )}

      {/* Kleinanzeigen Modal */}
      {kaDisplayStats && (
        <PriceEstimateModal
          visible={showKleinanzeigenModal}
          priceStats={kaDisplayStats}
          groupedListings={kaGrouped}
          listings={localKAListings}
          selectedCount={kaSelectedCount}
          onClose={() => setShowKleinanzeigenModal(false)}
          onToggleListing={toggleKAListing}
          onToggleMarketplace={toggleKAMarketplace}
          onRefresh={onRefreshKleinanzeigen}
        />
      )}
    </>
  );
}
