/**
 * Market Value Card Container
 * Hauptkomponente für KI-basierte Marktwertanalyse
 */

import React, { useState } from 'react';
import { MarketValueCardProps } from '@/features/market/components/MarketValue/types';
import { MarketValueLoading } from '@/features/market/components/MarketValue/components/MarketValueLoading';
import { MarketValueCardMain } from '@/features/market/components/MarketValue/components/MarketValueCardMain';
import { MarketValueModal } from '@/features/market/components/MarketValue/components/MarketValueModal';

/**
 * Zeigt Perplexity Marktwert-Analyse an
 */
export function MarketValueCard({
  result,
  isLoading,
  onRefresh,
}: MarketValueCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Loading State
  if (isLoading) {
    return <MarketValueLoading />;
  }

  // No data
  if (!result) {
    return null;
  }

  return (
    <>
      <MarketValueCardMain
        result={result}
        onPress={() => setShowDetails(true)}
      />

      <MarketValueModal
        visible={showDetails}
        result={result}
        onClose={() => setShowDetails(false)}
        onRefresh={onRefresh}
      />
    </>
  );
}
