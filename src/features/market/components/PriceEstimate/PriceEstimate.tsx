/**
 * Price Estimate Container
 * Hauptkomponente die alle Subkomponenten orchestriert
 */

import React, { useState, useMemo, useEffect } from 'react';
import { recalculatePriceStats, MarketListing } from '@/features/market/services/ebay';
import { PriceEstimateProps, GroupedListings } from '@/features/market/components/PriceEstimate/types';
import { PriceEstimateLoading } from '@/features/market/components/PriceEstimate/components/PriceEstimateLoading';
import { PriceEstimateCard } from '@/features/market/components/PriceEstimate/components/PriceEstimateCard';
import { PriceEstimateModal } from '@/features/market/components/PriceEstimate/components/PriceEstimateModal';

/**
 * Hauptkomponente für Preisschätzung mit Loading/Error States
 */
export function PriceEstimate({
  priceStats,
  listings,
  isLoading,
  error,
  onRefresh,
  onListingsChange,
}: PriceEstimateProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [localListings, setLocalListings] = useState<MarketListing[]>(
    listings || []
  );

  // Update local listings when prop changes
  useEffect(() => {
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
  const groupedListings: GroupedListings = useMemo(() => {
    const groups: GroupedListings = {};
    localListings.forEach((listing) => {
      const mp = listing.marketplace || 'UNKNOWN';
      if (!groups[mp]) groups[mp] = [];
      groups[mp].push(listing);
    });
    return groups;
  }, [localListings]);

  // Get top 3 listings - prioritize German results and relevance
  const top3Listings = useMemo(() => {
    // Sort localListings to put EBAY_DE first, otherwise keep original order (relevance)
    return [...localListings]
      .sort((a, b) => {
        if (a.marketplace === 'EBAY_DE' && b.marketplace !== 'EBAY_DE') return -1;
        if (a.marketplace !== 'EBAY_DE' && b.marketplace === 'EBAY_DE') return 1;
        return 0; // Keep original relative order for items from the same marketplace
      })
      .slice(0, 3);
  }, [localListings]);

  const toggleListing = (listingId: string) => {
    const updated = localListings.map((l) =>
      l.id === listingId ? { ...l, selected: !l.selected } : l
    );
    setLocalListings(updated);
    onListingsChange?.(updated);
  };

  const toggleMarketplace = (marketplace: string) => {
    const marketplaceListings = localListings.filter(
      (l) => l.marketplace === marketplace
    );
    const allSelected = marketplaceListings.every((l) => l.selected);

    const updated = localListings.map((l) =>
      l.marketplace === marketplace ? { ...l, selected: !allSelected } : l
    );
    setLocalListings(updated);
    onListingsChange?.(updated);
  };

  const selectedCount = localListings.filter((l) => l.selected).length;
  const hasSelection = selectedCount > 0;

  // Loading State
  if (isLoading) {
    return <PriceEstimateLoading />;
  }

  // Error or no data
  if (error || !priceStats) {
    return null;
  }

  const displayStats = calculatedStats || priceStats;

  return (
    <>
      <PriceEstimateCard
        priceStats={displayStats}
        top3Listings={top3Listings}
        groupedListings={groupedListings}
        selectedCount={selectedCount}
        hasSelection={hasSelection}
        onPress={() => setShowDetails(true)}
      />

      <PriceEstimateModal
        visible={showDetails}
        priceStats={displayStats}
        groupedListings={groupedListings}
        listings={localListings}
        selectedCount={selectedCount}
        onClose={() => setShowDetails(false)}
        onToggleListing={toggleListing}
        onToggleMarketplace={toggleMarketplace}
        onRefresh={onRefresh}
      />
    </>
  );
}
