/**
 * Market Value Card Container
 * Hauptkomponente für KI-basierte Marktwertanalyse
 */

import React, { useState } from 'react';
import { Linking } from 'react-native';
import { MarketValueCardProps } from '@/features/market/components/MarketValue/types';
import { MarketValueLoading } from '@/features/market/components/MarketValue/components/MarketValueLoading';
import { MarketValueCardMain } from '@/features/market/components/MarketValue/components/MarketValueCardMain';
import { MarketValueModal } from '@/features/market/components/MarketValue/components/MarketValueModal';
import { StatusBanner } from '@/shared/components';

const TOKEN_EXPIRED_BANNER = {
  title: 'Perplexity API-Token abgelaufen',
  message: 'Die KI-Marktwertanalyse ist nicht verfügbar. Bitte erneuere deinen Perplexity API-Token in den Einstellungen.',
  action: {
    label: 'Token erneuern',
    onPress: () => Linking.openURL('https://www.perplexity.ai/settings/api'),
  },
} as const;

/**
 * Zeigt Perplexity Marktwert-Analyse an
 */
export function MarketValueCard({
  result,
  isLoading,
  error,
  onRefresh,
}: MarketValueCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Loading State
  if (isLoading) {
    return <MarketValueLoading />;
  }

  // Token abgelaufen → schöne Warnung statt leerem Bereich
  if (error === 'TOKEN_EXPIRED') {
    return (
      <StatusBanner
        variant="warning"
        title={TOKEN_EXPIRED_BANNER.title}
        message={TOKEN_EXPIRED_BANNER.message}
        action={TOKEN_EXPIRED_BANNER.action}
        className="mb-4"
      />
    );
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
